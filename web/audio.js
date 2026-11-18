
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

/* ===== audio models: definitions only, nothing is added to the scene here ===== */
/* ---------- 01 · line array ---------- */
const CW=1.16, CH=.36, CD=.66, CB=.76;
function cabinet(){ const g=new THREE.Group();
  const sh=new THREE.Shape(); sh.moveTo(-CW/2,0); sh.lineTo(CW/2,0); sh.lineTo(CB/2,CD); sh.lineTo(-CB/2,CD); sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:CH-.03,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:3,curveSegments:2}); geo.rotateX(-Q); geo.translate(0,-CH+.015,-.016);
  g.add(mesh(geo,M.shell));
  g.add(at(box(CW-.06,CH-.05,.004,M.baffle),0,-CH/2,.001));
  for(const sx of [-1,1]) g.add(at(driver(.118),sx*.36,-CH/2,.004));
  // centre waveguide: a vertical slot between two flares
  g.add(at(rbox(.22,CH-.07,.012,M.horn,.006),0,-CH/2,.006)); g.add(at(box(.022,CH-.1,.012,M.rubber),0,-CH/2,.014));
  for(const sx of [-1,1]){ g.add(at(rot(rbox(.1,CH-.085,.008,M.horn,.003),0,sx*.42,0),sx*.058,-CH/2,.024)); g.add(at(rbox(.03,CH-.14,.006,M.rubber,.003),sx*(CW/2-.075),-CH/2,.003)); }
  screws(g,[[-CW/2+.05,-.04],[CW/2-.05,-.04],[-CW/2+.05,-CH+.04],[CW/2-.05,-CH+.04],[-.13,-.035],[.13,-.035],[-.13,-CH+.035],[.13,-CH+.035]],.004,.006);
  const grille=new THREE.Group(), GW=CW-.035, GH=CH-.05; grille.add(curved(GW,GH,.016,grilleMat('la',GW,GH,[[.19,.5,.13],[.81,.5,.13],[.5,.5,.09,GH]])));
  for(const sy of [-1,1]) grille.add(at(rbox(GW+.012,.013,.022,M.shell2,.004),0,sy*(GH/2+.004),.006)); for(const sx of [-1,1]) grille.add(at(rbox(.012,GH+.02,.012,M.shell2,.004),sx*(GW/2+.003),0,.002));
  grille.add(at(rbox(.085,.017,.004,M.alu,.002),0,-GH/2+.03,.0175)); grille.add(at(box(.01,.005,.003,glow(AMBER)),GW/2-.05,-GH/2+.026,.006)); grille.position.set(0,-CH/2,.034); g.add(grille);
  // rigging: a steel frame down each flank with quick-release pins
  const ang=Math.atan((CW-CB)/2/CD);
  for(const sx of [-1,1]){ const side=grp(g,sx*(CW/2-.004),-CH/2,0); side.rotation.y=-sx*ang;
    side.add(at(rbox(.016,CH*.94,.2,M.steel,.004),sx*.01,0,-.13)); side.add(at(rbox(.016,CH*.94,.14,M.steel,.004),sx*.01,0,-CD+.11));
    side.add(at(rbox(.012,.05,CD-.3,M.steel,.003),sx*.01,CH*.3,-CD/2));
    for(const [py,pz] of [[.11,-.09],[-.11,-.09],[.1,-CD+.1]]){ side.add(at(rot(cyl(.011,.011,.05,M.alu,14),0,0,Q),sx*.03,py,pz)); side.add(at(sph(.016,M.amber,12,10),sx*.058,py,pz)); }
    side.add(at(rbox(.02,.11,.2,M.rubber,.008),sx*.004,-.02,-CD/2+.02)); }
  return {g,grille}; }
function lineArray(n){ const root=new THREE.Group(), parts=[];
  // flying frame
  const fr=grp(root,0,.02,0); for(const sx of [-1,1]) fr.add(at(rbox(.06,.09,CD+.24,M.steel,.012),sx*.4,.06,-CD/2)); for(const z of [.08,-CD/2,-CD-.08]) fr.add(at(rbox(.92,.07,.06,M.steel,.012),0,.06,z));
  fr.add(at(rbox(.05,.14,CD+.3,M.satin,.01),0,.13,-CD/2)); for(let k=0;k<9;k++) fr.add(at(rot(cyl(.016,.016,.054,M.black,12),0,0,Q),0,.15,.1-k*(CD+.2)/8));
  for(const z of [-.12,-CD+.12]){ fr.add(at(mesh(new THREE.TorusGeometry(.045,.012,10,24),M.steel),0,.24,z)); const ch=cyl(.011,.011,26,M.steel,8); ch.position.set(0,13.28,z); fr.add(ch);
    const hoist=grp(fr,0,2.3,z); hoist.add(rbox(.2,.42,.2,M.shell2,.03)); hoist.add(at(rbox(.22,.05,.22,M.amber,.01),0,.12,0)); hoist.add(at(cyl(.03,.02,.1,M.steel,12),0,-.25,0)); }
  let parent=root; const ang=[]; for(let i=0;i<n;i++) ang.push(THREE.MathUtils.degToRad(i<2?.6:(i<5?1.6+(i-2)*.9:4.6+(i-5)*1.5)));
  for(let i=0;i<n;i++){ const piv=new THREE.Group(); piv.rotation.x=ang[i]; parent.add(piv); const c=cabinet(); piv.add(c.g); const next=new THREE.Group(); next.position.set(0,-CH-.014,0); piv.add(next); parts.push({grille:c.grille,next}); parent=next; }
  return {root,parts}; }
