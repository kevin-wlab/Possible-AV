
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

/* ===== displays models: definitions only, nothing is added to the scene here ===== */
const DSP={};
function dspM(){ return DSP.m||(DSP.m={
  glass:std(0x050506,.06,.25,{envMapIntensity:1.4}),             // a screen's glass where it is not lit
  edge:std(0xc4c1b9,.26,.95,{envMapIntensity:1}),                // polished metal edge
  back:std(0x77767a,.36,.8,{envMapIntensity:1}),                 // brushed metal sheet
  body:std(0x1b1c1f,.58,.12,{bumpMap:speckT,bumpScale:.12}),      // moulded housing
  port:std(0x060607,.6,.2), cable:std(0x101012,.72,.05), frame:std(0x2c2d31,.36,.75,{envMapIntensity:1}),
  cast:std(0x3b3c41,.5,.55,{envMapIntensity:.9}), lam:std(0x17181a,.62,.08,{bumpMap:speckT,bumpScale:.16}), key:std(0x2a2b2f,.5,.2),
  gA:glow(AMBER), gW:glow(0xf2efe9), gG:glow(0x9fc08f) }); }
// small rounded box (cheaper than rbox, for parts the size of a hand or less)
const dspRb=(w,h,d,m,r=.004)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.max(.0006,Math.min(r,w/2-.0003,h/2-.0003,d/2-.0003))),m);
// merge every still mesh under g into one mesh per material; groups marked userData.live (things that move) are left alone
function dspBake(g){ g.updateMatrixWorld(true); const inv=g.matrixWorld.clone().invert(), bk=new Map(), dead=[];
  g.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh) return; for(let p=o;p&&p!==g;p=p.parent) if(p.userData.live) return;
    const k=o.material.uuid+(o.castShadow?'c':'n'); let b=bk.get(k); if(!b) bk.set(k,b={m:o.material,cast:o.castShadow,P:[],N:[],U:[]});
    const ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); ge.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));
    b.P.push(ge.attributes.position.array); b.N.push(ge.attributes.normal.array); b.U.push(ge.attributes.uv?ge.attributes.uv.array:new Float32Array(ge.attributes.position.count*2)); dead.push(o); });
  for(const o of dead) o.parent.remove(o);
  const cat=(a)=>{ let n=0; for(const x of a) n+=x.length; const r=new Float32Array(n); let i=0; for(const x of a){ r.set(x,i); i+=x.length; } return r; };
  for(const b of bk.values()){ const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.BufferAttribute(cat(b.P),3)); ge.setAttribute('normal',new THREE.BufferAttribute(cat(b.N),3)); ge.setAttribute('uv',new THREE.BufferAttribute(cat(b.U),2));
    const m=new THREE.Mesh(ge,b.m); m.castShadow=b.cast; m.receiveShadow=true; g.add(m); }
  return g; }
// a canvas that redraws itself every few frames
function dspAnim(key,w,h,draw,every=6){ if(DSP[key]) return DSP[key]; const t=ctex(w,h,()=>{}), g=t.userData.g; let f=Object.keys(DSP).length; draw(g,0,w,h);
  updaters.push(tm=>{ if(f++%every===0){ draw(g,tm,w,h); t.needsUpdate=true; } }); return DSP[key]=t; }
const dspEm={}; const dspEmis=(key,tex)=>dspEm[key]||(dspEm[key]=new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));
// an emissive picture; uv = [u0,v0,u1,v1] shows part of the texture
function dspScreen(w,h,mat,uv){ const ge=new THREE.PlaneGeometry(w,h); if(uv){ const U=ge.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i,lerp(uv[0],uv[2],U.getX(i)),lerp(uv[1],uv[3],U.getY(i))); } return new THREE.Mesh(ge,mat); }
const dspFont=(w,px,mono)=>w+' '+px+'px '+(mono?'"Geist Mono", ui-monospace, monospace':'Geist, system-ui, sans-serif');

/* ---------- what is on the screens ---------- */
// calm content for the TV: dunes at dusk, drifting slowly
function dspCalmTex(){ return dspAnim('calm',768,432,(g,tm,W,H)=>{
    const sky=g.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#141a2e'); sky.addColorStop(.42,'#3d3652'); sky.addColorStop(.68,'#c7764b'); sky.addColorStop(1,'#f2b56c'); g.fillStyle=sky; g.fillRect(0,0,W,H);
    const sx=W*.63+Math.sin(tm*.05)*18, sy=H*.55, rg=g.createRadialGradient(sx,sy,4,sx,sy,190); rg.addColorStop(0,'rgba(255,240,208,1)'); rg.addColorStop(.17,'rgba(255,222,160,.96)'); rg.addColorStop(.2,'rgba(255,196,128,.36)'); rg.addColorStop(1,'rgba(255,170,100,0)'); g.fillStyle=rg; g.fillRect(0,0,W,H);
    const cols=['#8a5049','#5c364b','#35253f','#17152a']; for(let L=0;L<4;L++){ const base=H*(.62+L*.095), amp=24-L*3, sp=(L+1)*5; g.fillStyle=cols[L]; g.beginPath(); g.moveTo(0,H);
      for(let x=0;x<=W;x+=12){ const q=x+tm*sp; g.lineTo(x,base+Math.sin(q*.008+L*1.7)*amp+Math.sin(q*.021+L)*amp*.35); } g.lineTo(W,H); g.closePath(); g.fill(); } },7); }
// a touch interface: header, a lead card, a grid of tiles, and a tap that moves from tile to tile
function dspTouchTex(portrait){ return dspAnim(portrait?'uiP':'uiL',portrait?432:768,portrait?768:432,(g,tm,W,H)=>{ const P=H>W, ink='#17181a', hh=P?64:52;
    g.fillStyle='#f1ede6'; g.fillRect(0,0,W,H); g.fillStyle=ink; g.fillRect(0,0,W,hh); g.fillStyle='#E8892D'; g.beginPath(); g.arc(30,hh/2,7,0,7); g.fill();
    g.fillStyle='#f1ede6'; g.font=dspFont(600,P?22:19); g.textBaseline='middle'; g.textAlign='left'; g.fillText('Welcome',48,hh/2+1); g.strokeStyle='rgba(241,237,230,.6)'; g.lineWidth=1.5; g.beginPath(); g.roundRect(W-70,hh/2-13,48,26,13); g.stroke(); g.font=dspFont(500,12,1); g.textAlign='center'; g.fillText('EN',W-46,hh/2+1);
    const hero=P?[20,hh+20,W-40,208]:[20,hh+18,292,H-hh-36], hg=g.createLinearGradient(hero[0],hero[1],hero[0]+hero[2],hero[1]+hero[3]); hg.addColorStop(0,'#ef9a45'); hg.addColorStop(1,'#b9551f'); g.fillStyle=hg; g.beginPath(); g.roundRect(...hero,20); g.fill();
    g.save(); g.beginPath(); g.roundRect(...hero,20); g.clip(); g.fillStyle='rgba(255,255,255,.14)'; g.beginPath(); g.arc(hero[0]+hero[2]*.86,hero[1]+hero[3]*.2,hero[3]*.5,0,7); g.fill(); g.beginPath(); g.arc(hero[0]+hero[2]*.7,hero[1]+hero[3]*1.05,hero[3]*.42,0,7); g.fill(); g.restore();
    g.fillStyle='#fff'; g.textAlign='left'; g.font=dspFont(700,P?36:33); g.fillText('Find your',hero[0]+22,hero[1]+hero[3]-(P?92:104)); g.fillText('way.',hero[0]+22,hero[1]+hero[3]-(P?52:66)); g.font=dspFont(500,P?15:14); g.fillStyle='rgba(255,255,255,.86)'; g.fillText('Tap a tile to begin',hero[0]+22,hero[1]+hero[3]-(P?22:30));
    const cols=P?2:3, rows=P?3:2, gx=P?20:332, gy=P?hero[1]+hero[3]+16:hero[1], gw=(W-gx-20-(cols-1)*14)/cols, gh=P?116:(hero[3]-14)/2, names=['Schedule','Map','Speakers','Exhibits','Food','Help'];
    const k=Math.floor(tm/2.3)%6, ph=(tm/2.3)%1;
    for(let i=0;i<6;i++){ const x=gx+(i%cols)*(gw+14), y=gy+Math.floor(i/cols)*(gh+14), hot=i===k&&ph>.12&&ph<.8; g.fillStyle=hot?'#fbe3cb':'#fffdf9'; g.strokeStyle=hot?'#E8892D':'rgba(23,24,26,.12)'; g.lineWidth=hot?2.5:1.5; g.beginPath(); g.roundRect(x,y,gw,gh,16); g.fill(); g.stroke();
      g.fillStyle=ink; g.beginPath(); g.arc(x+30,y+32,15,0,7); g.fill(); g.strokeStyle='#f1ede6'; g.lineWidth=2; g.beginPath();
      if(i===0){ g.rect(x+23,y+26,14,12); g.moveTo(x+23,y+30); g.lineTo(x+37,y+30); } else if(i===1){ g.moveTo(x+30,y+40); g.lineTo(x+24,y+30); g.arc(x+30,y+29,6,Math.PI,0); g.lineTo(x+30,y+40); } else if(i===2){ g.arc(x+30,y+28,4,0,7); g.moveTo(x+22,y+40); g.quadraticCurveTo(x+30,y+30,x+38,y+40); } else if(i===3){ g.rect(x+23,y+25,6,6); g.rect(x+31,y+25,6,6); g.rect(x+23,y+33,6,6); g.rect(x+31,y+33,6,6); } else if(i===4){ g.arc(x+30,y+32,7,0,7); g.moveTo(x+30,y+25); g.lineTo(x+30,y+39); } else { g.arc(x+30,y+32,7,0,7); g.moveTo(x+30,y+29); g.lineTo(x+30,y+33); }
      g.stroke(); g.fillStyle=ink; g.font=dspFont(600,P?19:17); g.textAlign='left'; g.fillText(names[i],x+16,y+gh-24); g.fillStyle='rgba(23,24,26,.34)'; g.fillRect(x+16,y+gh-10,gw*.42,2.5);
      if(i===k){ const cx=x+gw*.62, cy=y+gh*.52; g.strokeStyle='rgba(232,137,45,'+(1-ph).toFixed(2)+')'; g.lineWidth=3; g.beginPath(); g.arc(cx,cy,8+ph*56,0,7); g.stroke(); if(ph<.5){ g.fillStyle='rgba(232,137,45,'+(.55*(1-ph*2)).toFixed(2)+')'; g.beginPath(); g.arc(cx,cy,14,0,7); g.fill(); } } }
    if(P){ g.fillStyle=ink; g.beginPath(); g.roundRect(20,H-58,W-40,42,21); g.fill(); for(let i=0;i<3;i++){ g.fillStyle=i?'rgba(241,237,230,.4)':'#E8892D'; g.beginPath(); g.roundRect(W/2-66+i*48,H-41,36,8,4); g.fill(); } } },8); }
// the long picture that runs across the three screens of a playback station
function dspSpanTex(){ return dspAnim('span',1536,288,(g,tm,W,H)=>{ const bg=g.createLinearGradient(0,0,W,H); bg.addColorStop(0,'#101319'); bg.addColorStop(1,'#231c22'); g.fillStyle=bg; g.fillRect(0,0,W,H);
    const cols=['rgba(232,137,45,.92)','rgba(242,230,208,.9)','rgba(178,84,48,.9)','rgba(92,70,110,.85)']; for(let L=3;L>=0;L--){ g.fillStyle=cols[L]; g.beginPath(); const th=26+L*9, y0=H*(.34+L*.11);
      for(let x=0;x<=W;x+=16){ const y=y0+Math.sin(x*.0052+tm*.5+L*1.3)*46+Math.sin(x*.013-tm*.3+L)*14; x?g.lineTo(x,y):g.moveTo(x,y); } for(let x=W;x>=0;x-=16){ const y=y0+th+Math.sin(x*.0052+tm*.5+L*1.3+.5)*46+Math.sin(x*.013-tm*.3+L)*14; g.lineTo(x,y); } g.closePath(); g.fill(); }
    g.fillStyle='rgba(242,239,233,.9)'; const px=((tm*90)%(W+200))-100; g.beginPath(); g.arc(px,H*.2,7,0,7); g.fill(); g.fillStyle='rgba(242,239,233,.25)'; g.fillRect(px-140,H*.2-1.5,140,3); },6); }
// the operator's preview: the three outputs and a looping timeline
function dspMultiTex(){ const span=dspSpanTex(); return dspAnim('multi',512,320,(g,tm,W,H)=>{ g.fillStyle='#0c0e11'; g.fillRect(0,0,W,H); g.font=dspFont(600,13,1); g.textAlign='left'; g.textBaseline='middle';
    for(let i=0;i<3;i++){ const x=16+i*164; g.drawImage(span.userData.c,i*512,0,512,288,x,40,152,86); g.strokeStyle=i===1?'#E8892D':'#3a3e45'; g.lineWidth=2; g.strokeRect(x,40,152,86); g.fillStyle='#dfe6ea'; g.fillText('OUT '+'ABC'[i],x,26); g.fillStyle='#9fc08f'; g.beginPath(); g.arc(x+146,26,4,0,7); g.fill(); }
    g.fillStyle='#14171b'; g.fillRect(16,150,W-32,110); for(let r=0;r<3;r++){ g.fillStyle=['#E8892D','#c9d6c2','#7fa7c9'][r]; for(let k=0;k<4;k++) g.fillRect(28+k*118+r*14,162+r*32,104-r*10,22); }
    const ph=(tm*.09)%1; g.fillStyle='#f2efe9'; g.fillRect(28+ph*(W-56),152,2,106); g.fillStyle='#dfe6ea'; g.fillText('LOOP',16,286); g.fillStyle='#1b1e22'; g.fillRect(70,280,W-86,12); g.fillStyle='#E8892D'; g.fillRect(70,280,(W-86)*ph,12); },9); }
// what an LED wall shows; one texel is one LED
function dspLedTex(){ const t=dspAnim('led',512,384,(g,tm,W,H)=>{ g.fillStyle='#0c0b10'; g.fillRect(0,0,W,H); const cx=W*.5+Math.sin(tm*.2)*40, cy=H*.52;
    for(let k=7;k>=0;k--){ const r=((k+(tm*.16)%1)/8)*W*.72; g.fillStyle=['#E8892D','#f3e3c8','#b4532c','#3a2c4c'][k%4]; g.beginPath(); g.arc(cx,cy,r,0,7); g.fill(); }
    g.fillStyle='#0c0b10'; g.beginPath(); g.arc(cx,cy,W*.72*(((tm*.16)%1)/8),0,7); g.fill(); },6); t.magFilter=THREE.NearestFilter; return t; }
