
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* Audio page: a scroll-driven product film. No room: each product family sits alone on a seamless backdrop,
   the camera travels from one to the next, and scrolling opens each one up. All models are built here. */
const canvas=document.getElementById('stage'), floorEl=document.getElementById('floor');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, SNAP=location.hash.startsWith('#snap');
const BG=0xECE9E3, AMBER=0xE8892D, Q=Math.PI/2;

// perf: render at most 1.5x (lower if the device struggles), MSAA only on 1x screens, shadows refreshed every other frame
const PF={n:0,t:0,a:0,l:0,r:[Math.min(devicePixelRatio,1.5),Math.min(devicePixelRatio,1.15),1],s:[2,3,6]};
const renderer=new THREE.WebGLRenderer({canvas,antialias:devicePixelRatio<=1.25,powerPreference:'high-performance'});
renderer.setPixelRatio(PF.r[0]); renderer.outputColorSpace=THREE.SRGBColorSpace;
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

/* ===== live video & visuals models: definitions only, nothing is added to the scene here ===== */
const LM={
  body:std(0x1d1e21,.5,.25,{envMapIntensity:.85}), body2:std(0x2a2b2f,.42,.4,{envMapIntensity:.9}), dark:std(0x0b0c0e,.7,.1), grip:std(0x141416,.92,0,{bumpMap:speckT,bumpScale:.35}),
  glass:std(0x0a0d12,.05,.2,{envMapIntensity:2.2}), coat:std(0x2a3a5a,.08,.4,{envMapIntensity:2.4,transparent:true,opacity:.55,depthWrite:false}),
  ring:std(0x16171a,.55,.2), knurl:std(0x1b1c1f,.8,.1,{bumpMap:weaveT,bumpScale:.6}), legA:std(0x26272b,.36,.75,{envMapIntensity:1}), legB:std(0xb9b7b1,.28,.9,{envMapIntensity:1}),
  lam:std(0x17181a,.62,.08,{bumpMap:speckT,bumpScale:.16}), foam:std(0x2a2b2e,1,0,{envMapIntensity:.1}), cable:std(0x101012,.55,.05), cableA:std(AMBER,.5,0),
  white:std(0xf1eee8,.42,.02,{envMapIntensity:.9}), cloth:std(0x1b1c1f,1,0,{envMapIntensity:.1,bumpMap:weaveF,bumpScale:.45}), seat:std(0x5b5650,1,0,{envMapIntensity:.15,bumpMap:weaveF,bumpScale:.5}),
};
const lvTally=new THREE.MeshBasicMaterial({color:0x3a1512,toneMapped:false}), lvTallyOn=new THREE.Color(0xff3b2a), lvTallyOff=new THREE.Color(0x3a1512);
// small rounded box with few segments, for parts a few centimetres across
const lvrb=(w,h,d,m,r=.003,cast=true)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.max(.0004,Math.min(r,w/2-.0002,h/2-.0002,d/2-.0002))),m,cast);
const lvTubeG=(pts,r,seg=40,rad=6)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>p.isVector3?p:V(...p))),seg,r,rad);
const lvRR=(g,x,y,w,h,r)=>{ g.beginPath(); g.roundRect(x,y,w,h,r); g.fill(); };
// merge static meshes under g into one mesh per material (anything userData.live, and instanced meshes, stay as they are)
function lvBake(g){ g.updateWorldMatrix(true,true); const inv=g.matrixWorld.clone().invert(), by=new Map(), live=[], out=new THREE.Group(), rel=new THREE.Matrix4();
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
// an extruded side profile: pts are [z,y] in metres, extruded w wide along x and centred on x=0, with a soft bevel
function lvProfile(pts,w,m,bev=.006,rad=0){ const s=new THREE.Shape(), n=pts.length;
  if(!rad){ s.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<n;i++) s.lineTo(pts[i][0],pts[i][1]); s.closePath(); }
  else { const P=pts.map(p=>new THREE.Vector2(p[0],p[1])), cut=(a,b,r)=>{ const d=b.clone().sub(a), L=d.length(); return a.clone().add(d.multiplyScalar(Math.min(r,L*.45)/L)); };
    for(let i=0;i<n;i++){ const a=P[(i+n-1)%n], b=P[i], c=P[(i+1)%n], r=Array.isArray(rad)?rad[i]:rad, p0=cut(b,a,r), p1=cut(b,c,r); i?s.lineTo(p0.x,p0.y):s.moveTo(p0.x,p0.y); s.quadraticCurveTo(b.x,b.y,p1.x,p1.y); } s.closePath(); }
  const ge=new THREE.ExtrudeGeometry(s,{depth:w-2*bev,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:3,curveSegments:8}); ge.translate(0,0,-(w-2*bev)/2); ge.rotateY(-Q); return mesh(ge,m); }
const lvLabel=(txt,w,h,px=.0004,fg='#d9dde0',bg=null,font='600')=>{ const W=Math.max(32,Math.round(w/px)), H=Math.max(16,Math.round(h/px)); return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({transparent:!bg,toneMapped:false,depthWrite:false,map:ctex(W,H,(g)=>{ if(bg){ g.fillStyle=bg; g.fillRect(0,0,W,H); } g.fillStyle=fg; g.font=font+' '+Math.round(H*.72)+'px "Geist Mono", monospace'; g.textBaseline='middle'; g.fillText(txt,H*.1,H*.55); })})); };

/* ---------- what the cameras see: a stage with a lectern and a screen, drawn from a few angles ---------- */
function lvShot(g,x,y,w,h,ang=0,tt=0,cam=1){ g.save(); g.beginPath(); g.rect(x,y,w,h); g.clip();
  const sky=g.createLinearGradient(0,y,0,y+h); sky.addColorStop(0,'#14161b'); sky.addColorStop(.62,'#20232a'); sky.addColorStop(1,'#2b2620'); g.fillStyle=sky; g.fillRect(x,y,w,h);
  const cx=x+w*(.5-ang*.22), sw=w*(.56-Math.abs(ang)*.12), sh=sw*.5, sy=y+h*.12;
  const sc=g.createLinearGradient(cx-sw/2,sy,cx+sw/2,sy+sh); sc.addColorStop(0,'#E8892D'); sc.addColorStop(.55,'#b85a2a'); sc.addColorStop(1,'#3a2a3e'); g.fillStyle=sc; g.fillRect(cx-sw/2,sy,sw,sh);
  g.fillStyle='rgba(255,255,255,.85)'; g.font='700 '+Math.round(sh*.17)+'px "Geist", sans-serif'; g.textAlign='center'; g.fillText('KEYNOTE',cx,sy+sh*.52); g.font='500 '+Math.round(sh*.08)+'px "Geist Mono", monospace'; g.fillText('LIVE FROM THE MAIN STAGE',cx,sy+sh*.7);
  g.fillStyle='#0d0e10'; g.fillRect(x,y+h*.74,w,h*.26); g.fillStyle='#3a332c'; g.fillRect(x,y+h*.72,w,h*.025);
  const lx=cx+sw*(.32+ang*.1), lw=w*.07; g.fillStyle='#1e1f23'; g.beginPath(); g.moveTo(lx-lw*.6,y+h*.5); g.lineTo(lx+lw*.6,y+h*.5); g.lineTo(lx+lw*.42,y+h*.73); g.lineTo(lx-lw*.42,y+h*.73); g.fill(); g.fillStyle='#E8892D'; g.fillRect(lx-lw*.25,y+h*.56,lw*.5,h*.025);
  for(let i=0;i<5;i++){ const bx=x+w*(.08+i*.21), b=.5+.5*Math.sin(tt*1.3+i*1.7); g.fillStyle=`rgba(255,214,160,${.06+.08*b})`; g.beginPath(); g.moveTo(bx,y); g.lineTo(bx-w*.06,y+h*.74); g.lineTo(bx+w*.06,y+h*.74); g.fill(); }
  for(let i=0;i<14;i++){ const hx=x+((i*97+cam*31)%100)/100*w, hh=h*(.06+((i*37)%5)*.008); g.fillStyle='#08090a'; g.beginPath(); g.ellipse(hx,y+h,w*.035,hh*1.4,0,Math.PI,0); g.fill(); }
  g.restore(); g.textAlign='left'; }
