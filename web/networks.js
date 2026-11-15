
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

/* ===== networks models: definitions only, nothing is added to the scene here ===== */
const NM={
  apW:std(0xf4f2ed,.38,.02,{envMapIntensity:.95}), apB:std(0x25262a,.5,.25), dark:std(0x0a0b0d,.7,.1), screw:std(0x2c2d31,.38,.85),
  silver:std(0xc3c4c6,.34,.84,{envMapIntensity:.95}), nickel:std(0xd6d3cc,.22,.95,{envMapIntensity:1.1}),
  rack:std(0x17181b,.46,.5,{envMapIntensity:.85}), rackIn:std(0x0e0f11,.8,.2),
  glass:std(0x0e1318,.04,0,{transparent:true,opacity:.3,depthWrite:false,envMapIntensity:2}),
  lead:std(0xdedbd3,.6,0), leadA:std(AMBER,.55,0), lam:std(0x17181a,.62,.08,{bumpMap:speckT,bumpScale:.16}), foam:std(0x2a2b2e,1,0,{envMapIntensity:.1}),
  fanF:std(0x141518,.5,.25), blade:std(0x34353a,.42,.25,{side:THREE.DoubleSide}), gpu:std(0x1c1d20,.4,.55,{envMapIntensity:.9}),
};
// small rounded box with few segments, for parts a few centimetres across
const nrb=(w,h,d,m,r=.003,cast=true)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.max(.0004,Math.min(r,w/2-.0002,h/2-.0002,d/2-.0002))),m,cast);
// merge every static mesh under g into one mesh per material, so a detailed model costs a handful of draw calls.
// Anything flagged userData.live (and every InstancedMesh) is carried over untouched, keeping its place.
function netBake(g){ g.updateWorldMatrix(true,true); const inv=g.matrixWorld.clone().invert(), by=new Map(), live=[], out=new THREE.Group(), rel=new THREE.Matrix4();
  out.position.copy(g.position); out.quaternion.copy(g.quaternion); out.scale.copy(g.scale); Object.assign(out.userData,g.userData);
  (function walk(o){ if(o!==g&&(o.userData.live||o.isInstancedMesh)){ live.push(o); return; }
    if(o.isMesh){ const ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); rel.multiplyMatrices(inv,o.matrixWorld); ge.applyMatrix4(rel);
      const k=o.material.uuid+(o.castShadow?'c':'n'); if(!by.has(k)) by.set(k,{m:o.material,c:o.castShadow,p:[],n:[],u:[],len:0});
      const e=by.get(k), a=ge.attributes; e.p.push(a.position.array); e.n.push(a.normal.array); e.u.push(a.uv?a.uv.array:new Float32Array(a.position.count*2)); e.len+=a.position.count; }
    for(const c of [...o.children]) walk(c); })(g);
  for(const e of by.values()){ const P=new Float32Array(e.len*3), N=new Float32Array(e.len*3), U=new Float32Array(e.len*2); let i=0; e.p.forEach((p,j)=>{ P.set(p,i*3); N.set(e.n[j],i*3); U.set(e.u[j],i*2); i+=p.length/3; });
    const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.BufferAttribute(P,3)); ge.setAttribute('normal',new THREE.BufferAttribute(N,3)); ge.setAttribute('uv',new THREE.BufferAttribute(U,2));
    const m=new THREE.Mesh(ge,e.m); m.castShadow=e.c; m.receiveShadow=true; out.add(m); }
  const par=g.parent; if(par){ par.add(out); } out.updateWorldMatrix(true,false); for(const o of live) out.attach(o); if(par) par.remove(g); return out; }
const netTubeG=(pts,r,seg=40,rad=6)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>p.isVector3?p:V(...p))),seg,r,rad);

/* ---------- access point: a clean disc with a status ring, on a slim stand ---------- */
function netAP(){ const g=new THREE.Group(), d=new THREE.Group(); d.rotation.x=Q; g.add(d);
  d.add(lathe([[0,0],[.07,0],[.09,.0015],[.0955,.005],[.0955,.0085]],NM.apB,72));
  d.add(lathe([[.0958,.0074],[.1035,.009],[.108,.0125],[.1095,.017],[.109,.0215],[.1065,.0262],[.101,.0305],[.092,.0334],[.075,.0348],[.04,.0356],[0,.036]],NM.apW,96));
  d.add(at(cyl(.0964,.0964,.0012,NM.dark,72),0,.0081,0));                       // the seam between back and shell
  const ring=new THREE.Mesh(new THREE.RingGeometry(.0262,.0292,72),new THREE.MeshBasicMaterial({color:0x9fd4ff,toneMapped:false})); ring.position.z=.0362; ring.userData.live=true; g.add(ring);
  const halo=new THREE.Mesh(new THREE.RingGeometry(.0215,.0345,72),new THREE.MeshBasicMaterial({color:0x9fd4ff,transparent:true,opacity:.2,depthWrite:false,toneMapped:false})); halo.position.z=.0361; halo.userData.live=true; g.add(halo);
  // back: the mounting plate with its twist-lock tabs, and the network socket
  g.add(at(rot(cyl(.046,.05,.011,NM.apB,40),Q),0,0,-.0055)); for(let k=0;k<3;k++){ const a=k/3*Math.PI*2+.5; g.add(at(nrb(.014,.014,.004,NM.dark,.002),Math.cos(a)*.066,Math.sin(a)*.066,-.002)); }
  g.add(at(nrb(.02,.016,.012,NM.dark,.003),.022,-.07,-.005));
  g.userData.ring=ring; g.userData.halo=halo; return g; }
function netStand(h=1.7){ const g=new THREE.Group(), yl=.05+h*.56;
  g.add(lathe([[0,0],[.186,0],[.2,.004],[.2,.011],[.193,.016],[.06,.022],[.034,.028],[.03,.05],[.021,.056],[0,.056]],M.black,64));
  g.add(at(cyl(.0155,.0155,yl-.05,M.satin,20),0,.05+(yl-.05)/2,0)); g.add(at(cyl(.011,.011,h-yl+.05,M.alu,18),0,(h+yl-.05)/2,0));
  g.add(at(cyl(.021,.021,.046,M.black,22),0,yl,0)); g.add(at(cyl(.0165,.021,.012,M.black,22),0,yl+.029,0)); g.add(at(rot(cyl(.006,.006,.03,M.steel,12),0,0,Q),.03,yl,0)); g.add(at(rot(lathe([[0,0],[.011,0],[.013,.004],[.013,.012],[.009,.016],[0,.016]],M.amber,20),0,0,-Q),.042,yl,0));
  for(const y of [h-.3,yl+.16]) g.add(at(cyl(.0128,.0128,.007,M.rubber,16),0,y,-.002)); g.add(at(cyl(.0172,.0172,.007,M.rubber,16),0,yl-.25,-.002)); g.add(at(cyl(.0172,.0172,.007,M.rubber,16),0,.3,-.002));
  return g; }
// where a network lead runs: from the floor behind the base, up the back of the pole, round to the socket on the back of the access point (stand-local points)
const netStandLead=(h)=>{ const yl=.05+h*.56; return [[0,.0045,-.36],[0,.005,-.26],[0,.021,-.185],[0,.027,-.09],[0,.05,-.036],[0,.12,-.0215],[0,.3,-.0205],[0,yl-.25,-.0205],[0,yl-.06,-.0215],[0,yl,-.027],[0,yl+.06,-.0175],[0,yl+.16,-.0158],[0,h-.3,-.0158],[.004,h-.2,-.016],[.014,h-.15,-.008],[.02,h-.125,.012],[.022,h-.118,.026]]; };
function netApStand(h=1.7,tilt=.13){ const g=new THREE.Group(), st=new THREE.Group(); st.add(netStand(h));
  st.add(at(nrb(.036,.05,.036,M.black,.007),0,h-.045,0)); st.add(at(rot(cyl(.0065,.0065,.052,M.steel,12),0,0,Q),0,h-.045,.02)); st.add(at(nrb(.03,.036,.016,NM.apB,.004),0,h-.045,.024));
  const ap=netAP(); ap.position.set(0,h-.045,.043); ap.rotation.x=-tilt; st.add(ap);
  const b=netBake(st); g.add(b); g.userData={ring:ap.userData.ring,halo:ap.userData.halo,h}; return g; }