function sub(){ const W=1.16,H=.64,D=.8, g=new THREE.Group(); g.add(at(rbox(W,H,D,M.shell,.035),0,H/2,-D/2));
  g.add(at(box(W-.07,H-.07,.004,M.baffle),0,H/2,.002)); g.add(at(driver(.235,.42),0,H/2,.006)); for(const sx of [-1,1]) g.add(at(rbox(.06,H-.2,.006,M.rubber,.003),sx*.36,H/2,.004));
  // rubber bumper rails down both edges of the face, recessed bar handles on the flanks, skids underneath, stacking cups on top
  for(const sx of [-1,1]){ g.add(at(rbox(.085,H-.06,.045,M.rubber,.02),sx*(W/2-.062),H/2,.0)); 
    for(const z of [-.22,-D+.22]){ g.add(at(rbox(.012,.15,.24,M.rubber,.005),sx*(W/2+.001),H*.6,z)); g.add(at(rot(cyl(.012,.012,.2,M.steel,12),Q),sx*(W/2+.004),H*.6,z)); } }
  for(const sx of [-1,1]) for(const z of [-.12,-D+.12]){ g.add(at(rbox(.16,.03,.09,M.rubber,.012),sx*(W/2-.16),-.012,z)); g.add(at(rbox(.17,.008,.1,M.rubber,.003),sx*(W/2-.16),H+.002,z)); }
  const grille=new THREE.Group(), GW=W-.25, GH=H-.07; grille.add(curved(GW,GH,.022,grilleMat('sub',GW,GH,[[.5,.5,.27]]))); for(const sy of [-1,1]) grille.add(at(rbox(GW+.01,.014,.03,M.shell2,.005),0,sy*(GH/2+.004),.008));
  grille.add(at(rbox(.1,.02,.004,M.alu,.002),0,-GH/2+.04,.024)); grille.add(at(box(.012,.006,.003,glow(AMBER)),GW/2-.06,-GH/2+.04,.01)); grille.position.set(0,H/2,.034); g.add(grille);
  return {g,grille}; }

/* small systems: a two-way speaker on a tripod, and a microphone on a stand */
function pointSource(W=.38,H=.62,D=.36,key='ps'){ const g=new THREE.Group(), B=W*.58, sh=new THREE.Shape(); sh.moveTo(-W/2,0); sh.lineTo(W/2,0); sh.lineTo(B/2,D); sh.lineTo(-B/2,D); sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:H-.05,bevelEnabled:true,bevelSize:.024,bevelThickness:.025,bevelSegments:5,curveSegments:2}); geo.rotateX(-Q); geo.translate(0,.025,-.026); g.add(mesh(geo,M.shell));
  // steel grille bowed outward over a horn and a woofer, set in a lip, with a badge
  const GW=W-.05, GH=H-.075; g.add(at(curved(GW,GH,.03,grilleMat(key,GW,GH,[[.5,.66,W*.37],[.5,.2,W*.62,H*.2]])),0,H/2+.005,.0));
  for(const sy of [-1,1]) g.add(at(rbox(GW+.012,.016,.04,M.shell2,.006),0,H/2+.005+sy*(GH/2+.004),.008)); for(const sx of [-1,1]) g.add(at(rbox(.014,GH+.02,.014,M.shell2,.005),sx*(GW/2+.003),H/2+.005,.002));
  g.add(at(rbox(W*.2,.02,.004,M.alu,.002),0,.085,.0155)); g.add(at(box(.008,.004,.003,glow(AMBER)),GW/2-.04,.07,.006));
  // moulded handle recess in each flank, a carry handle on top, a pole socket and feet underneath
  const ang=Math.atan((W-B)/2/D); for(const sx of [-1,1]){ const sd=grp(g,sx*(W/2-(W-B)/4-.002),H*.56,-D/2); sd.rotation.y=-sx*ang; sd.add(rbox(.014,.17,.12,M.rubber,.006)); sd.add(at(rot(cyl(.011,.011,.15,M.shell2,12),0,0,0),sx*.006,0,0)); }
  g.add(at(rbox(W*.4,.02,.1,M.rubber,.008),0,H-.004,-D*.5)); g.add(at(rbox(W*.3,.016,.03,M.shell2,.006),0,H+.006,-D*.5));
  g.add(at(cyl(.026,.026,.05,M.steel,18),0,-.018,-D/2)); for(const sx of [-1,1]) for(const z of [-.06,-D+.06]) g.add(at(cyl(.02,.022,.012,M.rubber,14),sx*(W*.5-.07)*(z<-.1?.62:1),-.004,z));
  return g; }
function tripod(h){ const g=new THREE.Group(); g.add(at(cyl(.019,.019,h-.08,M.steel,16),0,(h+.08)/2,0)); g.add(at(cyl(.024,.024,h*.5,M.satin,16),0,h*.3,0)); g.add(at(cyl(.034,.034,.07,M.black,18),0,.52,0)); g.add(at(cyl(.03,.03,.05,M.black,18),0,h*.55,0)); g.add(at(rot(cyl(.012,.012,.06,M.amber,12),0,0,Q),.04,h*.55,0));
  for(let k=0;k<3;k++){ const a=k/3*Math.PI*2+.5, fx=Math.cos(a)*.58, fz=Math.sin(a)*.58; g.add(mesh(new THREE.TubeGeometry(new THREE.LineCurve3(V(0,.52,0),V(fx,.02,fz)),1,.014,10),M.satin)); g.add(mesh(new THREE.TubeGeometry(new THREE.LineCurve3(V(0,.2,0),V(fx*.55,.285,fz*.55)),1,.008,8),M.steel)); g.add(at(sph(.022,M.rubber,12,8),fx,.022,fz)); }
  g.add(at(cyl(.03,.03,.04,M.black,18),0,.2,0)); return g; }