const lvPgm=(()=>{ let t=null; return ()=>{ if(t) return t; t=ctex(640,360,()=>{}); const g=t.userData.g; t.userData.draw=(tt,live=1)=>{ lvShot(g,0,0,640,360,Math.sin(tt*.13)*.25,tt,1);
  g.fillStyle='rgba(0,0,0,.55)'; lvRR(g,18,18,live>.5?136:110,34,6); g.fillStyle=live>.5?'#ff3b2a':'#6b6f75'; g.beginPath(); g.arc(38,35,7,0,7); g.fill(); g.fillStyle='#fff'; g.font='700 18px "Geist Mono", monospace'; g.fillText(live>.5?'LIVE':'READY',54,42); if(live>.5){ const s=Math.floor(tt+3121); g.font='500 14px "Geist Mono", monospace'; g.fillText(String(s/60|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0'),104,41); }
  g.fillStyle='rgba(0,0,0,.5)'; g.fillRect(20,300,330,40); g.fillStyle='#E8892D'; g.fillRect(20,300,5,40); g.fillStyle='#fff'; g.font='600 17px "Geist", sans-serif'; g.fillText('Opening keynote',36,326); t.needsUpdate=true; }; t.userData.draw(0); return t; }; })();

/* ---------- a compact broadcast camcorder ---------- */
function lvCamera(label='CAM 1'){ const g=new THREE.Group(), st=new THREE.Group(), W=.13;
  // body: one moulded side profile (z forward, y up) with soft corners
  st.add(lvProfile([[-.165,.012],[.1,.012],[.13,.04],[.13,.13],[.105,.15],[-.13,.15],[-.165,.12]],W,LM.body,.007,[.02,.02,.015,.02,.02,.025,.02]));
  st.add(at(lvrb(W-.016,.003,.22,LM.dark,.0015),0,.1505,-.015));                                     // top seam
  // right side: the hand grip with its strap, zoom rocker and record button
  const gr=lvProfile([[-.02,.025],[.1,.025],[.12,.06],[.12,.125],[.095,.145],[0,.145],[-.03,.115]],.046,LM.grip,.009,.018); gr.position.x=W/2+.017; st.add(gr);
  st.add(mesh(lvTubeG([[W/2+.045,.03,-.005],[W/2+.062,.07,.02],[W/2+.064,.12,.05],[W/2+.05,.145,.09]],.009,24,8).scale(1,1,1),LM.knurl)); 
  st.add(at(lvrb(.022,.008,.03,LM.body2,.004),W/2+.018,.152,.085)); st.add(at(lvrb(.012,.005,.014,LM.dark,.002),W/2+.018,.157,.085)); st.add(at(cyl(.007,.007,.006,glow(0xd8372a),16),W/2+.04,.147,.06));
  // battery at the back, with its charge lights
  st.add(at(rbox(.105,.095,.055,LM.dark,.01),0,.082,-.19)); st.add(at(lvrb(.085,.01,.003,M.alu,.002),0,.112,-.2185)); for(let i=0;i<4;i++) st.add(at(box(.008,.003,.0008,glow(i<3?0x7ee08f:0x2a2d31)),-.018+i*.012,.1,-.2185));
  // left side: a recessed button panel, a status screen, the card door and a vent grille at the back
  st.add(at(lvrb(.003,.085,.17,LM.dark,.004),-W/2-.004,.082,-.03)); 
  const btn=new THREE.InstancedMesh(new RoundedBoxGeometry(.004,.011,.017,2,.0018),LM.body2,14), mt=new THREE.Matrix4(); let bi=0; for(let r=0;r<2;r++) for(let c=0;c<6;c++){ if(r===1&&c>3) continue; mt.makeTranslation(-W/2-.0065,.11-r*.02,-.095+c*.025); btn.setMatrixAt(bi++,mt); } btn.count=bi; st.add(btn);
  const stl=lvLabel('A 1080/59.94  ● REC  TC 01:12',.07,.011,.0002,'#cfd6dc','#0b0d10'); stl.rotation.y=-Q; stl.position.set(-W/2-.0057,.068,.0); st.add(stl);
  st.add(at(lvrb(.004,.026,.05,LM.body2,.004),-W/2-.006,.048,-.07)); st.add(at(lvrb(.005,.008,.012,LM.dark,.002),-W/2-.008,.048,-.04));
  for(let i=0;i<7;i++) st.add(at(lvrb(.003,.05,.004,LM.dark,.0012),-W/2-.0045,.075,-.15+i*.008));
  // the lens: barrel, zoom, focus and iris rings, an amber index ring, front element and a short square hood
  const L=grp(st,0,.082,.13); L.rotation.x=Q;
  L.add(lathe([[0,0],[.04,0],[.043,.006],[.043,.03],[.047,.034],[.047,.11],[.05,.114],[.05,.15],[.046,.154],[0,.154]],LM.ring,48));
  for(const [y,h,r] of [[.045,.03,.0495],[.085,.022,.0505],[.128,.018,.052]]) L.add(at(cyl(r,r,h,LM.knurl,48),0,y,0));
  for(const y of [.031,.06,.098,.14]) L.add(at(cyl(.0485,.0485,.0015,M.alu,48),0,y,0)); L.add(at(cyl(.0512,.0512,.003,M.amber,48),0,.117,0));
  L.add(at(lvrb(.022,.034,.03,LM.body2,.005),.052,.06,0)); L.add(at(lvrb(.006,.014,.01,M.alu,.002),.064,.06,.0));         // the servo zoom box
  const hg=new THREE.CylinderGeometry(.076,.06,.045,4,1,true); hg.rotateY(Math.PI/4); const hood=mesh(hg,std(0x141517,.6,.1,{side:THREE.DoubleSide})); hood.position.y=.176; hood.scale.set(1.18,1,.8); L.add(hood);
  L.add(at(cyl(.044,.044,.004,LM.glass,48),0,.152,0)); L.add(at(cyl(.032,.032,.001,LM.coat,40),0,.1545,0));
  // the carry handle: one loop from the front post to the back, an audio block at the front, a shotgun mic on the left
  const hd=grp(st,0,.15,0); hd.add(mesh(lvTubeG([[0,-.002,.075],[0,.045,.08],[0,.068,.05],[0,.072,-.02],[0,.066,-.08],[0,.04,-.11],[0,-.002,-.115]],.011,48,12),LM.body2));
  hd.add(at(lvrb(.034,.03,.034,LM.body,.008),0,.012,.075)); hd.add(at(lvrb(.034,.022,.03,LM.body,.008),0,.008,-.11));
  hd.add(at(lvrb(.05,.034,.05,LM.body,.008),0,.074,.105)); for(const sx of [-1,1]){ hd.add(at(rot(cyl(.009,.009,.012,M.alu,18),0,0,Q),sx*.027,.074,.11)); hd.add(at(rot(cyl(.0062,.0062,.0124,LM.dark,14),0,0,Q),sx*.027,.074,.11)); }
  for(let i=0;i<2;i++) hd.add(at(cyl(.0065,.0065,.008,LM.ring,14),-.012+i*.024,.094,.098));
  hd.add(at(rot(cyl(.004,.004,.04,M.steel,8),0,0,Q),-.032,.07,.07)); for(const z of [.07,.15]) hd.add(at(rot(mesh(new THREE.TorusGeometry(.014,.0035,8,22),M.satin),0,Q,0),-.05,.07,z));
  const mic=grp(hd,-.05,.07,.11); mic.add(rot(cyl(.0105,.0105,.16,LM.ring,20),Q)); mic.add(at(rot(cyl(.0108,.0108,.02,M.alu,20),Q),0,0,-.07)); for(let i=0;i<10;i++) mic.add(at(lvrb(.0216,.0012,.006,LM.dark,.0005),0,.0098,.0+i*.008)); mic.add(at(rot(lathe([[0,0],[.0108,0],[.0112,.004],[.009,.008],[0,.009]],LM.ring,20),Q),0,0,.08));
  const tl=at(lvrb(.016,.006,.008,lvTally,.002),0,.085,-.02); tl.userData.live=true; hd.add(tl); const tf=at(lvrb(.012,.008,.003,lvTally,.002),0,.074,.131); tf.userData.live=true; hd.add(tf);
  const lab=lvLabel(label,.04,.011,.0002,'#1a1a18','#efece6'); lab.rotation.x=-Q; lab.position.set(0,.0835,-.06); hd.add(lab);
  // the flip-out screen at the front of the handle, open towards the operator
  const fl=grp(hd,-.03,.055,.04); fl.rotation.y=-1.9; fl.add(at(lvrb(.008,.064,.1,LM.body,.006),0,0,.05)); fl.add(at(lvrb(.004,.056,.09,LM.dark,.004),-.0035,0,.05));
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(.084,.05),new THREE.MeshBasicMaterial({map:lvPgm(),toneMapped:false})); scr.rotation.y=-Q; scr.position.set(-.0058,0,.05); scr.userData.live=true; fl.add(scr); fl.add(at(rot(cyl(.005,.005,.07,M.satin,10),Q),.004,0,.05).rotateY(0));
  // the viewfinder at the back left, its eyecup soft rubber
  const vf=grp(st,-.03,.155,-.15); vf.add(rot(cyl(.022,.025,.06,LM.body,24),Q)); vf.add(at(rot(lathe([[0,0],[.024,0],[.031,.01],[.033,.024],[.027,.03],[0,.03]],LM.grip,28),-Q),0,0,-.03)); vf.add(at(lvrb(.02,.03,.03,LM.body2,.005),.02,-.012,.0));
  st.add(at(lvrb(.07,.012,.13,LM.body2,.004),0,.006,-.03)); st.add(at(lvrb(.072,.003,.11,M.alu,.0015),0,-.0005,-.03));    // the plate it sits on
  g.add(lvBake(st)); g.userData={tally:[tl,tf],screen:scr}; return g; }

/* ---------- fluid head and tripod ---------- */
function lvTripod(h=1.25,spread=.36){ const g=new THREE.Group(), st=new THREE.Group(), top=h-.18;
  st.add(at(cyl(.06,.055,.04,LM.body,32),0,top,0)); st.add(at(cyl(.05,.05,.012,M.alu,32),0,top+.026,0));
  for(let k=0;k<3;k++){ const a=k/3*Math.PI*2+Math.PI/6, fx=Math.sin(a)*spread, fz=Math.cos(a)*spread, hub=V(Math.sin(a)*.05,top-.01,Math.cos(a)*.05), foot=V(fx,.03,fz), mid=hub.clone().lerp(foot,.5);
    st.add(rod2(hub,mid,.014,LM.legA)); st.add(rod2(mid,foot,.0095,LM.legB)); st.add(at(cyl(.017,.017,.04,LM.body,16),mid.x,mid.y,mid.z));
    const lk=at(lvrb(.03,.02,.03,LM.body,.006),mid.x,mid.y,mid.z); lk.lookAt(foot.x,foot.y,foot.z); st.add(lk); st.add(at(sph(.022,M.rubber,16,12),fx,.022,fz));
    const sp=hub.clone().lerp(foot,.62); st.add(rod2(V(0,sp.y-.02,0),V(sp.x,sp.y,sp.z),.0045,M.steel)); }
  st.add(at(cyl(.022,.022,.05,LM.body,16),0,(top-.01)*.62+.012,0));
  // the head: bowl, the fluid cartridge, tilt drum, a plate and the pan bar going back
  const hd=grp(st,0,top+.03,0); hd.add(at(lathe([[0,0],[.05,0],[.056,.012],[.052,.03],[0,.03]],LM.body,32),0,0,0)); hd.add(at(lvrb(.1,.05,.11,LM.body2,.012),0,.055,0));
  for(const sx of [-1,1]){ hd.add(at(rot(cyl(.034,.034,.012,LM.body,32),0,0,Q),sx*.056,.06,0)); hd.add(at(rot(cyl(.02,.02,.006,M.alu,24),0,0,Q),sx*.064,.06,0)); }
  hd.add(at(rot(cyl(.006,.006,.03,M.amber,12),0,0,Q),.075,.06,0)); hd.add(at(lvrb(.09,.012,.14,LM.body,.004),0,.088,0));
  hd.add(rod2(V(.04,.07,-.05),V(.12,.0,-.42),.011,LM.legA)); hd.add(at(rot(cyl(.016,.016,.11,LM.grip,16),.37,0,.18),.135,-.025,-.48));
  g.add(lvBake(st)); g.userData.top=top+.124; return g; }
// camera on its tripod; returns the group with .cam
function lvCamRig(h=1.25,label='CAM 1',sp=.36){ const g=new THREE.Group(), tp=lvTripod(h,sp); g.add(tp); const c=lvCamera(label); c.position.y=tp.userData.top; g.add(c); g.userData={cam:c,top:tp.userData.top}; return g; }

/* ---------- a PTZ camera: base, yoke and a round head ---------- */
function lvPTZ(label='PTZ 1'){ const g=new THREE.Group(), st=new THREE.Group(), wh=LM.white;
  st.add(at(rbox(.17,.05,.17,wh,.02),0,.025,0)); st.add(at(lvrb(.16,.004,.16,LM.dark,.002),0,.002,0)); st.add(at(lvLabel(label,.06,.011,.0002,'#8b8f94'),0,.03,.0855));
  const yk=grp(g,0,.05,0); const ys=new THREE.Group(); ys.add(at(cyl(.07,.075,.02,wh,40),0,.01,0)); for(const sx of [-1,1]) ys.add(at(rbox(.022,.13,.08,wh,.01),sx*.07,.08,0));
  const hd=grp(ys,0,.1,0); hd.add(rot(cyl(.058,.058,.12,wh,40),0,0,Q)); for(const sx of [-1,1]) hd.add(at(rot(cyl(.04,.04,.004,LM.body2,32),0,0,Q),sx*.0605,0,0));
  const fr=at(rot(lathe([[0,0],[.048,0],[.052,.008],[.05,.03],[0,.03]],LM.dark,40),Q),0,0,.03); hd.add(fr); hd.add(at(rot(cyl(.03,.03,.003,LM.glass,36),Q),0,0,.061)); hd.add(at(rot(cyl(.02,.02,.001,LM.coat,30),Q),0,0,.0628));
  const tl=at(lvrb(.012,.006,.004,lvTally,.002),0,.04,.05); tl.userData.live=true; hd.add(tl);
  yk.add(lvBake(ys)); const hb=yk.children[0]; g.add(lvBake(st)); g.userData={yoke:yk,tally:[tl]}; return g; }

/* ---------- monitors ---------- */
// a small on-camera / desk monitor with its sunhood
function lvFieldMon(map){ const g=new THREE.Group(), st=new THREE.Group(), W=.17, H=.11; st.add(rbox(W+.016,H+.016,.026,LM.body,.006)); st.add(at(lvrb(W+.012,.006,.02,LM.body2,.002),0,-H/2-.008,.004));
  for(let i=0;i<5;i++) st.add(at(lvrb(.012,.004,.004,LM.dark,.0015),-.05+i*.02,-H/2-.008,.015));
  for(const sx of [-1,1]) st.add(at(lvrb(.004,H+.03,.05,LM.dark,.002),sx*(W/2+.01),0,.035)); st.add(at(lvrb(W+.024,.004,.05,LM.dark,.002),0,H/2+.016,.035));
  const s=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map,toneMapped:false})); s.position.z=.0135; s.userData.live=true; st.add(s);
  g.add(lvBake(st)); return g; }
