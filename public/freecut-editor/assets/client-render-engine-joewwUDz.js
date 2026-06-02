import{n as e}from"./chunk-62oNxeRG.js";import{m as t}from"./fs-primitives-De5TF-Mv.js";import{$t as n,At as r,Bt as i,E as a,J as o,Jt as s,Kt as c,Qt as l,V as u,Wt as d,Xt as f,Yt as p,Zt as m,_t as h,an as g,ct as _,dt as v,fn as y,gt as b,hn as x,ht as S,in as C,lt as w,mn as T,mt as E,q as ee,qt as D,un as O,ut as te,vt as ne}from"./media-library-store-D1HtXCQK.js";import{r as re,t as k}from"./keyframe-index-registry-BMXD3lem.js";import{t as A}from"./gif-frame-cache-CRSfM31B.js";import"./media-library-Dr9iIxbE.js";import{i as j,n as M,r as N}from"./preview-contract-CIWhk3Qm.js";const P=t(`VideoSourcePool`);function ie(e){let t=Error(`VIDEO_POOL_ABORT:${e}`);return t.name=`AbortError`,t}var F=class e{sourceUrl;primary=null;overflow=[];assignments=new Map;metadata=null;loadPromise=null;_pendingPrimary=null;onElementReady;onElementError;static MAX_OVERFLOW_ELEMENTS=3;static LOAD_TIMEOUT_MS=15e3;_loadTimeoutId=null;constructor(e,t){this.sourceUrl=e,this.onElementReady=t?.onElementReady,this.onElementError=t?.onElementError}async ensureLoaded(){if(this.primary)return this.primary;if(this.loadPromise)return await this.loadPromise,this.primary;let t=this.createElementSync();return this._pendingPrimary=t,this.loadPromise=new Promise((n,r)=>{let i=()=>{o(),n()},a=()=>{let e=t.getAttribute(`src`)??``,n=t.error?.message||`Unknown error`;if(!e&&/empty\s+src\s+attribute/i.test(n)){o(),r(ie(`source-cleared-during-load`));return}o(),r(Error(`Failed to load video: ${n}`))},o=()=>{this._loadTimeoutId!==null&&(clearTimeout(this._loadTimeoutId),this._loadTimeoutId=null),t.removeEventListener(`canplay`,i),t.removeEventListener(`error`,a)};t.addEventListener(`canplay`,i),t.addEventListener(`error`,a),this._loadTimeoutId=setTimeout(()=>{if(!(t.getAttribute(`src`)??``)){o(),r(ie(`source-cleared-before-ready`));return}o(),r(Error(`Video load timed out after ${e.LOAD_TIMEOUT_MS}ms for: ${this.sourceUrl.slice(0,80)}`))},e.LOAD_TIMEOUT_MS),t.load()}).then(()=>{this.primary=t,this._pendingPrimary=null}).catch(e=>{throw this._pendingPrimary===t&&(this._pendingPrimary=null),t.pause(),t.src=``,t.load(),this.loadPromise=null,e}),await this.loadPromise,this.primary}async ensureReadyLanes(e,t){if(e<=0)return;for(await this.ensureLoaded();this.getElementCount()<e;){let e=this.createElementSync();this.overflow.push(e),await this.waitForElementReady(e)}let n=this.getManagedElements().filter(e=>!this.isElementInUse(e)),r=t?.targetTimeSeconds??[];for(let e=0;e<n.length;e+=1){let i=n[e],a=r[e];a!==void 0&&this.seekElement(i,a),t?.warmDecode&&await this.warmElement(i)}}acquire(t){let n=this.assignments.get(t);if(n)return n;if(this.primary&&!this.isElementInUse(this.primary))return this.assignments.set(t,this.primary),this.primary;if(this._pendingPrimary&&!this.isElementInUse(this._pendingPrimary))return this.primary=this._pendingPrimary,this._pendingPrimary=null,this.assignments.set(t,this.primary),this.primary;for(let e of this.overflow)if(!this.isElementInUse(e))return this.assignments.set(t,e),e;if(this.overflow.length<e.MAX_OVERFLOW_ELEMENTS){let e=this.createElementSync();return this.overflow.push(e),this.assignments.set(t,e),e}P.warn(`All pooled elements in use for ${this.sourceUrl}, creating extra overflow element`);let r=this.createElementSync();return this.overflow.push(r),this.assignments.set(t,r),r}release(e){this.assignments.delete(e)}seekElement(e,t,n){let r=e.duration||1/0,i=Math.max(0,Math.min(t,r-.001)),a=n?.fast?.1:.016;Math.abs(e.currentTime-i)<a||(n?.fast&&`fastSeek`in e?e.fastSeek(i):e.currentTime=i)}getAssignedElement(e){return this.assignments.get(e)||null}getMetadata(){return this.metadata}getActiveCount(){return this.assignments.size}getElementCount(){return+!!this.primary+ +!!this._pendingPrimary+this.overflow.length}isInUse(){return this.assignments.size>0}dispose(){this._loadTimeoutId!==null&&(clearTimeout(this._loadTimeoutId),this._loadTimeoutId=null),this.primary&&(this.primary.pause(),this.primary.src=``,this.primary.load()),this._pendingPrimary&&=(this._pendingPrimary.pause(),this._pendingPrimary.src=``,this._pendingPrimary.load(),null);for(let e of this.overflow)e.pause(),e.src=``,e.load();this.primary=null,this.overflow=[],this.assignments.clear(),this.metadata=null,this.loadPromise=null}isElementInUse(e){for(let t of this.assignments.values())if(t===e)return!0;return!1}getManagedElements(){return[...this.primary?[this.primary]:[],...this._pendingPrimary?[this._pendingPrimary]:[],...this.overflow]}async waitForElementReady(t){t.readyState>=2||await new Promise((n,r)=>{let i=null,a=()=>{i!==null&&(clearTimeout(i),i=null),t.removeEventListener(`canplay`,o),t.removeEventListener(`error`,s)},o=()=>{a(),n()},s=()=>{a(),r(Error(`Failed to load video: ${t.error?.message||`Unknown error`}`))};t.addEventListener(`canplay`,o),t.addEventListener(`error`,s),i=setTimeout(()=>{a(),r(Error(`Video load timed out after ${e.LOAD_TIMEOUT_MS}ms for: ${this.sourceUrl.slice(0,80)}`))},e.LOAD_TIMEOUT_MS),t.load()})}async warmElement(e){if(e.readyState<2||!e.paused)return;let t=e.muted;e.muted=!0;try{await e.play(),await Promise.resolve(),e.pause()}catch{}finally{e.muted=t}}createElementSync(){let e=document.createElement(`video`);return e.src=this.sourceUrl,e.preload=`auto`,e.playsInline=!0,e.muted=!0,e.addEventListener(`loadedmetadata`,()=>{this.metadata||={duration:e.duration,width:e.videoWidth,height:e.videoHeight},this.onElementReady?.(e)}),e.addEventListener(`error`,()=>{let t=Error(`Failed to load video: ${e.error?.message||`Unknown error`}`);this.onElementError?.(e,t)}),e}},I=class{sources=new Map;clipToSource=new Map;pendingReleaseTimers=new Map;onElementReady;onElementError;constructor(e){this.onElementReady=e?.onElementReady,this.onElementError=e?.onElementError}getSource(e){let t=this.sources.get(e);return t||(t=new F(e,{onElementReady:t=>{this.onElementReady?.(e,t)},onElementError:(t,n)=>{this.onElementError?.(e,n)}}),this.sources.set(e,t)),t}async preloadSource(e){await this.getSource(e).ensureLoaded()}acquireForClip(e,t){this.cancelPendingRelease(e);let n=this.clipToSource.get(e);if(n&&n!==t&&this.releaseClipNow(e),this.clipToSource.get(e)===t){let n=this.sources.get(t)?.getAssignedElement(e);if(n)return n}let r=this.getSource(t).acquire(e);return r&&this.clipToSource.set(e,t),r}releaseClip(e,t){let n=Math.max(0,t?.delayMs??0);if(this.cancelPendingRelease(e),n>0){let t=setTimeout(()=>{this.pendingReleaseTimers.delete(e),this.releaseClipNow(e)},n);this.pendingReleaseTimers.set(e,t);return}this.releaseClipNow(e)}async ensureReadyLanes(e,t,n){await this.getSource(e).ensureReadyLanes(t,n)}seekClip(e,t,n){let r=this.clipToSource.get(e);if(!r)return;let i=this.sources.get(r);if(!i)return;let a=i.getAssignedElement(e);a&&i.seekElement(a,t,n)}getClipElement(e){let t=this.clipToSource.get(e);return t&&this.sources.get(t)?.getAssignedElement(e)||null}getSourceMetadata(e){return this.sources.get(e)?.getMetadata()||null}pruneUnused(e){for(let[t,n]of this.sources.entries())!e.has(t)&&!n.isInUse()&&(n.dispose(),this.sources.delete(t))}getStats(){let e=0,t=0;for(let n of this.sources.values())e+=n.getElementCount(),t+=n.getActiveCount();return{sourceCount:this.sources.size,totalElements:e,activeClips:t}}dispose(){for(let e of this.pendingReleaseTimers.values())clearTimeout(e);this.pendingReleaseTimers.clear();for(let e of this.sources.values())e.dispose();this.sources.clear(),this.clipToSource.clear()}cancelPendingRelease(e){let t=this.pendingReleaseTimers.get(e);t!==void 0&&(clearTimeout(t),this.pendingReleaseTimers.delete(e))}releaseClipNow(e){let t=this.clipToSource.get(e);t&&(this.sources.get(t)?.release(e),this.clipToSource.delete(e))}};function ae(e,t){if(e.shapeType!==`path`)return e;let n=t?.(e.id);return!n||n===e.pathVertices?e:{...e,pathVertices:n}}function oe(e,t){return e.type===`shape`?ae(e,t):e}const se=[{value:`Roboto`,label:`Roboto`,family:`Roboto`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Open Sans`,label:`Open Sans`,family:`Open Sans`,weights:[300,400,500,600,700,800]},{value:`Google Sans`,label:`Google Sans`,family:`Google Sans`,weights:[400,500,600,700]},{value:`Noto Sans JP`,label:`Noto Sans JP`,family:`Noto Sans JP`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Inter`,label:`Inter`,family:`Inter`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Montserrat`,label:`Montserrat`,family:`Montserrat`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Poppins`,label:`Poppins`,family:`Poppins`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Lato`,label:`Lato`,family:`Lato`,weights:[100,300,400,700,900]},{value:`Roboto Condensed`,label:`Roboto Condensed`,family:`Roboto Condensed`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Roboto Mono`,label:`Roboto Mono`,family:`Roboto Mono`,weights:[100,200,300,400,500,600,700]},{value:`Arimo`,label:`Arimo`,family:`Arimo`,weights:[400,500,600,700]},{value:`Oswald`,label:`Oswald`,family:`Oswald`,weights:[200,300,400,500,600,700]},{value:`Noto Sans`,label:`Noto Sans`,family:`Noto Sans`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Raleway`,label:`Raleway`,family:`Raleway`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Nunito`,label:`Nunito`,family:`Nunito`,weights:[200,300,400,500,600,700,800,900,1e3]},{value:`Nunito Sans`,label:`Nunito Sans`,family:`Nunito Sans`,weights:[200,300,400,500,600,700,800,900,1e3]},{value:`Playfair Display`,label:`Playfair Display`,family:`Playfair Display`,weights:[400,500,600,700,800,900]},{value:`Rubik`,label:`Rubik`,family:`Rubik`,weights:[300,400,500,600,700,800,900]},{value:`Ubuntu`,label:`Ubuntu`,family:`Ubuntu`,weights:[300,400,500,700]},{value:`Roboto Slab`,label:`Roboto Slab`,family:`Roboto Slab`,weights:[100,200,300,400,500,600,700,800,900]},{value:`DM Sans`,label:`DM Sans`,family:`DM Sans`,weights:[100,200,300,400,500,600,700,800,900,1e3]},{value:`Merriweather`,label:`Merriweather`,family:`Merriweather`,weights:[300,400,700,900]},{value:`Noto Sans KR`,label:`Noto Sans KR`,family:`Noto Sans KR`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Work Sans`,label:`Work Sans`,family:`Work Sans`,weights:[100,200,300,400,500,600,700,800,900]},{value:`PT Sans`,label:`PT Sans`,family:`PT Sans`,weights:[400,700]},{value:`Kanit`,label:`Kanit`,family:`Kanit`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Lora`,label:`Lora`,family:`Lora`,weights:[400,500,600,700]},{value:`Mulish`,label:`Mulish`,family:`Mulish`,weights:[200,300,400,500,600,700,800,900,1e3]},{value:`Fjalla One`,label:`Fjalla One`,family:`Fjalla One`,weights:[400]},{value:`Manrope`,label:`Manrope`,family:`Manrope`,weights:[200,300,400,500,600,700,800]},{value:`Archivo`,label:`Archivo`,family:`Archivo`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Quicksand`,label:`Quicksand`,family:`Quicksand`,weights:[300,400,500,600,700]},{value:`Outfit`,label:`Outfit`,family:`Outfit`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Figtree`,label:`Figtree`,family:`Figtree`,weights:[300,400,500,600,700,800,900]},{value:`Fira Sans`,label:`Fira Sans`,family:`Fira Sans`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Inconsolata`,label:`Inconsolata`,family:`Inconsolata`,weights:[200,300,400,500,600,700,800,900]},{value:`Barlow`,label:`Barlow`,family:`Barlow`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Bebas Neue`,label:`Bebas Neue`,family:`Bebas Neue`,weights:[400]},{value:`Noto Sans TC`,label:`Noto Sans TC`,family:`Noto Sans TC`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Archivo Black`,label:`Archivo Black`,family:`Archivo Black`,weights:[400]},{value:`Source Sans 3`,label:`Source Sans 3`,family:`Source Sans 3`,weights:[200,300,400,500,600,700,800,900]},{value:`Hind Siliguri`,label:`Hind Siliguri`,family:`Hind Siliguri`,weights:[300,400,500,600,700]},{value:`IBM Plex Sans`,label:`IBM Plex Sans`,family:`IBM Plex Sans`,weights:[100,200,300,400,500,600,700]},{value:`Prompt`,label:`Prompt`,family:`Prompt`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Bungee`,label:`Bungee`,family:`Bungee`,weights:[400]},{value:`Titillium Web`,label:`Titillium Web`,family:`Titillium Web`,weights:[200,300,400,600,700,900]},{value:`Karla`,label:`Karla`,family:`Karla`,weights:[200,300,400,500,600,700,800]},{value:`Heebo`,label:`Heebo`,family:`Heebo`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Saira`,label:`Saira`,family:`Saira`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Noto Serif`,label:`Noto Serif`,family:`Noto Serif`,weights:[100,200,300,400,500,600,700,800,900]},{value:`PT Serif`,label:`PT Serif`,family:`PT Serif`,weights:[400,700]},{value:`Jost`,label:`Jost`,family:`Jost`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Plus Jakarta Sans`,label:`Plus Jakarta Sans`,family:`Plus Jakarta Sans`,weights:[200,300,400,500,600,700,800]},{value:`Bricolage Grotesque`,label:`Bricolage Grotesque`,family:`Bricolage Grotesque`,weights:[200,300,400,500,600,700,800]},{value:`Noto Color Emoji`,label:`Noto Color Emoji`,family:`Noto Color Emoji`,weights:[400]},{value:`Share Tech`,label:`Share Tech`,family:`Share Tech`,weights:[400]},{value:`Smooch Sans`,label:`Smooch Sans`,family:`Smooch Sans`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Source Code Pro`,label:`Source Code Pro`,family:`Source Code Pro`,weights:[200,300,400,500,600,700,800,900]},{value:`Libre Baskerville`,label:`Libre Baskerville`,family:`Libre Baskerville`,weights:[400,700]},{value:`Dancing Script`,label:`Dancing Script`,family:`Dancing Script`,weights:[400,500,600,700]},{value:`Lobster Two`,label:`Lobster Two`,family:`Lobster Two`,weights:[400,700]},{value:`EB Garamond`,label:`EB Garamond`,family:`EB Garamond`,weights:[400,500,600,700,800]},{value:`Josefin Sans`,label:`Josefin Sans`,family:`Josefin Sans`,weights:[100,200,300,400,500,600,700]},{value:`Cairo`,label:`Cairo`,family:`Cairo`,weights:[200,300,400,500,600,700,800,900,1e3]},{value:`Libre Franklin`,label:`Libre Franklin`,family:`Libre Franklin`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Gravitas One`,label:`Gravitas One`,family:`Gravitas One`,weights:[400]},{value:`Noto Serif JP`,label:`Noto Serif JP`,family:`Noto Serif JP`,weights:[200,300,400,500,600,700,800,900]},{value:`Public Sans`,label:`Public Sans`,family:`Public Sans`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Anton`,label:`Anton`,family:`Anton`,weights:[400]},{value:`Mukta`,label:`Mukta`,family:`Mukta`,weights:[200,300,400,500,600,700,800]},{value:`Schibsted Grotesk`,label:`Schibsted Grotesk`,family:`Schibsted Grotesk`,weights:[400,500,600,700,800,900]},{value:`Dosis`,label:`Dosis`,family:`Dosis`,weights:[200,300,400,500,600,700,800]},{value:`Barlow Condensed`,label:`Barlow Condensed`,family:`Barlow Condensed`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Bitter`,label:`Bitter`,family:`Bitter`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Roboto Flex`,label:`Roboto Flex`,family:`Roboto Flex`,weights:[100,200,300,400,500,600,700,800,900,1e3]},{value:`Cabin`,label:`Cabin`,family:`Cabin`,weights:[400,500,600,700]},{value:`Noto Sans SC`,label:`Noto Sans SC`,family:`Noto Sans SC`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Ramabhadra`,label:`Ramabhadra`,family:`Ramabhadra`,weights:[400]},{value:`Noto Sans Telugu`,label:`Noto Sans Telugu`,family:`Noto Sans Telugu`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Nanum Gothic`,label:`Nanum Gothic`,family:`Nanum Gothic`,weights:[400,700,800]},{value:`Space Grotesk`,label:`Space Grotesk`,family:`Space Grotesk`,weights:[300,400,500,600,700]},{value:`Changa One`,label:`Changa One`,family:`Changa One`,weights:[400]},{value:`Anek Telugu`,label:`Anek Telugu`,family:`Anek Telugu`,weights:[100,200,300,400,500,600,700,800]},{value:`Assistant`,label:`Assistant`,family:`Assistant`,weights:[200,300,400,500,600,700,800]},{value:`Oxygen`,label:`Oxygen`,family:`Oxygen`,weights:[300,400,700]},{value:`Pacifico`,label:`Pacifico`,family:`Pacifico`,weights:[400]},{value:`Alfa Slab One`,label:`Alfa Slab One`,family:`Alfa Slab One`,weights:[400]},{value:`Lexend`,label:`Lexend`,family:`Lexend`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Hind`,label:`Hind`,family:`Hind`,weights:[300,400,500,600,700]},{value:`M PLUS Rounded 1c`,label:`M PLUS Rounded 1c`,family:`M PLUS Rounded 1c`,weights:[100,300,400,500,700,800,900]},{value:`Red Hat Display`,label:`Red Hat Display`,family:`Red Hat Display`,weights:[300,400,500,600,700,800,900]},{value:`Exo 2`,label:`Exo 2`,family:`Exo 2`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Slabo 27px`,label:`Slabo 27px`,family:`Slabo 27px`,weights:[400]},{value:`Lobster`,label:`Lobster`,family:`Lobster`,weights:[400]},{value:`Cormorant Garamond`,label:`Cormorant Garamond`,family:`Cormorant Garamond`,weights:[300,400,500,600,700]},{value:`Sora`,label:`Sora`,family:`Sora`,weights:[100,200,300,400,500,600,700,800]},{value:`Crimson Text`,label:`Crimson Text`,family:`Crimson Text`,weights:[400,600,700]},{value:`Inter Tight`,label:`Inter Tight`,family:`Inter Tight`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Overpass`,label:`Overpass`,family:`Overpass`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Caveat`,label:`Caveat`,family:`Caveat`,weights:[400,500,600,700]},{value:`Urbanist`,label:`Urbanist`,family:`Urbanist`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Comfortaa`,label:`Comfortaa`,family:`Comfortaa`,weights:[300,400,500,600,700]},{value:`Tajawal`,label:`Tajawal`,family:`Tajawal`,weights:[200,300,400,500,700,800,900]},{value:`Arvo`,label:`Arvo`,family:`Arvo`,weights:[400,700]},{value:`PT Sans Narrow`,label:`PT Sans Narrow`,family:`PT Sans Narrow`,weights:[400,700]},{value:`Rajdhani`,label:`Rajdhani`,family:`Rajdhani`,weights:[300,400,500,600,700]},{value:`DM Serif Display`,label:`DM Serif Display`,family:`DM Serif Display`,weights:[400]},{value:`Abel`,label:`Abel`,family:`Abel`,weights:[400]},{value:`Teko`,label:`Teko`,family:`Teko`,weights:[300,400,500,600,700]},{value:`Source Serif 4`,label:`Source Serif 4`,family:`Source Serif 4`,weights:[200,300,400,500,600,700,800,900]},{value:`Noto Sans Arabic`,label:`Noto Sans Arabic`,family:`Noto Sans Arabic`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Almarai`,label:`Almarai`,family:`Almarai`,weights:[300,400,700,800]},{value:`Merriweather Sans`,label:`Merriweather Sans`,family:`Merriweather Sans`,weights:[300,400,500,600,700,800]},{value:`Lexend Deca`,label:`Lexend Deca`,family:`Lexend Deca`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Satisfy`,label:`Satisfy`,family:`Satisfy`,weights:[400]},{value:`Orbitron`,label:`Orbitron`,family:`Orbitron`,weights:[400,500,600,700,800,900]},{value:`Barlow Semi Condensed`,label:`Barlow Semi Condensed`,family:`Barlow Semi Condensed`,weights:[100,200,300,400,500,600,700,800,900]},{value:`Domine`,label:`Domine`,family:`Domine`,weights:[400,500,600,700]},{value:`Shadows Into Light`,label:`Shadows Into Light`,family:`Shadows Into Light`,weights:[400]},{value:`M PLUS 1p`,label:`M PLUS 1p`,family:`M PLUS 1p`,weights:[100,300,400,500,700,800,900]}];t(`FontLoader`);const ce={normal:400,medium:500,semibold:600,bold:700},L=new Map;function le(e){let t=[...new Set(e)].filter(e=>Number.isFinite(e)&&e>0).sort((e,t)=>e-t);return t.length>0?t:[400]}function ue(e,t){return{family:e,weights:le(t),display:`swap`}}function de(e,t=e,n=[400]){if(typeof t==`string`){L.set(e,ue(t,n));return}L.set(e,ue(e,t))}function fe(e){for(let t of e)de(t.value,t.family,t.weights)}fe(se);const R={fontSize:60,fontFamily:`Inter`,fontWeight:`normal`,fontStyle:`normal`,lineHeight:1.2,letterSpacing:0,textAlign:`center`,verticalAlign:`middle`,textPadding:16,color:`#ffffff`,underline:!1};function pe(e,t,n,r){return`${e} ${t} ${n}px "${r}", sans-serif`}function me(e){return{lineHeight:e.lineHeight??R.lineHeight,letterSpacing:e.letterSpacing??R.letterSpacing,textAlign:e.textAlign??R.textAlign,verticalAlign:e.verticalAlign??R.verticalAlign,textPadding:Math.max(0,e.textPadding??R.textPadding),color:e.color??R.color,backgroundColor:e.backgroundColor,backgroundRadius:Math.max(0,e.backgroundRadius??0),textShadow:e.textShadow,stroke:e.stroke}}function he(e){let t=e.fontSize??R.fontSize,n=e.fontFamily??R.fontFamily,i=e.fontStyle??R.fontStyle,a=e.fontWeight??R.fontWeight,o=e.letterSpacing??R.letterSpacing,s=e.color??R.color,c=e.underline??R.underline;return r(e).map(e=>{let r=e.fontSize??t,l=e.fontFamily??n,u=e.fontStyle??i,d=e.fontWeight??a,f=ce[d]??400;return{text:e.text??``,fontSize:r,fontFamily:l,fontStyle:u,fontWeightName:d,fontWeight:f,letterSpacing:e.letterSpacing??o,color:e.color??s,underline:e.underline??c,cssFont:pe(u,f,r,l)}})}function ge(e,t,n,r,i){let a=[],o=``;for(let s of e){let e=o+s;i.measure(e,t,n)>r&&o?(a.push(o),o=s):o=e}return o&&a.push(o),a}function _e(e,t,n,r,i){let a=[];for(let o of e.split(`
`)){if(o===``){a.push(``);continue}let e=``;for(let s of o.split(` `)){let o=e?`${e} ${s}`:s;if(i.measure(o,t,n)>r&&e){if(a.push(e),e=s,i.measure(s,t,n)>r){let o=ge(s,t,n,r,i);for(let e=0;e<o.length-1;e++)a.push(o[e]??``);e=o[o.length-1]??``}}else e=o}e&&a.push(e)}return a.length>0?a:[``]}function ve(e,t,n,r){let i=me(e),a=he(e),o=i.textPadding,s=Math.max(1,t-o*2),c=n-o*2,l=[];for(let e of a){let t=r.fontMetrics(e.cssFont),n=e.fontSize*i.lineHeight,a=(n-(t.ascent+t.descent))/2+t.ascent;for(let t of _e(e.text,e.cssFont,e.letterSpacing,s,r))l.push({text:t,cssFont:e.cssFont,fontSize:e.fontSize,color:e.color,letterSpacing:e.letterSpacing,underline:e.underline,width:r.measure(t,e.cssFont,e.letterSpacing),top:0,baselineY:a,startX:0,lineHeightPx:n})}let u=l.reduce((e,t)=>e+t.lineHeightPx,0),d=i.verticalAlign===`top`?o:i.verticalAlign===`bottom`?n-o-u:o+(c-u)/2,f=d;for(let e of l)e.top=f,e.baselineY=f+e.baselineY,e.startX=i.textAlign===`left`?o:i.textAlign===`right`?t-o-e.width:(t-e.width)/2,f+=e.lineHeightPx;let p;if(i.backgroundColor&&l.length>0){let e=Math.max(...l.map(e=>e.width)),n=i.textAlign===`left`?o+e/2:i.textAlign===`right`?t-o-e/2:t/2,r=Math.min(t,e+o*2),a=u+o*2;p={x:n-r/2,y:d-o,width:r,height:a,radius:Math.max(0,Math.min(i.backgroundRadius,r/2,a/2))}}return{lines:l,totalHeight:u,background:p}}function ye(e){return Math.max(0,e.width-e.letterSpacing)}function be(e){let t=/(\d+(?:\.\d+)?)px/.exec(e);return t?parseFloat(t[1]):16}function xe(e,t){`letterSpacing`in e&&(e.letterSpacing=`${t}px`)}function Se(e,t){return`fontKerning`in e&&(e.fontKerning=`normal`),{measure(n,r,i){return e.font!==r&&(e.font=r),xe(e,i),t?t(n,i):e.measureText(n).width},fontMetrics(t){e.font!==t&&(e.font=t);let n=be(t),r=e.measureText(`Hg`);return{ascent:r.fontBoundingBoxAscent||n*.8,descent:r.fontBoundingBoxDescent||n*.2}}}}let Ce;function we(){return Ce!==void 0||typeof OffscreenCanvas<`u`&&(Ce=new OffscreenCanvas(1,1).getContext(`2d`),Ce)?Ce:typeof document<`u`?(Ce=document.createElement(`canvas`).getContext(`2d`),Ce):(Ce=null,Ce)}function z(){let e=we();return e?Se(e):{measure:(e,t,n)=>{let r=be(t);return e.length*r*.6+e.length*n},fontMetrics:e=>{let t=be(e);return{ascent:t*.8,descent:t*.2}}}}function Te(e,t){if(!t)return e;let n=Object.prototype.hasOwnProperty.call(t,`stroke`),r=Object.prototype.hasOwnProperty.call(t,`textShadow`);return{...e,text:t.text??e.text,textSpans:t.textSpans??e.textSpans,fontSize:t.fontSize??e.fontSize,letterSpacing:t.letterSpacing??e.letterSpacing,lineHeight:t.lineHeight??e.lineHeight,textPadding:t.textPadding??e.textPadding,backgroundRadius:t.backgroundRadius??e.backgroundRadius,stroke:n?t.stroke:e.stroke,textShadow:r?t.textShadow:e.textShadow}}function Ee(e,t,n){let r=Te(e,n),i=me(r),a=ve(r,t,0,z()),o=(i.stroke?.width??0)*2,s=i.textShadow?Math.abs(i.textShadow.offsetY)+i.textShadow.blur:0;return a.totalHeight+i.textPadding*2+o+s*2}function De(e,t,n){let r=Ee(e,t.width,n);return r<=t.height+.5?t:{...t,height:r}}function Oe(e,t,n,r){let i=Math.max(1,t-1),a=Math.max(0,Math.min(1,e/i));switch(n){case`ease-in`:return S(a);case`ease-out`:return h(a);case`ease-in-out`:return b(a);case`cubic-bezier`:return r?E(a,r):a;default:return a}}function ke({transitionWindows:e,frame:t}){let n=[],r=new Set;for(let i of e){if(t<i.startFrame||t>=i.endFrame)continue;let e=t-i.startFrame;n.push({transition:i.transition,leftClip:i.leftClip,rightClip:i.rightClip,progress:Oe(e,i.durationInFrames,i.transition.timing,i.transition.bezierPoints),transitionStart:i.startFrame,transitionEnd:i.endFrame,durationInFrames:i.durationInFrames,leftPortion:i.leftPortion,rightPortion:i.rightPortion,cutPoint:i.cutPoint}),r.add(i.transition.leftClipId),r.add(i.transition.rightClipId)}return{activeTransitions:n,transitionClipIds:r}}function Ae(e,t){return t?{...e,...t,anchorX:t.anchorX??e.anchorX,anchorY:t.anchorY??e.anchorY,opacity:t.opacity??e.opacity,cornerRadius:t.cornerRadius??e.cornerRadius}:e}function je(e,{canvas:t,relativeFrame:r,keyframes:i,previewTransform:a}){let o=n(e,t,l(e)),c=Ae(i&&te(i)?v(o,i,r):o,a);return e.type===`text`&&!s(e.cornerPin)?De(_(e,i,r,t),c):c}function Me(e,{canvas:t,frame:n,keyframes:r,previewTransform:i}){return je(e,{canvas:t,relativeFrame:n-e.from,keyframes:r,previewTransform:i})}function Ne(e,{canvas:t,frame:n,getKeyframes:r,getPreviewTransform:i,getPreviewPathVertices:a}){return e.length===0?[]:e.map(e=>`mask`in e?e:{mask:e,trackOrder:0}).filter(({mask:e})=>{let t=e.from,r=e.from+e.durationInFrames;return n>=t&&n<r}).map(({mask:e,trackOrder:o})=>{let s=ae(e,a);return{shape:s,trackOrder:o,transform:Me(s,{canvas:t,frame:n,keyframes:r?.(e.id),previewTransform:i?.(e.id)})}})}function Pe({renderPlan:e,frame:t,canvas:n,getKeyframes:r,getPreviewTransform:i,getPreviewPathVertices:a}){return{frame:t,activeShapeMasks:Ne(e.visibleShapeMasks,{canvas:n,frame:t,getKeyframes:r,getPreviewTransform:i,getPreviewPathVertices:a}),transitionFrameState:ke({transitionWindows:e.transitionWindows,frame:t})}}function Fe(){let e=null,t=-1,n,r=null,i=-1,a=-1,o=-1,s,c,l;return{resolve(u,d){let f=i===u.canvas.width&&a===u.canvas.height&&o===u.canvas.fps,p=s===u.getKeyframes&&c===u.getPreviewTransform&&l===u.getPreviewPathVertices;return e&&t===u.frame&&n===d&&r===u.renderPlan&&f&&p?e:(e=Pe(u),t=u.frame,n=d,r=u.renderPlan,i=u.canvas.width,a=u.canvas.height,o=u.canvas.fps,s=u.getKeyframes,c=u.getPreviewTransform,l=u.getPreviewPathVertices,e)},invalidate(u){if(e&&u&&N(u)){let e=u.frames?.includes(t)??!1,n=u.ranges?j(t,u.ranges):!1;if(!e&&!n)return}e=null,t=-1,n=void 0,r=null,i=-1,a=-1,o=-1,s=void 0,c=void 0,l=void 0}}}function Ie({activeTransitions:e,getTrackOrder:t}){let n=new Map;for(let r of e){let e=t(r),i=n.get(e);if(i){i.push(r);continue}n.set(e,[r])}return n}function B(e){let t=e.some(e=>e.solo),n=Math.max(...e.map(e=>e.order??0),0),r=e.filter(e=>t?e.solo===!0:e.visible!==!1),i=new Set(r.map(e=>e.id)),a=[...r].sort((e,t)=>(t.order??0)-(e.order??0)),o=[...a].reverse(),s=[...e].sort((e,t)=>(t.order??0)-(e.order??0)),c=new Map;for(let t of e)c.set(t.id,t.order??0);return{hasSoloTracks:t,maxOrder:n,visibleTracks:r,visibleTrackIds:i,visibleTracksByOrderDesc:a,visibleTracksByOrderAsc:o,allTracksByOrderDesc:s,trackOrderMap:c}}function Le({tracks:e,transitions:t=[]}){let n=B(e),{visibleTracks:r,visibleTrackIds:i,maxOrder:a}=n,o=V({tracks:e,visibleTrackIds:i,maxOrder:a}),s=Ue(e);return{trackRenderState:n,visualItems:o,videoItems:o.filter(e=>e.type===`video`),audioItems:Be({tracks:e,visibleTrackIds:i}),stableDomTracks:Ve({tracks:e,visibleTrackIds:i}),visibleShapeMasks:Re(r),visibleAdjustmentLayers:ze(r),visibleTextFontFamilies:He(r),transitionClipItems:s,transitionClipMap:We(s),transitionWindows:Ge(t,s)}}function Re(e){let t=[];for(let n of e)for(let e of n.items)e.type===`shape`&&e.isMask&&t.push({mask:e,trackOrder:n.order??0});return t}function ze(e){let t=[];for(let n of e)for(let e of n.items)e.type===`adjustment`&&t.push({layer:e,trackOrder:n.order??0});return t}function V({tracks:e,visibleTrackIds:t,maxOrder:n}){return e.flatMap(e=>e.items.filter(e=>e.type===`video`||e.type===`image`).map(r=>({...r,zIndex:(n-(e.order??0))*1e3,muted:e.muted??!1,trackVolumeDb:e.volume??0,trackAudioEq:e.audioEq,trackOrder:e.order??0,trackVisible:t.has(e.id)})))}function Be({tracks:e,visibleTrackIds:t}){return e.flatMap(e=>e.items.filter(e=>e.type===`audio`).map(n=>({...n,muted:e.muted,trackVolumeDb:e.volume??0,trackAudioEq:e.audioEq,trackVisible:t.has(e.id)})))}function Ve({tracks:e,visibleTrackIds:t}){return e.map(e=>({...e,trackVisible:t.has(e.id),items:e.items.filter(e=>!(e.type===`video`||e.type===`audio`||e.type===`adjustment`||e.type===`shape`&&e.isMask))}))}function He(e){let t=new Set;for(let n of e)for(let e of n.items){if(e.type!==`text`)continue;let n=e;t.add(n.fontFamily??`Inter`);for(let e of n.textSpans??[])t.add(e.fontFamily??n.fontFamily??`Inter`)}return[...t]}function Ue(e){return e.flatMap(e=>e.items.filter(e=>e.type===`video`||e.type===`image`||e.type===`composition`))}function We(e){let t=new Map;for(let n of e)t.set(n.id,n);return t}function Ge(e,t){return ne(e,We(t))}function Ke({tracksByOrderDesc:e,visibleTrackIds:t,shouldRenderItem:n,transitionsByTrackOrder:r,occlusionCutoffOrder:i}){let a=[];for(let o of e){if(!t.has(o.id))continue;let e=o.order??0;if(i!==null&&e>i)continue;for(let t of o.items??[])n(t)&&a.push({type:`item`,item:t,trackOrder:e});let s=r.get(e);if(s)for(let t of s)a.push({type:`transition`,transition:t,trackOrder:e})}return a}function qe({tracksByOrderAsc:e,visibleTrackIds:t,disableOcclusion:n,shouldRenderItem:r,isFullyOccluding:i}){if(n)return null;for(let n of e){if(!t.has(n.id))continue;let e=n.order??0;for(let t of n.items??[])if(r(t)&&i(t,e))return e}return null}function Je({tracksByOrderDesc:e,tracksByOrderAsc:t,visibleTrackIds:n,activeTransitions:r,getTransitionTrackOrder:i,disableOcclusion:a,shouldRenderItem:o,isFullyOccluding:s}){let c=Ie({activeTransitions:r,getTrackOrder:i}),l=qe({tracksByOrderAsc:t,visibleTrackIds:n,disableOcclusion:a,shouldRenderItem:o,isFullyOccluding:s});return{transitionsByTrackOrder:c,occlusionCutoffOrder:l,renderTasks:Ke({tracksByOrderDesc:e,visibleTrackIds:n,shouldRenderItem:o,transitionsByTrackOrder:c,occlusionCutoffOrder:l})}}function Ye({tracksByOrderAsc:e,visibleTrackIds:t,minFrame:n,maxFrame:r,maxItems:i}){if(i<=0)return[];let a=[];for(let o of e)if(t.has(o.id)){for(let e of o.items??[])if(e.type===`video`&&!(e.from>r||e.from+e.durationInFrames<=n)&&(a.push(e),a.length>=i))return a}return a}function Xe(e){let{width:t,height:n,cornerRadius:r=0}=e,i=Math.min(r,t/2,n/2),a;return a=i>0?`M ${i} 0 L ${t-i} 0 A ${i} ${i} 0 0 1 ${t} ${i} L ${t} ${n-i} A ${i} ${i} 0 0 1 ${t-i} ${n} L ${i} ${n} A ${i} ${i} 0 0 1 0 ${n-i} L 0 ${i} A ${i} ${i} 0 0 1 ${i} 0 Z`:`M 0 0 L ${t} 0 L ${t} ${n} L 0 ${n} Z`,{path:a,width:t,height:n}}function Ze(e){let{radius:t}=e,n=t*2;return{path:`M ${t} 0 A ${t} ${t} 0 1 1 ${t} ${n} A ${t} ${t} 0 1 1 ${t} 0 Z`,width:n,height:n}}function Qe(e){let{rx:t,ry:n}=e,r=t*2,i=n*2;return{path:`M ${t} 0 A ${t} ${n} 0 1 1 ${t} ${i} A ${t} ${n} 0 1 1 ${t} 0 Z`,width:r,height:i}}function $e(e){let{length:t,direction:n=`up`,cornerRadius:r=0}=e,i=t*Math.sqrt(3)/2,a,o,s;switch(n){case`up`:o=t,s=i,a=[[t/2,0],[t,i],[0,i]];break;case`down`:o=t,s=i,a=[[0,0],[t,0],[t/2,i]];break;case`left`:o=i,s=t,a=[[i,0],[i,t],[0,t/2]];break;case`right`:o=i,s=t,a=[[0,0],[i,t/2],[0,t]];break}return{path:r>0?it(a,r):rt(a),width:o,height:s}}function et(e){let{points:t,outerRadius:n,innerRadius:r,cornerRadius:i=0}=e,a=n*2,o=[],s=Math.PI/t;for(let e=0;e<t*2;e++){let t=e%2==0?n:r,i=e*s-Math.PI/2,a=n+t*Math.cos(i),c=n+t*Math.sin(i);o.push([a,c])}return{path:i>0?it(o,i):rt(o),width:a,height:a}}function tt(e){let{points:t,radius:n,cornerRadius:r=0}=e,i=n*2,a=[],o=Math.PI*2/t;for(let e=0;e<t;e++){let t=e*o-Math.PI/2,r=n+n*Math.cos(t),i=n+n*Math.sin(t);a.push([r,i])}return{path:r>0?it(a,r):rt(a),width:i,height:i}}function nt(e){let{height:t}=e,n=t*1.1,r=23/110*n,i=69/100*t,a=60/100*t,o=13/100*t,s=29/110*n,c=15/110*n,l=5/110*n,u=7/100*t,d=17/100*t;return{path:[`M ${n/2} ${t}`,`C ${n/2-r} ${i}, 0 ${a}, 0 ${t/4}`,`C 0 ${o}, ${n/4-s/2} 0, ${n/4} 0`,`C ${n/4+s/2} 0, ${n/2-l} ${u}, ${n/2} ${d}`,`C ${n/2+l} ${u}, ${n/2+c} 0, ${n/4*3} 0`,`C ${n/4*3+s/2} 0, ${n} ${o}, ${n} ${t/4}`,`C ${n} ${a}, ${n/2+r} ${i}, ${n/2} ${t}`,`Z`].join(` `),width:n,height:t}}function rt(e){if(e.length<3)return``;let[t,...n]=e,r=[`M ${t[0]} ${t[1]}`];for(let[e,t]of n)r.push(`L ${e} ${t}`);return r.push(`Z`),r.join(` `)}function it(e,t){if(e.length<3)return``;let n=[],r=e.length;for(let i=0;i<r;i++){let a=e[i],o=e[(i-1+r)%r],s=e[(i+1)%r],c=o[0]-a[0],l=o[1]-a[1],u=Math.sqrt(c*c+l*l),d=s[0]-a[0],f=s[1]-a[1],p=Math.sqrt(d*d+f*f),m=Math.min(u,p)/2,h=Math.min(t,m),g=a[0]+c/u*h,_=a[1]+l/u*h,v=a[0]+d/p*h,y=a[1]+f/p*h;i===0?n.push(`M ${g} ${_}`):n.push(`L ${g} ${_}`),n.push(`Q ${a[0]} ${a[1]} ${v} ${y}`)}return n.push(`Z`),n.join(` `)}function H(e,t,n=t){let r=e.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi)||[],i=[];for(let e of r){let r=e[0],a=r.toUpperCase(),o=e.slice(1).trim().split(/[\s,]+/).map(Number).filter(e=>!isNaN(e));switch(a){case`M`:case`L`:case`T`:{let e=[];for(let r=0;r<o.length;r+=2)e.push(o[r]*t,o[r+1]*n);i.push(`${r} ${e.join(` `)}`);break}case`H`:i.push(`${r} ${o.map(e=>e*t).join(` `)}`);break;case`V`:i.push(`${r} ${o.map(e=>e*n).join(` `)}`);break;case`C`:{let e=[];for(let r=0;r<o.length;r+=6)e.push(o[r]*t,o[r+1]*n,o[r+2]*t,o[r+3]*n,o[r+4]*t,o[r+5]*n);i.push(`${r} ${e.join(` `)}`);break}case`S`:{let e=[];for(let r=0;r<o.length;r+=4)e.push(o[r]*t,o[r+1]*n,o[r+2]*t,o[r+3]*n);i.push(`${r} ${e.join(` `)}`);break}case`Q`:{let e=[];for(let r=0;r<o.length;r+=4)e.push(o[r]*t,o[r+1]*n,o[r+2]*t,o[r+3]*n);i.push(`${r} ${e.join(` `)}`);break}case`A`:{let e=[];for(let r=0;r<o.length;r+=7)e.push(o[r]*t,o[r+1]*n,o[r+2],o[r+3],o[r+4],o[r+5]*t,o[r+6]*n);i.push(`${r} ${e.join(` `)}`);break}case`Z`:i.push(r);break;default:i.push(e)}}return i.join(` `)}function U(e,t,n){let r=e.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi)||[],i=[];for(let e of r){let r=e[0],a=r===r.toLowerCase(),o=r.toUpperCase(),s=e.slice(1).trim().split(/[\s,]+/).map(Number).filter(e=>!isNaN(e));if(a&&o!==`M`){i.push(e);continue}switch(o){case`M`:case`L`:case`T`:{let e=[];for(let r=0;r<s.length;r+=2)e.push(s[r]+t,s[r+1]+n);i.push(`${r} ${e.join(` `)}`);break}case`H`:i.push(`${r} ${s.map(e=>e+t).join(` `)}`);break;case`V`:i.push(`${r} ${s.map(e=>e+n).join(` `)}`);break;case`C`:{let e=[];for(let r=0;r<s.length;r+=6)e.push(s[r]+t,s[r+1]+n,s[r+2]+t,s[r+3]+n,s[r+4]+t,s[r+5]+n);i.push(`${r} ${e.join(` `)}`);break}case`S`:{let e=[];for(let r=0;r<s.length;r+=4)e.push(s[r]+t,s[r+1]+n,s[r+2]+t,s[r+3]+n);i.push(`${r} ${e.join(` `)}`);break}case`Q`:{let e=[];for(let r=0;r<s.length;r+=4)e.push(s[r]+t,s[r+1]+n,s[r+2]+t,s[r+3]+n);i.push(`${r} ${e.join(` `)}`);break}case`A`:{let e=[];for(let r=0;r<s.length;r+=7)e.push(s[r],s[r+1],s[r+2],s[r+3],s[r+4],s[r+5]+t,s[r+6]+n);i.push(`${r} ${e.join(` `)}`);break}case`Z`:i.push(r);break;default:i.push(e)}}return i.join(` `)}function W(e,t,n){let{canvasWidth:r,canvasHeight:i}=n,a=n.aspectLocked??e.transform?.aspectRatioLocked??!0,o=r/2,s=i/2,c=t.width,l=t.height,u=e.cornerRadius??0,d=o+t.x-c/2,f=s+t.y-l/2,p=Math.min(c,l),m;switch(e.shapeType){case`rectangle`:m=U(Xe({width:c,height:l,cornerRadius:u}).path,d,f);break;case`circle`:{let e=Ze({radius:p/2}),t=e.width,n=e.height;if(a){let r=(c-t)/2,i=(l-n)/2;m=U(e.path,d+r,f+i)}else{let r=c/t,i=l/n;m=U(H(e.path,r,i),d,f)}break}case`ellipse`:m=U(Qe({rx:c/2,ry:l/2}).path,d,f);break;case`triangle`:{let t=$e({length:p,direction:e.direction??`up`,cornerRadius:u}),n=t.width,r=t.height;if(a){let e=(c-n)/2,i=(l-r)/2;m=U(t.path,d+e,f+i)}else{let e=c/n,i=l/r;m=U(H(t.path,e,i),d,f)}break}case`star`:{let t=p/2,n=t*(e.innerRadius??.5),r=et({points:e.points??5,outerRadius:t,innerRadius:n,cornerRadius:u}),i=r.width,o=r.height;if(a){let e=(c-i)/2,t=(l-o)/2;m=U(r.path,d+e,f+t)}else{let e=c/i,t=l/o;m=U(H(r.path,e,t),d,f)}break}case`polygon`:{let t=p/2,n=tt({points:e.points??6,radius:t,cornerRadius:u}),r=n.width,i=n.height;if(a){let e=(c-r)/2,t=(l-i)/2;m=U(n.path,d+e,f+t)}else{let e=c/r,t=l/i;m=U(H(n.path,e,t),d,f)}break}case`heart`:{let e=nt({height:p/1.1}),t=e.width,n=e.height;if(a){let r=(c-t)/2,i=(l-n)/2;m=U(e.path,d+r,f+i)}else{let r=c/t,i=l/n;m=U(H(e.path,r,i),d,f)}break}case`path`:m=at(e.pathVertices??[],c,l),m=U(m,d,f);break;default:m=U(Xe({width:c,height:l,cornerRadius:0}).path,d,f);break}return m}function G(e,t,n,r){if(!t||t===0)return e;let i=t*Math.PI/180,a=Math.cos(i),o=Math.sin(i),s=(e,t)=>{let i=e-n,s=t-r;return[n+i*a-s*o,r+i*o+s*a]},c=[],l=e.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi)||[];for(let e of l){let i=e[0].toUpperCase(),a=e.slice(1).trim().split(/[\s,]+/).map(Number).filter(e=>!isNaN(e));switch(i){case`M`:case`L`:for(let e=0;e<a.length;e+=2){let[t,n]=s(a[e],a[e+1]);c.push(`${e===0?i:`L`} ${t} ${n}`)}break;case`H`:{let[e,t]=s(a[0],r);c.push(`L ${e} ${t}`);break}case`V`:{let[e,t]=s(n,a[0]);c.push(`L ${e} ${t}`);break}case`C`:for(let e=0;e<a.length;e+=6){let[t,n]=s(a[e],a[e+1]),[r,i]=s(a[e+2],a[e+3]),[o,l]=s(a[e+4],a[e+5]);c.push(`C ${t} ${n} ${r} ${i} ${o} ${l}`)}break;case`Q`:for(let e=0;e<a.length;e+=4){let[t,n]=s(a[e],a[e+1]),[r,i]=s(a[e+2],a[e+3]);c.push(`Q ${t} ${n} ${r} ${i}`)}break;case`A`:for(let e=0;e<a.length;e+=7){let[n,r]=s(a[e+5],a[e+6]),i=(a[e+2]+t)%360;c.push(`A ${a[e]} ${a[e+1]} ${i} ${a[e+3]} ${a[e+4]} ${n} ${r}`)}break;case`Z`:c.push(`Z`);break;default:c.push(e)}}return c.join(` `)}function at(e,t,n){if(e.length<2)return`M 0 0 L ${t} 0 L ${t} ${n} L 0 ${n} Z`;let r=[],i=e[0];r.push(`M ${i.position[0]*t} ${i.position[1]*n}`);for(let i=0;i<e.length;i++){let a=e[i],o=e[(i+1)%e.length],s=a.outHandle,c=o.inHandle;if(s[0]===0&&s[1]===0&&c[0]===0&&c[1]===0)r.push(`L ${o.position[0]*t} ${o.position[1]*n}`);else{let e=(a.position[0]+s[0])*t,i=(a.position[1]+s[1])*n,l=(o.position[0]+c[0])*t,u=(o.position[1]+c[1])*n;r.push(`C ${e} ${i} ${l} ${u} ${o.position[0]*t} ${o.position[1]*n}`)}}return r.push(`Z`),r.join(` `)}function K(e,t){let n=e*t,r=Math.round(n);return Math.abs(n-r)<1e-6?(r+1e-4)/t:e}function ot(e,t,n,r,i,a=0,o=!1,s){let c=(n-a)*r*t/i;return K(o?Math.max(0,(s??e)-c-1)/t:e/t+c/t,t)}function st(e){return e.type===`video`||e.type===`audio`||e.type===`composition`}function ct(e){return e.sourceStart??e.trimStart??e.offset??0}function lt(e){return{from:e.from,durationInFrames:e.durationInFrames,...st(e)?{sourceStart:ct(e)}:{}}}function ut(e,t){return st(e)?t?.sourceStart??ct(e):0}function dt(e,t){if(!t)return e;let n=e.from===t.from&&e.durationInFrames===t.durationInFrames,r=ut(e,t),i=(st(e)?ct(e):void 0)===r;return n&&i?e:{...e,from:t.from,durationInFrames:t.durationInFrames,...st(e)?{sourceStart:r}:{}}}function ft(e,t){let n=Math.max(0,e.from-t.transitionStart),r=e.from+e.durationInFrames,i=Math.max(0,t.transitionEnd-r);return{from:e.from-n,durationInFrames:e.durationInFrames+n+i}}function pt(e,t,n){if(!st(e))return;let r=Math.max(0,e.from-t.from);if(r<=0)return ct(e);let i=ct(e),a=y(r,e.speed??1,n,e.sourceFps??n);return Math.max(0,i-a)}function mt(e,t,n,r){let i=ft(e,t),a=pt(e,i,n);return{from:i.from,durationInFrames:i.durationInFrames,...a===void 0?{}:{sourceStart:a},...r?{sourceTimeRamp:r}:{}}}function ht(e,t,n){if(e.type!==`video`||t.type!==`video`||!e.mediaId||e.mediaId!==t.mediaId||e.isReversed||t.isReversed)return!1;let r=e.sourceStart??e.trimStart??e.offset??0,i=t.sourceStart??t.trimStart??t.offset??0,a=e.speed??1,o=e.sourceFps??n,s=r+e.durationInFrames*a*o/n;return Math.abs(s-i)<.5}function q(e,t,n,r){if(!ht(e,t,r))return null;let i={slope:.5,rampStart:n.transitionStart,rampEnd:n.transitionEnd};return{left:{anchor:`start`,...i},right:{anchor:`end`,...i}}}function gt(e,t){if(t<e.rampStart||t>e.rampEnd)return 0;let n=e.anchor===`start`?t-e.rampStart:t-e.rampEnd;return e.slope*n}function _t(e,t){return t>=e.rampStart&&t<=e.rampEnd}function vt(e){return e<=0?0:e>=1?1:e}function J(e,t,n){return e+(t-e)*vt(n)}function yt(e){return e.type===`video`||e.type===`composition`}function bt(e,t,n){if(!yt(e)||e.durationInFrames<=0)return 1;if(t<e.from||t>=e.from+e.durationInFrames)return 0;let r=Math.min((e.fadeIn??0)*n,e.durationInFrames),i=Math.min((e.fadeOut??0)*n,e.durationInFrames),a=r>0,o=i>0;if(!a&&!o)return 1;let s=t-e.from,c=e.durationInFrames-i;if(a&&o){if(r>=c){let t=e.durationInFrames/2,n=Math.min(1,t/Math.max(r,1));return s<=t?J(0,n,s/Math.max(t,1)):J(n,0,(s-t)/Math.max(e.durationInFrames-t,1))}return s<r?J(0,1,s/Math.max(r,1)):s<c?1:J(1,0,(s-c)/Math.max(e.durationInFrames-c,1))}return a?s<r?J(0,1,s/Math.max(r,1)):1:s<c?1:J(1,0,(s-c)/Math.max(e.durationInFrames-c,1))}function xt(e,t){return e.type===`video`||e.type===`image`?{width:Math.max(1,e.sourceWidth??e.transform?.width??t.width),height:Math.max(1,e.sourceHeight??e.transform?.height??t.height)}:null}function St(e,t,n,r,i){let a=dt(e,i),o=Me(a,{canvas:{width:r.width,height:r.height,fps:r.fps},frame:n,keyframes:t}),s=bt(a,n,r.fps);return s>=1?o:{...o,opacity:o.opacity*s}}function Ct(e,t,n,r,i){let a=xt(e,r);if(!a)return e.crop;let o=dt(e,i);return w(o.crop,t,n-o.from,a)}function wt(e){let t=new Map;if(!e)return t;for(let n of e)t.set(n.itemId,n);return t}function Tt(e,t){return e instanceof Map?e.get(t):e(t)}function Et(e){return new Path2D(e)}function Dt(e,t,n){let r=f(e.cornerPin,t.width,t.height);if(!r||!s(r))return null;let i=Math.max(1,Math.round(t.width)),a=Math.max(1,Math.round(t.height)),o=new OffscreenCanvas(i,a),c=o.getContext(`2d`);if(!c)return null;let l=Et(W(e,{x:0,y:0,width:i,height:a,rotation:0,opacity:1},{canvasWidth:i,canvasHeight:a}));c.fillStyle=`white`,c.fill(l),(e.strokeWidth??0)>0&&(c.strokeStyle=`white`,c.lineWidth=e.strokeWidth??0,c.stroke(l));let u=new OffscreenCanvas(n.width,n.height),d=u.getContext(`2d`);if(!d)return null;let p=n.width/2+t.x-t.width/2,m=n.height/2+t.y-t.height/2,h=p+t.width/2,g=m+t.height/2;return d.save(),t.rotation!==0&&(d.translate(h,g),d.rotate(t.rotation*Math.PI/180),d.translate(-h,-g)),D(d,o,i,a,p,m,r),d.restore(),u}function Ot(e,t,n){let r=Dt(e,t,n);if(r){let t=e.maskType??`clip`,n=t===`alpha`?e.maskFeather??0:0;return{bitmapMask:r,inverted:e.maskInvert??!1,feather:n,maskType:t,trackOrder:0}}let i=W(e,{x:t.x,y:t.y,width:t.width,height:t.height,rotation:0,opacity:t.opacity},{canvasWidth:n.width,canvasHeight:n.height});if(t.rotation!==0){let e=n.width/2+t.x,r=n.height/2+t.y;i=G(i,t.rotation,e,r)}let a=e.maskType??`clip`,o=a===`alpha`?e.maskFeather??0:0;return{path:Et(i),inverted:e.maskInvert??!1,feather:o,maskType:a,trackOrder:0}}function kt(e){let t=[];for(let n of e)if(n.visible!==!1)for(let e of n.items)e.type===`shape`&&e.isMask&&t.push({mask:e,trackOrder:n.order??0,startFrame:e.from,endFrame:e.from+e.durationInFrames});return t}function At(e,t,n,r){if(n){let n=new Path2D;n.rect(0,0,r.width,r.height),n.addPath(t),e.clip(n,`evenodd`)}else e.clip(t)}function jt(e,t,n,r,i,a){let o=new OffscreenCanvas(a.width,a.height),s=o.getContext(`2d`);r?(s.fillStyle=`white`,s.fillRect(0,0,a.width,a.height),s.globalCompositeOperation=`destination-out`,s.fill(n),s.globalCompositeOperation=`source-over`):(s.fillStyle=`white`,s.fill(n));let c=o;if(i>0){let e=new OffscreenCanvas(a.width,a.height),t=e.getContext(`2d`);t.filter=`blur(${i}px)`,t.drawImage(o,0,0),c=e}e.drawImage(t,0,0),e.globalCompositeOperation=`destination-in`,e.drawImage(c,0,0),e.globalCompositeOperation=`source-over`}function Mt(e,t,n,r,i,a){let o=n;if(r||i>0){let e=new OffscreenCanvas(a.width,a.height),t=e.getContext(`2d`);r?(t.fillStyle=`white`,t.fillRect(0,0,a.width,a.height),t.globalCompositeOperation=`destination-out`,t.drawImage(n,0,0),t.globalCompositeOperation=`source-over`):t.drawImage(n,0,0),o=e}if(i>0){let e=new OffscreenCanvas(a.width,a.height),t=e.getContext(`2d`);t.filter=`blur(${i}px)`,t.drawImage(o,0,0),o=e}e.drawImage(t,0,0),e.globalCompositeOperation=`destination-in`,e.drawImage(o,0,0),e.globalCompositeOperation=`source-over`}function Nt(e,t,n,r){if(n.length===0){e.drawImage(t,0,0);return}if(!n.some(e=>e.bitmapMask||e.maskType===`alpha`||e.feather>0)){e.save();for(let t of n)t.path&&At(e,t.path,t.inverted,r);e.drawImage(t,0,0),e.restore();return}let i=t;for(let e of n){let t=new OffscreenCanvas(r.width,r.height),n=t.getContext(`2d`);e.bitmapMask?Mt(n,i,e.bitmapMask,e.inverted,e.feather,r):e.maskType===`clip`&&e.feather===0&&e.path?(n.save(),At(n,e.path,e.inverted,r),n.drawImage(i,0,0),n.restore()):e.path&&jt(n,i,e.path,e.inverted,e.feather,r),i=t}e.drawImage(i,0,0)}function Pt(e,t){let n=kt(e),r=[];for(let{mask:e,trackOrder:t}of n)r.push({mask:e,trackOrder:t,startFrame:e.from,endFrame:e.from+e.durationInFrames});return{masks:r}}function Ft(e,t,n,r,i,a,o){let s=[],c=Ne(e.masks.map(({mask:e,trackOrder:t})=>({mask:o?.(e.id)??e,trackOrder:t})),{canvas:n,frame:t,getKeyframes:e=>Tt(r,e),getPreviewTransform:i,getPreviewPathVertices:a});for(let e of c)s.push({...Ot(e.shape,e.transform,n),trackOrder:e.trackOrder});return s}const It=t(`CanvasEffects`);async function Lt(e,t,n,r,i,a,o){let s=[],c=t;if(r.length>0){let{canvas:n,ctx:i}=e.acquire();Nt(i,t,r,a),c=n,s.push(n)}if(n.length===0)return{source:c,poolCanvases:s};let{canvas:l,ctx:u}=e.acquire(),d=await Ut(u,c,n,i,a,o);return s.push(l),{source:d??l,poolCanvases:s}}function Rt(e){return e.filter(e=>e.enabled&&e.effect.type===`gpu-effect`).map(e=>{let t=e.effect;return{id:e.id,type:t.gpuEffectType,name:t.gpuEffectType,enabled:!0,params:{...t.params}}})}function zt(e,t,n,r){if(n.length===0)return null;try{let i=r.applyEffectsToCanvas(e.canvas,n);if(i)return r.isBatching()?i:(e.clearRect(0,0,t.width,t.height),e.drawImage(i,0,0),null)}catch(e){It.warn(`GPU effects zero-copy path failed, skipping`,e)}return null}function Bt(e,t,n,r,i,a){return t.length===0?[]:t.map(({layer:e,trackOrder:t})=>{let n=i?.(e.id);return{layer:n?.type===`adjustment`?n:e,trackOrder:t}}).filter(({layer:t,trackOrder:r})=>e<=r?!1:n>=t.from&&n<t.from+t.durationInFrames).sort((e,t)=>e.trackOrder-t.trackOrder).flatMap(({layer:e})=>u(r?.(e.id)??e.effects,a?.(e.id),n-e.from)?.filter(e=>e.enabled)??[])}function Vt(e,t){let n=[...t];return e&&n.push(...e.filter(e=>e.enabled)),n}function Ht(e,t,n,r,i,a){if(n.length===0)return e.drawImage(t,0,0),null;e.drawImage(t,0,0);let o=Rt(n);if(o.length>0&&a){let t=zt(e,i,o,a);if(t)return t}return null}async function Ut(e,t,n,r,i,a){return Ht(e,t,n,r,i,a)}const Wt=`
${o}

const PI: f32 = 3.14159265359;
const TAU: f32 = 6.28318530718;

fn hash(p: vec2f) -> f32 {
  let p2 = vec2f(dot(p, vec2f(127.1, 311.7)), dot(p, vec2f(269.5, 183.3)));
  return fract(sin(dot(p2, vec2f(12.9898, 78.233))) * 43758.5453);
}

fn noise2d(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2f(0.0, 0.0)), hash(i + vec2f(1.0, 0.0)), u.x),
    mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), u.x),
    u.y
  );
}

fn fbm(p: vec2f) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var pos = p;
  for (var i = 0; i < 5; i++) {
    value += amplitude * noise2d(pos);
    pos *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
`,Gt=`
fn scaleUv(uv: vec2f, scale: f32) -> vec2f {
  let safeScale = max(scale, 0.001);
  return ((uv - vec2f(0.5, 0.5)) / safeScale) + vec2f(0.5, 0.5);
}
`,Kt=t(`TransitionPipeline`);var qt=class e{device;format;sampler;pipelines=new Map;uniformBuffers=new Map;cachedBindGroups=new Map;leftTexture=null;rightTexture=null;leftView=null;rightView=null;outputCanvas=null;outputCtx=null;texW=0;texH=0;initialized=!1;constructor(e){this.device=e,this.format=`rgba8unorm`,this.sampler=e.createSampler({magFilter:`linear`,minFilter:`linear`})}static create(t){let n=t;if(!n)return null;try{let t=new e(n);return t.init(),t}catch{return null}}init(){if(!this.initialized){for(let[e,t]of yn)this.createTransitionPipeline(e,t);this.initialized=!0}}createTransitionPipeline(e,t){try{let n=`${Wt}\n${t.shader}`,r=this.device.createShaderModule({label:`transition-${e}`,code:n});r.getCompilationInfo().then(t=>{for(let n of t.messages)n.type===`error`&&Kt.error(`Shader "${e}" error at line ${n.lineNum}:${n.linePos}: ${n.message}`)}).catch(()=>{});let i=[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{}}];t.uniformSize>0&&i.push({binding:3,visibility:GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}});let a=this.device.createBindGroupLayout({label:`transition-${e}-layout`,entries:i}),o=this.device.createRenderPipeline({label:`transition-${e}-pipeline`,layout:this.device.createPipelineLayout({bindGroupLayouts:[a]}),vertex:{module:r,entryPoint:`vertexMain`},fragment:{module:r,entryPoint:t.entryPoint,targets:[{format:this.format}]},primitive:{topology:`triangle-list`}});this.pipelines.set(e,{pipeline:o,bindGroupLayout:a})}catch(t){Kt.warn(`Failed to create pipeline for "${e}"`,t)}}ensureTextures(e,t){if(this.leftTexture&&this.texW===e&&this.texH===t)return;this.leftTexture?.destroy(),this.rightTexture?.destroy();let n={size:{width:e,height:t},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT};this.leftTexture=this.device.createTexture(n),this.rightTexture=this.device.createTexture(n),this.leftView=this.leftTexture.createView(),this.rightView=this.rightTexture.createView(),this.cachedBindGroups.clear(),this.texW=e,this.texH=t}getOrCreateUniformBuffer(e,t){let n=this.uniformBuffers.get(e);return n&&n.size>=t?n:(n?.destroy(),n=this.device.createBuffer({size:t,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.uniformBuffers.set(e,n),n)}writeUniforms(e,t,n,r,i,a,o){if(t.uniformSize<=0)return null;let s=t.packUniforms(n,r,i,Jt(a),o);if(s.byteLength>t.uniformSize)return Kt.warn(`Uniform data for "${e}" is ${s.byteLength} bytes, exceeding declared size ${t.uniformSize}`),null;let c=this.getOrCreateUniformBuffer(e,t.uniformSize);return this.device.queue.writeBuffer(c,0,s.buffer,s.byteOffset,s.byteLength),c}getOrCreateBindGroup(e,t,n,r){if(n.uniformSize>0&&!r)return this.cachedBindGroups.delete(e),null;let i=this.cachedBindGroups.get(e);return i||(!this.leftView||!this.rightView?null:(i=this.createBindGroup(t,this.leftView,this.rightView,r),this.cachedBindGroups.set(e,i),i))}createBindGroup(e,t,n,r){let i=[{binding:0,resource:this.sampler},{binding:1,resource:t},{binding:2,resource:n}];return r&&i.push({binding:3,resource:{buffer:r}}),this.device.createBindGroup({layout:e,entries:i})}uploadInputs(e,t,n,r){return this.ensureTextures(n,r),!this.leftTexture||!this.rightTexture?!1:(this.device.queue.copyExternalImageToTexture({source:e,flipY:!1},{texture:this.leftTexture,premultipliedAlpha:!0},{width:n,height:r}),this.device.queue.copyExternalImageToTexture({source:t,flipY:!1},{texture:this.rightTexture,premultipliedAlpha:!0},{width:n,height:r}),!0)}renderUploadedInputsToView(e,t,n,r,i,a,o){let s=this.pipelines.get(e),c=bn(e);if(!s||!c)return!1;let l=this.writeUniforms(e,c,t,n,r,a,o),u=this.getOrCreateBindGroup(e,s.bindGroupLayout,c,l);if(!u)return!1;let d=this.device.createCommandEncoder(),f=d.beginRenderPass({colorAttachments:[{view:i,loadOp:`clear`,storeOp:`store`}]});return f.setPipeline(s.pipeline),f.setBindGroup(0,u),f.draw(6),f.end(),this.device.queue.submit([d.finish()]),!0}render(e,t,n,r,i,a,o,s){if(!this.pipelines.has(e)||!bn(e)||i<2||a<2||!this.uploadInputs(t,n,i,a))return null;if(!this.outputCanvas||this.outputCanvas.width!==i||this.outputCanvas.height!==a){this.outputCanvas=new OffscreenCanvas(i,a);let e=this.outputCanvas.getContext(`webgpu`);if(!e)return null;e.configure({device:this.device,format:this.format,alphaMode:`premultiplied`}),this.outputCtx=e}return!this.outputCtx||!this.renderUploadedInputsToView(e,r,i,a,this.outputCtx.getCurrentTexture().createView(),o,s)?null:this.outputCanvas}renderToTexture(e,t,n,r,i,a,o,s,c){return!this.pipelines.has(e)||!bn(e)||a<2||o<2||r.width!==a||r.height!==o||!this.uploadInputs(t,n,a,o)?!1:this.renderUploadedInputsToView(e,i,a,o,r.createView(),s,c)}renderTexturesToTexture(e,t,n,r,i,a,o,s,c){let l=this.pipelines.get(e),u=bn(e);if(!l||!u||a<2||o<2||t.width!==a||t.height!==o||n.width!==a||n.height!==o||r.width!==a||r.height!==o)return!1;let d=this.writeUniforms(e,u,i,a,o,s,c);if(u.uniformSize>0&&!d)return!1;let f=this.createBindGroup(l.bindGroupLayout,t.createView(),n.createView(),d),p=this.device.createCommandEncoder(),m=p.beginRenderPass({colorAttachments:[{view:r.createView(),loadOp:`clear`,storeOp:`store`}]});return m.setPipeline(l.pipeline),m.setBindGroup(0,f),m.draw(6),m.end(),this.device.queue.submit([p.finish()]),!0}has(e){return this.pipelines.has(e)}destroy(){this.leftTexture?.destroy(),this.rightTexture?.destroy(),this.leftTexture=null,this.rightTexture=null,this.leftView=null,this.rightView=null,this.outputCanvas=null,this.outputCtx=null;for(let e of this.uniformBuffers.values())e.destroy();this.uniformBuffers.clear(),this.cachedBindGroups.clear(),this.pipelines.clear(),this.initialized=!1}};function Jt(e){switch(e){case`from-left`:return 0;case`from-right`:return 1;case`from-top`:return 2;case`from-bottom`:return 3;default:return 0}}const Yt={id:`dissolve`,name:`Cross Dissolve`,category:`dissolve`,hasDirection:!1,entryPoint:`dissolveFragment`,uniformSize:16,shader:`
struct DissolveParams {
  progress: f32,
  width: f32,
  height: f32,
  _pad: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: DissolveParams;

@fragment
fn dissolveFragment(input: VertexOutput) -> @location(0) vec4f {
  let left = textureSample(leftTex, texSampler, input.uv);
  let right = textureSample(rightTex, texSampler, input.uv);
  let t = 0.5 - 0.5 * cos(clamp(params.progress, 0.0, 1.0) * PI);
  return mix(left, right, t);
}`,packUniforms:(e,t,n)=>new Float32Array([e,t,n,0])},Xt=`
@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
`,Zt=`
fn sampleSoft(tex: texture_2d<f32>, uv: vec2f, radius: vec2f) -> vec4f {
  let center = textureSample(tex, texSampler, uv);
  let a = textureSample(tex, texSampler, clamp(uv + vec2f(radius.x, 0.0), vec2f(0.0), vec2f(1.0)));
  let b = textureSample(tex, texSampler, clamp(uv - vec2f(radius.x, 0.0), vec2f(0.0), vec2f(1.0)));
  let c = textureSample(tex, texSampler, clamp(uv + vec2f(0.0, radius.y), vec2f(0.0), vec2f(1.0)));
  let d = textureSample(tex, texSampler, clamp(uv - vec2f(0.0, radius.y), vec2f(0.0), vec2f(1.0)));
  return center * 0.36 + (a + b + c + d) * 0.16;
}
`,Qt={id:`additiveDissolve`,name:`Additive Dissolve`,category:`dissolve`,hasDirection:!1,entryPoint:`additiveDissolveFragment`,uniformSize:16,shader:`
struct AdditiveDissolveParams {
  progress: f32,
  width: f32,
  height: f32,
  _pad: f32,
};

${Xt}
@group(0) @binding(3) var<uniform> params: AdditiveDissolveParams;

@fragment
fn additiveDissolveFragment(input: VertexOutput) -> @location(0) vec4f {
  let p = clamp(params.progress, 0.0, 1.0);
  let left = textureSample(leftTex, texSampler, input.uv);
  let right = textureSample(rightTex, texSampler, input.uv);
  let base = left.rgb * (1.0 - p) + right.rgb * p;
  let flash = (left.rgb + right.rgb) * sin(p * PI) * 0.22;
  return vec4f(clamp(base + flash, vec3f(0.0), vec3f(1.0)), mix(left.a, right.a, p));
}`,packUniforms:(e,t,n)=>new Float32Array([e,t,n,0])},$t={id:`blurDissolve`,name:`Blur Dissolve`,category:`dissolve`,hasDirection:!1,entryPoint:`blurDissolveFragment`,uniformSize:16,shader:`
struct BlurDissolveParams {
  progress: f32,
  width: f32,
  height: f32,
  strength: f32,
};

${Xt}
@group(0) @binding(3) var<uniform> params: BlurDissolveParams;
${Zt}

@fragment
fn blurDissolveFragment(input: VertexOutput) -> @location(0) vec4f {
  let p = clamp(params.progress, 0.0, 1.0);
  let envelope = sin(p * PI);
  let radius = vec2f(1.0 / params.width, 1.0 / params.height) * params.strength * envelope;
  let left = sampleSoft(leftTex, input.uv, radius);
  let right = sampleSoft(rightTex, input.uv, radius);
  let t = 0.5 - 0.5 * cos(p * PI);
  return mix(left, right, t);
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.strength??9;return new Float32Array([e,t,n,a])}},en={id:`dipToColorDissolve`,name:`Dip To Color Dissolve`,category:`dissolve`,hasDirection:!1,entryPoint:`dipToColorDissolveFragment`,uniformSize:32,shader:`
struct DipToColorDissolveParams {
  progress: f32,
  width: f32,
  height: f32,
  colorR: f32,
  colorG: f32,
  colorB: f32,
  _pad1: f32,
  _pad2: f32,
};

${Xt}
@group(0) @binding(3) var<uniform> params: DipToColorDissolveParams;

@fragment
fn dipToColorDissolveFragment(input: VertexOutput) -> @location(0) vec4f {
  let p = clamp(params.progress, 0.0, 1.0);
  let left = textureSample(leftTex, texSampler, input.uv);
  let right = textureSample(rightTex, texSampler, input.uv);
  let color = vec4f(params.colorR, params.colorG, params.colorB, 1.0);
  let firstHalf = mix(left, color, smoothstep(0.0, 0.5, p));
  let secondHalf = mix(color, right, smoothstep(0.5, 1.0, p));
  return select(secondHalf, firstHalf, p < 0.5);
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.color,o=Array.isArray(a)?a:[0,0,0];return new Float32Array([e,t,n,o[0]??0,o[1]??0,o[2]??0,0,0])}},tn={id:`nonAdditiveDissolve`,name:`Non-Additive Dissolve`,category:`dissolve`,hasDirection:!1,entryPoint:`nonAdditiveDissolveFragment`,uniformSize:16,shader:`
struct NonAdditiveDissolveParams {
  progress: f32,
  width: f32,
  height: f32,
  _pad: f32,
};

${Xt}
@group(0) @binding(3) var<uniform> params: NonAdditiveDissolveParams;

@fragment
fn nonAdditiveDissolveFragment(input: VertexOutput) -> @location(0) vec4f {
  let p = clamp(params.progress, 0.0, 1.0);
  let left = textureSample(leftTex, texSampler, input.uv);
  let right = textureSample(rightTex, texSampler, input.uv);
  let neutral = mix(left.rgb, right.rgb, p);
  let luma = dot(neutral, vec3f(0.2126, 0.7152, 0.0722));
  let guarded = mix(neutral, min(neutral, vec3f(luma + 0.18)), sin(p * PI) * 0.18);
  return vec4f(clamp(guarded, vec3f(0.0), vec3f(1.0)), mix(left.a, right.a, p));
}`,packUniforms:(e,t,n)=>new Float32Array([e,t,n,0])},nn={id:`smoothCut`,name:`Smooth Cut`,category:`dissolve`,hasDirection:!1,entryPoint:`smoothCutFragment`,uniformSize:16,shader:`
struct SmoothCutParams {
  progress: f32,
  width: f32,
  height: f32,
  strength: f32,
};

${Xt}
@group(0) @binding(3) var<uniform> params: SmoothCutParams;
${Zt}

fn smoothCutWarp(uv: vec2f, p: f32, envelope: f32, strength: f32) -> vec2f {
  let low = fbm(uv * vec2f(2.4, 1.8) + vec2f(p * 1.15, -p * 0.8));
  let mid = fbm(uv * vec2f(6.2, 4.8) + vec2f(-p * 1.65, p * 1.25));
  let horizontalBands =
    sin((uv.x * 4.6 + low * 1.8 + p * 1.25) * TAU) * 0.62 +
    sin((uv.x * 8.2 + uv.y * 0.22 + mid * 1.1 - p * 0.9) * TAU) * 0.28 +
    (low - 0.5) * 0.48 +
    (mid - 0.5) * 0.22;
  let horizontalWarp = horizontalBands;
  let verticalWarp = (mid - 0.5) * 0.14;
  let edgeFade = smoothstep(0.03, 0.18, uv.x) * smoothstep(0.97, 0.82, uv.x)
    * smoothstep(0.03, 0.18, uv.y) * smoothstep(0.97, 0.82, uv.y);
  return vec2f(horizontalWarp, verticalWarp) * envelope * strength * 0.052 * edgeFade;
}

@fragment
fn smoothCutFragment(input: VertexOutput) -> @location(0) vec4f {
  let p = clamp(params.progress, 0.0, 1.0);
  let strength = clamp(params.strength, 0.0, 2.0);
  let envelope = sin(p * PI);
  let warp = smoothCutWarp(input.uv, p, envelope, strength);
  let drift = vec2f((p - 0.5) * 0.018 * envelope * strength, 0.0);
  let radius = vec2f(1.0 / params.width, 1.0 / params.height) * envelope * strength * 2.4;
  let leftWarped = sampleSoft(leftTex, clamp(input.uv + warp - drift, vec2f(0.0), vec2f(1.0)), radius);
  let rightWarped = sampleSoft(rightTex, clamp(input.uv - warp + drift, vec2f(0.0), vec2f(1.0)), radius);
  let leftClean = textureSample(leftTex, texSampler, input.uv);
  let rightClean = textureSample(rightTex, texSampler, input.uv);
  let warpMix = smoothstep(0.12, 0.85, envelope);
  let left = mix(leftClean, leftWarped, warpMix);
  let right = mix(rightClean, rightWarped, warpMix);
  let blendWidth = mix(0.18, 0.36, strength);
  let t = smoothstep(0.5 - blendWidth, 0.5 + blendWidth, p);
  return mix(left, right, t);
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.strength??.9;return new Float32Array([e,t,n,a])}},rn={id:`sparkles`,name:`Sparkles`,category:`custom`,hasDirection:!1,entryPoint:`sparklesFragment`,uniformSize:32,shader:`
struct SparklesParams {
  progress: f32,
  width: f32,
  height: f32,
  sparkleScale: f32,
  intensity: f32,
  density: f32,
  glow: f32,
  _pad: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: SparklesParams;

fn rotateVec2(v: vec2f, angle: f32) -> vec2f {
  let c = cos(angle);
  let s = sin(angle);
  return vec2f(
    (v.x * c) - (v.y * s),
    (v.x * s) + (v.y * c)
  );
}

fn sparkleShape(local: vec2f, size: f32) -> f32 {
  let absLocal = abs(local);
  let core = smoothstep(size * 0.34, 0.0, length(local));
  let horizontal = smoothstep(size * 0.14, 0.0, absLocal.y)
    * smoothstep(size, 0.0, absLocal.x);
  let vertical = smoothstep(size * 0.14, 0.0, absLocal.x)
    * smoothstep(size, 0.0, absLocal.y);
  let diagonalA = smoothstep(size * 0.22, 0.0, abs(local.x - local.y))
    * smoothstep(size * 0.9, 0.0, length(local));
  let diagonalB = smoothstep(size * 0.22, 0.0, abs(local.x + local.y))
    * smoothstep(size * 0.9, 0.0, length(local));
  return max(core, max(horizontal, max(vertical, max(diagonalA, diagonalB) * 0.7)));
}

fn sparkleLayer(
  scaledUv: vec2f,
  progress: f32,
  density: f32,
  sizeBase: f32,
  sizeVariance: f32,
  motionScale: f32,
  threshold: f32,
  phase: f32,
) -> vec4f {
  let cellUv = scaledUv * density;
  let cell = floor(cellUv);
  let local = fract(cellUv) - vec2f(0.5, 0.5);
  let seed = hash(cell + vec2f(phase * 1.37, phase * 2.11));
  let centerSeed = vec2f(
    hash(cell + vec2f(phase + 1.7, phase + 6.2)),
    hash(cell + vec2f(phase + 8.4, phase + 3.1))
  ) - vec2f(0.5, 0.5);
  let sizeSeed = hash(cell + vec2f(phase + 2.4, phase + 9.7));
  let orbitSeed = hash(cell + vec2f(phase + 4.6, phase + 11.2));
  let ignitePoint = clamp(
    0.04
      + (seed * 0.72)
      + (noise2d((cell * 0.17) + vec2f(phase * 0.31, phase * 0.67)) * 0.16),
    0.04,
    0.94
  );
  let igniteDuration = 0.14 + (sizeSeed * 0.18);
  let igniteProgress = clamp((progress - ignitePoint) / igniteDuration, 0.0, 1.0);
  let igniteIn = smoothstep(0.0, 0.16, igniteProgress);
  let igniteOut = 1.0 - smoothstep(0.3, 0.95, igniteProgress);
  let pulse = igniteIn * igniteOut;
  let afterglow = smoothstep(0.06, 0.72, igniteProgress);

  let directionAngle = seed * TAU;
  let direction = vec2f(cos(directionAngle), sin(directionAngle));
  let motionEnvelope = pulse * (0.6 + (0.4 * sin(progress * PI)));
  let drift = direction
    * motionScale
    * (0.42 + (sizeSeed * 1.45))
    * motionEnvelope;
  let orbit = rotateVec2(
    vec2f(0.0, 1.0),
    directionAngle + (igniteProgress * (1.5 + (orbitSeed * 2.6)) * PI)
  ) * motionScale * 0.62 * (0.28 + orbitSeed) * motionEnvelope;

  let center = (centerSeed * 0.72) + drift + orbit;
  let rotation = (seed * TAU) + (igniteProgress * (1.2 + (sizeSeed * 3.1)) * PI);
  let size = sizeBase + (sizeSeed * sizeVariance);
  let twinkle = 0.35 + (0.65 * ((sin((igniteProgress * (2.8 + (sizeSeed * 4.5)) + seed) * TAU) + 1.0) * 0.5));
  let activation = smoothstep(threshold, 1.0, seed);

  let starLocal = rotateVec2(local - center, rotation);
  let main = sparkleShape(starLocal, size) * activation * twinkle * pulse;

  let trailCenter = center - (
    direction
    * motionScale
    * (0.6 + sizeSeed)
    * (0.25 + (pulse * 0.95))
  );
  let trailLocal = rotateVec2(local - trailCenter, rotation - 0.4);
  let trailShape = vec2f(trailLocal.x * 1.7, trailLocal.y * 0.58);
  let trail = sparkleShape(trailShape, size * 0.72)
    * activation
    * twinkle
    * pulse
    * (0.42 + (sizeSeed * 0.28));

  let dustNoise = noise2d((cell * 0.85) + vec2f((igniteProgress * 4.2) + phase, phase * 0.37));
  let dust = smoothstep(0.62, 1.0, dustNoise)
    * afterglow
    * activation
    * (0.16 + (sizeSeed * 0.34));
  let reveal = clamp(
    (main * 0.72)
      + (trail * 0.34)
      + (afterglow * activation * 0.24)
      + (dust * 0.12),
    0.0,
    1.0
  );
  let glow = max(main, trail * 0.88) * (0.65 + (sizeSeed * 0.75)) + (dust * 0.3);

  return vec4f(main, reveal, glow, seed);
}

@fragment
fn sparklesFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = params.progress;
  let aspect = params.width / max(params.height, 1.0);
  let scaledUv = vec2f(uv.x * aspect, uv.y);

  let left = textureSample(leftTex, texSampler, uv);
  let right = textureSample(rightTex, texSampler, uv);

  let coarseLayer = sparkleLayer(
    scaledUv,
    p,
    5.5 + (params.density * 5.0),
    0.15 * params.sparkleScale,
    0.28 * params.sparkleScale,
    0.18,
    0.58,
    3.7
  );
  let microLayer = sparkleLayer(
    scaledUv,
    p,
    10.0 + (params.density * 9.0),
    0.06 * params.sparkleScale,
    0.14 * params.sparkleScale,
    0.09,
    0.7,
    11.4
  );

  let heroMix = step(microLayer.z, coarseLayer.z);
  let heroSeed = mix(microLayer.w, coarseLayer.w, heroMix);
  let sparkleCore = max(coarseLayer.x, microLayer.x * 0.78);
  let sparkleField = max(coarseLayer.y, microLayer.y * 0.86);
  let glowField = max(coarseLayer.z, microLayer.z * 0.74);
  let macroNoise = fbm((scaledUv * (2.6 + (params.density * 0.9))) + vec2f(0.0, p * 0.7));
  let dustNoise = noise2d(
    (scaledUv * (13.0 + (params.density * 7.0)))
      + vec2f((p * 5.2) + (heroSeed * 3.1), heroSeed * 7.4)
  );
  let dissolveCurve = smoothstep(0.03, 0.97, p);
  let sparkleWindow = smoothstep(0.02, 0.28, p) * (1.0 - smoothstep(0.8, 1.0, p));
  let dustField = smoothstep(0.58, 1.0, dustNoise)
    * (0.12 + (sparkleField * 0.88))
    * sin(p * PI);
  let thresholdMap = clamp(
    (macroNoise * 0.58)
      + (dustNoise * 0.14)
      + ((1.0 - sparkleField) * 0.18)
      + ((1.0 - glowField) * 0.08),
    0.0,
    1.0
  );
  let dissolveProgress = clamp(
    (dissolveCurve * 1.08) - 0.04
      + (sparkleField * (0.28 + (params.intensity * 0.12)) * sparkleWindow)
      + (glowField * (0.1 + (params.glow * 0.08)))
      + (dustField * 0.12),
    0.0,
    1.0
  );
  let edge = 0.075 + (0.018 * params.sparkleScale);
  let leftPresence = 1.0 - smoothstep(thresholdMap - edge, thresholdMap + edge, dissolveProgress);
  let rightPresence = 1.0 - leftPresence;

  var color = mix(right, left, leftPresence);
  let dissolveEdge = clamp(leftPresence * rightPresence * 4.0, 0.0, 1.0);
  let sparkleEnvelope = sin(p * PI);
  let edgeGlow = dissolveEdge
    * glowField
    * params.intensity
    * params.glow
    * (0.5 + (sparkleEnvelope * 0.4));
  let sparkleFlash = sparkleCore
    * (0.38 + (params.intensity * 0.52))
    * (0.62 + (sparkleEnvelope * 0.38));
  let glowColor = mix(vec3f(1.0, 0.97, 0.88), vec3f(1.0, 0.82, 0.56), heroSeed);
  let warmVeil = glowColor * glowField * params.glow * (0.06 + (rightPresence * 0.12));
  let incomingLift = right.rgb * (glowField * rightPresence * 0.05 * params.glow);
  let lifted = color.rgb
    + warmVeil
    + incomingLift
    + (glowColor * edgeGlow * 0.95)
    + (glowColor * sparkleFlash * 0.72);
  let compressed = 1.0 - exp(-lifted * (1.0 + (edgeGlow * 0.45)));

  return vec4f(
    clamp(mix(lifted, compressed, 0.46), vec3f(0.0), vec3f(1.0)),
    color.a
  );
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.sparkleScale??1,o=i?.intensity??1,s=i?.density??1,c=i?.glow??1;return new Float32Array([e,t,n,a,o,s,c,0])}},an={id:`glitch`,name:`Glitch`,category:`custom`,hasDirection:!1,entryPoint:`glitchFragment`,uniformSize:32,shader:`
struct GlitchParams {
  progress: f32,
  width: f32,
  height: f32,
  intensity: f32,
  blockSize: f32,
  rgbSplit: f32,
  _pad1: f32,
  _pad2: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: GlitchParams;

@fragment
fn glitchFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = params.progress;

  // Intensity envelope — ramps up, holds, eases out
  let envelope = smoothstep(0.0, 0.2, p) * (1.0 - smoothstep(0.8, 1.0, p));
  let strength = envelope * params.intensity;

  // --- Block displacement (two scales) ---
  let bigBlockH = params.blockSize * 2.0 / params.height;
  let bigBlockY = floor(uv.y / bigBlockH);
  let bigSeed = hash(vec2f(bigBlockY * 17.3, floor(p * 8.0)));
  let bigActive = step(0.55 - strength * 0.35, bigSeed);
  let bigShift = (hash(vec2f(bigBlockY * 31.7, floor(p * 10.0))) - 0.5)
                 * strength * 0.18 * bigActive;

  let sliceH = max(2.0, params.blockSize * 0.3) / params.height;
  let sliceY = floor(uv.y / sliceH);
  let sliceSeed = hash(vec2f(sliceY * 53.1, floor(p * 12.0)));
  let sliceActive = step(0.65 - strength * 0.25, sliceSeed);
  let sliceShift = (hash(vec2f(sliceY * 71.3, floor(p * 14.0))) - 0.5)
                   * strength * 0.1 * sliceActive;

  let totalShift = bigShift + sliceShift;
  let dUv = vec2f(clamp(uv.x + totalShift, 0.0, 1.0), uv.y);

  // --- RGB split (horizontal chromatic aberration) ---
  let split = params.rgbSplit * strength * 0.015 + abs(totalShift) * 0.2;
  let uvR = vec2f(clamp(dUv.x + split, 0.0, 1.0), dUv.y);
  let uvB = vec2f(clamp(dUv.x - split, 0.0, 1.0), dUv.y);

  // --- Per-block clip switching ---
  let switchBlockH = bigBlockH * 0.7;
  let switchY = floor(uv.y / switchBlockH);
  let switchSeed = hash(vec2f(switchY * 7.3, floor(p * 6.0)));
  let threshold = switchSeed * 0.7 + 0.15;
  let useRight = smoothstep(threshold - 0.12, threshold + 0.12, p);

  // Sample both clips with chromatic aberration
  let lR = textureSample(leftTex, texSampler, uvR).r;
  let lG = textureSample(leftTex, texSampler, dUv).g;
  let lB = textureSample(leftTex, texSampler, uvB).b;
  let lA = textureSample(leftTex, texSampler, dUv).a;
  let leftColor = vec4f(lR, lG, lB, lA);

  let rR = textureSample(rightTex, texSampler, uvR).r;
  let rG = textureSample(rightTex, texSampler, dUv).g;
  let rB = textureSample(rightTex, texSampler, uvB).b;
  let rA = textureSample(rightTex, texSampler, dUv).a;
  let rightColor = vec4f(rR, rG, rB, rA);

  // Detect truly empty samples using the alpha channel; fall back to
  // luminance only when alpha is not a reliable signal.
  let leftEmpty  = leftColor.a  < 0.01;
  let rightEmpty = rightColor.a < 0.01;
  let safeLeft  = select(leftColor,  rightColor, leftEmpty  && !rightEmpty);
  let safeRight = select(rightColor, leftColor,  rightEmpty && !leftEmpty);

  var color = mix(safeLeft, safeRight, useRight);

  // --- Digital noise on glitched regions ---
  let noiseSeed = hash(vec2f(uv.x * params.width * 0.5,
                              uv.y * params.height * 0.5 + p * 1000.0));
  let noiseAmt = strength * 0.1 * max(bigActive, sliceActive);
  color = vec4f(mix(color.rgb, vec3f(noiseSeed), noiseAmt), color.a);

  // --- Subtle posterization on displaced blocks ---
  let levels = mix(256.0, 24.0, strength * bigActive * 0.4);
  color = vec4f(floor(color.rgb * levels + 0.5) / levels, color.a);

  return color;
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.intensity??1,o=i?.blockSize??30,s=i?.rgbSplit??1;return new Float32Array([e,t,n,a,o,s,0,0])}},on={id:`pixelate`,name:`Pixelate`,category:`custom`,hasDirection:!1,entryPoint:`pixelateFragment`,uniformSize:32,shader:`
struct PixelateParams {
  progress: f32,
  // Pre-computed on CPU: block size in UV space (1/width * blockPx, 1/height * blockPx)
  blockU: f32,
  blockV: f32,
  crossfade: f32,
  _pad1: f32,
  _pad2: f32,
  _pad3: f32,
  _pad4: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: PixelateParams;

@fragment
fn pixelateFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;

  // Snap UV to block grid center (block size pre-computed on CPU)
  let snappedUv = clamp(
    floor(uv / vec2f(params.blockU, params.blockV)) * vec2f(params.blockU, params.blockV)
      + vec2f(params.blockU, params.blockV) * 0.5,
    vec2f(0.0),
    vec2f(1.0)
  );

  // Sample both clips at the pixelated UV — only 2 texture reads
  let left = textureSample(leftTex, texSampler, snappedUv);
  let right = textureSample(rightTex, texSampler, snappedUv);

  return mix(left, right, params.crossfade);
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.maxBlockSize??48,o=1-Math.abs(e*2-1),s=o*o,c=Math.max(1,s*a),l=c/t,u=c/n,d=Math.max(0,Math.min(1,(e-.45)/.1)),f=d*d*(3-2*d);return new Float32Array([e,l,u,f,0,0,0,0])}},sn={id:`chromatic`,name:`Chromatic`,category:`custom`,hasDirection:!0,directions:[`from-left`,`from-right`,`from-top`,`from-bottom`],entryPoint:`chromaticFragment`,uniformSize:32,shader:`
struct ChromaticParams {
  progress: f32,
  width: f32,
  height: f32,
  direction: f32,
  spread: f32,
  intensity: f32,
  _pad1: f32,
  _pad2: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: ChromaticParams;

@fragment
fn chromaticFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = params.progress;

  // Intensity envelope — strongest at midpoint
  let envelope = sin(p * PI);
  let strength = envelope * params.intensity;

  // Direction vector for the aberration spread
  let dir = u32(params.direction);
  var aberrationDir: vec2f;
  if (dir == 0u) { aberrationDir = vec2f(1.0, 0.0); }
  else if (dir == 1u) { aberrationDir = vec2f(-1.0, 0.0); }
  else if (dir == 2u) { aberrationDir = vec2f(0.0, 1.0); }
  else { aberrationDir = vec2f(0.0, -1.0); }

  // RGB channel offsets — each channel shifts at different rate
  let spreadAmount = params.spread * strength * 0.02;
  let rOffset = aberrationDir * spreadAmount * 1.0;
  let gOffset = aberrationDir * spreadAmount * 0.0;  // Green stays centered
  let bOffset = aberrationDir * spreadAmount * -1.0;

  // Add slight radial component for lens-like feel
  let center = uv - vec2f(0.5);
  let radialOffset = center * strength * 0.01;

  // Sample outgoing clip (left) with aberration
  let leftR = textureSample(leftTex, texSampler, clamp(uv + rOffset + radialOffset, vec2f(0.0), vec2f(1.0))).r;
  let leftG = textureSample(leftTex, texSampler, clamp(uv + gOffset, vec2f(0.0), vec2f(1.0))).g;
  let leftB = textureSample(leftTex, texSampler, clamp(uv + bOffset - radialOffset, vec2f(0.0), vec2f(1.0))).b;
  let leftA = textureSample(leftTex, texSampler, uv).a;
  let leftColor = vec4f(leftR, leftG, leftB, leftA);

  // Sample incoming clip (right) with aberration
  let rightR = textureSample(rightTex, texSampler, clamp(uv + rOffset + radialOffset, vec2f(0.0), vec2f(1.0))).r;
  let rightG = textureSample(rightTex, texSampler, clamp(uv + gOffset, vec2f(0.0), vec2f(1.0))).g;
  let rightB = textureSample(rightTex, texSampler, clamp(uv + bOffset - radialOffset, vec2f(0.0), vec2f(1.0))).b;
  let rightA = textureSample(rightTex, texSampler, uv).a;
  let rightColor = vec4f(rightR, rightG, rightB, rightA);

  // Directional wipe for the crossfade (not a hard cut)
  var sweepPos: f32;
  if (dir == 0u) { sweepPos = uv.x; }
  else if (dir == 1u) { sweepPos = 1.0 - uv.x; }
  else if (dir == 2u) { sweepPos = uv.y; }
  else { sweepPos = 1.0 - uv.y; }

  // Soft directional crossfade
  let t = smoothstep(p * 1.3 - 0.15, p * 1.3 + 0.15, sweepPos);

  var color = mix(rightColor, leftColor, t);

  // Slight brightness boost at transition edge
  let edgeDist = abs(sweepPos - p);
  let edgeGlow = exp(-edgeDist * edgeDist * 40.0) * 0.08 * envelope;
  color = vec4f(min(color.rgb + edgeGlow, vec3f(1.0)), color.a);

  return color;
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.spread??1.5,o=i?.intensity??1;return new Float32Array([e,t,n,r,a,o,0,0])}},cn={id:`radialBlur`,name:`Radial Blur`,category:`custom`,hasDirection:!1,entryPoint:`radialBlurFragment`,uniformSize:32,shader:`
struct RadialBlurParams {
  progress: f32,
  width: f32,
  height: f32,
  blurStrength: f32,
  spin: f32,
  samples: f32,
  _pad1: f32,
  _pad2: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: RadialBlurParams;

fn sampleWithRadialBlur(tex: texture_2d<f32>, uv: vec2f, strength: f32, spinAmount: f32) -> vec4f {
  let center = vec2f(0.5, 0.5);
  let dir = uv - center;
  let dist = length(dir);

  // Combine zoom blur + spin blur
  let numSamples = u32(params.samples);
  var color = vec4f(0.0);
  var totalWeight = 0.0;

  for (var i = 0u; i < numSamples; i++) {
    let t = f32(i) / f32(numSamples - 1u) - 0.5;

    // Zoom: offset along radial direction
    let zoomOffset = dir * t * strength;

    // Spin: rotate around center
    let angle = t * spinAmount;
    let cosA = cos(angle);
    let sinA = sin(angle);
    let rotatedDir = vec2f(
      dir.x * cosA - dir.y * sinA,
      dir.x * sinA + dir.y * cosA
    ) - dir;
    let spinOffset = rotatedDir * strength;

    let sampleUv = clamp(uv + zoomOffset + spinOffset, vec2f(0.0), vec2f(1.0));

    // Gaussian-ish weight (center samples contribute more)
    let weight = exp(-t * t * 4.0);
    color += textureSample(tex, texSampler, sampleUv) * weight;
    totalWeight += weight;
  }

  return color / totalWeight;
}

@fragment
fn radialBlurFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = params.progress;

  // Blur envelope: ramp up → peak at midpoint → ramp down
  let blurEnvelope = sin(p * PI);
  let strength = blurEnvelope * params.blurStrength * 0.15;
  let spinAmount = blurEnvelope * params.spin * 0.3;

  // Sample both clips with radial blur
  let left = sampleWithRadialBlur(leftTex, uv, strength, spinAmount);
  let right = sampleWithRadialBlur(rightTex, uv, strength, spinAmount);

  // Crossfade with smooth S-curve
  let t = smoothstep(0.3, 0.7, p);

  var color = mix(left, right, t);

  // Subtle vignette darkening during blur peak
  let center = uv - vec2f(0.5);
  let vignette = 1.0 - dot(center, center) * blurEnvelope * 0.5;
  color = vec4f(color.rgb * vignette, color.a);

  return color;
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.blurStrength??1,o=i?.spin??.3,s=i?.samples??12;return new Float32Array([e,t,n,a,o,s,0,0])}},ln={id:`fade`,name:`Fade`,category:`basic`,hasDirection:!1,entryPoint:`fadeFragment`,uniformSize:16,shader:`
struct FadeParams {
  progress: f32,
  width: f32,
  height: f32,
  _pad: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: FadeParams;

@fragment
fn fadeFragment(input: VertexOutput) -> @location(0) vec4f {
  let left = textureSample(leftTex, texSampler, input.uv);
  let right = textureSample(rightTex, texSampler, input.uv);
  let p = clamp(params.progress, 0.0, 1.0);

  let outgoingWeight = select(0.0, max(0.0, cos(p * PI)), p < 0.5);
  let incomingWeight = select(max(0.0, -cos(p * PI)), 0.0, p < 0.5);
  let blackWeight = 1.0 - max(outgoingWeight, incomingWeight);
  let color = left.rgb * outgoingWeight + right.rgb * incomingWeight;
  let alpha = clamp(left.a * outgoingWeight + right.a * incomingWeight + blackWeight, 0.0, 1.0);

  return vec4f(color, alpha);
}`,packUniforms:(e,t,n)=>new Float32Array([e,t,n,0])},un={id:`wipe`,name:`Wipe`,category:`wipe`,hasDirection:!0,directions:[`from-left`,`from-right`,`from-top`,`from-bottom`],entryPoint:`wipeFragment`,uniformSize:16,shader:`
struct WipeParams {
  progress: f32,
  width: f32,
  height: f32,
  direction: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: WipeParams;

@fragment
fn wipeFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let dir = u32(params.direction);

  // Sample both textures upfront (uniform control flow required)
  let left = textureSample(leftTex, texSampler, uv);
  let right = textureSample(rightTex, texSampler, uv);

  // Sweep position along the wipe axis (0→1 in sweep direction)
  var sweepPos: f32;
  if (dir == 0u) { sweepPos = uv.x; }             // from-left
  else if (dir == 1u) { sweepPos = 1.0 - uv.x; }  // from-right
  else if (dir == 2u) { sweepPos = uv.y; }         // from-top
  else { sweepPos = 1.0 - uv.y; }                  // from-bottom

  // Hard edge: swept region shows incoming, rest shows outgoing
  let t = step(sweepPos, params.progress);
  return mix(left, right, t);
}`,packUniforms:(e,t,n,r)=>new Float32Array([e,t,n,r])},dn={id:`slide`,name:`Slide`,category:`slide`,hasDirection:!0,directions:[`from-left`,`from-right`,`from-top`,`from-bottom`],entryPoint:`slideFragment`,uniformSize:16,shader:`
struct SlideParams {
  progress: f32,
  width: f32,
  height: f32,
  direction: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: SlideParams;

@fragment
fn slideFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = params.progress;
  let dir = u32(params.direction);

  // Push-slide: both clips move together.
  // Compute offset UVs for both clips, then sample upfront.

  // Offset vectors per direction:
  // from-left:   outgoing shifts right by p, incoming shifts from left (offset = p-1)
  // from-right:  outgoing shifts left by p, incoming shifts from right
  // from-top:    outgoing shifts down by p, incoming shifts from top
  // from-bottom: outgoing shifts up by p, incoming shifts from bottom
  var leftUv: vec2f;
  var rightUv: vec2f;
  var splitTest: f32;

  if (dir == 0u) {
    leftUv = vec2f(uv.x - p, uv.y);
    rightUv = vec2f(uv.x - p + 1.0, uv.y);
    splitTest = step(uv.x, p);
  } else if (dir == 1u) {
    leftUv = vec2f(uv.x + p, uv.y);
    rightUv = vec2f(uv.x - (1.0 - p), uv.y);
    splitTest = step(1.0 - p, uv.x);
  } else if (dir == 2u) {
    leftUv = vec2f(uv.x, uv.y - p);
    rightUv = vec2f(uv.x, uv.y - p + 1.0);
    splitTest = step(uv.y, p);
  } else {
    leftUv = vec2f(uv.x, uv.y + p);
    rightUv = vec2f(uv.x, uv.y - (1.0 - p));
    splitTest = step(1.0 - p, uv.y);
  }

  // Sample both textures upfront (uniform control flow required)
  let left = textureSample(leftTex, texSampler, leftUv);
  let right = textureSample(rightTex, texSampler, rightUv);

  return mix(left, right, splitTest);
}`,packUniforms:(e,t,n,r)=>new Float32Array([e,t,n,r])},fn={id:`flip`,name:`Flip`,category:`custom`,hasDirection:!0,directions:[`from-left`,`from-right`,`from-top`,`from-bottom`],entryPoint:`flipFragment`,uniformSize:16,shader:`
struct FlipParams {
  progress: f32,
  width: f32,
  height: f32,
  direction: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: FlipParams;

@fragment
fn flipFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = params.progress;
  let dir = u32(params.direction);

  // Horizontal flip (from-left/from-right) scales X, vertical scales Y
  let isHorizontal = (dir == 0u || dir == 1u);
  let midpoint = 0.5;
  let centered = uv - vec2f(0.5, 0.5);

  // Phase 1: outgoing scales 1→0; Phase 2: incoming scales 0→1
  let flipProgress1 = p / midpoint;
  let flipProgress2 = (p - midpoint) / midpoint;
  let scale1 = max(cos(flipProgress1 * PI * 0.5), 0.001);
  let scale2 = max(sin(flipProgress2 * PI * 0.5), 0.001);
  let scale = select(scale2, scale1, p < midpoint);

  // Distort UV from center based on axis
  let hDistorted = vec2f(centered.x / scale + 0.5, uv.y);
  let vDistorted = vec2f(uv.x, centered.y / scale + 0.5);
  let distorted = select(vDistorted, hDistorted, isHorizontal);

  // Sample both textures at the distorted UV (uniform control flow)
  let left = textureSample(leftTex, texSampler, distorted);
  let right = textureSample(rightTex, texSampler, distorted);

  // Out of bounds = black
  let oob = distorted.x < 0.0 || distorted.x > 1.0 || distorted.y < 0.0 || distorted.y > 1.0;
  let black = vec4f(0.0, 0.0, 0.0, 1.0);

  // Phase 1 shows outgoing (left), Phase 2 shows incoming (right)
  let texColor = select(right, left, p < midpoint);
  return select(texColor, black, oob);
}`,packUniforms:(e,t,n,r)=>new Float32Array([e,t,n,r])},pn={id:`clockWipe`,name:`Clock Wipe`,category:`mask`,hasDirection:!1,entryPoint:`clockWipeFragment`,uniformSize:16,shader:`
struct ClockWipeParams {
  progress: f32,
  width: f32,
  height: f32,
  edgeSoftness: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: ClockWipeParams;

${Gt}

fn clockSweepMask(angle: f32, sweepAngle: f32, feather: f32) -> f32 {
  if (sweepAngle <= 0.0) {
    return 0.0;
  }
  if (sweepAngle >= TAU) {
    return 1.0;
  }
  if (feather <= 0.0001) {
    return select(0.0, 1.0, angle <= sweepAngle);
  }
  return 1.0 - smoothstep(sweepAngle - feather, sweepAngle + feather, angle);
}

@fragment
fn clockWipeFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = clamp(params.progress, 0.0, 1.0);

  // Compute angle from center in pixel space (preserves aspect ratio)
  let pixelPos = uv * vec2f(params.width, params.height);
  let center = vec2f(params.width * 0.5, params.height * 0.5);
  let delta = pixelPos - center;

  // atan2(x, -y) gives angle from 12 o'clock (top), clockwise positive
  let angle = atan2(delta.x, -delta.y);

  // Normalize angle from [-PI, PI] to [0, TAU]
  let normalizedAngle = select(angle, angle + TAU, angle < 0.0);
  let sweepAngle = p * TAU;
  let feather = max(0.0, min(params.edgeSoftness * TAU / 360.0, min(sweepAngle, TAU - sweepAngle)));
  let outgoingScale = 1.0 - (0.04 * p);
  let incomingScale = 1.04 - (0.04 * p);
  let outgoingOpacity = 1.0 - (0.1 * p);
  let incomingOpacity = 0.85 + (0.15 * p);
  let leftUv = scaleUv(uv, outgoingScale);
  let rightUv = scaleUv(uv, incomingScale);

  // Sample both textures upfront (uniform control flow required)
  let left = textureSample(leftTex, texSampler, leftUv);
  let right = textureSample(rightTex, texSampler, rightUv);
  let outgoingColor = vec4f(left.rgb * outgoingOpacity, left.a * outgoingOpacity);
  let incomingColor = vec4f(right.rgb * incomingOpacity, right.a * incomingOpacity);

  // Swept region with soft edge: incoming; un-swept: outgoing
  let swept = clockSweepMask(normalizedAngle, sweepAngle, feather);
  return mix(outgoingColor, incomingColor, swept);
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.edgeSoftness??8;return new Float32Array([e,t,n,a])}},mn={id:`iris`,name:`Iris`,category:`iris`,hasDirection:!1,entryPoint:`irisFragment`,uniformSize:16,shader:`
struct IrisParams {
  progress: f32,
  width: f32,
  height: f32,
  edgeSoftness: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: IrisParams;

${Gt}

fn circleMask(distanceFromCenter: f32, radius: f32, feather: f32) -> f32 {
  if (radius <= 0.0) {
    return 0.0;
  }
  if (feather <= 0.001) {
    return select(0.0, 1.0, distanceFromCenter <= radius);
  }
  return 1.0 - smoothstep(radius - feather, radius + feather, distanceFromCenter);
}

@fragment
fn irisFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = clamp(params.progress, 0.0, 1.0);

  // Compute distance from center in pixel space
  let pixelPos = uv * vec2f(params.width, params.height);
  let halfW = params.width * 0.5;
  let halfH = params.height * 0.5;
  let center = vec2f(halfW, halfH);
  let dist = length(pixelPos - center);

  // Max radius = diagonal from center to corner * 1.2 (matches CPU)
  let maxRadius = sqrt(halfW * halfW + halfH * halfH) * 1.2;
  let radius = p * maxRadius;
  let feather = max(0.0, min(params.edgeSoftness, min(radius, maxRadius - radius)));
  let outgoingScale = 1.0 - (0.04 * p);
  let incomingScale = 1.04 - (0.04 * p);
  let outgoingOpacity = 1.0 - (0.1 * p);
  let incomingOpacity = 0.85 + (0.15 * p);
  let leftUv = scaleUv(uv, outgoingScale);
  let rightUv = scaleUv(uv, incomingScale);

  // Sample both textures upfront (uniform control flow required)
  let left = textureSample(leftTex, texSampler, leftUv);
  let right = textureSample(rightTex, texSampler, rightUv);
  let outgoingColor = vec4f(left.rgb * outgoingOpacity, left.a * outgoingOpacity);
  let incomingColor = vec4f(right.rgb * incomingOpacity, right.a * incomingOpacity);

  // Inside circle with soft edge: incoming; outside: outgoing
  let inside = circleMask(dist, radius, feather);
  return mix(outgoingColor, incomingColor, inside);
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.edgeSoftness??6;return new Float32Array([e,t,n,a])}},hn={id:`liquidDistort`,name:`Liquid Distort`,category:`custom`,hasDirection:!0,directions:[`from-left`,`from-right`,`from-top`,`from-bottom`],entryPoint:`liquidDistortFragment`,uniformSize:48,shader:`
struct LiquidDistortParams {
  progress: f32,
  width: f32,
  height: f32,
  direction: f32,
  intensity: f32,
  scale: f32,
  turbulence: f32,
  edgeSoftness: f32,
  chroma: f32,
  swirl: f32,
  shine: f32,
  _pad: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: LiquidDistortParams;

fn liquidAxis(uv: vec2f, dir: u32) -> f32 {
  if (dir == 0u) { return uv.x; }
  if (dir == 1u) { return 1.0 - uv.x; }
  if (dir == 2u) { return uv.y; }
  return 1.0 - uv.y;
}

fn liquidFlow(uv: vec2f, p: f32, scale: f32, turbulence: f32) -> vec2f {
  let aspect = max(params.width / max(params.height, 1.0), 0.001);
  let pos = vec2f(uv.x * aspect, uv.y) * scale;
  let slow = fbm(pos + vec2f(p * 1.8, -p * 1.15));
  let fast = fbm(pos * 1.9 + vec2f(-p * 2.7, p * 1.55));
  let curlX = noise2d(pos + vec2f(slow * 2.5, p * 3.0)) - 0.5;
  let curlY = noise2d(pos + vec2f(p * -2.0, fast * 2.5)) - 0.5;
  return vec2f(curlX, curlY) * turbulence + vec2f(slow - 0.5, fast - 0.5) * 0.45;
}

@fragment
fn liquidDistortFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = clamp(params.progress, 0.0, 1.0);
  let dir = u32(params.direction);
  let envelope = sin(p * PI);
  let axis = liquidAxis(uv, dir);
  let flow = liquidFlow(uv, p, max(params.scale, 0.001), params.turbulence);

  let center = uv - vec2f(0.5);
  let swirlAngle = params.swirl * envelope * 0.42;
  let s = sin(swirlAngle);
  let c = cos(swirlAngle);
  let rotated = vec2f(center.x * c - center.y * s, center.x * s + center.y * c);
  let swirlOffset = (rotated - center) * 0.32;

  let baseStrength = params.intensity * envelope * 0.052;
  let leftOffset = (flow + swirlOffset) * baseStrength;
  let rightOffset = (-flow * 0.82 + swirlOffset * 0.55) * baseStrength;

  let frontNoise = fbm(uv * max(params.scale * 0.72, 0.001) + vec2f(p * 2.2, -p * 1.7));
  let front = axis + (frontNoise - 0.5) * 0.28 * params.intensity * envelope;
  let softness = max(params.edgeSoftness, 0.001);
  let reveal = smoothstep(p - softness, p + softness, front);

  let leftUv = clamp(uv + leftOffset, vec2f(0.0), vec2f(1.0));
  let rightUv = clamp(uv + rightOffset, vec2f(0.0), vec2f(1.0));
  let leftColor = textureSampleLevel(leftTex, texSampler, leftUv, 0.0);
  let rightColor = textureSampleLevel(rightTex, texSampler, rightUv, 0.0);

  let chromaOffset = flow * params.chroma * envelope * 0.018;
  let rightR = textureSampleLevel(rightTex, texSampler, clamp(rightUv + chromaOffset, vec2f(0.0), vec2f(1.0)), 0.0).r;
  let rightB = textureSampleLevel(rightTex, texSampler, clamp(rightUv - chromaOffset, vec2f(0.0), vec2f(1.0)), 0.0).b;
  let refractedRight = vec4f(rightR, rightColor.g, rightB, rightColor.a);

  let caustic = pow(max(0.0, 1.0 - abs(front - p) / max(softness * 2.5, 0.001)), 2.0);
  let shimmerNoise = fbm(uv * max(params.scale * 2.4, 0.001) + vec2f(p * 5.0, p * -4.0));
  let shine = vec3f(0.72, 0.88, 1.0) * caustic * shimmerNoise * params.shine * envelope * 0.22;

  let color = mix(refractedRight, leftColor, reveal);
  let glassMix = smoothstep(0.0, 1.0, caustic * 0.65 + envelope * 0.2);
  let glassed = mix(color.rgb, color.rgb + shine, glassMix);
  return vec4f(min(glassed, vec3f(1.0)), color.a);
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.intensity??1,o=i?.scale??4.5,s=i?.turbulence??1,c=i?.edgeSoftness??.18,l=i?.chroma??.75,u=i?.swirl??.8,d=i?.shine??1;return new Float32Array([e,t,n,r,a,o,s,c,l,u,d,0])}},gn={id:`lensWarpZoom`,name:`Lens Warp Zoom`,category:`custom`,hasDirection:!1,entryPoint:`lensWarpZoomFragment`,uniformSize:48,shader:`
struct LensWarpZoomParams {
  progress: f32,
  width: f32,
  height: f32,
  zoomStrength: f32,
  warpStrength: f32,
  blurStrength: f32,
  chroma: f32,
  vignette: f32,
  centerX: f32,
  centerY: f32,
  glow: f32,
  _pad: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: LensWarpZoomParams;

fn barrelWarp(uv: vec2f, center: vec2f, amount: f32) -> vec2f {
  let aspect = max(params.width / max(params.height, 1.0), 0.001);
  var p = uv - center;
  p.x *= aspect;
  let r2 = dot(p, p);
  let warped = p * (1.0 + amount * r2);
  return vec2f(warped.x / aspect, warped.y) + center;
}

fn zoomAround(uv: vec2f, center: vec2f, zoom: f32) -> vec2f {
  return center + (uv - center) / max(zoom, 0.001);
}

fn sampleZoomBlur(tex: texture_2d<f32>, uv: vec2f, center: vec2f, strength: f32) -> vec4f {
  let dir = center - uv;
  var color = vec4f(0.0);
  var weightSum = 0.0;
  for (var i = 0u; i < 7u; i++) {
    let t = f32(i) / 6.0;
    let weight = 1.0 - abs(t - 0.5) * 0.8;
    let sampleUv = clamp(uv + dir * strength * (t - 0.5), vec2f(0.0), vec2f(1.0));
    color += textureSampleLevel(tex, texSampler, sampleUv, 0.0) * weight;
    weightSum += weight;
  }
  return color / weightSum;
}

@fragment
fn lensWarpZoomFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = clamp(params.progress, 0.0, 1.0);
  let center = vec2f(params.centerX, params.centerY);
  let envelope = sin(p * PI);
  let punch = smoothstep(0.0, 0.46, p) * (1.0 - smoothstep(0.58, 1.0, p));
  let reveal = smoothstep(0.36, 0.64, p);

  let outgoingZoom = 1.0 + params.zoomStrength * p * 0.42 + punch * 0.18;
  let incomingZoom = 1.0 + params.zoomStrength * (1.0 - p) * 0.58;
  let warp = params.warpStrength * envelope;
  let blur = params.blurStrength * envelope * 0.11;

  let leftWarped = barrelWarp(zoomAround(uv, center, outgoingZoom), center, warp);
  let rightWarped = barrelWarp(zoomAround(uv, center, incomingZoom), center, -warp * 0.65);

  let leftColor = sampleZoomBlur(leftTex, leftWarped, center, blur);
  let rightBase = sampleZoomBlur(rightTex, rightWarped, center, blur * 0.82);

  let chromaDir = normalize((uv - center) + vec2f(0.0001));
  let chromaOffset = chromaDir * params.chroma * envelope * 0.012;
  let rightR = textureSampleLevel(rightTex, texSampler, clamp(rightWarped + chromaOffset, vec2f(0.0), vec2f(1.0)), 0.0).r;
  let rightB = textureSampleLevel(rightTex, texSampler, clamp(rightWarped - chromaOffset, vec2f(0.0), vec2f(1.0)), 0.0).b;
  let rightColor = vec4f(rightR, rightBase.g, rightB, rightBase.a);

  let dist = distance(uv, center);
  let ring = exp(-pow((dist - 0.22 - p * 0.18) * 8.0, 2.0)) * params.glow * envelope;
  let vignette = 1.0 - smoothstep(0.36, 0.9, dist) * params.vignette * envelope * 0.45;
  let edgeLight = vec3f(0.78, 0.9, 1.0) * ring * 0.18;

  let color = mix(leftColor, rightColor, reveal);
  return vec4f(min(color.rgb * vignette + edgeLight, vec3f(1.0)), color.a);
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.zoomStrength??1,o=i?.warpStrength??.75,s=i?.blurStrength??1,c=i?.chroma??.65,l=i?.vignette??.7,u=i?.centerX??.5,d=i?.centerY??.5,f=i?.glow??1;return new Float32Array([e,t,n,a,o,s,c,l,u,d,f,0])}},_n={id:`lightLeakBurn`,name:`Light Leak Burn`,category:`custom`,hasDirection:!0,directions:[`from-left`,`from-right`,`from-top`,`from-bottom`],entryPoint:`lightLeakBurnFragment`,uniformSize:48,shader:`
struct LightLeakBurnParams {
  progress: f32,
  width: f32,
  height: f32,
  direction: f32,
  intensity: f32,
  spread: f32,
  warmth: f32,
  burn: f32,
  edgeSoftness: f32,
  grain: f32,
  _pad1: f32,
  _pad2: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: LightLeakBurnParams;

fn burnAxis(uv: vec2f, dir: u32) -> f32 {
  if (dir == 0u) { return uv.x; }
  if (dir == 1u) { return 1.0 - uv.x; }
  if (dir == 2u) { return uv.y; }
  return 1.0 - uv.y;
}

@fragment
fn lightLeakBurnFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = clamp(params.progress, 0.0, 1.0);
  let dir = u32(params.direction);
  let axis = burnAxis(uv, dir);
  let envelope = sin(p * PI);

  let left = textureSampleLevel(leftTex, texSampler, uv, 0.0);
  let right = textureSampleLevel(rightTex, texSampler, uv, 0.0);

  let organic = fbm(uv * vec2f(4.0, 3.0) + vec2f(p * 2.7, -p * 1.9));
  let fine = noise2d(uv * vec2f(params.width, params.height) * 0.45 + vec2f(p * 431.0));
  let noisyAxis = axis + (organic - 0.5) * params.spread * 0.28;
  let reveal = smoothstep(p - params.edgeSoftness, p + params.edgeSoftness, noisyAxis);
  let base = mix(left, right, reveal);

  let frontDist = abs(noisyAxis - p);
  let hotCore = exp(-frontDist * frontDist / max(0.0001, params.edgeSoftness * params.edgeSoftness * 0.38));
  let warmHalo = exp(-frontDist * frontDist / max(0.0001, params.edgeSoftness * params.edgeSoftness * 3.5));
  let warm = mix(vec3f(1.0, 0.88, 0.58), vec3f(1.0, 0.48, 0.16), params.warmth);
  let whiteHot = vec3f(1.0, 0.96, 0.86);
  let grain = (fine - 0.5) * params.grain * envelope * 0.08;
  let burnLight = warm * warmHalo * params.intensity * envelope * 1.15
    + whiteHot * hotCore * params.burn * envelope * 1.35;

  let overexposed = 1.0 - exp(-(base.rgb + burnLight + grain) * (1.0 + hotCore * params.burn));
  let color = mix(base.rgb, overexposed, clamp((warmHalo + hotCore) * envelope, 0.0, 1.0));
  return vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), base.a);
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.intensity??1.25,o=i?.spread??1,s=i?.warmth??.75,c=i?.burn??1.1,l=i?.edgeSoftness??.16,u=i?.grain??.5;return new Float32Array([e,t,n,r,a,o,s,c,l,u,0,0])}},vn={id:`filmGateSlip`,name:`Film Gate Slip`,category:`custom`,hasDirection:!1,entryPoint:`filmGateSlipFragment`,uniformSize:48,shader:`
struct FilmGateSlipParams {
  progress: f32,
  width: f32,
  height: f32,
  slip: f32,
  shake: f32,
  exposure: f32,
  gateWidth: f32,
  grain: f32,
  chroma: f32,
  roll: f32,
  _pad1: f32,
  _pad2: f32,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var leftTex: texture_2d<f32>;
@group(0) @binding(2) var rightTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: FilmGateSlipParams;

fn sampleFilm(tex: texture_2d<f32>, uv: vec2f, chromaOffset: vec2f) -> vec4f {
  let baseUv = clamp(uv, vec2f(0.0), vec2f(1.0));
  let r = textureSampleLevel(tex, texSampler, clamp(baseUv + chromaOffset, vec2f(0.0), vec2f(1.0)), 0.0).r;
  let g = textureSampleLevel(tex, texSampler, baseUv, 0.0).g;
  let b = textureSampleLevel(tex, texSampler, clamp(baseUv - chromaOffset, vec2f(0.0), vec2f(1.0)), 0.0).b;
  let a = textureSampleLevel(tex, texSampler, baseUv, 0.0).a;
  return vec4f(r, g, b, a);
}

@fragment
fn filmGateSlipFragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let p = clamp(params.progress, 0.0, 1.0);
  let envelope = sin(p * PI);
  let frame = floor(p * 18.0);
  let jitterA = hash(vec2f(frame, 19.7));
  let jitterB = hash(vec2f(frame + 3.0, 41.3));
  let gatePulse = smoothstep(0.08, 0.22, p) * (1.0 - smoothstep(0.78, 0.96, p));

  let slipOffset = (p - 0.5) * params.slip * envelope * 0.32
    + (jitterA - 0.5) * params.shake * envelope * 0.05;
  let lateral = (jitterB - 0.5) * params.shake * envelope * 0.025;
  let roll = params.roll * envelope * 0.04 * sin(p * TAU * 2.0);
  let outgoingUv = vec2f(uv.x + lateral + roll * (uv.y - 0.5), uv.y + slipOffset);
  let incomingUv = vec2f(uv.x - lateral * 0.65 - roll * (uv.y - 0.5), uv.y - slipOffset * 0.55);

  let chromaOffset = vec2f(params.chroma * envelope * 0.006, 0.0);
  let left = sampleFilm(leftTex, outgoingUv, chromaOffset);
  let right = sampleFilm(rightTex, incomingUv, chromaOffset * 0.7);
  var color = mix(left, right, smoothstep(0.42, 0.58, p));

  let gateTop = smoothstep(params.gateWidth, 0.0, uv.y);
  let gateBottom = smoothstep(1.0 - params.gateWidth, 1.0, uv.y);
  let gateFlash = max(gateTop, gateBottom) * gatePulse * 0.2;
  let flicker = 1.0 + (hash(vec2f(frame, 8.1)) - 0.42) * params.exposure * envelope * 0.38;
  let grain = (hash(floor(uv * vec2f(params.width, params.height) * 0.7) + vec2f(frame)) - 0.5)
    * params.grain * envelope * 0.12;
  let vignette = 1.0 - dot(uv - vec2f(0.5), uv - vec2f(0.5)) * envelope * 0.35;

  color = vec4f(color.rgb * flicker * vignette + grain + vec3f(gateFlash), color.a);
  return vec4f(clamp(color.rgb, vec3f(0.0), vec3f(1.0)), color.a);
}`,packUniforms:(e,t,n,r,i)=>{let a=i?.slip??1,o=i?.shake??1,s=i?.exposure??.85,c=i?.gateWidth??.075,l=i?.grain??.6,u=i?.chroma??.55,d=i?.roll??.75;return new Float32Array([e,t,n,a,o,s,c,l,u,d,0,0])}},yn=new Map;function Y(e){yn.set(e.id,e)}Y(Yt),Y(Qt),Y($t),Y(en),Y(tn),Y(nn),Y(rn),Y(an),Y(on),Y(sn),Y(cn),Y(ln),Y(un),Y(dn),Y(fn),Y(pn),Y(mn),Y(hn),Y(gn),Y(_n),Y(vn);function bn(e){return yn.get(e)}const xn=`
${o}

struct MediaUniforms {
  outputSize: vec2f,
  sourceSize: vec2f,
  sourceRect: vec4f,
  destRect: vec4f,
  opacity: f32,
  rotation: f32,
  flip: vec2f,
  transformRect: vec4f,
  feather: vec4f,
  mask: vec4f,
  cornerPinOriginSize: vec4f,
  cornerPinMatrix0: vec4f,
  cornerPinMatrix1: vec4f,
  cornerPinMatrix2: vec4f,
};

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var sourceTex: texture_2d<f32>;
@group(0) @binding(2) var<uniform> u: MediaUniforms;
@group(0) @binding(3) var maskTex: texture_2d<f32>;

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let pixel = input.uv * u.outputSize;
  let transformHalfSize = u.transformRect.zw * 0.5;
  let transformCenter = u.transformRect.xy + transformHalfSize;
  let relative = pixel - transformCenter;
  let cosR = cos(-u.rotation);
  let sinR = sin(-u.rotation);
  let transformLocal = vec2f(
    relative.x * cosR - relative.y * sinR,
    relative.x * sinR + relative.y * cosR
  );
  let unrotatedPixel = transformCenter + transformLocal;

  var samplePixel = unrotatedPixel;
  if (u.mask.y > 0.5) {
    let pinPixel = unrotatedPixel - u.cornerPinOriginSize.xy;
    let pinDenom = u.cornerPinMatrix2.x * pinPixel.x + u.cornerPinMatrix2.y * pinPixel.y + u.cornerPinMatrix2.z;
    if (abs(pinDenom) < 0.00001) {
      return vec4f(0.0);
    }
    let pinLocal = vec2f(
      (u.cornerPinMatrix0.x * pinPixel.x + u.cornerPinMatrix0.y * pinPixel.y + u.cornerPinMatrix0.z) / pinDenom,
      (u.cornerPinMatrix1.x * pinPixel.x + u.cornerPinMatrix1.y * pinPixel.y + u.cornerPinMatrix1.z) / pinDenom
    );
    if (pinLocal.x < 0.0 || pinLocal.y < 0.0 || pinLocal.x > u.cornerPinOriginSize.z || pinLocal.y > u.cornerPinOriginSize.w) {
      return vec4f(0.0);
    }
    samplePixel = u.cornerPinOriginSize.xy + pinLocal;
  }

  let destMin = u.destRect.xy;
  let destMax = u.destRect.xy + u.destRect.zw;
  if (samplePixel.x < destMin.x || samplePixel.y < destMin.y || samplePixel.x > destMax.x || samplePixel.y > destMax.y) {
    return vec4f(0.0);
  }

  var localUv = (samplePixel - destMin) / max(u.destRect.zw, vec2f(0.001));
  if (u.flip.x < 0.0) {
    localUv.x = 1.0 - localUv.x;
  }
  if (u.flip.y < 0.0) {
    localUv.y = 1.0 - localUv.y;
  }
  let sourcePixel = u.sourceRect.xy + localUv * u.sourceRect.zw;
  let sourceUv = sourcePixel / max(u.sourceSize, vec2f(0.001));
  let color = textureSampleLevel(sourceTex, texSampler, sourceUv, 0.0);
  let viewportLocal = samplePixel - u.destRect.xy;
  let leftAlpha = select(1.0, clamp(viewportLocal.x / max(u.feather.x, 0.001), 0.0, 1.0), u.feather.x > 0.0);
  let rightAlpha = select(1.0, clamp((u.destRect.z - viewportLocal.x) / max(u.feather.y, 0.001), 0.0, 1.0), u.feather.y > 0.0);
  let topAlpha = select(1.0, clamp(viewportLocal.y / max(u.feather.z, 0.001), 0.0, 1.0), u.feather.z > 0.0);
  let bottomAlpha = select(1.0, clamp((u.destRect.w - viewportLocal.y) / max(u.feather.w, 0.001), 0.0, 1.0), u.feather.w > 0.0);
  let featherAlpha = leftAlpha * rightAlpha * topAlpha * bottomAlpha;
  var layerMaskAlpha = 1.0;
  if (u.mask.z > 0.5) {
    let maskUv = samplePixel / max(u.outputSize, vec2f(0.001));
    layerMaskAlpha = textureSampleLevel(maskTex, texSampler, maskUv, 0.0).a;
    if (u.mask.w > 0.5) {
      layerMaskAlpha = 1.0 - layerMaskAlpha;
    }
  }

  let radius = min(u.mask.x, min(u.transformRect.z, u.transformRect.w) * 0.5);
  var cornerAlpha = 1.0;
  if (radius > 0.0) {
    let itemLocal = samplePixel - u.transformRect.xy;
    let roundedDistance = length(max(abs(itemLocal - transformHalfSize) - (transformHalfSize - vec2f(radius)), vec2f(0.0))) - radius;
    cornerAlpha = 1.0 - smoothstep(-0.75, 0.75, roundedDistance);
  }

  return vec4f(color.rgb, color.a * u.opacity * featherAlpha * cornerAlpha * layerMaskAlpha);
}
`;function Sn(e){if(e instanceof HTMLVideoElement)return{width:e.videoWidth,height:e.videoHeight};if(typeof VideoFrame<`u`&&e instanceof VideoFrame)return{width:e.displayWidth,height:e.displayHeight};if(e instanceof HTMLImageElement)return{width:e.naturalWidth,height:e.naturalHeight};let t=e;return{width:t.width,height:t.height}}var Cn=class{inputTexture=null;inputView=null;bindGroup=null;inputW=0;inputH=0;activeMaskView=null;replacePipeline;blendPipeline;sampler;bindGroupLayout;uniformBuffer;constructor(e){this.device=e,this.sampler=e.createSampler({magFilter:`linear`,minFilter:`linear`});let t=e.createShaderModule({label:`media-render`,code:xn});this.bindGroupLayout=e.createBindGroupLayout({label:`media-render-layout`,entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}},{binding:3,visibility:GPUShaderStage.FRAGMENT,texture:{}}]}),this.replacePipeline=this.createRenderPipeline(t,!1),this.blendPipeline=this.createRenderPipeline(t,!0),this.uniformBuffer=e.createBuffer({size:176,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})}createRenderPipeline(e,t){return this.device.createRenderPipeline({label:`media-render-pipeline`,layout:this.device.createPipelineLayout({bindGroupLayouts:[this.bindGroupLayout]}),vertex:{module:e,entryPoint:`vertexMain`},fragment:{module:e,entryPoint:`fragmentMain`,targets:[{format:`rgba8unorm`,blend:t?{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}:void 0}]},primitive:{topology:`triangle-list`}})}renderSourceToTexture(e,t,n){let r=Sn(e),i=n.sourceWidth||r.width,a=n.sourceHeight||r.height;if(i<2||a<2||t.width!==n.outputWidth||t.height!==n.outputHeight||(this.ensureInputTexture(i,a),!this.inputTexture||!this.inputView))return!1;if(this.device.queue.copyExternalImageToTexture({source:e,flipY:!1},{texture:this.inputTexture},{width:i,height:a}),!n.maskTexture)return this.renderInputViewToTexture(t,n,i,a);let o=this.activeMaskView,s=this.bindGroup;this.activeMaskView=n.maskTexture.createView(),this.bindGroup=null;try{return this.renderInputViewToTexture(t,n,i,a)}finally{this.activeMaskView=o,this.bindGroup=s}}renderTextureToTexture(e,t,n){let r=n.sourceWidth||e.width,i=n.sourceHeight||e.height;if(r<2||i<2||t.width!==n.outputWidth||t.height!==n.outputHeight)return!1;let a=this.inputView,o=this.bindGroup,s=this.activeMaskView;this.inputView=e.createView(),this.activeMaskView=n.maskTexture?.createView()??null,this.bindGroup=null;try{return this.renderInputViewToTexture(t,n,r,i)}finally{this.inputView=a,this.activeMaskView=s,this.bindGroup=o}}destroy(){this.inputTexture?.destroy(),this.uniformBuffer.destroy()}ensureInputTexture(e,t){this.inputTexture&&this.inputW===e&&this.inputH===t||(this.inputTexture?.destroy(),this.inputTexture=this.device.createTexture({size:{width:e,height:t},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),this.inputView=this.inputTexture.createView(),this.bindGroup=null,this.inputW=e,this.inputH=t)}ensureBindGroup(){if(this.bindGroup)return this.bindGroup;if(!this.inputView)return null;let e=this.activeMaskView??this.inputView;return this.bindGroup=this.device.createBindGroup({layout:this.bindGroupLayout,entries:[{binding:0,resource:this.sampler},{binding:1,resource:this.inputView},{binding:2,resource:{buffer:this.uniformBuffer}},{binding:3,resource:e}]}),this.bindGroup}renderInputViewToTexture(e,t,n,r){let i=t.sourceRect??{x:0,y:0,width:n,height:r},a=t.transformRect??t.destRect,o=t.featherPixels??{left:0,right:0,top:0,bottom:0},s=t.cornerPin,c=new Float32Array([t.outputWidth,t.outputHeight,n,r,i.x,i.y,i.width,i.height,t.destRect.x,t.destRect.y,t.destRect.width,t.destRect.height,t.opacity??1,t.rotationRad??0,t.flipX?-1:1,t.flipY?-1:1,a.x,a.y,a.width,a.height,o.left,o.right,o.top,o.bottom,t.cornerRadius??0,+!!s,+!!t.maskTexture,+!!t.maskInvert,s?.originX??0,s?.originY??0,s?.width??0,s?.height??0,s?.inverseMatrix[0]??1,s?.inverseMatrix[1]??0,s?.inverseMatrix[2]??0,0,s?.inverseMatrix[3]??0,s?.inverseMatrix[4]??1,s?.inverseMatrix[5]??0,0,s?.inverseMatrix[6]??0,s?.inverseMatrix[7]??0,s?.inverseMatrix[8]??1,0]);this.device.queue.writeBuffer(this.uniformBuffer,0,c);let l=this.ensureBindGroup();if(!l)return!1;let u=this.device.createCommandEncoder(),d=u.beginRenderPass({colorAttachments:[{view:e.createView(),loadOp:t.clear===!1?`load`:`clear`,clearValue:{r:0,g:0,b:0,a:0},storeOp:`store`}]});return d.setPipeline(t.blend?this.blendPipeline:this.replacePipeline),d.setBindGroup(0,l),d.draw(6),d.end(),this.device.queue.submit([u.finish()]),!0}};const wn={normal:0,dissolve:1,darken:2,multiply:3,"color-burn":4,"linear-burn":5,lighten:6,screen:7,"color-dodge":8,"linear-dodge":9,overlay:10,"soft-light":11,"hard-light":12,"vivid-light":13,"linear-light":14,"pin-light":15,"hard-mix":16,difference:17,exclusion:18,subtract:19,divide:20,hue:21,saturation:22,color:23,luminosity:24},Tn=`
// ─── HSL helpers (needed for component blend modes) ───

fn compositor_rgb2hsl(c: vec3f) -> vec3f {
  let mx = max(max(c.r, c.g), c.b);
  let mn = min(min(c.r, c.g), c.b);
  let l = (mx + mn) * 0.5;
  if (mx == mn) { return vec3f(0.0, 0.0, l); }
  let d = mx - mn;
  let s = select(d / (2.0 - mx - mn), d / (mx + mn), l > 0.5);
  var h: f32;
  if (mx == c.r) {
    h = (c.g - c.b) / d + select(0.0, 6.0, c.g < c.b);
  } else if (mx == c.g) {
    h = (c.b - c.r) / d + 2.0;
  } else {
    h = (c.r - c.g) / d + 4.0;
  }
  h /= 6.0;
  return vec3f(h, s, l);
}

fn compositor_hue2rgb(p: f32, q: f32, t: f32) -> f32 {
  var tt = t;
  if (tt < 0.0) { tt += 1.0; }
  if (tt > 1.0) { tt -= 1.0; }
  if (tt < 1.0 / 6.0) { return p + (q - p) * 6.0 * tt; }
  if (tt < 1.0 / 2.0) { return q; }
  if (tt < 2.0 / 3.0) { return p + (q - p) * (2.0 / 3.0 - tt) * 6.0; }
  return p;
}

fn compositor_hsl2rgb(c: vec3f) -> vec3f {
  if (c.y == 0.0) { return vec3f(c.z); }
  let q = select(c.z + c.y - c.z * c.y, c.z * (1.0 + c.y), c.z < 0.5);
  let p = 2.0 * c.z - q;
  return vec3f(
    compositor_hue2rgb(p, q, c.x + 1.0 / 3.0),
    compositor_hue2rgb(p, q, c.x),
    compositor_hue2rgb(p, q, c.x - 1.0 / 3.0)
  );
}

fn compositor_lum(c: vec3f) -> f32 {
  return dot(c, vec3f(0.3, 0.59, 0.11));
}

fn compositor_setLum(c: vec3f, l: f32) -> vec3f {
  let d = l - compositor_lum(c);
  var r = c + vec3f(d);
  let mn = min(min(r.r, r.g), r.b);
  let mx = max(max(r.r, r.g), r.b);
  let ll = compositor_lum(r);
  if (mn < 0.0) {
    r = vec3f(ll) + (r - vec3f(ll)) * ll / (ll - mn);
  }
  if (mx > 1.0) {
    r = vec3f(ll) + (r - vec3f(ll)) * (1.0 - ll) / (mx - ll);
  }
  return r;
}

fn compositor_sat(c: vec3f) -> f32 {
  return max(max(c.r, c.g), c.b) - min(min(c.r, c.g), c.b);
}

// ─── Blend mode implementations ───

fn blendNormal(base: vec3f, layer: vec3f) -> vec3f { return layer; }

fn blendDarken(base: vec3f, layer: vec3f) -> vec3f { return min(base, layer); }
fn blendMultiply(base: vec3f, layer: vec3f) -> vec3f { return base * layer; }
fn blendColorBurn(base: vec3f, layer: vec3f) -> vec3f {
  return select(1.0 - min(vec3f(1.0), (1.0 - base) / max(layer, vec3f(0.001))), vec3f(0.0), layer == vec3f(0.0));
}
fn blendLinearBurn(base: vec3f, layer: vec3f) -> vec3f { return max(base + layer - 1.0, vec3f(0.0)); }

fn blendLighten(base: vec3f, layer: vec3f) -> vec3f { return max(base, layer); }
fn blendScreen(base: vec3f, layer: vec3f) -> vec3f { return 1.0 - (1.0 - base) * (1.0 - layer); }
fn blendColorDodge(base: vec3f, layer: vec3f) -> vec3f {
  return select(min(vec3f(1.0), base / max(1.0 - layer, vec3f(0.001))), vec3f(1.0), layer == vec3f(1.0));
}
fn blendLinearDodge(base: vec3f, layer: vec3f) -> vec3f { return min(base + layer, vec3f(1.0)); }

fn blendOverlay(base: vec3f, layer: vec3f) -> vec3f {
  return select(
    1.0 - 2.0 * (1.0 - base) * (1.0 - layer),
    2.0 * base * layer,
    base <= vec3f(0.5)
  );
}
fn blendSoftLight(base: vec3f, layer: vec3f) -> vec3f {
  return select(
    base + (2.0 * layer - 1.0) * (sqrt(base) - base),
    base - (1.0 - 2.0 * layer) * base * (1.0 - base),
    layer <= vec3f(0.5)
  );
}
fn blendHardLight(base: vec3f, layer: vec3f) -> vec3f {
  return select(
    1.0 - 2.0 * (1.0 - base) * (1.0 - layer),
    2.0 * base * layer,
    layer <= vec3f(0.5)
  );
}
fn blendVividLight(base: vec3f, layer: vec3f) -> vec3f {
  return select(
    blendColorDodge(base, 2.0 * (layer - 0.5)),
    blendColorBurn(base, 2.0 * layer),
    layer <= vec3f(0.5)
  );
}
fn blendLinearLight(base: vec3f, layer: vec3f) -> vec3f {
  return clamp(base + 2.0 * layer - 1.0, vec3f(0.0), vec3f(1.0));
}
fn blendPinLight(base: vec3f, layer: vec3f) -> vec3f {
  return select(
    max(base, 2.0 * (layer - 0.5)),
    min(base, 2.0 * layer),
    layer <= vec3f(0.5)
  );
}
fn blendHardMix(base: vec3f, layer: vec3f) -> vec3f {
  return select(vec3f(0.0), vec3f(1.0), base + layer >= vec3f(1.0));
}

fn blendDifference(base: vec3f, layer: vec3f) -> vec3f { return abs(base - layer); }
fn blendExclusion(base: vec3f, layer: vec3f) -> vec3f { return base + layer - 2.0 * base * layer; }
fn blendSubtract(base: vec3f, layer: vec3f) -> vec3f { return max(base - layer, vec3f(0.0)); }
fn blendDivide(base: vec3f, layer: vec3f) -> vec3f { return min(base / max(layer, vec3f(0.001)), vec3f(1.0)); }

fn blendHue(base: vec3f, layer: vec3f) -> vec3f {
  let bHsl = compositor_rgb2hsl(base);
  let lHsl = compositor_rgb2hsl(layer);
  return compositor_hsl2rgb(vec3f(lHsl.x, bHsl.y, bHsl.z));
}
fn blendSaturation(base: vec3f, layer: vec3f) -> vec3f {
  let bHsl = compositor_rgb2hsl(base);
  let lHsl = compositor_rgb2hsl(layer);
  return compositor_hsl2rgb(vec3f(bHsl.x, lHsl.y, bHsl.z));
}
fn blendColor(base: vec3f, layer: vec3f) -> vec3f {
  let lHsl = compositor_rgb2hsl(layer);
  let bL = compositor_lum(base);
  return compositor_setLum(compositor_hsl2rgb(vec3f(lHsl.x, lHsl.y, 0.5)), bL);
}
fn blendLuminosity(base: vec3f, layer: vec3f) -> vec3f {
  return compositor_setLum(base, compositor_lum(layer));
}

// ─── Dispatch by mode index ───

fn applyBlendMode(base: vec3f, layer: vec3f, mode: u32) -> vec3f {
  switch (mode) {
    case 0u:  { return blendNormal(base, layer); }
    case 1u:  { return blendNormal(base, layer); } // dissolve handled by caller
    case 2u:  { return blendDarken(base, layer); }
    case 3u:  { return blendMultiply(base, layer); }
    case 4u:  { return blendColorBurn(base, layer); }
    case 5u:  { return blendLinearBurn(base, layer); }
    case 6u:  { return blendLighten(base, layer); }
    case 7u:  { return blendScreen(base, layer); }
    case 8u:  { return blendColorDodge(base, layer); }
    case 9u:  { return blendLinearDodge(base, layer); }
    case 10u: { return blendOverlay(base, layer); }
    case 11u: { return blendSoftLight(base, layer); }
    case 12u: { return blendHardLight(base, layer); }
    case 13u: { return blendVividLight(base, layer); }
    case 14u: { return blendLinearLight(base, layer); }
    case 15u: { return blendPinLight(base, layer); }
    case 16u: { return blendHardMix(base, layer); }
    case 17u: { return blendDifference(base, layer); }
    case 18u: { return blendExclusion(base, layer); }
    case 19u: { return blendSubtract(base, layer); }
    case 20u: { return blendDivide(base, layer); }
    case 21u: { return blendHue(base, layer); }
    case 22u: { return blendSaturation(base, layer); }
    case 23u: { return blendColor(base, layer); }
    case 24u: { return blendLuminosity(base, layer); }
    default:  { return blendNormal(base, layer); }
  }
}

fn compositorHash21(p: vec2f) -> f32 {
  let p3 = fract(vec3f(p.xyx) * 0.1031);
  let q = p3 + dot(p3, p3.yzx + vec3f(33.33));
  return fract((q.x + q.y) * q.z);
}

fn compositeDissolveAlpha(alpha: f32, seed: vec2f) -> f32 {
  return select(0.0, 1.0, compositorHash21(seed) < alpha);
}

fn compositeBlendSourceOver(
  baseColor: vec4f,
  layerColor: vec4f,
  sourceAlpha: f32,
  postDissolveAlpha: f32,
  mode: u32,
  seed: vec2f,
  dissolveAlpha: f32
) -> vec4f {
  var srcAlpha = clamp(sourceAlpha, 0.0, 1.0);
  if (mode == 1u) {
    let ditherAlpha = clamp(dissolveAlpha, 0.0, 1.0);
    let coverage = compositeDissolveAlpha(ditherAlpha, seed);
    srcAlpha = coverage * clamp(srcAlpha / max(ditherAlpha, 0.00001), 0.0, 1.0);
  }
  srcAlpha *= clamp(postDissolveAlpha, 0.0, 1.0);
  if (srcAlpha <= 0.0) {
    return baseColor;
  }

  let baseAlpha = clamp(baseColor.a, 0.0, 1.0);
  let blended = applyBlendMode(baseColor.rgb, layerColor.rgb, mode);
  let premulRgb =
    blended * baseAlpha * srcAlpha +
    layerColor.rgb * srcAlpha * (1.0 - baseAlpha) +
    baseColor.rgb * baseAlpha * (1.0 - srcAlpha);
  let outAlpha = srcAlpha + baseAlpha * (1.0 - srcAlpha);
  let outRgb = select(vec3f(0.0), premulRgb / max(outAlpha, 0.00001), outAlpha > 0.00001);
  return vec4f(outRgb, outAlpha);
}
`,En=`
${o}

${Tn}

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var baseTex: texture_2d<f32>;
@group(0) @binding(2) var layerTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> u: vec4f;

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let baseColor = textureSampleLevel(baseTex, texSampler, input.uv, 0.0);
  let layerColor = textureSampleLevel(layerTex, texSampler, input.uv, 0.0);
  let layerAlpha = layerColor.a * u.x;
  if (layerAlpha <= 0.0) {
    return baseColor;
  }
  return compositeBlendSourceOver(
    baseColor,
    layerColor,
    layerAlpha,
    1.0,
    bitcast<u32>(u.y),
    input.uv * 8192.0,
    u.x
  );
}
`;var Dn=class{pipeline;sampler;bindGroupLayout;uniformBuffer;constructor(e){this.device=e,this.sampler=e.createSampler({magFilter:`linear`,minFilter:`linear`});let t=e.createShaderModule({label:`media-blend`,code:En});this.bindGroupLayout=e.createBindGroupLayout({label:`media-blend-layout`,entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:3,visibility:GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}}]}),this.pipeline=e.createRenderPipeline({label:`media-blend-pipeline`,layout:e.createPipelineLayout({bindGroupLayouts:[this.bindGroupLayout]}),vertex:{module:t,entryPoint:`vertexMain`},fragment:{module:t,entryPoint:`fragmentMain`,targets:[{format:`rgba8unorm`}]},primitive:{topology:`triangle-list`}}),this.uniformBuffer=e.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})}blend(e,t,n,r,i=1){if(e.width!==t.width||e.height!==t.height||n.width!==e.width||n.height!==e.height)return!1;let a=new Float32Array([i,0,0,0]);new Uint32Array(a.buffer,4,1)[0]=wn[r]??0,this.device.queue.writeBuffer(this.uniformBuffer,0,a);let o=this.device.createBindGroup({layout:this.bindGroupLayout,entries:[{binding:0,resource:this.sampler},{binding:1,resource:e.createView()},{binding:2,resource:t.createView()},{binding:3,resource:{buffer:this.uniformBuffer}}]}),s=this.device.createCommandEncoder(),c=s.beginRenderPass({colorAttachments:[{view:n.createView(),loadOp:`clear`,clearValue:{r:0,g:0,b:0,a:0},storeOp:`store`}]});return c.setPipeline(this.pipeline),c.setBindGroup(0,o),c.draw(6),c.end(),this.device.queue.submit([s.finish()]),!0}destroy(){this.uniformBuffer.destroy()}};const On=`
${o}

struct ShapeUniforms {
  outputSize: vec2f,
  shapeKind: f32,
  opacity: f32,
  transformRect: vec4f,
  fillColor: vec4f,
  strokeColor: vec4f,
  shapeParams: vec4f,
  flags: vec4f,
  pathVertices: array<vec4f, 32>,
};

@group(0) @binding(0) var<uniform> u: ShapeUniforms;

fn sdBox(p: vec2f, b: vec2f) -> f32 {
  let q = abs(p) - b;
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0);
}

fn sdRoundedBox(p: vec2f, b: vec2f, r: f32) -> f32 {
  return sdBox(p, max(b - vec2f(r), vec2f(0.0))) - r;
}

fn sdEllipse(p: vec2f, r: vec2f) -> f32 {
  let q = p / max(r, vec2f(0.001));
  return (length(q) - 1.0) * min(r.x, r.y);
}

fn cross2(a: vec2f, b: vec2f) -> f32 {
  return a.x * b.y - a.y * b.x;
}

fn sdSegment(p: vec2f, a: vec2f, b: vec2f) -> f32 {
  let pa = p - a;
  let ba = b - a;
  let h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.001), 0.0, 1.0);
  return length(pa - ba * h);
}

fn triangleSigned(p: vec2f, a: vec2f, b: vec2f, c: vec2f) -> f32 {
  let edgeDistance = min(min(sdSegment(p, a, b), sdSegment(p, b, c)), sdSegment(p, c, a));
  let s0 = cross2(b - a, p - a);
  let s1 = cross2(c - b, p - b);
  let s2 = cross2(a - c, p - c);
  let hasNegative = s0 < 0.0 || s1 < 0.0 || s2 < 0.0;
  let hasPositive = s0 > 0.0 || s1 > 0.0 || s2 > 0.0;
  let outside = hasNegative && hasPositive;
  return select(-edgeDistance, edgeDistance, outside);
}

fn polarShapeDistance(p: vec2f, points: f32, innerRatio: f32, star: bool) -> f32 {
  let angle = atan2(p.y, p.x) + 1.57079632679;
  let n = max(points, 3.0);
  let outer = 1.0;
  let inner = clamp(innerRatio, 0.05, 0.95);
  let sector = 6.28318530718 / n;
  let local = abs(fract(angle / sector + 0.5) - 0.5) * sector;
  let edgeRadius = select(cos(3.14159265359 / n) / max(cos(local), 0.001), mix(inner, outer, local / (sector * 0.5)), star);
  return length(p) - edgeRadius;
}

fn heartDistance(p: vec2f) -> f32 {
  let q = vec2f(p.x, -p.y * 1.12 + 0.18);
  let a = q.x * q.x + q.y * q.y - 1.0;
  let implicit = a * a * a - q.x * q.x * q.y * q.y * q.y;
  return implicit * 18.0;
}

fn pathPolygonDistance(p: vec2f, count: u32) -> f32 {
  var minDistance = 1.0e6;
  var inside = false;
  var previous = u.pathVertices[count - 1u].xy;
  for (var i = 0u; i < 32u; i = i + 1u) {
    if (i >= count) {
      break;
    }
    let current = u.pathVertices[i].xy;
    minDistance = min(minDistance, sdSegment(p, previous, current));
    let dy = previous.y - current.y;
    let safeDy = select(select(0.00001, -0.00001, dy < 0.0), dy, abs(dy) > 0.00001);
    let crosses = ((current.y > p.y) != (previous.y > p.y)) &&
      (p.x < (previous.x - current.x) * (p.y - current.y) / safeDy + current.x);
    if (crosses) {
      inside = !inside;
    }
    previous = current;
  }
  return select(minDistance, -minDistance, inside);
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let pixel = input.uv * u.outputSize;
  let halfSize = u.transformRect.zw * 0.5;
  let center = u.transformRect.xy + halfSize;
  let relative = pixel - center;
  let cosR = cos(-u.flags.x);
  let sinR = sin(-u.flags.x);
  let localPx = vec2f(relative.x * cosR - relative.y * sinR, relative.x * sinR + relative.y * cosR);
  var d = 1.0e6;
  if (u.shapeKind < 0.5) {
    d = sdRoundedBox(localPx, halfSize, u.shapeParams.x);
  } else if (u.shapeKind < 2.5) {
    d = sdEllipse(localPx, halfSize);
  } else if (u.shapeKind < 3.5) {
    let dir = u.shapeParams.y;
    var a = vec2f(0.0, -halfSize.y);
    var b = vec2f(halfSize.x, halfSize.y);
    var c = vec2f(-halfSize.x, halfSize.y);
    if (dir > 0.5 && dir < 1.5) {
      a = vec2f(0.0, halfSize.y); b = vec2f(-halfSize.x, -halfSize.y); c = vec2f(halfSize.x, -halfSize.y);
    } else if (dir > 1.5 && dir < 2.5) {
      a = vec2f(-halfSize.x, 0.0); b = vec2f(halfSize.x, -halfSize.y); c = vec2f(halfSize.x, halfSize.y);
    } else if (dir > 2.5) {
      a = vec2f(halfSize.x, 0.0); b = vec2f(-halfSize.x, halfSize.y); c = vec2f(-halfSize.x, -halfSize.y);
    }
    d = triangleSigned(localPx, a, b, c);
  } else if (u.shapeKind > 5.5 && u.shapeKind < 6.5) {
    let heartBase = min(halfSize.x, halfSize.y);
    let heartHalf = vec2f(heartBase, heartBase / 1.1);
    d = heartDistance(localPx / max(heartHalf, vec2f(0.001))) * heartBase;
  } else if (u.shapeKind > 6.5 && u.shapeKind < 7.5) {
    d = pathPolygonDistance(localPx, u32(u.shapeParams.z));
  } else {
    let normalized = localPx / max(halfSize, vec2f(0.001));
    d = polarShapeDistance(normalized, u.shapeParams.z, u.shapeParams.w, u.shapeKind > 4.5) * min(halfSize.x, halfSize.y);
  }

  let edgeSoftness = max(u.flags.w, 0.75);
  let fillAlpha = 1.0 - smoothstep(-edgeSoftness, edgeSoftness, d);
  let strokeWidth = max(u.shapeParams.y, 0.0);
  let strokeAlpha = select(0.0, 1.0 - smoothstep(strokeWidth - 0.75, strokeWidth + 0.75, abs(d)), strokeWidth > 0.0);
  let color = mix(u.fillColor, u.strokeColor, strokeAlpha);
  let alpha = max(fillAlpha, strokeAlpha) * color.a * u.opacity;
  return vec4f(color.rgb, alpha);
}
`;var kn=class{replacePipeline;blendPipeline;bindGroupLayout;uniformBuffer;bindGroup=null;constructor(e){this.device=e;let t=e.createShaderModule({label:`shape-render`,code:On});this.bindGroupLayout=e.createBindGroupLayout({label:`shape-render-layout`,entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}}]}),this.replacePipeline=this.createRenderPipeline(t,!1),this.blendPipeline=this.createRenderPipeline(t,!0),this.uniformBuffer=e.createBuffer({size:152*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})}createRenderPipeline(e,t){return this.device.createRenderPipeline({label:`shape-render-pipeline`,layout:this.device.createPipelineLayout({bindGroupLayouts:[this.bindGroupLayout]}),vertex:{module:e,entryPoint:`vertexMain`},fragment:{module:e,entryPoint:`fragmentMain`,targets:[{format:`rgba8unorm`,blend:t?{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}:void 0}]},primitive:{topology:`triangle-list`}})}renderShapeToTexture(e,t){if(e.width!==t.outputWidth||e.height!==t.outputHeight)return!1;let n=An(t.shapeType);if(n===null)return!1;let r=t.direction===`down`?1:t.direction===`left`?2:t.direction===`right`?3:0,i=t.strokeColor??t.fillColor,a=t.pathVertices??[],o=new Float32Array([t.outputWidth,t.outputHeight,n,t.opacity??1,t.transformRect.x,t.transformRect.y,t.transformRect.width,t.transformRect.height,...t.fillColor,...i,t.cornerRadius??0,t.strokeWidth??0,t.shapeType===`path`?a.length:t.points??(t.shapeType===`polygon`?6:5),t.innerRadius??.5,t.rotationRad??0,t.aspectRatioLocked===!1?0:1,r,t.maskFeatherPixels??0,...jn(a)]);this.device.queue.writeBuffer(this.uniformBuffer,0,o);let s=this.ensureBindGroup(),c=this.device.createCommandEncoder(),l=c.beginRenderPass({colorAttachments:[{view:e.createView(),loadOp:t.clear===!1?`load`:`clear`,clearValue:{r:0,g:0,b:0,a:0},storeOp:`store`}]});return l.setPipeline(t.blend?this.blendPipeline:this.replacePipeline),l.setBindGroup(0,s),l.draw(6),l.end(),this.device.queue.submit([c.finish()]),!0}destroy(){this.uniformBuffer.destroy()}ensureBindGroup(){return this.bindGroup||=this.device.createBindGroup({layout:this.bindGroupLayout,entries:[{binding:0,resource:{buffer:this.uniformBuffer}}]}),this.bindGroup}};function An(e){switch(e){case`rectangle`:return 0;case`circle`:return 1;case`ellipse`:return 2;case`triangle`:return 3;case`polygon`:return 4;case`star`:return 5;case`heart`:return 6;case`path`:return 7;default:return null}}function jn(e){let t=[];for(let n=0;n<32;n++){let r=e[n]??[0,0];t.push(r[0],r[1],0,0)}return t}const X=2048,Mn=4096,Nn=`__solid__`;var Pn=class{atlasTexture;sampler;uniformBuffer;vertexBuffer;bindGroup;pipeline;glyphs=new Map;scratchCanvas;scratchCtx;nextX=0;nextY=0;rowHeight=0;atlasExhausted=!1;constructor(e){this.device=e;let t=new OffscreenCanvas(1,1),n=t.getContext(`2d`,{willReadFrequently:!0});if(!n)throw Error(`Unable to create glyph atlas canvas context`);this.scratchCanvas=t,this.scratchCtx=n,this.atlasTexture=e.createTexture({label:`glyph-atlas-texture`,size:{width:X,height:X},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),this.sampler=e.createSampler({magFilter:`linear`,minFilter:`linear`,addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`}),this.uniformBuffer=e.createBuffer({label:`glyph-atlas-text-uniforms`,size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.vertexBuffer=e.createBuffer({label:`glyph-atlas-text-vertices`,size:Mn*6*20*4,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});let r=e.createShaderModule({label:`glyph-atlas-text`,code:`
struct VertexInput {
  @location(0) position: vec2f,
  @location(1) atlasUv: vec2f,
  @location(2) color: vec4f,
  @location(3) solidMode: f32,
  @location(4) solidRect: vec4f,
  @location(5) solidRadius: f32,
  @location(6) strokeColor: vec4f,
  @location(7) strokeWidth: f32,
  @location(8) shadowBlur: f32,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) atlasUv: vec2f,
  @location(1) color: vec4f,
  @location(2) pixel: vec2f,
  @location(3) solidMode: f32,
  @location(4) solidRect: vec4f,
  @location(5) solidRadius: f32,
  @location(6) strokeColor: vec4f,
  @location(7) strokeWidth: f32,
  @location(8) shadowBlur: f32,
};

struct TextUniforms {
  outputSize: vec2f,
  atlasSize: vec2f,
};

@group(0) @binding(0) var atlasSampler: sampler;
@group(0) @binding(1) var atlasTex: texture_2d<f32>;
@group(0) @binding(2) var<uniform> u: TextUniforms;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  let clip = vec2f(
    input.position.x / u.outputSize.x * 2.0 - 1.0,
    1.0 - input.position.y / u.outputSize.y * 2.0
  );
  var output: VertexOutput;
  output.position = vec4f(clip, 0.0, 1.0);
  output.atlasUv = input.atlasUv;
  output.color = input.color;
  output.pixel = input.position;
  output.solidMode = input.solidMode;
  output.solidRect = input.solidRect;
  output.solidRadius = input.solidRadius;
  output.strokeColor = input.strokeColor;
  output.strokeWidth = input.strokeWidth;
  output.shadowBlur = input.shadowBlur;
  return output;
}

fn sdRoundedBox(p: vec2f, b: vec2f, r: f32) -> f32 {
  let radius = min(r, min(b.x, b.y));
  let q = abs(p) - max(b - vec2f(radius), vec2f(0.0));
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - radius;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let distanceAlpha = textureSample(atlasTex, atlasSampler, input.atlasUv).a;
  let halfSize = input.solidRect.zw * 0.5;
  let center = input.solidRect.xy + halfSize;
  let rectDistance = sdRoundedBox(input.pixel - center, halfSize, input.solidRadius);
  let solidAlpha = 1.0 - smoothstep(-0.75, 0.75, rectDistance);
  let blurBand = input.shadowBlur / 32.0;
  let glyphEdgeMin = 0.48 - blurBand;
  let glyphEdgeMax = 0.54 + blurBand;
  let fillAlpha = smoothstep(glyphEdgeMin, glyphEdgeMax, distanceAlpha) * input.color.a;
  let strokeBand = clamp(input.strokeWidth / 16.0, 0.0, 0.49);
  let strokeAlpha = smoothstep(0.5 - strokeBand - 0.04, 0.5 - strokeBand + 0.04, distanceAlpha) * input.strokeColor.a;
  let glyphAlpha = fillAlpha + strokeAlpha * (1.0 - fillAlpha);
  let glyphRgb = mix(input.strokeColor.rgb, input.color.rgb, select(0.0, fillAlpha / max(glyphAlpha, 0.0001), glyphAlpha > 0.0));
  let alpha = mix(glyphAlpha, solidAlpha * input.color.a, input.solidMode);
  let rgb = mix(glyphRgb, input.color.rgb, input.solidMode);
  return vec4f(rgb, alpha);
}
`}),i=e.createBindGroupLayout({label:`glyph-atlas-text-layout`,entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.VERTEX,buffer:{type:`uniform`}}]});this.bindGroup=e.createBindGroup({label:`glyph-atlas-text-bind-group`,layout:i,entries:[{binding:0,resource:this.sampler},{binding:1,resource:this.atlasTexture.createView()},{binding:2,resource:{buffer:this.uniformBuffer}}]}),this.pipeline=e.createRenderPipeline({label:`glyph-atlas-text-pipeline`,layout:e.createPipelineLayout({bindGroupLayouts:[i]}),vertex:{module:r,entryPoint:`vertexMain`,buffers:[{arrayStride:80,attributes:[{shaderLocation:0,offset:0,format:`float32x2`},{shaderLocation:1,offset:8,format:`float32x2`},{shaderLocation:2,offset:16,format:`float32x4`},{shaderLocation:3,offset:32,format:`float32`},{shaderLocation:4,offset:36,format:`float32x4`},{shaderLocation:5,offset:52,format:`float32`},{shaderLocation:6,offset:56,format:`float32x4`},{shaderLocation:7,offset:72,format:`float32`},{shaderLocation:8,offset:76,format:`float32`}]}]},fragment:{module:r,entryPoint:`fragmentMain`,targets:[{format:`rgba8unorm`,blend:{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}}]},primitive:{topology:`triangle-list`}})}renderTextToTexture(e,t){if(e.width!==t.outputWidth||e.height!==t.outputHeight)return!1;let n=this.layoutText(t.item,t.width,t.height);if(!n&&this.atlasExhausted&&(this.resetAtlas(),n=this.layoutText(t.item,t.width,t.height)),!n)return!1;if(n.glyphs.length===0)return this.clearTexture(e);if(n.glyphs.length>Mn)return!1;let r=new Float32Array(n.glyphs.length*6*20),i=0;for(let e of n.glyphs)i=Fn(r,i,e);this.device.queue.writeBuffer(this.vertexBuffer,0,r,0,i),this.device.queue.writeBuffer(this.uniformBuffer,0,new Float32Array([t.outputWidth,t.outputHeight,X,X]));let a=this.device.createCommandEncoder(),o=a.beginRenderPass({colorAttachments:[{view:e.createView(),loadOp:`clear`,storeOp:`store`}]});return o.setPipeline(this.pipeline),o.setBindGroup(0,this.bindGroup),o.setVertexBuffer(0,this.vertexBuffer),o.draw(n.glyphs.length*6),o.end(),this.device.queue.submit([a.finish()]),!0}destroy(){this.atlasTexture.destroy(),this.uniformBuffer.destroy(),this.vertexBuffer.destroy()}clearTexture(e){let t=this.device.createCommandEncoder();return t.beginRenderPass({colorAttachments:[{view:e.createView(),loadOp:`clear`,storeOp:`store`}]}).end(),this.device.queue.submit([t.finish()]),!0}layoutText(e,t,n){let r=ve(e,t,n,this.createMeasurer()),i=[];if(e.backgroundColor&&r.background){let t=Ln(e.backgroundColor),n=this.ensureSolidGlyph();if(!t||!n)return null;let a=r.background;i.push({metrics:n,x:a.x,y:a.y,width:a.width,height:a.height,color:t,solidRadius:a.radius})}let a=e.textShadow,o=a?Ln(a.color):void 0;if(a&&!o)return null;let s=Math.max(0,e.stroke?.width??0),c;if(s>0){let t=Ln(e.stroke?.color??`#000000`);if(!t)return null;c=t}for(let e of r.lines){let t=Ln(e.color);if(!t)return null;let n=e.baselineY,r=e.startX;for(let l of e.text){let u=this.ensureGlyph(l,e.cssFont,e.fontSize);if(!u)return null;l!==` `&&(a&&o&&i.push({metrics:u,x:r+u.offsetX+a.offsetX,y:n+u.offsetY+a.offsetY,width:u.contentWidth,height:u.contentHeight,color:o,shadowBlur:Math.max(0,a.blur)}),i.push({metrics:u,x:r+u.offsetX,y:n+u.offsetY,width:u.contentWidth,height:u.contentHeight,color:t,strokeColor:c,strokeWidth:s})),r+=u.advance+e.letterSpacing}let l=ye(e);if(e.underline&&l>0){let r=this.ensureSolidGlyph();if(!r)return null;let s=n+Math.max(1,e.fontSize*.08),c=Math.max(1,e.fontSize*.05);a&&o&&i.push({metrics:r,x:e.startX+a.offsetX,y:s+a.offsetY,width:l,height:c,color:o,solidRadius:0}),i.push({metrics:r,x:e.startX,y:s,width:l,height:c,color:t,solidRadius:0})}}return{glyphs:i}}createMeasurer(){return{measure:(e,t,n)=>{let r=be(t),i=0;for(let n of e)i+=this.ensureGlyph(n,t,r)?.advance??0;return i+e.length*n},fontMetrics:e=>this.measureFont(e,be(e))}}measureFont(e,t){this.scratchCtx.font=e;let n=this.scratchCtx.measureText(`Hg`);return{ascent:n.fontBoundingBoxAscent||t*.8,descent:n.fontBoundingBoxDescent||t*.2}}ensureGlyph(e,t,n){let r=`${t}\n${e}`,i=this.glyphs.get(r);if(i)return i;this.scratchCtx.font=t,this.scratchCtx.textBaseline=`alphabetic`;let a=this.scratchCtx.measureText(e),o=a.actualBoundingBoxAscent||a.fontBoundingBoxAscent||n*.8,s=a.actualBoundingBoxDescent||a.fontBoundingBoxDescent||n*.2,c=a.actualBoundingBoxLeft||0,l=a.actualBoundingBoxRight||a.width,u=Math.max(1,Math.ceil(c+l)),d=Math.max(1,Math.ceil(o+s)),f=u+24,p=d+24,m=this.allocateGlyph(f,p);if(!m)return null;this.scratchCanvas.width=f,this.scratchCanvas.height=p,this.scratchCtx.clearRect(0,0,f,p),this.scratchCtx.font=t,this.scratchCtx.textBaseline=`alphabetic`,this.scratchCtx.fillStyle=`#ffffff`,this.scratchCtx.fillText(e,12+c,12+o);let h=In(this.scratchCtx.getImageData(0,0,f,p).data,f,p);this.uploadGlyph(m.x,m.y,f,p,h);let g={key:r,char:e,font:t,atlasX:m.x,atlasY:m.y,atlasWidth:f,atlasHeight:p,contentWidth:f,contentHeight:p,offsetX:-12-c,offsetY:-12-o,advance:a.width};return this.glyphs.set(r,g),g}ensureSolidGlyph(){let e=this.glyphs.get(Nn);if(e)return e;let t=this.allocateGlyph(1,1);if(!t)return null;this.uploadGlyph(t.x,t.y,1,1,new Uint8Array([255,255,255,255]));let n={key:Nn,char:``,font:``,atlasX:t.x,atlasY:t.y,atlasWidth:1,atlasHeight:1,contentWidth:1,contentHeight:1,offsetX:0,offsetY:0,advance:0};return this.glyphs.set(Nn,n),n}allocateGlyph(e,t){if(e>X||t>X)return null;if(this.nextX+e>X&&(this.nextX=0,this.nextY+=this.rowHeight,this.rowHeight=0),this.nextY+t>X)return this.atlasExhausted=!0,null;let n={x:this.nextX,y:this.nextY};return this.nextX+=e,this.rowHeight=Math.max(this.rowHeight,t),n}resetAtlas(){this.glyphs.clear(),this.nextX=0,this.nextY=0,this.rowHeight=0,this.atlasExhausted=!1}uploadGlyph(e,t,n,r,i){let a=Rn(n*4,256),o=new Uint8Array(a*r);for(let e=0;e<r;e++)o.set(i.subarray(e*n*4,(e+1)*n*4),e*a);this.device.queue.writeTexture({texture:this.atlasTexture,origin:{x:e,y:t}},o,{bytesPerRow:a,rowsPerImage:r},{width:n,height:r})}};function Fn(e,t,n){let{metrics:r}=n,{color:i}=n,a=n.x,o=n.y,s=n.x+n.width,c=n.y+n.height,l=r.atlasX/X,u=r.atlasY/X,d=(r.atlasX+r.atlasWidth)/X,f=(r.atlasY+r.atlasHeight)/X,p=[[a,o,l,u],[s,o,d,u],[a,c,l,f],[a,c,l,f],[s,o,d,u],[s,c,d,f]],m=n.solidRadius===void 0?0:1,h=n.solidRadius??0,g=n.strokeColor??[0,0,0,0],_=n.strokeWidth??0,v=n.shadowBlur??0;for(let r of p)e[t++]=r[0]??0,e[t++]=r[1]??0,e[t++]=r[2]??0,e[t++]=r[3]??0,e[t++]=i[0],e[t++]=i[1],e[t++]=i[2],e[t++]=i[3],e[t++]=m,e[t++]=a,e[t++]=o,e[t++]=n.width,e[t++]=n.height,e[t++]=h,e[t++]=g[0],e[t++]=g[1],e[t++]=g[2],e[t++]=g[3],e[t++]=_,e[t++]=v;return t}function In(e,t,n){let r=new Uint8Array(t*n);for(let t=0;t<r.length;t++)r[t]=e[t*4+3]??0;let i=new Uint8Array(t*n*4);for(let e=0;e<n;e++)for(let a=0;a<t;a++){let o=e*t+a,s=r[o]>127,c=8;for(let i=-8;i<=8;i++){let o=e+i;if(!(o<0||o>=n))for(let e=-8;e<=8;e++){let n=a+e;n<0||n>=t||r[o*t+n]>127!==s&&(c=Math.min(c,Math.hypot(e,i)))}}let l=s?c:-c,u=Math.max(0,Math.min(255,Math.round((.5+l/16)*255))),d=o*4;i[d]=255,i[d+1]=255,i[d+2]=255,i[d+3]=u}return i}function Ln(e){if(e.startsWith(`#`)){let t=e.slice(1);if(t.length===3||t.length===4){let e=t.split(``),n=parseInt(`${e[0]}${e[0]}`,16),r=parseInt(`${e[1]}${e[1]}`,16),i=parseInt(`${e[2]}${e[2]}`,16),a=e[3]?parseInt(`${e[3]}${e[3]}`,16):255;return[n/255,r/255,i/255,a/255]}if(t.length===6||t.length===8){let e=parseInt(t.slice(0,2),16),n=parseInt(t.slice(2,4),16),r=parseInt(t.slice(4,6),16),i=t.length===8?parseInt(t.slice(6,8),16):255;return[e/255,n/255,r/255,i/255]}}return null}function Rn(e,t){return Math.ceil(e/t)*t}const zn=t(`CompositorPipeline`),Bn=`
${o}

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var inputTex: texture_2d<f32>;

@fragment
fn blitFragment(input: VertexOutput) -> @location(0) vec4f {
  // Composite textures store straight alpha; canvas expects premultiplied
  let c = textureSample(inputTex, texSampler, input.uv);
  return vec4f(c.rgb * c.a, c.a);
}
`,Vn=o,Hn=`
struct CompositeUniforms {
  opacity: f32,            // 0
  blendMode: u32,          // 1
  posX: f32,               // 2
  posY: f32,               // 3
  scaleX: f32,             // 4
  scaleY: f32,             // 5
  rotationZ: f32,          // 6
  sourceAspect: f32,       // 7
  outputAspect: f32,       // 8
  time: f32,               // 9
  hasMask: u32,            // 10
  maskInvert: u32,         // 11
  rotationX: f32,          // 12
  rotationY: f32,          // 13
  perspective: f32,        // 14
  maskFeather: f32,        // 15
};
`,Un=`
${Tn}
${Hn}

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var baseTex: texture_2d<f32>;
@group(0) @binding(2) var layerTex: texture_2d<f32>;
@group(0) @binding(3) var<uniform> u: CompositeUniforms;
@group(0) @binding(4) var maskTex: texture_2d<f32>;

fn transformUV(uv: vec2f) -> vec2f {
  // Center UV around origin
  var p = uv - vec2f(0.5);

  // Apply scale
  p /= vec2f(u.scaleX, u.scaleY);

  // Apply 2D rotation
  let cosR = cos(u.rotationZ);
  let sinR = sin(u.rotationZ);
  p = vec2f(p.x * cosR + p.y * sinR, -p.x * sinR + p.y * cosR);

  // Apply 3D perspective rotation (X and Y axis)
  if (u.perspective > 0.0) {
    let cosX = cos(u.rotationX);
    let sinX = sin(u.rotationX);
    let cosY = cos(u.rotationY);
    let sinY = sin(u.rotationY);

    // Y-axis rotation
    let pz = p.x * sinY;
    let px = p.x * cosY;
    // X-axis rotation
    let py = p.y * cosX - pz * sinX;
    let pzz = p.y * sinX + pz * cosX;

    // Perspective projection
    let w = 1.0 + pzz / u.perspective;
    if (w <= 0.001) { return vec2f(-1.0); } // behind camera
    p = vec2f(px, py) / w;
  }

  // Apply position offset
  p -= vec2f(u.posX, u.posY);

  // Correct aspect ratio
  p.x *= u.outputAspect / max(u.sourceAspect, 0.001);

  return p + vec2f(0.5);
}

@fragment
fn compositeFragment(input: VertexOutput) -> @location(0) vec4f {
  let baseColor = textureSampleLevel(baseTex, texSampler, input.uv, 0.0);

  // Transform UV to sample layer texture
  let layerUV = transformUV(input.uv);
  let inBounds = layerUV.x >= 0.0 && layerUV.x <= 1.0 && layerUV.y >= 0.0 && layerUV.y <= 1.0;
  let sampleUV = clamp(layerUV, vec2f(0.0), vec2f(1.0));
  var layerColor = textureSampleLevel(layerTex, texSampler, sampleUV, 0.0);

  // Apply mask
  var maskValue = 1.0;
  if (u.hasMask != 0u) {
    maskValue = textureSampleLevel(maskTex, texSampler, input.uv, 0.0).a;
    if (u.maskInvert != 0u) {
      maskValue = 1.0 - maskValue;
    }
  }

  let sourceAlpha = layerColor.a * u.opacity;
  let postDissolveAlpha = maskValue * select(0.0, 1.0, inBounds);
  if (sourceAlpha * postDissolveAlpha <= 0.0) {
    return baseColor;
  }

  return compositeBlendSourceOver(
    baseColor,
    layerColor,
    sourceAlpha,
    postDissolveAlpha,
    u.blendMode,
    input.uv * 8192.0,
    u.opacity
  );
}
`,Wn=`
${Tn}
${Hn}

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var baseTex: texture_2d<f32>;
@group(0) @binding(2) var layerTex: texture_external;
@group(0) @binding(3) var<uniform> u: CompositeUniforms;
@group(0) @binding(4) var maskTex: texture_2d<f32>;

fn transformUV_ext(uv: vec2f) -> vec2f {
  var p = uv - vec2f(0.5);
  p /= vec2f(u.scaleX, u.scaleY);
  let cosR = cos(u.rotationZ);
  let sinR = sin(u.rotationZ);
  p = vec2f(p.x * cosR + p.y * sinR, -p.x * sinR + p.y * cosR);
  if (u.perspective > 0.0) {
    let cosX = cos(u.rotationX);
    let sinX = sin(u.rotationX);
    let cosY = cos(u.rotationY);
    let sinY = sin(u.rotationY);
    let pz = p.x * sinY;
    let px = p.x * cosY;
    let py = p.y * cosX - pz * sinX;
    let pzz = p.y * sinX + pz * cosX;
    let w = 1.0 + pzz / u.perspective;
    if (w <= 0.001) { return vec2f(-1.0); }
    p = vec2f(px, py) / w;
  }
  p -= vec2f(u.posX, u.posY);
  p.x *= u.outputAspect / max(u.sourceAspect, 0.001);
  return p + vec2f(0.5);
}

@fragment
fn compositeExternalFragment(input: VertexOutput) -> @location(0) vec4f {
  let baseColor = textureSampleLevel(baseTex, texSampler, input.uv, 0.0);
  let layerUV = transformUV_ext(input.uv);
  let inBounds = layerUV.x >= 0.0 && layerUV.x <= 1.0 && layerUV.y >= 0.0 && layerUV.y <= 1.0;
  let sampleUV = clamp(layerUV, vec2f(0.0), vec2f(1.0));
  var layerColor = textureSampleBaseClampToEdge(layerTex, texSampler, sampleUV);
  var maskValue = 1.0;
  if (u.hasMask != 0u) {
    maskValue = textureSampleLevel(maskTex, texSampler, input.uv, 0.0).a;
    if (u.maskInvert != 0u) { maskValue = 1.0 - maskValue; }
  }
  let sourceAlpha = layerColor.a * u.opacity;
  let postDissolveAlpha = maskValue * select(0.0, 1.0, inBounds);
  if (sourceAlpha * postDissolveAlpha <= 0.0) { return baseColor; }
  return compositeBlendSourceOver(
    baseColor,
    layerColor,
    sourceAlpha,
    postDissolveAlpha,
    u.blendMode,
    input.uv * 8192.0,
    u.opacity
  );
}
`,Gn={opacity:1,blendMode:`normal`,posX:0,posY:0,scaleX:1,scaleY:1,rotationZ:0,sourceAspect:16/9,outputAspect:16/9,time:0,hasMask:!1,maskInvert:!1,rotationX:0,rotationY:0,perspective:0,maskFeather:0};function Kn(e){let t=new Float32Array(16);return t[0]=e.opacity,new Uint32Array(t.buffer,4,1)[0]=wn[e.blendMode]??0,t[2]=e.posX,t[3]=e.posY,t[4]=e.scaleX,t[5]=e.scaleY,t[6]=e.rotationZ,t[7]=e.sourceAspect,t[8]=e.outputAspect,t[9]=e.time,new Uint32Array(t.buffer,40,1)[0]=+!!e.hasMask,new Uint32Array(t.buffer,44,1)[0]=+!!e.maskInvert,t[12]=e.rotationX,t[13]=e.rotationY,t[14]=e.perspective,t[15]=e.maskFeather,t}var qn=class{device;canvasFormat;sampler;layerUniformBuffers=[];regularPipeline=null;regularLayout=null;externalPipeline=null;externalLayout=null;blitPipeline=null;blitLayout=null;pingTexture=null;pongTexture=null;pingView=null;pongView=null;texW=0;texH=0;blitBindGroupPing=null;blitBindGroupPong=null;constructor(e){this.device=e,this.canvasFormat=navigator.gpu.getPreferredCanvasFormat(),this.sampler=e.createSampler({magFilter:`linear`,minFilter:`linear`}),this.createPipelines()}createPipelines(){try{let e=this.device.createShaderModule({label:`compositor-regular`,code:Vn+Un});this.regularLayout=this.device.createBindGroupLayout({label:`compositor-regular-layout`,entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:3,visibility:GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}},{binding:4,visibility:GPUShaderStage.FRAGMENT,texture:{}}]}),this.regularPipeline=this.device.createRenderPipeline({label:`compositor-regular-pipeline`,layout:this.device.createPipelineLayout({bindGroupLayouts:[this.regularLayout]}),vertex:{module:e,entryPoint:`vertexMain`},fragment:{module:e,entryPoint:`compositeFragment`,targets:[{format:`rgba8unorm`}]},primitive:{topology:`triangle-list`}})}catch(e){zn.warn(`Failed to create regular compositor pipeline`,e)}try{let e=this.device.createShaderModule({label:`compositor-external`,code:Vn+Wn});this.externalLayout=this.device.createBindGroupLayout({label:`compositor-external-layout`,entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,externalTexture:{}},{binding:3,visibility:GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}},{binding:4,visibility:GPUShaderStage.FRAGMENT,texture:{}}]}),this.externalPipeline=this.device.createRenderPipeline({label:`compositor-external-pipeline`,layout:this.device.createPipelineLayout({bindGroupLayouts:[this.externalLayout]}),vertex:{module:e,entryPoint:`vertexMain`},fragment:{module:e,entryPoint:`compositeExternalFragment`,targets:[{format:`rgba8unorm`}]},primitive:{topology:`triangle-list`}})}catch{this.externalPipeline=null,this.externalLayout=null}try{let e=this.device.createShaderModule({label:`compositor-blit`,code:Bn});this.blitLayout=this.device.createBindGroupLayout({label:`compositor-blit-layout`,entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}}]}),this.blitPipeline=this.device.createRenderPipeline({label:`compositor-blit-pipeline`,layout:this.device.createPipelineLayout({bindGroupLayouts:[this.blitLayout]}),vertex:{module:e,entryPoint:`vertexMain`},fragment:{module:e,entryPoint:`blitFragment`,targets:[{format:this.canvasFormat}]},primitive:{topology:`triangle-list`}})}catch(e){zn.warn(`Failed to create compositor blit pipeline`,e)}}ensurePingPong(e,t){if(this.pingTexture&&this.texW===e&&this.texH===t)return;this.pingTexture?.destroy(),this.pongTexture?.destroy();let n={size:{width:e,height:t},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC|GPUTextureUsage.COPY_DST};this.pingTexture=this.device.createTexture(n),this.pongTexture=this.device.createTexture(n),this.pingView=this.pingTexture.createView(),this.pongView=this.pongTexture.createView(),this.texW=e,this.texH=t,this.blitBindGroupPing=null,this.blitBindGroupPong=null}getLayerUniformBuffer(e){let t=this.layerUniformBuffers[e];return t||(t=this.device.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.layerUniformBuffers[e]=t),t}writeUniforms(e,t){let n=Kn(t);this.device.queue.writeBuffer(e,0,n.buffer)}compositeToTexture(e,t,n,r){if(e.length===0||!this.regularPipeline||!this.regularLayout||(this.ensurePingPong(t,n),!this.pingTexture||!this.pongTexture))return null;for(let t=e.length;t<this.layerUniformBuffers.length;t++)this.layerUniformBuffers[t]?.destroy();this.layerUniformBuffers.length>e.length&&(this.layerUniformBuffers.length=e.length),r.beginRenderPass({colorAttachments:[{view:this.pingView,loadOp:`clear`,clearValue:{r:0,g:0,b:0,a:0},storeOp:`store`}]}).end();let i=this.pingTexture,a=this.pongTexture,o=this.pingView,s=this.pongView;for(let t=0;t<e.length;t++){let n=e[t],c=this.getLayerUniformBuffer(t);this.writeUniforms(c,n.params);let l,u;if(n.externalTexture&&this.externalPipeline&&this.externalLayout)u=this.externalPipeline,l=this.device.createBindGroup({layout:this.externalLayout,entries:[{binding:0,resource:this.sampler},{binding:1,resource:o},{binding:2,resource:n.externalTexture},{binding:3,resource:{buffer:c}},{binding:4,resource:n.maskView}]});else if(n.textureView)u=this.regularPipeline,l=this.device.createBindGroup({layout:this.regularLayout,entries:[{binding:0,resource:this.sampler},{binding:1,resource:o},{binding:2,resource:n.textureView},{binding:3,resource:{buffer:c}},{binding:4,resource:n.maskView}]});else continue;let d=r.beginRenderPass({colorAttachments:[{view:s,loadOp:`clear`,storeOp:`store`}]});d.setPipeline(u),d.setBindGroup(0,l),d.draw(6),d.end();let f=i;i=a,a=f;let p=o;o=s,s=p}return{texture:i,view:o}}compositeToCanvas(e,t,n,r){if(!this.blitPipeline||!this.blitLayout)return!1;let i=this.device.createCommandEncoder(),a=this.compositeToTexture(e,t,n,i);if(!a)return!1;let o=a.texture===this.pingTexture?this.blitBindGroupPing??=this.device.createBindGroup({layout:this.blitLayout,entries:[{binding:0,resource:this.sampler},{binding:1,resource:this.pingView}]}):this.blitBindGroupPong??=this.device.createBindGroup({layout:this.blitLayout,entries:[{binding:0,resource:this.sampler},{binding:1,resource:this.pongView}]}),s=i.beginRenderPass({colorAttachments:[{view:r.getCurrentTexture().createView(),loadOp:`clear`,storeOp:`store`}]});return s.setPipeline(this.blitPipeline),s.setBindGroup(0,o),s.draw(6),s.end(),this.device.queue.submit([i.finish()]),!0}getDevice(){return this.device}destroy(){this.pingTexture?.destroy(),this.pongTexture?.destroy();for(let e of this.layerUniformBuffers)e.destroy();this.pingTexture=null,this.pongTexture=null,this.pingView=null,this.pongView=null,this.blitPipeline=null,this.blitLayout=null,this.blitBindGroupPing=null,this.blitBindGroupPong=null,this.layerUniformBuffers=[]}};const Jn=t(`GpuTexturePool`);function Yn(e,t,n){return`${e}x${t}x${n}`}var Xn=class{device;pools=new Map;usage;totalCreated=0;totalAcquires=0;cacheHits=0;constructor(e,t=GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.COPY_SRC|GPUTextureUsage.RENDER_ATTACHMENT){this.device=e,this.usage=t}acquire(e,t,n=`rgba8unorm`){let r=Yn(e,t,n);this.totalAcquires++;let i=this.pools.get(r);if(i){for(let e of i)if(!e.inUse)return e.inUse=!0,this.cacheHits++,e.texture}let a=this.device.createTexture({size:{width:e,height:t},format:n,usage:this.usage}),o={texture:a,inUse:!0};return i?i.push(o):this.pools.set(r,[o]),this.totalCreated++,a}release(e){let t=Yn(e.width,e.height,e.format),n=this.pools.get(t);if(n){for(let t of n)if(t.texture===e){t.inUse=!1;return}}}destroy(){for(let e of this.pools.values())for(let t of e)t.texture.destroy();this.pools.clear(),Jn.debug(`Texture pool destroyed`,{totalCreated:this.totalCreated,totalAcquires:this.totalAcquires,cacheHitRate:this.totalAcquires>0?`${(this.cacheHits/this.totalAcquires*100).toFixed(1)}%`:`n/a`})}compact(){for(let[e,t]of this.pools.entries()){let n=t.filter(e=>e.inUse),r=t.filter(e=>!e.inUse),i=r.slice(2);for(let e of i)e.texture.destroy();i.length>0&&this.pools.set(e,[...n,...r.slice(0,2)])}}getMetrics(){return{totalCreated:this.totalCreated,totalAcquires:this.totalAcquires,cacheHits:this.cacheHits,cacheHitRate:this.totalAcquires>0?`${(this.cacheHits/this.totalAcquires*100).toFixed(1)}%`:`n/a`,poolCount:this.pools.size}}};const Zn=`
${o}

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var baseMask: texture_2d<f32>;
@group(0) @binding(2) var nextMask: texture_2d<f32>;
@group(0) @binding(3) var<uniform> u: vec4f;

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  var a = textureSampleLevel(baseMask, texSampler, input.uv, 0.0).a;
  var b = textureSampleLevel(nextMask, texSampler, input.uv, 0.0).a;
  if (u.x > 0.5) {
    a = 1.0 - a;
  }
  if (u.y > 0.5) {
    b = 1.0 - b;
  }
  let alpha = a * b;
  return vec4f(1.0, 1.0, 1.0, alpha);
}
`;var Qn=class{pipeline;sampler;bindGroupLayout;uniformBuffer;constructor(e){this.device=e,this.sampler=e.createSampler({magFilter:`linear`,minFilter:`linear`});let t=e.createShaderModule({label:`mask-combine`,code:Zn});this.bindGroupLayout=e.createBindGroupLayout({label:`mask-combine-layout`,entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:3,visibility:GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}}]}),this.pipeline=e.createRenderPipeline({label:`mask-combine-pipeline`,layout:e.createPipelineLayout({bindGroupLayouts:[this.bindGroupLayout]}),vertex:{module:t,entryPoint:`vertexMain`},fragment:{module:t,entryPoint:`fragmentMain`,targets:[{format:`rgba8unorm`}]},primitive:{topology:`triangle-list`}}),this.uniformBuffer=e.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})}combine(e,t,n,r){if(e.width!==t.width||e.height!==t.height||n.width!==e.width||n.height!==e.height)return!1;this.device.queue.writeBuffer(this.uniformBuffer,0,new Float32Array([+!!r?.invertBase,+!!r?.invertNext,0,0]));let i=this.device.createBindGroup({layout:this.bindGroupLayout,entries:[{binding:0,resource:this.sampler},{binding:1,resource:e.createView()},{binding:2,resource:t.createView()},{binding:3,resource:{buffer:this.uniformBuffer}}]}),a=this.device.createCommandEncoder(),o=a.beginRenderPass({colorAttachments:[{view:n.createView(),loadOp:`clear`,clearValue:{r:0,g:0,b:0,a:0},storeOp:`store`}]});return o.setPipeline(this.pipeline),o.setBindGroup(0,i),o.draw(6),o.end(),this.device.queue.submit([a.finish()]),!0}destroy(){this.uniformBuffer.destroy()}},$n=class{device;textures=new Map;views=new Map;fallbackTexture;fallbackView;constructor(e){this.device=e,this.fallbackTexture=e.createTexture({size:{width:1,height:1},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),e.queue.writeTexture({texture:this.fallbackTexture},new Uint8Array([255,255,255,255]),{bytesPerRow:4},{width:1,height:1}),this.fallbackView=this.fallbackTexture.createView()}updateMask(e,t){if(!t){this.removeMask(e);return}let{width:n,height:r}=t,i=this.textures.get(e);i&&(i.width!==n||i.height!==r)&&(i.destroy(),i=void 0),i||(i=this.device.createTexture({size:{width:n,height:r},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),this.textures.set(e,i),this.views.set(e,i.createView())),this.device.queue.writeTexture({texture:i},t.data,{bytesPerRow:n*4},{width:n,height:r})}removeMask(e){let t=this.textures.get(e);t&&(t.destroy(),this.textures.delete(e),this.views.delete(e))}getMaskInfo(e){let t=this.views.get(e);return t?{hasMask:!0,view:t}:{hasMask:!1,view:this.fallbackView}}getFallbackView(){return this.fallbackView}destroy(){for(let e of this.textures.values())e.destroy();this.textures.clear(),this.views.clear(),this.fallbackTexture.destroy()}};function er(e){if(!e)return!1;let t=e.toLowerCase();return t.endsWith(`.gif`)||t.includes(`.gif`)}function tr(e){if(!e)return!1;let t=e.toLowerCase();return t.endsWith(`.webp`)||t.includes(`.webp`)}const nr=t(`CanvasPool`);var rr=class{available=[];inUse=new Set;width;height;maxSize;constructor(e,t,n=8,r=20){this.width=e,this.height=t,this.maxSize=r;for(let r=0;r<n;r++)this.available.push(new OffscreenCanvas(e,t))}acquire(){let e;this.available.length>0?e=this.available.pop():(this.inUse.size<this.maxSize||nr.warn(`Canvas pool exhausted, creating temporary canvas`),e=new OffscreenCanvas(this.width,this.height)),this.inUse.add(e),(e.width!==this.width||e.height!==this.height)&&(e.width=this.width,e.height=this.height);let t=e.getContext(`2d`);return t.globalAlpha=1,t.globalCompositeOperation=`source-over`,t.clearRect(0,0,this.width,this.height),{canvas:e,ctx:t}}release(e){this.inUse.has(e)&&(this.inUse.delete(e),this.available.length<this.maxSize&&this.available.push(e))}dispose(){this.available.length=0,this.inUse.clear()}getStats(){return{available:this.available.length,inUse:this.inUse.size,total:this.available.length+this.inUse.size}}},ir=class{cache=new Map;maxSize=1e3;measure(e,t,n){let r=`${e.font}|${t}|${n}`,i=this.cache.get(r);if(i===void 0){if(xe(e,n),i=e.measureText(t).width,this.cache.size>=this.maxSize){let e=this.cache.keys().next().value;e&&this.cache.delete(e)}this.cache.set(r,i)}return i}clear(){this.cache.clear()}};const ar=t(`VideoFrameExtractor`);var or=class e{static TIMESTAMP_EPSILON=1e-4;static LOOKAHEAD_TOLERANCE_SECONDS=.05;static STREAM_BACKTRACK_SECONDS=1;static FORWARD_JUMP_RESTART_SECONDS=3;sink=null;input=null;videoTrack=null;duration=0;ready=!1;drawFailureCount=0;sampleIterator=null;currentSample=null;nextSample=null;iteratorDone=!1;lastRequestedTimestamp=null;sampleLoopError=null;lastFailureKind=`none`;cachedVideoFrame=null;cachedVideoFrameSample=null;constructor(e,t){this.src=e,this.itemId=t}async init(){try{let e=await import(`./src-BW8vJkkc.js`),t=d(e,this.src);return this.input=new e.Input({formats:e.ALL_FORMATS,source:t}),this.videoTrack=await this.input.getPrimaryVideoTrack(),this.videoTrack?typeof this.videoTrack.canDecode==`function`&&!await this.videoTrack.canDecode()?(ar.warn(`Video track is not decodable via mediabunny/WebCodecs`,{itemId:this.itemId}),!1):(this.duration=await this.input.computeDuration(),this.sink=new e.VideoSampleSink(this.videoTrack),this.ready=!0,ar.debug(`Initialized`,{itemId:this.itemId,duration:this.duration,width:this.videoTrack.displayWidth,height:this.videoTrack.displayHeight}),!0):(ar.warn(`No video track found`,{itemId:this.itemId}),!1)}catch(e){return ar.error(`Failed to initialize`,{itemId:this.itemId,error:e}),!1}}async drawFrame(e,t,n,r,i,a){if(!this.ready||!this.sink)return!1;let o=Math.max(0,this.duration-.001),s=Math.max(0,Math.min(t,o)),c=this.sampleLoopError;try{return await this.ensureSampleForTimestamp(s),this.drawCurrentSample(e,n,r,i,a)?(this.drawFailureCount=0,this.lastFailureKind=`none`,!0):(c=this.sampleLoopError,this.reportDrawFailure(t,s,c))}catch(o){if(c=o,this.sampleLoopError=o,await this.recoverAndPrime(s,o)){if(this.drawCurrentSample(e,n,r,i,a))return this.drawFailureCount=0,this.lastFailureKind=`none`,!0;c=this.sampleLoopError}return this.lastFailureKind=this.lastFailureKind===`no-sample`?`no-sample`:`decode-error`,this.reportDrawFailure(t,s,c)}}async drawFrameWithCapture(e,t,n,r,i,a){return await this.drawFrame(e,t,n,r,i,a)?{success:!0,capturedFrame:await this.captureCurrentOrientedFrame(),capturedSourceTime:this.currentSample?.timestamp??null}:{success:!1,capturedFrame:null,capturedSourceTime:null}}async captureFrame(t){let n=this.duration,r=n>0?Math.max(0,Math.min(t,n-e.TIMESTAMP_EPSILON)):Math.max(0,t);this.sampleLoopError=null,this.lastFailureKind=`none`;try{return await this.ensureSampleForTimestamp(r),!this.currentSample||!this.currentSampleCoversTimestamp(r)?(this.lastFailureKind=`no-sample`,{success:!1,frame:null,sourceTime:null}):{success:!0,frame:await this.captureCurrentOrientedFrame(),sourceTime:this.currentSample.timestamp}}catch(e){return this.sampleLoopError=e,this.lastFailureKind=`decode-error`,{success:!1,frame:null,sourceTime:null}}}async ensureSampleForTimestamp(t){if(this.sink)for(this.sampleIterator?(this.lastRequestedTimestamp!==null&&t+e.TIMESTAMP_EPSILON<this.lastRequestedTimestamp&&!this.currentSampleCoversTimestamp(t)||this.lastRequestedTimestamp!==null&&t-this.lastRequestedTimestamp>e.FORWARD_JUMP_RESTART_SECONDS)&&this.resetSampleIterator(t,`backward`):this.resetSampleIterator(t,`init`),this.lastRequestedTimestamp=t;;){let n=await this.peekNextSample();if(!n)break;if(n.timestamp<=t+e.TIMESTAMP_EPSILON){this.closeCachedVideoFrame(),this.closeSample(this.currentSample),this.currentSample=n,this.nextSample=null;continue}!this.currentSample&&n.timestamp-t<=e.LOOKAHEAD_TOLERANCE_SECONDS&&(this.currentSample=n,this.nextSample=null);break}}currentSampleCoversTimestamp(t){let n=this.currentSample;return!n||n.timestamp>t+e.TIMESTAMP_EPSILON?!1:typeof n.duration!=`number`||!Number.isFinite(n.duration)||n.duration<=0?!0:n.timestamp+n.duration>=t-e.TIMESTAMP_EPSILON}async peekNextSample(){if(this.nextSample)return this.nextSample;if(!this.sampleIterator||this.iteratorDone)return null;let e=await this.sampleIterator.next();return e.done?(this.iteratorDone=!0,null):(this.nextSample=e.value,this.nextSample)}resetSampleIterator(t,n){if(this.closeStreamState(),!this.sink)return;let r=k(this.src,t),i=r??Math.max(0,t-e.STREAM_BACKTRACK_SECONDS);n===`recover`&&ar.debug(`Restarting mediabunny sample stream`,{itemId:this.itemId,reason:n,startTimestamp:t,streamStart:i,adaptive:r!==null}),this.sampleIterator=this.sink.samples(i,1/0),this.iteratorDone=!1,this.lastRequestedTimestamp=null}drawCurrentSample(e,t,n,r,i){let a=this.currentSample;if(!a)return this.lastFailureKind=`no-sample`,!1;try{return typeof a.draw==`function`?(a.draw(e,t,n,r,i),!0):(this.lastFailureKind=`decode-error`,!1)}catch(e){return this.closeCachedVideoFrame(),this.sampleLoopError=e,this.lastFailureKind=`decode-error`,!1}}getOrCreateCurrentVideoFrame(){let e=this.currentSample;if(!e)return this.lastFailureKind=`no-sample`,null;let t=this.cachedVideoFrame;if(!t||this.cachedVideoFrameSample!==e){if(this.closeCachedVideoFrame(),t=e.toVideoFrame(),!t)return this.sampleLoopError=Error(`Decoded sample could not be converted to VideoFrame`),this.lastFailureKind=`decode-error`,null;this.cachedVideoFrame=t,this.cachedVideoFrameSample=e}return t}cloneCurrentVideoFrame(){let e=this.getOrCreateCurrentVideoFrame();if(!e)return null;try{return e.clone()}catch(e){return this.sampleLoopError=e,null}}async captureCurrentOrientedFrame(){let e=this.currentSample;if(!e)return this.lastFailureKind=`no-sample`,null;let t=Math.round(this.videoTrack?.displayWidth??0),n=Math.round(this.videoTrack?.displayHeight??0);if(t<=0||n<=0)return this.cloneCurrentVideoFrame();try{let r=new OffscreenCanvas(t,n),i=r.getContext(`2d`);return!i||typeof e.draw!=`function`?this.cloneCurrentVideoFrame():(e.draw(i,0,0,t,n),await createImageBitmap(r))}catch(e){return this.sampleLoopError=e,this.cloneCurrentVideoFrame()}}closeCachedVideoFrame(){if(this.cachedVideoFrame){try{this.cachedVideoFrame.close()}catch{}this.cachedVideoFrame=null,this.cachedVideoFrameSample=null}}async recoverAndPrime(e,t){let n=t instanceof Error?t.message:String(t);if(!/key frame|configure\(\)|flush\(\)|InvalidStateError|decode/i.test(n))return!1;try{return this.resetSampleIterator(e,`recover`),await this.ensureSampleForTimestamp(e),this.currentSample!==null}catch(e){return this.sampleLoopError=e,this.lastFailureKind=`decode-error`,!1}}closeStreamState(){this.sampleIterator&&this.sampleIterator.return?.(),this.sampleIterator=null,this.iteratorDone=!0,this.lastRequestedTimestamp=null,this.sampleLoopError=null,this.closeCachedVideoFrame(),this.closeSample(this.currentSample),this.closeSample(this.nextSample),this.currentSample=null,this.nextSample=null}closeSample(e){if(e)try{e.close()}catch{}}reportDrawFailure(e,t,n){this.drawFailureCount+=1;let r=this.drawFailureCount<=3||this.drawFailureCount%20==0,i={itemId:this.itemId,timestamp:e,clampedTime:t,duration:this.duration,failures:this.drawFailureCount,reason:this.lastFailureKind,error:n instanceof Error?n.message:String(n)};return r?ar.warn(`Mediabunny frame extraction failed`,i):ar.debug(`Mediabunny frame extraction failed`,i),!1}getLastFailureKind(){return this.lastFailureKind}batchDisabled=!1;async prewarmBatch(e,t,n,r,i,a){if(this.batchDisabled||!this.ready||!this.sink||t.length===0)return-1;let o=0;try{for await(let s of this.sink.samplesAtTimestamps(t))if(s)try{typeof s.draw==`function`&&(s.draw(e,n,r,i,a),o++)}finally{s.close()}return o}catch(e){let t=e instanceof Error?e.message:String(e);return/key frame|flush|InvalidStateError/i.test(t)&&(ar.warn(`Disabling batch prewarm for source (decoder flush error)`,{itemId:this.itemId,error:t,decoded:o}),this.batchDisabled=!0),o>0?o:-1}}isBatchPrewarmAvailable(){return!this.batchDisabled&&this.ready&&this.sink!==null}getDimensions(){return this.videoTrack?{width:this.videoTrack.displayWidth,height:this.videoTrack.displayHeight}:{width:1920,height:1080}}getDuration(){return this.duration}dispose(){this.closeStreamState();try{this.input?.dispose()}catch{}this.sink=null,this.input=null,this.videoTrack=null,this.ready=!1,this.drawFailureCount=0,this.lastFailureKind=`none`}};const sr=t(`SharedVideoExtractorPool`);var cr=class{constructor(e,t,n){this.pool=e,this.itemId=t,this.src=n}init(){return this.pool.initSource(this.src)}drawFrame(e,t,n,r,i,a){return this.pool.drawItemFrame(this.itemId,this.src,e,t,n,r,i,a)}drawFrameWithCapture(e,t,n,r,i,a){return this.pool.drawItemFrameWithCapture(this.itemId,this.src,e,t,n,r,i,a)}captureFrame(e){return this.pool.captureItemFrame(this.itemId,this.src,e)}getLastFailureKind(){return this.pool.getItemLastFailureKind(this.itemId,this.src)}getDimensions(){return this.pool.getItemDimensions(this.itemId,this.src)}getDuration(){return this.pool.getItemDuration(this.itemId,this.src)}prewarmBatch(e,t,n,r,i,a){return this.pool.prewarmItemBatch(this.itemId,this.src,e,t,n,r,i,a)}isBatchPrewarmAvailable(){return this.pool.isItemBatchPrewarmAvailable(this.itemId,this.src)}dispose(){}},lr=class{maxLanesPerSource;sourceStates=new Map;itemSources=new Map;itemWrappers=new Map;laneIdCounter=0;constructor(e){this.maxLanesPerSource=Math.max(1,e?.maxLanesPerSource??4)}getOrCreateItemExtractor(e,t){let n=this.itemWrappers.get(e),r=this.itemSources.get(e);if(n&&r===t)return n;r&&r!==t&&this.releaseItem(e),this.itemSources.set(e,t),this.ensureSourceState(t);let i=new cr(this,e,t);return this.itemWrappers.set(e,i),i}async initSource(e){let t=this.ensureSourceState(e);return t.sourceReady?!0:t.sourceInitAttempted?!1:(t.sourceInitPromise||=(async()=>{let e=await this.ensureLaneInitialized(t,0);return t.sourceInitAttempted=!0,t.sourceReady=e,e})().finally(()=>{t.sourceInitPromise=null}),t.sourceInitPromise)}releaseItem(e){let t=this.itemSources.get(e);t&&this.unassignItem(e,t),this.itemWrappers.get(e)?.dispose(),this.itemSources.delete(e),this.itemWrappers.delete(e)}async drawItemFrame(e,t,n,r,i,a,o,s){let c=this.ensureSourceState(t);if(!await this.initSource(t))return!1;let l=this.getAssignedLaneIndex(c,e),u=await this.ensureLaneInitialized(c,l);if(!u&&l!==0&&(l=0,u=await this.ensureLaneInitialized(c,l)),!u)return!1;let d=c.lanes[l],f=(d.drawLock??Promise.resolve()).then(()=>d.extractor.drawFrame(n,r,i,a,o,s));return d.drawLock=f.then(()=>void 0,()=>void 0),f}async drawItemFrameWithCapture(e,t,n,r,i,a,o,s){let c=this.ensureSourceState(t);if(!await this.initSource(t))return{success:!1,capturedFrame:null,capturedSourceTime:null};let l=this.getAssignedLaneIndex(c,e),u=await this.ensureLaneInitialized(c,l);if(!u&&l!==0&&(l=0,u=await this.ensureLaneInitialized(c,l)),!u)return{success:!1,capturedFrame:null,capturedSourceTime:null};let d=c.lanes[l],f=(d.drawLock??Promise.resolve()).then(()=>d.extractor.drawFrameWithCapture(n,r,i,a,o,s));return d.drawLock=f.then(()=>void 0,()=>void 0),f}async captureItemFrame(e,t,n){let r=this.ensureSourceState(t);if(!await this.initSource(t))return{success:!1,frame:null,sourceTime:null};let i=this.getAssignedLaneIndex(r,e),a=await this.ensureLaneInitialized(r,i);if(!a&&i!==0&&(i=0,a=await this.ensureLaneInitialized(r,i)),!a)return{success:!1,frame:null,sourceTime:null};let o=r.lanes[i],s=(o.drawLock??Promise.resolve()).then(()=>o.extractor.captureFrame(n));return o.drawLock=s.then(()=>void 0,()=>void 0),s}getItemLastFailureKind(e,t){return this.getExtractorForItem(e,t)?.getLastFailureKind()??`none`}getItemDimensions(e,t){return this.getExtractorForItem(e,t)?.getDimensions()??{width:1920,height:1080}}getItemDuration(e,t){return this.getExtractorForItem(e,t)?.getDuration()??0}async prewarmItemBatch(e,t,n,r,i,a,o,s){let c=this.getExtractorForItem(e,t);return c?c.prewarmBatch(n,r,i,a,o,s):-1}isItemBatchPrewarmAvailable(e,t){return this.getExtractorForItem(e,t)?.isBatchPrewarmAvailable()??!1}dispose(){for(let e of this.sourceStates.values()){for(let t of e.lanes)t.extractor.dispose();e.lanes=[],e.itemLaneById.clear(),e.laneAssignments=[],e.sourceInitPromise=null,e.sourceReady=!1}this.sourceStates.clear(),this.itemSources.clear(),this.itemWrappers.clear()}ensureSourceState(e){let t=this.sourceStates.get(e);return t||(t={src:e,lanes:[this.createLane(e)],itemLaneById:new Map,laneAssignments:[0],sourceInitPromise:null,sourceInitAttempted:!1,sourceReady:!1},this.sourceStates.set(e,t)),t}createLane(e){return{extractor:new or(e,`shared-video-${++this.laneIdCounter}`),initialized:!1,initPromise:null,drawLock:null}}async ensureLaneInitialized(e,t){if(t<0||t>=e.lanes.length)return!1;let n=e.lanes[t];return n.initialized?!0:(n.initPromise||=n.extractor.init().then(e=>(n.initialized=e,e)).catch(r=>(sr.warn(`Shared lane initialization failed`,{laneIndex:t,src:e.src,error:r}),n.initialized=!1,!1)).finally(()=>{n.initPromise=null}),n.initPromise)}getAssignedLaneIndex(e,t){let n=e.itemLaneById.get(t);if(n!==void 0)return n;let r=0,i=1/0;for(let t=0;t<e.laneAssignments.length;t+=1){let n=e.laneAssignments[t]??0;n<i&&(i=n,r=t)}return i>0&&e.lanes.length<this.maxLanesPerSource&&(r=e.lanes.length,e.lanes.push(this.createLane(e.src)),e.laneAssignments.push(0)),e.itemLaneById.set(t,r),e.laneAssignments[r]=(e.laneAssignments[r]??0)+1,r}getExtractorForItem(e,t){let n=this.sourceStates.get(t);if(!n)return null;let r=n.itemLaneById.get(e)??0;return(n.lanes[r]??n.lanes[0])?.extractor??null}unassignItem(e,t){let n=this.sourceStates.get(t);if(!n)return;let r=n.itemLaneById.get(e);if(r!==void 0){n.itemLaneById.delete(e);let t=n.laneAssignments[r]??0;n.laneAssignments[r]=Math.max(0,t-1)}}};const ur={normal:`source-over`,dissolve:`source-over`,darken:`darken`,multiply:`multiply`,"color-burn":`color-over`,"linear-burn":`source-over`,lighten:`lighten`,screen:`screen`,"color-dodge":`source-over`,"linear-dodge":`lighter`,overlay:`overlay`,"soft-light":`source-over`,"hard-light":`hard-light`,"vivid-light":`source-over`,"linear-light":`source-over`,"pin-light":`source-over`,"hard-mix":`source-over`,difference:`difference`,exclusion:`exclusion`,subtract:`source-over`,divide:`source-over`,hue:`hue`,saturation:`saturation`,color:`color`,luminosity:`luminosity`};function dr(e){let t=ur[e];return t===`color-over`?`source-over`:t}function fr(e,t){return e<t}const pr=t(`CanvasShapes`);function mr(e,t,n){let r=W(e,{x:t.x,y:t.y,width:t.width,height:t.height,rotation:0,opacity:t.opacity},{canvasWidth:n.width,canvasHeight:n.height}),i=r;if(t.rotation!==0){let e=n.width/2+t.x,a=n.height/2+t.y;i=G(r,t.rotation,e,a)}return Et(i)}function hr(e,t,n,r){if(!t.isMask){e.save();try{let i=mr(t,n,r);e.globalAlpha=n.opacity,t.fillColor&&(e.fillStyle=t.fillColor,e.fill(i)),t.strokeWidth&&t.strokeWidth>0&&t.strokeColor&&(e.strokeStyle=t.strokeColor,e.lineWidth=t.strokeWidth,e.stroke(i)),n.cornerRadius>0&&pr.debug(`Corner radius applied via shape path`,{shapeId:t.id,cornerRadius:n.cornerRadius})}finally{e.restore()}}}const gr=t(`CanvasItemRenderer`);function _r(e){return{...e,anchorX:e.anchorX??e.width/2,anchorY:e.anchorY??e.height/2}}function vr(e,t,n,r){let i=r.width/2+n.x-n.width/2,a=r.height/2+n.y-n.height/2,o=i+(n.anchorX??n.width/2),s=a+(n.anchorY??n.height/2),c=t.transform?.flipHorizontal?-1:1,l=t.transform?.flipVertical?-1:1,u=c!==1||l!==1;n.rotation===0&&!u||(e.translate(o,s),n.rotation!==0&&e.rotate(n.rotation*Math.PI/180),u&&e.scale(c,l),e.translate(-o,-s))}function yr(e,t){return t>=e.from&&t<e.from+e.durationInFrames}function br(e,t,n,r){if(e.type!==`video`&&e.type!==`image`)return e;let i=Ct(e,n.getCurrentKeyframes?.(e.id)??n.keyframesMap.get(e.id),t,n.canvasSettings,r);return i===e.crop?e:{...e,crop:i}}function xr(e){return Math.abs(e-1)>=.01}function Sr(e,t){let n=t?1:.2;return Math.abs(e)>1.01?Math.max(n,.5*Math.abs(e)):n}function Cr(e){let{domVideo:t,sourceTime:n,speed:r,isRenderingTransition:i}=e;if(!t||t.readyState<2||t.videoWidth<=0)return{hasReadyDomVideo:!1,shouldDraw:!1,drift:null,driftThreshold:null};let a=Math.abs(t.currentTime-n),o=Sr(r,i||t.dataset.transitionHold===`1`);return{hasReadyDomVideo:!0,shouldDraw:a<=o,drift:a,driftThreshold:o}}function wr(e){let{renderMode:t,hasMediabunny:n,isMediabunnyDisabled:r,hasEnsureVideoItemReady:i,speed:a}=e;return t!==`preview`||n||r||!i?`none`:xr(a)?`warm-background-and-skip`:`await-ready`}function Tr(e){let{renderMode:t,hasMediabunny:n,hasFallbackVideoElement:r}=e;return t===`preview`&&!n&&!r}function Er(e){let{renderMode:t,hasReadyDomVideo:n}=e;return t===`preview`&&!n}function Dr(e){let{renderMode:t,hasFallbackVideoElement:n,hasMediabunny:r,isMediabunnyDisabled:i,mediabunnyFailedThisFrame:a}=e;return t===`preview`&&n&&(a||!r||i)}function Or(e,t,n,r){if(n.width&&n.height)return{x:r.width/2+n.x-n.width/2,y:r.height/2+n.y-n.height/2,width:n.width,height:n.height};let i=r.width/e,a=r.height/t,o=Math.min(i,a),s=e*o,c=t*o;return{x:(r.width-s)/2+n.x,y:(r.height-c)/2+n.y,width:s,height:c}}function kr(e,t,n,r,i){let a=r.width/2+n.x-n.width/2,o=r.height/2+n.y-n.height/2,s=T(e,t,n.width,n.height,i);return{mediaRect:{x:a+s.mediaRect.x,y:o+s.mediaRect.y,width:s.mediaRect.width,height:s.mediaRect.height},viewportRect:{x:a+s.viewportRect.x,y:o+s.viewportRect.y,width:s.viewportRect.width,height:s.viewportRect.height},featherPixels:s.featherPixels}}function Ar(e){return e.left>0||e.right>0||e.top>0||e.bottom>0}function jr(e,t){e.beginPath(),e.rect(t.x,t.y,t.width,t.height),e.clip()}function Mr(e,t,n){if(t.width<=0||t.height<=0)return;let r=n=>{e.fillStyle=n,e.fillRect(t.x,t.y,t.width,t.height)};if(e.save(),e.globalCompositeOperation=`destination-in`,n.left>0){let i=e.createLinearGradient(t.x,0,t.x+t.width,0);i.addColorStop(0,`rgba(0, 0, 0, 0)`),i.addColorStop(Math.max(0,Math.min(1,n.left/t.width)),`rgba(0, 0, 0, 1)`),i.addColorStop(1,`rgba(0, 0, 0, 1)`),r(i)}if(n.right>0){let i=e.createLinearGradient(t.x,0,t.x+t.width,0);i.addColorStop(0,`rgba(0, 0, 0, 1)`),i.addColorStop(Math.max(0,Math.min(1,(t.width-n.right)/t.width)),`rgba(0, 0, 0, 1)`),i.addColorStop(1,`rgba(0, 0, 0, 0)`),r(i)}if(n.top>0){let i=e.createLinearGradient(0,t.y,0,t.y+t.height);i.addColorStop(0,`rgba(0, 0, 0, 0)`),i.addColorStop(Math.max(0,Math.min(1,n.top/t.height)),`rgba(0, 0, 0, 1)`),i.addColorStop(1,`rgba(0, 0, 0, 1)`),r(i)}if(n.bottom>0){let i=e.createLinearGradient(0,t.y,0,t.y+t.height);i.addColorStop(0,`rgba(0, 0, 0, 1)`),i.addColorStop(Math.max(0,Math.min(1,(t.height-n.bottom)/t.height)),`rgba(0, 0, 0, 1)`),i.addColorStop(1,`rgba(0, 0, 0, 0)`),r(i)}e.restore()}function Nr(e,t,n,r,i,a,o,s,c){let l=kr(n,r,i,a,o);if(l.viewportRect.width<=0||l.viewportRect.height<=0)return!1;let u=e=>{if(s&&Number.isFinite(s.width)&&Number.isFinite(s.height)&&s.width>0&&s.height>0){e.drawImage(t,s.x,s.y,s.width,s.height,l.mediaRect.x,l.mediaRect.y,l.mediaRect.width,l.mediaRect.height);return}e.drawImage(t,l.mediaRect.x,l.mediaRect.y,l.mediaRect.width,l.mediaRect.height)};if(!Ar(l.featherPixels))return e.save(),jr(e,l.viewportRect),u(e),e.restore(),!0;let d=c?.acquire(),f=d?.canvas??new OffscreenCanvas(a.width,a.height),p=d?.ctx??f.getContext(`2d`);if(!p)return d&&c?.release(f),!1;try{d||p.clearRect(0,0,a.width,a.height),p.save(),jr(p,l.viewportRect),u(p),p.restore(),Mr(p,l.viewportRect,l.featherPixels),e.drawImage(f,0,0)}finally{d&&c?.release(f)}return!0}function Pr(e){return 1/(Number.isFinite(e)&&e>0?e:30)*.9}function Fr(e,t,n){let r=Math.max(0,e);if(n===void 0||!Number.isFinite(n)||n<=0)return r;let i=(Math.max(0,n-1)+1e-4)/t;return Math.min(r,i)}function Ir(e,t,n,r,i,a,o,s){try{let c=t.visibleRect;return Nr(e,t,n,r,i,a,o,c,s)}catch{return!1}}async function Lr(e,t,n,r,i,a,o){if(i.renderMode!==`preview`||!t.src)return!1;let s=a=>Nr(e,a,a.width,a.height,n,r,t.crop,void 0,i.canvasPool),c=i.getCachedPredecodedBitmap?.(t.src,a,o);if(c&&s(c))return!0;if(!i.waitForInflightPredecodedBitmap)return!1;let l=await i.waitForInflightPredecodedBitmap(t.src,a,o,12);return!!(l&&s(l))}async function Rr(e,t,n,r,i,a=0,o){let{fps:s,videoExtractors:c,videoElements:l,useMediabunny:u,mediabunnyDisabledItems:d,mediabunnyFailureCountByItem:f,canvasSettings:p,scrubbingCache:m}=i,h=i.renderMode===`preview`,g=!h,_=l.has(t.id),v=c.get(t.id),y=!1,b=o??lt(t),x=r-b.from,S=x/s,C=ut(t,b),w=t.sourceFps??s,T=t.speed??1,E=t.durationInFrames*T*w/s,ee=(t.sourceEnd??C+E)-a,D=C+a,O=b.sourceTimeRamp&&!t.isReversed?gt(b.sourceTimeRamp,r):0,te=Fr(t.isReversed?(ee-x*T*(w/s)-1)/w:D/w+S*T+O/w,w,t.sourceDuration),ne=Math.round(te*w),re=Math.abs(te*w-ne)<1e-6?(ne+1e-4)/w:te,k=Pr(w),A=i.domVideoElementProvider,j=!!b.sourceTimeRamp&&_t(b.sourceTimeRamp,r),M=h&&A&&a===0&&!j&&yr(b,r)?A(t.id):null,N=Cr({domVideo:M,sourceTime:re,speed:T,isRenderingTransition:!!i.isRenderingTransition}),P=N.hasReadyDomVideo;if(M&&N.shouldDraw){Nr(e,M,M.videoWidth,M.videoHeight,n,p,t.crop,void 0,i.canvasPool);return}let ie=wr({renderMode:i.renderMode,hasMediabunny:u.has(t.id),isMediabunnyDisabled:d.has(t.id),hasEnsureVideoItemReady:!!i.ensureVideoItemReady,speed:T});if(ie!==`none`&&i.ensureVideoItemReady){if(ie===`warm-background-and-skip`){i.ensureVideoItemReady(t.id);return}if(ie===`await-ready`)try{await i.ensureVideoItemReady(t.id)}catch{}}if(Tr({renderMode:i.renderMode,hasMediabunny:u.has(t.id),hasFallbackVideoElement:_})){if(m&&v){let r=v.getDimensions(),a=m.getVideoFrameEntry(t.id);if(a&&Ir(e,a.frame,r.width,r.height,n,p,t.crop,i.canvasPool))return}if(Er({renderMode:i.renderMode,hasReadyDomVideo:P})&&await Lr(e,t,n,p,i,re,k)){i.ensureVideoItemReady&&i.ensureVideoItemReady(t.id);return}return}if(Er({renderMode:i.renderMode,hasReadyDomVideo:P})&&await Lr(e,t,n,p,i,re,k)){!u.has(t.id)&&i.ensureVideoItemReady&&i.ensureVideoItemReady(t.id);return}if(u.has(t.id)&&!d.has(t.id)&&v){let o=Math.max(0,Math.min(re,v.getDuration()-.01)),c=v.getDimensions(),l=kr(c.width,c.height,n,p,t.crop);if(h&&m){let r=m.getVideoFrameEntry(t.id,o,k);if(r&&Ir(e,r.frame,c.width,c.height,n,p,t.crop,i.canvasPool))return}if(i.renderMode===`export`&&t.isReversed&&a===0&&i.reverseVideoFrameCache){let a=await i.reverseVideoFrameCache.getFrame({item:t,extractor:v,frame:r,renderSpan:b,fps:s,sourceFps:w,speed:T});if(a&&Ir(e,a,c.width,c.height,n,p,t.crop,i.canvasPool)){f.set(t.id,0);return}}let u=!1,g=null,_=null,x=async e=>h&&m?await v.drawFrameWithCapture(e,o,l.mediaRect.x,l.mediaRect.y,l.mediaRect.width,l.mediaRect.height):{success:await v.drawFrame(e,o,l.mediaRect.x,l.mediaRect.y,l.mediaRect.width,l.mediaRect.height),capturedFrame:null,capturedSourceTime:null};if(Ar(l.featherPixels)){let{canvas:t,ctx:n}=i.canvasPool.acquire();try{n.save(),jr(n,l.viewportRect);try{let e=await x(n);u=e.success,g=e.capturedFrame,_=e.capturedSourceTime}finally{n.restore()}u&&(Mr(n,l.viewportRect,l.featherPixels),e.drawImage(t,0,0))}finally{i.canvasPool.release(t)}}else{e.save(),jr(e,l.viewportRect);try{let t=await x(e);u=t.success,g=t.capturedFrame,_=t.capturedSourceTime}finally{e.restore()}}if(u){f.set(t.id,0),m&&g&&m.putVideoFrame(t.id,g,_??o);return}y=!0;let S=v.getLastFailureKind();if(h&&m&&S===`no-sample`){let r=m.getVideoFrameEntry(t.id);if(r&&Ir(e,r.frame,c.width,c.height,n,p,t.crop,i.canvasPool))return}if(S===`no-sample`)gr.debug(`Mediabunny had no sample for timestamp, using per-frame fallback`,{itemId:t.id,frame:r,sourceTime:o});else{let e=(f.get(t.id)??0)+1;f.set(t.id,e),e>=3?(d.add(t.id),gr.warn(`Disabling mediabunny for item after repeated failures; using fallback for remainder of export`,{itemId:t.id,frame:r,sourceTime:o,failureCount:e})):gr.warn(`Mediabunny frame draw failed, using fallback`,{itemId:t.id,frame:r,sourceTime:o,failureCount:e})}}let F=Dr({renderMode:i.renderMode,hasFallbackVideoElement:_,hasMediabunny:u.has(t.id),isMediabunnyDisabled:d.has(t.id),mediabunnyFailedThisFrame:y});if(!g&&!F)return;let I=l.get(t.id);if(!I){gr.warn(`Video element not found`,{itemId:t.id,frame:r});return}let ae=Math.max(0,Math.min(re,I.duration-.01)),oe=h?.05:.034,se=h?24:150,ce=h?40:300;if(Math.abs(I.currentTime-ae)>oe&&(I.currentTime=ae,h||await new Promise(e=>{let t=()=>{I.removeEventListener(`seeked`,t),e()};I.addEventListener(`seeked`,t),setTimeout(()=>{I.removeEventListener(`seeked`,t),e()},se)})),I.readyState<2){if(h)return;await new Promise(e=>{let t=()=>{I.readyState>=2&&(I.removeEventListener(`canplay`,t),I.removeEventListener(`loadeddata`,t),e())};I.addEventListener(`canplay`,t),I.addEventListener(`loadeddata`,t),t(),setTimeout(()=>{I.removeEventListener(`canplay`,t),I.removeEventListener(`loadeddata`,t),e()},ce)})}I.readyState<2||Nr(e,I,I.videoWidth,I.videoHeight,n,p,t.crop,void 0,i.canvasPool)}function zr(e,t,n,r){let i=n-t.from,a=i/r.fps,o=ut(e,t),s=e.sourceFps??r.fps,c=e.speed??1,l=e.durationInFrames*c*s/r.fps,u=e.sourceEnd??o+l,d=t.sourceTimeRamp&&!e.isReversed?gt(t.sourceTimeRamp,n):0,f=Fr(e.isReversed?(u-i*c*(s/r.fps)-1)/s:o/s+a*c+d/s,s,e.sourceDuration),p=Math.round(f*s);return Math.abs(f*s-p)<1e-6?(p+1e-4)/s:f}function Br(e,t,n,r,i){let{fps:a,canvasSettings:o,imageElements:s,gifFramesMap:c}=r,l=c.get(t.id);if(l&&l.frames.length>0){let s=i-t.from,c=t.speed??1,u=s/a*1e3*c,{frame:d}=A.getFrameAtTime(l,u);Nr(e,d,l.width,l.height,n,o,t.crop,void 0,r.canvasPool);return}let u=s.get(t.id);u&&Nr(e,u.source,u.width,u.height,n,o,t.crop,void 0,r.canvasPool)}const Vr={1:{textAlign:`left`,verticalAlign:`bottom`},2:{textAlign:`center`,verticalAlign:`bottom`},3:{textAlign:`right`,verticalAlign:`bottom`},4:{textAlign:`left`,verticalAlign:`middle`},5:{textAlign:`center`,verticalAlign:`middle`},6:{textAlign:`right`,verticalAlign:`middle`},7:{textAlign:`left`,verticalAlign:`top`},8:{textAlign:`center`,verticalAlign:`top`},9:{textAlign:`right`,verticalAlign:`top`}},Hr=/<\/?(?:i|b|u|font|c|v|ruby|rt|lang)\b[^>]*>|\{\\an[1-9]\}|\{\\[^}]*\}/gi;function Ur(e){if(e.length===0)return{spans:[],plainText:``,isEmpty:!0};let t,n=Wr(e),r=[{}],i=[],a=``;for(let e of n){if(e.kind===`text`){let t=r[r.length-1];if(e.value.length===0)continue;let n=i[i.length-1];n&&qr(n,t)?n.text+=e.value:i.push({text:e.value,...t}),a+=e.value;continue}if(e.kind===`open`){let t=Kr(r[r.length-1],e.format);r.push(t);continue}if(e.kind===`close`){r.length>1&&r.pop();continue}e.kind===`alignment`&&(t=e.alignment)}return{spans:i,plainText:a.trim(),isEmpty:a.trim().length===0,alignment:t}}function Wr(e){let t=[];Hr.lastIndex=0;let n=0;for(let r of e.matchAll(Hr)){let i=r.index??0;i>n&&t.push({kind:`text`,value:e.slice(n,i)}),t.push(Gr(r[0])),n=i+r[0].length}return n<e.length&&t.push({kind:`text`,value:e.slice(n)}),t}function Gr(e){let t=/^\{\\an([1-9])\}$/i.exec(e);if(t){let e=Vr[t[1]];return e?{kind:`alignment`,alignment:e}:{kind:`unknown`}}if(e.startsWith(`{`))return{kind:`unknown`};let n=/^<\/([a-z]+)\b/i.exec(e);if(n)return{kind:`close`,tag:n[1].toLowerCase()};let r=/^<([a-z]+)\b([^>]*)>$/i.exec(e);if(!r)return{kind:`unknown`};let i=r[1].toLowerCase(),a=r[2]??``;switch(i){case`i`:return{kind:`open`,format:{fontStyle:`italic`}};case`b`:return{kind:`open`,format:{fontWeight:`bold`}};case`u`:return{kind:`open`,format:{underline:!0}};case`font`:{let e=/color\s*=\s*"?([^"\s>]+)"?/i.exec(a);return e?{kind:`open`,format:{color:e[1]}}:{kind:`open`,format:{}}}default:return{kind:`open`,format:{}}}}function Kr(e,t){return{...e,...t}}function qr(e,t){return(e.fontStyle??void 0)===t.fontStyle&&(e.fontWeight??void 0)===t.fontWeight&&(e.underline??void 0)===t.underline&&(e.color??void 0)===t.color}(()=>{let e={};for(let[t,n]of Object.entries(Vr))e[`${n.textAlign}|${n.verticalAlign}`]=t;return e})();function Jr(e,t,n,r){let{canvasSettings:i,textMeasureCache:a}=r,o=i.width/2+n.x-n.width/2,s=i.height/2+n.y-n.height/2;e.save(),r.renderMode!==`preview`&&(e.beginPath(),e.rect(o,s,n.width,n.height),e.clip());let c=Se(e,(t,n)=>a.measure(e,t,n)),l=ve(t,n.width,n.height,c);if(t.backgroundColor&&l.background){let n=l.background;e.fillStyle=t.backgroundColor,n.radius>0?(e.beginPath(),e.roundRect(o+n.x,s+n.y,n.width,n.height,n.radius),e.fill()):e.fillRect(o+n.x,s+n.y,n.width,n.height)}t.textShadow&&(e.shadowColor=t.textShadow.color,e.shadowBlur=t.textShadow.blur,e.shadowOffsetX=t.textShadow.offsetX,e.shadowOffsetY=t.textShadow.offsetY),e.textBaseline=`alphabetic`,e.textAlign=`left`;let u=t.stroke?.width??0;for(let n of l.lines){if(n.text.length===0)continue;let r=o+n.startX,i=s+n.baselineY;e.font=n.cssFont,xe(e,n.letterSpacing),e.fillStyle=n.color,t.stroke&&u>0&&(e.strokeStyle=t.stroke.color,e.lineWidth=u*2,e.lineJoin=`round`,e.strokeText(n.text,r,i)),e.fillText(n.text,r,i),n.underline&&Zr(e,n,r,i)}e.restore()}function Yr(e,t,n,r,i){let a=i.canvasSettings.fps||30,o=(r-t.from)/a,s=Xr(t.cues,o);if(!s)return;let c=Ur(s.text);c.isEmpty||Jr(e,{id:t.id,type:`text`,trackId:t.trackId,from:t.from,durationInFrames:t.durationInFrames,label:t.label,mediaId:t.mediaId,text:c.plainText,textSpans:c.spans,fontSize:t.fontSize,fontFamily:t.fontFamily,fontWeight:t.fontWeight,fontStyle:t.fontStyle,underline:t.underline,color:t.color,backgroundColor:t.backgroundColor,backgroundRadius:t.backgroundRadius,textAlign:c.alignment?.textAlign??t.textAlign,verticalAlign:c.alignment?.verticalAlign??t.verticalAlign,lineHeight:t.lineHeight,letterSpacing:t.letterSpacing,textPadding:t.textPadding,textShadow:t.textShadow,stroke:t.stroke,transform:t.transform},n,i)}function Xr(e,t){if(e.length===0)return null;let n=0,r=e.length-1;for(;n<=r;){let i=n+r>>1,a=e[i];if(t<a.startSeconds)r=i-1;else if(t>=a.endSeconds)n=i+1;else return a}return null}function Zr(e,t,n,r){let i=ye(t);if(i<=0)return;let a=r+Math.max(1,t.fontSize*.08),o=e.lineWidth,s=e.strokeStyle;e.beginPath(),e.lineWidth=Math.max(1,t.fontSize*.05),e.strokeStyle=e.fillStyle,e.moveTo(n,a),e.lineTo(n+i,a),e.stroke(),e.lineWidth=o,e.strokeStyle=s}async function Qr(e,t,n,r,i,a){let o=i.subCompRenderData.get(t.compositionId);if(!o){r===0&&gr.warn(`renderCompositionItem: no subCompRenderData found`,{compositionId:t.compositionId.substring(0,8),mapSize:i.subCompRenderData.size,mapKeys:Array.from(i.subCompRenderData.keys()).map(e=>e.substring(0,8))});return}let c=a??lt(t),l=ut(t,c),u=r-c.from+l;if(u<0||u>=o.durationInFrames){r<5&&gr.warn(`renderCompositionItem: localFrame out of range`,{frame:r,itemFrom:c.from,sourceOffset:l,localFrame:u,durationInFrames:o.durationInFrames});return}let{canvas:d,ctx:f}=i.canvasPool.acquire(),{canvas:p,ctx:m}=i.canvasPool.acquire();try{d.width=t.compositionWidth,d.height=t.compositionHeight,p.width=t.compositionWidth,p.height=t.compositionHeight,f.clearRect(0,0,d.width,d.height),m.clearRect(0,0,p.width,p.height);let a={width:t.compositionWidth,height:t.compositionHeight,fps:o.fps},c={width:t.compositionWidth,height:t.compositionHeight,fps:o.fps},l={...i,fps:o.fps,canvasSettings:a},h=[];for(let e of o.sortedTracks)if(e.visible)for(let t of e.items){if(u<t.from||u>=t.from+t.durationInFrames||t.type!==`shape`||!t.isMask)continue;let n=St(t,o.keyframesMap.get(t.id),u,a),r=i.renderMode===`preview`?ae(t,i.getPreviewPathVerticesOverride):t;h.push({...Ot(r,n,c),trackOrder:e.order})}let g=o.adjustmentLayers??[],_=$r(o,u,a,g,i,h),v=0;for(let e of o.sortedTracks){if(!e.visible||_!==null&&e.order>_)continue;let n=h.filter(t=>fr(t.trackOrder,e.order));for(let d of e.items){if(u<d.from||u>=d.from+d.durationInFrames||d.type===`shape`&&d.isMask||d.type===`adjustment`)continue;let f=St(d,o.keyframesMap.get(d.id),u,a);r===0&&gr.info(`Rendering sub-comp item`,{itemId:d.id.substring(0,8),type:d.type,localFrame:u,subItemFrom:d.from,subItemDuration:d.durationInFrames,hasExtractor:i.videoExtractors.has(d.id),hasImage:i.imageElements.has(d.id),hasGif:i.gifFramesMap.has(d.id)});let p=Vt((i.renderMode===`preview`?i.getPreviewEffectsOverride?.(d.id):void 0)??d.effects,Bt(e.order,g,u,i.renderMode===`preview`?i.getPreviewEffectsOverride:void 0,i.renderMode===`preview`?i.getLiveItemSnapshotById:void 0)),h=p.length>0;if(!h&&n.length===0)await ni(m,d,f,u,l);else if(h){let{canvas:e,ctx:r}=i.canvasPool.acquire();e.width=t.compositionWidth,e.height=t.compositionHeight,r.clearRect(0,0,e.width,e.height);try{await ni(r,d,f,u,l,0,void 0,n);let{source:t,poolCanvases:a}=await Lt(i.canvasPool,e,p,s(d.cornerPin)?[]:n,u,c,i.gpuPipeline);m.drawImage(t,0,0);for(let e of a)i.canvasPool.release(e)}finally{i.canvasPool.release(e)}}else{let{canvas:e,ctx:r}=i.canvasPool.acquire();try{e.width=t.compositionWidth,e.height=t.compositionHeight,r.clearRect(0,0,e.width,e.height),await ni(r,d,f,u,l,0,void 0,n),s(d.cornerPin)?m.drawImage(e,0,0):Nt(m,e,n,c)}finally{i.canvasPool.release(e)}}v++}}r===0&&gr.info(`Sub-comp render complete`,{compositionId:t.compositionId.substring(0,8),localFrame:u,renderedSubItems:v,trackCount:o.sortedTracks.length}),f.drawImage(p,0,0);let y=Or(d.width,d.height,n,i.canvasSettings);e.drawImage(d,y.x,y.y,y.width,y.height)}finally{i.canvasPool.release(p),i.canvasPool.release(d)}}function $r(e,t,n,r,i,a=[]){for(let o of[...e.sortedTracks].sort((e,t)=>e.order-t.order))if(o.visible&&!a.some(e=>fr(e.trackOrder,o.order))){for(let a of o.items)if(ti(a,o.order,t,n,e.keyframesMap,r,i))return o.order}return null}function ei(e,t,n,r){let i={width:n.width,height:n.height,fps:n.fps},a=[];for(let o of e.sortedTracks)if(o.visible)for(let s of o.items){if(t<s.from||t>=s.from+s.durationInFrames||s.type!==`shape`||!s.isMask)continue;let c=r.renderMode===`preview`?ae(s,r.getPreviewPathVerticesOverride):s,l=St(s,e.keyframesMap.get(s.id),t,n);a.push({...Ot(c,l,i),shape:c,transform:l,trackOrder:o.order})}return a}function ti(e,t,n,r,i,a,o){if(n<e.from||n>=e.from+e.durationInFrames||e.type!==`video`&&e.type!==`image`||e.blendMode&&e.blendMode!==`normal`||s(e.cornerPin)||((o.renderMode===`preview`?o.getPreviewEffectsOverride?.(e.id):void 0)??e.effects??[]).some(e=>e.enabled!==!1)||Bt(t,a,n,o.renderMode===`preview`?o.getPreviewEffectsOverride:void 0,o.renderMode===`preview`?o.getLiveItemSnapshotById:void 0).some(e=>e.enabled!==!1))return!1;let c=i.get(e.id);if(x(Ct(e,c,n,r)))return!1;let l=St(e,c,n,r);if(l.opacity<1)return!1;let u=l.rotation%360;if(u!==0&&u!==180&&u!==-180||l.cornerRadius>0)return!1;let d=r.width/2+l.x-l.width/2,f=r.height/2+l.y-l.height/2,p=d+l.width,m=f+l.height;return d<=1&&f<=1&&p>=r.width-1&&m>=r.height-1}async function ni(e,t,n,r,i,a=0,o,c=[]){let l=i.getCurrentKeyframes?.(t.id)??i.keyframesMap.get(t.id),u=br(t.type===`text`?{..._(t,l,r-t.from,i.canvasSettings),cornerPin:t.cornerPin}:t,r,i,o),d=_r(n),f=u.type===`text`&&!s(u.cornerPin)?De(u,d):d;if(s(u.cornerPin)){await ii(e,u,f,r,i,a,o,c);return}if(e.save(),f.opacity!==1&&(e.globalAlpha=f.opacity),vr(e,u,f,i.canvasSettings),f.cornerRadius>0){let t=i.canvasSettings.width/2+f.x-f.width/2,n=i.canvasSettings.height/2+f.y-f.height/2;e.beginPath(),e.roundRect(t,n,f.width,f.height,f.cornerRadius),e.clip()}await ri(e,u,f,r,i,a,o),e.restore()}async function ri(e,t,n,r,i,a,o){let s=i.renderMode===`preview`?oe(t,i.getPreviewPathVerticesOverride):t;switch(s.type){case`video`:await Rr(e,s,n,r,i,a,o);break;case`image`:Br(e,s,n,i,r);break;case`text`:Jr(e,s,n,i);break;case`subtitle`:Yr(e,s,n,r,i);break;case`shape`:hr(e,s,_r(n),{width:i.canvasSettings.width,height:i.canvasSettings.height});break;case`composition`:await Qr(e,s,n,r,i,o);break}}async function ii(e,t,n,r,i,a,o,s=[]){let c=Math.ceil(n.width),l=Math.ceil(n.height);if(c<=0||l<=0)return;let u=new OffscreenCanvas(c,l),d=u.getContext(`2d`);if(!d)return;let p={...n,x:0,y:0},h={...i,canvasSettings:{width:c,height:l,fps:i.canvasSettings.fps}};if(s.length>0){let e=new OffscreenCanvas(i.canvasSettings.width,i.canvasSettings.height),u=e.getContext(`2d`);if(!u)return;await ri(u,t,n,r,i,a,o);let f=new OffscreenCanvas(i.canvasSettings.width,i.canvasSettings.height),p=f.getContext(`2d`);if(!p)return;Nt(p,e,s,i.canvasSettings);let m=i.canvasSettings.width/2+n.x-n.width/2,h=i.canvasSettings.height/2+n.y-n.height/2;d.drawImage(f,m,h,c,l,0,0,c,l)}else await ri(d,t,p,r,h,a,o);n.cornerRadius>0&&(d.save(),d.globalCompositeOperation=`destination-in`,d.beginPath(),d.roundRect(0,0,c,l,n.cornerRadius),d.fill(),d.restore());let g=i.canvasSettings.width/2+n.x-n.width/2,_=i.canvasSettings.height/2+n.y-n.height/2,v=n.opacity!==1,y=m(c,l,s.length>0?void 0:t.type===`video`||t.type===`image`?{sourceWidth:t.sourceWidth,sourceHeight:t.sourceHeight,crop:t.crop}:void 0),b=Math.max(1,Math.round(y.width)),x=Math.max(1,Math.round(y.height)),S=f(t.cornerPin,b,x);if(!S)return;let C=b===c&&x===l&&Math.abs(y.x)<.01&&Math.abs(y.y)<.01?u:new OffscreenCanvas(b,x);if(C!==u){let e=C.getContext(`2d`);if(!e)return;e.clearRect(0,0,b,x),e.drawImage(u,y.x,y.y,y.width,y.height,0,0,b,x)}let w=t.type===`text`?`projective`:`mesh`,T=e=>{let t=[e,C,b,x,g+y.x,_+y.y,S];if(w===`projective`){D(...t,void 0,w);return}D(...t)};e.save(),v&&(e.globalAlpha=n.opacity),vr(e,t,n,i.canvasSettings);try{if(v){let{canvas:t,ctx:n}=i.canvasPool.acquire();try{(t.width!==i.canvasSettings.width||t.height!==i.canvasSettings.height)&&(t.width=i.canvasSettings.width,t.height=i.canvasSettings.height),n.clearRect(0,0,t.width,t.height),T(n),e.drawImage(t,0,0)}finally{i.canvasPool.release(t)}}else T(e)}finally{e.restore()}}const ai=t(`TransitionRegistry`),oi=new class{entries=new Map;register(e,t,n){this.entries.has(e)&&ai.warn(`Transition "${e}" is being overwritten`),this.entries.set(e,{definition:t,renderer:n})}unregister(e){return this.entries.delete(e)}get(e){return this.entries.get(e)}getRenderer(e){return this.entries.get(e)?.renderer}getDefinition(e){return this.entries.get(e)?.definition}has(e){return this.entries.has(e)}getAll(){return new Map(this.entries)}getByCategory(e){let t=[];for(let n of this.entries.values())n.definition.category===e&&t.push(n);return t}getDefinitions(){return Array.from(this.entries.values()).map(e=>e.definition)}getIds(){return Array.from(this.entries.keys())}clear(){this.entries.clear()}get size(){return this.entries.size}};t(`CanvasTransitions`);function si(e){return Math.max(0,Math.min(1,e))}function ci(e,t){let n=Math.cos(e*Math.PI/2);return t?n*n:1-n*n}function li(e,t){return t?1-.04*e:1.04-.04*e}function ui(e,t,n,r,i){e.save(),e.globalAlpha=i,e.translate(n.width/2,n.height/2),e.scale(r,r),e.translate(-n.width/2,-n.height/2),e.drawImage(t,0,0),e.restore()}function di(e,t,n,r,i=1){e.save(),e.globalAlpha=i,e.translate(n.width/2,n.height/2),e.scale(r,r),e.translate(-n.width/2,-n.height/2),e.drawImage(t,0,0),e.restore()}function fi(e,t,n,r,i){let a=si(r);e.save(),e.globalCompositeOperation=`copy`,ui(e,n,i,li(a,!1),ci(a,!1)),e.globalCompositeOperation=`lighter`,ui(e,t,i,li(a,!0),ci(a,!0)),e.restore()}function pi(e){switch(e){case`from-left`:return{x:1,y:0};case`from-right`:return{x:-1,y:0};case`from-top`:return{x:0,y:1};case`from-bottom`:return{x:0,y:-1};default:return{x:0,y:0}}}function mi(e,t,n,r){let i=si(e),a=pi(t),o=n?.035:.025,s=n?i:i-1;return{x:a.x*s*r.width*o,y:a.y*s*r.height*o}}function hi(e,t,n,r){let i=si(e),a=new Path2D;switch(t){case`from-left`:n?a.rect(i*r.width,0,r.width,r.height):a.rect(0,0,i*r.width,r.height);break;case`from-right`:n?a.rect(0,0,(1-i)*r.width,r.height):a.rect((1-i)*r.width,0,r.width,r.height);break;case`from-top`:n?a.rect(0,i*r.height,r.width,r.height):a.rect(0,0,r.width,i*r.height);break;case`from-bottom`:n?a.rect(0,0,r.width,(1-i)*r.height):a.rect(0,(1-i)*r.height,r.width,r.height);break}return a}function gi(e,t,n,r,i,a){let o=si(r),s=mi(o,i,!1,a);e.save();let c=hi(o,i,!1,a);e.clip(c),e.globalAlpha=1,e.drawImage(n,s.x,s.y),e.restore();let l=mi(o,i,!0,a);e.save();let u=hi(o,i,!0,a);e.clip(u),e.globalAlpha=1,e.drawImage(t,l.x,l.y),e.restore()}function _i(e,t,n,r){let i=n?e:e-1;switch(t){case`from-left`:return{x:Math.round(i*r.width),y:0};case`from-right`:return{x:Math.round(-i*r.width),y:0};case`from-top`:return{x:0,y:Math.round(i*r.height)};case`from-bottom`:return{x:0,y:Math.round(-i*r.height)};default:return{x:0,y:0}}}function vi(e,t,n,r,i,a){let o=_i(r,i,!1,a);e.drawImage(n,o.x,o.y);let s=_i(r,i,!0,a);e.drawImage(t,s.x,s.y)}function yi(e,t,n,r,i,a){let o=Math.max(0,Math.min(1,r)),s=i===`from-left`||i===`from-right`,c=.5;if(o<c){let n=o/c,r=Math.cos(n*Math.PI/2);e.save(),e.translate(a.width/2,a.height/2),s?e.scale(r,1):e.scale(1,r),e.translate(-a.width/2,-a.height/2),e.drawImage(t,0,0),e.restore()}else{let t=(o-c)/c,r=Math.sin(t*Math.PI/2);e.save(),e.translate(a.width/2,a.height/2),s?e.scale(r,1):e.scale(1,r),e.translate(-a.width/2,-a.height/2),e.drawImage(n,0,0),e.restore()}}function bi(e,t,n,r,i){let a=si(r),o=i.width/2,s=i.height/2,c=Math.sqrt(i.width*i.width+i.height*i.height),l=-Math.PI/2,u=l+a*Math.PI*2;di(e,n,i,1.04-.04*a,.85+.15*a),e.save();let d=new Path2D;d.moveTo(o,s),d.arc(o,s,c,u,l+Math.PI*2,!1),d.closePath(),e.clip(d),di(e,t,i,1-.04*a,1-.1*a),e.restore()}function xi(e,t){return Math.sqrt((e/2)**2+(t/2)**2)*1.2}function Si(e,t,n,r,i){let a=si(r),o=a*xi(i.width,i.height),s=i.width/2,c=i.height/2;di(e,n,i,1.04-.04*a,.85+.15*a),e.save();let l=new Path2D;l.rect(0,0,i.width,i.height),l.arc(s,c,o,0,Math.PI*2),e.clip(l,`evenodd`),di(e,t,i,1-.04*a,1-.1*a),e.restore()}function Ci(e,t,n,r){r<.5?e.drawImage(t,0,0):e.drawImage(n,0,0)}function wi(e,t,n,r,i,a){let{transition:o,progress:s}=t,c=o.presentation,l=o.direction,u=oi.getRenderer(c);if(u?.gpuTransitionId&&a?.has(u.gpuTransitionId)){let t=a.render(u.gpuTransitionId,n,r,s,i.width,i.height,l,o.properties);if(t){e.drawImage(t,0,0);return}}if(u?.renderCanvas){u.renderCanvas(e,n,r,s,l,i,o.properties);return}switch(c){case`fade`:fi(e,n,r,s,i);break;case`wipe`:gi(e,n,r,s,l||`from-left`,i);break;case`slide`:vi(e,n,r,s,l||`from-left`,i);break;case`flip`:yi(e,n,r,s,l||`from-left`,i);break;case`clockWipe`:bi(e,n,r,s,i);break;case`iris`:Si(e,n,r,s,i);break;default:Ci(e,n,r,s);break}}async function Ti(e,t,n,r,i){let{participant:a,media:o}=e,s=a.effects.length>0?n.acquire(t.canvasSettings.width,t.canvasSettings.height):r;try{return(o.kind===`shape`?t.gpuShapePipeline?.renderShapeToTexture(s,{outputWidth:t.canvasSettings.width,outputHeight:t.canvasSettings.height,transformRect:e.transformRect,rotationRad:e.rotationRad,opacity:a.transform.opacity,shapeType:o.item.shapeType,fillColor:o.fillColor,strokeColor:o.strokeColor,strokeWidth:o.item.strokeWidth,cornerRadius:o.item.cornerRadius,direction:o.item.direction,points:o.item.points,innerRadius:o.item.innerRadius,aspectRatioLocked:a.item.transform?.aspectRatioLocked,pathVertices:o.pathVertices,clear:i?.clear,blend:i?.blend})??!1:o.kind===`text`||o.kind===`composition`?t.gpuMediaPipeline?.renderTextureToTexture(o.texture,s,{sourceWidth:o.sourceWidth,sourceHeight:o.sourceHeight,outputWidth:t.canvasSettings.width,outputHeight:t.canvasSettings.height,sourceRect:{x:0,y:0,width:o.sourceWidth,height:o.sourceHeight},destRect:e.destRect,transformRect:e.transformRect,cornerRadius:e.cornerRadius,cornerPin:e.cornerPin,opacity:a.transform.opacity,rotationRad:e.rotationRad,clear:i?.clear,blend:i?.blend})??!1:t.gpuMediaPipeline?.renderSourceToTexture(o.source,s,{sourceWidth:o.sourceWidth,sourceHeight:o.sourceHeight,outputWidth:t.canvasSettings.width,outputHeight:t.canvasSettings.height,sourceRect:e.sourceRect,destRect:e.destRect,transformRect:e.transformRect,featherPixels:e.featherPixels,cornerRadius:e.cornerRadius,cornerPin:e.cornerPin,opacity:a.transform.opacity,rotationRad:e.rotationRad,flipX:e.flipX,flipY:e.flipY,clear:i?.clear,blend:i?.blend})??!1)?s===r?!0:t.gpuPipeline?t.gpuPipeline.applyTextureEffectsToTexture(s,Rt(a.effects),r,t.canvasSettings.width,t.canvasSettings.height):!1:!1}finally{s!==r&&n.release(s)}}async function Ei(e,t,n,r,i,a,o,s){if(!i.gpuPipeline||!i.gpuMediaPipeline||e.type!==`video`&&e.type!==`image`)return!1;let c=n.filter(e=>e.enabled);if(c.length===0||c.some(e=>e.effect.type!==`gpu-effect`)||e.type===`video`&&!i.useMediabunny.has(e.id)&&!await i.ensureVideoItemReady?.(e.id))return!1;let l=await Oi({item:e,transform:t,effects:c,renderSpan:s??lt(e)},r,i);if(!l)return!1;try{return Ti(l,i,o,a)}finally{l.media.close?.()}}function Di(e,t,n,r,i){if(i.renderMode!==`preview`||e.type!==`video`||!i.gpuPipeline||!i.domVideoElementProvider||e.crop||s(e.cornerPin))return null;if(Math.abs(t.rotation)>.001)return t.rotation,null;if(Math.abs(t.opacity-1)>.001)return t.opacity,null;if(t.cornerRadius>.001)return t.cornerRadius,null;if(e.transform?.flipHorizontal||e.transform?.flipVertical)return null;let a=n.filter(e=>e.enabled);if(a.length===0||a.some(e=>e.effect.type!==`gpu-effect`))return null;let o=i.domVideoElementProvider(e.id),c=Cr({domVideo:o,sourceTime:zr(e,lt(e),r,i),speed:e.speed??1,isRenderingTransition:i.isRenderingTransition===!0});if(!o)return null;if(!c.shouldDraw)return c.hasReadyDomVideo,c.drift,c.driftThreshold,o.currentTime,o.readyState,o.videoWidth,null;let l=kr(o.videoWidth,o.videoHeight,t,i.canvasSettings,void 0);if(Ar(l.featherPixels))return null;try{let e=i.gpuPipeline.applyEffectsToVideo(o,Rt(a),l.mediaRect,i.canvasSettings.width,i.canvasSettings.height);return a.length,o.currentTime,e}catch{return null}}async function Oi(e,t,n){let r=await ki(e,e.transform,t,n);if(!r)return null;if(r.kind===`shape`){let t={x:n.canvasSettings.width/2+e.transform.x-e.transform.width/2,y:n.canvasSettings.height/2+e.transform.y-e.transform.height/2,width:e.transform.width,height:e.transform.height};return t.width<=0||t.height<=0?null:{participant:e,media:r,sourceRect:{x:0,y:0,width:r.sourceWidth,height:r.sourceHeight},destRect:t,transformRect:t,featherPixels:{left:0,right:0,top:0,bottom:0},cornerRadius:e.transform.cornerRadius,rotationRad:e.transform.rotation*Math.PI/180,flipX:!1,flipY:!1}}if(r.kind===`text`){let t={...e.transform,width:r.sourceWidth,height:r.sourceHeight},i={x:n.canvasSettings.width/2+t.x-t.width/2,y:n.canvasSettings.height/2+t.y-t.height/2,width:t.width,height:t.height};return i.width<=0||i.height<=0?null:{participant:e,media:r,sourceRect:{x:0,y:0,width:r.sourceWidth,height:r.sourceHeight},destRect:i,transformRect:i,featherPixels:{left:0,right:0,top:0,bottom:0},cornerRadius:e.transform.cornerRadius,cornerPin:Yi(r.item,i),rotationRad:e.transform.rotation*Math.PI/180,flipX:!1,flipY:!1}}if(r.kind===`composition`){let t=Or(r.sourceWidth,r.sourceHeight,e.transform,n.canvasSettings);return t.width<=0||t.height<=0?null:{participant:e,media:r,sourceRect:{x:0,y:0,width:r.sourceWidth,height:r.sourceHeight},destRect:t,transformRect:t,featherPixels:{left:0,right:0,top:0,bottom:0},cornerRadius:e.transform.cornerRadius,rotationRad:e.transform.rotation*Math.PI/180,flipX:!1,flipY:!1}}let i=kr(r.sourceWidth,r.sourceHeight,e.transform,n.canvasSettings,r.item.crop);if(i.viewportRect.width<=0||i.viewportRect.height<=0)return r.close?.(),null;let a={x:n.canvasSettings.width/2+e.transform.x-e.transform.width/2,y:n.canvasSettings.height/2+e.transform.y-e.transform.height/2,width:e.transform.width,height:e.transform.height};return{participant:e,media:r,sourceRect:{x:(i.viewportRect.x-i.mediaRect.x)/i.mediaRect.width*r.sourceWidth,y:(i.viewportRect.y-i.mediaRect.y)/i.mediaRect.height*r.sourceHeight,width:i.viewportRect.width/i.mediaRect.width*r.sourceWidth,height:i.viewportRect.height/i.mediaRect.height*r.sourceHeight},destRect:i.viewportRect,transformRect:a,featherPixels:i.featherPixels,cornerRadius:e.transform.cornerRadius,cornerPin:Yi(r.item,i.mediaRect),rotationRad:e.transform.rotation*Math.PI/180,flipX:e.item.transform?.flipHorizontal??!1,flipY:e.item.transform?.flipVertical??!1}}async function ki(e,t,n,r){if(t.opacity<0||t.opacity>1)return null;if(e.item.type===`shape`){let n=e.item;if(Li(n,t,e.effects,r))return null;let i=(n.shapeType===`path`?Zi(n,t):void 0)??void 0,a=Xi(n.fillColor),o=n.strokeWidth&&n.strokeWidth>0&&n.strokeColor?Xi(n.strokeColor):void 0;if(!a)return null;let s=o??void 0;return{kind:`shape`,item:n,sourceWidth:t.width,sourceHeight:t.height,fillColor:a,strokeColor:s,pathVertices:i}}if(e.item.type===`image`){let t=r.imageElements.get(e.item.id);return t?{kind:`media`,item:e.item,source:t.source,sourceWidth:t.width,sourceHeight:t.height}:null}if(e.item.type===`text`)return Ai(e,n,r);if(e.item.type===`composition`)return Mi(e,n,r);if(e.item.type!==`video`||!r.useMediabunny.has(e.item.id)||r.mediabunnyDisabledItems.has(e.item.id))return null;let i=r.videoExtractors.get(e.item.id);if(!i)return null;let a=zr(e.item,e.renderSpan,n,r),o=await i.captureFrame(a);if(!o.success||!o.frame)return null;let s=`displayWidth`in o.frame?o.frame.displayWidth:o.frame.width,c=`displayHeight`in o.frame?o.frame.displayHeight:o.frame.height;return{kind:`media`,item:e.item,source:o.frame,sourceWidth:s,sourceHeight:c,close:()=>o.frame?.close()}}function Ai(e,t,n){if(!n.gpuPipeline||!n.gpuMediaPipeline||!n.gpuTextTextureCache)return null;let r=n.getCurrentKeyframes?.(e.item.id)??n.keyframesMap.get(e.item.id),i={..._(e.item,r,t-e.item.from,n.canvasSettings),cornerPin:e.item.cornerPin},a=_r(e.transform),o=De(i,a),c=s(i.cornerPin)?a:o,l=Math.max(2,Math.ceil(c.width)),u=Math.max(2,Math.ceil(c.height)),d=Vi(i,l,u),f=n.gpuTextTextureCache.get(d);if(f)return n.gpuTextTextureCache.delete(d),n.gpuTextTextureCache.set(d,f),Ji(`hit`,{itemId:e.item.id,width:f.width,height:f.height,bytes:f.bytes,cacheBytes:Ki(n.gpuTextTextureCache),entries:n.gpuTextTextureCache.size}),{kind:`text`,item:i,sourceWidth:f.width,sourceHeight:f.height,texture:f.texture};if(n.gpuTextPipeline&&ji()){let t=n.gpuPipeline.getDevice().createTexture({size:{width:l,height:u},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT});if(n.gpuTextPipeline.renderTextToTexture(t,{outputWidth:l,outputHeight:u,item:i,width:l,height:u}))return Ji(`atlas-render`,{itemId:e.item.id,width:l,height:u,bytes:Gi(l,u)}),n.gpuTextTextureCache.set(d,{texture:t,width:l,height:u,bytes:Gi(l,u)}),Ui(n.gpuTextTextureCache),{kind:`text`,item:i,sourceWidth:l,sourceHeight:u,texture:t};t.destroy()}return Ji(`miss`,{itemId:e.item.id,width:l,height:u,bytes:Gi(l,u),cacheBytes:Ki(n.gpuTextTextureCache),entries:n.gpuTextTextureCache.size,reason:`glyph-atlas-unavailable`}),null}function ji(){return!0}async function Mi(e,t,n){if(!n.gpuPipeline||!n.gpuMediaPipeline||n.gpuCompositionStack?.has(e.item.compositionId))return null;let r=Math.max(2,Math.ceil(e.item.compositionWidth)),i=Math.max(2,Math.ceil(e.item.compositionHeight)),a=new Set(n.gpuCompositionStack);a.add(e.item.compositionId);let o=await Ni(e,t,{...n,gpuCompositionStack:a},r,i);return o?{kind:`composition`,item:e.item,sourceWidth:r,sourceHeight:i,texture:o,close:()=>o.destroy()}:null}async function Ni(e,t,n,r,i){let a=n.gpuPipeline;if(!a)return null;let o=n.subCompRenderData.get(e.item.compositionId),s=o?.adjustmentLayers??[];if(!o)return null;let c=e.renderSpan??lt(e.item),l=ut(e.item,c),u=t-c.from+l;if(u<0||u>=o.durationInFrames)return null;let d=ei(o,u,{width:r,height:i,fps:o.fps},n),f={width:r,height:i,fps:o.fps},p=$r(o,u,f,s,n,d),m=[];for(let e of o.sortedTracks)if(e.visible&&!(p!==null&&e.order>p))for(let t of e.items){if(u<t.from||u>=t.from+t.durationInFrames||t.type===`adjustment`||t.type===`shape`&&t.isMask)continue;if(t.blendMode&&t.blendMode!==`normal`&&!n.gpuMediaBlendPipeline)return null;let r=d.filter(t=>fr(t.trackOrder,e.order));if(!Ri(r))return null;let i=Vt((n.renderMode===`preview`?n.getPreviewEffectsOverride?.(t.id):void 0)??t.effects??[],Bt(e.order,s,u,n.renderMode===`preview`?n.getPreviewEffectsOverride:void 0,n.renderMode===`preview`?n.getLiveItemSnapshotById:void 0));if(i.some(e=>e.enabled&&e.effect.type!==`gpu-effect`)||i.some(e=>e.enabled)&&!n.gpuPipeline)return null;m.push({participant:{item:t,transform:St(t,o.keyframesMap.get(t.id),u,f),effects:i,renderSpan:lt(t)},masks:r})}if(m.length===0)return null;let h=a.getDevice().createTexture({size:{width:r,height:i},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_DST}),g={...n,fps:o.fps,canvasSettings:f};try{let e=0;for(let t of m){let n=await Oi(t.participant,u,g);if(!n)return h.destroy(),null;try{if(!await Pi(n,g,h,t.masks,{clear:e===0,blend:!0}))return h.destroy(),null}finally{n.media.close?.()}e++}return h}catch(e){throw h.destroy(),e}}async function Pi(e,t,n,r,i){let a=e.participant.effects.filter(e=>e.enabled),o=e.participant.item.blendMode??`normal`,s=i.blend&&!i.clear,c=t.gpuPipeline,l=t.gpuMediaPipeline,u=t.gpuMediaBlendPipeline,d=t.gpuShapePipeline,f=t.gpuMaskCombinePipeline,p=s&&!!u;if(a.length===0&&r.length===0&&!p)return Ti(e,t,{acquire:()=>n,release:()=>void 0},n,i);if(!c||!l||r.length>0&&!d||r.length>1&&!f)return!1;let m=c.getDevice(),h=[],g=()=>{let e=Fi(t,m,t.canvasSettings.width,t.canvasSettings.height);return h.push(e),e},_=g(),v=g(),y=p&&u?g():null,b=p?g():null,x=r.map(()=>g()),S=Array.from({length:Math.max(0,r.length-1)},()=>g());try{if(!await Ti({...e,participant:{...e.participant,effects:[]}},t,{acquire:()=>_,release:()=>void 0},_,{clear:!0,blend:!1}))return!1;let s=_;if(a.length>0){if(!c.applyTextureEffectsToTexture(_,Rt(a),v,t.canvasSettings.width,t.canvasSettings.height))return!1;s=v}let d=null;if(r.length>0){for(let e=0;e<r.length;e++)if(!zi(r[e],t,x[e]))return!1;if(r.length===1)d=x[0];else{let e=x[0],t=r[0]?.inverted??!1;for(let n=1;n<x.length;n++){let i=S[n-1];if(!f?.combine(e,x[n],i,{invertBase:t,invertNext:r[n]?.inverted??!1}))return!1;e=i,t=!1}d=e}}let h=p&&b?b:n;if(!l.renderTextureToTexture(s,h,{sourceWidth:t.canvasSettings.width,sourceHeight:t.canvasSettings.height,outputWidth:t.canvasSettings.width,outputHeight:t.canvasSettings.height,sourceRect:{x:0,y:0,width:t.canvasSettings.width,height:t.canvasSettings.height},destRect:{x:0,y:0,width:t.canvasSettings.width,height:t.canvasSettings.height},transformRect:{x:0,y:0,width:t.canvasSettings.width,height:t.canvasSettings.height},opacity:1,rotationRad:0,clear:p?!0:i.clear,blend:p?!1:i.blend,maskTexture:d??void 0,maskInvert:r.length===1?r[0]?.inverted:!1}))return!1;if(!p||!u||!y)return!0;if(!u.blend(n,h,y,o))return!1;let g=m.createCommandEncoder();return g.copyTextureToTexture({texture:y},{texture:n},{width:t.canvasSettings.width,height:t.canvasSettings.height}),m.queue.submit([g.finish()]),!0}finally{for(let e of h)Ii(t,e)}}function Fi(e,t,n,r){return e.gpuScratchTexturePool?.acquire(n,r)??t.createTexture({size:{width:n,height:r},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_DST|GPUTextureUsage.COPY_SRC})}function Ii(e,t){if(e.gpuScratchTexturePool){e.gpuScratchTexturePool.release(t);return}t.destroy()}function Li(e,t,n=[],r){return r.gpuShapePipeline?e.isMask?`shape-mask`:e.shapeType===`path`&&!Zi(e,t)?`unsupported-path-complexity`:Xi(e.fillColor)?e.strokeWidth&&e.strokeWidth>0&&e.strokeColor&&!Xi(e.strokeColor)?`unsupported-shape-stroke`:n.length>0&&!r.gpuPipeline?`gpu-effects-pipeline-unavailable`:null:`unsupported-shape-fill`:`shape-pipeline-unavailable`}function Ri(e){if(e.length===0)return!0;for(let t of e)if(!t.bitmapMask&&(s(t.shape.cornerPin)||(t.shape.strokeWidth??0)>0||t.shape.shapeType===`path`&&!Zi(t.shape,t.transform)))return!1;return!0}function zi(e,t,n){if(e.bitmapMask){let r=t.gpuPipeline?.getDevice();if(!r||n.width!==e.bitmapMask.width||n.height!==e.bitmapMask.height)return!1;let i=t.gpuBitmapMaskTextureCache,a=i?Hi(e):null,o=a?i?.get(a):void 0;if(o)return i?.delete(a),i?.set(a,o),Bi(r,o.texture,n,o.width,o.height),!0;if(i&&a){let t=r.createTexture({size:{width:e.bitmapMask.width,height:e.bitmapMask.height},format:`rgba8unorm`,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.COPY_SRC|GPUTextureUsage.RENDER_ATTACHMENT});r.queue.copyExternalImageToTexture({source:e.bitmapMask,flipY:!1},{texture:t},{width:e.bitmapMask.width,height:e.bitmapMask.height}),i.set(a,{texture:t,width:e.bitmapMask.width,height:e.bitmapMask.height,bytes:Gi(e.bitmapMask.width,e.bitmapMask.height)}),Wi(i);let o=i.get(a);return o?(Bi(r,o.texture,n,o.width,o.height),!0):!1}return r.queue.copyExternalImageToTexture({source:e.bitmapMask,flipY:!1},{texture:n},{width:e.bitmapMask.width,height:e.bitmapMask.height}),!0}let r=t.gpuShapePipeline;if(!r)return!1;let i=e.shape.shapeType===`path`?Zi(e.shape,e.transform):void 0;if(e.shape.shapeType===`path`&&!i)return!1;let a=i??void 0,o={x:t.canvasSettings.width/2+e.transform.x-e.transform.width/2,y:t.canvasSettings.height/2+e.transform.y-e.transform.height/2,width:e.transform.width,height:e.transform.height};return r.renderShapeToTexture(n,{outputWidth:t.canvasSettings.width,outputHeight:t.canvasSettings.height,transformRect:o,rotationRad:e.transform.rotation*Math.PI/180,opacity:1,shapeType:e.shape.shapeType,fillColor:[1,1,1,1],cornerRadius:e.shape.cornerRadius,direction:e.shape.direction,points:e.shape.points,innerRadius:e.shape.innerRadius,aspectRatioLocked:e.shape.transform?.aspectRatioLocked,pathVertices:a,maskFeatherPixels:e.maskType===`alpha`?e.feather:0,clear:!0,blend:!1})}function Bi(e,t,n,r,i){let a=e.createCommandEncoder();a.copyTextureToTexture({texture:t},{texture:n},{width:r,height:i}),e.queue.submit([a.finish()])}function Vi(e,t,n){return JSON.stringify({width:t,height:n,text:e.text,textSpans:e.textSpans,fontSize:e.fontSize,fontFamily:e.fontFamily,fontWeight:e.fontWeight,fontStyle:e.fontStyle,underline:e.underline,color:e.color,backgroundColor:e.backgroundColor,backgroundRadius:e.backgroundRadius,textAlign:e.textAlign,verticalAlign:e.verticalAlign,lineHeight:e.lineHeight,letterSpacing:e.letterSpacing,textPadding:e.textPadding,textShadow:e.textShadow,stroke:e.stroke})}function Hi(e){return JSON.stringify({id:e.shape.id,shapeType:e.shape.shapeType,width:e.bitmapMask?.width,height:e.bitmapMask?.height,transform:{x:e.transform.x,y:e.transform.y,width:e.transform.width,height:e.transform.height,rotation:e.transform.rotation,opacity:e.transform.opacity,cornerRadius:e.transform.cornerRadius},cornerPin:e.shape.cornerPin,fillColor:e.shape.fillColor,strokeColor:e.shape.strokeColor,strokeWidth:e.shape.strokeWidth,direction:e.shape.direction,points:e.shape.points,innerRadius:e.shape.innerRadius,pathVertices:e.shape.pathVertices,maskType:e.maskType,feather:e.feather})}function Ui(e){for(;Ki(e)>67108864;){let t=e.keys().next().value;if(t===void 0)return;let n=e.get(t);n?.texture.destroy(),e.delete(t),Ji(`evict`,{width:n?.width,height:n?.height,bytes:n?.bytes,cacheBytes:Ki(e),entries:e.size})}}function Wi(e){for(;qi(e)>67108864;){let t=e.keys().next().value;if(t===void 0)return;e.get(t)?.texture.destroy(),e.delete(t)}}function Gi(e,t){return e*t*4}function Ki(e){let t=0;for(let n of e.values())t+=n.bytes;return t}function qi(e){let t=0;for(let n of e.values())t+=n.bytes;return t}function Ji(e,t){ra()&&gr.debug(`GPU text texture cache`,{event:e,...t})}function Yi(e,t){if(!s(e.cornerPin))return;let n=f(e.cornerPin,t.width,t.height);if(!n||!s(n))return;let r=p(c(t.width,t.height,n));if(r)return{originX:t.x,originY:t.y,width:t.width,height:t.height,inverseMatrix:r}}function Xi(e){let t=e.trim(),n=t.match(/^#([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i);if(n){let e=n[1];return e.length===3&&(e=e.split(``).map(e=>e+e).join(``)),[Number.parseInt(e.slice(0,2),16)/255,Number.parseInt(e.slice(2,4),16)/255,Number.parseInt(e.slice(4,6),16)/255,e.length===8?Number.parseInt(e.slice(6,8),16)/255:1]}let r=t.match(/^rgba?\(([^)]+)\)$/i);if(!r)return null;let i=r[1].split(`,`).map(e=>e.trim());if(i.length<3)return null;let a=e=>e.endsWith(`%`)?Number.parseFloat(e)/100:Number.parseFloat(e)/255,o=a(i[0]),s=a(i[1]),c=a(i[2]),l=i[3]===void 0?1:Number.parseFloat(i[3]);return[o,s,c,l].every(Number.isFinite)?[o,s,c,l]:null}function Zi(e,t){let n=e.pathVertices;if(!n||n.length<3)return null;let r=[],i=e=>[(e[0]-.5)*t.width,(e[1]-.5)*t.height];r.push(i(n[0].position));for(let e=0;e<n.length;e++){let t=n[e],a=n[(e+1)%n.length];if(!(t.outHandle[0]!==0||t.outHandle[1]!==0||a.inHandle[0]!==0||a.inHandle[1]!==0)){e<n.length-1&&r.push(i(a.position));continue}let o=t.position,s=[t.position[0]+t.outHandle[0],t.position[1]+t.outHandle[1]],c=[a.position[0]+a.inHandle[0],a.position[1]+a.inHandle[1]],l=a.position,u=Math.max(2,Math.min(6,Math.ceil($i(o,s,c,l)*8)));for(let t=1;t<=u;t++)e===n.length-1&&t===u||r.push(i(Qi(o,s,c,l,t/u)))}return r.length<3?null:r.length<=32?r:ta(r,32)}function Qi(e,t,n,r,i){let a=1-i,o=a*a*a,s=3*a*a*i,c=3*a*i*i,l=i*i*i;return[o*e[0]+s*t[0]+c*n[0]+l*r[0],o*e[1]+s*t[1]+c*n[1]+l*r[1]]}function $i(e,t,n,r){return ea(e,t)+ea(t,n)+ea(n,r)}function ea(e,t){return Math.hypot(e[0]-t[0],e[1]-t[1])}function ta(e,t){if(e.length<=t)return e;if(t<3)return null;let n=e.map((t,n)=>ea(t,e[(n+1)%e.length])),r=n.reduce((e,t)=>e+t,0);if(r<=0)return null;let i=[e[0]];for(let a=1;a<t;a++)i.push(na(e,n,r*a/t));return i.length>=3?i:null}function na(e,t,n){let r=0;for(let i=0;i<e.length;i++){let a=t[i]??0,o=e[(i+1)%e.length];if(!(a<=0)){if(r+a>=n){let t=(n-r)/a,s=e[i];return[s[0]+(o[0]-s[0])*t,s[1]+(o[1]-s[1])*t]}r+=a}}return e[e.length-1]}function ra(){return typeof location<`u`&&location.search.includes(`debugGpuTransitions=1`)?!0:typeof localStorage>`u`?!1:localStorage.getItem(`freecut.debugGpuTransitions`)===`1`}async function ia(e,t,n,r,i,a=[]){let o=await oa(t,n,r,i,a);try{wi(e,t,o.leftFinalCanvas,o.rightFinalCanvas,r.canvasSettings,r.gpuTransitionPipeline)}finally{for(let e of o.poolCanvases)r.canvasPool.release(e)}}async function aa(e,t,n,r,i=[]){let{canvasPool:a}=n,{leftClip:o,rightClip:s}=e,c=pa(o,e,t,r,n),l=pa(s,e,t,r,n),{canvas:u,ctx:d}=a.acquire(),{canvas:f,ctx:p}=a.acquire(),m=[u,f];try{let e=n.isRenderingTransition;n.isRenderingTransition=!0;try{await Promise.all([ni(d,c.item,c.transform,t,n,0,c.renderSpan,i),ni(p,l.item,l.transform,t,n,0,l.renderSpan,i)])}finally{n.isRenderingTransition=e}return{leftCanvas:u,rightCanvas:f,leftParticipant:c,rightParticipant:l,poolCanvases:m}}catch(e){for(let e of m)a.release(e);throw e}}async function oa(e,t,n,r,i=[]){let{canvasPool:a,canvasSettings:o}=n,{leftCanvas:c,rightCanvas:l,leftParticipant:u,rightParticipant:d,poolCanvases:f}=await aa(e,t,n,r,i);try{let e=c,r=l,[p,m]=await Promise.all([u.effects.length>0?Lt(a,c,u.effects,s(u.item.cornerPin)?[]:i,t,o,n.gpuPipeline):Promise.resolve(null),d.effects.length>0?Lt(a,l,d.effects,s(d.item.cornerPin)?[]:i,t,o,n.gpuPipeline):Promise.resolve(null)]);return p&&(e=p.source,f.push(...p.poolCanvases)),m&&(r=m.source,f.push(...m.poolCanvases)),{leftFinalCanvas:e,rightFinalCanvas:r,poolCanvases:f}}catch(e){for(let e of f)a.release(e);throw e}}async function sa(e,t,n,r,i,a=[]){return n.gpuPipeline?ca(e,t,n,r,i,a):null}async function ca(e,t,n,r,i,a=[]){if(!n.gpuPipeline)return null;let o=pa(e.leftClip,e,t,r,n),s=pa(e.rightClip,e,t,r,n),c=[],l=[],u=n.isRenderingTransition;try{let e=i.acquire(n.canvasSettings.width,n.canvasSettings.height),r=i.acquire(n.canvasSettings.width,n.canvasSettings.height);c.push(e,r),n.isRenderingTransition=!0;let u=await la(o,t,n,i,e,l,a),d=await la(s,t,n,i,r,l,a);if(!u||!d){for(let e of c)i.release(e);for(let e of l)n.canvasPool.release(e);return null}return{leftTexture:e,rightTexture:r,poolCanvases:l,poolTextures:c}}catch(e){for(let e of c)i.release(e);for(let e of l)n.canvasPool.release(e);throw e}finally{n.isRenderingTransition=u}}async function la(e,t,n,r,i,a,o=[]){let s=await Oi(e,t,n);if(s)try{if(await Ti(s,n,r,i))return ua(e,s.media.kind,`gpu-direct`),!0;ua(e,s.media.kind,`canvas-rasterize`,{reason:`direct-render-failed`})}finally{s.media.close?.()}else ua(e,null,`canvas-rasterize`,{reason:da(e,n)});let{canvas:c,ctx:l}=n.canvasPool.acquire();return a.push(c),c.width=n.canvasSettings.width,c.height=n.canvasSettings.height,l.clearRect(0,0,c.width,c.height),await ni(l,e.item,e.transform,t,n,0,e.renderSpan,o),n.gpuPipeline?.applyEffectsToTexture(c,Rt(e.effects),i)??!1}function ua(e,t,n,r={}){ra()&&gr.debug(`GPU transition participant path`,{itemId:e.item.id,itemType:e.item.type,mediaKind:t,path:n,effects:e.effects.length,...r})}function da(e,t){let n=e.item;return n.type===`text`?`text-rasterization`:n.type===`composition`?`sub-composition-rasterization`:n.type===`shape`?Li(n,e.transform,e.effects,t)??`shape-direct-unavailable`:n.type===`image`?t.gpuMediaPipeline?t.imageElements.has(n.id)?`image-direct-unavailable`:`image-source-unavailable`:`media-pipeline-unavailable`:n.type===`video`?t.gpuMediaPipeline?t.useMediabunny.has(n.id)?t.mediabunnyDisabledItems.has(n.id)?`video-frame-capture-disabled`:t.videoExtractors.has(n.id)?`video-frame-capture-failed`:`video-extractor-unavailable`:`video-frame-capture-unavailable`:`media-pipeline-unavailable`:`unsupported-item-type`}async function fa(e,t,n,r,i,a){let o=oi.getRenderer(t.transition.presentation)?.gpuTransitionId,s=r.gpuTransitionPipeline;if(!o||!s?.has(o))return!1;if(a){let c=await sa(t,n,r,i,a);if(c)try{if(s.renderTexturesToTexture(o,c.leftTexture,c.rightTexture,e,t.progress,r.canvasSettings.width,r.canvasSettings.height,t.transition.direction,t.transition.properties))return!0}finally{for(let e of c.poolTextures)a.release(e);for(let e of c.poolCanvases)r.canvasPool.release(e)}}let c=await oa(t,n,r,i);try{return s.renderToTexture(o,c.leftFinalCanvas,c.rightFinalCanvas,e,t.progress,r.canvasSettings.width,r.canvasSettings.height,t.transition.direction,t.transition.properties)}finally{for(let e of c.poolCanvases)r.canvasPool.release(e)}}function pa(e,t,n,r,i){let a=i.getCurrentItemSnapshot?.(e)??e,o=q(i.getCurrentItemSnapshot?.(t.leftClip)??t.leftClip,i.getCurrentItemSnapshot?.(t.rightClip)??t.rightClip,t,i.fps),s=o&&a.id===t.leftClip.id?o.left:o&&a.id===t.rightClip.id?o.right:void 0,c=mt(a,t,i.fps,s),l=St(a,i.getCurrentKeyframes?.(a.id)??i.keyframesMap.get(a.id),n,i.canvasSettings,c);if(i.renderMode===`preview`){let e=i.getPreviewTransformOverride?.(a.id);e&&(l={...l,...e,cornerRadius:e.cornerRadius??l.cornerRadius})}let u=a;if(i.renderMode===`preview`){let e=i.getPreviewCornerPinOverride?.(a.id);e!==void 0&&(u={...a,cornerPin:e})}u=br(u,n,i,c);let d=(i.renderMode===`preview`?i.getPreviewEffectsOverride?.(a.id):void 0)??u.effects,f=Bt(r,i.adjustmentLayers,n,i.renderMode===`preview`?i.getPreviewEffectsOverride:void 0,i.renderMode===`preview`?i.getLiveItemSnapshotById:void 0);return{item:u,transform:l,effects:Vt(d,f),renderSpan:c}}function ma(e){return{shouldDirectRenderSingleTask:e.activeMaskCount===0&&e.activeTransitionCount===0&&e.renderTaskCount===1&&!e.hasGpuEffects,shouldUseDeferredGpuBatch:e.hasGpuEffects&&e.renderTaskCount>0}}var ha=class{itemWindows=new Map;constructor(e=100663296){this.maxBytes=e}async getFrame(e){let t=this.itemWindows.get(e.item.id),n=this.getSourceFrameKey(e);if(t&&e.frame>=t.startFrame&&e.frame<t.endFrame&&t.frames.has(n))return t.frames.get(n)?.frame??null;let r=await this.buildWindow(e);return this.replaceWindow(e.item.id,r),r.frames.get(n)?.frame??null}dispose(){for(let e of this.itemWindows.values())this.closeWindow(e);this.itemWindows.clear()}async buildWindow(e){let t=e.extractor.getDimensions(),n=Math.max(1,t.width*t.height*4),r=Math.floor(this.maxBytes/n),i=Math.max(2,Math.min(4,r||2)),a=e.frame,o=Math.min(e.renderSpan.from+e.renderSpan.durationInFrames,a+i),s=new Map;for(let t=a;t<o;t+=1){let n=this.getSourceTime(e,t);s.set(this.sourceFrameKey(n,e.sourceFps),n)}let c=[...s.entries()].sort((e,t)=>e[1]-t[1]),l=new Map;for(let[t,n]of c){let r=await e.extractor.captureFrame(n);!r.success||!r.frame||l.set(t,{frame:r.frame})}return{startFrame:a,endFrame:o,frames:l}}replaceWindow(e,t){let n=this.itemWindows.get(e);n&&this.closeWindow(n),this.itemWindows.set(e,t)}closeWindow(e){for(let t of e.frames.values())try{t.frame.close()}catch{}e.frames.clear()}getSourceFrameKey(e){return this.sourceFrameKey(this.getSourceTime(e,e.frame),e.sourceFps)}getSourceTime(e,t){let n=t-e.renderSpan.from,r=ut(e.item,e.renderSpan),i=e.item.durationInFrames*e.speed*e.sourceFps/e.fps,a=e.item.sourceEnd??r+i,o=ot(r,e.sourceFps,n,e.speed,e.fps,0,!0,a),s=e.extractor.getDuration();return s>0?Math.max(0,Math.min(o,s-1e-4)):Math.max(0,o)}sourceFrameKey(e,t){return Math.round(e*t)}};function ga(e){switch(e){case`mp4`:case`mov`:return`aac`;case`webm`:case`mkv`:return`opus`;case`mp3`:return`mp3`;case`wav`:return`pcm-s16`;default:return`aac`}}async function _a(e,t){let{Mp4OutputFormat:n,WebMOutputFormat:r,MovOutputFormat:i,MkvOutputFormat:a,Mp3OutputFormat:o,WavOutputFormat:s,AdtsOutputFormat:c}=await import(`./src-BW8vJkkc.js`);switch(e){case`mp4`:return new n({fastStart:t?.fastStart?`in-memory`:!1});case`mov`:return new i({fastStart:t?.fastStart?`in-memory`:!1});case`webm`:return new r;case`mkv`:return new a;case`mp3`:return new o;case`aac`:return new c;case`wav`:return new s;default:return new n({fastStart:t?.fastStart?`in-memory`:!1})}}function va(e,t){if(e===`mp3`)return`audio/mpeg`;if(e===`aac`)return`audio/aac`;if(e===`wav`)return`audio/wav`;if(e===`mp4`||e===`mov`)return t===`avc`?`video/${e}; codecs="avc1.42E01E"`:t===`hevc`?`video/${e}; codecs="hvc1.1.6.L93.B0"`:`video/${e}`;if(e===`webm`||e===`mkv`){let n=e===`webm`?`video/webm`:`video/x-matroska`;return t===`vp8`?`${n}; codecs="vp8"`:t===`vp9`?`${n}; codecs="vp09.00.10.08"`:t===`av1`?`${n}; codecs="av01.0.04M.08"`:n}return`video/mp4`}function ya(e){return`WEBVTT\n\n${Sa(e).map(e=>`${ba(e.startSeconds)} --> ${ba(e.endSeconds)}\n${e.text}`).join(`

`)}`}function ba(e){return xa(e,`.`)}function xa(e,t){let n=Math.max(0,Math.round(e*1e3)),r=n%1e3,i=Math.floor(n/1e3),a=i%60,o=Math.floor(i/60),s=o%60;return`${Ca(Math.floor(o/60))}:${Ca(s)}:${Ca(a)}${t}${String(r).padStart(3,`0`)}`}function Sa(e){return e.filter(e=>e.text.trim().length>0&&e.endSeconds>e.startSeconds).map(e=>({...e,text:e.text.trim()})).sort((e,t)=>e.startSeconds-t.startSeconds)}function Ca(e){return String(e).padStart(2,`0`)}function wa(e){return e.type===`subtitle`&&e.source.type===`transcript`}function Ta(e){let t=e.fps,n=e.durationInFrames===void 0?1/0:e.durationInFrames/t,r=[];for(let i of e.tracks)if(i.visible!==!1)for(let e of i.items??[]){if(!wa(e))continue;let i=e.from/t,a=(e.from+e.durationInFrames)/t;for(let t of e.cues){let e=Math.max(0,i+t.startSeconds),o=Math.min(n,a,i+t.endSeconds);o<=e||t.text.trim().length===0||r.push({id:t.id,startSeconds:e,endSeconds:o,text:t.text})}}return r.length===0?null:(r.sort((e,t)=>e.startSeconds-t.startSeconds||e.endSeconds-t.endSeconds),ya(r))}function Ea(e){return{...e,tracks:e.tracks.map(e=>({...e,items:(e.items??[]).filter(e=>!wa(e))}))}}var Da=e({renderAudioOnly:()=>Fa,renderComposition:()=>Na,renderSingleFrame:()=>Pa});function Z(){return t(`CanvasRenderOrchestrator`)}let Oa=null;async function ka(){return Oa||=import(`./canvas-audio-BcUSzwdh.js`),Oa}const Q=1e-6;function Aa(e){let t=e.transform;return x(e.crop)?!1:t?!(t.width!==void 0||t.height!==void 0||t.x!==void 0&&Math.abs(t.x)>Q||t.y!==void 0&&Math.abs(t.y)>Q||t.rotation!==void 0&&Math.abs(t.rotation)>Q||t.cornerRadius!==void 0&&Math.abs(t.cornerRadius)>Q||t.opacity!==void 0&&Math.abs(t.opacity-1)>Q):!0}function ja(e,t){if(e.mode!==`video`||t.durationInFrames===void 0||t.durationInFrames<=0||(t.transitions?.length??0)>0||(t.keyframes?.length??0)>0)return null;let n=(t.tracks??[]).filter(e=>e.visible!==!1),r=[];for(let e of n)for(let t of e.items??[])t.durationInFrames>0&&r.push({item:t,track:e});if(r.length!==1)return null;let{item:i,track:a}=r[0];if(i.type!==`video`)return null;let o=i;if(!o.src||o.isReversed===!0||o.from!==0||o.durationInFrames!==t.durationInFrames||(o.effects?.length??0)>0||!Aa(o))return null;let s=o.speed??1;if(Math.abs(s-1)>Q||Math.abs(o.fadeIn??0)>Q||Math.abs(o.fadeOut??0)>Q)return null;let c=a.muted!==!0;if(c&&(Math.abs(o.volume??0)>Q||Math.abs(o.audioFadeIn??0)>Q||Math.abs(o.audioFadeOut??0)>Q))return null;let l=o.sourceFps??t.fps;if(!Number.isFinite(l)||l<=0||Math.abs((e.fps??t.fps)-t.fps)>Q)return null;let u=o.sourceStart??o.trimStart??o.offset??0;if(Math.abs(u)>Q)return null;let d=Math.max(0,u/l),f=o.durationInFrames/t.fps;if(!Number.isFinite(f)||f<=0)return null;let p=d+f;return!Number.isFinite(p)||p<=d?null:{src:o.src,trimStartSeconds:d,trimEndSeconds:p,includeAudio:c}}async function Ma(e){let{settings:t,composition:n,onProgress:r,signal:i}=e,a=n.durationInFrames??0,o=n.fps,s=a/Math.max(o,1),c=ja(t,n);if(!c)return null;if(i?.aborted)throw new DOMException(`Render cancelled`,`AbortError`);let l=await import(`./src-BW8vJkkc.js`),{Input:u,Output:f,BufferTarget:p,Conversion:m,ALL_FORMATS:h}=l,g=await _a(t.container,{fastStart:!0}),_=new u({formats:h,source:d(l,c.src)}),v=null,y=()=>{v&&v.cancel().catch(()=>void 0)};i?.addEventListener(`abort`,y,{once:!0});try{let e=await _.getPrimaryVideoTrack();if(!e?.codec||!(g.getSupportedVideoCodecs?.()??[]).includes(e.codec)||e.codec!==t.codec||e.displayWidth!==t.resolution.width||e.displayHeight!==t.resolution.height)return null;if(c.includeAudio){let e=await _.getPrimaryAudioTrack();if(e?.codec&&!(g.getSupportedAudioCodecs?.()??[]).includes(e.codec))return null}r({phase:`preparing`,progress:5,totalFrames:a,message:`Preparing packet remux...`});let n=new p,i=new f({format:g,target:n});try{if(v=await m.init({input:_,output:i,trim:{start:c.trimStartSeconds,end:c.trimEndSeconds},video:{codec:t.codec,forceTranscode:!1},audio:c.includeAudio?{forceTranscode:!1}:{discard:!0},showWarnings:!1}),!v.isValid)return null;v.onProgress=e=>{let t=Math.max(0,Math.min(1,e));r({phase:`encoding`,progress:Math.round(t*90),currentFrame:Math.round(t*a),totalFrames:a,message:`Remuxing packets...`})},await v.execute();let e=n.buffer;if(!e)throw Error(`No output buffer generated`);let o=new Blob([e],{type:va(t.container,t.codec)});return r({phase:`finalizing`,progress:100,currentFrame:a,totalFrames:a,message:`Complete!`}),Z().info(`Packet remux export completed`,{durationSeconds:s,fileSize:o.size,container:t.container,codec:t.codec,includeAudio:c.includeAudio}),{blob:o,mimeType:va(t.container,t.codec),duration:s,fileSize:o.size}}finally{i.dispose?.()}}catch(e){if(i?.aborted||e instanceof Error&&e.name===`ConversionCanceledError`)throw new DOMException(`Render cancelled`,`AbortError`);return Z().warn(`Packet remux path failed; falling back to frame render`,{error:e}),null}finally{i?.removeEventListener(`abort`,y),_.dispose()}}async function Na(e){let{settings:t,composition:n,onProgress:r,signal:i}=e,{fps:a,durationInFrames:o=0}=n,s=await ka();if(Z().info(`Starting enhanced client render`,{fps:a,durationInFrames:o,durationSeconds:o/a,width:t.resolution.width,height:t.resolution.height,codec:t.codec,tracksCount:n.tracks?.length??0,hasTransitions:(n.transitions?.length??0)>0,hasKeyframes:(n.keyframes?.length??0)>0}),o<=0)throw Error(`Composition has no duration`);let c=o,l=c/a;if(r({phase:`preparing`,progress:0,totalFrames:c,message:`Loading encoder...`}),i?.aborted)throw new DOMException(`Render cancelled`,`AbortError`);let u=await Ma(e);if(u)return u;let{Output:d,BufferTarget:f,VideoSampleSource:p,VideoSample:m,AudioBufferSource:h,TextSubtitleSource:g}=await import(`./src-BW8vJkkc.js`);r({phase:`preparing`,progress:5,totalFrames:c,message:`Processing audio...`});let _=null;if(await s.hasAudioContent(n))try{_=await s.processAudio(n,i),Z().info(`Audio processed`,{hasAudio:!!_,sampleRate:_?.sampleRate,channels:_?.channels})}catch(e){Z().error(`Audio processing failed, continuing without audio`,{error:e})}r({phase:`preparing`,progress:15,totalFrames:c,message:`Creating encoder...`});let v=await _a(t.container,{fastStart:!0}),y=new f,b=new d({format:v,target:y}),x=t.embedSubtitles?Ta(n):null,S=v.getSupportedSubtitleCodecs().includes(`webvtt`),C=x!==null&&S,w=C?Ea(n):n;if(x!==null&&!S)throw Error(`${t.container.toUpperCase()} export does not support embedded transcript subtitles. Use MP4, WebM, or MKV for embedded subtitles.`);let T=null;C&&(T=new g(`webvtt`),b.addSubtitleTrack(T,{languageCode:`eng`,name:`Transcript`,disposition:{default:!0}}),Z().info(`Transcript subtitles will be embedded as WebVTT track`,{container:t.container}));let E=w.width??t.resolution.width,ee=w.height??t.resolution.height,D=t.resolution.width,O=t.resolution.height,te=D!==E||O!==ee;Z().info(`Resolution settings`,{composition:{width:E,height:ee},export:{width:D,height:O},needsScaling:te});let ne=new OffscreenCanvas(E,ee),re=ne.getContext(`2d`);if(!re)throw Error(`Failed to create OffscreenCanvas 2D context`);let k=te?new OffscreenCanvas(D,O):ne,A=te?k.getContext(`2d`):re;r({phase:`preparing`,progress:20,totalFrames:c,message:`Setting up video encoder...`});let j=new p({codec:t.codec,bitrate:t.videoBitrate??1e7,keyFrameInterval:2,latencyMode:`quality`});b.addVideoTrack(j,{frameRate:a});let M=null,N=null;if(_)try{N=s.createAudioBuffer(_);let e=ga(t.container);if(e!==`aac`&&e!==`opus`)throw Error(`Unsupported audio codec ${e} for ${t.container.toUpperCase()} export`);M=new h({codec:e,bitrate:t.audioBitrate??192e3}),b.addAudioTrack(M),Z().info(`Audio track added to output`,{duration:N.duration,channels:N.numberOfChannels,sampleRate:N.sampleRate,codec:e})}catch(e){Z().error(`Failed to setup audio track`,{error:e}),M=null,N=null}if(await b.start(),T&&x&&(await T.add(x),T.close()),M&&N)try{await M.add(N),Z().info(`Audio buffer fed to encoder`,{duration:N.duration,samples:N.length})}catch(e){Z().error(`Failed to feed audio to encoder`,{error:e})}r({phase:`rendering`,progress:0,currentFrame:0,totalFrames:c,message:`Rendering frames...`});let P=await Va(w,ne,re);try{await P.preload();let e=null;for(let t=0;t<c;t++){if(i?.aborted){if(e)try{await e}catch{}throw await b.cancel(),new DOMException(`Render cancelled`,`AbortError`)}await P.renderFrame(t),te&&(A.clearRect(0,0,D,O),A.drawImage(ne,0,0,D,O)),e&&await e;let n=new m(k,{timestamp:t/a,duration:1/a}),o=t===0;e=(async()=>{try{o?await j.add(n,{keyFrame:!0}):await j.add(n)}finally{n.close()}})(),r({phase:`rendering`,progress:Math.round(t/c*100),currentFrame:t,totalFrames:c,message:`Rendering frame ${t+1}/${c}`})}if(e&&await e,r({phase:`finalizing`,progress:95,currentFrame:c,totalFrames:c,message:`Finalizing video...`}),M)try{M.close(),Z().info(`Audio source closed`)}catch(e){Z().error(`Failed to close audio source`,{error:e})}await b.finalize();let n=y.buffer;if(!n)throw Error(`No output buffer generated`);let o=new Blob([n],{type:va(t.container,t.codec)});return r({phase:`finalizing`,progress:100,currentFrame:c,totalFrames:c,message:`Complete!`}),P.dispose(),s.clearAudioDecodeCache(),{blob:o,mimeType:va(t.container,t.codec),duration:l,fileSize:o.size}}catch(e){P.dispose(),s.clearAudioDecodeCache();try{b.state===`started`&&await b.cancel()}catch{}throw e}}async function Pa(e){let{composition:t,frame:n,width:r=320,height:i=180,quality:a=.85,format:o=`image/jpeg`}=e,s=t.width||1920,c=t.height||1080;Z().debug(`Rendering single frame`,{frame:n,width:r,height:i,compositionWidth:s,compositionHeight:c});let l=new OffscreenCanvas(s,c),u=l.getContext(`2d`);if(!u)throw Error(`Failed to get 2d context`);let d=await Va(t,l,u);try{await d.preload(),await d.renderFrame(n);let e=l,t=s,u=c;for(;t>r*2||u>i*2;){let n=Math.max(Math.ceil(t/2),r),a=Math.max(Math.ceil(u/2),i),o=new OffscreenCanvas(n,a),s=o.getContext(`2d`);s.imageSmoothingQuality=`high`,s.drawImage(e,0,0,n,a),e=o,t=n,u=a}let f=new OffscreenCanvas(r,i),p=f.getContext(`2d`);if(!p)throw Error(`Failed to get thumbnail 2d context`);return p.imageSmoothingQuality=`high`,p.drawImage(e,0,0,r,i),await f.convertToBlob({type:o,quality:a})}finally{try{d.dispose()}catch(e){Z().warn(`Failed to dispose single-frame renderer`,{error:e})}}}async function Fa(e){let{settings:t,composition:n,onProgress:r,signal:i}=e,{fps:a,durationInFrames:o=0}=n,s=await ka();if(Z().info(`Starting audio-only render`,{fps:a,durationInFrames:o,durationSeconds:o/a,container:t.container,audioCodec:t.audioCodec,audioBitrate:t.audioBitrate}),o<=0)throw Error(`Composition has no duration`);let c=o/a;if(r({phase:`preparing`,progress:0,totalFrames:o,message:`Loading encoder...`}),i?.aborted)throw new DOMException(`Render cancelled`,`AbortError`);let l=await import(`./src-BW8vJkkc.js`),{Output:u,BufferTarget:d,AudioBufferSource:f}=l;if(t.container===`mp3`)try{let{registerMp3Encoder:e}=await import(`./mediabunny-mp3-encoder-Drd86Fu1.js`);e(),Z().info(`MP3 encoder registered`)}catch(e){Z().warn(`Failed to load MP3 encoder extension`,e)}if(r({phase:`preparing`,progress:10,totalFrames:o,message:`Processing audio...`}),!await s.hasAudioContent(n))throw Error(`No audio content found in composition`);let p=await s.processAudio(n,i);if(!p)throw Error(`Failed to process audio`);r({phase:`preparing`,progress:50,totalFrames:o,message:`Creating encoder...`});let m=await _a(t.container,{fastStart:!0}),h=new d,g=new u({format:m,target:h}),_;switch(t.container){case`mp3`:_=`mp3`;break;case`aac`:_=`aac`;break;default:_=`pcm-s16`}if(_!==`pcm-s16`){let{canEncodeAudio:e}=l;if(!await e(_,{bitrate:t.audioBitrate??192e3,numberOfChannels:2,sampleRate:48e3}))throw Error(`${_.toUpperCase()} encoding is not supported in this browser. Try exporting as WAV (lossless) instead.`);Z().info(`Using ${_.toUpperCase()} codec`)}let v=s.createAudioBuffer(p),y=new f({codec:_,bitrate:t.audioBitrate??192e3});g.addAudioTrack(y),Z().info(`Audio track configured`,{duration:v.duration,channels:v.numberOfChannels,sampleRate:v.sampleRate,codec:_}),r({phase:`encoding`,progress:60,totalFrames:o,message:`Encoding audio...`}),await g.start(),await y.add(v),r({phase:`finalizing`,progress:90,totalFrames:o,message:`Finalizing audio...`}),y.close(),await g.finalize();let b=h.buffer;if(!b)throw Error(`No output buffer generated`);let x=new Blob([b],{type:va(t.container)});return r({phase:`finalizing`,progress:100,totalFrames:o,message:`Complete!`}),{blob:x,mimeType:va(t.container),duration:c,fileSize:x.size}}function $(){return t(`ClientRenderEngine`)}function Ia(e){return e?.some(e=>e.enabled&&e.effect.type===`gpu-effect`)??!1}function La(e,t){let n=t?.(e.id);return Ia(n??e.effects)}function Ra(e,t,n={}){let{getPreviewEffectsOverride:r}=n,i=n.getCurrentItem??(e=>e),a=n.visited??new Set;if(a.has(e))return!1;a.add(e);let o=t.get(e);if(!o)return!1;for(let e of o.adjustmentLayers??[])if(La(i(e.layer),r))return!0;for(let e of o.sortedTracks)if(e.visible)for(let n of e.items){let e=i(n);if(La(e,r)||e.type===`composition`&&Ra(e.compositionId,t,{getCurrentItem:i,getPreviewEffectsOverride:r,visited:a}))return!0}return!1}function za(e){let t=e.label?.toLowerCase()??``;return er(e.src)||t.endsWith(`.gif`)||tr(e.src)||t.endsWith(`.webp`)}function Ba(e){return er(e.src)||(e.label?.toLowerCase()??``).endsWith(`.gif`)}async function Va(e,t,n,r={}){let{fps:o,transitions:c=[],backgroundColor:l=`#000000`,keyframes:d=[]}=e,f=r.mode??`export`,p=e.tracks?.map(e=>({...e,items:(e.items??[]).map(e=>e.type===`video`?a(e,o,{mode:f,useProxy:r.useProxyMedia}):e)}))??[],m=r.getPreviewTransformOverride,h=r.getPreviewEffectsOverride,_=r.getPreviewCornerPinOverride,v=r.getPreviewPathVerticesOverride,y=r.getLiveItemSnapshot,b=r.getLiveKeyframes,S=r.domVideoElementProvider,w=typeof document<`u`,T=f===`preview`,E={width:t.width,height:t.height,fps:o},D=Fe(),te=0,ne=Le({tracks:p,transitions:c}),{trackRenderState:k}=ne,{visibleTrackIds:j,visibleTracksByOrderDesc:N,visibleTracksByOrderAsc:P,trackOrderMap:ie}=k,F=new rr(t.width,t.height,10,20),ae=new ir,oe=f===`preview`?new M:null,se=-1,ce=e=>{if(!oe)return;let n=e-se,r=n>0&&n<=3;se=e,L&&oe.setGpuDevice(L.getDevice(),t.width,t.height),oe.cacheFrame(e,t,r)},L=null,le=null,ue=async()=>L||le||(le=ee.create().then(e=>(L=e,le=null,e)),le),de=null,fe=null,R=null,pe=null,me=null,he=null,ge=new Map,_e=new Map;function ve(){return de?!0:L?(de=qt.create(L.getDevice()),de!==null):!1}function ye(){return fe?!0:L?(fe=new Cn(L.getDevice()),!0):!1}function be(){return R?!0:L?(R=new Dn(L.getDevice()),!0):!1}function xe(){return pe?!0:L?(pe=new kn(L.getDevice()),!0):!1}function Se(){return me?!0:L?(me=new Pn(L.getDevice()),!0):!1}function Ce(){return he?!0:L?(he=new Qn(L.getDevice()),!0):!1}let we=null,z=null,Te=null,Ee=null,De=null,Oe=0,ke=0,Ae=!1;function je(){if(we)return!0;if(!L)return!1;let e=L.getDevice();return we=new qn(e),z??=new Xn(e),Te=new $n(e),!0}function Me(){if(z)return z;if(!L)throw Error(`GPU texture pool requested before GPU pipeline initialization`);return z=new Xn(L.getDevice()),z}function Ne(e,t){if(!L)return null;let n=Oe!==e||ke!==t;if(n&&(Ae=!1),Ae&&Oe===e&&ke===t)return null;if(Ee||=new OffscreenCanvas(e,t),!De||n){if((Ee.width!==e||Ee.height!==t)&&(Ee.width=e,Ee.height=t),De=L.configureCanvas(Ee),Oe=e,ke=t,!De)return Ae=!0,null;Ae=!1}return{canvas:Ee,ctx:De}}let Pe=wt(d),Ie=e=>b?.(e)??Pe.get(e),B=e=>{let t=y?.(e.id),n=t&&t.type===e.type?t:e;if(n.type!==`video`)return n;let i=a(n,o,{mode:f,useProxy:r.useProxyMedia});return lt(i),i},Re=y?e=>{let t=y(e);return t&&t.type===`shape`?t:void 0}:void 0,ze=new lr({maxLanesPerSource:4}),V=new Map,Be=new Map,Ve=new Map,He=new Map,Ue=new Map,We=w&&!T?new I:null,Ge=new Set,Ke=new Map,qe=0,Xe=(e,t)=>{if(!t)return;let n=Be.get(e);if(n&&n!==t){let t=Ve.get(n);t?.delete(e),t&&t.size===0&&Ve.delete(n),ze.releaseItem(e)}Be.set(e,t);let r=Ve.get(t);r||(r=new Set,Ve.set(t,r)),r.add(e),V.set(e,ze.getOrCreateItemExtractor(e,t))},Ze=(e,t)=>{if(!We)return;let n=Ke.get(e);n||(n=`export-fallback-${++qe}-${e}`,Ke.set(e,n));let r=We.acquireForClip(n,t);r&&(r.crossOrigin=`anonymous`,r.muted=!0,r.preload=`auto`,Ge.has(t)||(Ge.add(t),We.preloadSource(t).catch(()=>{})),Ue.set(e,r))};for(let e of p)for(let t of e.items??[])if(t.type===`video`){let e=t;He.set(t.id,e),e.src&&($().debug(`Registering shared video extractor`,{itemId:t.id,src:e.src.substring(0,80)}),Xe(t.id,e.src),w&&!T&&Ze(t.id,e.src))}let Qe=new Map,$e=[],et=[],tt=[],nt=new Map;for(let e of p)for(let t of e.items??[])if(t.type===`image`&&t.src){let e=t;if(za(e)&&(Ba(e)?et.push(e):tt.push(e)),w&&typeof Image<`u`){let n=new Image;n.crossOrigin=`anonymous`;let r=new Promise((r,i)=>{n.onload=()=>{Qe.set(t.id,{source:n,width:n.naturalWidth,height:n.naturalHeight}),r()},n.onerror=()=>i(Error(`Failed to load image: ${e.src}`))});n.src=e.src,$e.push(r)}else{let n=(async()=>{if(typeof createImageBitmap!=`function`)throw Error(`WORKER_REQUIRES_MAIN_THREAD:imagebitmap`);let n=await fetch(e.src);if(!n.ok)throw Error(`Failed to load image: ${e.src}`);let r=await n.blob(),i=await createImageBitmap(r);Qe.set(t.id,{source:i,width:i.width,height:i.height})})();$e.push(n)}}let rt=ne.visibleAdjustmentLayers,it=new Map;for(let e of ne.transitionWindows){let t=e.transition.trackId,n=t?ie.get(t)??0:0;it.set(e.transition.id,n)}let H=E,U=Pt(p,H),W=new Set,G=new Map,at=new Map,K=new Set,st=new Map,ct=!1;function lt(e){e.src&&(Be.get(e.id)!==e.src&&(W.delete(e.id),K.delete(e.id),G.delete(e.id),at.delete(e.id),st.delete(e.id),Xe(e.id,e.src),w&&!T&&Ze(e.id,e.src)),He.set(e.id,e))}let ut=new Map,dt=e=>{let t=[...e.tracks].sort((e,t)=>(t.order??0)-(e.order??0)).map(t=>({order:t.order??0,visible:t.visible!==!1,items:e.items.filter(e=>e.trackId===t.id&&e.type!==`audio`&&e.type!==`adjustment`)})),n=new Map;for(let t of e.keyframes??[])n.set(t.itemId,t);let r=[];for(let t of e.tracks){if(t.visible===!1)continue;let n=t.order??0;for(let i of e.items)i.trackId===t.id&&i.type===`adjustment`&&r.push({layer:i,trackOrder:n})}return{fps:e.fps,durationInFrames:e.durationInFrames,sortedTracks:t,keyframesMap:n,adjustmentLayers:r}},ft=null,pt=null,mt=!1,ht=f===`export`?new ha:void 0,q={fps:o,canvasSettings:E,canvasPool:F,textMeasureCache:ae,renderMode:f,scrubbingCache:oe,getCurrentItemSnapshot:B,getLiveItemSnapshotById:y,getCurrentKeyframes:Ie,getPreviewTransformOverride:m,getPreviewCornerPinOverride:_,videoExtractors:V,videoElements:Ue,useMediabunny:W,mediabunnyDisabledItems:K,mediabunnyFailureCountByItem:G,reverseVideoFrameCache:ht,imageElements:Qe,gifFramesMap:nt,keyframesMap:Pe,adjustmentLayers:rt,getPreviewEffectsOverride:h,getPreviewPathVerticesOverride:v,subCompRenderData:ut,gpuPipeline:null,gpuTransitionPipeline:null,gpuMediaPipeline:null,gpuMediaBlendPipeline:null,gpuShapePipeline:null,gpuTextPipeline:null,gpuMaskCombinePipeline:null,gpuTextTextureCache:ge,gpuBitmapMaskTextureCache:_e,gpuScratchTexturePool:{acquire:(e,t,n)=>z?.acquire(e,t,n)??Me().acquire(e,t,n),release:e=>{z?.release(e)}},domVideoElementProvider:S},gt=new Map,_t=e=>{let t=g(p,e);for(let n of t){let t=e[n];t&&gt.get(n)!==t&&(ut.set(n,dt(t)),gt.set(n,t))}};_t(O.getState().compositionById);let vt=()=>{if(mt)return pt;if(mt=!0,typeof OffscreenCanvas<`u`)return ft=new OffscreenCanvas(1,1),pt=ft.getContext(`2d`),pt;if(typeof document<`u`){let e=document.createElement(`canvas`);return e.width=1,e.height=1,ft=e,pt=e.getContext(`2d`),pt}return null},J=async e=>{let t=new Map;if(e.length===0)return t;let n=new Map;for(let r of e){let e=Be.get(r);if(!e){t.set(r,!1);continue}let i=n.get(e);i||(i=[],n.set(e,i)),i.push(r)}return await Promise.all([...n.entries()].map(async([e,n])=>{let r=await ze.initSource(e);if(ct)return;let i=Ve.get(e)??new Set(n);for(let e of i)r?W.add(e):W.delete(e);for(let e of n)t.set(e,r)})),t},yt=(e,t)=>{let n=e-t,r=e+t,i=[];for(let e of p)if(j.has(e.id))for(let t of e.items??[]){if(t.type!==`video`)continue;let e=t.from;if(t.from+t.durationInFrames<n||e>r)continue;let a=B(t);V.has(a.id)&&i.push(a.id)}return i};q.ensureVideoItemReady=async e=>{if(W.has(e))return!0;if(K.has(e)||!V.has(e))return!1;let t=st.get(e);if(t)return t;let n=J([e]).then(t=>{if(ct)return!1;if(t.get(e)===!0)return at.delete(e),!0;let n=(at.get(e)??0)+1;return at.set(e,n),n>=4&&K.add(e),!1}).finally(()=>{st.delete(e)});return st.set(e,n),n},f===`preview`&&import(`./preview-contract-CIWhk3Qm.js`).then(e=>e.t).then(({getCachedPredecodedBitmap:e,waitForInflightPredecodedBitmap:t})=>{q.getCachedPredecodedBitmap=e,q.waitForInflightPredecodedBitmap=t}).catch(()=>{});let bt=()=>{if(T&&W.size!==V.size){let e=[...V.keys()].filter(e=>!W.has(e));throw Error(`PREVIEW_REQUIRES_MEDIABUNNY: ${e.length} video item(s) are not decodable (failed: ${e.join(`, `)})`)}};return{async preload(e={}){let t=p.some(e=>(e.items??[]).some(e=>e.type===`composition`));if(!w&&t)throw Error(`WORKER_REQUIRES_MAIN_THREAD:composition`);let n=Number.isFinite(e.priorityFrame)?Math.round(e.priorityFrame):null,r=Math.max(4,Math.round(e.priorityWindowFrames??o*4)),a=n===null?[]:yt(n,r);if($().debug(`Preloading media`,{videoCount:V.size,videoSourceCount:new Set(Be.values()).size,imageCount:Qe.size}),await Promise.all($e),!w&&(et.length>0||tt.length>0))throw Error(`WORKER_REQUIRES_MAIN_THREAD:animated-image`);a.length>0&&await J(a);let s=new Set(a),c=[...V.keys()].filter(e=>!s.has(e));c.length>0&&await J(c),$().info(`Video initialization complete`,{mediabunny:W.size,fallback:V.size-W.size,uniqueSources:new Set(Be.values()).size}),bt();let l=Array.from(Ue.keys());if(!w&&l.some(e=>!W.has(e)))throw Error(`WORKER_REQUIRES_MAIN_THREAD:video-fallback`);if(w&&!T&&l.length>0){let e=new Map;for(let[t,n]of Ue.entries())e.has(n)||e.set(n,t);let t=Array.from(e.entries()).map(([e,t])=>new Promise(n=>{let r=setTimeout(()=>{$().warn(`Video load timeout`,{itemId:t}),n()},1e4);e.readyState>=2?(clearTimeout(r),n()):(e.addEventListener(`loadeddata`,()=>{clearTimeout(r),n()},{once:!0}),e.addEventListener(`error`,()=>{clearTimeout(r),$().error(`Video load error`,{itemId:t}),n()},{once:!0}),e.load())}));await Promise.all(t)}if(w&&et.length>0){$().debug(`Preloading GIF frames`,{gifCount:et.length});let e=et.map(async e=>{try{let t=e.mediaId??e.id,n=await A.getGifFrames(t,e.src);nt.set(e.id,n),$().debug(`GIF frames loaded`,{itemId:e.id.substring(0,8),frameCount:n.frames.length,totalDuration:n.totalDuration})}catch(t){$().error(`Failed to load GIF frames`,{itemId:e.id,error:t})}});await Promise.all(e),$().debug(`All GIF frames loaded`,{loadedCount:nt.size})}if(w&&tt.length>0){$().debug(`Preloading animated WebP frames`,{webpCount:tt.length});let e=tt.map(async e=>{try{let t=e.mediaId??e.id,n=await A.getWebpFrames(t,e.src);nt.set(e.id,n),$().debug(`Animated WebP frames loaded`,{itemId:e.id.substring(0,8),frameCount:n.frames.length,totalDuration:n.totalDuration})}catch(t){$().error(`Failed to load WebP frames`,{itemId:e.id,error:t})}});await Promise.all(e)}let u=[],d=[],f=new Set,m=O.getState().compositionById;for(let e of p)for(let t of e.items??[]){if(t.type!==`composition`)continue;let e=t,i=m[e.compositionId];if(!i||!(n!==null&&e.from<=n+r&&e.from+e.durationInFrames>=n-r))continue;let a=[i,...C(i.items,m).flatMap(e=>m[e]?[m[e]]:[])];for(let e of a)for(let t of e.items)t.type===`video`&&f.add(t.id)}let h=g(p,m);for(let e of h){let t=m[e];if(!t){$().warn(`Sub-composition not found in store!`,{compositionId:e,storeCompositionCount:O.getState().compositions.length,storeCompositionIds:O.getState().compositions.map(e=>e.id.substring(0,8))});continue}gt.get(e)!==t&&(ut.set(e,dt(t)),gt.set(e,t));for(let e of t.items)if(!(e.type!==`video`&&e.type!==`image`))if(e.mediaId){let t=re.get(e.mediaId);t?u.push({subItem:e,src:t}):d.push({subItem:e,mediaId:e.mediaId})}else{let t=e.src??``;t&&u.push({subItem:e,src:t})}}if(d.length>0){$().debug(`Resolving sub-comp media URLs from OPFS`,{count:d.length});let e=await Promise.all(d.map(async({subItem:e,mediaId:t})=>({subItem:e,src:await i(t)})));for(let{subItem:t,src:n}of e)n&&u.push({subItem:t,src:n})}if(u.length>0){$().debug(`Preloading sub-composition media`,{count:u.length});let t=[];for(let{subItem:e,src:n}of u)e.type===`video`&&!V.has(e.id)&&(Xe(e.id,n),t.push(e.id),w&&!T&&Ze(e.id,n));let n=t.filter(e=>f.has(e));n.length>0&&await J(n);try{e.onPriorityMediaReady?.()}catch(e){$().warn(`onPriorityMediaReady callback threw`,{error:e})}let r=t.filter(e=>!f.has(e));if(r.length>0&&await J(r),bt(),w&&!T){let e=u.filter(({subItem:e})=>e.type===`video`&&!W.has(e.id)).map(({subItem:e})=>e.id);if(e.length>0){let t=new Map;for(let n of e){let e=Ue.get(n);e&&!t.has(e)&&t.set(e,n)}let n=Array.from(t.entries()).map(([e,t])=>new Promise(n=>{let r=setTimeout(()=>{$().warn(`Sub-comp video load timeout`,{itemId:t}),n()},1e4);e.readyState>=2?(clearTimeout(r),n()):(e.addEventListener(`loadeddata`,()=>{clearTimeout(r),n()},{once:!0}),e.addEventListener(`error`,()=>{clearTimeout(r),$().error(`Sub-comp video load error`,{itemId:t}),n()},{once:!0}),e.load())}));await Promise.all(n)}}let i=[],a=[],o=[];for(let{subItem:e,src:t}of u)if(e.type===`image`&&!Qe.has(e.id)){let n={...e,src:t};if(za(n)&&(Ba(n)?a.push(n):o.push(n)),w&&typeof Image<`u`){let n=new Image;n.crossOrigin=`anonymous`,i.push(new Promise(t=>{n.onload=()=>{Qe.set(e.id,{source:n,width:n.naturalWidth,height:n.naturalHeight}),t()},n.onerror=()=>{$().error(`Failed to load sub-comp image`,{itemId:e.id}),t()}})),n.src=t}else i.push((async()=>{if(typeof createImageBitmap!=`function`)throw Error(`WORKER_REQUIRES_MAIN_THREAD:imagebitmap`);let n=await fetch(t);if(!n.ok){$().error(`Failed to fetch sub-comp image`,{itemId:e.id});return}let r=await n.blob(),i=await createImageBitmap(r);Qe.set(e.id,{source:i,width:i.width,height:i.height})})())}if(await Promise.all(i),w&&a.length>0){let e=a.map(async e=>{try{let t=e.mediaId??e.id,n=await A.getGifFrames(t,e.src);nt.set(e.id,n),$().debug(`Sub-comp GIF frames loaded`,{itemId:e.id.substring(0,8),frameCount:n.frames.length})}catch(t){$().error(`Failed to load sub-comp GIF frames`,{itemId:e.id,error:t})}});await Promise.all(e)}if(w&&o.length>0){let e=o.map(async e=>{try{let t=e.mediaId??e.id,n=await A.getWebpFrames(t,e.src);nt.set(e.id,n),$().debug(`Sub-comp animated WebP frames loaded`,{itemId:e.id.substring(0,8),frameCount:n.frames.length})}catch(t){$().error(`Failed to load sub-comp WebP frames`,{itemId:e.id,error:t})}});await Promise.all(e)}$().debug(`Sub-composition media loaded`,{videos:u.filter(e=>e.subItem.type===`video`).length,images:u.filter(e=>e.subItem.type===`image`).length,gifs:a.length,webps:o.length})}$().debug(`All media loaded`)},async renderFrame(e){if(oe){let r=oe.getFrame(e);if(r){n.clearRect(0,0,t.width,t.height),n.drawImage(r,0,0);return}}f===`preview`&&_t(O.getState().compositionById),n.fillStyle=l,n.fillRect(0,0,t.width,t.height);let r=Ft(U,e,H,Ie,f===`preview`?m:void 0,f===`preview`?v:void 0,f===`preview`?Re:void 0),{activeTransitions:i,transitionClipIds:a}=D.resolve({renderPlan:ne,frame:e,canvas:E,getKeyframes:Ie,getPreviewTransform:f===`preview`?m:void 0,getPreviewPathVertices:f===`preview`?v:void 0},te).transitionFrameState,o=e=>La(e,f===`preview`?h:void 0),c=!1;for(let t of N)if(j.has(t.id)){for(let n of t.items??[]){let t=B(n);if(!(e<t.from||e>=t.from+t.durationInFrames)){if(o(t)){c=!0;break}if(t.type===`composition`&&Ra(t.compositionId,ut,{getCurrentItem:B,getPreviewEffectsOverride:f===`preview`?h:void 0})){c=!0;break}}}if(c)break}(c||i.length>0)&&(q.gpuPipeline||=await ue(),q.gpuPipeline&&(c&&(q.gpuMediaPipeline||ye(),q.gpuMediaPipeline=fe),i.length>0&&(q.gpuTransitionPipeline||ve(),q.gpuMediaPipeline||ye(),q.gpuMediaBlendPipeline||be(),q.gpuShapePipeline||xe(),q.gpuTextPipeline||Se(),q.gpuMaskCombinePipeline||Ce(),q.gpuTransitionPipeline=de,q.gpuMediaPipeline=fe,q.gpuMediaBlendPipeline=R,q.gpuShapePipeline=pe,q.gpuTextPipeline=me,q.gpuMaskCombinePipeline=he)));let d=async(t,n,i,a,o=!0,c=!1,l=!0)=>{let d=B(t),p=St(d,Ie(d.id),e,E);if(f===`preview`){let e=m?.(d.id);e&&(p={...p,...e,cornerRadius:e.cornerRadius??p.cornerRadius})}let g=d;if(f===`preview`){let e=_?.(d.id);e!==void 0&&(g={...d,cornerPin:e})}let v=Vt(u((f===`preview`?h?.(d.id):void 0)??g.effects,Ie(g.id),e-g.from),Bt(n,rt,e,f===`preview`?h:void 0,f===`preview`?y:void 0,Ie)),b=r.filter(e=>fr(e.trackOrder,n)),x=o?b:[];if(l&&c&&z&&q.gpuPipeline&&q.gpuMediaPipeline&&x.length===0&&v.length>0&&v.every(e=>e.enabled&&e.effect.type===`gpu-effect`)&&(g.type===`video`||g.type===`image`)&&z){let t=z.acquire(E.width,E.height),n=!1;try{if(n=await Ei(g,p,v,e,q,t,z),n)return{gpuTexture:t,poolCanvases:[]}}finally{n||z.release(t)}}if(x.length===0&&v.length>0){let t=Di(g,p,v,e,q);if(t)return i?{source:t,poolCanvases:[]}:(a.drawImage(t,0,0),null)}let{canvas:S,ctx:C}=F.acquire();if(await ni(C,g,p,e,q,0,void 0,x),v.length>0){v.some(e=>e.enabled&&e.effect.type===`gpu-effect`)&&!q.gpuPipeline&&(q.gpuPipeline=await ue(),q.gpuPipeline||$().warn(`GPU pipeline init failed — GPU effects will be skipped`));let{source:t,poolCanvases:n}=await Lt(F,S,v,s(g.cornerPin)?[]:x,e,H,q.gpuPipeline);if(F.release(S),i)return{source:t,poolCanvases:n};a.drawImage(t,0,0);for(let e of n)F.release(e);return null}return i?{source:S,poolCanvases:[S]}:(a.drawImage(S,0,0),F.release(S),null)},p=e=>e.blendMode,{occlusionCutoffOrder:g,renderTasks:b}=Je({tracksByOrderDesc:N,tracksByOrderAsc:P,visibleTrackIds:j,activeTransitions:i,getTransitionTrackOrder:e=>it.get(e.transition.id)??0,disableOcclusion:r.length>0,shouldRenderItem:t=>{let n=B(t);return!(e<n.from||e>=n.from+n.durationInFrames||a.has(n.id)||n.type===`audio`||n.type===`adjustment`||n.type===`shape`&&n.isMask)},isFullyOccluding:(n,r)=>{let i=B(n);if(i.type!==`video`&&i.type!==`image`||a.has(i.id)||i.blendMode&&i.blendMode!==`normal`||i.cornerPin)return!1;let o=Ie(i.id);if(x(Ct(i,o,e,E)))return!1;let s=St(i,o,e,E);if(s.opacity<1)return!1;let c=s.rotation%360;if(c!==0&&c!==180&&c!==-180||s.cornerRadius>0)return!1;let l=t.width/2+s.x-s.width/2,d=t.height/2+s.y-s.height/2,p=l+s.width,m=d+s.height;if(l>1||d>1||p<t.width-1||m<t.height-1)return!1;let g=u(i.effects??[],Ie(i.id),e-i.from)??[],_=Bt(r,rt,e,f===`preview`?h:void 0,f===`preview`?y:void 0,Ie),v=[...g,..._];for(let e of v){if(!e.enabled)continue;let t=e.effect;if(`opacity`in t&&typeof t.opacity==`number`&&t.opacity<1)return!1}return!0}}),{shouldDirectRenderSingleTask:S,shouldUseDeferredGpuBatch:C}=ma({activeMaskCount:r.length,activeTransitionCount:i.length,hasGpuEffects:c,renderTaskCount:b.length}),w=b.some(e=>e.type===`item`&&(()=>{let t=p(B(e.item));return!!(t&&t!==`normal`)})());w&&!q.gpuPipeline&&(q.gpuPipeline=await ue(),q.gpuPipeline||$().warn(`GPU pipeline init failed - blend modes will use Canvas2D fallback`));let T=!!(w&&q.gpuPipeline&&L&&je()),ee=T?Ne(E.width,E.height):null;if(C&&q.gpuPipeline&&q.gpuPipeline.beginBatch(),S){let t=b[0];if(t?.type===`item`){let e=p(B(t.item));try{e&&e!==`normal`&&(n.globalCompositeOperation=dr(e)),await d(t.item,t.trackOrder,!1,n)}finally{e&&e!==`normal`&&(n.globalCompositeOperation=`source-over`)}}ce(e);return}let{canvas:re,ctx:k}=F.acquire(),A=re;{g!==null&&N.filter(e=>j.has(e.id)&&(e.order??0)>g).length;let t=e=>{if(!z||e.length===0)return null;let t=new OffscreenCanvas(E.width,E.height),n=t.getContext(`2d`);if(!n)return null;n.fillStyle=`white`,n.fillRect(0,0,t.width,t.height);let r=new OffscreenCanvas(E.width,E.height),i=r.getContext(`2d`);if(!i)return null;Nt(i,t,e,H);let a=z.acquire(E.width,E.height);return L.getDevice().queue.copyExternalImageToTexture({source:r,flipY:!1},{texture:a},{width:E.width,height:E.height}),{texture:a,view:a.createView()}},n=async t=>{let n=r.filter(e=>fr(e.trackOrder,t.trackOrder)),{canvas:i,ctx:a}=F.acquire();return await ia(a,t.transition,e,q,t.trackOrder,n),{source:i,poolCanvases:[i]}},i=(e,t,n)=>{if(!e)return null;if(e.gpuTexture)return e;if(!e.source)return null;if(n)return e;let i=r.filter(e=>fr(e.trackOrder,t));if(i.length===0)return e;let{canvas:a,ctx:o}=F.acquire();return Nt(o,e.source,i,H),{source:a,poolCanvases:[...e.poolCanvases,a]}},a=async t=>{if(t.type===`item`){let e=B(t.item),n=T&&z&&!s(e.cornerPin);return d(t.item,t.trackOrder,!0,k,!n,!1)}let i=r.filter(e=>fr(e.trackOrder,t.trackOrder));if(T&&z&&i.length===0&&q.gpuTransitionPipeline){let n=z.acquire(E.width,E.height);if(await fa(n,t.transition,e,q,t.trackOrder,z))return{gpuTexture:n,poolCanvases:[]};z.release(n)}return n(t)},o;try{o=await Promise.all(b.map(e=>a(e)))}finally{C&&q.gpuPipeline&&q.gpuPipeline.endBatch()}if(C&&q.gpuPipeline&&await q.gpuPipeline.waitForSubmittedWork(),T&&we&&Te&&ee){let e=L.getDevice(),a=E.width,c=E.height,l=[],u=[],f=[],m=[];for(let n=0;n<o.length;n++){let d=b[n],h=d.type===`item`?s(B(d.item).cornerPin):s(B(d.transition.leftClip).cornerPin)||s(B(d.transition.rightClip).cornerPin),g=r.filter(e=>fr(e.trackOrder,d.trackOrder)),_=d.type===`item`&&!h,v=_?o[n]??null:i(o[n]??null,d.trackOrder,h);if(!v)continue;let y=_&&g.length>0?t(g):null,x=_?g:[];if(_&&g.length>0&&!y){let e=i(v,d.trackOrder,!1);if(!e)continue;v=e,x=[]}let S=d.type===`item`?p(B(d.item))??`normal`:`normal`,C=v.gpuTexture;if(!C){if(!v.source)continue;C=z.acquire(a,c),e.queue.copyExternalImageToTexture({source:v.source,flipY:!1},{texture:C},{width:a,height:c})}u.push(C),y&&f.push(y.texture),m.push({task:d,result:v,fallbackMasks:x}),l.push({params:{...Gn,blendMode:S,sourceAspect:a/c,outputAspect:a/c,hasMask:!!y},textureView:C.createView(),maskView:y?.view??Te.getFallbackView()})}let h=!1;if(l.length>0)try{h=we.compositeToCanvas(l,a,c,ee.ctx)}catch(e){$().warn(`GPU compositor failed - using Canvas2D blend fallback`,{error:e})}if(h)await q.gpuPipeline?.waitForSubmittedWork(),A=ee.canvas;else for(let{task:e,result:t,fallbackMasks:r}of m){let i=t;if(!i.source&&e.type===`transition`&&(i=await n(e)),!i.source&&e.type===`item`){let t=await d(e.item,e.trackOrder,!0,k,!0,!1,!1);if(!t)continue;i=t}let a=i.source;if(!a)continue;if(r.length>0){let{canvas:e,ctx:t}=F.acquire();Nt(t,a,r,H),i={source:e,poolCanvases:[...i.poolCanvases,e]},a=e}let o=e.type===`item`?p(B(e.item)):void 0;if(o&&o!==`normal`&&(k.globalCompositeOperation=dr(o)),k.drawImage(a,0,0),o&&o!==`normal`&&(k.globalCompositeOperation=`source-over`),i!==t)for(let e of i.poolCanvases)F.release(e)}for(let{result:e}of m)for(let t of e.poolCanvases)F.release(t);for(let e of u)z.release(e);for(let e of f)z.release(e)}else for(let e=0;e<o.length;e++){let t=b[e],n=i(o[e]??null,t.trackOrder,t.type===`item`?s(B(t.item).cornerPin):s(B(t.transition.leftClip).cornerPin)||s(B(t.transition.rightClip).cornerPin));if(!n)continue;if(!n.source){n.gpuTexture&&z?.release(n.gpuTexture);continue}let r=t.type===`item`?p(B(t.item)):void 0;r&&r!==`normal`&&(k.globalCompositeOperation=dr(r)),k.drawImage(n.source,0,0),r&&r!==`normal`&&(k.globalCompositeOperation=`source-over`);for(let e of n.poolCanvases)F.release(e)}}n.drawImage(A,0,0),F.release(re),ce(e)},async prewarmFrame(e){let t=vt();if(!t)return;let n=Ye({tracksByOrderAsc:P,visibleTrackIds:j,minFrame:e-1,maxFrame:e+1,maxItems:6}).map(e=>B(e)),r=n.map(e=>e.id).filter(e=>!W.has(e)&&!K.has(e));r.length>0&&await J(r);for(let r of n){if(!W.has(r.id)||K.has(r.id))continue;let n=V.get(r.id);if(!n)continue;let i=e-r.from,a=r.sourceStart??r.trimStart??0,s=r.sourceFps??o,c=r.speed??1,l=r.durationInFrames*c*s/o,u=r.sourceEnd??a+l,d=ot(a,s,i,c,o,0,r.isReversed===!0,u),f=Math.max(0,Math.min(d,n.getDuration()-.01));try{if(await n.drawFrame(t,f,0,0,1,1))G.set(r.id,0);else if(n.getLastFailureKind()!==`no-sample`){let e=(G.get(r.id)??0)+1;G.set(r.id,e),e>=3&&(K.add(r.id),W.delete(r.id))}}catch(t){if(t instanceof DOMException&&t.name===`AbortError`)continue;let n=(G.get(r.id)??0)+1;G.set(r.id,n),$().warn(`Prewarm decode failed`,{itemId:r.id,frame:e,failures:n,error:t}),n>=3&&(K.add(r.id),W.delete(r.id))}}},async prewarmFrames(e){if(e.length===0)return;let t=vt();if(!t)return;let n=new Map,r=[];for(let t of e){let e=Ye({tracksByOrderAsc:P,visibleTrackIds:j,minFrame:t-1,maxFrame:t+1,maxItems:6}).map(e=>B(e));for(let i of e){if(!W.has(i.id)||K.has(i.id))continue;let e=V.get(i.id);if(!e)continue;if(!e.isBatchPrewarmAvailable()){r.includes(t)||r.push(t);continue}let a=t-i.from,s=i.sourceStart??i.trimStart??0,c=i.sourceFps??o,l=i.speed??1,u=i.durationInFrames*l*c/o,d=i.sourceEnd??s+u,f=ot(s,c,a,l,o,0,i.isReversed===!0,d),p=Math.max(0,Math.min(f,e.getDuration()-.01)),m=n.get(i.id);m?m.timestamps.push(p):n.set(i.id,{extractor:e,timestamps:[p]})}}let i=[...n.keys()].filter(e=>!W.has(e)&&!K.has(e));i.length>0&&await J(i),await Promise.all([...n.entries()].map(async([e,{extractor:n,timestamps:r}])=>{ct||!n||(r.sort((e,t)=>e-t),await n.prewarmBatch(t,r,0,0,1,1)>=0&&G.set(e,0))}));for(let e of r){if(ct)break;let n=Ye({tracksByOrderAsc:P,visibleTrackIds:j,minFrame:e-1,maxFrame:e+1,maxItems:6}).map(e=>B(e));for(let r of n){if(!W.has(r.id)||K.has(r.id))continue;let n=V.get(r.id);if(!n)continue;let i=e-r.from,a=r.sourceStart??r.trimStart??0,s=r.sourceFps??o,c=r.speed??1,l=r.durationInFrames*c*s/o,u=r.sourceEnd??a+l,d=ot(a,s,i,c,o,0,r.isReversed===!0,u),f=Math.max(0,Math.min(d,n.getDuration()-.01));try{await n.drawFrame(t,f,0,0,1,1)}catch{}}}},setDomVideoElementProvider(e){q.domVideoElementProvider=e},async prewarmItems(e,t){let n=e.filter(e=>V.has(e)&&!W.has(e)&&!K.has(e));if(n.length>0&&await J(n),t!==void 0){let n=vt();if(!n)return;await Promise.all(e.map(async e=>{if(ct)return;let r=V.get(e);if(!r||!W.has(e))return;let i=He.get(e);if(!i||i.type!==`video`)return;let a=t-i.from;if(a>=i.durationInFrames)return;let s=i.sourceStart??i.trimStart??0,c=i.sourceFps??o,l=i.speed??1,u=i.durationInFrames*l*c/o,d=i.sourceEnd??s+u,f=ot(s,c,a,l,o,0,i.isReversed===!0,d);try{await r.drawFrame(n,Math.max(0,f),0,0,1,1)}catch{}}))}},invalidateFrameCache(e){te+=1,D.invalidate(e),oe?.invalidate(e)},getScrubbingCache(){return oe},getCanvas(){return t},async warmGpuPipeline(){let e=await ue();e&&(ve(),ye(),be(),xe(),Se(),Ce(),q.gpuPipeline=e,q.gpuTransitionPipeline=de,q.gpuMediaPipeline=fe,q.gpuMediaBlendPipeline=R,q.gpuShapePipeline=pe,q.gpuTextPipeline=me,q.gpuMaskCombinePipeline=he)},dispose(){ct=!0,st.clear();for(let e of V.keys())ze.releaseItem(e);if(ze.dispose(),V.clear(),Be.clear(),Ve.clear(),He.clear(),W.clear(),G.clear(),at.clear(),K.clear(),We){for(let e of Ke.values())We.releaseClip(e);We.dispose()}Ge.clear(),Ke.clear(),Ue.clear();for(let e of Qe.values())`close`in e.source&&typeof e.source.close==`function`&&e.source.close();Qe.clear(),nt.clear(),ut.clear(),gt.clear(),pt=null,ft=null,mt=!1,oe?.dispose(),ht?.dispose(),we?.destroy(),we=null,z?.destroy(),z=null,Te?.destroy(),Te=null,De=null,Ee=null,Oe=0,ke=0,Ae=!1,de?.destroy(),de=null,fe?.destroy(),fe=null,R?.destroy(),R=null,pe?.destroy(),pe=null,me?.destroy(),me=null,he?.destroy(),he=null;for(let e of ge.values())e.texture.destroy();ge.clear();for(let e of _e.values())e.texture.destroy();_e.clear(),L?.destroy(),L=null,D.invalidate(),F.dispose(),ae.clear()}}}export{tr as a,er as i,Fa as n,Na as r,Da as t};
//# sourceMappingURL=client-render-engine-joewwUDz.js.map