function handheld(){ const g=new THREE.Group(), body=std(0x2a2b2f,.3,.85,{envMapIntensity:1}), cap=std(0x161618,.62,.05), ring=std(0xbab7af,.24,.95,{envMapIntensity:1});
  // antenna cap: charging contacts underneath, a status light, the coloured ID ring above it
  g.add(lathe([[0,0],[.011,0],[.0165,.003],[.0176,.008],[.0176,.04]],cap)); for(const sx of [-1,1]) g.add(at(cyl(.0024,.0024,.0012,M.alu,10),sx*.0062,-.0003,0)); g.add(at(sph(.0013,glow(AMBER),8,6),0,.031,.0178));
  for(let k=0;k<5;k++) g.add(at(cyl(.01775,.01775,.0008,std(0x0c0c0d,.8),40),0,.012+k*.0035,0));
  g.add(at(cyl(.0181,.0181,.0038,M.amber,48),0,.042,0));
  // handle in two machined sections, a ribbed grip low down, polished rings where the sections meet
  const rib=[]; for(let k=0;k<=18;k++){ const y=.05+k*.002; rib.push([.01835+(y-.044)*.0185+(k%2?.00035:0),y]); }
  g.add(lathe([[.0176,.044],[.0184,.05]],body)); g.add(lathe(rib,body)); g.add(lathe([[.0190,.086],[.0197,.1],[.0206,.14]],body)); g.add(lathe([[.0206,.1445],[.0222,.19],[.0238,.212],[.0246,.2185]],body));
  g.add(at(cyl(.0209,.0209,.0045,ring,56),0,.14225,0)); g.add(at(cyl(.01795,.01795,.001,ring,48),0,.0445,0));
  // display under a flush window, mute switch with its own light
  g.add(at(rbox(.0215,.031,.0035,cap,.0018),0,.112,.0188)); const d=new THREE.Mesh(new THREE.PlaneGeometry(.0165,.024),new THREE.MeshBasicMaterial({map:lcd(['CH 04','A 518'])})); d.position.set(0,.112,.02065); g.add(d);
  g.add(at(rbox(.0085,.0145,.0045,cap,.002),0,.074,.0182)); g.add(at(rbox(.0055,.006,.002,ring,.001),0,.0755,.0208)); g.add(at(sph(.0012,glow(AMBER),8,6),0,.0865,.0196));
  // collar and the basket: woven steel in two halves around a band
  g.add(lathe([[.0246,.2185],[.0262,.2195],[.0266,.2225],[.0256,.2262],[.0246,.2268]],ring,56));
  const gr=std(0xffffff,.4,.78,{map:weaveT,bumpMap:weaveT,bumpScale:1.1,envMapIntensity:1}); g.add(lathe([[.0246,.227],[.0298,.239],[.0336,.256],[.0343,.2665]],gr,64)); g.add(lathe([[.0343,.2705],[.0326,.29],[.0266,.305],[.015,.314],[0,.316]],gr,64));
  g.add(lathe([[.0343,.2665],[.0352,.2672],[.0352,.2698],[.0343,.2705]],ring,64));
  return g; }
function bodypack(){ const g=new THREE.Group(), sh=std(0x1f2023,.42,.55,{envMapIntensity:.9}), dk=std(0x111113,.6,.1); g.add(rbox(.064,.09,.021,sh,.006)); g.add(at(rbox(.066,.013,.023,M.satin,.004),0,.0395,0));
  g.add(at(rbox(.042,.027,.002,dk,.001),0,.012,.0098)); const d=new THREE.Mesh(new THREE.PlaneGeometry(.036,.022),new THREE.MeshBasicMaterial({map:lcd(['CH 05','B 562'],160,96)})); d.position.set(0,.012,.0109); g.add(d);
  for(const x of [-.014,0,.014]) g.add(at(rbox(.009,.005,.002,dk,.001),x,-.012,.0105)); g.add(at(box(.058,.0008,.0005,dk),0,-.024,.0106)); g.add(at(rbox(.02,.004,.002,dk,.001),0,-.033,.0105));
  // top: antenna on a threaded base, a locking mic connector, a mute slider and a light
  g.add(at(cyl(.0035,.0035,.008,M.steel,12),-.02,.049,0)); g.add(at(cyl(.0022,.0015,.085,M.rubber,10),-.02,.094,0)); g.add(at(sph(.0022,M.rubber,8,6),-.02,.137,0));
  g.add(at(cyl(.0056,.0056,.01,M.steel,16),.018,.05,0)); g.add(at(cyl(.0062,.0062,.004,dk,16),.018,.057,0)); g.add(at(rbox(.012,.004,.006,dk,.0015),0,.047,0)); g.add(at(sph(.0012,glow(AMBER),8,6),.004,.0465,.006));
  // belt clip: a sprung steel wire down the back
  g.add(tube([[-.016,.036,-.0115],[-.016,-.03,-.016],[0,-.036,-.017],[.016,-.03,-.016],[.016,.036,-.0115]],.0011,M.steel,40));
  g.add(tube([[.018,.059,0],[.03,.1,.01],[.075,.12,.02],[.11,.07,.03],[.13,.0,.025],[.15,-.03,.03]],.0013,M.rubber,60));
  const lav=grp(g,.152,-.036,.03); lav.add(cyl(.0034,.0034,.014,M.black,14)); lav.add(at(sph(.0058,std(0x202022,1),14,10),0,-.011,0)); lav.add(at(rbox(.011,.004,.017,M.steel,.0015),0,.004,.007)); lav.add(at(rbox(.011,.004,.017,M.steel,.0015),0,.0095,.007));
  return g; }
function headset(){ const g=new THREE.Group(), wire=std(0xd9b99b,.5,.2), pad=std(0xcda98a,.8); g.add(rot(mesh(new THREE.TorusGeometry(.072,.0015,8,64,Math.PI*1.25),wire),0,0,-.4));
  g.add(tube([[.066,-.03,0],[.074,-.06,.01],[.066,-.085,.04],[.045,-.1,.075]],.0013,wire,30)); g.add(at(sph(.0046,std(0x2a2a2c,1),12,8),.044,-.101,.077)); g.add(at(cyl(.0019,.0019,.006,wire,8),.0455,-.0995,.0745));
  for(const a of [-.4,-.4+Math.PI*1.25]){ const e=grp(g,Math.cos(a)*.072,Math.sin(a)*.072,0); e.add(rbox(.012,.03,.006,pad,.003)); e.add(tube([[0,-.012,0],[.006,-.03,.004],[.0,-.046,.006],[-.008,-.04,.004]],.0012,wire,16)); }
  g.add(tube([[-.066,-.03,0],[-.07,-.07,-.01],[-.066,-.13,-.012]],.0011,wire,16)); return g; }