/* coverage: soft rings spreading over the floor */
function netRingT(){ return netRingT.t||(netRingT.t=ctex(256,256,(g,w,h)=>{ const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); gr.addColorStop(0,'rgba(232,137,45,0)'); gr.addColorStop(.7,'rgba(232,137,45,.03)'); gr.addColorStop(.9,'rgba(232,137,45,.55)'); gr.addColorStop(.955,'rgba(232,137,45,1)'); gr.addColorStop(1,'rgba(232,137,45,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); })); }
function netFillT(){ return netFillT.t||(netFillT.t=ctex(128,128,(g,w,h)=>{ const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); gr.addColorStop(0,'rgba(232,137,45,.9)'); gr.addColorStop(.6,'rgba(232,137,45,.35)'); gr.addColorStop(1,'rgba(232,137,45,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); })); }
function netCoverage(G,R=1.8,n=4,ph=0){ const st={on:1}, rings=[], mk=(t,y)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,depthWrite:false,toneMapped:false})); m.rotation.x=-Q; m.position.y=y; m.userData.live=true; G.add(m); return m; };
  const fill=mk(netFillT(),.004); fill.scale.setScalar(R*.9); for(let k=0;k<n;k++) rings.push(mk(netRingT(),.006+k*.0012));
  updaters.push(t=>{ rings.forEach((r,k)=>{ const p=(t*.2+k/n+ph)%1; r.scale.setScalar(.14+p*R); r.material.opacity=Math.pow(1-p,1.25)*.8*st.on*Math.min(1,p*7); r.visible=st.on>.004; }); fill.material.opacity=.11*st.on; fill.visible=st.on>.004; });
  return st; }

/* ---------- 19-inch gear: faces are drawn at 2.3 px per mm, link lights are real and blink ---------- */
const netFaces={}, netP=1024/.438;
function netDrawPort(g,x,y,w,h,up){ g.fillStyle='#050506'; g.fillRect(x-w/2,y-h/2,w,h); g.fillRect(x-w*.2,up?y-h/2-h*.2:y+h/2,w*.4,h*.2);
  const gr=g.createLinearGradient(0,y-h/2,0,y+h/2); gr.addColorStop(0,up?'rgba(255,255,255,0)':'rgba(255,255,255,.14)'); gr.addColorStop(1,up?'rgba(255,255,255,.14)':'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(x-w/2,y-h/2,w,h);
  g.fillStyle='rgba(214,170,90,.8)'; for(let k=0;k<8;k++) g.fillRect(x-w*.36+k*w*.1,up?y+h*.1:y-h*.42,w*.045,h*.32); }
const netRR=(g,x,y,w,h,r)=>{ g.beginPath(); g.roundRect(x,y,w,h,r); g.fill(); };
function netSwitchFace(np){ const key='s'+np; if(netFaces[key]) return netFaces[key]; const FW=.438,FH=.0396,P=netP, cols=np/2, blk=np===16?8:6, pitch=.0138, gap=.0052, nb=cols/blk, x0=np>=48?-.172:-.15, ports=[];
  for(let c=0;c<cols;c++) for(let r=0;r<2;r++) ports.push({x:x0+c*pitch+Math.floor(c/blk)*gap+pitch/2,y:r?-.0066:.0066,up:!r});
  const tex=ctex(1024,Math.round(FH*P),(g,W,H)=>{ const X=x=>(x+FW/2)*P, Y=y=>(FH/2-y)*P;
    g.fillStyle='#c5c6c8'; g.fillRect(0,0,W,H); for(let i=0;i<240;i++){ g.fillStyle=i%2?'rgba(255,255,255,.08)':'rgba(0,0,0,.05)'; g.fillRect(0,Math.random()*H,W,1); }
    g.fillStyle='#0d0e10'; for(let b=0;b<nb;b++){ const xa=x0+b*(blk*pitch+gap)-.0012; netRR(g,X(xa),Y(.0142),(blk*pitch+.0024)*P,.0284*P,3); }
    for(const p of ports) netDrawPort(g,X(p.x),Y(p.y),.0112*P,.0082*P,p.up);
    g.fillStyle='#55565a'; g.font='600 6px "Geist Mono", monospace'; g.textAlign='center'; ports.forEach((p,i)=>g.fillText(String(i+1),X(p.x),p.up?Y(.0153):Y(-.0153)+5));
    for(const x of [.1865,.2012]){ g.fillStyle='#8b8c8f'; netRR(g,X(x)-16.5,Y(.0052),33,.0104*P,2); g.fillStyle='#08090a'; netRR(g,X(x)-14.5,Y(.0044),29,.0088*P,1.5); }
    g.fillStyle='#55565a'; g.textAlign='left'; g.fillText('SFP+',X(.179),Y(-.0118)); g.fillStyle='#0d0e10'; netRR(g,X(-.2)-33,Y(0)-33,66,66,7); g.beginPath(); g.arc(X(.214),Y(-.012),2.2,0,7); g.fill(); });
  return netFaces[key]={mat:std(0xffffff,.42,.5,{map:tex,bumpMap:tex,bumpScale:.35,envMapIntensity:.9}),ports}; }
function netPanelFace(kind,u=1){ const key=kind+u; if(netFaces[key]) return netFaces[key]; const FW=.438, FH=u*.04445-.0048, P=netP, ports=[];
  const tex=ctex(1024,Math.round(FH*P),(g,W,H)=>{ const X=x=>(x+FW/2)*P, Y=y=>(FH/2-y)*P; g.fillStyle='#17181b'; g.fillRect(0,0,W,H); for(let i=0;i<120;i++){ g.fillStyle=i%2?'rgba(255,255,255,.025)':'rgba(0,0,0,.08)'; g.fillRect(0,Math.random()*H,W,1); }
    g.font='600 6px "Geist Mono", monospace'; g.textAlign='center';
    if(kind==='pp'){ const pitch=.0162, gap=.009, x0=-.2079; for(let i=0;i<24;i++){ const x=x0+i*pitch+Math.floor(i/6)*gap+pitch/2; ports.push({x,y:-.0045,up:false}); g.fillStyle='#2c2d31'; netRR(g,X(x)-.0072*P,Y(.0022),.0144*P,.0128*P,2); netDrawPort(g,X(x),Y(-.0045),.0112*P,.0082*P,false); }
      for(let b=0;b<4;b++){ const xa=x0+b*(6*pitch+gap)+.002; g.fillStyle='#e9e6df'; netRR(g,X(xa),Y(.0145),(6*pitch-.004)*P,.0085*P,2); g.fillStyle='#2a2b2e'; for(let k=0;k<6;k++) g.fillText(String(b*6+k+1).padStart(2,'0'),X(x0+(b*6+k)*pitch+b*gap+pitch/2),Y(.0145)+15); } }
    else if(kind==='vent'){ const rows=u===1?3:8; g.fillStyle='#050506'; for(let r=0;r<rows;r++) for(let c=0;c<21;c++){ const x=-.187+c*.018+(r%2)*.009, y=(r-(rows-1)/2)*.0088; netRR(g,X(x)-.0065*P,Y(y)-.0014*P,.013*P,.0028*P,3); } g.fillStyle='rgba(255,255,255,.07)'; for(let r=0;r<rows;r++) for(let c=0;c<21;c++){ const x=-.187+c*.018+(r%2)*.009, y=(r-(rows-1)/2)*.0088; g.fillRect(X(x)-.0065*P,Y(y)+.0014*P,.013*P,1); } }
    else if(kind==='brush'){ g.fillStyle='#050506'; g.fillRect(X(-.2),Y(.0105),.4*P,.021*P); for(let i=0;i<700;i++){ g.fillStyle=`rgba(${60+Math.random()*50|0},${60+Math.random()*50|0},${66+Math.random()*50|0},.5)`; g.fillRect(X(-.2)+Math.random()*.4*P,Y(.0105),1,.021*P); } g.fillStyle='rgba(255,255,255,.1)'; g.fillRect(X(-.2),Y(.0105)-2,.4*P,2); g.fillRect(X(-.2),Y(-.0105),.4*P,2); }
    else if(kind==='pdu'){ for(let k=0;k<8;k++){ const x=-.105+k*.0405; g.fillStyle='#2e2f33'; netRR(g,X(x)-.0155*P,Y(0)-.0155*P,.031*P,.031*P,6); g.fillStyle='#08090a'; netRR(g,X(x)-.0135*P,Y(0)-.0135*P,.027*P,.027*P,5); g.fillStyle='#000'; g.fillRect(X(x)-.0062*P,Y(.0075),.0018*P,.0085*P); g.fillRect(X(x)+.0044*P,Y(.0075),.0018*P,.0075*P); g.beginPath(); g.arc(X(x),Y(-.0072),.0027*P,0,7); g.fill(); g.fillStyle='#8a8b8f'; g.fillText('A'+(k+1),X(x)+.0105*P,Y(-.0125)); }
      g.fillStyle='#08090a'; netRR(g,X(-.186)-.016*P,Y(0)-.0125*P,.032*P,.025*P,4); g.fillStyle='#8a8b8f'; g.textAlign='left'; g.fillText('POWER',X(-.202),Y(.0155)); g.fillText('15A',X(-.152),Y(.0155)); g.fillStyle='#2e2f33'; g.beginPath(); g.arc(X(-.146),Y(-.002),.006*P,0,7); g.fill(); g.fillStyle='#0b0c0d'; g.beginPath(); g.arc(X(-.146),Y(-.002),.004*P,0,7); g.fill(); }
    else if(kind==='store'){ g.fillStyle='#111214'; g.fillRect(X(-.207),Y(.0405),.414*P,.081*P); for(let r=0;r<2;r++) for(let c=0;c<4;c++){ const x=-.205+c*.1035, y=r?-.0203:.0203; g.fillStyle='#292a2e'; netRR(g,X(x)+2,Y(y)-.0188*P,.1*P,.0376*P,4); g.fillStyle='#0a0b0c'; for(let i=0;i<19;i++) for(let j=0;j<7;j++){ g.beginPath(); g.arc(X(x)+14+i*9+(j%2)*4.5,Y(y)-.0145*P+j*9.6,2.6,0,7); g.fill(); }
        g.fillStyle='#55565b'; netRR(g,X(x)+.082*P,Y(y)-.015*P,.0125*P,.03*P,3); g.fillStyle='#17181a'; netRR(g,X(x)+.0845*P,Y(y)-.0115*P,.0075*P,.012*P,2); g.fillStyle='#8a8b8f'; g.fillText(String(r*4+c+1),X(x)+.0885*P,Y(y)+.0125*P); } }
    else { const full=kind==='upsb', xr=full?.205:.062; for(let y=-FH/2+.012;y<FH/2-.01;y+=.0062){ g.fillStyle='#050506'; g.fillRect(X(-.205),Y(y),(xr+.205)*P,.0036*P); g.fillStyle='rgba(255,255,255,.1)'; g.fillRect(X(-.205),Y(y)+.0036*P,(xr+.205)*P,1.5); }
      g.fillStyle='#17181b'; for(const x of [-.075,.0]) if(full||x<0) g.fillRect(X(x)-.004*P,0,.008*P,H); g.textAlign='left'; g.font='600 9px "Geist Mono", monospace'; g.fillStyle='#8a8b8f';
      if(!full){ g.fillStyle='#232428'; netRR(g,X(.074),Y(.05),.134*P,.1*P,8); g.fillStyle='#08090a'; netRR(g,X(.086),Y(.042),.11*P,.052*P,5); for(let k=0;k<3;k++){ g.fillStyle='#3b3c41'; g.beginPath(); g.arc(X(.105+k*.036),Y(-.031),.0078*P,0,7); g.fill(); g.fillStyle='#1b1c1f'; g.beginPath(); g.arc(X(.105+k*.036),Y(-.031),.0058*P,0,7); g.fill(); } g.fillStyle='#8a8b8f'; g.fillText('UPS · ONLINE',X(.088),Y(-.0445)); } } });
  return netFaces[key]={mat:std(0xffffff,.55,.3,{map:tex,bumpMap:tex,bumpScale:.3,envMapIntensity:.8}),ports}; }
function netEars(g,H,m){ for(const sx of [-1,1]){ g.add(at(nrb(.0222,H,.0024,m,.001),sx*.2302,0,-.0012)); for(const sy of [-1,1]){ g.add(at(rot(cyl(.0046,.0046,.0024,NM.screw,12),Q),sx*.2325,sy*(H/2-.0064),.0012)); g.add(at(rot(cyl(.0062,.0062,.0008,NM.dark,14),Q),sx*.2325,sy*(H/2-.0064),.0004)); } } }
const netLive=[], netSpin=[]; let netTick=false;
const netOff=new THREE.Color(0x1b1e1b), netGreen=new THREE.Color(0xb4e0a4), netAmb=new THREE.Color(AMBER);
function netTicker(){ if(netTick) return; netTick=true; let fr=0; updaters.push(t=>{ for(const [o,sp] of netSpin) o.rotation.z=t*sp; if(fr++%4) return;
  for(const r of netLive){ for(let i=0;i<r.n;i++){ const f=r.up[i]; r.leds.setColorAt(i,f&&Math.sin(t*(7+(i%7)*2.3)+i*1.7+r.seed)>-.6?(f===2?netAmb:netGreen):netOff); } r.leds.instanceColor.needsUpdate=true; } }); }
function netLeds(g,pts,w=.0038,h=.0019,seed=0){ const leds=new THREE.InstancedMesh(new THREE.BoxGeometry(w,h,.0006),new THREE.MeshBasicMaterial({toneMapped:false}),pts.length), mt=new THREE.Matrix4(); pts.forEach((p,i)=>{ mt.makeTranslation(p[0],p[1],p[2]??.0011); leds.setMatrixAt(i,mt); leds.setColorAt(i,netOff); }); g.add(leds);
  const rec={leds,n:pts.length,up:new Uint8Array(pts.length),seed}; netLive.push(rec); netTicker(); return rec; }
function netScrMat(a,b){ const key='scr'+a+b; return netFaces[key]||(netFaces[key]=new THREE.MeshBasicMaterial({toneMapped:false,map:ctex(96,96,(g,w,h)=>{ g.fillStyle='#07090b'; g.fillRect(0,0,w,h); g.fillStyle='#e6ecef'; g.font='700 30px "Geist Mono", monospace'; g.textAlign='center'; g.fillText(a,w/2,46); g.font='600 13px "Geist Mono", monospace'; g.fillStyle='#8fb7d9'; g.fillText(b,w/2,66); g.strokeStyle='#E8892D'; g.lineWidth=4; g.beginPath(); g.arc(w/2,h/2,41,-1.9,1.1); g.stroke(); })})); }
function netSwitch(np=24,seed=0){ const g=new THREE.Group(), W=.442,H=.0436,D=.2, f=netSwitchFace(np);
  g.add(at(nrb(W,H,D,NM.silver,.002),0,0,-D/2)); g.add(at(mesh(new THREE.PlaneGeometry(.438,.0396),f.mat,false),0,0,.0006)); netEars(g,H,NM.silver);
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(.0245,.0245),netScrMat(String(np),'PORTS')); scr.position.set(-.2,0,.0013); g.add(scr);
  const rec=netLeds(g,f.ports.map(p=>[p.x,p.y+(p.up?.0056:-.0056)]),.0038,.0019,seed); g.userData={ports:f.ports,rec}; return g; }
function netUnit(kind,u=1,depth=.08,body=NM.rack){ const g=new THREE.Group(), H=u*.04445-.0008, f=netPanelFace(kind,u); g.add(at(nrb(.442,H,depth,body,.002),0,0,-depth/2)); g.add(at(mesh(new THREE.PlaneGeometry(.438,H-.004),f.mat,false),0,0,.0006)); netEars(g,H,body); g.userData={ports:f.ports}; return g; }
// a patch lead between two points on a front panel plane (z = 0 is the panel), with a booted plug at each end
function netPatch(g,a,b,m,bow=.05){ const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2,bow+Math.abs(a[1]-b[1])*.12]; g.add(mesh(netTubeG([[a[0],a[1],.002],[a[0],a[1],.026],[lerp(a[0],mid[0],.5),lerp(a[1],mid[1],.55),mid[2]*.9],mid,[lerp(b[0],mid[0],.5),lerp(b[1],mid[1],.55),mid[2]*.9],[b[0],b[1],.026],[b[0],b[1],.002]],.0027,22,6),m,false));
  for(const p of [a,b]) g.add(at(box(.0112,.0082,.02,m),p[0],p[1],.01)); }
function netRailT(n){ return ctex(32,89,(g,w,h)=>{ g.fillStyle='#a3a29e'; g.fillRect(0,0,w,h); g.fillStyle='#0b0b0c'; for(const y of [6.35,22.2,38.1]) g.fillRect(w/2-9,y*2-9,18,18); g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(0,h-1,w,1); },[1,n]); }

/* the full rack: glass door on hinges, patch panels over switches, storage on slides, power at the bottom */
function netRack(nU=30){ const W=.6,D=.8,U=.04445,IH=nU*U,Y0=.115,YT=Y0+IH,YM=Y0+IH/2,ZR=D/2-.11, g=new THREE.Group(), st=new THREE.Group(), sws=[];
  st.add(at(rbox(W,.07,D,NM.rack,.008),0,.08,0)); st.add(at(rbox(W,.05,D,NM.rack,.008),0,YT+.025,0));
  for(const sx of [-1,1]) for(const sz of [-1,1]){ st.add(at(cyl(.011,.011,.04,M.steel,12),sx*(W/2-.06),.028,sz*(D/2-.07))); st.add(at(cyl(.02,.02,.008,M.steel,6),sx*(W/2-.06),.04,sz*(D/2-.07))); st.add(at(cyl(.03,.033,.01,M.rubber,20),sx*(W/2-.06),.005,sz*(D/2-.07))); st.add(at(rbox(.04,IH,.04,NM.rack,.006),sx*(W/2-.02),YM,sz*(D/2-.02))); }
  st.add(at(rot(mesh(new THREE.PlaneGeometry(.42,.52),grilleMat('netracktop',.42,.52,[[.3,.3,.075],[.7,.3,.075],[.3,.7,.075],[.7,.7,.075]]),false),-Q),0,YT+.0506,-.02));
  for(const sx of [-1,1]){ st.add(at(rbox(.01,IH-.004,D-.085,M.shell,.003),sx*(W/2-.008),YM,0)); st.add(at(nrb(.004,.07,.03,NM.dark,.002),sx*(W/2-.002),YM,D/2-.12)); st.add(at(nrb(.006,.05,.012,M.steel,.003),sx*(W/2+.001),YM,D/2-.12));
    st.add(at(box(.018,IH,.002,std(0xffffff,.4,.8,{map:netRailT(nU)})),sx*.2325,YM,ZR)); st.add(at(box(.002,IH,.05,M.steel),sx*.2425,YM,ZR-.025)); st.add(at(box(.018,IH,.002,M.steel),sx*.2325,YM,-ZR)); }
  st.add(at(rbox(W-.085,IH-.004,.01,M.shell2,.003),0,YM,-D/2+.008)); st.add(at(box(W-.09,.004,D-.09,NM.rackIn),0,Y0+.002,0));
  // what is in it, top to bottom: [kind, height in U]
  const fill=[['brush',1],['pp',1],['cm',1],['sw',1],['pp',1],['cm',1],['sw',1],['pp',1],['cm',1],['sw',1],['vent',1],['sw16',1],['vent',1],['store',2,'slide'],['store',2],['vent',2],['pdu',1],['vent',2],['ups',3],['upsb',3]];
  let top=0; const slide=new THREE.Group(); slide.userData.live=true; const leads=new THREE.Group(), rows={};
  fill.forEach(([kind,u,fl],i)=>{ const y=YT-(top+u/2)*U; top+=u; let o;
    if(kind==='sw'||kind==='sw16'){ o=netSwitch(kind==='sw'?24:16,i*3.1); sws.push(o); }
    else if(kind==='cm'){ o=new THREE.Group(); o.add(at(nrb(.442,U-.0008,.012,NM.rack,.002),0,0,-.006)); netEars(o,U-.0008,NM.rack); for(let k=0;k<5;k++){ const r=mesh(new THREE.TorusGeometry(.0165,.0028,6,20),M.black,false); r.rotation.y=Q; r.scale.z=1; r.position.set(-.172+k*.086,0,.017); o.add(r); o.add(at(box(.006,.004,.004,M.black),-.172+k*.086,0,.001)); } }
    else if(kind==='store'){ o=netUnit('store',2,.5,NM.silver); const pts=[]; for(let r=0;r<2;r++) for(let c=0;c<4;c++) pts.push([-.205+c*.1035+.006,(r?-.0203:.0203)-.0135,.0011]); const rec=netLeds(o,pts,.0034,.0022,i); rec.up.fill(1); for(const sx of [-1,1]) for(const sy of [-1,1]) o.add(at(nrb(.006,.016,.012,NM.dark,.002),sx*.2302,sy*.02,.006)); }
    else if(kind==='pdu'){ o=netUnit('pdu',1,.06); o.add(at(nrb(.026,.019,.006,glow(AMBER),.002),-.186,0,.003)); o.add(at(box(.026,.0008,.0062,NM.dark),-.186,0,.0031)); }
    else if(kind==='ups'){ o=netUnit('ups',3,.5); const d=new THREE.Mesh(new THREE.PlaneGeometry(.1,.044),new THREE.MeshBasicMaterial({map:lcd(['ONLINE','BATT OK'],220,96),toneMapped:false})); d.position.set(.141,.016,.0012); o.add(d); const rec=netLeds(o,[[.091,-.047],[.127,-.047]],.004,.002,7); rec.up[0]=1; rec.up[1]=0; }
    else o=netUnit(kind,u,kind==='upsb'?.5:.03);
    o.position.set(0,y,ZR+.0034); rows[i]=y;
    if(fl==='slide'){ slide.position.copy(o.position); o.position.set(0,0,0); const sb=netBake(o); slide.add(sb); for(const sx of [-1,1]){ slide.add(at(box(.0025,.034,.5,M.steel),sx*.2235,0,-.26)); st.add(at(box(.004,.04,.5,M.satin),sx*.2275,y,ZR-.26)); } }
    else st.add(o); });
  // patch leads: panel above, lead through the ring, switch below
  const PP=netPanelFace('pp',1).ports, SW=netSwitchFace(24).ports; let n=0;
  [[1,3],[4,6],[7,9]].forEach(([ip,is],gi)=>{ const sw=sws[gi], used=[0,1,2,3,5,6,8,9,10,12,13,15,16,18,19,20,22,23].filter(k=>(k+gi)%5!==4);
    for(const k of used){ const p=PP[k], s=SW[k], m=(n++%6===3)?NM.leadA:NM.lead; netPatch(leads,[p.x,rows[ip]+p.y],[s.x,rows[is]+s.y],m,.046+(k%3)*.007); sw.userData.rec.up[k]=(k%7===3)?2:1; } });
  { const r=sws[3].userData.rec; for(const k of [0,1,2,3,8,9]) r.up[k]=1; for(const [a,b] of [[0,8],[2,10],[4,12]]) netPatch(leads,[SW[a].x,rows[9]+SW[a].y-.0002],[netSwitchFace(16).ports[b-8].x,rows[11]+.0066],NM.leadA,.05); }
  leads.position.set(0,0,ZR+.0034); st.add(leads);
  // the door: steel frame, tinted glass, swing handle with a lock, three hinges
  const DW=W-.02, door=new THREE.Group(), dg=new THREE.Group(); door.position.set(-W/2+.01,0,D/2+.013); door.userData.live=true;
  for(const x of [.0225,DW-.0225]) dg.add(at(rbox(.045,IH+.03,.022,NM.rack,.006),x,YM,0)); for(const y of [Y0+.01,YT-.01]) dg.add(at(rbox(DW-.09,.05,.022,NM.rack,.006),DW/2,y,0));
  dg.add(at(mesh(new THREE.BoxGeometry(DW-.086,IH-.066,.005),NM.glass,false),DW/2,YM,0));
  dg.add(at(nrb(.03,.17,.01,NM.dark,.004),DW-.0225,YM,.012)); dg.add(at(nrb(.02,.12,.012,M.alu,.005),DW-.0225,YM+.016,.02)); dg.add(at(rot(cyl(.0075,.0075,.012,M.steel,16),Q),DW-.0225,YM-.064,.02)); dg.add(at(box(.0012,.005,.0005,NM.dark),DW-.0225,YM-.064,.0262));
  for(const y of [Y0+.12,YM,YT-.12]){ dg.add(at(cyl(.0085,.0085,.07,M.steel,14),-.004,y,-.004)); dg.add(at(cyl(.0095,.0095,.004,NM.dark,14),-.004,y,-.004)); }
  door.add(netBake(dg));
  g.add(netBake(st)); g.add(slide); g.add(door); g.userData={door,slide,H:YT+.05}; return g; }

/* the event kit: a switch in a small flight case, lid off, leads out to access points on stands */
function netEventCase(){ const W=.56,D=.42,U=.04445,IH=3*U+.004,H=IH+.03,Y0=.028, g=new THREE.Group(), st=new THREE.Group();
  for(const y of [Y0+.0075,Y0+H-.0075]) st.add(at(rbox(W,.015,D,NM.lam,.004),0,y,0)); for(const sx of [-1,1]) st.add(at(rbox(.015,H,D,NM.lam,.004),sx*(W/2-.0075),Y0+H/2,0));
  st.add(at(box(W-.03,H-.03,.01,NM.lam),0,Y0+H/2,-D/2+.07)); st.add(at(box(W-.03,H-.03,.002,NM.rackIn),0,Y0+H/2,-D/2+.076));
  for(const sy of [0,1]) for(const sx of [-1,1]) st.add(at(rbox(.028,.028,D+.012,M.alu,.007),sx*W/2,Y0+sy*H,0));
  for(const sz of [-1,1]){ for(const sy of [0,1]) st.add(at(rbox(W+.012,.026,.026,M.alu,.006),0,Y0+sy*H,sz*D/2)); for(const sx of [-1,1]){ st.add(at(rbox(.026,H,.026,M.alu,.006),sx*W/2,Y0+H/2,sz*D/2)); for(const sy of [0,1]) st.add(at(sph(.028,M.steel,16,12),sx*W/2,Y0+sy*H,sz*D/2)); } }
  for(const sx of [-1,1]) for(const sz of [-1,1]) st.add(at(cyl(.022,.024,.014,M.rubber,16),sx*(W/2-.07),.007,sz*(D/2-.07)));
  // latch dishes on top (the lid is off), a sprung handle on each end, a label
  for(const x of [-.17,.17]){ const l=grp(st,x,Y0+H+.001,D/2-.07); l.add(nrb(.085,.006,.1,M.alu,.003)); l.add(at(cyl(.027,.027,.005,NM.dark,24),0,.003,-.008)); l.add(at(nrb(.04,.008,.012,M.steel,.003),0,.007,-.008)); l.add(at(nrb(.03,.006,.02,M.steel,.002),0,.004,.046)); }
  for(const sx of [-1,1]){ const hd=grp(st,sx*(W/2+.001),Y0+H*.52,0); hd.add(nrb(.006,.11,.19,M.alu,.003)); hd.add(at(nrb(.008,.076,.14,NM.dark,.003),sx*.001,0,0)); hd.add(at(nrb(.016,.016,.12,M.steel,.007),sx*.009,-.02,0)); }
  const lab=new THREE.Mesh(new THREE.PlaneGeometry(.2,.06),new THREE.MeshBasicMaterial({toneMapped:false,map:ctex(400,120,(c,w,h)=>{ c.fillStyle='#efece6'; c.fillRect(0,0,w,h); c.fillStyle='#1a1a18'; c.font='700 38px "Geist Mono", monospace'; c.fillText('NET KIT 01',20,52); c.font='500 22px "Geist Mono", monospace'; c.fillText('EVENT WI-FI · SWITCH',20,92); c.fillStyle='#E8892D'; c.fillRect(w-46,18,26,26); })})); lab.rotation.x=-Q; lab.position.set(-.02,Y0+H+.0082,-.06); st.add(lab); st.add(at(nrb(.21,.002,.07,M.white,.001),-.02,Y0+H+.0068,-.06));
  // inside: rails, the switch, a vent panel, power
  const ZR=D/2-.05, YC=Y0+H/2; for(const sx of [-1,1]) st.add(at(box(.018,IH,.002,std(0xffffff,.4,.8,{map:netRailT(3)})),sx*.2325,YC,ZR-.001));
  const sw=netSwitch(24,2.2); sw.position.set(0,YC+U,ZR+.0026); st.add(sw); const v=netUnit('vent',1,.03); v.position.set(0,YC,ZR+.0026); st.add(v);
  const pd=netUnit('pdu',1,.06); pd.add(at(nrb(.026,.019,.006,glow(AMBER),.002),-.186,0,.003)); pd.add(at(box(.026,.0008,.0062,NM.dark),-.186,0,.0031)); pd.position.set(0,YC-U,ZR+.0026); st.add(pd);
  g.add(netBake(st)); g.userData={sw,W,D,H:Y0+H}; return g; }
function netCaseLid(){ const W=.56,H=.168+.014,T=.07, st=new THREE.Group(); st.add(at(rbox(W,H,.012,NM.lam,.004),0,0,-T+.006)); for(const sy of [-1,1]) st.add(at(rbox(W,.014,T,NM.lam,.004),0,sy*(H/2-.007),-T/2)); for(const sx of [-1,1]) st.add(at(rbox(.014,H,T,NM.lam,.004),sx*(W/2-.007),0,-T/2));
  for(const sy of [-1,1]){ st.add(at(rbox(W+.012,.026,.026,M.alu,.006),0,sy*H/2,0)); st.add(at(rbox(W+.012,.026,.026,M.alu,.006),0,sy*H/2,-T)); } for(const sx of [-1,1]){ st.add(at(rbox(.026,H,.026,M.alu,.006),sx*W/2,0,0)); st.add(at(rbox(.026,H,.026,M.alu,.006),sx*W/2,0,-T)); for(const sy of [-1,1]){ st.add(at(sph(.028,M.steel,16,12),sx*W/2,sy*H/2,-T)); st.add(at(rbox(.028,.028,T,M.alu,.007),sx*W/2,sy*H/2,-T/2)); } }
  st.add(at(box(W-.03,H-.03,.03,NM.foam),0,0,-T+.027)); for(const x of [-.17,.17]){ st.add(at(nrb(.085,.1,.006,M.alu,.003),x,H/2+.001-.05+.05,-T/2)); }
  return netBake(st); }
// G: where to build. casePos [x,z,ry]. aps: [[x,z,ry,h,port],...]. Returns {set(u)}: u 0..1 runs the leads out one by one and brings each access point up.
function netEventKit(G,casePos,aps,R=1.7){ const cs=netEventCase(); cs.position.set(casePos[0],0,casePos[1]); cs.rotation.y=casePos[2]; G.add(cs);
  const lid=netCaseLid(); lid.position.set(casePos[0]-Math.cos(casePos[2])*.37-Math.sin(casePos[2])*.02,.105,casePos[1]+Math.sin(casePos[2])*.37-Math.cos(casePos[2])*.02); lid.rotation.set(0,casePos[2]+Q,0); lid.rotateX(.2); G.add(lid);
  G.updateWorldMatrix(true,true); const sw=cs.userData.sw, rec=sw.userData.rec, toG=(o,p)=>G.worldToLocal(o.localToWorld(V(...p))), items=[];
  // the switch sits baked inside the case: work out its ports from the case's own frame
  const swp=(k)=>{ const p=sw.userData.ports[k]; return [sw.position.x+p.x,sw.position.y+p.y,sw.position.z]; };
  aps.forEach(([x,z,ry,h,port],i)=>{ const s=netApStand(h); s.position.set(x,0,z); s.rotation.y=ry; G.add(s); s.updateWorldMatrix(true,false); const cov=netCoverage(grp(G,x,0,z),R,4,i*.31);
    const a=swp(port), pts=[toG(cs,[a[0],a[1],a[2]+.002]),toG(cs,[a[0],a[1],a[2]+.05]),toG(cs,[a[0]+(i-1)*.03,a[1]*.55,a[2]+.15]),toG(cs,[a[0]+(i-1)*.08,.006,a[2]+.27])];
    const sl=netStandLead(h).map(p=>toG(s,p)), e=sl[0], b=pts[3], side=V(e.x-b.x,0,e.z-b.z), len=side.length(); side.normalize(); const perp=V(-side.z,0,side.x);
    for(const f of [.25,.5,.75]) pts.push(V(b.x+side.x*len*f+perp.x*Math.sin(f*Math.PI)*.22*(i%2?1:-1),.0045,b.z+side.z*len*f+perp.z*Math.sin(f*Math.PI)*.22*(i%2?1:-1)));
    pts.push(...sl); const m=i===1?NM.leadA:NM.lead, ge=netTubeG(pts,.0036,260,6), lead=mesh(ge,m); lead.userData.live=true; G.add(lead);
    const plug=at(box(.0112,.0082,.022,m),a[0],a[1],a[2]+.011); cs.add(plug); items.push({ge,cov,plug,ring:s.userData.ring,halo:s.userData.halo,port,n:260*6*6}); });
  for(const k of [22,23]) rec.up[k]=1; { const a=swp(23), up=mesh(netTubeG([toG(cs,[a[0],a[1],a[2]+.002]),toG(cs,[a[0],a[1],a[2]+.05]),toG(cs,[a[0]+.05,a[1]*.5,a[2]+.13]),toG(cs,[a[0]+.2,.006,a[2]+.16]),toG(cs,[a[0]+.34,.0045,a[2]-.1]),toG(cs,[a[0]+.36,.0045,a[2]-.6]),toG(cs,[a[0]+.2,.0045,a[2]-1.1])],.0036,80,6),NM.rackIn); G.add(up); cs.add(at(box(.0112,.0082,.022,NM.rackIn),a[0],a[1],a[2]+.011)); }
  const cOn=new THREE.Color(0x9fd4ff), cOff=new THREE.Color(0x4a525c);
  const set=(u)=>{ items.forEach((it,i)=>{ const n=items.length, v=clamp((u*(n+.6)-i*.8)/1.6), on=sstep(.92,1,v); it.ge.setDrawRange(0,Math.floor(v*260)*36); it.plug.visible=v>.001; it.cov.on=on; it.ring.material.color.lerpColors(cOff,cOn,on); it.halo.material.opacity=.2*on; rec.up[it.port]=on>.5?(i===1?2:1):0; }); };
  set(1); return {set,cs}; }

/* ---------- computers ---------- */
function netRotor(R,th,n,m){ const g=new THREE.Group(); g.add(rot(cyl(R*.34,R*.36,th*.95,m,24),Q));
  for(let k=0;k<n;k++){ const ge=new THREE.PlaneGeometry(1,1,5,6), P=ge.attributes.position; for(let i=0;i<P.count;i++){ const u=P.getX(i), v=P.getY(i)+.5, r=lerp(R*.33,R,v), a=k/n*Math.PI*2+u*lerp(1.05,.78,v)*(Math.PI*2/n)+v*.6; P.setXYZ(i,Math.cos(a)*r,Math.sin(a)*r,-u*th*.8*lerp(1,.5,v)); } ge.computeVertexNormals(); g.add(mesh(ge,m,false)); }
  const b=netBake(g), hold=new THREE.Group(); hold.userData.live=true; hold.add(b); return {hold,rotor:b}; }
function netFan(s=.12,th=.025,sp=5){ const g=new THREE.Group(), fr=new THREE.Shape(), h=s/2, r=.012; fr.moveTo(-h+r,-h); fr.lineTo(h-r,-h); fr.quadraticCurveTo(h,-h,h,-h+r); fr.lineTo(h,h-r); fr.quadraticCurveTo(h,h,h-r,h); fr.lineTo(-h+r,h); fr.quadraticCurveTo(-h,h,-h,h-r); fr.lineTo(-h,-h+r); fr.quadraticCurveTo(-h,-h,-h+r,-h);
  const hole=new THREE.Path(); hole.absarc(0,0,s*.47,0,Math.PI*2,true); fr.holes.push(hole);
  const ge=new THREE.ExtrudeGeometry(fr,{depth:th-.004,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:2,curveSegments:36}); ge.translate(0,0,-th/2+.002); g.add(mesh(ge,NM.fanF));
  g.add(at(rot(cyl(s*.15,s*.15,.004,NM.fanF,20),Q),0,0,-th/2+.003)); for(let k=0;k<4;k++){ const a=k*Q+.5, b=nrb(s*.34,.004,.003,NM.fanF,.001); b.rotation.z=a; b.position.set(Math.cos(a)*s*.31,Math.sin(a)*s*.31,-th/2+.003); g.add(b); }
  for(const sx of [-1,1]) for(const sy of [-1,1]) g.add(at(rot(cyl(.0032,.0032,th+.0012,NM.screw,8),Q),sx*(h-.0075),sy*(h-.0075),0));
  const ro=netRotor(s*.455,th*.72,9,NM.blade); g.add(ro.hold); g.add(at(rot(cyl(s*.1,s*.1,.0008,M.alu,20),Q),0,0,th*.36)); netSpin.push([ro.rotor,sp]); netTicker(); return g; }
function netPcbMat(){ return netFaces.pcb||(netFaces.pcb=std(0xffffff,.6,.25,{envMapIntensity:.7,map:ctex(640,760,(g,w,h)=>{ const X=u=>u/.244*w, Y=v=>(1-v/.29)*h; g.fillStyle='#121417'; g.fillRect(0,0,w,h);
    g.strokeStyle='rgba(120,130,150,.16)'; g.lineWidth=1; for(let i=0;i<150;i++){ let x=Math.random()*w, y=Math.random()*h; g.beginPath(); g.moveTo(x,y); for(let k=0;k<4;k++){ const d=20+Math.random()*90, a=(Math.random()*8|0)*Math.PI/4; x+=Math.cos(a)*d; y+=Math.sin(a)*d; g.lineTo(x,y); } g.stroke(); }
    for(let i=0;i<260;i++){ const x=Math.random()*w, y=Math.random()*h, s=2+Math.random()*5; g.fillStyle=Math.random()<.3?'#8d8a83':(Math.random()<.5?'#2c2e33':'#070809'); g.fillRect(x,y,s*(Math.random()<.5?2:1),s); }
    for(let i=0;i<40;i++){ g.fillStyle='#c9c6be'; g.beginPath(); g.arc(Math.random()*w,Math.random()*h,2.6,0,7); g.fill(); }
    // socket, memory slots, expansion slots, headers, silk screen
    g.fillStyle='#24262a'; netRR(g,X(.092)-58,Y(.205)-58,116,116,6); g.fillStyle='#090a0b'; for(let k=0;k<4;k++){ g.fillRect(X(.169+k*.0095)-5,Y(.272),10,Y(.132)-Y(.272)); } g.fillStyle='#3a3c41'; for(let k=0;k<4;k++){ g.fillRect(X(.169+k*.0095)-7,Y(.272)-8,14,8); g.fillRect(X(.169+k*.0095)-7,Y(.132),14,8); }
    for(const v of [.108,.066,.024]){ g.fillStyle='#090a0b'; netRR(g,X(.03),Y(v)-7,X(.125)-X(.03),14,3); g.fillStyle='rgba(214,170,90,.55)'; for(let x=X(.034);x<X(.122);x+=4) g.fillRect(x,Y(v)-3,1.6,6); g.fillStyle='#8d8a83'; g.fillRect(X(.125)+2,Y(v)-9,10,18); }
    g.fillStyle='rgba(214,210,200,.5)'; g.font='600 9px "Geist Mono", monospace'; ['CPU_FAN','DIMM_A1 A2 B1 B2','PCIE_1','PCIE_2','M2_1','SYS_FAN 1','ATX_PWR','F_PANEL','USB_E1'].forEach((t,i)=>g.fillText(t,[X(.06),X(.16),X(.03),X(.03),X(.06),X(.2),X(.205),X(.19),X(.19)][i],[Y(.262),Y(.124),Y(.118),Y(.076),Y(.092),Y(.28),Y(.2),Y(.012),Y(.03)][i]));
    g.strokeStyle='rgba(214,210,200,.35)'; g.strokeRect(X(.004),Y(.286),X(.24)-X(.004),Y(.004)-Y(.286)); for(const [u,v] of [[.008,.282],[.236,.282],[.008,.008],[.236,.008],[.12,.282],[.12,.14],[.236,.14]]){ g.fillStyle='#c9c6be'; g.beginPath(); g.arc(X(u),Y(v),6,0,7); g.fill(); g.fillStyle='#090a0b'; g.beginPath(); g.arc(X(u),Y(v),3.2,0,7); g.fill(); } })})); }
function netFinT(){ return netFinT.t||(netFinT.t=ctex(256,64,(g,w,h)=>{ g.fillStyle='#0b0c0e'; g.fillRect(0,0,w,h); for(let x=0;x<w;x+=4){ g.fillStyle='#8f9094'; g.fillRect(x,0,1.6,h); } g.fillStyle='#b5804c'; for(const y of [14,32,50]) g.fillRect(0,y-3,w,6); })); }
// a mid-tower: steel shell, mesh front over three intake fans, glass side. Build frame: glass faces +z, front faces +x. Returns the group; userData.panel is the glass side.
function netTower(){ const L=.46,H=.47,T=.225,Y0=.018,YM=(H+Y0)/2, g=new THREE.Group(), st=new THREE.Group(), sh=NM.rack;
  for(const sx of [-1,1]){ st.add(at(nrb(.036,.018,T-.03,M.black,.006),sx*(L/2-.07),.009,0)); st.add(at(nrb(.03,.004,T-.04,M.rubber,.002),sx*(L/2-.07),.0015,0)); }
  st.add(at(nrb(L,.012,T,sh,.004),0,Y0+.006,0)); st.add(at(nrb(L,.012,T,sh,.004),0,H-.006,0)); st.add(at(nrb(.012,H-Y0,T,sh,.004),-L/2+.006,YM,0)); st.add(at(nrb(.008,H-Y0,T,sh,.003),L/2-.004,YM,0));
  st.add(at(nrb(L-.004,H-Y0-.006,.006,M.shell,.002),0,YM,-T/2+.003)); st.add(at(box(L-.03,H-Y0-.03,.002,NM.rackIn),0,YM,-T/2+.03));
  for(const sz of [-1,1]) st.add(at(nrb(.016,H-Y0-.02,.012,sh,.004),L/2+.004,YM,sz*(T/2-.006))); for(const y of [Y0+.016,H-.016]) st.add(at(nrb(.016,.012,T,sh,.004),L/2+.004,y,0));
  { const FW=T-.026, FH=H-Y0-.046, fm=curved(FW,FH,.007,grilleMat('netpcf',FW,FH,[[.5,.17,.056],[.5,.5,.056],[.5,.83,.056]])); fm.rotation.y=Q; fm.position.set(L/2+.0035,YM,0); st.add(fm); }
  st.add(at(rot(mesh(new THREE.PlaneGeometry(.3,T-.06),grilleMat('netpct',.3,T-.06,[[.27,.5,.058],[.73,.5,.058]]),false),-Q),-.04,H+.0006,0)); for(const sz of [-1,1]) st.add(at(nrb(.31,.003,.006,M.black,.001),-.04,H+.001,sz*(T/2-.028)));
  // front edge of the roof: power button with a lit ring, two USB sockets, a headset jack
  st.add(at(cyl(.0078,.0078,.003,M.alu,24),L/2-.04,H+.0015,.06)); st.add(at(rot(mesh(new THREE.RingGeometry(.0086,.0108,32),glow(AMBER),false),-Q),L/2-.04,H+.0008,.06));
  for(const z of [.022,0]){ st.add(at(box(.0135,.0012,.0058,NM.dark),L/2-.04,H+.0004,z)); st.add(at(box(.011,.0014,.002,M.steel),L/2-.04,H+.0004,z)); } st.add(at(cyl(.0034,.0034,.0012,NM.dark,12),L/2-.04,H+.0005,-.022)); st.add(at(cyl(.0045,.0045,.0008,M.steel,14),L/2-.04,H+.0003,-.022));
  // power supply shroud along the floor
  st.add(at(nrb(.33,.104,T-.014,sh,.004),-L/2+.012+.165,Y0+.012+.052,-.001)); for(let k=0;k<12;k++) st.add(at(nrb(.0045,.052,.001,NM.dark,.0005),-L/2+.06+k*.0105,Y0+.066,T/2-.0075)); st.add(at(nrb(.06,.011,.0016,M.alu,.0008),-L/2+.27,Y0+.035,T/2-.0074));
  // motherboard
  const BX=-L/2+.014, BW=.244, BY=Y0+.128, BH=.29, BZ=-T/2+.036, CX=BX+.092, CY=BY+.205;
  st.add(at(box(BW,BH,.002,NM.dark),BX+BW/2,BY+BH/2,BZ)); st.add(at(mesh(new THREE.PlaneGeometry(BW,BH),netPcbMat(),false),BX+BW/2,BY+BH/2,BZ+.0012));
  st.add(at(nrb(.05,.16,.046,sh,.007),BX+.03,BY+BH-.09,BZ+.024)); st.add(at(nrb(.003,.12,.002,M.alu,.001),BX+.048,BY+BH-.09,BZ+.0475));
  for(let k=0;k<7;k++) st.add(at(nrb(.078,.0032,.022,M.satin,.001),CX+.004,BY+BH-.008-k*.0046,BZ+.013));
  st.add(at(nrb(.062,.056,.012,M.satin,.003),BX+.196,BY+.06,BZ+.008)); st.add(at(nrb(.03,.006,.001,M.alu,.0005),BX+.196,BY+.045,BZ+.0145)); st.add(at(nrb(.09,.024,.005,M.satin,.002),BX+.08,BY+.087,BZ+.0045));
  for(let k=0;k<4;k++){ st.add(at(nrb(.0064,.134,.036,M.shell2,.0015),BX+.169+k*.0095,BY+.202,BZ+.021)); st.add(at(nrb(.0046,.128,.006,glow(AMBER),.002),BX+.169+k*.0095,BY+.202,BZ+.0415)); }
  // tower cooler: copper base, heat pipes, a stack of fins under a brushed cap, fan clipped to the front
  { const z1=BZ+.046, z2=BZ+.166, N=30; st.add(at(nrb(.044,.044,.013,NM.nickel,.003),CX,CY,BZ+.0085));
    for(const sx of [-1,1]) for(let k=0;k<4;k++){ const y=CY+(k-1.5)*.024; st.add(mesh(netTubeG([[CX+sx*.004,CY+(k-1.5)*.008,BZ+.016],[CX+sx*.012,y*.5+CY*.5,BZ+.03],[CX+sx*.015,y,BZ+.046],[CX+sx*.015,y,z2+.006]],.003,16,8),NM.nickel)); }
    const fins=new THREE.InstancedMesh(new THREE.BoxGeometry(.05,.124,.0005),M.alu,N), mt=new THREE.Matrix4(); for(let k=0;k<N;k++){ mt.makeTranslation(CX,CY,lerp(z1,z2,k/(N-1))); fins.setMatrixAt(k,mt); } fins.castShadow=true; st.add(fins);
    st.add(at(nrb(.052,.126,.004,M.satin,.0015),CX,CY,z2+.0035)); st.add(at(nrb(.02,.005,.0008,M.alu,.0004),CX,CY-.05,z2+.0057)); for(const sx of [-1,1]) for(let k=0;k<4;k++) st.add(at(rot(cyl(.0034,.0034,.003,NM.nickel,12),Q),CX+sx*.015,CY+(k-1.5)*.024,z2+.0065));
    const f=netFan(.12,.025,7); f.rotation.y=Q; f.position.set(CX+.0385,CY,(z1+z2)/2); st.add(f);
    const rf=netFan(.12,.025,6); rf.rotation.y=Q; rf.position.set(-L/2+.0255,CY,BZ+.11); st.add(rf); }
  // main power: sleeved leads from the board edge back through a grommet in the tray
  { const bx=BX+BW-.012, y0=BY+.172; st.add(at(nrb(.012,.054,.014,NM.dark,.002),bx,y0,BZ+.008)); st.add(at(nrb(.024,.075,.003,M.rubber,.0015),bx+.05,y0,-T/2+.0325));
    for(let k=0;k<8;k++){ const y=y0+(k-3.5)*.0062; st.add(mesh(netTubeG([[bx,y,BZ+.014],[bx+.003,y,BZ+.045],[bx+.025,y,BZ+.058],[bx+.047,y,BZ+.034],[bx+.05,y,BZ-.006]],.0024,18,6),NM.lead,false)); } st.add(at(nrb(.005,.056,.009,NM.dark,.002),bx+.025,y0,BZ+.058)); }
  // graphics card, mounted upright so its three fans face the glass
  { const GX=-L/2+.172, GY=Y0+.118+.068, GZ=.022, gp=grp(st,GX,GY,GZ); gp.add(at(nrb(.296,.118,.03,NM.dark,.003),0,0,-.006)); gp.add(at(mesh(new THREE.PlaneGeometry(.286,.108),std(0xffffff,.4,.7,{map:netFinT()}),false),0,0,.0095));
    const s=new THREE.Shape(), w=.15, h=.0625, r=.01; s.moveTo(-w+r,-h); s.lineTo(w-r*3,-h); s.lineTo(w,-h+r*3); s.lineTo(w,h-r); s.quadraticCurveTo(w,h,w-r,h); s.lineTo(-w+r*3,h); s.lineTo(-w,h-r*3); s.lineTo(-w,-h+r); s.quadraticCurveTo(-w,-h,-w+r,-h);
    for(const x of [-.098,0,.098]){ const p=new THREE.Path(); p.absarc(x,0,.0452,0,Math.PI*2,true); s.holes.push(p); }
    const ge=new THREE.ExtrudeGeometry(s,{depth:.011,bevelEnabled:true,bevelSize:.0015,bevelThickness:.0015,bevelSegments:2,curveSegments:40}); ge.translate(0,0,.012); gp.add(mesh(ge,NM.gpu));
    for(const sy of [-1,1]) gp.add(at(nrb(.3,.006,.046,NM.gpu,.002),0,sy*.0595,.001)); for(const sx of [-1,1]) gp.add(at(nrb(.006,.118,.046,NM.gpu,.002),sx*.147,0,.001));
    for(const x of [-.049,.049]) gp.add(at(nrb(.004,.1,.0012,M.alu,.0005),x,0,.0252)); gp.add(at(nrb(.3,.125,.003,M.satin,.0015),0,0,-.0235)); gp.add(at(box(.0016,.122,.044,M.steel),-.1515,0,-.002)); gp.add(at(nrb(.042,.012,.016,NM.dark,.002),.094,.066,.002));
    for(const x of [-.098,0,.098]){ const ro=netRotor(.0432,.01,11,NM.blade); ro.hold.position.set(x,0,.017); gp.add(ro.hold); netSpin.push([ro.rotor,x?-9:9]); gp.add(at(rot(cyl(.0105,.0105,.0008,M.alu,20),Q),x,0,.0222)); }
    st.add(at(nrb(.11,.003,GZ-BZ,NM.rackIn,.001),GX-.03,GY-.064,(GZ+BZ)/2-.01)); for(const x of [-.1,.1]) st.add(at(cyl(.005,.005,GY-.0625-(Y0+.116),M.satin,12),GX+x,(GY-.0625+Y0+.116)/2,GZ));
    const xg=BX+BW+.03; st.add(at(nrb(.036,.05,.003,M.rubber,.0015),xg+.012,GY+.1,-T/2+.0325));
    for(let k=0;k<8;k++){ const r2=k>3?1:0, kk=k%4, x0=GX+.082+kk*.0062, z=GZ+.002-.004+r2*.0078, top=GY+.105+r2*.008; st.add(mesh(netTubeG([[x0,GY+.07,z],[x0,GY+.092,z],[x0+.004,top+.004,z-.012],[xg+kk*.0062-.01,top+.008,(z+BZ)/2],[xg+kk*.0062,top-.002-r2*.008+kk*.001,BZ+.02],[xg+kk*.0062,top-.004-r2*.008+kk*.001,BZ-.006]],.0024,20,6),NM.lead,false)); }
    st.add(at(nrb(.03,.004,.02,NM.dark,.0015),GX+.0913,GY+.088,GZ+.002)); }
  // intake fans behind the front mesh
  for(let k=0;k<3;k++){ const f=netFan(.12,.025,k%2?-5:5); f.rotation.y=-Q; f.position.set(L/2-.022,Y0+.014+.07+k*.136,0); st.add(f); }
  // rear: i/o plate, exhaust grille, slot covers, supply
  st.add(at(box(.001,.156,.044,M.steel),-L/2-.0004,BY+BH-.09,BZ+.024)); st.add(at(rot(mesh(new THREE.PlaneGeometry(.118,.118),grilleMat('netpcr',.118,.118,[[.5,.5,.056]]),false),0,-Q,0),-L/2-.0007,CY,BZ+.11)); for(let k=0;k<7;k++) st.add(at(box(.001,.0125,.11,M.steel),-L/2-.0004,BY+.012+k*.0203,BZ+.07)); st.add(at(rot(mesh(new THREE.PlaneGeometry(.15,.086),grilleMat('netpcp',.15,.086,[[.6,.5,.04]]),false),0,-Q,0),-L/2-.0007,Y0+.064,0));
  // the glass side: tinted pane, black border, four thumbscrews
  const pg=new THREE.Group(), PW=L-.01, PH=H-Y0-.012; pg.add(mesh(new RoundedBoxGeometry(PW,PH,.004,2,.0015),NM.glass,false)); for(const sy of [-1,1]) pg.add(at(box(PW-.002,.016,.0006,NM.dark),0,sy*(PH/2-.008),-.0024)); for(const sx of [-1,1]) pg.add(at(box(.012,PH-.002,.0006,NM.dark),sx*(PW/2-.006),0,-.0024));
  for(const sx of [-1,1]) for(const sy of [-1,1]){ pg.add(at(rot(cyl(.007,.007,.006,M.steel,18),Q),sx*(PW/2-.014),sy*(PH/2-.014),.004)); pg.add(at(rot(cyl(.0045,.0045,.0065,NM.screw,12),Q),sx*(PW/2-.014),sy*(PH/2-.014),.0042)); }
  const panel=netBake(pg); panel.position.set(0,YM,T/2-.002); panel.userData.live=true; panel.userData.home=panel.position.clone();
  g.add(netBake(st)); g.add(panel); g.userData={panel,L,H,T}; return g; }

function netOak(){ return netOak.m||(netOak.m=std(0xffffff,.5,0,{envMapIntensity:.5,map:ctex(1024,512,(g,w,h)=>{ g.fillStyle='#c9a77b'; g.fillRect(0,0,w,h); for(let i=0;i<520;i++){ const y=Math.random()*h, a=.04+Math.random()*.13; g.strokeStyle=Math.random()<.75?`rgba(110,72,36,${a})`:`rgba(255,236,205,${a})`; g.lineWidth=.6+Math.random()*1.8; g.beginPath(); g.moveTo(0,y); g.bezierCurveTo(w*.3,y+(Math.random()-.5)*14,w*.7,y+(Math.random()-.5)*14,w,y+(Math.random()-.5)*8); g.stroke(); } })})); }
function netDesk(W=1.5,D=.72,H=.74){ const st=new THREE.Group(); st.add(at(rbox(W,.026,D,netOak(),.007),0,H-.013,0));
  for(const sx of [-1,1]){ const x=sx*(W/2-.17); st.add(at(rbox(.078,.022,D-.07,NM.rack,.007),x,.021,0)); for(const sz of [-1,1]) st.add(at(cyl(.018,.02,.01,M.rubber,14),x,.005,sz*(D/2-.07)));
    st.add(at(rbox(.082,.34,.052,NM.rack,.007),x,.2,-.03)); st.add(at(rbox(.068,H-.4,.04,M.satin,.006),x,.36+(H-.4)/2,-.03)); st.add(at(nrb(.05,.014,D-.14,NM.rack,.004),x,H-.033,0)); }
  st.add(at(nrb(W-.34,.045,.022,NM.rack,.005),0,H-.062,-.03)); st.add(at(nrb(W-.6,.004,.13,NM.rack,.002),0,H-.14,-D/2+.11)); for(const sz of [-1,1]) st.add(at(nrb(W-.6,.05,.004,NM.rack,.002),0,H-.116,-D/2+.11+sz*.065));
  st.add(at(cyl(.03,.03,.003,NM.dark,24),0,H+.0012,-D/2+.09)); return netBake(st); }
function netShowScreen(){ const t=ctex(1024,600,()=>{}), g=t.userData.g, W=1024, H=600; const draw=(tt)=>{ g.fillStyle='#0d0f12'; g.fillRect(0,0,W,H); g.fillStyle='#16191d'; g.fillRect(0,0,W,38); g.fillRect(0,38,230,H); g.fillRect(804,38,220,H);
    g.font='600 15px "Geist Mono", monospace'; g.textAlign='left'; g.fillStyle='#dfe6ea'; g.fillText('SHOW · MAIN',52,25); g.fillStyle='#7d8791'; g.fillText('CUES',330,25); g.fillText('OUTPUTS',410,25); g.fillText('NETWORK',520,25); g.fillStyle='#E8892D'; g.beginPath(); g.arc(24,19,7,0,7); g.fill(); g.fillStyle='#9fc08f'; g.fillText('● ALL LINKS UP',860,25);
    const cue=Math.floor(tt/4)%9; ['Walk-in','Doors','Opening','Keynote','Video A','Panel','Awards','Video B','Walk-out'].forEach((n,i)=>{ const y=58+i*40; g.fillStyle=i===cue?'#E8892D':(i%2?'#1b1f24':'#181b20'); netRR(g,12,y,206,33,6); g.fillStyle=i===cue?'#141414':'#c9d0d6'; g.fillText(String(i+1).padStart(2,'0')+'  '+n,24,y+22); });
    const gr=g.createLinearGradient(250,60,784,360); gr.addColorStop(0,'#23282e'); gr.addColorStop(1,'#101215'); g.fillStyle=gr; netRR(g,250,58,534,300,10); g.strokeStyle='#E8892D'; g.lineWidth=3; for(let k=0;k<5;k++){ g.globalAlpha=.25+k*.15; g.beginPath(); g.arc(517,208,36+k*26+Math.sin(tt*.8+k)*5,-.9+k*.2+tt*.15,1.6+k*.2+tt*.15); g.stroke(); } g.globalAlpha=1; g.fillStyle='#7d8791'; g.fillText('PROGRAM',266,84);
    for(let r=0;r<4;r++){ g.fillStyle='#14171b'; g.fillRect(250,378+r*50,534,42); for(let c=0;c<4;c++){ const x=258+((c*137+r*61)%480), wd=60+((c*53+r*29)%90); g.fillStyle=['#3d5a73','#6d5a3a','#4c6a4a','#5a4a6a'][(c+r)%4]; netRR(g,x,384+r*50,Math.min(wd,776-x),30,5); } } const px=250+((tt*22)%534); g.fillStyle='#E8892D'; g.fillRect(px,372,2,206);
    g.fillStyle='#7d8791'; g.fillText('OUTPUTS',820,68); for(let i=0;i<6;i++){ const v=.3+.6*Math.abs(Math.sin(tt*1.7+i*1.3)*Math.cos(tt*.6+i)); g.fillStyle='#1d2126'; g.fillRect(822+i*31,90,20,210); g.fillStyle=v>.8?'#E8892D':'#9fc08f'; g.fillRect(822+i*31,300-v*210,20,v*210); } for(let i=0;i<5;i++){ g.fillStyle='#181b20'; netRR(g,818,326+i*50,192,40,6); g.fillStyle='#9fc08f'; g.beginPath(); g.arc(836,346+i*50,5,0,7); g.fill(); g.fillStyle='#c9d0d6'; g.fillText(['SCREEN L','SCREEN R','CONFIDENCE','STREAM','RECORD'][i],852,351+i*50); } t.needsUpdate=true; }; draw(0); return {t,draw}; }
function netMonitor(){ const g=new THREE.Group(), st=new THREE.Group(), W=.614, H=.358; st.add(at(nrb(.25,.008,.2,M.alu,.004),0,.004,-.04)); const nk=at(rbox(.058,.33,.014,M.alu,.006),0,.168,-.1); nk.rotation.x=.1; st.add(nk); st.add(at(rot(cyl(.02,.02,.07,M.satin,20),0,0,Q),0,.3,-.075));
  const hd=grp(st,0,.345,-.045); hd.rotation.x=-.07; hd.add(at(nrb(W+.012,H+.014,.011,NM.rack,.005),0,0,-.0055)); hd.add(at(rbox(.36,.2,.03,NM.rack,.014),0,-.01,-.02)); hd.add(at(nrb(.1,.1,.012,M.satin,.004),0,-.02,-.036)); hd.add(at(box(.012,.0012,.0006,glow(0xdfe9ff)),W/2-.03,-H/2-.003,.0004));
  const sc=netShowScreen(), p=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:sc.t,toneMapped:false})); p.position.z=.0006; hd.add(p);
  g.add(netBake(st)); g.userData.draw=sc.draw; return g; }
