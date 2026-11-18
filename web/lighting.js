
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* Audio page: a scroll-driven product film. No room: each product family sits alone on a seamless backdrop,
   the camera travels from one to the next, and scrolling opens each one up. All models are built here. */
const canvas=document.getElementById('stage'), floorEl=document.getElementById('floor');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, SNAP=location.hash.startsWith('#snap');
const BG=0xECE9E3, AMBER=0xE8892D, Q=Math.PI/2;

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
const PF={tier:0,avg:0,last:0,n:0,from:0,ok:0,bad:0,ups:0,r:[Math.min(devicePixelRatio,2),Math.min(devicePixelRatio,1.6),Math.min(devicePixelRatio,1.3)],s:[2,4,8]}; renderer.setPixelRatio(PF.r[0]); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate=false; renderer.shadowMap.needsUpdate=true;
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

/* ===== lighting & staging models: definitions only, nothing is added to the scene here ===== */
/* ---------- shared helpers: merging static parts into one mesh per material keeps the mesh count low ---------- */
function ltMergeG(list){ let n=0; for(const g of list) n+=g.attributes.position.count; const P=new Float32Array(n*3), N=new Float32Array(n*3), U=new Float32Array(n*2); let o=0;
  for(const g of list){ P.set(g.attributes.position.array,o*3); N.set(g.attributes.normal.array,o*3); if(g.attributes.uv) U.set(g.attributes.uv.array,o*2); o+=g.attributes.position.count; }
  const out=new THREE.BufferGeometry(); out.setAttribute('position',new THREE.BufferAttribute(P,3)); out.setAttribute('normal',new THREE.BufferAttribute(N,3)); out.setAttribute('uv',new THREE.BufferAttribute(U,2)); return out; }
// flattens a finished, static group in place. Children marked userData.keep (and instanced meshes) survive as they are
function ltBake(src){ src.updateMatrixWorld(true); const inv=src.matrixWorld.clone().invert(), by=new Map(), keep=[];
  const walk=(o)=>{ if(o!==src&&(o.userData.keep||o.isInstancedMesh)){ keep.push([o,new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld)]); return; }
    if(o.isMesh){ const k=o.material.uuid+(o.castShadow?'c':'n'); if(!by.has(k)) by.set(k,{m:o.material,cast:o.castShadow,list:[]}); const ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); ge.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld)); by.get(k).list.push(ge); }
    for(const c of o.children) walk(c); };
  walk(src); src.clear();
  for(const e of by.values()){ const me=new THREE.Mesh(ltMergeG(e.list),e.m); me.castShadow=e.cast; me.receiveShadow=true; src.add(me); for(const ge of e.list) ge.dispose(); }
  for(const [o,m] of keep){ m.decompose(o.position,o.quaternion,o.scale); src.add(o); }
  return src; }
const ltYup=new THREE.Vector3(0,1,0);
function ltRodG(a,b,r,seg=8){ const d=b.clone().sub(a), L=d.length(), g=new THREE.CylinderGeometry(r,r,L,seg,1,false).toNonIndexed();
  g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(ltYup,d.normalize()),new THREE.Vector3(1,1,1))); return g; }
// a profile [[radius,z],...] turned about z in N flat facets: smooth along its length, flat across each panel (a sewn softbox)
function ltFacetG(prof,N,dr=0){ const P=[],Nn=[],U=[], n=prof.length, pn=prof.map((p,i)=>{ const a=prof[Math.max(0,i-1)], b=prof[Math.min(n-1,i+1)], dz=b[1]-a[1], dR=b[0]-a[0], l=Math.hypot(dz,dR)||1; return [dz/l,-dR/l]; });
  for(let k=0;k<N;k++){ const a0=k/N*Math.PI*2, a1=(k+1)/N*Math.PI*2, am=(a0+a1)/2, c0=Math.cos(a0), s0=Math.sin(a0), c1=Math.cos(a1), s1=Math.sin(a1), cm=Math.cos(am), sm=Math.sin(am);
    for(let i=0;i<n-1;i++){ const q=[[prof[i][0]+dr,prof[i][1],c0,s0,i,0],[prof[i][0]+dr,prof[i][1],c1,s1,i,1],[prof[i+1][0]+dr,prof[i+1][1],c1,s1,i+1,1],[prof[i+1][0]+dr,prof[i+1][1],c0,s0,i+1,0]];
      for(const j of [0,1,2,0,2,3]){ const [r,z,c,s,pi,uu]=q[j]; P.push(r*c,r*s,z); Nn.push(pn[pi][0]*cm,pn[pi][0]*sm,pn[pi][1]); U.push((k+uu)/N,pi/(n-1)); } } }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); return g; }

/* ---------- textures and materials ---------- */
const ltSoftT=ctex(256,256,(g,w,h)=>{ const gr=g.createRadialGradient(w/2,h/2,4,w/2,h/2,w/2); gr.addColorStop(0,'#fffdf6'); gr.addColorStop(.4,'#fff7e6'); gr.addColorStop(.8,'#fbeccd'); gr.addColorStop(1,'#f1dcb4'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
const ltPoolT=ctex(256,256,(g,w,h)=>{ const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.3,'rgba(255,255,255,.8)'); gr.addColorStop(.65,'rgba(255,255,255,.28)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
const ltFanT=ctex(128,128,(g,w,h)=>{ g.fillStyle='#0c0c0e'; g.fillRect(0,0,w,h); g.strokeStyle='#3a3b40'; g.lineWidth=3; for(let r=8;r<62;r+=7){ g.beginPath(); g.arc(w/2,h/2,r,0,7); g.stroke(); } g.lineWidth=4; for(let k=0;k<4;k++){ const a=k*Math.PI/2+.4; g.beginPath(); g.moveTo(w/2,h/2); g.lineTo(w/2+Math.cos(a)*62,h/2+Math.sin(a)*62); g.stroke(); } g.fillStyle='#2c2d31'; g.beginPath(); g.arc(w/2,h/2,13,0,7); g.fill(); });
const ltLensT=ctex(256,256,(g,w,h)=>{ const gr=g.createRadialGradient(w/2,h/2,2,w/2,h/2,w/2); gr.addColorStop(0,'#fffef8'); gr.addColorStop(.3,'#fff3d6'); gr.addColorStop(1,'#f2d39a'); g.fillStyle=gr; g.fillRect(0,0,w,h); for(let r=10;r<126;r+=7){ g.strokeStyle='rgba(150,105,40,.34)'; g.lineWidth=1.3; g.beginPath(); g.arc(w/2,h/2,r,0,7); g.stroke(); g.strokeStyle='rgba(255,255,255,.55)'; g.beginPath(); g.arc(w/2,h/2,r+2,0,7); g.stroke(); } });
const ltDeckT=ctex(128,128,(g,w,h)=>{ g.fillStyle='#777'; g.fillRect(0,0,w,h); const s=8; for(let r=0;r*s*.87<h+s;r++) for(let c=0;c*s<w+s;c++){ g.fillStyle='#a8a8a8'; g.beginPath(); g.arc(c*s+(r%2)*s/2,r*s*.87,2.3,0,7); g.fill(); } },[40,20]);
const ltPleatT=ctex(256,32,(g,w,h)=>{ for(let x=0;x<w;x+=32){ const gr=g.createLinearGradient(x,0,x+32,0); gr.addColorStop(0,'#0c0c0d'); gr.addColorStop(.35,'#2b2b2e'); gr.addColorStop(.7,'#1b1b1d'); gr.addColorStop(1,'#0a0a0b'); g.fillStyle=gr; g.fillRect(x,0,32,h); } });
const LT={
  fab:std(0x151517,.96,0,{bumpMap:weaveF,bumpScale:.3,envMapIntensity:.25}), silverIn:std(0xdcd9d1,.42,.55,{side:THREE.BackSide,envMapIntensity:.9}),
  body:std(0x1a1b1e,.48,.25,{envMapIntensity:.9}), fin:std(0x2a2b2f,.4,.65,{envMapIntensity:1}), matte:std(0x131315,.7,.2),
  refl:std(0xe8e5de,.22,.9,{envMapIntensity:1.2,side:THREE.DoubleSide}), brass:std(0xc9a25a,.3,.9),
  deck:std(0x1a1a1c,.74,.04,{bumpMap:ltDeckT,bumpScale:.12}), canvas:std(0x232421,1,0,{bumpMap:weaveF,bumpScale:.45,envMapIntensity:.15}),
  fan:std(0xffffff,.6,.3,{map:ltFanT}), cob:new THREE.MeshBasicMaterial({color:0xffd766,toneMapped:false}), lens:new THREE.MeshBasicMaterial({map:ltLensT,toneMapped:false}),
  groove:std(0x2a2a2c,.6,.3), desk:std(0x1d1e21,.55,.3), deskTop:std(0x26272b,.5,.4),
};
function ltPool(rx,rz,color=0xfff0cc,op=.8,add=false){ const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:ltPoolT,color,transparent:true,opacity:op,depthWrite:false,toneMapped:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending})); m.rotation.x=-Q; m.scale.set(rx,rz,1); m.renderOrder=2; return m; }

/* ---------- 01 · an LED fixture: head, yoke, modifiers ---------- */
const ltP=.339;   // height of the tilt pivot above the top of the stand
function ltHead(){ const g=new THREE.Group(), Lz=(pts,m,seg=48)=>rot(lathe(pts,m,seg),Q);   // profiles are [radius, z]; the light leaves towards +z
  g.add(Lz([[.06,.006],[.086,.012],[.094,.02],[.097,.035],[.097,.098],[.092,.106]],LT.body));
  g.add(Lz([[.06,-.158],[.06,.01]],LT.fin,32));
  for(let k=0;k<14;k++) g.add(at(rot(cyl(.09,.09,.0035,LT.fin,40),Q),0,0,-.004-k*.0112));          // cooling fins
  g.add(Lz([[0,-.214],[.058,-.214],[.082,-.206],[.092,-.192],[.094,-.168],[.09,-.158],[.06,-.156]],LT.body));
  g.add(Lz([[.097,.098],[.104,.1],[.104,.113],[.1,.118],[.082,.118],[.077,.108]],M.alu,56));         // bayonet mount
  g.add(Lz([[.077,.108],[.054,.088],[.03,.075],[0,.073]],LT.refl,40));
  g.add(at(rot(cyl(.026,.026,.004,LT.matte,24),Q),0,0,.076)); const cob=new THREE.Mesh(new THREE.CircleGeometry(.02,28),LT.cob); cob.position.z=.0785; g.add(cob);
  g.add(at(rbox(.016,.026,.012,LT.matte,.004),.094,.045,.108));                                       // mount release
  g.add(tube([[0,.09,-.19],[0,.128,-.175],[0,.142,-.09],[0,.13,0],[0,.095,.03]],.0085,M.rubber,24));  // carry handle
  for(const sx of [-1,1]) g.add(at(rot(cyl(.034,.034,.026,LT.body,28),0,0,Q),sx*.103,0,0));
  const fan=new THREE.Mesh(new THREE.CircleGeometry(.056,32),LT.fan); fan.rotation.y=Math.PI; fan.position.z=-.2145; g.add(fan);
  g.add(at(rot(cyl(.011,.011,.03,M.steel,14),Q),0,-.066,-.215)); g.add(at(rot(cyl(.007,.0085,.05,M.rubber,12),Q),0,-.066,-.25));
  g.add(at(rbox(.05,.003,.02,M.alu,.001),0,.0975,.066)); g.add(at(sph(.003,glow(AMBER),8,6),.035,.062,-.21));
  return g; }
function ltYoke(){ const g=new THREE.Group(), w=.122, t=.014, d=.25, sh=new THREE.Shape();
  sh.moveTo(-(w+t),.036); sh.lineTo(-(w+t),-d-t); sh.lineTo(w+t,-d-t); sh.lineTo(w+t,.036); sh.lineTo(w,.036); sh.lineTo(w,-d); sh.lineTo(-w,-d); sh.lineTo(-w,.036); sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:.036,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:2}); geo.translate(0,0,-.018); g.add(mesh(geo,M.satin));
  // tilt lock: a friction disc, an amber knob and its lever on one side; a plain bolt on the other
  g.add(at(rot(cyl(.04,.04,.007,M.steel,32),0,0,Q),w+t+.006,0,0)); g.add(at(rot(cyl(.025,.029,.03,M.amber,20),0,0,Q),w+t+.026,0,0)); g.add(at(rot(rbox(.012,.075,.016,M.black,.005),.6,0,0),w+t+.034,.024,.016));
  g.add(at(rot(cyl(.03,.03,.006,M.steel,24),0,0,Q),-(w+t+.005),0,0)); g.add(at(rot(cyl(.012,.012,.012,M.black,6),0,0,Q),-(w+t+.012),0,0));
  g.add(at(cyl(.021,.021,.075,M.black,20),0,-d-t-.0375,0)); g.add(at(rot(cyl(.005,.005,.04,M.steel,10),0,0,Q),.036,-d-t-.045,0)); g.add(at(rbox(.014,.032,.014,M.black,.005),.06,-d-t-.045,0));
  return g; }