function receiver(){ const g=new THREE.Group(), face=std(0x17181a,.38,.55,{envMapIntensity:1}), dk=std(0x0e0e10,.55,.2); g.add(rbox(.43,.044,.2,M.shell2,.003));
  // rack ears with slotted holes, a brushed front panel, vent slots on top, feet
  g.add(at(rbox(.483,.044,.004,face,.0015),0,0,.101)); for(const sx of [-1,1]) for(const sy of [-1,1]) g.add(at(rbox(.012,.006,.002,dk,.001),sx*.2305,sy*.012,.1032)); for(let k=0;k<14;k++) g.add(at(box(.004,.001,.06,dk),-.13+k*.02,.0221,-.02));
  for(const sx of [-1,1]) for(const z of [-.07,.07]) g.add(at(cyl(.008,.009,.005,M.rubber,12),sx*.18,-.0245,z));
  for(const sx of [-1,1]){ const c=grp(g,sx*.103,0,.1032); c.add(at(rbox(.106,.034,.002,dk,.001),-.022,0,0)); const d=new THREE.Mesh(new THREE.PlaneGeometry(.1,.03),new THREE.MeshBasicMaterial({map:lcd([sx<0?'CH 04  RF':'CH 05  RF'],320,96)})); d.position.set(-.022,0,.0012); c.add(d);
    // encoder with a knurled edge, three keys, level ladders
    c.add(at(rot(cyl(.0095,.0095,.011,M.alu,24),Q),.052,.003,.0055)); c.add(at(rot(cyl(.0102,.0102,.003,M.satin,12),Q),.052,.003,.003)); c.add(at(box(.0012,.006,.0006,dk),.052,.0085,.0112));
    for(let k=0;k<3;k++) c.add(at(rbox(.008,.005,.003,M.satin,.001),.04+k*.012,-.013,.0012)); for(let k=0;k<6;k++) c.add(at(box(.0022,.0022,.0008,glow(k<4?0x9fc08f:AMBER)),.07,-.014+k*.0048,.0008)); }
  g.add(at(rot(cyl(.0055,.0055,.006,M.steel,14),Q),.218,-.008,.105)); g.add(at(sph(.0014,glow(AMBER),8,6),.218,.008,.1036));
  // two antennas on hinged connectors at the back
  for(const sx of [-1,1]){ g.add(at(cyl(.006,.006,.022,M.steel,14),sx*.165,.012,-.092)); g.add(at(sph(.0065,M.black,12,10),sx*.165,.025,-.092)); const an=lathe([[0,0],[.0042,0],[.0042,.03],[.0032,.05],[.0026,.235],[0,.24]],M.rubber,12); an.position.set(sx*.165,.025,-.092); an.rotation.z=-sx*.42; g.add(an); }
  return g; }
function monitor(){ const g=new THREE.Group(); g.add(at(rbox(.25,.38,.25,M.shell,.03),0,.19,-.125)); g.add(at(rbox(.215,.345,.006,M.baffle,.02),0,.19,.001)); g.add(at(driver(.074,.45),0,.135,.005));
  g.add(at(rot(lathe([[.012,0],[.02,.004],[.038,.012],[.046,.014]],M.shell2,36),Q),0,.295,-.008)); g.add(at(rot(mesh(new THREE.SphereGeometry(.013,16,10,0,Math.PI*2,0,Q),M.satin,false),Q),0,.295,-.004));
  g.add(at(rbox(.15,.014,.01,M.rubber,.006),0,.034,.001)); g.add(at(rbox(.03,.008,.003,M.alu,.002),.075,.357,.005)); screws(g,[[-.095,.35],[.095,.35],[-.095,.03],[.095,.03]],.005,.004);
  const led=new THREE.Mesh(new THREE.RingGeometry(.088,.096,48),new THREE.MeshBasicMaterial({color:AMBER,transparent:true,opacity:0,depthWrite:false})); led.position.set(0,.135,.009); g.add(led); g.userData.led=led; return g; }