function netKeyboard(){ const g=new THREE.Group(), W=.33, D=.118; g.add(at(nrb(W,.012,D,M.alu,.005),0,.007,0)); g.add(at(nrb(W-.012,.003,D-.012,NM.dark,.002),0,.0128,0));
  const rows=[[14,1],[14,1],[13,1.08],[12,1.17],[9,1]], keys=new THREE.InstancedMesh(new RoundedBoxGeometry(.0168,.006,.0168,2,.002),std(0xffffff,.5,.1),80), mt=new THREE.Matrix4(), c0=new THREE.Color(0x2a2b2f), c1=new THREE.Color(AMBER), sc=V(1,1,1), qn=new THREE.Quaternion(); let n=0;
  rows.forEach(([cnt,wd],r)=>{ const z=-D/2+.018+r*.0205; if(r<4){ const pitch=(W-.03)/cnt; for(let c=0;c<cnt;c++){ mt.compose(V(-W/2+.015+pitch*(c+.5),.0165,z),qn,sc.set(pitch/.0192,1,1)); keys.setMatrixAt(n,mt); keys.setColorAt(n,r===0&&c===0?c1:c0); n++; } }
    else { const ws=[1.25,1.25,1.25,6,1.25,1.25,1,1,1], tot=ws.reduce((a,b)=>a+b,0), u=(W-.03)/tot; let x=-W/2+.015; for(const wk of ws){ mt.compose(V(x+wk*u/2,.0165,z),qn,sc.set((wk*u-.0024)/.0168,1,1)); keys.setMatrixAt(n,mt); keys.setColorAt(n,c0); n++; x+=wk*u; } } });
  keys.count=n; keys.castShadow=true; g.add(keys); for(const sx of [-1,1]) g.add(at(nrb(.03,.004,.012,M.rubber,.002),sx*(W/2-.03),.002,-D/2+.012)); return g; }
