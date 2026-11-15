
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* Audio page: a scroll-driven product film. No room: each product family sits alone on a seamless backdrop,
   the camera travels from one to the next, and scrolling opens each one up. All models are built here. */
const canvas=document.getElementById('stage'), floorEl=document.getElementById('floor');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, SNAP=location.hash.startsWith('#snap');
const BG=0xECE9E3, AMBER=0xE8892D, Q=Math.PI/2;

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(); scene.background=new THREE.Color(BG); scene.fog=new THREE.Fog(BG,26,60);
scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;
const camera=new THREE.PerspectiveCamera(30,1,.1,220);
scene.add(new THREE.HemisphereLight(0xffffff,0xd8d1c5,.62));
const key=new THREE.DirectionalLight(0xfff6ea,2.3); key.castShadow=true; key.shadow.mapSize.set(2048,2048);
Object.assign(key.shadow.camera,{left:-9,right:9,top:11,bottom:-7,near:1,far:60}); key.shadow.radius=7; key.shadow.bias=-.0004; key.shadow.normalBias=.02; scene.add(key,key.target);
const fill=new THREE.DirectionalLight(0xeef2ff,1.0); scene.add(fill,fill.target);
const rim=new THREE.DirectionalLight(0xfff1df,1.5); scene.add(rim,rim.target);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,200),new THREE.ShadowMaterial({opacity:.2})); ground.rotation.x=-Q; ground.receiveShadow=true; scene.add(ground);

/* ---------- helpers ---------- */
const V=(x,y,z)=>new THREE.Vector3(x,y,z), lerp=(a,b,t)=>a+(b-a)*t, clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)), sstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };
const std=(color,rough=.6,metal=0,extra={})=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,envMapIntensity:.6,...extra});
const mesh=(geo,m,cast=true)=>{ const o=new THREE.Mesh(geo,m); o.castShadow=cast; o.receiveShadow=true; return o; };
const box=(w,h,d,m)=>mesh(new THREE.BoxGeometry(w,h,d),m);
const rbox=(w,h,d,m,r=.02)=>mesh(new RoundedBoxGeometry(w,h,d,4,Math.max(.001,Math.min(r,w/2-.0005,h/2-.0005,d/2-.0005))),m);
const cyl=(r1,r2,h,m,seg=32)=>mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m);
const sph=(r,m,a=28,b=18)=>mesh(new THREE.SphereGeometry(r,a,b),m);
const lathe=(pts,m,seg=56)=>mesh(new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg),m);
const at=(o,x,y,z)=>{ o.position.set(x,y,z); return o; };
const rot=(o,x=0,y=0,z=0)=>{ o.rotation.set(x,y,z); return o; };
const grp=(parent,x=0,y=0,z=0)=>{ const g=new THREE.Group(); g.position.set(x,y,z); parent.add(g); return g; };
const rod2=(a,b,r,m)=>mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a,b),1,r,8),m);
const tube=(pts,r,m,seg=48)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>V(...p))),seg,r,8),m);
function ctex(w,h,draw,rep){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); draw(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } t.userData={c,g}; return t; }
const updaters=[];

