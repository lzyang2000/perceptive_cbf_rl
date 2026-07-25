(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function t(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(s){if(s.ep)return;s.ep=!0;const a=t(s);fetch(s.href,a)}})();const Xm="modulepreload",jm=function(r){return"/perceptive_cbf_rl/demo/"+r},Jl={},$m=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let f=function(d){return Promise.all(d.map(_=>Promise.resolve(_).then(g=>({status:"fulfilled",value:g}),g=>({status:"rejected",reason:g}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),h=c?.nonce||c?.getAttribute("nonce");s=f(t.map(d=>{if(d=jm(d),d in Jl)return;Jl[d]=!0;const _=d.endsWith(".css"),g=_?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${g}`))return;const v=document.createElement("link");if(v.rel=_?"stylesheet":Xm,_||(v.as="script"),v.crossOrigin="",v.href=d,h&&v.setAttribute("nonce",h),document.head.appendChild(v),_)return new Promise((E,R)=>{v.addEventListener("load",E),v.addEventListener("error",()=>R(new Error(`Unable to preload CSS for ${d}`)))})}))}function a(c){const h=new Event("vite:preloadError",{cancelable:!0});if(h.payload=c,window.dispatchEvent(h),!h.defaultPrevented)throw c}return s.then(c=>{for(const h of c||[])h.status==="rejected"&&a(h.reason);return e().catch(a)})};var qm=(async function(r={}){var e,t=r,n=typeof window=="object",s=typeof WorkerGlobalScope<"u",a=typeof process=="object"&&process.versions?.node&&process.type!="renderer",c=!n&&!a&&!s;if(a){const{createRequire:i}=await $m(async()=>{const{createRequire:o}=await Promise.resolve().then(()=>iS);return{createRequire:o}},void 0);var h=i(import.meta.url)}var f="./this.program",d=(i,o)=>{throw o},_=import.meta.url,g="";function v(i){return t.locateFile?t.locateFile(i,g):g+i}var E,R;if(a){if(!(typeof process=="object"&&process.versions?.node&&process.type!="renderer"))throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");var C=process.versions.node,y=C.split(".").slice(0,3);if(y=y[0]*1e4+y[1]*100+y[2].split("-")[0]*1,y<16e4)throw new Error("This emscripten-generated code requires node v16.0.0 (detected v"+C+")");var m=h("fs");_.startsWith("file:")&&(g=h("path").dirname(h("url").fileURLToPath(_))+"/"),R=o=>{o=z(o)?new URL(o):o;var l=m.readFileSync(o);return D(Buffer.isBuffer(l)),l},E=async(o,l=!0)=>{o=z(o)?new URL(o):o;var u=m.readFileSync(o,l?void 0:"utf8");return D(l?Buffer.isBuffer(u):typeof u=="string"),u},process.argv.length>1&&(f=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2),d=(o,l)=>{throw process.exitCode=o,l}}else if(c){if(typeof process=="object"&&process.versions?.node&&process.type!="renderer"||typeof window=="object"||typeof WorkerGlobalScope<"u")throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)")}else if(n||s){try{g=new URL(".",_).href}catch{}if(!(typeof window=="object"||typeof WorkerGlobalScope<"u"))throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");s&&(R=i=>{var o=new XMLHttpRequest;return o.open("GET",i,!1),o.responseType="arraybuffer",o.send(null),new Uint8Array(o.response)}),E=async i=>{if(z(i))return new Promise((l,u)=>{var p=new XMLHttpRequest;p.open("GET",i,!0),p.responseType="arraybuffer",p.onload=()=>{if(p.status==200||p.status==0&&p.response){l(p.response);return}u(p.status)},p.onerror=u,p.send(null)});var o=await fetch(i,{credentials:"same-origin"});if(o.ok)return o.arrayBuffer();throw new Error(o.status+" : "+o.url)}}else throw new Error("environment detection error");var I=console.log.bind(console),F=console.error.bind(console);D(!c,"shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");var L;typeof WebAssembly!="object"&&F("no native wasm support detected");var O=!1;function D(i,o){i||$("Assertion failed"+(o?": "+o:""))}var z=i=>i.startsWith("file://");function G(){var i=uo();D((i&3)==0),i==0&&(i+=4),Te[i>>2]=34821223,Te[i+4>>2]=2310721022,Te[0]=1668509029}function P(){if(!O){var i=uo();i==0&&(i+=4);var o=Te[i>>2],l=Te[i+4>>2];(o!=34821223||l!=2310721022)&&$(`Stack overflow! Stack cookie has been overwritten at ${Le(i)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${Le(l)} ${Le(o)}`),Te[0]!=1668509029&&$("Runtime error: The application has corrupted its heap memory area (address zero)!")}}class S extends Error{}class k extends S{}class K extends S{constructor(o){super(o),this.excPtr=o;const l=Ol(o);this.name=l[0],this.message=l[1]}}(()=>{var i=new Int16Array(1),o=new Int8Array(i.buffer);if(i[0]=25459,o[0]!==115||o[1]!==99)throw"Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)"})();function Q(i){Object.getOwnPropertyDescriptor(t,i)||Object.defineProperty(t,i,{configurable:!0,set(){$(`Attempt to set \`Module.${i}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`)}})}function ee(i){return()=>D(!1,`call to '${i}' via reference taken before Wasm module initialization`)}function ce(i){Object.getOwnPropertyDescriptor(t,i)&&$(`\`Module.${i}\` was supplied but \`${i}\` not included in INCOMING_MODULE_JS_API`)}function re(i){return i==="FS_createPath"||i==="FS_createDataFile"||i==="FS_createPreloadedFile"||i==="FS_unlink"||i==="addRunDependency"||i==="FS_createLazyFile"||i==="FS_createDevice"||i==="removeRunDependency"}function _e(i,o){typeof globalThis<"u"&&!Object.getOwnPropertyDescriptor(globalThis,i)&&Object.defineProperty(globalThis,i,{configurable:!0,get(){o()}})}function Z(i,o){_e(i,()=>{Fe(`\`${i}\` is not longer defined by emscripten. ${o}`)})}Z("buffer","Please use HEAP8.buffer or wasmMemory.buffer"),Z("asm","Please use wasmExports instead");function ye(i){_e(i,()=>{var o=`\`${i}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`,l=i;l.startsWith("_")||(l="$"+i),o+=` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${l}')`,re(i)&&(o+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"),Fe(o)}),ve(i)}function ve(i){Object.getOwnPropertyDescriptor(t,i)||Object.defineProperty(t,i,{configurable:!0,get(){var o=`'${i}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;re(i)&&(o+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"),$(o)}})}var Pe,je,_t,nt,et,le,de,oe,Te,He,lt,Rt,B,xt=!1;function Je(){var i=_t.buffer;nt=new Int8Array(i),le=new Int16Array(i),et=new Uint8Array(i),de=new Uint16Array(i),oe=new Int32Array(i),Te=new Uint32Array(i),He=new Float32Array(i),lt=new Float64Array(i),Rt=new BigInt64Array(i),B=new BigUint64Array(i)}D(typeof Int32Array<"u"&&typeof Float64Array<"u"&&Int32Array.prototype.subarray!=null&&Int32Array.prototype.set!=null,"JS engine does not provide full typed array support");function Ye(){if(t.preRun)for(typeof t.preRun=="function"&&(t.preRun=[t.preRun]);t.preRun.length;)Me(t.preRun.shift());Q("preRun"),ke(V)}function Oe(){D(!xt),xt=!0,P(),!t.noFSInit&&!M.initialized&&M.init(),xi.__wasm_call_ctors(),M.ignorePermissions=!1}function Ct(){if(P(),t.postRun)for(typeof t.postRun=="function"&&(t.postRun=[t.postRun]);t.postRun.length;)tt(t.postRun.shift());Q("postRun"),ke(Ae)}var Ie=0,Ke=null,Lt={},Et=null;function U(i){Ie++,t.monitorRunDependencies?.(Ie),i?(D(!Lt[i]),Lt[i]=1,Et===null&&typeof setInterval<"u"&&(Et=setInterval(()=>{if(O){clearInterval(Et),Et=null;return}var o=!1;for(var l in Lt)o||(o=!0,F("still waiting on run dependencies:")),F(`dependency: ${l}`);o&&F("(end of list)")},1e4))):F("warning: run dependency added without ID")}function b(i){if(Ie--,t.monitorRunDependencies?.(Ie),i?(D(Lt[i]),delete Lt[i]):F("warning: run dependency removed without ID"),Ie==0&&(Et!==null&&(clearInterval(Et),Et=null),Ke)){var o=Ke;Ke=null,o()}}function $(i){t.onAbort?.(i),i="Aborted("+i+")",F(i),O=!0;var o=new WebAssembly.RuntimeError(i);throw je?.(o),o}function ie(i,o){return(...l)=>{D(xt,`native function \`${i}\` called before runtime initialization`);var u=xi[i];return D(u,`exported native function \`${i}\` not found`),D(l.length<=o,`native function \`${i}\` called with ${l.length} args but expects ${o}`),u(...l)}}var fe;function se(){return t.locateFile?v("mujoco.wasm"):new URL("/perceptive_cbf_rl/demo/assets/mujoco-DU97C8Zn.wasm",import.meta.url).href}function Ve(i){if(i==fe&&L)return new Uint8Array(L);if(R)return R(i);throw"both async and sync fetching of the wasm failed"}async function we(i){if(!L)try{var o=await E(i);return new Uint8Array(o)}catch{}return Ve(i)}async function Be(i,o){try{var l=await we(i),u=await WebAssembly.instantiate(l,o);return u}catch(p){F(`failed to asynchronously prepare wasm: ${p}`),z(fe)&&F(`warning: Loading from a file URI (${fe}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`),$(p)}}async function ze(i,o,l){if(!i&&typeof WebAssembly.instantiateStreaming=="function"&&!z(o)&&!a)try{var u=fetch(o,{credentials:"same-origin"}),p=await WebAssembly.instantiateStreaming(u,l);return p}catch(x){F(`wasm streaming compile failed: ${x}`),F("falling back to ArrayBuffer instantiation")}return Be(o,l)}function Se(){return{env:Yl,wasi_snapshot_preview1:Yl}}async function De(){function i(T,w){return xi=T.exports,_t=xi.memory,D(_t,"memory not found in wasm exports"),Je(),ts=xi.__indirect_function_table,D(ts,"table not found in wasm exports"),Jd(xi),b("wasm-instantiate"),xi}U("wasm-instantiate");var o=t;function l(T){return D(t===o,"the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"),o=null,i(T.instance)}var u=Se();if(t.instantiateWasm)return new Promise((T,w)=>{try{t.instantiateWasm(u,(N,q)=>{T(i(N,q))})}catch(N){F(`Module.instantiateWasm callback failed with error: ${N}`),w(N)}});fe??=se();var p=await ze(L,fe,u),x=l(p);return x}class $e{name="ExitStatus";constructor(o){this.message=`Program terminated with exit(${o})`,this.status=o}}var ke=i=>{for(;i.length>0;)i.shift()(t)},Ae=[],tt=i=>Ae.push(i),V=[],Me=i=>V.push(i),be=!0,Le=i=>(D(typeof i=="number"),i>>>=0,"0x"+i.toString(16).padStart(8,"0")),W=i=>Gl(i),H=()=>Xl(),Fe=i=>{Fe.shown||={},Fe.shown[i]||(Fe.shown[i]=1,a&&(i="warning: "+i),F(i))},Ze=typeof TextDecoder<"u"?new TextDecoder:void 0,pt=(i,o=0,l=NaN)=>{for(var u=o+l,p=o;i[p]&&!(p>=u);)++p;if(p-o>16&&i.buffer&&Ze)return Ze.decode(i.subarray(o,p));for(var x="";o<p;){var T=i[o++];if(!(T&128)){x+=String.fromCharCode(T);continue}var w=i[o++]&63;if((T&224)==192){x+=String.fromCharCode((T&31)<<6|w);continue}var N=i[o++]&63;if((T&240)==224?T=(T&15)<<12|w<<6|N:((T&248)!=240&&Fe("Invalid UTF-8 leading byte "+Le(T)+" encountered when deserializing a UTF-8 string in wasm memory to a JS string!"),T=(T&7)<<18|w<<12|N<<6|i[o++]&63),T<65536)x+=String.fromCharCode(T);else{var q=T-65536;x+=String.fromCharCode(55296|q>>10,56320|q&1023)}}return x},st=(i,o)=>(D(typeof i=="number",`UTF8ToString expects a number (got ${typeof i})`),i?pt(et,i,o):""),En=(i,o,l,u)=>$(`Assertion failed: ${st(i)}, at: `+[o?st(o):"unknown filename",l,u?st(u):"unknown function"]),Ot=[],fi=0,Bn=i=>{var o=new kn(i);return o.get_caught()||(o.set_caught(!0),fi--),o.set_rethrown(!1),Ot.push(o),ls(i),ql(i)},yr=()=>{if(!Ot.length)return 0;var i=Ot[Ot.length-1];return ls(i.excPtr),i.excPtr},gn=0,Gr=()=>{xe(0,0),D(Ot.length>0);var i=Ot.pop();fo(i.excPtr),gn=0};class kn{constructor(o){this.excPtr=o,this.ptr=o-24}set_type(o){Te[this.ptr+4>>2]=o}get_type(){return Te[this.ptr+4>>2]}set_destructor(o){Te[this.ptr+8>>2]=o}get_destructor(){return Te[this.ptr+8>>2]}set_caught(o){o=o?1:0,nt[this.ptr+12]=o}get_caught(){return nt[this.ptr+12]!=0}set_rethrown(o){o=o?1:0,nt[this.ptr+13]=o}get_rethrown(){return nt[this.ptr+13]!=0}init(o,l){this.set_adjusted_ptr(0),this.set_type(o),this.set_destructor(l)}set_adjusted_ptr(o){Te[this.ptr+16>>2]=o}get_adjusted_ptr(){return Te[this.ptr+16>>2]}}var pi=i=>Hl(i),Zn=i=>{var o=gn?.excPtr;if(!o)return pi(0),0;var l=new kn(o);l.set_adjusted_ptr(o);var u=l.get_type();if(!u)return pi(0),o;for(var p of i){if(p===0||p===u)break;var x=l.ptr+16;if($l(p,u,x))return pi(p),o}return pi(u),o},Wr=()=>Zn([]),Xr=i=>Zn([i]),Ys=(i,o)=>Zn([i,o]),jr=()=>{var i=Ot.pop();i||$("no exception to throw");var o=i.excPtr;throw i.get_rethrown()||(Ot.push(i),i.set_rethrown(!0),i.set_caught(!1),fi++),gn=new K(o),gn},Ks=i=>{if(i){var o=new kn(i);Ot.push(o),o.set_rethrown(!0),jr()}},Zs=(i,o,l)=>{var u=new kn(i);throw u.init(o,l),gn=new K(i),fi++,gn},Js=()=>fi,Qs=i=>{throw gn||(gn=new K(i)),gn},A={isAbs:i=>i.charAt(0)==="/",splitPath:i=>{var o=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return o.exec(i).slice(1)},normalizeArray:(i,o)=>{for(var l=0,u=i.length-1;u>=0;u--){var p=i[u];p==="."?i.splice(u,1):p===".."?(i.splice(u,1),l++):l&&(i.splice(u,1),l--)}if(o)for(;l;l--)i.unshift("..");return i},normalize:i=>{var o=A.isAbs(i),l=i.slice(-1)==="/";return i=A.normalizeArray(i.split("/").filter(u=>!!u),!o).join("/"),!i&&!o&&(i="."),i&&l&&(i+="/"),(o?"/":"")+i},dirname:i=>{var o=A.splitPath(i),l=o[0],u=o[1];return!l&&!u?".":(u&&(u=u.slice(0,-1)),l+u)},basename:i=>i&&i.match(/([^\/]+|\/)\/*$/)[1],join:(...i)=>A.normalize(i.join("/")),join2:(i,o)=>A.normalize(i+"/"+o)},j=()=>{if(a){var i=h("crypto");return o=>i.randomFillSync(o)}return o=>crypto.getRandomValues(o)},ne=i=>{(ne=j())(i)},te={resolve:(...i)=>{for(var o="",l=!1,u=i.length-1;u>=-1&&!l;u--){var p=u>=0?i[u]:M.cwd();if(typeof p!="string")throw new TypeError("Arguments to path.resolve must be strings");if(!p)return"";o=p+"/"+o,l=A.isAbs(p)}return o=A.normalizeArray(o.split("/").filter(x=>!!x),!l).join("/"),(l?"/":"")+o||"."},relative:(i,o)=>{i=te.resolve(i).slice(1),o=te.resolve(o).slice(1);function l(q){for(var J=0;J<q.length&&q[J]==="";J++);for(var he=q.length-1;he>=0&&q[he]==="";he--);return J>he?[]:q.slice(J,he-J+1)}for(var u=l(i.split("/")),p=l(o.split("/")),x=Math.min(u.length,p.length),T=x,w=0;w<x;w++)if(u[w]!==p[w]){T=w;break}for(var N=[],w=T;w<u.length;w++)N.push("..");return N=N.concat(p.slice(T)),N.join("/")}},Y=[],me=i=>{for(var o=0,l=0;l<i.length;++l){var u=i.charCodeAt(l);u<=127?o++:u<=2047?o+=2:u>=55296&&u<=57343?(o+=4,++l):o+=3}return o},Re=(i,o,l,u)=>{if(D(typeof i=="string",`stringToUTF8Array expects a string (got ${typeof i})`),!(u>0))return 0;for(var p=l,x=l+u-1,T=0;T<i.length;++T){var w=i.codePointAt(T);if(w<=127){if(l>=x)break;o[l++]=w}else if(w<=2047){if(l+1>=x)break;o[l++]=192|w>>6,o[l++]=128|w&63}else if(w<=65535){if(l+2>=x)break;o[l++]=224|w>>12,o[l++]=128|w>>6&63,o[l++]=128|w&63}else{if(l+3>=x)break;w>1114111&&Fe("Invalid Unicode code point "+Le(w)+" encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF)."),o[l++]=240|w>>18,o[l++]=128|w>>12&63,o[l++]=128|w>>6&63,o[l++]=128|w&63,T++}}return o[l]=0,l-p},Ne=(i,o,l)=>{var u=me(i)+1,p=new Array(u),x=Re(i,p,0,p.length);return p.length=x,p},Ue=()=>{if(!Y.length){var i=null;if(a){var o=256,l=Buffer.alloc(o),u=0,p=process.stdin.fd;try{u=m.readSync(p,l,0,o)}catch(x){if(x.toString().includes("EOF"))u=0;else throw x}u>0&&(i=l.slice(0,u).toString("utf-8"))}else typeof window<"u"&&typeof window.prompt=="function"&&(i=window.prompt("Input: "),i!==null&&(i+=`
`));if(!i)return null;Y=Ne(i)}return Y.shift()},Ge={ttys:[],init(){},shutdown(){},register(i,o){Ge.ttys[i]={input:[],output:[],ops:o},M.registerDevice(i,Ge.stream_ops)},stream_ops:{open(i){var o=Ge.ttys[i.node.rdev];if(!o)throw new M.ErrnoError(43);i.tty=o,i.seekable=!1},close(i){i.tty.ops.fsync(i.tty)},fsync(i){i.tty.ops.fsync(i.tty)},read(i,o,l,u,p){if(!i.tty||!i.tty.ops.get_char)throw new M.ErrnoError(60);for(var x=0,T=0;T<u;T++){var w;try{w=i.tty.ops.get_char(i.tty)}catch{throw new M.ErrnoError(29)}if(w===void 0&&x===0)throw new M.ErrnoError(6);if(w==null)break;x++,o[l+T]=w}return x&&(i.node.atime=Date.now()),x},write(i,o,l,u,p){if(!i.tty||!i.tty.ops.put_char)throw new M.ErrnoError(60);try{for(var x=0;x<u;x++)i.tty.ops.put_char(i.tty,o[l+x])}catch{throw new M.ErrnoError(29)}return u&&(i.node.mtime=i.node.ctime=Date.now()),x}},default_tty_ops:{get_char(i){return Ue()},put_char(i,o){o===null||o===10?(I(pt(i.output)),i.output=[]):o!=0&&i.output.push(o)},fsync(i){i.output?.length>0&&(I(pt(i.output)),i.output=[])},ioctl_tcgets(i){return{c_iflag:25856,c_oflag:5,c_cflag:191,c_lflag:35387,c_cc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},ioctl_tcsets(i,o,l){return 0},ioctl_tiocgwinsz(i){return[24,80]}},default_tty1_ops:{put_char(i,o){o===null||o===10?(F(pt(i.output)),i.output=[]):o!=0&&i.output.push(o)},fsync(i){i.output?.length>0&&(F(pt(i.output)),i.output=[])}}},qe=i=>{$("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported")},ge={ops_table:null,mount(i){return ge.createNode(null,"/",16895,0)},createNode(i,o,l,u){if(M.isBlkdev(l)||M.isFIFO(l))throw new M.ErrnoError(63);ge.ops_table||={dir:{node:{getattr:ge.node_ops.getattr,setattr:ge.node_ops.setattr,lookup:ge.node_ops.lookup,mknod:ge.node_ops.mknod,rename:ge.node_ops.rename,unlink:ge.node_ops.unlink,rmdir:ge.node_ops.rmdir,readdir:ge.node_ops.readdir,symlink:ge.node_ops.symlink},stream:{llseek:ge.stream_ops.llseek}},file:{node:{getattr:ge.node_ops.getattr,setattr:ge.node_ops.setattr},stream:{llseek:ge.stream_ops.llseek,read:ge.stream_ops.read,write:ge.stream_ops.write,mmap:ge.stream_ops.mmap,msync:ge.stream_ops.msync}},link:{node:{getattr:ge.node_ops.getattr,setattr:ge.node_ops.setattr,readlink:ge.node_ops.readlink},stream:{}},chrdev:{node:{getattr:ge.node_ops.getattr,setattr:ge.node_ops.setattr},stream:M.chrdev_stream_ops}};var p=M.createNode(i,o,l,u);return M.isDir(p.mode)?(p.node_ops=ge.ops_table.dir.node,p.stream_ops=ge.ops_table.dir.stream,p.contents={}):M.isFile(p.mode)?(p.node_ops=ge.ops_table.file.node,p.stream_ops=ge.ops_table.file.stream,p.usedBytes=0,p.contents=null):M.isLink(p.mode)?(p.node_ops=ge.ops_table.link.node,p.stream_ops=ge.ops_table.link.stream):M.isChrdev(p.mode)&&(p.node_ops=ge.ops_table.chrdev.node,p.stream_ops=ge.ops_table.chrdev.stream),p.atime=p.mtime=p.ctime=Date.now(),i&&(i.contents[o]=p,i.atime=i.mtime=i.ctime=p.atime),p},getFileDataAsTypedArray(i){return i.contents?i.contents.subarray?i.contents.subarray(0,i.usedBytes):new Uint8Array(i.contents):new Uint8Array(0)},expandFileStorage(i,o){var l=i.contents?i.contents.length:0;if(!(l>=o)){var u=1024*1024;o=Math.max(o,l*(l<u?2:1.125)>>>0),l!=0&&(o=Math.max(o,256));var p=i.contents;i.contents=new Uint8Array(o),i.usedBytes>0&&i.contents.set(p.subarray(0,i.usedBytes),0)}},resizeFileStorage(i,o){if(i.usedBytes!=o)if(o==0)i.contents=null,i.usedBytes=0;else{var l=i.contents;i.contents=new Uint8Array(o),l&&i.contents.set(l.subarray(0,Math.min(o,i.usedBytes))),i.usedBytes=o}},node_ops:{getattr(i){var o={};return o.dev=M.isChrdev(i.mode)?i.id:1,o.ino=i.id,o.mode=i.mode,o.nlink=1,o.uid=0,o.gid=0,o.rdev=i.rdev,M.isDir(i.mode)?o.size=4096:M.isFile(i.mode)?o.size=i.usedBytes:M.isLink(i.mode)?o.size=i.link.length:o.size=0,o.atime=new Date(i.atime),o.mtime=new Date(i.mtime),o.ctime=new Date(i.ctime),o.blksize=4096,o.blocks=Math.ceil(o.size/o.blksize),o},setattr(i,o){for(const l of["mode","atime","mtime","ctime"])o[l]!=null&&(i[l]=o[l]);o.size!==void 0&&ge.resizeFileStorage(i,o.size)},lookup(i,o){throw new M.ErrnoError(44)},mknod(i,o,l,u){return ge.createNode(i,o,l,u)},rename(i,o,l){var u;try{u=M.lookupNode(o,l)}catch{}if(u){if(M.isDir(i.mode))for(var p in u.contents)throw new M.ErrnoError(55);M.hashRemoveNode(u)}delete i.parent.contents[i.name],o.contents[l]=i,i.name=l,o.ctime=o.mtime=i.parent.ctime=i.parent.mtime=Date.now()},unlink(i,o){delete i.contents[o],i.ctime=i.mtime=Date.now()},rmdir(i,o){var l=M.lookupNode(i,o);for(var u in l.contents)throw new M.ErrnoError(55);delete i.contents[o],i.ctime=i.mtime=Date.now()},readdir(i){return[".","..",...Object.keys(i.contents)]},symlink(i,o,l){var u=ge.createNode(i,o,41471,0);return u.link=l,u},readlink(i){if(!M.isLink(i.mode))throw new M.ErrnoError(28);return i.link}},stream_ops:{read(i,o,l,u,p){var x=i.node.contents;if(p>=i.node.usedBytes)return 0;var T=Math.min(i.node.usedBytes-p,u);if(D(T>=0),T>8&&x.subarray)o.set(x.subarray(p,p+T),l);else for(var w=0;w<T;w++)o[l+w]=x[p+w];return T},write(i,o,l,u,p,x){if(D(!(o instanceof ArrayBuffer)),o.buffer===nt.buffer&&(x=!1),!u)return 0;var T=i.node;if(T.mtime=T.ctime=Date.now(),o.subarray&&(!T.contents||T.contents.subarray)){if(x)return D(p===0,"canOwn must imply no weird position inside the file"),T.contents=o.subarray(l,l+u),T.usedBytes=u,u;if(T.usedBytes===0&&p===0)return T.contents=o.slice(l,l+u),T.usedBytes=u,u;if(p+u<=T.usedBytes)return T.contents.set(o.subarray(l,l+u),p),u}if(ge.expandFileStorage(T,p+u),T.contents.subarray&&o.subarray)T.contents.set(o.subarray(l,l+u),p);else for(var w=0;w<u;w++)T.contents[p+w]=o[l+w];return T.usedBytes=Math.max(T.usedBytes,p+u),u},llseek(i,o,l){var u=o;if(l===1?u+=i.position:l===2&&M.isFile(i.node.mode)&&(u+=i.node.usedBytes),u<0)throw new M.ErrnoError(28);return u},mmap(i,o,l,u,p){if(!M.isFile(i.node.mode))throw new M.ErrnoError(43);var x,T,w=i.node.contents;if(!(p&2)&&w&&w.buffer===nt.buffer)T=!1,x=w.byteOffset;else{if(T=!0,x=qe(),!x)throw new M.ErrnoError(48);w&&((l>0||l+o<w.length)&&(w.subarray?w=w.subarray(l,l+o):w=Array.prototype.slice.call(w,l,l+o)),nt.set(w,x))}return{ptr:x,allocated:T}},msync(i,o,l,u,p){return ge.stream_ops.write(i,o,0,u,l,!1),0}}},ct=async i=>{var o=await E(i);return D(o,`Loading data file "${i}" failed (no arrayBuffer).`),new Uint8Array(o)},vt=(...i)=>M.createDataFile(...i),Ut=i=>{for(var o=i;;){if(!Lt[i])return i;i=o+Math.random()}},Mt=[],St=(i,o,l,u)=>{typeof Browser<"u"&&Browser.init();var p=!1;return Mt.forEach(x=>{p||x.canHandle(o)&&(x.handle(i,o,l,u),p=!0)}),p},We=(i,o,l,u,p,x,T,w,N,q)=>{var J=o?te.resolve(A.join2(i,o)):i,he=Ut(`cp ${J}`);function ue(ae){function pe(Xe){q?.(),w||vt(i,o,Xe,u,p,N),x?.(),b(he)}St(ae,J,pe,()=>{T?.(),b(he)})||pe(ae)}U(he),typeof l=="string"?ct(l).then(ue,T):ue(l)},Ft=i=>{var o={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090},l=o[i];if(typeof l>"u")throw new Error(`Unknown file open mode: ${i}`);return l},ut=(i,o)=>{var l=0;return i&&(l|=365),o&&(l|=146),l},tn=i=>st(zl(i)),zn={EPERM:63,ENOENT:44,ESRCH:71,EINTR:27,EIO:29,ENXIO:60,E2BIG:1,ENOEXEC:45,EBADF:8,ECHILD:12,EAGAIN:6,EWOULDBLOCK:6,ENOMEM:48,EACCES:2,EFAULT:21,ENOTBLK:105,EBUSY:10,EEXIST:20,EXDEV:75,ENODEV:43,ENOTDIR:54,EISDIR:31,EINVAL:28,ENFILE:41,EMFILE:33,ENOTTY:59,ETXTBSY:74,EFBIG:22,ENOSPC:51,ESPIPE:70,EROFS:69,EMLINK:34,EPIPE:64,EDOM:18,ERANGE:68,ENOMSG:49,EIDRM:24,ECHRNG:106,EL2NSYNC:156,EL3HLT:107,EL3RST:108,ELNRNG:109,EUNATCH:110,ENOCSI:111,EL2HLT:112,EDEADLK:16,ENOLCK:46,EBADE:113,EBADR:114,EXFULL:115,ENOANO:104,EBADRQC:103,EBADSLT:102,EDEADLOCK:16,EBFONT:101,ENOSTR:100,ENODATA:116,ETIME:117,ENOSR:118,ENONET:119,ENOPKG:120,EREMOTE:121,ENOLINK:47,EADV:122,ESRMNT:123,ECOMM:124,EPROTO:65,EMULTIHOP:36,EDOTDOT:125,EBADMSG:9,ENOTUNIQ:126,EBADFD:127,EREMCHG:128,ELIBACC:129,ELIBBAD:130,ELIBSCN:131,ELIBMAX:132,ELIBEXEC:133,ENOSYS:52,ENOTEMPTY:55,ENAMETOOLONG:37,ELOOP:32,EOPNOTSUPP:138,EPFNOSUPPORT:139,ECONNRESET:15,ENOBUFS:42,EAFNOSUPPORT:5,EPROTOTYPE:67,ENOTSOCK:57,ENOPROTOOPT:50,ESHUTDOWN:140,ECONNREFUSED:14,EADDRINUSE:3,ECONNABORTED:13,ENETUNREACH:40,ENETDOWN:38,ETIMEDOUT:73,EHOSTDOWN:142,EHOSTUNREACH:23,EINPROGRESS:26,EALREADY:7,EDESTADDRREQ:17,EMSGSIZE:35,EPROTONOSUPPORT:66,ESOCKTNOSUPPORT:137,EADDRNOTAVAIL:4,ENETRESET:39,EISCONN:30,ENOTCONN:53,ETOOMANYREFS:141,EUSERS:136,EDQUOT:19,ESTALE:72,ENOTSUP:138,ENOMEDIUM:148,EILSEQ:25,EOVERFLOW:61,ECANCELED:11,ENOTRECOVERABLE:56,EOWNERDEAD:62,ESTRPIPE:135},M={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:!1,ignorePermissions:!0,filesystems:null,syncFSRequests:0,readFiles:{},ErrnoError:class extends Error{name="ErrnoError";constructor(i){super(xt?tn(i):""),this.errno=i;for(var o in zn)if(zn[o]===i){this.code=o;break}}},FSStream:class{shared={};get object(){return this.node}set object(i){this.node=i}get isRead(){return(this.flags&2097155)!==1}get isWrite(){return(this.flags&2097155)!==0}get isAppend(){return this.flags&1024}get flags(){return this.shared.flags}set flags(i){this.shared.flags=i}get position(){return this.shared.position}set position(i){this.shared.position=i}},FSNode:class{node_ops={};stream_ops={};readMode=365;writeMode=146;mounted=null;constructor(i,o,l,u){i||(i=this),this.parent=i,this.mount=i.mount,this.id=M.nextInode++,this.name=o,this.mode=l,this.rdev=u,this.atime=this.mtime=this.ctime=Date.now()}get read(){return(this.mode&this.readMode)===this.readMode}set read(i){i?this.mode|=this.readMode:this.mode&=~this.readMode}get write(){return(this.mode&this.writeMode)===this.writeMode}set write(i){i?this.mode|=this.writeMode:this.mode&=~this.writeMode}get isFolder(){return M.isDir(this.mode)}get isDevice(){return M.isChrdev(this.mode)}},lookupPath(i,o={}){if(!i)throw new M.ErrnoError(44);o.follow_mount??=!0,A.isAbs(i)||(i=M.cwd()+"/"+i);e:for(var l=0;l<40;l++){for(var u=i.split("/").filter(q=>!!q),p=M.root,x="/",T=0;T<u.length;T++){var w=T===u.length-1;if(w&&o.parent)break;if(u[T]!=="."){if(u[T]===".."){if(x=A.dirname(x),M.isRoot(p)){i=x+"/"+u.slice(T+1).join("/");continue e}else p=p.parent;continue}x=A.join2(x,u[T]);try{p=M.lookupNode(p,u[T])}catch(q){if(q?.errno===44&&w&&o.noent_okay)return{path:x};throw q}if(M.isMountpoint(p)&&(!w||o.follow_mount)&&(p=p.mounted.root),M.isLink(p.mode)&&(!w||o.follow)){if(!p.node_ops.readlink)throw new M.ErrnoError(52);var N=p.node_ops.readlink(p);A.isAbs(N)||(N=A.dirname(x)+"/"+N),i=N+"/"+u.slice(T+1).join("/");continue e}}}return{path:x,node:p}}throw new M.ErrnoError(32)},getPath(i){for(var o;;){if(M.isRoot(i)){var l=i.mount.mountpoint;return o?l[l.length-1]!=="/"?`${l}/${o}`:l+o:l}o=o?`${i.name}/${o}`:i.name,i=i.parent}},hashName(i,o){for(var l=0,u=0;u<o.length;u++)l=(l<<5)-l+o.charCodeAt(u)|0;return(i+l>>>0)%M.nameTable.length},hashAddNode(i){var o=M.hashName(i.parent.id,i.name);i.name_next=M.nameTable[o],M.nameTable[o]=i},hashRemoveNode(i){var o=M.hashName(i.parent.id,i.name);if(M.nameTable[o]===i)M.nameTable[o]=i.name_next;else for(var l=M.nameTable[o];l;){if(l.name_next===i){l.name_next=i.name_next;break}l=l.name_next}},lookupNode(i,o){var l=M.mayLookup(i);if(l)throw new M.ErrnoError(l);for(var u=M.hashName(i.id,o),p=M.nameTable[u];p;p=p.name_next){var x=p.name;if(p.parent.id===i.id&&x===o)return p}return M.lookup(i,o)},createNode(i,o,l,u){D(typeof i=="object");var p=new M.FSNode(i,o,l,u);return M.hashAddNode(p),p},destroyNode(i){M.hashRemoveNode(i)},isRoot(i){return i===i.parent},isMountpoint(i){return!!i.mounted},isFile(i){return(i&61440)===32768},isDir(i){return(i&61440)===16384},isLink(i){return(i&61440)===40960},isChrdev(i){return(i&61440)===8192},isBlkdev(i){return(i&61440)===24576},isFIFO(i){return(i&61440)===4096},isSocket(i){return(i&49152)===49152},flagsToPermissionString(i){var o=["r","w","rw"][i&3];return i&512&&(o+="w"),o},nodePermissions(i,o){return M.ignorePermissions?0:o.includes("r")&&!(i.mode&292)||o.includes("w")&&!(i.mode&146)||o.includes("x")&&!(i.mode&73)?2:0},mayLookup(i){if(!M.isDir(i.mode))return 54;var o=M.nodePermissions(i,"x");return o||(i.node_ops.lookup?0:2)},mayCreate(i,o){if(!M.isDir(i.mode))return 54;try{var l=M.lookupNode(i,o);return 20}catch{}return M.nodePermissions(i,"wx")},mayDelete(i,o,l){var u;try{u=M.lookupNode(i,o)}catch(x){return x.errno}var p=M.nodePermissions(i,"wx");if(p)return p;if(l){if(!M.isDir(u.mode))return 54;if(M.isRoot(u)||M.getPath(u)===M.cwd())return 10}else if(M.isDir(u.mode))return 31;return 0},mayOpen(i,o){return i?M.isLink(i.mode)?32:M.isDir(i.mode)&&(M.flagsToPermissionString(o)!=="r"||o&576)?31:M.nodePermissions(i,M.flagsToPermissionString(o)):44},checkOpExists(i,o){if(!i)throw new M.ErrnoError(o);return i},MAX_OPEN_FDS:4096,nextfd(){for(var i=0;i<=M.MAX_OPEN_FDS;i++)if(!M.streams[i])return i;throw new M.ErrnoError(33)},getStreamChecked(i){var o=M.getStream(i);if(!o)throw new M.ErrnoError(8);return o},getStream:i=>M.streams[i],createStream(i,o=-1){return D(o>=-1),i=Object.assign(new M.FSStream,i),o==-1&&(o=M.nextfd()),i.fd=o,M.streams[o]=i,i},closeStream(i){M.streams[i]=null},dupStream(i,o=-1){var l=M.createStream(i,o);return l.stream_ops?.dup?.(l),l},doSetAttr(i,o,l){var u=i?.stream_ops.setattr,p=u?i:o;u??=o.node_ops.setattr,M.checkOpExists(u,63),u(p,l)},chrdev_stream_ops:{open(i){var o=M.getDevice(i.node.rdev);i.stream_ops=o.stream_ops,i.stream_ops.open?.(i)},llseek(){throw new M.ErrnoError(70)}},major:i=>i>>8,minor:i=>i&255,makedev:(i,o)=>i<<8|o,registerDevice(i,o){M.devices[i]={stream_ops:o}},getDevice:i=>M.devices[i],getMounts(i){for(var o=[],l=[i];l.length;){var u=l.pop();o.push(u),l.push(...u.mounts)}return o},syncfs(i,o){typeof i=="function"&&(o=i,i=!1),M.syncFSRequests++,M.syncFSRequests>1&&F(`warning: ${M.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);var l=M.getMounts(M.root.mount),u=0;function p(T){return D(M.syncFSRequests>0),M.syncFSRequests--,o(T)}function x(T){if(T)return x.errored?void 0:(x.errored=!0,p(T));++u>=l.length&&p(null)}l.forEach(T=>{if(!T.type.syncfs)return x(null);T.type.syncfs(T,i,x)})},mount(i,o,l){if(typeof i=="string")throw i;var u=l==="/",p=!l,x;if(u&&M.root)throw new M.ErrnoError(10);if(!u&&!p){var T=M.lookupPath(l,{follow_mount:!1});if(l=T.path,x=T.node,M.isMountpoint(x))throw new M.ErrnoError(10);if(!M.isDir(x.mode))throw new M.ErrnoError(54)}var w={type:i,opts:o,mountpoint:l,mounts:[]},N=i.mount(w);return N.mount=w,w.root=N,u?M.root=N:x&&(x.mounted=w,x.mount&&x.mount.mounts.push(w)),N},unmount(i){var o=M.lookupPath(i,{follow_mount:!1});if(!M.isMountpoint(o.node))throw new M.ErrnoError(28);var l=o.node,u=l.mounted,p=M.getMounts(u);Object.keys(M.nameTable).forEach(T=>{for(var w=M.nameTable[T];w;){var N=w.name_next;p.includes(w.mount)&&M.destroyNode(w),w=N}}),l.mounted=null;var x=l.mount.mounts.indexOf(u);D(x!==-1),l.mount.mounts.splice(x,1)},lookup(i,o){return i.node_ops.lookup(i,o)},mknod(i,o,l){var u=M.lookupPath(i,{parent:!0}),p=u.node,x=A.basename(i);if(!x)throw new M.ErrnoError(28);if(x==="."||x==="..")throw new M.ErrnoError(20);var T=M.mayCreate(p,x);if(T)throw new M.ErrnoError(T);if(!p.node_ops.mknod)throw new M.ErrnoError(63);return p.node_ops.mknod(p,x,o,l)},statfs(i){return M.statfsNode(M.lookupPath(i,{follow:!0}).node)},statfsStream(i){return M.statfsNode(i.node)},statfsNode(i){var o={bsize:4096,frsize:4096,blocks:1e6,bfree:5e5,bavail:5e5,files:M.nextInode,ffree:M.nextInode-1,fsid:42,flags:2,namelen:255};return i.node_ops.statfs&&Object.assign(o,i.node_ops.statfs(i.mount.opts.root)),o},create(i,o=438){return o&=4095,o|=32768,M.mknod(i,o,0)},mkdir(i,o=511){return o&=1023,o|=16384,M.mknod(i,o,0)},mkdirTree(i,o){var l=i.split("/"),u="";for(var p of l)if(p){(u||A.isAbs(i))&&(u+="/"),u+=p;try{M.mkdir(u,o)}catch(x){if(x.errno!=20)throw x}}},mkdev(i,o,l){return typeof l>"u"&&(l=o,o=438),o|=8192,M.mknod(i,o,l)},symlink(i,o){if(!te.resolve(i))throw new M.ErrnoError(44);var l=M.lookupPath(o,{parent:!0}),u=l.node;if(!u)throw new M.ErrnoError(44);var p=A.basename(o),x=M.mayCreate(u,p);if(x)throw new M.ErrnoError(x);if(!u.node_ops.symlink)throw new M.ErrnoError(63);return u.node_ops.symlink(u,p,i)},rename(i,o){var l=A.dirname(i),u=A.dirname(o),p=A.basename(i),x=A.basename(o),T,w,N;if(T=M.lookupPath(i,{parent:!0}),w=T.node,T=M.lookupPath(o,{parent:!0}),N=T.node,!w||!N)throw new M.ErrnoError(44);if(w.mount!==N.mount)throw new M.ErrnoError(75);var q=M.lookupNode(w,p),J=te.relative(i,u);if(J.charAt(0)!==".")throw new M.ErrnoError(28);if(J=te.relative(o,l),J.charAt(0)!==".")throw new M.ErrnoError(55);var he;try{he=M.lookupNode(N,x)}catch{}if(q!==he){var ue=M.isDir(q.mode),ae=M.mayDelete(w,p,ue);if(ae)throw new M.ErrnoError(ae);if(ae=he?M.mayDelete(N,x,ue):M.mayCreate(N,x),ae)throw new M.ErrnoError(ae);if(!w.node_ops.rename)throw new M.ErrnoError(63);if(M.isMountpoint(q)||he&&M.isMountpoint(he))throw new M.ErrnoError(10);if(N!==w&&(ae=M.nodePermissions(w,"w"),ae))throw new M.ErrnoError(ae);M.hashRemoveNode(q);try{w.node_ops.rename(q,N,x),q.parent=N}catch(pe){throw pe}finally{M.hashAddNode(q)}}},rmdir(i){var o=M.lookupPath(i,{parent:!0}),l=o.node,u=A.basename(i),p=M.lookupNode(l,u),x=M.mayDelete(l,u,!0);if(x)throw new M.ErrnoError(x);if(!l.node_ops.rmdir)throw new M.ErrnoError(63);if(M.isMountpoint(p))throw new M.ErrnoError(10);l.node_ops.rmdir(l,u),M.destroyNode(p)},readdir(i){var o=M.lookupPath(i,{follow:!0}),l=o.node,u=M.checkOpExists(l.node_ops.readdir,54);return u(l)},unlink(i){var o=M.lookupPath(i,{parent:!0}),l=o.node;if(!l)throw new M.ErrnoError(44);var u=A.basename(i),p=M.lookupNode(l,u),x=M.mayDelete(l,u,!1);if(x)throw new M.ErrnoError(x);if(!l.node_ops.unlink)throw new M.ErrnoError(63);if(M.isMountpoint(p))throw new M.ErrnoError(10);l.node_ops.unlink(l,u),M.destroyNode(p)},readlink(i){var o=M.lookupPath(i),l=o.node;if(!l)throw new M.ErrnoError(44);if(!l.node_ops.readlink)throw new M.ErrnoError(28);return l.node_ops.readlink(l)},stat(i,o){var l=M.lookupPath(i,{follow:!o}),u=l.node,p=M.checkOpExists(u.node_ops.getattr,63);return p(u)},fstat(i){var o=M.getStreamChecked(i),l=o.node,u=o.stream_ops.getattr,p=u?o:l;return u??=l.node_ops.getattr,M.checkOpExists(u,63),u(p)},lstat(i){return M.stat(i,!0)},doChmod(i,o,l,u){M.doSetAttr(i,o,{mode:l&4095|o.mode&-4096,ctime:Date.now(),dontFollow:u})},chmod(i,o,l){var u;if(typeof i=="string"){var p=M.lookupPath(i,{follow:!l});u=p.node}else u=i;M.doChmod(null,u,o,l)},lchmod(i,o){M.chmod(i,o,!0)},fchmod(i,o){var l=M.getStreamChecked(i);M.doChmod(l,l.node,o,!1)},doChown(i,o,l){M.doSetAttr(i,o,{timestamp:Date.now(),dontFollow:l})},chown(i,o,l,u){var p;if(typeof i=="string"){var x=M.lookupPath(i,{follow:!u});p=x.node}else p=i;M.doChown(null,p,u)},lchown(i,o,l){M.chown(i,o,l,!0)},fchown(i,o,l){var u=M.getStreamChecked(i);M.doChown(u,u.node,!1)},doTruncate(i,o,l){if(M.isDir(o.mode))throw new M.ErrnoError(31);if(!M.isFile(o.mode))throw new M.ErrnoError(28);var u=M.nodePermissions(o,"w");if(u)throw new M.ErrnoError(u);M.doSetAttr(i,o,{size:l,timestamp:Date.now()})},truncate(i,o){if(o<0)throw new M.ErrnoError(28);var l;if(typeof i=="string"){var u=M.lookupPath(i,{follow:!0});l=u.node}else l=i;M.doTruncate(null,l,o)},ftruncate(i,o){var l=M.getStreamChecked(i);if(o<0||(l.flags&2097155)===0)throw new M.ErrnoError(28);M.doTruncate(l,l.node,o)},utime(i,o,l){var u=M.lookupPath(i,{follow:!0}),p=u.node,x=M.checkOpExists(p.node_ops.setattr,63);x(p,{atime:o,mtime:l})},open(i,o,l=438){if(i==="")throw new M.ErrnoError(44);o=typeof o=="string"?Ft(o):o,o&64?l=l&4095|32768:l=0;var u,p;if(typeof i=="object")u=i;else{p=i.endsWith("/");var x=M.lookupPath(i,{follow:!(o&131072),noent_okay:!0});u=x.node,i=x.path}var T=!1;if(o&64)if(u){if(o&128)throw new M.ErrnoError(20)}else{if(p)throw new M.ErrnoError(31);u=M.mknod(i,l|511,0),T=!0}if(!u)throw new M.ErrnoError(44);if(M.isChrdev(u.mode)&&(o&=-513),o&65536&&!M.isDir(u.mode))throw new M.ErrnoError(54);if(!T){var w=M.mayOpen(u,o);if(w)throw new M.ErrnoError(w)}o&512&&!T&&M.truncate(u,0),o&=-131713;var N=M.createStream({node:u,path:M.getPath(u),flags:o,seekable:!0,position:0,stream_ops:u.stream_ops,ungotten:[],error:!1});return N.stream_ops.open&&N.stream_ops.open(N),T&&M.chmod(u,l&511),t.logReadFiles&&!(o&1)&&(i in M.readFiles||(M.readFiles[i]=1)),N},close(i){if(M.isClosed(i))throw new M.ErrnoError(8);i.getdents&&(i.getdents=null);try{i.stream_ops.close&&i.stream_ops.close(i)}catch(o){throw o}finally{M.closeStream(i.fd)}i.fd=null},isClosed(i){return i.fd===null},llseek(i,o,l){if(M.isClosed(i))throw new M.ErrnoError(8);if(!i.seekable||!i.stream_ops.llseek)throw new M.ErrnoError(70);if(l!=0&&l!=1&&l!=2)throw new M.ErrnoError(28);return i.position=i.stream_ops.llseek(i,o,l),i.ungotten=[],i.position},read(i,o,l,u,p){if(D(l>=0),u<0||p<0)throw new M.ErrnoError(28);if(M.isClosed(i))throw new M.ErrnoError(8);if((i.flags&2097155)===1)throw new M.ErrnoError(8);if(M.isDir(i.node.mode))throw new M.ErrnoError(31);if(!i.stream_ops.read)throw new M.ErrnoError(28);var x=typeof p<"u";if(!x)p=i.position;else if(!i.seekable)throw new M.ErrnoError(70);var T=i.stream_ops.read(i,o,l,u,p);return x||(i.position+=T),T},write(i,o,l,u,p,x){if(D(l>=0),u<0||p<0)throw new M.ErrnoError(28);if(M.isClosed(i))throw new M.ErrnoError(8);if((i.flags&2097155)===0)throw new M.ErrnoError(8);if(M.isDir(i.node.mode))throw new M.ErrnoError(31);if(!i.stream_ops.write)throw new M.ErrnoError(28);i.seekable&&i.flags&1024&&M.llseek(i,0,2);var T=typeof p<"u";if(!T)p=i.position;else if(!i.seekable)throw new M.ErrnoError(70);var w=i.stream_ops.write(i,o,l,u,p,x);return T||(i.position+=w),w},mmap(i,o,l,u,p){if((u&2)!==0&&(p&2)===0&&(i.flags&2097155)!==2)throw new M.ErrnoError(2);if((i.flags&2097155)===1)throw new M.ErrnoError(2);if(!i.stream_ops.mmap)throw new M.ErrnoError(43);if(!o)throw new M.ErrnoError(28);return i.stream_ops.mmap(i,o,l,u,p)},msync(i,o,l,u,p){return D(l>=0),i.stream_ops.msync?i.stream_ops.msync(i,o,l,u,p):0},ioctl(i,o,l){if(!i.stream_ops.ioctl)throw new M.ErrnoError(59);return i.stream_ops.ioctl(i,o,l)},readFile(i,o={}){if(o.flags=o.flags||0,o.encoding=o.encoding||"binary",o.encoding!=="utf8"&&o.encoding!=="binary")throw new Error(`Invalid encoding type "${o.encoding}"`);var l=M.open(i,o.flags),u=M.stat(i),p=u.size,x=new Uint8Array(p);return M.read(l,x,0,p,0),o.encoding==="utf8"&&(x=pt(x)),M.close(l),x},writeFile(i,o,l={}){l.flags=l.flags||577;var u=M.open(i,l.flags,l.mode);if(typeof o=="string"&&(o=new Uint8Array(Ne(o))),ArrayBuffer.isView(o))M.write(u,o,0,o.byteLength,void 0,l.canOwn);else throw new Error("Unsupported data type");M.close(u)},cwd:()=>M.currentPath,chdir(i){var o=M.lookupPath(i,{follow:!0});if(o.node===null)throw new M.ErrnoError(44);if(!M.isDir(o.node.mode))throw new M.ErrnoError(54);var l=M.nodePermissions(o.node,"x");if(l)throw new M.ErrnoError(l);M.currentPath=o.path},createDefaultDirectories(){M.mkdir("/tmp"),M.mkdir("/home"),M.mkdir("/home/web_user")},createDefaultDevices(){M.mkdir("/dev"),M.registerDevice(M.makedev(1,3),{read:()=>0,write:(u,p,x,T,w)=>T,llseek:()=>0}),M.mkdev("/dev/null",M.makedev(1,3)),Ge.register(M.makedev(5,0),Ge.default_tty_ops),Ge.register(M.makedev(6,0),Ge.default_tty1_ops),M.mkdev("/dev/tty",M.makedev(5,0)),M.mkdev("/dev/tty1",M.makedev(6,0));var i=new Uint8Array(1024),o=0,l=()=>(o===0&&(ne(i),o=i.byteLength),i[--o]);M.createDevice("/dev","random",l),M.createDevice("/dev","urandom",l),M.mkdir("/dev/shm"),M.mkdir("/dev/shm/tmp")},createSpecialDirectories(){M.mkdir("/proc");var i=M.mkdir("/proc/self");M.mkdir("/proc/self/fd"),M.mount({mount(){var o=M.createNode(i,"fd",16895,73);return o.stream_ops={llseek:ge.stream_ops.llseek},o.node_ops={lookup(l,u){var p=+u,x=M.getStreamChecked(p),T={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>x.path},id:p+1};return T.parent=T,T},readdir(){return Array.from(M.streams.entries()).filter(([l,u])=>u).map(([l,u])=>l.toString())}},o}},{},"/proc/self/fd")},createStandardStreams(i,o,l){i?M.createDevice("/dev","stdin",i):M.symlink("/dev/tty","/dev/stdin"),o?M.createDevice("/dev","stdout",null,o):M.symlink("/dev/tty","/dev/stdout"),l?M.createDevice("/dev","stderr",null,l):M.symlink("/dev/tty1","/dev/stderr");var u=M.open("/dev/stdin",0),p=M.open("/dev/stdout",1),x=M.open("/dev/stderr",1);D(u.fd===0,`invalid handle for stdin (${u.fd})`),D(p.fd===1,`invalid handle for stdout (${p.fd})`),D(x.fd===2,`invalid handle for stderr (${x.fd})`)},staticInit(){M.nameTable=new Array(4096),M.mount(ge,{},"/"),M.createDefaultDirectories(),M.createDefaultDevices(),M.createSpecialDirectories(),M.filesystems={MEMFS:ge}},init(i,o,l){D(!M.initialized,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"),M.initialized=!0,i??=t.stdin,o??=t.stdout,l??=t.stderr,M.createStandardStreams(i,o,l)},quit(){M.initialized=!1,ho(0);for(var i of M.streams)i&&M.close(i)},findObject(i,o){var l=M.analyzePath(i,o);return l.exists?l.object:null},analyzePath(i,o){try{var l=M.lookupPath(i,{follow:!o});i=l.path}catch{}var u={isRoot:!1,exists:!1,error:0,name:null,path:null,object:null,parentExists:!1,parentPath:null,parentObject:null};try{var l=M.lookupPath(i,{parent:!0});u.parentExists=!0,u.parentPath=l.path,u.parentObject=l.node,u.name=A.basename(i),l=M.lookupPath(i,{follow:!o}),u.exists=!0,u.path=l.path,u.object=l.node,u.name=l.node.name,u.isRoot=l.path==="/"}catch(p){u.error=p.errno}return u},createPath(i,o,l,u){i=typeof i=="string"?i:M.getPath(i);for(var p=o.split("/").reverse();p.length;){var x=p.pop();if(x){var T=A.join2(i,x);try{M.mkdir(T)}catch(w){if(w.errno!=20)throw w}i=T}}return T},createFile(i,o,l,u,p){var x=A.join2(typeof i=="string"?i:M.getPath(i),o),T=ut(u,p);return M.create(x,T)},createDataFile(i,o,l,u,p,x){var T=o;i&&(i=typeof i=="string"?i:M.getPath(i),T=o?A.join2(i,o):i);var w=ut(u,p),N=M.create(T,w);if(l){if(typeof l=="string"){for(var q=new Array(l.length),J=0,he=l.length;J<he;++J)q[J]=l.charCodeAt(J);l=q}M.chmod(N,w|146);var ue=M.open(N,577);M.write(ue,l,0,l.length,0,x),M.close(ue),M.chmod(N,w)}},createDevice(i,o,l,u){var p=A.join2(typeof i=="string"?i:M.getPath(i),o),x=ut(!!l,!!u);M.createDevice.major??=64;var T=M.makedev(M.createDevice.major++,0);return M.registerDevice(T,{open(w){w.seekable=!1},close(w){u?.buffer?.length&&u(10)},read(w,N,q,J,he){for(var ue=0,ae=0;ae<J;ae++){var pe;try{pe=l()}catch{throw new M.ErrnoError(29)}if(pe===void 0&&ue===0)throw new M.ErrnoError(6);if(pe==null)break;ue++,N[q+ae]=pe}return ue&&(w.node.atime=Date.now()),ue},write(w,N,q,J,he){for(var ue=0;ue<J;ue++)try{u(N[q+ue])}catch{throw new M.ErrnoError(29)}return J&&(w.node.mtime=w.node.ctime=Date.now()),ue}}),M.mkdev(p,x,T)},forceLoadFile(i){if(i.isDevice||i.isFolder||i.link||i.contents)return!0;if(typeof XMLHttpRequest<"u")throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");try{i.contents=R(i.url),i.usedBytes=i.contents.length}catch{throw new M.ErrnoError(29)}},createLazyFile(i,o,l,u,p){class x{lengthKnown=!1;chunks=[];get(ae){if(!(ae>this.length-1||ae<0)){var pe=ae%this.chunkSize,Xe=ae/this.chunkSize|0;return this.getter(Xe)[pe]}}setDataGetter(ae){this.getter=ae}cacheLength(){var ae=new XMLHttpRequest;if(ae.open("HEAD",l,!1),ae.send(null),!(ae.status>=200&&ae.status<300||ae.status===304))throw new Error("Couldn't load "+l+". Status: "+ae.status);var pe=Number(ae.getResponseHeader("Content-length")),Xe,dt=(Xe=ae.getResponseHeader("Accept-Ranges"))&&Xe==="bytes",ot=(Xe=ae.getResponseHeader("Content-Encoding"))&&Xe==="gzip",Pt=1024*1024;dt||(Pt=pe);var mt=(Gt,nn)=>{if(Gt>nn)throw new Error("invalid range ("+Gt+", "+nn+") or no bytes requested!");if(nn>pe-1)throw new Error("only "+pe+" bytes available! programmer error!");var Tt=new XMLHttpRequest;if(Tt.open("GET",l,!1),pe!==Pt&&Tt.setRequestHeader("Range","bytes="+Gt+"-"+nn),Tt.responseType="arraybuffer",Tt.overrideMimeType&&Tt.overrideMimeType("text/plain; charset=x-user-defined"),Tt.send(null),!(Tt.status>=200&&Tt.status<300||Tt.status===304))throw new Error("Couldn't load "+l+". Status: "+Tt.status);return Tt.response!==void 0?new Uint8Array(Tt.response||[]):Ne(Tt.responseText||"")},Jt=this;Jt.setDataGetter(Gt=>{var nn=Gt*Pt,Tt=(Gt+1)*Pt-1;if(Tt=Math.min(Tt,pe-1),typeof Jt.chunks[Gt]>"u"&&(Jt.chunks[Gt]=mt(nn,Tt)),typeof Jt.chunks[Gt]>"u")throw new Error("doXHR failed!");return Jt.chunks[Gt]}),(ot||!pe)&&(Pt=pe=1,pe=this.getter(0).length,Pt=pe,I("LazyFiles on gzip forces download of the whole file when length is accessed")),this._length=pe,this._chunkSize=Pt,this.lengthKnown=!0}get length(){return this.lengthKnown||this.cacheLength(),this._length}get chunkSize(){return this.lengthKnown||this.cacheLength(),this._chunkSize}}if(typeof XMLHttpRequest<"u"){if(!s)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var T=new x,w={isDevice:!1,contents:T}}else var w={isDevice:!1,url:l};var N=M.createFile(i,o,w,u,p);w.contents?N.contents=w.contents:w.url&&(N.contents=null,N.url=w.url),Object.defineProperties(N,{usedBytes:{get:function(){return this.contents.length}}});var q={},J=Object.keys(N.stream_ops);J.forEach(ue=>{var ae=N.stream_ops[ue];q[ue]=(...pe)=>(M.forceLoadFile(N),ae(...pe))});function he(ue,ae,pe,Xe,dt){var ot=ue.node.contents;if(dt>=ot.length)return 0;var Pt=Math.min(ot.length-dt,Xe);if(D(Pt>=0),ot.slice)for(var mt=0;mt<Pt;mt++)ae[pe+mt]=ot[dt+mt];else for(var mt=0;mt<Pt;mt++)ae[pe+mt]=ot.get(dt+mt);return Pt}return q.read=(ue,ae,pe,Xe,dt)=>(M.forceLoadFile(N),he(ue,ae,pe,Xe,dt)),q.mmap=(ue,ae,pe,Xe,dt)=>{M.forceLoadFile(N);var ot=qe();if(!ot)throw new M.ErrnoError(48);return he(ue,nt,ot,ae,pe),{ptr:ot,allocated:!0}},N.stream_ops=q,N},absolutePath(){$("FS.absolutePath has been removed; use PATH_FS.resolve instead")},createFolder(){$("FS.createFolder has been removed; use FS.mkdir instead")},createLink(){$("FS.createLink has been removed; use FS.symlink instead")},joinPath(){$("FS.joinPath has been removed; use PATH.join instead")},mmapAlloc(){$("FS.mmapAlloc has been replaced by the top level function mmapAlloc")},standardizePath(){$("FS.standardizePath has been removed; use PATH.normalize instead")}},yt={DEFAULT_POLLMASK:5,calculateAt(i,o,l){if(A.isAbs(o))return o;var u;if(i===-100)u=M.cwd();else{var p=yt.getStreamFromFD(i);u=p.path}if(o.length==0){if(!l)throw new M.ErrnoError(44);return u}return u+"/"+o},writeStat(i,o){oe[i>>2]=o.dev,oe[i+4>>2]=o.mode,Te[i+8>>2]=o.nlink,oe[i+12>>2]=o.uid,oe[i+16>>2]=o.gid,oe[i+20>>2]=o.rdev,Rt[i+24>>3]=BigInt(o.size),oe[i+32>>2]=4096,oe[i+36>>2]=o.blocks;var l=o.atime.getTime(),u=o.mtime.getTime(),p=o.ctime.getTime();return Rt[i+40>>3]=BigInt(Math.floor(l/1e3)),Te[i+48>>2]=l%1e3*1e3*1e3,Rt[i+56>>3]=BigInt(Math.floor(u/1e3)),Te[i+64>>2]=u%1e3*1e3*1e3,Rt[i+72>>3]=BigInt(Math.floor(p/1e3)),Te[i+80>>2]=p%1e3*1e3*1e3,Rt[i+88>>3]=BigInt(o.ino),0},writeStatFs(i,o){oe[i+4>>2]=o.bsize,oe[i+40>>2]=o.bsize,oe[i+8>>2]=o.blocks,oe[i+12>>2]=o.bfree,oe[i+16>>2]=o.bavail,oe[i+20>>2]=o.files,oe[i+24>>2]=o.ffree,oe[i+28>>2]=o.fsid,oe[i+44>>2]=o.flags,oe[i+36>>2]=o.namelen},doMsync(i,o,l,u,p){if(!M.isFile(o.node.mode))throw new M.ErrnoError(43);if(u&2)return 0;var x=et.slice(i,i+l);M.msync(o,x,p,l,u)},getStreamFromFD(i){var o=M.getStreamChecked(i);return o},varargs:void 0,getStr(i){var o=st(i);return o}};function It(i,o,l){try{var u=yt.getStreamFromFD(i);if(D(!l),u.fd===o)return-28;if(o<0||o>=M.MAX_OPEN_FDS)return-8;var p=M.getStream(o);return p&&M.close(p),M.dupStream(u,o).fd}catch(x){if(typeof M>"u"||x.name!=="ErrnoError")throw x;return-x.errno}}var Yt=()=>{D(yt.varargs!=null);var i=oe[+yt.varargs>>2];return yt.varargs+=4,i},zt=Yt;function Kt(i,o,l){yt.varargs=l;try{var u=yt.getStreamFromFD(i);switch(o){case 0:{var p=Yt();if(p<0)return-28;for(;M.streams[p];)p++;var x;return x=M.dupStream(u,p),x.fd}case 1:case 2:return 0;case 3:return u.flags;case 4:{var p=Yt();return u.flags|=p,0}case 12:{var p=zt(),T=0;return le[p+T>>1]=2,0}case 13:case 14:return 0}return-28}catch(w){if(typeof M>"u"||w.name!=="ErrnoError")throw w;return-w.errno}}function Zt(i,o){try{return yt.writeStat(o,M.fstat(i))}catch(l){if(typeof M>"u"||l.name!=="ErrnoError")throw l;return-l.errno}}function Er(i,o,l){yt.varargs=l;try{var u=yt.getStreamFromFD(i);switch(o){case 21509:return u.tty?0:-59;case 21505:{if(!u.tty)return-59;if(u.tty.ops.ioctl_tcgets){var p=u.tty.ops.ioctl_tcgets(u),x=zt();oe[x>>2]=p.c_iflag||0,oe[x+4>>2]=p.c_oflag||0,oe[x+8>>2]=p.c_cflag||0,oe[x+12>>2]=p.c_lflag||0;for(var T=0;T<32;T++)nt[x+T+17]=p.c_cc[T]||0;return 0}return 0}case 21510:case 21511:case 21512:return u.tty?0:-59;case 21506:case 21507:case 21508:{if(!u.tty)return-59;if(u.tty.ops.ioctl_tcsets){for(var x=zt(),w=oe[x>>2],N=oe[x+4>>2],q=oe[x+8>>2],J=oe[x+12>>2],he=[],T=0;T<32;T++)he.push(nt[x+T+17]);return u.tty.ops.ioctl_tcsets(u.tty,o,{c_iflag:w,c_oflag:N,c_cflag:q,c_lflag:J,c_cc:he})}return 0}case 21519:{if(!u.tty)return-59;var x=zt();return oe[x>>2]=0,0}case 21520:return u.tty?-28:-59;case 21531:{var x=zt();return M.ioctl(u,o,x)}case 21523:{if(!u.tty)return-59;if(u.tty.ops.ioctl_tiocgwinsz){var ue=u.tty.ops.ioctl_tiocgwinsz(u.tty),x=zt();le[x>>1]=ue[0],le[x+2>>1]=ue[1]}return 0}case 21524:return u.tty?0:-59;case 21515:return u.tty?0:-59;default:return-28}}catch(ae){if(typeof M>"u"||ae.name!=="ErrnoError")throw ae;return-ae.errno}}function Hn(i,o){try{return i=yt.getStr(i),yt.writeStat(o,M.lstat(i))}catch(l){if(typeof M>"u"||l.name!=="ErrnoError")throw l;return-l.errno}}function jh(i,o,l,u){try{o=yt.getStr(o);var p=u&256,x=u&4096;return u=u&-6401,D(!u,`unknown flags in __syscall_newfstatat: ${u}`),o=yt.calculateAt(i,o,x),yt.writeStat(l,p?M.lstat(o):M.stat(o))}catch(T){if(typeof M>"u"||T.name!=="ErrnoError")throw T;return-T.errno}}function $h(i,o,l,u){yt.varargs=u;try{o=yt.getStr(o),o=yt.calculateAt(i,o);var p=u?Yt():0;return M.open(o,l,p).fd}catch(x){if(typeof M>"u"||x.name!=="ErrnoError")throw x;return-x.errno}}function qh(i,o){try{return i=yt.getStr(i),yt.writeStat(o,M.stat(i))}catch(l){if(typeof M>"u"||l.name!=="ErrnoError")throw l;return-l.errno}}var Yh=()=>$("native code called abort()"),Ht=i=>{for(var o="";;){var l=et[i++];if(!l)return o;o+=String.fromCharCode(l)}},Hi={},mi={},$r={},Sr=class extends Error{constructor(o){super(o),this.name="BindingError"}},ft=i=>{throw new Sr(i)};function Kh(i,o,l={}){var u=o.name;if(i||ft(`type "${u}" must have a positive integer typeid pointer`),mi.hasOwnProperty(i)){if(l.ignoreDuplicateRegistrations)return;ft(`Cannot register type '${u}' twice`)}if(mi[i]=o,delete $r[i],Hi.hasOwnProperty(i)){var p=Hi[i];delete Hi[i],p.forEach(x=>x())}}function vn(i,o,l={}){if(o.argPackAdvance===void 0)throw new TypeError("registerType registeredInstance requires argPackAdvance");return Kh(i,o,l)}var ul=(i,o,l)=>{switch(o){case 1:return l?u=>nt[u]:u=>et[u];case 2:return l?u=>le[u>>1]:u=>de[u>>1];case 4:return l?u=>oe[u>>2]:u=>Te[u>>2];case 8:return l?u=>Rt[u>>3]:u=>B[u>>3];default:throw new TypeError(`invalid integer width (${o}): ${i}`)}},_i=i=>{if(i===null)return"null";var o=typeof i;return o==="object"||o==="array"||o==="function"?i.toString():""+i},dl=(i,o,l,u)=>{if(o<l||o>u)throw new TypeError(`Passing a number "${_i(o)}" from JS side to C/C++ side to an argument of type "${i}", which is outside the valid range [${l}, ${u}]!`)},Zh=(i,o,l,u,p)=>{o=Ht(o);const x=u===0n;let T=w=>w;if(x){const w=l*8;T=N=>BigInt.asUintN(w,N),p=T(p)}vn(i,{name:o,fromWireType:T,toWireType:(w,N)=>{if(typeof N=="number")N=BigInt(N);else if(typeof N!="bigint")throw new TypeError(`Cannot convert "${_i(N)}" to ${this.name}`);return dl(o,N,u,p),N},argPackAdvance:Cn,readValueFromPointer:ul(o,l,!x),destructorFunction:null})},Cn=8,Jh=(i,o,l,u)=>{o=Ht(o),vn(i,{name:o,fromWireType:function(p){return!!p},toWireType:function(p,x){return x?l:u},argPackAdvance:Cn,readValueFromPointer:function(p){return this.fromWireType(et[p])},destructorFunction:null})},Qh=i=>({count:i.count,deleteScheduled:i.deleteScheduled,preservePointerOnDelete:i.preservePointerOnDelete,ptr:i.ptr,ptrType:i.ptrType,smartPtr:i.smartPtr,smartPtrType:i.smartPtrType}),eo=i=>{function o(l){return l.$$.ptrType.registeredClass.name}ft(o(i)+" instance already deleted")},to=!1,fl=i=>{},eu=i=>{i.smartPtr?i.smartPtrType.rawDestructor(i.smartPtr):i.ptrType.registeredClass.rawDestructor(i.ptr)},pl=i=>{i.count.value-=1;var o=i.count.value===0;o&&eu(i)},ml=(i,o,l)=>{if(o===l)return i;if(l.baseClass===void 0)return null;var u=ml(i,o,l.baseClass);return u===null?null:l.downcast(u)},_l={},tu={},nu=(i,o)=>{for(o===void 0&&ft("ptr should not be undefined");i.baseClass;)o=i.upcast(o),i=i.baseClass;return o},iu=(i,o)=>(o=nu(i,o),tu[o]),ru=class extends Error{constructor(o){super(o),this.name="InternalError"}},qr=i=>{throw new ru(i)},Yr=(i,o)=>{(!o.ptrType||!o.ptr)&&qr("makeClassHandle requires ptr and ptrType");var l=!!o.smartPtrType,u=!!o.smartPtr;return l!==u&&qr("Both smartPtrType and smartPtr must be specified"),o.count={value:1},Mr(Object.create(i,{$$:{value:o,writable:!0}}))};function gl(i){var o=this.getPointee(i);if(!o)return this.destructor(i),null;var l=iu(this.registeredClass,o);if(l!==void 0){if(l.$$.count.value===0)return l.$$.ptr=o,l.$$.smartPtr=i,l.clone();var u=l.clone();return this.destructor(i),u}function p(){return this.isSmartPointer?Yr(this.registeredClass.instancePrototype,{ptrType:this.pointeeType,ptr:o,smartPtrType:this,smartPtr:i}):Yr(this.registeredClass.instancePrototype,{ptrType:this,ptr:i})}var x=this.registeredClass.getActualType(o),T=_l[x];if(!T)return p.call(this);var w;this.isConst?w=T.constPointerType:w=T.pointerType;var N=ml(o,this.registeredClass,w.registeredClass);return N===null?p.call(this):this.isSmartPointer?Yr(w.registeredClass.instancePrototype,{ptrType:w,ptr:N,smartPtrType:this,smartPtr:i}):Yr(w.registeredClass.instancePrototype,{ptrType:w,ptr:N})}var Mr=i=>typeof FinalizationRegistry>"u"?(Mr=o=>o,i):(to=new FinalizationRegistry(o=>{console.warn(o.leakWarning),pl(o.$$)}),Mr=o=>{var l=o.$$,u=!!l.smartPtr;if(u){var p={$$:l},x=l.ptrType.registeredClass,T=new Error(`Embind found a leaked C++ instance ${x.name} <${Le(l.ptr)}>.
We'll free it automatically in this case, but this functionality is not reliable across various environments.
Make sure to invoke .delete() manually once you're done with the instance instead.
Originally allocated`);"captureStackTrace"in Error&&Error.captureStackTrace(T,gl),p.leakWarning=T.stack.replace(/^Error: /,""),to.register(o,p,o)}return o},fl=o=>to.unregister(o),Mr(i)),su=()=>{let i=Kr.prototype;Object.assign(i,{isAliasOf(l){if(!(this instanceof Kr)||!(l instanceof Kr))return!1;var u=this.$$.ptrType.registeredClass,p=this.$$.ptr;l.$$=l.$$;for(var x=l.$$.ptrType.registeredClass,T=l.$$.ptr;u.baseClass;)p=u.upcast(p),u=u.baseClass;for(;x.baseClass;)T=x.upcast(T),x=x.baseClass;return u===x&&p===T},clone(){if(this.$$.ptr||eo(this),this.$$.preservePointerOnDelete)return this.$$.count.value+=1,this;var l=Mr(Object.create(Object.getPrototypeOf(this),{$$:{value:Qh(this.$$)}}));return l.$$.count.value+=1,l.$$.deleteScheduled=!1,l},delete(){this.$$.ptr||eo(this),this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete&&ft("Object already scheduled for deletion"),fl(this),pl(this.$$),this.$$.preservePointerOnDelete||(this.$$.smartPtr=void 0,this.$$.ptr=void 0)},isDeleted(){return!this.$$.ptr},deleteLater(){return this.$$.ptr||eo(this),this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete&&ft("Object already scheduled for deletion"),this.$$.deleteScheduled=!0,this}});const o=Symbol.dispose;o&&(i[o]=i.delete)};function Kr(){}var Zr=(i,o)=>Object.defineProperty(o,"name",{value:i}),no=(i,o,l)=>{if(i[o].overloadTable===void 0){var u=i[o];i[o]=function(...p){return i[o].overloadTable.hasOwnProperty(p.length)||ft(`Function '${l}' called with an invalid number of arguments (${p.length}) - expects one of (${i[o].overloadTable})!`),i[o].overloadTable[p.length].apply(this,p)},i[o].overloadTable=[],i[o].overloadTable[u.argCount]=u}},io=(i,o,l)=>{t.hasOwnProperty(i)?((l===void 0||t[i].overloadTable!==void 0&&t[i].overloadTable[l]!==void 0)&&ft(`Cannot register public name '${i}' twice`),no(t,i,i),t[i].overloadTable.hasOwnProperty(l)&&ft(`Cannot register multiple overloads of a function with the same number of arguments (${l})!`),t[i].overloadTable[l]=o):(t[i]=o,t[i].argCount=l)},ou=48,au=57,lu=i=>{D(typeof i=="string"),i=i.replace(/[^a-zA-Z0-9_]/g,"$");var o=i.charCodeAt(0);return o>=ou&&o<=au?`_${i}`:i};function cu(i,o,l,u,p,x,T,w){this.name=i,this.constructor=o,this.instancePrototype=l,this.rawDestructor=u,this.baseClass=p,this.getActualType=x,this.upcast=T,this.downcast=w,this.pureVirtualFunctions=[]}var Jr=(i,o,l)=>{for(;o!==l;)o.upcast||ft(`Expected null or instance of ${l.name}, got an instance of ${o.name}`),i=o.upcast(i),o=o.baseClass;return i};function hu(i,o){if(o===null)return this.isReference&&ft(`null is not a valid ${this.name}`),0;o.$$||ft(`Cannot pass "${_i(o)}" as a ${this.name}`),o.$$.ptr||ft(`Cannot pass deleted object as a pointer of type ${this.name}`);var l=o.$$.ptrType.registeredClass,u=Jr(o.$$.ptr,l,this.registeredClass);return u}function uu(i,o){var l;if(o===null)return this.isReference&&ft(`null is not a valid ${this.name}`),this.isSmartPointer?(l=this.rawConstructor(),i!==null&&i.push(this.rawDestructor,l),l):0;(!o||!o.$$)&&ft(`Cannot pass "${_i(o)}" as a ${this.name}`),o.$$.ptr||ft(`Cannot pass deleted object as a pointer of type ${this.name}`),!this.isConst&&o.$$.ptrType.isConst&&ft(`Cannot convert argument of type ${o.$$.smartPtrType?o.$$.smartPtrType.name:o.$$.ptrType.name} to parameter type ${this.name}`);var u=o.$$.ptrType.registeredClass;if(l=Jr(o.$$.ptr,u,this.registeredClass),this.isSmartPointer)switch(o.$$.smartPtr===void 0&&ft("Passing raw pointer to smart pointer is illegal"),this.sharingPolicy){case 0:o.$$.smartPtrType===this?l=o.$$.smartPtr:ft(`Cannot convert argument of type ${o.$$.smartPtrType?o.$$.smartPtrType.name:o.$$.ptrType.name} to parameter type ${this.name}`);break;case 1:l=o.$$.smartPtr;break;case 2:if(o.$$.smartPtrType===this)l=o.$$.smartPtr;else{var p=o.clone();l=this.rawShare(l,Vt.toHandle(()=>p.delete())),i!==null&&i.push(this.rawDestructor,l)}break;default:ft("Unsupporting sharing policy")}return l}function du(i,o){if(o===null)return this.isReference&&ft(`null is not a valid ${this.name}`),0;o.$$||ft(`Cannot pass "${_i(o)}" as a ${this.name}`),o.$$.ptr||ft(`Cannot pass deleted object as a pointer of type ${this.name}`),o.$$.ptrType.isConst&&ft(`Cannot convert argument of type ${o.$$.ptrType.name} to parameter type ${this.name}`);var l=o.$$.ptrType.registeredClass,u=Jr(o.$$.ptr,l,this.registeredClass);return u}function Qr(i){return this.fromWireType(Te[i>>2])}var fu=()=>{Object.assign(es.prototype,{getPointee(i){return this.rawGetPointee&&(i=this.rawGetPointee(i)),i},destructor(i){this.rawDestructor?.(i)},argPackAdvance:Cn,readValueFromPointer:Qr,fromWireType:gl})};function es(i,o,l,u,p,x,T,w,N,q,J){this.name=i,this.registeredClass=o,this.isReference=l,this.isConst=u,this.isSmartPointer=p,this.pointeeType=x,this.sharingPolicy=T,this.rawGetPointee=w,this.rawConstructor=N,this.rawShare=q,this.rawDestructor=J,!p&&o.baseClass===void 0?u?(this.toWireType=hu,this.destructorFunction=null):(this.toWireType=du,this.destructorFunction=null):this.toWireType=uu}var vl=(i,o,l)=>{t.hasOwnProperty(i)||qr("Replacing nonexistent public symbol"),t[i].overloadTable!==void 0&&l!==void 0?t[i].overloadTable[l]=o:(t[i]=o,t[i].argCount=l)},xl=[],ts,Ee=i=>{var o=xl[i];return o||(xl[i]=o=ts.get(i)),D(ts.get(i)==o,"JavaScript-side Wasm function table mirror is out of date!"),o},Pn=(i,o,l=!1)=>{D(!l,"Async bindings are only supported with JSPI."),i=Ht(i);function u(){var x=Ee(o);return x}var p=u();return typeof p!="function"&&ft(`unknown function pointer with signature ${i}: ${o}`),p};class pu extends Error{}var yl=i=>{var o=kl(i),l=Ht(o);return Ln(o),l},gi=(i,o)=>{var l=[],u={};function p(x){if(!u[x]&&!mi[x]){if($r[x]){$r[x].forEach(p);return}l.push(x),u[x]=!0}}throw o.forEach(p),new pu(`${i}: `+l.map(yl).join([", "]))},Sn=(i,o,l)=>{i.forEach(w=>$r[w]=o);function u(w){var N=l(w);N.length!==i.length&&qr("Mismatched type converter count");for(var q=0;q<i.length;++q)vn(i[q],N[q])}var p=new Array(o.length),x=[],T=0;o.forEach((w,N)=>{mi.hasOwnProperty(w)?p[N]=mi[w]:(x.push(w),Hi.hasOwnProperty(w)||(Hi[w]=[]),Hi[w].push(()=>{p[N]=mi[w],++T,T===x.length&&u(p)}))}),x.length===0&&u(p)},mu=(i,o,l,u,p,x,T,w,N,q,J,he,ue)=>{J=Ht(J),x=Pn(p,x),w&&=Pn(T,w),q&&=Pn(N,q),ue=Pn(he,ue);var ae=lu(J);io(ae,function(){gi(`Cannot construct ${J} due to unbound types`,[u])}),Sn([i,o,l],u?[u]:[],pe=>{pe=pe[0];var Xe,dt;u?(Xe=pe.registeredClass,dt=Xe.instancePrototype):dt=Kr.prototype;var ot=Zr(J,function(...Tt){if(Object.getPrototypeOf(this)!==Pt)throw new Sr(`Use 'new' to construct ${J}`);if(mt.constructor_body===void 0)throw new Sr(`${J} has no accessible constructor`);var yi=mt.constructor_body[Tt.length];if(yi===void 0)throw new Sr(`Tried to invoke ctor of ${J} with invalid number of parameters (${Tt.length}) - expected (${Object.keys(mt.constructor_body).toString()}) parameters instead!`);return yi.apply(this,Tt)}),Pt=Object.create(dt,{constructor:{value:ot}});ot.prototype=Pt;var mt=new cu(J,ot,Pt,ue,Xe,x,w,q);mt.baseClass&&(mt.baseClass.__derivedClasses??=[],mt.baseClass.__derivedClasses.push(mt));var Jt=new es(J,mt,!0,!1,!1),Gt=new es(J+"*",mt,!1,!1,!1),nn=new es(J+" const*",mt,!1,!0,!1);return _l[i]={pointerType:Gt,constPointerType:nn},vl(ae,ot),[Jt,Gt,nn]})},ro=i=>{for(;i.length;){var o=i.pop(),l=i.pop();l(o)}};function El(i){for(var o=1;o<i.length;++o)if(i[o]!==null&&i[o].destructorFunction===void 0)return!0;return!1}function _u(i,o,l,u,p){if(i<o||i>l){var x=o==l?o:`${o} to ${l}`;p(`function ${u} called with ${i} arguments, expected ${x}`)}}function gu(i,o,l,u){var p=El(i),x=i.length-2,T=[],w=["fn"];o&&w.push("thisWired");for(var N=0;N<x;++N)T.push(`arg${N}`),w.push(`arg${N}Wired`);T=T.join(","),w=w.join(",");var q=`return function (${T}) {
`;q+=`checkArgCount(arguments.length, minArgs, maxArgs, humanName, throwBindingError);
`,p&&(q+=`var destructors = [];
`);var J=p?"destructors":"null",he=["humanName","throwBindingError","invoker","fn","runDestructors","retType","classParam"];o&&(q+=`var thisWired = classParam['toWireType'](${J}, this);
`);for(var N=0;N<x;++N)q+=`var arg${N}Wired = argType${N}['toWireType'](${J}, arg${N});
`,he.push(`argType${N}`);if(q+=(l||u?"var rv = ":"")+`invoker(${w});
`,p)q+=`runDestructors(destructors);
`;else for(var N=o?1:2;N<i.length;++N){var ue=N===1?"thisWired":"arg"+(N-2)+"Wired";i[N].destructorFunction!==null&&(q+=`${ue}_dtor(${ue});
`,he.push(`${ue}_dtor`))}return l&&(q+=`var ret = retType['fromWireType'](rv);
return ret;
`),q+=`}
`,he.push("checkArgCount","minArgs","maxArgs"),q=`if (arguments.length !== ${he.length}){ throw new Error(humanName + "Expected ${he.length} closure arguments " + arguments.length + " given."); }
${q}`,[he,q]}function vu(i){for(var o=i.length-2,l=i.length-1;l>=2&&i[l].optional;--l)o--;return o}function ns(i,o,l,u,p,x){var T=o.length;T<2&&ft("argTypes array size mismatch! Must at least get return value and 'this' types!"),D(!x,"Async bindings are only supported with JSPI.");for(var w=o[1]!==null&&l!==null,N=El(o),q=o[0].name!=="void",J=T-2,he=vu(o),ue=[i,ft,u,p,ro,o[0],o[1]],ae=0;ae<T-2;++ae)ue.push(o[ae+2]);if(!N)for(var ae=w?1:2;ae<o.length;++ae)o[ae].destructorFunction!==null&&ue.push(o[ae].destructorFunction);ue.push(_u,he,J);let[pe,Xe]=gu(o,w,q,x);var dt=new Function(...pe,Xe)(...ue);return Zr(i,dt)}var is=(i,o)=>{for(var l=[],u=0;u<i;u++)l.push(Te[o+u*4>>2]);return l},so=i=>{i=i.trim();const o=i.indexOf("(");return o===-1?i:(D(i.endsWith(")"),"Parentheses for argument names should match."),i.slice(0,o))},xu=(i,o,l,u,p,x,T,w,N)=>{var q=is(l,u);o=Ht(o),o=so(o),x=Pn(p,x,w),Sn([],[i],J=>{J=J[0];var he=`${J.name}.${o}`;function ue(){gi(`Cannot call ${he} due to unbound types`,q)}o.startsWith("@@")&&(o=Symbol[o.substring(2)]);var ae=J.registeredClass.constructor;return ae[o]===void 0?(ue.argCount=l-1,ae[o]=ue):(no(ae,o,he),ae[o].overloadTable[l-1]=ue),Sn([],q,pe=>{var Xe=[pe[0],null].concat(pe.slice(1)),dt=ns(he,Xe,null,x,T,w);if(ae[o].overloadTable===void 0?(dt.argCount=l-1,ae[o]=dt):ae[o].overloadTable[l-1]=dt,J.registeredClass.__derivedClasses)for(const ot of J.registeredClass.__derivedClasses)ot.constructor.hasOwnProperty(o)||(ot.constructor[o]=dt);return[]}),[]})},yu=(i,o,l,u,p,x)=>{D(o>0);var T=is(o,l);p=Pn(u,p),Sn([],[i],w=>{w=w[0];var N=`constructor ${w.name}`;if(w.registeredClass.constructor_body===void 0&&(w.registeredClass.constructor_body=[]),w.registeredClass.constructor_body[o-1]!==void 0)throw new Sr(`Cannot register multiple constructors with identical number of parameters (${o-1}) for class '${w.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);return w.registeredClass.constructor_body[o-1]=()=>{gi(`Cannot construct ${w.name} due to unbound types`,T)},Sn([],T,q=>(q.splice(1,0,null),w.registeredClass.constructor_body[o-1]=ns(N,q,null,p,x),[])),[]})},Eu=(i,o,l,u,p,x,T,w,N,q)=>{var J=is(l,u);o=Ht(o),o=so(o),x=Pn(p,x,N),Sn([],[i],he=>{he=he[0];var ue=`${he.name}.${o}`;o.startsWith("@@")&&(o=Symbol[o.substring(2)]),w&&he.registeredClass.pureVirtualFunctions.push(o);function ae(){gi(`Cannot call ${ue} due to unbound types`,J)}var pe=he.registeredClass.instancePrototype,Xe=pe[o];return Xe===void 0||Xe.overloadTable===void 0&&Xe.className!==he.name&&Xe.argCount===l-2?(ae.argCount=l-2,ae.className=he.name,pe[o]=ae):(no(pe,o,ue),pe[o].overloadTable[l-2]=ae),Sn([],J,dt=>{var ot=ns(ue,dt,he,x,T,N);return pe[o].overloadTable===void 0?(ot.argCount=l-2,pe[o]=ot):pe[o].overloadTable[l-2]=ot,[]}),[]})},Sl=(i,o,l)=>(i instanceof Object||ft(`${l} with invalid "this": ${i}`),i instanceof o.registeredClass.constructor||ft(`${l} incompatible with "this" of type ${i.constructor.name}`),i.$$.ptr||ft(`cannot call emscripten binding method ${l} on deleted object`),Jr(i.$$.ptr,i.$$.ptrType.registeredClass,o.registeredClass)),Su=(i,o,l,u,p,x,T,w,N,q)=>{o=Ht(o),p=Pn(u,p),Sn([],[i],J=>{J=J[0];var he=`${J.name}.${o}`,ue={get(){gi(`Cannot access ${he} due to unbound types`,[l,T])},enumerable:!0,configurable:!0};return N?ue.set=()=>gi(`Cannot access ${he} due to unbound types`,[l,T]):ue.set=ae=>ft(he+" is a read-only property"),Object.defineProperty(J.registeredClass.instancePrototype,o,ue),Sn([],N?[l,T]:[l],ae=>{var pe=ae[0],Xe={get(){var ot=Sl(this,J,he+" getter");return pe.fromWireType(p(x,ot))},enumerable:!0};if(N){N=Pn(w,N);var dt=ae[1];Xe.set=function(ot){var Pt=Sl(this,J,he+" setter"),mt=[];N(q,Pt,dt.toWireType(mt,ot)),ro(mt)}}return Object.defineProperty(J.registeredClass.instancePrototype,o,Xe),[]}),[]})},Mu=(i,o,l)=>{i=Ht(i),Sn([],[o],u=>(u=u[0],t[i]=u.fromWireType(l),[]))},Ml=[],Dn=[0,1,,1,null,1,!0,1,!1,1],oo=i=>{i>9&&--Dn[i+1]===0&&(D(Dn[i]!==void 0,"Decref for unallocated handle."),Dn[i]=void 0,Ml.push(i))},Vt={toValue:i=>(i||ft(`Cannot use deleted val. handle = ${i}`),D(i===2||Dn[i]!==void 0&&i%2===0,`invalid handle: ${i}`),Dn[i]),toHandle:i=>{switch(i){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:{const o=Ml.pop()||Dn.length;return Dn[o]=i,Dn[o+1]=1,o}}}},Tl={name:"emscripten::val",fromWireType:i=>{var o=Vt.toValue(i);return oo(i),o},toWireType:(i,o)=>Vt.toHandle(o),argPackAdvance:Cn,readValueFromPointer:Qr,destructorFunction:null},wl=i=>vn(i,Tl),Tu=(i,o,l)=>{switch(o){case 1:return l?function(u){return this.fromWireType(nt[u])}:function(u){return this.fromWireType(et[u])};case 2:return l?function(u){return this.fromWireType(le[u>>1])}:function(u){return this.fromWireType(de[u>>1])};case 4:return l?function(u){return this.fromWireType(oe[u>>2])}:function(u){return this.fromWireType(Te[u>>2])};default:throw new TypeError(`invalid integer width (${o}): ${i}`)}},wu=(i,o,l,u)=>{o=Ht(o);function p(){}p.values={},vn(i,{name:o,constructor:p,fromWireType:function(x){return this.constructor.values[x]},toWireType:(x,T)=>T.value,argPackAdvance:Cn,readValueFromPointer:Tu(o,l,u),destructorFunction:null}),io(o,p)},rs=(i,o)=>{var l=mi[i];return l===void 0&&ft(`${o} has unknown type ${yl(i)}`),l},bu=(i,o,l)=>{var u=rs(i,"enum");o=Ht(o);var p=u.constructor,x=Object.create(u.constructor.prototype,{value:{value:l},constructor:{value:Zr(`${u.name}_${o}`,function(){})}});p.values[l]=x,p[o]=x},Au=(i,o)=>{switch(o){case 4:return function(l){return this.fromWireType(He[l>>2])};case 8:return function(l){return this.fromWireType(lt[l>>3])};default:throw new TypeError(`invalid float width (${o}): ${i}`)}},Ru=(i,o,l)=>{o=Ht(o),vn(i,{name:o,fromWireType:u=>u,toWireType:(u,p)=>{if(typeof p!="number"&&typeof p!="boolean")throw new TypeError(`Cannot convert ${_i(p)} to ${this.name}`);return p},argPackAdvance:Cn,readValueFromPointer:Au(o,l),destructorFunction:null})},Cu=(i,o,l,u,p,x,T,w)=>{var N=is(o,l);i=Ht(i),i=so(i),p=Pn(u,p,T),io(i,function(){gi(`Cannot call ${i} due to unbound types`,N)},o-1),Sn([],N,q=>{var J=[q[0],null].concat(q.slice(1));return vl(i,ns(i,J,null,p,x,T),o-1),[]})},Pu=(i,o,l,u,p)=>{o=Ht(o);const x=u===0;let T=N=>N;if(x){var w=32-8*l;T=N=>N<<w>>>w,p=T(p)}vn(i,{name:o,fromWireType:T,toWireType:(N,q)=>{if(typeof q!="number"&&typeof q!="boolean")throw new TypeError(`Cannot convert "${_i(q)}" to ${o}`);return dl(o,q,u,p),q},argPackAdvance:Cn,readValueFromPointer:ul(o,l,u!==0),destructorFunction:null})},Du=(i,o,l)=>{var u=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array],p=u[o];function x(T){var w=Te[T>>2],N=Te[T+4>>2];return new p(nt.buffer,N,w)}l=Ht(l),vn(i,{name:l,fromWireType:x,argPackAdvance:Cn,readValueFromPointer:x},{ignoreDuplicateRegistrations:!0})},Lu=Object.assign({optional:!0},Tl),Fu=(i,o)=>{vn(i,Lu)},vi=(i,o,l)=>(D(typeof l=="number","stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),Re(i,et,o,l)),Iu=(i,o)=>{o=Ht(o),vn(i,{name:o,fromWireType(l){for(var u=Te[l>>2],p=l+4,x,T,w=p,T=0;T<=u;++T){var N=p+T;if(T==u||et[N]==0){var q=N-w,J=st(w,q);x===void 0?x=J:(x+="\0",x+=J),w=N+1}}return Ln(l),x},toWireType(l,u){u instanceof ArrayBuffer&&(u=new Uint8Array(u));var p,x=typeof u=="string";x||ArrayBuffer.isView(u)&&u.BYTES_PER_ELEMENT==1||ft("Cannot pass non-string to std::string"),x?p=me(u):p=u.length;var T=co(4+p+1),w=T+4;return Te[T>>2]=p,x?vi(u,w,p+1):et.set(u,w),l!==null&&l.push(Ln,T),T},argPackAdvance:Cn,readValueFromPointer:Qr,destructorFunction(l){Ln(l)}})},bl=typeof TextDecoder<"u"?new TextDecoder("utf-16le"):void 0,Uu=(i,o)=>{D(i%2==0,"Pointer passed to UTF16ToString must be aligned to two bytes!");for(var l=i>>1,u=l+o/2,p=l;!(p>=u)&&de[p];)++p;if(p-l>16&&bl)return bl.decode(de.subarray(l,p));for(var x="",T=l;!(T>=u);++T){var w=de[T];if(w==0)break;x+=String.fromCharCode(w)}return x},Nu=(i,o,l)=>{if(D(o%2==0,"Pointer passed to stringToUTF16 must be aligned to two bytes!"),D(typeof l=="number","stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),l??=2147483647,l<2)return 0;l-=2;for(var u=o,p=l<i.length*2?l/2:i.length,x=0;x<p;++x){var T=i.charCodeAt(x);le[o>>1]=T,o+=2}return le[o>>1]=0,o-u},Ou=i=>i.length*2,Bu=(i,o)=>{D(i%4==0,"Pointer passed to UTF32ToString must be aligned to four bytes!");for(var l="",u=0;!(u>=o/4);u++){var p=oe[i+u*4>>2];if(!p)break;l+=String.fromCodePoint(p)}return l},ku=(i,o,l)=>{if(D(o%4==0,"Pointer passed to stringToUTF32 must be aligned to four bytes!"),D(typeof l=="number","stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),l??=2147483647,l<4)return 0;for(var u=o,p=u+l-4,x=0;x<i.length;++x){var T=i.codePointAt(x);if(T>65535&&x++,oe[o>>2]=T,o+=4,o+4>p)break}return oe[o>>2]=0,o-u},zu=i=>{for(var o=0,l=0;l<i.length;++l){var u=i.codePointAt(l);u>65535&&l++,o+=4}return o},Hu=(i,o,l)=>{l=Ht(l);var u,p,x,T;o===2?(u=Uu,p=Nu,T=Ou,x=w=>de[w>>1]):o===4&&(u=Bu,p=ku,T=zu,x=w=>Te[w>>2]),vn(i,{name:l,fromWireType:w=>{for(var N=Te[w>>2],q,J=w+4,he=0;he<=N;++he){var ue=w+4+he*o;if(he==N||x(ue)==0){var ae=ue-J,pe=u(J,ae);q===void 0?q=pe:(q+="\0",q+=pe),J=ue+o}}return Ln(w),q},toWireType:(w,N)=>{typeof N!="string"&&ft(`Cannot pass non-string to C++ string type ${l}`);var q=T(N),J=co(4+q+o);return Te[J>>2]=q/o,p(N,J+4,q+o),w!==null&&w.push(Ln,J),J},argPackAdvance:Cn,readValueFromPointer:Qr,destructorFunction(w){Ln(w)}})},Vu=(i,o)=>{wl(i)},Gu=(i,o)=>{o=Ht(o),vn(i,{isVoid:!0,name:o,argPackAdvance:0,fromWireType:()=>{},toWireType:(l,u)=>{}})},Wu=()=>{throw new k},Al=(i,o,l)=>{var u=[],p=i.toWireType(u,l);return u.length&&(Te[o>>2]=Vt.toHandle(u)),p},Xu=(i,o,l)=>(i=Vt.toValue(i),o=rs(o,"emval::as"),Al(o,l,i)),ss=[],ju=(i,o,l,u)=>(i=ss[i],o=Vt.toValue(o),i(null,o,l,u)),$u={},ao=i=>{var o=$u[i];return o===void 0?Ht(i):o},qu=(i,o,l,u,p)=>(i=ss[i],o=Vt.toValue(o),l=ao(l),i(o,o[l],u,p)),Rl=()=>globalThis,Yu=i=>i===0?Vt.toHandle(Rl()):(i=ao(i),Vt.toHandle(Rl()[i])),Ku=i=>{var o=ss.length;return ss.push(i),o},Zu=(i,o)=>{for(var l=new Array(i),u=0;u<i;++u)l[u]=rs(Te[o+u*4>>2],`parameter ${u}`);return l},Ju=(i,o,l)=>{var u=Zu(i,o),p=u.shift();i--;var x=`return function (obj, func, destructorsRef, args) {
`,T=0,w=[];l===0&&w.push("obj");for(var N=["retType"],q=[p],J=0;J<i;++J)w.push(`arg${J}`),N.push(`argType${J}`),q.push(u[J]),x+=`  var arg${J} = argType${J}.readValueFromPointer(args${T?"+"+T:""});
`,T+=u[J].argPackAdvance;var he=l===1?"new func":"func.call";x+=`  var rv = ${he}(${w.join(", ")});
`,p.isVoid||(N.push("emval_returnValue"),q.push(Al),x+=`  return emval_returnValue(retType, destructorsRef, rv);
`),x+=`};
`;var ue=new Function(...N,x)(...q),ae=`methodCaller<(${u.map(pe=>pe.name).join(", ")}) => ${p.name}>`;return Ku(Zr(ae,ue))},Qu=(i,o)=>(i=Vt.toValue(i),o=Vt.toValue(o),Vt.toHandle(i[o])),ed=i=>{i>9&&(Dn[i+1]+=1)},td=i=>(i=Vt.toValue(i),typeof i=="number"),nd=i=>(i=Vt.toValue(i),typeof i=="string"),id=()=>Vt.toHandle([]),rd=i=>Vt.toHandle(ao(i)),sd=i=>{var o=Vt.toValue(i);ro(o),oo(i)},od=(i,o)=>{i=rs(i,"_emval_take_value");var l=i.readValueFromPointer(o);return Vt.toHandle(l)},ad=i=>{throw i=Vt.toValue(i),i},ld=i=>i%4===0&&(i%100!==0||i%400===0),cd=[0,31,60,91,121,152,182,213,244,274,305,335],hd=[0,31,59,90,120,151,181,212,243,273,304,334],Cl=i=>{var o=ld(i.getFullYear()),l=o?cd:hd,u=l[i.getMonth()]+i.getDate()-1;return u},ud=9007199254740992,dd=-9007199254740992,Pl=i=>i<dd||i>ud?NaN:Number(i);function fd(i,o){i=Pl(i);var l=new Date(i*1e3);oe[o>>2]=l.getSeconds(),oe[o+4>>2]=l.getMinutes(),oe[o+8>>2]=l.getHours(),oe[o+12>>2]=l.getDate(),oe[o+16>>2]=l.getMonth(),oe[o+20>>2]=l.getFullYear()-1900,oe[o+24>>2]=l.getDay();var u=Cl(l)|0;oe[o+28>>2]=u,oe[o+36>>2]=-(l.getTimezoneOffset()*60);var p=new Date(l.getFullYear(),0,1),x=new Date(l.getFullYear(),6,1).getTimezoneOffset(),T=p.getTimezoneOffset(),w=(x!=T&&l.getTimezoneOffset()==Math.min(T,x))|0;oe[o+32>>2]=w}var pd=function(i){var o=(()=>{var l=new Date(oe[i+20>>2]+1900,oe[i+16>>2],oe[i+12>>2],oe[i+8>>2],oe[i+4>>2],oe[i>>2],0),u=oe[i+32>>2],p=l.getTimezoneOffset(),x=new Date(l.getFullYear(),0,1),T=new Date(l.getFullYear(),6,1).getTimezoneOffset(),w=x.getTimezoneOffset(),N=Math.min(w,T);if(u<0)oe[i+32>>2]=+(T!=w&&N==p);else if(u>0!=(N==p)){var q=Math.max(w,T),J=u>0?N:q;l.setTime(l.getTime()+(J-p)*6e4)}oe[i+24>>2]=l.getDay();var he=Cl(l)|0;oe[i+28>>2]=he,oe[i>>2]=l.getSeconds(),oe[i+4>>2]=l.getMinutes(),oe[i+8>>2]=l.getHours(),oe[i+12>>2]=l.getDate(),oe[i+16>>2]=l.getMonth(),oe[i+20>>2]=l.getYear();var ue=l.getTime();return isNaN(ue)?-1:ue/1e3})();return BigInt(o)},md=(i,o,l,u)=>{var p=new Date().getFullYear(),x=new Date(p,0,1),T=new Date(p,6,1),w=x.getTimezoneOffset(),N=T.getTimezoneOffset(),q=Math.max(w,N);Te[i>>2]=q*60,oe[o>>2]=+(w!=N);var J=ae=>{var pe=ae>=0?"-":"+",Xe=Math.abs(ae),dt=String(Math.floor(Xe/60)).padStart(2,"0"),ot=String(Xe%60).padStart(2,"0");return`UTC${pe}${dt}${ot}`},he=J(w),ue=J(N);D(he),D(ue),D(me(he)<=16,`timezone name truncated to fit in TZNAME_MAX (${he})`),D(me(ue)<=16,`timezone name truncated to fit in TZNAME_MAX (${ue})`),N<w?(vi(he,l,17),vi(ue,u,17)):(vi(he,u,17),vi(ue,l,17))},Dl=()=>performance.now(),Ll=()=>Date.now(),_d=i=>i>=0&&i<=3;function gd(i,o,l){if(!_d(i))return 28;var u;i===0?u=Ll():u=Dl();var p=Math.round(u*1e3*1e3);return Rt[l>>3]=BigInt(p),0}var os=[],vd=(i,o)=>{D(Array.isArray(os)),D(o%16==0),os.length=0;for(var l;l=et[i++];){var u=String.fromCharCode(l),p=["d","f","i","p"];p.push("j"),D(p.includes(u),`Invalid character ${l}("${u}") in readEmAsmArgs! Use only [${p}], and do not specify "v" for void return argument.`);var x=l!=105;x&=l!=112,o+=x&&o%8?4:0,os.push(l==112?Te[o>>2]:l==106?Rt[o>>3]:l==105?oe[o>>2]:lt[o>>3]),o+=x?8:4}return os},xd=(i,o,l)=>{var u=vd(o,l);return D(Bl.hasOwnProperty(i),`No EM_ASM constant found at address ${i}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`),Bl[i](...u)},yd=(i,o,l)=>xd(i,o,l),Fl=()=>2147483648,Ed=()=>Fl(),Sd=(i,o)=>(D(o,"alignment argument is required"),Math.ceil(i/o)*o),Md=i=>{var o=_t.buffer,l=(i-o.byteLength+65535)/65536|0;try{return _t.grow(l),Je(),1}catch(u){F(`growMemory: Attempted to grow heap from ${o.byteLength} bytes to ${i} bytes, but got error: ${u}`)}},Td=i=>{var o=et.length;i>>>=0,D(i>o);var l=Fl();if(i>l)return F(`Cannot enlarge memory, requested ${i} bytes, but the limit is ${l} bytes!`),!1;for(var u=1;u<=4;u*=2){var p=o*(1+.2/u);p=Math.min(p,i+100663296);var x=Math.min(l,Sd(Math.max(i,p),65536)),T=Md(x);if(T)return!0}return F(`Failed to grow the heap from ${o} bytes to ${x} bytes, not enough memory!`),!1},lo={},wd=()=>f||"./this.program",Tr=()=>{if(!Tr.strings){var i=(typeof navigator=="object"&&navigator.language||"C").replace("-","_")+".UTF-8",o={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:i,_:wd()};for(var l in lo)lo[l]===void 0?delete o[l]:o[l]=lo[l];var u=[];for(var l in o)u.push(`${l}=${o[l]}`);Tr.strings=u}return Tr.strings},bd=(i,o)=>{var l=0,u=0;for(var p of Tr()){var x=o+l;Te[i+u>>2]=x,l+=vi(p,x,1/0)+1,u+=4}return 0},Ad=(i,o)=>{var l=Tr();Te[i>>2]=l.length;var u=0;for(var p of l)u+=me(p)+1;return Te[o>>2]=u,0},Il=0,Ul=()=>be||Il>0,Rd=i=>{Ul()||(t.onExit?.(i),O=!0),d(i,new $e(i))},Cd=(i,o)=>{if(kp(),Ul()&&!o){var l=`program exited (with status: ${i}), but keepRuntimeAlive() is set (counter=${Il}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;je?.(l),F(l)}Rd(i)},Pd=Cd;function Dd(i){try{var o=yt.getStreamFromFD(i);return M.close(o),0}catch(l){if(typeof M>"u"||l.name!=="ErrnoError")throw l;return l.errno}}var Ld=(i,o,l,u)=>{for(var p=0,x=0;x<l;x++){var T=Te[o>>2],w=Te[o+4>>2];o+=8;var N=M.read(i,nt,T,w,u);if(N<0)return-1;if(p+=N,N<w)break}return p};function Fd(i,o,l,u){try{var p=yt.getStreamFromFD(i),x=Ld(p,o,l);return Te[u>>2]=x,0}catch(T){if(typeof M>"u"||T.name!=="ErrnoError")throw T;return T.errno}}function Id(i,o,l,u){o=Pl(o);try{if(isNaN(o))return 61;var p=yt.getStreamFromFD(i);return M.llseek(p,o,l),Rt[u>>3]=BigInt(p.position),p.getdents&&o===0&&l===0&&(p.getdents=null),0}catch(x){if(typeof M>"u"||x.name!=="ErrnoError")throw x;return x.errno}}var Ud=(i,o,l,u)=>{for(var p=0,x=0;x<l;x++){var T=Te[o>>2],w=Te[o+4>>2];o+=8;var N=M.write(i,nt,T,w,u);if(N<0)return-1;if(p+=N,N<w)break}return p};function Nd(i,o,l,u){try{var p=yt.getStreamFromFD(i),x=Ud(p,o,l);return Te[u>>2]=x,0}catch(T){if(typeof M>"u"||T.name!=="ErrnoError")throw T;return T.errno}}var Od=i=>i,Bd=i=>{var o=t["_"+i];return D(o,"Cannot call unknown function "+i+", make sure it is exported"),o},kd=(i,o)=>{D(i.length>=0,"writeArrayToMemory array must have a length (should be an array or typed array)"),nt.set(i,o)},as=i=>Wl(i),zd=i=>{var o=me(i)+1,l=as(o);return vi(i,l,o),l},Nl=(i,o,l,u,p)=>{var x={string:pe=>{var Xe=0;return pe!=null&&pe!==0&&(Xe=zd(pe)),Xe},array:pe=>{var Xe=as(pe.length);return kd(pe,Xe),Xe}};function T(pe){return o==="string"?st(pe):o==="boolean"?!!pe:pe}var w=Bd(i),N=[],q=0;if(D(o!=="array",'Return type should not be "array".'),u)for(var J=0;J<u.length;J++){var he=x[l[J]];he?(q===0&&(q=H()),N[J]=he(u[J])):N[J]=u[J]}var ue=w(...N);function ae(pe){return q!==0&&W(q),T(pe)}return ue=ae(ue),ue},Hd=(i,o,l,u)=>(...p)=>Nl(i,o,l,p),Vd=(...i)=>M.createPath(...i),Gd=(...i)=>M.unlink(...i),Wd=(...i)=>M.createLazyFile(...i),Xd=(...i)=>M.createDevice(...i),jd=i=>ls(i),$d=i=>fo(i),qd=i=>{var o=H(),l=as(4),u=as(4);jl(i,l,u);var p=Te[l>>2],x=Te[u>>2],T=st(p);Ln(p);var w;return x&&(w=st(x),Ln(x)),W(o),[T,w]},Ol=i=>qd(i);M.createPreloadedFile=We,M.staticInit(),su(),fu(),D(Dn.length===10),t.noExitRuntime&&(be=t.noExitRuntime),t.preloadPlugins&&(Mt=t.preloadPlugins),t.print&&(I=t.print),t.printErr&&(F=t.printErr),t.wasmBinary&&(L=t.wasmBinary),Zd(),t.arguments&&t.arguments,t.thisProgram&&(f=t.thisProgram),D(typeof t.memoryInitializerPrefixURL>"u","Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"),D(typeof t.pthreadMainPrefixURL>"u","Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"),D(typeof t.cdInitializerPrefixURL>"u","Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"),D(typeof t.filePackagePrefixURL>"u","Module.filePackagePrefixURL option was removed, use Module.locateFile instead"),D(typeof t.read>"u","Module.read option was removed"),D(typeof t.readAsync>"u","Module.readAsync option was removed (modify readAsync in JS)"),D(typeof t.readBinary>"u","Module.readBinary option was removed (modify readBinary in JS)"),D(typeof t.setWindowTitle>"u","Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)"),D(typeof t.TOTAL_MEMORY>"u","Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"),D(typeof t.ENVIRONMENT>"u","Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)"),D(typeof t.STACK_SIZE>"u","STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time"),D(typeof t.wasmMemory>"u","Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally"),D(typeof t.INITIAL_MEMORY>"u","Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically"),t.addRunDependency=U,t.removeRunDependency=b,t.ccall=Nl,t.cwrap=Hd,t.FS_createPreloadedFile=We,t.FS_unlink=Gd,t.FS_createPath=Vd,t.FS_createDevice=Xd,t.FS=M,t.FS_createDataFile=vt,t.FS_createLazyFile=Wd,t.MEMFS=ge;var Yd=["writeI53ToI64","writeI53ToI64Clamped","writeI53ToI64Signaling","writeI53ToU64Clamped","writeI53ToU64Signaling","readI53FromI64","readI53FromU64","convertI32PairToI53","convertI32PairToI53Checked","convertU32PairToI53","getTempRet0","zeroMemory","withStackSave","inetPton4","inetNtop4","inetPton6","inetNtop6","readSockaddr","writeSockaddr","emscriptenLog","runMainThreadEmAsm","jstoi_q","autoResumeAudioContext","getDynCaller","dynCall","handleException","runtimeKeepalivePush","runtimeKeepalivePop","callUserCallback","maybeExit","asmjsMangle","HandleAllocator","getNativeTypeSize","addOnInit","addOnPostCtor","addOnPreMain","addOnExit","STACK_SIZE","STACK_ALIGN","POINTER_SIZE","ASSERTIONS","uleb128Encode","sigToWasmTypes","generateFuncType","convertJsFunctionToWasm","getEmptyTableSlot","updateTableMap","getFunctionAddress","addFunction","removeFunction","reallyNegative","unSign","strLen","reSign","formatString","intArrayToString","stringToAscii","stringToNewUTF8","registerKeyEventCallback","maybeCStringToJsString","findEventTarget","getBoundingClientRect","fillMouseEventData","registerMouseEventCallback","registerWheelEventCallback","registerUiEventCallback","registerFocusEventCallback","fillDeviceOrientationEventData","registerDeviceOrientationEventCallback","fillDeviceMotionEventData","registerDeviceMotionEventCallback","screenOrientation","fillOrientationChangeEventData","registerOrientationChangeEventCallback","fillFullscreenChangeEventData","registerFullscreenChangeEventCallback","JSEvents_requestFullscreen","JSEvents_resizeCanvasForFullscreen","registerRestoreOldStyle","hideEverythingExceptGivenElement","restoreHiddenElements","setLetterbox","softFullscreenResizeWebGLRenderTarget","doRequestFullscreen","fillPointerlockChangeEventData","registerPointerlockChangeEventCallback","registerPointerlockErrorEventCallback","requestPointerLock","fillVisibilityChangeEventData","registerVisibilityChangeEventCallback","registerTouchEventCallback","fillGamepadEventData","registerGamepadEventCallback","registerBeforeUnloadEventCallback","fillBatteryEventData","battery","registerBatteryEventCallback","setCanvasElementSize","getCanvasElementSize","jsStackTrace","getCallstack","convertPCtoSourceLocation","wasiRightsToMuslOFlags","wasiOFlagsToMuslOFlags","safeSetTimeout","setImmediateWrapped","safeRequestAnimationFrame","clearImmediateWrapped","registerPostMainLoop","registerPreMainLoop","getPromise","makePromise","idsToPromises","makePromiseCallback","Browser_asyncPrepareDataCounter","arraySum","addDays","getSocketFromFD","getSocketAddress","FS_mkdirTree","_setNetworkCallback","heapObjectForWebGLType","toTypedArrayIndex","webgl_enable_ANGLE_instanced_arrays","webgl_enable_OES_vertex_array_object","webgl_enable_WEBGL_draw_buffers","webgl_enable_WEBGL_multi_draw","webgl_enable_EXT_polygon_offset_clamp","webgl_enable_EXT_clip_control","webgl_enable_WEBGL_polygon_mode","emscriptenWebGLGet","computeUnpackAlignedImageSize","colorChannelsInGlTextureFormat","emscriptenWebGLGetTexPixelData","emscriptenWebGLGetUniform","webglGetUniformLocation","webglPrepareUniformLocationsBeforeFirstUse","webglGetLeftBracePos","emscriptenWebGLGetVertexAttrib","__glGetActiveAttribOrUniform","writeGLArray","registerWebGlEventCallback","runAndAbortIfError","ALLOC_NORMAL","ALLOC_STACK","allocate","writeStringToMemory","writeAsciiToMemory","demangle","stackTrace","getFunctionArgsName","createJsInvokerSignature","PureVirtualError","registerInheritedInstance","unregisterInheritedInstance","getInheritedInstanceCount","getLiveInheritedInstances","setDelayFunction","count_emval_handles"];Yd.forEach(ye);var Kd=["run","out","err","callMain","abort","wasmMemory","wasmExports","HEAPF32","HEAPF64","HEAP8","HEAPU8","HEAP16","HEAPU16","HEAP32","HEAPU32","HEAP64","HEAPU64","writeStackCookie","checkStackCookie","INT53_MAX","INT53_MIN","bigintToI53Checked","stackSave","stackRestore","stackAlloc","setTempRet0","ptrToString","exitJS","getHeapMax","growMemory","ENV","ERRNO_CODES","strError","DNS","Protocols","Sockets","timers","warnOnce","readEmAsmArgsArray","readEmAsmArgs","runEmAsmFunction","getExecutableName","keepRuntimeAlive","asyncLoad","alignMemory","mmapAlloc","wasmTable","getUniqueRunDependency","noExitRuntime","addOnPreRun","addOnPostRun","freeTableIndexes","functionsInTableMap","setValue","getValue","PATH","PATH_FS","UTF8Decoder","UTF8ArrayToString","UTF8ToString","stringToUTF8Array","stringToUTF8","lengthBytesUTF8","intArrayFromString","AsciiToString","UTF16Decoder","UTF16ToString","stringToUTF16","lengthBytesUTF16","UTF32ToString","stringToUTF32","lengthBytesUTF32","stringToUTF8OnStack","writeArrayToMemory","JSEvents","specialHTMLTargets","findCanvasEventTarget","currentFullscreenStrategy","restoreOldWindowedStyle","UNWIND_CACHE","ExitStatus","getEnvStrings","checkWasiClock","doReadv","doWritev","initRandomFill","randomFill","emSetImmediate","emClearImmediate_deps","emClearImmediate","promiseMap","uncaughtExceptionCount","exceptionLast","exceptionCaught","ExceptionInfo","findMatchingCatch","getExceptionMessageCommon","Browser","requestFullscreen","requestFullScreen","setCanvasSize","getUserMedia","createContext","getPreloadedImageData__data","wget","MONTH_DAYS_REGULAR","MONTH_DAYS_LEAP","MONTH_DAYS_REGULAR_CUMULATIVE","MONTH_DAYS_LEAP_CUMULATIVE","isLeapYear","ydayFromDate","SYSCALLS","preloadPlugins","FS_modeStringToFlags","FS_getMode","FS_stdin_getChar_buffer","FS_stdin_getChar","FS_readFile","FS_root","FS_mounts","FS_devices","FS_streams","FS_nextInode","FS_nameTable","FS_currentPath","FS_initialized","FS_ignorePermissions","FS_filesystems","FS_syncFSRequests","FS_readFiles","FS_lookupPath","FS_getPath","FS_hashName","FS_hashAddNode","FS_hashRemoveNode","FS_lookupNode","FS_createNode","FS_destroyNode","FS_isRoot","FS_isMountpoint","FS_isFile","FS_isDir","FS_isLink","FS_isChrdev","FS_isBlkdev","FS_isFIFO","FS_isSocket","FS_flagsToPermissionString","FS_nodePermissions","FS_mayLookup","FS_mayCreate","FS_mayDelete","FS_mayOpen","FS_checkOpExists","FS_nextfd","FS_getStreamChecked","FS_getStream","FS_createStream","FS_closeStream","FS_dupStream","FS_doSetAttr","FS_chrdev_stream_ops","FS_major","FS_minor","FS_makedev","FS_registerDevice","FS_getDevice","FS_getMounts","FS_syncfs","FS_mount","FS_unmount","FS_lookup","FS_mknod","FS_statfs","FS_statfsStream","FS_statfsNode","FS_create","FS_mkdir","FS_mkdev","FS_symlink","FS_rename","FS_rmdir","FS_readdir","FS_readlink","FS_stat","FS_fstat","FS_lstat","FS_doChmod","FS_chmod","FS_lchmod","FS_fchmod","FS_doChown","FS_chown","FS_lchown","FS_fchown","FS_doTruncate","FS_truncate","FS_ftruncate","FS_utime","FS_open","FS_close","FS_isClosed","FS_llseek","FS_read","FS_write","FS_mmap","FS_msync","FS_ioctl","FS_writeFile","FS_cwd","FS_chdir","FS_createDefaultDirectories","FS_createDefaultDevices","FS_createSpecialDirectories","FS_createStandardStreams","FS_staticInit","FS_init","FS_quit","FS_findObject","FS_analyzePath","FS_createFile","FS_forceLoadFile","FS_absolutePath","FS_createFolder","FS_createLink","FS_joinPath","FS_mmapAlloc","FS_standardizePath","TTY","PIPEFS","SOCKFS","tempFixedLengthArray","miniTempWebGLFloatBuffers","miniTempWebGLIntBuffers","GL","AL","GLUT","EGL","GLEW","IDBStore","SDL","SDL_gfx","allocateUTF8","allocateUTF8OnStack","print","printErr","jstoi_s","InternalError","BindingError","throwInternalError","throwBindingError","registeredTypes","awaitingDependencies","typeDependencies","tupleRegistrations","structRegistrations","sharedRegisterType","whenDependentTypesAreResolved","getTypeName","getFunctionName","heap32VectorToArray","requireRegisteredType","usesDestructorStack","checkArgCount","getRequiredArgCount","createJsInvoker","UnboundTypeError","GenericWireTypeSize","EmValType","EmValOptionalType","throwUnboundTypeError","ensureOverloadTable","exposePublicSymbol","replacePublicSymbol","createNamedFunction","embindRepr","registeredInstances","getBasestPointer","getInheritedInstance","registeredPointers","registerType","integerReadValueFromPointer","enumReadValueFromPointer","floatReadValueFromPointer","assertIntegerRange","readPointer","runDestructors","craftInvokerFunction","embind__requireFunction","genericPointerToWireType","constNoSmartPtrRawPointerToWireType","nonConstNoSmartPtrRawPointerToWireType","init_RegisteredPointer","RegisteredPointer","RegisteredPointer_fromWireType","runDestructor","releaseClassHandle","finalizationRegistry","detachFinalizer_deps","detachFinalizer","attachFinalizer","makeClassHandle","init_ClassHandle","ClassHandle","throwInstanceAlreadyDeleted","deletionQueue","flushPendingDeletes","delayFunction","RegisteredClass","shallowCopyInternalPointer","downcastPointer","upcastPointer","validateThis","char_0","char_9","makeLegalFunctionName","emval_freelist","emval_handles","emval_symbols","getStringOrSymbol","Emval","emval_get_global","emval_returnValue","emval_lookupTypes","emval_methodCallers","emval_addMethodCaller"];Kd.forEach(ve),t.incrementExceptionRefcount=jd,t.decrementExceptionRefcount=$d,t.getExceptionMessage=Ol;function Zd(){ce("fetchSettings")}var Bl={626852:()=>{typeof t<"u"&&"mjDISABLESTRING mjENABLESTRING mjFRAMESTRING mjLABELSTRING mjRNDSTRING mjTIMERSTRING mjVISSTRING".split(" ").forEach(function(i){Object.defineProperty(t,i,{get:function(){return t["get_"+i]()},set:function(o){},enumerable:!0,configurable:!0})})}},kl=ee("___getTypeName"),co=ee("_malloc"),ho=ee("_fflush"),Ln=ee("_free"),uo=ee("_emscripten_stack_get_end"),zl=ee("_strerror"),xe=ee("_setThrew"),Hl=ee("__emscripten_tempret_set"),Vl=ee("_emscripten_stack_init"),Gl=ee("__emscripten_stack_restore"),Wl=ee("__emscripten_stack_alloc"),Xl=ee("_emscripten_stack_get_current"),fo=ee("___cxa_decrement_exception_refcount"),ls=ee("___cxa_increment_exception_refcount"),jl=ee("___get_exception_message"),$l=ee("___cxa_can_catch"),ql=ee("___cxa_get_exception_ptr");function Jd(i){kl=ie("__getTypeName",1),co=ie("malloc",1),ho=ie("fflush",1),Ln=ie("free",1),uo=i.emscripten_stack_get_end,i.emscripten_stack_get_base,zl=ie("strerror",1),xe=ie("setThrew",2),Hl=ie("_emscripten_tempret_set",1),Vl=i.emscripten_stack_init,i.emscripten_stack_get_free,Gl=i._emscripten_stack_restore,Wl=i._emscripten_stack_alloc,Xl=i.emscripten_stack_get_current,fo=ie("__cxa_decrement_exception_refcount",1),ls=ie("__cxa_increment_exception_refcount",1),jl=ie("__get_exception_message",3),$l=ie("__cxa_can_catch",3),ql=ie("__cxa_get_exception_ptr",1)}var Yl={__assert_fail:En,__cxa_begin_catch:Bn,__cxa_current_primary_exception:yr,__cxa_end_catch:Gr,__cxa_find_matching_catch_2:Wr,__cxa_find_matching_catch_3:Xr,__cxa_find_matching_catch_4:Ys,__cxa_rethrow:jr,__cxa_rethrow_primary_exception:Ks,__cxa_throw:Zs,__cxa_uncaught_exceptions:Js,__resumeException:Qs,__syscall_dup3:It,__syscall_fcntl64:Kt,__syscall_fstat64:Zt,__syscall_ioctl:Er,__syscall_lstat64:Hn,__syscall_newfstatat:jh,__syscall_openat:$h,__syscall_stat64:qh,_abort_js:Yh,_embind_register_bigint:Zh,_embind_register_bool:Jh,_embind_register_class:mu,_embind_register_class_class_function:xu,_embind_register_class_constructor:yu,_embind_register_class_function:Eu,_embind_register_class_property:Su,_embind_register_constant:Mu,_embind_register_emval:wl,_embind_register_enum:wu,_embind_register_enum_value:bu,_embind_register_float:Ru,_embind_register_function:Cu,_embind_register_integer:Pu,_embind_register_memory_view:Du,_embind_register_optional:Fu,_embind_register_std_string:Iu,_embind_register_std_wstring:Hu,_embind_register_user_type:Vu,_embind_register_void:Gu,_emscripten_throw_longjmp:Wu,_emval_as:Xu,_emval_call:ju,_emval_call_method:qu,_emval_decref:oo,_emval_get_global:Yu,_emval_get_method_caller:Ju,_emval_get_property:Qu,_emval_incref:ed,_emval_is_number:td,_emval_is_string:nd,_emval_new_array:id,_emval_new_cstring:rd,_emval_run_destructors:sd,_emval_take_value:od,_emval_throw:ad,_localtime_js:fd,_mktime_js:pd,_tzset_js:md,clock_time_get:gd,emscripten_asm_const_int:yd,emscripten_date_now:Ll,emscripten_get_heap_max:Ed,emscripten_get_now:Dl,emscripten_resize_heap:Td,environ_get:bd,environ_sizes_get:Ad,exit:Pd,fd_close:Dd,fd_read:Fd,fd_seek:Id,fd_write:Nd,invoke_ddd:yp,invoke_dddi:Hf,invoke_dddidi:Vf,invoke_ddidi:zf,invoke_di:Gf,invoke_dii:Df,invoke_diii:ff,invoke_diiii:kf,invoke_diiiidd:Of,invoke_diiiidi:_f,invoke_diiiii:lf,invoke_diiiiii:Sf,invoke_diiiiiii:Wf,invoke_diiiiiiiii:yf,invoke_diiiiiiiiiiii:Ef,invoke_fiii:Ip,invoke_i:cf,invoke_id:mp,invoke_ii:tf,invoke_iid:Jf,invoke_iidddd:bp,invoke_iidiiid:Rf,invoke_iif:wp,invoke_iii:Qd,invoke_iiid:Pf,invoke_iiididdddddd:Cf,invoke_iiidiiiiiiii:Af,invoke_iiii:sf,invoke_iiiidddiiiii:jf,invoke_iiiii:df,invoke_iiiiid:ap,invoke_iiiiii:ip,invoke_iiiiiii:ep,invoke_iiiiiiii:Zf,invoke_iiiiiiiidd:lp,invoke_iiiiiiiii:Nf,invoke_iiiiiiiiii:tp,invoke_iiiiiiiiiidddiiiiiiiii:bf,invoke_iiiiiiiiiii:Dp,invoke_iiiiiiiiiiii:Up,invoke_iiiiiiiiiiiii:Fp,invoke_iiij:np,invoke_iiji:op,invoke_j:Cp,invoke_ji:pp,invoke_jiiii:Lp,invoke_jij:fp,invoke_v:rf,invoke_vi:nf,invoke_vid:Qf,invoke_viddd:rp,invoke_vidddd:sp,invoke_vidi:Bf,invoke_vidiii:Tf,invoke_vif:Mp,invoke_vii:af,invoke_viid:If,invoke_viiddi:dp,invoke_viiddidi:up,invoke_viiddii:Xf,invoke_viidi:Ff,invoke_viidii:mf,invoke_viidiiid:Yf,invoke_viidiiiii:wf,invoke_viidiiiiiiii:Mf,invoke_viif:Op,invoke_viii:ef,invoke_viiid:vf,invoke_viiidd:hp,invoke_viiidi:Lf,invoke_viiididdddddd:Kf,invoke_viiidiiiiiiii:qf,invoke_viiii:uf,invoke_viiiiddd:cp,invoke_viiiidi:Ep,invoke_viiiifi:Sp,invoke_viiiii:of,invoke_viiiiid:gf,invoke_viiiiii:hf,invoke_viiiiiii:pf,invoke_viiiiiiii:Uf,invoke_viiiiiiiiii:vp,invoke_viiiiiiiiiidddiiiiiiiii:$f,invoke_viiiiiiiiiiid:xf,invoke_viiiiiiiiiiiii:gp,invoke_viiiiiiiiiiiiiii:Np,invoke_viiiiiiiiiiiiiiiiii:xp,invoke_viiiij:Ap,invoke_viij:Rp,invoke_viijii:Pp,invoke_vij:Tp,invoke_vijjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj:_p,llvm_eh_typeid_for:Od},xi=await De();function Qd(i,o,l){var u=H();try{return Ee(i)(o,l)}catch(p){if(W(u),!(p instanceof S))throw p;xe(1,0)}}function ef(i,o,l,u){var p=H();try{Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function tf(i,o){var l=H();try{return Ee(i)(o)}catch(u){if(W(l),!(u instanceof S))throw u;xe(1,0)}}function nf(i,o){var l=H();try{Ee(i)(o)}catch(u){if(W(l),!(u instanceof S))throw u;xe(1,0)}}function rf(i){var o=H();try{Ee(i)()}catch(l){if(W(o),!(l instanceof S))throw l;xe(1,0)}}function sf(i,o,l,u){var p=H();try{return Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function of(i,o,l,u,p,x){var T=H();try{Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function af(i,o,l){var u=H();try{Ee(i)(o,l)}catch(p){if(W(u),!(p instanceof S))throw p;xe(1,0)}}function lf(i,o,l,u,p,x){var T=H();try{return Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function cf(i){var o=H();try{return Ee(i)()}catch(l){if(W(o),!(l instanceof S))throw l;xe(1,0)}}function hf(i,o,l,u,p,x,T){var w=H();try{Ee(i)(o,l,u,p,x,T)}catch(N){if(W(w),!(N instanceof S))throw N;xe(1,0)}}function uf(i,o,l,u,p){var x=H();try{Ee(i)(o,l,u,p)}catch(T){if(W(x),!(T instanceof S))throw T;xe(1,0)}}function df(i,o,l,u,p){var x=H();try{return Ee(i)(o,l,u,p)}catch(T){if(W(x),!(T instanceof S))throw T;xe(1,0)}}function ff(i,o,l,u){var p=H();try{return Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function pf(i,o,l,u,p,x,T,w){var N=H();try{Ee(i)(o,l,u,p,x,T,w)}catch(q){if(W(N),!(q instanceof S))throw q;xe(1,0)}}function mf(i,o,l,u,p,x){var T=H();try{Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function _f(i,o,l,u,p,x,T){var w=H();try{return Ee(i)(o,l,u,p,x,T)}catch(N){if(W(w),!(N instanceof S))throw N;xe(1,0)}}function gf(i,o,l,u,p,x,T){var w=H();try{Ee(i)(o,l,u,p,x,T)}catch(N){if(W(w),!(N instanceof S))throw N;xe(1,0)}}function vf(i,o,l,u,p){var x=H();try{Ee(i)(o,l,u,p)}catch(T){if(W(x),!(T instanceof S))throw T;xe(1,0)}}function xf(i,o,l,u,p,x,T,w,N,q,J,he,ue){var ae=H();try{Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue)}catch(pe){if(W(ae),!(pe instanceof S))throw pe;xe(1,0)}}function yf(i,o,l,u,p,x,T,w,N,q){var J=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q)}catch(he){if(W(J),!(he instanceof S))throw he;xe(1,0)}}function Ef(i,o,l,u,p,x,T,w,N,q,J,he,ue){var ae=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue)}catch(pe){if(W(ae),!(pe instanceof S))throw pe;xe(1,0)}}function Sf(i,o,l,u,p,x,T){var w=H();try{return Ee(i)(o,l,u,p,x,T)}catch(N){if(W(w),!(N instanceof S))throw N;xe(1,0)}}function Mf(i,o,l,u,p,x,T,w,N,q,J,he){var ue=H();try{Ee(i)(o,l,u,p,x,T,w,N,q,J,he)}catch(ae){if(W(ue),!(ae instanceof S))throw ae;xe(1,0)}}function Tf(i,o,l,u,p,x){var T=H();try{Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function wf(i,o,l,u,p,x,T,w,N){var q=H();try{Ee(i)(o,l,u,p,x,T,w,N)}catch(J){if(W(q),!(J instanceof S))throw J;xe(1,0)}}function bf(i,o,l,u,p,x,T,w,N,q,J,he,ue,ae,pe,Xe,dt,ot,Pt,mt,Jt,Gt){var nn=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue,ae,pe,Xe,dt,ot,Pt,mt,Jt,Gt)}catch(Tt){if(W(nn),!(Tt instanceof S))throw Tt;xe(1,0)}}function Af(i,o,l,u,p,x,T,w,N,q,J,he){var ue=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q,J,he)}catch(ae){if(W(ue),!(ae instanceof S))throw ae;xe(1,0)}}function Rf(i,o,l,u,p,x,T){var w=H();try{return Ee(i)(o,l,u,p,x,T)}catch(N){if(W(w),!(N instanceof S))throw N;xe(1,0)}}function Cf(i,o,l,u,p,x,T,w,N,q,J,he){var ue=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q,J,he)}catch(ae){if(W(ue),!(ae instanceof S))throw ae;xe(1,0)}}function Pf(i,o,l,u){var p=H();try{return Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function Df(i,o,l){var u=H();try{return Ee(i)(o,l)}catch(p){if(W(u),!(p instanceof S))throw p;xe(1,0)}}function Lf(i,o,l,u,p,x){var T=H();try{Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function Ff(i,o,l,u,p){var x=H();try{Ee(i)(o,l,u,p)}catch(T){if(W(x),!(T instanceof S))throw T;xe(1,0)}}function If(i,o,l,u){var p=H();try{Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function Uf(i,o,l,u,p,x,T,w,N){var q=H();try{Ee(i)(o,l,u,p,x,T,w,N)}catch(J){if(W(q),!(J instanceof S))throw J;xe(1,0)}}function Nf(i,o,l,u,p,x,T,w,N){var q=H();try{return Ee(i)(o,l,u,p,x,T,w,N)}catch(J){if(W(q),!(J instanceof S))throw J;xe(1,0)}}function Of(i,o,l,u,p,x,T){var w=H();try{return Ee(i)(o,l,u,p,x,T)}catch(N){if(W(w),!(N instanceof S))throw N;xe(1,0)}}function Bf(i,o,l,u){var p=H();try{Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function kf(i,o,l,u,p){var x=H();try{return Ee(i)(o,l,u,p)}catch(T){if(W(x),!(T instanceof S))throw T;xe(1,0)}}function zf(i,o,l,u,p){var x=H();try{return Ee(i)(o,l,u,p)}catch(T){if(W(x),!(T instanceof S))throw T;xe(1,0)}}function Hf(i,o,l,u){var p=H();try{return Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function Vf(i,o,l,u,p,x){var T=H();try{return Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function Gf(i,o){var l=H();try{return Ee(i)(o)}catch(u){if(W(l),!(u instanceof S))throw u;xe(1,0)}}function Wf(i,o,l,u,p,x,T,w){var N=H();try{return Ee(i)(o,l,u,p,x,T,w)}catch(q){if(W(N),!(q instanceof S))throw q;xe(1,0)}}function Xf(i,o,l,u,p,x,T){var w=H();try{Ee(i)(o,l,u,p,x,T)}catch(N){if(W(w),!(N instanceof S))throw N;xe(1,0)}}function jf(i,o,l,u,p,x,T,w,N,q,J,he){var ue=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q,J,he)}catch(ae){if(W(ue),!(ae instanceof S))throw ae;xe(1,0)}}function $f(i,o,l,u,p,x,T,w,N,q,J,he,ue,ae,pe,Xe,dt,ot,Pt,mt,Jt,Gt,nn){var Tt=H();try{Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue,ae,pe,Xe,dt,ot,Pt,mt,Jt,Gt,nn)}catch(yi){if(W(Tt),!(yi instanceof S))throw yi;xe(1,0)}}function qf(i,o,l,u,p,x,T,w,N,q,J,he,ue){var ae=H();try{Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue)}catch(pe){if(W(ae),!(pe instanceof S))throw pe;xe(1,0)}}function Yf(i,o,l,u,p,x,T,w){var N=H();try{Ee(i)(o,l,u,p,x,T,w)}catch(q){if(W(N),!(q instanceof S))throw q;xe(1,0)}}function Kf(i,o,l,u,p,x,T,w,N,q,J,he,ue){var ae=H();try{Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue)}catch(pe){if(W(ae),!(pe instanceof S))throw pe;xe(1,0)}}function Zf(i,o,l,u,p,x,T,w){var N=H();try{return Ee(i)(o,l,u,p,x,T,w)}catch(q){if(W(N),!(q instanceof S))throw q;xe(1,0)}}function Jf(i,o,l){var u=H();try{return Ee(i)(o,l)}catch(p){if(W(u),!(p instanceof S))throw p;xe(1,0)}}function Qf(i,o,l){var u=H();try{Ee(i)(o,l)}catch(p){if(W(u),!(p instanceof S))throw p;xe(1,0)}}function ep(i,o,l,u,p,x,T){var w=H();try{return Ee(i)(o,l,u,p,x,T)}catch(N){if(W(w),!(N instanceof S))throw N;xe(1,0)}}function tp(i,o,l,u,p,x,T,w,N,q){var J=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q)}catch(he){if(W(J),!(he instanceof S))throw he;xe(1,0)}}function np(i,o,l,u){var p=H();try{return Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function ip(i,o,l,u,p,x){var T=H();try{return Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function rp(i,o,l,u,p){var x=H();try{Ee(i)(o,l,u,p)}catch(T){if(W(x),!(T instanceof S))throw T;xe(1,0)}}function sp(i,o,l,u,p,x){var T=H();try{Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function op(i,o,l,u){var p=H();try{return Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function ap(i,o,l,u,p,x){var T=H();try{return Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function lp(i,o,l,u,p,x,T,w,N,q){var J=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q)}catch(he){if(W(J),!(he instanceof S))throw he;xe(1,0)}}function cp(i,o,l,u,p,x,T,w){var N=H();try{Ee(i)(o,l,u,p,x,T,w)}catch(q){if(W(N),!(q instanceof S))throw q;xe(1,0)}}function hp(i,o,l,u,p,x){var T=H();try{Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function up(i,o,l,u,p,x,T,w){var N=H();try{Ee(i)(o,l,u,p,x,T,w)}catch(q){if(W(N),!(q instanceof S))throw q;xe(1,0)}}function dp(i,o,l,u,p,x){var T=H();try{Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function fp(i,o,l){var u=H();try{return Ee(i)(o,l)}catch(p){if(W(u),!(p instanceof S))throw p;return xe(1,0),0n}}function pp(i,o){var l=H();try{return Ee(i)(o)}catch(u){if(W(l),!(u instanceof S))throw u;return xe(1,0),0n}}function mp(i,o){var l=H();try{return Ee(i)(o)}catch(u){if(W(l),!(u instanceof S))throw u;xe(1,0)}}function _p(i,o,l,u,p,x,T,w,N,q,J,he,ue,ae,pe,Xe,dt,ot,Pt,mt,Jt,Gt,nn,Tt,yi,Hp,Vp,Gp,Wp,Xp,jp,$p,qp,Yp,Kp,Zp,Jp,Qp,em,tm,nm,im,rm,sm,om,am,lm,cm,hm,um,dm,fm,pm,mm,_m,gm,vm,xm,ym,Em,Sm,Mm,Tm,wm,bm,Am,Rm,Cm,Pm,Dm,Lm,Fm,Im,Um,Nm,Om,Bm,km,zm,Hm,Vm,Gm){var Wm=H();try{Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue,ae,pe,Xe,dt,ot,Pt,mt,Jt,Gt,nn,Tt,yi,Hp,Vp,Gp,Wp,Xp,jp,$p,qp,Yp,Kp,Zp,Jp,Qp,em,tm,nm,im,rm,sm,om,am,lm,cm,hm,um,dm,fm,pm,mm,_m,gm,vm,xm,ym,Em,Sm,Mm,Tm,wm,bm,Am,Rm,Cm,Pm,Dm,Lm,Fm,Im,Um,Nm,Om,Bm,km,zm,Hm,Vm,Gm)}catch(Zl){if(W(Wm),!(Zl instanceof S))throw Zl;xe(1,0)}}function gp(i,o,l,u,p,x,T,w,N,q,J,he,ue,ae){var pe=H();try{Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue,ae)}catch(Xe){if(W(pe),!(Xe instanceof S))throw Xe;xe(1,0)}}function vp(i,o,l,u,p,x,T,w,N,q,J){var he=H();try{Ee(i)(o,l,u,p,x,T,w,N,q,J)}catch(ue){if(W(he),!(ue instanceof S))throw ue;xe(1,0)}}function xp(i,o,l,u,p,x,T,w,N,q,J,he,ue,ae,pe,Xe,dt,ot,Pt){var mt=H();try{Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue,ae,pe,Xe,dt,ot,Pt)}catch(Jt){if(W(mt),!(Jt instanceof S))throw Jt;xe(1,0)}}function yp(i,o,l){var u=H();try{return Ee(i)(o,l)}catch(p){if(W(u),!(p instanceof S))throw p;xe(1,0)}}function Ep(i,o,l,u,p,x,T){var w=H();try{Ee(i)(o,l,u,p,x,T)}catch(N){if(W(w),!(N instanceof S))throw N;xe(1,0)}}function Sp(i,o,l,u,p,x,T){var w=H();try{Ee(i)(o,l,u,p,x,T)}catch(N){if(W(w),!(N instanceof S))throw N;xe(1,0)}}function Mp(i,o,l){var u=H();try{Ee(i)(o,l)}catch(p){if(W(u),!(p instanceof S))throw p;xe(1,0)}}function Tp(i,o,l){var u=H();try{Ee(i)(o,l)}catch(p){if(W(u),!(p instanceof S))throw p;xe(1,0)}}function wp(i,o,l){var u=H();try{return Ee(i)(o,l)}catch(p){if(W(u),!(p instanceof S))throw p;xe(1,0)}}function bp(i,o,l,u,p,x){var T=H();try{return Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function Ap(i,o,l,u,p,x){var T=H();try{Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function Rp(i,o,l,u){var p=H();try{Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function Cp(i){var o=H();try{return Ee(i)()}catch(l){if(W(o),!(l instanceof S))throw l;return xe(1,0),0n}}function Pp(i,o,l,u,p,x){var T=H();try{Ee(i)(o,l,u,p,x)}catch(w){if(W(T),!(w instanceof S))throw w;xe(1,0)}}function Dp(i,o,l,u,p,x,T,w,N,q,J){var he=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q,J)}catch(ue){if(W(he),!(ue instanceof S))throw ue;xe(1,0)}}function Lp(i,o,l,u,p){var x=H();try{return Ee(i)(o,l,u,p)}catch(T){if(W(x),!(T instanceof S))throw T;return xe(1,0),0n}}function Fp(i,o,l,u,p,x,T,w,N,q,J,he,ue){var ae=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue)}catch(pe){if(W(ae),!(pe instanceof S))throw pe;xe(1,0)}}function Ip(i,o,l,u){var p=H();try{return Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}function Up(i,o,l,u,p,x,T,w,N,q,J,he){var ue=H();try{return Ee(i)(o,l,u,p,x,T,w,N,q,J,he)}catch(ae){if(W(ue),!(ae instanceof S))throw ae;xe(1,0)}}function Np(i,o,l,u,p,x,T,w,N,q,J,he,ue,ae,pe,Xe){var dt=H();try{Ee(i)(o,l,u,p,x,T,w,N,q,J,he,ue,ae,pe,Xe)}catch(ot){if(W(dt),!(ot instanceof S))throw ot;xe(1,0)}}function Op(i,o,l,u){var p=H();try{Ee(i)(o,l,u)}catch(x){if(W(p),!(x instanceof S))throw x;xe(1,0)}}var Kl;function Bp(){Vl(),G()}function po(){if(Ie>0){Ke=po;return}if(Bp(),Ye(),Ie>0){Ke=po;return}function i(){D(!Kl),Kl=!0,t.calledRun=!0,!O&&(Oe(),Pe?.(t),t.onRuntimeInitialized?.(),Q("onRuntimeInitialized"),D(!t._main,'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'),Ct())}t.setStatus?(t.setStatus("Running..."),setTimeout(()=>{setTimeout(()=>t.setStatus(""),1),i()},1)):i(),P()}function kp(){var i=I,o=F,l=!1;I=F=u=>{l=!0};try{ho(0),["stdout","stderr"].forEach(u=>{var p=M.analyzePath("/dev/"+u);if(p){var x=p.object,T=x.rdev,w=Ge.ttys[T];w?.output?.length&&(l=!0)}})}catch{}I=i,F=o,l&&Fe("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.")}function zp(){if(t.preInit)for(typeof t.preInit=="function"&&(t.preInit=[t.preInit]);t.preInit.length>0;)t.preInit.shift()();Q("preInit")}zp(),po(),xt?e=t:e=new Promise((i,o)=>{Pe=i,je=o});for(const i of Object.keys(t))i in r||Object.defineProperty(r,i,{configurable:!0,get(){$(`Access to module property ('${i}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`)}});return e});const Ym=["left_hip_pitch_joint","left_hip_roll_joint","left_hip_yaw_joint","left_knee_joint","left_ankle_pitch_joint","left_ankle_roll_joint","right_hip_pitch_joint","right_hip_roll_joint","right_hip_yaw_joint","right_knee_joint","right_ankle_pitch_joint","right_ankle_roll_joint","waist_yaw_joint","waist_roll_joint","waist_pitch_joint","left_shoulder_pitch_joint","left_shoulder_roll_joint","left_shoulder_yaw_joint","left_elbow_joint","left_wrist_roll_joint","left_wrist_pitch_joint","left_wrist_yaw_joint","right_shoulder_pitch_joint","right_shoulder_roll_joint","right_shoulder_yaw_joint","right_elbow_joint","right_wrist_roll_joint","right_wrist_pitch_joint","right_wrist_yaw_joint"],hn=29,si=Float32Array.from([-.312,0,0,.669,-.363,0,-.312,0,0,.669,-.363,0,0,0,0,.2,.2,0,.6,0,0,0,.2,-.2,0,.6,0,0,0]);Float32Array.from([99.09842777666111,99.09842777666111,40.17923863450712,99.09842777666111,28.50124619574858,28.50124619574858,99.09842777666111,99.09842777666111,40.17923863450712,99.09842777666111,28.50124619574858,28.50124619574858,40.17923863450712,28.50124619574858,28.50124619574858,14.25062309787429,14.25062309787429,14.25062309787429,14.25062309787429,14.25062309787429,8.611032447370201,8.611032447370201,14.25062309787429,14.25062309787429,14.25062309787429,14.25062309787429,14.25062309787429,8.611032447370201,8.611032447370201]);Float32Array.from([6.308801853496639,6.308801853496639,2.557889775413375,6.308801853496639,1.814445686584846,1.814445686584846,6.308801853496639,6.308801853496639,2.557889775413375,6.308801853496639,1.814445686584846,1.814445686584846,2.557889775413375,1.814445686584846,1.814445686584846,.907222843292423,.907222843292423,.907222843292423,.907222843292423,.907222843292423,.548195351665136,.548195351665136,.907222843292423,.907222843292423,.907222843292423,.907222843292423,.907222843292423,.548195351665136,.548195351665136]);const Km=Float32Array.from([.35066146637882434,.35066146637882434,.5475464629911068,.35066146637882434,.43857731392336724,.43857731392336724,.35066146637882434,.35066146637882434,.5475464629911068,.35066146637882434,.43857731392336724,.43857731392336724,.5475464629911068,.43857731392336724,.43857731392336724,.43857731392336724,.43857731392336724,.43857731392336724,.43857731392336724,.43857731392336724,.2903252328080005,.2903252328080005,.43857731392336724,.43857731392336724,.43857731392336724,.43857731392336724,.43857731392336724,.2903252328080005,.2903252328080005]);Float32Array.from([.025101924999999997,.025101924999999997,.01017752004132231,.025101924999999997,.00721945,.00721945,.025101924999999997,.025101924999999997,.01017752004132231,.025101924999999997,.00721945,.00721945,.01017752004132231,.00721945,.00721945,.003609725,.003609725,.003609725,.003609725,.003609725,.0021812,.0021812,.003609725,.003609725,.003609725,.003609725,.003609725,.0021812,.0021812]);Float32Array.from([139,139,88,139,50,50,139,139,88,139,50,50,88,50,50,25,25,25,25,25,10,10,25,25,25,25,25,10,10]);const Ga=9,Wa=16,mo=.1,_o=5,Jo=[0,3,8,18],Zm=54,Jm="head_camera_single",Qm=.005,hh=4,Ei=Qm*hh,e_=4,qn=384,t_=[["base_ang_vel",3],["projected_gravity",3],["command",3],["joint_pos",29],["joint_vel",29],["actions",29]];function uh(r,e,t=new Float32Array(3)){const[n,s,a,c]=r,[h,f,d]=e,_=2*(a*d-c*f),g=2*(c*h-s*d),v=2*(s*f-a*h);return t[0]=h+n*_+(a*v-c*g),t[1]=f+n*g+(c*_-s*v),t[2]=d+n*v+(s*g-a*_),t}function n_(r,e,t=new Float32Array(3)){return uh([r[0],-r[1],-r[2],-r[3]],e,t)}function i_(r){const[e,t,n,s]=r,a=Math.atan2(2*(e*s+t*n),1-2*(n*n+s*s));return[Math.cos(a/2),0,0,Math.sin(a/2)]}function r_(r,e=new Float32Array(3)){return n_(r,[0,0,-1],e)}function Vi(r,e,t){return e+r()*(t-e)}function Ql(r){let e=0;for(;e===0;)e=r();return Math.sqrt(-2*Math.log(e))*Math.cos(2*Math.PI*r())}function s_(r){let e=r>>>0;return function(){e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}const o_="floating_base_joint",a_="ball_free",l_="ball_collision",c_="imu_ang_vel",h_="base_quat",u_=.78;class d_{constructor(e,t){this.mj=e,e.FS.mkdirTree("/work"),e.FS.writeFile("/work/scene.xml",t),this.model=e.MjModel.mj_loadXML("/work/scene.xml"),this.data=new e.MjData(this.model);const n=e.mjtObj,s=(h,f)=>{const d=e.mj_name2id(this.model,h.value,f);if(d<0)throw new Error(`model has no ${f}`);return d};this.jointQposAdr=new Int32Array(hn),this.jointDofAdr=new Int32Array(hn),Ym.forEach((h,f)=>{const d=s(n.mjOBJ_JOINT,h);this.jointQposAdr[f]=this.model.jnt_qposadr[d],this.jointDofAdr[f]=this.model.jnt_dofadr[d]});const a=s(n.mjOBJ_JOINT,o_);this.rootQposAdr=this.model.jnt_qposadr[a],this.rootDofAdr=this.model.jnt_dofadr[a];const c=s(n.mjOBJ_JOINT,a_);this.ballQposAdr=this.model.jnt_qposadr[c],this.ballDofAdr=this.model.jnt_dofadr[c],this.ballGeomId=s(n.mjOBJ_GEOM,l_),this.ballRadius=this.model.geom_size[3*this.ballGeomId],this.camId=s(n.mjOBJ_CAMERA,Jm),this.pelvisBodyId=s(n.mjOBJ_BODY,"pelvis"),this.gyroAdr=this.model.sensor_adr[s(n.mjOBJ_SENSOR,c_)],this.quatAdr=this.model.sensor_adr[s(n.mjOBJ_SENSOR,h_)],this.q=new Float32Array(hn),this.dq=new Float32Array(hn),this.angVel=new Float32Array(3),this.baseQuat=new Float32Array(4),this.projGrav=new Float32Array(3),this.camPos=new Float32Array(3),this.camMat=new Float32Array(9),this.ballPos=new Float32Array(3),this.ballVel=new Float32Array(3),this.rootPos=new Float32Array(3),this.rootVel=new Float32Array(3),this.stepId=0,this.reset()}reset(){const{mj:e,model:t,data:n}=this;e.mj_resetData(t,n);const s=n.qpos;s[this.rootQposAdr+0]=0,s[this.rootQposAdr+1]=0,s[this.rootQposAdr+2]=u_,s[this.rootQposAdr+3]=1,s[this.rootQposAdr+4]=0,s[this.rootQposAdr+5]=0,s[this.rootQposAdr+6]=0;for(let a=0;a<hn;a++)s[this.jointQposAdr[a]]=si[a],n.ctrl[a]=si[a];this.parkBall(),e.mj_forward(t,n),this.stepId=0}parkBall(){const{qpos:e,qvel:t}=this.data;e[this.ballQposAdr+0]=50,e[this.ballQposAdr+1]=0,e[this.ballQposAdr+2]=this.ballRadius,e[this.ballQposAdr+3]=1,e[this.ballQposAdr+4]=0,e[this.ballQposAdr+5]=0,e[this.ballQposAdr+6]=0;for(let n=0;n<6;n++)t[this.ballDofAdr+n]=0}setBallRadius(e){this.model.geom_size[3*this.ballGeomId]=e,this.ballRadius=e}throwBall(e,t){const{qpos:n,qvel:s}=this.data;n[this.ballQposAdr+0]=e[0],n[this.ballQposAdr+1]=e[1],n[this.ballQposAdr+2]=e[2],n[this.ballQposAdr+3]=1,n[this.ballQposAdr+4]=0,n[this.ballQposAdr+5]=0,n[this.ballQposAdr+6]=0,s[this.ballDofAdr+0]=t[0],s[this.ballDofAdr+1]=t[1],s[this.ballDofAdr+2]=t[2],s[this.ballDofAdr+3]=0,s[this.ballDofAdr+4]=0,s[this.ballDofAdr+5]=0}setTargets(e){const t=this.data.ctrl;for(let n=0;n<hn;n++)t[n]=e[n]}step(){const{mj:e,model:t,data:n}=this;for(let s=0;s<hh;s++)e.mj_step(t,n);this.stepId++}readState(){const{data:e}=this,{qpos:t,qvel:n,sensordata:s}=e;for(let a=0;a<3;a++)this.angVel[a]=s[this.gyroAdr+a];for(let a=0;a<4;a++)this.baseQuat[a]=s[this.quatAdr+a];r_(this.baseQuat,this.projGrav);for(let a=0;a<hn;a++)this.q[a]=t[this.jointQposAdr[a]],this.dq[a]=n[this.jointDofAdr[a]];for(let a=0;a<3;a++)this.rootPos[a]=t[this.rootQposAdr+a],this.rootVel[a]=n[this.rootDofAdr+a],this.ballPos[a]=t[this.ballQposAdr+a],this.ballVel[a]=n[this.ballDofAdr+a],this.camPos[a]=e.cam_xpos[3*this.camId+a];for(let a=0;a<9;a++)this.camMat[a]=e.cam_xmat[9*this.camId+a];return this}hasFallen(){return this.rootPos[2]<.4||this.projGrav[2]>-.4}bodyId(e){return this.mj.mj_name2id(this.model,this.mj.mjtObj.mjOBJ_BODY.value,e)}geomLocalPose(e){const t=this.model;return{pos:[t.geom_pos[3*e],t.geom_pos[3*e+1],t.geom_pos[3*e+2]],quat:[t.geom_quat[4*e],t.geom_quat[4*e+1],t.geom_quat[4*e+2],t.geom_quat[4*e+3]]}}describeGeoms(){const{model:e,mj:t}=this,n=t.mjtObj,s=[];for(let a=0;a<e.ngeom;a++)s.push({id:a,name:t.mj_id2name(e,n.mjOBJ_GEOM.value,a)||`geom${a}`,type:e.geom_type[a],bodyId:e.geom_bodyid[a],size:[e.geom_size[3*a],e.geom_size[3*a+1],e.geom_size[3*a+2]],rgba:[e.geom_rgba[4*a],e.geom_rgba[4*a+1],e.geom_rgba[4*a+2],e.geom_rgba[4*a+3]]});return s}}class f_{constructor(e=e_){if(this.L=e,this.terms=t_.map(([t,n])=>({name:t,dim:n})),this.dim=this.terms.reduce((t,n)=>t+n.dim,0)*this.L,this.dim!==qn)throw new Error(`proprio dim ${this.dim} != expected ${qn}`);this.buf=this.terms.map(t=>Array.from({length:this.L},()=>new Float32Array(t.dim))),this.head=this.L-1,this.out=new Float32Array(this.dim),this.reset()}reset(){for(const e of this.buf)for(const t of e)t.fill(0);this.head=this.L-1}append(e){if(e.length!==this.terms.length)throw new Error(`append expects ${this.terms.length} terms, got ${e.length}`);this.head=(this.head+1)%this.L;for(let t=0;t<this.terms.length;t++){const n=e[t];if(n.length!==this.terms[t].dim)throw new Error(`term ${this.terms[t].name}: got ${n.length} values, expected ${this.terms[t].dim}`);this.buf[t][this.head].set(n)}}vector(){let e=0;for(let t=0;t<this.terms.length;t++){const n=this.buf[t];for(let s=0;s<this.L;s++){const a=n[(this.head+1+s)%this.L];this.out.set(a,e),e+=a.length}}return this.out}}class p_{constructor(e,t){this.offsets=[...e].sort((n,s)=>n-s),this.L=Math.max(...this.offsets)+1,this.frameDim=t,this.buf=Array.from({length:this.L},()=>new Float32Array(t)),this.head=0,this.pendingReset=!0,this.out=new Float32Array(this.offsets.length*t)}reset(){this.pendingReset=!0}push(e){if(e.length!==this.frameDim)throw new Error(`depth frame ${e.length} != expected ${this.frameDim}`);if(this.pendingReset){for(const t of this.buf)t.set(e);this.head=0,this.pendingReset=!1}else this.head=(this.head+1)%this.L,this.buf[this.head].set(e);for(let t=0;t<this.offsets.length;t++){const n=this.offsets[t],s=((this.head-n)%this.L+this.L)%this.L;this.out.set(this.buf[s],t*this.frameDim)}return this.out}}function m_(r,e,t){const n=r.length+e.length;return(!t||t.length!==n)&&(t=new Float32Array(n)),t.set(r,0),t.set(e,r.length),t}const cr=Ga*Wa,__=3;function g_(r,e=Wa,t=Ga,n=!0,s=__){const a=Math.max(1,s|0),c=Math.tan(r*Math.PI/180/2),h=c*e/t,f=new Float32Array(e*t*a*a*3);let d=0;for(let _=0;_<t;_++)for(let g=0;g<e;g++)for(let v=0;v<a;v++)for(let E=0;E<a;E++){const R=g+(E+.5)/a,C=_+(v+.5)/a,y=2*R/e-1;let m=1-2*C/t;n||(m=-m);const I=y*h,F=m*c,L=-1,O=Math.hypot(I,F,L);f[d++]=I/O,f[d++]=F/O,f[d++]=L/O}return f.subsample=a,f}function v_(r,e,t,n,s,a){const c=cr;(!a||a.length!==c)&&(a=new Float32Array(c)),a.fill(1);const h=e[0]-n[0],f=e[1]-n[1],d=e[2]-n[2],_=h*h+f*f+d*d-s*s;if(Math.hypot(h,f,d)-s>_o)return a;const v=1/(_o-mo),E=t[0],R=t[1],C=t[2],y=t[3],m=t[4],I=t[5],F=t[6],L=t[7],O=t[8],D=(r.subsample??1)**2;let z=0;for(let G=0;G<c;G++){let P=1/0;for(let S=0;S<D;S++,z+=3){const k=r[z],K=r[z+1],Q=r[z+2],ee=E*k+R*K+C*Q,ce=y*k+m*K+I*Q,re=F*k+L*K+O*Q,_e=ee*h+ce*f+re*d,Z=_e*_e-_;if(Z<0)continue;const ye=Math.sqrt(Z);let ve=-_e-ye;ve<0&&(ve=-_e+ye),!(ve<0)&&ve<P&&(P=ve)}P===1/0||P<mo||P>=_o||(a[G]=(P-mo)*v)}return a}const x_={distRange:[2,3],heightRange:[1.5,2.3],angleDeg:25,flightTimeRange:[.58,.63],highThrowFraction:.5,highLaunchHeightRange:[.4,.9],highTargetZRange:[.9,1.1],aimNoiseScale:.1,leadTarget:!0,gravity:9.81};function y_(r,e,t,n,s={}){const a={...x_,...s},c=a.gravity,h=Vi(n,...a.distRange),f=Vi(n,-a.angleDeg,a.angleDeg)*Math.PI/180,d=h*Math.tan(f),_=i_(e),g=uh(_,[h,d,0]),v=s.forceHigh!==void 0&&s.forceHigh!==null?!!s.forceHigh:n()<a.highThrowFraction,E=r[0]+g[0],R=r[1]+g[1],C=v?Vi(n,...a.highLaunchHeightRange):Vi(n,...a.heightRange),y=Vi(n,...a.flightTimeRange),m=Math.sqrt(2*Math.max(C-.05,.001)/c),I=v?y:Math.min(y,m);let F=r[0],L=r[1];a.leadTarget&&(F+=t[0]*I,L+=t[1]*I),a.aimNoiseScale>0&&(F+=a.aimNoiseScale*Ql(n),L+=a.aimNoiseScale*Ql(n));const O=(F-E)/I,D=(L-R)/I,z=v?(Vi(n,...a.highTargetZRange)-C)/I+.5*c*I:0;return{pos:[E,R,C],vel:[O,D,z],high:v,tFlight:I}}const oi={DODGE:0,WALK:1},go=new Float32Array(3),E_={liveHeight:.15,threatRange:4,holdSeconds:1.2,blendTicks:25,randomizeBallRadius:!0,ballRadiusRange:[.075,.125]};class S_{constructor(e,t,n={}){this.sim=e,this.policies=t,this.cfg={...E_,...n},this.rng=s_(n.seed??12345),this.rays=g_(Zm,void 0,void 0,n.rowZeroIsTop??!0,n.subsample),this.proprio=new f_,this.ring=new p_(Jo,cr),this.frameBuf=new Float32Array(cr),this.obsBuf=new Float32Array(qn+Jo.length*cr),this.jointPosRel=new Float32Array(hn),this.lastAction=new Float32Array(hn),this.target=new Float32Array(hn),this.lastTarget=Float32Array.from(si),this.blendFrom=Float32Array.from(si),this.blendI=this.cfg.blendTicks,this.mode=oi.WALK,this.threatTicks=0,this.lastThrow=null,this.ticks=0,this.forceMode=n.forceMode??null}resetBelief(){this.proprio.reset(),this.ring.reset(),this.lastAction.fill(0),this.lastTarget.set(si),this.blendFrom.set(si),this.blendI=this.cfg.blendTicks,this.mode=oi.WALK,this.threatTicks=0,this.ticks=0}isThreat(e){if(e.ballPos[2]<=this.cfg.liveHeight)return!1;const t=e.ballPos[0]-e.rootPos[0],n=e.ballPos[1]-e.rootPos[1];if(Math.hypot(t,n)>this.cfg.threatRange)return!1;const s=e.ballVel[0]-e.rootVel[0],a=e.ballVel[1]-e.rootVel[1];return t*s+n*a<0}throwNow(e=void 0){const t=this.sim.readState();if(this.cfg.randomizeBallRadius){const[s,a]=this.cfg.ballRadiusRange;this.sim.setBallRadius(s+this.rng()*(a-s))}const n=y_(t.rootPos,t.baseQuat,t.rootVel,this.rng,{forceHigh:e});return this.sim.throwBall(n.pos,n.vel),this.lastThrow=n,n}async tick(e=go){const t=this.sim.readState(),n=v_(this.rays,t.camPos,t.camMat,t.ballPos,t.ballRadius,this.frameBuf),s=this.ring.push(n);this.isThreat(t)?this.threatTicks=Math.round(this.cfg.holdSeconds*50):this.threatTicks>0&&this.threatTicks--;const a=this.forceMode!==null&&this.forceMode!==void 0?this.forceMode:this.threatTicks>0?oi.DODGE:oi.WALK;a!==this.mode&&(this.blendFrom.set(this.lastTarget),this.blendI=0,this.mode=a);const c=this.mode===oi.WALK?e??go:go;for(let d=0;d<hn;d++)this.jointPosRel[d]=t.q[d]-si[d];this.proprio.append([t.angVel,t.projGrav,c,this.jointPosRel,t.dq,this.lastAction]);const h=this.proprio.vector();let f;this.mode===oi.WALK?f=await this.policies.runWalk(h):f=await this.policies.runDodge(m_(h,s,this.obsBuf)),this.lastAction.set(f.subarray?f.subarray(0,hn):f);for(let d=0;d<hn;d++)this.target[d]=si[d]+this.lastAction[d]*Km[d];if(this.blendI<this.cfg.blendTicks){this.blendI++;const d=this.blendI/this.cfg.blendTicks;for(let _=0;_<hn;_++)this.target[_]=(1-d)*this.blendFrom[_]+d*this.target[_]}return this.lastTarget.set(this.target),this.sim.setTargets(this.target),this.sim.step(),this.ticks++,this}}async function ec(r,e){const t=async(a,c)=>{const h=await fetch(a);if(!h.ok)throw new Error(`failed to fetch ${a}: ${h.status} ${h.statusText}`);return c==="json"?h.json():h.arrayBuffer()},[n,s]=await Promise.all([t(r,"json"),t(e,"bin")]);return M_(n,s)}function M_(r,e){const{inputDim:t,outputDim:n,eluAlpha:s,tensors:a}=r;if(!Array.isArray(a)||a.length===0)throw new Error("weights manifest has no tensors[]");if(!Number.isFinite(t)||!Number.isFinite(n))throw new Error("weights manifest is missing inputDim/outputDim");if(!Number.isFinite(s))throw new Error("weights manifest is missing eluAlpha");if(!(e instanceof ArrayBuffer))throw new Error("createMlp needs an ArrayBuffer (got "+typeof e+")");const c=y=>{const m=(y.offset+y.count)*4;if(m>e.byteLength)throw new Error(`tensor "${y.name}" ends at byte ${m} but the weight blob is ${e.byteLength} bytes -- manifest and .bin are out of sync`);return new Float32Array(e,y.offset*4,y.count)},h=y=>{const m=a.filter(I=>I.role===y);if(m.length!==1)throw new Error(`expected exactly one "${y}" tensor, found ${m.length}`);return c(m[0])},f=h("mean"),d=h("std");if(f.length!==t||d.length!==t)throw new Error(`normalizer is ${f.length}/${d.length} wide, inputDim is ${t}`);const _=[];for(const y of a){if(y.role!=="weight"&&y.role!=="bias")continue;if(!Number.isInteger(y.layer))throw new Error(`tensor "${y.name}" has no layer index`);const m=_[y.layer]??={};if(y.role==="weight"){if(y.shape.length!==2)throw new Error(`weight "${y.name}" is not 2-D`);m.w=c(y),m.outDim=y.shape[0],m.inDim=y.shape[1]}else m.b=c(y)}if(_.length===0)throw new Error("weights manifest has no layers");let g=t;if(_.forEach((y,m)=>{if(!y.w||!y.b)throw new Error(`layer ${m} is missing its weight or bias`);if(y.inDim!==g)throw new Error(`layer ${m} takes ${y.inDim} inputs, previous stage emits ${g}`);if(y.b.length!==y.outDim)throw new Error(`layer ${m} bias is ${y.b.length} wide, weight says ${y.outDim}`);g=y.outDim}),g!==n)throw new Error(`last layer emits ${g}, manifest says ${n}`);const v=new Float32Array(t),E=_.map(y=>new Float32Array(y.outDim)),R=_.length-1;function C(y){if(y.length!==t)throw new Error(`obs has ${y.length} values, this policy expects ${t}`);for(let I=0;I<t;I++)v[I]=(y[I]-f[I])/d[I];let m=v;for(let I=0;I<=R;I++){const{w:F,b:L,inDim:O,outDim:D}=_[I],z=E[I];for(let G=0;G<D;G++){const P=G*O;let S=L[G];for(let k=0;k<O;k++)S+=F[P+k]*m[k];z[G]=S}if(I!==R)for(let G=0;G<D;G++){const P=z[G];P<=0&&(z[G]=s*(Math.exp(P)-1))}m=z}return m}return{inputDim:t,outputDim:n,run:C}}const Xa="180",hr={ROTATE:0,DOLLY:1,PAN:2},sr={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},T_=0,tc=1,w_=2,dh=1,fh=2,$n=3,ui=0,on=1,Yn=2,ci=0,ur=1,nc=2,ic=3,rc=4,b_=5,Pi=100,A_=101,R_=102,C_=103,P_=104,D_=200,L_=201,F_=202,I_=203,Qo=204,ea=205,U_=206,N_=207,O_=208,B_=209,k_=210,z_=211,H_=212,V_=213,G_=214,ta=0,na=1,ia=2,fr=3,ra=4,sa=5,oa=6,aa=7,ja=0,W_=1,X_=2,hi=0,j_=1,$_=2,q_=3,ph=4,Y_=5,K_=6,Z_=7,mh=300,pr=301,mr=302,la=303,ca=304,$s=306,ha=1e3,Li=1001,ua=1002,_n=1003,J_=1004,cs=1005,In=1006,vo=1007,Fi=1008,On=1009,_h=1010,gh=1011,Ur=1012,$a=1013,Ii=1014,Un=1015,zr=1016,qa=1017,Ya=1018,Nr=1020,vh=35902,xh=35899,yh=1021,Eh=1022,An=1023,Or=1026,Br=1027,Ka=1028,Za=1029,Sh=1030,Ja=1031,Qa=1033,Us=33776,Ns=33777,Os=33778,Bs=33779,da=35840,fa=35841,pa=35842,ma=35843,_a=36196,ga=37492,va=37496,xa=37808,ya=37809,Ea=37810,Sa=37811,Ma=37812,Ta=37813,wa=37814,ba=37815,Aa=37816,Ra=37817,Ca=37818,Pa=37819,Da=37820,La=37821,Fa=36492,Ia=36494,Ua=36495,Na=36283,Oa=36284,Ba=36285,ka=36286,Q_=3200,eg=3201,el=0,tg=1,li="",yn="srgb",_r="srgb-linear",Hs="linear",wt="srgb",Gi=7680,sc=519,ng=512,ig=513,rg=514,Mh=515,sg=516,og=517,ag=518,lg=519,oc=35044,ac="300 es",Nn=2e3,Vs=2001;class Oi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const a=s.indexOf(t);a!==-1&&s.splice(a,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let a=0,c=s.length;a<c;a++)s[a].call(this,e);e.target=null}}}const Qt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ks=Math.PI/180,za=180/Math.PI;function Hr(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Qt[r&255]+Qt[r>>8&255]+Qt[r>>16&255]+Qt[r>>24&255]+"-"+Qt[e&255]+Qt[e>>8&255]+"-"+Qt[e>>16&15|64]+Qt[e>>24&255]+"-"+Qt[t&63|128]+Qt[t>>8&255]+"-"+Qt[t>>16&255]+Qt[t>>24&255]+Qt[n&255]+Qt[n>>8&255]+Qt[n>>16&255]+Qt[n>>24&255]).toLowerCase()}function ht(r,e,t){return Math.max(e,Math.min(t,r))}function cg(r,e){return(r%e+e)%e}function xo(r,e,t){return(1-t)*r+t*e}function wr(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function ln(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const hg={DEG2RAD:ks};class Qe{constructor(e=0,t=0){Qe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ht(this.x,e.x,t.x),this.y=ht(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ht(this.x,e,t),this.y=ht(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ht(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(ht(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),a=this.x-e.x,c=this.y-e.y;return this.x=a*n-c*s+e.x,this.y=a*s+c*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ui{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,a,c,h){let f=n[s+0],d=n[s+1],_=n[s+2],g=n[s+3];const v=a[c+0],E=a[c+1],R=a[c+2],C=a[c+3];if(h===0){e[t+0]=f,e[t+1]=d,e[t+2]=_,e[t+3]=g;return}if(h===1){e[t+0]=v,e[t+1]=E,e[t+2]=R,e[t+3]=C;return}if(g!==C||f!==v||d!==E||_!==R){let y=1-h;const m=f*v+d*E+_*R+g*C,I=m>=0?1:-1,F=1-m*m;if(F>Number.EPSILON){const O=Math.sqrt(F),D=Math.atan2(O,m*I);y=Math.sin(y*D)/O,h=Math.sin(h*D)/O}const L=h*I;if(f=f*y+v*L,d=d*y+E*L,_=_*y+R*L,g=g*y+C*L,y===1-h){const O=1/Math.sqrt(f*f+d*d+_*_+g*g);f*=O,d*=O,_*=O,g*=O}}e[t]=f,e[t+1]=d,e[t+2]=_,e[t+3]=g}static multiplyQuaternionsFlat(e,t,n,s,a,c){const h=n[s],f=n[s+1],d=n[s+2],_=n[s+3],g=a[c],v=a[c+1],E=a[c+2],R=a[c+3];return e[t]=h*R+_*g+f*E-d*v,e[t+1]=f*R+_*v+d*g-h*E,e[t+2]=d*R+_*E+h*v-f*g,e[t+3]=_*R-h*g-f*v-d*E,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,a=e._z,c=e._order,h=Math.cos,f=Math.sin,d=h(n/2),_=h(s/2),g=h(a/2),v=f(n/2),E=f(s/2),R=f(a/2);switch(c){case"XYZ":this._x=v*_*g+d*E*R,this._y=d*E*g-v*_*R,this._z=d*_*R+v*E*g,this._w=d*_*g-v*E*R;break;case"YXZ":this._x=v*_*g+d*E*R,this._y=d*E*g-v*_*R,this._z=d*_*R-v*E*g,this._w=d*_*g+v*E*R;break;case"ZXY":this._x=v*_*g-d*E*R,this._y=d*E*g+v*_*R,this._z=d*_*R+v*E*g,this._w=d*_*g-v*E*R;break;case"ZYX":this._x=v*_*g-d*E*R,this._y=d*E*g+v*_*R,this._z=d*_*R-v*E*g,this._w=d*_*g+v*E*R;break;case"YZX":this._x=v*_*g+d*E*R,this._y=d*E*g+v*_*R,this._z=d*_*R-v*E*g,this._w=d*_*g-v*E*R;break;case"XZY":this._x=v*_*g-d*E*R,this._y=d*E*g-v*_*R,this._z=d*_*R+v*E*g,this._w=d*_*g+v*E*R;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+c)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],a=t[8],c=t[1],h=t[5],f=t[9],d=t[2],_=t[6],g=t[10],v=n+h+g;if(v>0){const E=.5/Math.sqrt(v+1);this._w=.25/E,this._x=(_-f)*E,this._y=(a-d)*E,this._z=(c-s)*E}else if(n>h&&n>g){const E=2*Math.sqrt(1+n-h-g);this._w=(_-f)/E,this._x=.25*E,this._y=(s+c)/E,this._z=(a+d)/E}else if(h>g){const E=2*Math.sqrt(1+h-n-g);this._w=(a-d)/E,this._x=(s+c)/E,this._y=.25*E,this._z=(f+_)/E}else{const E=2*Math.sqrt(1+g-n-h);this._w=(c-s)/E,this._x=(a+d)/E,this._y=(f+_)/E,this._z=.25*E}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ht(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,a=e._z,c=e._w,h=t._x,f=t._y,d=t._z,_=t._w;return this._x=n*_+c*h+s*d-a*f,this._y=s*_+c*f+a*h-n*d,this._z=a*_+c*d+n*f-s*h,this._w=c*_-n*h-s*f-a*d,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,a=this._z,c=this._w;let h=c*e._w+n*e._x+s*e._y+a*e._z;if(h<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,h=-h):this.copy(e),h>=1)return this._w=c,this._x=n,this._y=s,this._z=a,this;const f=1-h*h;if(f<=Number.EPSILON){const E=1-t;return this._w=E*c+t*this._w,this._x=E*n+t*this._x,this._y=E*s+t*this._y,this._z=E*a+t*this._z,this.normalize(),this}const d=Math.sqrt(f),_=Math.atan2(d,h),g=Math.sin((1-t)*_)/d,v=Math.sin(t*_)/d;return this._w=c*g+this._w*v,this._x=n*g+this._x*v,this._y=s*g+this._y*v,this._z=a*g+this._z*v,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),a=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),a*Math.sin(t),a*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class X{constructor(e=0,t=0,n=0){X.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(lc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(lc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,a=e.elements;return this.x=a[0]*t+a[3]*n+a[6]*s,this.y=a[1]*t+a[4]*n+a[7]*s,this.z=a[2]*t+a[5]*n+a[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,a=e.elements,c=1/(a[3]*t+a[7]*n+a[11]*s+a[15]);return this.x=(a[0]*t+a[4]*n+a[8]*s+a[12])*c,this.y=(a[1]*t+a[5]*n+a[9]*s+a[13])*c,this.z=(a[2]*t+a[6]*n+a[10]*s+a[14])*c,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,a=e.x,c=e.y,h=e.z,f=e.w,d=2*(c*s-h*n),_=2*(h*t-a*s),g=2*(a*n-c*t);return this.x=t+f*d+c*g-h*_,this.y=n+f*_+h*d-a*g,this.z=s+f*g+a*_-c*d,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s,this.y=a[1]*t+a[5]*n+a[9]*s,this.z=a[2]*t+a[6]*n+a[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ht(this.x,e.x,t.x),this.y=ht(this.y,e.y,t.y),this.z=ht(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ht(this.x,e,t),this.y=ht(this.y,e,t),this.z=ht(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ht(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,a=e.z,c=t.x,h=t.y,f=t.z;return this.x=s*f-a*h,this.y=a*c-n*f,this.z=n*h-s*c,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return yo.copy(this).projectOnVector(e),this.sub(yo)}reflect(e){return this.sub(yo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(ht(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const yo=new X,lc=new Ui;class rt{constructor(e,t,n,s,a,c,h,f,d){rt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,a,c,h,f,d)}set(e,t,n,s,a,c,h,f,d){const _=this.elements;return _[0]=e,_[1]=s,_[2]=h,_[3]=t,_[4]=a,_[5]=f,_[6]=n,_[7]=c,_[8]=d,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,a=this.elements,c=n[0],h=n[3],f=n[6],d=n[1],_=n[4],g=n[7],v=n[2],E=n[5],R=n[8],C=s[0],y=s[3],m=s[6],I=s[1],F=s[4],L=s[7],O=s[2],D=s[5],z=s[8];return a[0]=c*C+h*I+f*O,a[3]=c*y+h*F+f*D,a[6]=c*m+h*L+f*z,a[1]=d*C+_*I+g*O,a[4]=d*y+_*F+g*D,a[7]=d*m+_*L+g*z,a[2]=v*C+E*I+R*O,a[5]=v*y+E*F+R*D,a[8]=v*m+E*L+R*z,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],a=e[3],c=e[4],h=e[5],f=e[6],d=e[7],_=e[8];return t*c*_-t*h*d-n*a*_+n*h*f+s*a*d-s*c*f}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],a=e[3],c=e[4],h=e[5],f=e[6],d=e[7],_=e[8],g=_*c-h*d,v=h*f-_*a,E=d*a-c*f,R=t*g+n*v+s*E;if(R===0)return this.set(0,0,0,0,0,0,0,0,0);const C=1/R;return e[0]=g*C,e[1]=(s*d-_*n)*C,e[2]=(h*n-s*c)*C,e[3]=v*C,e[4]=(_*t-s*f)*C,e[5]=(s*a-h*t)*C,e[6]=E*C,e[7]=(n*f-d*t)*C,e[8]=(c*t-n*a)*C,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,a,c,h){const f=Math.cos(a),d=Math.sin(a);return this.set(n*f,n*d,-n*(f*c+d*h)+c+e,-s*d,s*f,-s*(-d*c+f*h)+h+t,0,0,1),this}scale(e,t){return this.premultiply(Eo.makeScale(e,t)),this}rotate(e){return this.premultiply(Eo.makeRotation(-e)),this}translate(e,t){return this.premultiply(Eo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Eo=new rt;function Th(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function Gs(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function ug(){const r=Gs("canvas");return r.style.display="block",r}const cc={};function kr(r){r in cc||(cc[r]=!0,console.warn(r))}function dg(r,e,t){return new Promise(function(n,s){function a(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:s();break;case r.TIMEOUT_EXPIRED:setTimeout(a,t);break;default:n()}}setTimeout(a,t)})}const hc=new rt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),uc=new rt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function fg(){const r={enabled:!0,workingColorSpace:_r,spaces:{},convert:function(s,a,c){return this.enabled===!1||a===c||!a||!c||(this.spaces[a].transfer===wt&&(s.r=Kn(s.r),s.g=Kn(s.g),s.b=Kn(s.b)),this.spaces[a].primaries!==this.spaces[c].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[c].fromXYZ)),this.spaces[c].transfer===wt&&(s.r=dr(s.r),s.g=dr(s.g),s.b=dr(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===li?Hs:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,c){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[c].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return kr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return kr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(s,a)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return r.define({[_r]:{primaries:e,whitePoint:n,transfer:Hs,toXYZ:hc,fromXYZ:uc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:yn},outputColorSpaceConfig:{drawingBufferColorSpace:yn}},[yn]:{primaries:e,whitePoint:n,transfer:wt,toXYZ:hc,fromXYZ:uc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:yn}}}),r}const gt=fg();function Kn(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function dr(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let Wi;class pg{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Wi===void 0&&(Wi=Gs("canvas")),Wi.width=e.width,Wi.height=e.height;const s=Wi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Wi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Gs("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),a=s.data;for(let c=0;c<a.length;c++)a[c]=Kn(a[c]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Kn(t[n]/255)*255):t[n]=Kn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let mg=0;class tl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:mg++}),this.uuid=Hr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let c=0,h=s.length;c<h;c++)s[c].isDataTexture?a.push(So(s[c].image)):a.push(So(s[c]))}else a=So(s);n.url=a}return t||(e.images[this.uuid]=n),n}}function So(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?pg.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let _g=0;const Mo=new X;class an extends Oi{constructor(e=an.DEFAULT_IMAGE,t=an.DEFAULT_MAPPING,n=Li,s=Li,a=In,c=Fi,h=An,f=On,d=an.DEFAULT_ANISOTROPY,_=li){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:_g++}),this.uuid=Hr(),this.name="",this.source=new tl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=a,this.minFilter=c,this.anisotropy=d,this.format=h,this.internalFormat=null,this.type=f,this.offset=new Qe(0,0),this.repeat=new Qe(1,1),this.center=new Qe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new rt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=_,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Mo).x}get height(){return this.source.getSize(Mo).y}get depth(){return this.source.getSize(Mo).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==mh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ha:e.x=e.x-Math.floor(e.x);break;case Li:e.x=e.x<0?0:1;break;case ua:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ha:e.y=e.y-Math.floor(e.y);break;case Li:e.y=e.y<0?0:1;break;case ua:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}an.DEFAULT_IMAGE=null;an.DEFAULT_MAPPING=mh;an.DEFAULT_ANISOTROPY=1;class At{constructor(e=0,t=0,n=0,s=1){At.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,a=this.w,c=e.elements;return this.x=c[0]*t+c[4]*n+c[8]*s+c[12]*a,this.y=c[1]*t+c[5]*n+c[9]*s+c[13]*a,this.z=c[2]*t+c[6]*n+c[10]*s+c[14]*a,this.w=c[3]*t+c[7]*n+c[11]*s+c[15]*a,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,a;const f=e.elements,d=f[0],_=f[4],g=f[8],v=f[1],E=f[5],R=f[9],C=f[2],y=f[6],m=f[10];if(Math.abs(_-v)<.01&&Math.abs(g-C)<.01&&Math.abs(R-y)<.01){if(Math.abs(_+v)<.1&&Math.abs(g+C)<.1&&Math.abs(R+y)<.1&&Math.abs(d+E+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const F=(d+1)/2,L=(E+1)/2,O=(m+1)/2,D=(_+v)/4,z=(g+C)/4,G=(R+y)/4;return F>L&&F>O?F<.01?(n=0,s=.707106781,a=.707106781):(n=Math.sqrt(F),s=D/n,a=z/n):L>O?L<.01?(n=.707106781,s=0,a=.707106781):(s=Math.sqrt(L),n=D/s,a=G/s):O<.01?(n=.707106781,s=.707106781,a=0):(a=Math.sqrt(O),n=z/a,s=G/a),this.set(n,s,a,t),this}let I=Math.sqrt((y-R)*(y-R)+(g-C)*(g-C)+(v-_)*(v-_));return Math.abs(I)<.001&&(I=1),this.x=(y-R)/I,this.y=(g-C)/I,this.z=(v-_)/I,this.w=Math.acos((d+E+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ht(this.x,e.x,t.x),this.y=ht(this.y,e.y,t.y),this.z=ht(this.z,e.z,t.z),this.w=ht(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ht(this.x,e,t),this.y=ht(this.y,e,t),this.z=ht(this.z,e,t),this.w=ht(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ht(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class gg extends Oi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:In,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new At(0,0,e,t),this.scissorTest=!1,this.viewport=new At(0,0,e,t);const s={width:e,height:t,depth:n.depth},a=new an(s);this.textures=[];const c=n.count;for(let h=0;h<c;h++)this.textures[h]=a.clone(),this.textures[h].isRenderTargetTexture=!0,this.textures[h].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:In,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new tl(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ni extends gg{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class wh extends an{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=_n,this.minFilter=_n,this.wrapR=Li,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class vg extends an{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=_n,this.minFilter=_n,this.wrapR=Li,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Bi{constructor(e=new X(1/0,1/0,1/0),t=new X(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Mn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Mn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Mn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const a=n.getAttribute("position");if(t===!0&&a!==void 0&&e.isInstancedMesh!==!0)for(let c=0,h=a.count;c<h;c++)e.isMesh===!0?e.getVertexPosition(c,Mn):Mn.fromBufferAttribute(a,c),Mn.applyMatrix4(e.matrixWorld),this.expandByPoint(Mn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),hs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),hs.copy(n.boundingBox)),hs.applyMatrix4(e.matrixWorld),this.union(hs)}const s=e.children;for(let a=0,c=s.length;a<c;a++)this.expandByObject(s[a],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Mn),Mn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(br),us.subVectors(this.max,br),Xi.subVectors(e.a,br),ji.subVectors(e.b,br),$i.subVectors(e.c,br),Jn.subVectors(ji,Xi),Qn.subVectors($i,ji),Si.subVectors(Xi,$i);let t=[0,-Jn.z,Jn.y,0,-Qn.z,Qn.y,0,-Si.z,Si.y,Jn.z,0,-Jn.x,Qn.z,0,-Qn.x,Si.z,0,-Si.x,-Jn.y,Jn.x,0,-Qn.y,Qn.x,0,-Si.y,Si.x,0];return!To(t,Xi,ji,$i,us)||(t=[1,0,0,0,1,0,0,0,1],!To(t,Xi,ji,$i,us))?!1:(ds.crossVectors(Jn,Qn),t=[ds.x,ds.y,ds.z],To(t,Xi,ji,$i,us))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Mn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Mn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Vn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Vn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Vn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Vn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Vn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Vn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Vn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Vn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Vn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Vn=[new X,new X,new X,new X,new X,new X,new X,new X],Mn=new X,hs=new Bi,Xi=new X,ji=new X,$i=new X,Jn=new X,Qn=new X,Si=new X,br=new X,us=new X,ds=new X,Mi=new X;function To(r,e,t,n,s){for(let a=0,c=r.length-3;a<=c;a+=3){Mi.fromArray(r,a);const h=s.x*Math.abs(Mi.x)+s.y*Math.abs(Mi.y)+s.z*Math.abs(Mi.z),f=e.dot(Mi),d=t.dot(Mi),_=n.dot(Mi);if(Math.max(-Math.max(f,d,_),Math.min(f,d,_))>h)return!1}return!0}const xg=new Bi,Ar=new X,wo=new X;class vr{constructor(e=new X,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):xg.setFromPoints(e).getCenter(n);let s=0;for(let a=0,c=e.length;a<c;a++)s=Math.max(s,n.distanceToSquared(e[a]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ar.subVectors(e,this.center);const t=Ar.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Ar,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(wo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ar.copy(e.center).add(wo)),this.expandByPoint(Ar.copy(e.center).sub(wo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const Gn=new X,bo=new X,fs=new X,ei=new X,Ao=new X,ps=new X,Ro=new X;class nl{constructor(e=new X,t=new X(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Gn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Gn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Gn.copy(this.origin).addScaledVector(this.direction,t),Gn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){bo.copy(e).add(t).multiplyScalar(.5),fs.copy(t).sub(e).normalize(),ei.copy(this.origin).sub(bo);const a=e.distanceTo(t)*.5,c=-this.direction.dot(fs),h=ei.dot(this.direction),f=-ei.dot(fs),d=ei.lengthSq(),_=Math.abs(1-c*c);let g,v,E,R;if(_>0)if(g=c*f-h,v=c*h-f,R=a*_,g>=0)if(v>=-R)if(v<=R){const C=1/_;g*=C,v*=C,E=g*(g+c*v+2*h)+v*(c*g+v+2*f)+d}else v=a,g=Math.max(0,-(c*v+h)),E=-g*g+v*(v+2*f)+d;else v=-a,g=Math.max(0,-(c*v+h)),E=-g*g+v*(v+2*f)+d;else v<=-R?(g=Math.max(0,-(-c*a+h)),v=g>0?-a:Math.min(Math.max(-a,-f),a),E=-g*g+v*(v+2*f)+d):v<=R?(g=0,v=Math.min(Math.max(-a,-f),a),E=v*(v+2*f)+d):(g=Math.max(0,-(c*a+h)),v=g>0?a:Math.min(Math.max(-a,-f),a),E=-g*g+v*(v+2*f)+d);else v=c>0?-a:a,g=Math.max(0,-(c*v+h)),E=-g*g+v*(v+2*f)+d;return n&&n.copy(this.origin).addScaledVector(this.direction,g),s&&s.copy(bo).addScaledVector(fs,v),E}intersectSphere(e,t){Gn.subVectors(e.center,this.origin);const n=Gn.dot(this.direction),s=Gn.dot(Gn)-n*n,a=e.radius*e.radius;if(s>a)return null;const c=Math.sqrt(a-s),h=n-c,f=n+c;return f<0?null:h<0?this.at(f,t):this.at(h,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,a,c,h,f;const d=1/this.direction.x,_=1/this.direction.y,g=1/this.direction.z,v=this.origin;return d>=0?(n=(e.min.x-v.x)*d,s=(e.max.x-v.x)*d):(n=(e.max.x-v.x)*d,s=(e.min.x-v.x)*d),_>=0?(a=(e.min.y-v.y)*_,c=(e.max.y-v.y)*_):(a=(e.max.y-v.y)*_,c=(e.min.y-v.y)*_),n>c||a>s||((a>n||isNaN(n))&&(n=a),(c<s||isNaN(s))&&(s=c),g>=0?(h=(e.min.z-v.z)*g,f=(e.max.z-v.z)*g):(h=(e.max.z-v.z)*g,f=(e.min.z-v.z)*g),n>f||h>s)||((h>n||n!==n)&&(n=h),(f<s||s!==s)&&(s=f),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Gn)!==null}intersectTriangle(e,t,n,s,a){Ao.subVectors(t,e),ps.subVectors(n,e),Ro.crossVectors(Ao,ps);let c=this.direction.dot(Ro),h;if(c>0){if(s)return null;h=1}else if(c<0)h=-1,c=-c;else return null;ei.subVectors(this.origin,e);const f=h*this.direction.dot(ps.crossVectors(ei,ps));if(f<0)return null;const d=h*this.direction.dot(Ao.cross(ei));if(d<0||f+d>c)return null;const _=-h*ei.dot(Ro);return _<0?null:this.at(_/c,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Dt{constructor(e,t,n,s,a,c,h,f,d,_,g,v,E,R,C,y){Dt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,a,c,h,f,d,_,g,v,E,R,C,y)}set(e,t,n,s,a,c,h,f,d,_,g,v,E,R,C,y){const m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=s,m[1]=a,m[5]=c,m[9]=h,m[13]=f,m[2]=d,m[6]=_,m[10]=g,m[14]=v,m[3]=E,m[7]=R,m[11]=C,m[15]=y,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Dt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/qi.setFromMatrixColumn(e,0).length(),a=1/qi.setFromMatrixColumn(e,1).length(),c=1/qi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=0,t[8]=n[8]*c,t[9]=n[9]*c,t[10]=n[10]*c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,a=e.z,c=Math.cos(n),h=Math.sin(n),f=Math.cos(s),d=Math.sin(s),_=Math.cos(a),g=Math.sin(a);if(e.order==="XYZ"){const v=c*_,E=c*g,R=h*_,C=h*g;t[0]=f*_,t[4]=-f*g,t[8]=d,t[1]=E+R*d,t[5]=v-C*d,t[9]=-h*f,t[2]=C-v*d,t[6]=R+E*d,t[10]=c*f}else if(e.order==="YXZ"){const v=f*_,E=f*g,R=d*_,C=d*g;t[0]=v+C*h,t[4]=R*h-E,t[8]=c*d,t[1]=c*g,t[5]=c*_,t[9]=-h,t[2]=E*h-R,t[6]=C+v*h,t[10]=c*f}else if(e.order==="ZXY"){const v=f*_,E=f*g,R=d*_,C=d*g;t[0]=v-C*h,t[4]=-c*g,t[8]=R+E*h,t[1]=E+R*h,t[5]=c*_,t[9]=C-v*h,t[2]=-c*d,t[6]=h,t[10]=c*f}else if(e.order==="ZYX"){const v=c*_,E=c*g,R=h*_,C=h*g;t[0]=f*_,t[4]=R*d-E,t[8]=v*d+C,t[1]=f*g,t[5]=C*d+v,t[9]=E*d-R,t[2]=-d,t[6]=h*f,t[10]=c*f}else if(e.order==="YZX"){const v=c*f,E=c*d,R=h*f,C=h*d;t[0]=f*_,t[4]=C-v*g,t[8]=R*g+E,t[1]=g,t[5]=c*_,t[9]=-h*_,t[2]=-d*_,t[6]=E*g+R,t[10]=v-C*g}else if(e.order==="XZY"){const v=c*f,E=c*d,R=h*f,C=h*d;t[0]=f*_,t[4]=-g,t[8]=d*_,t[1]=v*g+C,t[5]=c*_,t[9]=E*g-R,t[2]=R*g-E,t[6]=h*_,t[10]=C*g+v}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(yg,e,Eg)}lookAt(e,t,n){const s=this.elements;return fn.subVectors(e,t),fn.lengthSq()===0&&(fn.z=1),fn.normalize(),ti.crossVectors(n,fn),ti.lengthSq()===0&&(Math.abs(n.z)===1?fn.x+=1e-4:fn.z+=1e-4,fn.normalize(),ti.crossVectors(n,fn)),ti.normalize(),ms.crossVectors(fn,ti),s[0]=ti.x,s[4]=ms.x,s[8]=fn.x,s[1]=ti.y,s[5]=ms.y,s[9]=fn.y,s[2]=ti.z,s[6]=ms.z,s[10]=fn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,a=this.elements,c=n[0],h=n[4],f=n[8],d=n[12],_=n[1],g=n[5],v=n[9],E=n[13],R=n[2],C=n[6],y=n[10],m=n[14],I=n[3],F=n[7],L=n[11],O=n[15],D=s[0],z=s[4],G=s[8],P=s[12],S=s[1],k=s[5],K=s[9],Q=s[13],ee=s[2],ce=s[6],re=s[10],_e=s[14],Z=s[3],ye=s[7],ve=s[11],Pe=s[15];return a[0]=c*D+h*S+f*ee+d*Z,a[4]=c*z+h*k+f*ce+d*ye,a[8]=c*G+h*K+f*re+d*ve,a[12]=c*P+h*Q+f*_e+d*Pe,a[1]=_*D+g*S+v*ee+E*Z,a[5]=_*z+g*k+v*ce+E*ye,a[9]=_*G+g*K+v*re+E*ve,a[13]=_*P+g*Q+v*_e+E*Pe,a[2]=R*D+C*S+y*ee+m*Z,a[6]=R*z+C*k+y*ce+m*ye,a[10]=R*G+C*K+y*re+m*ve,a[14]=R*P+C*Q+y*_e+m*Pe,a[3]=I*D+F*S+L*ee+O*Z,a[7]=I*z+F*k+L*ce+O*ye,a[11]=I*G+F*K+L*re+O*ve,a[15]=I*P+F*Q+L*_e+O*Pe,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],a=e[12],c=e[1],h=e[5],f=e[9],d=e[13],_=e[2],g=e[6],v=e[10],E=e[14],R=e[3],C=e[7],y=e[11],m=e[15];return R*(+a*f*g-s*d*g-a*h*v+n*d*v+s*h*E-n*f*E)+C*(+t*f*E-t*d*v+a*c*v-s*c*E+s*d*_-a*f*_)+y*(+t*d*g-t*h*E-a*c*g+n*c*E+a*h*_-n*d*_)+m*(-s*h*_-t*f*g+t*h*v+s*c*g-n*c*v+n*f*_)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],a=e[3],c=e[4],h=e[5],f=e[6],d=e[7],_=e[8],g=e[9],v=e[10],E=e[11],R=e[12],C=e[13],y=e[14],m=e[15],I=g*y*d-C*v*d+C*f*E-h*y*E-g*f*m+h*v*m,F=R*v*d-_*y*d-R*f*E+c*y*E+_*f*m-c*v*m,L=_*C*d-R*g*d+R*h*E-c*C*E-_*h*m+c*g*m,O=R*g*f-_*C*f-R*h*v+c*C*v+_*h*y-c*g*y,D=t*I+n*F+s*L+a*O;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const z=1/D;return e[0]=I*z,e[1]=(C*v*a-g*y*a-C*s*E+n*y*E+g*s*m-n*v*m)*z,e[2]=(h*y*a-C*f*a+C*s*d-n*y*d-h*s*m+n*f*m)*z,e[3]=(g*f*a-h*v*a-g*s*d+n*v*d+h*s*E-n*f*E)*z,e[4]=F*z,e[5]=(_*y*a-R*v*a+R*s*E-t*y*E-_*s*m+t*v*m)*z,e[6]=(R*f*a-c*y*a-R*s*d+t*y*d+c*s*m-t*f*m)*z,e[7]=(c*v*a-_*f*a+_*s*d-t*v*d-c*s*E+t*f*E)*z,e[8]=L*z,e[9]=(R*g*a-_*C*a-R*n*E+t*C*E+_*n*m-t*g*m)*z,e[10]=(c*C*a-R*h*a+R*n*d-t*C*d-c*n*m+t*h*m)*z,e[11]=(_*h*a-c*g*a-_*n*d+t*g*d+c*n*E-t*h*E)*z,e[12]=O*z,e[13]=(_*C*s-R*g*s+R*n*v-t*C*v-_*n*y+t*g*y)*z,e[14]=(R*h*s-c*C*s-R*n*f+t*C*f+c*n*y-t*h*y)*z,e[15]=(c*g*s-_*h*s+_*n*f-t*g*f-c*n*v+t*h*v)*z,this}scale(e){const t=this.elements,n=e.x,s=e.y,a=e.z;return t[0]*=n,t[4]*=s,t[8]*=a,t[1]*=n,t[5]*=s,t[9]*=a,t[2]*=n,t[6]*=s,t[10]*=a,t[3]*=n,t[7]*=s,t[11]*=a,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),a=1-n,c=e.x,h=e.y,f=e.z,d=a*c,_=a*h;return this.set(d*c+n,d*h-s*f,d*f+s*h,0,d*h+s*f,_*h+n,_*f-s*c,0,d*f-s*h,_*f+s*c,a*f*f+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,a,c){return this.set(1,n,a,0,e,1,c,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,a=t._x,c=t._y,h=t._z,f=t._w,d=a+a,_=c+c,g=h+h,v=a*d,E=a*_,R=a*g,C=c*_,y=c*g,m=h*g,I=f*d,F=f*_,L=f*g,O=n.x,D=n.y,z=n.z;return s[0]=(1-(C+m))*O,s[1]=(E+L)*O,s[2]=(R-F)*O,s[3]=0,s[4]=(E-L)*D,s[5]=(1-(v+m))*D,s[6]=(y+I)*D,s[7]=0,s[8]=(R+F)*z,s[9]=(y-I)*z,s[10]=(1-(v+C))*z,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let a=qi.set(s[0],s[1],s[2]).length();const c=qi.set(s[4],s[5],s[6]).length(),h=qi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(a=-a),e.x=s[12],e.y=s[13],e.z=s[14],Tn.copy(this);const d=1/a,_=1/c,g=1/h;return Tn.elements[0]*=d,Tn.elements[1]*=d,Tn.elements[2]*=d,Tn.elements[4]*=_,Tn.elements[5]*=_,Tn.elements[6]*=_,Tn.elements[8]*=g,Tn.elements[9]*=g,Tn.elements[10]*=g,t.setFromRotationMatrix(Tn),n.x=a,n.y=c,n.z=h,this}makePerspective(e,t,n,s,a,c,h=Nn,f=!1){const d=this.elements,_=2*a/(t-e),g=2*a/(n-s),v=(t+e)/(t-e),E=(n+s)/(n-s);let R,C;if(f)R=a/(c-a),C=c*a/(c-a);else if(h===Nn)R=-(c+a)/(c-a),C=-2*c*a/(c-a);else if(h===Vs)R=-c/(c-a),C=-c*a/(c-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+h);return d[0]=_,d[4]=0,d[8]=v,d[12]=0,d[1]=0,d[5]=g,d[9]=E,d[13]=0,d[2]=0,d[6]=0,d[10]=R,d[14]=C,d[3]=0,d[7]=0,d[11]=-1,d[15]=0,this}makeOrthographic(e,t,n,s,a,c,h=Nn,f=!1){const d=this.elements,_=2/(t-e),g=2/(n-s),v=-(t+e)/(t-e),E=-(n+s)/(n-s);let R,C;if(f)R=1/(c-a),C=c/(c-a);else if(h===Nn)R=-2/(c-a),C=-(c+a)/(c-a);else if(h===Vs)R=-1/(c-a),C=-a/(c-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+h);return d[0]=_,d[4]=0,d[8]=0,d[12]=v,d[1]=0,d[5]=g,d[9]=0,d[13]=E,d[2]=0,d[6]=0,d[10]=R,d[14]=C,d[3]=0,d[7]=0,d[11]=0,d[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const qi=new X,Tn=new Dt,yg=new X(0,0,0),Eg=new X(1,1,1),ti=new X,ms=new X,fn=new X,dc=new Dt,fc=new Ui;class Rn{constructor(e=0,t=0,n=0,s=Rn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,a=s[0],c=s[4],h=s[8],f=s[1],d=s[5],_=s[9],g=s[2],v=s[6],E=s[10];switch(t){case"XYZ":this._y=Math.asin(ht(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-_,E),this._z=Math.atan2(-c,a)):(this._x=Math.atan2(v,d),this._z=0);break;case"YXZ":this._x=Math.asin(-ht(_,-1,1)),Math.abs(_)<.9999999?(this._y=Math.atan2(h,E),this._z=Math.atan2(f,d)):(this._y=Math.atan2(-g,a),this._z=0);break;case"ZXY":this._x=Math.asin(ht(v,-1,1)),Math.abs(v)<.9999999?(this._y=Math.atan2(-g,E),this._z=Math.atan2(-c,d)):(this._y=0,this._z=Math.atan2(f,a));break;case"ZYX":this._y=Math.asin(-ht(g,-1,1)),Math.abs(g)<.9999999?(this._x=Math.atan2(v,E),this._z=Math.atan2(f,a)):(this._x=0,this._z=Math.atan2(-c,d));break;case"YZX":this._z=Math.asin(ht(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(-_,d),this._y=Math.atan2(-g,a)):(this._x=0,this._y=Math.atan2(h,E));break;case"XZY":this._z=Math.asin(-ht(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(v,d),this._y=Math.atan2(h,a)):(this._x=Math.atan2(-_,E),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return dc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(dc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return fc.setFromEuler(this),this.setFromQuaternion(fc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Rn.DEFAULT_ORDER="XYZ";class bh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Sg=0;const pc=new X,Yi=new Ui,Wn=new Dt,_s=new X,Rr=new X,Mg=new X,Tg=new Ui,mc=new X(1,0,0),_c=new X(0,1,0),gc=new X(0,0,1),vc={type:"added"},wg={type:"removed"},Ki={type:"childadded",child:null},Co={type:"childremoved",child:null};class Xt extends Oi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Sg++}),this.uuid=Hr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Xt.DEFAULT_UP.clone();const e=new X,t=new Rn,n=new Ui,s=new X(1,1,1);function a(){n.setFromEuler(t,!1)}function c(){t.setFromQuaternion(n,void 0,!1)}t._onChange(a),n._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Dt},normalMatrix:{value:new rt}}),this.matrix=new Dt,this.matrixWorld=new Dt,this.matrixAutoUpdate=Xt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new bh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Yi.setFromAxisAngle(e,t),this.quaternion.multiply(Yi),this}rotateOnWorldAxis(e,t){return Yi.setFromAxisAngle(e,t),this.quaternion.premultiply(Yi),this}rotateX(e){return this.rotateOnAxis(mc,e)}rotateY(e){return this.rotateOnAxis(_c,e)}rotateZ(e){return this.rotateOnAxis(gc,e)}translateOnAxis(e,t){return pc.copy(e).applyQuaternion(this.quaternion),this.position.add(pc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(mc,e)}translateY(e){return this.translateOnAxis(_c,e)}translateZ(e){return this.translateOnAxis(gc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Wn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?_s.copy(e):_s.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Rr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Wn.lookAt(Rr,_s,this.up):Wn.lookAt(_s,Rr,this.up),this.quaternion.setFromRotationMatrix(Wn),s&&(Wn.extractRotation(s.matrixWorld),Yi.setFromRotationMatrix(Wn),this.quaternion.premultiply(Yi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(vc),Ki.child=e,this.dispatchEvent(Ki),Ki.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(wg),Co.child=e,this.dispatchEvent(Co),Co.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Wn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Wn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Wn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(vc),Ki.child=e,this.dispatchEvent(Ki),Ki.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const c=this.children[n].getObjectByProperty(e,t);if(c!==void 0)return c}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let a=0,c=s.length;a<c;a++)s[a].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rr,e,Mg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rr,Tg,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let a=0,c=s.length;a<c;a++)s[a].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(h=>({...h,boundingBox:h.boundingBox?h.boundingBox.toJSON():void 0,boundingSphere:h.boundingSphere?h.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(h=>({...h})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(h,f){return h[f.uuid]===void 0&&(h[f.uuid]=f.toJSON(e)),f.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(e.geometries,this.geometry);const h=this.geometry.parameters;if(h!==void 0&&h.shapes!==void 0){const f=h.shapes;if(Array.isArray(f))for(let d=0,_=f.length;d<_;d++){const g=f[d];a(e.shapes,g)}else a(e.shapes,f)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const h=[];for(let f=0,d=this.material.length;f<d;f++)h.push(a(e.materials,this.material[f]));s.material=h}else s.material=a(e.materials,this.material);if(this.children.length>0){s.children=[];for(let h=0;h<this.children.length;h++)s.children.push(this.children[h].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let h=0;h<this.animations.length;h++){const f=this.animations[h];s.animations.push(a(e.animations,f))}}if(t){const h=c(e.geometries),f=c(e.materials),d=c(e.textures),_=c(e.images),g=c(e.shapes),v=c(e.skeletons),E=c(e.animations),R=c(e.nodes);h.length>0&&(n.geometries=h),f.length>0&&(n.materials=f),d.length>0&&(n.textures=d),_.length>0&&(n.images=_),g.length>0&&(n.shapes=g),v.length>0&&(n.skeletons=v),E.length>0&&(n.animations=E),R.length>0&&(n.nodes=R)}return n.object=s,n;function c(h){const f=[];for(const d in h){const _=h[d];delete _.metadata,f.push(_)}return f}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}Xt.DEFAULT_UP=new X(0,1,0);Xt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const wn=new X,Xn=new X,Po=new X,jn=new X,Zi=new X,Ji=new X,xc=new X,Do=new X,Lo=new X,Fo=new X,Io=new At,Uo=new At,No=new At;class bn{constructor(e=new X,t=new X,n=new X){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),wn.subVectors(e,t),s.cross(wn);const a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(e,t,n,s,a){wn.subVectors(s,t),Xn.subVectors(n,t),Po.subVectors(e,t);const c=wn.dot(wn),h=wn.dot(Xn),f=wn.dot(Po),d=Xn.dot(Xn),_=Xn.dot(Po),g=c*d-h*h;if(g===0)return a.set(0,0,0),null;const v=1/g,E=(d*f-h*_)*v,R=(c*_-h*f)*v;return a.set(1-E-R,R,E)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,jn)===null?!1:jn.x>=0&&jn.y>=0&&jn.x+jn.y<=1}static getInterpolation(e,t,n,s,a,c,h,f){return this.getBarycoord(e,t,n,s,jn)===null?(f.x=0,f.y=0,"z"in f&&(f.z=0),"w"in f&&(f.w=0),null):(f.setScalar(0),f.addScaledVector(a,jn.x),f.addScaledVector(c,jn.y),f.addScaledVector(h,jn.z),f)}static getInterpolatedAttribute(e,t,n,s,a,c){return Io.setScalar(0),Uo.setScalar(0),No.setScalar(0),Io.fromBufferAttribute(e,t),Uo.fromBufferAttribute(e,n),No.fromBufferAttribute(e,s),c.setScalar(0),c.addScaledVector(Io,a.x),c.addScaledVector(Uo,a.y),c.addScaledVector(No,a.z),c}static isFrontFacing(e,t,n,s){return wn.subVectors(n,t),Xn.subVectors(e,t),wn.cross(Xn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return wn.subVectors(this.c,this.b),Xn.subVectors(this.a,this.b),wn.cross(Xn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return bn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return bn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,a){return bn.getInterpolation(e,this.a,this.b,this.c,t,n,s,a)}containsPoint(e){return bn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return bn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,a=this.c;let c,h;Zi.subVectors(s,n),Ji.subVectors(a,n),Do.subVectors(e,n);const f=Zi.dot(Do),d=Ji.dot(Do);if(f<=0&&d<=0)return t.copy(n);Lo.subVectors(e,s);const _=Zi.dot(Lo),g=Ji.dot(Lo);if(_>=0&&g<=_)return t.copy(s);const v=f*g-_*d;if(v<=0&&f>=0&&_<=0)return c=f/(f-_),t.copy(n).addScaledVector(Zi,c);Fo.subVectors(e,a);const E=Zi.dot(Fo),R=Ji.dot(Fo);if(R>=0&&E<=R)return t.copy(a);const C=E*d-f*R;if(C<=0&&d>=0&&R<=0)return h=d/(d-R),t.copy(n).addScaledVector(Ji,h);const y=_*R-E*g;if(y<=0&&g-_>=0&&E-R>=0)return xc.subVectors(a,s),h=(g-_)/(g-_+(E-R)),t.copy(s).addScaledVector(xc,h);const m=1/(y+C+v);return c=C*m,h=v*m,t.copy(n).addScaledVector(Zi,c).addScaledVector(Ji,h)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Ah={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ni={h:0,s:0,l:0},gs={h:0,s:0,l:0};function Oo(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class it{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,gt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=gt.workingColorSpace){return this.r=e,this.g=t,this.b=n,gt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=gt.workingColorSpace){if(e=cg(e,1),t=ht(t,0,1),n=ht(n,0,1),t===0)this.r=this.g=this.b=n;else{const a=n<=.5?n*(1+t):n+t-n*t,c=2*n-a;this.r=Oo(c,a,e+1/3),this.g=Oo(c,a,e),this.b=Oo(c,a,e-1/3)}return gt.colorSpaceToWorking(this,s),this}setStyle(e,t=yn){function n(a){a!==void 0&&parseFloat(a)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let a;const c=s[1],h=s[2];switch(c){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return n(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return n(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,t);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return n(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const a=s[1],c=a.length;if(c===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,t);if(c===6)return this.setHex(parseInt(a,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yn){const n=Ah[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Kn(e.r),this.g=Kn(e.g),this.b=Kn(e.b),this}copyLinearToSRGB(e){return this.r=dr(e.r),this.g=dr(e.g),this.b=dr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yn){return gt.workingToColorSpace(en.copy(this),e),Math.round(ht(en.r*255,0,255))*65536+Math.round(ht(en.g*255,0,255))*256+Math.round(ht(en.b*255,0,255))}getHexString(e=yn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=gt.workingColorSpace){gt.workingToColorSpace(en.copy(this),t);const n=en.r,s=en.g,a=en.b,c=Math.max(n,s,a),h=Math.min(n,s,a);let f,d;const _=(h+c)/2;if(h===c)f=0,d=0;else{const g=c-h;switch(d=_<=.5?g/(c+h):g/(2-c-h),c){case n:f=(s-a)/g+(s<a?6:0);break;case s:f=(a-n)/g+2;break;case a:f=(n-s)/g+4;break}f/=6}return e.h=f,e.s=d,e.l=_,e}getRGB(e,t=gt.workingColorSpace){return gt.workingToColorSpace(en.copy(this),t),e.r=en.r,e.g=en.g,e.b=en.b,e}getStyle(e=yn){gt.workingToColorSpace(en.copy(this),e);const t=en.r,n=en.g,s=en.b;return e!==yn?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ni),this.setHSL(ni.h+e,ni.s+t,ni.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ni),e.getHSL(gs);const n=xo(ni.h,gs.h,t),s=xo(ni.s,gs.s,t),a=xo(ni.l,gs.l,t);return this.setHSL(n,s,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,a=e.elements;return this.r=a[0]*t+a[3]*n+a[6]*s,this.g=a[1]*t+a[4]*n+a[7]*s,this.b=a[2]*t+a[5]*n+a[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const en=new it;it.NAMES=Ah;let bg=0;class ki extends Oi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:bg++}),this.uuid=Hr(),this.name="",this.type="Material",this.blending=ur,this.side=ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Qo,this.blendDst=ea,this.blendEquation=Pi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new it(0,0,0),this.blendAlpha=0,this.depthFunc=fr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=sc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Gi,this.stencilZFail=Gi,this.stencilZPass=Gi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ur&&(n.blending=this.blending),this.side!==ui&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Qo&&(n.blendSrc=this.blendSrc),this.blendDst!==ea&&(n.blendDst=this.blendDst),this.blendEquation!==Pi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==fr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==sc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Gi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Gi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Gi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(a){const c=[];for(const h in a){const f=a[h];delete f.metadata,c.push(f)}return c}if(t){const a=s(e.textures),c=s(e.images);a.length>0&&(n.textures=a),c.length>0&&(n.images=c)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let a=0;a!==s;++a)n[a]=t[a].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Rh extends ki{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new it(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Rn,this.combine=ja,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Bt=new X,vs=new Qe;let Ag=0;class un{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Ag++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=oc,this.updateRanges=[],this.gpuType=Un,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)vs.fromBufferAttribute(this,t),vs.applyMatrix3(e),this.setXY(t,vs.x,vs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyMatrix3(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyMatrix4(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyNormalMatrix(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.transformDirection(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=wr(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ln(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=wr(t,this.array)),t}setX(e,t){return this.normalized&&(t=ln(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=wr(t,this.array)),t}setY(e,t){return this.normalized&&(t=ln(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=wr(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ln(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=wr(t,this.array)),t}setW(e,t){return this.normalized&&(t=ln(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ln(t,this.array),n=ln(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=ln(t,this.array),n=ln(n,this.array),s=ln(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,a){return e*=this.itemSize,this.normalized&&(t=ln(t,this.array),n=ln(n,this.array),s=ln(s,this.array),a=ln(a,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==oc&&(e.usage=this.usage),e}}class Ch extends un{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Ph extends un{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class kt extends un{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Rg=0;const xn=new Dt,Bo=new Xt,Qi=new X,pn=new Bi,Cr=new Bi,qt=new X;class dn extends Oi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Rg++}),this.uuid=Hr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Th(e)?Ph:Ch)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const a=new rt().getNormalMatrix(e);n.applyNormalMatrix(a),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return xn.makeRotationFromQuaternion(e),this.applyMatrix4(xn),this}rotateX(e){return xn.makeRotationX(e),this.applyMatrix4(xn),this}rotateY(e){return xn.makeRotationY(e),this.applyMatrix4(xn),this}rotateZ(e){return xn.makeRotationZ(e),this.applyMatrix4(xn),this}translate(e,t,n){return xn.makeTranslation(e,t,n),this.applyMatrix4(xn),this}scale(e,t,n){return xn.makeScale(e,t,n),this.applyMatrix4(xn),this}lookAt(e){return Bo.lookAt(e),Bo.updateMatrix(),this.applyMatrix4(Bo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Qi).negate(),this.translate(Qi.x,Qi.y,Qi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,a=e.length;s<a;s++){const c=e[s];n.push(c.x,c.y,c.z||0)}this.setAttribute("position",new kt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const a=e[s];t.setXYZ(s,a.x,a.y,a.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Bi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new X(-1/0,-1/0,-1/0),new X(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const a=t[n];pn.setFromBufferAttribute(a),this.morphTargetsRelative?(qt.addVectors(this.boundingBox.min,pn.min),this.boundingBox.expandByPoint(qt),qt.addVectors(this.boundingBox.max,pn.max),this.boundingBox.expandByPoint(qt)):(this.boundingBox.expandByPoint(pn.min),this.boundingBox.expandByPoint(pn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new X,1/0);return}if(e){const n=this.boundingSphere.center;if(pn.setFromBufferAttribute(e),t)for(let a=0,c=t.length;a<c;a++){const h=t[a];Cr.setFromBufferAttribute(h),this.morphTargetsRelative?(qt.addVectors(pn.min,Cr.min),pn.expandByPoint(qt),qt.addVectors(pn.max,Cr.max),pn.expandByPoint(qt)):(pn.expandByPoint(Cr.min),pn.expandByPoint(Cr.max))}pn.getCenter(n);let s=0;for(let a=0,c=e.count;a<c;a++)qt.fromBufferAttribute(e,a),s=Math.max(s,n.distanceToSquared(qt));if(t)for(let a=0,c=t.length;a<c;a++){const h=t[a],f=this.morphTargetsRelative;for(let d=0,_=h.count;d<_;d++)qt.fromBufferAttribute(h,d),f&&(Qi.fromBufferAttribute(e,d),qt.add(Qi)),s=Math.max(s,n.distanceToSquared(qt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,a=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new un(new Float32Array(4*n.count),4));const c=this.getAttribute("tangent"),h=[],f=[];for(let G=0;G<n.count;G++)h[G]=new X,f[G]=new X;const d=new X,_=new X,g=new X,v=new Qe,E=new Qe,R=new Qe,C=new X,y=new X;function m(G,P,S){d.fromBufferAttribute(n,G),_.fromBufferAttribute(n,P),g.fromBufferAttribute(n,S),v.fromBufferAttribute(a,G),E.fromBufferAttribute(a,P),R.fromBufferAttribute(a,S),_.sub(d),g.sub(d),E.sub(v),R.sub(v);const k=1/(E.x*R.y-R.x*E.y);isFinite(k)&&(C.copy(_).multiplyScalar(R.y).addScaledVector(g,-E.y).multiplyScalar(k),y.copy(g).multiplyScalar(E.x).addScaledVector(_,-R.x).multiplyScalar(k),h[G].add(C),h[P].add(C),h[S].add(C),f[G].add(y),f[P].add(y),f[S].add(y))}let I=this.groups;I.length===0&&(I=[{start:0,count:e.count}]);for(let G=0,P=I.length;G<P;++G){const S=I[G],k=S.start,K=S.count;for(let Q=k,ee=k+K;Q<ee;Q+=3)m(e.getX(Q+0),e.getX(Q+1),e.getX(Q+2))}const F=new X,L=new X,O=new X,D=new X;function z(G){O.fromBufferAttribute(s,G),D.copy(O);const P=h[G];F.copy(P),F.sub(O.multiplyScalar(O.dot(P))).normalize(),L.crossVectors(D,P);const k=L.dot(f[G])<0?-1:1;c.setXYZW(G,F.x,F.y,F.z,k)}for(let G=0,P=I.length;G<P;++G){const S=I[G],k=S.start,K=S.count;for(let Q=k,ee=k+K;Q<ee;Q+=3)z(e.getX(Q+0)),z(e.getX(Q+1)),z(e.getX(Q+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new un(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let v=0,E=n.count;v<E;v++)n.setXYZ(v,0,0,0);const s=new X,a=new X,c=new X,h=new X,f=new X,d=new X,_=new X,g=new X;if(e)for(let v=0,E=e.count;v<E;v+=3){const R=e.getX(v+0),C=e.getX(v+1),y=e.getX(v+2);s.fromBufferAttribute(t,R),a.fromBufferAttribute(t,C),c.fromBufferAttribute(t,y),_.subVectors(c,a),g.subVectors(s,a),_.cross(g),h.fromBufferAttribute(n,R),f.fromBufferAttribute(n,C),d.fromBufferAttribute(n,y),h.add(_),f.add(_),d.add(_),n.setXYZ(R,h.x,h.y,h.z),n.setXYZ(C,f.x,f.y,f.z),n.setXYZ(y,d.x,d.y,d.z)}else for(let v=0,E=t.count;v<E;v+=3)s.fromBufferAttribute(t,v+0),a.fromBufferAttribute(t,v+1),c.fromBufferAttribute(t,v+2),_.subVectors(c,a),g.subVectors(s,a),_.cross(g),n.setXYZ(v+0,_.x,_.y,_.z),n.setXYZ(v+1,_.x,_.y,_.z),n.setXYZ(v+2,_.x,_.y,_.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)qt.fromBufferAttribute(e,t),qt.normalize(),e.setXYZ(t,qt.x,qt.y,qt.z)}toNonIndexed(){function e(h,f){const d=h.array,_=h.itemSize,g=h.normalized,v=new d.constructor(f.length*_);let E=0,R=0;for(let C=0,y=f.length;C<y;C++){h.isInterleavedBufferAttribute?E=f[C]*h.data.stride+h.offset:E=f[C]*_;for(let m=0;m<_;m++)v[R++]=d[E++]}return new un(v,_,g)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new dn,n=this.index.array,s=this.attributes;for(const h in s){const f=s[h],d=e(f,n);t.setAttribute(h,d)}const a=this.morphAttributes;for(const h in a){const f=[],d=a[h];for(let _=0,g=d.length;_<g;_++){const v=d[_],E=e(v,n);f.push(E)}t.morphAttributes[h]=f}t.morphTargetsRelative=this.morphTargetsRelative;const c=this.groups;for(let h=0,f=c.length;h<f;h++){const d=c[h];t.addGroup(d.start,d.count,d.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const f=this.parameters;for(const d in f)f[d]!==void 0&&(e[d]=f[d]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const f in n){const d=n[f];e.data.attributes[f]=d.toJSON(e.data)}const s={};let a=!1;for(const f in this.morphAttributes){const d=this.morphAttributes[f],_=[];for(let g=0,v=d.length;g<v;g++){const E=d[g];_.push(E.toJSON(e.data))}_.length>0&&(s[f]=_,a=!0)}a&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const c=this.groups;c.length>0&&(e.data.groups=JSON.parse(JSON.stringify(c)));const h=this.boundingSphere;return h!==null&&(e.data.boundingSphere=h.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const d in s){const _=s[d];this.setAttribute(d,_.clone(t))}const a=e.morphAttributes;for(const d in a){const _=[],g=a[d];for(let v=0,E=g.length;v<E;v++)_.push(g[v].clone(t));this.morphAttributes[d]=_}this.morphTargetsRelative=e.morphTargetsRelative;const c=e.groups;for(let d=0,_=c.length;d<_;d++){const g=c[d];this.addGroup(g.start,g.count,g.materialIndex)}const h=e.boundingBox;h!==null&&(this.boundingBox=h.clone());const f=e.boundingSphere;return f!==null&&(this.boundingSphere=f.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const yc=new Dt,Ti=new nl,xs=new vr,Ec=new X,ys=new X,Es=new X,Ss=new X,ko=new X,Ms=new X,Sc=new X,Ts=new X;class Nt extends Xt{constructor(e=new dn,t=new Rh){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,c=s.length;a<c;a++){const h=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[h]=a}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,a=n.morphAttributes.position,c=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const h=this.morphTargetInfluences;if(a&&h){Ms.set(0,0,0);for(let f=0,d=a.length;f<d;f++){const _=h[f],g=a[f];_!==0&&(ko.fromBufferAttribute(g,e),c?Ms.addScaledVector(ko,_):Ms.addScaledVector(ko.sub(t),_))}t.add(Ms)}return t}raycast(e,t){const n=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),xs.copy(n.boundingSphere),xs.applyMatrix4(a),Ti.copy(e.ray).recast(e.near),!(xs.containsPoint(Ti.origin)===!1&&(Ti.intersectSphere(xs,Ec)===null||Ti.origin.distanceToSquared(Ec)>(e.far-e.near)**2))&&(yc.copy(a).invert(),Ti.copy(e.ray).applyMatrix4(yc),!(n.boundingBox!==null&&Ti.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ti)))}_computeIntersections(e,t,n){let s;const a=this.geometry,c=this.material,h=a.index,f=a.attributes.position,d=a.attributes.uv,_=a.attributes.uv1,g=a.attributes.normal,v=a.groups,E=a.drawRange;if(h!==null)if(Array.isArray(c))for(let R=0,C=v.length;R<C;R++){const y=v[R],m=c[y.materialIndex],I=Math.max(y.start,E.start),F=Math.min(h.count,Math.min(y.start+y.count,E.start+E.count));for(let L=I,O=F;L<O;L+=3){const D=h.getX(L),z=h.getX(L+1),G=h.getX(L+2);s=ws(this,m,e,n,d,_,g,D,z,G),s&&(s.faceIndex=Math.floor(L/3),s.face.materialIndex=y.materialIndex,t.push(s))}}else{const R=Math.max(0,E.start),C=Math.min(h.count,E.start+E.count);for(let y=R,m=C;y<m;y+=3){const I=h.getX(y),F=h.getX(y+1),L=h.getX(y+2);s=ws(this,c,e,n,d,_,g,I,F,L),s&&(s.faceIndex=Math.floor(y/3),t.push(s))}}else if(f!==void 0)if(Array.isArray(c))for(let R=0,C=v.length;R<C;R++){const y=v[R],m=c[y.materialIndex],I=Math.max(y.start,E.start),F=Math.min(f.count,Math.min(y.start+y.count,E.start+E.count));for(let L=I,O=F;L<O;L+=3){const D=L,z=L+1,G=L+2;s=ws(this,m,e,n,d,_,g,D,z,G),s&&(s.faceIndex=Math.floor(L/3),s.face.materialIndex=y.materialIndex,t.push(s))}}else{const R=Math.max(0,E.start),C=Math.min(f.count,E.start+E.count);for(let y=R,m=C;y<m;y+=3){const I=y,F=y+1,L=y+2;s=ws(this,c,e,n,d,_,g,I,F,L),s&&(s.faceIndex=Math.floor(y/3),t.push(s))}}}}function Cg(r,e,t,n,s,a,c,h){let f;if(e.side===on?f=n.intersectTriangle(c,a,s,!0,h):f=n.intersectTriangle(s,a,c,e.side===ui,h),f===null)return null;Ts.copy(h),Ts.applyMatrix4(r.matrixWorld);const d=t.ray.origin.distanceTo(Ts);return d<t.near||d>t.far?null:{distance:d,point:Ts.clone(),object:r}}function ws(r,e,t,n,s,a,c,h,f,d){r.getVertexPosition(h,ys),r.getVertexPosition(f,Es),r.getVertexPosition(d,Ss);const _=Cg(r,e,t,n,ys,Es,Ss,Sc);if(_){const g=new X;bn.getBarycoord(Sc,ys,Es,Ss,g),s&&(_.uv=bn.getInterpolatedAttribute(s,h,f,d,g,new Qe)),a&&(_.uv1=bn.getInterpolatedAttribute(a,h,f,d,g,new Qe)),c&&(_.normal=bn.getInterpolatedAttribute(c,h,f,d,g,new X),_.normal.dot(n.direction)>0&&_.normal.multiplyScalar(-1));const v={a:h,b:f,c:d,normal:new X,materialIndex:0};bn.getNormal(ys,Es,Ss,v.normal),_.face=v,_.barycoord=g}return _}class zi extends dn{constructor(e=1,t=1,n=1,s=1,a=1,c=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:a,depthSegments:c};const h=this;s=Math.floor(s),a=Math.floor(a),c=Math.floor(c);const f=[],d=[],_=[],g=[];let v=0,E=0;R("z","y","x",-1,-1,n,t,e,c,a,0),R("z","y","x",1,-1,n,t,-e,c,a,1),R("x","z","y",1,1,e,n,t,s,c,2),R("x","z","y",1,-1,e,n,-t,s,c,3),R("x","y","z",1,-1,e,t,n,s,a,4),R("x","y","z",-1,-1,e,t,-n,s,a,5),this.setIndex(f),this.setAttribute("position",new kt(d,3)),this.setAttribute("normal",new kt(_,3)),this.setAttribute("uv",new kt(g,2));function R(C,y,m,I,F,L,O,D,z,G,P){const S=L/z,k=O/G,K=L/2,Q=O/2,ee=D/2,ce=z+1,re=G+1;let _e=0,Z=0;const ye=new X;for(let ve=0;ve<re;ve++){const Pe=ve*k-Q;for(let je=0;je<ce;je++){const _t=je*S-K;ye[C]=_t*I,ye[y]=Pe*F,ye[m]=ee,d.push(ye.x,ye.y,ye.z),ye[C]=0,ye[y]=0,ye[m]=D>0?1:-1,_.push(ye.x,ye.y,ye.z),g.push(je/z),g.push(1-ve/G),_e+=1}}for(let ve=0;ve<G;ve++)for(let Pe=0;Pe<z;Pe++){const je=v+Pe+ce*ve,_t=v+Pe+ce*(ve+1),nt=v+(Pe+1)+ce*(ve+1),et=v+(Pe+1)+ce*ve;f.push(je,_t,et),f.push(_t,nt,et),Z+=6}h.addGroup(E,Z,P),E+=Z,v+=_e}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new zi(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function gr(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const s=r[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function rn(r){const e={};for(let t=0;t<r.length;t++){const n=gr(r[t]);for(const s in n)e[s]=n[s]}return e}function Pg(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function Dh(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:gt.workingColorSpace}const Dg={clone:gr,merge:rn};var Lg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Fg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class di extends ki{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Lg,this.fragmentShader=Fg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=gr(e.uniforms),this.uniformsGroups=Pg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const c=this.uniforms[s].value;c&&c.isTexture?t.uniforms[s]={type:"t",value:c.toJSON(e).uuid}:c&&c.isColor?t.uniforms[s]={type:"c",value:c.getHex()}:c&&c.isVector2?t.uniforms[s]={type:"v2",value:c.toArray()}:c&&c.isVector3?t.uniforms[s]={type:"v3",value:c.toArray()}:c&&c.isVector4?t.uniforms[s]={type:"v4",value:c.toArray()}:c&&c.isMatrix3?t.uniforms[s]={type:"m3",value:c.toArray()}:c&&c.isMatrix4?t.uniforms[s]={type:"m4",value:c.toArray()}:t.uniforms[s]={value:c}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Lh extends Xt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Dt,this.projectionMatrix=new Dt,this.projectionMatrixInverse=new Dt,this.coordinateSystem=Nn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const ii=new X,Mc=new Qe,Tc=new Qe;class mn extends Lh{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=za*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ks*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return za*2*Math.atan(Math.tan(ks*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ii.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ii.x,ii.y).multiplyScalar(-e/ii.z),ii.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ii.x,ii.y).multiplyScalar(-e/ii.z)}getViewSize(e,t){return this.getViewBounds(e,Mc,Tc),t.subVectors(Tc,Mc)}setViewOffset(e,t,n,s,a,c){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=a,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ks*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,a=-.5*s;const c=this.view;if(this.view!==null&&this.view.enabled){const f=c.fullWidth,d=c.fullHeight;a+=c.offsetX*s/f,t-=c.offsetY*n/d,s*=c.width/f,n*=c.height/d}const h=this.filmOffset;h!==0&&(a+=e*h/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const er=-90,tr=1;class Ig extends Xt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new mn(er,tr,e,t);s.layers=this.layers,this.add(s);const a=new mn(er,tr,e,t);a.layers=this.layers,this.add(a);const c=new mn(er,tr,e,t);c.layers=this.layers,this.add(c);const h=new mn(er,tr,e,t);h.layers=this.layers,this.add(h);const f=new mn(er,tr,e,t);f.layers=this.layers,this.add(f);const d=new mn(er,tr,e,t);d.layers=this.layers,this.add(d)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,a,c,h,f]=t;for(const d of t)this.remove(d);if(e===Nn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),h.up.set(0,1,0),h.lookAt(0,0,1),f.up.set(0,1,0),f.lookAt(0,0,-1);else if(e===Vs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),h.up.set(0,-1,0),h.lookAt(0,0,1),f.up.set(0,-1,0),f.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const d of t)this.add(d),d.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[a,c,h,f,d,_]=this.children,g=e.getRenderTarget(),v=e.getActiveCubeFace(),E=e.getActiveMipmapLevel(),R=e.xr.enabled;e.xr.enabled=!1;const C=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,a),e.setRenderTarget(n,1,s),e.render(t,c),e.setRenderTarget(n,2,s),e.render(t,h),e.setRenderTarget(n,3,s),e.render(t,f),e.setRenderTarget(n,4,s),e.render(t,d),n.texture.generateMipmaps=C,e.setRenderTarget(n,5,s),e.render(t,_),e.setRenderTarget(g,v,E),e.xr.enabled=R,n.texture.needsPMREMUpdate=!0}}class Fh extends an{constructor(e=[],t=pr,n,s,a,c,h,f,d,_){super(e,t,n,s,a,c,h,f,d,_),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Ug extends Ni{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Fh(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new zi(5,5,5),a=new di({name:"CubemapFromEquirect",uniforms:gr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:on,blending:ci});a.uniforms.tEquirect.value=t;const c=new Nt(s,a),h=t.minFilter;return t.minFilter===Fi&&(t.minFilter=In),new Ig(1,10,this).update(e,c),t.minFilter=h,c.geometry.dispose(),c.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const a=e.getRenderTarget();for(let c=0;c<6;c++)e.setRenderTarget(this,c),e.clear(t,n,s);e.setRenderTarget(a)}}class or extends Xt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Ng={type:"move"};class zo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new or,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new or,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new X,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new X),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new or,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new X,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new X),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,a=null,c=null;const h=this._targetRay,f=this._grip,d=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(d&&e.hand){c=!0;for(const C of e.hand.values()){const y=t.getJointPose(C,n),m=this._getHandJoint(d,C);y!==null&&(m.matrix.fromArray(y.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=y.radius),m.visible=y!==null}const _=d.joints["index-finger-tip"],g=d.joints["thumb-tip"],v=_.position.distanceTo(g.position),E=.02,R=.005;d.inputState.pinching&&v>E+R?(d.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!d.inputState.pinching&&v<=E-R&&(d.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else f!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,n),a!==null&&(f.matrix.fromArray(a.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,a.linearVelocity?(f.hasLinearVelocity=!0,f.linearVelocity.copy(a.linearVelocity)):f.hasLinearVelocity=!1,a.angularVelocity?(f.hasAngularVelocity=!0,f.angularVelocity.copy(a.angularVelocity)):f.hasAngularVelocity=!1));h!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&a!==null&&(s=a),s!==null&&(h.matrix.fromArray(s.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,s.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(s.linearVelocity)):h.hasLinearVelocity=!1,s.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(s.angularVelocity)):h.hasAngularVelocity=!1,this.dispatchEvent(Ng)))}return h!==null&&(h.visible=s!==null),f!==null&&(f.visible=a!==null),d!==null&&(d.visible=c!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new or;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class il{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new it(e),this.near=t,this.far=n}clone(){return new il(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Ih extends Xt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Rn,this.environmentIntensity=1,this.environmentRotation=new Rn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Og extends an{constructor(e=null,t=1,n=1,s,a,c,h,f,d=_n,_=_n,g,v){super(null,c,h,f,d,_,s,a,g,v),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class wc extends un{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const nr=new Dt,bc=new Dt,bs=[],Ac=new Bi,Bg=new Dt,Pr=new Nt,Dr=new vr;class kg extends Nt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new wc(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Bg)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Bi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,nr),Ac.copy(e.boundingBox).applyMatrix4(nr),this.boundingBox.union(Ac)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new vr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,nr),Dr.copy(e.boundingSphere).applyMatrix4(nr),this.boundingSphere.union(Dr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,a=n.length+1,c=e*a+1;for(let h=0;h<n.length;h++)n[h]=s[c+h]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(Pr.geometry=this.geometry,Pr.material=this.material,Pr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Dr.copy(this.boundingSphere),Dr.applyMatrix4(n),e.ray.intersectsSphere(Dr)!==!1))for(let a=0;a<s;a++){this.getMatrixAt(a,nr),bc.multiplyMatrices(n,nr),Pr.matrixWorld=bc,Pr.raycast(e,bs);for(let c=0,h=bs.length;c<h;c++){const f=bs[c];f.instanceId=a,f.object=this,t.push(f)}bs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new wc(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Og(new Float32Array(s*this.count),s,this.count,Ka,Un));const a=this.morphTexture.source.data.data;let c=0;for(let d=0;d<n.length;d++)c+=n[d];const h=this.geometry.morphTargetsRelative?1:1-c,f=s*e;a[f]=h,a.set(n,f+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Ho=new X,zg=new X,Hg=new rt;class ai{constructor(e=new X(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Ho.subVectors(n,t).cross(zg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Ho),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/s;return a<0||a>1?null:t.copy(e.start).addScaledVector(n,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Hg.getNormalMatrix(e),s=this.coplanarPoint(Ho).applyMatrix4(e),a=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const wi=new vr,Vg=new Qe(.5,.5),As=new X;class rl{constructor(e=new ai,t=new ai,n=new ai,s=new ai,a=new ai,c=new ai){this.planes=[e,t,n,s,a,c]}set(e,t,n,s,a,c){const h=this.planes;return h[0].copy(e),h[1].copy(t),h[2].copy(n),h[3].copy(s),h[4].copy(a),h[5].copy(c),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Nn,n=!1){const s=this.planes,a=e.elements,c=a[0],h=a[1],f=a[2],d=a[3],_=a[4],g=a[5],v=a[6],E=a[7],R=a[8],C=a[9],y=a[10],m=a[11],I=a[12],F=a[13],L=a[14],O=a[15];if(s[0].setComponents(d-c,E-_,m-R,O-I).normalize(),s[1].setComponents(d+c,E+_,m+R,O+I).normalize(),s[2].setComponents(d+h,E+g,m+C,O+F).normalize(),s[3].setComponents(d-h,E-g,m-C,O-F).normalize(),n)s[4].setComponents(f,v,y,L).normalize(),s[5].setComponents(d-f,E-v,m-y,O-L).normalize();else if(s[4].setComponents(d-f,E-v,m-y,O-L).normalize(),t===Nn)s[5].setComponents(d+f,E+v,m+y,O+L).normalize();else if(t===Vs)s[5].setComponents(f,v,y,L).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),wi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),wi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(wi)}intersectsSprite(e){wi.center.set(0,0,0);const t=Vg.distanceTo(e.center);return wi.radius=.7071067811865476+t,wi.applyMatrix4(e.matrixWorld),this.intersectsSphere(wi)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let a=0;a<6;a++)if(t[a].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(As.x=s.normal.x>0?e.max.x:e.min.x,As.y=s.normal.y>0?e.max.y:e.min.y,As.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(As)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class sl extends ki{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new it(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ws=new X,Xs=new X,Rc=new Dt,Lr=new nl,Rs=new vr,Vo=new X,Cc=new X;class Uh extends Xt{constructor(e=new dn,t=new sl){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,a=t.count;s<a;s++)Ws.fromBufferAttribute(t,s-1),Xs.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Ws.distanceTo(Xs);e.setAttribute("lineDistance",new kt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,a=e.params.Line.threshold,c=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Rs.copy(n.boundingSphere),Rs.applyMatrix4(s),Rs.radius+=a,e.ray.intersectsSphere(Rs)===!1)return;Rc.copy(s).invert(),Lr.copy(e.ray).applyMatrix4(Rc);const h=a/((this.scale.x+this.scale.y+this.scale.z)/3),f=h*h,d=this.isLineSegments?2:1,_=n.index,v=n.attributes.position;if(_!==null){const E=Math.max(0,c.start),R=Math.min(_.count,c.start+c.count);for(let C=E,y=R-1;C<y;C+=d){const m=_.getX(C),I=_.getX(C+1),F=Cs(this,e,Lr,f,m,I,C);F&&t.push(F)}if(this.isLineLoop){const C=_.getX(R-1),y=_.getX(E),m=Cs(this,e,Lr,f,C,y,R-1);m&&t.push(m)}}else{const E=Math.max(0,c.start),R=Math.min(v.count,c.start+c.count);for(let C=E,y=R-1;C<y;C+=d){const m=Cs(this,e,Lr,f,C,C+1,C);m&&t.push(m)}if(this.isLineLoop){const C=Cs(this,e,Lr,f,R-1,E,R-1);C&&t.push(C)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,c=s.length;a<c;a++){const h=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[h]=a}}}}}function Cs(r,e,t,n,s,a,c){const h=r.geometry.attributes.position;if(Ws.fromBufferAttribute(h,s),Xs.fromBufferAttribute(h,a),t.distanceSqToSegment(Ws,Xs,Vo,Cc)>n)return;Vo.applyMatrix4(r.matrixWorld);const d=e.ray.origin.distanceTo(Vo);if(!(d<e.near||d>e.far))return{distance:d,point:Cc.clone().applyMatrix4(r.matrixWorld),index:c,face:null,faceIndex:null,barycoord:null,object:r}}const Pc=new X,Dc=new X;class Gg extends Uh{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,a=t.count;s<a;s+=2)Pc.fromBufferAttribute(t,s),Dc.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Pc.distanceTo(Dc);e.setAttribute("lineDistance",new kt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Nh extends an{constructor(e,t,n=Ii,s,a,c,h=_n,f=_n,d,_=Or,g=1){if(_!==Or&&_!==Br)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const v={width:e,height:t,depth:g};super(v,s,a,c,h,f,_,n,d),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new tl(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Oh extends an{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class ol extends dn{constructor(e=1,t=1,n=4,s=8,a=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:s,heightSegments:a},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),a=Math.max(1,Math.floor(a));const c=[],h=[],f=[],d=[],_=t/2,g=Math.PI/2*e,v=t,E=2*g+v,R=n*2+a,C=s+1,y=new X,m=new X;for(let I=0;I<=R;I++){let F=0,L=0,O=0,D=0;if(I<=n){const P=I/n,S=P*Math.PI/2;L=-_-e*Math.cos(S),O=e*Math.sin(S),D=-e*Math.cos(S),F=P*g}else if(I<=n+a){const P=(I-n)/a;L=-_+P*t,O=e,D=0,F=g+P*v}else{const P=(I-n-a)/n,S=P*Math.PI/2;L=_+e*Math.sin(S),O=e*Math.cos(S),D=e*Math.sin(S),F=g+v+P*g}const z=Math.max(0,Math.min(1,F/E));let G=0;I===0?G=.5/s:I===R&&(G=-.5/s);for(let P=0;P<=s;P++){const S=P/s,k=S*Math.PI*2,K=Math.sin(k),Q=Math.cos(k);m.x=-O*Q,m.y=L,m.z=O*K,h.push(m.x,m.y,m.z),y.set(-O*Q,D,O*K),y.normalize(),f.push(y.x,y.y,y.z),d.push(S+G,z)}if(I>0){const P=(I-1)*C;for(let S=0;S<s;S++){const k=P+S,K=P+S+1,Q=I*C+S,ee=I*C+S+1;c.push(k,K,Q),c.push(K,ee,Q)}}}this.setIndex(c),this.setAttribute("position",new kt(h,3)),this.setAttribute("normal",new kt(f,3)),this.setAttribute("uv",new kt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ol(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}}class al extends dn{constructor(e=1,t=1,n=1,s=32,a=1,c=!1,h=0,f=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:a,openEnded:c,thetaStart:h,thetaLength:f};const d=this;s=Math.floor(s),a=Math.floor(a);const _=[],g=[],v=[],E=[];let R=0;const C=[],y=n/2;let m=0;I(),c===!1&&(e>0&&F(!0),t>0&&F(!1)),this.setIndex(_),this.setAttribute("position",new kt(g,3)),this.setAttribute("normal",new kt(v,3)),this.setAttribute("uv",new kt(E,2));function I(){const L=new X,O=new X;let D=0;const z=(t-e)/n;for(let G=0;G<=a;G++){const P=[],S=G/a,k=S*(t-e)+e;for(let K=0;K<=s;K++){const Q=K/s,ee=Q*f+h,ce=Math.sin(ee),re=Math.cos(ee);O.x=k*ce,O.y=-S*n+y,O.z=k*re,g.push(O.x,O.y,O.z),L.set(ce,z,re).normalize(),v.push(L.x,L.y,L.z),E.push(Q,1-S),P.push(R++)}C.push(P)}for(let G=0;G<s;G++)for(let P=0;P<a;P++){const S=C[P][G],k=C[P+1][G],K=C[P+1][G+1],Q=C[P][G+1];(e>0||P!==0)&&(_.push(S,k,Q),D+=3),(t>0||P!==a-1)&&(_.push(k,K,Q),D+=3)}d.addGroup(m,D,0),m+=D}function F(L){const O=R,D=new Qe,z=new X;let G=0;const P=L===!0?e:t,S=L===!0?1:-1;for(let K=1;K<=s;K++)g.push(0,y*S,0),v.push(0,S,0),E.push(.5,.5),R++;const k=R;for(let K=0;K<=s;K++){const ee=K/s*f+h,ce=Math.cos(ee),re=Math.sin(ee);z.x=P*re,z.y=y*S,z.z=P*ce,g.push(z.x,z.y,z.z),v.push(0,S,0),D.x=ce*.5+.5,D.y=re*.5*S+.5,E.push(D.x,D.y),R++}for(let K=0;K<s;K++){const Q=O+K,ee=k+K;L===!0?_.push(ee,ee+1,Q):_.push(ee+1,ee,Q),G+=3}d.addGroup(m,G,L===!0?1:2),m+=G}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new al(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Vr extends dn{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const a=e/2,c=t/2,h=Math.floor(n),f=Math.floor(s),d=h+1,_=f+1,g=e/h,v=t/f,E=[],R=[],C=[],y=[];for(let m=0;m<_;m++){const I=m*v-c;for(let F=0;F<d;F++){const L=F*g-a;R.push(L,-I,0),C.push(0,0,1),y.push(F/h),y.push(1-m/f)}}for(let m=0;m<f;m++)for(let I=0;I<h;I++){const F=I+d*m,L=I+d*(m+1),O=I+1+d*(m+1),D=I+1+d*m;E.push(F,L,D),E.push(L,O,D)}this.setIndex(E),this.setAttribute("position",new kt(R,3)),this.setAttribute("normal",new kt(C,3)),this.setAttribute("uv",new kt(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Vr(e.width,e.height,e.widthSegments,e.heightSegments)}}class js extends dn{constructor(e=1,t=32,n=16,s=0,a=Math.PI*2,c=0,h=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:a,thetaStart:c,thetaLength:h},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const f=Math.min(c+h,Math.PI);let d=0;const _=[],g=new X,v=new X,E=[],R=[],C=[],y=[];for(let m=0;m<=n;m++){const I=[],F=m/n;let L=0;m===0&&c===0?L=.5/t:m===n&&f===Math.PI&&(L=-.5/t);for(let O=0;O<=t;O++){const D=O/t;g.x=-e*Math.cos(s+D*a)*Math.sin(c+F*h),g.y=e*Math.cos(c+F*h),g.z=e*Math.sin(s+D*a)*Math.sin(c+F*h),R.push(g.x,g.y,g.z),v.copy(g).normalize(),C.push(v.x,v.y,v.z),y.push(D+L,1-F),I.push(d++)}_.push(I)}for(let m=0;m<n;m++)for(let I=0;I<t;I++){const F=_[m][I+1],L=_[m][I],O=_[m+1][I],D=_[m+1][I+1];(m!==0||c>0)&&E.push(F,L,D),(m!==n-1||f<Math.PI)&&E.push(L,O,D)}this.setIndex(E),this.setAttribute("position",new kt(R,3)),this.setAttribute("normal",new kt(C,3)),this.setAttribute("uv",new kt(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new js(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class ar extends ki{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new it(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new it(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=el,this.normalScale=new Qe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Rn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Wg extends ki{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new it(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new it(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=el,this.normalScale=new Qe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Rn,this.combine=ja,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Xg extends ki{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Q_,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class jg extends ki{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class ll extends Xt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new it(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class $g extends ll{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Xt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new it(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Go=new Dt,Lc=new X,Fc=new X;class Bh{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Qe(512,512),this.mapType=On,this.map=null,this.mapPass=null,this.matrix=new Dt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new rl,this._frameExtents=new Qe(1,1),this._viewportCount=1,this._viewports=[new At(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Lc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Lc),Fc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Fc),t.updateMatrixWorld(),Go.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Go,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Go)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Ic=new Dt,Fr=new X,Wo=new X;class qg extends Bh{constructor(){super(new mn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Qe(4,2),this._viewportCount=6,this._viewports=[new At(2,1,1,1),new At(0,1,1,1),new At(3,1,1,1),new At(1,1,1,1),new At(3,0,1,1),new At(1,0,1,1)],this._cubeDirections=[new X(1,0,0),new X(-1,0,0),new X(0,0,1),new X(0,0,-1),new X(0,1,0),new X(0,-1,0)],this._cubeUps=[new X(0,1,0),new X(0,1,0),new X(0,1,0),new X(0,1,0),new X(0,0,1),new X(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,s=this.matrix,a=e.distance||n.far;a!==n.far&&(n.far=a,n.updateProjectionMatrix()),Fr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Fr),Wo.copy(n.position),Wo.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Wo),n.updateMatrixWorld(),s.makeTranslation(-Fr.x,-Fr.y,-Fr.z),Ic.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ic,n.coordinateSystem,n.reversedDepth)}}class Yg extends ll{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new qg}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class kh extends Lh{constructor(e=-1,t=1,n=1,s=-1,a=.1,c=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=a,this.far=c,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,a,c){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=a,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let a=n-e,c=n+e,h=s+t,f=s-t;if(this.view!==null&&this.view.enabled){const d=(this.right-this.left)/this.view.fullWidth/this.zoom,_=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=d*this.view.offsetX,c=a+d*this.view.width,h-=_*this.view.offsetY,f=h-_*this.view.height}this.projectionMatrix.makeOrthographic(a,c,h,f,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Kg extends Bh{constructor(){super(new kh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Uc extends ll{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Xt.DEFAULT_UP),this.updateMatrix(),this.target=new Xt,this.shadow=new Kg}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Zg extends mn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class Nc{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=ht(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(ht(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class Jg extends Gg{constructor(e=10,t=10,n=4473924,s=8947848){n=new it(n),s=new it(s);const a=t/2,c=e/t,h=e/2,f=[],d=[];for(let v=0,E=0,R=-h;v<=t;v++,R+=c){f.push(-h,0,R,h,0,R),f.push(R,0,-h,R,0,h);const C=v===a?n:s;C.toArray(d,E),E+=3,C.toArray(d,E),E+=3,C.toArray(d,E),E+=3,C.toArray(d,E),E+=3}const _=new dn;_.setAttribute("position",new kt(f,3)),_.setAttribute("color",new kt(d,3));const g=new sl({vertexColors:!0,toneMapped:!1});super(_,g),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class Qg extends Oi{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function Oc(r,e,t,n){const s=ev(n);switch(t){case yh:return r*e;case Ka:return r*e/s.components*s.byteLength;case Za:return r*e/s.components*s.byteLength;case Sh:return r*e*2/s.components*s.byteLength;case Ja:return r*e*2/s.components*s.byteLength;case Eh:return r*e*3/s.components*s.byteLength;case An:return r*e*4/s.components*s.byteLength;case Qa:return r*e*4/s.components*s.byteLength;case Us:case Ns:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Os:case Bs:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case fa:case ma:return Math.max(r,16)*Math.max(e,8)/4;case da:case pa:return Math.max(r,8)*Math.max(e,8)/2;case _a:case ga:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case va:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case xa:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case ya:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case Ea:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case Sa:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case Ma:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case Ta:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case wa:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case ba:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case Aa:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case Ra:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Ca:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case Pa:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case Da:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case La:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Fa:case Ia:case Ua:return Math.ceil(r/4)*Math.ceil(e/4)*16;case Na:case Oa:return Math.ceil(r/4)*Math.ceil(e/4)*8;case Ba:case ka:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ev(r){switch(r){case On:case _h:return{byteLength:1,components:1};case Ur:case gh:case zr:return{byteLength:2,components:1};case qa:case Ya:return{byteLength:2,components:4};case Ii:case $a:case Un:return{byteLength:4,components:1};case vh:case xh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Xa}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Xa);function zh(){let r=null,e=!1,t=null,n=null;function s(a,c){t(a,c),n=r.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(s),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(a){t=a},setContext:function(a){r=a}}}function tv(r){const e=new WeakMap;function t(h,f){const d=h.array,_=h.usage,g=d.byteLength,v=r.createBuffer();r.bindBuffer(f,v),r.bufferData(f,d,_),h.onUploadCallback();let E;if(d instanceof Float32Array)E=r.FLOAT;else if(typeof Float16Array<"u"&&d instanceof Float16Array)E=r.HALF_FLOAT;else if(d instanceof Uint16Array)h.isFloat16BufferAttribute?E=r.HALF_FLOAT:E=r.UNSIGNED_SHORT;else if(d instanceof Int16Array)E=r.SHORT;else if(d instanceof Uint32Array)E=r.UNSIGNED_INT;else if(d instanceof Int32Array)E=r.INT;else if(d instanceof Int8Array)E=r.BYTE;else if(d instanceof Uint8Array)E=r.UNSIGNED_BYTE;else if(d instanceof Uint8ClampedArray)E=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+d);return{buffer:v,type:E,bytesPerElement:d.BYTES_PER_ELEMENT,version:h.version,size:g}}function n(h,f,d){const _=f.array,g=f.updateRanges;if(r.bindBuffer(d,h),g.length===0)r.bufferSubData(d,0,_);else{g.sort((E,R)=>E.start-R.start);let v=0;for(let E=1;E<g.length;E++){const R=g[v],C=g[E];C.start<=R.start+R.count+1?R.count=Math.max(R.count,C.start+C.count-R.start):(++v,g[v]=C)}g.length=v+1;for(let E=0,R=g.length;E<R;E++){const C=g[E];r.bufferSubData(d,C.start*_.BYTES_PER_ELEMENT,_,C.start,C.count)}f.clearUpdateRanges()}f.onUploadCallback()}function s(h){return h.isInterleavedBufferAttribute&&(h=h.data),e.get(h)}function a(h){h.isInterleavedBufferAttribute&&(h=h.data);const f=e.get(h);f&&(r.deleteBuffer(f.buffer),e.delete(h))}function c(h,f){if(h.isInterleavedBufferAttribute&&(h=h.data),h.isGLBufferAttribute){const _=e.get(h);(!_||_.version<h.version)&&e.set(h,{buffer:h.buffer,type:h.type,bytesPerElement:h.elementSize,version:h.version});return}const d=e.get(h);if(d===void 0)e.set(h,t(h,f));else if(d.version<h.version){if(d.size!==h.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(d.buffer,h,f),d.version=h.version}}return{get:s,remove:a,update:c}}var nv=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,iv=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,rv=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,sv=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ov=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,av=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,lv=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,cv=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,hv=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,uv=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,dv=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,fv=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,pv=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,mv=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,_v=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,gv=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,vv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,xv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,yv=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ev=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Sv=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Mv=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Tv=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,wv=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,bv=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Av=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Rv=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Cv=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Pv=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Dv=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Lv="gl_FragColor = linearToOutputTexel( gl_FragColor );",Fv=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Iv=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Uv=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Nv=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Ov=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Bv=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,kv=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,zv=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Hv=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Vv=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Gv=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Wv=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Xv=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,jv=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$v=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,qv=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Yv=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Kv=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Zv=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Jv=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Qv=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,e0=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,t0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,n0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,i0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,r0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,s0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,o0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,a0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,l0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,c0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,h0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,u0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,d0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,f0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,p0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,m0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,_0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,g0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,v0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,x0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,y0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,E0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,S0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,M0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,T0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,w0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,b0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,A0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,R0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,C0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,P0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,D0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,L0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,F0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,I0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,U0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,N0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,O0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,B0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,k0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,z0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,H0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,V0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,G0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,W0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,X0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,j0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,$0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,q0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Y0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,K0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Z0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,J0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Q0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,ex=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const tx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,nx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ix=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,rx=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ox=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ax=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,lx=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,cx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,hx=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,ux=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,dx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,fx=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,px=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,mx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,_x=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gx=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,vx=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,yx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ex=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Sx=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Mx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tx=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,bx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ax=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rx=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cx=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Px=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Dx=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Lx=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Fx=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ix=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,at={alphahash_fragment:nv,alphahash_pars_fragment:iv,alphamap_fragment:rv,alphamap_pars_fragment:sv,alphatest_fragment:ov,alphatest_pars_fragment:av,aomap_fragment:lv,aomap_pars_fragment:cv,batching_pars_vertex:hv,batching_vertex:uv,begin_vertex:dv,beginnormal_vertex:fv,bsdfs:pv,iridescence_fragment:mv,bumpmap_pars_fragment:_v,clipping_planes_fragment:gv,clipping_planes_pars_fragment:vv,clipping_planes_pars_vertex:xv,clipping_planes_vertex:yv,color_fragment:Ev,color_pars_fragment:Sv,color_pars_vertex:Mv,color_vertex:Tv,common:wv,cube_uv_reflection_fragment:bv,defaultnormal_vertex:Av,displacementmap_pars_vertex:Rv,displacementmap_vertex:Cv,emissivemap_fragment:Pv,emissivemap_pars_fragment:Dv,colorspace_fragment:Lv,colorspace_pars_fragment:Fv,envmap_fragment:Iv,envmap_common_pars_fragment:Uv,envmap_pars_fragment:Nv,envmap_pars_vertex:Ov,envmap_physical_pars_fragment:qv,envmap_vertex:Bv,fog_vertex:kv,fog_pars_vertex:zv,fog_fragment:Hv,fog_pars_fragment:Vv,gradientmap_pars_fragment:Gv,lightmap_pars_fragment:Wv,lights_lambert_fragment:Xv,lights_lambert_pars_fragment:jv,lights_pars_begin:$v,lights_toon_fragment:Yv,lights_toon_pars_fragment:Kv,lights_phong_fragment:Zv,lights_phong_pars_fragment:Jv,lights_physical_fragment:Qv,lights_physical_pars_fragment:e0,lights_fragment_begin:t0,lights_fragment_maps:n0,lights_fragment_end:i0,logdepthbuf_fragment:r0,logdepthbuf_pars_fragment:s0,logdepthbuf_pars_vertex:o0,logdepthbuf_vertex:a0,map_fragment:l0,map_pars_fragment:c0,map_particle_fragment:h0,map_particle_pars_fragment:u0,metalnessmap_fragment:d0,metalnessmap_pars_fragment:f0,morphinstance_vertex:p0,morphcolor_vertex:m0,morphnormal_vertex:_0,morphtarget_pars_vertex:g0,morphtarget_vertex:v0,normal_fragment_begin:x0,normal_fragment_maps:y0,normal_pars_fragment:E0,normal_pars_vertex:S0,normal_vertex:M0,normalmap_pars_fragment:T0,clearcoat_normal_fragment_begin:w0,clearcoat_normal_fragment_maps:b0,clearcoat_pars_fragment:A0,iridescence_pars_fragment:R0,opaque_fragment:C0,packing:P0,premultiplied_alpha_fragment:D0,project_vertex:L0,dithering_fragment:F0,dithering_pars_fragment:I0,roughnessmap_fragment:U0,roughnessmap_pars_fragment:N0,shadowmap_pars_fragment:O0,shadowmap_pars_vertex:B0,shadowmap_vertex:k0,shadowmask_pars_fragment:z0,skinbase_vertex:H0,skinning_pars_vertex:V0,skinning_vertex:G0,skinnormal_vertex:W0,specularmap_fragment:X0,specularmap_pars_fragment:j0,tonemapping_fragment:$0,tonemapping_pars_fragment:q0,transmission_fragment:Y0,transmission_pars_fragment:K0,uv_pars_fragment:Z0,uv_pars_vertex:J0,uv_vertex:Q0,worldpos_vertex:ex,background_vert:tx,background_frag:nx,backgroundCube_vert:ix,backgroundCube_frag:rx,cube_vert:sx,cube_frag:ox,depth_vert:ax,depth_frag:lx,distanceRGBA_vert:cx,distanceRGBA_frag:hx,equirect_vert:ux,equirect_frag:dx,linedashed_vert:fx,linedashed_frag:px,meshbasic_vert:mx,meshbasic_frag:_x,meshlambert_vert:gx,meshlambert_frag:vx,meshmatcap_vert:xx,meshmatcap_frag:yx,meshnormal_vert:Ex,meshnormal_frag:Sx,meshphong_vert:Mx,meshphong_frag:Tx,meshphysical_vert:wx,meshphysical_frag:bx,meshtoon_vert:Ax,meshtoon_frag:Rx,points_vert:Cx,points_frag:Px,shadow_vert:Dx,shadow_frag:Lx,sprite_vert:Fx,sprite_frag:Ix},Ce={common:{diffuse:{value:new it(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new rt},alphaMap:{value:null},alphaMapTransform:{value:new rt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new rt}},envmap:{envMap:{value:null},envMapRotation:{value:new rt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new rt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new rt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new rt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new rt},normalScale:{value:new Qe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new rt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new rt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new rt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new rt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new it(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new it(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new rt},alphaTest:{value:0},uvTransform:{value:new rt}},sprite:{diffuse:{value:new it(16777215)},opacity:{value:1},center:{value:new Qe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new rt},alphaMap:{value:null},alphaMapTransform:{value:new rt},alphaTest:{value:0}}},Fn={basic:{uniforms:rn([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.fog]),vertexShader:at.meshbasic_vert,fragmentShader:at.meshbasic_frag},lambert:{uniforms:rn([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new it(0)}}]),vertexShader:at.meshlambert_vert,fragmentShader:at.meshlambert_frag},phong:{uniforms:rn([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new it(0)},specular:{value:new it(1118481)},shininess:{value:30}}]),vertexShader:at.meshphong_vert,fragmentShader:at.meshphong_frag},standard:{uniforms:rn([Ce.common,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.roughnessmap,Ce.metalnessmap,Ce.fog,Ce.lights,{emissive:{value:new it(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:at.meshphysical_vert,fragmentShader:at.meshphysical_frag},toon:{uniforms:rn([Ce.common,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.gradientmap,Ce.fog,Ce.lights,{emissive:{value:new it(0)}}]),vertexShader:at.meshtoon_vert,fragmentShader:at.meshtoon_frag},matcap:{uniforms:rn([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,{matcap:{value:null}}]),vertexShader:at.meshmatcap_vert,fragmentShader:at.meshmatcap_frag},points:{uniforms:rn([Ce.points,Ce.fog]),vertexShader:at.points_vert,fragmentShader:at.points_frag},dashed:{uniforms:rn([Ce.common,Ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:at.linedashed_vert,fragmentShader:at.linedashed_frag},depth:{uniforms:rn([Ce.common,Ce.displacementmap]),vertexShader:at.depth_vert,fragmentShader:at.depth_frag},normal:{uniforms:rn([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,{opacity:{value:1}}]),vertexShader:at.meshnormal_vert,fragmentShader:at.meshnormal_frag},sprite:{uniforms:rn([Ce.sprite,Ce.fog]),vertexShader:at.sprite_vert,fragmentShader:at.sprite_frag},background:{uniforms:{uvTransform:{value:new rt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:at.background_vert,fragmentShader:at.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new rt}},vertexShader:at.backgroundCube_vert,fragmentShader:at.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:at.cube_vert,fragmentShader:at.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:at.equirect_vert,fragmentShader:at.equirect_frag},distanceRGBA:{uniforms:rn([Ce.common,Ce.displacementmap,{referencePosition:{value:new X},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:at.distanceRGBA_vert,fragmentShader:at.distanceRGBA_frag},shadow:{uniforms:rn([Ce.lights,Ce.fog,{color:{value:new it(0)},opacity:{value:1}}]),vertexShader:at.shadow_vert,fragmentShader:at.shadow_frag}};Fn.physical={uniforms:rn([Fn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new rt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new rt},clearcoatNormalScale:{value:new Qe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new rt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new rt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new rt},sheen:{value:0},sheenColor:{value:new it(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new rt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new rt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new rt},transmissionSamplerSize:{value:new Qe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new rt},attenuationDistance:{value:0},attenuationColor:{value:new it(0)},specularColor:{value:new it(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new rt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new rt},anisotropyVector:{value:new Qe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new rt}}]),vertexShader:at.meshphysical_vert,fragmentShader:at.meshphysical_frag};const Ps={r:0,b:0,g:0},bi=new Rn,Ux=new Dt;function Nx(r,e,t,n,s,a,c){const h=new it(0);let f=a===!0?0:1,d,_,g=null,v=0,E=null;function R(F){let L=F.isScene===!0?F.background:null;return L&&L.isTexture&&(L=(F.backgroundBlurriness>0?t:e).get(L)),L}function C(F){let L=!1;const O=R(F);O===null?m(h,f):O&&O.isColor&&(m(O,1),L=!0);const D=r.xr.getEnvironmentBlendMode();D==="additive"?n.buffers.color.setClear(0,0,0,1,c):D==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,c),(r.autoClear||L)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function y(F,L){const O=R(L);O&&(O.isCubeTexture||O.mapping===$s)?(_===void 0&&(_=new Nt(new zi(1,1,1),new di({name:"BackgroundCubeMaterial",uniforms:gr(Fn.backgroundCube.uniforms),vertexShader:Fn.backgroundCube.vertexShader,fragmentShader:Fn.backgroundCube.fragmentShader,side:on,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),_.geometry.deleteAttribute("normal"),_.geometry.deleteAttribute("uv"),_.onBeforeRender=function(D,z,G){this.matrixWorld.copyPosition(G.matrixWorld)},Object.defineProperty(_.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(_)),bi.copy(L.backgroundRotation),bi.x*=-1,bi.y*=-1,bi.z*=-1,O.isCubeTexture&&O.isRenderTargetTexture===!1&&(bi.y*=-1,bi.z*=-1),_.material.uniforms.envMap.value=O,_.material.uniforms.flipEnvMap.value=O.isCubeTexture&&O.isRenderTargetTexture===!1?-1:1,_.material.uniforms.backgroundBlurriness.value=L.backgroundBlurriness,_.material.uniforms.backgroundIntensity.value=L.backgroundIntensity,_.material.uniforms.backgroundRotation.value.setFromMatrix4(Ux.makeRotationFromEuler(bi)),_.material.toneMapped=gt.getTransfer(O.colorSpace)!==wt,(g!==O||v!==O.version||E!==r.toneMapping)&&(_.material.needsUpdate=!0,g=O,v=O.version,E=r.toneMapping),_.layers.enableAll(),F.unshift(_,_.geometry,_.material,0,0,null)):O&&O.isTexture&&(d===void 0&&(d=new Nt(new Vr(2,2),new di({name:"BackgroundMaterial",uniforms:gr(Fn.background.uniforms),vertexShader:Fn.background.vertexShader,fragmentShader:Fn.background.fragmentShader,side:ui,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute("normal"),Object.defineProperty(d.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(d)),d.material.uniforms.t2D.value=O,d.material.uniforms.backgroundIntensity.value=L.backgroundIntensity,d.material.toneMapped=gt.getTransfer(O.colorSpace)!==wt,O.matrixAutoUpdate===!0&&O.updateMatrix(),d.material.uniforms.uvTransform.value.copy(O.matrix),(g!==O||v!==O.version||E!==r.toneMapping)&&(d.material.needsUpdate=!0,g=O,v=O.version,E=r.toneMapping),d.layers.enableAll(),F.unshift(d,d.geometry,d.material,0,0,null))}function m(F,L){F.getRGB(Ps,Dh(r)),n.buffers.color.setClear(Ps.r,Ps.g,Ps.b,L,c)}function I(){_!==void 0&&(_.geometry.dispose(),_.material.dispose(),_=void 0),d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0)}return{getClearColor:function(){return h},setClearColor:function(F,L=1){h.set(F),f=L,m(h,f)},getClearAlpha:function(){return f},setClearAlpha:function(F){f=F,m(h,f)},render:C,addToRenderList:y,dispose:I}}function Ox(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},s=v(null);let a=s,c=!1;function h(S,k,K,Q,ee){let ce=!1;const re=g(Q,K,k);a!==re&&(a=re,d(a.object)),ce=E(S,Q,K,ee),ce&&R(S,Q,K,ee),ee!==null&&e.update(ee,r.ELEMENT_ARRAY_BUFFER),(ce||c)&&(c=!1,L(S,k,K,Q),ee!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(ee).buffer))}function f(){return r.createVertexArray()}function d(S){return r.bindVertexArray(S)}function _(S){return r.deleteVertexArray(S)}function g(S,k,K){const Q=K.wireframe===!0;let ee=n[S.id];ee===void 0&&(ee={},n[S.id]=ee);let ce=ee[k.id];ce===void 0&&(ce={},ee[k.id]=ce);let re=ce[Q];return re===void 0&&(re=v(f()),ce[Q]=re),re}function v(S){const k=[],K=[],Q=[];for(let ee=0;ee<t;ee++)k[ee]=0,K[ee]=0,Q[ee]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:k,enabledAttributes:K,attributeDivisors:Q,object:S,attributes:{},index:null}}function E(S,k,K,Q){const ee=a.attributes,ce=k.attributes;let re=0;const _e=K.getAttributes();for(const Z in _e)if(_e[Z].location>=0){const ve=ee[Z];let Pe=ce[Z];if(Pe===void 0&&(Z==="instanceMatrix"&&S.instanceMatrix&&(Pe=S.instanceMatrix),Z==="instanceColor"&&S.instanceColor&&(Pe=S.instanceColor)),ve===void 0||ve.attribute!==Pe||Pe&&ve.data!==Pe.data)return!0;re++}return a.attributesNum!==re||a.index!==Q}function R(S,k,K,Q){const ee={},ce=k.attributes;let re=0;const _e=K.getAttributes();for(const Z in _e)if(_e[Z].location>=0){let ve=ce[Z];ve===void 0&&(Z==="instanceMatrix"&&S.instanceMatrix&&(ve=S.instanceMatrix),Z==="instanceColor"&&S.instanceColor&&(ve=S.instanceColor));const Pe={};Pe.attribute=ve,ve&&ve.data&&(Pe.data=ve.data),ee[Z]=Pe,re++}a.attributes=ee,a.attributesNum=re,a.index=Q}function C(){const S=a.newAttributes;for(let k=0,K=S.length;k<K;k++)S[k]=0}function y(S){m(S,0)}function m(S,k){const K=a.newAttributes,Q=a.enabledAttributes,ee=a.attributeDivisors;K[S]=1,Q[S]===0&&(r.enableVertexAttribArray(S),Q[S]=1),ee[S]!==k&&(r.vertexAttribDivisor(S,k),ee[S]=k)}function I(){const S=a.newAttributes,k=a.enabledAttributes;for(let K=0,Q=k.length;K<Q;K++)k[K]!==S[K]&&(r.disableVertexAttribArray(K),k[K]=0)}function F(S,k,K,Q,ee,ce,re){re===!0?r.vertexAttribIPointer(S,k,K,ee,ce):r.vertexAttribPointer(S,k,K,Q,ee,ce)}function L(S,k,K,Q){C();const ee=Q.attributes,ce=K.getAttributes(),re=k.defaultAttributeValues;for(const _e in ce){const Z=ce[_e];if(Z.location>=0){let ye=ee[_e];if(ye===void 0&&(_e==="instanceMatrix"&&S.instanceMatrix&&(ye=S.instanceMatrix),_e==="instanceColor"&&S.instanceColor&&(ye=S.instanceColor)),ye!==void 0){const ve=ye.normalized,Pe=ye.itemSize,je=e.get(ye);if(je===void 0)continue;const _t=je.buffer,nt=je.type,et=je.bytesPerElement,le=nt===r.INT||nt===r.UNSIGNED_INT||ye.gpuType===$a;if(ye.isInterleavedBufferAttribute){const de=ye.data,oe=de.stride,Te=ye.offset;if(de.isInstancedInterleavedBuffer){for(let He=0;He<Z.locationSize;He++)m(Z.location+He,de.meshPerAttribute);S.isInstancedMesh!==!0&&Q._maxInstanceCount===void 0&&(Q._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let He=0;He<Z.locationSize;He++)y(Z.location+He);r.bindBuffer(r.ARRAY_BUFFER,_t);for(let He=0;He<Z.locationSize;He++)F(Z.location+He,Pe/Z.locationSize,nt,ve,oe*et,(Te+Pe/Z.locationSize*He)*et,le)}else{if(ye.isInstancedBufferAttribute){for(let de=0;de<Z.locationSize;de++)m(Z.location+de,ye.meshPerAttribute);S.isInstancedMesh!==!0&&Q._maxInstanceCount===void 0&&(Q._maxInstanceCount=ye.meshPerAttribute*ye.count)}else for(let de=0;de<Z.locationSize;de++)y(Z.location+de);r.bindBuffer(r.ARRAY_BUFFER,_t);for(let de=0;de<Z.locationSize;de++)F(Z.location+de,Pe/Z.locationSize,nt,ve,Pe*et,Pe/Z.locationSize*de*et,le)}}else if(re!==void 0){const ve=re[_e];if(ve!==void 0)switch(ve.length){case 2:r.vertexAttrib2fv(Z.location,ve);break;case 3:r.vertexAttrib3fv(Z.location,ve);break;case 4:r.vertexAttrib4fv(Z.location,ve);break;default:r.vertexAttrib1fv(Z.location,ve)}}}}I()}function O(){G();for(const S in n){const k=n[S];for(const K in k){const Q=k[K];for(const ee in Q)_(Q[ee].object),delete Q[ee];delete k[K]}delete n[S]}}function D(S){if(n[S.id]===void 0)return;const k=n[S.id];for(const K in k){const Q=k[K];for(const ee in Q)_(Q[ee].object),delete Q[ee];delete k[K]}delete n[S.id]}function z(S){for(const k in n){const K=n[k];if(K[S.id]===void 0)continue;const Q=K[S.id];for(const ee in Q)_(Q[ee].object),delete Q[ee];delete K[S.id]}}function G(){P(),c=!0,a!==s&&(a=s,d(a.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:h,reset:G,resetDefaultState:P,dispose:O,releaseStatesOfGeometry:D,releaseStatesOfProgram:z,initAttributes:C,enableAttribute:y,disableUnusedAttributes:I}}function Bx(r,e,t){let n;function s(d){n=d}function a(d,_){r.drawArrays(n,d,_),t.update(_,n,1)}function c(d,_,g){g!==0&&(r.drawArraysInstanced(n,d,_,g),t.update(_,n,g))}function h(d,_,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,d,0,_,0,g);let E=0;for(let R=0;R<g;R++)E+=_[R];t.update(E,n,1)}function f(d,_,g,v){if(g===0)return;const E=e.get("WEBGL_multi_draw");if(E===null)for(let R=0;R<d.length;R++)c(d[R],_[R],v[R]);else{E.multiDrawArraysInstancedWEBGL(n,d,0,_,0,v,0,g);let R=0;for(let C=0;C<g;C++)R+=_[C]*v[C];t.update(R,n,1)}}this.setMode=s,this.render=a,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=f}function kx(r,e,t,n){let s;function a(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const z=e.get("EXT_texture_filter_anisotropic");s=r.getParameter(z.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function c(z){return!(z!==An&&n.convert(z)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function h(z){const G=z===zr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(z!==On&&n.convert(z)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&z!==Un&&!G)}function f(z){if(z==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";z="mediump"}return z==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let d=t.precision!==void 0?t.precision:"highp";const _=f(d);_!==d&&(console.warn("THREE.WebGLRenderer:",d,"not supported, using",_,"instead."),d=_);const g=t.logarithmicDepthBuffer===!0,v=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),E=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),R=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),C=r.getParameter(r.MAX_TEXTURE_SIZE),y=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),m=r.getParameter(r.MAX_VERTEX_ATTRIBS),I=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),F=r.getParameter(r.MAX_VARYING_VECTORS),L=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),O=R>0,D=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:f,textureFormatReadable:c,textureTypeReadable:h,precision:d,logarithmicDepthBuffer:g,reversedDepthBuffer:v,maxTextures:E,maxVertexTextures:R,maxTextureSize:C,maxCubemapSize:y,maxAttributes:m,maxVertexUniforms:I,maxVaryings:F,maxFragmentUniforms:L,vertexTextures:O,maxSamples:D}}function zx(r){const e=this;let t=null,n=0,s=!1,a=!1;const c=new ai,h=new rt,f={value:null,needsUpdate:!1};this.uniform=f,this.numPlanes=0,this.numIntersection=0,this.init=function(g,v){const E=g.length!==0||v||n!==0||s;return s=v,n=g.length,E},this.beginShadows=function(){a=!0,_(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(g,v){t=_(g,v,0)},this.setState=function(g,v,E){const R=g.clippingPlanes,C=g.clipIntersection,y=g.clipShadows,m=r.get(g);if(!s||R===null||R.length===0||a&&!y)a?_(null):d();else{const I=a?0:n,F=I*4;let L=m.clippingState||null;f.value=L,L=_(R,v,F,E);for(let O=0;O!==F;++O)L[O]=t[O];m.clippingState=L,this.numIntersection=C?this.numPlanes:0,this.numPlanes+=I}};function d(){f.value!==t&&(f.value=t,f.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function _(g,v,E,R){const C=g!==null?g.length:0;let y=null;if(C!==0){if(y=f.value,R!==!0||y===null){const m=E+C*4,I=v.matrixWorldInverse;h.getNormalMatrix(I),(y===null||y.length<m)&&(y=new Float32Array(m));for(let F=0,L=E;F!==C;++F,L+=4)c.copy(g[F]).applyMatrix4(I,h),c.normal.toArray(y,L),y[L+3]=c.constant}f.value=y,f.needsUpdate=!0}return e.numPlanes=C,e.numIntersection=0,y}}function Hx(r){let e=new WeakMap;function t(c,h){return h===la?c.mapping=pr:h===ca&&(c.mapping=mr),c}function n(c){if(c&&c.isTexture){const h=c.mapping;if(h===la||h===ca)if(e.has(c)){const f=e.get(c).texture;return t(f,c.mapping)}else{const f=c.image;if(f&&f.height>0){const d=new Ug(f.height);return d.fromEquirectangularTexture(r,c),e.set(c,d),c.addEventListener("dispose",s),t(d.texture,c.mapping)}else return null}}return c}function s(c){const h=c.target;h.removeEventListener("dispose",s);const f=e.get(h);f!==void 0&&(e.delete(h),f.dispose())}function a(){e=new WeakMap}return{get:n,dispose:a}}const lr=4,Bc=[.125,.215,.35,.446,.526,.582],Di=20,Xo=new kh,kc=new it;let jo=null,$o=0,qo=0,Yo=!1;const Ci=(1+Math.sqrt(5))/2,ir=1/Ci,zc=[new X(-Ci,ir,0),new X(Ci,ir,0),new X(-ir,0,Ci),new X(ir,0,Ci),new X(0,Ci,-ir),new X(0,Ci,ir),new X(-1,1,-1),new X(1,1,-1),new X(-1,1,1),new X(1,1,1)],Vx=new X;class Ha{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,a={}){const{size:c=256,position:h=Vx}=a;jo=this._renderer.getRenderTarget(),$o=this._renderer.getActiveCubeFace(),qo=this._renderer.getActiveMipmapLevel(),Yo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(c);const f=this._allocateTargets();return f.depthBuffer=!0,this._sceneToCubeUV(e,n,s,f,h),t>0&&this._blur(f,0,0,t),this._applyPMREM(f),this._cleanup(f),f}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Gc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Vc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(jo,$o,qo),this._renderer.xr.enabled=Yo,e.scissorTest=!1,Ds(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===pr||e.mapping===mr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),jo=this._renderer.getRenderTarget(),$o=this._renderer.getActiveCubeFace(),qo=this._renderer.getActiveMipmapLevel(),Yo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:In,minFilter:In,generateMipmaps:!1,type:zr,format:An,colorSpace:_r,depthBuffer:!1},s=Hc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Hc(e,t,n);const{_lodMax:a}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Gx(a)),this._blurMaterial=Wx(a,e,t)}return s}_compileMaterial(e){const t=new Nt(this._lodPlanes[0],e);this._renderer.compile(t,Xo)}_sceneToCubeUV(e,t,n,s,a){const f=new mn(90,1,t,n),d=[1,-1,1,1,1,1],_=[1,1,1,-1,-1,-1],g=this._renderer,v=g.autoClear,E=g.toneMapping;g.getClearColor(kc),g.toneMapping=hi,g.autoClear=!1,g.state.buffers.depth.getReversed()&&(g.setRenderTarget(s),g.clearDepth(),g.setRenderTarget(null));const C=new Rh({name:"PMREM.Background",side:on,depthWrite:!1,depthTest:!1}),y=new Nt(new zi,C);let m=!1;const I=e.background;I?I.isColor&&(C.color.copy(I),e.background=null,m=!0):(C.color.copy(kc),m=!0);for(let F=0;F<6;F++){const L=F%3;L===0?(f.up.set(0,d[F],0),f.position.set(a.x,a.y,a.z),f.lookAt(a.x+_[F],a.y,a.z)):L===1?(f.up.set(0,0,d[F]),f.position.set(a.x,a.y,a.z),f.lookAt(a.x,a.y+_[F],a.z)):(f.up.set(0,d[F],0),f.position.set(a.x,a.y,a.z),f.lookAt(a.x,a.y,a.z+_[F]));const O=this._cubeSize;Ds(s,L*O,F>2?O:0,O,O),g.setRenderTarget(s),m&&g.render(y,f),g.render(e,f)}y.geometry.dispose(),y.material.dispose(),g.toneMapping=E,g.autoClear=v,e.background=I}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===pr||e.mapping===mr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Gc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Vc());const a=s?this._cubemapMaterial:this._equirectMaterial,c=new Nt(this._lodPlanes[0],a),h=a.uniforms;h.envMap.value=e;const f=this._cubeSize;Ds(t,0,0,3*f,2*f),n.setRenderTarget(t),n.render(c,Xo)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let a=1;a<s;a++){const c=Math.sqrt(this._sigmas[a]*this._sigmas[a]-this._sigmas[a-1]*this._sigmas[a-1]),h=zc[(s-a-1)%zc.length];this._blur(e,a-1,a,c,h)}t.autoClear=n}_blur(e,t,n,s,a){const c=this._pingPongRenderTarget;this._halfBlur(e,c,t,n,s,"latitudinal",a),this._halfBlur(c,e,n,n,s,"longitudinal",a)}_halfBlur(e,t,n,s,a,c,h){const f=this._renderer,d=this._blurMaterial;c!=="latitudinal"&&c!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const _=3,g=new Nt(this._lodPlanes[s],d),v=d.uniforms,E=this._sizeLods[n]-1,R=isFinite(a)?Math.PI/(2*E):2*Math.PI/(2*Di-1),C=a/R,y=isFinite(a)?1+Math.floor(_*C):Di;y>Di&&console.warn(`sigmaRadians, ${a}, is too large and will clip, as it requested ${y} samples when the maximum is set to ${Di}`);const m=[];let I=0;for(let z=0;z<Di;++z){const G=z/C,P=Math.exp(-G*G/2);m.push(P),z===0?I+=P:z<y&&(I+=2*P)}for(let z=0;z<m.length;z++)m[z]=m[z]/I;v.envMap.value=e.texture,v.samples.value=y,v.weights.value=m,v.latitudinal.value=c==="latitudinal",h&&(v.poleAxis.value=h);const{_lodMax:F}=this;v.dTheta.value=R,v.mipInt.value=F-n;const L=this._sizeLods[s],O=3*L*(s>F-lr?s-F+lr:0),D=4*(this._cubeSize-L);Ds(t,O,D,3*L,2*L),f.setRenderTarget(t),f.render(g,Xo)}}function Gx(r){const e=[],t=[],n=[];let s=r;const a=r-lr+1+Bc.length;for(let c=0;c<a;c++){const h=Math.pow(2,s);t.push(h);let f=1/h;c>r-lr?f=Bc[c-r+lr-1]:c===0&&(f=0),n.push(f);const d=1/(h-2),_=-d,g=1+d,v=[_,_,g,_,g,g,_,_,g,g,_,g],E=6,R=6,C=3,y=2,m=1,I=new Float32Array(C*R*E),F=new Float32Array(y*R*E),L=new Float32Array(m*R*E);for(let D=0;D<E;D++){const z=D%3*2/3-1,G=D>2?0:-1,P=[z,G,0,z+2/3,G,0,z+2/3,G+1,0,z,G,0,z+2/3,G+1,0,z,G+1,0];I.set(P,C*R*D),F.set(v,y*R*D);const S=[D,D,D,D,D,D];L.set(S,m*R*D)}const O=new dn;O.setAttribute("position",new un(I,C)),O.setAttribute("uv",new un(F,y)),O.setAttribute("faceIndex",new un(L,m)),e.push(O),s>lr&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Hc(r,e,t){const n=new Ni(r,e,t);return n.texture.mapping=$s,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ds(r,e,t,n,s){r.viewport.set(e,t,n,s),r.scissor.set(e,t,n,s)}function Wx(r,e,t){const n=new Float32Array(Di),s=new X(0,1,0);return new di({name:"SphericalGaussianBlur",defines:{n:Di,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ci,depthTest:!1,depthWrite:!1})}function Vc(){return new di({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ci,depthTest:!1,depthWrite:!1})}function Gc(){return new di({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ci,depthTest:!1,depthWrite:!1})}function cl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Xx(r){let e=new WeakMap,t=null;function n(h){if(h&&h.isTexture){const f=h.mapping,d=f===la||f===ca,_=f===pr||f===mr;if(d||_){let g=e.get(h);const v=g!==void 0?g.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==v)return t===null&&(t=new Ha(r)),g=d?t.fromEquirectangular(h,g):t.fromCubemap(h,g),g.texture.pmremVersion=h.pmremVersion,e.set(h,g),g.texture;if(g!==void 0)return g.texture;{const E=h.image;return d&&E&&E.height>0||_&&E&&s(E)?(t===null&&(t=new Ha(r)),g=d?t.fromEquirectangular(h):t.fromCubemap(h),g.texture.pmremVersion=h.pmremVersion,e.set(h,g),h.addEventListener("dispose",a),g.texture):null}}}return h}function s(h){let f=0;const d=6;for(let _=0;_<d;_++)h[_]!==void 0&&f++;return f===d}function a(h){const f=h.target;f.removeEventListener("dispose",a);const d=e.get(f);d!==void 0&&(e.delete(f),d.dispose())}function c(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:c}}function jx(r){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=r.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&kr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function $x(r,e,t,n){const s={},a=new WeakMap;function c(g){const v=g.target;v.index!==null&&e.remove(v.index);for(const R in v.attributes)e.remove(v.attributes[R]);v.removeEventListener("dispose",c),delete s[v.id];const E=a.get(v);E&&(e.remove(E),a.delete(v)),n.releaseStatesOfGeometry(v),v.isInstancedBufferGeometry===!0&&delete v._maxInstanceCount,t.memory.geometries--}function h(g,v){return s[v.id]===!0||(v.addEventListener("dispose",c),s[v.id]=!0,t.memory.geometries++),v}function f(g){const v=g.attributes;for(const E in v)e.update(v[E],r.ARRAY_BUFFER)}function d(g){const v=[],E=g.index,R=g.attributes.position;let C=0;if(E!==null){const I=E.array;C=E.version;for(let F=0,L=I.length;F<L;F+=3){const O=I[F+0],D=I[F+1],z=I[F+2];v.push(O,D,D,z,z,O)}}else if(R!==void 0){const I=R.array;C=R.version;for(let F=0,L=I.length/3-1;F<L;F+=3){const O=F+0,D=F+1,z=F+2;v.push(O,D,D,z,z,O)}}else return;const y=new(Th(v)?Ph:Ch)(v,1);y.version=C;const m=a.get(g);m&&e.remove(m),a.set(g,y)}function _(g){const v=a.get(g);if(v){const E=g.index;E!==null&&v.version<E.version&&d(g)}else d(g);return a.get(g)}return{get:h,update:f,getWireframeAttribute:_}}function qx(r,e,t){let n;function s(v){n=v}let a,c;function h(v){a=v.type,c=v.bytesPerElement}function f(v,E){r.drawElements(n,E,a,v*c),t.update(E,n,1)}function d(v,E,R){R!==0&&(r.drawElementsInstanced(n,E,a,v*c,R),t.update(E,n,R))}function _(v,E,R){if(R===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,E,0,a,v,0,R);let y=0;for(let m=0;m<R;m++)y+=E[m];t.update(y,n,1)}function g(v,E,R,C){if(R===0)return;const y=e.get("WEBGL_multi_draw");if(y===null)for(let m=0;m<v.length;m++)d(v[m]/c,E[m],C[m]);else{y.multiDrawElementsInstancedWEBGL(n,E,0,a,v,0,C,0,R);let m=0;for(let I=0;I<R;I++)m+=E[I]*C[I];t.update(m,n,1)}}this.setMode=s,this.setIndex=h,this.render=f,this.renderInstances=d,this.renderMultiDraw=_,this.renderMultiDrawInstances=g}function Yx(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(a,c,h){switch(t.calls++,c){case r.TRIANGLES:t.triangles+=h*(a/3);break;case r.LINES:t.lines+=h*(a/2);break;case r.LINE_STRIP:t.lines+=h*(a-1);break;case r.LINE_LOOP:t.lines+=h*a;break;case r.POINTS:t.points+=h*a;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",c);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Kx(r,e,t){const n=new WeakMap,s=new At;function a(c,h,f){const d=c.morphTargetInfluences,_=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,g=_!==void 0?_.length:0;let v=n.get(h);if(v===void 0||v.count!==g){let P=function(){z.dispose(),n.delete(h),h.removeEventListener("dispose",P)};v!==void 0&&v.texture.dispose();const E=h.morphAttributes.position!==void 0,R=h.morphAttributes.normal!==void 0,C=h.morphAttributes.color!==void 0,y=h.morphAttributes.position||[],m=h.morphAttributes.normal||[],I=h.morphAttributes.color||[];let F=0;E===!0&&(F=1),R===!0&&(F=2),C===!0&&(F=3);let L=h.attributes.position.count*F,O=1;L>e.maxTextureSize&&(O=Math.ceil(L/e.maxTextureSize),L=e.maxTextureSize);const D=new Float32Array(L*O*4*g),z=new wh(D,L,O,g);z.type=Un,z.needsUpdate=!0;const G=F*4;for(let S=0;S<g;S++){const k=y[S],K=m[S],Q=I[S],ee=L*O*4*S;for(let ce=0;ce<k.count;ce++){const re=ce*G;E===!0&&(s.fromBufferAttribute(k,ce),D[ee+re+0]=s.x,D[ee+re+1]=s.y,D[ee+re+2]=s.z,D[ee+re+3]=0),R===!0&&(s.fromBufferAttribute(K,ce),D[ee+re+4]=s.x,D[ee+re+5]=s.y,D[ee+re+6]=s.z,D[ee+re+7]=0),C===!0&&(s.fromBufferAttribute(Q,ce),D[ee+re+8]=s.x,D[ee+re+9]=s.y,D[ee+re+10]=s.z,D[ee+re+11]=Q.itemSize===4?s.w:1)}}v={count:g,texture:z,size:new Qe(L,O)},n.set(h,v),h.addEventListener("dispose",P)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)f.getUniforms().setValue(r,"morphTexture",c.morphTexture,t);else{let E=0;for(let C=0;C<d.length;C++)E+=d[C];const R=h.morphTargetsRelative?1:1-E;f.getUniforms().setValue(r,"morphTargetBaseInfluence",R),f.getUniforms().setValue(r,"morphTargetInfluences",d)}f.getUniforms().setValue(r,"morphTargetsTexture",v.texture,t),f.getUniforms().setValue(r,"morphTargetsTextureSize",v.size)}return{update:a}}function Zx(r,e,t,n){let s=new WeakMap;function a(f){const d=n.render.frame,_=f.geometry,g=e.get(f,_);if(s.get(g)!==d&&(e.update(g),s.set(g,d)),f.isInstancedMesh&&(f.hasEventListener("dispose",h)===!1&&f.addEventListener("dispose",h),s.get(f)!==d&&(t.update(f.instanceMatrix,r.ARRAY_BUFFER),f.instanceColor!==null&&t.update(f.instanceColor,r.ARRAY_BUFFER),s.set(f,d))),f.isSkinnedMesh){const v=f.skeleton;s.get(v)!==d&&(v.update(),s.set(v,d))}return g}function c(){s=new WeakMap}function h(f){const d=f.target;d.removeEventListener("dispose",h),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:a,dispose:c}}const Hh=new an,Wc=new Nh(1,1),Vh=new wh,Gh=new vg,Wh=new Fh,Xc=[],jc=[],$c=new Float32Array(16),qc=new Float32Array(9),Yc=new Float32Array(4);function xr(r,e,t){const n=r[0];if(n<=0||n>0)return r;const s=e*t;let a=Xc[s];if(a===void 0&&(a=new Float32Array(s),Xc[s]=a),e!==0){n.toArray(a,0);for(let c=1,h=0;c!==e;++c)h+=t,r[c].toArray(a,h)}return a}function jt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function $t(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function qs(r,e){let t=jc[e];t===void 0&&(t=new Int32Array(e),jc[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function Jx(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function Qx(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(jt(t,e))return;r.uniform2fv(this.addr,e),$t(t,e)}}function ey(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(jt(t,e))return;r.uniform3fv(this.addr,e),$t(t,e)}}function ty(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(jt(t,e))return;r.uniform4fv(this.addr,e),$t(t,e)}}function ny(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(jt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),$t(t,e)}else{if(jt(t,n))return;Yc.set(n),r.uniformMatrix2fv(this.addr,!1,Yc),$t(t,n)}}function iy(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(jt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),$t(t,e)}else{if(jt(t,n))return;qc.set(n),r.uniformMatrix3fv(this.addr,!1,qc),$t(t,n)}}function ry(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(jt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),$t(t,e)}else{if(jt(t,n))return;$c.set(n),r.uniformMatrix4fv(this.addr,!1,$c),$t(t,n)}}function sy(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function oy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(jt(t,e))return;r.uniform2iv(this.addr,e),$t(t,e)}}function ay(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(jt(t,e))return;r.uniform3iv(this.addr,e),$t(t,e)}}function ly(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(jt(t,e))return;r.uniform4iv(this.addr,e),$t(t,e)}}function cy(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function hy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(jt(t,e))return;r.uniform2uiv(this.addr,e),$t(t,e)}}function uy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(jt(t,e))return;r.uniform3uiv(this.addr,e),$t(t,e)}}function dy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(jt(t,e))return;r.uniform4uiv(this.addr,e),$t(t,e)}}function fy(r,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(r.uniform1i(this.addr,s),n[0]=s);let a;this.type===r.SAMPLER_2D_SHADOW?(Wc.compareFunction=Mh,a=Wc):a=Hh,t.setTexture2D(e||a,s)}function py(r,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(r.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Gh,s)}function my(r,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(r.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Wh,s)}function _y(r,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(r.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Vh,s)}function gy(r){switch(r){case 5126:return Jx;case 35664:return Qx;case 35665:return ey;case 35666:return ty;case 35674:return ny;case 35675:return iy;case 35676:return ry;case 5124:case 35670:return sy;case 35667:case 35671:return oy;case 35668:case 35672:return ay;case 35669:case 35673:return ly;case 5125:return cy;case 36294:return hy;case 36295:return uy;case 36296:return dy;case 35678:case 36198:case 36298:case 36306:case 35682:return fy;case 35679:case 36299:case 36307:return py;case 35680:case 36300:case 36308:case 36293:return my;case 36289:case 36303:case 36311:case 36292:return _y}}function vy(r,e){r.uniform1fv(this.addr,e)}function xy(r,e){const t=xr(e,this.size,2);r.uniform2fv(this.addr,t)}function yy(r,e){const t=xr(e,this.size,3);r.uniform3fv(this.addr,t)}function Ey(r,e){const t=xr(e,this.size,4);r.uniform4fv(this.addr,t)}function Sy(r,e){const t=xr(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function My(r,e){const t=xr(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function Ty(r,e){const t=xr(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function wy(r,e){r.uniform1iv(this.addr,e)}function by(r,e){r.uniform2iv(this.addr,e)}function Ay(r,e){r.uniform3iv(this.addr,e)}function Ry(r,e){r.uniform4iv(this.addr,e)}function Cy(r,e){r.uniform1uiv(this.addr,e)}function Py(r,e){r.uniform2uiv(this.addr,e)}function Dy(r,e){r.uniform3uiv(this.addr,e)}function Ly(r,e){r.uniform4uiv(this.addr,e)}function Fy(r,e,t){const n=this.cache,s=e.length,a=qs(t,s);jt(n,a)||(r.uniform1iv(this.addr,a),$t(n,a));for(let c=0;c!==s;++c)t.setTexture2D(e[c]||Hh,a[c])}function Iy(r,e,t){const n=this.cache,s=e.length,a=qs(t,s);jt(n,a)||(r.uniform1iv(this.addr,a),$t(n,a));for(let c=0;c!==s;++c)t.setTexture3D(e[c]||Gh,a[c])}function Uy(r,e,t){const n=this.cache,s=e.length,a=qs(t,s);jt(n,a)||(r.uniform1iv(this.addr,a),$t(n,a));for(let c=0;c!==s;++c)t.setTextureCube(e[c]||Wh,a[c])}function Ny(r,e,t){const n=this.cache,s=e.length,a=qs(t,s);jt(n,a)||(r.uniform1iv(this.addr,a),$t(n,a));for(let c=0;c!==s;++c)t.setTexture2DArray(e[c]||Vh,a[c])}function Oy(r){switch(r){case 5126:return vy;case 35664:return xy;case 35665:return yy;case 35666:return Ey;case 35674:return Sy;case 35675:return My;case 35676:return Ty;case 5124:case 35670:return wy;case 35667:case 35671:return by;case 35668:case 35672:return Ay;case 35669:case 35673:return Ry;case 5125:return Cy;case 36294:return Py;case 36295:return Dy;case 36296:return Ly;case 35678:case 36198:case 36298:case 36306:case 35682:return Fy;case 35679:case 36299:case 36307:return Iy;case 35680:case 36300:case 36308:case 36293:return Uy;case 36289:case 36303:case 36311:case 36292:return Ny}}class By{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=gy(t.type)}}class ky{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Oy(t.type)}}class zy{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let a=0,c=s.length;a!==c;++a){const h=s[a];h.setValue(e,t[h.id],n)}}}const Ko=/(\w+)(\])?(\[|\.)?/g;function Kc(r,e){r.seq.push(e),r.map[e.id]=e}function Hy(r,e,t){const n=r.name,s=n.length;for(Ko.lastIndex=0;;){const a=Ko.exec(n),c=Ko.lastIndex;let h=a[1];const f=a[2]==="]",d=a[3];if(f&&(h=h|0),d===void 0||d==="["&&c+2===s){Kc(t,d===void 0?new By(h,r,e):new ky(h,r,e));break}else{let g=t.map[h];g===void 0&&(g=new zy(h),Kc(t,g)),t=g}}}class zs{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const a=e.getActiveUniform(t,s),c=e.getUniformLocation(t,a.name);Hy(a,c,this)}}setValue(e,t,n,s){const a=this.map[t];a!==void 0&&a.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let a=0,c=t.length;a!==c;++a){const h=t[a],f=n[h.id];f.needsUpdate!==!1&&h.setValue(e,f.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,a=e.length;s!==a;++s){const c=e[s];c.id in t&&n.push(c)}return n}}function Zc(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const Vy=37297;let Gy=0;function Wy(r,e){const t=r.split(`
`),n=[],s=Math.max(e-6,0),a=Math.min(e+6,t.length);for(let c=s;c<a;c++){const h=c+1;n.push(`${h===e?">":" "} ${h}: ${t[c]}`)}return n.join(`
`)}const Jc=new rt;function Xy(r){gt._getMatrix(Jc,gt.workingColorSpace,r);const e=`mat3( ${Jc.elements.map(t=>t.toFixed(4))} )`;switch(gt.getTransfer(r)){case Hs:return[e,"LinearTransferOETF"];case wt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function Qc(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),a=(r.getShaderInfoLog(e)||"").trim();if(n&&a==="")return"";const c=/ERROR: 0:(\d+)/.exec(a);if(c){const h=parseInt(c[1]);return t.toUpperCase()+`

`+a+`

`+Wy(r.getShaderSource(e),h)}else return a}function jy(r,e){const t=Xy(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function $y(r,e){let t;switch(e){case j_:t="Linear";break;case $_:t="Reinhard";break;case q_:t="Cineon";break;case ph:t="ACESFilmic";break;case K_:t="AgX";break;case Z_:t="Neutral";break;case Y_:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ls=new X;function qy(){gt.getLuminanceCoefficients(Ls);const r=Ls.x.toFixed(4),e=Ls.y.toFixed(4),t=Ls.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Yy(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ir).join(`
`)}function Ky(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Zy(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const a=r.getActiveAttrib(e,s),c=a.name;let h=1;a.type===r.FLOAT_MAT2&&(h=2),a.type===r.FLOAT_MAT3&&(h=3),a.type===r.FLOAT_MAT4&&(h=4),t[c]={type:a.type,location:r.getAttribLocation(e,c),locationSize:h}}return t}function Ir(r){return r!==""}function eh(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function th(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Jy=/^[ \t]*#include +<([\w\d./]+)>/gm;function Va(r){return r.replace(Jy,eE)}const Qy=new Map;function eE(r,e){let t=at[e];if(t===void 0){const n=Qy.get(e);if(n!==void 0)t=at[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Va(t)}const tE=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function nh(r){return r.replace(tE,nE)}function nE(r,e,t,n){let s="";for(let a=parseInt(e);a<parseInt(t);a++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function ih(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function iE(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===dh?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===fh?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===$n&&(e="SHADOWMAP_TYPE_VSM"),e}function rE(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case pr:case mr:e="ENVMAP_TYPE_CUBE";break;case $s:e="ENVMAP_TYPE_CUBE_UV";break}return e}function sE(r){let e="ENVMAP_MODE_REFLECTION";return r.envMap&&r.envMapMode===mr&&(e="ENVMAP_MODE_REFRACTION"),e}function oE(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case ja:e="ENVMAP_BLENDING_MULTIPLY";break;case W_:e="ENVMAP_BLENDING_MIX";break;case X_:e="ENVMAP_BLENDING_ADD";break}return e}function aE(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function lE(r,e,t,n){const s=r.getContext(),a=t.defines;let c=t.vertexShader,h=t.fragmentShader;const f=iE(t),d=rE(t),_=sE(t),g=oE(t),v=aE(t),E=Yy(t),R=Ky(a),C=s.createProgram();let y,m,I=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(y=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,R].filter(Ir).join(`
`),y.length>0&&(y+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,R].filter(Ir).join(`
`),m.length>0&&(m+=`
`)):(y=[ih(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,R,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+_:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+f:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ir).join(`
`),m=[ih(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,R,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.envMap?"#define "+_:"",t.envMap?"#define "+g:"",v?"#define CUBEUV_TEXEL_WIDTH "+v.texelWidth:"",v?"#define CUBEUV_TEXEL_HEIGHT "+v.texelHeight:"",v?"#define CUBEUV_MAX_MIP "+v.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+f:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==hi?"#define TONE_MAPPING":"",t.toneMapping!==hi?at.tonemapping_pars_fragment:"",t.toneMapping!==hi?$y("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",at.colorspace_pars_fragment,jy("linearToOutputTexel",t.outputColorSpace),qy(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ir).join(`
`)),c=Va(c),c=eh(c,t),c=th(c,t),h=Va(h),h=eh(h,t),h=th(h,t),c=nh(c),h=nh(h),t.isRawShaderMaterial!==!0&&(I=`#version 300 es
`,y=[E,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+y,m=["#define varying in",t.glslVersion===ac?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ac?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const F=I+y+c,L=I+m+h,O=Zc(s,s.VERTEX_SHADER,F),D=Zc(s,s.FRAGMENT_SHADER,L);s.attachShader(C,O),s.attachShader(C,D),t.index0AttributeName!==void 0?s.bindAttribLocation(C,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(C,0,"position"),s.linkProgram(C);function z(k){if(r.debug.checkShaderErrors){const K=s.getProgramInfoLog(C)||"",Q=s.getShaderInfoLog(O)||"",ee=s.getShaderInfoLog(D)||"",ce=K.trim(),re=Q.trim(),_e=ee.trim();let Z=!0,ye=!0;if(s.getProgramParameter(C,s.LINK_STATUS)===!1)if(Z=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(s,C,O,D);else{const ve=Qc(s,O,"vertex"),Pe=Qc(s,D,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(C,s.VALIDATE_STATUS)+`

Material Name: `+k.name+`
Material Type: `+k.type+`

Program Info Log: `+ce+`
`+ve+`
`+Pe)}else ce!==""?console.warn("THREE.WebGLProgram: Program Info Log:",ce):(re===""||_e==="")&&(ye=!1);ye&&(k.diagnostics={runnable:Z,programLog:ce,vertexShader:{log:re,prefix:y},fragmentShader:{log:_e,prefix:m}})}s.deleteShader(O),s.deleteShader(D),G=new zs(s,C),P=Zy(s,C)}let G;this.getUniforms=function(){return G===void 0&&z(this),G};let P;this.getAttributes=function(){return P===void 0&&z(this),P};let S=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=s.getProgramParameter(C,Vy)),S},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(C),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Gy++,this.cacheKey=e,this.usedTimes=1,this.program=C,this.vertexShader=O,this.fragmentShader=D,this}let cE=0;class hE{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),a=this._getShaderStage(n),c=this._getShaderCacheForMaterial(e);return c.has(s)===!1&&(c.add(s),s.usedTimes++),c.has(a)===!1&&(c.add(a),a.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new uE(e),t.set(e,n)),n}}class uE{constructor(e){this.id=cE++,this.code=e,this.usedTimes=0}}function dE(r,e,t,n,s,a,c){const h=new bh,f=new hE,d=new Set,_=[],g=s.logarithmicDepthBuffer,v=s.vertexTextures;let E=s.precision;const R={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function C(P){return d.add(P),P===0?"uv":`uv${P}`}function y(P,S,k,K,Q){const ee=K.fog,ce=Q.geometry,re=P.isMeshStandardMaterial?K.environment:null,_e=(P.isMeshStandardMaterial?t:e).get(P.envMap||re),Z=_e&&_e.mapping===$s?_e.image.height:null,ye=R[P.type];P.precision!==null&&(E=s.getMaxPrecision(P.precision),E!==P.precision&&console.warn("THREE.WebGLProgram.getParameters:",P.precision,"not supported, using",E,"instead."));const ve=ce.morphAttributes.position||ce.morphAttributes.normal||ce.morphAttributes.color,Pe=ve!==void 0?ve.length:0;let je=0;ce.morphAttributes.position!==void 0&&(je=1),ce.morphAttributes.normal!==void 0&&(je=2),ce.morphAttributes.color!==void 0&&(je=3);let _t,nt,et,le;if(ye){const st=Fn[ye];_t=st.vertexShader,nt=st.fragmentShader}else _t=P.vertexShader,nt=P.fragmentShader,f.update(P),et=f.getVertexShaderID(P),le=f.getFragmentShaderID(P);const de=r.getRenderTarget(),oe=r.state.buffers.depth.getReversed(),Te=Q.isInstancedMesh===!0,He=Q.isBatchedMesh===!0,lt=!!P.map,Rt=!!P.matcap,B=!!_e,xt=!!P.aoMap,Je=!!P.lightMap,Ye=!!P.bumpMap,Oe=!!P.normalMap,Ct=!!P.displacementMap,Ie=!!P.emissiveMap,Ke=!!P.metalnessMap,Lt=!!P.roughnessMap,Et=P.anisotropy>0,U=P.clearcoat>0,b=P.dispersion>0,$=P.iridescence>0,ie=P.sheen>0,fe=P.transmission>0,se=Et&&!!P.anisotropyMap,Ve=U&&!!P.clearcoatMap,we=U&&!!P.clearcoatNormalMap,Be=U&&!!P.clearcoatRoughnessMap,ze=$&&!!P.iridescenceMap,Se=$&&!!P.iridescenceThicknessMap,De=ie&&!!P.sheenColorMap,$e=ie&&!!P.sheenRoughnessMap,ke=!!P.specularMap,Ae=!!P.specularColorMap,tt=!!P.specularIntensityMap,V=fe&&!!P.transmissionMap,Me=fe&&!!P.thicknessMap,be=!!P.gradientMap,Le=!!P.alphaMap,W=P.alphaTest>0,H=!!P.alphaHash,Fe=!!P.extensions;let Ze=hi;P.toneMapped&&(de===null||de.isXRRenderTarget===!0)&&(Ze=r.toneMapping);const pt={shaderID:ye,shaderType:P.type,shaderName:P.name,vertexShader:_t,fragmentShader:nt,defines:P.defines,customVertexShaderID:et,customFragmentShaderID:le,isRawShaderMaterial:P.isRawShaderMaterial===!0,glslVersion:P.glslVersion,precision:E,batching:He,batchingColor:He&&Q._colorsTexture!==null,instancing:Te,instancingColor:Te&&Q.instanceColor!==null,instancingMorph:Te&&Q.morphTexture!==null,supportsVertexTextures:v,outputColorSpace:de===null?r.outputColorSpace:de.isXRRenderTarget===!0?de.texture.colorSpace:_r,alphaToCoverage:!!P.alphaToCoverage,map:lt,matcap:Rt,envMap:B,envMapMode:B&&_e.mapping,envMapCubeUVHeight:Z,aoMap:xt,lightMap:Je,bumpMap:Ye,normalMap:Oe,displacementMap:v&&Ct,emissiveMap:Ie,normalMapObjectSpace:Oe&&P.normalMapType===tg,normalMapTangentSpace:Oe&&P.normalMapType===el,metalnessMap:Ke,roughnessMap:Lt,anisotropy:Et,anisotropyMap:se,clearcoat:U,clearcoatMap:Ve,clearcoatNormalMap:we,clearcoatRoughnessMap:Be,dispersion:b,iridescence:$,iridescenceMap:ze,iridescenceThicknessMap:Se,sheen:ie,sheenColorMap:De,sheenRoughnessMap:$e,specularMap:ke,specularColorMap:Ae,specularIntensityMap:tt,transmission:fe,transmissionMap:V,thicknessMap:Me,gradientMap:be,opaque:P.transparent===!1&&P.blending===ur&&P.alphaToCoverage===!1,alphaMap:Le,alphaTest:W,alphaHash:H,combine:P.combine,mapUv:lt&&C(P.map.channel),aoMapUv:xt&&C(P.aoMap.channel),lightMapUv:Je&&C(P.lightMap.channel),bumpMapUv:Ye&&C(P.bumpMap.channel),normalMapUv:Oe&&C(P.normalMap.channel),displacementMapUv:Ct&&C(P.displacementMap.channel),emissiveMapUv:Ie&&C(P.emissiveMap.channel),metalnessMapUv:Ke&&C(P.metalnessMap.channel),roughnessMapUv:Lt&&C(P.roughnessMap.channel),anisotropyMapUv:se&&C(P.anisotropyMap.channel),clearcoatMapUv:Ve&&C(P.clearcoatMap.channel),clearcoatNormalMapUv:we&&C(P.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Be&&C(P.clearcoatRoughnessMap.channel),iridescenceMapUv:ze&&C(P.iridescenceMap.channel),iridescenceThicknessMapUv:Se&&C(P.iridescenceThicknessMap.channel),sheenColorMapUv:De&&C(P.sheenColorMap.channel),sheenRoughnessMapUv:$e&&C(P.sheenRoughnessMap.channel),specularMapUv:ke&&C(P.specularMap.channel),specularColorMapUv:Ae&&C(P.specularColorMap.channel),specularIntensityMapUv:tt&&C(P.specularIntensityMap.channel),transmissionMapUv:V&&C(P.transmissionMap.channel),thicknessMapUv:Me&&C(P.thicknessMap.channel),alphaMapUv:Le&&C(P.alphaMap.channel),vertexTangents:!!ce.attributes.tangent&&(Oe||Et),vertexColors:P.vertexColors,vertexAlphas:P.vertexColors===!0&&!!ce.attributes.color&&ce.attributes.color.itemSize===4,pointsUvs:Q.isPoints===!0&&!!ce.attributes.uv&&(lt||Le),fog:!!ee,useFog:P.fog===!0,fogExp2:!!ee&&ee.isFogExp2,flatShading:P.flatShading===!0&&P.wireframe===!1,sizeAttenuation:P.sizeAttenuation===!0,logarithmicDepthBuffer:g,reversedDepthBuffer:oe,skinning:Q.isSkinnedMesh===!0,morphTargets:ce.morphAttributes.position!==void 0,morphNormals:ce.morphAttributes.normal!==void 0,morphColors:ce.morphAttributes.color!==void 0,morphTargetsCount:Pe,morphTextureStride:je,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:P.dithering,shadowMapEnabled:r.shadowMap.enabled&&k.length>0,shadowMapType:r.shadowMap.type,toneMapping:Ze,decodeVideoTexture:lt&&P.map.isVideoTexture===!0&&gt.getTransfer(P.map.colorSpace)===wt,decodeVideoTextureEmissive:Ie&&P.emissiveMap.isVideoTexture===!0&&gt.getTransfer(P.emissiveMap.colorSpace)===wt,premultipliedAlpha:P.premultipliedAlpha,doubleSided:P.side===Yn,flipSided:P.side===on,useDepthPacking:P.depthPacking>=0,depthPacking:P.depthPacking||0,index0AttributeName:P.index0AttributeName,extensionClipCullDistance:Fe&&P.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Fe&&P.extensions.multiDraw===!0||He)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:P.customProgramCacheKey()};return pt.vertexUv1s=d.has(1),pt.vertexUv2s=d.has(2),pt.vertexUv3s=d.has(3),d.clear(),pt}function m(P){const S=[];if(P.shaderID?S.push(P.shaderID):(S.push(P.customVertexShaderID),S.push(P.customFragmentShaderID)),P.defines!==void 0)for(const k in P.defines)S.push(k),S.push(P.defines[k]);return P.isRawShaderMaterial===!1&&(I(S,P),F(S,P),S.push(r.outputColorSpace)),S.push(P.customProgramCacheKey),S.join()}function I(P,S){P.push(S.precision),P.push(S.outputColorSpace),P.push(S.envMapMode),P.push(S.envMapCubeUVHeight),P.push(S.mapUv),P.push(S.alphaMapUv),P.push(S.lightMapUv),P.push(S.aoMapUv),P.push(S.bumpMapUv),P.push(S.normalMapUv),P.push(S.displacementMapUv),P.push(S.emissiveMapUv),P.push(S.metalnessMapUv),P.push(S.roughnessMapUv),P.push(S.anisotropyMapUv),P.push(S.clearcoatMapUv),P.push(S.clearcoatNormalMapUv),P.push(S.clearcoatRoughnessMapUv),P.push(S.iridescenceMapUv),P.push(S.iridescenceThicknessMapUv),P.push(S.sheenColorMapUv),P.push(S.sheenRoughnessMapUv),P.push(S.specularMapUv),P.push(S.specularColorMapUv),P.push(S.specularIntensityMapUv),P.push(S.transmissionMapUv),P.push(S.thicknessMapUv),P.push(S.combine),P.push(S.fogExp2),P.push(S.sizeAttenuation),P.push(S.morphTargetsCount),P.push(S.morphAttributeCount),P.push(S.numDirLights),P.push(S.numPointLights),P.push(S.numSpotLights),P.push(S.numSpotLightMaps),P.push(S.numHemiLights),P.push(S.numRectAreaLights),P.push(S.numDirLightShadows),P.push(S.numPointLightShadows),P.push(S.numSpotLightShadows),P.push(S.numSpotLightShadowsWithMaps),P.push(S.numLightProbes),P.push(S.shadowMapType),P.push(S.toneMapping),P.push(S.numClippingPlanes),P.push(S.numClipIntersection),P.push(S.depthPacking)}function F(P,S){h.disableAll(),S.supportsVertexTextures&&h.enable(0),S.instancing&&h.enable(1),S.instancingColor&&h.enable(2),S.instancingMorph&&h.enable(3),S.matcap&&h.enable(4),S.envMap&&h.enable(5),S.normalMapObjectSpace&&h.enable(6),S.normalMapTangentSpace&&h.enable(7),S.clearcoat&&h.enable(8),S.iridescence&&h.enable(9),S.alphaTest&&h.enable(10),S.vertexColors&&h.enable(11),S.vertexAlphas&&h.enable(12),S.vertexUv1s&&h.enable(13),S.vertexUv2s&&h.enable(14),S.vertexUv3s&&h.enable(15),S.vertexTangents&&h.enable(16),S.anisotropy&&h.enable(17),S.alphaHash&&h.enable(18),S.batching&&h.enable(19),S.dispersion&&h.enable(20),S.batchingColor&&h.enable(21),S.gradientMap&&h.enable(22),P.push(h.mask),h.disableAll(),S.fog&&h.enable(0),S.useFog&&h.enable(1),S.flatShading&&h.enable(2),S.logarithmicDepthBuffer&&h.enable(3),S.reversedDepthBuffer&&h.enable(4),S.skinning&&h.enable(5),S.morphTargets&&h.enable(6),S.morphNormals&&h.enable(7),S.morphColors&&h.enable(8),S.premultipliedAlpha&&h.enable(9),S.shadowMapEnabled&&h.enable(10),S.doubleSided&&h.enable(11),S.flipSided&&h.enable(12),S.useDepthPacking&&h.enable(13),S.dithering&&h.enable(14),S.transmission&&h.enable(15),S.sheen&&h.enable(16),S.opaque&&h.enable(17),S.pointsUvs&&h.enable(18),S.decodeVideoTexture&&h.enable(19),S.decodeVideoTextureEmissive&&h.enable(20),S.alphaToCoverage&&h.enable(21),P.push(h.mask)}function L(P){const S=R[P.type];let k;if(S){const K=Fn[S];k=Dg.clone(K.uniforms)}else k=P.uniforms;return k}function O(P,S){let k;for(let K=0,Q=_.length;K<Q;K++){const ee=_[K];if(ee.cacheKey===S){k=ee,++k.usedTimes;break}}return k===void 0&&(k=new lE(r,S,P,a),_.push(k)),k}function D(P){if(--P.usedTimes===0){const S=_.indexOf(P);_[S]=_[_.length-1],_.pop(),P.destroy()}}function z(P){f.remove(P)}function G(){f.dispose()}return{getParameters:y,getProgramCacheKey:m,getUniforms:L,acquireProgram:O,releaseProgram:D,releaseShaderCache:z,programs:_,dispose:G}}function fE(){let r=new WeakMap;function e(c){return r.has(c)}function t(c){let h=r.get(c);return h===void 0&&(h={},r.set(c,h)),h}function n(c){r.delete(c)}function s(c,h,f){r.get(c)[h]=f}function a(){r=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:a}}function pE(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function rh(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function sh(){const r=[];let e=0;const t=[],n=[],s=[];function a(){e=0,t.length=0,n.length=0,s.length=0}function c(g,v,E,R,C,y){let m=r[e];return m===void 0?(m={id:g.id,object:g,geometry:v,material:E,groupOrder:R,renderOrder:g.renderOrder,z:C,group:y},r[e]=m):(m.id=g.id,m.object=g,m.geometry=v,m.material=E,m.groupOrder=R,m.renderOrder=g.renderOrder,m.z=C,m.group=y),e++,m}function h(g,v,E,R,C,y){const m=c(g,v,E,R,C,y);E.transmission>0?n.push(m):E.transparent===!0?s.push(m):t.push(m)}function f(g,v,E,R,C,y){const m=c(g,v,E,R,C,y);E.transmission>0?n.unshift(m):E.transparent===!0?s.unshift(m):t.unshift(m)}function d(g,v){t.length>1&&t.sort(g||pE),n.length>1&&n.sort(v||rh),s.length>1&&s.sort(v||rh)}function _(){for(let g=e,v=r.length;g<v;g++){const E=r[g];if(E.id===null)break;E.id=null,E.object=null,E.geometry=null,E.material=null,E.group=null}}return{opaque:t,transmissive:n,transparent:s,init:a,push:h,unshift:f,finish:_,sort:d}}function mE(){let r=new WeakMap;function e(n,s){const a=r.get(n);let c;return a===void 0?(c=new sh,r.set(n,[c])):s>=a.length?(c=new sh,a.push(c)):c=a[s],c}function t(){r=new WeakMap}return{get:e,dispose:t}}function _E(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new X,color:new it};break;case"SpotLight":t={position:new X,direction:new X,color:new it,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new X,color:new it,distance:0,decay:0};break;case"HemisphereLight":t={direction:new X,skyColor:new it,groundColor:new it};break;case"RectAreaLight":t={color:new it,position:new X,halfWidth:new X,halfHeight:new X};break}return r[e.id]=t,t}}}function gE(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Qe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Qe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Qe,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let vE=0;function xE(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function yE(r){const e=new _E,t=gE(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let d=0;d<9;d++)n.probe.push(new X);const s=new X,a=new Dt,c=new Dt;function h(d){let _=0,g=0,v=0;for(let P=0;P<9;P++)n.probe[P].set(0,0,0);let E=0,R=0,C=0,y=0,m=0,I=0,F=0,L=0,O=0,D=0,z=0;d.sort(xE);for(let P=0,S=d.length;P<S;P++){const k=d[P],K=k.color,Q=k.intensity,ee=k.distance,ce=k.shadow&&k.shadow.map?k.shadow.map.texture:null;if(k.isAmbientLight)_+=K.r*Q,g+=K.g*Q,v+=K.b*Q;else if(k.isLightProbe){for(let re=0;re<9;re++)n.probe[re].addScaledVector(k.sh.coefficients[re],Q);z++}else if(k.isDirectionalLight){const re=e.get(k);if(re.color.copy(k.color).multiplyScalar(k.intensity),k.castShadow){const _e=k.shadow,Z=t.get(k);Z.shadowIntensity=_e.intensity,Z.shadowBias=_e.bias,Z.shadowNormalBias=_e.normalBias,Z.shadowRadius=_e.radius,Z.shadowMapSize=_e.mapSize,n.directionalShadow[E]=Z,n.directionalShadowMap[E]=ce,n.directionalShadowMatrix[E]=k.shadow.matrix,I++}n.directional[E]=re,E++}else if(k.isSpotLight){const re=e.get(k);re.position.setFromMatrixPosition(k.matrixWorld),re.color.copy(K).multiplyScalar(Q),re.distance=ee,re.coneCos=Math.cos(k.angle),re.penumbraCos=Math.cos(k.angle*(1-k.penumbra)),re.decay=k.decay,n.spot[C]=re;const _e=k.shadow;if(k.map&&(n.spotLightMap[O]=k.map,O++,_e.updateMatrices(k),k.castShadow&&D++),n.spotLightMatrix[C]=_e.matrix,k.castShadow){const Z=t.get(k);Z.shadowIntensity=_e.intensity,Z.shadowBias=_e.bias,Z.shadowNormalBias=_e.normalBias,Z.shadowRadius=_e.radius,Z.shadowMapSize=_e.mapSize,n.spotShadow[C]=Z,n.spotShadowMap[C]=ce,L++}C++}else if(k.isRectAreaLight){const re=e.get(k);re.color.copy(K).multiplyScalar(Q),re.halfWidth.set(k.width*.5,0,0),re.halfHeight.set(0,k.height*.5,0),n.rectArea[y]=re,y++}else if(k.isPointLight){const re=e.get(k);if(re.color.copy(k.color).multiplyScalar(k.intensity),re.distance=k.distance,re.decay=k.decay,k.castShadow){const _e=k.shadow,Z=t.get(k);Z.shadowIntensity=_e.intensity,Z.shadowBias=_e.bias,Z.shadowNormalBias=_e.normalBias,Z.shadowRadius=_e.radius,Z.shadowMapSize=_e.mapSize,Z.shadowCameraNear=_e.camera.near,Z.shadowCameraFar=_e.camera.far,n.pointShadow[R]=Z,n.pointShadowMap[R]=ce,n.pointShadowMatrix[R]=k.shadow.matrix,F++}n.point[R]=re,R++}else if(k.isHemisphereLight){const re=e.get(k);re.skyColor.copy(k.color).multiplyScalar(Q),re.groundColor.copy(k.groundColor).multiplyScalar(Q),n.hemi[m]=re,m++}}y>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ce.LTC_FLOAT_1,n.rectAreaLTC2=Ce.LTC_FLOAT_2):(n.rectAreaLTC1=Ce.LTC_HALF_1,n.rectAreaLTC2=Ce.LTC_HALF_2)),n.ambient[0]=_,n.ambient[1]=g,n.ambient[2]=v;const G=n.hash;(G.directionalLength!==E||G.pointLength!==R||G.spotLength!==C||G.rectAreaLength!==y||G.hemiLength!==m||G.numDirectionalShadows!==I||G.numPointShadows!==F||G.numSpotShadows!==L||G.numSpotMaps!==O||G.numLightProbes!==z)&&(n.directional.length=E,n.spot.length=C,n.rectArea.length=y,n.point.length=R,n.hemi.length=m,n.directionalShadow.length=I,n.directionalShadowMap.length=I,n.pointShadow.length=F,n.pointShadowMap.length=F,n.spotShadow.length=L,n.spotShadowMap.length=L,n.directionalShadowMatrix.length=I,n.pointShadowMatrix.length=F,n.spotLightMatrix.length=L+O-D,n.spotLightMap.length=O,n.numSpotLightShadowsWithMaps=D,n.numLightProbes=z,G.directionalLength=E,G.pointLength=R,G.spotLength=C,G.rectAreaLength=y,G.hemiLength=m,G.numDirectionalShadows=I,G.numPointShadows=F,G.numSpotShadows=L,G.numSpotMaps=O,G.numLightProbes=z,n.version=vE++)}function f(d,_){let g=0,v=0,E=0,R=0,C=0;const y=_.matrixWorldInverse;for(let m=0,I=d.length;m<I;m++){const F=d[m];if(F.isDirectionalLight){const L=n.directional[g];L.direction.setFromMatrixPosition(F.matrixWorld),s.setFromMatrixPosition(F.target.matrixWorld),L.direction.sub(s),L.direction.transformDirection(y),g++}else if(F.isSpotLight){const L=n.spot[E];L.position.setFromMatrixPosition(F.matrixWorld),L.position.applyMatrix4(y),L.direction.setFromMatrixPosition(F.matrixWorld),s.setFromMatrixPosition(F.target.matrixWorld),L.direction.sub(s),L.direction.transformDirection(y),E++}else if(F.isRectAreaLight){const L=n.rectArea[R];L.position.setFromMatrixPosition(F.matrixWorld),L.position.applyMatrix4(y),c.identity(),a.copy(F.matrixWorld),a.premultiply(y),c.extractRotation(a),L.halfWidth.set(F.width*.5,0,0),L.halfHeight.set(0,F.height*.5,0),L.halfWidth.applyMatrix4(c),L.halfHeight.applyMatrix4(c),R++}else if(F.isPointLight){const L=n.point[v];L.position.setFromMatrixPosition(F.matrixWorld),L.position.applyMatrix4(y),v++}else if(F.isHemisphereLight){const L=n.hemi[C];L.direction.setFromMatrixPosition(F.matrixWorld),L.direction.transformDirection(y),C++}}}return{setup:h,setupView:f,state:n}}function oh(r){const e=new yE(r),t=[],n=[];function s(_){d.camera=_,t.length=0,n.length=0}function a(_){t.push(_)}function c(_){n.push(_)}function h(){e.setup(t)}function f(_){e.setupView(t,_)}const d={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:d,setupLights:h,setupLightsView:f,pushLight:a,pushShadow:c}}function EE(r){let e=new WeakMap;function t(s,a=0){const c=e.get(s);let h;return c===void 0?(h=new oh(r),e.set(s,[h])):a>=c.length?(h=new oh(r),c.push(h)):h=c[a],h}function n(){e=new WeakMap}return{get:t,dispose:n}}const SE=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ME=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function TE(r,e,t){let n=new rl;const s=new Qe,a=new Qe,c=new At,h=new Xg({depthPacking:eg}),f=new jg,d={},_=t.maxTextureSize,g={[ui]:on,[on]:ui,[Yn]:Yn},v=new di({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Qe},radius:{value:4}},vertexShader:SE,fragmentShader:ME}),E=v.clone();E.defines.HORIZONTAL_PASS=1;const R=new dn;R.setAttribute("position",new un(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const C=new Nt(R,v),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=dh;let m=this.type;this.render=function(D,z,G){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||D.length===0)return;const P=r.getRenderTarget(),S=r.getActiveCubeFace(),k=r.getActiveMipmapLevel(),K=r.state;K.setBlending(ci),K.buffers.depth.getReversed()===!0?K.buffers.color.setClear(0,0,0,0):K.buffers.color.setClear(1,1,1,1),K.buffers.depth.setTest(!0),K.setScissorTest(!1);const Q=m!==$n&&this.type===$n,ee=m===$n&&this.type!==$n;for(let ce=0,re=D.length;ce<re;ce++){const _e=D[ce],Z=_e.shadow;if(Z===void 0){console.warn("THREE.WebGLShadowMap:",_e,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;s.copy(Z.mapSize);const ye=Z.getFrameExtents();if(s.multiply(ye),a.copy(Z.mapSize),(s.x>_||s.y>_)&&(s.x>_&&(a.x=Math.floor(_/ye.x),s.x=a.x*ye.x,Z.mapSize.x=a.x),s.y>_&&(a.y=Math.floor(_/ye.y),s.y=a.y*ye.y,Z.mapSize.y=a.y)),Z.map===null||Q===!0||ee===!0){const Pe=this.type!==$n?{minFilter:_n,magFilter:_n}:{};Z.map!==null&&Z.map.dispose(),Z.map=new Ni(s.x,s.y,Pe),Z.map.texture.name=_e.name+".shadowMap",Z.camera.updateProjectionMatrix()}r.setRenderTarget(Z.map),r.clear();const ve=Z.getViewportCount();for(let Pe=0;Pe<ve;Pe++){const je=Z.getViewport(Pe);c.set(a.x*je.x,a.y*je.y,a.x*je.z,a.y*je.w),K.viewport(c),Z.updateMatrices(_e,Pe),n=Z.getFrustum(),L(z,G,Z.camera,_e,this.type)}Z.isPointLightShadow!==!0&&this.type===$n&&I(Z,G),Z.needsUpdate=!1}m=this.type,y.needsUpdate=!1,r.setRenderTarget(P,S,k)};function I(D,z){const G=e.update(C);v.defines.VSM_SAMPLES!==D.blurSamples&&(v.defines.VSM_SAMPLES=D.blurSamples,E.defines.VSM_SAMPLES=D.blurSamples,v.needsUpdate=!0,E.needsUpdate=!0),D.mapPass===null&&(D.mapPass=new Ni(s.x,s.y)),v.uniforms.shadow_pass.value=D.map.texture,v.uniforms.resolution.value=D.mapSize,v.uniforms.radius.value=D.radius,r.setRenderTarget(D.mapPass),r.clear(),r.renderBufferDirect(z,null,G,v,C,null),E.uniforms.shadow_pass.value=D.mapPass.texture,E.uniforms.resolution.value=D.mapSize,E.uniforms.radius.value=D.radius,r.setRenderTarget(D.map),r.clear(),r.renderBufferDirect(z,null,G,E,C,null)}function F(D,z,G,P){let S=null;const k=G.isPointLight===!0?D.customDistanceMaterial:D.customDepthMaterial;if(k!==void 0)S=k;else if(S=G.isPointLight===!0?f:h,r.localClippingEnabled&&z.clipShadows===!0&&Array.isArray(z.clippingPlanes)&&z.clippingPlanes.length!==0||z.displacementMap&&z.displacementScale!==0||z.alphaMap&&z.alphaTest>0||z.map&&z.alphaTest>0||z.alphaToCoverage===!0){const K=S.uuid,Q=z.uuid;let ee=d[K];ee===void 0&&(ee={},d[K]=ee);let ce=ee[Q];ce===void 0&&(ce=S.clone(),ee[Q]=ce,z.addEventListener("dispose",O)),S=ce}if(S.visible=z.visible,S.wireframe=z.wireframe,P===$n?S.side=z.shadowSide!==null?z.shadowSide:z.side:S.side=z.shadowSide!==null?z.shadowSide:g[z.side],S.alphaMap=z.alphaMap,S.alphaTest=z.alphaToCoverage===!0?.5:z.alphaTest,S.map=z.map,S.clipShadows=z.clipShadows,S.clippingPlanes=z.clippingPlanes,S.clipIntersection=z.clipIntersection,S.displacementMap=z.displacementMap,S.displacementScale=z.displacementScale,S.displacementBias=z.displacementBias,S.wireframeLinewidth=z.wireframeLinewidth,S.linewidth=z.linewidth,G.isPointLight===!0&&S.isMeshDistanceMaterial===!0){const K=r.properties.get(S);K.light=G}return S}function L(D,z,G,P,S){if(D.visible===!1)return;if(D.layers.test(z.layers)&&(D.isMesh||D.isLine||D.isPoints)&&(D.castShadow||D.receiveShadow&&S===$n)&&(!D.frustumCulled||n.intersectsObject(D))){D.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,D.matrixWorld);const Q=e.update(D),ee=D.material;if(Array.isArray(ee)){const ce=Q.groups;for(let re=0,_e=ce.length;re<_e;re++){const Z=ce[re],ye=ee[Z.materialIndex];if(ye&&ye.visible){const ve=F(D,ye,P,S);D.onBeforeShadow(r,D,z,G,Q,ve,Z),r.renderBufferDirect(G,null,Q,ve,D,Z),D.onAfterShadow(r,D,z,G,Q,ve,Z)}}}else if(ee.visible){const ce=F(D,ee,P,S);D.onBeforeShadow(r,D,z,G,Q,ce,null),r.renderBufferDirect(G,null,Q,ce,D,null),D.onAfterShadow(r,D,z,G,Q,ce,null)}}const K=D.children;for(let Q=0,ee=K.length;Q<ee;Q++)L(K[Q],z,G,P,S)}function O(D){D.target.removeEventListener("dispose",O);for(const G in d){const P=d[G],S=D.target.uuid;S in P&&(P[S].dispose(),delete P[S])}}}const wE={[ta]:na,[ia]:oa,[ra]:aa,[fr]:sa,[na]:ta,[oa]:ia,[aa]:ra,[sa]:fr};function bE(r,e){function t(){let V=!1;const Me=new At;let be=null;const Le=new At(0,0,0,0);return{setMask:function(W){be!==W&&!V&&(r.colorMask(W,W,W,W),be=W)},setLocked:function(W){V=W},setClear:function(W,H,Fe,Ze,pt){pt===!0&&(W*=Ze,H*=Ze,Fe*=Ze),Me.set(W,H,Fe,Ze),Le.equals(Me)===!1&&(r.clearColor(W,H,Fe,Ze),Le.copy(Me))},reset:function(){V=!1,be=null,Le.set(-1,0,0,0)}}}function n(){let V=!1,Me=!1,be=null,Le=null,W=null;return{setReversed:function(H){if(Me!==H){const Fe=e.get("EXT_clip_control");H?Fe.clipControlEXT(Fe.LOWER_LEFT_EXT,Fe.ZERO_TO_ONE_EXT):Fe.clipControlEXT(Fe.LOWER_LEFT_EXT,Fe.NEGATIVE_ONE_TO_ONE_EXT),Me=H;const Ze=W;W=null,this.setClear(Ze)}},getReversed:function(){return Me},setTest:function(H){H?de(r.DEPTH_TEST):oe(r.DEPTH_TEST)},setMask:function(H){be!==H&&!V&&(r.depthMask(H),be=H)},setFunc:function(H){if(Me&&(H=wE[H]),Le!==H){switch(H){case ta:r.depthFunc(r.NEVER);break;case na:r.depthFunc(r.ALWAYS);break;case ia:r.depthFunc(r.LESS);break;case fr:r.depthFunc(r.LEQUAL);break;case ra:r.depthFunc(r.EQUAL);break;case sa:r.depthFunc(r.GEQUAL);break;case oa:r.depthFunc(r.GREATER);break;case aa:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}Le=H}},setLocked:function(H){V=H},setClear:function(H){W!==H&&(Me&&(H=1-H),r.clearDepth(H),W=H)},reset:function(){V=!1,be=null,Le=null,W=null,Me=!1}}}function s(){let V=!1,Me=null,be=null,Le=null,W=null,H=null,Fe=null,Ze=null,pt=null;return{setTest:function(st){V||(st?de(r.STENCIL_TEST):oe(r.STENCIL_TEST))},setMask:function(st){Me!==st&&!V&&(r.stencilMask(st),Me=st)},setFunc:function(st,En,Ot){(be!==st||Le!==En||W!==Ot)&&(r.stencilFunc(st,En,Ot),be=st,Le=En,W=Ot)},setOp:function(st,En,Ot){(H!==st||Fe!==En||Ze!==Ot)&&(r.stencilOp(st,En,Ot),H=st,Fe=En,Ze=Ot)},setLocked:function(st){V=st},setClear:function(st){pt!==st&&(r.clearStencil(st),pt=st)},reset:function(){V=!1,Me=null,be=null,Le=null,W=null,H=null,Fe=null,Ze=null,pt=null}}}const a=new t,c=new n,h=new s,f=new WeakMap,d=new WeakMap;let _={},g={},v=new WeakMap,E=[],R=null,C=!1,y=null,m=null,I=null,F=null,L=null,O=null,D=null,z=new it(0,0,0),G=0,P=!1,S=null,k=null,K=null,Q=null,ee=null;const ce=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let re=!1,_e=0;const Z=r.getParameter(r.VERSION);Z.indexOf("WebGL")!==-1?(_e=parseFloat(/^WebGL (\d)/.exec(Z)[1]),re=_e>=1):Z.indexOf("OpenGL ES")!==-1&&(_e=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),re=_e>=2);let ye=null,ve={};const Pe=r.getParameter(r.SCISSOR_BOX),je=r.getParameter(r.VIEWPORT),_t=new At().fromArray(Pe),nt=new At().fromArray(je);function et(V,Me,be,Le){const W=new Uint8Array(4),H=r.createTexture();r.bindTexture(V,H),r.texParameteri(V,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(V,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let Fe=0;Fe<be;Fe++)V===r.TEXTURE_3D||V===r.TEXTURE_2D_ARRAY?r.texImage3D(Me,0,r.RGBA,1,1,Le,0,r.RGBA,r.UNSIGNED_BYTE,W):r.texImage2D(Me+Fe,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,W);return H}const le={};le[r.TEXTURE_2D]=et(r.TEXTURE_2D,r.TEXTURE_2D,1),le[r.TEXTURE_CUBE_MAP]=et(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[r.TEXTURE_2D_ARRAY]=et(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),le[r.TEXTURE_3D]=et(r.TEXTURE_3D,r.TEXTURE_3D,1,1),a.setClear(0,0,0,1),c.setClear(1),h.setClear(0),de(r.DEPTH_TEST),c.setFunc(fr),Ye(!1),Oe(tc),de(r.CULL_FACE),xt(ci);function de(V){_[V]!==!0&&(r.enable(V),_[V]=!0)}function oe(V){_[V]!==!1&&(r.disable(V),_[V]=!1)}function Te(V,Me){return g[V]!==Me?(r.bindFramebuffer(V,Me),g[V]=Me,V===r.DRAW_FRAMEBUFFER&&(g[r.FRAMEBUFFER]=Me),V===r.FRAMEBUFFER&&(g[r.DRAW_FRAMEBUFFER]=Me),!0):!1}function He(V,Me){let be=E,Le=!1;if(V){be=v.get(Me),be===void 0&&(be=[],v.set(Me,be));const W=V.textures;if(be.length!==W.length||be[0]!==r.COLOR_ATTACHMENT0){for(let H=0,Fe=W.length;H<Fe;H++)be[H]=r.COLOR_ATTACHMENT0+H;be.length=W.length,Le=!0}}else be[0]!==r.BACK&&(be[0]=r.BACK,Le=!0);Le&&r.drawBuffers(be)}function lt(V){return R!==V?(r.useProgram(V),R=V,!0):!1}const Rt={[Pi]:r.FUNC_ADD,[A_]:r.FUNC_SUBTRACT,[R_]:r.FUNC_REVERSE_SUBTRACT};Rt[C_]=r.MIN,Rt[P_]=r.MAX;const B={[D_]:r.ZERO,[L_]:r.ONE,[F_]:r.SRC_COLOR,[Qo]:r.SRC_ALPHA,[k_]:r.SRC_ALPHA_SATURATE,[O_]:r.DST_COLOR,[U_]:r.DST_ALPHA,[I_]:r.ONE_MINUS_SRC_COLOR,[ea]:r.ONE_MINUS_SRC_ALPHA,[B_]:r.ONE_MINUS_DST_COLOR,[N_]:r.ONE_MINUS_DST_ALPHA,[z_]:r.CONSTANT_COLOR,[H_]:r.ONE_MINUS_CONSTANT_COLOR,[V_]:r.CONSTANT_ALPHA,[G_]:r.ONE_MINUS_CONSTANT_ALPHA};function xt(V,Me,be,Le,W,H,Fe,Ze,pt,st){if(V===ci){C===!0&&(oe(r.BLEND),C=!1);return}if(C===!1&&(de(r.BLEND),C=!0),V!==b_){if(V!==y||st!==P){if((m!==Pi||L!==Pi)&&(r.blendEquation(r.FUNC_ADD),m=Pi,L=Pi),st)switch(V){case ur:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case nc:r.blendFunc(r.ONE,r.ONE);break;case ic:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case rc:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}else switch(V){case ur:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case nc:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case ic:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case rc:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}I=null,F=null,O=null,D=null,z.set(0,0,0),G=0,y=V,P=st}return}W=W||Me,H=H||be,Fe=Fe||Le,(Me!==m||W!==L)&&(r.blendEquationSeparate(Rt[Me],Rt[W]),m=Me,L=W),(be!==I||Le!==F||H!==O||Fe!==D)&&(r.blendFuncSeparate(B[be],B[Le],B[H],B[Fe]),I=be,F=Le,O=H,D=Fe),(Ze.equals(z)===!1||pt!==G)&&(r.blendColor(Ze.r,Ze.g,Ze.b,pt),z.copy(Ze),G=pt),y=V,P=!1}function Je(V,Me){V.side===Yn?oe(r.CULL_FACE):de(r.CULL_FACE);let be=V.side===on;Me&&(be=!be),Ye(be),V.blending===ur&&V.transparent===!1?xt(ci):xt(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),c.setFunc(V.depthFunc),c.setTest(V.depthTest),c.setMask(V.depthWrite),a.setMask(V.colorWrite);const Le=V.stencilWrite;h.setTest(Le),Le&&(h.setMask(V.stencilWriteMask),h.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),h.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),Ie(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?de(r.SAMPLE_ALPHA_TO_COVERAGE):oe(r.SAMPLE_ALPHA_TO_COVERAGE)}function Ye(V){S!==V&&(V?r.frontFace(r.CW):r.frontFace(r.CCW),S=V)}function Oe(V){V!==T_?(de(r.CULL_FACE),V!==k&&(V===tc?r.cullFace(r.BACK):V===w_?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):oe(r.CULL_FACE),k=V}function Ct(V){V!==K&&(re&&r.lineWidth(V),K=V)}function Ie(V,Me,be){V?(de(r.POLYGON_OFFSET_FILL),(Q!==Me||ee!==be)&&(r.polygonOffset(Me,be),Q=Me,ee=be)):oe(r.POLYGON_OFFSET_FILL)}function Ke(V){V?de(r.SCISSOR_TEST):oe(r.SCISSOR_TEST)}function Lt(V){V===void 0&&(V=r.TEXTURE0+ce-1),ye!==V&&(r.activeTexture(V),ye=V)}function Et(V,Me,be){be===void 0&&(ye===null?be=r.TEXTURE0+ce-1:be=ye);let Le=ve[be];Le===void 0&&(Le={type:void 0,texture:void 0},ve[be]=Le),(Le.type!==V||Le.texture!==Me)&&(ye!==be&&(r.activeTexture(be),ye=be),r.bindTexture(V,Me||le[V]),Le.type=V,Le.texture=Me)}function U(){const V=ve[ye];V!==void 0&&V.type!==void 0&&(r.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function b(){try{r.compressedTexImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function $(){try{r.compressedTexImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ie(){try{r.texSubImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function fe(){try{r.texSubImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function se(){try{r.compressedTexSubImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ve(){try{r.compressedTexSubImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function we(){try{r.texStorage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Be(){try{r.texStorage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ze(){try{r.texImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Se(){try{r.texImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function De(V){_t.equals(V)===!1&&(r.scissor(V.x,V.y,V.z,V.w),_t.copy(V))}function $e(V){nt.equals(V)===!1&&(r.viewport(V.x,V.y,V.z,V.w),nt.copy(V))}function ke(V,Me){let be=d.get(Me);be===void 0&&(be=new WeakMap,d.set(Me,be));let Le=be.get(V);Le===void 0&&(Le=r.getUniformBlockIndex(Me,V.name),be.set(V,Le))}function Ae(V,Me){const Le=d.get(Me).get(V);f.get(Me)!==Le&&(r.uniformBlockBinding(Me,Le,V.__bindingPointIndex),f.set(Me,Le))}function tt(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),c.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),_={},ye=null,ve={},g={},v=new WeakMap,E=[],R=null,C=!1,y=null,m=null,I=null,F=null,L=null,O=null,D=null,z=new it(0,0,0),G=0,P=!1,S=null,k=null,K=null,Q=null,ee=null,_t.set(0,0,r.canvas.width,r.canvas.height),nt.set(0,0,r.canvas.width,r.canvas.height),a.reset(),c.reset(),h.reset()}return{buffers:{color:a,depth:c,stencil:h},enable:de,disable:oe,bindFramebuffer:Te,drawBuffers:He,useProgram:lt,setBlending:xt,setMaterial:Je,setFlipSided:Ye,setCullFace:Oe,setLineWidth:Ct,setPolygonOffset:Ie,setScissorTest:Ke,activeTexture:Lt,bindTexture:Et,unbindTexture:U,compressedTexImage2D:b,compressedTexImage3D:$,texImage2D:ze,texImage3D:Se,updateUBOMapping:ke,uniformBlockBinding:Ae,texStorage2D:we,texStorage3D:Be,texSubImage2D:ie,texSubImage3D:fe,compressedTexSubImage2D:se,compressedTexSubImage3D:Ve,scissor:De,viewport:$e,reset:tt}}function AE(r,e,t,n,s,a,c){const h=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,f=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),d=new Qe,_=new WeakMap;let g;const v=new WeakMap;let E=!1;try{E=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function R(U,b){return E?new OffscreenCanvas(U,b):Gs("canvas")}function C(U,b,$){let ie=1;const fe=Et(U);if((fe.width>$||fe.height>$)&&(ie=$/Math.max(fe.width,fe.height)),ie<1)if(typeof HTMLImageElement<"u"&&U instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&U instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&U instanceof ImageBitmap||typeof VideoFrame<"u"&&U instanceof VideoFrame){const se=Math.floor(ie*fe.width),Ve=Math.floor(ie*fe.height);g===void 0&&(g=R(se,Ve));const we=b?R(se,Ve):g;return we.width=se,we.height=Ve,we.getContext("2d").drawImage(U,0,0,se,Ve),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+fe.width+"x"+fe.height+") to ("+se+"x"+Ve+")."),we}else return"data"in U&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+fe.width+"x"+fe.height+")."),U;return U}function y(U){return U.generateMipmaps}function m(U){r.generateMipmap(U)}function I(U){return U.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:U.isWebGL3DRenderTarget?r.TEXTURE_3D:U.isWebGLArrayRenderTarget||U.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function F(U,b,$,ie,fe=!1){if(U!==null){if(r[U]!==void 0)return r[U];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+U+"'")}let se=b;if(b===r.RED&&($===r.FLOAT&&(se=r.R32F),$===r.HALF_FLOAT&&(se=r.R16F),$===r.UNSIGNED_BYTE&&(se=r.R8)),b===r.RED_INTEGER&&($===r.UNSIGNED_BYTE&&(se=r.R8UI),$===r.UNSIGNED_SHORT&&(se=r.R16UI),$===r.UNSIGNED_INT&&(se=r.R32UI),$===r.BYTE&&(se=r.R8I),$===r.SHORT&&(se=r.R16I),$===r.INT&&(se=r.R32I)),b===r.RG&&($===r.FLOAT&&(se=r.RG32F),$===r.HALF_FLOAT&&(se=r.RG16F),$===r.UNSIGNED_BYTE&&(se=r.RG8)),b===r.RG_INTEGER&&($===r.UNSIGNED_BYTE&&(se=r.RG8UI),$===r.UNSIGNED_SHORT&&(se=r.RG16UI),$===r.UNSIGNED_INT&&(se=r.RG32UI),$===r.BYTE&&(se=r.RG8I),$===r.SHORT&&(se=r.RG16I),$===r.INT&&(se=r.RG32I)),b===r.RGB_INTEGER&&($===r.UNSIGNED_BYTE&&(se=r.RGB8UI),$===r.UNSIGNED_SHORT&&(se=r.RGB16UI),$===r.UNSIGNED_INT&&(se=r.RGB32UI),$===r.BYTE&&(se=r.RGB8I),$===r.SHORT&&(se=r.RGB16I),$===r.INT&&(se=r.RGB32I)),b===r.RGBA_INTEGER&&($===r.UNSIGNED_BYTE&&(se=r.RGBA8UI),$===r.UNSIGNED_SHORT&&(se=r.RGBA16UI),$===r.UNSIGNED_INT&&(se=r.RGBA32UI),$===r.BYTE&&(se=r.RGBA8I),$===r.SHORT&&(se=r.RGBA16I),$===r.INT&&(se=r.RGBA32I)),b===r.RGB&&($===r.UNSIGNED_INT_5_9_9_9_REV&&(se=r.RGB9_E5),$===r.UNSIGNED_INT_10F_11F_11F_REV&&(se=r.R11F_G11F_B10F)),b===r.RGBA){const Ve=fe?Hs:gt.getTransfer(ie);$===r.FLOAT&&(se=r.RGBA32F),$===r.HALF_FLOAT&&(se=r.RGBA16F),$===r.UNSIGNED_BYTE&&(se=Ve===wt?r.SRGB8_ALPHA8:r.RGBA8),$===r.UNSIGNED_SHORT_4_4_4_4&&(se=r.RGBA4),$===r.UNSIGNED_SHORT_5_5_5_1&&(se=r.RGB5_A1)}return(se===r.R16F||se===r.R32F||se===r.RG16F||se===r.RG32F||se===r.RGBA16F||se===r.RGBA32F)&&e.get("EXT_color_buffer_float"),se}function L(U,b){let $;return U?b===null||b===Ii||b===Nr?$=r.DEPTH24_STENCIL8:b===Un?$=r.DEPTH32F_STENCIL8:b===Ur&&($=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Ii||b===Nr?$=r.DEPTH_COMPONENT24:b===Un?$=r.DEPTH_COMPONENT32F:b===Ur&&($=r.DEPTH_COMPONENT16),$}function O(U,b){return y(U)===!0||U.isFramebufferTexture&&U.minFilter!==_n&&U.minFilter!==In?Math.log2(Math.max(b.width,b.height))+1:U.mipmaps!==void 0&&U.mipmaps.length>0?U.mipmaps.length:U.isCompressedTexture&&Array.isArray(U.image)?b.mipmaps.length:1}function D(U){const b=U.target;b.removeEventListener("dispose",D),G(b),b.isVideoTexture&&_.delete(b)}function z(U){const b=U.target;b.removeEventListener("dispose",z),S(b)}function G(U){const b=n.get(U);if(b.__webglInit===void 0)return;const $=U.source,ie=v.get($);if(ie){const fe=ie[b.__cacheKey];fe.usedTimes--,fe.usedTimes===0&&P(U),Object.keys(ie).length===0&&v.delete($)}n.remove(U)}function P(U){const b=n.get(U);r.deleteTexture(b.__webglTexture);const $=U.source,ie=v.get($);delete ie[b.__cacheKey],c.memory.textures--}function S(U){const b=n.get(U);if(U.depthTexture&&(U.depthTexture.dispose(),n.remove(U.depthTexture)),U.isWebGLCubeRenderTarget)for(let ie=0;ie<6;ie++){if(Array.isArray(b.__webglFramebuffer[ie]))for(let fe=0;fe<b.__webglFramebuffer[ie].length;fe++)r.deleteFramebuffer(b.__webglFramebuffer[ie][fe]);else r.deleteFramebuffer(b.__webglFramebuffer[ie]);b.__webglDepthbuffer&&r.deleteRenderbuffer(b.__webglDepthbuffer[ie])}else{if(Array.isArray(b.__webglFramebuffer))for(let ie=0;ie<b.__webglFramebuffer.length;ie++)r.deleteFramebuffer(b.__webglFramebuffer[ie]);else r.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&r.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&r.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let ie=0;ie<b.__webglColorRenderbuffer.length;ie++)b.__webglColorRenderbuffer[ie]&&r.deleteRenderbuffer(b.__webglColorRenderbuffer[ie]);b.__webglDepthRenderbuffer&&r.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const $=U.textures;for(let ie=0,fe=$.length;ie<fe;ie++){const se=n.get($[ie]);se.__webglTexture&&(r.deleteTexture(se.__webglTexture),c.memory.textures--),n.remove($[ie])}n.remove(U)}let k=0;function K(){k=0}function Q(){const U=k;return U>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+U+" texture units while this GPU supports only "+s.maxTextures),k+=1,U}function ee(U){const b=[];return b.push(U.wrapS),b.push(U.wrapT),b.push(U.wrapR||0),b.push(U.magFilter),b.push(U.minFilter),b.push(U.anisotropy),b.push(U.internalFormat),b.push(U.format),b.push(U.type),b.push(U.generateMipmaps),b.push(U.premultiplyAlpha),b.push(U.flipY),b.push(U.unpackAlignment),b.push(U.colorSpace),b.join()}function ce(U,b){const $=n.get(U);if(U.isVideoTexture&&Ke(U),U.isRenderTargetTexture===!1&&U.isExternalTexture!==!0&&U.version>0&&$.__version!==U.version){const ie=U.image;if(ie===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ie.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{le($,U,b);return}}else U.isExternalTexture&&($.__webglTexture=U.sourceTexture?U.sourceTexture:null);t.bindTexture(r.TEXTURE_2D,$.__webglTexture,r.TEXTURE0+b)}function re(U,b){const $=n.get(U);if(U.isRenderTargetTexture===!1&&U.version>0&&$.__version!==U.version){le($,U,b);return}t.bindTexture(r.TEXTURE_2D_ARRAY,$.__webglTexture,r.TEXTURE0+b)}function _e(U,b){const $=n.get(U);if(U.isRenderTargetTexture===!1&&U.version>0&&$.__version!==U.version){le($,U,b);return}t.bindTexture(r.TEXTURE_3D,$.__webglTexture,r.TEXTURE0+b)}function Z(U,b){const $=n.get(U);if(U.version>0&&$.__version!==U.version){de($,U,b);return}t.bindTexture(r.TEXTURE_CUBE_MAP,$.__webglTexture,r.TEXTURE0+b)}const ye={[ha]:r.REPEAT,[Li]:r.CLAMP_TO_EDGE,[ua]:r.MIRRORED_REPEAT},ve={[_n]:r.NEAREST,[J_]:r.NEAREST_MIPMAP_NEAREST,[cs]:r.NEAREST_MIPMAP_LINEAR,[In]:r.LINEAR,[vo]:r.LINEAR_MIPMAP_NEAREST,[Fi]:r.LINEAR_MIPMAP_LINEAR},Pe={[ng]:r.NEVER,[lg]:r.ALWAYS,[ig]:r.LESS,[Mh]:r.LEQUAL,[rg]:r.EQUAL,[ag]:r.GEQUAL,[sg]:r.GREATER,[og]:r.NOTEQUAL};function je(U,b){if(b.type===Un&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===In||b.magFilter===vo||b.magFilter===cs||b.magFilter===Fi||b.minFilter===In||b.minFilter===vo||b.minFilter===cs||b.minFilter===Fi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(U,r.TEXTURE_WRAP_S,ye[b.wrapS]),r.texParameteri(U,r.TEXTURE_WRAP_T,ye[b.wrapT]),(U===r.TEXTURE_3D||U===r.TEXTURE_2D_ARRAY)&&r.texParameteri(U,r.TEXTURE_WRAP_R,ye[b.wrapR]),r.texParameteri(U,r.TEXTURE_MAG_FILTER,ve[b.magFilter]),r.texParameteri(U,r.TEXTURE_MIN_FILTER,ve[b.minFilter]),b.compareFunction&&(r.texParameteri(U,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(U,r.TEXTURE_COMPARE_FUNC,Pe[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===_n||b.minFilter!==cs&&b.minFilter!==Fi||b.type===Un&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){const $=e.get("EXT_texture_filter_anisotropic");r.texParameterf(U,$.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function _t(U,b){let $=!1;U.__webglInit===void 0&&(U.__webglInit=!0,b.addEventListener("dispose",D));const ie=b.source;let fe=v.get(ie);fe===void 0&&(fe={},v.set(ie,fe));const se=ee(b);if(se!==U.__cacheKey){fe[se]===void 0&&(fe[se]={texture:r.createTexture(),usedTimes:0},c.memory.textures++,$=!0),fe[se].usedTimes++;const Ve=fe[U.__cacheKey];Ve!==void 0&&(fe[U.__cacheKey].usedTimes--,Ve.usedTimes===0&&P(b)),U.__cacheKey=se,U.__webglTexture=fe[se].texture}return $}function nt(U,b,$){return Math.floor(Math.floor(U/$)/b)}function et(U,b,$,ie){const se=U.updateRanges;if(se.length===0)t.texSubImage2D(r.TEXTURE_2D,0,0,0,b.width,b.height,$,ie,b.data);else{se.sort((Se,De)=>Se.start-De.start);let Ve=0;for(let Se=1;Se<se.length;Se++){const De=se[Ve],$e=se[Se],ke=De.start+De.count,Ae=nt($e.start,b.width,4),tt=nt(De.start,b.width,4);$e.start<=ke+1&&Ae===tt&&nt($e.start+$e.count-1,b.width,4)===Ae?De.count=Math.max(De.count,$e.start+$e.count-De.start):(++Ve,se[Ve]=$e)}se.length=Ve+1;const we=r.getParameter(r.UNPACK_ROW_LENGTH),Be=r.getParameter(r.UNPACK_SKIP_PIXELS),ze=r.getParameter(r.UNPACK_SKIP_ROWS);r.pixelStorei(r.UNPACK_ROW_LENGTH,b.width);for(let Se=0,De=se.length;Se<De;Se++){const $e=se[Se],ke=Math.floor($e.start/4),Ae=Math.ceil($e.count/4),tt=ke%b.width,V=Math.floor(ke/b.width),Me=Ae,be=1;r.pixelStorei(r.UNPACK_SKIP_PIXELS,tt),r.pixelStorei(r.UNPACK_SKIP_ROWS,V),t.texSubImage2D(r.TEXTURE_2D,0,tt,V,Me,be,$,ie,b.data)}U.clearUpdateRanges(),r.pixelStorei(r.UNPACK_ROW_LENGTH,we),r.pixelStorei(r.UNPACK_SKIP_PIXELS,Be),r.pixelStorei(r.UNPACK_SKIP_ROWS,ze)}}function le(U,b,$){let ie=r.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(ie=r.TEXTURE_2D_ARRAY),b.isData3DTexture&&(ie=r.TEXTURE_3D);const fe=_t(U,b),se=b.source;t.bindTexture(ie,U.__webglTexture,r.TEXTURE0+$);const Ve=n.get(se);if(se.version!==Ve.__version||fe===!0){t.activeTexture(r.TEXTURE0+$);const we=gt.getPrimaries(gt.workingColorSpace),Be=b.colorSpace===li?null:gt.getPrimaries(b.colorSpace),ze=b.colorSpace===li||we===Be?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,ze);let Se=C(b.image,!1,s.maxTextureSize);Se=Lt(b,Se);const De=a.convert(b.format,b.colorSpace),$e=a.convert(b.type);let ke=F(b.internalFormat,De,$e,b.colorSpace,b.isVideoTexture);je(ie,b);let Ae;const tt=b.mipmaps,V=b.isVideoTexture!==!0,Me=Ve.__version===void 0||fe===!0,be=se.dataReady,Le=O(b,Se);if(b.isDepthTexture)ke=L(b.format===Br,b.type),Me&&(V?t.texStorage2D(r.TEXTURE_2D,1,ke,Se.width,Se.height):t.texImage2D(r.TEXTURE_2D,0,ke,Se.width,Se.height,0,De,$e,null));else if(b.isDataTexture)if(tt.length>0){V&&Me&&t.texStorage2D(r.TEXTURE_2D,Le,ke,tt[0].width,tt[0].height);for(let W=0,H=tt.length;W<H;W++)Ae=tt[W],V?be&&t.texSubImage2D(r.TEXTURE_2D,W,0,0,Ae.width,Ae.height,De,$e,Ae.data):t.texImage2D(r.TEXTURE_2D,W,ke,Ae.width,Ae.height,0,De,$e,Ae.data);b.generateMipmaps=!1}else V?(Me&&t.texStorage2D(r.TEXTURE_2D,Le,ke,Se.width,Se.height),be&&et(b,Se,De,$e)):t.texImage2D(r.TEXTURE_2D,0,ke,Se.width,Se.height,0,De,$e,Se.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){V&&Me&&t.texStorage3D(r.TEXTURE_2D_ARRAY,Le,ke,tt[0].width,tt[0].height,Se.depth);for(let W=0,H=tt.length;W<H;W++)if(Ae=tt[W],b.format!==An)if(De!==null)if(V){if(be)if(b.layerUpdates.size>0){const Fe=Oc(Ae.width,Ae.height,b.format,b.type);for(const Ze of b.layerUpdates){const pt=Ae.data.subarray(Ze*Fe/Ae.data.BYTES_PER_ELEMENT,(Ze+1)*Fe/Ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,W,0,0,Ze,Ae.width,Ae.height,1,De,pt)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,W,0,0,0,Ae.width,Ae.height,Se.depth,De,Ae.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,W,ke,Ae.width,Ae.height,Se.depth,0,Ae.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else V?be&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,W,0,0,0,Ae.width,Ae.height,Se.depth,De,$e,Ae.data):t.texImage3D(r.TEXTURE_2D_ARRAY,W,ke,Ae.width,Ae.height,Se.depth,0,De,$e,Ae.data)}else{V&&Me&&t.texStorage2D(r.TEXTURE_2D,Le,ke,tt[0].width,tt[0].height);for(let W=0,H=tt.length;W<H;W++)Ae=tt[W],b.format!==An?De!==null?V?be&&t.compressedTexSubImage2D(r.TEXTURE_2D,W,0,0,Ae.width,Ae.height,De,Ae.data):t.compressedTexImage2D(r.TEXTURE_2D,W,ke,Ae.width,Ae.height,0,Ae.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):V?be&&t.texSubImage2D(r.TEXTURE_2D,W,0,0,Ae.width,Ae.height,De,$e,Ae.data):t.texImage2D(r.TEXTURE_2D,W,ke,Ae.width,Ae.height,0,De,$e,Ae.data)}else if(b.isDataArrayTexture)if(V){if(Me&&t.texStorage3D(r.TEXTURE_2D_ARRAY,Le,ke,Se.width,Se.height,Se.depth),be)if(b.layerUpdates.size>0){const W=Oc(Se.width,Se.height,b.format,b.type);for(const H of b.layerUpdates){const Fe=Se.data.subarray(H*W/Se.data.BYTES_PER_ELEMENT,(H+1)*W/Se.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,H,Se.width,Se.height,1,De,$e,Fe)}b.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,Se.width,Se.height,Se.depth,De,$e,Se.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,ke,Se.width,Se.height,Se.depth,0,De,$e,Se.data);else if(b.isData3DTexture)V?(Me&&t.texStorage3D(r.TEXTURE_3D,Le,ke,Se.width,Se.height,Se.depth),be&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,Se.width,Se.height,Se.depth,De,$e,Se.data)):t.texImage3D(r.TEXTURE_3D,0,ke,Se.width,Se.height,Se.depth,0,De,$e,Se.data);else if(b.isFramebufferTexture){if(Me)if(V)t.texStorage2D(r.TEXTURE_2D,Le,ke,Se.width,Se.height);else{let W=Se.width,H=Se.height;for(let Fe=0;Fe<Le;Fe++)t.texImage2D(r.TEXTURE_2D,Fe,ke,W,H,0,De,$e,null),W>>=1,H>>=1}}else if(tt.length>0){if(V&&Me){const W=Et(tt[0]);t.texStorage2D(r.TEXTURE_2D,Le,ke,W.width,W.height)}for(let W=0,H=tt.length;W<H;W++)Ae=tt[W],V?be&&t.texSubImage2D(r.TEXTURE_2D,W,0,0,De,$e,Ae):t.texImage2D(r.TEXTURE_2D,W,ke,De,$e,Ae);b.generateMipmaps=!1}else if(V){if(Me){const W=Et(Se);t.texStorage2D(r.TEXTURE_2D,Le,ke,W.width,W.height)}be&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,De,$e,Se)}else t.texImage2D(r.TEXTURE_2D,0,ke,De,$e,Se);y(b)&&m(ie),Ve.__version=se.version,b.onUpdate&&b.onUpdate(b)}U.__version=b.version}function de(U,b,$){if(b.image.length!==6)return;const ie=_t(U,b),fe=b.source;t.bindTexture(r.TEXTURE_CUBE_MAP,U.__webglTexture,r.TEXTURE0+$);const se=n.get(fe);if(fe.version!==se.__version||ie===!0){t.activeTexture(r.TEXTURE0+$);const Ve=gt.getPrimaries(gt.workingColorSpace),we=b.colorSpace===li?null:gt.getPrimaries(b.colorSpace),Be=b.colorSpace===li||Ve===we?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Be);const ze=b.isCompressedTexture||b.image[0].isCompressedTexture,Se=b.image[0]&&b.image[0].isDataTexture,De=[];for(let H=0;H<6;H++)!ze&&!Se?De[H]=C(b.image[H],!0,s.maxCubemapSize):De[H]=Se?b.image[H].image:b.image[H],De[H]=Lt(b,De[H]);const $e=De[0],ke=a.convert(b.format,b.colorSpace),Ae=a.convert(b.type),tt=F(b.internalFormat,ke,Ae,b.colorSpace),V=b.isVideoTexture!==!0,Me=se.__version===void 0||ie===!0,be=fe.dataReady;let Le=O(b,$e);je(r.TEXTURE_CUBE_MAP,b);let W;if(ze){V&&Me&&t.texStorage2D(r.TEXTURE_CUBE_MAP,Le,tt,$e.width,$e.height);for(let H=0;H<6;H++){W=De[H].mipmaps;for(let Fe=0;Fe<W.length;Fe++){const Ze=W[Fe];b.format!==An?ke!==null?V?be&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,Fe,0,0,Ze.width,Ze.height,ke,Ze.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,Fe,tt,Ze.width,Ze.height,0,Ze.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):V?be&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,Fe,0,0,Ze.width,Ze.height,ke,Ae,Ze.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,Fe,tt,Ze.width,Ze.height,0,ke,Ae,Ze.data)}}}else{if(W=b.mipmaps,V&&Me){W.length>0&&Le++;const H=Et(De[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,Le,tt,H.width,H.height)}for(let H=0;H<6;H++)if(Se){V?be&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,0,0,0,De[H].width,De[H].height,ke,Ae,De[H].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,0,tt,De[H].width,De[H].height,0,ke,Ae,De[H].data);for(let Fe=0;Fe<W.length;Fe++){const pt=W[Fe].image[H].image;V?be&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,Fe+1,0,0,pt.width,pt.height,ke,Ae,pt.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,Fe+1,tt,pt.width,pt.height,0,ke,Ae,pt.data)}}else{V?be&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,0,0,0,ke,Ae,De[H]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,0,tt,ke,Ae,De[H]);for(let Fe=0;Fe<W.length;Fe++){const Ze=W[Fe];V?be&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,Fe+1,0,0,ke,Ae,Ze.image[H]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+H,Fe+1,tt,ke,Ae,Ze.image[H])}}}y(b)&&m(r.TEXTURE_CUBE_MAP),se.__version=fe.version,b.onUpdate&&b.onUpdate(b)}U.__version=b.version}function oe(U,b,$,ie,fe,se){const Ve=a.convert($.format,$.colorSpace),we=a.convert($.type),Be=F($.internalFormat,Ve,we,$.colorSpace),ze=n.get(b),Se=n.get($);if(Se.__renderTarget=b,!ze.__hasExternalTextures){const De=Math.max(1,b.width>>se),$e=Math.max(1,b.height>>se);fe===r.TEXTURE_3D||fe===r.TEXTURE_2D_ARRAY?t.texImage3D(fe,se,Be,De,$e,b.depth,0,Ve,we,null):t.texImage2D(fe,se,Be,De,$e,0,Ve,we,null)}t.bindFramebuffer(r.FRAMEBUFFER,U),Ie(b)?h.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,ie,fe,Se.__webglTexture,0,Ct(b)):(fe===r.TEXTURE_2D||fe>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&fe<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,ie,fe,Se.__webglTexture,se),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Te(U,b,$){if(r.bindRenderbuffer(r.RENDERBUFFER,U),b.depthBuffer){const ie=b.depthTexture,fe=ie&&ie.isDepthTexture?ie.type:null,se=L(b.stencilBuffer,fe),Ve=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,we=Ct(b);Ie(b)?h.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,we,se,b.width,b.height):$?r.renderbufferStorageMultisample(r.RENDERBUFFER,we,se,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,se,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,Ve,r.RENDERBUFFER,U)}else{const ie=b.textures;for(let fe=0;fe<ie.length;fe++){const se=ie[fe],Ve=a.convert(se.format,se.colorSpace),we=a.convert(se.type),Be=F(se.internalFormat,Ve,we,se.colorSpace),ze=Ct(b);$&&Ie(b)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,ze,Be,b.width,b.height):Ie(b)?h.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ze,Be,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,Be,b.width,b.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function He(U,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,U),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const ie=n.get(b.depthTexture);ie.__renderTarget=b,(!ie.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),ce(b.depthTexture,0);const fe=ie.__webglTexture,se=Ct(b);if(b.depthTexture.format===Or)Ie(b)?h.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,fe,0,se):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,fe,0);else if(b.depthTexture.format===Br)Ie(b)?h.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,fe,0,se):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,fe,0);else throw new Error("Unknown depthTexture format")}function lt(U){const b=n.get(U),$=U.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==U.depthTexture){const ie=U.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),ie){const fe=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,ie.removeEventListener("dispose",fe)};ie.addEventListener("dispose",fe),b.__depthDisposeCallback=fe}b.__boundDepthTexture=ie}if(U.depthTexture&&!b.__autoAllocateDepthBuffer){if($)throw new Error("target.depthTexture not supported in Cube render targets");const ie=U.texture.mipmaps;ie&&ie.length>0?He(b.__webglFramebuffer[0],U):He(b.__webglFramebuffer,U)}else if($){b.__webglDepthbuffer=[];for(let ie=0;ie<6;ie++)if(t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[ie]),b.__webglDepthbuffer[ie]===void 0)b.__webglDepthbuffer[ie]=r.createRenderbuffer(),Te(b.__webglDepthbuffer[ie],U,!1);else{const fe=U.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,se=b.__webglDepthbuffer[ie];r.bindRenderbuffer(r.RENDERBUFFER,se),r.framebufferRenderbuffer(r.FRAMEBUFFER,fe,r.RENDERBUFFER,se)}}else{const ie=U.texture.mipmaps;if(ie&&ie.length>0?t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[0]):t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=r.createRenderbuffer(),Te(b.__webglDepthbuffer,U,!1);else{const fe=U.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,se=b.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,se),r.framebufferRenderbuffer(r.FRAMEBUFFER,fe,r.RENDERBUFFER,se)}}t.bindFramebuffer(r.FRAMEBUFFER,null)}function Rt(U,b,$){const ie=n.get(U);b!==void 0&&oe(ie.__webglFramebuffer,U,U.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),$!==void 0&&lt(U)}function B(U){const b=U.texture,$=n.get(U),ie=n.get(b);U.addEventListener("dispose",z);const fe=U.textures,se=U.isWebGLCubeRenderTarget===!0,Ve=fe.length>1;if(Ve||(ie.__webglTexture===void 0&&(ie.__webglTexture=r.createTexture()),ie.__version=b.version,c.memory.textures++),se){$.__webglFramebuffer=[];for(let we=0;we<6;we++)if(b.mipmaps&&b.mipmaps.length>0){$.__webglFramebuffer[we]=[];for(let Be=0;Be<b.mipmaps.length;Be++)$.__webglFramebuffer[we][Be]=r.createFramebuffer()}else $.__webglFramebuffer[we]=r.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){$.__webglFramebuffer=[];for(let we=0;we<b.mipmaps.length;we++)$.__webglFramebuffer[we]=r.createFramebuffer()}else $.__webglFramebuffer=r.createFramebuffer();if(Ve)for(let we=0,Be=fe.length;we<Be;we++){const ze=n.get(fe[we]);ze.__webglTexture===void 0&&(ze.__webglTexture=r.createTexture(),c.memory.textures++)}if(U.samples>0&&Ie(U)===!1){$.__webglMultisampledFramebuffer=r.createFramebuffer(),$.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,$.__webglMultisampledFramebuffer);for(let we=0;we<fe.length;we++){const Be=fe[we];$.__webglColorRenderbuffer[we]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,$.__webglColorRenderbuffer[we]);const ze=a.convert(Be.format,Be.colorSpace),Se=a.convert(Be.type),De=F(Be.internalFormat,ze,Se,Be.colorSpace,U.isXRRenderTarget===!0),$e=Ct(U);r.renderbufferStorageMultisample(r.RENDERBUFFER,$e,De,U.width,U.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+we,r.RENDERBUFFER,$.__webglColorRenderbuffer[we])}r.bindRenderbuffer(r.RENDERBUFFER,null),U.depthBuffer&&($.__webglDepthRenderbuffer=r.createRenderbuffer(),Te($.__webglDepthRenderbuffer,U,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(se){t.bindTexture(r.TEXTURE_CUBE_MAP,ie.__webglTexture),je(r.TEXTURE_CUBE_MAP,b);for(let we=0;we<6;we++)if(b.mipmaps&&b.mipmaps.length>0)for(let Be=0;Be<b.mipmaps.length;Be++)oe($.__webglFramebuffer[we][Be],U,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+we,Be);else oe($.__webglFramebuffer[we],U,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+we,0);y(b)&&m(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ve){for(let we=0,Be=fe.length;we<Be;we++){const ze=fe[we],Se=n.get(ze);let De=r.TEXTURE_2D;(U.isWebGL3DRenderTarget||U.isWebGLArrayRenderTarget)&&(De=U.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(De,Se.__webglTexture),je(De,ze),oe($.__webglFramebuffer,U,ze,r.COLOR_ATTACHMENT0+we,De,0),y(ze)&&m(De)}t.unbindTexture()}else{let we=r.TEXTURE_2D;if((U.isWebGL3DRenderTarget||U.isWebGLArrayRenderTarget)&&(we=U.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(we,ie.__webglTexture),je(we,b),b.mipmaps&&b.mipmaps.length>0)for(let Be=0;Be<b.mipmaps.length;Be++)oe($.__webglFramebuffer[Be],U,b,r.COLOR_ATTACHMENT0,we,Be);else oe($.__webglFramebuffer,U,b,r.COLOR_ATTACHMENT0,we,0);y(b)&&m(we),t.unbindTexture()}U.depthBuffer&&lt(U)}function xt(U){const b=U.textures;for(let $=0,ie=b.length;$<ie;$++){const fe=b[$];if(y(fe)){const se=I(U),Ve=n.get(fe).__webglTexture;t.bindTexture(se,Ve),m(se),t.unbindTexture()}}}const Je=[],Ye=[];function Oe(U){if(U.samples>0){if(Ie(U)===!1){const b=U.textures,$=U.width,ie=U.height;let fe=r.COLOR_BUFFER_BIT;const se=U.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Ve=n.get(U),we=b.length>1;if(we)for(let ze=0;ze<b.length;ze++)t.bindFramebuffer(r.FRAMEBUFFER,Ve.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ze,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,Ve.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+ze,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,Ve.__webglMultisampledFramebuffer);const Be=U.texture.mipmaps;Be&&Be.length>0?t.bindFramebuffer(r.DRAW_FRAMEBUFFER,Ve.__webglFramebuffer[0]):t.bindFramebuffer(r.DRAW_FRAMEBUFFER,Ve.__webglFramebuffer);for(let ze=0;ze<b.length;ze++){if(U.resolveDepthBuffer&&(U.depthBuffer&&(fe|=r.DEPTH_BUFFER_BIT),U.stencilBuffer&&U.resolveStencilBuffer&&(fe|=r.STENCIL_BUFFER_BIT)),we){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,Ve.__webglColorRenderbuffer[ze]);const Se=n.get(b[ze]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Se,0)}r.blitFramebuffer(0,0,$,ie,0,0,$,ie,fe,r.NEAREST),f===!0&&(Je.length=0,Ye.length=0,Je.push(r.COLOR_ATTACHMENT0+ze),U.depthBuffer&&U.resolveDepthBuffer===!1&&(Je.push(se),Ye.push(se),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,Ye)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,Je))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),we)for(let ze=0;ze<b.length;ze++){t.bindFramebuffer(r.FRAMEBUFFER,Ve.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ze,r.RENDERBUFFER,Ve.__webglColorRenderbuffer[ze]);const Se=n.get(b[ze]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,Ve.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+ze,r.TEXTURE_2D,Se,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,Ve.__webglMultisampledFramebuffer)}else if(U.depthBuffer&&U.resolveDepthBuffer===!1&&f){const b=U.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[b])}}}function Ct(U){return Math.min(s.maxSamples,U.samples)}function Ie(U){const b=n.get(U);return U.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Ke(U){const b=c.render.frame;_.get(U)!==b&&(_.set(U,b),U.update())}function Lt(U,b){const $=U.colorSpace,ie=U.format,fe=U.type;return U.isCompressedTexture===!0||U.isVideoTexture===!0||$!==_r&&$!==li&&(gt.getTransfer($)===wt?(ie!==An||fe!==On)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",$)),b}function Et(U){return typeof HTMLImageElement<"u"&&U instanceof HTMLImageElement?(d.width=U.naturalWidth||U.width,d.height=U.naturalHeight||U.height):typeof VideoFrame<"u"&&U instanceof VideoFrame?(d.width=U.displayWidth,d.height=U.displayHeight):(d.width=U.width,d.height=U.height),d}this.allocateTextureUnit=Q,this.resetTextureUnits=K,this.setTexture2D=ce,this.setTexture2DArray=re,this.setTexture3D=_e,this.setTextureCube=Z,this.rebindTextures=Rt,this.setupRenderTarget=B,this.updateRenderTargetMipmap=xt,this.updateMultisampleRenderTarget=Oe,this.setupDepthRenderbuffer=lt,this.setupFrameBufferTexture=oe,this.useMultisampledRTT=Ie}function RE(r,e){function t(n,s=li){let a;const c=gt.getTransfer(s);if(n===On)return r.UNSIGNED_BYTE;if(n===qa)return r.UNSIGNED_SHORT_4_4_4_4;if(n===Ya)return r.UNSIGNED_SHORT_5_5_5_1;if(n===vh)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===xh)return r.UNSIGNED_INT_10F_11F_11F_REV;if(n===_h)return r.BYTE;if(n===gh)return r.SHORT;if(n===Ur)return r.UNSIGNED_SHORT;if(n===$a)return r.INT;if(n===Ii)return r.UNSIGNED_INT;if(n===Un)return r.FLOAT;if(n===zr)return r.HALF_FLOAT;if(n===yh)return r.ALPHA;if(n===Eh)return r.RGB;if(n===An)return r.RGBA;if(n===Or)return r.DEPTH_COMPONENT;if(n===Br)return r.DEPTH_STENCIL;if(n===Ka)return r.RED;if(n===Za)return r.RED_INTEGER;if(n===Sh)return r.RG;if(n===Ja)return r.RG_INTEGER;if(n===Qa)return r.RGBA_INTEGER;if(n===Us||n===Ns||n===Os||n===Bs)if(c===wt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(n===Us)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ns)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Os)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Bs)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(n===Us)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ns)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Os)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Bs)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===da||n===fa||n===pa||n===ma)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(n===da)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===fa)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===pa)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ma)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===_a||n===ga||n===va)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(n===_a||n===ga)return c===wt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(n===va)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===xa||n===ya||n===Ea||n===Sa||n===Ma||n===Ta||n===wa||n===ba||n===Aa||n===Ra||n===Ca||n===Pa||n===Da||n===La)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(n===xa)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ya)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ea)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Sa)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ma)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ta)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===wa)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ba)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Aa)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ra)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ca)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Pa)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Da)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===La)return c===wt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Fa||n===Ia||n===Ua)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(n===Fa)return c===wt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ia)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ua)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Na||n===Oa||n===Ba||n===ka)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(n===Na)return a.COMPRESSED_RED_RGTC1_EXT;if(n===Oa)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ba)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ka)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Nr?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:t}}const CE=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,PE=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class DE{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Oh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new di({vertexShader:CE,fragmentShader:PE,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Nt(new Vr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class LE extends Oi{constructor(e,t){super();const n=this;let s=null,a=1,c=null,h="local-floor",f=1,d=null,_=null,g=null,v=null,E=null,R=null;const C=typeof XRWebGLBinding<"u",y=new DE,m={},I=t.getContextAttributes();let F=null,L=null;const O=[],D=[],z=new Qe;let G=null;const P=new mn;P.viewport=new At;const S=new mn;S.viewport=new At;const k=[P,S],K=new Zg;let Q=null,ee=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(le){let de=O[le];return de===void 0&&(de=new zo,O[le]=de),de.getTargetRaySpace()},this.getControllerGrip=function(le){let de=O[le];return de===void 0&&(de=new zo,O[le]=de),de.getGripSpace()},this.getHand=function(le){let de=O[le];return de===void 0&&(de=new zo,O[le]=de),de.getHandSpace()};function ce(le){const de=D.indexOf(le.inputSource);if(de===-1)return;const oe=O[de];oe!==void 0&&(oe.update(le.inputSource,le.frame,d||c),oe.dispatchEvent({type:le.type,data:le.inputSource}))}function re(){s.removeEventListener("select",ce),s.removeEventListener("selectstart",ce),s.removeEventListener("selectend",ce),s.removeEventListener("squeeze",ce),s.removeEventListener("squeezestart",ce),s.removeEventListener("squeezeend",ce),s.removeEventListener("end",re),s.removeEventListener("inputsourceschange",_e);for(let le=0;le<O.length;le++){const de=D[le];de!==null&&(D[le]=null,O[le].disconnect(de))}Q=null,ee=null,y.reset();for(const le in m)delete m[le];e.setRenderTarget(F),E=null,v=null,g=null,s=null,L=null,et.stop(),n.isPresenting=!1,e.setPixelRatio(G),e.setSize(z.width,z.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(le){a=le,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(le){h=le,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return d||c},this.setReferenceSpace=function(le){d=le},this.getBaseLayer=function(){return v!==null?v:E},this.getBinding=function(){return g===null&&C&&(g=new XRWebGLBinding(s,t)),g},this.getFrame=function(){return R},this.getSession=function(){return s},this.setSession=async function(le){if(s=le,s!==null){if(F=e.getRenderTarget(),s.addEventListener("select",ce),s.addEventListener("selectstart",ce),s.addEventListener("selectend",ce),s.addEventListener("squeeze",ce),s.addEventListener("squeezestart",ce),s.addEventListener("squeezeend",ce),s.addEventListener("end",re),s.addEventListener("inputsourceschange",_e),I.xrCompatible!==!0&&await t.makeXRCompatible(),G=e.getPixelRatio(),e.getSize(z),C&&"createProjectionLayer"in XRWebGLBinding.prototype){let oe=null,Te=null,He=null;I.depth&&(He=I.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,oe=I.stencil?Br:Or,Te=I.stencil?Nr:Ii);const lt={colorFormat:t.RGBA8,depthFormat:He,scaleFactor:a};g=this.getBinding(),v=g.createProjectionLayer(lt),s.updateRenderState({layers:[v]}),e.setPixelRatio(1),e.setSize(v.textureWidth,v.textureHeight,!1),L=new Ni(v.textureWidth,v.textureHeight,{format:An,type:On,depthTexture:new Nh(v.textureWidth,v.textureHeight,Te,void 0,void 0,void 0,void 0,void 0,void 0,oe),stencilBuffer:I.stencil,colorSpace:e.outputColorSpace,samples:I.antialias?4:0,resolveDepthBuffer:v.ignoreDepthValues===!1,resolveStencilBuffer:v.ignoreDepthValues===!1})}else{const oe={antialias:I.antialias,alpha:!0,depth:I.depth,stencil:I.stencil,framebufferScaleFactor:a};E=new XRWebGLLayer(s,t,oe),s.updateRenderState({baseLayer:E}),e.setPixelRatio(1),e.setSize(E.framebufferWidth,E.framebufferHeight,!1),L=new Ni(E.framebufferWidth,E.framebufferHeight,{format:An,type:On,colorSpace:e.outputColorSpace,stencilBuffer:I.stencil,resolveDepthBuffer:E.ignoreDepthValues===!1,resolveStencilBuffer:E.ignoreDepthValues===!1})}L.isXRRenderTarget=!0,this.setFoveation(f),d=null,c=await s.requestReferenceSpace(h),et.setContext(s),et.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function _e(le){for(let de=0;de<le.removed.length;de++){const oe=le.removed[de],Te=D.indexOf(oe);Te>=0&&(D[Te]=null,O[Te].disconnect(oe))}for(let de=0;de<le.added.length;de++){const oe=le.added[de];let Te=D.indexOf(oe);if(Te===-1){for(let lt=0;lt<O.length;lt++)if(lt>=D.length){D.push(oe),Te=lt;break}else if(D[lt]===null){D[lt]=oe,Te=lt;break}if(Te===-1)break}const He=O[Te];He&&He.connect(oe)}}const Z=new X,ye=new X;function ve(le,de,oe){Z.setFromMatrixPosition(de.matrixWorld),ye.setFromMatrixPosition(oe.matrixWorld);const Te=Z.distanceTo(ye),He=de.projectionMatrix.elements,lt=oe.projectionMatrix.elements,Rt=He[14]/(He[10]-1),B=He[14]/(He[10]+1),xt=(He[9]+1)/He[5],Je=(He[9]-1)/He[5],Ye=(He[8]-1)/He[0],Oe=(lt[8]+1)/lt[0],Ct=Rt*Ye,Ie=Rt*Oe,Ke=Te/(-Ye+Oe),Lt=Ke*-Ye;if(de.matrixWorld.decompose(le.position,le.quaternion,le.scale),le.translateX(Lt),le.translateZ(Ke),le.matrixWorld.compose(le.position,le.quaternion,le.scale),le.matrixWorldInverse.copy(le.matrixWorld).invert(),He[10]===-1)le.projectionMatrix.copy(de.projectionMatrix),le.projectionMatrixInverse.copy(de.projectionMatrixInverse);else{const Et=Rt+Ke,U=B+Ke,b=Ct-Lt,$=Ie+(Te-Lt),ie=xt*B/U*Et,fe=Je*B/U*Et;le.projectionMatrix.makePerspective(b,$,ie,fe,Et,U),le.projectionMatrixInverse.copy(le.projectionMatrix).invert()}}function Pe(le,de){de===null?le.matrixWorld.copy(le.matrix):le.matrixWorld.multiplyMatrices(de.matrixWorld,le.matrix),le.matrixWorldInverse.copy(le.matrixWorld).invert()}this.updateCamera=function(le){if(s===null)return;let de=le.near,oe=le.far;y.texture!==null&&(y.depthNear>0&&(de=y.depthNear),y.depthFar>0&&(oe=y.depthFar)),K.near=S.near=P.near=de,K.far=S.far=P.far=oe,(Q!==K.near||ee!==K.far)&&(s.updateRenderState({depthNear:K.near,depthFar:K.far}),Q=K.near,ee=K.far),K.layers.mask=le.layers.mask|6,P.layers.mask=K.layers.mask&3,S.layers.mask=K.layers.mask&5;const Te=le.parent,He=K.cameras;Pe(K,Te);for(let lt=0;lt<He.length;lt++)Pe(He[lt],Te);He.length===2?ve(K,P,S):K.projectionMatrix.copy(P.projectionMatrix),je(le,K,Te)};function je(le,de,oe){oe===null?le.matrix.copy(de.matrixWorld):(le.matrix.copy(oe.matrixWorld),le.matrix.invert(),le.matrix.multiply(de.matrixWorld)),le.matrix.decompose(le.position,le.quaternion,le.scale),le.updateMatrixWorld(!0),le.projectionMatrix.copy(de.projectionMatrix),le.projectionMatrixInverse.copy(de.projectionMatrixInverse),le.isPerspectiveCamera&&(le.fov=za*2*Math.atan(1/le.projectionMatrix.elements[5]),le.zoom=1)}this.getCamera=function(){return K},this.getFoveation=function(){if(!(v===null&&E===null))return f},this.setFoveation=function(le){f=le,v!==null&&(v.fixedFoveation=le),E!==null&&E.fixedFoveation!==void 0&&(E.fixedFoveation=le)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(K)},this.getCameraTexture=function(le){return m[le]};let _t=null;function nt(le,de){if(_=de.getViewerPose(d||c),R=de,_!==null){const oe=_.views;E!==null&&(e.setRenderTargetFramebuffer(L,E.framebuffer),e.setRenderTarget(L));let Te=!1;oe.length!==K.cameras.length&&(K.cameras.length=0,Te=!0);for(let B=0;B<oe.length;B++){const xt=oe[B];let Je=null;if(E!==null)Je=E.getViewport(xt);else{const Oe=g.getViewSubImage(v,xt);Je=Oe.viewport,B===0&&(e.setRenderTargetTextures(L,Oe.colorTexture,Oe.depthStencilTexture),e.setRenderTarget(L))}let Ye=k[B];Ye===void 0&&(Ye=new mn,Ye.layers.enable(B),Ye.viewport=new At,k[B]=Ye),Ye.matrix.fromArray(xt.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(xt.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(Je.x,Je.y,Je.width,Je.height),B===0&&(K.matrix.copy(Ye.matrix),K.matrix.decompose(K.position,K.quaternion,K.scale)),Te===!0&&K.cameras.push(Ye)}const He=s.enabledFeatures;if(He&&He.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&C){g=n.getBinding();const B=g.getDepthInformation(oe[0]);B&&B.isValid&&B.texture&&y.init(B,s.renderState)}if(He&&He.includes("camera-access")&&C){e.state.unbindTexture(),g=n.getBinding();for(let B=0;B<oe.length;B++){const xt=oe[B].camera;if(xt){let Je=m[xt];Je||(Je=new Oh,m[xt]=Je);const Ye=g.getCameraImage(xt);Je.sourceTexture=Ye}}}}for(let oe=0;oe<O.length;oe++){const Te=D[oe],He=O[oe];Te!==null&&He!==void 0&&He.update(Te,de,d||c)}_t&&_t(le,de),de.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:de}),R=null}const et=new zh;et.setAnimationLoop(nt),this.setAnimationLoop=function(le){_t=le},this.dispose=function(){}}}const Ai=new Rn,FE=new Dt;function IE(r,e){function t(y,m){y.matrixAutoUpdate===!0&&y.updateMatrix(),m.value.copy(y.matrix)}function n(y,m){m.color.getRGB(y.fogColor.value,Dh(r)),m.isFog?(y.fogNear.value=m.near,y.fogFar.value=m.far):m.isFogExp2&&(y.fogDensity.value=m.density)}function s(y,m,I,F,L){m.isMeshBasicMaterial||m.isMeshLambertMaterial?a(y,m):m.isMeshToonMaterial?(a(y,m),g(y,m)):m.isMeshPhongMaterial?(a(y,m),_(y,m)):m.isMeshStandardMaterial?(a(y,m),v(y,m),m.isMeshPhysicalMaterial&&E(y,m,L)):m.isMeshMatcapMaterial?(a(y,m),R(y,m)):m.isMeshDepthMaterial?a(y,m):m.isMeshDistanceMaterial?(a(y,m),C(y,m)):m.isMeshNormalMaterial?a(y,m):m.isLineBasicMaterial?(c(y,m),m.isLineDashedMaterial&&h(y,m)):m.isPointsMaterial?f(y,m,I,F):m.isSpriteMaterial?d(y,m):m.isShadowMaterial?(y.color.value.copy(m.color),y.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function a(y,m){y.opacity.value=m.opacity,m.color&&y.diffuse.value.copy(m.color),m.emissive&&y.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(y.map.value=m.map,t(m.map,y.mapTransform)),m.alphaMap&&(y.alphaMap.value=m.alphaMap,t(m.alphaMap,y.alphaMapTransform)),m.bumpMap&&(y.bumpMap.value=m.bumpMap,t(m.bumpMap,y.bumpMapTransform),y.bumpScale.value=m.bumpScale,m.side===on&&(y.bumpScale.value*=-1)),m.normalMap&&(y.normalMap.value=m.normalMap,t(m.normalMap,y.normalMapTransform),y.normalScale.value.copy(m.normalScale),m.side===on&&y.normalScale.value.negate()),m.displacementMap&&(y.displacementMap.value=m.displacementMap,t(m.displacementMap,y.displacementMapTransform),y.displacementScale.value=m.displacementScale,y.displacementBias.value=m.displacementBias),m.emissiveMap&&(y.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,y.emissiveMapTransform)),m.specularMap&&(y.specularMap.value=m.specularMap,t(m.specularMap,y.specularMapTransform)),m.alphaTest>0&&(y.alphaTest.value=m.alphaTest);const I=e.get(m),F=I.envMap,L=I.envMapRotation;F&&(y.envMap.value=F,Ai.copy(L),Ai.x*=-1,Ai.y*=-1,Ai.z*=-1,F.isCubeTexture&&F.isRenderTargetTexture===!1&&(Ai.y*=-1,Ai.z*=-1),y.envMapRotation.value.setFromMatrix4(FE.makeRotationFromEuler(Ai)),y.flipEnvMap.value=F.isCubeTexture&&F.isRenderTargetTexture===!1?-1:1,y.reflectivity.value=m.reflectivity,y.ior.value=m.ior,y.refractionRatio.value=m.refractionRatio),m.lightMap&&(y.lightMap.value=m.lightMap,y.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,y.lightMapTransform)),m.aoMap&&(y.aoMap.value=m.aoMap,y.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,y.aoMapTransform))}function c(y,m){y.diffuse.value.copy(m.color),y.opacity.value=m.opacity,m.map&&(y.map.value=m.map,t(m.map,y.mapTransform))}function h(y,m){y.dashSize.value=m.dashSize,y.totalSize.value=m.dashSize+m.gapSize,y.scale.value=m.scale}function f(y,m,I,F){y.diffuse.value.copy(m.color),y.opacity.value=m.opacity,y.size.value=m.size*I,y.scale.value=F*.5,m.map&&(y.map.value=m.map,t(m.map,y.uvTransform)),m.alphaMap&&(y.alphaMap.value=m.alphaMap,t(m.alphaMap,y.alphaMapTransform)),m.alphaTest>0&&(y.alphaTest.value=m.alphaTest)}function d(y,m){y.diffuse.value.copy(m.color),y.opacity.value=m.opacity,y.rotation.value=m.rotation,m.map&&(y.map.value=m.map,t(m.map,y.mapTransform)),m.alphaMap&&(y.alphaMap.value=m.alphaMap,t(m.alphaMap,y.alphaMapTransform)),m.alphaTest>0&&(y.alphaTest.value=m.alphaTest)}function _(y,m){y.specular.value.copy(m.specular),y.shininess.value=Math.max(m.shininess,1e-4)}function g(y,m){m.gradientMap&&(y.gradientMap.value=m.gradientMap)}function v(y,m){y.metalness.value=m.metalness,m.metalnessMap&&(y.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,y.metalnessMapTransform)),y.roughness.value=m.roughness,m.roughnessMap&&(y.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,y.roughnessMapTransform)),m.envMap&&(y.envMapIntensity.value=m.envMapIntensity)}function E(y,m,I){y.ior.value=m.ior,m.sheen>0&&(y.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),y.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(y.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,y.sheenColorMapTransform)),m.sheenRoughnessMap&&(y.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,y.sheenRoughnessMapTransform))),m.clearcoat>0&&(y.clearcoat.value=m.clearcoat,y.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(y.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,y.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(y.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,y.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(y.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,y.clearcoatNormalMapTransform),y.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===on&&y.clearcoatNormalScale.value.negate())),m.dispersion>0&&(y.dispersion.value=m.dispersion),m.iridescence>0&&(y.iridescence.value=m.iridescence,y.iridescenceIOR.value=m.iridescenceIOR,y.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],y.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(y.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,y.iridescenceMapTransform)),m.iridescenceThicknessMap&&(y.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,y.iridescenceThicknessMapTransform))),m.transmission>0&&(y.transmission.value=m.transmission,y.transmissionSamplerMap.value=I.texture,y.transmissionSamplerSize.value.set(I.width,I.height),m.transmissionMap&&(y.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,y.transmissionMapTransform)),y.thickness.value=m.thickness,m.thicknessMap&&(y.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,y.thicknessMapTransform)),y.attenuationDistance.value=m.attenuationDistance,y.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(y.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(y.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,y.anisotropyMapTransform))),y.specularIntensity.value=m.specularIntensity,y.specularColor.value.copy(m.specularColor),m.specularColorMap&&(y.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,y.specularColorMapTransform)),m.specularIntensityMap&&(y.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,y.specularIntensityMapTransform))}function R(y,m){m.matcap&&(y.matcap.value=m.matcap)}function C(y,m){const I=e.get(m).light;y.referencePosition.value.setFromMatrixPosition(I.matrixWorld),y.nearDistance.value=I.shadow.camera.near,y.farDistance.value=I.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function UE(r,e,t,n){let s={},a={},c=[];const h=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function f(I,F){const L=F.program;n.uniformBlockBinding(I,L)}function d(I,F){let L=s[I.id];L===void 0&&(R(I),L=_(I),s[I.id]=L,I.addEventListener("dispose",y));const O=F.program;n.updateUBOMapping(I,O);const D=e.render.frame;a[I.id]!==D&&(v(I),a[I.id]=D)}function _(I){const F=g();I.__bindingPointIndex=F;const L=r.createBuffer(),O=I.__size,D=I.usage;return r.bindBuffer(r.UNIFORM_BUFFER,L),r.bufferData(r.UNIFORM_BUFFER,O,D),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,F,L),L}function g(){for(let I=0;I<h;I++)if(c.indexOf(I)===-1)return c.push(I),I;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function v(I){const F=s[I.id],L=I.uniforms,O=I.__cache;r.bindBuffer(r.UNIFORM_BUFFER,F);for(let D=0,z=L.length;D<z;D++){const G=Array.isArray(L[D])?L[D]:[L[D]];for(let P=0,S=G.length;P<S;P++){const k=G[P];if(E(k,D,P,O)===!0){const K=k.__offset,Q=Array.isArray(k.value)?k.value:[k.value];let ee=0;for(let ce=0;ce<Q.length;ce++){const re=Q[ce],_e=C(re);typeof re=="number"||typeof re=="boolean"?(k.__data[0]=re,r.bufferSubData(r.UNIFORM_BUFFER,K+ee,k.__data)):re.isMatrix3?(k.__data[0]=re.elements[0],k.__data[1]=re.elements[1],k.__data[2]=re.elements[2],k.__data[3]=0,k.__data[4]=re.elements[3],k.__data[5]=re.elements[4],k.__data[6]=re.elements[5],k.__data[7]=0,k.__data[8]=re.elements[6],k.__data[9]=re.elements[7],k.__data[10]=re.elements[8],k.__data[11]=0):(re.toArray(k.__data,ee),ee+=_e.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,K,k.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function E(I,F,L,O){const D=I.value,z=F+"_"+L;if(O[z]===void 0)return typeof D=="number"||typeof D=="boolean"?O[z]=D:O[z]=D.clone(),!0;{const G=O[z];if(typeof D=="number"||typeof D=="boolean"){if(G!==D)return O[z]=D,!0}else if(G.equals(D)===!1)return G.copy(D),!0}return!1}function R(I){const F=I.uniforms;let L=0;const O=16;for(let z=0,G=F.length;z<G;z++){const P=Array.isArray(F[z])?F[z]:[F[z]];for(let S=0,k=P.length;S<k;S++){const K=P[S],Q=Array.isArray(K.value)?K.value:[K.value];for(let ee=0,ce=Q.length;ee<ce;ee++){const re=Q[ee],_e=C(re),Z=L%O,ye=Z%_e.boundary,ve=Z+ye;L+=ye,ve!==0&&O-ve<_e.storage&&(L+=O-ve),K.__data=new Float32Array(_e.storage/Float32Array.BYTES_PER_ELEMENT),K.__offset=L,L+=_e.storage}}}const D=L%O;return D>0&&(L+=O-D),I.__size=L,I.__cache={},this}function C(I){const F={boundary:0,storage:0};return typeof I=="number"||typeof I=="boolean"?(F.boundary=4,F.storage=4):I.isVector2?(F.boundary=8,F.storage=8):I.isVector3||I.isColor?(F.boundary=16,F.storage=12):I.isVector4?(F.boundary=16,F.storage=16):I.isMatrix3?(F.boundary=48,F.storage=48):I.isMatrix4?(F.boundary=64,F.storage=64):I.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",I),F}function y(I){const F=I.target;F.removeEventListener("dispose",y);const L=c.indexOf(F.__bindingPointIndex);c.splice(L,1),r.deleteBuffer(s[F.id]),delete s[F.id],delete a[F.id]}function m(){for(const I in s)r.deleteBuffer(s[I]);c=[],s={},a={}}return{bind:f,update:d,dispose:m}}class NE{constructor(e={}){const{canvas:t=ug(),context:n=null,depth:s=!0,stencil:a=!1,alpha:c=!1,antialias:h=!1,premultipliedAlpha:f=!0,preserveDrawingBuffer:d=!1,powerPreference:_="default",failIfMajorPerformanceCaveat:g=!1,reversedDepthBuffer:v=!1}=e;this.isWebGLRenderer=!0;let E;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");E=n.getContextAttributes().alpha}else E=c;const R=new Uint32Array(4),C=new Int32Array(4);let y=null,m=null;const I=[],F=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=hi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const L=this;let O=!1;this._outputColorSpace=yn;let D=0,z=0,G=null,P=-1,S=null;const k=new At,K=new At;let Q=null;const ee=new it(0);let ce=0,re=t.width,_e=t.height,Z=1,ye=null,ve=null;const Pe=new At(0,0,re,_e),je=new At(0,0,re,_e);let _t=!1;const nt=new rl;let et=!1,le=!1;const de=new Dt,oe=new X,Te=new At,He={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let lt=!1;function Rt(){return G===null?Z:1}let B=n;function xt(A,j){return t.getContext(A,j)}try{const A={alpha:!0,depth:s,stencil:a,antialias:h,premultipliedAlpha:f,preserveDrawingBuffer:d,powerPreference:_,failIfMajorPerformanceCaveat:g};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Xa}`),t.addEventListener("webglcontextlost",be,!1),t.addEventListener("webglcontextrestored",Le,!1),t.addEventListener("webglcontextcreationerror",W,!1),B===null){const j="webgl2";if(B=xt(j,A),B===null)throw xt(j)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let Je,Ye,Oe,Ct,Ie,Ke,Lt,Et,U,b,$,ie,fe,se,Ve,we,Be,ze,Se,De,$e,ke,Ae,tt;function V(){Je=new jx(B),Je.init(),ke=new RE(B,Je),Ye=new kx(B,Je,e,ke),Oe=new bE(B,Je),Ye.reversedDepthBuffer&&v&&Oe.buffers.depth.setReversed(!0),Ct=new Yx(B),Ie=new fE,Ke=new AE(B,Je,Oe,Ie,Ye,ke,Ct),Lt=new Hx(L),Et=new Xx(L),U=new tv(B),Ae=new Ox(B,U),b=new $x(B,U,Ct,Ae),$=new Zx(B,b,U,Ct),Se=new Kx(B,Ye,Ke),we=new zx(Ie),ie=new dE(L,Lt,Et,Je,Ye,Ae,we),fe=new IE(L,Ie),se=new mE,Ve=new EE(Je),ze=new Nx(L,Lt,Et,Oe,$,E,f),Be=new TE(L,$,Ye),tt=new UE(B,Ct,Ye,Oe),De=new Bx(B,Je,Ct),$e=new qx(B,Je,Ct),Ct.programs=ie.programs,L.capabilities=Ye,L.extensions=Je,L.properties=Ie,L.renderLists=se,L.shadowMap=Be,L.state=Oe,L.info=Ct}V();const Me=new LE(L,B);this.xr=Me,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){const A=Je.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=Je.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(A){A!==void 0&&(Z=A,this.setSize(re,_e,!1))},this.getSize=function(A){return A.set(re,_e)},this.setSize=function(A,j,ne=!0){if(Me.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}re=A,_e=j,t.width=Math.floor(A*Z),t.height=Math.floor(j*Z),ne===!0&&(t.style.width=A+"px",t.style.height=j+"px"),this.setViewport(0,0,A,j)},this.getDrawingBufferSize=function(A){return A.set(re*Z,_e*Z).floor()},this.setDrawingBufferSize=function(A,j,ne){re=A,_e=j,Z=ne,t.width=Math.floor(A*ne),t.height=Math.floor(j*ne),this.setViewport(0,0,A,j)},this.getCurrentViewport=function(A){return A.copy(k)},this.getViewport=function(A){return A.copy(Pe)},this.setViewport=function(A,j,ne,te){A.isVector4?Pe.set(A.x,A.y,A.z,A.w):Pe.set(A,j,ne,te),Oe.viewport(k.copy(Pe).multiplyScalar(Z).round())},this.getScissor=function(A){return A.copy(je)},this.setScissor=function(A,j,ne,te){A.isVector4?je.set(A.x,A.y,A.z,A.w):je.set(A,j,ne,te),Oe.scissor(K.copy(je).multiplyScalar(Z).round())},this.getScissorTest=function(){return _t},this.setScissorTest=function(A){Oe.setScissorTest(_t=A)},this.setOpaqueSort=function(A){ye=A},this.setTransparentSort=function(A){ve=A},this.getClearColor=function(A){return A.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(A=!0,j=!0,ne=!0){let te=0;if(A){let Y=!1;if(G!==null){const me=G.texture.format;Y=me===Qa||me===Ja||me===Za}if(Y){const me=G.texture.type,Re=me===On||me===Ii||me===Ur||me===Nr||me===qa||me===Ya,Ne=ze.getClearColor(),Ue=ze.getClearAlpha(),Ge=Ne.r,qe=Ne.g,ge=Ne.b;Re?(R[0]=Ge,R[1]=qe,R[2]=ge,R[3]=Ue,B.clearBufferuiv(B.COLOR,0,R)):(C[0]=Ge,C[1]=qe,C[2]=ge,C[3]=Ue,B.clearBufferiv(B.COLOR,0,C))}else te|=B.COLOR_BUFFER_BIT}j&&(te|=B.DEPTH_BUFFER_BIT),ne&&(te|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B.clear(te)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",be,!1),t.removeEventListener("webglcontextrestored",Le,!1),t.removeEventListener("webglcontextcreationerror",W,!1),ze.dispose(),se.dispose(),Ve.dispose(),Ie.dispose(),Lt.dispose(),Et.dispose(),$.dispose(),Ae.dispose(),tt.dispose(),ie.dispose(),Me.dispose(),Me.removeEventListener("sessionstart",Ot),Me.removeEventListener("sessionend",fi),Bn.stop()};function be(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),O=!0}function Le(){console.log("THREE.WebGLRenderer: Context Restored."),O=!1;const A=Ct.autoReset,j=Be.enabled,ne=Be.autoUpdate,te=Be.needsUpdate,Y=Be.type;V(),Ct.autoReset=A,Be.enabled=j,Be.autoUpdate=ne,Be.needsUpdate=te,Be.type=Y}function W(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function H(A){const j=A.target;j.removeEventListener("dispose",H),Fe(j)}function Fe(A){Ze(A),Ie.remove(A)}function Ze(A){const j=Ie.get(A).programs;j!==void 0&&(j.forEach(function(ne){ie.releaseProgram(ne)}),A.isShaderMaterial&&ie.releaseShaderCache(A))}this.renderBufferDirect=function(A,j,ne,te,Y,me){j===null&&(j=He);const Re=Y.isMesh&&Y.matrixWorld.determinant()<0,Ne=Ys(A,j,ne,te,Y);Oe.setMaterial(te,Re);let Ue=ne.index,Ge=1;if(te.wireframe===!0){if(Ue=b.getWireframeAttribute(ne),Ue===void 0)return;Ge=2}const qe=ne.drawRange,ge=ne.attributes.position;let ct=qe.start*Ge,vt=(qe.start+qe.count)*Ge;me!==null&&(ct=Math.max(ct,me.start*Ge),vt=Math.min(vt,(me.start+me.count)*Ge)),Ue!==null?(ct=Math.max(ct,0),vt=Math.min(vt,Ue.count)):ge!=null&&(ct=Math.max(ct,0),vt=Math.min(vt,ge.count));const Ut=vt-ct;if(Ut<0||Ut===1/0)return;Ae.setup(Y,te,Ne,ne,Ue);let Mt,St=De;if(Ue!==null&&(Mt=U.get(Ue),St=$e,St.setIndex(Mt)),Y.isMesh)te.wireframe===!0?(Oe.setLineWidth(te.wireframeLinewidth*Rt()),St.setMode(B.LINES)):St.setMode(B.TRIANGLES);else if(Y.isLine){let We=te.linewidth;We===void 0&&(We=1),Oe.setLineWidth(We*Rt()),Y.isLineSegments?St.setMode(B.LINES):Y.isLineLoop?St.setMode(B.LINE_LOOP):St.setMode(B.LINE_STRIP)}else Y.isPoints?St.setMode(B.POINTS):Y.isSprite&&St.setMode(B.TRIANGLES);if(Y.isBatchedMesh)if(Y._multiDrawInstances!==null)kr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),St.renderMultiDrawInstances(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount,Y._multiDrawInstances);else if(Je.get("WEBGL_multi_draw"))St.renderMultiDraw(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount);else{const We=Y._multiDrawStarts,Ft=Y._multiDrawCounts,ut=Y._multiDrawCount,tn=Ue?U.get(Ue).bytesPerElement:1,zn=Ie.get(te).currentProgram.getUniforms();for(let M=0;M<ut;M++)zn.setValue(B,"_gl_DrawID",M),St.render(We[M]/tn,Ft[M])}else if(Y.isInstancedMesh)St.renderInstances(ct,Ut,Y.count);else if(ne.isInstancedBufferGeometry){const We=ne._maxInstanceCount!==void 0?ne._maxInstanceCount:1/0,Ft=Math.min(ne.instanceCount,We);St.renderInstances(ct,Ut,Ft)}else St.render(ct,Ut)};function pt(A,j,ne){A.transparent===!0&&A.side===Yn&&A.forceSinglePass===!1?(A.side=on,A.needsUpdate=!0,Zn(A,j,ne),A.side=ui,A.needsUpdate=!0,Zn(A,j,ne),A.side=Yn):Zn(A,j,ne)}this.compile=function(A,j,ne=null){ne===null&&(ne=A),m=Ve.get(ne),m.init(j),F.push(m),ne.traverseVisible(function(Y){Y.isLight&&Y.layers.test(j.layers)&&(m.pushLight(Y),Y.castShadow&&m.pushShadow(Y))}),A!==ne&&A.traverseVisible(function(Y){Y.isLight&&Y.layers.test(j.layers)&&(m.pushLight(Y),Y.castShadow&&m.pushShadow(Y))}),m.setupLights();const te=new Set;return A.traverse(function(Y){if(!(Y.isMesh||Y.isPoints||Y.isLine||Y.isSprite))return;const me=Y.material;if(me)if(Array.isArray(me))for(let Re=0;Re<me.length;Re++){const Ne=me[Re];pt(Ne,ne,Y),te.add(Ne)}else pt(me,ne,Y),te.add(me)}),m=F.pop(),te},this.compileAsync=function(A,j,ne=null){const te=this.compile(A,j,ne);return new Promise(Y=>{function me(){if(te.forEach(function(Re){Ie.get(Re).currentProgram.isReady()&&te.delete(Re)}),te.size===0){Y(A);return}setTimeout(me,10)}Je.get("KHR_parallel_shader_compile")!==null?me():setTimeout(me,10)})};let st=null;function En(A){st&&st(A)}function Ot(){Bn.stop()}function fi(){Bn.start()}const Bn=new zh;Bn.setAnimationLoop(En),typeof self<"u"&&Bn.setContext(self),this.setAnimationLoop=function(A){st=A,Me.setAnimationLoop(A),A===null?Bn.stop():Bn.start()},Me.addEventListener("sessionstart",Ot),Me.addEventListener("sessionend",fi),this.render=function(A,j){if(j!==void 0&&j.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(O===!0)return;if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),j.parent===null&&j.matrixWorldAutoUpdate===!0&&j.updateMatrixWorld(),Me.enabled===!0&&Me.isPresenting===!0&&(Me.cameraAutoUpdate===!0&&Me.updateCamera(j),j=Me.getCamera()),A.isScene===!0&&A.onBeforeRender(L,A,j,G),m=Ve.get(A,F.length),m.init(j),F.push(m),de.multiplyMatrices(j.projectionMatrix,j.matrixWorldInverse),nt.setFromProjectionMatrix(de,Nn,j.reversedDepth),le=this.localClippingEnabled,et=we.init(this.clippingPlanes,le),y=se.get(A,I.length),y.init(),I.push(y),Me.enabled===!0&&Me.isPresenting===!0){const me=L.xr.getDepthSensingMesh();me!==null&&yr(me,j,-1/0,L.sortObjects)}yr(A,j,0,L.sortObjects),y.finish(),L.sortObjects===!0&&y.sort(ye,ve),lt=Me.enabled===!1||Me.isPresenting===!1||Me.hasDepthSensing()===!1,lt&&ze.addToRenderList(y,A),this.info.render.frame++,et===!0&&we.beginShadows();const ne=m.state.shadowsArray;Be.render(ne,A,j),et===!0&&we.endShadows(),this.info.autoReset===!0&&this.info.reset();const te=y.opaque,Y=y.transmissive;if(m.setupLights(),j.isArrayCamera){const me=j.cameras;if(Y.length>0)for(let Re=0,Ne=me.length;Re<Ne;Re++){const Ue=me[Re];Gr(te,Y,A,Ue)}lt&&ze.render(A);for(let Re=0,Ne=me.length;Re<Ne;Re++){const Ue=me[Re];gn(y,A,Ue,Ue.viewport)}}else Y.length>0&&Gr(te,Y,A,j),lt&&ze.render(A),gn(y,A,j);G!==null&&z===0&&(Ke.updateMultisampleRenderTarget(G),Ke.updateRenderTargetMipmap(G)),A.isScene===!0&&A.onAfterRender(L,A,j),Ae.resetDefaultState(),P=-1,S=null,F.pop(),F.length>0?(m=F[F.length-1],et===!0&&we.setGlobalState(L.clippingPlanes,m.state.camera)):m=null,I.pop(),I.length>0?y=I[I.length-1]:y=null};function yr(A,j,ne,te){if(A.visible===!1)return;if(A.layers.test(j.layers)){if(A.isGroup)ne=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(j);else if(A.isLight)m.pushLight(A),A.castShadow&&m.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||nt.intersectsSprite(A)){te&&Te.setFromMatrixPosition(A.matrixWorld).applyMatrix4(de);const Re=$.update(A),Ne=A.material;Ne.visible&&y.push(A,Re,Ne,ne,Te.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||nt.intersectsObject(A))){const Re=$.update(A),Ne=A.material;if(te&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Te.copy(A.boundingSphere.center)):(Re.boundingSphere===null&&Re.computeBoundingSphere(),Te.copy(Re.boundingSphere.center)),Te.applyMatrix4(A.matrixWorld).applyMatrix4(de)),Array.isArray(Ne)){const Ue=Re.groups;for(let Ge=0,qe=Ue.length;Ge<qe;Ge++){const ge=Ue[Ge],ct=Ne[ge.materialIndex];ct&&ct.visible&&y.push(A,Re,ct,ne,Te.z,ge)}}else Ne.visible&&y.push(A,Re,Ne,ne,Te.z,null)}}const me=A.children;for(let Re=0,Ne=me.length;Re<Ne;Re++)yr(me[Re],j,ne,te)}function gn(A,j,ne,te){const Y=A.opaque,me=A.transmissive,Re=A.transparent;m.setupLightsView(ne),et===!0&&we.setGlobalState(L.clippingPlanes,ne),te&&Oe.viewport(k.copy(te)),Y.length>0&&kn(Y,j,ne),me.length>0&&kn(me,j,ne),Re.length>0&&kn(Re,j,ne),Oe.buffers.depth.setTest(!0),Oe.buffers.depth.setMask(!0),Oe.buffers.color.setMask(!0),Oe.setPolygonOffset(!1)}function Gr(A,j,ne,te){if((ne.isScene===!0?ne.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[te.id]===void 0&&(m.state.transmissionRenderTarget[te.id]=new Ni(1,1,{generateMipmaps:!0,type:Je.has("EXT_color_buffer_half_float")||Je.has("EXT_color_buffer_float")?zr:On,minFilter:Fi,samples:4,stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:gt.workingColorSpace}));const me=m.state.transmissionRenderTarget[te.id],Re=te.viewport||k;me.setSize(Re.z*L.transmissionResolutionScale,Re.w*L.transmissionResolutionScale);const Ne=L.getRenderTarget(),Ue=L.getActiveCubeFace(),Ge=L.getActiveMipmapLevel();L.setRenderTarget(me),L.getClearColor(ee),ce=L.getClearAlpha(),ce<1&&L.setClearColor(16777215,.5),L.clear(),lt&&ze.render(ne);const qe=L.toneMapping;L.toneMapping=hi;const ge=te.viewport;if(te.viewport!==void 0&&(te.viewport=void 0),m.setupLightsView(te),et===!0&&we.setGlobalState(L.clippingPlanes,te),kn(A,ne,te),Ke.updateMultisampleRenderTarget(me),Ke.updateRenderTargetMipmap(me),Je.has("WEBGL_multisampled_render_to_texture")===!1){let ct=!1;for(let vt=0,Ut=j.length;vt<Ut;vt++){const Mt=j[vt],St=Mt.object,We=Mt.geometry,Ft=Mt.material,ut=Mt.group;if(Ft.side===Yn&&St.layers.test(te.layers)){const tn=Ft.side;Ft.side=on,Ft.needsUpdate=!0,pi(St,ne,te,We,Ft,ut),Ft.side=tn,Ft.needsUpdate=!0,ct=!0}}ct===!0&&(Ke.updateMultisampleRenderTarget(me),Ke.updateRenderTargetMipmap(me))}L.setRenderTarget(Ne,Ue,Ge),L.setClearColor(ee,ce),ge!==void 0&&(te.viewport=ge),L.toneMapping=qe}function kn(A,j,ne){const te=j.isScene===!0?j.overrideMaterial:null;for(let Y=0,me=A.length;Y<me;Y++){const Re=A[Y],Ne=Re.object,Ue=Re.geometry,Ge=Re.group;let qe=Re.material;qe.allowOverride===!0&&te!==null&&(qe=te),Ne.layers.test(ne.layers)&&pi(Ne,j,ne,Ue,qe,Ge)}}function pi(A,j,ne,te,Y,me){A.onBeforeRender(L,j,ne,te,Y,me),A.modelViewMatrix.multiplyMatrices(ne.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),Y.onBeforeRender(L,j,ne,te,A,me),Y.transparent===!0&&Y.side===Yn&&Y.forceSinglePass===!1?(Y.side=on,Y.needsUpdate=!0,L.renderBufferDirect(ne,j,te,Y,A,me),Y.side=ui,Y.needsUpdate=!0,L.renderBufferDirect(ne,j,te,Y,A,me),Y.side=Yn):L.renderBufferDirect(ne,j,te,Y,A,me),A.onAfterRender(L,j,ne,te,Y,me)}function Zn(A,j,ne){j.isScene!==!0&&(j=He);const te=Ie.get(A),Y=m.state.lights,me=m.state.shadowsArray,Re=Y.state.version,Ne=ie.getParameters(A,Y.state,me,j,ne),Ue=ie.getProgramCacheKey(Ne);let Ge=te.programs;te.environment=A.isMeshStandardMaterial?j.environment:null,te.fog=j.fog,te.envMap=(A.isMeshStandardMaterial?Et:Lt).get(A.envMap||te.environment),te.envMapRotation=te.environment!==null&&A.envMap===null?j.environmentRotation:A.envMapRotation,Ge===void 0&&(A.addEventListener("dispose",H),Ge=new Map,te.programs=Ge);let qe=Ge.get(Ue);if(qe!==void 0){if(te.currentProgram===qe&&te.lightsStateVersion===Re)return Xr(A,Ne),qe}else Ne.uniforms=ie.getUniforms(A),A.onBeforeCompile(Ne,L),qe=ie.acquireProgram(Ne,Ue),Ge.set(Ue,qe),te.uniforms=Ne.uniforms;const ge=te.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(ge.clippingPlanes=we.uniform),Xr(A,Ne),te.needsLights=Ks(A),te.lightsStateVersion=Re,te.needsLights&&(ge.ambientLightColor.value=Y.state.ambient,ge.lightProbe.value=Y.state.probe,ge.directionalLights.value=Y.state.directional,ge.directionalLightShadows.value=Y.state.directionalShadow,ge.spotLights.value=Y.state.spot,ge.spotLightShadows.value=Y.state.spotShadow,ge.rectAreaLights.value=Y.state.rectArea,ge.ltc_1.value=Y.state.rectAreaLTC1,ge.ltc_2.value=Y.state.rectAreaLTC2,ge.pointLights.value=Y.state.point,ge.pointLightShadows.value=Y.state.pointShadow,ge.hemisphereLights.value=Y.state.hemi,ge.directionalShadowMap.value=Y.state.directionalShadowMap,ge.directionalShadowMatrix.value=Y.state.directionalShadowMatrix,ge.spotShadowMap.value=Y.state.spotShadowMap,ge.spotLightMatrix.value=Y.state.spotLightMatrix,ge.spotLightMap.value=Y.state.spotLightMap,ge.pointShadowMap.value=Y.state.pointShadowMap,ge.pointShadowMatrix.value=Y.state.pointShadowMatrix),te.currentProgram=qe,te.uniformsList=null,qe}function Wr(A){if(A.uniformsList===null){const j=A.currentProgram.getUniforms();A.uniformsList=zs.seqWithValue(j.seq,A.uniforms)}return A.uniformsList}function Xr(A,j){const ne=Ie.get(A);ne.outputColorSpace=j.outputColorSpace,ne.batching=j.batching,ne.batchingColor=j.batchingColor,ne.instancing=j.instancing,ne.instancingColor=j.instancingColor,ne.instancingMorph=j.instancingMorph,ne.skinning=j.skinning,ne.morphTargets=j.morphTargets,ne.morphNormals=j.morphNormals,ne.morphColors=j.morphColors,ne.morphTargetsCount=j.morphTargetsCount,ne.numClippingPlanes=j.numClippingPlanes,ne.numIntersection=j.numClipIntersection,ne.vertexAlphas=j.vertexAlphas,ne.vertexTangents=j.vertexTangents,ne.toneMapping=j.toneMapping}function Ys(A,j,ne,te,Y){j.isScene!==!0&&(j=He),Ke.resetTextureUnits();const me=j.fog,Re=te.isMeshStandardMaterial?j.environment:null,Ne=G===null?L.outputColorSpace:G.isXRRenderTarget===!0?G.texture.colorSpace:_r,Ue=(te.isMeshStandardMaterial?Et:Lt).get(te.envMap||Re),Ge=te.vertexColors===!0&&!!ne.attributes.color&&ne.attributes.color.itemSize===4,qe=!!ne.attributes.tangent&&(!!te.normalMap||te.anisotropy>0),ge=!!ne.morphAttributes.position,ct=!!ne.morphAttributes.normal,vt=!!ne.morphAttributes.color;let Ut=hi;te.toneMapped&&(G===null||G.isXRRenderTarget===!0)&&(Ut=L.toneMapping);const Mt=ne.morphAttributes.position||ne.morphAttributes.normal||ne.morphAttributes.color,St=Mt!==void 0?Mt.length:0,We=Ie.get(te),Ft=m.state.lights;if(et===!0&&(le===!0||A!==S)){const Kt=A===S&&te.id===P;we.setState(te,A,Kt)}let ut=!1;te.version===We.__version?(We.needsLights&&We.lightsStateVersion!==Ft.state.version||We.outputColorSpace!==Ne||Y.isBatchedMesh&&We.batching===!1||!Y.isBatchedMesh&&We.batching===!0||Y.isBatchedMesh&&We.batchingColor===!0&&Y.colorTexture===null||Y.isBatchedMesh&&We.batchingColor===!1&&Y.colorTexture!==null||Y.isInstancedMesh&&We.instancing===!1||!Y.isInstancedMesh&&We.instancing===!0||Y.isSkinnedMesh&&We.skinning===!1||!Y.isSkinnedMesh&&We.skinning===!0||Y.isInstancedMesh&&We.instancingColor===!0&&Y.instanceColor===null||Y.isInstancedMesh&&We.instancingColor===!1&&Y.instanceColor!==null||Y.isInstancedMesh&&We.instancingMorph===!0&&Y.morphTexture===null||Y.isInstancedMesh&&We.instancingMorph===!1&&Y.morphTexture!==null||We.envMap!==Ue||te.fog===!0&&We.fog!==me||We.numClippingPlanes!==void 0&&(We.numClippingPlanes!==we.numPlanes||We.numIntersection!==we.numIntersection)||We.vertexAlphas!==Ge||We.vertexTangents!==qe||We.morphTargets!==ge||We.morphNormals!==ct||We.morphColors!==vt||We.toneMapping!==Ut||We.morphTargetsCount!==St)&&(ut=!0):(ut=!0,We.__version=te.version);let tn=We.currentProgram;ut===!0&&(tn=Zn(te,j,Y));let zn=!1,M=!1,yt=!1;const It=tn.getUniforms(),Yt=We.uniforms;if(Oe.useProgram(tn.program)&&(zn=!0,M=!0,yt=!0),te.id!==P&&(P=te.id,M=!0),zn||S!==A){Oe.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),It.setValue(B,"projectionMatrix",A.projectionMatrix),It.setValue(B,"viewMatrix",A.matrixWorldInverse);const Zt=It.map.cameraPosition;Zt!==void 0&&Zt.setValue(B,oe.setFromMatrixPosition(A.matrixWorld)),Ye.logarithmicDepthBuffer&&It.setValue(B,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(te.isMeshPhongMaterial||te.isMeshToonMaterial||te.isMeshLambertMaterial||te.isMeshBasicMaterial||te.isMeshStandardMaterial||te.isShaderMaterial)&&It.setValue(B,"isOrthographic",A.isOrthographicCamera===!0),S!==A&&(S=A,M=!0,yt=!0)}if(Y.isSkinnedMesh){It.setOptional(B,Y,"bindMatrix"),It.setOptional(B,Y,"bindMatrixInverse");const Kt=Y.skeleton;Kt&&(Kt.boneTexture===null&&Kt.computeBoneTexture(),It.setValue(B,"boneTexture",Kt.boneTexture,Ke))}Y.isBatchedMesh&&(It.setOptional(B,Y,"batchingTexture"),It.setValue(B,"batchingTexture",Y._matricesTexture,Ke),It.setOptional(B,Y,"batchingIdTexture"),It.setValue(B,"batchingIdTexture",Y._indirectTexture,Ke),It.setOptional(B,Y,"batchingColorTexture"),Y._colorsTexture!==null&&It.setValue(B,"batchingColorTexture",Y._colorsTexture,Ke));const zt=ne.morphAttributes;if((zt.position!==void 0||zt.normal!==void 0||zt.color!==void 0)&&Se.update(Y,ne,tn),(M||We.receiveShadow!==Y.receiveShadow)&&(We.receiveShadow=Y.receiveShadow,It.setValue(B,"receiveShadow",Y.receiveShadow)),te.isMeshGouraudMaterial&&te.envMap!==null&&(Yt.envMap.value=Ue,Yt.flipEnvMap.value=Ue.isCubeTexture&&Ue.isRenderTargetTexture===!1?-1:1),te.isMeshStandardMaterial&&te.envMap===null&&j.environment!==null&&(Yt.envMapIntensity.value=j.environmentIntensity),M&&(It.setValue(B,"toneMappingExposure",L.toneMappingExposure),We.needsLights&&jr(Yt,yt),me&&te.fog===!0&&fe.refreshFogUniforms(Yt,me),fe.refreshMaterialUniforms(Yt,te,Z,_e,m.state.transmissionRenderTarget[A.id]),zs.upload(B,Wr(We),Yt,Ke)),te.isShaderMaterial&&te.uniformsNeedUpdate===!0&&(zs.upload(B,Wr(We),Yt,Ke),te.uniformsNeedUpdate=!1),te.isSpriteMaterial&&It.setValue(B,"center",Y.center),It.setValue(B,"modelViewMatrix",Y.modelViewMatrix),It.setValue(B,"normalMatrix",Y.normalMatrix),It.setValue(B,"modelMatrix",Y.matrixWorld),te.isShaderMaterial||te.isRawShaderMaterial){const Kt=te.uniformsGroups;for(let Zt=0,Er=Kt.length;Zt<Er;Zt++){const Hn=Kt[Zt];tt.update(Hn,tn),tt.bind(Hn,tn)}}return tn}function jr(A,j){A.ambientLightColor.needsUpdate=j,A.lightProbe.needsUpdate=j,A.directionalLights.needsUpdate=j,A.directionalLightShadows.needsUpdate=j,A.pointLights.needsUpdate=j,A.pointLightShadows.needsUpdate=j,A.spotLights.needsUpdate=j,A.spotLightShadows.needsUpdate=j,A.rectAreaLights.needsUpdate=j,A.hemisphereLights.needsUpdate=j}function Ks(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return D},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return G},this.setRenderTargetTextures=function(A,j,ne){const te=Ie.get(A);te.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,te.__autoAllocateDepthBuffer===!1&&(te.__useRenderToTexture=!1),Ie.get(A.texture).__webglTexture=j,Ie.get(A.depthTexture).__webglTexture=te.__autoAllocateDepthBuffer?void 0:ne,te.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,j){const ne=Ie.get(A);ne.__webglFramebuffer=j,ne.__useDefaultFramebuffer=j===void 0};const Zs=B.createFramebuffer();this.setRenderTarget=function(A,j=0,ne=0){G=A,D=j,z=ne;let te=!0,Y=null,me=!1,Re=!1;if(A){const Ue=Ie.get(A);if(Ue.__useDefaultFramebuffer!==void 0)Oe.bindFramebuffer(B.FRAMEBUFFER,null),te=!1;else if(Ue.__webglFramebuffer===void 0)Ke.setupRenderTarget(A);else if(Ue.__hasExternalTextures)Ke.rebindTextures(A,Ie.get(A.texture).__webglTexture,Ie.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){const ge=A.depthTexture;if(Ue.__boundDepthTexture!==ge){if(ge!==null&&Ie.has(ge)&&(A.width!==ge.image.width||A.height!==ge.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Ke.setupDepthRenderbuffer(A)}}const Ge=A.texture;(Ge.isData3DTexture||Ge.isDataArrayTexture||Ge.isCompressedArrayTexture)&&(Re=!0);const qe=Ie.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(qe[j])?Y=qe[j][ne]:Y=qe[j],me=!0):A.samples>0&&Ke.useMultisampledRTT(A)===!1?Y=Ie.get(A).__webglMultisampledFramebuffer:Array.isArray(qe)?Y=qe[ne]:Y=qe,k.copy(A.viewport),K.copy(A.scissor),Q=A.scissorTest}else k.copy(Pe).multiplyScalar(Z).floor(),K.copy(je).multiplyScalar(Z).floor(),Q=_t;if(ne!==0&&(Y=Zs),Oe.bindFramebuffer(B.FRAMEBUFFER,Y)&&te&&Oe.drawBuffers(A,Y),Oe.viewport(k),Oe.scissor(K),Oe.setScissorTest(Q),me){const Ue=Ie.get(A.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ue.__webglTexture,ne)}else if(Re){const Ue=j;for(let Ge=0;Ge<A.textures.length;Ge++){const qe=Ie.get(A.textures[Ge]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+Ge,qe.__webglTexture,ne,Ue)}}else if(A!==null&&ne!==0){const Ue=Ie.get(A.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Ue.__webglTexture,ne)}P=-1},this.readRenderTargetPixels=function(A,j,ne,te,Y,me,Re,Ne=0){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ue=Ie.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Re!==void 0&&(Ue=Ue[Re]),Ue){Oe.bindFramebuffer(B.FRAMEBUFFER,Ue);try{const Ge=A.textures[Ne],qe=Ge.format,ge=Ge.type;if(!Ye.textureFormatReadable(qe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ye.textureTypeReadable(ge)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}j>=0&&j<=A.width-te&&ne>=0&&ne<=A.height-Y&&(A.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Ne),B.readPixels(j,ne,te,Y,ke.convert(qe),ke.convert(ge),me))}finally{const Ge=G!==null?Ie.get(G).__webglFramebuffer:null;Oe.bindFramebuffer(B.FRAMEBUFFER,Ge)}}},this.readRenderTargetPixelsAsync=async function(A,j,ne,te,Y,me,Re,Ne=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ue=Ie.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Re!==void 0&&(Ue=Ue[Re]),Ue)if(j>=0&&j<=A.width-te&&ne>=0&&ne<=A.height-Y){Oe.bindFramebuffer(B.FRAMEBUFFER,Ue);const Ge=A.textures[Ne],qe=Ge.format,ge=Ge.type;if(!Ye.textureFormatReadable(qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ye.textureTypeReadable(ge))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ct=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,ct),B.bufferData(B.PIXEL_PACK_BUFFER,me.byteLength,B.STREAM_READ),A.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Ne),B.readPixels(j,ne,te,Y,ke.convert(qe),ke.convert(ge),0);const vt=G!==null?Ie.get(G).__webglFramebuffer:null;Oe.bindFramebuffer(B.FRAMEBUFFER,vt);const Ut=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await dg(B,Ut,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,ct),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,me),B.deleteBuffer(ct),B.deleteSync(Ut),me}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,j=null,ne=0){const te=Math.pow(2,-ne),Y=Math.floor(A.image.width*te),me=Math.floor(A.image.height*te),Re=j!==null?j.x:0,Ne=j!==null?j.y:0;Ke.setTexture2D(A,0),B.copyTexSubImage2D(B.TEXTURE_2D,ne,0,0,Re,Ne,Y,me),Oe.unbindTexture()};const Js=B.createFramebuffer(),Qs=B.createFramebuffer();this.copyTextureToTexture=function(A,j,ne=null,te=null,Y=0,me=null){me===null&&(Y!==0?(kr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),me=Y,Y=0):me=0);let Re,Ne,Ue,Ge,qe,ge,ct,vt,Ut;const Mt=A.isCompressedTexture?A.mipmaps[me]:A.image;if(ne!==null)Re=ne.max.x-ne.min.x,Ne=ne.max.y-ne.min.y,Ue=ne.isBox3?ne.max.z-ne.min.z:1,Ge=ne.min.x,qe=ne.min.y,ge=ne.isBox3?ne.min.z:0;else{const zt=Math.pow(2,-Y);Re=Math.floor(Mt.width*zt),Ne=Math.floor(Mt.height*zt),A.isDataArrayTexture?Ue=Mt.depth:A.isData3DTexture?Ue=Math.floor(Mt.depth*zt):Ue=1,Ge=0,qe=0,ge=0}te!==null?(ct=te.x,vt=te.y,Ut=te.z):(ct=0,vt=0,Ut=0);const St=ke.convert(j.format),We=ke.convert(j.type);let Ft;j.isData3DTexture?(Ke.setTexture3D(j,0),Ft=B.TEXTURE_3D):j.isDataArrayTexture||j.isCompressedArrayTexture?(Ke.setTexture2DArray(j,0),Ft=B.TEXTURE_2D_ARRAY):(Ke.setTexture2D(j,0),Ft=B.TEXTURE_2D),B.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,j.flipY),B.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,j.premultiplyAlpha),B.pixelStorei(B.UNPACK_ALIGNMENT,j.unpackAlignment);const ut=B.getParameter(B.UNPACK_ROW_LENGTH),tn=B.getParameter(B.UNPACK_IMAGE_HEIGHT),zn=B.getParameter(B.UNPACK_SKIP_PIXELS),M=B.getParameter(B.UNPACK_SKIP_ROWS),yt=B.getParameter(B.UNPACK_SKIP_IMAGES);B.pixelStorei(B.UNPACK_ROW_LENGTH,Mt.width),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Mt.height),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Ge),B.pixelStorei(B.UNPACK_SKIP_ROWS,qe),B.pixelStorei(B.UNPACK_SKIP_IMAGES,ge);const It=A.isDataArrayTexture||A.isData3DTexture,Yt=j.isDataArrayTexture||j.isData3DTexture;if(A.isDepthTexture){const zt=Ie.get(A),Kt=Ie.get(j),Zt=Ie.get(zt.__renderTarget),Er=Ie.get(Kt.__renderTarget);Oe.bindFramebuffer(B.READ_FRAMEBUFFER,Zt.__webglFramebuffer),Oe.bindFramebuffer(B.DRAW_FRAMEBUFFER,Er.__webglFramebuffer);for(let Hn=0;Hn<Ue;Hn++)It&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Ie.get(A).__webglTexture,Y,ge+Hn),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Ie.get(j).__webglTexture,me,Ut+Hn)),B.blitFramebuffer(Ge,qe,Re,Ne,ct,vt,Re,Ne,B.DEPTH_BUFFER_BIT,B.NEAREST);Oe.bindFramebuffer(B.READ_FRAMEBUFFER,null),Oe.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(Y!==0||A.isRenderTargetTexture||Ie.has(A)){const zt=Ie.get(A),Kt=Ie.get(j);Oe.bindFramebuffer(B.READ_FRAMEBUFFER,Js),Oe.bindFramebuffer(B.DRAW_FRAMEBUFFER,Qs);for(let Zt=0;Zt<Ue;Zt++)It?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,zt.__webglTexture,Y,ge+Zt):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,zt.__webglTexture,Y),Yt?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Kt.__webglTexture,me,Ut+Zt):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Kt.__webglTexture,me),Y!==0?B.blitFramebuffer(Ge,qe,Re,Ne,ct,vt,Re,Ne,B.COLOR_BUFFER_BIT,B.NEAREST):Yt?B.copyTexSubImage3D(Ft,me,ct,vt,Ut+Zt,Ge,qe,Re,Ne):B.copyTexSubImage2D(Ft,me,ct,vt,Ge,qe,Re,Ne);Oe.bindFramebuffer(B.READ_FRAMEBUFFER,null),Oe.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else Yt?A.isDataTexture||A.isData3DTexture?B.texSubImage3D(Ft,me,ct,vt,Ut,Re,Ne,Ue,St,We,Mt.data):j.isCompressedArrayTexture?B.compressedTexSubImage3D(Ft,me,ct,vt,Ut,Re,Ne,Ue,St,Mt.data):B.texSubImage3D(Ft,me,ct,vt,Ut,Re,Ne,Ue,St,We,Mt):A.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,me,ct,vt,Re,Ne,St,We,Mt.data):A.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,me,ct,vt,Mt.width,Mt.height,St,Mt.data):B.texSubImage2D(B.TEXTURE_2D,me,ct,vt,Re,Ne,St,We,Mt);B.pixelStorei(B.UNPACK_ROW_LENGTH,ut),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,tn),B.pixelStorei(B.UNPACK_SKIP_PIXELS,zn),B.pixelStorei(B.UNPACK_SKIP_ROWS,M),B.pixelStorei(B.UNPACK_SKIP_IMAGES,yt),me===0&&j.generateMipmaps&&B.generateMipmap(Ft),Oe.unbindTexture()},this.initRenderTarget=function(A){Ie.get(A).__webglFramebuffer===void 0&&Ke.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?Ke.setTextureCube(A,0):A.isData3DTexture?Ke.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?Ke.setTexture2DArray(A,0):Ke.setTexture2D(A,0),Oe.unbindTexture()},this.resetState=function(){D=0,z=0,G=null,Oe.reset(),Ae.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=gt._getDrawingBufferColorSpace(e),t.unpackColorSpace=gt._getUnpackColorSpace()}}const ah={type:"change"},hl={type:"start"},Xh={type:"end"},Fs=new nl,lh=new ai,OE=Math.cos(70*hg.DEG2RAD),Wt=new X,cn=2*Math.PI,bt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Zo=1e-6;class BE extends Qg{constructor(e,t=null){super(e,t),this.state=bt.NONE,this.target=new X,this.cursor=new X,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:hr.ROTATE,MIDDLE:hr.DOLLY,RIGHT:hr.PAN},this.touches={ONE:sr.ROTATE,TWO:sr.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new X,this._lastQuaternion=new Ui,this._lastTargetPosition=new X,this._quat=new Ui().setFromUnitVectors(e.up,new X(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Nc,this._sphericalDelta=new Nc,this._scale=1,this._panOffset=new X,this._rotateStart=new Qe,this._rotateEnd=new Qe,this._rotateDelta=new Qe,this._panStart=new Qe,this._panEnd=new Qe,this._panDelta=new Qe,this._dollyStart=new Qe,this._dollyEnd=new Qe,this._dollyDelta=new Qe,this._dollyDirection=new X,this._mouse=new Qe,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=zE.bind(this),this._onPointerDown=kE.bind(this),this._onPointerUp=HE.bind(this),this._onContextMenu=qE.bind(this),this._onMouseWheel=WE.bind(this),this._onKeyDown=XE.bind(this),this._onTouchStart=jE.bind(this),this._onTouchMove=$E.bind(this),this._onMouseDown=VE.bind(this),this._onMouseMove=GE.bind(this),this._interceptControlDown=YE.bind(this),this._interceptControlUp=KE.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ah),this.update(),this.state=bt.NONE}update(e=null){const t=this.object.position;Wt.copy(t).sub(this.target),Wt.applyQuaternion(this._quat),this._spherical.setFromVector3(Wt),this.autoRotate&&this.state===bt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=cn:n>Math.PI&&(n-=cn),s<-Math.PI?s+=cn:s>Math.PI&&(s-=cn),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let a=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const c=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),a=c!=this._spherical.radius}if(Wt.setFromSpherical(this._spherical),Wt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Wt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let c=null;if(this.object.isPerspectiveCamera){const h=Wt.length();c=this._clampDistance(h*this._scale);const f=h-c;this.object.position.addScaledVector(this._dollyDirection,f),this.object.updateMatrixWorld(),a=!!f}else if(this.object.isOrthographicCamera){const h=new X(this._mouse.x,this._mouse.y,0);h.unproject(this.object);const f=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),a=f!==this.object.zoom;const d=new X(this._mouse.x,this._mouse.y,0);d.unproject(this.object),this.object.position.sub(d).add(h),this.object.updateMatrixWorld(),c=Wt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;c!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(c).add(this.object.position):(Fs.origin.copy(this.object.position),Fs.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Fs.direction))<OE?this.object.lookAt(this.target):(lh.setFromNormalAndCoplanarPoint(this.object.up,this.target),Fs.intersectPlane(lh,this.target))))}else if(this.object.isOrthographicCamera){const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),c!==this.object.zoom&&(this.object.updateProjectionMatrix(),a=!0)}return this._scale=1,this._performCursorZoom=!1,a||this._lastPosition.distanceToSquared(this.object.position)>Zo||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Zo||this._lastTargetPosition.distanceToSquared(this.target)>Zo?(this.dispatchEvent(ah),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?cn/60*this.autoRotateSpeed*e:cn/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Wt.setFromMatrixColumn(t,0),Wt.multiplyScalar(-e),this._panOffset.add(Wt)}_panUp(e,t){this.screenSpacePanning===!0?Wt.setFromMatrixColumn(t,1):(Wt.setFromMatrixColumn(t,0),Wt.crossVectors(this.object.up,Wt)),Wt.multiplyScalar(e),this._panOffset.add(Wt)}_pan(e,t){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;Wt.copy(s).sub(this.target);let a=Wt.length();a*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*a/n.clientHeight,this.object.matrix),this._panUp(2*t*a/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=e-n.left,a=t-n.top,c=n.width,h=n.height;this._mouse.x=s/c*2-1,this._mouse.y=-(a/h)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(cn*this._rotateDelta.x/t.clientHeight),this._rotateUp(cn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(cn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-cn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(cn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-cn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,a=Math.sqrt(n*n+s*s);this._dollyStart.set(0,a)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),a=.5*(e.pageY+n.y);this._rotateEnd.set(s,a)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(cn*this._rotateDelta.x/t.clientHeight),this._rotateUp(cn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,a=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,a),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const c=(e.pageX+t.x)*.5,h=(e.pageY+t.y)*.5;this._updateZoomParameters(c,h)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Qe,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function kE(r){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(r.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(r)&&(this._addPointer(r),r.pointerType==="touch"?this._onTouchStart(r):this._onMouseDown(r)))}function zE(r){this.enabled!==!1&&(r.pointerType==="touch"?this._onTouchMove(r):this._onMouseMove(r))}function HE(r){switch(this._removePointer(r),this._pointers.length){case 0:this.domElement.releasePointerCapture(r.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Xh),this.state=bt.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function VE(r){let e;switch(r.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case hr.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(r),this.state=bt.DOLLY;break;case hr.ROTATE:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=bt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=bt.ROTATE}break;case hr.PAN:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=bt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=bt.PAN}break;default:this.state=bt.NONE}this.state!==bt.NONE&&this.dispatchEvent(hl)}function GE(r){switch(this.state){case bt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(r);break;case bt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(r);break;case bt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(r);break}}function WE(r){this.enabled===!1||this.enableZoom===!1||this.state!==bt.NONE||(r.preventDefault(),this.dispatchEvent(hl),this._handleMouseWheel(this._customWheelEvent(r)),this.dispatchEvent(Xh))}function XE(r){this.enabled!==!1&&this._handleKeyDown(r)}function jE(r){switch(this._trackPointer(r),this._pointers.length){case 1:switch(this.touches.ONE){case sr.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(r),this.state=bt.TOUCH_ROTATE;break;case sr.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(r),this.state=bt.TOUCH_PAN;break;default:this.state=bt.NONE}break;case 2:switch(this.touches.TWO){case sr.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(r),this.state=bt.TOUCH_DOLLY_PAN;break;case sr.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(r),this.state=bt.TOUCH_DOLLY_ROTATE;break;default:this.state=bt.NONE}break;default:this.state=bt.NONE}this.state!==bt.NONE&&this.dispatchEvent(hl)}function $E(r){switch(this._trackPointer(r),this.state){case bt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(r),this.update();break;case bt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(r),this.update();break;case bt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(r),this.update();break;case bt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(r),this.update();break;default:this.state=bt.NONE}}function qE(r){this.enabled!==!1&&r.preventDefault()}function YE(r){r.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function KE(r){r.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class ZE extends Ih{constructor(){super();const e=new zi;e.deleteAttribute("uv");const t=new ar({side:on}),n=new ar,s=new Yg(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);const a=new Nt(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);const c=new kg(e,n,6),h=new Xt;h.position.set(-10.906,2.009,1.846),h.rotation.set(0,-.195,0),h.scale.set(2.328,7.905,4.651),h.updateMatrix(),c.setMatrixAt(0,h.matrix),h.position.set(-5.607,-.754,-.758),h.rotation.set(0,.994,0),h.scale.set(1.97,1.534,3.955),h.updateMatrix(),c.setMatrixAt(1,h.matrix),h.position.set(6.167,.857,7.803),h.rotation.set(0,.561,0),h.scale.set(3.927,6.285,3.687),h.updateMatrix(),c.setMatrixAt(2,h.matrix),h.position.set(-2.017,.018,6.124),h.rotation.set(0,.333,0),h.scale.set(2.002,4.566,2.064),h.updateMatrix(),c.setMatrixAt(3,h.matrix),h.position.set(2.291,-.756,-2.621),h.rotation.set(0,-.286,0),h.scale.set(1.546,1.552,1.496),h.updateMatrix(),c.setMatrixAt(4,h.matrix),h.position.set(-2.193,-.369,-5.547),h.rotation.set(0,.516,0),h.scale.set(3.875,3.487,2.986),h.updateMatrix(),c.setMatrixAt(5,h.matrix),this.add(c);const f=new Nt(e,rr(50));f.position.set(-16.116,14.37,8.208),f.scale.set(.1,2.428,2.739),this.add(f);const d=new Nt(e,rr(50));d.position.set(-16.109,18.021,-8.207),d.scale.set(.1,2.425,2.751),this.add(d);const _=new Nt(e,rr(17));_.position.set(14.904,12.198,-1.832),_.scale.set(.15,4.265,6.331),this.add(_);const g=new Nt(e,rr(43));g.position.set(-.462,8.89,14.52),g.scale.set(4.38,5.441,.088),this.add(g);const v=new Nt(e,rr(20));v.position.set(3.235,11.486,-12.541),v.scale.set(2.5,2,.1),this.add(v);const E=new Nt(e,rr(100));E.position.set(0,20,0),E.scale.set(1,.1,1),this.add(E)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function rr(r){return new Wg({color:0,emissive:16777215,emissiveIntensity:r})}const Is={SPHERE:2,CAPSULE:3,CYLINDER:5,BOX:6},ch=15659767,JE=14542060;class QE{constructor(e,t){this.sim=t,this.canvas=e,this.renderer=new NE({canvas:e,antialias:!0}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,2)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=fh,this.renderer.toneMapping=ph,this.renderer.toneMappingExposure=1.15,this.scene=new Ih,this.scene.background=new it(ch),this.scene.fog=new il(ch,14,34),this.world=new or,this.world.rotation.x=-Math.PI/2,this.scene.add(this.world),this.camera=new mn(45,1,.05,200),this.camera.position.set(3.2,1.4,3.2),this.controls=new BE(this.camera,e),this.controls.enableDamping=!0,this.controls.dampingFactor=.08,this.controls.minDistance=1.2,this.controls.maxDistance=14,this.controls.maxPolarAngle=Math.PI/2-.02,this.controls.target.set(0,.9,0);const n=new Ha(this.renderer);this.scene.environment=n.fromScene(new ZE,.04).texture,this.scene.environmentIntensity=.55,n.dispose(),this._addLights(),this._addGround(),this.bodyGroups=new Map,this.follow=new X(0,.9,0),this.trail=null,this._resize(),window.addEventListener("resize",()=>this._resize())}_addLights(){this.scene.add(new $g(16777215,11121858,1.5));const e=new Uc(16777215,2.1);e.position.set(4,7,3),e.castShadow=!0,e.shadow.mapSize.set(2048,2048);const t=4;Object.assign(e.shadow.camera,{left:-t,right:t,top:t,bottom:-t,near:.5,far:25}),e.shadow.camera.updateProjectionMatrix(),e.shadow.bias=-.0015,this.scene.add(e),this.scene.add(e.target),this.keyLight=e;const n=new Uc(13228287,.85);n.position.set(-4,3,-4),this.scene.add(n)}_addGround(){const e=new Nt(new Vr(60,60),new ar({color:JE,roughness:.92,metalness:0}));e.rotation.x=-Math.PI/2,e.receiveShadow=!0,this.scene.add(e);const t=new Jg(40,80,11056322,13029338);t.position.y=.002,this.scene.add(t)}_group(e){let t=this.bodyGroups.get(e);return t||(t=new or,this.world.add(t),this.bodyGroups.set(e,t)),t}addRobotMeshes(e,t,n){const s=new Float32Array(t,0,e.positionBytes/4),a=new Uint32Array(t,e.positionBytes),c=new Map(e.meshes.map(_=>[_.name,_])),h=new Map;for(const _ of e.meshes){const g=new dn;g.setAttribute("position",new un(s.subarray(_.vertexOffset*3,(_.vertexOffset+_.vertexCount)*3),3)),g.setIndex(new un(a.subarray(_.indexOffset,_.indexOffset+_.indexCount),1)),g.computeVertexNormals(),h.set(_.name,g)}const f=new Map;let d=0;for(const _ of n.visuals){const g=h.get(_.mesh);if(!g||!c.has(_.mesh))continue;const v=this.sim.bodyId(_.body);if(v<0)continue;const E=_.rgba.join(",");if(!f.has(E)){const C=m=>Math.max(m,.3),y=_.rgba[0]<.35;f.set(E,new ar({color:new it(y?C(_.rgba[0]):_.rgba[0],y?C(_.rgba[1]):_.rgba[1],y?C(_.rgba[2]):_.rgba[2]).convertSRGBToLinear(),roughness:.5,metalness:.35}))}const R=new Nt(g,f.get(E));R.castShadow=!0,R.receiveShadow=!0,R.position.set(_.pos[0],_.pos[1],_.pos[2]),R.quaternion.set(_.quat[1],_.quat[2],_.quat[3],_.quat[0]),this._group(v).add(R),d++}return this.hasRobotMeshes=d>0,d}addCollisionPrimitives({visible:e=!0,opacity:t=1}={}){const n=new ar({color:5925498,roughness:.6,metalness:.2,transparent:t<1,opacity:t});this.collisionMeshes=[];for(const s of this.sim.describeGeoms()){if(s.name==="floor"||s.name==="ball_collision")continue;let a=null;const[c,h]=s.size;if(s.type===Is.SPHERE?a=new js(c,16,12):s.type===Is.CAPSULE?a=new ol(c,2*h,8,12):s.type===Is.CYLINDER?a=new al(c,c,2*h,16):s.type===Is.BOX&&(a=new zi(2*c,2*h,2*s.size[2])),!a)continue;a.rotateX(Math.PI/2);const f=new Nt(a,n);f.castShadow=!this.hasRobotMeshes,f.visible=e,f.userData.geomId=s.id,this._group(s.bodyId).add(f);const d=this.sim.geomLocalPose(s.id);f.position.set(d.pos[0],d.pos[1],d.pos[2]),f.quaternion.set(d.quat[1],d.quat[2],d.quat[3],d.quat[0]),this.collisionMeshes.push(f)}return this.collisionMeshes.length}setCollisionVisible(e){for(const t of this.collisionMeshes??[])t.visible=e}addBall(){this.ball=new Nt(new js(1,24,18),new ar({color:new it(.9,.2,.2).convertSRGBToLinear(),roughness:.55,metalness:.05,emissive:new it(.25,.02,.02)})),this.ball.castShadow=!0,this.world.add(this.ball);const e=24;this.trailPositions=new Float32Array(e*3),this.trailLen=0;const t=new dn;t.setAttribute("position",new un(this.trailPositions,3)),t.setDrawRange(0,0),this.trail=new Uh(t,new sl({color:16739162,transparent:!0,opacity:.5})),this.trail.frustumCulled=!1,this.world.add(this.trail)}pushTrail(e,t){if(!this.trail)return;const n=this.trailPositions.length/3;if(!t){this.trailLen=0,this.trail.geometry.setDrawRange(0,0);return}this.trailLen<n?this.trailLen++:this.trailPositions.copyWithin(0,3);const s=(this.trailLen-1)*3;this.trailPositions[s]=e[0],this.trailPositions[s+1]=e[1],this.trailPositions[s+2]=e[2],this.trail.geometry.setDrawRange(0,this.trailLen),this.trail.geometry.attributes.position.needsUpdate=!0}render(e=!0){const{data:t}=this.sim;for(const[n,s]of this.bodyGroups){const a=3*n,c=4*n;s.position.set(t.xpos[a],t.xpos[a+1],t.xpos[a+2]),s.quaternion.set(t.xquat[c+1],t.xquat[c+2],t.xquat[c+3],t.xquat[c])}if(this.ball){const n=this.sim.ballPos;this.ball.position.set(n[0],n[1],n[2]),this.ball.scale.setScalar(this.sim.ballRadius)}if(e){const n=this.sim.rootPos;this._followTo=this._followTo??new X,this._followTo.set(n[0],.9,-n[1]),this.follow.lerp(this._followTo,.06);const s=this.follow.clone().sub(this.controls.target);this.controls.target.add(s),this.camera.position.add(s),this.keyLight.position.set(n[0]+4,7,-n[1]+3),this.keyLight.target.position.set(n[0],0,-n[1]),this.keyLight.target.updateMatrixWorld()}this.controls.update(),this.renderer.render(this.scene,this.camera)}_resize(){const e=this.canvas.clientWidth||1,t=this.canvas.clientHeight||1;this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}}const eS="/perceptive_cbf_rl/demo/",ri=r=>`${eS}${r}`.replace(/\/{2,}/g,"/"),sn=r=>document.getElementById(r),Ri=(r,e)=>{sn("bootMsg").textContent=r,sn("bootBar").style.width=`${e}%`};function tS(r){console.error(r),sn("boot").innerHTML=`<div><div style="margin-bottom:10px">Could not start the demo.</div><div class="err">${String(r?.stack??r)}</div></div>`}async function nS(){Ri("Loading MuJoCo…",8);const r=await qm();Ri("Loading model…",22);const[e,t]=await Promise.all([fetch(ri("model/g1_dodge.xml")).then(Z=>Z.text()),fetch(ri("model/visuals.json")).then(Z=>Z.json())]),n=new d_(r,e);Ri("Loading policies…",40);const s=qn+Jo.length*cr,[a,c]=await Promise.all([ec(ri("policy/dodge.weights.json"),ri("policy/dodge.weights.bin")),ec(ri("policy/walk.weights.json"),ri("policy/walk.weights.bin"))]);if(a.inputDim!==s)throw new Error(`dodge policy expects ${a.inputDim} inputs but the assembled obs is ${s} (proprio ${qn} + depth ${s-qn}). Wrong FRAME_OFFSETS for this checkpoint?`);if(c.inputDim!==qn)throw new Error(`walk policy expects ${c.inputDim} inputs but proprio is ${qn}`);const h={runDodge:Z=>a.run(Z),runWalk:Z=>c.run(Z)},f=new S_(n,h,{seed:Math.random()*1e9|0});Ri("Building scene…",62);const d=new QE(sn("view"),n);d.addBall();try{Ri("Loading meshes…",78);const[Z,ye]=await Promise.all([fetch(ri("model/robot_meshes.json")).then(Pe=>Pe.ok?Pe.json():Promise.reject(Pe.status)),fetch(ri("model/robot_meshes.bin")).then(Pe=>Pe.ok?Pe.arrayBuffer():Promise.reject(Pe.status))]),ve=d.addRobotMeshes(Z,ye,t);console.log(`attached ${ve} visual meshes`)}catch(Z){console.warn("visual meshes unavailable, drawing collision shapes instead:",Z)}d.addCollisionPrimitives({visible:!d.hasRobotMeshes}),Ri("Warming up…",92);for(let Z=0;Z<5;Z++)await f.tick(new Float32Array(3));addEventListener("keydown",Z=>{Z.code==="Space"?(Z.preventDefault(),y()):Z.code==="KeyR"&&I()});const _=new Float32Array(3),g={throws:0,hits:0,avoided:0};let v=null,E=null;const R=1;let C=0;function y(Z){v&&m(),f.throwNow(Z),E=null,v={ticks:0,hit:!1},g.throws++,C=0,F()}function m(){v&&(v.hit?g.hits++:g.avoided++,v=null,F())}function I(){n.reset(),f.resetBelief(),v=null,E=null,C=0,g.throws=g.hits=g.avoided=0,d.pushTrail(null,!1),F()}function F(){sn("sThrows").textContent=g.throws,sn("sHits").textContent=g.hits,sn("sAvoided").textContent=g.avoided}sn("btnThrow").onclick=()=>y(),sn("btnReset").onclick=I;const O=sn("depthCanvas").getContext("2d"),D=O.createImageData(Wa,Ga);function z(){const Z=f.frameBuf;for(let ye=0;ye<cr;ye++){const ve=Z[ye],Pe=1-ve,je=ye*4;ve>.999?(D.data[je]=12,D.data[je+1]=16,D.data[je+2]=22):(D.data[je]=Math.round(60+195*Pe),D.data[je+1]=Math.round(40+90*Pe*Pe),D.data[je+2]=Math.round(50+40*Pe*Pe)),D.data[je+3]=255}O.putImageData(D,0,0)}let G=!0;addEventListener("message",Z=>{const ye=Z.data&&Z.data.pacmanDemo;ye==="pause"?G=!1:ye==="resume"&&(G=!0)});const P=()=>document.hidden||!G;let S=0,k=performance.now(),K=!1,Q=0,ee=0,ce=k;async function re(){const Z=performance.now();await f.tick(_);const ye=performance.now()-Z;Q=Q*.9+ye*.1;const ve=n.readState();v&&(v.ticks++,E&&ve.ballPos[2]>.2&&v.ticks<1.2/Ei&&Math.hypot(ve.ballVel[0]-E[0],ve.ballVel[1]-E[1],ve.ballVel[2]-E[2])>1&&(v.hit=!0),v.ticks>2.2/Ei&&m()),E=[ve.ballVel[0],ve.ballVel[1],ve.ballVel[2]];const Pe=ve.ballPos[2]>.15&&Math.abs(ve.ballPos[0])<40;d.pushTrail(ve.ballPos,Pe),n.hasFallen()?f._fallenAt?f.ticks-f._fallenAt>1.5/Ei&&(f._fallenAt=null,n.reset(),f.resetBelief(),v=null):f._fallenAt=f.ticks:f._fallenAt=null,C=f.mode===oi.WALK?C+1:0,sn("cbAuto").checked&&!Pe&&!n.hasFallen()&&C>=R/Ei&&y()}async function _e(Z){if(requestAnimationFrame(_e),P()){k=Z,S=0;return}const ye=Math.min((Z-k)/1e3,.25);if(k=Z,ee++,S+=ye,!K){K=!0;let ve=0;for(;S>=Ei&&ve<3;)S-=Ei,ve++,await re();S>4*Ei&&(S=0),K=!1}z(),d.render(!0),Z-ce>500&&(sn("sFps").textContent=`${Math.round(ee*1e3/(Z-ce))} fps`,sn("sPhys").textContent=`${Q.toFixed(1)} ms/step`,sn("sPolicy").textContent=f.mode===oi.DODGE?`${s}→29`:`${qn}→29`,ee=0,ce=Z)}Ri("Ready",100),sn("boot").remove(),F(),requestAnimationFrame(_e)}nS().catch(tS);const iS=Object.freeze(Object.defineProperty({__proto__:null},Symbol.toStringTag,{value:"Module"}));