function netMouse(){ const g=new THREE.Group(), b=sph(.5,NM.rack,32,20); b.scale.set(.062,.07,.108); b.position.y=.006; g.add(b); g.add(at(nrb(.0008,.03,.05,NM.dark,.0003),0,.03,-.03)); g.add(at(rot(cyl(.0085,.0085,.006,M.rubber,18),0,0,Q),0,.0365,-.03)); g.add(at(box(.07,.02,.12,NM.rackIn),0,-.0101,0)); g.traverse(o=>{ if(o.isMesh&&o.geometry.type==='SphereGeometry'){ o.geometry=o.geometry.clone(); const P=o.geometry.attributes.position; for(let i=0;i<P.count;i++) if(P.getY(i)<-.086) P.setY(i,-.086); } }); return g; }
// the rented workstation: sit down and it is ready. Returns the group; userData.draw(t) redraws the screen
function netWorkstation(){ const g=new THREE.Group(), H=.74; g.add(netDesk(1.5,.72,H)); const mo=netMonitor(); mo.position.set(-.16,H,-.14); mo.rotation.y=.06; g.add(mo);
  const st=new THREE.Group(); st.add(at(nrb(.78,.003,.3,NM.foam,.0015),-.14,H+.0015,.17)); const kb=netKeyboard(); kb.position.set(-.22,H+.003,.17); const ms=netMouse(); ms.position.set(.12,H+.003,.18); ms.rotation.y=-.12;
  st.add(mesh(netTubeG([[-.16,H+.2,-.2],[-.15,H+.08,-.24],[-.06,H+.004,-.27],[0,H-.01,-.27]],.003,20,6),NM.rackIn)); st.add(mesh(netTubeG([[.44,H+.1,-.29],[.3,H+.02,-.3],[.1,H+.006,-.28],[0,H-.01,-.27]],.0035,20,6),NM.rackIn));
  g.add(netBake(st)); g.add(kb); g.add(netBake(ms).translateX(0)); const tw=netTower(); tw.rotation.y=-Q; tw.position.set(.53,H,-.06); g.add(tw); g.userData={draw:mo.userData.draw,tower:tw}; return g; }