const speckT=ctex(128,128,(g,w,h)=>{ g.fillStyle='#808080'; g.fillRect(0,0,w,h); for(let i=0;i<2600;i++){ const v=110+Math.random()*70|0; g.fillStyle=`rgb(${v},${v},${v})`; g.fillRect(Math.random()*w,Math.random()*h,1.6,1.6); } },[26,26]);
const weaveF=ctex(64,64,(g,w,h)=>{ g.fillStyle='#8a8a8a'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=8) for(let x=0;x<w;x+=8){ const a=((x+y)/8)%2; g.fillStyle=a?'#b4b4b4':'#6a6a6a'; g.fillRect(x+1,y+1,6,6); g.fillStyle=a?'#9a9a9a':'#7c7c7c'; a?g.fillRect(x+1,y+3,6,2):g.fillRect(x+3,y+1,2,6); } },[34,34]);
const M={
  shell:std(0x1c1d20,.68,.03,{bumpMap:speckT,bumpScale:.22,envMapIntensity:.6}), shell2:std(0x2b2c30,.5,.15,{envMapIntensity:.8}), baffle:std(0x3a3b40,.82), rubber:std(0x121214,.88), cone:std(0x2c2c31,.78,.02), capG:std(0x151517,.3,.2,{envMapIntensity:1.1}), horn:std(0x4a4b51,.55,.1),
  steel:std(0x8f8d88,.32,.9), alu:std(0xcfccc5,.3,.9,{envMapIntensity:.9}), black:std(0x121214,.45,.3), satin:std(0x3a3b3f,.38,.7),
  amber:std(AMBER,.45,.1), white:std(0xf2efe9,.5), wood:std(0xc9a67c,.6), fabric:std(0x938c80,1,0,{envMapIntensity:.15,bumpMap:weaveF,bumpScale:.5}), fabricD:std(0x756f66,1,0,{envMapIntensity:.15,bumpMap:weaveF,bumpScale:.5}),
};
const glow=(c)=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
// perforated steel grille, 5 mm pitch, with whatever sits behind it showing through faintly. behind: [x,y,radius] discs or [x,y,w,h] slots, x/y as fractions, sizes in metres
const grilleCache={};
function grilleMat(key,w,h,behind){ if(grilleCache[key]) return grilleCache[key]; const sc=Math.min(1400,1024/Math.max(w,h)), t=ctex(Math.round(w*sc),Math.round(h*sc),(g,W,H)=>{ g.fillStyle='#3d3e43'; g.fillRect(0,0,W,H);
    for(const d of behind){ const x=d[0]*W, y=d[1]*H; if(d.length===3){ const r=d[2]*sc, gr=g.createRadialGradient(x,y,r*.08,x,y,r); gr.addColorStop(0,'rgba(0,0,0,.62)'); gr.addColorStop(.2,'rgba(0,0,0,.34)'); gr.addColorStop(.78,'rgba(0,0,0,.44)'); gr.addColorStop(.9,'rgba(0,0,0,.12)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); }
      else { const gw=d[2]*sc, gh=d[3]*sc, gr=g.createLinearGradient(x-gw/2,0,x+gw/2,0); gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(.5,'rgba(0,0,0,.55)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(x-gw/2,y-gh/2,gw,gh); } }
    const st=.005*sc; g.fillStyle='rgba(6,6,8,.9)'; for(let r=0;r*st*.87<H+st;r++) for(let c=0;c*st<W+st;c++){ g.beginPath(); g.arc(c*st+(r%2)*st/2,r*st*.87,st*.3,0,7); g.fill(); }
    const sh=g.createLinearGradient(0,0,0,H); sh.addColorStop(0,'rgba(255,255,255,.07)'); sh.addColorStop(.5,'rgba(255,255,255,0)'); sh.addColorStop(1,'rgba(0,0,0,.12)'); g.fillStyle=sh; g.fillRect(0,0,W,H); });
  return grilleCache[key]=std(0xffffff,.46,.55,{map:t,bumpMap:t,bumpScale:.45,side:THREE.DoubleSide,envMapIntensity:.9}); }
// a grille pressed into a shallow curve, as steel grilles are
function curved(w,h,sag,m){ const g=new THREE.PlaneGeometry(w,h,28,1), P=g.attributes.position; for(let i=0;i<P.count;i++){ const x=P.getX(i)/(w/2); P.setZ(i,sag*(1-x*x)); } g.computeVertexNormals(); return mesh(g,m); }
const screws=(g,pts,z,r=.006)=>{ for(const [x,y] of pts) g.add(at(rot(cyl(r,r,.004,M.steel,10),Q),x,y,z)); };

/* ---------- loudspeaker drivers ---------- */
const movers=[];   // cones that pump on the beat
function driver(r,deep=.5){ const g=new THREE.Group(), prof=[]; for(let i=0;i<=14;i++){ const t=i/14; prof.push([r*.2+t*r*.78, -r*deep*(1-t)*(1-t*.35)]); }
  const cone=lathe(prof,M.cone,48); cone.rotation.x=Q; g.add(cone);
  const sur=mesh(new THREE.TorusGeometry(r*1.0,r*.075,12,56),M.rubber,false); g.add(sur);
  const cap=mesh(new THREE.SphereGeometry(r*.24,24,12,0,Math.PI*2,0,Q),M.capG,false); cap.rotation.x=Q; cap.scale.z=.5; cap.position.z=-r*deep*.82; g.add(cap);
  g.add(at(mesh(new THREE.TorusGeometry(r*1.12,r*.035,8,56),M.satin,false),0,0,-.004));
  for(let k=0;k<8;k++){ const a=k/8*Math.PI*2+.39; g.add(at(rot(cyl(r*.03,r*.03,.006,M.steel,10),Q),Math.cos(a)*r*1.12,Math.sin(a)*r*1.12,.002)); }
  for(let k=1;k<=3;k++) g.add(at(mesh(new THREE.TorusGeometry(r*(.34+k*.16),r*.008,6,48),M.capG,false),0,0,-r*deep*(1-(.18+k*.165))*(1-(.18+k*.165))*.72));
  movers.push([cone,cap,r]); return g; }

const weaveT=ctex(128,128,(g,w,h)=>{ g.fillStyle='#3c3d41'; g.fillRect(0,0,w,h); g.lineWidth=3.2; for(let i=-h;i<w+h;i+=16){ g.strokeStyle='#8f9096'; g.beginPath(); g.moveTo(i,0); g.lineTo(i+h,h); g.stroke(); g.strokeStyle='#75767c'; g.beginPath(); g.moveTo(i+h,0); g.lineTo(i,h); g.stroke(); } g.fillStyle='#111114'; for(let y=8;y<h;y+=16) for(let x=0;x<w;x+=16){ g.beginPath(); g.arc(x,y,3.4,0,7); g.fill(); g.beginPath(); g.arc(x+8,y+8,3.4,0,7); g.fill(); } },[9,5]);
const lcd=(lines,w=128,h=160)=>ctex(w,h,(g)=>{ g.fillStyle='#0b0d10'; g.fillRect(0,0,w,h); g.fillStyle='#dfe6ea'; g.font='600 '+Math.round(h*.2)+'px "Geist Mono", monospace'; lines.forEach((l,i)=>g.fillText(l,w*.1,h*(.3+i*.26))); g.fillStyle='#E8892D'; for(let k=0;k<5;k++) g.fillRect(w*.1+k*w*.15,h*.84,w*.11,h*.07); });
const S=34;                       // distance between the product islands on a page
const spinners=[];                // [object, turns per second] that slowly rotate
const HERO={};                    // HERO.<service key>(group): the one compact arrangement that stands for that service on the homepage
const PAGE={keys:null};           // set by the page: PAGE.keys(narrow,K,R) returns the camera stops

/* ===== fabrication models: definitions only, nothing is added to the scene here ===== */
const fabC={}, fabOnce=(k,f)=>fabC[k]??(fabC[k]=f());
// rounded box with fewer facets, for the many small parts
const fabRb=(w,h,d,m,r=.004,seg=2)=>mesh(new RoundedBoxGeometry(w,h,d,seg,Math.max(.0004,Math.min(r,w/2-.0002,h/2-.0002,d/2-.0002))),m);
const fabStripe=(n)=>fabOnce('stripe'+n,()=>ctex(4,16,(g,w,h)=>{ for(let y=0;y<h;y++){ const v=Math.round(128+112*Math.cos(y/h*Math.PI*2)); g.fillStyle=`rgb(${v},${v},${v})`; g.fillRect(0,y,w,1); } },[1,n]));
const fabWoodT=(vert)=>fabOnce('woodT'+vert,()=>{ const t=ctex(512,512,(g,w,h)=>{ g.fillStyle='#b98f62'; g.fillRect(0,0,w,h);
    for(let i=0;i<300;i++){ const y=Math.random()*h, a=.05+Math.random()*.13; g.strokeStyle=Math.random()<.55?`rgba(104,68,38,${a})`:`rgba(236,208,170,${a})`; g.lineWidth=.6+Math.random()*2.4; g.beginPath(); const ph=Math.random()*7, am=1+Math.random()*5; for(let x=0;x<=w;x+=16){ const yy=y+Math.sin(x*.011+ph)*am; x?g.lineTo(x,yy):g.moveTo(x,yy); } g.stroke(); } },[1,1]);
  if(vert){ t.center.set(.5,.5); t.rotation=Q; } return t; });
const fabMat={
  get ano(){ return fabOnce('m.ano',()=>std(0x232427,.36,.75,{envMapIntensity:1})); },
  get dark(){ return fabOnce('m.dark',()=>std(0x0b0b0d,.7,.1)); },
  get pei(){ return fabOnce('m.pei',()=>std(0x1b1b1d,.82,.25,{bumpMap:speckT,bumpScale:.3})); },
  get brass(){ return fabOnce('m.brass',()=>std(0xb8924a,.28,.92,{envMapIntensity:1})); },
  get spool(){ return fabOnce('m.spool',()=>std(0x17181a,.4,.15,{envMapIntensity:.9})); },
  get wood(){ return fabOnce('m.wood',()=>std(0xffffff,.58,0,{map:fabWoodT(0)})); },
  get woodV(){ return fabOnce('m.woodV',()=>std(0xffffff,.58,0,{map:fabWoodT(1)})); },
  get ptfe(){ return fabOnce('m.ptfe',()=>std(0xf6f3ec,.3,0,{envMapIntensity:.9})); },
  get glowA(){ return fabOnce('m.glowA',()=>glow(AMBER)); },
  get glowW(){ return fabOnce('m.glowW',()=>glow(0xfff1dc)); },
  get glass(){ return fabOnce('m.glass',()=>std(AMBER,.06,0,{transparent:true,opacity:.84,envMapIntensity:1.5})); },
  get card(){ return fabOnce('m.card',()=>std(0xb39468,.85,0)); },
  get fan(){ return fabOnce('m.fan',()=>std(0xffffff,.5,.2,{map:ctex(128,128,(g,w,h)=>{ g.fillStyle='#0d0d0f'; g.fillRect(0,0,w,h); g.translate(w/2,h/2); g.fillStyle='#34353a'; for(let k=0;k<7;k++){ g.rotate(Math.PI*2/7); g.beginPath(); g.moveTo(10,-6); g.quadraticCurveTo(40,-34,60,-10); g.lineTo(56,10); g.quadraticCurveTo(36,-8,12,8); g.closePath(); g.fill(); } g.fillStyle='#1c1d20'; g.beginPath(); g.arc(0,0,20,0,7); g.fill(); g.fillStyle='#E8892D'; g.beginPath(); g.arc(0,0,5,0,7); g.fill(); })})); },
};
const fabPrintMat=(col,lines=1)=>fabOnce('m.print'+col+'_'+lines,()=>std(col,.56,.02,{bumpMap:fabStripe(lines),bumpScale:.55,side:THREE.DoubleSide}));
const fabFil=(col)=>fabOnce('m.fil'+col,()=>std(col,.44,.04,{bumpMap:fabStripe(96),bumpScale:.5}));

/* merge every plain mesh under src into one mesh per material: detail without draw calls. Instanced meshes and anything marked userData.keep stay as they are */
function fabBake(src){ src.updateMatrixWorld(true); const inv=src.matrixWorld.clone().invert(), bk=new Map(), out=new THREE.Group(), keep=[], m4=new THREE.Matrix4();
  src.traverse(o=>{ if(!o.isMesh) return; if(o.isInstancedMesh||o.userData.keep){ keep.push(o); return; }
    const k=o.material.uuid+(o.castShadow?1:0); let b=bk.get(k); if(!b) bk.set(k,b={m:o.material,cast:o.castShadow,gs:[],n:0});
    const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); m4.multiplyMatrices(inv,o.matrixWorld); g.applyMatrix4(m4); if(!g.attributes.normal) g.computeVertexNormals(); b.gs.push(g); b.n+=g.attributes.position.count; });
  for(const b of bk.values()){ const P=new Float32Array(b.n*3), N=new Float32Array(b.n*3), U=new Float32Array(b.n*2); let o=0;
    for(const g of b.gs){ P.set(g.attributes.position.array,o*3); N.set(g.attributes.normal.array,o*3); if(g.attributes.uv) U.set(g.attributes.uv.array,o*2); o+=g.attributes.position.count; g.dispose(); }
    const G=new THREE.BufferGeometry(); G.setAttribute('position',new THREE.BufferAttribute(P,3)); G.setAttribute('normal',new THREE.BufferAttribute(N,3)); G.setAttribute('uv',new THREE.BufferAttribute(U,2)); out.add(mesh(G,b.m,b.cast)); }
  for(const o of keep){ m4.multiplyMatrices(inv,o.matrixWorld); out.add(o); m4.decompose(o.position,o.quaternion,o.scale); }
  return out; }
function fabInst(baked,mats){ const out=new THREE.Group(); for(const c of baked.children){ if(!c.isMesh) continue; const im=new THREE.InstancedMesh(c.geometry,c.material,mats.length); mats.forEach((m,i)=>im.setMatrixAt(i,m)); im.castShadow=c.castShadow; im.receiveShadow=true; im.frustumCulled=false; out.add(im); } return out; }

/* a printed object that can be shown at any stage of its print. fn(t) gives the outline at height fraction t as [x,z] points; the wall has real thickness and a flat top that rises with it */
function fabLayered(fn,H,rows,th,mat){ const P0=fn(0), N=P0.length, pos=new Float32Array((rows+1)*N*6), uv=new Float32Array((rows+1)*N*4), idx=[], ctr=[];
  for(let j=0;j<=rows;j++){ const p=j?fn(j/rows):P0, y=H*j/rows, row=[]; let ar=0; for(let i=0;i<N;i++){ const a=p[i], b=p[(i+1)%N]; ar+=a[0]*b[1]-b[0]*a[1]; } const sg=ar>0?1:-1;
    for(let i=0;i<N;i++){ const a=p[(i+N-1)%N], b=p[(i+1)%N], tx=b[0]-a[0], tz=b[1]-a[1], l=Math.hypot(tx,tz)||1, nx=tz/l*sg, nz=-tx/l*sg, o=(j*N+i)*6, q=(j*N+i)*4;
      pos[o]=p[i][0]; pos[o+1]=y; pos[o+2]=p[i][1]; pos[o+3]=p[i][0]-nx*th; pos[o+4]=y; pos[o+5]=p[i][1]-nz*th; uv[q]=uv[q+2]=i/N; uv[q+1]=uv[q+3]=j; row.push([p[i][0]-nx*th/2,p[i][1]-nz*th/2]); } ctr.push(row); }
  for(let j=0;j<rows;j++) for(let i=0;i<N;i++){ const a=(j*N+i)*2, b=(j*N+(i+1)%N)*2, c=((j+1)*N+(i+1)%N)*2, d=((j+1)*N+i)*2; idx.push(a,c,b,a,d,c, a+1,b+1,c+1,a+1,c+1,d+1); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals();
  const cg=new THREE.BufferGeometry(), cps=new Float32Array(N*6), cn=new Float32Array(N*6), ci=[]; for(let i=0;i<N;i++){ const a=i*2, b=((i+1)%N)*2; ci.push(a,b,b+1,a,b+1,a+1); cn[i*6+1]=cn[i*6+4]=1; }
  cg.setAttribute('position',new THREE.BufferAttribute(cps,3)); cg.setAttribute('normal',new THREE.BufferAttribute(cn,3)); cg.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(N*4),2)); cg.setIndex(ci);
  const out=new THREE.Group(), body=mesh(g,mat), cap=mesh(cg,mat); cap.frustumCulled=false; out.add(body,cap); let cur=-1;
  const set=(u)=>{ const k=Math.max(1,Math.min(rows,Math.round(u*rows))); if(k!==cur){ cur=k; g.setDrawRange(0,k*N*12); cps.set(pos.subarray(k*N*6,(k+1)*N*6)); cg.attributes.position.needsUpdate=true; } return k; };
  set(1); return {g:out,body,cap,set,H,rows,N,pt:(k,s)=>{ const r=ctr[k], f=(((s%1)+1)%1)*N, i=Math.floor(f)%N, a=r[i], b=r[(i+1)%N], q=f-Math.floor(f); return [lerp(a[0],b[0],q),H*k/rows,lerp(a[1],b[1],q)]; }}; }
const fabVaseFn=(R,N=84,lob=7,tw=1.3)=>(t)=>{ const r0=R*(.64+.36*Math.sin(Math.PI*(t*.92+.04))), o=[]; for(let i=0;i<N;i++){ const a=i/N*Math.PI*2, r=r0*(1+.075*Math.cos(lob*(a+tw*t))); o.push([Math.cos(a)*r,-Math.sin(a)*r]); } return o; };
const fabStoolFn=(R,N=96)=>(t)=>{ const r0=R*(.72+.28*Math.cos(t*Math.PI*2)), o=[]; for(let i=0;i<N;i++){ const a=i/N*Math.PI*2, r=r0*(1+.035*Math.cos(16*a)); o.push([Math.cos(a)*r,-Math.sin(a)*r]); } return o; };
// a lounge chair as large-format printers make them: one continuous wall following the side profile, printed lying on its side
const fabChairLoop=()=>fabOnce('chairLoop',()=>{ const c=[[0,.02],[.02,.36],[.1,.42],[.35,.37],[.58,.33],[.72,.45],[.86,.8],[.95,1],[1.04,1],[1.06,.85],[.98,.4],[1,.03],[.93,0],[.84,.03],[.7,.2],[.45,.24],[.22,.17],[.14,.03],[.07,0]];
  return new THREE.CatmullRomCurve3(c.map(p=>V(p[0]-.53,0,.5-p[1])),true,'centripetal').getSpacedPoints(120).slice(0,120).map(p=>[p.x,p.z]); });
const fabChairFn=()=>{ const L=fabChairLoop(); return ()=>L; };
function fabHose(r,m,seg=18){ const o=mesh(new THREE.BufferGeometry(),m); o.frustumCulled=false; o.userData.set=(pts)=>{ o.geometry.dispose(); o.geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>V(...p))),seg,r,6); }; return o; }
function fabCaster(r=.05){ const c=new THREE.Group(); c.add(at(rot(cyl(r,r,r*.76,M.rubber,22),0,0,Q),0,r,0)); c.add(at(rot(cyl(r*.42,r*.42,r*.84,M.steel,14),0,0,Q),0,r,0)); for(const s of [-1,1]) c.add(at(fabRb(.006,r*1.7,r*1.2,M.steel,.002),s*r*.5,r*1.75,.006)); c.add(at(fabRb(r*2,.012,r*2,M.steel,.003),0,r*2.68,0)); return c; }