// a multiview: four cameras, preview and program, and audio meters
function lvMultiview(){ const t=ctex(1024,576,()=>{}), g=t.userData.g; t.userData.draw=(tt,on=1,pgm=1)=>{ g.fillStyle='#060708'; g.fillRect(0,0,1024,576); if(on<.02){ t.needsUpdate=true; return; }
  g.globalAlpha=on; const pw=500, ph=282; [[6,6,'PVW',(pgm+1)%4],[518,6,'PGM',pgm]].forEach(([x,y,n,c])=>{ lvShot(g,x,y,pw,ph,[-.3,.25,0,.6][c],tt,c+1); g.lineWidth=6; g.strokeStyle=n==='PGM'?'#ff3b2a':'#47c46b'; g.strokeRect(x+3,y+3,pw-6,ph-6); g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(x+pw/2-48,y+ph-34,96,26); g.fillStyle='#fff'; g.font='700 17px "Geist Mono", monospace'; g.textAlign='center'; g.fillText(n,x+pw/2,y+ph-15); g.textAlign='left'; });
  for(let c=0;c<4;c++){ const x=6+c*254, y=296; lvShot(g,x,y,248,140,[-.3,.25,0,.6][c],tt,c+1); g.lineWidth=4; g.strokeStyle=c===pgm?'#ff3b2a':c===(pgm+1)%4?'#47c46b':'#2a2d31'; g.strokeRect(x+2,y+2,244,136); g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(x+6,y+110,70,22); g.fillStyle='#fff'; g.font='600 14px "Geist Mono", monospace'; g.fillText('CAM '+(c+1),x+12,y+126); }
  g.fillStyle='#101215'; g.fillRect(6,442,1012,128); for(let i=0;i<16;i++){ const v=.25+.6*Math.abs(Math.sin(tt*2.1+i*1.7)*Math.cos(tt*.7+i)); g.fillStyle='#1a1d21'; g.fillRect(20+i*38,456,22,100); g.fillStyle=v>.82?'#ff6a3a':v>.65?'#E8892D':'#47c46b'; g.fillRect(20+i*38,556-v*100,22,v*100); }
  g.fillStyle='#c9d0d6'; g.font='600 16px "Geist Mono", monospace'; g.fillText('STREAM',660,480); g.fillStyle='#ff3b2a'; g.beginPath(); g.arc(750,474,7,0,7); g.fill(); g.fillStyle='#c9d0d6'; g.fillText('ON AIR',764,480); g.fillText('REC  ● 01:12:'+String(Math.floor(tt)%60).padStart(2,'0'),660,512); g.fillStyle='#7d8791'; g.fillText('1080p59.94  6.0 Mb/s',660,544);
  g.globalAlpha=1; t.needsUpdate=true; }; t.userData.draw(0); return t; }

