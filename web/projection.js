
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

// @models: displays
/* ===== projection page: where things stand and where the camera stops ===== */
const PG=12; // groups sit closer than S so the next set slides in as the last one leaves
// a beam from a projector to a screen, built in the island's own coordinates
function pBeam(island,proj,screen){ island.updateMatrixWorld(true); const from=island.worldToLocal(proj.localToWorld(proj.userData.lens.clone())), d=screen.userData.img,
  c=island.worldToLocal(screen.localToWorld(d.c.clone())); island.add(prjBeam(from,c,d.w,d.h)); }
function pSet(island,x,z,Wi,h,big){ // a screen with its projector on a tripod in front of it
  const s=big?fastFold(Wi,.8,PRJ.calmM||(PRJ.calmM=new THREE.MeshBasicMaterial({map:dspCalmTex(),toneMapped:false,color:0xe9e6e0}))):pullUp(Wi,dspCalmTex()); s.position.set(x,0,z); island.add(s);
  const t=prjTripod(h); t.position.set(x+.35,0,z+(big?2.9:2.05)); t.rotation.y=Math.PI-.1; island.add(t); const p=big?projMid():projSmall(); p.position.y=h+.009; t.add(p); pBeam(island,p,s); return s; }

const pI0=grp(scene,0,0,0), pRange=grp(pI0,0,0,0);
pSet(pI0,-4.2,0,1.6,.95,false);
pSet(pRange,.7,-.7,2.5,1.15,true);
{ const big=fastFold(4.1,1.0,PRJ.calmM); big.position.set(6.6,0,-1.7); pRange.add(big); const c=prjCase(.84,.46,1.0); c.position.set(6.6,0,2.9); c.rotation.y=Math.PI; pRange.add(c);
  const L=laserProj(); L.g.position.y=.56; c.add(L.g); pBeam(pRange,L.g,big); }

const pI1=grp(scene,PG,0,0), pCase=prjCase(.84,.46,1.0); pCase.rotation.y=-.12; pI1.add(pCase); const pLas=laserProj(); pLas.g.position.y=.56; pCase.add(pLas.g); const pL0=pLas.lens.position.z;

const pI2=grp(scene,2*PG,0,0), pSrc=V(0,3.0,4.6), pTgt=V(0,1.45,-.3), pMap=mapPanels(pSrc,pTgt,prjMapTex(dspCalmTex())); pI2.add(pMap.g);
{ // the truss the projectors hang from: two towers and a beam across, out in front of the panels
  const ZT=3.2, YT=3.5; for(const x of [-3.2,3.2]){ const u=dspTruss(YT); u.position.set(x,.03,ZT); pI2.add(u); pI2.add(at(rbox(.6,.012,.6,M.satin,.004),x,.006,ZT)); }
  const b=dspTruss(6.64); b.rotation.z=-Q; b.position.set(-3.32,YT+.15,ZT); pI2.add(b);
  for(const [x,pi] of [[-1.7,1],[0,0],[1.7,2]]){ const h=hungProj(0,0), pan=pMap.panels[pi]; h.position.set(x,YT+.03,ZT); pI2.add(h); pI2.updateMatrixWorld(true);
    const to=pan.getWorldPosition(V(0,0,0)), from=h.getWorldPosition(V(0,0,0)); h.children[0].rotation.set(Math.atan2(from.y-.25-to.y,Math.hypot(to.x-from.x,to.z-from.z)),Math.atan2(to.x-from.x,to.z-from.z),0); pBeam(pI2,h.userData.proj,pan); } }
const pI3=grp(scene,3*PG,0,0), oTgt=V(0,1.1,0), pObj=mapForms(); pI3.add(pObj);
for(const [x,z] of [[1.75,2.3],[2.5,1.15]]){ const t=prjTripod(1.3); t.position.set(x,0,z); prjLook(t,t.position,oTgt); pI3.add(t); const p=projMid(); p.position.y=1.309; t.add(p); }

const pI4=grp(scene,4*PG,0,0), pHome=homeTheater(dspCalmTex()); pHome.g.rotation.y=-.18; pI4.add(pHome.g);

const pI5=grp(scene,5*PG,0,0); pSet(pI5,-.3,0,1.8,1.0,false);

updaters.push((t,x)=>{ const gone=sstep(1.3,1.62,x); pRange.scale.setScalar(Math.max(.001,1-gone)); pRange.visible=gone<.999;
  const e=sstep(1.6,1.95,x)*(1-sstep(2.35,2.75,x)); pLas.lens.position.z=pL0+e*.34;
  PRJ.mapT.userData.u=Math.round(sstep(2.55,2.98,x)*200)/200;
  pObj.userData.mat.uniforms.u.value=sstep(3.45,4.0,x); pObj.userData.mat.uniforms.t.value=t;
  pHome.rise(sstep(4.5,4.95,x)); });

PAGE.keys=(narrow,K,R)=>[
  K([-.35,1.6,5.2],[-3.85,.85,.85],30),                                                       // hero: one compact projector and a pull-up screen
  narrow? R([-10.8,4.4,21],[-1.2,1.2,-.4],32) : K([2.2,3.4,28],[2.5,1.2,-.3],30,-.2),     // the range
  K([PG-2.0,1.75,5.4],[PG+.1,.62,0],30),                                                      // 01 the laser projector, its lens sliding out
  narrow? R([2*PG-.8,3.3,21.5],[2*PG,1.9,0],32) : K([2*PG-1.2,3.0,16.8],[2*PG-.1,1.85,0],30),                                               // 02 one picture mapped across panels of different sizes
  narrow? R([3*PG+.9,2.8,12.8],[3*PG+.5,1.5,.3],34) : K([3*PG-1.2,2.3,11.2],[3*PG+.75,1.3,.3],30),                                                 // 03 mapping on an object: edges traced, then faces filled
  K([4*PG-1.9,1.7,7.0],[4*PG+.25,.9,-.25],30),                                                // 04 home theater, the screen rising
  K([5*PG+4.3,2.6,8.2],[5*PG-.55,1.0,.6],30,0,.25) ];

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
