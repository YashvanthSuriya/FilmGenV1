import{Yf as e,vr as t}from"./app-shell-DM7GQNzJ.js";import{$t as n,Yt as r}from"./feature-editing-core-Dz2nj_jC.js";import{i,n as a,r as o}from"./media-analysis-dHZSsp1G.js";var s=`

// ─── Grayscale conversion (BT.601) ───

@group(0) @binding(0) var inputTex: texture_2d<f32>;
@group(0) @binding(1) var outputTex: texture_storage_2d<r32float, write>;

@compute @workgroup_size(8, 8)
fn grayscaleMain(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(inputTex);
  if (gid.x >= dims.x || gid.y >= dims.y) { return; }
  let color = textureLoad(inputTex, vec2i(gid.xy), 0);
  let lum = dot(color.rgb, vec3f(0.299, 0.587, 0.114));
  textureStore(outputTex, vec2i(gid.xy), vec4f(lum, 0.0, 0.0, 0.0));
}

// ─── Gaussian pyramid 2× downsample ───

@group(0) @binding(0) var pyramidInput: texture_2d<f32>;
@group(0) @binding(1) var pyramidOutput: texture_storage_2d<r32float, write>;

const GAUSS_KERNEL = array<f32, 16>(
  0.0625, 0.125, 0.125, 0.0625,
  0.125,  0.25,  0.25,  0.125,
  0.125,  0.25,  0.25,  0.125,
  0.0625, 0.125, 0.125, 0.0625
);

@compute @workgroup_size(8, 8)
fn pyramidDownsampleMain(@builtin(global_invocation_id) gid: vec3u) {
  let outDims = textureDimensions(pyramidOutput);
  if (gid.x >= outDims.x || gid.y >= outDims.y) { return; }
  let inDims = textureDimensions(pyramidInput);
  let baseX = i32(gid.x) * 2;
  let baseY = i32(gid.y) * 2;
  var sum = 0.0;
  for (var dy = 0; dy < 4; dy++) {
    for (var dx = 0; dx < 4; dx++) {
      let sx = clamp(baseX + dx - 1, 0, i32(inDims.x) - 1);
      let sy = clamp(baseY + dy - 1, 0, i32(inDims.y) - 1);
      sum += textureLoad(pyramidInput, vec2i(sx, sy), 0).r * GAUSS_KERNEL[dy * 4 + dx];
    }
  }
  textureStore(pyramidOutput, vec2i(gid.xy), vec4f(sum, 0.0, 0.0, 0.0));
}

// ─── Spatial gradients (Scharr operator) ───

@group(0) @binding(0) var gradInput: texture_2d<f32>;
@group(0) @binding(1) var gradIx: texture_storage_2d<r32float, write>;
@group(0) @binding(2) var gradIy: texture_storage_2d<r32float, write>;

@compute @workgroup_size(8, 8)
fn spatialGradientsMain(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(gradInput);
  if (gid.x >= dims.x || gid.y >= dims.y) { return; }
  let x = i32(gid.x);
  let y = i32(gid.y);
  let w = i32(dims.x) - 1;
  let h = i32(dims.y) - 1;

  // Scharr kernels (more accurate than Sobel)
  let tl = textureLoad(gradInput, vec2i(clamp(x-1,0,w), clamp(y-1,0,h)), 0).r;
  let tc = textureLoad(gradInput, vec2i(x,                clamp(y-1,0,h)), 0).r;
  let tr = textureLoad(gradInput, vec2i(clamp(x+1,0,w), clamp(y-1,0,h)), 0).r;
  let ml = textureLoad(gradInput, vec2i(clamp(x-1,0,w), y),               0).r;
  let mr = textureLoad(gradInput, vec2i(clamp(x+1,0,w), y),               0).r;
  let bl = textureLoad(gradInput, vec2i(clamp(x-1,0,w), clamp(y+1,0,h)), 0).r;
  let bc = textureLoad(gradInput, vec2i(x,                clamp(y+1,0,h)), 0).r;
  let br = textureLoad(gradInput, vec2i(clamp(x+1,0,w), clamp(y+1,0,h)), 0).r;

  // Scharr X: [-3, 0, 3; -10, 0, 10; -3, 0, 3] / 32
  let ix = (-3.0*tl + 3.0*tr - 10.0*ml + 10.0*mr - 3.0*bl + 3.0*br) / 32.0;
  // Scharr Y: [-3, -10, -3; 0, 0, 0; 3, 10, 3] / 32
  let iy = (-3.0*tl - 10.0*tc - 3.0*tr + 3.0*bl + 10.0*bc + 3.0*br) / 32.0;

  textureStore(gradIx, vec2i(gid.xy), vec4f(ix, 0.0, 0.0, 0.0));
  textureStore(gradIy, vec2i(gid.xy), vec4f(iy, 0.0, 0.0, 0.0));
}

// ─── Temporal gradient (frame difference) ───

@group(0) @binding(0) var temporalCurrent: texture_2d<f32>;
@group(0) @binding(1) var temporalPrevious: texture_2d<f32>;
@group(0) @binding(2) var temporalIt: texture_storage_2d<r32float, write>;

@compute @workgroup_size(8, 8)
fn temporalGradientMain(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(temporalCurrent);
  if (gid.x >= dims.x || gid.y >= dims.y) { return; }
  let curr = textureLoad(temporalCurrent, vec2i(gid.xy), 0).r;
  let prev = textureLoad(temporalPrevious, vec2i(gid.xy), 0).r;
  textureStore(temporalIt, vec2i(gid.xy), vec4f(curr - prev, 0.0, 0.0, 0.0));
}

// ─── Lucas-Kanade optical flow ───

@group(0) @binding(0) var lkIx: texture_2d<f32>;
@group(0) @binding(1) var lkIy: texture_2d<f32>;
@group(0) @binding(2) var lkIt: texture_2d<f32>;
@group(0) @binding(3) var lkFlow: texture_storage_2d<rg32float, write>;
@group(0) @binding(4) var lkPrevFlow: texture_2d<f32>;

struct LKParams {
  windowRadius: u32,
  minEigenvalue: f32,
  pyramidScale: f32,
  _pad: u32,
};
@group(0) @binding(5) var<uniform> lkParams: LKParams;

@compute @workgroup_size(8, 8)
fn lucasKanadeMain(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(lkIx);
  if (gid.x >= dims.x || gid.y >= dims.y) { return; }
  let pos = vec2i(gid.xy);
  let radius = i32(lkParams.windowRadius);

  // Initialize from coarser level flow (if available)
  var initFlow = vec2f(0.0);
  let prevDims = textureDimensions(lkPrevFlow);
  if (prevDims.x > 1u) {
    let prevCoord = clamp(vec2i(gid.xy / 2u), vec2i(0), vec2i(prevDims) - 1);
    initFlow = textureLoad(lkPrevFlow, prevCoord, 0).rg * lkParams.pyramidScale;
  }

  // Accumulate structure tensor over window
  var sumIxIx = 0.0;
  var sumIyIy = 0.0;
  var sumIxIy = 0.0;
  var sumIxIt = 0.0;
  var sumIyIt = 0.0;

  for (var dy = -radius; dy <= radius; dy++) {
    for (var dx = -radius; dx <= radius; dx++) {
      let sp = vec2i(
        clamp(pos.x + dx, 0, i32(dims.x) - 1),
        clamp(pos.y + dy, 0, i32(dims.y) - 1)
      );
      let ix = textureLoad(lkIx, sp, 0).r;
      let iy = textureLoad(lkIy, sp, 0).r;
      let it = textureLoad(lkIt, sp, 0).r;
      sumIxIx += ix * ix;
      sumIyIy += iy * iy;
      sumIxIy += ix * iy;
      sumIxIt += ix * it;
      sumIyIt += iy * it;
    }
  }

  // Solve via Cramer's rule with eigenvalue check
  let det = sumIxIx * sumIyIy - sumIxIy * sumIxIy;
  let trace = sumIxIx + sumIyIy;
  let eigenMin = (trace - sqrt(max(trace * trace - 4.0 * det, 0.0))) * 0.5;

  var flow = initFlow;
  if (eigenMin > lkParams.minEigenvalue && abs(det) > 0.0001) {
    let vx = -(sumIyIy * sumIxIt - sumIxIy * sumIyIt) / det;
    let vy = -(sumIxIx * sumIyIt - sumIxIy * sumIxIt) / det;
    flow = initFlow + vec2f(vx, vy);
  }

  textureStore(lkFlow, pos, vec4f(flow, 0.0, 0.0));
}

// ─── Flow statistics (atomic reduction) ───
// Matches masterselects FlowStats layout exactly.
// 7 scalars + 8 histogram bins = 15 × 4 = 60 bytes, padded to 64.

struct FlowStats {
  sumMagnitude: atomic<u32>,
  sumMagnitudeSq: atomic<u32>,
  sumVx: atomic<i32>,
  sumVy: atomic<i32>,
  pixelCount: atomic<u32>,
  significantPixels: atomic<u32>,
  maxMagnitude: atomic<u32>,
  dirBin0: atomic<u32>,
  dirBin1: atomic<u32>,
  dirBin2: atomic<u32>,
  dirBin3: atomic<u32>,
  dirBin4: atomic<u32>,
  dirBin5: atomic<u32>,
  dirBin6: atomic<u32>,
  dirBin7: atomic<u32>,
};

@group(0) @binding(0) var statsFlow: texture_2d<f32>;
@group(0) @binding(1) var<storage, read_write> stats: FlowStats;

struct StatsParams {
  magnitudeThreshold: f32,
  _pad1: f32,
  _pad2: f32,
  _pad3: f32,
};
@group(0) @binding(2) var<uniform> statsParams: StatsParams;

fn atomicAddDir(bin: u32, val: u32, s: ptr<storage, FlowStats, read_write>) {
  switch (bin) {
    case 0u: { atomicAdd(&(*s).dirBin0, val); }
    case 1u: { atomicAdd(&(*s).dirBin1, val); }
    case 2u: { atomicAdd(&(*s).dirBin2, val); }
    case 3u: { atomicAdd(&(*s).dirBin3, val); }
    case 4u: { atomicAdd(&(*s).dirBin4, val); }
    case 5u: { atomicAdd(&(*s).dirBin5, val); }
    case 6u: { atomicAdd(&(*s).dirBin6, val); }
    case 7u: { atomicAdd(&(*s).dirBin7, val); }
    default: {}
  }
}

@compute @workgroup_size(8, 8)
fn flowStatisticsMain(@builtin(global_invocation_id) id: vec3u) {
  let dims = textureDimensions(statsFlow);
  if (id.x >= dims.x || id.y >= dims.y) { return; }

  let flow = textureLoad(statsFlow, vec2i(id.xy), 0).rg;
  let magnitude = length(flow);

  let magFixed = u32(clamp(magnitude * 1000.0, 0.0, 1000000.0));
  let magSqFixed = u32(clamp(magnitude * magnitude * 1000.0, 0.0, 1000000.0));
  let vxFixed = i32(clamp(flow.x * 1000.0, -1000000.0, 1000000.0));
  let vyFixed = i32(clamp(flow.y * 1000.0, -1000000.0, 1000000.0));

  atomicAdd(&stats.sumMagnitude, magFixed);
  atomicAdd(&stats.sumMagnitudeSq, magSqFixed);
  atomicAdd(&stats.sumVx, vxFixed);
  atomicAdd(&stats.sumVy, vyFixed);
  atomicAdd(&stats.pixelCount, 1u);
  atomicMax(&stats.maxMagnitude, magFixed);

  if (magnitude > statsParams.magnitudeThreshold) {
    atomicAdd(&stats.significantPixels, 1u);

    let angle = atan2(flow.y, flow.x);
    let normalizedAngle = (angle + 3.14159265) / 6.28318530;
    let bin = min(u32(normalizedAngle * 8.0), 7u);
    atomicAddDir(bin, 1u, &stats);
  }
}

// ─── Clear stats buffer ───

@group(0) @binding(0) var<storage, read_write> clearStats: FlowStats;

@compute @workgroup_size(1)
fn clearStatsMain() {
  atomicStore(&clearStats.sumMagnitude, 0u);
  atomicStore(&clearStats.sumMagnitudeSq, 0u);
  atomicStore(&clearStats.sumVx, 0i);
  atomicStore(&clearStats.sumVy, 0i);
  atomicStore(&clearStats.pixelCount, 0u);
  atomicStore(&clearStats.significantPixels, 0u);
  atomicStore(&clearStats.maxMagnitude, 0u);
  atomicStore(&clearStats.dirBin0, 0u);
  atomicStore(&clearStats.dirBin1, 0u);
  atomicStore(&clearStats.dirBin2, 0u);
  atomicStore(&clearStats.dirBin3, 0u);
  atomicStore(&clearStats.dirBin4, 0u);
  atomicStore(&clearStats.dirBin5, 0u);
  atomicStore(&clearStats.dirBin6, 0u);
  atomicStore(&clearStats.dirBin7, 0u);
}
`,c=e(`OpticalFlow`),l=2,u=.001,d=8,f=.7,p=.5,m=.6,h=64,g=class{device;grayscalePipeline;pyramidPipeline;spatialGradPipeline;temporalGradPipeline;lucasKanadePipeline;flowStatsPipeline;clearStatsPipeline;grayscaleLayout;pyramidLayout;spatialGradLayout;temporalGradLayout;lucasKanadeLayout;flowStatsLayout;clearStatsLayout;inputTexture;grayscaleTextures=null;pyramidTextures=null;gradIxTextures=[];gradIyTextures=[];gradItTextures=[];flowTextures=[];dummyFlowTexture;levelDims=[];statsBuffer;stagingBuffer;lkParamsBuffer;statsParamsBuffer;frameIndex=0;initialized=!1;constructor(e){this.device=e}init(){this.initialized||=(this.createPipelines(),this.createTextures(),this.createBuffers(),!0)}async checkShaderCompilation(){let e=(await this.device.createShaderModule({label:`optical-flow-check`,code:s}).getCompilationInfo()).messages.filter(e=>e.type===`error`);if(e.length>0){for(let t of e)c.error(`Shader error: ${t.message} (line ${t.lineNum}:${t.linePos})`);return!1}return!0}createPipelines(){let e=this.device.createShaderModule({label:`optical-flow`,code:s}),t={sampleType:`unfilterable-float`};this.grayscaleLayout=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,texture:{}},{binding:1,visibility:GPUShaderStage.COMPUTE,storageTexture:{access:`write-only`,format:`r32float`}}]}),this.grayscalePipeline=this.device.createComputePipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[this.grayscaleLayout]}),compute:{module:e,entryPoint:`grayscaleMain`}}),this.pyramidLayout=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,texture:t},{binding:1,visibility:GPUShaderStage.COMPUTE,storageTexture:{access:`write-only`,format:`r32float`}}]}),this.pyramidPipeline=this.device.createComputePipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[this.pyramidLayout]}),compute:{module:e,entryPoint:`pyramidDownsampleMain`}}),this.spatialGradLayout=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,texture:t},{binding:1,visibility:GPUShaderStage.COMPUTE,storageTexture:{access:`write-only`,format:`r32float`}},{binding:2,visibility:GPUShaderStage.COMPUTE,storageTexture:{access:`write-only`,format:`r32float`}}]}),this.spatialGradPipeline=this.device.createComputePipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[this.spatialGradLayout]}),compute:{module:e,entryPoint:`spatialGradientsMain`}}),this.temporalGradLayout=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,texture:t},{binding:1,visibility:GPUShaderStage.COMPUTE,texture:t},{binding:2,visibility:GPUShaderStage.COMPUTE,storageTexture:{access:`write-only`,format:`r32float`}}]}),this.temporalGradPipeline=this.device.createComputePipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[this.temporalGradLayout]}),compute:{module:e,entryPoint:`temporalGradientMain`}}),this.lucasKanadeLayout=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,texture:t},{binding:1,visibility:GPUShaderStage.COMPUTE,texture:t},{binding:2,visibility:GPUShaderStage.COMPUTE,texture:t},{binding:3,visibility:GPUShaderStage.COMPUTE,storageTexture:{access:`write-only`,format:`rg32float`}},{binding:4,visibility:GPUShaderStage.COMPUTE,texture:{sampleType:`unfilterable-float`}},{binding:5,visibility:GPUShaderStage.COMPUTE,buffer:{type:`uniform`}}]}),this.lucasKanadePipeline=this.device.createComputePipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[this.lucasKanadeLayout]}),compute:{module:e,entryPoint:`lucasKanadeMain`}}),this.flowStatsLayout=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,texture:{sampleType:`unfilterable-float`}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:`uniform`}}]}),this.flowStatsPipeline=this.device.createComputePipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[this.flowStatsLayout]}),compute:{module:e,entryPoint:`flowStatisticsMain`}}),this.clearStatsLayout=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}}]}),this.clearStatsPipeline=this.device.createComputePipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[this.clearStatsLayout]}),compute:{module:e,entryPoint:`clearStatsMain`}})}createStorageTexture(e,t,n){return this.device.createTexture({size:{width:e,height:t},format:n,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.COPY_SRC|GPUTextureUsage.COPY_DST})}createTextures(){this.inputTexture=this.device.createTexture({size:{width:160,height:90},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT}),this.grayscaleTextures=[this.createStorageTexture(160,90,`r32float`),this.createStorageTexture(160,90,`r32float`)],this.levelDims=[];let e=160,t=90;for(let n=0;n<3;n++)this.levelDims.push({w:e,h:t}),e=Math.max(1,Math.floor(e/2)),t=Math.max(1,Math.floor(t/2));let n=[],r=[];for(let e=0;e<3;e++){let t=this.levelDims[e];n.push(this.createStorageTexture(t.w,t.h,`r32float`)),r.push(this.createStorageTexture(t.w,t.h,`r32float`))}this.pyramidTextures=[n,r],this.gradIxTextures=[],this.gradIyTextures=[],this.gradItTextures=[],this.flowTextures=[];for(let e=0;e<3;e++){let t=this.levelDims[e];this.gradIxTextures.push(this.createStorageTexture(t.w,t.h,`r32float`)),this.gradIyTextures.push(this.createStorageTexture(t.w,t.h,`r32float`)),this.gradItTextures.push(this.createStorageTexture(t.w,t.h,`r32float`)),this.flowTextures.push(this.createStorageTexture(t.w,t.h,`rg32float`))}this.dummyFlowTexture=this.device.createTexture({size:{width:1,height:1},format:`rg32float`,usage:GPUTextureUsage.TEXTURE_BINDING})}createBuffers(){this.statsBuffer=this.device.createBuffer({size:h,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),this.stagingBuffer=this.device.createBuffer({size:h,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.lkParamsBuffer=this.device.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.statsParamsBuffer=this.device.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});let e=new Float32Array([p,0,0,0]);this.device.queue.writeBuffer(this.statsParamsBuffer,0,e)}dispatch(e,t,n,r,i){let a=e.beginComputePass();a.setPipeline(t),a.setBindGroup(0,n),a.dispatchWorkgroups(Math.ceil(r/8),Math.ceil(i/8)),a.end()}async analyzeFrame(e){this.init();let t=this.frameIndex%2,n=(this.frameIndex+1)%2;this.device.queue.copyExternalImageToTexture({source:e,flipY:!1},{texture:this.inputTexture},{width:160,height:90});let r=this.device.createCommandEncoder(),i=this.device.createBindGroup({layout:this.grayscaleLayout,entries:[{binding:0,resource:this.inputTexture.createView()},{binding:1,resource:this.grayscaleTextures[t].createView()}]});this.dispatch(r,this.grayscalePipeline,i,160,90);let a=this.pyramidTextures[t];r.copyTextureToTexture({texture:this.grayscaleTextures[t]},{texture:a[0]},{width:160,height:90});for(let e=1;e<3;e++){let t=a[e-1],n=a[e],i=this.levelDims[e],o=this.device.createBindGroup({layout:this.pyramidLayout,entries:[{binding:0,resource:t.createView()},{binding:1,resource:n.createView()}]});this.dispatch(r,this.pyramidPipeline,o,i.w,i.h)}if(this.frameIndex===0)return this.device.queue.submit([r.finish()]),this.frameIndex++,{totalMotion:0,globalMotion:0,localMotion:0,isSceneCut:!1,dominantDirection:0,directionCoherence:0};let o=this.device.createBindGroup({layout:this.clearStatsLayout,entries:[{binding:0,resource:{buffer:this.statsBuffer}}]}),s=r.beginComputePass();s.setPipeline(this.clearStatsPipeline),s.setBindGroup(0,o),s.dispatchWorkgroups(1),s.end();let c=this.pyramidTextures[n];for(let e=2;e>=0;e--){let t=this.levelDims[e],n=this.device.createBindGroup({layout:this.spatialGradLayout,entries:[{binding:0,resource:a[e].createView()},{binding:1,resource:this.gradIxTextures[e].createView()},{binding:2,resource:this.gradIyTextures[e].createView()}]});this.dispatch(r,this.spatialGradPipeline,n,t.w,t.h);let i=this.device.createBindGroup({layout:this.temporalGradLayout,entries:[{binding:0,resource:a[e].createView()},{binding:1,resource:c[e].createView()},{binding:2,resource:this.gradItTextures[e].createView()}]});this.dispatch(r,this.temporalGradPipeline,i,t.w,t.h);let o=e<2?2:0,s=e<2?this.flowTextures[e+1]:this.dummyFlowTexture,d=new ArrayBuffer(16),f=new DataView(d);f.setUint32(0,l,!0),f.setFloat32(4,u,!0),f.setFloat32(8,o,!0),f.setUint32(12,0,!0),this.device.queue.writeBuffer(this.lkParamsBuffer,0,d);let p=this.device.createBindGroup({layout:this.lucasKanadeLayout,entries:[{binding:0,resource:this.gradIxTextures[e].createView()},{binding:1,resource:this.gradIyTextures[e].createView()},{binding:2,resource:this.gradItTextures[e].createView()},{binding:3,resource:this.flowTextures[e].createView()},{binding:4,resource:s.createView()},{binding:5,resource:{buffer:this.lkParamsBuffer}}]});this.dispatch(r,this.lucasKanadePipeline,p,t.w,t.h)}let d=this.device.createBindGroup({layout:this.flowStatsLayout,entries:[{binding:0,resource:this.flowTextures[0].createView()},{binding:1,resource:{buffer:this.statsBuffer}},{binding:2,resource:{buffer:this.statsParamsBuffer}}]});this.dispatch(r,this.flowStatsPipeline,d,160,90),r.copyBufferToBuffer(this.statsBuffer,0,this.stagingBuffer,0,h),this.device.queue.submit([r.finish()]),await this.stagingBuffer.mapAsync(GPUMapMode.READ);let f=new Uint32Array(this.stagingBuffer.getMappedRange().slice(0));this.stagingBuffer.unmap();let p=this.classifyMotion(f);return this.frameIndex++,p}classifyMotion(e){let t=(e[0]??0)/1e3,n=new Int32Array([e[2]??0])[0]/1e3,r=new Int32Array([e[3]??0])[0]/1e3,i=e[4]??0,a=e[5]??0,o=(e[6]??0)/1e3;if(i===0)return{totalMotion:0,globalMotion:0,localMotion:0,isSceneCut:!1,dominantDirection:0,directionCoherence:0};let s=t/i,l=n/i,u=r/i,p=Math.sqrt(l*l+u*u),h=s>.01?Math.min(1,p/s):0,g=a/14400,_=s>d&&g>f,v=Math.min(1,s/10),y,b;if(_)y=v,b=0;else if(h>m)y=v*h,b=v*(1-h);else{let t=(e[1]??0)/1e3/i-s*s,n=Math.min(1,Math.sqrt(Math.max(0,t))/5);y=v*h,b=Math.max(v*(1-h),n)}let x=[];for(let t=0;t<8;t++)x.push(e[7+t]??0);let S=Math.max(...x),C=(x.indexOf(S)*45+22.5)%360;return c.debug(`mean=${s.toFixed(2)} cov=${g.toFixed(2)} coh=${h.toFixed(2)} max=${o.toFixed(2)} cut=${_}`),{totalMotion:v,globalMotion:Math.min(1,y),localMotion:Math.min(1,b),isSceneCut:_,dominantDirection:C,directionCoherence:h}}async analyzeSequence(e,t){let n=[];for(let r=0;r<e.length;r++){let i=await this.analyzeFrame(e[r]);n.push(i),t?.(r,i)}return n}destroy(){if(this.initialized){this.inputTexture.destroy();for(let e of this.grayscaleTextures)e.destroy();for(let e of this.pyramidTextures)for(let t of e)t.destroy();for(let e of this.gradIxTextures)e.destroy();for(let e of this.gradIyTextures)e.destroy();for(let e of this.gradItTextures)e.destroy();for(let e of this.flowTextures)e.destroy();this.dummyFlowTexture.destroy(),this.statsBuffer.destroy(),this.stagingBuffer.destroy(),this.lkParamsBuffer.destroy(),this.statsParamsBuffer.destroy(),this.initialized=!1}}},_=e(`HistogramSceneDetection`),v=32,y=v*3,b=160,x=90,S=.3,C=2;function w(e){let t=new Float32Array(y),n=v/256,r=e.length/4;for(let r=0;r<e.length;r+=4){let i=Math.min(e[r]*n|0,v-1),a=Math.min(e[r+1]*n|0,v-1),o=Math.min(e[r+2]*n|0,v-1);t[i]++,t[v+a]++,t[v*2+o]++}for(let e=0;e<3;e++){let n=e*v;for(let e=0;e<v;e++)t[n+e]/=r}return t}function T(e,t){let n=0;for(let r=0;r<e.length;r++){let i=e[r]+t[r];if(i>0){let a=e[r]-t[r];n+=a*a/i}}return n}async function E(e,t,n={}){let{sampleIntervalMs:r=250,threshold:i=S,onProgress:s,signal:c}=n,l=e.duration,u=r/1e3,d=Math.ceil(l/u),f=new OffscreenCanvas(b,x).getContext(`2d`,{willReadFrequently:!0}),p=[],m=null,h=0;for(let n=0;n<d&&!c?.aborted;n++){let r=n*u;await o(e,r),f.drawImage(e,0,0,b,x);let a=w(f.getImageData(0,0,b,x).data);if(m){let e=T(m,a);if(e>h&&(h=e),e>=i){let n=Math.round(r*t),i={totalMotion:e,globalMotion:e,localMotion:0,isSceneCut:!0,dominantDirection:0,directionCoherence:0};p.push({frame:n,time:r,motion:i})}}m=a,s?.({percent:(n+1)/d*100,currentSample:n,totalSamples:d,sceneCuts:p.length,stage:`optical-flow`})}_.info(`Histogram analysis complete`,{totalSamples:d,maxDistance:h.toFixed(4),rawCuts:p.length,threshold:i});let g=a(p,C);return _.info(`Deduplication complete`,{cuts:g.length}),g}function D(e){return new Worker(`/freecut-editor/assets/gemma-scene-worker-mKrWIuYD.js`,{type:`module`,name:e?.name})}function O(){return new D}function k({id:e,label:t,createWorker:n}){let r=null;return{id:e,label:t,getWorker(){return r||=n(),r},resetWorker:()=>{r&&=(r.terminate(),null)},disposeWorker(){if(!r)return;r.postMessage({type:`dispose`});let e=r;r=null,setTimeout(()=>e.terminate(),500)}}}var A=new t([k({id:`gemma`,label:n.gemma,createWorker:O}),k({id:`lfm`,label:n.lfm,createWorker:i})],r);function j(e){return A.get(e)}var M=e(`SceneDetection`),N=new Map;function P(e){if(e)for(let t of N.keys())t.startsWith(`${e}:`)&&N.delete(t);else N.clear()}var F=500,I=2,L=480,R=1;async function z(e,t,n={}){let{method:r=`histogram`,onProgress:i,signal:a,mediaId:o}=n,s=n.sampleIntervalMs??(r===`histogram`?250:F),c=n.verificationModel??(r===`optical-flow`?`gemma`:void 0);if(o){let e=`${o}:${r}:${s}:${c??`none`}`,t=N.get(e);if(t)return M.info(`Returning cached scene detection results`,{mediaId:o,cuts:t.length}),t}let l;l=r===`histogram`?await E(e,t,{sampleIntervalMs:s,onProgress:i,signal:a}):await B(e,t,s,i,a);let u=o?`${o}:${r}:${s}:${c??`none`}`:null,d=e=>(u&&N.set(u,e),e);if(a?.aborted)return l;if(!c||l.length===0)return d(l);let f=j(c);try{let t=await H(f,e,l,c,i,a);return M.info(`VLM verification complete`,{model:c,confirmed:t.length,candidates:l.length}),f.disposeWorker(),d(t)}catch(e){return f.resetWorker(),a?.aborted?(M.info(`VLM verification aborted`,{model:c}),l):(M.warn(`VLM verification failed, using optical flow results`,{model:c,error:e.message}),d(l))}}async function B(e,t,n,r,i){if(!navigator.gpu)throw Error(`WebGPU not supported - optical-flow scene detection requires GPU`);let s=await navigator.gpu.requestAdapter();if(!s)throw Error(`No GPU adapter available`);let c=await s.requestDevice(),l=new g(c);if(!await l.checkShaderCompilation())throw l.destroy(),c.destroy(),Error(`Optical flow shader compilation failed - check console for details`);let u=[],d=e.duration,f=n/1e3,p=Math.ceil(d/f),m=new OffscreenCanvas(160,90),h=m.getContext(`2d`);try{let n=0;for(let a=0;a<p&&!i?.aborted;a++){let i=a*f;await o(e,i),h.drawImage(e,0,0,160,90);let s=await createImageBitmap(m),c=await l.analyzeFrame(s);if(s.close(),c.totalMotion>n&&(n=c.totalMotion),c.isSceneCut){let e=Math.round(i*t);u.push({frame:e,time:i,motion:c})}r?.({percent:a/p*100,currentSample:a,totalSamples:p,sceneCuts:u.length,stage:`optical-flow`})}M.info(`Optical flow pass complete`,{totalSamples:p,maxMotion:n.toFixed(4),rawCuts:u.length})}finally{l.destroy(),c.destroy()}let _=a(u,I);return M.info(`Deduplication complete`,{cuts:_.length,minGapSec:I}),_}async function V(e,t){await o(e,t);let n=e.videoWidth||640,r=e.videoHeight||360,i=Math.min(L/Math.max(n,r),1),a=Math.round(n*i),s=Math.round(r*i),c=new OffscreenCanvas(a,s);return c.getContext(`2d`).drawImage(e,0,0,a,s),c.convertToBlob({type:`image/jpeg`,quality:.8})}async function H(e,t,n,r,i,a){let o=e.getWorker(),s=e.label;if(await new Promise((e,t)=>{let a=3e4,c=setTimeout(l,a);function l(){o.removeEventListener(`message`,u),t(Error(`${s} worker init timed out after 30s of inactivity`))}let u=s=>{let d=s.data;d.type===`ready`?(clearTimeout(c),o.removeEventListener(`message`,u),e()):d.type===`error`?(clearTimeout(c),o.removeEventListener(`message`,u),t(Error(d.message))):d.type===`progress`&&(clearTimeout(c),c=setTimeout(l,a),i?.({percent:d.percent,currentSample:0,totalSamples:n.length,sceneCuts:0,stage:`loading-model`,verificationModel:r}))};o.addEventListener(`message`,u),o.postMessage({type:`init`})}),a?.aborted)return n;let c=[];for(let e=0;e<n.length&&!a?.aborted;e++){let a=n[e],l=Math.max(0,a.time-R);i?.({percent:e/n.length*100,currentSample:e,totalSamples:n.length,sceneCuts:c.length,stage:`verifying`,verificationModel:r});let u=await V(t,l),d=await V(t,a.time),f=await new Promise(t=>{let n=r=>{r.data.type===`debug`?M.info(`${s} worker debug`,r.data):r.data.type===`result`&&r.data.id===e?(o.removeEventListener(`message`,n),t({isSceneCut:r.data.isSceneCut,reason:r.data.reason})):r.data.type===`error`&&(o.removeEventListener(`message`,n),t({isSceneCut:!1,reason:`worker error: ${r.data.message}`}))};o.addEventListener(`message`,n),o.postMessage({type:`verify`,id:e,before:u,after:d})});M.info(`${s} candidate result`,{index:e,time:a.time.toFixed(1),reason:f.reason}),f.isSceneCut&&c.push({...a,verified:!0})}return c}export{P as clearSceneCache,z as detectScenes};
//# sourceMappingURL=scene-detection-iwd9QETr.js.map