function dspLedMask(){ if(DSP.mask) return DSP.mask; const t=ctex(32,32,(g,w,h)=>{ g.fillStyle='rgba(4,4,6,.66)'; g.fillRect(0,0,w,h); g.globalCompositeOperation='destination-out'; g.beginPath(); g.arc(w/2,h/2,w*.36,0,7); g.fill(); },[128,128]); t.colorSpace=THREE.NoColorSpace;
  return DSP.mask=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}); }

/* ---------- 01 · an OLED TV on a rolling floor stand ---------- */
// the TV alone: origin at the centre of the picture, facing +z. A 4 mm sheet of glass on metal, and the electronics in a shallow box low on the back
function oledTv(){ const m=dspM(), g=new THREE.Group(), W=1.446, H=.83;
  g.add(at(rbox(W,H,.004,m.back,.0015),0,0,-.002)); g.add(at(rbox(W-.002,H-.002,.002,m.glass,.0008),0,0,.001));
  g.add(at(dspScreen(W-.018,H-.018,dspEmis('calm',dspCalmTex())),0,0,.0032));
  for(const s of [-1,1]){ g.add(at(dspRb(W+.005,.0035,.0085,m.edge,.0012),0,s*(H/2+.0006),-.001)); g.add(at(dspRb(.0035,H+.005,.0085,m.edge,.0012),s*(W/2+.0006),0,-.001)); }
  g.add(at(dspRb(.07,.012,.016,m.body,.004),0,-H/2-.007,-.006)); g.add(at(box(.004,.002,.001,m.gW),0,-H/2-.008,.0025));
  // electronics box: vents, mounting bosses, a port bay, speaker slots, a rating label
  const BY=-H*.2, BW=W*.8, BH=H*.52; g.add(at(rbox(BW,BH,.036,m.body,.014),0,BY,-.022));
  for(const sx of [-1,1]) for(let r=0;r<2;r++) for(let k=0;k<22;k++) g.add(at(box(.0035,.05,.002,m.port),sx*(BW*.2)+(k-10.5)*.0085,BY+BH/2-.05-r*.066,-.0405));
  g.add(at(dspRb(.36,.36,.003,m.frame,.006),0,BY-.02,-.0412)); for(const sx of [-1,1]) for(const sy of [-1,1]){ g.add(at(rot(cyl(.011,.011,.004,m.edge,16),Q),sx*.15,BY-.02+sy*.15,-.0435)); g.add(at(rot(cyl(.0045,.0045,.005,m.port,10),Q),sx*.15,BY-.02+sy*.15,-.0438)); }
  const pb=grp(g,-.3,BY+.02,-.0408); pb.add(dspRb(.11,.24,.003,m.port,.006)); for(let k=0;k<4;k++){ pb.add(at(box(.017,.007,.004,M.steel),-.02,.09-k*.03,-.002)); pb.add(at(box(.012,.004,.0045,m.port),-.02,.09-k*.03,-.0022)); }
  for(let k=0;k<2;k++) pb.add(at(box(.014,.007,.004,M.steel),.022,.09-k*.03,-.002)); pb.add(at(box(.017,.015,.004,M.steel),.022,.02,-.002)); pb.add(at(rot(cyl(.005,.005,.008,m.edge,12),Q),.022,-.02,-.003)); pb.add(at(rot(cyl(.0055,.0055,.006,M.steel,6),Q),-.02,-.05,-.003)); pb.add(at(rot(cyl(.0035,.0035,.012,M.amber,10),Q),-.02,-.05,-.004));
  for(const sx of [-1,1]) g.add(at(box(.24,.006,.02,m.port),sx*BW*.28,BY-BH/2+.0015,-.022));
  const lab=ctex(256,128,(c,w,h)=>{ c.fillStyle='#d9d6cf'; c.fillRect(0,0,w,h); c.fillStyle='#222'; c.font='700 15px monospace'; c.fillText('OLED DISPLAY',12,24); c.font='500 9px monospace'; for(let i=0;i<5;i++) c.fillText(['MODEL  PAV-TV','INPUT  AC','SERIAL 0000-0000','MADE FOR RENTAL USE','HANDLE WITH TWO PEOPLE'][i],12,44+i*13); for(let x=0;x<70;x+=3) c.fillRect(170+x,20,1+(x*7%3),50); c.strokeStyle='#222'; c.lineWidth=2; c.strokeRect(172,82,26,26); c.beginPath(); c.arc(222,95,13,0,7); c.stroke(); });
  g.add(at(rot(new THREE.Mesh(new THREE.PlaneGeometry(.12,.06),std(0xffffff,.7,0,{map:lab})),0,Math.PI,0),BW/2-.12,BY-BH/2+.07,-.0408));
  g.add(at(dspRb(.05,.04,.004,m.port,.006),.3,BY-.06,-.041));
  return g; }
function dspCaster(brake){ const g=new THREE.Group(); g.add(at(dspRb(.062,.005,.062,M.steel,.002),0,-.0025,0)); g.add(at(cyl(.021,.021,.014,M.steel,20),0,-.012,0)); g.add(at(dspRb(.054,.006,.05,M.steel,.002),0,-.022,-.012));
  for(const sx of [-1,1]){ g.add(at(dspRb(.004,.052,.04,M.steel,.0015),sx*.025,-.048,-.018)); g.add(at(rot(cyl(.007,.007,.006,M.steel,6),0,0,Q),sx*.029,-.0535,-.022)); }
  g.add(at(rot(cyl(.0325,.0325,.03,M.rubber,28),0,0,Q),0,-.0535,-.022)); g.add(at(rot(cyl(.019,.019,.036,M.alu,20),0,0,Q),0,-.0535,-.022));
  if(brake) g.add(at(rot(dspRb(.036,.006,.034,M.amber,.002),.4,0,0),0,-.03,.022)); return g; }
// the stand: splayed legs on casters, one column with the mount on a sliding carriage; behind it a media player, a power strip and the cables clipped down the column
function oledCart(){ const m=dspM(), g=new THREE.Group(), CY=1.12, CZ=-.14;
  for(const sx of [-1,1]){ const leg=grp(g,sx*.37,.108,.04); leg.rotation.y=sx*.13; leg.add(rbox(.075,.042,.78,m.frame,.014)); for(const sz of [-1,1]){ leg.add(at(dspRb(.079,.046,.03,M.rubber,.012),0,0,sz*.385)); const c=dspCaster(sz>0); c.position.set(0,-.021,sz*.33); c.rotation.y=sx*(sz>0?.5:2.5); leg.add(c); } }
  g.add(at(rbox(.76,.042,.11,m.frame,.012),0,.108,CZ)); g.add(at(dspRb(.21,.012,.14,M.steel,.004),0,.135,CZ)); for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(cyl(.007,.007,.008,M.steel,6),sx*.088,.143,CZ+sz*.052));
  g.add(at(rbox(.12,1.46,.062,m.frame,.008),0,.859,CZ)); g.add(at(box(.016,1.4,.002,m.port),0,.86,CZ+.0315)); for(const sx of [-1,1]) g.add(at(box(.004,1.4,.0016,m.edge),sx*.046,.86,CZ+.0315)); g.add(at(dspRb(.126,.014,.068,M.black,.005),0,1.594,CZ));
  // carriage and mount
  g.add(at(rbox(.18,.26,.1,M.black,.012),0,CY,CZ)); g.add(at(rot(cyl(.006,.006,.03,M.steel,10),0,0,Q),.1,CY,CZ)); g.add(at(rot(cyl(.025,.025,.018,M.black,7),0,0,Q),.122,CY,CZ)); g.add(at(rot(cyl(.012,.012,.003,M.amber,16),0,0,Q),.132,CY,CZ));
  for(const sy of [-1,1]) g.add(at(dspRb(.56,.05,.014,M.black,.004),0,CY+sy*.15,CZ+.057));
  for(const sx of [-1,1]){ g.add(at(dspRb(.04,.44,.016,M.steel,.004),sx*.15,CY,CZ+.073)); g.add(at(dspRb(.04,.02,.034,M.steel,.004),sx*.15,CY+.185,CZ+.062)); g.add(at(rot(cyl(.006,.006,.03,M.steel,8),Q),sx*.15,CY-.2,CZ+.06)); }
  const tv=oledTv(); tv.position.set(0,CY+.83*.2+.02,CZ+.081+.04); g.add(tv);
  // behind: the player on its bracket, a power strip, cables
  const bz=CZ-.031; g.add(at(dspRb(.2,.22,.004,M.black,.002),0,.84,bz-.003)); g.add(at(rbox(.13,.13,.032,M.shell2,.012),0,.85,bz-.022)); g.add(at(dspRb(.03,.15,.036,m.cable,.003),-.03,.85,bz-.022)); g.add(at(box(.006,.003,.002,m.gG),.04,.9,bz-.0385)); g.add(at(box(.006,.003,.002,m.gA),.028,.9,bz-.0385));
  g.add(at(cyl(.003,.003,.07,M.rubber,8),.052,.95,bz-.022)); for(const x of [-.02,.02]) g.add(at(box(.016,.008,.012,M.steel),x,.783,bz-.022));
  g.add(at(rbox(.058,.34,.038,M.shell2,.008),0,.44,bz-.02)); for(let k=0;k<4;k++) g.add(at(dspRb(.036,.036,.002,m.port,.005),0,.32+k*.066,bz-.0395)); g.add(at(dspRb(.02,.026,.006,m.gA,.002),0,.585,bz-.04));
  for(const k of [0,2]) g.add(at(dspRb(.032,.032,.028,m.cable,.006),0,.32+k*.066,bz-.054));
  const tx=tv.position.x, ty=tv.position.y, tz=tv.position.z, by=ty-.83*.2;
  g.add(tube([[.02,.776,bz-.022],[.03,.73,bz-.035],[-.03,.71,bz-.03],[-.075,.76,bz+.01],[-.078,.9,bz+.012],[-.085,by-.2,bz+.02],[-.2,by-.13,tz-.075],[-.3,by-.06,tz-.06],[-.3,by-.03,tz-.046]],.004,m.cable,48));     // signal: player to TV
  g.add(tube([[-.02,.776,bz-.022],[-.035,.72,bz-.04],[-.04,.6,bz-.06],[-.02,.48,bz-.075],[0,.455,bz-.068]],.0035,m.cable,24));                                   // player power
  g.add(tube([[0,.32,bz-.068],[.03,.3,bz-.09],[.07,.36,bz-.03],[.078,.6,bz+.012],[.08,.9,bz+.012],[.1,by-.2,bz+.02],[.22,by-.15,tz-.075],[.3,by-.1,tz-.06],[.3,by-.065,tz-.046]],.0045,m.cable,48));           // TV power
  g.add(tube([[0,.27,bz-.02],[0,.2,bz-.012],[0,.15,bz-.02],[.04,.12,bz-.1],[.16,.02,bz-.3],[.42,.007,bz-.46],[.74,.007,bz-.4],[.9,.007,bz-.16],[.86,.007,bz+.1]],.0055,m.cable,60));   // mains, out along the floor
  const pl=grp(g,.86,.016,bz+.13); pl.rotation.y=.2; pl.add(dspRb(.032,.03,.05,m.cable,.008)); for(const sx of [-1,1]) pl.add(at(box(.0015,.007,.018,M.steel),sx*.0065,0,.033));
  for(const y of [.66,.93]) for(const sx of [-1,1]) g.add(at(dspRb(.016,.014,.03,M.black,.003),sx*.07,y,bz+.012)); g.add(at(dspRb(.034,.014,.012,M.black,.003),0,.2,bz-.008));
  return dspBake(g); }

/* ---------- 02 · touch screens: a display on a tilting stand, and a floor kiosk ---------- */
// the slot-in computer: a cartridge that slides out of the side of the display
function dspSlotPc(){ const m=dspM(), g=new THREE.Group(), t=ctex(512,320,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#b9b6ae'); gr.addColorStop(1,'#a19e96'); c.fillStyle=gr; c.fillRect(0,0,w,h); for(let i=0;i<900;i++){ c.fillStyle='rgba(255,255,255,'+(Math.random()*.08).toFixed(3)+')'; c.fillRect(0,Math.random()*h,w,1); }
      c.fillStyle='#1c1d20'; for(let r=0;r<9;r++) for(let k=0;k<26;k++){ c.beginPath(); c.arc(40+k*11+(r%2)*5.5,34+r*9.5,3,0,7); c.fill(); }
      c.font='700 30px monospace'; c.fillText('SLOT-IN COMPUTER',36,176); c.font='600 22px monospace'; c.fillText('ANDROID / WINDOWS',36,214); c.font='500 14px monospace'; c.fillText('RUNS THE APP INSIDE THE SCREEN',36,246); c.fillStyle='#E8892D'; c.fillRect(36,266,120,8); c.fillStyle='#1c1d20'; c.fillRect(166,266,300,8); c.strokeStyle='#1c1d20'; c.lineWidth=2; c.strokeRect(372,28,104,84); c.font='600 13px monospace'; c.fillText('CPU',408,74); });
  g.add(rbox(.19,.118,.028,M.alu,.003)); const f=std(0xffffff,.42,.6,{map:t,envMapIntensity:.9}); g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(.18,.108),f),-.002,0,.0148));
  g.add(at(dspRb(.006,.132,.038,M.black,.002),.098,0,0)); for(const sy of [-1,1]){ g.add(at(rot(cyl(.0065,.0065,.012,M.steel,14),0,0,Q),.106,sy*.056,0)); g.add(at(rot(cyl(.0032,.0032,.012,M.amber,10),0,0,Q),.107,sy*.036,.009)); }
  for(let k=0;k<3;k++) g.add(at(box(.003,.013,.006,M.steel),.1015,-.016+k*.018,-.008)); g.add(at(box(.003,.014,.012,M.steel),.1015,-.002,.008)); g.add(at(box(.004,.005,.005,m.gA),.1015,.022,.008)); return g; }