// deep 16-sided softbox with a recessed front diffuser
function ltSoftbox(R=.42,D=.38){ const g=new THREE.Group(), N=16, rr=(t)=>.108+(R-.108)*Math.pow(t,.58), prof=[]; for(let i=0;i<=12;i++){ const t=i/12; prof.push([rr(t),.022+t*(D-.022)]); } prof.push([R+.002,D+.05]);
  const ring=new THREE.Group(); ring.add(rot(lathe([[.082,0],[.122,0],[.124,.004],[.124,.026],[.11,.034],[.1,.034]],M.satin,48),Q)); for(let k=0;k<N;k++){ const a=k/N*Math.PI*2; ring.add(at(rot(cyl(.006,.006,.022,M.steel,8),Q),Math.cos(a)*.113,Math.sin(a)*.113,.034)); }
  const shell=new THREE.Group(); shell.add(mesh(ltFacetG(prof,N),LT.fab)); shell.add(mesh(ltFacetG(prof,N,-.004),LT.silverIn,false));
  for(let k=0;k<N;k++){ const a=k/N*Math.PI*2, c=Math.cos(a), s=Math.sin(a); shell.add(tube(prof.filter((p,i)=>i%2===0||i===prof.length-1).map(p=>[(p[0]+.002)*c,(p[0]+.002)*s,p[1]]),.0042,M.rubber,14)); }
  shell.add(at(mesh(new THREE.TorusGeometry(R+.002,.007,6,N),M.rubber),0,0,D+.05));
  const frontM=new THREE.MeshBasicMaterial({map:ltSoftT,toneMapped:false,side:THREE.DoubleSide}), front=new THREE.Mesh(new THREE.CircleGeometry(R-.004,N),frontM); front.position.z=D+.014;
  g.add(ring,shell,front); return {g,ring,shell,front,frontM,rr,R,D}; }
// fresnel lens with four barn doors. open: 1.1 = doors flared open, 3.0 = closed over the lens
function ltBarn(open=1.1,lensM=LT.lens){ const g=new THREE.Group(), leaves=[], holders=[], hw=.135; g.add(rot(lathe([[.1,0],[.105,.004],[.126,.085],[.129,.1],[.129,.128],[.124,.133],[.116,.133]],LT.body,48),Q));
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.117,48),lensM); lens.position.z=.124; g.add(lens); g.add(at(mesh(new THREE.TorusGeometry(.118,.005,8,48),M.satin),0,0,.131));
  for(let k=0;k<4;k++){ const hd=grp(g); hd.rotation.z=k*Q; hd.add(at(rbox(hw*2+.014,.014,.012,LT.matte,.004),0,hw,.138)); for(const sx of [-1,1]) hd.add(at(rot(cyl(.007,.007,.03,M.steel,10),0,0,Q),sx*.07,hw,.147));
    const big=k%2===0, w0=big?.25:.19, w1=big?.33:.12, len=big?.21:.17, sh=new THREE.Shape(); sh.moveTo(-w0/2,0); sh.lineTo(w0/2,0); sh.lineTo(w1/2,len); sh.lineTo(-w1/2,len); sh.closePath();
    const lh=grp(hd,0,hw,.147+(big?.004:0)), leaf=grp(lh); leaf.add(mesh(new THREE.ExtrudeGeometry(sh,{depth:.002,bevelEnabled:true,bevelSize:.002,bevelThickness:.001,bevelSegments:1}),LT.matte)); leaf.rotation.x=open; leaves.push(leaf); holders.push(lh); }
  return {g,leaves,holders}; }
// o.hang: yoke upside down under a truss clamp; o.down: tilt below level in radians
function ltFixture(o={}){ const {down=.3,mod='soft',R=.42,D=.38,hang=false,open=1.1,lensM}=o, g=new THREE.Group();
  const yk=ltYoke(); yk.position.y=hang?-ltP:ltP; if(hang) yk.rotation.z=Math.PI; g.add(yk);
  const piv=grp(g,0,hang?-ltP:ltP,0); piv.rotation.x=down; piv.add(ltHead()); const out={g,piv};
  if(mod==='soft'){ out.sb=ltSoftbox(R,D); out.sb.g.position.z=.118; piv.add(out.sb.g); }
  if(mod==='barn'){ out.bd=ltBarn(open,lensM); out.bd.g.position.z=.118; piv.add(out.bd.g); }
  return out; }