/* what stands for Networks on the homepage: one access point on its stand, wired to the switch in its case */
HERO.networks=(G)=>{ const kit=netEventKit(G,[.62,.5,-.3],[[-.6,-.1,.25,1.7,4]],1.25); kit.set(1); };

/* ===== networks & computers page: where things stand and where the camera stops ===== */
const NG=12; // sets sit close so the next slides in as the last one leaves
// opening: one access point on its stand, wired to a switch in its case. The range stands beside it and steps aside after the range shot
const nI0=grp(scene,0,0,0), nRange=grp(nI0,0,0,0);
const nHero=netEventKit(nI0,[.62,.5,-.3],[[-.6,-.1,.25,1.7,4]],1.25);
const nMid=grp(nRange,4.4,0,-1.0), nMidKit=netEventKit(nMid,[0,.7,0],[[-1.3,-.3,.3,1.7,2],[0,-.9,0,1.7,4],[1.3,-.3,-.3,1.7,6]],1.3);
{ const r=netRack(30); r.position.set(8.4,0,-1.1); r.rotation.y=-.35; nRange.add(r); }
// 01 event Wi-Fi: the case opens out to three access points, coverage spreading over the floor
const nI1=grp(scene,NG,0,0), nEv=netEventKit(nI1,[0,1.1,0],[[-1.6,-.2,.35,1.75,2],[0,-.9,0,1.75,4],[1.6,-.2,-.35,1.75,6]],1.6);
// 02 permanent installs: the rack, its glass door swinging open and the storage drawer sliding out
const nI2=grp(scene,2*NG,0,0), nRk=netRack(30); nRk.rotation.y=-.42; nI2.add(nRk);
const nDoor=nRk.userData.door, nSlide=nRk.userData.slide, nS0=nSlide.position.clone();
// 03 computer rental: a workstation, the screen coming on
const nI3=grp(scene,3*NG,0,0), nWs=netWorkstation(); nWs.rotation.y=-.3; nI3.add(nWs);
// 04 custom PCs: a tower on a plinth, its side panel lifting away
const nI4=grp(scene,4*NG,0,0), nTw=netTower(); nTw.rotation.y=-.6; nTw.position.y=.47; nI4.add(nTw);
nI4.add(at(rbox(.62,.45,.42,M.satin,.012),0,.225,0)); const nPan=nTw.userData.panel, nP0=nPan.position.clone();
const nIs=[[nI0,.5],[nI1,2],[nI2,3],[nI3,4],[nI4,5.5]];
updaters.push((t,x)=>{ for(const [g,c] of nIs) g.visible=Math.abs(x-c)<(c===.5||c===5.5?1.6:.9);
  const v=sstep(.25,.8,x)*(1-sstep(1.3,1.62,x)); nRange.scale.setScalar(Math.max(.001,v)); nRange.visible=v>.001;
  nEv.set(sstep(1.5,2.0,x));
  const o=sstep(2.5,2.95,x); nDoor.rotation.y=-1.75*o; nSlide.position.z=nS0.z+.42*sstep(2.75,3.0,x);
  if(nI3.visible && nWs.userData.draw) nWs.userData.draw(t);
  const p=sstep(4.5,4.95,x); nPan.position.set(nP0.x,nP0.y+.18*p,nP0.z+.36*p); nPan.rotation.x=.25*p; });