/* ---------- filament spool: two flanges with cut-outs, wound filament between them. Axis along z ---------- */
function fabSpool(col,w=.064){ const g=new THREE.Group(), fl=fabOnce('flange',()=>{ const s=new THREE.Shape(); s.absarc(0,0,.1,0,Math.PI*2,false); const h0=new THREE.Path(); h0.absarc(0,0,.027,0,Math.PI*2,true); s.holes.push(h0);
    for(let k=0;k<6;k++){ const a=k/6*Math.PI*2, h=new THREE.Path(); h.absarc(Math.cos(a)*.064,Math.sin(a)*.064,.021,0,Math.PI*2,true); s.holes.push(h); } return new THREE.ExtrudeGeometry(s,{depth:.004,bevelEnabled:false,curveSegments:22}); });
  for(const z of [-w/2-.004,w/2]) g.add(at(mesh(fl,fabMat.spool),0,0,z)); g.add(rot(cyl(.03,.03,w,fabMat.spool,24),Q));
  const f=lathe([[.03,-w/2+.001],[.083,-w/2+.001],[.083,w/2-.001],[.03,w/2-.001]],fabFil(col),40); f.rotation.x=Q; g.add(f); return g; }

/* ---------- desktop 3D printer: open frame, bed that drops as the part grows, gantry and tool head that follow the layer ---------- */
function fabPrnDraw(g,u,k){ g.fillStyle='#0b0d10'; g.fillRect(0,0,256,128); g.fillStyle='#8d949b'; g.font='600 17px "Geist Mono", monospace'; g.fillText('PRINTING',16,30); g.fillText('LAYER '+k,150,30);
  g.fillStyle='#eef1f3'; g.font='600 46px "Geist Mono", monospace'; g.fillText(Math.round(u*100)+'%',14,82); g.fillStyle='#22262b'; g.fillRect(16,98,224,12); g.fillStyle='#E8892D'; g.fillRect(16,98,224*u,12); }
function fabPrinter(lite=false){ const F=fabMat, root=new THREE.Group(), st=new THREE.Group(), yN=.385, sheetY=.0198;
  // base housing on rubber feet, with the control strip across the front: display, knob, status bar, card slot
  st.add(at(rbox(.42,.086,.42,M.shell,.016),0,.055,0)); st.add(at(fabRb(.39,.004,.39,F.ano,.002),0,.0995,0));
  for(const sx of [-1,1]) for(const sz of [-1,1]) st.add(at(cyl(.02,.022,.014,M.rubber,16),sx*.165,.007,sz*.165));
  st.add(at(fabRb(.34,.054,.004,M.black,.003),0,.056,.2095));
  const scr=lite?fabOnce('prnScrL',()=>ctex(256,128,(g)=>fabPrnDraw(g,.48,29))):ctex(256,128,()=>{}), scrM=lite?fabOnce('prnScrM',()=>new THREE.MeshBasicMaterial({map:scr,toneMapped:false})):new THREE.MeshBasicMaterial({map:scr,toneMapped:false});
  const dsp=new THREE.Mesh(new THREE.PlaneGeometry(.1,.05),scrM); dsp.position.set(-.105,.056,.2118); st.add(dsp);
  st.add(at(rot(cyl(.013,.013,.012,M.alu,24),Q),0,.056,.2165)); st.add(at(rot(cyl(.0148,.0148,.003,M.satin,24),Q),0,.056,.2125));
  st.add(at(box(.07,.003,.002,F.glowA),.095,.058,.2118)); st.add(at(fabRb(.016,.007,.003,F.dark,.001),.15,.042,.2112));
  if(!lite) for(const sx of [-1,1]) for(let k=0;k<9;k++) st.add(at(box(.002,.036,.007,F.dark),sx*.2105,.056,-.12+k*.022));
  // frame: four posts and a top ring of dark anodised extrusion with slotted faces, corner cubes, a back panel carrying the electronics
  for(const sx of [-1,1]) for(const sz of [-1,1]){ st.add(at(fabRb(.024,.4,.024,F.ano,.003),sx*.188,.298,sz*.188)); st.add(at(fabRb(.03,.03,.03,M.black,.005),sx*.188,.488,sz*.188));
    if(!lite){ st.add(at(box(.007,.365,.001,F.dark),sx*.188,.288,sz*.2003)); st.add(at(box(.001,.365,.007,F.dark),sx*.2003,.288,sz*.188)); st.add(at(cyl(.005,.005,.002,M.alu,10),sx*.188,.504,sz*.188)); } }
  for(const s of [-1,1]){ st.add(at(fabRb(.352,.024,.024,F.ano,.003),0,.488,s*.188)); st.add(at(fabRb(.024,.024,.352,F.ano,.003),s*.188,.488,0)); if(!lite){ st.add(at(box(.33,.007,.001,F.dark),0,.488,s*.2003)); st.add(at(box(.001,.007,.33,F.dark),s*.2003,.488,0)); } }
  st.add(at(fabRb(.352,.376,.005,M.shell,.002),0,.288,-.1905)); if(!lite){ st.add(at(fabRb(.21,.17,.03,M.shell2,.006),0,.24,-.208)); for(let k=0;k<7;k++) st.add(at(box(.12,.003,.001,F.dark),0,.2+k*.012,-.2235)); }
  // Z axis: a lead screw and two guide rods each side
  for(const sx of [-1,1]){ st.add(at(cyl(.004,.004,.372,M.steel,10),sx*.168,.288,0)); st.add(at(cyl(.0105,.0105,.024,M.alu,14),sx*.168,.114,0)); st.add(at(fabRb(.03,.026,.03,M.black,.004),sx*.166,.463,0));
    for(const sz of [-1,1]){ st.add(at(cyl(.005,.005,.374,M.steel,10),sx*.168,.289,sz*.1)); st.add(at(fabRb(.02,.014,.02,M.black,.003),sx*.168,.469,sz*.1)); st.add(at(fabRb(.02,.01,.02,M.black,.003),sx*.168,.106,sz*.1)); }
    // gantry: rods front to back, motors at the rear corners, idlers at the front, belts
    st.add(at(rot(cyl(.004,.004,.33,M.steel,10),Q),sx*.15,.455,0));
    st.add(at(fabRb(.042,.036,.042,M.black,.004),sx*.155,.452,-.166)); for(const sy of [-1,1]) st.add(at(fabRb(.043,.004,.043,M.alu,.0015),sx*.155,.452+sy*.02,-.166)); st.add(at(cyl(.007,.007,.014,M.alu,14),sx*.155,.481,-.166));
    st.add(at(fabRb(.03,.026,.03,M.black,.004),sx*.156,.455,.168)); st.add(at(cyl(.0075,.0075,.008,M.alu,14),sx*.156,.4735,.168));
    if(!lite) for(const o of [-.0065,.0065]) st.add(at(box(.0012,.006,.33,M.rubber),sx*.156+o,.4795,0)); }
  // spool on a hanger off the right-hand rail, filament led up to a guide
  st.add(at(fabRb(.012,.215,.03,F.ano,.003),.206,.3975,0)); st.add(at(fabRb(.042,.008,.03,F.ano,.003),.193,.5045,0)); st.add(at(rot(cyl(.007,.007,.1,M.steel,12),0,0,Q),.262,.3,0)); st.add(at(rot(cyl(.013,.013,.008,M.alu,18),0,0,Q),.306,.3,0));
  const sp=fabSpool(AMBER); sp.rotation.y=Q; sp.position.set(.262,.3,0); st.add(sp);
  st.add(tube([[.262,.383,-.002],[.26,.44,-.05],[.225,.5,-.105],[.196,.521,-.12]],.0009,M.amber,20)); st.add(at(rot(cyl(.006,.006,.012,M.alu,12),0,0,.6),.196,.521,-.12)); st.add(at(fabRb(.012,.02,.012,M.black,.003),.19,.508,-.12));
  // bed: carriage arms on the rods, aluminium plate, textured sheet with a pull tab
  const bs=new THREE.Group(); for(const sx of [-1,1]){ bs.add(at(fabRb(.036,.018,.24,F.ano,.004),sx*.158,0,0)); for(const sz of [-1,1]) bs.add(at(cyl(.011,.011,.03,M.alu,14),sx*.168,0,sz*.1)); bs.add(at(cyl(.012,.012,.02,F.brass,14),sx*.168,0,0)); }
  for(const sz of [-1,1]) bs.add(at(fabRb(.3,.012,.02,F.ano,.003),0,-.003,sz*.085)); for(const sx of [-1,1]) for(const sz of [-1,1]) bs.add(at(cyl(.009,.009,.012,M.black,12),sx*.105,.006,sz*.105));
  bs.add(at(fabRb(.25,.006,.25,M.alu,.003),0,.014,0)); bs.add(at(fabRb(.254,.0025,.254,F.pei,.001),0,.0185,0)); bs.add(at(fabRb(.05,.0025,.016,F.pei,.001),0,.0185,.133));
  const bed=fabBake(bs); root.add(bed);
  // bridge, and the tool head: brass nozzle, heater block in its sock, finned heat sink, shroud with a fan, cooling ducts, extruder on top
  const xs=new THREE.Group(); for(const sx of [-1,1]) xs.add(at(fabRb(.036,.03,.044,M.black,.005),sx*.15,0,0)); xs.add(fabRb(.27,.02,.018,M.alu,.003)); xs.add(at(fabRb(.262,.007,.006,M.steel,.002),0,0,.0115)); if(!lite) xs.add(at(box(.262,.006,.0012,M.rubber),0,.0135,0));
  const xg=fabBake(xs); xg.position.y=.455; root.add(xg);
  const hs=new THREE.Group(); hs.add(lathe([[0,0],[.0011,0],[.0038,.0035],[.0038,.0075],[.0025,.0075]],F.brass,14)); hs.add(at(fabRb(.018,.012,.022,M.amber,.003),0,.0135,0)); hs.add(at(cyl(.005,.005,.022,M.alu,10),0,.03,0)); for(let k=0;k<5;k++) hs.add(at(cyl(.011,.011,.0014,M.alu,16),0,.022+k*.004,0));
  hs.add(at(fabRb(.052,.056,.046,M.shell2,.009),0,.066,0)); hs.add(at(rot(cyl(.018,.018,.003,M.black,24),Q),0,.064,.0235));
  const fan=new THREE.Mesh(new THREE.CircleGeometry(.0162,28),F.fan); fan.position.set(0,.064,.0253); hs.add(fan);
  if(!lite) for(const sx of [-1,1]) for(const sy of [-1,1]) hs.add(at(rot(cyl(.0016,.0016,.002,M.alu,8),Q),sx*.019,.064+sy*.019,.0235));
  for(const sx of [-1,1]) hs.add(at(rot(fabRb(.011,.034,.014,M.black,.004),0,0,sx*.5),sx*.021,.021,.004));
  hs.add(at(fabRb(.044,.03,.016,M.alu,.003),0,.07,-.0225)); hs.add(at(fabRb(.044,.034,.04,M.black,.006),0,.111,-.002)); hs.add(at(rot(cyl(.012,.012,.006,M.alu,18),0,0,Q),.025,.11,0)); hs.add(at(fabRb(.006,.02,.012,M.amber,.002),-.024,.114,.008));
  hs.add(at(cyl(.0045,.0045,.012,M.alu,12),0,.134,0)); hs.add(at(box(.014,.002,.002,F.glowW),0,.0365,.021));
  const hd=fabBake(hs); hd.position.set(0,yN-.455,.034); xg.add(hd);
  const part=fabLayered(fabVaseFn(.046,lite?40:84),.15,lite?30:60,.0016,fabPrintMat(AMBER,1)); part.g.position.y=sheetY; bed.add(part.g);
  const ptfe=fabHose(.002,F.ptfe), loom=fabHose(.004,M.rubber); root.add(ptfe,loom);
  let fr=0; const set=(u,t=0)=>{ const k=part.set(u), h=part.H*k/part.rows, p=part.pt(k,t*.55), hx=p[0], hz=p[2]; bed.position.y=yN-sheetY-h-.0002; xg.position.z=hz-.034; hd.position.x=hx;
    ptfe.userData.set([[hx,yN+.14,hz],[hx+.005,yN+.2,hz-.01],[hx*.5+.1,.61,hz*.5-.07],[.19,.57,-.118],[.196,.525,-.12]]); loom.userData.set([[hx-.012,yN+.127,hz-.02],[hx-.014,yN+.19,hz-.04],[hx*.4-.01,.585,-.13],[0,.53,-.185],[0,.47,-.196]]);
    if(!lite&&fr++%15===0){ fabPrnDraw(scr.userData.g,k/part.rows,k); scr.needsUpdate=true; } };
  root.add(fabBake(st)); set(.5,0); return {g:root,set,part,bed,sheetY}; }