// a commercial touch display: thick, flush glass, a hump of electronics, handles and vents behind. Origin at the centre of the glass
function touchPanel(W,H,mat,withPc){ const m=dspM(), g=new THREE.Group(), D=.058;
  g.add(at(rbox(W,H,D,m.body,.012),0,0,-D/2)); g.add(at(rbox(W-.008,H-.008,.004,m.glass,.0015),0,0,.0005)); g.add(at(dspScreen(W-.064,H-.064,mat),0,0,.0036));
  for(const s of [-1,1]){ g.add(at(dspRb(W-.01,.004,.006,m.edge,.0015),0,s*(H/2-.0035),.0008)); g.add(at(dspRb(.004,H-.01,.006,m.edge,.0015),s*(W/2-.0035),0,.0008)); }
  g.add(at(box(.006,.002,.001,m.gW),W/2-.06,-H/2+.016,.0032)); g.add(at(rot(cyl(.004,.004,.001,std(0x10131c,.1,.4),14),Q),0,H/2-.017,.0032));
  g.add(at(rbox(W*.62,H*.62,.022,m.body,.01),0,0,-D-.009)); for(const sx of [-1,1]) for(let k=0;k<26;k++) g.add(at(box(.004,.07,.002,m.port),sx*W*.17+(k-12.5)*.009,H*.18,-D-.0205));
  for(const sx of [-1,1]) for(const sy of [-1,1]) g.add(at(rot(cyl(.01,.01,.004,m.edge,14),Q),sx*.2,sy*.2,-D-.021));
  for(const sx of [-1,1]) g.add(tube([[sx*W*.36,H*.12,-D],[sx*W*.36,H*.12,-D-.04],[sx*W*.36,H*.3,-D-.04],[sx*W*.36,H*.3,-D]],.008,M.satin,24));
  const pc=dspSlotPc(); pc.position.set(W/2-.1,H*.2,-.032); pc.userData.live=true; pc.userData.x0=pc.position.x; g.add(pc); g.userData.pc=pc; g.add(at(box(.002,.122,.032,m.port),W/2+.0003,H*.2,-.032));
  for(let k=0;k<4;k++) g.add(at(dspRb(.003,.012,.008,m.key,.001),W/2+.0008,-H*.1-k*.022,-.03));
  return g; }
function touchStand(){ const m=dspM(), g=new THREE.Group(), W=1.232, H=.712;
  g.add(at(rbox(.9,.024,.62,m.frame,.01),0,.03,0)); for(const sx of [-1,1]) for(const sz of [-1,1]){ g.add(at(cyl(.03,.034,.014,M.rubber,18),sx*.38,.007,sz*.25)); g.add(at(cyl(.008,.008,.012,M.steel,8),sx*.38,.045,sz*.25)); }
  g.add(at(dspRb(.24,.014,.2,M.steel,.004),0,.049,-.06)); g.add(at(rbox(.15,.84,.1,m.frame,.014),0,.47,-.06)); g.add(at(box(.06,.7,.002,m.port),0,.47,-.1105)); g.add(at(dspRb(.05,.03,.006,M.black,.003),0,.2,-.112));
  // tilt head: a yoke with a pivot each side, and the lever that locks the angle
  const PY=.98; g.add(at(rbox(.62,.07,.1,m.frame,.014),0,.89,-.06));
  for(const sx of [-1,1]){ g.add(at(rbox(.016,.2,.13,m.frame,.006),sx*.3,PY-.02,-.06)); g.add(at(rot(cyl(.04,.04,.012,M.alu,28),0,0,Q),sx*.312,PY,-.06)); g.add(at(rot(cyl(.012,.012,.02,M.steel,6),0,0,Q),sx*.318,PY,-.06)); }
  g.add(rod2(V(.325,PY,-.06),V(.36,PY-.11,.0),.007,M.steel)); g.add(at(sph(.017,M.amber,14,10),.362,PY-.115,.004));
  const head=grp(g,0,PY,-.06); head.rotation.x=-.62; head.add(at(rbox(.58,.3,.03,M.black,.008),0,0,.045)); head.add(rot(cyl(.03,.03,.58,m.frame,20),0,0,Q));
  const p=touchPanel(W,H,dspEmis('uiL',dspTouchTex(false))); p.position.set(0,.02,.06+.058+.022); head.add(p);
  g.add(tube([[0,PY-.1,-.13],[0,PY-.2,-.2],[0,.75,-.13],[0,.7,-.112]],.006,m.cable,24));
  const pc=p.userData.pc; dspBake(pc); dspBake(g); g.userData.pc=pc; return g; }
// the kiosk: a slim totem on a steel foot, portrait screen behind full-height glass, speaker and vents below
function touchKiosk(){ const m=dspM(), g=new THREE.Group(), W=.74, H=1.86, D=.09, Y0=.034, GH=1.27, GY=Y0+H-.03-GH/2;
  g.add(at(rbox(.94,.022,.58,m.frame,.008),0,.023,-.02)); for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(cyl(.03,.034,.012,M.rubber,18),sx*.4,.006,-.02+sz*.23));
  g.add(at(rbox(W,H,D,m.body,.028),0,Y0+H/2,0)); g.add(at(rbox(W-.036,GH,.004,m.glass,.0015),0,GY,D/2+.0006)); g.add(at(dspScreen(.63,1.12,dspEmis('uiP',dspTouchTex(true))),0,GY-.005,D/2+.0036));
  for(const s of [-1,1]){ g.add(at(dspRb(W-.03,.004,.006,m.edge,.0015),0,GY+s*(GH/2+.002),D/2+.0006)); g.add(at(dspRb(.004,GH+.008,.006,m.edge,.0015),s*(W/2-.016),GY,D/2+.0006)); }
  g.add(at(rot(cyl(.0055,.0055,.001,std(0x10131c,.1,.4),14),Q),0,GY+GH/2-.03,D/2+.0034)); g.add(at(box(.005,.005,.001,m.gA),.03,GY+GH/2-.03,D/2+.0034));
  // lower face: speaker behind perforated steel, a badge, a kick plate
  const SY=.44; g.add(at(dspRb(.5,.13,.006,M.shell2,.012),0,SY,D/2-.0015)); g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(.46,.09),grilleMat('dspKiosk',.46,.09,[[.25,.5,.04],[.75,.5,.04]])),0,SY,D/2+.0026));
  g.add(at(dspRb(.09,.018,.004,M.alu,.002),0,.27,D/2+.0008)); g.add(at(dspRb(W-.07,.1,.004,m.edge,.002),0,Y0+.085,D/2-.0002));
  // side: service door and its lock; back: vents, a door seam, the power inlet and its cable
  g.add(at(box(.002,.9,.002,m.port),W/2+.0002,.75,-.02)); g.add(at(rot(cyl(.012,.012,.006,M.steel,16),0,0,Q),W/2+.002,.92,.012)); g.add(at(box(.004,.012,.003,m.port),W/2+.0045,.92,.012));
  for(let r=0;r<2;r++) for(let k=0;k<30;k++) g.add(at(box(.005,.09,.002,m.port),(k-14.5)*.012,1.5-r*.9,-D/2-.0003));
  g.add(at(dspRb(.06,.05,.008,m.port,.004),-.2,.2,-D/2-.003)); g.add(tube([[-.2,.2,-D/2-.006],[-.2,.19,-D/2-.05],[-.22,.06,-D/2-.1],[-.3,.008,-.4],[-.5,.008,-.5]],.006,m.cable,28));
  return dspBake(g); }

/* ---------- 03 · a transparent display with a real object behind it ---------- */
function dspBottle(){ const g=new THREE.Group(), gl=std(0xe08a22,.1,.0,{envMapIntensity:1.5}), cl=std(0xf4efe6,.05,.0,{envMapIntensity:1.6,transparent:true,opacity:.38,depthWrite:false});
  const liq=at(rbox(.2,.2,.082,gl,.026),0,.135,0); liq.renderOrder=1; g.add(liq); const sh=at(rbox(.23,.262,.11,cl,.034),0,.133,0); sh.renderOrder=2; sh.castShadow=false; g.add(sh);
  g.add(lathe([[0,.264],[.03,.264],[.03,.27],[.026,.274],[.026,.292],[0,.292]],M.alu,28)); g.add(at(rbox(.074,.086,.074,M.black,.012),0,.337,0)); g.add(at(cyl(.0385,.0385,.004,M.alu,32),0,.296,0));
  g.add(at(dspRb(.07,.03,.002,M.white,.002),0,.1,.0562)); return g; }
// graphics for the glass, drawn in as u goes 0 to 1: a ring round the object, two callouts, a title
function dspGfx(){ const W=1024, H=576, t=ctex(W,H,()=>{}), g=t.userData.g, cx=W*.5, cy=H*.44;
  const draw=(u,tm)=>{ g.clearRect(0,0,W,H); if(u<=.001){ t.needsUpdate=true; return; } const a=clamp(u*3), b=clamp((u-.3)*3), c=clamp((u-.6)*2.5);
    g.lineCap='round'; g.strokeStyle='rgba(242,239,233,.28)'; g.lineWidth=1.5; g.beginPath(); g.arc(cx,cy,176,0,7); g.stroke();
    g.strokeStyle='#E8892D'; g.lineWidth=5; g.beginPath(); g.arc(cx,cy,176,-Q,-Q+a*Math.PI*1.72); g.stroke();
    g.strokeStyle='rgba(242,239,233,.85)'; g.lineWidth=2; for(let k=0;k<48;k++){ if(k/48>a) break; const an=-Q+k/48*Math.PI*2+tm*.12, r0=192, r1=k%4?199:208; g.beginPath(); g.moveTo(cx+Math.cos(an)*r0,cy+Math.sin(an)*r0); g.lineTo(cx+Math.cos(an)*r1,cy+Math.sin(an)*r1); g.stroke(); }
    const lead=(x0,y0,x1,y1,x2,k,txt,sub)=>{ if(k<=0) return; const p=clamp(k*2), q=clamp(k*2-1); g.strokeStyle='#f2efe9'; g.fillStyle='#f2efe9'; g.lineWidth=2.5; g.beginPath(); g.arc(x0,y0,5,0,7); g.fill(); g.beginPath(); g.moveTo(x0,y0); g.lineTo(lerp(x0,x1,p),lerp(y0,y1,p)); if(q>0) g.lineTo(lerp(x1,x2,q),y1); g.stroke();
      if(q>.5){ g.globalAlpha=(q-.5)*2; g.textAlign=x2>x1?'left':'right'; const tx=x2>x1?x1+8:x1-8; g.font=dspFont(600,25); g.fillText(txt,tx,y1-14); g.font=dspFont(500,15,1); g.fillStyle='#E8892D'; g.fillText(sub,tx,y1+24); g.globalAlpha=1; } };
    lead(cx+86,cy-112,cx+226,cy-176,cx+470,b,'Hand-finished glass','DETAIL 01'); lead(cx-104,cy+70,cx-232,cy+150,cx-470,b-.25,'Refill at the counter','DETAIL 02');
    if(c>0){ g.globalAlpha=c; g.textAlign='left'; g.fillStyle='#E8892D'; g.font=dspFont(500,17,1); g.fillText('NEW  ·  IN STORE NOW',48,84-(1-c)*10); g.fillStyle='#f2efe9'; g.font=dspFont(700,92); g.fillText('Amber',42,170-(1-c)*14);
      g.textAlign='right'; g.font=dspFont(500,16,1); g.fillText('TOUCH THE GLASS TO EXPLORE',W-48,H-44); g.fillStyle='#E8892D'; g.fillRect(W-48-292,H-30,292*(.5+.5*Math.sin(tm*.8)),4); g.globalAlpha=1; }
    g.fillStyle='rgba(242,239,233,'+(.7*a).toFixed(2)+')'; for(let k=0;k<26;k++){ const px=cx+Math.sin(k*12.9)*300, py=H-((tm*18*(1+k%3*.4)+k*47)%H); g.beginPath(); g.arc(px+Math.sin(tm*.6+k)*8,py,1.2+(k%3)*.7,0,7); g.fill(); }
    t.needsUpdate=true; }; return {t,draw}; }
function transparentCase(){ const m=dspM(), g=new THREE.Group(), PW=1.44, PH=.82, PD=.66, GW=1.21, GH=.68, T=PH+.02;
  // plinth with a shadow gap at the floor and a metal top
  g.add(at(rbox(PW-.06,.04,PD-.06,m.port,.004),0,.02,0)); g.add(at(rbox(PW,PH-.02,PD,m.body,.01),0,.04+(PH-.02)/2,0)); g.add(at(rbox(PW+.004,.006,PD+.004,m.frame,.002),0,T-.003,0));
  g.add(at(dspRb(.11,.03,.002,M.alu,.002),PW/2-.12,.16,PD/2+.0008)); g.add(at(box(.003,PH-.12,.002,m.port),0,.04+(PH-.02)/2,PD/2+.0003)); for(const sx of [-1,1]) g.add(at(dspRb(.012,.1,.006,M.alu,.002),sx*.03,PH*.62,PD/2+.003));
  // the display: electronics in the base rail, the glass above it in a hairline frame
  const z=.2, RH=.085; g.add(at(rbox(GW+.05,RH,.11,m.frame,.01),0,T+RH/2,z)); g.add(at(box(GW-.1,.002,.03,m.port),0,T+RH+.0003,z-.02)); g.add(at(box(.004,.004,.001,m.gA),GW/2-.04,T+RH/2,z+.0553)); for(let k=0;k<14;k++) g.add(at(box(.004,.03,.002,m.port),-.2+k*.01,T+RH/2,z-.0553));
  for(const sx of [-1,1]) g.add(at(dspRb(.008,GH,.012,M.black,.002),sx*(GW/2+.004),T+RH+GH/2,z)); g.add(at(dspRb(GW+.016,.008,.012,M.black,.002),0,T+RH+GH+.004,z));
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(GW,GH),std(0x14181d,.04,.1,{transparent:true,opacity:.46,depthWrite:false,envMapIntensity:1.5,side:THREE.DoubleSide})); glass.position.set(0,T+RH+GH/2,z); glass.renderOrder=3; glass.userData.live=true; g.add(glass);
  const gfx=dspGfx(), pic=new THREE.Mesh(new THREE.PlaneGeometry(GW,GH),new THREE.MeshBasicMaterial({map:gfx.t,transparent:true,depthWrite:false,toneMapped:false})); pic.position.set(0,T+RH+GH/2,z+.002); pic.renderOrder=4; pic.userData.live=true; g.add(pic);
  g.add(tube([[.3,T+.03,z-.06],[.3,T+.012,z-.12],[.34,T+.008,z-.2],[.4,T+.004,z-.24]],.005,m.cable,16)); g.add(at(cyl(.022,.022,.006,M.rubber,18),.4,T+.002,z-.25));
  // the product, on a low riser behind the glass
  g.add(at(cyl(.2,.2,.03,M.alu,48),0,T+.015,-.02)); g.add(at(cyl(.19,.19,.004,M.black,48),0,T+.032,-.02)); const bt=dspBottle(); bt.scale.setScalar(1.4); bt.position.set(0,T+.034,-.02); bt.rotation.y=.35; bt.userData.live=true; g.add(bt);
  dspBake(g); return {g,gfx}; }