/* directional speaker hung overhead, with its sound drawn as a column that tightens into a beam. stop = the scroll stop it belongs to (null = always tight) */
function directionalRig(I2,stop=null){ let beamU=null;
  const PH=3.3, hexT=ctex(256,256,(g,w,h)=>{ g.fillStyle='#161618'; g.fillRect(0,0,w,h); const s=17; for(let r=0;r*s*.87<h+s;r++) for(let c=0;c*s<w+s;c++){ const x=c*s+(r%2)*s/2, y=r*s*.87; g.fillStyle='#2c2d31'; g.beginPath(); g.arc(x,y,6.6,0,7); g.fill(); g.fillStyle='#0c0c0e'; g.beginPath(); g.arc(x,y,3,0,7); g.fill(); } });
  const p=grp(I2,0,PH,0); p.add(rbox(.66,.05,.66,M.alu,.012)); p.add(at(rot(new THREE.Mesh(new THREE.PlaneGeometry(.6,.6),std(0xffffff,.6,.4,{map:hexT})),Q),0,-.0262,0));
  p.add(at(rbox(.3,.06,.2,M.shell2,.012),0,.05,0)); p.add(at(rbox(.6,.012,.05,M.steel,.004),0,.031,0)); for(const sx of [-1,1]) for(const sz of [-1,1]) p.add(at(cyl(.007,.007,.004,M.steel,10),sx*.3,-.0255,sz*.3)); p.add(at(rbox(.62,.008,.62,M.black,.003),0,-.023,0)); p.add(at(box(.012,.006,.003,glow(AMBER)),.12,.05,.101));
  for(const sx of [-1,1]){ p.add(at(cyl(.004,.004,24,M.steel,6),sx*.26,12.62,0)); p.add(at(cyl(.011,.011,.09,M.alu,12),sx*.26,.66,0)); p.add(at(mesh(new THREE.TorusGeometry(.016,.004,8,16),M.steel),sx*.26,.6,0));
    for(const sz of [-1,1]){ p.add(rod2(V(sx*.26,.6,0),V(sx*.27,.03,sz*.27),.003,M.steel)); p.add(at(mesh(new THREE.TorusGeometry(.013,.004,8,14),M.steel),sx*.27,.04,sz*.27)); } }
  for(let k=0;k<9;k++) p.add(at(rbox(.004,.03,.16,M.satin,.0015),-.12+k*.03,.092,0)); p.add(tube([[.15,.05,0],[.22,.1,.02],[.262,.3,.01],[.262,.62,0],[.262,1.2,0]],.006,M.rubber,40));
  // the sound itself: starts as wide as an ordinary speaker's, and scrolling tightens it into a beam
  beamU={uR:{value:2.7},uT:{value:0},uC:{value:new THREE.Color(AMBER)}};
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,72,40,true),new THREE.ShaderMaterial({uniforms:beamU,transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`uniform float uR; varying float vH; varying vec3 vN; varying vec3 vV; void main(){ vH=position.y+.5; float r=mix(uR,.3,vH); vec3 p=vec3(position.x*r,position.y*${(PH-.03).toFixed(2)},position.z*r); vec4 mv=modelViewMatrix*vec4(p,1.); vN=normalize(normalMatrix*vec3(position.x,0.,position.z)); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`uniform float uT; uniform vec3 uC; varying float vH; varying vec3 vN; varying vec3 vV; void main(){ float ring=smoothstep(.72,1.,sin((vH*9.+uT*1.6)*6.2832)*.5+.5); float edge=pow(1.-abs(dot(normalize(vN),normalize(vV))),1.6); float a=(.05+.3*ring)*(.35+.65*edge)*smoothstep(0.,.08,vH)*(1.-smoothstep(.9,1.,vH)); gl_FragColor=vec4(uC,a); }`}));
  beam.position.y=(PH-.03)/2; I2.add(beam);
  const spot=new THREE.Mesh(new THREE.CircleGeometry(1,72),new THREE.MeshBasicMaterial({color:AMBER,transparent:true,opacity:.16,depthWrite:false})); spot.rotation.x=-Q; spot.position.y=.006; I2.add(spot);
  const rim=new THREE.Mesh(new THREE.RingGeometry(.985,1,96),new THREE.MeshBasicMaterial({color:AMBER,transparent:true,opacity:.9,depthWrite:false})); rim.rotation.x=-Q; rim.position.y=.008; I2.add(rim);
  // where people stand: one pair of footprints in the beam, two outside it
  const feetT=(col)=>ctex(128,128,(g,w,h)=>{ g.fillStyle=col; for(const sx of [-1,1]){ g.save(); g.translate(w/2+sx*19,h/2); g.rotate(sx*.13); g.beginPath(); g.ellipse(0,-13,11.5,21,0,0,7); g.fill(); g.beginPath(); g.ellipse(0,24,8.5,10.5,0,0,7); g.fill(); g.restore(); } });
  const feet=[[0,.25,AMBER,'#E8892D'],[-1.75,.5,0,'#8A867E'],[1.9,-.3,0,'#8A867E']].map(([x,z,_,col])=>{ const f=new THREE.Mesh(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:feetT(col),transparent:true,depthWrite:false})); f.rotation.x=-Q; f.position.set(x,.01,z); I2.add(f); return f; });
  updaters.push((t,x)=>{ const u=stop===null?1:sstep(stop-.45,stop+.05,x), r=lerp(2.7,.5,u); beamU.uR.value=r; beamU.uT.value=t; spot.scale.setScalar(r); rim.scale.setScalar(r); feet[1].material.opacity=feet[2].material.opacity=lerp(1,.38,u); }); }

/* a sofa with transducers under the seat inside a ring of eight speakers; a sound travels round the ring. stop as above */
function spatialRig(I3,stop=null){ const lifts=[], ringSp=[];
  const N=8, R=3.5; for(let k=0;k<N;k++){ const a=k/N*Math.PI*2+Math.PI/8, st=grp(I3,Math.sin(a)*R,0,Math.cos(a)*R); st.rotation.y=a+Math.PI; st.add(at(cyl(.2,.22,.025,M.black,36),0,.0125,0)); st.add(at(cyl(.016,.016,1.25,M.steel,14),0,.65,0)); st.add(at(rbox(.16,.012,.16,M.steel,.004),0,1.28,0)); const m=monitor(); m.position.set(0,1.29,.125); st.add(m); ringSp.push([a,m.userData.led]); }
  // the sofa: plain, low, upholstered; the seat lifts off to show what makes it move
  const so=grp(I3,0,0,-.1), W=2.3, D=.95; for(const sx of [-1,1]) for(const z of [-.34,.34]) so.add(at(cyl(.022,.016,.14,M.steel,14),sx*(W/2-.12),.07,z));
  so.add(at(rbox(W,.1,D,M.fabricD,.03),0,.19,0)); const deck=at(rbox(W-.36,.024,D-.24,M.wood,.006),0,.252,.06); so.add(deck);
  for(let k=0;k<3;k++){ const px=(k-1)*.64, pk=grp(so,px,.264,.06); pk.add(at(cyl(.085,.09,.05,M.black,36),0,.025,0)); pk.add(at(cyl(.092,.092,.008,M.alu,36),0,.008,0)); pk.add(at(cyl(.03,.03,.012,M.amber,20),0,.056,0)); pk.add(tube([[.08,.02,0],[.14,.012,-.1],[.1,.008,-.3]],.006,M.rubber,16)); lifts.push({puck:pk}); }
  const seat=grp(so,0,0,0), back=grp(so,0,0,0);
  for(let k=0;k<3;k++){ seat.add(at(rot(rbox(.635,.2,.67,M.fabric,.095),0,(k-1)*.012,(k-1)*.008),(k-1)*.64,.365,.1)); back.add(at(rot(rbox(.63,.5,.22,M.fabric,.1),-.17,(k-1)*.02,0),(k-1)*.64,.63,-.29)); }
  const pil=std(0xd9d2c4,1,0,{envMapIntensity:.15,bumpMap:weaveF,bumpScale:.5}); back.add(at(rot(rbox(.4,.4,.14,pil,.068),-.42,.3,.12),-.78,.62,-.12)); back.add(at(rot(rbox(.36,.36,.13,std(0xb9694a,1,0,{envMapIntensity:.15,bumpMap:weaveF,bumpScale:.5}),.062),-.5,-.35,-.1),.8,.6,-.1));
  for(const sx of [-1,1]) so.add(at(rbox(.2,.5,D,M.fabricD,.07),sx*(W/2-.1),.42,0)); so.add(at(rbox(W-.36,.5,.14,M.fabricD,.05),0,.44,-D/2+.07));
  // a sound moving around the room, and the floor rings of the low end
  const dot=sph(.085,glow(AMBER),20,14); dot.castShadow=false; I3.add(dot); const trail=[]; for(let k=0;k<22;k++){ const s=new THREE.Mesh(dot.geometry,new THREE.MeshBasicMaterial({color:AMBER,transparent:true,opacity:.5*(1-k/22),depthWrite:false})); s.scale.setScalar(.8*(1-k/26)); I3.add(s); trail.push(s); }
  const rings=[]; for(let k=0;k<4;k++){ const r=new THREE.Mesh(new THREE.RingGeometry(.985,1,96),new THREE.MeshBasicMaterial({color:0x1a1a18,transparent:true,opacity:0,depthWrite:false})); r.rotation.x=-Q; r.position.y=.006+k*.001; I3.add(r); rings.push(r); }
  const orbit=(tt)=>V(Math.sin(tt)*2.2,1.55+Math.sin(tt*1.7)*.35,Math.cos(tt)*2.2);
  updaters.push((t,x)=>{ const u=stop===null?1:sstep(stop-.4,stop+.05,x), ph=t*.9; seat.position.set(0,u*.62,u*.26); seat.rotation.x=-u*.1;
    dot.position.copy(orbit(ph)); trail.forEach((s,k)=>s.position.copy(orbit(ph-(k+1)*.045)));
    for(const [a,led] of ringSp){ let d=Math.abs(((ph-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI); led.material.opacity=clamp(1-d/.7)*.95; }
    const b=(t*118/60)%1; rings.forEach((r,k)=>{ const p=((b+k/4)%1); r.scale.setScalar(.7+p*3.2); r.material.opacity=(1-p)*.2; });
    const kick=Math.exp(-b*7)*.012*(.4+.6*u); lifts.forEach(l=>l.puck.position.y=.264+kick); so.position.y=kick*.35; }); }

/* digital mixing console on its road case, faders and meters alive */
function consoleRig(I4){
  const W=1.5, con=grp(I4,0,.815,0); con.rotation.y=-.3;
  const prof=[[.39,0],[.39,.07],[-.12,.165],[-.2,.35],[-.39,.365],[-.39,0]], sh=new THREE.Shape(); prof.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1])); sh.closePath();
  const ext=(w,m,bev=.006)=>{ const g=new THREE.ExtrudeGeometry(sh,{depth:w,bevelEnabled:true,bevelSize:bev,bevelThickness:bev,bevelSegments:2}); g.translate(0,0,-w/2); g.rotateY(-Q); return mesh(g,m); };
  con.add(ext(W,std(0x1d1e21,.55,.3))); for(const sx of [-1,1]){ const ck=ext(.03,M.alu,.004); ck.position.x=sx*(W/2+.02); ck.scale.set(1,1.03,1.03); con.add(ck); }
  // control surface, tilted up toward the meter bridge
  const a=Math.atan2(.095,.51), sf=grp(con,0,.0705,.39); sf.rotation.x=a; const L=.515;   // local: x across, z = -distance up the slope
  sf.add(at(box(W-.05,.003,L-.02,std(0x26272b,.5,.4)),0,.001,-L/2));
  const N=24, xs=[]; for(let i=0;i<N;i++){ const b=Math.floor(i/8); xs.push(-W/2+.11+i*.05+b*.055); }
  const capG=new RoundedBoxGeometry(.016,.014,.03,2,.004), caps=new THREE.InstancedMesh(capG,std(0xe9e6df,.4,.1),N); caps.castShadow=true; sf.add(caps);
  const knobs=new THREE.InstancedMesh(new THREE.CylinderGeometry(.0085,.0095,.016,18),std(0x2f3034,.4,.5),N*3); knobs.castShadow=true; sf.add(knobs);
  const btnA=new THREE.InstancedMesh(new THREE.BoxGeometry(.016,.005,.011),std(0x3a3b3f,.5,.2),N*2), btnL=new THREE.InstancedMesh(new THREE.BoxGeometry(.016,.005,.011),glow(AMBER),N); sf.add(btnA,btnL);
  const mt=new THREE.Matrix4(), lit=[]; let nb=0, nk=0;
  xs.forEach((x,i)=>{ sf.add(at(box(.0035,.002,.115,M.rubber),x,.0032,-.085)); sf.add(at(box(.03,.0015,.02,std(0x101113,.3,.2)),x,.0032,-.245));
    for(let k=0;k<3;k++){ mt.makeTranslation(x,.011,-.29-k*.05); knobs.setMatrixAt(nk++,mt); }
    mt.makeTranslation(x,.0045,-.175); btnA.setMatrixAt(nb++,mt); mt.makeTranslation(x,.0045,-.195); btnA.setMatrixAt(nb++,mt); lit.push(x); });
  const LW=W-.05, LL=L-.02, lg=ctex(1450,495,(g,cw,ch)=>{ const X=(x)=>(x/LW+.5)*cw, Z=(z)=>(1-(-z-.01)/LL)*ch; g.strokeStyle='rgba(236,233,227,.6)'; g.fillStyle='rgba(236,233,227,.6)'; g.font='500 9px "Geist Mono", monospace'; g.textAlign='center';
    xs.forEach((x,i)=>{ for(let k=0;k<=10;k++){ const z=-.03-k*.011; g.lineWidth=k===7?1.6:.8; g.beginPath(); g.moveTo(X(x)-13,Z(z)); g.lineTo(X(x)-(k%5===0||k===7?5:8),Z(z)); g.stroke(); }
      for(let k=0;k<3;k++){ g.lineWidth=1; g.beginPath(); g.arc(X(x),Z(-.29-k*.05),14,Math.PI*.75,Math.PI*2.25); g.stroke(); } g.fillText(String(i+1).padStart(2,'0'),X(x),Z(-.262)+3); g.fillRect(X(x)-8,Z(-.1625)-1,16,1); });
    g.lineWidth=1; for(const b of [1,2]){ const x=(xs[b*8-1]+xs[b*8])/2; g.beginPath(); g.moveTo(X(x),Z(-.02)); g.lineTo(X(x),Z(-.44)); g.stroke(); } g.textAlign='left'; g.font='600 11px "Geist Mono", monospace'; ['INPUTS 1-8','INPUTS 9-16','GROUPS / FX'].forEach((t,b)=>g.fillText(t,X(xs[b*8])-12,Z(-.46))); g.fillText('MASTER',X(W/2-.15),Z(-.46)); });
  const leg=new THREE.Mesh(new THREE.PlaneGeometry(LW,LL),new THREE.MeshBasicMaterial({map:lg,transparent:true,depthWrite:false,toneMapped:false,opacity:.8})); leg.rotation.x=-Q; leg.position.set(0,.0028,-L/2); sf.add(leg);
  // scribble strips: a coloured name tag per channel
  const strip=ctex(512,24,(g,w,h)=>{ const cols=['#E8892D','#d8d4cb','#7fa7c9','#d8d4cb','#9bbf8a','#E8892D','#d8d4cb','#c98fb1']; for(let i=0;i<24;i++){ g.fillStyle=cols[i%8]; g.fillRect(i*w/24+2,3,w/24-4,h-6); } });
  for(let b=0;b<3;b++){ const t=strip.clone(); t.repeat.set(1/3,1); t.offset.x=b/3; t.needsUpdate=true; const p=new THREE.Mesh(new THREE.PlaneGeometry(.39,.016),new THREE.MeshBasicMaterial({map:t,toneMapped:false})); p.rotation.x=-Q; p.position.set(xs[b*8]+.175,.0042,-.245); sf.add(p); }
  // master section: two long faders and a jog wheel
  for(const x of [W/2-.13,W/2-.08]){ sf.add(at(box(.0035,.002,.115,M.rubber),x,.0032,-.085)); sf.add(at(rbox(.018,.016,.034,M.amber,.004),x,.011,-.06-(x>W/2-.1?.03:0))); }
  sf.add(at(cyl(.04,.042,.014,M.alu,40),W/2-.105,.009,-.3)); sf.add(at(cyl(.012,.012,.02,M.satin,20),W/2-.105,.014,-.4));
  // meter bridge: two touch screens with live meters
  const mb=grp(con,0,.2575,-.16); mb.rotation.x=-Math.atan2(.08,.185);
  const scr=ctex(512,200,()=>{}), sg=scr.userData.g; const drawScr=(t)=>{ sg.fillStyle='#0c0e11'; sg.fillRect(0,0,512,200); for(let i=0;i<24;i++){ const v=.25+.6*Math.abs(Math.sin(t*2.1+i*1.7)*Math.sin(t*.9+i*.6)); for(let s=0;s<14;s++){ sg.fillStyle=s/14<v?(s>10?'#E8892D':'#c9d6c2'):'#1b1e22'; sg.fillRect(14+i*20.4,172-s*9,14,6); } }
    sg.strokeStyle='#E8892D'; sg.lineWidth=2.5; sg.beginPath(); for(let x=0;x<=484;x+=6){ const y=36+Math.sin(x*.018+t*.6)*9+Math.sin(x*.05+1)*5; x?sg.lineTo(14+x,y):sg.moveTo(14+x,y); } sg.stroke(); scr.needsUpdate=true; }; drawScr(0);
  for(const sx of [-1,1]){ mb.add(at(rbox(.56,.185,.012,M.black,.006),sx*.31,0,.004)); const p=new THREE.Mesh(new THREE.PlaneGeometry(.53,.16),new THREE.MeshBasicMaterial({map:scr,toneMapped:false})); p.position.set(sx*.31,0,.0105); mb.add(p); }
  mb.add(at(rbox(.14,.185,.012,M.black,.006),W/2-.1,0,.004)); for(let k=0;k<6;k++) mb.add(at(rot(cyl(.011,.012,.016,M.satin,18),Q),W/2-.135+(k%2)*.07,.055-Math.floor(k/2)*.055,.016));
  // the desk rides on its own road case: laminate panels, aluminium edging, ball corners, butterfly latches, casters
  { const cs=grp(I4,0,0,0); cs.rotation.y=-.3; const CWd=1.62, CDp=.84, CHt=.655, Y0=.14, lam=std(0x17181a,.62,.08,{bumpMap:speckT,bumpScale:.16});
    cs.add(at(rbox(CWd,CHt,CDp,lam,.01),0,Y0+CHt/2,0)); cs.add(at(box(CWd+.006,.007,CDp+.006,M.rubber),0,Y0+CHt*.7,0));
    for(const sy of [0,1]){ for(const sz of [-1,1]) cs.add(at(rbox(CWd+.014,.032,.032,M.alu,.007),0,Y0+sy*CHt,sz*CDp/2)); for(const sx of [-1,1]) cs.add(at(rbox(.032,.032,CDp+.014,M.alu,.007),sx*CWd/2,Y0+sy*CHt,0)); }
    for(const sx of [-1,1]) for(const sz of [-1,1]){ cs.add(at(rbox(.032,CHt,.032,M.alu,.007),sx*CWd/2,Y0+CHt/2,sz*CDp/2)); for(const sy of [0,1]) cs.add(at(sph(.034,M.steel,16,12),sx*CWd/2,Y0+sy*CHt,sz*CDp/2));
      const c=grp(cs,sx*(CWd/2-.15),0,sz*(CDp/2-.13)); c.rotation.y=.5*sx; c.add(at(rot(cyl(.05,.05,.038,M.rubber,22),0,0,Q),0,.05,0)); c.add(at(rot(cyl(.02,.02,.042,M.steel,14),0,0,Q),0,.05,0)); for(const s2 of [-1,1]) c.add(at(rbox(.006,.085,.06,M.steel,.002),s2*.025,.088,.006)); c.add(at(rbox(.1,.012,.1,M.steel,.003),0,.134,0)); }
    for(const x of [-.52,.52]){ const l=grp(cs,x,Y0+CHt*.7,CDp/2+.003); l.add(rbox(.115,.135,.008,M.alu,.004)); l.add(at(rot(cyl(.036,.036,.006,M.black,24),Q),0,0,.004)); l.add(at(rbox(.05,.014,.014,M.steel,.005),0,0,.012)); screws(l,[[-.045,.055],[.045,.055],[-.045,-.055],[.045,-.055]],.005,.004); }
    for(const sx of [-1,1]){ const hd=grp(cs,sx*(CWd/2+.003),Y0+CHt*.4,0); hd.add(rbox(.008,.15,.25,M.alu,.004)); hd.add(at(rbox(.012,.1,.18,M.black,.004),sx*.002,0,0)); hd.add(at(rbox(.022,.022,.16,M.steel,.009),sx*.014,-.022,0)); }
    cs.add(at(rbox(.26,.09,.004,M.white,.004),-.3,Y0+CHt*.3,CDp/2+.003)); }
  // headphones resting on the right
  con.add(at(rbox(W-.02,.022,.05,std(0x101012,.9),.01),0,.071,.372));   // padded wrist rest
  const hp=grp(con,W/2-.22,.385,-.26); hp.rotation.set(Q-.15,0,.5); hp.add(mesh(new THREE.TorusGeometry(.085,.009,10,40,Math.PI),M.black)); for(const sx of [-1,1]){ hp.add(at(rot(cyl(.043,.043,.03,M.shell2,32),0,0,Q),sx*.092,-.01,0)); hp.add(at(rot(mesh(new THREE.TorusGeometry(.036,.013,10,28),M.rubber),0,Q,0),sx*.074,-.01,0)); }
  const pos=new Float32Array(N).fill(.4), tgt=new Float32Array(N).fill(.4); let last=-9, frame=0;
  updaters.push(t=>{ if(t-last>1.6){ last=t; for(let i=0;i<N;i++) tgt[i]=.12+.8*Math.abs(Math.sin(t*.7+i*.9)*Math.cos(i*.37+t*.2)); }
    for(let i=0;i<N;i++){ pos[i]+=(tgt[i]-pos[i])*.07; mt.makeTranslation(xs[i],.011,-.035-pos[i]*.1); caps.setMatrixAt(i,mt); mt.makeTranslation(lit[i],(Math.sin(t*1.3+i*2.1)>.2)?.0046:-.02,-.175); btnL.setMatrixAt(i,mt); }
    caps.instanceMatrix.needsUpdate=true; btnL.instanceMatrix.needsUpdate=true; if(frame++%5===0) drawScr(t); }); }

/* what stands for Audio on the homepage: a speaker on a tripod and a microphone on a stand */
HERO.audio=(G)=>{ const sm=grp(G,-.55,0,0); sm.rotation.y=.3; sm.add(tripod(1.22)); sm.add(at(pointSource(.33,.54,.31,'ps10'),0,1.26,.155));
  const ms=grp(G,.5,0,.6); ms.add(at(cyl(.13,.14,.022,M.black,36),0,.011,0)); ms.add(at(cyl(.011,.011,1.42,M.steel,14),0,.72,0)); ms.add(at(cyl(.016,.016,.07,M.black,14),0,.78,0));
  const clip=grp(ms,0,1.43,0); clip.rotation.set(-.5,0,0); clip.add(at(cyl(.024,.021,.06,M.rubber,18),0,.03,0)); clip.add(at(handheld(),0,-.1,0)); };

/* ===== audio page: where things stand and where the camera stops ===== */
const I0=grp(scene,0,0,0), opens=[], lesser=grp(I0,0,0,0);
{ // small: one speaker on a tripod and a wireless handheld on a stand
  const sm=grp(lesser,-4.3,0,0); sm.rotation.y=.3; sm.add(tripod(1.22)); sm.add(at(pointSource(.33,.54,.31,'ps10'),0,1.26,.155));
  const ms=grp(lesser,-3.4,0,.75); ms.add(at(cyl(.13,.14,.022,M.black,36),0,.011,0)); ms.add(at(cyl(.011,.011,1.42,M.steel,14),0,.72,0)); ms.add(at(cyl(.016,.016,.07,M.black,14),0,.78,0));
  const clip=grp(ms,0,1.43,0); clip.rotation.set(-.5,0,0); clip.add(at(cyl(.024,.021,.06,M.rubber,18),0,.03,0)); /* the handheld is added below, once it is defined */ ms.userData.clip=clip; lesser.userData.ms=ms;
  // medium: tops on subs, a pair
  for(const [x,z,ry] of [[-1.45,-.2,.22],[-.05,-.9,.05]]){ const st=grp(lesser,x,0,z); st.rotation.y=ry; const sb=sub(); sb.g.scale.setScalar(.7); st.add(sb.g); st.add(at(cyl(.019,.019,.82,M.steel,16),0,.448+.41,-.28)); st.add(at(pointSource(.43,.7,.4,'ps15'),0,.448+.82,-.08)); }
  // large: a flown line array over a sub stack
  const la=lineArray(8); la.root.position.set(2.25,5.3,0); la.root.rotation.y=-.42; I0.add(la.root); opens.push(...la.parts);
  for(let r=0;r<2;r++) for(let c=0;c<2;c++){ const s=sub(); s.g.position.set(4.0+c*1.14,r*.655+.03,-.6-c*.5); s.g.rotation.y=-.42; I0.add(s.g); opens.push({grille:s.grille}); } }

const I1=grp(scene,S,0,0);
{ lesser.userData.ms.userData.clip.add(at(handheld(),0,-.1,0));
  const mic=handheld(); const h=grp(I1,.2,1.05,0); h.scale.setScalar(7); h.rotation.set(.18,0,-.52); h.add(mic); spinners.push([mic,.25]);
  const bp=bodypack(); bp.scale.setScalar(5.2); bp.position.set(2.75,1.7,.1); bp.rotation.set(-.12,-.5,.1); I1.add(bp);
  const hs=headset(); hs.scale.setScalar(6); hs.position.set(2.2,3.05,-.3); hs.rotation.set(.1,-.7,.15); I1.add(hs);
  const rx=receiver(); rx.scale.setScalar(3.4); rx.position.set(1.7,.45,1.5); rx.rotation.y=-.3; I1.add(rx); const pl=at(rbox(1.9,.36,1.0,M.white,.05),1.7,.18,1.5); pl.rotation.y=-.3; { const tr=at(rbox(1.94,.03,1.04,M.alu,.012),1.7,.03,1.5); tr.rotation.y=-.3; I1.add(tr); } I1.add(pl);
  updaters.push(t=>{ h.position.y=1.05+Math.sin(t*.7)*.05; bp.position.y=1.7+Math.sin(t*.8+1)*.04; hs.position.y=3.05+Math.sin(t*.6+2)*.05; }); }

directionalRig(grp(scene,2*S,0,0),4);
spatialRig(grp(scene,3*S,0,0),5);
consoleRig(grp(scene,4*S,0,0));
// the smaller systems leave, then the hang opens: grilles lift off to one side and the boxes spread
updaters.push((t,x)=>{const e=sstep(1.5,2.0,x), gone=sstep(1.3,1.62,x); lesser.scale.setScalar(Math.max(.001,1-gone)); lesser.visible=gone<.999; opens.forEach((o,i)=>{ if(o.next){ o.grille.position.x=e*1.34; o.grille.position.z=.034+Math.sin(e*Math.PI)*.22+e*.06; o.next.position.y=-CH-.014-e*.11; } else o.grille.position.z=.034+e*.5; }); });
PAGE.keys=(narrow,K,R)=>{ return [ narrow? R([-3.2,1.5,6.6],[-3.85,1.0,.2],34) : K([-2.3,1.35,5.6],[-4.0,.98,.15],30),          // hero: the small set
           narrow? R([-10.6,2.3,10.6],[-.7,2.3,-.6],46) : K([-.2,2.8,17.8],[.1,2.2,0],30,-.15),           // the whole range, small to large
           narrow? R([.9,3.2,20.5],[3.7,3.0,-.3],32) : K([-.2,3.2,13.4],[4.5,2.95,-.3],30),             // the flown array, opened up
           K([S-1.0,2.1,9.9],[S+.9,1.55,0],28),                 // wireless
           K([2*S-5.0,2.4,8.6],[2*S+.2,1.55,0],30),            // directional
           K([3*S-4.6,4.9,9.6],[3*S+.2,.75,0],32),             // spatial + haptic
           K([4*S-2.3,2.5,5.3],[4*S+.1,.78,-.05],30),       // console
           K([4*S+2.6,3.7,7.4],[4*S+.1,.8,-.05],30,0,.25) ]; };

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