/* the workshop cart it stands on: steel frame on casters, a drawer, a wooden top, spare spools and a parts bin on the shelf */
function fabCart(){ const F=fabMat, s=new THREE.Group(), W=.7, D=.58;
  for(const sx of [-1,1]) for(const sz of [-1,1]){ const c=fabCaster(.05); c.position.set(sx*(W/2-.06),0,sz*(D/2-.06)); c.rotation.y=.5*sx; s.add(c); s.add(at(fabRb(.036,.626,.036,F.ano,.005),sx*(W/2-.06),.453,sz*(D/2-.06))); }
  for(const y of [.21,.6]){ for(const sz of [-1,1]) s.add(at(fabRb(W-.156,.03,.024,F.ano,.004),0,y,sz*(D/2-.06))); for(const sx of [-1,1]) s.add(at(fabRb(.024,.03,D-.156,F.ano,.004),sx*(W/2-.06),y,0)); }
  s.add(at(fabRb(W-.13,.016,D-.13,M.shell2,.004),0,.224,0));
  s.add(at(rbox(W-.09,.15,D-.09,M.shell,.012),0,.69,0)); s.add(at(fabRb(W-.15,.112,.008,M.shell2,.004),0,.69,D/2-.043)); s.add(at(fabRb(.24,.014,.016,M.alu,.005),0,.722,D/2-.034)); s.add(at(fabRb(.075,.028,.002,M.white,.001),.18,.668,D/2-.0385));
  s.add(at(rbox(W,.034,D,F.wood,.007),0,.783,0));
  [[AMBER,-.215],[0xd9d4c8,-.135],[0x2a2b2e,-.055],[AMBER,.025]].forEach(([c,x])=>{ const sp=fabSpool(c); sp.rotation.y=Q; sp.position.set(x,.332,-.02); s.add(sp); });
  s.add(at(fabRb(.17,.12,.26,M.shell2,.012),.185,.292,0)); s.add(at(fabRb(.172,.012,.262,M.black,.004),.185,.356,0)); s.add(at(fabRb(.08,.035,.002,M.white,.001),.185,.29,.131)); s.add(at(fabRb(.06,.012,.01,M.alu,.004),.185,.33,.134));
  return fabBake(s); }
/* printer on its cart with a finished part beside it; the print runs on its own clock */
function fabStation(parent){ const g=grp(parent,0,0,0); g.add(fabCart()); const pr=fabPrinter(); pr.g.position.set(-.06,.8,0); g.add(pr.g);
  const done=fabLayered(fabVaseFn(.04,64,5,-1.6),.12,40,.0016,fabPrintMat(0xd9d4c8,1)); done.g.position.set(.27,.8,.2); g.add(done.g);
  updaters.push((t)=>{ const c=((t+18)/52)%1; pr.set(clamp(.2+c*1.05),t); }); return g; }

/* ---------- 01 · a custom plinth with a screen set flush into its face; stop = the scroll stop where it comes apart ---------- */
const fabPlinthScr=()=>fabOnce('plScr',()=>ctex(360,630,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#17181c'); gr.addColorStop(1,'#0b0b0d'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  const rg=g.createRadialGradient(w/2,h*.44,10,w/2,h*.44,200); rg.addColorStop(0,'rgba(232,137,45,.95)'); rg.addColorStop(.55,'rgba(232,137,45,.32)'); rg.addColorStop(1,'rgba(232,137,45,0)'); g.fillStyle=rg; g.fillRect(0,0,w,h);
  g.strokeStyle='#f3efe8'; g.lineWidth=3; g.beginPath(); g.arc(w/2,h*.44,118,0,7); g.stroke(); g.fillStyle='#f3efe8'; g.textAlign='center'; g.font='600 20px "Geist Mono", monospace'; g.fillText('YOUR CONTENT',w/2,64);
  g.font='700 46px Inter, Helvetica, Arial, sans-serif'; g.fillText('Product',w/2,h*.8); g.fillText('name.',w/2,h*.8+50); g.fillRect(w/2-60,h*.93,120,3); }));