/* ---------- 04 · a playback station: screens on truss, players in a rack, a control position ---------- */
// box truss standing along +y, 290 mm square
function dspTruss(len){ const g=new THREE.Group(), a=.12; for(const sx of [-1,1]) for(const sz of [-1,1]){ g.add(at(cyl(.025,.025,len-.04,M.alu,12),sx*a,len/2,sz*a)); for(const y of [.012,len-.012]) g.add(at(cyl(.03,.03,.024,M.steel,12),sx*a,y,sz*a)); }
  const n=Math.max(1,Math.round((len-.1)/.3)), st=(len-.1)/n; for(let i=0;i<n;i++){ const y0=.05+i*st, y1=y0+st, f=i%2?1:-1;
    g.add(rod2(V(-a*f,y0,a),V(a*f,y1,a),.009,M.alu)); g.add(rod2(V(a*f,y0,-a),V(-a*f,y1,-a),.009,M.alu)); g.add(rod2(V(a,y0,-a*f),V(a,y1,a*f),.009,M.alu)); g.add(rod2(V(-a,y0,a*f),V(-a,y1,-a*f),.009,M.alu)); }
  for(const y of [.05,len-.05]) for(const s of [-1,1]){ g.add(rod2(V(-a,y,s*a),V(a,y,s*a),.011,M.alu)); g.add(rod2(V(s*a,y,-a),V(s*a,y,a),.011,M.alu)); } return g; }
// a slim commercial screen, origin at the centre of the glass; uv picks its part of a shared picture
function dspLcd(W,H,mat,uv){ const m=dspM(), g=new THREE.Group(), D=.04; g.add(at(rbox(W,H,D,m.body,.008),0,0,-D/2)); g.add(at(dspRb(W-.006,H-.006,.003,m.glass,.001),0,0,.0004)); g.add(at(dspScreen(W-.024,H-.024,mat,uv),0,0,.003));
  g.add(at(rbox(W*.5,H*.55,.02,m.body,.008),0,0,-D-.008)); g.add(at(box(.006,.002,.001,m.gW),W/2-.05,-H/2+.006,.0022)); for(let k=0;k<20;k++) g.add(at(box(.004,.06,.002,m.port),(k-9.5)*.01,H*.14,-D-.0185)); return g; }
function dspStool(){ const g=new THREE.Group(); g.add(at(lathe([[0,0],[.165,0],[.18,.012],[.182,.04],[.17,.058],[.1,.066],[0,.068]],M.rubber,40),0,.66,0)); g.add(at(cyl(.1,.1,.012,M.black,28),0,.655,0)); g.add(at(cyl(.024,.024,.3,M.alu,18),0,.5,0)); g.add(at(cyl(.032,.034,.3,M.black,18),0,.24,0));
  g.add(at(rot(mesh(new THREE.TorusGeometry(.19,.01,8,40),M.alu),Q),0,.3,0)); for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; g.add(rod2(V(0,.1,0),V(Math.cos(a)*.28,.055,Math.sin(a)*.28),.014,M.alu)); if(k<3) g.add(rod2(V(0,.3,0),V(Math.cos(a*5/3)*.19,.3,Math.sin(a*5/3)*.19),.006,M.alu)); g.add(at(cyl(.022,.024,.03,M.rubber,14),Math.cos(a)*.28,.022,Math.sin(a)*.28)); } return g; }
// the rack: a flight case on casters, lid off, three players, a switch and power; the preview monitor and a key controller on top
function dspRack(){ const m=dspM(), g=new THREE.Group(), W=.6, H=.74, D=.62, Y0=.1;
  g.add(at(rbox(W,H,D-.03,m.lam,.008),0,Y0+H/2,-.015)); g.add(at(box(W-.06,H-.06,.004,m.port),0,Y0+H/2,D/2-.03));
  for(const sy of [0,1]){ for(const sz of [-1,1]) g.add(at(dspRb(W+.012,.03,.03,M.alu,.007),0,Y0+sy*H,sz*D/2-(sz>0?.03:0))); for(const sx of [-1,1]) g.add(at(dspRb(.03,.03,D-.02,M.alu,.007),sx*W/2,Y0+sy*H,-.015)); }
  for(const sx of [-1,1]) for(const sz of [-1,1]){ g.add(at(dspRb(.03,H,.03,M.alu,.007),sx*W/2,Y0+H/2,sz*D/2-(sz>0?.03:0))); for(const sy of [0,1]) g.add(at(sph(.032,M.steel,14,10),sx*W/2,Y0+sy*H,sz*D/2-(sz>0?.03:0))); const c=dspCaster(sz>0); c.position.set(sx*(W/2-.08),Y0-.014,sz*(D/2-.11)); c.rotation.y=sx*.6; g.add(c); }
  for(const sx of [-1,1]){ g.add(at(dspRb(.016,H-.07,.004,M.steel,.001),sx*.236,Y0+H/2,D/2-.026)); const hd=grp(g,sx*(W/2+.002),Y0+H*.55,-.02); hd.add(dspRb(.008,.14,.22,M.alu,.004)); hd.add(at(dspRb(.012,.09,.16,M.black,.004),sx*.002,0,0)); hd.add(at(dspRb(.02,.02,.14,M.steel,.008),sx*.012,-.02,0)); }
  // units, top down. One rack unit is 44.5 mm
  const U=.0445, face=std(0x1b1c1f,.4,.5,{envMapIntensity:1}), fz=D/2-.022; let y=Y0+H-.05;
  const ears=(n)=>{ for(const sx of [-1,1]) for(const s of (n>1?[-1,1]:[0])) g.add(at(rot(cyl(.004,.004,.003,M.steel,8),Q),sx*.236,y-n*U/2+s*(n*U/2-.012),fz+.004)); };
  for(let k=0;k<3;k++){ g.add(at(dspRb(.483,U-.002,.005,face,.0015),0,y-U/2,fz)); g.add(at(dspRb(.074,.03,.002,m.port,.001),-.15,y-U/2,fz+.003)); g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(.068,.024),new THREE.MeshBasicMaterial({map:lcd(['PLAYER '+(k+1)+'  LOOP'],320,112)})),-.15,y-U/2,fz+.0045));
    for(let b=0;b<4;b++) g.add(at(dspRb(.012,.008,.004,m.key,.001),-.08+b*.02,y-U/2,fz+.004)); g.add(at(box(.013,.006,.003,m.port),.05,y-U/2,fz+.002)); g.add(at(rot(cyl(.009,.009,.01,M.alu,18),Q),.17,y-U/2,fz+.007)); g.add(at(box(.005,.005,.002,k===1?m.gA:m.gG),.2,y-U/2,fz+.003)); ears(1); y-=U; }
  g.add(at(dspRb(.483,U-.002,.005,face,.0015),0,y-U/2,fz)); for(let k=0;k<34;k++) g.add(at(box(.006,.026,.002,m.port),(k-16.5)*.0115,y-U/2,fz+.002)); ears(1); y-=U;
  g.add(at(dspRb(.483,U-.002,.005,M.alu,.0015),0,y-U/2,fz)); for(let k=0;k<16;k++){ const px=-.2+(k%8)*.018+(k%8>3?.01:0), py=y-U/2+(k<8?.008:-.009); g.add(at(box(.013,.011,.003,m.port),px,py,fz+.002)); g.add(at(box(.003,.002,.002,k%5===3?m.gA:m.gG),px-.004,py+.007,fz+.003)); } g.add(at(box(.05,.012,.002,m.port),.16,y-U/2,fz+.002)); ears(1); y-=U;
  g.add(at(dspRb(.483,2*U-.002,.005,face,.0015),0,y-U,fz)); g.add(at(dspRb(.022,.03,.008,m.gA,.002),-.2,y-U,fz+.004)); for(let k=0;k<6;k++){ g.add(at(dspRb(.03,.03,.003,m.port,.006),-.12+k*.05,y-U,fz+.003)); g.add(at(box(.004,.004,.002,m.gG),-.12+k*.05,y-U+.024,fz+.003)); } ears(2); y-=2*U;
  g.add(at(dspRb(.483,3*U-.002,.005,face,.0015),0,y-1.5*U,fz)); g.add(at(dspRb(.2,.014,.016,M.alu,.005),0,y-1.5*U,fz+.01)); ears(3); y-=3*U;
  g.add(at(dspRb(.483,y-(Y0+.04),.005,face,.0015),0,(y+Y0+.04)/2,fz)); for(let k=0;k<30;k++) g.add(at(box(.006,.05,.002,m.port),(k-14.5)*.012,(y+Y0+.04)/2,fz+.002));
  // on top: a mat, the preview monitor, the key controller, a cue sheet
  const T=Y0+H+.016; g.add(at(dspRb(W-.06,.004,D-.1,M.rubber,.002),0,T,-.015));
  const mon=grp(g,-.08,T,-.15); mon.rotation.y=.12; mon.add(at(dspRb(.2,.01,.13,M.black,.004),0,.007,0)); mon.add(at(dspRb(.03,.1,.02,M.black,.006),0,.06,-.02)); const scr=grp(mon,0,.2,0); scr.rotation.x=-.12; scr.add(at(rbox(.39,.25,.022,m.body,.006),0,0,-.011)); scr.add(at(dspRb(.384,.244,.002,m.glass,.001),0,0,.0006)); scr.add(at(dspScreen(.368,.228,dspEmis('multi',dspMultiTex())),0,0,.0022));
  const kp=grp(g,.12,T+.004,.14); kp.rotation.set(.0,-.1,0); const kb=grp(kp,0,.014,0); kb.rotation.x=.3; kb.add(dspRb(.2,.02,.12,M.shell2,.006)); for(let r=0;r<3;r++) for(let c=0;c<5;c++){ const hot=(r*5+c)%7===2, wh=(r*5+c)===8; kb.add(at(dspRb(.03,.008,.03,hot?m.gA:(wh?m.gW:m.key),.003),-.074+c*.037,.013,-.037+r*.037)); } kp.add(at(dspRb(.2,.012,.02,M.shell2,.004),0,.006,-.06));
  const sheet=ctex(128,180,(c,w,h)=>{ c.fillStyle='#f2efe9'; c.fillRect(0,0,w,h); c.fillStyle='#2a2a2a'; c.font='700 11px monospace'; c.fillText('RUN OF SHOW',10,18); for(let i=0;i<11;i++){ c.fillStyle=i%4===1?'#E8892D':'#8b8882'; c.fillRect(10,30+i*13,8,6); c.fillStyle='#8b8882'; c.fillRect(24,31+i*13,60+(i*37%40),4); } });
  g.add(at(rot(new THREE.Mesh(new THREE.PlaneGeometry(.15,.21),std(0xffffff,.8,0,{map:sheet})),-Q,0,.25),-.14,T+.0035,.17)); g.add(at(rot(cyl(.004,.004,.14,M.amber,10),Q,0,1.2),-.05,T+.007,.2));
  return g; }
function playbackStation(){ const m=dspM(), g=new THREE.Group(), XU=2.22, TH=2.42, SW=1.232, SH=.712, SY=1.5, span=dspEmis('span',dspSpanTex());
  for(const sx of [-1,1]){ g.add(at(rbox(.72,.012,.72,M.satin,.004),sx*XU,.006,0)); const u=dspTruss(TH); u.position.set(sx*XU,.03,0); g.add(u); const c=dspTruss(.29); c.position.set(sx*XU,.03+TH,0); g.add(c); for(const a of [-1,1]) for(const b of [-1,1]) g.add(at(cyl(.03,.036,.03,M.steel,12),sx*XU+a*.12,.027,b*.12)); }
  const BY=.03+TH+.145, bm=dspTruss(2*XU-.29); bm.rotation.z=-Q; bm.position.set(-XU+.145,BY,0); g.add(bm);
  for(let k=0;k<3;k++){ const x=(k-1)*(SW+.06), s=grp(g,x,0,0);
    s.add(at(dspRb(.05,.03,.36,M.black,.008),0,BY-.158,0)); for(const sz of [-1,1]){ s.add(at(dspRb(.05,.084,.084,M.black,.02),0,BY-.12,sz*.12)); s.add(at(rot(cyl(.007,.007,.05,M.steel,8),0,0,Q),.03,BY-.12,sz*.12)); s.add(at(rot(cyl(.014,.014,.012,M.amber,6),0,0,Q),.058,BY-.12,sz*.12)); }
    s.add(at(cyl(.024,.024,BY-.17-SY,M.satin,16),0,(BY-.17+SY)/2,0)); s.add(at(dspRb(.34,.34,.006,M.black,.003),0,SY,.027)); s.add(at(dspRb(.08,.12,.05,M.black,.008),0,SY,.004));
    s.add(at(dspLcd(SW,SH,span,[k/3,0,(k+1)/3,1]),0,SY,.03+.04+.02)); s.add(at(dspRb(.11,.11,.028,M.shell2,.01),.2,SY+.05,.012)); s.add(at(box(.005,.003,.002,m.gG),.24,SY+.09,-.003));
    s.add(tube([[.2,SY+.105,.012],[.16,SY+.2,-.01],[.03,SY+.3,-.02],[.03,BY-.3,-.022],[.03,BY-.19,-.06],[.03,BY-.1,-.15]],.006,m.cable,28)); }
  // the loom: along the beam, down the right-hand upright, across the floor to the rack
  g.add(tube([[-1.3,BY+.15,-.1],[0,BY+.152,-.1],[XU-.2,BY+.15,-.1],[XU-.02,BY+.1,-.16],[XU,BY-.3,-.16],[XU,.4,-.16],[XU+.02,.06,-.2],[XU+.25,.012,-.05],[XU+.75,.012,.42],[XU+1.0,.012,.5],[XU+1.08,.12,.52]],.013,m.cable,90));
  for(const x of [-1.2,0,1.2]) g.add(at(dspRb(.02,.006,.05,M.amber,.002),x,BY+.166,-.1));
  const rk=dspRack(); rk.position.set(XU+1.15,0,.85); rk.rotation.y=-.5; g.add(rk); const st=dspStool(); st.position.set(XU+.8,0,1.75); g.add(st);
  return dspBake(g); }

