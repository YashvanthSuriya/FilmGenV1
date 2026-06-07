import{Ac as e,Bc as t,Gc as n,Hc as r,Jc as i,Kc as a,Lc as o,Mc as s,Nc as c,Pc as l,Qc as u,Uc as d,Vc as f,Xc as p,Yc as m,Yf as h,Zc as g,jc as _,kc as v,zc as y}from"./app-shell-DM7GQNzJ.js";var b=h(`WorkspaceV2Migrator`),x=`filmstrips`,S=`waveform-bin`,C=`preview-audio`,w=`proxies`,T=`thumbnail.meta.json`,E=`thumbnail.jpg`;async function D(t){let n=performance.now(),r={ran:!1,fromVersion:null,toVersion:`2.0`,filmstripMediaMoved:0,waveformBinMoved:0,previewAudioMoved:0,proxiesMoved:0,thumbnailMetaRemoved:0,projectThumbnailsFixed:0,errors:[],durationMs:0},a=await i(t,[e]);if(!a||(r.fromVersion=a.schemaVersion,a.schemaVersion===`2.0`))return r.durationMs=performance.now()-n,r;r.ran=!0,b.info(`Migrating workspace ${a.schemaVersion} → 2.0`);let o=await O(t);try{r.filmstripMediaMoved=await k(t,r.errors)}catch(e){r.errors.push(`filmstrips: ${L(e)}`)}try{r.waveformBinMoved=await A(t,r.errors)}catch(e){r.errors.push(`waveform-bin: ${L(e)}`)}try{r.previewAudioMoved=await j(t,r.errors)}catch(e){r.errors.push(`preview-audio: ${L(e)}`)}try{r.proxiesMoved=await M(t,r.errors)}catch(e){r.errors.push(`proxies: ${L(e)}`)}try{r.thumbnailMetaRemoved=await N(t,r.errors)}catch(e){r.errors.push(`thumbnail-meta: ${L(e)}`)}try{r.projectThumbnailsFixed=await P(t,o,r.errors)}catch(e){r.errors.push(`project-thumbnails: ${L(e)}`)}if(r.errors.length===0){let n={...a,schemaVersion:`2.0`};await g(t,[e],n),b.info(`Workspace migrated to v2`,r)}else b.warn(`Workspace migration completed with errors; marker left at v1 for retry`,{errorCount:r.errors.length});return r.durationMs=performance.now()-n,r}async function O(e){let t=await n(e,[s]),r=new Set;for(let e of t)e.kind===`directory`&&r.add(e.name);return r}async function k(e,t){let r=await n(e,[x]),i=0;for(let o of r){if(o.kind!==`directory`)continue;let r=o.name;try{await u(`migrate-v2:filmstrip:${r}`,async()=>{let t=await n(e,[x,r]);for(let n of t){if(n.kind!==`file`)continue;let t=await a(e,[x,r,n.name]);t&&await p(e,[...l(r),n.name],t)}await m(e,[x,r],{recursive:!0})}),i++}catch(e){t.push(`filmstrip ${r}: ${L(e)}`)}}return i>0&&await F(e,x),i}async function A(e,t){let i=await n(e,[S]),o=0;for(let n of i){if(n.kind!==`file`||!n.name.endsWith(`.bin`))continue;let i=n.name.slice(0,-4);try{await u(`migrate-v2:waveform-bin:${i}`,async()=>{let t=await a(e,[S,n.name]);t&&(await p(e,r(i),t),await m(e,[S,n.name]))}),o++}catch(e){t.push(`waveform-bin ${i}: ${L(e)}`)}}return o>0&&await F(e,S),o}async function j(e,t){let r=await n(e,[C]),i=0;for(let o of r){if(o.kind!==`directory`)continue;let r=await n(e,[C,o.name]);for(let s of r){if(s.kind!==`directory`)continue;let r=await n(e,[C,o.name,s.name]);for(let n of r){if(n.kind!==`file`||!n.name.endsWith(`.wav`))continue;let r=n.name.slice(0,-4);try{await u(`migrate-v2:preview-audio:${r}`,async()=>{let t=await a(e,[C,o.name,s.name,n.name]);t&&(await p(e,y(r),t),await m(e,[C,o.name,s.name,n.name]))}),i++}catch(e){t.push(`preview-audio ${r}: ${L(e)}`)}}await I(e,[C,o.name,s.name])}await I(e,[C,o.name])}return i>0&&await F(e,C),i}async function M(e,t){let r=await n(e,[w]),i=0;for(let o of r){if(o.kind!==`directory`)continue;let r=o.name;try{await u(`migrate-v2:proxy:${r}`,async()=>{let t=await n(e,[w,r]);for(let n of t){if(n.kind!==`file`)continue;let t=await a(e,[w,r,n.name]);t&&await p(e,[...f(),r,n.name],t)}await m(e,[w,r],{recursive:!0})}),i++}catch(e){t.push(`proxy ${r}: ${L(e)}`)}}return i>0&&await F(e,w),i}async function N(e,t){let r=await n(e,[_]),i=0;for(let n of r){if(n.kind!==`directory`)continue;let r=n.name,a=[...o(r),T];try{if(!await d(e,a))continue;await m(e,a),i++}catch(e){t.push(`thumbnail.meta ${r}: ${L(e)}`)}}return i}async function P(e,r,i){let s=await n(e,[_]),c=0;for(let l of s){if(l.kind!==`directory`||!r.has(l.name))continue;let s=l.name;try{let r=await n(e,o(s));if(r.some(e=>e.kind===`file`&&e.name===`metadata.json`))continue;let i=await a(e,[...o(s),E]);if(!i||(await p(e,t(s),i),r.some(e=>!(e.kind===`file`&&e.name===E))))continue;await m(e,o(s),{recursive:!0}),c++}catch(e){i.push(`project-thumbnail ${s}: ${L(e)}`)}}return c}async function F(e,t){await I(e,[t])}async function I(e,t){if(!((await n(e,t)).length>0))try{await m(e,t)}catch(e){b.debug(`removeDirIfEmpty skipped`,{segments:t,error:e})}}function L(e){return e instanceof Error?e.message:String(e)}var R=`# FreeCut Workspace

This folder is your FreeCut project workspace - the app's source of truth
for everything: projects, media metadata, thumbnails, waveforms, caches.

Everything here is **plain files** you can \`cat\`, \`grep\`, and diff with
normal tools. AI coding agents can read them directly without a browser.

## Layout

\`\`\`
./
|-- README.md                  <- this file
|-- .freecut-workspace.json    <- marker + schema version
|-- index.json                 <- fast project list
|-- projects/
|   \`-- <projectId>/
|       |-- project.json       <- timeline, settings, keyframes, markers, transitions
|       |-- thumbnail.jpg
|       \`-- media-links.json   <- which media this project uses
|-- media/
|   \`-- <mediaId>/
|       |-- metadata.json      <- codec, duration, resolution, etc.
|       |-- source.<ext>       <- inline source file
|       |-- source.link.json   <- OR a link descriptor to an external file
|       |-- thumbnail.jpg
|       \`-- cache/
|           |-- filmstrip/     <- timeline frame thumbnails (0.jpg, 1.jpg, ...)
|           |-- waveform/      <- audio peaks (binned binary + multi-res.bin)
|           |-- gif-frames/    <- pre-extracted GIF frames
|           |-- decoded-audio/ <- chunked PCM for preview playback
|           |-- preview-audio.wav  <- conformed WAV for non-browser codecs
|           \`-- ai/            <- transcripts, captions, scene cuts, ...
\`-- content/
    |-- <hash[0:2]>/<hash>/    <- content-addressable source dedup (reserved)
    |   |-- refs.json
    |   \`-- data.<ext>
    \`-- proxies/<proxyKey>/    <- shared proxies (keyed by content fingerprint)
        |-- proxy.mp4
        \`-- meta.json
\`\`\`

## Safe to edit?

Everything except media source bytes is safe to inspect. Editing
\`project.json\` externally works; FreeCut picks up changes on next load.

Binary caches (waveforms, decoded audio, filmstrips) are regeneratable -
delete them and the app will rebuild them on demand.

## Moving the workspace

You can move this folder to a new location - the app just needs you to
re-pick it via the "Reconnect" prompt on next launch.
`,z=h(`WorkspaceBootstrap`);async function B(e,t){let n=0;async function r(e){let t=[];for await(let n of e.values())t.push({name:n.name,kind:n.kind});for(let i of t){if(i.kind===`directory`){try{await r(await e.getDirectoryHandle(i.name,{create:!1}))}catch(e){z.debug(`sweepStrandedTmpFiles: subdir skipped`,{name:i.name,error:e})}continue}if(i.name.endsWith(`.tmp`))try{await e.removeEntry(i.name),n++}catch(e){z.debug(`sweepStrandedTmpFiles: remove failed`,{name:i.name,error:e})}}}for(let n of t)try{await r(await e.getDirectoryHandle(n,{create:!1}))}catch{}return n}var V=/^[hof]-/;async function H(e){let t=await n(e,f()),r=0;for(let i of t){if(i.kind!==`directory`||!V.test(i.name))continue;let t=i.name,o=t.slice(2),s=[...f(),t],c=[...f(),o];try{if(await d(e,c)){await m(e,s,{recursive:!0}),r++;continue}let i=await n(e,s),o=[],l=!0;for(let t of i){if(t.kind!==`file`)continue;let n=await a(e,[...s,t.name]).catch(()=>null);if(!n){l=!1;break}o.push({name:t.name,blob:n})}if(!l){z.warn(`stripProxyKeyPrefixes: aborting ${t} — unreadable file, leaving source intact`);continue}let u=!0,f=[];for(let n of o)try{await p(e,[...c,n.name],n.blob),f.push(n.name)}catch(e){z.warn(`stripProxyKeyPrefixes: write failed for ${t}/${n.name}`,e),u=!1;break}if(!u){for(let t of f)await m(e,[...c,t],{recursive:!1}).catch(()=>void 0);continue}await m(e,s,{recursive:!0}),r++}catch(e){z.warn(`stripProxyKeyPrefixes: failed to rename ${t}`,e)}}return r}async function U(t){if(!await d(t,[`README.md`]))try{await p(t,[c],R)}catch(e){z.warn(`Failed to write README.md`,e)}if(await d(t,[`.freecut-workspace.json`]))try{let e=await D(t);e.ran&&z.info(`Workspace migration finished`,{from:e.fromVersion,to:e.toVersion,filmstrips:e.filmstripMediaMoved,waveforms:e.waveformBinMoved,previewAudio:e.previewAudioMoved,proxies:e.proxiesMoved,thumbnailMetaRemoved:e.thumbnailMetaRemoved,projectThumbnailsFixed:e.projectThumbnailsFixed,errors:e.errors.length,durationMs:Math.round(e.durationMs)})}catch(e){z.warn(`Workspace migration failed`,e)}else{let n={schemaVersion:`2.0`,createdAt:Date.now()};try{await g(t,[e],n)}catch(e){z.warn(`Failed to write workspace marker`,e)}}try{let e=await H(t);e>0&&z.info(`Stripped source-type prefix from ${e} proxy folder(s)`)}catch(e){z.warn(`stripProxyKeyPrefixes failed`,e)}try{let e=await B(t,[s,_,v]);e>0&&z.info(`Swept ${e} stranded .tmp file(s) from prior crash`)}catch(e){z.warn(`sweepStrandedTmpFiles failed`,e)}}export{U as bootstrapWorkspace};
//# sourceMappingURL=bootstrap-Bptbl0P6.js.map