// three-section light stand; h = height of the top of the stand
function ltStand(h=1.72,spread=.52){ const g=new THREE.Group(), yc=.6, y1=Math.min(.98,h*.57), y2=y1+(h-y1)*.52;
  g.add(at(cyl(.0175,.0175,y1-.1,M.satin,18),0,(y1+.1)/2,0)); g.add(at(cyl(.0145,.0145,y2-y1+.06,M.steel,16),0,(y1+y2)/2,0)); g.add(at(cyl(.0115,.0115,h-y2+.03,M.steel,16),0,(y2+h)/2-.03,0));
  g.add(at(cyl(.008,.008,.036,LT.brass,14),0,h-.004,0));
  for(const [y,r] of [[y1,.027],[y2,.023]]){ g.add(at(cyl(r,r,.05,M.black,20),0,y,0)); g.add(at(rot(cyl(.005,.005,.04,M.steel,8),0,0,Q),r+.012,y,0)); g.add(at(rbox(.016,.034,.016,M.black,.006),r+.036,y,0)); }
  g.add(at(cyl(.031,.031,.055,M.black,20),0,yc,0)); g.add(at(cyl(.029,.029,.042,M.black,20),0,.2,0)); g.add(at(rot(cyl(.005,.005,.04,M.steel,8),Q),0,.2,.04)); g.add(at(rbox(.016,.034,.016,M.black,.006),0,.2,.066));
  g.add(at(cyl(.02,.02,.02,M.rubber,14),0,.105,0));
  for(let k=0;k<3;k++){ const a=k/3*Math.PI*2+Math.PI/6, c=Math.cos(a), s=Math.sin(a), f=.5, lr=lerp(.034,spread,f), ly=lerp(yc,.025,f);
    g.add(rod2(V(c*.034,yc,s*.034),V(c*spread,.025,s*spread),.0115,M.satin)); g.add(rod2(V(c*.03,.2,s*.03),V(c*lr,ly,s*lr),.007,M.steel)); g.add(at(rbox(.04,.03,.04,M.rubber,.012),c*spread,.015,s*spread)); }
  return g; }
function ltCtrlBox(){ const g=new THREE.Group(); g.add(rbox(.2,.115,.07,M.shell2,.012)); g.add(at(rbox(.19,.105,.004,LT.matte,.008),0,0,.0345));
  const d=new THREE.Mesh(new THREE.PlaneGeometry(.075,.045),new THREE.MeshBasicMaterial({map:lcd(['INT 80','CCT 56'],160,96)})); d.position.set(-.045,.018,.0372); g.add(d);
  for(const x of [.03,.07]){ g.add(at(rot(cyl(.014,.015,.016,M.alu,24),Q),x,.018,.045)); g.add(at(rot(cyl(.0165,.0165,.004,M.satin,24),Q),x,.018,.0385)); }
  for(let k=0;k<4;k++) g.add(at(rbox(.016,.009,.004,M.satin,.002),-.072+k*.022,-.03,.0375)); g.add(at(rbox(.02,.012,.006,M.amber,.003),.07,-.03,.038)); g.add(at(sph(.0022,glow(AMBER),8,6),.04,-.03,.0372));
  g.add(tube([[-.06,.057,0],[-.04,.08,0],[.04,.08,0],[.06,.057,0]],.005,M.rubber,16));
  for(const x of [-.05,.05]) g.add(at(cyl(.011,.011,.02,M.steel,14),x,-.066,0));
  g.add(at(rbox(.06,.07,.05,M.black,.01),0,0,-.058)); g.add(at(rot(cyl(.005,.005,.04,M.steel,8),0,0,Q),.045,0,-.07)); g.add(at(rbox(.016,.03,.016,M.black,.006),.07,0,-.07));
  return g; }
function ltSandbag(){ const g=new THREE.Group(); for(const sx of [-1,1]) g.add(at(rot(rbox(.13,.25,.27,LT.canvas,.055),0,0,sx*.1),sx*.09,.128,0));
  g.add(at(rbox(.27,.03,.16,LT.canvas,.014),0,.262,0)); g.add(tube([[-.05,.275,0],[-.03,.31,0],[.03,.31,0],[.05,.275,0]],.006,M.rubber,12)); return g; }
// one light on a stand with a softbox, its control box, cable and a sandbag: the smallest thing to rent
function ltKit(o={}){ const {h=1.72,down=.32,R=.42,D=.38,poolR=[1.5,1.05],poolZ=.5,coil=true}=o, g=new THREE.Group(), st=grp(g);
  st.add(ltStand(h)); const fx=ltFixture({down,R,D}); fx.g.position.y=h; st.add(fx.g);
  const cb=ltCtrlBox(); cb.position.set(0,.98,.077); st.add(cb);
  const py=h+ltP, cy=py-.066*Math.cos(down)+.275*Math.sin(down), cz=-.066*Math.sin(down)-.275*Math.cos(down);
  st.add(tube([[0,cy,cz],[0,cy-.1,cz-.07],[.01,cy-.3,cz+.02],[.02,h-.28,-.04],[.02,1.3,-.036],[.0,.86,-.04],[-.05,.8,.03],[-.05,.9,.077]],.0055,M.rubber,64));
  st.add(tube([[.05,.9,.077],[.05,.8,.1],[.1,.35,.17],[.2,.02,.12],[.42,.012,-.2],[.55,.012,-.5],[.6,.012,-.66]],.0055,M.rubber,48));
  if(coil){ for(let k=0;k<3;k++) st.add(at(rot(mesh(new THREE.TorusGeometry(.13-k*.004,.006,8,40),M.rubber),Q,0,0),.6+k*.006,.008+k*.011,-.79)); st.add(at(rbox(.03,.022,.05,M.black,.006),.48,.014,-.82)); }
  const bag=ltSandbag(); bag.position.set(0,0,-.33); st.add(bag);
  ltBake(st); const pool=ltPool(poolR[0],poolR[1]); pool.position.set(0,.004,poolZ); g.add(pool);
  return {g,frontM:fx.sb.frontM,pool}; }

/* ---------- 02 · stage decks ---------- */
// one 2 m x 1 m deck: aluminium frame, non-slip top, a leg socket and clamp knob at each corner. Origin: centre of the top surface
function ltDeck(L=2,Wd=1){ const g=new THREE.Group(), fh=.09, ft=.032;
  for(const sz of [-1,1]){ g.add(at(rbox(L,fh,ft,M.alu,.006),0,-fh/2,sz*(Wd/2-ft/2))); g.add(at(box(L-.16,.014,.002,LT.groove),0,-.05,sz*(Wd/2+.0006))); }
  for(const sx of [-1,1]){ g.add(at(rbox(ft,fh,Wd-2*ft+.004,M.alu,.006),sx*(L/2-ft/2),-fh/2,0)); g.add(at(box(.002,.014,Wd-.16,LT.groove),sx*(L/2+.0006),-.05,0)); g.add(at(box(ft,fh*.7,Wd-2*ft,M.alu),sx*L/6,-fh*.5,0)); }
  g.add(at(rbox(L-.016,.012,Wd-.016,LT.deck,.003),0,-.0045,0));
  for(const sx of [-1,1]) for(const sz of [-1,1]){ g.add(at(rbox(.07,.05,.07,M.alu,.008),sx*(L/2-.05),-fh-.02,sz*(Wd/2-.05))); g.add(at(rot(cyl(.017,.021,.024,M.black,12),Q),sx*(L/2-.05),-fh-.02,sz*(Wd/2-.003))); }
  return g; }
function ltLeg(len){ const g=new THREE.Group(); g.add(at(rbox(.048,len-.05,.048,M.alu,.007),0,-(len-.05)/2,0)); g.add(at(cyl(.009,.009,.05,M.alu,10),0,-(len-.025),0)); g.add(at(cyl(.036,.04,.012,M.alu,20),0,-(len-.006),0)); return ltBake(g); }
// a run of decks on legs, baked. nx x nz decks of 2 x 1 m, top at height H, centred on the origin
function ltPlatform(nx,nz,H){ const g=new THREE.Group(); for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){ const x=(i-(nx-1)/2)*2, z=(j-(nz-1)/2)*1; g.add(at(ltDeck(),x,H,z)); for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(ltLeg(H-.03),x+sx*.95,H-.03,z+sz*.45)); } return g; }
function ltSteps(H,n=1,w=.9){ const g=new THREE.Group(), rise=H/(n+1); for(let i=1;i<=n;i++){ const y=i*rise, z=(n-i)*.28+.15; g.add(at(rbox(w,.03,.27,LT.deck,.004),0,y-.015,z)); g.add(at(rbox(w+.004,.034,.02,M.alu,.004),0,y-.016,z+.13));
    for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(rbox(.03,y-.03,.03,M.alu,.005),sx*(w/2-.03),(y-.03)/2,z+sz*.11)); for(const sx of [-1,1]) g.add(at(rbox(.02,.03,.24,M.alu,.004),sx*(w/2-.03),y-.045,z)); } return g; }
function ltSkirt(w,h){ const t=ltPleatT.clone(); t.wrapS=THREE.RepeatWrapping; t.repeat.set(w/.64,1); t.needsUpdate=true; const ge=new THREE.PlaneGeometry(w,h); ge.translate(0,-h/2,0); return mesh(ge,std(0xffffff,.95,0,{map:t,side:THREE.DoubleSide,envMapIntensity:.2})); }