/* ---------- 05 · a section of LED wall: cabinets on a ground stack; one lifts out ---------- */
function ledCabinet(uv){ const m=dspM(), g=new THREE.Group(), C=.5; g.add(at(box(C-.001,C-.001,.018,m.port),0,0,-.01)); g.add(at(dspScreen(C-.001,C-.001,dspEmis('led',dspLedTex()),uv),0,0,.0005)); const mk=new THREE.Mesh(new THREE.PlaneGeometry(C-.001,C-.001),dspLedMask()); mk.position.z=.0016; mk.renderOrder=2; g.add(mk);
  // die-cast frame: a rim, cross ribs, the hub with power and data, a handle, locks on the top and one side
  for(const s of [-1,1]){ g.add(at(dspRb(C-.002,.028,.052,m.cast,.004),0,s*(C/2-.015),-.045)); g.add(at(dspRb(.028,C-.058,.052,m.cast,.004),s*(C/2-.015),0,-.045)); g.add(at(rot(dspRb(.6,.02,.014,m.cast,.003),0,0,s*Math.PI/4),0,0,-.027)); }
  g.add(at(dspRb(.23,.19,.05,m.body,.01),0,-.01,-.047)); g.add(at(box(.004,.004,.002,m.gG),.08,.06,-.0725)); g.add(at(dspRb(.05,.02,.003,M.alu,.002),-.06,.06,-.0725));
  for(const [x,mm] of [[-.07,M.steel],[-.025,M.steel],[.035,M.alu],[.08,M.alu]]){ g.add(at(cyl(.013,.013,.02,mm,14),x,-.112,-.047)); g.add(at(cyl(.009,.009,.022,m.port,10),x,-.113,-.047)); }
  g.add(tube([[-.085,.1,-.07],[-.085,.115,-.105],[.085,.115,-.105],[.085,.1,-.07]],.007,M.black,20));
  for(const x of [-.12,.12]){ g.add(at(cyl(.011,.011,.03,M.steel,12),x,C/2-.012,-.05)); g.add(at(dspRb(.008,.006,.03,M.amber,.002),x,C/2-.032,-.066)); g.add(at(cyl(.004,.006,.012,M.steel,8),x,C/2+.005,-.03)); }
  g.add(at(rot(cyl(.011,.011,.03,M.steel,12),0,0,Q),C/2-.012,.1,-.05)); g.add(at(dspRb(.006,.008,.03,M.amber,.002),C/2-.032,.1,-.066)); return g; }
function ledWallSection(){ const m=dspM(), g=new THREE.Group(), C=.5, NX=4, NY=3, Y0=.2; let lift=null;
  for(let ix=0;ix<NX;ix++) for(let iy=0;iy<NY;iy++){ const c=ledCabinet([ix/NX,iy/NY,(ix+1)/NX,(iy+1)/NY]); c.position.set((ix-(NX-1)/2)*C,Y0+C/2+iy*C,0); g.add(c); if(ix===2&&iy===1){ c.userData.live=true; lift=c; g.add(at(box(C+.01,C+.01,.01,m.port),c.position.x,c.position.y,-.1)); } }
  // ground stack: a base beam on levelling feet, outriggers, and a braced ladder behind each end
  g.add(at(rbox(NX*C+.08,.09,.13,m.frame,.01),0,Y0-.047,-.03)); for(const x of [-.92,0,.92]){ g.add(at(cyl(.011,.011,.1,M.steel,10),x,.06,-.03)); g.add(at(cyl(.045,.05,.014,M.rubber,18),x,.007,-.03)); g.add(at(cyl(.02,.02,.012,M.steel,6),x,.1,-.03)); }
  for(const sx of [-1,1]){ const x=sx*.76; g.add(at(rbox(.07,.05,1.05,m.frame,.012),x,.128,-.42)); for(const z of [.06,-.9]){ g.add(at(cyl(.011,.011,.1,M.steel,10),x,.06,z)); g.add(at(cyl(.045,.05,.014,M.rubber,18),x,.007,z)); }
    g.add(at(dspRb(.05,NY*C-.06,.04,m.frame,.008),x,Y0+NY*C/2,-.092)); g.add(rod2(V(x,.15,-.9),V(x,Y0+NY*C-.12,-.11),.016,M.alu)); g.add(rod2(V(x,.15,-.5),V(x,Y0+NY*C*.5,-.11),.012,M.alu)); for(let k=0;k<NY;k++) g.add(at(dspRb(.07,.03,.03,M.steel,.006),x,Y0+C*.5+k*C,-.085)); }
  // jumpers between cabinets, and the feed coming in
  for(let ix=0;ix<NX-1;ix++) for(let iy=0;iy<NY;iy++){ if((ix===1||ix===2)&&iy===1) continue; const x=(ix-(NX-1)/2)*C, y=Y0+C/2+iy*C-.125; g.add(tube([[x+.08,y,-.047],[x+.1,y-.07,-.06],[x+C-.09,y-.07,-.06],[x+C-.07,y,-.047]],.005,m.cable,14)); }
  g.add(tube([[-.82,Y0+.13,-.047],[-.84,Y0+.02,-.08],[-.9,.012,-.25],[-1.3,.012,-.5],[-1.7,.012,-.45]],.008,m.cable,30));
  dspBake(lift); dspBake(g); return {g,lift}; }

/* what stands for Displays on the homepage: one OLED TV on its rolling stand */
HERO.displays=(G)=>{ const c=oledCart(); c.rotation.y=-.12; G.add(c); };

/* ===== projection models: definitions only, nothing is added to the scene here ===== */
const PRJ={};
function prjM(){ return PRJ.m||(PRJ.m={
  shellW:std(0xe6e3dc,.42,.04,{bumpMap:speckT,bumpScale:.05,envMapIntensity:.8}),   // a light moulded projector housing
  shellG:std(0x2a2b2f,.48,.22,{bumpMap:speckT,bumpScale:.1}),                     // a dark, heavier housing
  vent:std(0x0b0b0d,.72,.1), trim:std(0x9a9893,.34,.6),
  glass:std(0x0a0e15,.03,.35,{envMapIntensity:2.2}), ring:std(0x161618,.42,.4), knurl:std(0x232326,.7,.2),
  sheet:std(0xf6f4ef,.96,0,{envMapIntensity:.25}), drape:std(0x0e0e10,1,0,{bumpMap:weaveF,bumpScale:.3,envMapIntensity:.1}),
  walnut:std(0x6b4529,.52,0,{envMapIntensity:.5}), walnutD:std(0x4a2f1c,.58,0),
  sculpt:std(0xf3f0ea,.86,0,{flatShading:true,emissive:0xffffff,emissiveIntensity:0}),
  gB:glow(0x7fb6ff), gA:glow(AMBER) }); }
const prjRb=(w,h,d,m,r=.004)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.max(.0006,Math.min(r,w/2-.0003,h/2-.0003,d/2-.0003))),m);
const prjLook=(o,from,to)=>{ o.rotation.y=Math.atan2(to.x-from.x,to.z-from.z); return o; };

// a lens: a barrel with focus and zoom rings and a domed front element. Points along +z, front at z=len
function prjLens(r,len){ const m=prjM(), g=new THREE.Group();
  g.add(rot(lathe([[r*.82,0],[r*1.12,0],[r*1.12,len*.12],[r*1.02,len*.16],[r*1.0,len*.9],[r*1.05,len*.93],[r*1.05,len],[r*.86,len]],m.ring,48),Q,0,0));
  for(const [z,w] of [[.34,.16],[.62,.14]]){ const k=rot(cyl(r*1.07,r*1.07,len*w,m.knurl,40),Q,0,0); k.position.z=len*z; g.add(k);
    for(let i=0;i<20;i++){ const a=i/20*Math.PI*2, b=box(r*.08,r*.08,len*w*.9,m.ring); b.position.set(Math.cos(a)*r*1.09,Math.sin(a)*r*1.09,len*z); b.rotation.z=a; g.add(b); } }
  const gl=mesh(new THREE.SphereGeometry(r*.92,40,14,0,Math.PI*2,0,.5),m.glass); gl.rotation.x=Q; gl.position.z=len-r*.8; g.add(gl);
  g.add(at(rot(cyl(r*.95,r*.95,.002,M.black,40),Q,0,0),0,0,len-.004)); return g; }

// the beam: a soft wedge of light from the lens to the picture, brightest at the lens
function prjBeam(from,c,w,h){ const P=[from,V(c.x-w/2,c.y-h/2,c.z),V(c.x+w/2,c.y-h/2,c.z),V(c.x+w/2,c.y+h/2,c.z),V(c.x-w/2,c.y+h/2,c.z)], pos=[], a=[];
  for(let i=1;i<=4;i++){ const p=P[i], q=P[i%4+1]; pos.push(from.x,from.y,from.z,p.x,p.y,p.z,q.x,q.y,q.z); a.push(1,.06,.06); }
  const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); ge.setAttribute('a',new THREE.Float32BufferAttribute(a,1));
  const mt=PRJ.beamM||(PRJ.beamM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{c:{value:new THREE.Color(0xfff6e6)},o:{value:.7}},
    vertexShader:'attribute float a; varying float va; void main(){ va=a; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:'uniform vec3 c; uniform float o; varying float va; void main(){ gl_FragColor=vec4(c,va*va*o); }'}));
  const b=new THREE.Mesh(ge,mt); b.renderOrder=3; b.castShadow=false; return b; }

// a compact projector, the kind that goes on a table or a tripod. Front (+z), lens on the left
function projSmall(){ const m=prjM(), g=new THREE.Group(), W=.31, H=.096, D=.25, Y=.014;
  g.add(at(rbox(W,H,D,m.shellW,.02),0,Y+H/2,0)); g.add(at(rbox(W-.03,.004,D-.05,m.trim,.002),0,Y+H+.001,-.006));
  g.add(at(rot(cyl(.05,.05,.006,M.black,40),Q,0,0),-.078,Y+.05,D/2)); g.add(at(prjLens(.033,.03),-.078,Y+.05,D/2));
  for(let i=0;i<6;i++) g.add(at(box(.112,.0045,.006,m.vent),.072,Y+.024+i*.0105,D/2+.001));
  for(let i=0;i<7;i++){ g.add(at(box(.006,.05,.0045,m.vent),-W/2-.001,Y+.05,-.08+i*.022)); g.add(at(box(.006,.05,.0045,m.vent),W/2+.001,Y+.05,-.08+i*.022)); }
  for(const z of [.07,.042]) g.add(at(prjRb(.034,.007,.012,m.shellG,.003),-.078,Y+H+.003,z));
  g.add(at(prjRb(.07,.004,.07,m.shellG,.006),.085,Y+H+.002,-.045)); for(const [x,z] of [[.085,-.045],[.06,-.045],[.11,-.045],[.085,-.07],[.085,-.02]]) g.add(at(cyl(.006,.006,.005,M.black,12),x,Y+H+.005,z));
  g.add(at(box(.006,.003,.003,m.gB),.04,Y+H+.002,-.1));
  g.add(at(prjRb(.22,.05,.004,M.black,.002),0,Y+.05,-D/2-.001)); for(const [x,w] of [[-.08,.016],[-.05,.02],[-.02,.012],[.01,.012],[.05,.03]]) g.add(at(box(w,.008,.004,m.vent),x,Y+.05,-D/2-.003));
  for(const [x,z] of [[-.11,.09],[.11,.09],[0,-.1]]) g.add(at(cyl(.012,.014,Y,M.rubber,14),x,Y/2,z));
  g.add(tube([[.05,Y+.05,-D/2-.004],[.05,Y+.04,-D/2-.06],[.08,.0,-D/2-.3]],.004,M.black,16));
  g.userData.lens=V(-.078,Y+.05,D/2+.03); return g; }

// a mid-size installation projector, lens in the centre
function projMid(){ const m=prjM(), g=new THREE.Group(), W=.46, H=.155, D=.4, Y=.02;
  g.add(at(rbox(W,H,D,m.shellW,.028),0,Y+H/2,0)); g.add(at(rbox(W-.04,.01,D-.06,m.trim,.004),0,Y+H,0));
  g.add(at(rot(cyl(.075,.075,.008,M.black,48),Q,0,0),0,Y+.078,D/2)); g.add(at(prjLens(.05,.06),0,Y+.078,D/2));
  for(const s of [-1,1]) for(let i=0;i<9;i++) g.add(at(box(.115,.005,.007,m.vent),s*.15,Y+.03+i*.012,D/2+.001));
  for(const s of [-1,1]) for(let i=0;i<10;i++) g.add(at(box(.007,.09,.006,m.vent),s*(W/2+.001),Y+.078,-.15+i*.032));
  for(const x of [-.05,.05]) g.add(at(cyl(.014,.014,.012,m.knurl,20),x,Y+H+.006,.13));
  g.add(at(box(.07,.004,.03,M.black),.13,Y+H+.002,-.12)); g.add(at(box(.006,.003,.003,m.gB),.15,Y+H+.004,-.1));
  for(const [x,z] of [[-.17,.14],[.17,.14],[-.17,-.14],[.17,-.14]]) g.add(at(cyl(.016,.018,Y,M.rubber,14),x,Y/2,z));
  g.add(tube([[0,Y+.06,-D/2],[0,Y+.04,-D/2-.08],[.05,.0,-D/2-.4]],.005,M.black,16));
  g.userData.lens=V(0,Y+.078,D/2+.06); return g; }