function fabPlinthRig(parent,stop=null){ const F=fabMat, W=.64, D=.44, H=1.12, PH=1.04, g=grp(parent,0,0,0), core=new THREE.Group();
  // what stays put: steel base on levelling feet, an aluminium frame, a shelf with the player and power, the screen mount
  core.add(at(fabRb(W-.03,.012,D-.03,M.steel,.004),0,.036,0)); for(const sx of [-1,1]) for(const sz of [-1,1]){ core.add(at(cyl(.022,.026,.03,M.rubber,16),sx*(W/2-.07),.015,sz*(D/2-.07))); core.add(at(fabRb(.03,H-.1,.03,M.alu,.004),sx*(W/2-.05),.042+(H-.1)/2,sz*(D/2-.05))); }
  for(const y of [.075,.56,1.045]){ for(const sz of [-1,1]) core.add(at(fabRb(W-.13,.03,.03,M.alu,.004),0,y,sz*(D/2-.05))); for(const sx of [-1,1]) core.add(at(fabRb(.03,.03,D-.13,M.alu,.004),sx*(W/2-.05),y,0)); }
  for(const sx of [-1,1]) for(const sz of [-1,1]) for(const y of [.075,.56,1.045]) core.add(at(fabRb(.034,.034,.034,M.black,.005),sx*(W/2-.05),y,sz*(D/2-.05)));
  core.add(at(fabRb(W-.13,.012,D-.13,M.shell2,.003),0,.33,0)); core.add(at(fabRb(.2,.042,.14,M.shell2,.006),-.07,.357,.02)); core.add(at(box(.006,.004,.002,F.glowA),-.15,.357,.0905)); for(let k=0;k<3;k++) core.add(at(fabRb(.016,.008,.003,F.dark,.001),-.09+k*.03,.355,.0905));
  core.add(at(fabRb(.26,.032,.05,M.white,.006),.02,.352,-.1)); for(let k=0;k<4;k++) core.add(at(fabRb(.03,.004,.03,F.dark,.002),-.07+k*.055,.369,-.1)); core.add(at(box(.008,.004,.012,F.glowA),.135,.369,-.1));
  for(const sx of [-1,1]) core.add(at(fabRb(.03,.5,.006,M.steel,.002),sx*.1,.8,D/2-.068)); for(const y of [.62,.98]) core.add(at(fabRb(.3,.03,.006,M.steel,.002),0,y,D/2-.062));
  core.add(tube([[.03,.36,.05],[.12,.38,.1],[.14,.5,.13],[.06,.66,D/2-.075]],.005,M.rubber,24)); core.add(tube([[-.1,.352,-.1],[-.2,.34,-.06],[-.16,.345,.0]],.004,M.rubber,16));
  g.add(fabBake(core));
  // front panel with its window, trimmed in aluminium
  const fs=new THREE.Group(), sh=new THREE.Shape(); sh.moveTo(-W/2,0); sh.lineTo(W/2,0); sh.lineTo(W/2,PH); sh.lineTo(-W/2,PH); sh.closePath(); const ho=new THREE.Path(); ho.moveTo(-.166,.4); ho.lineTo(-.166,.98); ho.lineTo(.166,.98); ho.lineTo(.166,.4); ho.closePath(); sh.holes.push(ho);
  const fg=new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:2}); { const uv=fg.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*26,uv.getY(i)*26); }
  fs.add(at(mesh(fg,M.shell),0,.05,D/2-.015)); for(const sx of [-1,1]) fs.add(at(fabRb(.005,.59,.02,M.alu,.002),sx*.1665,.74,D/2-.009)); for(const y of [.4475,1.0325]) fs.add(at(fabRb(.338,.005,.02,M.alu,.002),0,y,D/2-.009));
  fs.add(at(fabRb(.12,.018,.003,M.alu,.0015),0,.26,D/2+.001)); const pf=fabBake(fs); g.add(pf);
  const ss=new THREE.Group(); ss.add(at(fabRb(.325,.575,.034,M.black,.005),0,.74,D/2-.022)); const face=new THREE.Mesh(new THREE.PlaneGeometry(.311,.561),new THREE.MeshBasicMaterial({map:fabPlinthScr(),toneMapped:false})); face.position.set(0,.74,D/2-.0045); ss.add(face);
  for(const sx of [-1,1]) for(const sy of [-1,1]) ss.add(at(rot(cyl(.006,.006,.012,M.steel,10),Q),sx*.1,.74+sy*.1,D/2-.043)); const ps=fabBake(ss); g.add(ps);
  const side=(sx)=>{ const s=new THREE.Group(); s.add(at(fabRb(.016,PH,D-.03,M.shell,.004),sx*(W/2-.008),.05+PH/2,-.012)); const o=fabBake(s); g.add(o); return o; }, pl=side(-1), pr=side(1);
  const bsr=new THREE.Group(); bsr.add(at(fabRb(W-.034,PH,.016,M.shell,.004),0,.05+PH/2,-(D/2-.008))); for(let k=0;k<9;k++) bsr.add(at(box(.2,.005,.002,F.dark),0,.82+k*.016,-(D/2+.0005)));
  bsr.add(at(fabRb(.36,.4,.004,M.shell2,.003),0,.36,-(D/2+.001))); bsr.add(at(rot(cyl(.012,.012,.006,M.steel,14),Q),.14,.36,-(D/2+.004))); bsr.add(at(rot(cyl(.02,.02,.006,M.rubber,18),Q),-.2,.12,-(D/2+.002))); const pb=fabBake(bsr); g.add(pb);
  // top: a wooden cap with a metal stage and a ring of light, and the product that stands on it
  const ts=new THREE.Group(); ts.add(at(rbox(W+.02,.03,D+.02,F.wood,.008),0,H-.015,0)); ts.add(at(cyl(.14,.14,.004,M.alu,48),0,H+.002,0)); const ring=new THREE.Mesh(new THREE.RingGeometry(.112,.122,64),F.glowW); ring.rotation.x=-Q; ring.position.y=H+.0045; ts.add(ring);
  ts.add(at(fabRb(W-.1,.02,D-.1,M.shell2,.004),0,H-.04,0)); const pt=fabBake(ts); g.add(pt);
  const bo=new THREE.Group(); bo.add(at(rbox(.088,.1,.046,F.glass,.014),0,.05,0)); bo.add(at(cyl(.013,.013,.014,M.alu,18),0,.106,0)); bo.add(at(rbox(.04,.044,.04,M.black,.007),0,.134,0)); bo.add(at(fabRb(.05,.034,.001,M.white,.0004),0,.046,.0236)); bo.add(at(box(.03,.003,.0006,F.dark),0,.052,.0243)); bo.add(at(box(.02,.002,.0006,F.dark),0,.043,.0243));
  const pp=fabBake(bo); pp.position.y=H+.004; pp.rotation.y=.35; g.add(pp);
  const ex=(u)=>{ pf.position.z=u*.5; ps.position.z=u*.98; pl.position.x=-u*.42; pr.position.x=u*.42; pb.position.z=-u*.46; pt.position.y=u*.34; pp.position.y=H+.004+u*.62; };
  if(stop!==null) updaters.push((t,x)=>ex(sstep(stop-.5,stop+.02,x))); return {g,ex}; }

/* ---------- 02 · a pop-up retail unit. set(a): 0 = flat panels stacked on the deck, 1 = standing, lit, screen on ---------- */
function fabPopupRig(parent){ const F=fabMat, g=grp(parent,0,0,0), DW=2.8, DD=1.5, DH=.09, WH=2.42, zb=-DD/2+.06, parts=[];
  const litW=new THREE.MeshBasicMaterial({color:0x2c2c2e,toneMapped:false}), litA=new THREE.MeshBasicMaterial({color:0x3a2a1a,toneMapped:false});
  const signT=ctex(1024,96,(c,w,h)=>{ c.clearRect(0,0,w,h); c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle'; c.font='700 60px Inter, Helvetica, Arial, sans-serif'; try{ c.letterSpacing='14px'; }catch(e){} c.fillText('YOUR BRAND HERE',w/2,h/2+3); });
  const signM=new THREE.MeshBasicMaterial({map:signT,transparent:true,toneMapped:false,color:0x55575c});
  const scrT=ctex(640,360,()=>{}), sg=scrT.userData.g, scrM=new THREE.MeshBasicMaterial({map:scrT,toneMapped:false,color:0x000000});
  const drawScr=(t)=>{ sg.fillStyle='#101114'; sg.fillRect(0,0,640,360); const o=(t*60)%760; sg.save(); sg.transform(1,0,-.45,1,0,0); for(let k=0;k<3;k++){ sg.fillStyle=k===1?'#E8892D':'rgba(232,137,45,.28)'; sg.fillRect(-140+((o+k*250)%900),0,110,360); } sg.restore();
    sg.fillStyle='#f3efe8'; sg.font='700 64px Inter, Helvetica, Arial, sans-serif'; sg.textAlign='left'; sg.fillText('Your brand',44,170); sg.fillText('in motion.',44,240); sg.font='600 20px "Geist Mono", monospace'; sg.fillText('NEW COLLECTION',46,84); scrT.needsUpdate=true; }; drawScr(0);
  const posT=ctex(128,96,(c)=>{ c.fillStyle='#0d0f12'; c.fillRect(0,0,128,96); c.fillStyle='#E8892D'; c.fillRect(12,62,104,20); c.fillStyle='#dfe6ea'; c.font='600 22px "Geist Mono", monospace'; c.fillText('TOTAL',12,30); c.fillRect(12,40,60,4); }), posM=new THREE.MeshBasicMaterial({map:posT,toneMapped:false,color:0x000000});
  const poolT=fabOnce('poolT',()=>ctex(128,128,(c,w,h)=>{ const r=c.createRadialGradient(w/2,h/2,2,w/2,h/2,w/2); r.addColorStop(0,'rgba(255,236,205,1)'); r.addColorStop(.5,'rgba(255,236,205,.35)'); r.addColorStop(1,'rgba(255,236,205,0)'); c.fillStyle=r; c.fillRect(0,0,w,h); }));
  const pools=[]; const pool=(w,d,x,y,z,rx,k)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:poolT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,toneMapped:false})); m.rotation.x=rx; m.position.set(x,y,z); m.userData.k=k; g.add(m); pools.push(m); };
  const mk=(src,home,flat,fe,he=[0,0,0])=>{ const o=fabBake(src); g.add(o); const p={o,home:V(...home),flat:V(...flat),hq:new THREE.Quaternion().setFromEuler(new THREE.Euler(...he)),fq:new THREE.Quaternion().setFromEuler(new THREE.Euler(...fe))}; parts.push(p); return p; };
  const pose=(p,k,lift=.5)=>{ p.o.position.lerpVectors(p.flat,p.home,k); p.o.position.y+=Math.sin(k*Math.PI)*lift; p.o.quaternion.slerpQuaternions(p.fq,p.hq,k); };
  // deck: a raised floor with an aluminium nosing and a line of light under the front edge
  { const s=new THREE.Group(); s.add(at(rbox(DW,DH-.012,DD,M.shell,.012),0,DH/2+.006,0)); s.add(at(fabRb(DW-.03,.004,DD-.03,M.shell2,.002),0,DH+.001,0)); s.add(at(fabRb(DW+.006,.028,.012,M.alu,.004),0,DH-.012,DD/2+.003)); s.add(at(box(DW-.3,.006,.004,litA),0,.014,DD/2+.001));
    for(const sx of [-1,1]) s.add(at(fabRb(.012,.028,DD+.006,M.alu,.004),sx*(DW/2+.003),DH-.012,0)); g.add(fabBake(s)); }
  // back wall in two panels: the left one takes the screen, the right one is slatted in wood behind the shelves
  const bl=new THREE.Group(); bl.add(rbox(1.494,WH,.08,M.shell,.008)); bl.add(at(fabRb(1.3,.78,.004,M.black,.002),0,1.55-DH-WH/2,.041)); bl.add(at(fabRb(1.494,.012,.004,M.alu,.002),0,-.62,.041));
  const pBL=mk(bl,[-.65,DH+WH/2,zb],[0,DH+.05,0],[-Q,0,Q]);
  const br=new THREE.Group(); br.add(rbox(1.294,WH,.08,M.shell,.008)); for(let k=0;k<15;k++) br.add(at(fabRb(.06,WH-.24,.016,F.woodV,.004),-.56+k*.08,0,.047));
  const pBR=mk(br,[.75,DH+WH/2,zb],[0,DH+.15,0],[-Q,0,Q]);
  const wl=new THREE.Group(); wl.add(rbox(1.0,WH,.08,M.shell,.008)); wl.add(at(fabRb(.03,WH-.3,.005,M.amber,.002),-.44,0,.041)); wl.add(at(fabRb(.03,WH-.3,.005,M.amber,.002),-.44,0,-.041));
  const pWL=mk(wl,[-DW/2+.04,DH+WH/2,zb+.54],[0,DH+.25,-.25],[-Q,0,Q],[0,Q,0]);
  const wr=new THREE.Group(); wr.add(rbox(.5,WH,.08,M.shell,.008)); wr.add(at(fabRb(.03,WH-.3,.005,M.amber,.002),.19,0,.041)); wr.add(at(fabRb(.03,WH-.3,.005,M.amber,.002),.19,0,-.041));
  const pWR=mk(wr,[DW/2-.04,DH+WH/2,zb+.29],[0,DH+.25,.5],[-Q,0,Q],[0,-Q,0]);
  // canopy: a roof slab with a fascia carrying the sign, downlights and two speakers set into the underside
  const cn=new THREE.Group(); cn.add(rbox(DW,.1,1.2,M.shell,.014)); cn.add(at(rbox(DW,.34,.06,M.shell,.014),0,-.12,.57)); cn.add(at(fabRb(DW-.12,.012,.006,M.amber,.003),0,-.262,.601));
  { const sgn=new THREE.Mesh(new THREE.PlaneGeometry(2.3,.2156),signM); sgn.position.set(0,-.1,.6008); cn.add(sgn); }
  for(const x of [-1.05,-.35,.35,1.05]){ cn.add(at(cyl(.058,.058,.008,M.alu,28),x,-.052,.12)); const d=new THREE.Mesh(new THREE.CircleGeometry(.044,28),litW); d.rotation.x=Q; d.position.set(x,-.0565,.12); cn.add(d); }
  for(const sx of [-1,1]){ cn.add(at(cyl(.095,.095,.008,M.shell2,32),sx*.8,-.052,-.3)); const d=new THREE.Mesh(new THREE.CircleGeometry(.084,32),grilleMat('fabsp',.17,.17,[[.5,.5,.07]])); d.rotation.x=Q; d.position.set(sx*.8,-.0565,-.3); cn.add(d); }
  const pCN=mk(cn,[0,DH+WH+.05,zb-.04+.6],[0,.5,.36],[0,0,0]);
  // screen module
  const sc=new THREE.Group(); sc.add(rbox(1.26,.74,.05,M.black,.008)); { const p=new THREE.Mesh(new THREE.PlaneGeometry(1.21,.68),scrM); p.position.z=.0256; sc.add(p); }
  const pSC=mk(sc,[-.65,1.55,zb+.067],[-.65,1.55,zb+1.2],[0,0,0]);
  // shelves with a strip of light under each, and stock on them
  const shv=new THREE.Group(), glassD=std(0x26272b,.16,.3,{envMapIntensity:1.2});
  [1.25,1.65,2.05].forEach((y,r)=>{ shv.add(at(fabRb(1.06,.03,.28,F.wood,.004),0,y,.14)); shv.add(at(box(1.0,.004,.012,litW),0,y-.0172,.22));
    if(r===0) for(let k=0;k<6;k++){ const x=-.42+k*.168; shv.add(at(cyl(.034,.034,.15,k%3===1?M.amber:glassD,20),x,y+.09,.15)); shv.add(at(cyl(.014,.014,.022,M.alu,14),x,y+.176,.15)); shv.add(at(cyl(.02,.02,.03,M.black,16),x,y+.2,.15)); }
    if(r===1) for(let k=0;k<4;k++){ const x=-.37+k*.245; shv.add(at(rbox(.17,.15,.12,[M.white,M.shell2,M.amber,M.white][k],.012),x,y+.09,.15)); shv.add(at(fabRb(.09,.03,.002,k===1?M.alu:F.dark,.001),x,y+.085,.2105)); }
    if(r===2){ shv.add(at(rbox(.2,.22,.14,M.shell2,.02),-.34,y+.125,.15)); shv.add(at(rot(cyl(.06,.06,.004,M.alu,24),Q),-.34,y+.14,.221)); shv.add(at(lathe([[.0,0],[.07,0],[.075,.02],[.06,.16],[.03,.2],[.03,.23]],M.amber,32),0,y+.015,.15)); shv.add(at(rbox(.22,.1,.16,M.white,.012),.34,y+.065,.15)); shv.add(at(rbox(.18,.07,.13,M.shell2,.01),.34,y+.15,.15)); } });
  const pSH=mk(shv,[.75,0,zb+.054],[.75,0,zb+.054],[0,0,0]);
  // counter: slatted front, dark top, a payment tablet on a stand
  const ct=new THREE.Group(); ct.add(at(rbox(1.3,.94,.52,M.shell,.014),0,.5,0)); ct.add(at(fabRb(1.24,.04,.46,M.black,.004),0,.02,0)); for(let k=0;k<17;k++) ct.add(at(fabRb(.056,.84,.016,F.woodV,.004),-.6+k*.075,.5,.266));
  ct.add(at(rbox(1.38,.04,.6,M.shell2,.012),0,.99,0)); ct.add(at(box(1.3,.006,.006,litA),0,.966,.278)); ct.add(at(cyl(.07,.07,.01,M.alu,28),.38,1.015,.02)); ct.add(at(cyl(.011,.011,.15,M.alu,14),.38,1.09,.02));
  { const tb=grp(ct,.38,1.18,.03); tb.rotation.x=-.5; tb.add(fabRb(.26,.18,.012,M.black,.006)); const p=new THREE.Mesh(new THREE.PlaneGeometry(.236,.156),posM); p.position.z=.0065; tb.add(p); }
  ct.add(at(fabRb(.34,.03,.22,F.wood,.006),-.34,1.025,.02)); for(let k=0;k<3;k++){ ct.add(at(cyl(.03,.03,.12,k===1?M.amber:glassD,18),-.44+k*.1,1.1,.02)); ct.add(at(cyl(.016,.016,.028,M.black,14),-.44+k*.1,1.174,.02)); }
  const pCT=mk(ct,[.68,DH,.3],[.68,0,2.3],[0,0,0]);
  pool(2.5,1.3,0,DH+.006,.05,-Q,.42); pool(1.3,.7,.68,DH+1.012,.3,-Q,.3); pool(1.4,1.9,.75,1.45,zb+.066,0,.2);
  const cD=new THREE.Color(0x2c2c2e), cW=new THREE.Color(0xfff1dc), aD=new THREE.Color(0x3a2a1a), aL=new THREE.Color(AMBER), sD=new THREE.Color(0x55575c), sL=new THREE.Color(0xffffff); let on=0, fr=0;
  const set=(a)=>{ const up=sstep(0,.16,a), dn=sstep(.6,.78,a); pose(pBL,sstep(.08,.36,a),.55); pose(pBR,sstep(.18,.46,a),.55); pose(pWL,sstep(.3,.56,a),.4); pose(pWR,sstep(.36,.6,a),.4);
    pCN.o.position.lerpVectors(pCN.flat,pCN.home,up); pCN.o.position.y+=up*.5*(1-dn);
    const ks=sstep(.6,.8,a); pose(pSC,ks,0); pSC.o.scale.setScalar(Math.max(.001,sstep(.6,.66,a))); const kh=sstep(.68,.86,a); pSH.o.scale.set(1,1,Math.max(.001,kh)); pSH.o.visible=kh>.001; pose(pCT,sstep(.5,.84,a),.1);
    on=sstep(.88,1,a); litW.color.copy(cD).lerp(cW,on); litA.color.copy(aD).lerp(aL,on); signM.color.copy(sD).lerp(sL,on); scrM.color.setScalar(on); posM.color.setScalar(on); for(const p of pools) p.material.opacity=on*p.userData.k; };
  updaters.push((t)=>{ if(on>0&&fr++%4===0) drawScr(t); }); set(1); return {g,set}; }