/* ---------- 03 · truss ---------- */
// box truss along x: four 50 mm chords, 20 mm diagonals zigzagging on every face, end frames and conical couplers
const ltTrussCache={};
function ltTrussG(L,c=.12){ const key=L.toFixed(3); if(ltTrussCache[key]) return ltTrussCache[key]; const gs=[], h=L/2;
  for(const sy of [-1,1]) for(const sz of [-1,1]){ gs.push(ltRodG(V(-h,sy*c,sz*c),V(h,sy*c,sz*c),.025,12)); for(const sx of [-1,1]) gs.push(ltRodG(V(sx*(h-.04),sy*c,sz*c),V(sx*h,sy*c,sz*c),.03,12)); }
  const n=Math.max(2,Math.round((L-.12)/.44)), st=(L-.12)/n;
  for(const s of [-1,1]) for(let i=0;i<n;i++){ const x0=-h+.06+i*st, x1=x0+st, a=i%2?c:-c; gs.push(ltRodG(V(x0,s*c,a),V(x1,s*c,-a),.0095,6)); gs.push(ltRodG(V(x0,-a,s*c),V(x1,a,s*c),.0095,6)); }
  for(const sx of [-1,1]) for(const s of [-1,1]){ const x=sx*(h-.06); gs.push(ltRodG(V(x,s*c,-c),V(x,s*c,c),.0095,6)); gs.push(ltRodG(V(x,-c,s*c),V(x,c,s*c),.0095,6)); }
  return ltTrussCache[key]=ltMergeG(gs); }
const ltTruss=(L)=>mesh(ltTrussG(L),M.alu);
let ltCornerGeo=null;
function ltCorner(){ if(!ltCornerGeo){ const gs=[], c=.12, e=.145; for(const a of [-1,1]) for(const b of [-1,1]){ gs.push(ltRodG(V(-e,a*c,b*c),V(e,a*c,b*c),.025,12)); gs.push(ltRodG(V(a*c,-e,b*c),V(a*c,e,b*c),.025,12)); gs.push(ltRodG(V(a*c,b*c,-e),V(a*c,b*c,e),.025,12)); }
    for(const s of [-1,1]){ gs.push(ltRodG(V(s*c,-c,-c),V(s*c,c,c),.0095,6)); gs.push(ltRodG(V(-c,s*c,-c),V(c,s*c,c),.0095,6)); gs.push(ltRodG(V(-c,-c,s*c),V(c,c,s*c),.0095,6)); } ltCornerGeo=ltMergeG(gs); } return mesh(ltCornerGeo,M.alu); }
function ltBasePlate(){ const g=new THREE.Group(); g.add(at(rbox(.56,.012,.56,M.steel,.004),0,.006,0)); for(const sx of [-1,1]) for(const sz of [-1,1]){ g.add(at(cyl(.027,.03,.05,M.steel,14),sx*.12,.036,sz*.12)); g.add(at(cyl(.012,.012,.003,M.black,10),sx*.235,.0125,sz*.235)); } return g; }
// a fixture with barn doors hung from a truss chord: clamp, spigot, upside-down yoke and a safety cable. Origin: centre of the chord
function ltHung(o={}){ const {down=1,yaw=0,lensM,open=1.1}=o, g=new THREE.Group();
  g.add(rot(mesh(new THREE.TorusGeometry(.033,.008,8,20),LT.matte),0,Q,0)); g.add(at(rbox(.045,.04,.062,LT.matte,.008),0,-.05,0)); g.add(at(rot(cyl(.006,.006,.03,M.steel,8),Q),0,-.03,.04)); g.add(at(rot(rbox(.035,.01,.012,M.steel,.003),0,0,.4),0,-.03,.058));
  g.add(at(cyl(.008,.008,.05,M.steel,10),0,-.085,0)); g.add(rot(at(mesh(new THREE.TorusGeometry(.085,.002,6,28),M.steel,false),.05,-.06,0),0,Q,0));
  const sp=grp(g,0,-.105,0); sp.rotation.y=yaw; sp.add(ltFixture({down,mod:'barn',hang:true,lensM,open}).g); return g; }
// where a hung fixture's light lands on a surface at height H. p = position of the chord it hangs from
function ltHit(p,yaw,down,H){ const py=p.y-.105-ltP, t=(py-H)/Math.sin(down), r=t*Math.cos(down); return V(p.x+Math.sin(yaw)*r,H,p.z+Math.cos(yaw)*r); }

/* the range, medium: two decks under a goal-post truss with two lights */
function ltMediumRig(){ const g=new THREE.Group(), st=grp(g), H=.4, tw=3.4, th=2.75, tz=-1.3;
  st.add(ltPlatform(1,2,H)); const stp=ltSteps(H,1); stp.position.set(.3,0,1.0); st.add(stp);
  for(const sx of [-1,1]){ st.add(at(ltBasePlate(),sx*tw/2,0,tz)); const L=th-.145-.03, up=ltTruss(L); up.rotation.z=Q; up.position.set(sx*tw/2,.03+L/2,tz); st.add(up); st.add(at(ltCorner(),sx*tw/2,th,tz)); }
  st.add(at(ltTruss(tw-.29),0,th,tz));
  const spots=[]; for(const x of [-.75,.75]){ const p=V(x,th-.12,tz+.12), yaw=-x*.22; st.add(at(ltHung({down:1.0,yaw}),p.x,p.y,p.z)); spots.push(ltHit(p,yaw,1.0,H)); }
  ltBake(st); for(const s of spots){ const pl=ltPool(.44,.52,0xffdfae,.5,true); pl.position.set(s.x,H+.004,s.z); g.add(pl); }
  return g; }
/* the range, large: a decked stage with steps and a skirt under a four-post truss box full of lights */
function ltLargeRig(){ const g=new THREE.Group(), st=grp(g), H=.6, tx=2.35, tz=1.85, th=3.6;
  st.add(ltPlatform(2,3,H)); const stp=ltSteps(H,2); stp.rotation.y=-Q; stp.position.set(-2.0,0,.7); st.add(stp);
  st.add(at(ltSkirt(4,H-.05),0,H-.05,1.512)); const sk=ltSkirt(3,H-.05); sk.rotation.y=Q; sk.position.set(2.012,H-.05,0); st.add(sk); const sk2=ltSkirt(1.7,H-.05); sk2.rotation.y=-Q; sk2.position.set(-2.012,H-.05,-.65); st.add(sk2);
  for(const sx of [-1,1]) for(const sz of [-1,1]){ st.add(at(ltBasePlate(),sx*tx,0,sz*tz)); const L=th-.145-.03, up=ltTruss(L); up.rotation.z=Q; up.position.set(sx*tx,.03+L/2,sz*tz); st.add(up); st.add(at(ltCorner(),sx*tx,th,sz*tz)); }
  for(const sz of [-1,1]) st.add(at(ltTruss(2*tx-.29),0,th,sz*tz)); for(const sx of [-1,1]){ const s=ltTruss(2*tz-.29); s.rotation.y=Q; s.position.set(sx*tx,th,0); st.add(s); }
  const spots=[]; for(const x of [-1.5,-.5,.5,1.5]){ let p=V(x,th-.12,tz-.12); st.add(at(ltHung({down:1.05,yaw:Math.PI-x*.1}),p.x,p.y,p.z)); spots.push(ltHit(p,Math.PI-x*.1,1.05,H));
    if(Math.abs(x)>1){ p=V(x,th-.12,-tz+.12); st.add(at(ltHung({down:1.15,yaw:-x*.1}),p.x,p.y,p.z)); } }
  ltBake(st); for(const s of spots){ const pl=ltPool(.5,.6,0xffdfae,.5,true); pl.position.set(s.x,H+.004,s.z); g.add(pl); }
  return g; }