/* ---------- a compact switcher: program and preview rows, a T-bar ---------- */
function lvSwitcher(n=8){ const g=new THREE.Group(), st=new THREE.Group(), W=.36, D=.2;
  st.add(lvProfile([[-D/2,0],[D/2,0],[D/2,.024],[-D/2,.058]],W,LM.body,.006)); st.add(at(lvrb(W-.01,.003,D-.012,LM.dark,.0015),0,.0425,0).rotateX(.17));
  const top=new THREE.Group(); top.position.set(0,.041,0); top.rotation.x=.17; st.add(top);
  top.add(at(lvLabel('PROGRAM',.05,.008,.0002,'#9aa1a8'),-.15,.0028,-.02).rotateX(-Q)); top.add(at(lvLabel('PREVIEW',.05,.008,.0002,'#9aa1a8'),-.15,.0028,.03).rotateX(-Q));
  const lcd=new THREE.Mesh(new THREE.PlaneGeometry(.07,.03),new THREE.MeshBasicMaterial({toneMapped:false,map:ctex(280,120,(c,w,h)=>{ c.fillStyle='#0b0d10'; c.fillRect(0,0,w,h); c.fillStyle='#E8892D'; c.font='700 30px "Geist Mono", monospace'; c.fillText('MIX 1.0s',14,46); c.fillStyle='#cfd6dc'; c.font='500 20px "Geist Mono", monospace'; c.fillText('PGM 1  PVW 2',14,86); })})); lcd.rotation.x=-Q; lcd.position.set(.0,.003,-.065); top.add(lcd);
  for(let i=0;i<4;i++) top.add(at(cyl(.008,.009,.012,LM.ring,20),.06+i*.024,.007,-.068));
  // T-bar in its slot
  top.add(at(lvrb(.014,.0015,.1,LM.dark,.0007),.15,.0022,.0)); const tb=grp(top,.15,.002,.02); tb.add(at(rot(cyl(.004,.004,.05,M.steel,10),0,0,0),0,.025,0)); tb.add(at(rot(cyl(.007,.007,.07,M.alu,16),0,0,Q),0,.05,0)); tb.add(at(rot(cyl(.009,.009,.02,M.amber,16),0,0,Q),-.03,.05,0)); tb.rotation.x=-.35; tb.userData.live=true;
  // keys: instanced, lit by the live state
  const keys=new THREE.InstancedMesh(new RoundedBoxGeometry(.016,.007,.016,2,.002),new THREE.MeshBasicMaterial({toneMapped:false}),n*2+8), mt=new THREE.Matrix4(); let k=0; const slots=[];
  for(let r=0;r<2;r++) for(let c=0;c<n;c++){ mt.makeTranslation(-.115+c*.024,.004,-.02+r*.05); keys.setMatrixAt(k,mt); slots.push({k,r,c}); k++; }
  for(let c=0;c<8;c++){ mt.makeTranslation(-.115+c*.024,.004,.075); keys.setMatrixAt(k,mt); slots.push({k,r:2,c}); k++; }
  keys.count=k; keys.userData.live=true; top.add(keys); const off=new THREE.Color(0x2c2e33), red=new THREE.Color(0xff3b2a), grn=new THREE.Color(0x3fcf68), amb=new THREE.Color(AMBER), wht=new THREE.Color(0x9aa0a6);
  const set=(pgm,pvw,cut=-1)=>{ for(const s of slots){ keys.setColorAt(s.k, s.r===0&&s.c===pgm?red : s.r===1&&s.c===pvw?grn : s.r===2&&s.c===0?amb : s.r===2&&s.c===cut?wht : off); } keys.instanceColor.needsUpdate=true; }; set(0,1);
  for(const sx of [-1,1]) for(const sz of [-1,1]) st.add(at(cyl(.008,.009,.004,M.rubber,12),sx*(W/2-.03),-.001,sz*(D/2-.025)));
  g.add(lvBake(st)); g.userData={set,tbar:tb}; return g; }

/* ---------- a streaming encoder the size of a paperback ---------- */
function lvEncoder(){ const g=new THREE.Group(), st=new THREE.Group(), W=.19, H=.045, D=.13; st.add(at(rbox(W,H,D,LM.body2,.01),0,H/2,0)); for(let i=0;i<9;i++) st.add(at(lvrb(.004,.026,.002,LM.dark,.001),-.07+i*.012,H/2+.004,-D/2-.0005));
  const sc=ctex(256,128,()=>{}), c=sc.userData.g; sc.userData.draw=(tt,on)=>{ c.fillStyle='#07090b'; c.fillRect(0,0,256,128); c.fillStyle=on>.5?'#ff3b2a':'#5c6168'; c.beginPath(); c.arc(24,30,10,0,7); c.fill(); c.fillStyle='#fff'; c.font='700 26px "Geist Mono", monospace'; c.fillText(on>.5?'LIVE':'READY',42,40);
    c.fillStyle='#8f989f'; c.font='500 17px "Geist Mono", monospace'; c.fillText(on>.5?'00:'+String(52+(tt/60|0)).padStart(2,'0')+':'+String(Math.floor(tt)%60).padStart(2,'0'):'--:--:--',150,38); for(let i=0;i<12;i++){ const v=on>.5?.4+.5*Math.abs(Math.sin(tt*1.4+i)):.08; c.fillStyle=on>.5?'#E8892D':'#2a2d31'; c.fillRect(18+i*19,112-v*52,13,v*52); } sc.needsUpdate=true; }; sc.userData.draw(0,0);
  const s=new THREE.Mesh(new THREE.PlaneGeometry(.075,.0375),new THREE.MeshBasicMaterial({map:sc,toneMapped:false})); s.position.set(-.04,H/2,D/2+.0006); s.userData.live=true; st.add(s);
  st.add(at(lvrb(.08,.042,.002,LM.dark,.001),-.04,H/2,D/2+.0002)); for(let i=0;i<3;i++) st.add(at(rot(cyl(.007,.007,.006,LM.ring,16),Q),.035+i*.02,H/2,D/2+.002)); const led=at(lvrb(.01,.004,.002,lvTally,.001),.075,H/2+.012,D/2+.001); led.userData.live=true; st.add(led);
  for(const sx of [-1,1]) for(const sz of [-1,1]) st.add(at(cyl(.008,.009,.004,M.rubber,12),sx*(W/2-.02),.002,sz*(D/2-.02)));
  g.add(lvBake(st)); g.userData={scr:sc,led}; return g; }

/* ---------- a small rolling case to put the kit on ---------- */
function lvCase(W=.6,H=.55,D=.45){ const g=new THREE.Group(), st=new THREE.Group(), Y0=.07;
  st.add(at(rbox(W,H,D,LM.lam,.01),0,Y0+H/2,0)); for(const sz of [-1,1]){ for(const sy of [0,1]) st.add(at(rbox(W+.012,.024,.024,M.alu,.006),0,Y0+sy*H,sz*D/2)); for(const sx of [-1,1]){ st.add(at(rbox(.024,H,.024,M.alu,.006),sx*W/2,Y0+H/2,sz*D/2)); for(const sy of [0,1]) st.add(at(sph(.026,M.steel,16,12),sx*W/2,Y0+sy*H,sz*D/2)); } }
  for(const sx of [-1,1]) for(const sy of [0,1]) st.add(at(rbox(.024,.024,D,M.alu,.006),sx*W/2,Y0+sy*H,0));
  for(const sx of [-1,1]){ const hd=grp(st,sx*(W/2+.001),Y0+H*.6,0); hd.add(lvrb(.006,.1,.18,M.alu,.003)); hd.add(at(lvrb(.016,.016,.11,M.steel,.007),sx*.009,-.02,0)); }
  for(const x of [-W/2+.14,W/2-.14]){ const l=grp(st,x,Y0+H-.075,D/2+.001); l.add(lvrb(.08,.09,.006,M.alu,.003)); l.add(at(rot(cyl(.024,.024,.005,LM.dark,24),Q),0,0,.004)); l.add(at(lvrb(.036,.012,.008,M.steel,.003),0,0,.007)); }
  for(const sx of [-1,1]) for(const sz of [-1,1]){ const w=grp(st,sx*(W/2-.07),0,sz*(D/2-.07)); w.add(at(lvrb(.07,.012,.07,M.steel,.003),0,Y0-.006,0)); w.add(at(lvrb(.02,.03,.04,M.steel,.003),0,Y0-.025,0)); w.add(at(rot(cyl(.03,.03,.022,M.rubber,24),0,0,Q),0,.03,0)); w.add(at(rot(cyl(.014,.014,.024,M.alu,16),0,0,Q),0,.03,0)); }
  const lab=lvLabel('LIVE KIT 01',.16,.03,.0004,'#1a1a18','#efece6'); lab.position.set(-W/2+.13,Y0+.08,D/2+.002); st.add(lab); st.add(at(lvrb(.03,.03,.003,M.amber,.002),-W/2+.235,Y0+.08,D/2+.002));
  g.add(lvBake(st)); g.userData.top=Y0+H+.012; return g; }