PAGE.keys=(narrow,K,R)=>[
  narrow? R([1.8,1.9,8.8],[-.1,.75,.1],34) : K([1.7,1.6,5.6],[-.55,1.0,.1],30),                       // hero: one access point and its switch
  narrow? R([4.2,6.5,34],[4.2,.6,-1.0],34) : K([4.0,3.6,23.5],[4.0,1.15,-1.0],30,-.2),                  // the range
  narrow? R([NG+.2,3.6,15],[NG,.3,0],34) : K([NG-.9,3.0,11.2],[NG-.3,.9,0],30),                        // 01 event Wi-Fi
  narrow? R([2*NG+1.6,1.7,7.6],[2*NG-.2,.55,0],34) : K([2*NG+1.2,1.8,5.6],[2*NG-.25,1.0,0],30),               // 02 the rack opens
  narrow? R([3*NG+1.2,1.7,5.8],[3*NG,.45,-.1],34) : K([3*NG+1.0,1.8,4.6],[3*NG-.15,.85,-.1],30),        // 03 a workstation
  narrow? R([4*NG+1.4,1.5,4.6],[4*NG-.1,.45,0],34) : K([4*NG+1.2,1.6,4.3],[4*NG-.2,.78,0],30),                   // 04 a custom PC opens
  K([4*NG+1.4,2.2,5.6],[4*NG,.9,0],30,0,.25) ];

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
  renderer.render(scene,camera); }
document.fonts&&document.fonts.ready.then(()=>{});
frame();