/* ---------- stop: event lighting. A softbox comes apart along its axis, and a pair of barn doors opens ---------- */
function ltEventRig(I,stop=null){ const h=1.3, down=.04, yaw=-1.32, A=grp(I,1.55,0,.1), st=grp(A); st.rotation.y=yaw;
  st.add(ltStand(h,.5)); const fx=ltFixture({down,mod:'none'}); fx.g.position.y=h; st.add(fx.g); const cb=ltCtrlBox(); cb.position.set(0,.86,.077); cb.rotation.y=0; st.add(cb);
  const py=h+ltP; st.add(tube([[0,py-.066,-.275],[0,py-.2,-.33],[.02,h-.2,-.05],[.02,1.1,-.036],[0,.74,-.04],[-.05,.68,.03],[-.05,.78,.077]],.0055,M.rubber,56));
  st.add(tube([[.05,.78,.077],[.05,.68,.1],[.1,.3,.16],[.2,.02,.1],[.5,.012,-.3],[.9,.012,-.9],[1.5,.012,-1.3]],.0055,M.rubber,48)); const bag=ltSandbag(); bag.position.set(0,0,-.32); st.add(bag); ltBake(st);
  // the softbox, in the order it goes together: speed ring, shell, inner baffle, front diffuser, grid
  const ax=grp(A,0,py,0); ax.rotation.set(down,yaw,0,'YXZ'); const sb=ltSoftbox(.46,.4), parts=[];
  const gridT=ctex(512,512,(g,w,h)=>{ g.clearRect(0,0,w,h); g.save(); g.beginPath(); for(let k=0;k<16;k++){ const a=k/16*Math.PI*2; g[k?'lineTo':'moveTo'](w/2+Math.cos(a)*w*.495,h/2+Math.sin(a)*h*.495); } g.closePath(); g.clip(); g.fillStyle='rgba(16,16,18,.16)'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(14,14,16,.95)'; g.lineWidth=3.2; for(let i=0;i<=w;i+=32){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,h); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(w,i); g.stroke(); } g.restore(); g.strokeStyle='rgba(14,14,16,1)'; g.lineWidth=7; g.beginPath(); for(let k=0;k<=16;k++){ const a=k/16*Math.PI*2; g[k?'lineTo':'moveTo'](w/2+Math.cos(a)*w*.49,h/2+Math.sin(a)*h*.49); } g.stroke(); });
  const baf=new THREE.Mesh(new THREE.CircleGeometry(sb.rr(.5)-.012,16),std(0xfffaf0,.9,0,{transparent:true,opacity:.86,side:THREE.DoubleSide,depthWrite:false,emissive:0xfff1d6,emissiveIntensity:.35}));
  const grid=new THREE.Mesh(new THREE.PlaneGeometry(.92,.92),new THREE.MeshBasicMaterial({map:gridT,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
  for(const [o,z0,z1] of [[ltBake(sb.ring),.118,.2],[ltBake(sb.shell),.118,.4],[baf,.118+.2,.92],[sb.front,.118+sb.D+.014,1.3],[grid,.118+sb.D+.045,1.58]]){ ax.add(o); parts.push([o,z0,z1]); }
  const pool=ltPool(1.5,1.2); pool.position.set(-1.1,.004,.75); I.add(pool);
  // a second light with a fresnel and barn doors
  const B=grp(I,3.0,0,-1.5), sb2=grp(B); sb2.rotation.y=-.75; sb2.add(ltStand(1.05,.46)); const lensM=new THREE.MeshBasicMaterial({map:ltLensT,toneMapped:false}), fb=ltFixture({down:.12,mod:'barn',lensM,open:3.0}); fb.g.position.y=1.05; sb2.add(fb.g);
  const leaves=fb.bd.leaves; fb.bd.holders.forEach(l=>l.userData.keep=true); const bg2=ltSandbag(); bg2.position.set(0,0,-.3); sb2.add(bg2); ltBake(sb2);
  updaters.push((t,x)=>{ const u=stop===null?1:sstep(stop-.5,stop,x); parts.forEach(([o,z0,z1],i)=>{ o.position.z=lerp(z0,z1,sstep(i*.06,.7+i*.06,u)); }); grid.visible=u>.02;
    leaves.forEach((l,k)=>{ l.rotation.x=lerp(k%2?3.02:2.9,1.08,sstep(.25+(k%2?0:.15),.85+(k%2?0:.15),u)); }); }); }

/* ---------- stop: stage decks. Four decks leave the stack, the legs go in, the decks lock together ---------- */
function ltDeckRig(I,stop=null){ const H=.5, C=V(1.0,0,-.1), ST=V(-2.75,0,.45), decks=[], legs=[], LL=H-.03;
  const dl=grp(I,ST.x,0,ST.z); dl.add(at(rbox(2.04,.03,1.04,M.wood,.008),0,.155,0)); for(const sz of [-1,1]) dl.add(at(rbox(2.04,.04,.05,M.alu,.008),0,.125,sz*.44));
  for(const sx of [-1,1]) for(const sz of [-1,1]){ const c=grp(dl,sx*.82,0,sz*.38); c.rotation.y=.4*sx; c.add(at(rot(cyl(.05,.05,.036,M.rubber,22),0,0,Q),0,.05,0)); c.add(at(rot(cyl(.02,.02,.04,M.steel,14),0,0,Q),0,.05,0)); for(const s2 of [-1,1]) c.add(at(rbox(.005,.08,.06,M.steel,.002),s2*.024,.083,.006)); c.add(at(rbox(.1,.01,.1,M.steel,.003),0,.118,0)); }
  ltBake(dl);
  for(let i=0;i<4;i++){ const sx=i<2?-1:1, sz=i%2?1:-1, g=ltBake(ltDeck()); I.add(g); decks.push({g,sx,sz,F:V(C.x+sx*1,H,C.z+sz*.5),S:V(ST.x,.17+.0915+(3-i)*.094,ST.z)});
    let n=0; for(const lx of [-1,1]) for(const lz of [-1,1]){ const l=ltLeg(LL), k=i*4+n++; I.add(l); legs.push({g:l,i,ox:lx*.95,oz:lz*.45,px:-3.3+(k>>3)*.02,py:.03+(k>>3)*.052,pz:-1.0-(k&7)*.062}); } }
  const sk=ltSkirt(4,H-.05); sk.position.set(C.x,H-.05,C.z+1.014); I.add(sk); const sk2=ltSkirt(2,H-.05); sk2.rotation.y=-Q; sk2.position.set(C.x-2.014,H-.05,C.z); I.add(sk2);
  const stp=ltBake(ltSteps(H,1)); I.add(stp);
  updaters.push((t,x)=>{ const u=stop===null?1:clamp((x-(stop-.5))/.5), drop=sstep(.78,.9,u), close=sstep(.88,.97,u), yh=H+.32*(1-drop);
    decks.forEach((d,i)=>{ const a=sstep(0,1,clamp((u-i*.07)/.3)), hx=d.F.x+d.sx*.17*(1-close), hz=d.F.z+d.sz*.13*(1-close);
      d.g.position.set(lerp(d.S.x,hx,a),lerp(d.S.y,yh,a)+Math.sin(a*Math.PI)*.55,lerp(d.S.z,hz,a)); d.g.rotation.z=-Math.sin(a*Math.PI)*.1; });
    legs.forEach((l,k)=>{ const e=clamp((u-.28-l.i*.07-(k&3)*.012)/.26), e1=sstep(0,1,clamp(e/.72)), e2=sstep(0,1,clamp((e-.72)/.28)), d=decks[l.i].g.position;
      l.g.position.set(lerp(l.px,d.x+l.ox,e1),lerp(l.py,d.y-.03-.26*(1-e2),e1)+Math.sin(e1*Math.PI)*.3,lerp(l.pz,d.z+l.oz,e1)); l.g.rotation.z=Q*(1-sstep(.1,.8,e1)); });
    const s=sstep(.9,1,u); sk.scale.y=sk2.scale.y=Math.max(.001,s); sk.visible=sk2.visible=s>.002; stp.position.set(C.x+1.2,0,C.z+1.03+(1-sstep(.86,1,u))*1.6); stp.visible=u>.84; }); }

/* ---------- stop: truss & rigging. A span with four lights climbs two ground-support towers on chain hoists ---------- */
function ltLiftRig(I,stop=null){ const TX=2.3, TH=3.5, y0=1.05, y1=2.85, st=grp(I), mv=grp(I), CZ=.29, pitch=.027, chains=[];
  for(const sx of [-1,1]){ const b=grp(st,sx*TX,0,0);
    b.add(at(rbox(.5,.06,.5,M.steel,.008),0,.07,0)); const tw=ltTruss(TH-.1); tw.rotation.z=Q; tw.position.y=.1+(TH-.1)/2; b.add(tw);
    for(const [dx,dz,len,brace] of [[0,1,1.15,1],[0,-1,1.15,1],[sx,0,.7,0]]){ const o=grp(b); o.rotation.y=Math.atan2(dx,dz);      // outriggers with screw jacks
      o.add(at(rbox(.05,.05,len,M.steel,.006),0,.07,.25+len/2)); o.add(at(cyl(.011,.011,.2,M.steel,10),0,.1,.25+len-.05)); o.add(at(cyl(.05,.055,.014,M.black,20),0,.007,.25+len-.05)); o.add(at(rot(cyl(.005,.005,.09,M.steel,8),0,0,Q),0,.19,.25+len-.05));
      if(brace) o.add(rod2(V(0,.09,.25+len-.14),V(0,1.25,.14),.014,M.steel)); }
    b.add(at(rbox(.36,.07,.36,M.steel,.01),0,TH+.035,0)); b.add(at(rbox(.07,.07,.4,M.steel,.01),0,TH+.1,.13)); for(const s2 of [-1,1]) b.add(at(rbox(.008,.16,.16,M.steel,.004),s2*.03,TH+.1,CZ)); b.add(at(rot(cyl(.062,.062,.03,M.satin,24),0,0,Q),0,TH+.1,CZ));
    // sleeve block, hoist and chain bag ride up with the span
    const sl=grp(mv,sx*TX,0,0); for(const a of [-1,1]) for(const c of [-1,1]) sl.add(at(rbox(.045,.5,.045,M.satin,.008),a*.205,0,c*.205));
    for(const sy of [-1,1]){ for(const a of [-1,1]){ sl.add(at(rbox(.455,.045,.045,M.satin,.008),0,sy*.228,a*.205)); sl.add(at(rbox(.045,.045,.455,M.satin,.008),a*.205,sy*.228,0)); sl.add(at(rot(cyl(.03,.03,.05,M.rubber,16),0,0,Q),0,sy*.228,a*.168)); sl.add(at(rot(cyl(.03,.03,.05,M.rubber,16),Q),a*.168,sy*.228,0)); } }
    sl.add(at(rbox(.08,.34,.34,M.satin,.008),-sx*.26,0,0));
    sl.add(at(rbox(.1,.07,.02,M.steel,.006),0,.27,CZ-.04)); sl.add(at(mesh(new THREE.TorusGeometry(.03,.008,8,16),M.steel),0,.33,CZ)); sl.add(at(cyl(.008,.008,.07,M.steel,8),0,.39,CZ));
    const hz=grp(sl,0,.57,CZ); hz.add(rbox(.2,.3,.17,M.shell2,.03)); hz.add(at(rbox(.215,.05,.185,M.amber,.012),0,.07,0)); hz.add(at(rbox(.21,.012,.18,M.black,.004),0,-.06,0)); hz.add(at(rbox(.12,.05,.004,M.alu,.002),0,-.01,.087)); hz.add(at(cyl(.02,.02,.04,M.steel,12),0,.165,0));
    hz.add(at(rot(rbox(.15,.22,.13,LT.canvas,.04),0,0,sx*.08),sx*.19,-.14,0)); hz.add(tube([[sx*.06,.14,.05],[sx*.14,.1,.04],[sx*.19,-.03,.02]],.004,M.steel,12));
    hz.add(tube([[-sx*.06,-.14,0],[-sx*.14,-.5,0],[-sx*.2,-.57,-.2],[-sx*.4,-.5,-.29],[-sx*.9,-.47,-.29]],.007,M.rubber,24));
    const link=new THREE.TorusGeometry(.011,.0034,6,12); link.scale(1,1.45,1); const ch=new THREE.InstancedMesh(link,M.steel,120), m4=new THREE.Matrix4(), e=new THREE.Euler();
    for(let k=0;k<120;k++){ e.set(0,k%2?Q:0,0); m4.makeRotationFromEuler(e); m4.setPosition(sx*TX,TH+.05-k*pitch,CZ); ch.setMatrixAt(k,m4); } ch.castShadow=true; I.add(ch); chains.push(ch); }
  const span=ltTruss(2*TX-.6); mv.add(span); for(const sx of [-1,1]) for(const a of [-1,1]) for(const c of [-1,1]) mv.add(at(rot(cyl(.012,.012,.07,M.steel,8),Q),sx*(TX-.3),a*.12,c*.12));
  const lensM=new THREE.MeshBasicMaterial({map:ltLensT,toneMapped:false}), pools=[], xs=[-1.5,-.5,.5,1.5], dn=1.08;
  for(const x of xs){ mv.add(at(ltHung({down:dn,yaw:-x*.08,lensM}),x,-.12,.12)); const p=ltPool(.6,.8,0xfff0cc,.75); I.add(p); pools.push(p); }
  ltBake(st); ltBake(mv); const cOff=new THREE.Color(0x4a4640), cOn=new THREE.Color(0xffffff);
  updaters.push((t,x)=>{ const u=stop===null?1:sstep(stop-.5,stop-.02,x), y=lerp(y0,y1,u), on=sstep(.72,1,u); mv.position.y=y;
    for(const ch of chains) ch.count=clamp(Math.ceil((TH+.05-(y+.74))/pitch),1,120);
    lensM.color.lerpColors(cOff,cOn,on); pools.forEach((p,i)=>{ const h=ltHit(V(xs[i],y-.12,.12),-xs[i]*.08,dn,0); p.position.set(h.x,.004,h.z); p.material.opacity=.8*on; p.scale.set(.42+y*.14,.5+y*.2,1); }); }); }

/* ---------- 04 · lighting desk on a stand, a stool, and two lights that answer to it ---------- */
function ltStool(){ const g=new THREE.Group(); g.add(lathe([[0,.62],[.15,.62],[.172,.635],[.176,.67],[.165,.695],[.12,.705],[0,.705]],std(0x151517,.6,.05),40)); g.add(at(cyl(.1,.1,.012,M.black,24),0,.612,0)); g.add(at(cyl(.02,.02,.3,M.steel,16),0,.47,0)); g.add(at(cyl(.026,.026,.26,M.satin,16),0,.3,0)); g.add(at(cyl(.034,.034,.05,M.black,16),0,.42,0));
  for(let k=0;k<3;k++){ const a=k/3*Math.PI*2+.3, c=Math.cos(a), s=Math.sin(a); g.add(rod2(V(c*.03,.4,s*.03),V(c*.3,.02,s*.3),.012,M.satin)); g.add(at(rbox(.04,.028,.04,M.rubber,.01),c*.3,.014,s*.3)); g.add(rod2(V(c*.03,.2,s*.03),V(c*.17,.21,s*.17),.007,M.steel)); }
  g.add(at(rot(mesh(new THREE.TorusGeometry(.2,.009,8,40),M.steel),Q),0,.165,0)); return ltBake(g); }
function ltDesk(){ const W=1.0, con=new THREE.Group(), body=new THREE.Group(); con.add(body);
  const prof=[[.29,0],[.29,.042],[-.07,.098],[-.215,.305],[-.275,.305],[-.275,0]], sh=new THREE.Shape(); prof.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1])); sh.closePath();
  const ext=(w,m,bev=.005)=>{ const ge=new THREE.ExtrudeGeometry(sh,{depth:w,bevelEnabled:true,bevelSize:bev,bevelThickness:bev,bevelOffset:-bev,bevelSegments:2}); ge.translate(0,0,-w/2); ge.rotateY(-Q); return mesh(ge,m); };
  body.add(ext(W,LT.desk)); for(const sx of [-1,1]){ const ck=ext(.022,M.alu,.004); ck.position.x=sx*(W/2+.016); ck.scale.set(1,1.035,1.03); body.add(ck); }
  body.add(at(rbox(W-.02,.02,.045,std(0x101012,.9),.009),0,.045,.275));                                  // padded front rail
  for(const sx of [-1,1]) for(const z of [-.2,.2]) body.add(at(cyl(.02,.022,.012,M.rubber,14),sx*.4,-.006,z));
  // control surface: local x across, z = -distance up the slope
  const L=.364, sf=grp(con,0,.0425,.29); sf.rotation.x=Math.atan2(.056,.36); const sfs=grp(sf);
  sfs.add(at(box(W-.04,.002,L-.05,LT.deskTop),0,.001,-L/2-.012));
  const NP=10, xs=[]; for(let i=0;i<NP;i++) xs.push(-.445+i*.052); const GX=.105;
  for(const x of [...xs,GX]){ sfs.add(at(box(.004,.002,.116,M.rubber),x,.0026,-.118)); }
  const m4=new THREE.Matrix4(), inst=(geo,mat,pts,y)=>{ const im=new THREE.InstancedMesh(geo,mat,pts.length); pts.forEach((p,i)=>{ m4.makeTranslation(p[0],y,p[1]); im.setMatrixAt(i,m4); }); im.castShadow=true; sf.add(im); return im; };
  const keyG=new RoundedBoxGeometry(.022,.008,.022,2,.002), keyM=std(0x34353a,.5,.2), flash=[], sel=[], enc=[], pad=[], cmd=[];
  for(const x of xs){ flash.push([x,-.034]); sel.push([x,-.2]); sel.push([x,-.226]); enc.push([x,-.268]); }
  inst(new RoundedBoxGeometry(.03,.008,.02,2,.002),keyM,flash,.005); inst(new RoundedBoxGeometry(.022,.007,.016,2,.002),keyM,sel,.0045); inst(new THREE.CylinderGeometry(.0095,.0105,.016,18),std(0x2f3034,.4,.5),enc,.009);
  for(let r=0;r<5;r++) for(let c=0;c<4;c++) pad.push([.275+c*.029,-.034-r*.029]); for(let r=0;r<4;r++) for(let c=0;c<2;c++) cmd.push([.168+c*.029,-.092-r*.029]);
  inst(keyG,keyM,pad,.005); inst(keyG,std(0x4a4b50,.5,.2),cmd,.005);
  sfs.add(at(rbox(.062,.01,.04,M.amber,.004),.182,.006,-.04));                                           // GO
  for(let k=0;k<4;k++){ sfs.add(at(cyl(.019,.021,.02,M.alu,28),.15+k*.095,.011,-.262)); sfs.add(at(cyl(.014,.014,.003,M.black,24),.15+k*.095,.0222,-.262)); }
  sfs.add(at(rot(cyl(.042,.042,.024,M.satin,36),0,0,Q),.44,-.012,-.1)); sfs.add(at(rbox(.036,.004,.09,M.black,.002),.44,.002,-.1));   // level wheel, half sunk
  const caps=new THREE.InstancedMesh(new RoundedBoxGeometry(.016,.014,.03,2,.004),std(0xe9e6df,.4,.1),NP); caps.castShadow=true; sf.add(caps);
  const gm=at(rbox(.02,.016,.034,M.amber,.004),GX,.01,-.066); sf.add(gm);
  const lit=new THREE.InstancedMesh(new THREE.BoxGeometry(.014,.002,.004),glow(AMBER),NP); sf.add(lit);
  // printed legends
  const LW=W-.04, lg=ctex(1024,Math.round(1024*L/LW),(g,cw,ch)=>{ const X=(x)=>(x/LW+.5)*cw, Z=(z)=>(1+z/L)*ch; g.strokeStyle=g.fillStyle='rgba(236,233,227,.72)'; g.textAlign='center'; g.font='500 9px "Geist Mono", monospace';
    [...xs,GX].forEach((x,i)=>{ for(let k=0;k<=10;k++){ const z=-.068-k*.01; g.lineWidth=k%5===0?1.5:.8; g.beginPath(); g.moveTo(X(x)-12,Z(z)); g.lineTo(X(x)-(k%5===0?4:7),Z(z)); g.stroke(); } g.fillText(i<NP?String(i+1).padStart(2,'0'):'GM',X(x),Z(-.05)+3); if(i<NP){ g.lineWidth=1; g.beginPath(); g.arc(X(x),Z(-.268),13,Math.PI*.75,Math.PI*2.25); g.stroke(); } });
    g.font='600 10px "Geist Mono", monospace'; g.textAlign='left'; g.fillText('PLAYBACKS',X(xs[0])-10,Z(-.012)+3); g.fillText('PROGRAMMER',X(.262),Z(-.012)+3); g.fillText('ENCODERS',X(.13),Z(-.302)+3);
    g.strokeStyle='rgba(236,233,227,.4)'; g.lineWidth=1; g.beginPath(); g.moveTo(X(.068),Z(-.02)); g.lineTo(X(.068),Z(-.33)); g.stroke(); });
  const leg=new THREE.Mesh(new THREE.PlaneGeometry(LW,L),new THREE.MeshBasicMaterial({map:lg,transparent:true,depthWrite:false,toneMapped:false,opacity:.85})); leg.rotation.x=-Q; leg.position.set(0,.0023,-L/2); sf.add(leg);
  const kl=ctex(256,320,(g,w,h)=>{ g.fillStyle='rgba(240,238,232,.92)'; g.textAlign='center'; g.textBaseline='middle'; g.font='600 24px "Geist Mono", monospace'; const t=['7','8','9','THRU','4','5','6','+','1','2','3','−','0','.','@','FULL','CLR','','ENTER','']; t.forEach((s,i)=>{ g.font=(s.length>1?'600 15px':'600 24px')+' "Geist Mono", monospace'; g.fillText(s,(i%4+.5)*w/4,(Math.floor(i/4)+.5)*h/5+1); }); });
  const kp=new THREE.Mesh(new THREE.PlaneGeometry(.116,.145),new THREE.MeshBasicMaterial({map:kl,transparent:true,depthWrite:false,toneMapped:false})); kp.rotation.x=-Q; kp.position.set(.275+.0435,.0093,-.034-.058); sf.add(kp);
  const cl=ctex(128,256,(g,w,h)=>{ g.fillStyle='rgba(240,238,232,.92)'; g.textAlign='center'; g.textBaseline='middle'; g.font='600 15px "Geist Mono", monospace'; ['REC','UPD','COPY','MOVE','DEL','EDIT','PREV','NEXT'].forEach((s,i)=>g.fillText(s,(i%2+.5)*w/2,(Math.floor(i/2)+.5)*h/4+1)); });
  const cp2=new THREE.Mesh(new THREE.PlaneGeometry(.058,.116),new THREE.MeshBasicMaterial({map:cl,transparent:true,depthWrite:false,toneMapped:false})); cp2.rotation.x=-Q; cp2.position.set(.168+.0145,.0093,-.092-.0435); sf.add(cp2);
  const got=ctex(128,64,(g,w,h)=>{ g.fillStyle='#1a1208'; g.textAlign='center'; g.textBaseline='middle'; g.font='700 34px "Geist Mono", monospace'; g.fillText('GO',w/2,h/2+2); }); const gop=new THREE.Mesh(new THREE.PlaneGeometry(.05,.025),new THREE.MeshBasicMaterial({map:got,transparent:true,depthWrite:false})); gop.rotation.x=-Q; gop.position.set(.182,.0113,-.04); sf.add(gop);
  // scribble strip above the playbacks
  const names=['KEY','FILL','BACK','WASH','DECK','SPOT','HOUSE','LOGO','BAR','AUX'], sct=ctex(640,40,(g,w,h)=>{ g.fillStyle='#0b0d10'; g.fillRect(0,0,w,h); g.textAlign='center'; g.textBaseline='middle'; g.font='600 17px "Geist Mono", monospace'; names.forEach((s,i)=>{ g.fillStyle=i%3===0?'#E8892D':'#dfe6ea'; g.fillText(s,(i+.5)*w/10,h/2+1); g.fillStyle='#22262b'; g.fillRect((i+1)*w/10-1,4,2,h-8); }); });
  sfs.add(at(box(.535,.003,.034,M.black),xs[0]+.234,.002,-.312)); const scp=new THREE.Mesh(new THREE.PlaneGeometry(.52,.026),new THREE.MeshBasicMaterial({map:sct,toneMapped:false})); scp.rotation.x=-Q; scp.position.set(xs[0]+.234,.0038,-.312); sf.add(scp);
  const ect=ctex(512,40,(g,w,h)=>{ g.fillStyle='#0b0d10'; g.fillRect(0,0,w,h); g.textAlign='center'; g.textBaseline='middle'; g.font='600 17px "Geist Mono", monospace'; ['DIM','PAN','TILT','ZOOM'].forEach((s,i)=>{ g.fillStyle=i?'#dfe6ea':'#E8892D'; g.fillText(s,(i+.5)*w/4,h/2+1); }); });
  sfs.add(at(box(.39,.003,.034,M.black),.2925,.002,-.312)); const ecp=new THREE.Mesh(new THREE.PlaneGeometry(.375,.026),new THREE.MeshBasicMaterial({map:ect,toneMapped:false})); ecp.rotation.x=-Q; ecp.position.set(.2925,.0038,-.312); sf.add(ecp);
  ltBake(sfs);
  // two touch screens on the raked back
  const sc=grp(con,0,.098,-.07); sc.rotation.x=Math.atan2(.207,.145); const SL=Math.hypot(.207,.145), scs=grp(sc);
  const cueT=ctex(512,256,()=>{}), fixT=ctex(512,256,()=>{});
  for(const [sx,tx] of [[-1,cueT],[1,fixT]]){ scs.add(at(rbox(.47,.012,.232,M.black,.005),sx*.243,.002,-SL/2)); const p=new THREE.Mesh(new THREE.PlaneGeometry(.44,.21),new THREE.MeshBasicMaterial({map:tx,toneMapped:false})); p.rotation.x=-Q; p.position.set(sx*.243,.0085,-SL/2); sc.add(p); }
  ltBake(scs); ltBake(body);
  // gooseneck desk lamp
  const lamp=grp(con); lamp.add(at(cyl(.012,.014,.02,M.black,14),.42,.315,-.245)); lamp.add(tube([[.42,.32,-.245],[.42,.44,-.27],[.4,.56,-.22],[.36,.6,-.1],[.33,.57,-.01]],.0045,M.black,28)); lamp.add(at(rot(cyl(.011,.013,.07,M.black,12),1.2,0,.3),.325,.562,.004)); ltBake(lamp);
  const lp=ltPool(.2,.13,0xffd9a0,.28,true); lp.position.set(.3,.004,-.16); lp.rotation.x=-Q; sf.add(lp);
  const cues=['House open','Walk-in','Speaker','Video','Panel','Awards','Walk-out'], fx=['KEY 1','KEY 2','FILL','BACK 1','BACK 2','WASH 1','WASH 2','SPOT','DECK','HOUSE'];
  const cg=cueT.userData.g, fg=fixT.userData.g, F='"Geist Mono", monospace';
  const draw=(cue,p,lv)=>{ cg.fillStyle='#0b0d10'; cg.fillRect(0,0,512,256); cg.textBaseline='middle'; cg.textAlign='left'; cg.font='600 13px '+F; cg.fillStyle='#7d858c'; cg.fillText('CUE LIST  ·  MAIN',16,17); cg.fillText('FADE',430,17);
    cues.forEach((s,i)=>{ const y=34+i*27; if(i===cue){ cg.fillStyle='#E8892D'; cg.fillRect(8,y,496,24); cg.fillStyle='#14100a'; } else { cg.fillStyle=i===cue+1?'#1b2026':'#12151a'; cg.fillRect(8,y,496,24); cg.fillStyle=i<cue?'#5d646b':'#dfe6ea'; }
      cg.font='600 15px '+F; cg.fillText(String(i+1).padStart(2,' '),20,y+13); cg.fillText(s,70,y+13); cg.fillText(i%2?'2.0':'3.0',434,y+13); });
    cg.fillStyle='#1b2026'; cg.fillRect(8,232,496,12); cg.fillStyle='#E8892D'; cg.fillRect(8,232,496*p,12); cueT.needsUpdate=true;
    fg.fillStyle='#0b0d10'; fg.fillRect(0,0,512,256); fg.textBaseline='middle'; fg.textAlign='left'; fx.forEach((s,i)=>{ const x=10+(i%5)*100, y=10+Math.floor(i/5)*122, v=lv[i]; fg.fillStyle='#14181d'; fg.fillRect(x,y,92,114); fg.fillStyle='#252a31'; fg.fillRect(x+10,y+34,72,56); fg.fillStyle=`rgb(${Math.round(60+195*v)},${Math.round(52+182*v)},${Math.round(44+150*v)})`; fg.fillRect(x+10,y+34+56*(1-v),72,56*v);
      fg.font='600 13px '+F; fg.fillStyle='#dfe6ea'; fg.fillText(s,x+10,y+18); fg.fillStyle='#E8892D'; fg.fillText(String(Math.round(v*100)).padStart(3,' '),x+10,y+102); }); fixT.needsUpdate=true; };
  const tg=[.85,.6,.75,.5,.7,.35,.55,.9,.45,.3]; let lastKey='';
  const set=(u,t)=>{ const lv=tg.map((v,i)=>v*sstep(i*.05,.55+i*.05,u)); lv.forEach((v,i)=>{ m4.makeTranslation(xs[i],.01,-.066-v*.1); caps.setMatrixAt(i,m4); m4.makeTranslation(xs[i],v>.02?.0086:-.02,-.2); lit.setMatrixAt(i,m4); }); caps.instanceMatrix.needsUpdate=true; lit.instanceMatrix.needsUpdate=true; gm.position.z=-.066-u*.1;
    const cue=Math.min(3,Math.floor(u*3.999)), p=u>=1?(t*.12)%1:(u*3.999)%1, k=cue+':'+Math.round(p*40)+':'+Math.round(u*50); if(k!==lastKey){ lastKey=k; draw(cue,p,lv); } };
  set(1,0); return {con,set}; }
function ltDeskRig(I,stop=null){ const g=grp(I,0,0,0); g.rotation.y=-.28; const dk=ltDesk(); dk.con.position.y=.84; g.add(dk.con);
  const st=grp(g); for(const sx of [-1,1]){ for(const z of [-.2,.2]) st.add(at(rbox(.036,.82,.036,M.satin,.006),sx*.4,.43,z)); st.add(at(rbox(.05,.03,.66,M.satin,.008),sx*.4,.02,0)); st.add(at(rbox(.036,.036,.44,M.satin,.006),sx*.4,.822,0)); for(const z of [-.31,.31]) st.add(at(rbox(.056,.012,.05,M.rubber,.004),sx*.4,.004,z)); }
  for(const [y,z] of [[.3,-.2],[.78,-.2],[.78,.2]]) st.add(at(rbox(.8,.03,.03,M.satin,.006),0,y,z)); st.add(rod2(V(-.4,.3,-.2),V(.4,.78,-.2),.008,M.steel)); st.add(rod2(V(.4,.3,-.2),V(-.4,.78,-.2),.008,M.steel));
  st.add(tube([[-.3,1.0,-.28],[-.32,.8,-.36],[-.3,.3,-.4],[-.2,.02,-.5],[.3,.012,-.9],[1.2,.012,-1.3]],.006,M.rubber,40)); ltBake(st);
  const so=ltStool(); so.position.set(.05,0,.78); so.rotation.y=.5; g.add(so);
  const kits=[[-1.9,-2.3,.55],[1.5,-2.7,-.35]].map(([x,z,ry])=>{ const k=ltKit({h:1.75,coil:false,poolR:[1.3,.95]}); k.g.position.set(x,0,z); k.g.rotation.y=ry; I.add(k.g); return k; });
  const cOff=new THREE.Color(0x77736b), cOn=new THREE.Color(0xffffff);
  updaters.push((t,x)=>{ const u=stop===null?1:sstep(stop-.5,stop-.02,x); dk.set(u,t); kits.forEach((k,i)=>{ const v=sstep(i*.25,.7+i*.25,u); k.frontM.color.lerpColors(cOff,cOn,v); k.pool.material.opacity=.8*v; }); }); }

/* what stands for Lighting & staging on the homepage: one soft light on a stand, with its control box and a sandbag */
HERO.lighting=(G)=>{ const k=ltKit({poolR:[1.25,.85],poolZ:.3}); k.g.rotation.y=.3; G.add(k.g); };

/* ===== lighting & staging page: where things stand and where the camera stops ===== */
const LG=12; // groups sit closer than S so the next set slides in as the last one leaves
// opening: one soft light on a stand, alone. The range (medium and large rigs) stands beside it and steps aside after the range shot
const lI0=grp(scene,0,0,0), lRange=grp(lI0,0,0,0);
{ const kit=ltKit(); kit.g.rotation.y=-.5; lI0.add(kit.g); }
{ const md=ltMediumRig(); md.position.set(3.2,0,-2.1); md.rotation.y=.16; lRange.add(md);
  const lg=ltLargeRig(); lg.position.set(8.1,0,-2.5); lg.rotation.y=-.3; lRange.add(lg); }
const lIs=[[lI0,.5],[grp(scene,LG,0,0),2],[grp(scene,2*LG,0,0),3],[grp(scene,3*LG,0,0),4],[grp(scene,4*LG,0,0),5.5]];
ltEventRig(lIs[1][0],2); ltDeckRig(lIs[2][0],3); ltLiftRig(lIs[3][0],4); ltDeskRig(lIs[4][0],5);
// a set only shows while the camera is near it, so a neighbour never peeks in behind the text
updaters.push((t,x)=>{ for(const [g,c] of lIs) g.visible=Math.abs(x-c)<(c===.5||c===5.5?1.6:.9); });
updaters.push((t,x)=>{ const v=sstep(.25,.8,x)*(1-sstep(1.3,1.62,x)); lRange.scale.setScalar(Math.max(.001,v)); lRange.visible=v>.001; });
PAGE.keys=(narrow,K,R)=>[
  narrow? R([1.0,1.9,7.4],[-.1,1.15,.15],34) : K([2.0,1.5,5.7],[-.15,1.18,.15],30),                 // hero: one light on a stand
  narrow? R([4.4,6.2,30],[4.4,1.4,-1.6],34) : K([4.8,3.6,27.5],[5.3,1.6,-1.4],30,-.2),               // the range
  narrow? R([LG-.6,2.0,9.2],[LG+.9,1.3,0],34) : K([LG-1.2,1.7,7.2],[LG+.9,1.35,0],30),             // event lighting: the softbox comes apart
  narrow? R([2*LG-2.2,4.2,13],[2*LG-.6,.4,0],34) : K([2*LG+.8,4.7,15.6],[2*LG-.8,.45,0],30),         // stage decks assemble
  narrow? R([3*LG-1.4,3.0,16],[3*LG,1.9,0],34) : K([3*LG-3.5,2.6,12],[3*LG+.2,1.9,0],30,-.12),           // truss rises
  narrow? R([4*LG-.6,2.6,8.4],[4*LG-.1,1.1,-.9],34) : K([4*LG-1.7,2.5,7.9],[4*LG-.1,1.15,-1.0],30,-.18),   // lighting desk, the lights come on
  K([4*LG+1.6,4.4,13.2],[4*LG+.1,1.35,-1.0],30,0,.25) ];

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
dots.forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); goStop(+a.dataset.i); }));
document.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); goStop(+a.dataset.go); }));
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
  if(window.__pavLite){ try{renderer.dispose();}catch(e){} return; } window.__pavTick&&window.__pavTick();
  { const nt=performance.now(); PF.n++; if(PF.last){ const d=Math.min(nt-PF.last,250); PF.avg=PF.avg?PF.avg*.94+d*.06:d; } PF.last=nt; if(!PF.from&&PF.n>240) PF.from=nt+2500;
    if(PF.from&&nt>PF.from&&PF.n%30===0){ const a=PF.avg; if(a>26){ PF.ok=0; if(++PF.bad>=3&&PF.tier<2){ PF.tier++; renderer.setPixelRatio(PF.r[PF.tier]); PF.bad=0; PF.from=nt+1500; } } else if(a<14){ PF.bad=0; if(++PF.ok>=8&&PF.tier>0&&PF.ups<2){ PF.tier--; PF.ups++; renderer.setPixelRatio(PF.r[PF.tier]); PF.ok=0; PF.from=nt+1500; } } else { PF.bad=0; PF.ok=0; } }
    if(PF.n%PF.s[PF.tier]===1) renderer.shadowMap.needsUpdate=true; window.__pavPF=PF; }
  renderer.render(scene,camera); }
document.fonts&&document.fonts.ready.then(()=>{});
frame();