/* ---------- the flypack: a production case whose lid lifts to a multiview, with the switcher below ---------- */
function lvFlypack(){ const g=new THREE.Group(), st=new THREE.Group(), W=.74, D=.56, H=.3, Y0=.07, T=Y0+H;
  st.add(at(rbox(W,H,D,LM.lam,.012),0,Y0+H/2,0)); for(const sz of [-1,1]){ for(const sy of [0,1]) st.add(at(rbox(W+.012,.026,.026,M.alu,.006),0,Y0+sy*H,sz*D/2)); for(const sx of [-1,1]){ st.add(at(rbox(.026,H,.026,M.alu,.006),sx*W/2,Y0+H/2,sz*D/2)); for(const sy of [0,1]) st.add(at(sph(.028,M.steel,16,12),sx*W/2,Y0+sy*H,sz*D/2)); } }
  for(const sx of [-1,1]) for(const sy of [0,1]) st.add(at(rbox(.026,.026,D,M.alu,.006),sx*W/2,Y0+sy*H,0));
  for(const sx of [-1,1]) for(const sz of [-1,1]){ const w=grp(st,sx*(W/2-.08),0,sz*(D/2-.08)); w.add(at(lvrb(.07,.012,.07,M.steel,.003),0,Y0-.006,0)); w.add(at(lvrb(.02,.03,.04,M.steel,.003),0,Y0-.025,0)); w.add(at(rot(cyl(.03,.03,.022,M.rubber,24),0,0,Q),0,.03,0)); w.add(at(rot(cyl(.014,.014,.024,M.alu,16),0,0,Q),0,.03,0)); }
  for(const sx of [-1,1]){ const hd=grp(st,sx*(W/2+.001),Y0+H*.55,0); hd.add(lvrb(.006,.1,.18,M.alu,.003)); hd.add(at(lvrb(.016,.016,.11,M.steel,.007),sx*.009,-.02,0)); }
  // the work surface: a recess with the switcher, an audio strip and the rack units' fronts facing the operator
  st.add(at(box(W-.05,.004,D-.05,LM.foam),0,T-.003,0));
  const lab=lvLabel('FLYPACK · 4 CAM',.22,.032,.0004,'#1a1a18','#efece6'); lab.position.set(-.14,Y0+H*.45,D/2+.002); st.add(lab); st.add(at(lvrb(.032,.032,.003,M.amber,.002),.03,Y0+H*.45,D/2+.002));
  for(let i=0;i<12;i++) st.add(at(lvrb(.004,.06,.002,LM.dark,.001),.12+i*.014,Y0+H*.45,D/2+.0015));
  g.add(lvBake(st));
  const sw=lvSwitcher(8); sw.position.set(-.05,T,.08); g.add(sw);
  const au=new THREE.Group(); { const a=new THREE.Group(); a.add(at(rbox(.16,.03,.2,LM.body,.006),0,.015,0)); for(let i=0;i<4;i++){ a.add(at(lvrb(.006,.002,.12,LM.dark,.001),-.054+i*.036,.031,.01)); a.add(at(lvrb(.018,.012,.01,LM.white,.003),-.054+i*.036,.036,.03-i*.02)); a.add(at(cyl(.007,.008,.01,LM.ring,16),-.054+i*.036,.035,-.075)); } au.add(lvBake(a)); }
  au.position.set(.25,T,.12); g.add(au);
  // the lid: hinged at the back, its inside carrying the multiview screen
  const lid=grp(g,0,T,-D/2), ls=new THREE.Group(), LH=.1; ls.add(at(rbox(W,LH,D,LM.lam,.012),0,LH/2,D/2)); for(const sy of [0,1]) for(const sz of [0,1]) ls.add(at(rbox(W+.012,.026,.026,M.alu,.006),0,sy*LH,sz*D));
  for(const sx of [-1,1]){ for(const sz of [0,1]){ ls.add(at(rbox(.026,LH,.026,M.alu,.006),sx*W/2,LH/2,sz*D)); ls.add(at(sph(.028,M.steel,16,12),sx*W/2,LH,sz*D)); } ls.add(at(rbox(.026,.026,D,M.alu,.006),sx*W/2,LH,D/2)); }
  ls.add(at(box(W-.06,.003,D-.06,LM.dark),0,-.0005,D/2)); ls.add(at(lvrb(.62,.008,.37,LM.body,.004),0,-.004,D/2+.01));
  const mv=lvMultiview(), scr=new THREE.Mesh(new THREE.PlaneGeometry(.6,.3375),new THREE.MeshBasicMaterial({map:mv,toneMapped:false})); scr.rotation.x=Q; scr.position.set(0,-.0086,D/2+.01); scr.userData.live=true; ls.add(scr);
  ls.add(at(rot(cyl(.012,.012,W-.1,M.alu,16),0,0,Q),0,0,0)); lid.add(lvBake(ls));
  for(const sx of [-1,1]){ const arm=at(rot(cyl(.004,.004,.2,M.steel,8),0,0,0),sx*(W/2-.03),T+.1,-D/2+.08); arm.visible=false; g.add(arm); }
  g.userData={lid,mv,sw,top:T}; return g; }

/* ---------- VJ: a laptop running the clip grid, a pad controller, and a screen with the visuals ---------- */
function lvVisuals(){ const t=ctex(768,432,()=>{}), g=t.userData.g; t.userData.draw=(tt,k=1)=>{ const beat=Math.pow(Math.max(0,Math.sin(tt*Math.PI*2*2.1)),6)*k;
  g.fillStyle='#07080a'; g.fillRect(0,0,768,432); g.save(); g.translate(384,216);
  for(let i=0;i<18;i++){ const r=40+i*22+((tt*60)%22), a=.08+.5*(1-i/18)*(.35+.65*k); g.strokeStyle=i%3?`rgba(232,137,45,${a})`:`rgba(255,236,214,${a*.8})`; g.lineWidth=2+beat*6*(1-i/18); g.beginPath(); for(let s=0;s<=96;s++){ const th=s/96*Math.PI*2, w=1+.08*k*Math.sin(th*6+tt*1.6+i*.4)+.05*beat*Math.sin(th*14); const x=Math.cos(th)*r*w*1.35, y=Math.sin(th)*r*w*.8; s?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); }
  g.rotate(tt*.15); for(let i=0;i<24;i++){ g.rotate(Math.PI*2/24); const len=60+180*k*Math.abs(Math.sin(tt*1.7+i*.9))+beat*40; g.fillStyle=`rgba(232,137,45,${.15+.4*k})`; g.fillRect(70,-2,len,4); }
  g.restore(); const gr=g.createRadialGradient(384,216,0,384,216,140); gr.addColorStop(0,`rgba(255,240,220,${.25+.6*beat})`); gr.addColorStop(1,'rgba(255,240,220,0)'); g.fillStyle=gr; g.fillRect(0,0,768,432); t.needsUpdate=true; }; t.userData.draw(0); return t; }