// a large laser projector for big screens and mapping, in its rigging frame
function laserProj(){ const m=prjM(), g=new THREE.Group(), W=.62, H=.26, D=.78, Y=.05, LY=Y+H*.46;
  g.add(at(rbox(W,H,D,m.shellG,.03),0,Y+H/2,0)); g.add(at(rbox(W-.03,H-.03,.016,M.black,.012),0,Y+H/2,D/2+.002));
  g.add(at(rot(cyl(.12,.12,.012,m.ring,56),Q,0,0),0,LY,D/2+.012)); const lens=grp(g,0,LY,D/2+.016); lens.add(prjLens(.078,.2));
  for(const s of [-1,1]){ for(let i=0;i<10;i++) g.add(at(box(.008,.007,.6,m.vent),s*(W/2+.002),Y+.05+i*.018,-.04));
    g.add(tube([[s*.27,Y+.04,D/2+.01],[s*.27,Y+.04,D/2+.07],[s*.27,Y+H-.04,D/2+.07],[s*.27,Y+H-.04,D/2+.01]],.011,M.alu,24)); }
  const lc=new THREE.Mesh(new THREE.PlaneGeometry(.11,.045),new THREE.MeshBasicMaterial({map:lcd(['LASER ON','LENS 1.4-2.2','SHUTTER OPEN'],176,72),toneMapped:false})); lc.rotation.x=-Q; lc.position.set(.17,Y+H+.002,-.2); g.add(lc);
  for(let i=0;i<4;i++) g.add(at(cyl(.008,.008,.006,M.black,12),.12+i*.03,Y+H+.003,-.13));
  for(let i=0;i<5;i++) for(let j=0;j<3;j++) g.add(at(box(.09,.04,.006,m.vent),-.22+i*.11,Y+.06+j*.06,-D/2-.002));
  // the frame it is rigged and stacked in
  const fx=W/2+.05, fz=D/2+.1, top=Y+H+.06; for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(cyl(.016,.016,top,M.alu,12),sx*fx,top/2,sz*fz));
  for(const y of [.012,top]){ for(const sz of [-1,1]) g.add(at(rot(cyl(.016,.016,fx*2,M.alu,12),0,0,Q),0,y,sz*fz)); for(const sx of [-1,1]) g.add(at(rot(cyl(.016,.016,fz*2,M.alu,12),Q,0,0),sx*fx,y,0)); }
  for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(cyl(.03,.03,.024,M.steel,12),sx*fx,top+.004,sz*fz));
  g.userData.lens=V(0,LY,D/2+.22); return {g,lens}; }

// a road case on casters, with latches and handles
function prjCase(W,H,D){ const m=prjM(), g=new THREE.Group(), Y=.1;
  g.add(at(rbox(W,H,D,M.shell,.015),0,Y+H/2,0));
  for(const sy of [-1,1]) for(const sz of [-1,1]) g.add(at(rbox(W+.008,.022,.022,M.alu,.004),0,Y+H/2+sy*(H/2-.011),sz*(D/2-.011)));
  for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(rbox(.022,H,.022,M.alu,.004),sx*(W/2-.011),Y+H/2,sz*(D/2-.011)));
  for(const sx of [-1,1]){ g.add(at(rbox(.012,.05,.16,M.steel,.004),sx*(W/2+.006),Y+H*.6,0)); for(const sz of [-1,1]){ g.add(at(rot(cyl(.045,.045,.03,M.rubber,18),0,0,Q),sx*(W/2-.08),.045,sz*(D/2-.08))); g.add(at(rbox(.07,.03,.07,M.steel,.006),sx*(W/2-.08),.085,sz*(D/2-.08))); } }
  for(const sx of [-1,1]) g.add(at(rbox(.06,.04,.01,M.steel,.004),sx*W*.25,Y+H-.06,D/2+.005));
  return g; }

// a projector tripod with a tray; the tray top is at height h
function prjTripod(h){ const g=new THREE.Group(), r=.42, hub=h*.42;
  g.add(at(cyl(.017,.017,h-hub+.05,M.black,16),0,hub+(h-hub)/2,0)); g.add(at(cyl(.026,.026,.08,M.black,16),0,hub,0)); g.add(at(cyl(.03,.03,.03,M.satin,16),0,h*.72,0));
  for(let i=0;i<3;i++){ const a=i*2*Math.PI/3+.5, cx=Math.cos(a), cz=Math.sin(a); g.add(rod2(V(cx*.02,hub,cz*.02),V(cx*r,.012,cz*r),.011,M.black)); g.add(at(cyl(.016,.02,.022,M.rubber,12),cx*r,.011,cz*r));
    g.add(rod2(V(0,h*.3,0),V(cx*.2,hub*(1-.2/r),cz*.2),.006,M.steel)); }
  g.add(at(rbox(.44,.018,.34,M.satin,.006),0,h,0)); for(const s of [-1,1]){ g.add(at(box(.44,.024,.008,M.satin),0,h+.012,s*.166)); g.add(at(box(.008,.024,.34,M.satin),s*.216,h+.012,0)); }
  g.add(at(cyl(.02,.02,.03,M.steel,12),.24,h*.72,0)); return g; }

// a pull-up screen: the case on the floor, a post behind, the sheet with its black top border
function pullUp(Wi,tex){ const m=prjM(), g=new THREE.Group(), Hi=Wi*9/16, y0=.3, Hs=Hi+.16, top=y0+Hs;
  g.add(at(rbox(Wi+.16,.1,.13,M.alu,.035),0,.07,0)); for(const s of [-1,1]){ g.add(at(rbox(.04,.11,.14,M.black,.015),s*(Wi/2+.09),.072,0)); g.add(at(rbox(.06,.014,.36,M.black,.005),s*(Wi/2-.04),.007,0)); }
  g.add(at(cyl(.013,.013,top-.12,M.alu,12),0,.12+(top-.12)/2,-.035)); g.add(at(cyl(.018,.018,.08,M.black,12),0,.16,-.035)); g.add(at(cyl(.016,.016,.06,M.black,12),0,y0+Hs*.55,-.035));
  g.add(at(box(Wi+.04,Hs,.003,m.sheet),0,y0+Hs/2,0)); g.add(at(box(Wi+.04,.12,.004,M.black),0,top-.06,.001)); g.add(at(box(Wi+.04,.03,.004,M.black),0,y0+.015,.001));
  g.add(at(rbox(Wi+.08,.03,.03,M.alu,.008),0,top+.012,0)); g.add(at(rbox(.06,.05,.05,M.black,.01),0,top+.01,-.03));
  const img=dspScreen(Wi-.02,Hi-.02,PRJ.imgM||(PRJ.imgM=new THREE.MeshBasicMaterial({map:tex,toneMapped:false,color:0xe9e6e0}))); img.position.set(0,y0+.03+Hi/2,.0025); g.add(img);
  g.userData.img={c:V(0,y0+.03+Hi/2,.003),w:Wi-.02,h:Hi-.02}; return g; }

// a fast-fold screen: a surface in a black drape border on an aluminium frame and two legs
function fastFold(Wi,lift,mat){ const m=prjM(), g=new THREE.Group(), Hi=Wi*9/16, Wf=Wi+.24, Hf=Hi+.24, cy=lift+Hf/2;
  g.add(at(box(Wf,Hf,.012,m.drape),0,cy,-.008)); g.add(at(box(Wi+.04,Hi+.04,.006,m.sheet),0,cy,.004));
  const img=dspScreen(Wi,Hi,mat); img.position.set(0,cy,.014); g.add(img);
  for(const s of [-1,1]){ g.add(at(rbox(Wf,.036,.036,M.alu,.006),0,cy+s*(Hf/2-.02),-.04)); g.add(at(rbox(.036,Hf,.036,M.alu,.006),s*(Wf/2-.02),cy,-.04)); }
  for(const s of [-1,1]){ const x=s*(Wf/2-.32); g.add(at(rbox(.042,cy+Hf*.3,.042,M.alu,.006),x,(cy+Hf*.3)/2,-.085)); g.add(at(rbox(.05,.04,.8,M.alu,.008),x,.02,-.085));
    for(const z of [-.45,.28]) g.add(at(cyl(.025,.028,.012,M.rubber,12),x,.006,-.085+z));
    g.add(rod2(V(x,lift*.6,-.085),V(x+s*.3,cy-Hf/2+.02,-.06),.009,M.alu)); g.add(at(rbox(.06,.06,.05,M.steel,.006),x,cy-Hf/2+.02,-.07)); }
  g.userData.img={c:V(0,cy,.014),w:Wi,h:Hi}; return g; }

// mapping across several surfaces: panels of different sizes at different depths, one picture landing on all of them from where the projectors hang
function mapPanels(src,target,tex){ const m=prjM(), g=new THREE.Group(), list=[[3.0,1.69,0,1.62,-.7],[1.15,1.75,-2.55,1.38,.25],[1.5,.95,2.45,1.75,.45]], panels=[];
  const cam=new THREE.PerspectiveCamera(34,1.6,.1,50); cam.position.copy(src); cam.lookAt(target); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const mat=new THREE.MeshBasicMaterial({map:tex,toneMapped:false});
  for(const [w,h,x,y,z] of list){ const pg=grp(g,x,y,z); pg.rotation.y=-x*.06;
    pg.add(at(box(w+.05,h+.05,.05,M.black),0,0,-.03)); pg.add(at(box(w+.07,.02,.06,M.satin),0,h/2+.035,-.03));
    const ge=new THREE.PlaneGeometry(w,h,8,8); const sf=new THREE.Mesh(ge,mat); sf.position.z=.0; pg.add(sf); pg.updateMatrixWorld(true); g.updateMatrixWorld(true);
    const P=ge.attributes.position, uv=ge.attributes.uv, v=V(0,0,0); for(let k=0;k<P.count;k++){ v.set(P.getX(k),P.getY(k),0).applyMatrix4(pg.matrix).project(cam); uv.setXY(k,v.x*.5+.5,v.y*.5+.5); } uv.needsUpdate=true;
    // a base and a post, the way free-standing gallery panels stand
    pg.add(at(cyl(.022,.022,y-h/2,M.black,12),0,-(y-h/2)/2-h/2,-.09)); pg.add(at(rbox(.5,.025,.5,M.satin,.008),0,-y+.0125,-.09));
    sf.userData.img={c:V(0,0,0),w,h}; panels.push(sf); }
  return {g,panels}; }

// what goes on the panels: a calibration grid, then the picture wiping across as the mapping is set
function prjMapTex(src){ if(PRJ.mapT) return PRJ.mapT; const W=1024, H=640, t=ctex(W,H,()=>{}), g=t.userData.g; t.userData.u=0;
  const draw=()=>{ const u=t.userData.u, cut=W*u; g.fillStyle='#e9e7e1'; g.fillRect(0,0,W,H); g.strokeStyle='rgba(30,30,34,.5)'; g.lineWidth=2;
    for(let x=0;x<=W;x+=48){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); } for(let y=0;y<=H;y+=48){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
    g.strokeStyle='rgba(232,137,45,.9)'; g.lineWidth=3; g.beginPath(); g.moveTo(0,0); g.lineTo(W,H); g.moveTo(W,0); g.lineTo(0,H); g.stroke(); g.beginPath(); g.arc(W/2,H/2,H*.3,0,Math.PI*2); g.stroke();
    if(cut>0){ g.save(); g.beginPath(); g.rect(0,0,cut,H); g.clip(); g.drawImage(src.userData.c,0,0,W,H); g.restore(); if(u<1){ g.fillStyle='#f3f0ea'; g.fillRect(cut-3,0,6,H); } }
    t.needsUpdate=true; };
  let f=0, last=-1; draw(); updaters.push(()=>{ if(t.userData.u!==last||f++%6===0){ last=t.userData.u; draw(); } }); return PRJ.mapT=t; }

// a twisted column: a rounded square (superellipse) rising and turning, slightly tapered. uv: u around, v up
function twistColumn(Sz,H,turn,taper){ const N=96, Mr=110, pos=[], uv=[], idx=[];
  for(let j=0;j<=Mr;j++){ const t=j/Mr, a=turn*t, sc=1-(1-taper)*t, ca=Math.cos(a), sa=Math.sin(a);
    for(let k=0;k<=N;k++){ const th=k/N*Math.PI*2, c=Math.cos(th), s=Math.sin(th), x=Math.sign(c)*Math.pow(Math.abs(c),.4)*Sz/2*sc, z=Math.sign(s)*Math.pow(Math.abs(s),.4)*Sz/2*sc;
      pos.push(x*ca-z*sa,t*H,x*sa+z*ca); uv.push(k/N,t); } }
  for(let j=0;j<Mr;j++) for(let k=0;k<N;k++){ const a=j*(N+1)+k, b=a+N+1; idx.push(a,b,a+1,b,b+1,a+1); }
  const top=pos.length/3; pos.push(0,H,0); uv.push(0,1); const r0=Mr*(N+1); for(let k=0;k<N;k++){ const q=r0+k; pos.push(pos[q*3],pos[q*3+1],pos[q*3+2]); uv.push(0,1); }
  for(let k=0;k<N;k++) idx.push(top,top+1+((k+1)%N),top+1+k);
  const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); ge.setIndex(idx); ge.computeVertexNormals(); return ge; }

// mapping on an object: two twisted columns on a plinth. The edges are traced first, then a scan line rises
// and fills each face with content that follows the form: a slow violet-to-amber wash with a band of light drifting up
function mapForms(){ const g=new THREE.Group();
  g.add(at(rbox(2.7,.14,1.6,M.shell,.03),.15,.07,0)); g.add(at(rbox(2.74,.012,1.64,M.alu,.004),.15,.142,0));
  const mat=PRJ.objM||(PRJ.objM=new THREE.ShaderMaterial({uniforms:{u:{value:0},t:{value:0}},
    vertexShader:'varying vec2 vUv; varying vec3 vN; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:['uniform float u; uniform float t; varying vec2 vUv; varying vec3 vN;',
      'void main(){ float lit=.6+.4*max(dot(vN,normalize(vec3(-.4,.75,.55))),0.);',
      ' float f=fract(vUv.x*4.-.5), d=min(f,1.-f)*.25, line=smoothstep(.0055,.0012,d);',
      ' float on=smoothstep(0.,.22,u), lv=u*1.3-.25, fill=smoothstep(lv+.015,lv-.015,vUv.y), scan=exp(-pow((vUv.y-lv)*55.,2.))*(1.-smoothstep(.92,1.,u));',
      ' vec3 A=vec3(.11,.075,.21), B=vec3(.92,.40,.08), C=vec3(1.,.9,.76);',
      ' float gr=smoothstep(0.,1.,vUv.y*.95+.12*sin(vUv.x*12.566+t*.35));',
      ' vec3 c=mix(A,B,gr); float band=exp(-pow((vUv.y-fract(t*.08))*6.,2.)); c=mix(c,C,band*.6); c*=.86+.14*lit;',
      ' vec3 base=vec3(.8,.79,.76)*lit; vec3 col=mix(base,c,fill);',
      ' col=mix(col,vec3(1.,.74,.45),line*on*.85); col+=vec3(1.,.82,.6)*scan*on*.9; gl_FragColor=vec4(col,1.);',
      '#include <colorspace_fragment>','}'].join('\n')}));
  for(const [Sz,H,turn,tp,x,z,r] of [[.82,2.5,Math.PI*.62,.78,-.38,-.12,.2],[.7,1.5,-Math.PI*.48,.86,.82,.32,-.35]]){ const m=new THREE.Mesh(twistColumn(Sz,H,turn,tp),mat); m.position.set(x,.148,z); m.rotation.y=r; m.castShadow=true; g.add(m); }
  g.userData.mat=mat; return g; }