/* ---------- 03 · large-format printer: a gantry over a fixed bed, a pellet extruder on a vertical ram, printing a chair on its side ---------- */
function fabBigPrinterRig(parent){ const F=fabMat, g=grp(parent,0,0,0), FH=2.0, HX=1.3, HZ=1.0, NZ=.2, bedTop=.456, st=new THREE.Group();
  // frame: columns on levelling feet, floor rails, top beams with gussets, a hardened rail along each side
  for(const sx of [-1,1]) for(const sz of [-1,1]){ st.add(at(rbox(.1,FH-.02,.1,M.shell2,.012),sx*HX,FH/2+.02,sz*HZ)); st.add(at(cyl(.06,.07,.02,M.steel,20),sx*HX,.01,sz*HZ)); st.add(at(cyl(.014,.014,.03,M.steel,10),sx*HX,.03,sz*HZ)); }
  for(const sx of [-1,1]){ st.add(at(rbox(.1,.1,HZ*2-.1,M.shell2,.012),sx*HX,.1,0)); st.add(at(rbox(.14,.16,HZ*2+.24,M.shell2,.016),sx*HX,FH-.02,0)); st.add(at(fabRb(.036,.022,HZ*2+.16,M.steel,.004),sx*HX,FH+.071,0)); for(const sz of [-1,1]) st.add(at(fabRb(.06,.05,.03,M.rubber,.008),sx*HX,FH+.085,sz*(HZ+.095))); }
  st.add(at(rbox(HX*2-.1,.1,.1,M.shell2,.012),0,.1,-HZ)); for(const sz of [-1,1]) st.add(at(rbox(HX*2-.14,.1,.1,M.shell2,.012),0,FH-.02,sz*HZ));
  { const gs=fabOnce('gusset',()=>{ const s=new THREE.Shape(); s.moveTo(0,0); s.lineTo(.3,0); s.lineTo(0,-.3); s.closePath(); return new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false}); });
    for(const sz of [-1,1]){ st.add(at(mesh(gs,M.shell2),-HX+.05,FH-.07,sz*HZ-.006)); st.add(at(rot(mesh(gs,M.shell2),0,Math.PI,0),HX-.05,FH-.07,sz*HZ+.006)); }
    for(const sx of [-1,1]){ st.add(at(rot(mesh(gs,M.shell2),0,-Q,0),sx*HX-.006,FH-.1,-HZ+.05)); st.add(at(rot(mesh(gs,M.shell2),0,Q,0),sx*HX+.006,FH-.1,HZ-.05)); } }
  for(const sx of [-1,1]) for(const sz of [-1,1]) for(const dy of [.3,1.0,1.7]) st.add(at(rot(cyl(.012,.012,.006,M.steel,10),Q),sx*HX,dy,sz*(HZ+.051)));
  // bed: a welded table, a machined plate, the print sheet
  for(const sx of [-1,1]) for(const sz of [-1,1]){ st.add(at(rbox(.08,.34,.08,M.shell2,.01),sx*.82,.19,sz*.6)); st.add(at(cyl(.04,.05,.02,M.steel,16),sx*.82,.01,sz*.6)); }
  st.add(at(rbox(1.78,.1,1.36,M.shell2,.012),0,.37,0)); st.add(at(rbox(1.84,.03,1.42,M.alu,.006),0,.435,0)); st.add(at(fabRb(1.78,.006,1.36,F.pei,.002),0,.453,0)); for(const sx of [-1,1]) for(const sz of [-1,1]) st.add(at(cyl(.012,.012,.006,M.steel,10),sx*.88,.451,sz*.67));
  // control: a pendant on an arm off the front-right column, and a stack light on top of it
  const scrT=ctex(320,200,()=>{}), scg=scrT.userData.g, L=fabChairLoop();
  const drawScr=(k,rows)=>{ scg.fillStyle='#0b0d10'; scg.fillRect(0,0,320,200); scg.strokeStyle='#E8892D'; scg.lineWidth=3; scg.beginPath(); L.forEach((p,i)=>{ const x=236+p[0]*120, y=92+p[1]*120; i?scg.lineTo(x,y):scg.moveTo(x,y); }); scg.closePath(); scg.stroke();
    scg.fillStyle='#8d949b'; scg.font='600 16px "Geist Mono", monospace'; scg.fillText('PRINTING',16,30); scg.fillText('LAYER '+k+' / '+rows,16,172); scg.fillStyle='#eef1f3'; scg.font='600 50px "Geist Mono", monospace'; scg.fillText(Math.round(k/rows*100)+'%',14,100); scg.fillStyle='#22262b'; scg.fillRect(16,120,130,10); scg.fillStyle='#E8892D'; scg.fillRect(16,120,130*k/rows,10); scrT.needsUpdate=true; };
  { const pd=grp(st,HX+.3,1.32,HZ+.12); pd.rotation.y=-.35; pd.add(rbox(.4,.52,.13,M.shell,.014)); const p=new THREE.Mesh(new THREE.PlaneGeometry(.3,.1875),new THREE.MeshBasicMaterial({map:scrT,toneMapped:false})); p.position.set(0,.11,.0665); pd.add(p); pd.add(at(fabRb(.33,.215,.006,M.black,.004),0,.11,.064));
    pd.add(at(rot(cyl(.03,.03,.012,M.alu,24),Q),-.12,-.13,.07)); pd.add(at(rot(cyl(.023,.026,.03,M.amber,24),Q),-.12,-.13,.088)); for(let k=0;k<3;k++){ pd.add(at(rot(cyl(.015,.015,.01,M.satin,18),Q),-.02+k*.06,-.11,.069)); pd.add(at(rot(cyl(.011,.011,.006,k?M.white:F.glowA,16),Q),-.02+k*.06,-.11,.076)); }
    pd.add(at(rot(cyl(.012,.012,.014,M.steel,14),Q),.1,-.19,.07)); pd.add(at(fabRb(.2,.01,.004,M.alu,.002),.04,-.19,.066));
    st.add(at(rot(fabRb(.34,.05,.05,M.shell2,.01),0,-.35,0),HX+.15,1.32,HZ+.06)); }
  st.add(at(cyl(.02,.02,.1,M.steel,14),HX,FH+.11,HZ+.02)); st.add(at(cyl(.032,.032,.05,F.glowA,20),HX,FH+.185,HZ+.02)); st.add(at(cyl(.032,.032,.05,std(0x4f5a4c,.4),20),HX,FH+.237,HZ+.02)); st.add(at(cyl(.034,.034,.012,M.black,20),HX,FH+.268,HZ+.02));
  g.add(fabBake(st));
  // bridge: runs front to back on the side rails
  const bs=new THREE.Group(); for(const sx of [-1,1]){ bs.add(at(fabRb(.2,.09,.3,M.black,.014),sx*HX,FH+.127,0)); bs.add(at(rot(cyl(.045,.045,.12,M.black,20),Q),sx*(HX+.03),FH+.2,-.2)); bs.add(at(rot(cyl(.047,.047,.02,M.alu,20),Q),sx*(HX+.03),FH+.2,-.27)); }
  bs.add(at(rbox(HX*2+.14,.18,.14,M.alu,.014),0,FH+.26,0)); for(const sy of [-1,1]) bs.add(at(fabRb(HX*2-.2,.02,.016,M.steel,.004),0,FH+.26+sy*.055,.078)); bs.add(at(box(HX*2-.2,.03,.004,M.rubber),0,FH+.26,.072));
  { const chT=fabOnce('chainT',()=>ctex(64,16,(c,w,h)=>{ c.fillStyle='#19191b'; c.fillRect(0,0,w,h); c.fillStyle='#050506'; c.fillRect(0,0,5,h); c.fillStyle='#2e2f33'; c.fillRect(8,3,w-12,h-6); },[36,1]));
    bs.add(at(fabRb(HX*2-.3,.05,.075,std(0xffffff,.6,.1,{map:chT}),.012),0,FH+.376,-.02)); bs.add(at(fabRb(HX*2-.2,.008,.1,M.shell2,.002),0,FH+.352,-.02)); }
  const br=fabBake(bs); g.add(br);
  // carriage on the bridge: plate, guide housing for the ram, a hopper for the pellets
  const cs=new THREE.Group(); cs.add(at(fabRb(.36,.4,.03,M.shell2,.008),0,FH+.26,.1)); for(const sx of [-1,1]) for(const sy of [-1,1]) cs.add(at(fabRb(.08,.045,.03,M.steel,.006),sx*.11,FH+.26+sy*.055,.092));
  cs.add(at(rbox(.22,.44,.16,M.shell2,.014),0,FH+.26,NZ)); cs.add(at(fabRb(.222,.014,.162,M.amber,.004),0,FH+.1,NZ)); cs.add(at(cyl(.05,.05,.13,M.black,22),.0,FH+.545,NZ+.13)); cs.add(at(cyl(.052,.052,.02,M.alu,22),0,FH+.49,NZ+.13)); cs.add(at(fabRb(.1,.06,.1,M.black,.01),0,FH+.45,NZ+.13));
  cs.add(at(lathe([[.014,0],[.022,.02],[.095,.15],[.095,.25],[.088,.25]],M.alu,36),-.27,FH+.3,NZ)); cs.add(at(cyl(.099,.099,.012,M.black,36),-.27,FH+.556,NZ)); cs.add(at(sph(.018,M.black,14,10),-.27,FH+.565,NZ)); cs.add(at(fabRb(.1,.03,.06,M.shell2,.008),-.17,FH+.36,NZ));
  const cx=fabBake(cs); br.add(cx);
  // the ram and the extruder at its foot: drive motor, feed throat, barrel with heater bands, a cooling ring, the nozzle
  const zs=new THREE.Group(); zs.add(at(rbox(.09,1.6,.09,M.alu,.01),0,1.3,0)); for(const sx of [-1,1]) zs.add(at(fabRb(.014,1.56,.022,M.steel,.003),sx*.052,1.3,0)); zs.add(at(box(.03,1.56,.004,M.rubber),0,1.3,.046)); zs.add(at(fabRb(.11,.03,.11,M.black,.008),0,2.11,0));
  zs.add(at(fabRb(.16,.022,.16,M.steel,.005),0,.49,0)); zs.add(at(rbox(.11,.1,.11,M.alu,.012),0,.43,0)); zs.add(at(rbox(.11,.13,.11,M.black,.012),.11,.43,0)); zs.add(at(rot(cyl(.046,.046,.14,M.black,22),0,0,Q),.235,.43,0)); zs.add(at(rot(cyl(.048,.048,.016,M.alu,22),0,0,Q),.17,.43,0));
  zs.add(at(rot(cyl(.022,.022,.05,M.steel,16),0,0,Q-.5),-.075,.445,0)); zs.add(at(cyl(.027,.027,.33,M.steel,22),0,.215,0));
  for(const y of [.1,.19,.28]){ zs.add(at(cyl(.036,.036,.055,F.brass,24),0,y,0)); zs.add(at(fabRb(.022,.03,.03,M.black,.004),0,y,.042)); } zs.add(tube([[0,.1,.056],[.03,.2,.085],[.02,.34,.07],[.03,.47,.085]],.006,M.rubber,20));
  zs.add(lathe([[0,0],[.004,0],[.013,.02],[.018,.032],[.018,.052]],F.brass,20)); zs.add(at(rot(mesh(new THREE.TorusGeometry(.055,.009,10,32),M.alu),Q),0,.05,0)); for(const sx of [-1,1]) zs.add(tube([[sx*.055,.05,0],[sx*.075,.12,0],[sx*.06,.3,-.03],[sx*.04,.4,-.05]],.007,M.alu,16));
  const zr=fabBake(zs); zr.position.z=NZ; cx.add(zr);
  const hose=fabHose(.018,M.rubber,24); cx.add(hose);
  const chair=fabLayered(fabChairFn(),.62,62,.03,fabPrintMat(AMBER,2)); chair.g.position.y=bedTop; g.add(chair.g);
  let lastK=-1; const set=(u,t=0)=>{ const k=chair.set(u), p=chair.pt(k,t*.09), ty=bedTop+p[1]+.004; br.position.z=p[2]-NZ; cx.position.x=p[0]; zr.position.y=ty;
    if(k!==lastK){ lastK=k; hose.userData.set([[-.1,ty+.455,NZ],[-.2,ty+.5,NZ],[-.42,(ty+.5+FH+.2)/2,NZ+.02],[-.3,FH+.2,NZ],[-.27,FH+.3,NZ]]); drawScr(k,chair.rows); } };
  set(.5,0); return {g,set,chair}; }