function lvClipGrid(){ const t=ctex(1024,640,()=>{}), g=t.userData.g, cols=['#E8892D','#3d6d8f','#8a4f9e','#4f9e6e','#c9b98a','#b84a3a']; t.userData.draw=(tt,k=1)=>{ g.fillStyle='#14161a'; g.fillRect(0,0,1024,640); g.fillStyle='#1d2025'; g.fillRect(0,0,1024,32);
  g.font='600 15px "Geist Mono", monospace'; g.fillStyle='#c9d0d6'; g.fillText('COMPOSITION  ·  128 BPM',16,22); g.fillStyle='#E8892D'; for(let i=0;i<4;i++){ g.globalAlpha=i===Math.floor(tt*2.13)%4?1:.25; g.fillRect(900+i*26,10,18,12); } g.globalAlpha=1;
  const live=Math.floor(tt/2.5)%8; for(let r=0;r<3;r++){ g.fillStyle='#6c747c'; g.fillText('LAYER '+(3-r),14,78+r*120); for(let c=0;c<8;c++){ const x=100+c*112, y=44+r*120, on=(r===1&&c===live)||(r===0&&c===(live+3)%8)||(r===2&&c===2);
    const gr=g.createLinearGradient(x,y,x+104,y+104); gr.addColorStop(0,cols[(c+r*2)%6]); gr.addColorStop(1,'#101215'); g.fillStyle=gr; g.globalAlpha=on?1:.55; lvRR(g,x,y,104,104,6); g.globalAlpha=1;
    g.strokeStyle='rgba(255,255,255,.5)'; g.lineWidth=2; g.beginPath(); g.arc(x+52,y+52,18+((c*7+r*3)%14)+(on?Math.sin(tt*4)*6:0),0,7); g.stroke(); if(on){ g.strokeStyle='#E8892D'; g.lineWidth=4; g.strokeRect(x+2,y+2,100,100); } } }
  g.fillStyle='#0b0c0e'; g.fillRect(16,410,480,220); const v=lvVisuals.p||(lvVisuals.p=lvVisuals()); g.drawImage(v.userData.c,16,410,480,220*.98); g.fillStyle='#6c747c'; g.fillText('OUTPUT',24,428);
  for(let i=0;i<3;i++){ g.fillStyle='#1d2025'; g.fillRect(520,420+i*66,488,52); g.fillStyle='#6c747c'; g.fillText(['OPACITY','SPEED','REACT TO AUDIO'][i],532,442+i*66); const f=[.8,.5+.2*Math.sin(tt*.6),.6+.35*k][i]; g.fillStyle='#2b2f35'; g.fillRect(532,452+i*66,460,8); g.fillStyle='#E8892D'; g.fillRect(532,452+i*66,460*f,8); }
  t.needsUpdate=true; }; t.userData.draw(0); return t; }
function lvLaptop(map){ const g=new THREE.Group(), st=new THREE.Group(), W=.36, D=.245; st.add(at(rbox(W,.014,D,M.alu,.008),0,.007,0)); st.add(at(lvrb(W-.03,.002,.1,LM.dark,.001),0,.0145,-.05)); st.add(at(lvrb(.12,.0012,.075,std(0xbdbab3,.3,.85),.002),0,.0142,.07));
  const keys=new THREE.InstancedMesh(new RoundedBoxGeometry(.0155,.003,.0155,2,.0015),LM.dark,70), mt=new THREE.Matrix4(); let n=0; for(let r=0;r<5;r++) for(let c=0;c<14;c++){ mt.makeTranslation(-W/2+.032+c*.0213,.0155,-.09+r*.019); keys.setMatrixAt(n++,mt); } keys.count=n; st.add(keys);
  const lid=grp(st,0,.014,-D/2+.004); lid.rotation.x=-.32; lid.add(at(rbox(W,.23,.008,M.alu,.006),0,.115,-.004)); lid.add(at(lvrb(W-.012,.218,.002,LM.dark,.004),0,.115,.0005));
  const s=new THREE.Mesh(new THREE.PlaneGeometry(W-.03,.2),new THREE.MeshBasicMaterial({map,toneMapped:false})); s.position.set(0,.117,.0018); s.userData.live=true; lid.add(s);
  g.add(lvBake(st)); return g; }
function lvPads(){ const g=new THREE.Group(), st=new THREE.Group(), W=.25, D=.27; st.add(at(rbox(W,.03,D,LM.body,.01),0,.015,0)); st.add(at(lvrb(W-.016,.002,D-.016,LM.dark,.002),0,.0305,0));
  for(let i=0;i<8;i++) st.add(at(cyl(.008,.009,.012,LM.ring,18),-.098+i*.028,.036,-.112)); for(let i=0;i<8;i++) st.add(at(lvrb(.008,.008,.008,LM.body2,.002),.112,.034,-.09+i*.028));
  const pads=new THREE.InstancedMesh(new RoundedBoxGeometry(.023,.006,.023,2,.003),new THREE.MeshBasicMaterial({toneMapped:false}),64), mt=new THREE.Matrix4(); for(let r=0;r<8;r++) for(let c=0;c<8;c++){ mt.makeTranslation(-.098+c*.0275,.034,-.083+r*.0275); pads.setMatrixAt(r*8+c,mt); pads.setColorAt(r*8+c,new THREE.Color(0x222428)); }
  pads.userData.live=true; st.add(pads); const cA=new THREE.Color(AMBER), cB=new THREE.Color(0x3d6d8f), cO=new THREE.Color(0x222428), cW=new THREE.Color(0xffe2c0), tmp=new THREE.Color();
  const draw=(tt,k=1)=>{ const col=Math.floor(tt*2.13*2)%8; for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const lvl=Math.abs(Math.sin(tt*1.3+c*.7))*8*k; let cc=r>=8-lvl?(r<3?cW:cA):((r+c)%5===0?cB:cO); if(c===col&&k>.2) cc=tmp.copy(cc).lerp(cW,.5); pads.setColorAt(r*8+c,cc); } pads.instanceColor.needsUpdate=true; };
  g.add(lvBake(st)); g.userData.draw=draw; return g; }
// a big screen on two feet, for the visuals (or the program); map is a canvas texture
function lvBigScreen(map,W=2.2,H=1.2375,y0=.55){ const g=new THREE.Group(), st=new THREE.Group(); st.add(at(rbox(W+.04,H+.04,.05,LM.body,.012),0,y0+H/2,-.025)); st.add(at(rbox(W*.5,H*.55,.06,LM.body2,.02),0,y0+H/2,-.07));
  for(const sx of [-1,1]){ const x=sx*W*.32; st.add(at(rbox(.05,y0+H*.4,.04,LM.legA,.008),x,(y0+H*.4)/2,-.09)); st.add(at(rbox(.08,.03,.7,LM.body,.01),x,.015,-.09)); for(const sz of [-1,1]) st.add(at(cyl(.022,.024,.012,M.rubber,14),x,.006,-.09+sz*.32)); }
  const s=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map,toneMapped:false})); s.position.set(0,y0+H/2,.0012); s.userData.live=true; st.add(s);
  st.add(at(lvLabel('●',.02,.01,.0005,'#3a3d42'),W/2-.03,y0-.012,.0012));
  const o=lvBake(st); g.add(o); g.userData.screen=s; return g; }

/* ---------- hybrid: a panel table, gooseneck mics, and remote guests on the screen ---------- */
function lvRemote(){ const t=ctex(1024,576,()=>{}), g=t.userData.g, names=[['AK','Remote 01'],['JL','Remote 02'],['MR','Remote 03'],['TS','Remote 04'],['PD','Remote 05'],['EN','Remote 06']], tints=['#3d6d8f','#8a4f9e','#4f9e6e','#b06a3a','#5a6a8a','#9e8a4f'];
  t.userData.draw=(tt,n=6)=>{ g.fillStyle='#0b0c0f'; g.fillRect(0,0,1024,576); lvShot(g,16,16,640,360,0,tt,1); g.fillStyle='rgba(0,0,0,.55)'; lvRR(g,30,30,150,32,6); g.fillStyle='#ff3b2a'; g.beginPath(); g.arc(48,46,7,0,7); g.fill(); g.fillStyle='#fff'; g.font='700 16px "Geist Mono", monospace'; g.fillText('ON SITE',62,52);
    const talk=Math.floor(tt/3)%Math.max(1,Math.floor(n)); for(let i=0;i<6;i++){ const x=i<3?672:16+(i-3)*214, y=i<3?16+i*120:392, w=i<3?336:206, h=i<3?112:168, a=clamp(n-i);
      g.globalAlpha=a; g.fillStyle='#16181d'; lvRR(g,x,y,w,h,8); g.fillStyle=tints[i]; g.beginPath(); g.arc(x+w/2,y+h*.46,Math.min(w,h)*.24,0,7); g.fill(); g.fillStyle='#fff'; g.font='700 '+Math.round(Math.min(w,h)*.17)+'px "Geist", sans-serif'; g.textAlign='center'; g.fillText(names[i][0],x+w/2,y+h*.46+Math.min(w,h)*.06); g.textAlign='left';
      g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(x+6,y+h-26,108,20); g.fillStyle='#d9dde0'; g.font='600 13px "Geist Mono", monospace'; g.fillText(names[i][1],x+12,y+h-11);
      if(i===talk&&a>.9){ g.strokeStyle='#E8892D'; g.lineWidth=4; g.strokeRect(x+2,y+2,w-4,h-4); for(let b=0;b<5;b++){ const v=.3+.7*Math.abs(Math.sin(tt*6+b)); g.fillStyle='#E8892D'; g.fillRect(x+w-50+b*8,y+h-12-v*14,5,v*14); } } }
    g.globalAlpha=1; g.fillStyle='#16181d'; lvRR(g,656,392,352,168,8); g.fillStyle='#7d8791'; g.font='600 15px "Geist Mono", monospace'; g.fillText('WATCHING ONLINE',676,428); g.fillStyle='#fff'; g.font='700 52px "Geist", sans-serif'; g.fillText(String(Math.round(180+n*40+Math.sin(tt*.3)*6)),676,492); g.fillStyle='#7d8791'; g.font='500 14px "Geist Mono", monospace'; g.fillText('Q&A  ·  '+Math.floor(3+n*2)+' questions',676,530);
    t.needsUpdate=true; }; t.userData.draw(0,6); return t; }