// a projector hung upside down from a truss, aimed with yaw and pitch
function hungProj(yaw,pitch){ const g=new THREE.Group(), c=grp(g,0,-.12,0); c.rotation.order='YXZ'; c.rotation.set(pitch,yaw,0);
  const p=projMid(); p.remove(p.children[p.children.length-1]); p.rotation.z=Math.PI; p.position.y=.2; c.add(p); c.add(at(rbox(.3,.02,.26,M.satin,.006),0,.02,0));
  g.add(at(cyl(.012,.012,.12,M.steel,10),0,-.06,0)); g.add(at(rbox(.08,.05,.06,M.black,.008),0,.0,0)); g.userData.proj=p; return g; }

// home theater: an ultra-short-throw projector on a media console, a screen that rises from the floor behind it, and two tower speakers
function homeTheater(tex){ const m=prjM(), g=new THREE.Group(), CW=1.8, CH=.42, CY=.11;
  g.add(at(rbox(CW,CH,.46,m.walnut,.02),0,CY+CH/2,0)); for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(cyl(.016,.012,CY,M.black,12),sx*(CW/2-.1),CY/2,sz*.16));
  for(let i=0;i<34;i++) g.add(at(box(.026,CH-.08,.012,m.walnutD),-CW/2+.1+i*(CW-.2)/33,CY+CH/2,.236));
  const ust=grp(g,0,CY+CH,.02); ust.add(at(rbox(.58,.13,.36,m.shellW,.035),0,.075,0)); ust.add(at(box(.54,.09,.004,M.fabricD),0,.065,.181)); ust.add(at(box(.22,.004,.07,m.glass),0,.141,-.11));
  for(const x of [-.22,.22]) for(const z of [-.13,.13]) ust.add(at(cyl(.014,.016,.012,M.rubber,12),x,.006,z)); ust.add(at(box(.006,.003,.003,m.gB),.2,.13,.16));
  // the floor-rising screen: housing on the floor, the sheet rises out of it (scaled from the bottom), the picture comes on once it is up
  const SW=2.2, SH=1.24, drop=.42, z=-.5; g.add(at(rbox(SW+.16,.15,.2,M.black,.03),0,.075,z)); for(const s of [-1,1]) g.add(at(rbox(.05,.16,.21,M.satin,.01),s*(SW/2+.08),.08,z));
  const lift=grp(g,0,.15,z), sheet=grp(lift,0,0,0);
  sheet.add(at(box(SW,drop,.004,M.black),0,drop/2,0)); sheet.add(at(box(SW,SH,.004,m.sheet),0,drop+SH/2,0)); sheet.add(at(box(SW,.05,.004,M.black),0,drop+SH+.025,0));
  const pm=new THREE.MeshBasicMaterial({map:tex,toneMapped:false,transparent:true,opacity:0,color:0xe9e6e0}), pic=dspScreen(SW-.04,SH-.04,pm); pic.position.set(0,drop+SH/2,.003); sheet.add(pic);
  const bar=grp(lift,0,drop+SH+.05,0); bar.add(at(rbox(SW+.04,.03,.04,M.black,.01),0,.015,0));
  for(const s of [-1,1]){ const t=grp(g,s*1.42,0,-.1); t.rotation.y=-s*.18; t.add(at(rbox(.22,1.04,.3,M.shell,.02),0,.06+.52,0)); t.add(at(box(.2,.98,.004,M.fabricD),0,.06+.52,.152)); t.add(at(rbox(.3,.03,.36,M.satin,.008),0,.015,0)); for(const x of [-.11,.11]) for(const zz of [-.14,.14]) t.add(at(cyl(.012,.012,.03,M.steel,10),x,.045,zz)); }
  const rise=(u)=>{ const k=Math.max(.001,u); sheet.scale.y=k; bar.position.y=(drop+SH+.05)*k; pm.opacity=sstep(.86,1,u); sheet.visible=u>.002; };
  rise(1); return {g,rise}; }

/* what stands for Projection on the homepage: a compact projector on its tripod, throwing onto a pull-up screen */
HERO.projection=(G)=>{ const s=pullUp(1.6,dspCalmTex()); s.position.set(0,0,-.2); G.add(s); const t=prjTripod(.95); t.position.set(.35,0,1.9); t.rotation.y=Math.PI-.08; G.add(t); const p=projSmall(); p.position.y=.959; t.add(p); };

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

/* ===== interactive & tracking models: definitions only, nothing is added to the scene here ===== */
const XM={
  body:std(0x1b1c1f,.45,.3,{envMapIntensity:.9}), body2:std(0x2b2c30,.4,.45,{envMapIntensity:.95}), dark:std(0x0a0b0d,.7,.1), glass:std(0x06080b,.04,.3,{envMapIntensity:2.2}),
  white:std(0xf2efe9,.38,.02,{envMapIntensity:.9}), alu:std(0xc9c6bf,.3,.9,{envMapIntensity:1}), truss:std(0xbdbab3,.32,.85,{envMapIntensity:1}), rubber:std(0x121214,.88,0),
  plinth:std(0xe9e5de,.6,0,{envMapIntensity:.5}), tape:std(AMBER,.6,0), print:std(0x2a2b2f,.95,0),
};
const xrb=(w,h,d,m,r=.003,cast=true)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.max(.0004,Math.min(r,w/2-.0002,h/2-.0002,d/2-.0002))),m,cast);
const xTubeG=(pts,r,seg=40,rad=6)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>p.isVector3?p:V(...p))),seg,r,rad);
const xRR=(g,x,y,w,h,r)=>{ g.beginPath(); g.roundRect(x,y,w,h,r); g.fill(); };
// one shoe print, toe towards +z, as a flat shape on the floor
const xShoeG=(()=>{ let ge=null; return ()=>{ if(ge) return ge; const s=new THREE.Shape(); s.moveTo(0,-.13); s.bezierCurveTo(.045,-.13,.05,-.06,.04,-.02); s.bezierCurveTo(.032,.02,.05,.07,.045,.1); s.bezierCurveTo(.04,.14,-.04,.14,-.045,.1); s.bezierCurveTo(-.05,.06,-.04,.0,-.038,-.04); s.bezierCurveTo(-.042,-.1,-.035,-.13,0,-.13);
  ge=new THREE.ShapeGeometry(s,12); ge.rotateX(-Q); return ge; }; })();
function xSteps(G,path,mat){ const out=[]; path.forEach(([x,z,ry,side],i)=>{ const m=new THREE.Mesh(xShoeG(),mat||new THREE.MeshBasicMaterial({color:0x1a1a18,transparent:true,opacity:.0,depthWrite:false})); m.position.set(x+Math.cos(ry)*.065*side,.0035,z-Math.sin(ry)*.065*side); m.rotation.y=ry; m.userData.live=true; G.add(m); out.push(m); }); return out; }
// a walking path: n steps from a to b
const xWalk=(a,b,n)=>{ const out=[], ry=Math.atan2(b[0]-a[0],b[1]-a[1]); for(let i=0;i<n;i++){ const t=i/(n-1); out.push([lerp(a[0],b[0],t),lerp(a[1],b[1],t),ry,i%2?1:-1]); } return out; };

/* ---------- interactive content: particles that part around wherever someone is ---------- */
function xFieldTex(W=1024,H=576,pal='amber'){ const t=ctex(W,H,()=>{}), g=t.userData.g, N=Math.round(W*H/700), P=[];
  for(let i=0;i<N;i++) P.push({x:Math.random()*W,y:Math.random()*H,vx:0,vy:0,s:2+Math.random()*3.5,h:Math.random()});
  t.userData.draw=(tt,pts=[],k=1)=>{ g.fillStyle='#0c0d10'; g.fillRect(0,0,W,H); g.fillStyle='rgba(255,255,255,.05)'; for(let y=16;y<H;y+=32) for(let x=16;x<W;x+=32) g.fillRect(x,y,2,2); const gr=g.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,W*.6); gr.addColorStop(0,'rgba(232,137,45,.18)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,W,H);
    for(const p of pts){ for(let r=0;r<4;r++){ const rr=((tt*90+r*45)%180)*k; g.strokeStyle=`rgba(232,137,45,${(1-rr/180)*.7*k})`; g.lineWidth=3; g.beginPath(); g.arc(p[0]*W,p[1]*H,rr+20,0,7); g.stroke(); } const gl=g.createRadialGradient(p[0]*W,p[1]*H,0,p[0]*W,p[1]*H,150); gl.addColorStop(0,`rgba(255,214,160,${.75*k})`); gl.addColorStop(.4,`rgba(232,137,45,${.35*k})`); gl.addColorStop(1,'rgba(232,137,45,0)'); g.fillStyle=gl; g.fillRect(p[0]*W-150,p[1]*H-150,300,300); }
    for(const q of P){ let ax=Math.sin(q.y*.01+tt*.4)*.05, ay=Math.cos(q.x*.008+tt*.3)*.05; for(const p of pts){ const dx=q.x-p[0]*W, dy=q.y-p[1]*H, d2=dx*dx+dy*dy+1; if(d2<26000){ const f=k*900/d2; ax+=dx*f*.02; ay+=dy*f*.02; } }
      q.vx=(q.vx+ax)*.9; q.vy=(q.vy+ay)*.9; q.x=(q.x+q.vx+W)%W; q.y=(q.y+q.vy+H)%H; g.fillStyle=q.h<.7?`rgba(232,137,45,${.6+.4*q.h})`:`rgba(255,240,224,.85)`; g.fillRect(q.x,q.y,q.s,q.s); }
    t.needsUpdate=true; }; t.userData.draw(0,[]); return t; }

/* ---------- a depth sensor: a slim bar with three windows, on a ball head ---------- */
function xSensor(){ const g=new THREE.Group(), st=new THREE.Group(), W=.25;
  st.add(rbox(W,.038,.034,XM.body,.016)); st.add(at(xrb(W-.024,.026,.002,XM.glass,.008),0,0,.0168));
  for(const [x,r] of [[-.075,.0075],[-.02,.006],[.03,.0068],[.08,.0075]]){ st.add(at(rot(cyl(r+.002,r+.002,.002,XM.dark,24),Q),x,0,.0172)); st.add(at(rot(cyl(r,r,.001,std(0x1d2a3a,.05,.4,{envMapIntensity:2.4}),24),Q),x,0,.0182)); }
  const led=at(xrb(.004,.004,.001,glow(0x8fd0ff),.0015),.11,.009,.0178); st.add(led);
  for(let i=0;i<14;i++) st.add(at(xrb(.003,.0015,.024,XM.dark,.0006),-.09+i*.014,.0192,-.002));
  st.add(at(rot(cyl(.006,.006,.012,M.alu,14),Q),0,0,-.022)); // threaded mount
  g.add(st); return g; }
function xSensorStand(h=1.5,tilt=.35){ const g=new THREE.Group(), st=new THREE.Group();
  st.add(lathe([[0,0],[.15,0],[.16,.005],[.16,.012],[.15,.017],[.045,.022],[.028,.03],[0,.03]],M.black,56)); st.add(at(cyl(.013,.013,h-.06,M.satin,18),0,(h-.03)/2+.015,0)); st.add(at(cyl(.02,.02,.04,M.black,18),0,h*.55,0)); st.add(at(rot(cyl(.005,.005,.03,M.steel,10),0,0,Q),.025,h*.55,0));
  st.add(at(sph(.018,M.black,20,14),0,h,0)); st.add(at(cyl(.008,.008,.03,M.steel,12),0,h+.02,0));
  st.add(mesh(xTubeG([[0,.004,-.25],[0,.006,-.12],[0,.03,-.03],[0,.2,-.016],[0,h-.1,-.016],[0,h-.02,-.03],[0,h+.04,-.035]],.0028,40,6),XM.dark));
  const s=xSensor(); s.position.set(0,h+.055,0); s.rotation.x=tilt; st.add(s); g.add(st); g.userData={sensor:s,h}; return g; }

/* ---------- a freestanding portrait screen with the sensor on top ---------- */
function xPortrait(map,W=.78,H=1.39,y0=.32){ const g=new THREE.Group(), st=new THREE.Group();
  st.add(at(rbox(W+.03,H+.03,.04,XM.body,.012),0,y0+H/2,-.02)); st.add(at(rbox(.12,y0+.05,.05,XM.body2,.01),0,(y0+.05)/2,-.06)); st.add(at(rbox(.6,.03,.45,XM.body,.012),0,.015,-.06));
  for(const sx of [-1,1]) for(const sz of [-1,1]) st.add(at(cyl(.02,.022,.008,XM.rubber,14),sx*.25,.004,-.06+sz*.18));
  const s=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map,toneMapped:false})); s.position.set(0,y0+H/2,.0012); st.add(s);
  const sn=xSensor(); sn.position.set(0,y0+H+.035,.005); sn.rotation.x=.28; sn.scale.setScalar(.9); st.add(sn); st.add(at(xrb(.05,.02,.04,XM.body,.006),0,y0+H+.02,-.01));
  g.add(st); g.userData={screen:s}; return g; }

/* ---------- truss goal post with a projector and a sensor looking down at the floor ---------- */
function xTrussBeam(L,m=XM.truss){ const g=new THREE.Group(), s=.29/2, R=.024, r=.008; for(const [y,z] of [[s,s],[s,-s],[-s,s],[-s,-s]]) g.add(at(rot(cyl(R,R,L,m,14),0,0,Q),0,y,z));
  const n=Math.round(L/.5); for(let i=0;i<n;i++){ const x0=-L/2+i*L/n, x1=x0+L/n; for(const [a,b] of [[[s,s],[-s,s]],[[s,-s],[-s,-s]],[[s,s],[s,-s]],[[-s,s],[-s,-s]]]) g.add(rod2(V(x0,a[0],a[1]),V(x1,b[0],b[1]),r,m)); } return g; }