/* finished pieces: the same chair stood on its feet, and a stool */
function fabChair(col=0x2b2c30){ const o=new THREE.Group(), c=fabLayered(fabChairFn(),.62,62,.03,fabPrintMat(col,2)); c.g.rotation.x=Q; c.g.position.set(0,.5,-.31); o.add(c.g); return o; }
function fabStool(col=0xd9d4c8,R=.2,H=.46){ return fabLayered(fabStoolFn(R),H,46,.012,fabPrintMat(col,2)).g; }

/* the print farm: a rack of small printers, each part-way through the same part */
function fabFarm(parent){ const F=fabMat, g=grp(parent,0,0,0), s=new THREE.Group(), RW=1.94, RD=.62, ys=[.2,.84,1.48];
  for(const sx of [-1,1]) for(const sz of [-1,1]){ const c=fabCaster(.05); c.position.set(sx*(RW/2-.02),0,sz*(RD/2-.02)); c.rotation.y=.4*sx; s.add(c); s.add(at(fabRb(.04,2.06,.04,F.ano,.006),sx*(RW/2-.02),1.17,sz*(RD/2-.02))); s.add(at(fabRb(.046,.012,.046,M.black,.003),sx*(RW/2-.02),2.204,sz*(RD/2-.02))); }
  [...ys,2.12].forEach((y,r)=>{ s.add(at(rbox(RW-.02,.03,RD,M.shell2,.006),0,y-.015,0)); s.add(at(fabRb(RW-.08,.018,.004,M.alu,.002),0,y-.015,RD/2+.001)); if(r>0) s.add(at(box(RW-.2,.005,.02,F.glowW),0,y-.0325,RD/2-.06));
    if(r<3){ const lt=ctex(768,24,(c,w,h)=>{ c.fillStyle='#ece9e3'; for(let k=0;k<3;k++){ c.fillRect(64+k*256,2,128,h-4); } c.fillStyle='#1a1a18'; c.font='600 15px "Geist Mono", monospace'; c.textAlign='center'; for(let k=0;k<3;k++) c.fillText('P-0'+(r*3+k+1),128+k*256,17); }), p=new THREE.Mesh(new THREE.PlaneGeometry(RW-.08,.0164),new THREE.MeshBasicMaterial({map:lt,transparent:true,toneMapped:false})); p.position.set(0,y-.015,RD/2+.0035); s.add(p); } });
  for(const sx of [-1,1]) for(const y of [.5,1.15,1.8]) s.add(at(fabRb(.02,.03,RD-.08,F.ano,.004),sx*(RW/2-.02),y,0));
  s.add(rod2(V(-RW/2+.02,.25,-RD/2+.02),V(RW/2-.02,2.05,-RD/2+.02),.006,M.steel)); s.add(rod2(V(RW/2-.02,.25,-RD/2+.02),V(-RW/2+.02,2.05,-RD/2+.02),.006,M.steel));
  s.add(at(fabRb(.05,.9,.04,M.white,.008),RW/2-.02,1.2,-RD/2-.02)); for(let k=0;k<6;k++) s.add(at(fabRb(.03,.03,.004,F.dark,.002),RW/2-.02,.85+k*.14,-RD/2-.041)); s.add(tube([[RW/2-.02,.75,-RD/2-.02],[RW/2-.03,.4,-RD/2-.05],[RW/2+.05,.06,-RD/2-.12],[RW/2+.3,.012,-RD/2-.2]],.006,M.rubber,24));
  // top shelf: spare spools and boxed stock
  [[AMBER,-.78],[0x2a2b2e,-.56],[0xd9d4c8,-.34],[AMBER,-.12]].forEach(([c,x],i)=>{ const sp=fabSpool(c); sp.position.set(x,2.22,-.05+(i%2)*.06); sp.rotation.y=.15-i*.1; s.add(sp); });
  s.add(at(rbox(.34,.22,.3,F.card,.006),.3,2.23,0)); s.add(at(rbox(.3,.16,.26,F.card,.006),.68,2.2,.02)); s.add(at(box(.05,.0012,.302,M.white),.3,2.3405,0)); s.add(at(box(.05,.0012,.262,M.white),.68,2.2805,.02));
  g.add(fabBake(s));
  const us=[.34,.62,.9]; for(let v=0;v<3;v++){ const p=fabPrinter(true); p.set(us[v],v*1.3+.4); const py=p.bed.position.y+p.sheetY; p.bed.remove(p.part.g); const bk=fabBake(p.g), mats=[], pm=[];
    for(let r=0;r<3;r++) for(let c=0;c<3;c++) if((r+c)%3===v){ mats.push(new THREE.Matrix4().makeTranslation(-.65+c*.6,ys[r],-.02)); pm.push(new THREE.Matrix4().makeTranslation(-.65+c*.6,ys[r]+py,-.02)); }
    g.add(fabInst(bk,mats)); for(const m of [p.part.body,p.part.cap]){ const im=new THREE.InstancedMesh(m.geometry,m.material,pm.length); pm.forEach((x,i)=>im.setMatrixAt(i,x)); im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; g.add(im); } }
  return g; }