function lvGooseneck(){ const g=new THREE.Group(), st=new THREE.Group(); st.add(at(lathe([[0,0],[.06,0],[.064,.006],[.058,.02],[.02,.026],[0,.026]],LM.body,40),0,0,0)); st.add(at(lvrb(.03,.004,.012,LM.dark,.002),0,.022,.035));
  const r=at(lvrb(.014,.006,.006,lvTally,.002),0,.025,.04); r.userData.live=true; st.add(r);
  st.add(mesh(lvTubeG([[0,.026,0],[0,.14,-.005],[0,.28,.02],[0,.36,.08],[0,.39,.15]],.0045,40,8),LM.knurl)); st.add(at(rot(cyl(.009,.011,.07,LM.ring,18),1.1,0,0),0,.405,.18)); st.add(at(rot(cyl(.0115,.0115,.008,M.alu,18),1.1,0,0),0,.42,.21));
  g.add(lvBake(st)); g.userData.led=r; return g; }
function lvChair(){ const g=new THREE.Group(), st=new THREE.Group(); st.add(at(rbox(.5,.08,.48,LM.seat,.035),0,.44,0)); const b=at(rbox(.5,.38,.07,LM.seat,.03),0,.66,-.21); b.rotation.x=-.16; st.add(b);
  for(const sx of [-1,1]){ st.add(at(rbox(.06,.2,.5,LM.seat,.025),sx*.27,.52,-.01)); for(const sz of [-1,1]){ const l=at(cyl(.014,.01,.4,M.satin,12),sx*.2,.2,sz*.17); l.rotation.set(sz*.08,0,-sx*.08); st.add(l); st.add(at(cyl(.012,.012,.008,M.rubber,10),sx*.215,.004,sz*.185)); } }
  g.add(lvBake(st)); return g; }
function lvPanelTable(W=1.9,D=.62,H=.74){ const g=new THREE.Group(), st=new THREE.Group(); st.add(at(rbox(W,.03,D,LM.white,.01),0,H-.015,0)); st.add(at(rbox(W-.04,.24,.012,LM.cloth,.004),0,H-.15,D/2-.03));
  for(const sx of [-1,1]){ const x=sx*(W/2-.12); st.add(at(rbox(.05,H-.05,.05,LM.legA,.01),x,(H-.03)/2,-.0)); st.add(at(rbox(.07,.024,D-.08,LM.body,.008),x,.012,0)); for(const sz of [-1,1]) st.add(at(cyl(.018,.02,.01,M.rubber,14),x,.005,sz*(D/2-.07))); st.add(at(rbox(.05,.04,D-.1,LM.body,.008),x,H-.05,0)); }
  st.add(at(rbox(W-.3,.05,.03,LM.body,.008),0,H-.06,-D/2+.06)); st.add(at(lvrb(.05,.05,.003,M.amber,.002),W/2-.2,H-.15,D/2-.0225));
  g.add(lvBake(st)); return g; }
function lvPole(h=1.4){ const st=new THREE.Group(); st.add(lathe([[0,0],[.17,0],[.18,.005],[.18,.012],[.17,.017],[.05,.022],[.03,.03],[0,.03]],M.black,56)); st.add(at(cyl(.016,.016,h-.03,M.satin,20),0,(h+.03)/2,0)); st.add(at(cyl(.022,.022,.05,M.black,20),0,h*.55,0)); st.add(at(rot(cyl(.005,.005,.03,M.steel,10),0,0,Q),.03,h*.55,0));
  st.add(at(rbox(.14,.012,.14,LM.body,.004),0,h+.006,0)); st.add(at(cyl(.03,.03,.02,M.black,20),0,h-.01,0)); const g=new THREE.Group(); g.add(lvBake(st)); g.userData.top=h+.012; return g; }

/* ---------- the opening kit: one camera on its tripod, cabled to a small switcher, a monitor and the encoder on a case ---------- */
function lvStreamKit(G,camPos=[-.55,.15,.35],casePos=[.45,-.25,-.35]){ const rig=lvCamRig(1.25,'CAM 1',.34); rig.position.set(camPos[0],0,camPos[1]); rig.rotation.y=camPos[2]; G.add(rig);
  const cs=lvCase(.6,.5,.42); cs.position.set(casePos[0],0,casePos[1]); cs.rotation.y=casePos[2]; G.add(cs); const top=cs.userData.top;
  const sw=lvSwitcher(4+4); sw.position.set(-.06,top,.06); sw.scale.setScalar(.92); cs.add(sw);
  const en=lvEncoder(); en.position.set(.16,top,-.11); en.rotation.y=-.12; cs.add(en);
  const mon=lvFieldMon(lvPgm()); mon.position.set(-.1,top+.13,-.11); mon.rotation.x=-.1; cs.add(mon); { const s=new THREE.Group(); s.add(at(cyl(.006,.006,.12,M.satin,10),0,.06,0)); s.add(at(cyl(.03,.034,.008,LM.body,20),0,.004,0)); s.position.set(-.1,top,-.11); cs.add(lvBake(s)); }
  // the camera's lead runs down the tripod, over the floor and up into the case
  G.updateWorldMatrix(true,true); const a=G.worldToLocal(rig.localToWorld(V(0,rig.userData.top+.03,-.14))), b=G.worldToLocal(cs.localToWorld(V(-.2,top+.01,-.16)));
  const mid=G.worldToLocal(rig.localToWorld(V(.04,.6,-.05))), f1=G.worldToLocal(rig.localToWorld(V(.05,.006,-.1))), f2=G.worldToLocal(cs.localToWorld(V(-.36,.006,-.1)));
  const pts=[a,mid,f1,f1.clone().lerp(f2,.35).add(V(0,0,.08)),f1.clone().lerp(f2,.7).add(V(0,0,-.05)),f2,G.worldToLocal(cs.localToWorld(V(-.31,top*.6,-.12))),b];
  pts.forEach(p=>{ if(p.y<.006) p.y=.006; }); const lead=mesh(lvTubeG(pts,.0045,140,6),LM.cableA,false); G.add(lead);
  return {rig,cs,sw,en,mon,lead}; }

/* what stands for Live video on the homepage: a camera on its tripod, cabled to a small switcher and the encoder on a case */
HERO['live-video']=(G)=>{ const k=lvStreamKit(G); let fr=0; updaters.push(t=>{ if(fr++%4) return; lvPgm().userData.draw(t,1); k.en.userData.scr.userData.draw(t,1); }); for(const m of k.rig.userData.cam.userData.tally) m.material=new THREE.MeshBasicMaterial({color:0xff3b2a,toneMapped:false}); k.en.userData.led.material=new THREE.MeshBasicMaterial({color:0xff3b2a,toneMapped:false}); };