function xTrussLeg(H,m=XM.truss){ const g=xTrussBeam(H,m); g.rotation.z=Q; return g; }
function xProjector(){ const g=new THREE.Group(), st=new THREE.Group(); st.add(rbox(.42,.15,.36,XM.white,.03)); st.add(at(rot(cyl(.05,.055,.04,XM.dark,32),Q),.1,-.005,.19)); st.add(at(rot(cyl(.04,.04,.002,XM.glass,32),Q),.1,-.005,.211));
  for(let i=0;i<8;i++) st.add(at(xrb(.004,.08,.002,XM.dark,.001),-.18+i*.012,0,.181)); st.add(at(xrb(.3,.012,.28,XM.body2,.004),0,-.081,0)); g.add(st); return g; }
function xGoalPost(W=3.6,H=3.0){ const g=new THREE.Group(), st=new THREE.Group();
  for(const sx of [-1,1]){ const l=xTrussLeg(H); l.position.set(sx*W/2,H/2,0); st.add(l); st.add(at(rbox(.42,.012,.42,M.steel,.004),sx*W/2,.006,0)); for(const dx of [-1,1]) for(const dz of [-1,1]) st.add(at(cyl(.012,.012,.03,M.steel,10),sx*W/2+dx*.17,.02,dz*.17)); }
  const b=xTrussBeam(W+.29); b.position.set(0,H+.145,0); st.add(b); for(const sx of [-1,1]) st.add(at(rbox(.3,.3,.3,M.steel,.02),sx*W/2,H+.145,0));
  const pj=xProjector(); pj.position.set(.25,H-.12,0); pj.rotation.x=Q*.98; st.add(pj); for(const x of [.12,.38]) st.add(at(cyl(.008,.008,.12,M.steel,8),x,H-.02,0));
  const sn=xSensor(); sn.position.set(-.35,H-.05,0); sn.rotation.x=Q; st.add(sn); st.add(at(cyl(.008,.008,.06,M.steel,8),-.35,H-.0,0));
  g.add(st); return g; }

/* ---------- an interactive floor: a lit rectangle on the floor, the content following the steps across it ---------- */
function xFloor(G,W=3.0,D=2.0,pts){ const t=xFieldTex(1024,Math.round(1024*D/W)), m=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshBasicMaterial({map:t,toneMapped:false,transparent:true,opacity:1})); m.rotation.x=-Q; m.position.y=.002; m.receiveShadow=false; G.add(m);
  const edge=new THREE.Mesh(new THREE.PlaneGeometry(W+.04,D+.04),new THREE.MeshBasicMaterial({color:0x0b0c0e,toneMapped:false})); edge.rotation.x=-Q; edge.position.y=.0012; G.add(edge);
  return {mesh:m,tex:t,W,D}; }

/* ---------- motion tracking: a camera with a ring of IR lights, on a pole ---------- */
function xMocapCam(){ const g=new THREE.Group(), st=new THREE.Group(); st.add(at(rbox(.11,.09,.14,XM.body,.014),0,0,-.03)); st.add(at(rot(cyl(.048,.05,.03,XM.body2,40),Q),0,0,.05)); st.add(at(rot(cyl(.022,.022,.02,XM.dark,28),Q),0,0,.068)); st.add(at(rot(cyl(.016,.016,.001,XM.glass,24),Q),0,0,.0785));
  for(let i=0;i<8;i++) st.add(at(xrb(.004,.06,.03,XM.dark,.001),-.02+((i%2)*.04),0,-.05)); st.add(at(xrb(.03,.006,.002,glow(0x7ee08f),.001),0,.03,.0405));
  const leds=new THREE.InstancedMesh(new THREE.SphereGeometry(.0038,10,8),new THREE.MeshBasicMaterial({color:0xff5a2a,toneMapped:false}),20), mt=new THREE.Matrix4(); for(let i=0;i<20;i++){ const a=i/20*Math.PI*2; mt.makeTranslation(Math.cos(a)*.036,Math.sin(a)*.036,.066); leds.setMatrixAt(i,mt); } st.add(leds);
  g.add(st); g.userData.leds=leds; return g; }
function xMocapPole(h=2.2,aimTo=V(0,1,0)){ const g=new THREE.Group(); g.add(lathe([[0,0],[.18,0],[.19,.005],[.19,.012],[.18,.017],[.05,.022],[.03,.03],[0,.03]],M.black,56)); g.add(at(cyl(.016,.016,h-.03,M.satin,18),0,(h+.03)/2,0)); g.add(at(cyl(.022,.022,.05,M.black,18),0,h*.5,0));
  g.add(at(sph(.022,M.black,20,14),0,h+.01,0)); const c=xMocapCam(); c.position.y=h+.07; g.add(c); g.userData={cam:c}; return g; }
function xWand(){ const g=new THREE.Group(); g.add(at(rot(cyl(.009,.009,.5,XM.body,14),0,0,Q),0,0,0)); g.add(at(cyl(.011,.013,.32,XM.body2,14),0,-.16,0));
  const balls=[]; for(const x of [-.24,-.08,.24]){ const b=sph(.014,std(0xd8dbe0,.35,.2,{envMapIntensity:1.5}),18,12); b.position.set(x,.014,0); g.add(b); balls.push(b); } g.userData.balls=balls; return g; }
// the capture area: tape on the floor
function xTapeSquare(G,W=3.0,D=3.0){ for(const [w,d,x,z] of [[W,.05,0,-D/2],[W,.05,0,D/2],[.05,D,-W/2,0],[.05,D,W/2,0]]){ const m=box(w,.002,d,XM.tape); m.position.set(x,.001,z); m.castShadow=false; G.add(m); }
  for(const [x,z] of [[0,0]]){ for(const [w,d] of [[.3,.05],[.05,.3]]){ const m=box(w,.002,d,XM.tape); m.position.set(x,.0011,z); m.castShadow=false; G.add(m); } } }

/* ---------- RFID / NFC: a reader on a plinth, a badge, and the screen that answers ---------- */
function xBadge(){ const g=new THREE.Group(); g.add(rbox(.086,.0016,.054,XM.white,.003));
  const pr=new THREE.Mesh(new THREE.PlaneGeometry(.082,.05),new THREE.MeshBasicMaterial({toneMapped:false,map:ctex(328,200,(c,w,h)=>{ c.fillStyle='#f2efe9'; c.fillRect(0,0,w,h); c.fillStyle='#E8892D'; c.fillRect(0,0,w,46); c.fillStyle='#1a1a18'; c.font='700 30px "Geist", sans-serif'; c.fillText('GUEST',18,104); c.font='500 18px "Geist Mono", monospace'; c.fillStyle='#55524c'; c.fillText('ACCESS · ALL AREAS',18,140); c.fillStyle='#1a1a18'; c.strokeStyle='#1a1a18'; c.lineWidth=3; for(let k=1;k<4;k++){ c.beginPath(); c.arc(270,140,k*12,-0.8,0.8); c.stroke(); } c.fillRect(250,132,8,16); })})); pr.rotation.x=-Q; pr.position.y=.00085; g.add(pr);
  g.add(at(xrb(.014,.002,.006,XM.dark,.001),0,.0006,-.024)); return g; }
function xReader(){ const g=new THREE.Group(), st=new THREE.Group(); st.add(rbox(.16,.026,.16,XM.white,.012)); st.add(at(xrb(.13,.002,.13,std(0xe6e2db,.25,.05,{envMapIntensity:1.2}),.012),0,.0135,0));
  const ic=new THREE.Mesh(new THREE.PlaneGeometry(.07,.07),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false,map:ctex(256,256,(c,w,h)=>{ c.strokeStyle='#9a958c'; c.lineWidth=12; c.lineCap='round'; for(let k=1;k<4;k++){ c.beginPath(); c.arc(90,128,k*30,-0.9,0.9); c.stroke(); } c.fillStyle='#9a958c'; c.fillRect(70,100,14,56); })})); ic.rotation.x=-Q; ic.position.y=.0148; st.add(ic);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.072,.078,64),new THREE.MeshBasicMaterial({color:AMBER,toneMapped:false,transparent:true,opacity:.15})); ring.rotation.x=-Q; ring.position.y=.0149; st.add(ring);
  g.add(st); g.userData.ring=ring; return g; }
function xPlinth(w=.5,h=1.0,d=.5){ return at(rbox(w,h,d,XM.plinth,.012),0,h/2,0); }
function xWelcomeTex(){ const t=ctex(768,432,()=>{}), g=t.userData.g; t.userData.draw=(tt,on)=>{ g.fillStyle='#0a0b0d'; g.fillRect(0,0,768,432);
  if(on<.5){ g.fillStyle='#55524c'; g.font='500 22px "Geist Mono", monospace'; g.textAlign='center'; g.fillText('TAP YOUR BADGE',384,226); g.strokeStyle='#E8892D'; g.lineWidth=4; const r=40+Math.sin(tt*3)*6; g.beginPath(); g.arc(384,150,r,0,7); g.stroke(); g.textAlign='left'; t.needsUpdate=true; return; }
  const gr=g.createLinearGradient(0,0,768,432); gr.addColorStop(0,'#E8892D'); gr.addColorStop(1,'#3a2a3e'); g.fillStyle=gr; g.fillRect(0,0,768,432); g.fillStyle='rgba(255,255,255,.95)'; g.font='700 64px "Geist", sans-serif'; g.textAlign='center'; g.fillText('Welcome.',384,200); g.font='500 22px "Geist Mono", monospace'; g.fillText('YOUR TOUR STARTS HERE  →',384,250); g.textAlign='left';
  for(let i=0;i<30;i++){ const a=i/30*Math.PI*2+tt*.3, r=250+Math.sin(tt+i)*20; g.fillStyle='rgba(255,240,224,.5)'; g.fillRect(384+Math.cos(a)*r,216+Math.sin(a)*r*.5,3,3); } t.needsUpdate=true; }; t.userData.draw(0,0); return t; }

/* ---------- 3D & real-time content: a wireframe sculpture drawing itself, and the same piece rendered on a screen ---------- */
function xSculpture(){ const g=new THREE.Group(), ge=new THREE.TorusKnotGeometry(.32,.1,160,18,2,3), wf=new THREE.WireframeGeometry(ge);
  const lines=new THREE.LineSegments(wf,new THREE.LineBasicMaterial({color:AMBER,transparent:true,opacity:.85,toneMapped:false})); g.add(lines);
  const solid=new THREE.Mesh(ge,std(0x2b2c30,.28,.85,{envMapIntensity:1.4,transparent:true,opacity:0})); solid.castShadow=true; g.add(solid);
  g.userData={lines,solid,n:wf.attributes.position.count}; return g; }
function xRenderTex(){ const t=ctex(768,432,()=>{}), g=t.userData.g; t.userData.draw=(tt,k=1)=>{ g.fillStyle='#0b0c0f'; g.fillRect(0,0,768,432); const cx=384, cy=216, R=120;
  // a torus knot drawn in 2D, shaded by depth, turning
  const pts=[]; for(let i=0;i<=420;i++){ const u=i/420*Math.PI*2*1, p=2, q=3, r=Math.cos(q*u)+2; let x=r*Math.cos(p*u), y=r*Math.sin(p*u), z=-Math.sin(q*u); const a=tt*.5, b=.5; const x1=x*Math.cos(a)-z*Math.sin(a), z1=x*Math.sin(a)+z*Math.cos(a); const y1=y*Math.cos(b)-z1*Math.sin(b), z2=y*Math.sin(b)+z1*Math.cos(b); pts.push([cx+x1*R*.42,cy+y1*R*.42,z2]); }
  for(let i=1;i<pts.length;i++){ const d=(pts[i][2]+1.5)/3; g.strokeStyle=`rgba(${Math.round(120+135*d)},${Math.round(70+80*d)},${Math.round(30+30*d)},${.35+.65*d*k})`; g.lineWidth=10+12*d; g.lineCap='round'; g.beginPath(); g.moveTo(pts[i-1][0],pts[i-1][1]); g.lineTo(pts[i][0],pts[i][1]); g.stroke(); }
  g.fillStyle='#7d8791'; g.font='600 15px "Geist Mono", monospace'; g.fillText('REAL-TIME · 60 FPS',24,36); g.fillStyle='#E8892D'; g.fillRect(24,404,(tt*80)%720,3); t.needsUpdate=true; }; t.userData.draw(0); return t; }

/* what stands for Interactive on the homepage: a portrait screen with the sensor on top, and footprints in front of it */
HERO.interactive=(G)=>{ const t=xFieldTex(512,912), p=xPortrait(t); G.add(p); const steps=xSteps(G,[[-.15,.75,Math.PI,-1],[.12,.6,Math.PI,1]],new THREE.MeshBasicMaterial({color:0x1a1a18,transparent:true,opacity:.35,depthWrite:false}));
  let fr=0; updaters.push(tt=>{ if(fr++%3) return; t.userData.draw(tt,[[.5+Math.sin(tt*.6)*.18,.55+Math.cos(tt*.45)*.12]],1); }); };

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

/* ===== homepage: one piece from every service ===== */
// The whole line-up is seen only in the opening and the closing shot (two copies of it, one at each end).
// In between, each service gets its own close-up set, 12 m apart, so nothing else crowds the frame or flies past the camera.
const ORDER=[...document.querySelectorAll('.cap[data-key]')].map(c=>c.dataset.key), spots=[], HG=12, X0=14;
function hero(k,x,z,r){ const G=grp(scene,x,0,z); G.rotation.y=r; if(HERO[k]) try{ HERO[k](G); }catch(e){ console.error('hero failed: '+k,e); } return G; }
function lineup(cx){ ORDER.forEach((k,i)=>{ const n=ORDER.length, x=(i-(n-1)/2)*2.05; hero(k,cx+x,i%2?1.3:-2.3,-x*.03); }); }
const XEND=X0+ORDER.length*HG+4;
lineup(0); lineup(XEND);
ORDER.forEach((k,i)=>{ const x=X0+i*HG; hero(k,x,0,0); spots.push({x,z:0}); });
// the line-ups are wider than one island, so the shadow has to cover them
Object.assign(key.shadow.camera,{left:-13,right:13,top:13,bottom:-9}); key.shadow.camera.updateProjectionMatrix(); key.shadow.mapSize.set(4096,4096);
PAGE.keys=(narrow,K,R)=>{ const wide=(cx)=> narrow? R([cx,6.5,30],[cx,1.1,-.4],34,.22) : R([cx,4.2,22],[cx,1.0,-.5],30,.25);
  return [ wide(0), ...spots.map(s=> narrow? R([s.x-.4,2.3,s.z+8.6],[s.x,1.15,s.z],34) : K([s.x-2.0,1.75,s.z+6.4],[s.x+.35,1.1,s.z],30)), wide(XEND) ]; };

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