/* what stands for Fabrication on the homepage: a desktop printer mid-print on its workshop cart */
HERO.fabrication=(G)=>{ const s=grp(G,0,0,0); s.rotation.y=.4; fabStation(s); };

/* ===== fabrication page: where things stand and where the camera stops ===== */
const fbI0=grp(scene,0,0,0), fbSmall=grp(fbI0,-4.2,0,.2); fbSmall.rotation.y=.42;
fabStation(fbSmall);                                             // small: a printed part, on the printer that makes it
const fbPl=fabPlinthRig(grp(fbI0,-1.45,0,0),2);                  // medium: a custom plinth with a screen in its face
const fbPop=fabPopupRig(grp(fbI0,2.9,0,-.2));                    // large: a pop-up unit

const FG=13; // the second set sits close so it slides in as the first leaves
const fbI1=grp(scene,FG,0,0);
const fbBig=fabBigPrinterRig(grp(fbI1,-1.3,0,0));
{ const c=fabChair(); c.position.set(1.75,0,1.7); c.rotation.y=-.55; fbI1.add(c); const st=fabStool(); st.position.set(.95,0,2.55); fbI1.add(st); }
{ const f=fabFarm(grp(fbI1,6.6,0,-.1)); f.rotation.y=-.3; }

updaters.push((t,x)=>{
  fbI0.visible=x<4.05; fbI1.visible=x>2.95;   // each set only while the camera is near it
  // the printer cart leaves after the range, the plinth after its own stop
  const gone=sstep(1.3,1.62,x); fbSmall.scale.setScalar(Math.max(.001,1-gone)); fbSmall.visible=gone<.999;
  const pg=sstep(2.32,2.62,x); fbPl.g.scale.setScalar(Math.max(.001,1-pg)); fbPl.g.visible=pg<.999;
  // the pop-up stands finished in the range shot, is flat-packed while the camera is on the plinth (out of frame), and goes up as you arrive
  fbPop.set(x<2?1:sstep(2.3,2.98,x));
  // the big print grows on the way in, and finishes on the way to the farm
  fbBig.set(lerp(.08,.72,sstep(3.3,4.05,x))+.28*sstep(4.25,5,x),t); });

PAGE.keys=(narrow,K,R)=>[
  narrow? R([-2.4,1.7,6.6],[-4.2,.72,.2],34) : K([-2.5,1.5,3.9],[-4.3,.98,.2],30),                 // opening: the desktop printer on its cart
  narrow? R([-9.4,3.0,16.5],[-.6,1.3,-.4],46) : K([.7,2.8,18.6],[1.1,1.35,0],30,-.24),               // the range: a part, a plinth, a pop-up
  narrow? R([1.4,1.9,7.4],[-1.5,.98,.3],34) : K([.75,1.75,4.7],[-1.75,.92,.3],30),                     // 01 the plinth comes apart
  narrow? R([-.6,2.3,15.0],[2.65,1.45,0],36) : K([.3,2.1,8.9],[3.35,1.3,0],30),                        // 02 the pop-up goes up and lights
  narrow? R([FG-4.4,2.9,12.5],[FG-.3,1.5,.4],36) : K([FG-3.4,3.2,12.8],[FG+.1,1.3,.4],30),                  // 03 the large-format printer
  narrow? R([FG+3.9,1.8,7.6],[FG+6.6,1.2,0],36) : K([FG+4.3,1.6,6.3],[FG+6.4,1.15,0],30),                 // 03 the print farm
  K([FG+2.5,4.6,18.5],[FG+2.8,1.3,0],30,0,.25) ];                                                           // closing

/* ---------- camera path ---------- */
let narrow=false, W=1, H=1;
const KEYS=()=>{ const k=narrow?1.5:1, ox=narrow?0:-.16, oy=narrow?.15:0,
  // K(camera, look-at, fov, [ox], [oy]): a stop framed for the desktop layout (subject right of the text); on phones the camera backs off 1.5x and the subject moves up
  K=(c,l,f,o,o2)=>({p:[l[0]+(c[0]-l[0])*k,l[1]+(c[1]-l[1])*k,l[2]+(c[2]-l[2])*k],l,f,ox:o??ox,oy:o2??oy}),
  // R(camera, look-at, fov, [oy]): a stop used exactly as given, centred. Use it for a phone-only framing: narrow ? R(...) : K(...)
  R=(c,l,f,o2)=>({p:c,l,f,ox:0,oy:o2??oy}); return PAGE.keys(narrow,K,R); };
function resize(){ W=canvas.clientWidth; H=canvas.clientHeight; narrow=W<900; renderer.setSize(W,H,false); camera.aspect=W/H; camera.updateProjectionMatrix(); }
addEventListener('resize',resize); resize();
const caps2=[...document.querySelectorAll('.cap')], dots=[...document.querySelectorAll('#rail a')];
const goStop=(i)=>{ const n=KEYS().length-1, span=floorEl.offsetHeight-innerHeight; scrollTo({top:floorEl.offsetTop+span*i/n,behavior:reduce?'auto':'smooth'}); };
dots.forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); goStop(+a.dataset.i); }));
document.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); goStop(+a.dataset.go); }));
let prog=0, stop=-1, visible=true; new IntersectionObserver(e=>{ visible=e[0].isIntersecting; }).observe(floorEl);
const mouse={x:0,y:0}; addEventListener('pointermove',e=>{ mouse.x=e.clientX/innerWidth-.5; mouse.y=e.clientY/innerHeight-.5; });
const clock=new THREE.Clock(), cp=V(0,0,0), lk=V(0,0,0);
function frame(){ requestAnimationFrame(frame); if(!visible&&!SNAP) return; const t=clock.getElapsedTime();
  const span=Math.max(1,floorEl.offsetHeight-innerHeight), raw=clamp((scrollY-floorEl.offsetTop)/span); prog+=(raw-prog)*((reduce||SNAP)?1:.085);
  const K=KEYS(), n=K.length-1, x=prog*n, seg=Math.min(n-1,Math.floor(x)), f=x-seg, hold=.3, lt=sstep(0,1,clamp((f-hold/2)/(1-hold)));
  const A=K[seg], B=K[seg+1], Lf=(k)=>lerp(A[k],B[k],lt); cp.set(lerp(A.p[0],B.p[0],lt),lerp(A.p[1],B.p[1],lt),lerp(A.p[2],B.p[2],lt)); lk.set(lerp(A.l[0],B.l[0],lt),lerp(A.l[1],B.l[1],lt),lerp(A.l[2],B.l[2],lt));
  if(!reduce){ cp.x+=Math.sin(t*.23)*.12-mouse.x*.5; cp.y+=Math.cos(t*.19)*.06+mouse.y*.25; }
  camera.position.copy(cp); camera.lookAt(lk); camera.fov=Lf('f'); camera.setViewOffset(W,H,Lf('ox')*W,Lf('oy')*H,W,H); camera.updateProjectionMatrix();
  if(SNAP&&window.__cam){ const c=window.__cam; cp.set(c.p[0],c.p[1],c.p[2]); lk.set(c.l[0],c.l[1],c.l[2]); camera.position.copy(cp); camera.lookAt(lk); camera.fov=c.f||30; camera.clearViewOffset(); camera.updateProjectionMatrix(); }
  key.position.set(lk.x-7,15,9); key.target.position.set(lk.x,0,0); fill.position.set(cp.x-1,cp.y+1.5,cp.z+3); fill.target.position.copy(lk); rim.position.set(lk.x+8,7.5,-9); rim.target.position.copy(lk); ground.position.x=lk.x;
  // 01: the hang opens up as you scroll from the hero to the systems stop
  const b=(t*118/60)%1, kick=Math.exp(-b*6); for(const [cone,cap,r] of movers){ const d=kick*r*.07; cone.position.z=d; cap.position.z=-r*.5*.82+d; }
  for(const [o,sp] of spinners) o.rotation.y=t*sp;
  for(const u of updaters) u(t,x);
  window.__n=n; const s=Math.round(x); if(s!==stop){ stop=s; caps2.forEach(c=>c.classList.toggle('on',+c.dataset.s===s)); dots.forEach(a=>a.classList.toggle('on',+a.dataset.i===s)); document.body.classList.toggle('end',s===n); document.body.classList.toggle('top',s===0); }
  renderer.render(scene,camera); }
document.fonts&&document.fonts.ready.then(()=>{});
frame();