/* ===== live video & visuals page: where things stand and where the camera stops ===== */
const LG=12; // sets sit close so the next slides in as the last one leaves
const lvTallyM=()=>new THREE.MeshBasicMaterial({color:0x3a1512,toneMapped:false});
const lvOn=(meshes,on)=>{ for(const m of meshes){ if(!m.userData.own){ m.material=lvTallyM(); m.userData.own=1; } m.material.color.lerpColors(lvTallyOff,lvTallyOn,on); } };
// opening: one camera on its tripod, cabled to a small switcher, a monitor and the encoder on a case. The range stands beside it and steps aside after the range shot
const lI0=grp(scene,0,0,0), lRange=grp(lI0,0,0,0);
const lHero=lvStreamKit(lI0,[-.45,.55,.6],[.5,-.4,-.3]);
const lMid=grp(lRange,3.9,0,-1.0);
{ const a=lvCamRig(1.25,'CAM 1',.34); a.position.set(-.95,0,.35); a.rotation.y=.45; lMid.add(a); const b=lvCamRig(1.3,'CAM 2',.34); b.position.set(1.0,0,.45); b.rotation.y=-.4; lMid.add(b);
  const cs=lvCase(.6,.5,.42); cs.position.set(0,0,-.35); lMid.add(cs); const sw=lvSwitcher(8); sw.position.set(0,cs.userData.top,.02); cs.add(sw); const mo=lvFieldMon(lvPgm()); mo.position.set(0,cs.userData.top+.14,-.13); cs.add(mo); }
const lBig=grp(lRange,7.9,0,-1.3);
{ const f=lvFlypack(); f.userData.lid.rotation.x=-1.72; lBig.add(f); f.userData.mv.userData.draw(0,1,0);
  for(const [x,z,ry,n] of [[-1.5,.5,.5,'CAM 1'],[1.5,.55,-.5,'CAM 2'],[-.2,1.4,.0,'CAM 3']]){ const c=lvCamRig(1.3,n,.36); c.position.set(x,0,z); c.rotation.y=ry; lBig.add(c); }
  const p=lvPTZ('PTZ 1'); const pc=lvCase(.42,.62,.36); pc.position.set(1.15,0,-.55); pc.rotation.y=-.3; lBig.add(pc); p.position.y=pc.userData.top; pc.add(p); }
// 01 live streaming: the camera goes live; its picture runs down the lead to the encoder and onto the screen behind
const lI1=grp(scene,LG,0,0), lSt=lvStreamKit(lI1,[-.75,.35,.6],[.35,-.2,-.25]), lScr1=lvBigScreen(lvPgm(),2.0,1.125,.6); lScr1.position.set(.25,0,-1.7); lI1.add(lScr1);
const lPulse=new THREE.Mesh(new THREE.SphereGeometry(.012,16,10),new THREE.MeshBasicMaterial({color:0xffc27a,toneMapped:false})); lI1.add(lPulse);
const lPCurve=new THREE.CatmullRomCurve3(lSt.lead.geometry.parameters.path.points);
// 02 switchers & production kits: the flypack's lid lifts to the multiview
const lI2=grp(scene,2*LG,0,0), lFp=lvFlypack(); lFp.rotation.y=-.3; lI2.add(lFp);
// 03 VJ & live visuals: a laptop and a pad controller on a case, the visuals growing on the screen as they come up
const lI3=grp(scene,3*LG,0,0), lVis=lvVisuals(), lGrid=lvClipGrid(), lVs=lvBigScreen(lVis,2.4,1.35,.55); lVs.position.set(.2,0,-1.6); lI3.add(lVs);
const lDesk=lvCase(1.1,.74,.6); lDesk.position.set(-.1,0,.25); lDesk.rotation.y=-.12; lI3.add(lDesk);
const lLap=lvLaptop(lGrid); lLap.position.set(-.18,lDesk.userData.top,0); lLap.rotation.y=.1; lDesk.add(lLap); const lPad=lvPads(); lPad.position.set(.28,lDesk.userData.top,.04); lPad.rotation.y=-.15; lDesk.add(lPad);
// 04 hybrid events: the panel on site, a PTZ on the table's edge, the remote guests arriving on the screen
const lI4=grp(scene,4*LG,0,0), lRem=lvRemote(), lHs=lvBigScreen(lRem,2.4,1.35,.6); lHs.position.set(.1,0,-1.9); lI4.add(lHs);
const lTab=lvPanelTable(1.9,.62,.74); lTab.position.set(0,0,.1); lI4.add(lTab);
for(const x of [-.5,.5]){ const c=lvChair(); c.position.set(x,0,-.45); c.rotation.y=Math.PI; lI4.add(c); }
const lGn=[]; for(const x of [-.5,.5]){ const m=lvGooseneck(); m.position.set(x,.74,.18); m.rotation.y=Math.PI; lI4.add(m); lGn.push(m.userData.led); }
const lPtz=lvPTZ('PTZ 1'); { const s=lvPole(1.35); s.position.set(1.5,0,.9); lI4.add(s); lPtz.position.set(1.5,s.userData.top,.9); lPtz.rotation.y=-2.05; lI4.add(lPtz); }
const lIs=[[lI0,.5],[lI1,2],[lI2,3],[lI3,4],[lI4,5.5]];
let lFr=0; const lCam1=lSt.rig.userData.cam.userData.tally, lCamH=lHero.rig.userData.cam.userData.tally;
updaters.push((t,x)=>{ for(const [g,c] of lIs) g.visible=Math.abs(x-c)<(c===.5||c===5.5?1.6:.9);
  const v=sstep(.25,.8,x)*(1-sstep(1.3,1.62,x)); lRange.scale.setScalar(Math.max(.001,v)); lRange.visible=v>.001;
  const live=sstep(1.55,1.95,x); lvOn(lCam1,live); lvOn([lSt.en.userData.led],live); lvOn(lCamH,1); lvOn([lHero.en.userData.led],1);
  const pf=(t*.45)%1; lPulse.position.copy(lPCurve.getPointAt(pf)); lPulse.visible=lI1.visible&&live>.5;
  const o=sstep(2.45,2.95,x); lFp.userData.lid.rotation.x=-1.72*o;
  const k=.15+.85*sstep(3.5,3.98,x), n=6*sstep(4.45,4.9,x); lvOn(lGn,sstep(4.5,4.8,x)); lPtz.userData.yoke.rotation.y=Math.sin(t*.4)*.25;
  if(lFr++%3) return;
  if(lI0.visible||lI1.visible||lRange.visible) lvPgm().userData.draw(t,lI1.visible?live:1);
  if(lI0.visible) lHero.en.userData.scr.userData.draw(t,1); if(lI1.visible) lSt.en.userData.scr.userData.draw(t,live);
  if(lI2.visible){ const pg=Math.floor(t/3)%4; lFp.userData.mv.userData.draw(t,sstep(2.7,2.95,x),pg); lFp.userData.sw.userData.set(pg,(pg+1)%4); }
  if(lI3.visible){ lVis.userData.draw(t,k); lGrid.userData.draw(t,k); lPad.userData.draw(t,k); }
  if(lI4.visible) lRem.userData.draw(t,n); });
PAGE.keys=(narrow,K,R)=>[
  narrow? R([1.6,1.7,7.6],[-.05,.75,.0],34) : K([1.45,1.4,4.5],[.0,.82,.1],30),                      // hero: a camera and a small kit
  narrow? R([4.3,7.6,36],[4.3,.4,-1.0],34) : K([4.5,3.1,19.5],[4.7,.85,-1.0],30,-.2),                   // the range
  narrow? R([LG+.9,2.5,10.2],[LG+.15,.8,-.6],34) : K([LG+1.6,1.8,6.4],[LG-.2,1.0,-.6],30),            // 01 live streaming
  narrow? R([2*LG+.9,2.0,4.4],[2*LG,.55,0],34) : K([2*LG+1.0,1.7,3.5],[2*LG-.1,.62,-.05],30),          // 02 the flypack opens
  narrow? R([3*LG+1.3,2.6,8.6],[3*LG+.3,1.0,-.6],34) : K([3*LG+1.3,2.2,5.9],[3*LG+.05,.92,-.55],30),     // 03 visuals
  narrow? R([4*LG+1.5,2.4,9.6],[4*LG+.45,.95,-.3],34) : K([4*LG+2.1,2.1,6.9],[4*LG+.2,.92,-.5],30),         // 04 hybrid
  K([4*LG+1.8,2.6,8.4],[4*LG,1.0,-.6],30,0,.25) ];

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
  PF.n++; { const nt=performance.now(); if(PF.l){ const d=Math.min(nt-PF.l,250); PF.a=PF.a?PF.a*.94+d*.06:d; } PF.l=nt; if(PF.n>60&&PF.n%40===0&&PF.t<2&&PF.a>24){ PF.t++; renderer.setPixelRatio(PF.r[PF.t]); PF.a=0; } }
  if(PF.n%PF.s[PF.t]===1) renderer.shadowMap.needsUpdate=true;
  renderer.render(scene,camera); }
document.fonts&&document.fonts.ready.then(()=>{});
frame();
