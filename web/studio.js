
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';

const canvas=document.getElementById('stage');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const BG=0xECE9E3, AMBER=0xE8892D, ACCENT=new THREE.Color(AMBER), COOL=0x7fd4e6;

// perf: render at most 1.5x (drops further if the device struggles), MSAA only on 1x screens, shadows refreshed every few frames instead of every frame
const DPR=devicePixelRatio||1, PR=[Math.min(DPR,2),Math.min(DPR,1.6),Math.min(DPR,1.3)], SHADOW_EVERY=[2,4,8], TEX_EVERY=[2,3,4]; let tier=0, gov={ok:0,bad:0,ups:0,from:0};
const renderer=new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(PR[0]);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate=false; renderer.shadowMap.needsUpdate=true;

const scene=new THREE.Scene();
scene.background=new THREE.Color(BG);
scene.fog=new THREE.Fog(BG,90,220);
scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer),.04).texture;
const camera=new THREE.PerspectiveCamera(36,1,.1,300);

const hemi=new THREE.HemisphereLight(0xffffff,0xd8d0c2,.7); scene.add(hemi);
const key=new THREE.DirectionalLight(0xfff6ea,1.9);
key.position.set(13,30,17); key.castShadow=true; key.shadow.mapSize.set(innerWidth<800?1024:2048,innerWidth<800?1024:2048);
Object.assign(key.shadow.camera,{left:-27,right:27,top:27,bottom:-27,near:1,far:90});
key.shadow.radius=4; key.shadow.bias=-.0006; key.shadow.normalBias=.04; scene.add(key);
const fill=new THREE.DirectionalLight(0xeaf2ff,.8); fill.position.set(-18,12,-6); scene.add(fill);

/* ---------- materials & helpers ---------- */
const std=(color,rough=.6,metal=0,extra={})=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,envMapIntensity:.55,...extra});
const M={
  blk:std(0x1c1c1f,.5,.25), gloss:std(0x0c0c0e,.14,.5,{envMapIntensity:1}), shell:std(0x232326,.72,.08), rubber:std(0x111112,.95),
  steel:std(0x97958f,.3,.9), alu:std(0xd2cfc8,.26,.95,{envMapIntensity:.9}), white:std(0xf4f2ed,.42), bone:std(0xdcd7cd,.7),
  wood:std(0xc8a47b,.55), woodD:std(0x8d6a48,.6), fabric:std(0x4b4742,1), linen:std(0xbdb5a6,1), deck:std(0x19191b,.55,.1),
  lens:std(0x0a1020,.04,.9,{envMapIntensity:1.6}), glass:std(0xe4ecef,.04,.1,{transparent:true,opacity:.2,envMapIntensity:1.2}),
  green:std(0x4f7a52,.8), pot:std(0xb7a48e,.85), conc:std(0xcbc6bb,.85),
};
const leds=[]; function ledMat(color=AMBER,base=.6){ const m=new THREE.MeshStandardMaterial({color:0x151515,emissive:color,emissiveIntensity:base}); m.userData.base=base; leds.push(m); return m; }
const glow=(color)=>new THREE.MeshBasicMaterial({color,toneMapped:false});
const mesh=(geo,m,cast=true)=>{ const o=new THREE.Mesh(geo,m); o.castShadow=cast; o.receiveShadow=true; return o; };
const box=(w,h,d,m)=>mesh(new THREE.BoxGeometry(w,h,d),m);
const rbox=(w,h,d,m,r=.03)=>mesh(new RoundedBoxGeometry(w,h,d,3,Math.max(.002,Math.min(r,w/2-.001,h/2-.001,d/2-.001))),m);
const cyl=(r1,r2,h,m,seg=28)=>mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m);
const sph=(r,m,a=24,b=16)=>mesh(new THREE.SphereGeometry(r,a,b),m);
const plane=(w,h,m)=>new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);
const at=(o,x,y,z)=>{ o.position.set(x,y,z); return o; };
const rot=(o,x=0,y=0,z=0)=>{ o.rotation.set(x,y,z); return o; };
const grp=(parent,x=0,y=0,z=0,ry=0)=>{ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g); return g; };
const V=(x,y,z)=>new THREE.Vector3(x,y,z), UP=V(0,1,0);
function rodGeo(a,b,r,seg=6){ const v=new THREE.Vector3().subVectors(b,a), g=new THREE.CylinderGeometry(r,r,v.length(),seg,1);
  g.applyMatrix4(new THREE.Matrix4().compose(a.clone().addScaledVector(v,.5),new THREE.Quaternion().setFromUnitVectors(UP,v.clone().normalize()),V(1,1,1))); return g; }
const rod=(a,b,r,m)=>mesh(rodGeo(a,b,r,10),m);
function truss(len,axis='y',s=.29){ const geos=[], n=Math.max(2,Math.round(len/(s*1.7))), h=s/2;
  const P=(t,u,v)=> axis==='y'? V(u,t,v) : V(t,u,v);
  const C=[[-h,-h],[h,-h],[h,h],[-h,h]];
  for(const [u,v] of C) geos.push(rodGeo(P(0,u,v),P(len,u,v),.025,8));
  for(let i=0;i<=n;i++){ const t=i*len/n; for(let k=0;k<4;k++){ const [u,v]=C[k],[u2,v2]=C[(k+1)%4]; if(i%2===0||i===n) geos.push(rodGeo(P(t,u,v),P(t,u2,v2),.012));
      if(i<n){ const t1=(i+1)*len/n; geos.push(i%2? rodGeo(P(t,u,v),P(t1,u2,v2),.012) : rodGeo(P(t,u2,v2),P(t1,u,v),.012)); } } }
  return mesh(mergeGeometries(geos),M.alu); }
function tripod(h,spread=.5,m=M.blk){ const g=new THREE.Group(), hub=Math.min(h*.45,.95);
  for(let i=0;i<3;i++){ const a=i*2.0944+.5, foot=V(Math.sin(a)*spread,.03,Math.cos(a)*spread), top=V(Math.sin(a)*.035,hub,Math.cos(a)*.035), mid=top.clone().lerp(foot,.5);
    g.add(rod(top,mid,.02,m)); g.add(rod(mid,foot,.016,M.steel)); const col=rod(mid.clone().lerp(top,.06),mid.clone().lerp(foot,.06),.025,m); g.add(col);
    g.add(rod(V(0,hub*.4,0),foot.clone().multiplyScalar(.52).setY(hub*.47),.009,m)); const ft=sph(.034,M.rubber,12,8); ft.scale.y=.7; g.add(at(ft,foot.x,.024,foot.z)); }
  g.add(at(cyl(.05,.058,.09,m,18),0,hub,0)); g.add(at(cyl(.03,.03,.05,m,14),0,hub*.4,0)); g.add(at(cyl(.027,.027,hub*.72,m,14),0,hub*.72,0)); g.add(at(cyl(.036,.036,.06,m,14),0,hub*1.08+.02,0));
  const kn=rot(cyl(.012,.012,.07,M.rubber,8),0,0,Math.PI/2); g.add(at(kn,.05,hub*1.08+.02,0)); g.add(at(cyl(.018,.018,h-hub,M.steel,12),0,(h+hub)/2,0)); g.add(at(cyl(.024,.024,.05,m,12),0,h-.025,0)); return g; }
function caster(){ const g=new THREE.Group(); g.add(rot(at(cyl(.045,.045,.035,M.rubber,14),0,.045,0),0,0,Math.PI/2)); g.add(at(box(.04,.05,.05,M.steel),0,.085,0)); return g; }
function chairFB(m=M.blk){ const g=new THREE.Group(); for(let i=0;i<5;i++){ const a=i*1.2566; g.add(rod(V(0,.1,0),V(Math.sin(a)*.3,.06,Math.cos(a)*.3),.018,m)); g.add(at(caster(),Math.sin(a)*.3,0,Math.cos(a)*.3)); }
  g.add(at(cyl(.025,.025,.36,M.steel,10),0,.28,0)); g.add(at(rbox(.48,.08,.46,m,.035),0,.5,0)); g.add(rot(at(rbox(.44,.5,.06,m,.03),0,.84,-.23),-.12)); g.add(rod(V(0,.48,-.2),V(0,.62,-.25),.02,m)); return g; }
function chair(){ const g=new THREE.Group(); drop('SheenChair',g,{s:1.15,tint:0x3c3b3a,fallback:()=>chairFB()}); return g; }
const blobTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'), gr=g.createRadialGradient(64,64,4,64,64,64); gr.addColorStop(0,'rgba(40,36,30,.55)'); gr.addColorStop(.6,'rgba(40,36,30,.18)'); gr.addColorStop(1,'rgba(40,36,30,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); })();
function blob(parent,x,z,w,d,o=.4){ const m=plane(w,d,new THREE.MeshBasicMaterial({map:blobTex,transparent:true,opacity:o,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})); m.rotation.x=-Math.PI/2; m.position.set(x,.022,z); m.renderOrder=2; parent.add(m); }
function ctex(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return {c,g:c.getContext('2d'),t}; }
const animTex=[];
function screen(w,h,draw,res=256){ const ct=ctex(Math.round(res*w/h),res); ct.draw=draw; animTex.push(ct); return plane(w,h,new THREE.MeshBasicMaterial({map:ct.t,toneMapped:false})); }
function still(w,h,draw,res=256,mat){ const ct=ctex(Math.round(res*w/h),res); const d=()=>{ draw(ct.g,ct.c.width,ct.c.height); ct.t.needsUpdate=true; }; d(); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(d); return ct.t; }
function paint(text,w,h,{font='600 150px Geist, sans-serif',color='rgba(26,26,24,.9)',res=1024,align='center'}={}){
  const t=still(w,h,(g,W,H)=>{ g.clearRect(0,0,W,H); g.fillStyle=color; g.font=font; g.textAlign=align; g.textBaseline='middle'; g.fillText(text,align==='center'?W/2:8,H/2); },Math.round(res*h/w));
  return plane(w,h,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})); }
function monitor(w,h,draw,{stand=true,res=200}={}){ const g=new THREE.Group(); g.add(rbox(w+.03,h+.03,.028,M.gloss,.01)); g.add(at(screen(w,h,draw,res),0,0,.0155));
  if(stand){ g.add(at(rbox(.05,h*.6,.03,M.blk,.01),0,-h*.62,-.03)); g.add(at(rbox(w*.38,.014,.2,M.blk,.006),0,-h/2-.2,0)); } return g; }
function laptop(draw){ const g=new THREE.Group(); g.add(at(rbox(.34,.016,.24,M.alu,.006),0,.008,0)); const lid=new THREE.Group(); lid.position.set(0,.016,-.12); lid.rotation.x=-.28; g.add(lid);
  lid.add(at(rbox(.34,.23,.01,M.alu,.004),0,.115,0)); lid.add(at(screen(.31,.2,draw,128),0,.115,.006)); return g; }
function beamMat(color=0xfff1dc,op=.3){ return new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{c:{value:new THREE.Color(color)},op:{value:op}},
  vertexShader:`varying vec2 vU; varying vec3 vN; varying vec3 vV; void main(){ vU=uv; vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
  fragmentShader:`uniform vec3 c; uniform float op; varying vec2 vU; varying vec3 vN; varying vec3 vV; void main(){ float e=pow(abs(dot(normalize(vN),normalize(vV))),1.6); float a=op*e*(.12+.88*vU.y*vU.y); gl_FragColor=vec4(c,a); }`}); }
function beam(len,r,mat){ const m=new THREE.Mesh(new THREE.ConeGeometry(r,len,40,1,true),mat); m.renderOrder=3; return m; }
function plantFB(h=1.5){ const g=new THREE.Group(); g.add(at(cyl(.24,.19,.42,M.pot,20),0,.21,0)); g.add(at(cyl(.22,.22,.02,std(0x3a2f26,1),20),0,.41,0)); g.add(rod(V(0,.4,0),V(.03,h*.7,0),.018,M.woodD));
  for(let i=0;i<9;i++){ const a=i*2.4, y=.55+i*(h-.55)/9, l=mesh(new THREE.SphereGeometry(.2,10,8),M.green); l.scale.set(1,.14,.55); l.position.set(Math.sin(a)*.24,y,Math.cos(a)*.24); l.rotation.set(.5*Math.cos(a),a,.5); g.add(l); } return g; }
function plant(h=1.5){ const g=new THREE.Group(); drop('DiffuseTransmissionPlant',g,{s:h*.72/.84,fallback:()=>plantFB(h)}); return g; }
function rcase(w,h,d){ const g=new THREE.Group(); g.add(at(rbox(w,h,d,M.shell,.012),0,h/2+.1,0));
  for(const sx of [-1,1]) for(const sz of [-1,1]){ g.add(at(box(.035,h+.01,.035,M.alu),sx*(w/2-.005),h/2+.1,sz*(d/2-.005))); g.add(at(caster(),sx*(w/2-.12),0,sz*(d/2-.12))); }
  for(const y of [.1,h+.1]){ g.add(at(box(w+.02,.035,.035,M.alu),0,y,d/2-.005)); g.add(at(box(w+.02,.035,.035,M.alu),0,y,-d/2+.005)); g.add(at(box(.035,.035,d+.02,M.alu),w/2-.005,y,0)); g.add(at(box(.035,.035,d+.02,M.alu),-w/2+.005,y,0)); }
  for(const sx of [-.25,.25]) g.add(at(box(.09,.07,.012,M.steel),sx*w,h*.55+.1,d/2+.004)); return g; }
function sofaFB(w,m){ const g=new THREE.Group(); g.add(at(rbox(w,.26,.86,m,.07),0,.3,0)); const n=w>1.9?3:2, cw=(w-.44)/n;
  for(let i=0;i<n;i++){ g.add(at(rbox(cw-.02,.15,.66,m,.06),-w/2+.22+cw*(i+.5),.5,.06)); g.add(rot(at(rbox(cw-.02,.42,.16,m,.07),-w/2+.22+cw*(i+.5),.72,-.3),-.14)); }
  for(const s of [-1,1]) g.add(at(rbox(.2,.5,.86,m,.08),s*(w/2-.1),.45,0)); g.add(at(rbox(w,.5,.14,m,.06),0,.52,-.4));
  for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(cyl(.022,.016,.17,M.woodD,10),sx*(w/2-.12),.085,sz*.34)); return g; }

/* ---------- real models (furniture, plants, people), loaded from the page's own files ---------- */
const gltf=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder), assets={}, mixers=[];
// perf: the sample models' fancy materials (sheen etc.) become plain PBR, and the 57k-triangle plant pot becomes a lathe of its own outline
const STD_KEYS=['name','color','map','normalMap','normalScale','aoMap','aoMapIntensity','roughness','roughnessMap','metalness','metalnessMap','emissive','emissiveMap','emissiveIntensity','alphaMap','transparent','opacity','side','envMapIntensity','vertexColors','alphaTest','depthWrite'];
const stdCache=new Map();
const toStd=(m)=>{ if(!m||!m.isMeshPhysicalMaterial) return m; if(stdCache.has(m)) return stdCache.get(m); const s=new THREE.MeshStandardMaterial(); for(const k of STD_KEYS){ const v=m[k]; if(v===undefined) continue; s[k]=(v&&(v.isColor||v.isVector2))?v.clone():v; } stdCache.set(m,s); return s; };
const lathe=(g)=>{ g.computeBoundingBox(); const b=g.boundingBox, p=g.attributes.position, N=28, rs=new Array(N).fill(0), cx=(b.min.x+b.max.x)/2, cz=(b.min.z+b.max.z)/2, y0=b.min.y, hh=b.max.y-b.min.y;
  for(let i=0;i<p.count;i++){ const k=Math.min(N-1,Math.max(0,Math.floor((p.getY(i)-y0)/hh*N))), r=Math.hypot(p.getX(i)-cx,p.getZ(i)-cz); if(r>rs[k]) rs[k]=r; }
  const pts=[new THREE.Vector2(0,y0)]; for(let k=0;k<N;k++) if(rs[k]>0) pts.push(new THREE.Vector2(rs[k],y0+hh*(k===0?0:k===N-1?1:(k+.5)/N)));
  const top=pts[pts.length-1]; pts.push(new THREE.Vector2(top.x*.9,top.y),new THREE.Vector2(top.x*.86,top.y-hh*.2));
  const lg=new THREE.LatheGeometry(pts,40); lg.translate(cx,0,cz); return lg; };
const prep=(a)=>{ const kill=[]; a.scene.traverse(o=>{ if(o.isLight) kill.push(o);
    if(o.isMesh&&o.material) o.material=Array.isArray(o.material)?o.material.map(toStd):toStd(o.material);
    if(o.isMesh&&!o.isSkinnedMesh&&/^pot$/i.test(o.name)&&(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)>30000){ o.geometry=lathe(o.geometry); const m=o.material; if(m&&!Array.isArray(m)){ m.normalMap=null; m.aoMap=null; if(m.emissiveMap){ m.emissiveMap=null; m.emissive&&m.emissive.set(0); } m.needsUpdate=true; } }
    if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; const m=o.material; if(m){ m.envMapIntensity=.6; for(const k in m){ const t=m[k]; if(t&&t.isTexture&&t.channel>0&&!o.geometry.attributes['uv'+t.channel]) m[k]=null; } } } }); kill.forEach(o=>o.parent.remove(o)); return a; };
const want=(name)=>assets[name]||(assets[name]=import('./models/'+name+'.js').then(m=>{ const b=atob(m.default), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return new Promise(res=>gltf.parse(u.buffer,'',a=>res(prep(a)),()=>res(null))); }).catch(()=>null));
function drop(name,parent,{x=0,y=0,z=0,ry=0,s=1,tint,fallback}={},cb){ const g=grp(parent,x,y,z,ry); let fb=null; if(fallback){ fb=fallback(); g.add(fb); }
  want(name).then(a=>{ if(!a) return; if(fb) g.remove(fb); const o=skClone(a.scene); o.scale.setScalar(s); if(tint) o.traverse(n=>{ if(n.isMesh&&/fabric/i.test(n.material.name||'')){ n.material=n.material.clone(); n.material.map=null; n.material.color.set(tint); if(n.material.sheenColor) n.material.sheenColor.set(tint).multiplyScalar(1.4); } }); g.add(o); cb&&cb(o,a); }); return g; }

// people: the rigged figure is dressed per vertex from its rest pose (cap, shirt, trousers, gloves, boots), with a printed logo that rides on the spine
const logoT=still(3.6,1,(c,W,H)=>{ c.clearRect(0,0,W,H); c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle'; c.font=`700 ${H*.62}px Geist, sans-serif`; c.fillText('Possible AV',W/2,H*.54); },128);
function dress(o,g,c){ g.updateMatrixWorld(true); const P=new THREE.Vector3(), C=new THREE.Color(), ms=[]; let hgt=0; o.traverse(n=>{ if(n.isSkinnedMesh) ms.push(n); });
  const at0=(m,i)=>{ m.getVertexPosition(i,P); m.localToWorld(P); return g.worldToLocal(P); };
  for(const m of ms){ const n=m.geometry.attributes.position.count; for(let i=0;i<n;i+=5) hgt=Math.max(hgt,at0(m,i).y); }
  const mat=std(0xffffff,.82,0,{vertexColors:true}), gInv=new THREE.Matrix4().copy(g.matrixWorld).invert();
  for(const m of ms){ m.geometry=m.geometry.clone(); const src=m.geometry.attributes.position, n=src.count, col=new Float32Array(n*3), pos=new Float32Array(n*3);
    // rest pose is one affine map from stored positions, so the body can be reshaped there and mapped back
    const f=(x,y,z)=>m.applyBoneTransform(0,new THREE.Vector3(x,y,z)), o0=f(0,0,0), A=new THREE.Matrix4().makeBasis(f(1,0,0).sub(o0),f(0,1,0).sub(o0),f(0,0,1).sub(o0)).setPosition(o0), back=new THREE.Matrix4().copy(gInv).multiply(m.matrixWorld).multiply(A).invert();
    for(let i=0;i<n;i++){ const p=at0(m,i), y=p.y/hgt, ax=Math.abs(p.x)/hgt; let k;
      if(y<.05) k=c.shoes; else if(y<.535) k=c.pants; else if(ax<.125) k=y<.85?c.shirt:(y>.93?(c.cap||c.hair||c.skin):(c.hair&&y>.875&&p.z<-.01*hgt?c.hair:c.skin)); else if(ax<.24) k=c.shirt; else if(c.gloves&&ax>.43) k=c.gloves; else k=c.skin;
      C.set(k); col[i*3]=C.r; col[i*3+1]=C.g; col[i*3+2]=C.b;
      if(ax<.17){ const w=y>.5&&y<.78?Math.pow(Math.sin((y-.5)/.28*Math.PI),1.2):0, hp=y>.4&&y<.58?Math.sin((y-.4)/.18*Math.PI):0; p.x*=1+.36*w-.1*hp; p.z=p.z*(1+.46*w-.08*hp)+(p.z>0?.014*hgt*w:0); }
      p.applyMatrix4(back); pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z; }
    m.geometry.setAttribute('position',new THREE.BufferAttribute(pos,3)); m.geometry.setAttribute('color',new THREE.BufferAttribute(col,3)); m.geometry.deleteAttribute('normal'); m.geometry.computeVertexNormals(); m.material=mat; m.frustumCulled=false; m.computeBoundingSphere(); } return hgt; }
let crewN=0; const crewAll=[];
const posers=[], pA=new THREE.Vector3(), pB=new THREE.Vector3(), q1=new THREE.Quaternion(), q2=new THREE.Quaternion(), q3=new THREE.Quaternion();
// crew are a real clothed human model; the Mixamo clips are retargeted onto it by bone name
let clipsP=null; const clips=()=>clipsP||(clipsP=Promise.all([want('Xbot'),want('Rpm')]).then(([a,r])=>{ const m={}; if(!a||!r) return m;
  // both rigs rest in the same T-pose, so each bone's track is re-based through the two rest orientations
  const bonesOf=(sc)=>{ const o={}; sc.updateMatrixWorld(true); sc.traverse(n=>{ if(n.isBone) o[n.name.replace(/^mixamorig:?/,'')]=n; }); return o; }, X=bonesOf(a.scene), R=bonesOf(r.scene), Q=()=>new THREE.Quaternion(), q=Q();
  // the human rig rests with its arms down (A-pose) and the clips were made on a T-pose rig, so line the human rig up with the source rest first, record that, then put it back
  const keepQ=new Map(), RT={}, main=(b)=>{ const cs=b.children.filter(c=>c.isBone&&X[c.name]); return cs.find(c=>/Middle|^Spine|^Neck$|^Head$/.test(c.name))||(cs.length===1?cs[0]:null); };
  r.scene.traverse(n=>{ if(n.isBone) keepQ.set(n,n.quaternion.clone()); });
  r.scene.traverse(n=>{ if(!n.isBone||n.name==='Hips'||!X[n.name]) return; const ch=main(n); if(!ch) return; const d=X[ch.name].getWorldPosition(new THREE.Vector3()).sub(X[n.name].getWorldPosition(new THREE.Vector3())).normalize(), c0=ch.getWorldPosition(new THREE.Vector3()).sub(n.getWorldPosition(new THREE.Vector3())).normalize();
    const w=n.getWorldQuaternion(Q()).premultiply(Q().setFromUnitVectors(c0,d)); n.quaternion.copy(n.parent.getWorldQuaternion(Q()).invert().multiply(w)); n.updateMatrixWorld(true); });
  for(const k in R) RT[k]=R[k].getWorldQuaternion(Q()); const wq=(b)=>RT[b.name]?RT[b.name].clone():b.getWorldQuaternion(Q());
  for(const c of a.animations){ const tr=[]; for(const t of c.tracks){ if(!/\.quaternion$/.test(t.name)) continue; const nm=t.name.replace(/^mixamorig:?/,'').replace(/\.quaternion$/,''), bx=X[nm], br=R[nm]; if(!bx||!br) continue;
      const A=wq(br.parent).invert().multiply(bx.parent.getWorldQuaternion(Q())), Bq=bx.getWorldQuaternion(Q()).invert().multiply(wq(br)), k=t.clone(), v=k.values; k.name=nm+'.quaternion';
      for(let n=0;n<v.length;n+=4){ q.set(v[n],v[n+1],v[n+2],v[n+3]).premultiply(A).multiply(Bq); v[n]=q.x; v[n+1]=q.y; v[n+2]=q.z; v[n+3]=q.w; } tr.push(k); }
    m[c.name]=new THREE.AnimationClip(c.name,c.duration,tr); }
  keepQ.forEach((v,n)=>n.quaternion.copy(v)); r.scene.updateMatrixWorld(true); return m; }));
const LOOKS=[{skin:0xffffff,hair:0x2a2019},{skin:0xc9a183,hair:0x15110d},{skin:0xf2dccb,hair:0x5d4a36},{skin:0x9a7355,hair:0x15110d}];
const UNIFORM=()=>({top:0x141416,inner:0x2c2e33,bottom:0x35383f,shoes:0x101012,cap:0x141416,gloves:0x1d1d20,...LOOKS[crewN++%4]});
const smooth=(a,b,x)=>{ const t=Math.min(Math.max((x-a)/(b-a),0),1); return t*t*(3-2*t); };
function crew(parent,{x=0,z=0,ry=0,clip='idle',arms=null,outfit=null,logo=true}={},cb){ const g=grp(parent,x,0,z,ry); crewAll.push(g);
  Promise.all([want('Rpm'),clips()]).then(([a,CL])=>{ if(!a) return; const o=skClone(a.scene); g.add(o); const B={}, c=outfit||UNIFORM(); o.traverse(n=>{ if(n.isBone) B[n.name.replace(/^mixamorig:?/,'')]=n; });
    g.updateMatrixWorld(true); g.getWorldQuaternion(q1);
    // every vertex where it sits at rest, in the person's own frame (x across, y up, z forward)
    const restOf=(n)=>{ const N=n.geometry.attributes.position.count, out=new Array(N), P=new THREE.Vector3(); for(let i=0;i<N;i++){ n.getVertexPosition(i,P); n.localToWorld(P); out[i]=g.worldToLocal(P).clone(); } return out; };
    const cloth=(n,col)=>{ n.material=n.material.clone(); n.material.map=null; n.material.color.set(col); n.material.metalness=0; n.material.roughness=.85; n.material.metalnessMap=n.material.roughnessMap=null; };
    // the sample model wears a tailcoat, waistcoat and bow tie: keep the coat as a plain work jacket cut at the hip, turn shirt and waistcoat into one plain top, drop the bow tie, flower and buttons
    const tailor=(n)=>{ const src=n.geometry, ix=src.index, W=restOf(n), N=W.length, par=new Int32Array(N).map((_,i)=>i), find=(i)=>{ while(par[i]!==i){ par[i]=par[par[i]]; i=par[i]; } return i; }, uni=(p,q)=>{ p=find(p); q=find(q); if(p!==q) par[p]=q; }, seen=new Map();
      for(let i=0;i<N;i++){ const p=W[i], k=Math.round(p.x*2000)+','+Math.round(p.y*2000)+','+Math.round(p.z*2000); if(seen.has(k)) uni(i,seen.get(k)); else seen.set(k,i); }
      for(let i=0;i<ix.count;i+=3){ uni(ix.getX(i),ix.getX(i+1)); uni(ix.getX(i),ix.getX(i+2)); }
      const C=new Map(); for(let i=0;i<N;i++){ const r=find(i); let k=C.get(r); if(!k){ k={n:0,x0:9,x1:-9,y0:9,y1:-9}; C.set(r,k); } k.n++; k.x0=Math.min(k.x0,W[i].x); k.x1=Math.max(k.x1,W[i].x); k.y0=Math.min(k.y0,W[i].y); k.y1=Math.max(k.y1,W[i].y); }
      for(const k of C.values()){ const cx=(k.x0+k.x1)/2; k.k=k.n>600?'coat':(Math.abs(cx)>.3&&k.n>60)?'cuff':(k.y1-k.y0>.25&&Math.abs(cx)<.03)?'inner':'drop'; }
      const HEM=.93, geo=src.clone(), P=geo.attributes.position, col=new Float32Array(N*3), cj=new THREE.Color(c.top), ci=new THREE.Color(c.inner??c.top), keep=[], kind=(i)=>C.get(find(i)).k; n.geometry=geo;
      for(let i=0;i<N;i++){ const cc=kind(i)==='inner'?ci:cj; col[i*3]=cc.r; col[i*3+1]=cc.g; col[i*3+2]=cc.b; }
      for(let i=0;i<ix.count;i+=3){ const a0=ix.getX(i), b0=ix.getX(i+1), c0=ix.getX(i+2), k=kind(a0); if(k==='drop') continue; if(k==='coat'&&Math.max(W[a0].y,W[b0].y,W[c0].y)<=HEM) continue; keep.push(a0,b0,c0); }
      // whatever still hangs below the hem is pulled up onto it, so the jacket ends in a clean edge
      const upL=V(0,1,0).applyQuaternion(q1).transformDirection(new THREE.Matrix4().copy(n.matrixWorld).invert()), b=new THREE.Vector3(), e=new THREE.Vector3(), J=new THREE.Matrix3(), used=new Set(keep);
      for(const i of used){ if(kind(i)!=='coat'||W[i].y>=HEM) continue; const p0=[P.getX(i),P.getY(i),P.getZ(i)], cols=[]; n.getVertexPosition(i,b);
        for(let k=0;k<3;k++){ const p=[...p0]; p[k]+=.02; P.setXYZ(i,p[0],p[1],p[2]); cols.push(n.getVertexPosition(i,e).clone().sub(b).multiplyScalar(50)); }
        J.set(cols[0].x,cols[1].x,cols[2].x,cols[0].y,cols[1].y,cols[2].y,cols[0].z,cols[1].z,cols[2].z).invert(); const d=upL.clone().multiplyScalar(HEM-W[i].y).applyMatrix3(J); P.setXYZ(i,p0[0]+d.x,p0[1]+d.y,p0[2]+d.z); }
      geo.setIndex(keep); geo.setAttribute('color',new THREE.BufferAttribute(col,3)); cloth(n,0xffffff); n.material.vertexColors=true; n.material.side=THREE.DoubleSide; };
    // close-cropped hair painted onto the scalp: the sample head is bare under its costume hat
    const scalp=(n)=>{ const W=restOf(n), N=W.length, col=new Float32Array(N*3), h=new THREE.Color(c.hair??0x2a2019), K=[[-.035,.2],[-.01,.11],[.02,.08],[.06,.05],[.09,.035]]; let yT=-9; for(const p of W) yT=Math.max(yT,p.y);
      for(let i=0;i<N;i++){ const p=W[i], dy=yT-p.y; let line=K[0][1]; for(let k=0;k<K.length-1;k++) if(p.z>=K[k][0]) line=lerp(K[k][1],K[k+1][1],Math.min((p.z-K[k][0])/(K[k+1][0]-K[k][0]),1));
        let w=1-smooth(line-.006,line+.006,dy); if(Math.abs(p.x)>.078&&dy>.09) w=0; col[i*3]=lerp(1,h.r,w); col[i*3+1]=lerp(1,h.g,w); col[i*3+2]=lerp(1,h.b,w); }
      n.geometry=n.geometry.clone(); n.geometry.setAttribute('color',new THREE.BufferAttribute(col,3)); n.material.vertexColors=true; return {W,yT}; };
    let head=null;
    o.traverse(n=>{ if(!n.isSkinnedMesh) return; n.frustumCulled=true; n.computeBoundingSphere(); if(n.boundingSphere) n.boundingSphere.radius*=1.6; n.castShadow=true; const nm=n.material.name||'';
      if(/Outfit_Top/.test(nm)) tailor(n); else if(/Outfit_Bottom/.test(nm)) cloth(n,c.bottom); else if(/Footwear/.test(nm)) cloth(n,c.shoes); else if(/Headwear|Beard/.test(nm)) n.visible=false;
      else if(/Body/.test(nm)) cloth(n,c.gloves??new THREE.Color(0xc59a84).multiply(new THREE.Color(c.skin))); // the sample's hands are white dress gloves: crew get work gloves, anyone else bare hands
      else if(/Skin/.test(nm)){ n.material=n.material.clone(); n.material.color.set(c.skin); head=scalp(n); } });
    g.updateMatrixWorld(true);
    const pins=[], pin=(obj,bone,at,turn=0)=>{ g.add(obj); const wp=g.localToWorld(at.clone()); pins.push({pl:obj,sp:bone,offL:bone.worldToLocal(wp),corr:bone.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q1.clone().multiply(new THREE.Quaternion().setFromAxisAngle(UP,turn)))}); };
    // logos follow the curve of the back and the chest: the body is sampled column by column and the patch is bent to match
    if(logo){ const sp=B.Spine2||B.Spine1||B.Spine, ms=[]; o.traverse(n=>{ if(n.isSkinnedMesh&&n.visible){ n.computeBoundingSphere(); ms.push(n); } }); const rc=new THREE.Raycaster(), base=g.worldToLocal(sp.getWorldPosition(new THREE.Vector3()));
      const depth=(lx,ly,dz)=>{ const from=g.localToWorld(V(lx,ly,dz*1)), dir=V(0,0,-dz).applyQuaternion(q1); rc.set(from,dir); rc.far=1.2; const hit=rc.intersectObjects(ms,false)[0]; return hit?g.worldToLocal(hit.point).z:null; };
      for(const [w,ox,oy,dz,turn,seg] of [[.25,0,.06,-1,Math.PI,8],[.075,.128,.07,1,0,4]]){ const z0=depth(base.x+ox,base.y+oy,dz); if(z0===null) continue; const geo=new THREE.PlaneGeometry(w,w/3.6,seg,1), P=geo.attributes.position, zs=[]; let last=z0;
        for(let k=0;k<=seg;k++){ const u=(k/seg-.5)*w, zk=depth(base.x+ox+u*(turn?-1:1),base.y+oy,dz); if(zk!==null&&Math.abs(zk-z0)<.06) last=zk; zs.push(last); }
        for(let i=0;i<P.count;i++){ const k=Math.round((P.getX(i)/w+.5)*seg); P.setZ(i,(zs[k]-z0)*dz+.004); }
        pin(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:logoT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4})),sp,V(base.x+ox,base.y+oy,z0),turn); } }
    // crew cap, sized to the head it sits on and carried by the head bone
    if(head&&B.Head&&c.cap){ const rim=head.yT-.068, band=head.W.filter(p=>Math.abs(p.y-rim)<.012); let hx=0, zf=-9, zb=9; for(const p of band){ hx=Math.max(hx,Math.abs(p.x)); if(Math.abs(p.x)<.03){ zf=Math.max(zf,p.z); zb=Math.min(zb,p.z); } }
      if(band.length&&zf>zb){ const cap=new THREE.Group(), cm=std(c.cap,.9), rx=hx+.008, rz=(zf-zb)/2+.008, hh=head.yT-rim+.011;
        const crown=mesh(new THREE.SphereGeometry(1,32,14,0,Math.PI*2,0,Math.PI/2),cm); crown.scale.set(rx,hh,rz); cap.add(crown); const bandM=mesh(new THREE.CylinderGeometry(1,1,.016,32,1,true),cm); bandM.material=cm.clone(); bandM.material.side=THREE.DoubleSide; bandM.scale.set(rx,1,rz); bandM.position.y=-.007; cap.add(bandM);
        const bill=mesh(new THREE.CylinderGeometry(1,1,.007,24,1,false,-Math.PI/2,Math.PI),cm); bill.scale.set(rx*.94,1,.072); bill.position.set(0,-.006,rz-.014); bill.rotation.x=.16; cap.add(bill); cap.add(at(sph(.007,cm,8,6),0,hh,0));
        pin(cap,B.Head,V(0,rim,(zf+zb)/2)); } }
    const mx=new THREE.AnimationMixer(o), cl=CL[clip]; if(cl) mx.clipAction(cl).play(); mixers.push(mx);
    const aim=(b,ch,d)=>{ b.getWorldPosition(pA); ch.getWorldPosition(pB); pB.sub(pA).normalize(); q2.setFromUnitVectors(pB,d); b.getWorldQuaternion(q3).premultiply(q2); b.parent.getWorldQuaternion(q2).invert(); b.quaternion.copy(q2.multiply(q3)); b.updateMatrixWorld(true); };
    posers.push(()=>{ g.updateMatrixWorld(true); g.getWorldQuaternion(q1);
      if(arms) for(const sd of ['Left','Right']){ const arm=B[sd+'Arm'], fa=B[sd+'ForeArm'], hd=B[sd+'Hand']; if(!arm||!fa||!hd) continue; const d0=arms(sd==='Left'?1:-1); if(!d0) continue; const d=d0.applyQuaternion(q1).normalize(); aim(arm,fa,d); aim(fa,hd,d); }
      for(const p of pins){ p.pl.position.copy(g.worldToLocal(p.sp.localToWorld(pA.copy(p.offL)))); p.sp.getWorldQuaternion(q3).multiply(p.corr); p.pl.quaternion.copy(q2.copy(q1).invert().multiply(q3)); } });
    cb&&cb(o,g); }); return g; }
function sofa(w,m,tint){ const g=new THREE.Group(); drop('GlamVelvetSofa',g,{s:w/2.18,z:.1,tint,fallback:()=>sofaFB(w,m)}); return g; }
function seat(tint=0x7d7a72,s=1.12){ const g=new THREE.Group(); drop('SheenChair',g,{s,tint}); return g; }

/* ---------- the studio ---------- */
const RM={x0:-19,x1:19,z0:-15,z1:17,h:8}, RW=RM.x1-RM.x0, RD=RM.z1-RM.z0, RCX=0, RCZ=(RM.z0+RM.z1)/2;
const wallM=std(0xF3F0EA,.95,0,{emissive:0xF3F0EA,emissiveIntensity:.1,envMapIntensity:.2});
// polished concrete floor
const floorT=still(8,8,(g,W,H)=>{ g.fillStyle='#d3cec4'; g.fillRect(0,0,W,H);
  for(let i=0;i<40;i++){ const x=Math.random()*W,y=Math.random()*H,r=60+Math.random()*220, gr=g.createRadialGradient(x,y,0,x,y,r); const d=Math.random()<.5; gr.addColorStop(0,d?'rgba(120,112,100,.07)':'rgba(255,252,246,.09)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(x-r,y-r,2*r,2*r); }
  for(let i=0;i<14000;i++){ g.fillStyle=Math.random()<.5?'rgba(60,55,48,.06)':'rgba(255,255,255,.07)'; g.fillRect(Math.random()*W,Math.random()*H,1.5,1.5); }
  g.strokeStyle='rgba(70,64,56,.16)'; g.lineWidth=2; g.strokeRect(1,1,W-2,H-2); },1024);
floorT.wrapS=floorT.wrapT=THREE.RepeatWrapping; floorT.repeat.set(RW/6.4,RD/6.4);
const floorM=std(0xffffff,.38,.04,{map:floorT,envMapIntensity:.5});
const slab=box(RW+.8,.4,RD+.8,[M.conc,M.conc,floorM,M.conc,M.conc,M.conc]); slab.castShadow=false; slab.position.set(RCX,-.2,RCZ); scene.add(slab);
// painted-brick left wall, plain back wall; front + right are inward planes so the overview can look in
const brickT=still(4,4,(g,W,H)=>{ g.fillStyle='#cbbdab'; g.fillRect(0,0,W,H); const rows=24, bh=H/rows, bw=W/8; let sd=3; const rnd=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  for(let r=0;r<rows;r++) for(let c=-1;c<8;c++){ const x=c*bw+(r%2)*bw/2, y=r*bh, k=rnd(), dark=rnd()<.09, pale=rnd()<.05; let R=140+k*30|0, G=76+k*20|0, B=62+k*16|0; if(dark){ R-=46; G-=24; B-=16; } if(pale){ R+=30; G+=34; B+=30; }
    g.fillStyle=`rgb(${R},${G},${B})`; g.fillRect(x+1.5,y+1.5,bw-3,bh-3); g.fillStyle='rgba(255,236,216,.09)'; g.fillRect(x+1.5,y+1.5,bw-3,2); g.fillStyle='rgba(40,18,10,.12)'; g.fillRect(x+1.5,y+bh-3.5,bw-3,2); }
  for(let i=0;i<6000;i++){ g.fillStyle=rnd()<.5?'rgba(40,20,12,.09)':'rgba(255,240,225,.06)'; g.fillRect(rnd()*W,rnd()*H,2,2); } },512);
const brickOf=(u,v)=>{ const t=brickT.clone(); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(u,v); t.needsUpdate=true; return std(0xffffff,.9,0,{map:t,envMapIntensity:.25}); };
const brickM=brickOf(RD/1.6,RM.h/1.6), brickB=brickOf(RW/1.6,RM.h/1.6), brickP=brickOf(.45,RM.h/1.6);
const backW=box(RW+.8,RM.h,.4,[wallM,wallM,wallM,wallM,brickB,wallM]); backW.castShadow=false; backW.position.set(RCX,RM.h/2,RM.z0-.2); scene.add(backW);
const leftW=box(.4,RM.h,RD+.4,[brickM,wallM,wallM,wallM,wallM,wallM]); leftW.castShadow=false; leftW.position.set(RM.x0-.2,RM.h/2,RCZ+.2); scene.add(leftW);
const DK={x0:-14.4,x1:-11.4,h:3.4}; for(const [xa,xb,ya,yb] of [[RM.x0,DK.x0,0,RM.h],[DK.x1,RM.x1,0,RM.h],[DK.x0,DK.x1,DK.h,RM.h]]){ const p=plane(xb-xa,yb-ya,brickOf((xb-xa)/1.6,(yb-ya)/1.6)); p.position.set((xa+xb)/2,(ya+yb)/2,RM.z1); p.rotation.y=Math.PI; p.receiveShadow=true; scene.add(p); }
const rightW=plane(RD,RM.h,brickOf(RD/1.6,RM.h/1.6)); rightW.position.set(RM.x1,RM.h/2,RCZ); rightW.rotation.y=-Math.PI/2; rightW.receiveShadow=true; scene.add(rightW);
const baseM=std(0x3b3936,.7);
scene.add(at(box(RW,.14,.03,baseM),RCX,.07,RM.z0+.015)); scene.add(at(box(.03,.14,RD,baseM),RM.x0+.015,.07,RCZ));
{ for(const [xa,xb] of [[RM.x0,-14.4],[-11.4,RM.x1]]){ const b=plane(xb-xa,.14,baseM); b.rotation.y=Math.PI; b.position.set((xa+xb)/2,.07,RM.z1-.01); scene.add(b); } const b2=plane(RD,.14,baseM); b2.rotation.y=-Math.PI/2; b2.position.set(RM.x1-.01,.07,RCZ); scene.add(b2); }
// soft shading where walls meet the floor
{ const sh=still(1,1,(g,W,H)=>{ const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'rgba(60,54,46,.3)'); gr.addColorStop(1,'rgba(60,54,46,0)'); g.fillStyle=gr; g.fillRect(0,0,W,H); },64);
  const mk=(w,x,z,ry)=>{ const p=plane(w,1.6,new THREE.MeshBasicMaterial({map:sh,transparent:true,depthWrite:false})); p.rotation.set(-Math.PI/2,0,ry); p.position.set(x,.012,z); scene.add(p); };
  mk(RW,RCX,RM.z0+.8,0); mk(RW,RCX,RM.z1-.8,Math.PI); mk(RD,RM.x0+.8,RCZ,-Math.PI/2); mk(RD,RM.x1-.8,RCZ,Math.PI/2); }

// ceiling: slab, beams, duct, pipe grid and pendants; all fade out when the camera rises above the room
const ceilMats=[], insideOnly=[]; const cm=(m)=>{ m.transparent=true; ceilMats.push(m); return m; };
{ const cM=cm(std(0xe9e5dd,1,0,{envMapIntensity:.1})); const c=plane(RW,RD,cM); c.rotation.x=Math.PI/2; c.position.set(RCX,RM.h,RCZ); scene.add(c);
  const beamM=cm(std(0xe4e0d7,.9)), ductM=cm(std(0xb8bbbb,.32,.85,{envMapIntensity:.9})), pipeM=cm(std(0xd9d5cd,.5,.3)), canM=cm(std(0x1b1b1d,.5,.3)), litM=cm(new THREE.MeshBasicMaterial({color:0xfff3dd,toneMapped:false}));
  for(const z of [-8.6,-2.2,4.2,10.6]){ const b=new THREE.Mesh(new THREE.BoxGeometry(RW,.55,.4),beamM); b.position.set(RCX,RM.h-.275,z); scene.add(b); }
  for(const x of [-9.5,0,9.5]){ const b=new THREE.Mesh(new THREE.BoxGeometry(.3,.35,RD),beamM); b.position.set(x,RM.h-.175,RCZ); scene.add(b); }
  const duct=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,RD-1.5,24),ductM); duct.rotation.x=Math.PI/2; duct.position.set(13.2,RM.h-.62,RCZ); scene.add(duct);
  for(let z=RM.z0+2.5;z<RM.z1-1;z+=4){ const r=new THREE.Mesh(new THREE.TorusGeometry(.365,.018,6,24),ductM); r.position.set(13.2,RM.h-.62,z); scene.add(r); const v=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,.12,16),ductM); v.position.set(13.2,RM.h-1.04,z+2); scene.add(v); }
  const gy=RM.h-1.15, geos=[];
  for(let x=RM.x0+2.5;x<RM.x1;x+=3.4) geos.push(rodGeo(V(x,gy,RM.z0+.3),V(x,gy,RM.z1-.3),.022,8));
  for(let z=RM.z0+2.4;z<RM.z1;z+=3.4) geos.push(rodGeo(V(RM.x0+.3,gy-.05,z),V(RM.x1-.3,gy-.05,z),.022,8));
  for(let x=RM.x0+2.5;x<RM.x1;x+=6.8) for(let z=RM.z0+2.4;z<RM.z1;z+=6.8) geos.push(rodGeo(V(x,gy,z),V(x,RM.h,z),.012,6));
  scene.add(new THREE.Mesh(mergeGeometries(geos),pipeM));
  for(const x of [-12.4,-5.6,1.2,8,14.8]) for(const z of [-9.2,-2.4,4.4,11.2]){ const c2=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.3,18),canM); c2.position.set(x,gy-.28,z+1.2); scene.add(c2); const l=new THREE.Mesh(new THREE.CircleGeometry(.125,18),litM); l.rotation.x=Math.PI/2; l.position.set(x,gy-.432,z+1.2); scene.add(l); } }

// industrial steel windows on the brick wall, looking out over the river
const skyT=still(5,1,(g,W,H)=>{
  let gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#bcd6ea'); gr.addColorStop(.55,'#e6eef2'); gr.addColorStop(.78,'#f6efe2'); g.fillStyle=gr; g.fillRect(0,0,W,H);
  let sd=7; const rnd=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  for(let i=0;i<9;i++){ const x=rnd()*W,y=H*(.08+rnd()*.3),r=120+rnd()*200; gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(255,255,255,.55)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.save(); g.scale(1,.35); g.fillRect(x-r,(y/.35)-r,2*r,2*r); g.restore(); }
  const hz=H*.72, far='#b6c3d0', mid='#a5b4c3';
  // Manhattan: dense blocks with setbacks, rooftop water tanks, and the tall landmarks
  g.fillStyle=far; for(let x=0;x<W;){ const bw=16+rnd()*30, bh=H*(.07+rnd()*rnd()*.2); g.fillRect(x,hz-bh,bw,bh); if(rnd()<.45) g.fillRect(x+bw*.2,hz-bh-H*.03,bw*.6,H*.03); if(rnd()<.2){ g.fillRect(x+bw*.3,hz-bh-H*.022,bw*.22,H*.014); g.fillRect(x+bw*.33,hz-bh-H*.008,2,H*.008); g.fillRect(x+bw*.47,hz-bh-H*.008,2,H*.008); } x+=bw+rnd()*4; }
  const slim=(x,w,h)=>g.fillRect(x-w/2,hz-h,w,h);
  const tiers=(x,w,h)=>{ g.fillRect(x-w/2,hz-h*.6,w,h*.6); g.fillRect(x-w*.36,hz-h*.8,w*.72,h*.2); g.fillRect(x-w*.2,hz-h*.9,w*.4,h*.1); g.beginPath(); g.moveTo(x-w*.1,hz-h*.9); g.lineTo(x,hz-h*.97); g.lineTo(x+w*.1,hz-h*.9); g.fill(); g.fillRect(x-1.5,hz-h*1.12,3,h*.16); };
  const taper=(x,w,h)=>{ g.beginPath(); g.moveTo(x-w/2,hz); g.lineTo(x-w*.3,hz-h); g.lineTo(x+w*.3,hz-h); g.lineTo(x+w/2,hz); g.fill(); g.fillRect(x-1.5,hz-h*1.2,3,h*.2); };
  const crown=(x,w,h)=>{ g.fillRect(x-w/2,hz-h*.72,w,h*.72); g.beginPath(); g.moveTo(x-w/2,hz-h*.72); g.quadraticCurveTo(x-w*.12,hz-h*.86,x,hz-h*1.05); g.quadraticCurveTo(x+w*.12,hz-h*.86,x+w/2,hz-h*.72); g.fill(); };
  taper(W*.085,46,H*.4); slim(W*.115,22,H*.26); slim(W*.16,20,H*.3); slim(W*.24,16,H*.36);
  tiers(W*.49,40,H*.42); crown(W*.545,24,H*.34); slim(W*.575,14,H*.44); slim(W*.66,18,H*.38); slim(W*.7,26,H*.3); slim(W*.83,16,H*.4); slim(W*.88,24,H*.28); slim(W*.93,14,H*.34);
  g.fillStyle=mid; for(let x=0;x<W;){ const bw=18+rnd()*40, bh=H*(.04+rnd()*.12); g.fillRect(x,hz-bh,bw,bh); x+=bw+rnd()*14; }
  // river
  gr=g.createLinearGradient(0,hz,0,H); gr.addColorStop(0,'#c3d2dc'); gr.addColorStop(1,'#aebfcb'); g.fillStyle=gr; g.fillRect(0,hz,W,H-hz);
  g.strokeStyle='rgba(255,255,255,.35)'; g.lineWidth=1.5; for(let i=0;i<160;i++){ const x=rnd()*W,y=hz+6+rnd()*(H-hz-60); g.beginPath(); g.moveTo(x,y); g.lineTo(x+10+rnd()*30,y); g.stroke(); }
  // bridge: granite towers with paired pointed arches, four cables and a fan of diagonal stays
  const stone='#9a8e80', cable='#66727e', t1=W*.33, t2=W*.65, dy=hz-H*.085, th=H*.27, tw=60, x0=W*.14, x1=W*.84;
  g.strokeStyle=cable; g.lineWidth=1; for(const tx of [t1,t2]) for(let k=1;k<=9;k++) for(const sgn of [-1,1]){ g.beginPath(); g.moveTo(tx,dy-th+6); g.lineTo(tx+sgn*k*30,dy); g.stroke(); }
  for(let x=x0;x<x1;x+=11){ let y; if(x<t1){ const u=(x-x0)/(t1-x0); y=dy-th*u*u; } else if(x>t2){ const u=(x1-x)/(x1-t2); y=dy-th*u*u; } else { const u=(x-t1)/(t2-t1); y=dy-th+4*(th-14)*u*(1-u); } g.beginPath(); g.moveTo(x,y); g.lineTo(x,dy); g.stroke(); }
  g.lineWidth=3.5; g.beginPath(); for(let i=0;i<=60;i++){ const u=i/60, x=t1+(t2-t1)*u, y=dy-th+4*(th-14)*u*(1-u); i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke();
  g.beginPath(); g.moveTo(x0,dy); g.quadraticCurveTo(x0+(t1-x0)*.55,dy-th*.12,t1,dy-th); g.moveTo(x1,dy); g.quadraticCurveTo(x1-(x1-t2)*.55,dy-th*.12,t2,dy-th); g.stroke();
  g.fillStyle=cable; g.fillRect(x0-W*.1,dy,x1-x0+W*.2,7); g.lineWidth=1.5; for(let x=x0-W*.1;x<x1+W*.1;x+=14){ g.beginPath(); g.moveTo(x,dy+7); g.lineTo(x+7,dy+15); g.lineTo(x+14,dy+7); g.stroke(); } g.fillRect(x0-W*.1,dy+15,x1-x0+W*.2,2);
  for(const tx of [t1,t2]){ g.fillStyle=stone; g.fillRect(tx-tw/2,dy-th,tw,th+(hz-dy)+8); g.fillRect(tx-tw/2-7,dy-th-8,tw+14,10); g.fillRect(tx-tw/2-4,dy-th*.5,tw+8,6); g.fillRect(tx-tw/2-10,dy+14,tw+20,hz-dy);
    g.fillStyle='#dfe8ec'; for(const ax of [tx-14,tx+14]){ const aw=16, sp=dy-th*.52; g.beginPath(); g.moveTo(ax-aw/2,dy-2); g.lineTo(ax-aw/2,sp); g.quadraticCurveTo(ax-aw/2,sp-26,ax,sp-40); g.quadraticCurveTo(ax+aw/2,sp-26,ax+aw/2,sp); g.lineTo(ax+aw/2,dy-2); g.fill(); } }
  for(const [ax,s2] of [[x0-30,1],[x1+30,-1]]){ g.fillStyle=stone; g.fillRect(ax-40,dy-10,80,hz-dy+16); }
  // working waterfront in the foreground: sheds, gantry cranes, water tanks, stacks
  const fg='#7e858c'; g.fillStyle=fg; g.strokeStyle=fg; const gy=H*.9; g.fillRect(0,gy,W,H-gy);
  for(let x=-20;x<W;){ const bw=90+rnd()*150, bh=H*(.05+rnd()*.1); g.fillRect(x,gy-bh,bw,bh); if(rnd()<.5){ for(let k=0;k<bw;k+=30){ g.beginPath(); g.moveTo(x+k,gy-bh); g.lineTo(x+k+10,gy-bh-12); g.lineTo(x+k+30,gy-bh); g.fill(); } } x+=bw+rnd()*40; }
  const crane=(x,sc,flip)=>{ g.save(); g.translate(x,gy); g.scale(sc*(flip?-1:1),sc); g.lineWidth=5; g.beginPath(); g.moveTo(-22,0); g.lineTo(-8,-150); g.lineTo(8,-150); g.lineTo(22,0); g.stroke(); g.lineWidth=2.5; for(let k=0;k<5;k++){ const y=-k*30, w0=22-k*2.8, w1=22-(k+1)*2.8; g.beginPath(); g.moveTo(-w0,y); g.lineTo(w1,y-30); g.moveTo(w0,y); g.lineTo(-w1,y-30); g.stroke(); }
    g.fillRect(-16,-178,34,28); g.lineWidth=5; g.beginPath(); g.moveTo(10,-170); g.lineTo(150,-235); g.stroke(); g.lineWidth=2; g.beginPath(); g.moveTo(0,-200); g.lineTo(150,-235); g.moveTo(0,-178); g.lineTo(0,-200); g.moveTo(-60,-160); g.lineTo(0,-200); g.moveTo(150,-235); g.lineTo(150,-120); g.stroke(); g.fillRect(-64,-170,50,16); g.fillRect(145,-122,10,12); g.restore(); };
  crane(W*.06,1.0,false); crane(W*.9,1.1,true);
  const tank=(x)=>{ g.fillRect(x-20,gy-150,40,34); g.beginPath(); g.moveTo(x-23,gy-150); g.lineTo(x,gy-168); g.lineTo(x+23,gy-150); g.fill(); g.lineWidth=2.5; for(const o of [-16,-5,5,16]){ g.beginPath(); g.moveTo(x+o,gy-116); g.lineTo(x+o*1.25,gy-60); g.stroke(); } };
  tank(W*.27); tank(W*.74); g.fillRect(W*.2,gy-150,11,100);
},512);
const winZ=[13.8,7.4,1.0,-5.4,-11.8];
winZ.forEach((zc,i)=>{ const w=grp(scene,RM.x0,0,zc,Math.PI/2), Ww=4.6, Wh=3.5, cy=4.85;
  w.add(at(box(Ww+.16,Wh+.16,.1,M.blk),0,cy,.03));
  const t=skyT.clone(); t.needsUpdate=true; t.repeat.set(.2,1); t.offset.set(i*.2,0);
  const pane=plane(Ww,Wh,new THREE.MeshBasicMaterial({map:t,toneMapped:false})); w.add(at(pane,0,cy,.085));
  const geos=[]; for(let k=1;k<6;k++) geos.push(rodGeo(V(-Ww/2+k*Ww/6,cy-Wh/2,.1),V(-Ww/2+k*Ww/6,cy+Wh/2,.1),.022,4)); for(let k=1;k<5;k++) geos.push(rodGeo(V(-Ww/2,cy-Wh/2+k*Wh/5,.1),V(Ww/2,cy-Wh/2+k*Wh/5,.1),.022,4));
  w.add(new THREE.Mesh(mergeGeometries(geos),M.blk)); w.add(at(box(Ww+.3,.07,.3,M.conc),0,cy-Wh/2-.11,.15));
});
// daylight falling across the floor from the windows
{ const lt=still(1,1,(g,W,H)=>{ g.clearRect(0,0,W,H); g.filter='blur(5px)'; for(let c=0;c<6;c++) for(let r=0;r<5;r++){ g.fillStyle='rgba(255,250,238,.9)'; g.fillRect(14+c*40,16+r*46,33,39); } },256);
  for(const zc of winZ.slice(0,4)){ const geo=new THREE.PlaneGeometry(4.6,5.4); geo.applyMatrix4(new THREE.Matrix4().makeShear(0,0,.45,0,0,0)); const p=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:lt,transparent:true,opacity:.42,depthWrite:false})); p.rotation.set(-Math.PI/2,0,-Math.PI/2); p.position.set(RM.x0+4.4,.016,zc-1.4); p.renderOrder=1; scene.add(p); } }
// brick piers between the windows + two mushroom columns out on the floor
for(const z of [-8.6,-2.2,4.2,10.6]) scene.add(at(box(.34,RM.h,.7,brickP),RM.x0+.17,RM.h/2,z));
for(const [x,z] of [[-9.6,8.8],[10.4,8.4]]){ const c=grp(scene,x,0,z); c.add(at(cyl(.36,.36,RM.h-1.1,M.conc,28),0,(RM.h-1.1)/2,0)); c.add(at(cyl(1.05,.36,.95,M.conc,28),0,RM.h-.2-.475,0)); c.add(at(cyl(1.15,1.15,.2,M.conc,28),0,RM.h-.1,0)); c.add(at(cyl(.4,.42,.12,baseM,28),0,.06,0)); blob(scene,x,z,1.8,1.8,.4); }

// oak slat wall + sign on the back wall
{ const st=still(1,1,(g,W,H)=>{ for(let x=0;x<W;x+=32){ const l=176+Math.random()*26|0; g.fillStyle=`rgb(${l+22},${l-12},${l-58})`; g.fillRect(x,0,23,H); g.fillStyle='rgba(120,84,48,.18)'; for(let k=0;k<5;k++) g.fillRect(x+Math.random()*20,0,1,H); g.fillStyle='#2a221a'; g.fillRect(x+23,0,9,H); } },256);
  st.wrapS=THREE.RepeatWrapping; st.repeat.set(26,1); const sl=box(21,4.2,.07,std(0xffffff,.62,0,{map:st})); sl.castShadow=false; scene.add(at(sl,1.5,2.24,RM.z0+.04)); scene.add(at(box(21,.06,.12,M.blk),1.5,4.37,RM.z0+.06));
  const sgT=still(5.2,1.3,(c,W,H)=>{ c.clearRect(0,0,W,H); c.textAlign='center'; c.textBaseline='middle'; c.font=`700 ${H*.5}px Geist, sans-serif`; c.fillStyle='#fffaf0'; c.shadowColor='rgba(255,232,196,.95)'; c.shadowBlur=H*.2; for(let k=0;k<3;k++) c.fillText('Possible AV',W/2,H*.5); c.shadowBlur=0; c.fillText('Possible AV',W/2,H*.5); },256);
  scene.add(at(plane(5.2,1.3,new THREE.MeshBasicMaterial({map:sgT,transparent:true,depthWrite:false,toneMapped:false})),.5,5.55,RM.z0+.02));
  const sub2=paint('STUDIO A',1.7,.21,{font:'500 60px "Geist Mono", monospace',color:'rgba(250,244,234,.78)',res:512}); scene.add(at(sub2,.5,4.82,RM.z0+.02)); }
// storage racking, back-right
{ const g=grp(scene,15.6,0,RM.z0+.62), upM=std(0x3f4a55,.5,.6), bmM=std(0x2c2c2f,.5,.5);
  for(const x of [-2.9,0,2.9]) for(const z of [-.42,.42]) g.add(at(box(.08,4.9,.06,upM),x,2.45,z));
  for(const y of [.18,1.75,3.3]){ for(const z of [-.42,.42]) g.add(at(box(5.9,.1,.05,bmM),0,y,z)); g.add(at(box(5.8,.03,.86,M.wood),0,y+.06,0)); }
  const put=(o,x,y,ry=0)=>{ o.position.set(x,y,0); o.rotation.y=ry; g.add(o); };
  put(rcase(1.2,.7,.7),-2.1,.26); put(rcase(.9,.9,.7),-.8,.26); put(rcase(1.5,.8,.7),1.4,.26,.05);
  const bins=[0xb9ad98,0x8fa08f,0x8a97a6,0xb9ad98,0x6f7b86]; for(let i=0;i<7;i++) put(rbox(.62,.4,.6,std(bins[i%5],.7),.04),-2.5+i*.8,2.03);
  for(let i=0;i<4;i++){ const t=mesh(new THREE.TorusGeometry(.26,.07,10,28),M.rubber); t.rotation.x=Math.PI/2; t.position.set(-2.3+i*.72,3.46+.0,0); g.add(t); const t2=t.clone(); t2.position.y+=.13; t2.scale.setScalar(.92); g.add(t2); }
  put(rbox(.5,.8,.5,M.shell,.04),.9,3.78); put(rbox(.5,.8,.5,M.shell,.04),1.5,3.78); put(rcase(.8,.5,.6),2.4,3.36);
  blob(scene,15.6,RM.z0+.8,6.6,1.8,.5); }
// right wall (inside face): acoustic panels, door, exit sign
{ const pA=std(0xdcd5c8,1), pB=std(0xcfc7b8,1); for(let i=6;i<8;i++){ const p=plane(2.7,2.7,i%2?pA:pB); p.rotation.y=-Math.PI/2; p.position.set(RM.x1-.03,5.0,RM.z0+3.2+i*3.6); scene.add(p); }
  const onWall=(m,y,z)=>{ m.rotation.y=-Math.PI/2; m.position.set(RM.x1-.035,y,z); scene.add(m); return m; };
  // signal flow, playing on a wall-mounted LED screen
  { const L=[['CAMERAS','PLAYBACK','MICROPHONES','SENSORS'],['SWITCHING','MEDIA SERVERS','AUDIO DSP','SHOW NETWORK'],['LED WALLS','PROJECTION','SPEAKERS','INTERACTIVE']], HD=['01  SOURCES','02  PROCESSING','03  OUTPUTS'], col=[.03,.39,.75], rows=[.34,.52,.7,.88], LK=[[[0,0],[1,0],[1,1],[2,2],[3,3],[3,1]],[[0,0],[0,1],[1,0],[1,1],[2,2],[3,3],[3,0],[3,2]]];
    const fw=ledWall(20,6,(c,W,H,t)=>{ c.fillStyle='#06080c'; c.fillRect(0,0,W,H); const bw=W*.2, bh=H*.115; c.textBaseline='middle'; c.lineJoin='round';
        c.fillStyle='#f2f5f8'; c.font=`600 ${H*.085}px Geist, sans-serif`; c.fillText('Signal flow',W*.03,H*.1); c.fillStyle='rgba(160,200,220,.9)'; c.font=`500 ${H*.04}px "Geist Mono", monospace`; HD.forEach((x,i)=>c.fillText(x,W*col[i]+4,H*.22));
        LK.forEach((lk,ci)=>lk.forEach(([a,b],k)=>{ const x0=W*col[ci]+bw, x1=W*col[ci+1], y0=H*rows[a], y1=H*rows[b], mx=(x0+x1)/2; c.strokeStyle='rgba(120,150,175,.55)'; c.lineWidth=2; c.beginPath(); c.moveTo(x0,y0); c.bezierCurveTo(mx,y0,mx,y1,x1,y1); c.stroke();
          const u=((t*.35+k*.17+ci*.4)%1), v=1-u, px=v*v*v*x0+3*v*v*u*mx+3*v*u*u*mx+u*u*u*x1, py=v*v*v*y0+3*v*v*u*y0+3*v*u*u*y1+u*u*u*y1; c.fillStyle='#7fe3ff'; c.shadowColor='#7fe3ff'; c.shadowBlur=10; c.beginPath(); c.arc(px,py,4.5,0,7); c.fill(); c.shadowBlur=0; }));
        c.font=`500 ${H*.045}px "Geist Mono", monospace`; L.forEach((cl,ci)=>cl.forEach((x,ri)=>{ const bx=W*col[ci], by=H*rows[ri]-bh/2; c.fillStyle='#0d1219'; c.strokeStyle='#e6eef5'; c.lineWidth=2; c.beginPath(); c.roundRect(bx,by,bw,bh,bh/2); c.fill(); c.stroke(); c.fillStyle='#f2f5f8'; c.fillText(x,bx+bh*.55,by+bh/2+1); })); },{support:false,res:64});
    fw.rotation.y=-Math.PI/2; fw.position.set(RM.x1-.09,3.35,2.5); scene.add(fw); insideOnly.push(fw); const fr=plane(10.3,3.3,std(0x141416,.6)); onWall(fr,4.85,2.5); }
  // clocks for the cities we tour, and an on-air light, behind the production desk
  let tzf=null; try{ tzf=['America/New_York','America/Chicago','America/Los_Angeles'].map(z=>new Intl.DateTimeFormat('en-US',{timeZone:z,hour:'numeric',minute:'numeric',second:'numeric',hourCycle:'h23'})); }catch(e){}
  const hms=(i)=>{ const d=new Date(); try{ const p=tzf[i].formatToParts(d), g=k=>+p.find(x=>x.type===k).value; return [g('hour'),g('minute'),g('second')]; }catch(e){ return [d.getHours()-i,d.getMinutes(),d.getSeconds()]; } };
  const ck=screen(4.8,1.6,(c,W,H)=>{ c.clearRect(0,0,W,H); ['NEW YORK','CHICAGO','LOS ANGELES'].forEach((n,i)=>{ const x=W*(.17+i*.33), y=H*.4, r=H*.34, [h,m,sc]=hms(i);
      c.fillStyle='#1c1c1f'; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.strokeStyle='#f3f0ea'; c.lineCap='round'; for(let k=0;k<12;k++){ const a=k*Math.PI/6; c.lineWidth=k%3?1.5:3; c.beginPath(); c.moveTo(x+Math.sin(a)*r*.82,y-Math.cos(a)*r*.82); c.lineTo(x+Math.sin(a)*r*.92,y-Math.cos(a)*r*.92); c.stroke(); }
      const hand=(a,l,w,col)=>{ c.strokeStyle=col; c.lineWidth=w; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.sin(a)*r*l,y-Math.cos(a)*r*l); c.stroke(); };
      hand((h%12+m/60)*Math.PI/6,.5,5,'#f3f0ea'); hand((m+sc/60)*Math.PI/30,.74,3.5,'#f3f0ea'); hand(sc*Math.PI/30,.8,1.5,'#ff5a4d'); c.fillStyle='#f3f0ea'; c.beginPath(); c.arc(x,y,4,0,7); c.fill();
      c.fillStyle='#f6f1e7'; c.font=`500 ${H*.085}px "Geist Mono", monospace`; c.textAlign='center'; c.fillText(n,x,H*.92); }); },256);
  ck.material.transparent=true; onWall(ck,5.0,-9.3);
  const oa=still(1.3,.42,(c,W,H)=>{ c.clearRect(0,0,W,H); c.fillStyle='#1c1c1f'; c.beginPath(); c.roundRect(2,2,W-4,H-4,H*.22); c.fill(); c.textAlign='center'; c.textBaseline='middle'; c.font=`700 ${H*.5}px Geist, sans-serif`; c.shadowColor='#ff5a4d'; c.shadowBlur=H*.3; c.fillStyle='#ff6a5c'; c.fillText('ON AIR',W/2,H*.54); c.fillText('ON AIR',W/2,H*.54); },128);
  onWall(plane(1.3,.42,new THREE.MeshBasicMaterial({map:oa,transparent:true,toneMapped:false})),4.2,-5.4);
  const d=plane(1.15,2.25,std(0x4a5560,.55,.3)); d.rotation.y=-Math.PI/2; d.position.set(RM.x1-.03,1.125,-1.9); scene.add(d);
  const ex=plane(.5,.2,glow(0x35c46a)); ex.rotation.y=-Math.PI/2; ex.position.set(RM.x1-.04,2.55,-1.9); scene.add(ex);
  const arts=[['#22313f','#7fd4e6','#f3efe6'],['#f3efe6','#1a1a18','#c85a8a'],['#2b2b2e','#f0e6d2','#3ca0b8']];
  arts.forEach((a,i)=>{ const t=still(.8,1.1,(c,W,H)=>{ c.fillStyle='#f6f4ef'; c.fillRect(0,0,W,H); c.fillStyle=a[0]; c.fillRect(W*.1,H*.08,W*.8,H*.84); c.fillStyle=a[1]; c.beginPath(); c.arc(W*(.38+.12*i),H*(.4+.06*i),W*.24,0,7); c.fill(); c.fillStyle=a[2]; c.fillRect(W*.2,H*(.62-.05*i),W*.6,H*.05); c.fillRect(W*.2,H*.72,W*.34,H*.03); },256);
    const fr=plane(.94,1.24,std(0x1c1c1f,.5)); fr.rotation.y=-Math.PI/2; fr.position.set(RM.x1-.03,2.25,6.2+i*1.25); scene.add(fr); const p=plane(.86,1.16,std(0xffffff,.8,0,{map:t})); p.rotation.y=-Math.PI/2; p.position.set(RM.x1-.04,2.25,6.2+i*1.25); scene.add(p); });
  const sb=grp(scene,RM.x1-.4,0,7.45,-Math.PI/2); sb.add(at(rbox(3.4,.62,.5,M.wood,.02),0,.5,0)); for(const sx of [-1.5,1.5]) for(const sz of [-.18,.18]) sb.add(at(cyl(.02,.014,.2,M.blk,10),sx,.1,sz)); for(let i=0;i<4;i++) sb.add(at(box(.8,.5,.01,M.woodD),-1.26+i*.84,.5,.252));
  const pl=plant(1.1); pl.position.set(-1.3,.81,0); pl.scale.setScalar(.55); sb.add(pl); sb.add(at(rbox(.5,.3,.3,M.shell,.03),.3,.96,0)); sb.add(at(rbox(.36,.22,.26,M.shell,.03),.95,.92,0)); blob(scene,RM.x1-.5,7.45,1.2,4,.4); }
// front wall (inside face): roll-up door, side door, panels
{ const dt=still(1,1,(g,W,H)=>{ g.fillStyle='#c9c4b9'; g.fillRect(0,0,W,H); for(let y=0;y<H;y+=16){ g.fillStyle='#b2ac9f'; g.fillRect(0,y,W,3); g.fillStyle='#dad5cb'; g.fillRect(0,y+3,W,2); } },256);
  const d2=plane(1.15,2.25,std(0x4a5560,.55,.3)); d2.rotation.y=Math.PI; d2.position.set(9.6,1.125,RM.z1-.03); scene.add(d2);
  const ex=plane(.5,.2,glow(0x35c46a)); ex.rotation.y=Math.PI; ex.position.set(9.6,2.55,RM.z1-.04); scene.add(ex);
  const pA=std(0xdcd5c8,1); for(const x of [-17.2,-8,13.5,17]){ const p=plane(2.7,2.7,pA); p.rotation.y=Math.PI; p.position.set(x,5.2,RM.z1-.03); scene.add(p); }
  // cable wall: coiled looms on a rail, sorted and labelled
  const cw=new THREE.Group(); scene.add(cw); insideOnly.push(cw); cw.add(at(box(7.0,.09,.05,M.blk),5.0,3.55,RM.z1-.04));
  const cc=[M.rubber,M.rubber,std(0x2f6fb5,.6),M.rubber,std(0xe9e6df,.6),M.rubber,std(0x2f6fb5,.6),std(0x3f8f5f,.6),M.rubber,std(0xe9e6df,.6),M.rubber,M.rubber];
  for(let i=0;i<12;i++){ const x=1.9+i*.565, r=.2+((i*7)%3)*.03; cw.add(rot(at(cyl(.012,.012,.2,M.steel,8),x,3.53,RM.z1-.13),Math.PI/2)); for(let k=0;k<3;k++){ const t=mesh(new THREE.TorusGeometry(r-k*.01,.022,8,28),cc[i]); t.position.set(x+(k-1)*.012,3.5-r,RM.z1-.09-k*.04); cw.add(t); } const tg=plane(.1,.14,M.white); tg.rotation.y=Math.PI; tg.position.set(x+.1,3.5-r*2-.08,RM.z1-.1); cw.add(tg); }
  const cl=paint('XLR        SDI        CAT6        DMX        POWER',6.6,.2,{font:'500 40px "Geist Mono", monospace',color:'rgba(250,245,236,.88)',res:2048}); cl.rotation.y=Math.PI; cl.position.set(5.0,3.82,RM.z1-.03); scene.add(cl);
  const st=paint('LOAD IN  /  LOAD OUT',3.0,.26,{font:'600 60px Geist, sans-serif',color:'rgba(250,245,236,.9)',res:1024}); st.rotation.y=Math.PI; st.position.set(-12.9,4.35,RM.z1-.03); scene.add(st); }
// loading dock: our truck backed up to the door, crew rolling cases on
function buildDock(){ const cx=-12.9, z0=RM.z1, steel=std(0x26272b,.5,.5), inM=std(0xf2f0ec,.7,0,{emissive:0xf2f0ec,emissiveIntensity:.32}), bodyM=std(0xf6f5f2,.42,.05), glassM=std(0x1b2330,.08,.6,{envMapIntensity:1.4});
  // door frame, rolled-up shutter, dock plate, seal and bollards
  for(const sx of [DK.x0,DK.x1]) scene.add(at(box(.14,DK.h,.16,steel),sx,DK.h/2,z0-.02)); scene.add(at(box(3.3,.16,.18,steel),cx,DK.h+.02,z0-.02)); scene.add(at(rot(cyl(.2,.2,3.2,std(0xb8b3a8,.5,.4),20),0,0,Math.PI/2),cx,DK.h+.3,z0-.16));
  scene.add(at(box(2.6,.03,.75,std(0x8a8d90,.45,.8)),cx,.012,z0+.22)); for(const sx of [DK.x0+.12,DK.x1-.12]) scene.add(at(rbox(.26,3.0,.5,M.rubber,.06),sx,1.5,z0+.33)); scene.add(at(rbox(3.0,.4,.5,M.rubber,.06),cx,3.15,z0+.33));
  for(const sx of [DK.x0-.35,DK.x1+.35]){ scene.add(at(cyl(.09,.09,1.0,std(0xd8d4cb,.5,.3),16),sx,.5,z0-.6)); scene.add(at(sph(.09,std(0xd8d4cb,.5,.3),16,10),sx,1.0,z0-.6)); }
  // apron outside, below dock height
  const gy=-1.15; scene.add(at(box(8,.2,13,std(0x9a9790,.9)),cx,gy-.1,z0+6.9)); for(const sx of [-1.75,1.75]){ const ln=plane(.12,9,new THREE.MeshBasicMaterial({color:0xf2efe8})); ln.rotation.x=-Math.PI/2; ln.position.set(cx+sx,gy+.012,z0+6); scene.add(ln); }
  // box truck
  const T=grp(scene,cx,0,z0+.45), BL=5.4, BW=2.5, BH=2.65;
  T.add(at(box(BW,.08,BL,std(0xb9b2a4,.7)),0,-.04,BL/2)); T.add(at(box(BW,.06,BL,bodyM),0,BH,BL/2)); T.add(at(box(BW,BH,.06,bodyM),0,BH/2,BL));
  for(const sx of [-1,1]){ const cut=sx>0?2.7:0; T.add(at(box(.05,BH,BL-cut,bodyM),sx*(BW/2-.025),BH/2,cut+(BL-cut)/2)); const lin=plane(BL-.1,BH-.1,inM); lin.rotation.y=-sx*Math.PI/2; lin.position.set(sx*(BW/2-.06),BH/2,BL/2); T.add(lin); for(const y of [.9,1.7]){ const tr=plane(BL-.3,.07,std(0x8a8d90,.4,.8)); tr.rotation.y=-sx*Math.PI/2; tr.position.set(sx*(BW/2-.065),y,BL/2); T.add(tr); } }
  { const fw=plane(BW-.1,BH-.1,inM); fw.rotation.y=Math.PI; fw.position.set(0,BH/2,BL-.04); T.add(fw); const cl=plane(BW-.1,BL-.1,inM); cl.rotation.x=Math.PI/2; cl.position.set(0,BH-.04,BL/2); T.add(cl); for(const z of [1.3,3.6]) T.add(at(box(.9,.03,.14,glow(0xfff4e0)),0,BH-.06,z)); const il=new THREE.PointLight(0xfff0dc,10,7,2); il.position.set(0,2.1,2.2); T.add(il); }
  for(const sx of [-1,1]) for(const y of [0,BH]) T.add(at(box(.07,.07,BL,M.alu),sx*(BW/2-.01),y,BL/2)); for(const sx of [-1,1]) T.add(at(box(.07,BH,.07,M.alu),sx*(BW/2-.01),BH/2,.03)); T.add(at(box(BW,.07,.07,M.alu),0,BH,.03)); T.add(at(box(BW,.1,.12,steel),0,-.1,.03));
  const sideT=still(4.8,1.9,(c,W,H)=>{ c.clearRect(0,0,W,H); c.fillStyle='#1a1a18'; c.textBaseline='middle'; c.font=`700 ${H*.36}px Geist, sans-serif`; c.fillText('Possible AV',H*.3,H*.45); c.fillStyle='#E8892D'; c.beginPath(); c.arc(H*.16,H*.45,H*.075,0,7); c.fill(); c.fillStyle='rgba(26,26,24,.7)'; c.font=`500 ${H*.085}px "Geist Mono", monospace`; c.fillText('AV RENTAL  ·  INSTALLATION  ·  PRODUCTION',H*.08,H*.76); c.fillText('BROOKLYN, NEW YORK  ·  CREWS TRAVEL',H*.08,H*.89); },400);
  for(const sx of [-1,1]){ const w=sx>0?2.55:4.8, sp=plane(w,w*1.9/4.8,new THREE.MeshBasicMaterial({map:sideT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})); sp.rotation.y=sx*Math.PI/2; sp.position.set(sx*(BW/2+.006),1.45,sx>0?4.05:BL/2); T.add(sp); }
  // chassis, wheels, cab
  T.add(at(box(.95,.22,BL+1.85,steel),0,-.28,(BL+1.85)/2+.2)); T.add(at(rbox(.6,.5,1.1,steel,.08),-.95,-.5,2.3));
  const wheel=(x,z,dual)=>{ for(let k=0;k<(dual?2:1);k++){ const w=rot(cyl(.5,.5,.28,M.rubber,28),0,0,Math.PI/2); w.position.set(x+Math.sign(x)*-k*.3,gy+.5,z); T.add(w); } const hub=rot(cyl(.24,.24,.3,std(0xcfcdc8,.3,.8),20),0,0,Math.PI/2); hub.position.set(x+Math.sign(x)*.02,gy+.5,z); T.add(hub); };
  for(const sx of [-1,1]){ wheel(sx*1.08,3.9,true); wheel(sx*1.05,BL+1.75,false); T.add(at(rbox(.36,.12,1.3,steel,.05),sx*1.05,gy+1.1,3.9)); T.add(at(rbox(.5,.06,.9,std(0x2a2b2f,.9),.02),sx*1.05,gy+.62,3.05)); }
  const cab=grp(T,0,0,BL+.2); cab.add(at(rbox(2.3,1.95,1.9,bodyM,.16),0,.42,1.0)); cab.add(at(rbox(2.32,.5,2.0,steel,.08),0,-.72,1.05));
  { const ws=plane(1.95,.85,glassM); ws.position.set(0,.9,1.955); ws.rotation.x=-.12; cab.add(ws); for(const sx of [-1,1]){ const sw=plane(1.0,.7,glassM); sw.rotation.y=sx*Math.PI/2; sw.position.set(sx*1.156,.92,1.15); cab.add(sw); cab.add(at(rbox(.08,.36,.2,steel,.03),sx*1.32,1.0,1.75)); cab.add(rod(V(sx*1.15,.85,1.7),V(sx*1.32,.95,1.75),.015,steel)); cab.add(at(rbox(.32,.16,.06,glow(0xfff6e0),.03),sx*.82,-.42,1.97)); const hd=plane(.9,.02,steel); hd.rotation.y=sx*Math.PI/2; hd.position.set(sx*1.157,.5,1.0); cab.add(hd); }
    cab.add(at(rbox(1.5,.34,.05,steel,.02),0,-.38,1.97)); cab.add(at(rbox(2.36,.2,.16,std(0x3a3b40,.5,.4),.04),0,-.86,2.02)); const cl=paint('Possible AV',.9,.15,{font:'700 110px Geist, sans-serif',color:'rgba(26,26,24,.9)',res:512}); cl.position.set(0,.2,1.956); cab.add(cl); cab.add(at(rbox(1.9,.1,.5,bodyM,.04),0,1.44,.9)); }
  // cases already strapped in
  for(const [x,z,w,h,y] of [[-.6,4.7,1.1,.8,0],[.62,4.7,1.1,.8,0],[-.6,4.7,1.1,.7,.86],[.62,4.75,1.1,.7,.86],[-.55,3.75,1.2,.9,0],[.7,3.8,.8,1.3,0]]){ const c=rcase(w,h,.75); c.position.set(x,y,z); T.add(c); }
  for(const y of [.95,1.55]) T.add(at(box(BW-.14,.045,.012,std(0x2f6fb5,.7)),0,y,3.3));
  // one tech rolls a case to the truck, one takes it inside
  // hands on the case on the way in, a normal walk on the way back; the case is rolled past the cutaway and stays in the truck
  const rc=rcase(1.0,.85,.7), stowed=rcase(1.0,.85,.7), zEnd=z0+2.62, pusher=crew(scene,{clip:'walk',arms:(sd)=>rc.visible?V(sd*.2,-.32,.9):null}); pusher.add(at(rc,0,0,.78)); stowed.position.set(cx+.35,0,zEnd+.78); scene.add(stowed);
  updaters.push(t=>{ const P=8.5, u=(t%P)/P, go=u<.56, k=go?u/.56:1-(u-.56)/.44; pusher.position.set(cx+.35,0,lerp(12.6,zEnd,k)); pusher.rotation.y=go?0:Math.PI; rc.visible=go; stowed.visible=!go||k<.8; });
  crew(scene,{x:cx-.5,z:z0+2.6,ry:Math.PI-.25,arms:(sd)=>V(sd*.22,-.3,.9)}).add(at(rcase(.7,1.05,.6),0,0,.74)); // the loader inside is stowing a case of his own
  blob(scene,cx,z0-1.2,3.2,2.2,.3);
}
// lounge, front-right
{ const g=grp(scene,15.3,0,13.3);
  const rt=still(1,1,(gg,W,H)=>{ gg.fillStyle='#b8ad9b'; gg.fillRect(0,0,W,H); gg.strokeStyle='rgba(255,250,240,.5)'; gg.lineWidth=6; gg.strokeRect(18,18,W-36,H-36); for(let i=0;i<5000;i++){ gg.fillStyle=Math.random()<.5?'rgba(80,70,58,.08)':'rgba(255,255,255,.08)'; gg.fillRect(Math.random()*W,Math.random()*H,2,2); } },256);
  const rug=plane(5.6,4.4,std(0xffffff,1,0,{map:rt})); rug.rotation.x=-Math.PI/2; rug.position.y=.014; rug.receiveShadow=true; g.add(rug);
  const s=sofa(2.5,M.linen); s.position.set(0,0,2.1); s.rotation.y=Math.PI; g.add(s);
  const a=seat(0x6f8078,1.2); a.position.set(2.35,0,.55); a.rotation.y=-Math.PI/2-.25; g.add(a); const a2=seat(0x6f8078,1.2); a2.position.set(2.15,0,-.75); a2.rotation.y=-Math.PI/2+.3; g.add(a2);
  const stb=grp(g,-1.75,0,2.15); stb.add(at(cyl(.26,.26,.035,M.woodD,28),0,.52,0)); stb.add(at(cyl(.022,.022,.5,M.blk,10),0,.26,0)); stb.add(at(cyl(.17,.17,.02,M.blk,24),0,.01,0)); drop('IridescenceLamp',stb,{y:.54,s:1.1}); stb.add(at(sph(.05,glow(0xffe9c4),10,8),0,.86,0));
  const mg=grp(g,-2.3,0,-.9,.5); for(let i=0;i<3;i++) mg.add(at(rbox(.36,.035,.5,[M.white,M.bone,std(0x3c5a6a,.7)][i],.008),(i-1)*.02,.03+i*.036,(i%2)*.03));
  g.add(at(cyl(.6,.6,.045,M.wood,36),0,.4,.3)); for(let i=0;i<3;i++){ const an=i*2.094; g.add(rod(V(Math.sin(an)*.2,.38,.3+Math.cos(an)*.2),V(Math.sin(an)*.42,0,.3+Math.cos(an)*.42),.014,M.blk)); }
  g.add(at(rbox(.3,.02,.22,M.white,.006),-.15,.433,.25)); g.add(at(cyl(.045,.04,.1,M.white,14),.25,.47,.42));
  g.add(at(cyl(.2,.2,.03,M.blk,20),2.5,.015,2.3)); g.add(rod(V(2.5,.03,2.3),V(2.5,1.75,2.3),.014,M.blk)); g.add(rod(V(2.5,1.75,2.3),V(2.05,1.95,1.9),.012,M.blk)); const sh=mesh(new THREE.SphereGeometry(.22,20,12,0,Math.PI*2,0,Math.PI/2),M.white); sh.position.set(2.05,1.78,1.9); g.add(sh); g.add(at(sph(.07,glow(0xfff0d0),12,8),2.05,1.82,1.9));
  const p=plant(1.7); p.position.set(-2.6,0,2.6); g.add(p); blob(g,0,2.1,3.4,1.7,.5); blob(g,2.3,.55,1.3,1.3,.45); blob(g,2.15,-.75,1.3,1.3,.45); blob(g,0,.3,1.6,1.6,.35); blob(g,-1.75,2.15,.9,.9,.35); }
// workbench + pegboard, front-left
{ const g=grp(scene,RM.x0+.62,0,13.8,Math.PI/2);
  g.add(at(box(4.0,.06,.85,M.wood),0,.93,0)); for(const x of [-1.9,1.9]) for(const z of [-.36,.36]) g.add(at(box(.05,.9,.05,M.blk),x,.45,z)); g.add(at(box(3.8,.03,.7,M.blk),0,.3,0)); g.add(at(rbox(.9,.5,.7,std(0x4a5560,.5,.4),.02),-1.2,.62,0));
  g.add(at(rcase(.7,.45,.5),.9,.3,0)); g.add(at(box(3.8,1.5,.03,std(0xd9cdb8,.8)),0,2.0,-.52));
  const tl=[M.blk,M.steel,std(0xb0382e,.6),M.blk,M.steel,M.blk]; for(let i=0;i<9;i++){ const t=rbox(.07+.05*(i%3),.28+.08*(i%4),.03,tl[i%6],.01); t.position.set(-1.6+i*.4,1.75+.25*(i%2),-.49); g.add(t); }
  for(let i=0;i<3;i++){ const c=mesh(new THREE.TorusGeometry(.15,.04,8,24),i===1?std(0x2f6fb5,.6):M.rubber); c.position.set(-1.0+i*1.0,2.5,-.47); g.add(c); }
  g.add(at(laptop((gg,W,H)=>{ gg.fillStyle='#15161a'; gg.fillRect(0,0,W,H); gg.fillStyle='#7fd4e6'; for(let i=0;i<5;i++) gg.fillRect(8,10+i*14,40+((i*37)%50),5); }),.4,.96,.05)); g.add(at(cyl(.16,.16,.5,M.blk,12),1.4,1.21,-.1));
  const st=grp(g,.2,0,.9); st.add(at(cyl(.17,.17,.04,M.wood,20),0,.68,0)); for(let i=0;i<4;i++){ const a=i*1.57+.4; st.add(rod(V(Math.sin(a)*.1,.66,Math.cos(a)*.1),V(Math.sin(a)*.2,0,Math.cos(a)*.2),.012,M.blk)); }
  blob(scene,RM.x0+.9,13.8,2.2,4.6,.5); }
// meeting table with chairs
{ const g=grp(scene,8.9,0,13.4,0);
  const rt=still(1,1,(c,W,H)=>{ c.fillStyle='#8f9a94'; c.fillRect(0,0,W,H); for(let i=0;i<6000;i++){ c.fillStyle=Math.random()<.5?'rgba(40,50,46,.1)':'rgba(255,255,255,.08)'; c.fillRect(Math.random()*W,Math.random()*H,2,2); } c.strokeStyle='rgba(240,236,226,.6)'; c.lineWidth=4; c.strokeRect(14,14,W-28,H-28); },256);
  const rug=plane(5.0,3.6,std(0xffffff,1,0,{map:rt})); rug.rotation.x=-Math.PI/2; rug.position.y=.014; rug.receiveShadow=true; g.add(rug);
  g.add(at(rbox(2.8,.05,1.15,M.wood,.022),0,.745,0)); g.add(at(rbox(2.5,.08,.08,M.woodD,.02),0,.68,0));
  for(const sx of [-1,1]){ for(const sz of [-1,1]){ const l=mesh(new THREE.CylinderGeometry(.03,.02,.76,12),M.woodD); l.position.set(sx*1.12,.37,sz*.36); l.rotation.set(sz*-.1,0,sx*.06); g.add(l); } g.add(at(rbox(.07,.06,.8,M.woodD,.02),sx*1.1,.66,0)); }
  for(let i=0;i<3;i++) for(const sz of [-1,1]){ const c=seat(sz>0?0x7d7a72:0x5d6b70,1.12); c.position.set(-.9+i*.9,0,sz*.98); c.rotation.y=sz>0?Math.PI:0; c.rotation.y+=(i-1)*.08*sz; g.add(c); }
  g.add(at(laptop((c,W,H,t)=>{ c.fillStyle='#f3f0ea'; c.fillRect(0,0,W,H); c.fillStyle='#1a1a18'; c.fillRect(8,8,W*.5,6); c.fillStyle='#c9c3b7'; c.fillRect(8,22,W-16,H*.5); }),-.5,.772,.1));
  g.add(at(cyl(.04,.035,.09,M.white,14),.2,.815,-.25)); g.add(at(cyl(.04,.035,.09,M.white,14),.75,.815,.2)); g.add(at(rbox(.3,.012,.21,M.blk,.004),.6,.777,-.2)); const tp=plant(.5); tp.position.set(0,.77,0); g.add(tp);
  blob(g,0,0,3.6,2.6,.4); }
// coffee bar, front-left corner
{ const g=grp(scene,6.3,0,16.5,Math.PI);
  g.add(at(rbox(3.6,.9,.6,M.white,.02),0,.45,0)); g.add(at(rbox(3.72,.045,.68,M.wood,.015),0,.925,0)); for(let i=0;i<4;i++) g.add(at(box(.86,.72,.012,std(0xe7e3da,.6)),-1.32+i*.88,.47,.303));
  const em=grp(g,-.9,.95,-.02); em.add(at(rbox(.42,.36,.4,std(0xc9c9c6,.25,.9),.03),0,.18,0)); em.add(at(rbox(.44,.05,.42,M.blk,.015),0,.385,0)); em.add(at(rbox(.38,.03,.3,M.blk,.01),0,.02,.08)); for(const sx of [-.1,.1]){ em.add(at(cyl(.035,.03,.06,M.steel,16),sx,.2,.2)); em.add(rot(at(cyl(.012,.012,.14,M.blk,8),sx,.17,.28),Math.PI/2)); } em.add(at(cyl(.008,.008,.004,ledMat(0x52d38a,1),8),.16,.3,.202));
  const gr=grp(g,-.3,.95,0); gr.add(at(rbox(.16,.26,.2,M.blk,.03),0,.13,0)); const hp=mesh(new THREE.CylinderGeometry(.09,.05,.18,20),M.glass); hp.position.y=.36; gr.add(hp); gr.add(at(cyl(.092,.092,.015,M.blk,20),0,.455,0));
  for(let i=0;i<4;i++) g.add(at(cyl(.042,.036,.07,M.white,14),.3+((i%2)*.1),.985+Math.floor(i/2)*.072,.05)); g.add(at(rbox(.22,.3,.16,std(0x2f6fb5,.5,.2),.05),1.0,1.1,0)); const bp=plant(.55); bp.position.set(1.5,.95,-.05); g.add(bp);
  g.add(at(rbox(.72,1.9,.68,std(0xbfc0bf,.3,.85),.03),2.35,.95,0)); g.add(at(box(.02,1.2,.03,M.blk),2.05,1.1,.35));
  g.add(at(box(3.4,.04,.26,M.wood),0,1.75,-.15)); for(let i=0;i<7;i++) g.add(at(cyl(.05,.05,.14,i%3?M.glass:M.bone,14),-1.4+i*.42,1.84,-.15));
  for(let i=0;i<3;i++){ const st=grp(g,-1.2+i*1.05,0,.95); st.add(at(cyl(.19,.17,.05,M.woodD,24),0,.74,0)); for(let k=0;k<4;k++){ const a=k*1.5708+.78; st.add(rod(V(Math.sin(a)*.1,.72,Math.cos(a)*.1),V(Math.sin(a)*.2,0,Math.cos(a)*.2),.013,M.blk)); } const fr=mesh(new THREE.TorusGeometry(.165,.01,8,28),M.blk); fr.rotation.x=Math.PI/2; fr.position.y=.26; st.add(fr); }
  blob(scene,6.3,16.2,4.6,2.2,.45); }
// bench by the side door
{ const g=grp(scene,11.9,0,16.5,Math.PI); g.add(at(rbox(1.7,.06,.42,M.wood,.02),0,.45,0)); for(const sx of [-.75,.75]) g.add(at(rbox(.05,.44,.38,M.blk,.012),sx,.22,0)); g.add(at(rbox(.42,.14,.34,M.linen,.05),-.45,.55,0)); blob(scene,11.9,16.4,2,1,.4); }
// loose gear around the room: road cases, pallet, ladder, C-stands, plants, cable runs
{ const put=(o,x,z,r=0,y=0)=>{ o.position.set(x,y,z); o.rotation.y=r; scene.add(o); return o; };
  put(rcase(1.2,.8,.7),-10.4,16.45,.03); put(rcase(1.2,.8,.7),-10.38,16.45,.0,.84); put(rcase(1.6,1.0,.8),-8.7,16.4,-.04); blob(scene,-9.6,16.3,3.8,1.6,.5);
  put(rcase(1.4,.9,.8),12.2,-13.9,.2); put(rcase(.9,.7,.7),10.9,-14.1,-.1); blob(scene,11.6,-14,3.2,1.6,.5);
  const pal=grp(scene,-17.3,0,-12.9,.4); for(const z of [-.5,0,.5]) pal.add(at(box(1.2,.03,.14,M.wood),0,.13,z*1.6*.55)); for(const x of [-.5,0,.5]) pal.add(at(box(.1,.1,1.0,M.woodD),x,.06,0)); for(let i=0;i<7;i++) pal.add(at(box(1.2,.025,.1,M.wood),0,.155,-.45+i*.15));
  const cb=std(0xc2a57e,.85); pal.add(at(box(.55,.45,.45,cb),-.3,.4,-.22)); pal.add(at(box(.55,.45,.45,cb),.28,.4,-.22)); pal.add(at(box(.55,.45,.45,cb),-.3,.4,.25)); pal.add(at(box(.6,.4,.5,cb),.05,.83,0)); blob(scene,-17.3,-12.9,1.9,1.7,.5);
  const lad=grp(scene,-17.9,0,-2.4,1.2); for(const s of [-1,1]){ for(const sx of [-.24,.24]) lad.add(rod(V(sx,2.3,0),V(sx*1.15,0,s*.62),.02,M.alu)); } for(let i=1;i<7;i++) lad.add(rod(V(-.26,i*.33,.62*(1-i*.33/2.3)),V(.26,i*.33,.62*(1-i*.33/2.3)),.014,M.alu)); lad.add(at(box(.6,.04,.2,M.alu),0,2.3,0)); blob(scene,-17.9,-2.4,1.5,1.5,.4);
  for(const [x,z,r] of [[9.3,-13.6,.3],[10.0,-12.9,1.4]]){ const c=tripod(2.2,.45,M.steel); put(c,x,z,r); c.add(rod(V(0,2.15,0),V(.9,2.5,.2),.012,M.steel)); c.add(at(cyl(.05,.05,.06,M.steel,12),0,2.15,0)); }
  put(plant(1.9),17.9,-9.8); put(plant(1.5),-18.1,9.6); put(plant(1.6),-17.9,-7.2,.6); put(plant(1.7),-3.4,16.3,1); put(plant(1.3),10.9,-14.3,2); for(const [x,z] of [[17.9,-9.8],[-18.1,9],[-17.9,-7.2]]) blob(scene,x,z,1.2,1.2,.4);
  const cable=(pts,r=.02,m=M.rubber)=>{ const c=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>V(p[0],.025,p[1]))),80,r,6),m); c.castShadow=true; scene.add(c); };
  cable([[15.4,1.6],[17.6,-1],[17.9,-4.5],[16.6,-7.2],[15.4,-8.6]]); cable([[15.2,1.5],[17.3,-.8],[17.6,-4.6],[16.2,-7.5]],.016,std(0x2f6fb5,.6));
  cable([[-1.2,-12.6],[1.5,-13.6],[4.5,-13.4],[5.2,-12.3]]); cable([[9,-12],[11,-11.6],[12.6,-10.2],[13.2,-9]],.018);
  cable([[-15.2,2.2],[-17.6,0],[-17.8,-4],[-16.4,-8.4]],.018); cable([[2.6,13.6],[5,14.6],[8.6,14.8],[11,13]],.018); }

/* ---------- beat clock + WebAudio ---------- */
const BPM=118, BEAT=60/BPM;
let pOrigin=performance.now()/1000, ac=null, aOrigin=0, nextBeat=0, sound=false;
const now=()=> sound? ac.currentTime-aOrigin : performance.now()/1000-pOrigin;
function kick(t){ const o=ac.createOscillator(), g=ac.createGain(); o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(42,t+.16);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.9,t+.005); g.gain.exponentialRampToValueAtTime(.0001,t+.42); o.connect(g).connect(ac.destination); o.start(t); o.stop(t+.45); }
function hat(t){ const len=.05*ac.sampleRate, b=ac.createBuffer(1,len,ac.sampleRate), d=b.getChannelData(0); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
  const s=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); s.buffer=b; f.type='highpass'; f.frequency.value=7000; g.gain.value=.12; s.connect(f).connect(g).connect(ac.destination); s.start(t); }
setInterval(()=>{ if(!sound) return; while(aOrigin+nextBeat*BEAT<ac.currentTime+.12){ const t=aOrigin+nextBeat*BEAT; kick(t); hat(t+BEAT/2); nextBeat++; } },25);
const sndBtn=document.getElementById('snd');
sndBtn.addEventListener('click', async()=>{ try{
  if(!ac) ac=new (window.AudioContext||window.webkitAudioContext)();
  if(!sound){ await ac.resume(); const t=performance.now()/1000-pOrigin; aOrigin=ac.currentTime-t; nextBeat=Math.ceil(t/BEAT); sound=true; sndBtn.classList.add('on'); sndBtn.querySelector('span').textContent='Sound off'; }
  else{ const t=now(); pOrigin=performance.now()/1000-t; sound=false; sndBtn.classList.remove('on'); sndBtn.querySelector('span').textContent='Sound on'; }
}catch(e){ sndBtn.style.display='none'; } });

/* ---------- seven areas around the studio; each faces the spot the camera stops at ---------- */
const Q=Math.PI/2;
const LAYOUT=[ // x, z, facing (local +z points at the camera), bay number, bay name
  [-13.8,  5.0,  Q,        '01','DISPLAYS'],
  [-14.0,-10.0,  Q/2,      '02','PROJECTION'],
  [ -3.2,-10.4,  0,        '03','AUDIO'],
  [  6.6,-10.4,  0,        '04','LIGHTING & STAGING'],
  [ 13.8, -7.6, -Q*2/3,    '05','LIVE VIDEO'],
  [ 14.2,  3.6, -Q,        '06','NETWORKS'],
  [  0.0, 12.0,  Math.PI,  '07','INTERACTIVE'],
  [-13.4, 12.6,  Q,        '08','FABRICATION'],
];
const zones=[], labels=[], updaters=[];
for(const [x,z,ry,num,name] of LAYOUT){
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=ry; scene.add(g);
  // bay marking in floor tape instead of a ring
  const t=still(1,1,(c,W,H)=>{ c.clearRect(0,0,W,H); c.strokeStyle='rgba(38,36,33,.5)'; c.lineWidth=7; const m=10,L=110;
    for(const [cx,cy,sx,sy] of [[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]]){ c.beginPath(); c.moveTo(cx+sx*L,cy); c.lineTo(cx,cy); c.lineTo(cx,cy+sy*L); c.stroke(); }
    },1024);
  const fl=plane(7.8,7.8,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})); fl.rotation.x=-Math.PI/2; fl.position.y=.012; g.add(fl);
  const nt=still(4.4,.8,(c,W,H)=>{ c.clearRect(0,0,W,H); c.fillStyle='rgba(30,28,26,.78)'; c.textAlign='right'; c.textBaseline='alphabetic'; c.font=`500 ${H*.3}px "Geist Mono", monospace`; c.fillText(name,W-6,H*.8); const tw=c.measureText(name).width; c.font=`600 ${H*.95}px Geist, sans-serif`; c.fillText(num,W-6-tw-H*.2,H*.84); },220);
  const nm=plane(4.4,.8,new THREE.MeshBasicMaterial({map:nt,transparent:true,depthWrite:false})); nm.rotation.x=-Math.PI/2; nm.position.set(.3,.014,3.05); nm.renderOrder=2; g.add(nm);
  zones.push({g,pos:V(x,0,z),dir:V(Math.sin(ry),0,Math.cos(ry))});
}
buildDock();
const labAt={}, lab=(name,obj,h)=>{ labAt[name]={obj,h}; };   // hardware names are not pinned on the picture; the services page uses them to aim the camera

function ledPanel(){ const g=new THREE.Group(); g.add(rbox(.496,.496,.08,M.shell,.012)); g.add(at(plane(.47,.47,M.gloss),0,0,.041)); g.add(at(box(.3,.2,.03,M.shell),0,0,-.055)); for(const sx of [-.19,.19]) g.add(rod(V(sx,-.08,-.06),V(sx,.08,-.06),.009,M.steel)); return g; }
function ledWall(cols,rows,draw,{support=true,res=36,heights=null}={}){ const g=new THREE.Group(), W=cols*.5, H=rows*.5, y0=support?.12:0, hs=heights||Array(cols).fill(rows);
  const ct=ctex(cols*res,rows*res); ct.draw=draw; animTex.push(ct);
  const ov=still(1,1,(c,S)=>{ c.clearRect(0,0,S,S); c.fillStyle='rgba(0,0,0,.3)'; for(let y=0;y<S;y+=4) for(let x=0;x<S;x+=4){ c.fillRect(x+3,y,1,4); c.fillRect(x,y+3,4,1); } c.strokeStyle='rgba(0,0,0,.6)'; c.lineWidth=1.5; c.strokeRect(0,0,S,S); },128);
  const pos=[],uv=[],uv2=[],idx=[], geos=[], hg=[]; let n=0;
  for(let c=0;c<cols;c++) for(let r=0;r<hs[c];r++){ const x0=-W/2+c*.5, y=y0+r*.5; pos.push(x0,y,0,x0+.5,y,0,x0+.5,y+.5,0,x0,y+.5,0); uv.push(c/cols,r/rows,(c+1)/cols,r/rows,(c+1)/cols,(r+1)/rows,c/cols,(r+1)/rows); uv2.push(0,0,1,0,1,1,0,1); idx.push(n,n+1,n+2,n,n+2,n+3); n+=4;
    const b=new RoundedBoxGeometry(.496,.496,.08,2,.012); b.translate(x0+.25,y+.25,0); geos.push(b); const p=new THREE.BoxGeometry(.3,.2,.03).toNonIndexed(); p.translate(x0+.25,y+.25,-.055); geos.push(p); for(const sx of [-.19,.19]) hg.push(rodGeo(V(x0+.25+sx,y+.17,-.06),V(x0+.25+sx,y+.33,-.06),.009,6)); }
  const quad=(u)=>{ const q=new THREE.BufferGeometry(); q.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); q.setAttribute('uv',new THREE.Float32BufferAttribute(u,2)); q.setIndex(idx); return q; };
  g.add(at(new THREE.Mesh(quad(uv),new THREE.MeshBasicMaterial({map:ct.t,toneMapped:false})),0,0,.041)); const om=new THREE.Mesh(quad(uv2),new THREE.MeshBasicMaterial({map:ov,transparent:true,depthWrite:false})); om.position.z=.043; g.add(om);
  g.add(mesh(mergeGeometries(geos),M.shell)); g.add(new THREE.Mesh(mergeGeometries(hg),M.steel));
  if(support){ g.add(at(box(W+.06,.1,.14,M.blk),0,.06,0)); const np=Math.max(2,Math.round(cols/2.5)); for(let i=0;i<np;i++){ const x=-W/2+.5+i*(W-1)/(np-1); g.add(at(truss(H+.1,'y',.22),x,.02,-.22)); g.add(rod(V(x,H*.72,-.33),V(x,.04,-1.35),.022,M.alu)); g.add(rod(V(x,H*.3,-.33),V(x,.04,-.85),.016,M.alu)); g.add(at(box(.3,.03,1.6,M.alu),x,.015,-.65)); g.add(at(rbox(.36,.11,.28,M.rubber,.04),x,.085,-1.25)); g.add(at(rbox(.36,.11,.28,M.rubber,.04),x,.2,-1.25)); }
    for(const y of [1.2,H-.3]) g.add(rod(V(-W/2+.5,y,-.22),V(W/2-.5,y,-.22),.02,M.alu)); }
  g.userData={W,H,y0}; return g; }

/* 1 · Displays */
{ const g=zones[0].g;
  // OLED on a rolling floor stand
  const tv=grp(g,3.55,0,1.75,-.42); tv.add(at(rbox(1.3,.05,.62,M.blk,.02),0,.115,0)); for(const sx of [-.58,.58]) for(const sz of [-.25,.25]) tv.add(at(caster(),sx,0,sz));
  for(const sx of [-.3,.3]) tv.add(at(rbox(.07,1.6,.05,M.blk,.015),sx,.93,-.12)); tv.add(at(rbox(.8,.36,.04,M.blk,.01),0,1.62,-.09)); tv.add(at(rbox(.9,.03,.34,M.blk,.01),0,.72,-.05));
  tv.add(at(rbox(2.5,1.43,.028,M.gloss,.012),0,1.88,0));
  tv.add(at(screen(2.46,1.385,(c,W,H,t)=>{ c.fillStyle='#050507'; c.fillRect(0,0,W,H); c.globalCompositeOperation='lighter';
      const cols=['232,137,45','60,170,200','200,70,140','240,220,180']; for(let k=0;k<4;k++){ const x=W*(.5+.38*Math.sin(t*.25+k*1.7)), y=H*(.5+.34*Math.cos(t*.31+k*2.3)), r=H*(.5+.12*Math.sin(t*.5+k)); const gr=c.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,`rgba(${cols[k]},.85)`); gr.addColorStop(1,`rgba(${cols[k]},0)`); c.fillStyle=gr; c.fillRect(0,0,W,H); }
      c.globalCompositeOperation='source-over'; c.fillStyle='rgba(255,255,255,.92)'; c.font=`600 ${H*.085}px Geist, sans-serif`; c.fillText('OLED 77″',W*.045,H*.9); c.font=`400 ${H*.045}px Geist Mono, monospace`; c.fillStyle='rgba(255,255,255,.6)'; c.fillText('4K · HDR',W*.86,H*.9); },300),0,1.88,.0148));
  blob(g,3.55,1.75,3.2,1.5);
  // LED video wall going up on ground support, crew at work (the LED side of the house runs through ledwall.nyc)
  const lw=ledWall(10,6,(c,W,H,t)=>{ c.fillStyle='#05060a'; c.fillRect(0,0,W,H); c.globalCompositeOperation='lighter'; const cols=['70,200,255','120,110,255','255,255,255','255,110,150','60,120,255'];
      for(let k=0;k<5;k++){ const x=W*(((.12+k*.21+.06*Math.sin(t*.35+k*1.3))%1+1)%1), w=W*(.07+.035*Math.sin(t*.6+k*2.1)), gr=c.createLinearGradient(x-w,0,x+w,0); gr.addColorStop(0,`rgba(${cols[k]},0)`); gr.addColorStop(.5,`rgba(${cols[k]},.85)`); gr.addColorStop(1,`rgba(${cols[k]},0)`); c.fillStyle=gr; c.fillRect(x-w,0,2*w,H); }
      const y=H*(.5+.3*Math.sin(t*.5)), gh=c.createLinearGradient(0,y-H*.12,0,y+H*.12); gh.addColorStop(0,'rgba(255,255,255,0)'); gh.addColorStop(.5,'rgba(255,255,255,.35)'); gh.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=gh; c.fillRect(0,y-H*.12,W,H*.24); c.globalCompositeOperation='source-over'; },{heights:[6,6,6,6,6,5,3,2,1,0]});
  lw.position.set(-.3,0,-2.3); lw.rotation.y=-.5; g.add(lw);
  // one tech seats the next panel, one carries panels over from the case, one checks the processor
  const setP=ledPanel(); lw.add(setP); crew(lw,{x:.75,z:.66,ry:Math.PI,arms:(sd)=>V(sd*.2,.6,.78)});
  updaters.push(t=>{ const u=(t%4)/4, k=u<.55?ease(u/.55):1; setP.position.set(.75,.12+.25+3*.5,.36-.32*k); setP.rotation.z=(1-k)*.12; });
  const A=V(3.5,0,1.35), Bp=V(1.3,0,.95), carry=ledPanel(), wk=crew(lw,{clip:'walk',arms:(sd)=>V(sd*.26,-.5,.82)}); carry.position.set(0,1.02,.46); carry.rotation.x=-.15; wk.add(carry);
  updaters.push(t=>{ const T=4.2, u=(t%T)/T, go=u<.5, k=go?u*2:2-u*2; wk.position.lerpVectors(A,Bp,k); wk.rotation.y=Math.atan2(Bp.x-A.x,Bp.z-A.z)+(go?0:Math.PI); carry.visible=go; });
  const pc=rcase(1.1,.62,.7); pc.position.set(4.3,0,1.5); pc.rotation.y=.3; lw.add(pc); for(let i=0;i<4;i++){ const p=ledPanel(); p.position.set(4.05+i*.09,.99,1.45+i*.02); p.rotation.set(0,1.87,0); lw.add(p); }
  const opS=grp(lw,-1.3,0,1.45,Math.PI); opS.add(tripod(1.0,.42)); opS.add(at(rbox(.5,.02,.36,M.blk,.008),0,1.01,0)); const ol=laptop((c,W,H,t)=>{ c.fillStyle='#101114'; c.fillRect(0,0,W,H); for(let i=0;i<10;i++) for(let j=0;j<6;j++){ c.fillStyle=(j<[6,6,6,6,6,5,3,2,1,0][i])?'#52d38a':'#2a2d33'; c.fillRect(6+i*(W-12)/10,H-10-(j+1)*(H-20)/6,(W-12)/10-2,(H-20)/6-2); } }); ol.position.y=1.02; opS.add(ol);
  crew(lw,{x:-1.3,z:2.05,ry:Math.PI,arms:(sd)=>V(sd*.1,-.35,.9)});
  blob(g,-.2,-2.5,6,3,.4);
  // touchscreen totem
  const k=grp(g,-2.7,0,3.0,.35); k.add(at(rbox(.8,.035,.6,M.steel,.012),0,.018,0)); const kb=new THREE.Group(); kb.rotation.x=-.07; k.add(kb);
  kb.add(at(rbox(.86,1.98,.075,M.blk,.03),0,1.03,0)); kb.add(at(rbox(.8,1.36,.01,M.gloss,.004),0,1.26,.036));
  kb.add(at(screen(.76,1.32,(c,W,H,t)=>{ c.fillStyle='#f3f0ea'; c.fillRect(0,0,W,H); c.fillStyle='#1a1a18'; c.fillRect(0,0,W,H*.09); c.fillStyle='#fff'; c.font=`600 ${W*.06}px Geist, sans-serif`; c.fillText('Welcome',W*.07,H*.06);
      const sel=Math.floor(t*.7)%6; for(let i=0;i<6;i++){ const x=W*(.07+(i%2)*.45), y=H*(.14+Math.floor(i/2)*.22); c.fillStyle=i===sel?'#1a1a18':'#e2ddd2'; c.beginPath(); c.roundRect(x,y,W*.41,H*.19,10); c.fill(); c.fillStyle=i===sel?'#fff':'#55524c'; c.fillRect(x+W*.04,y+H*.13,W*.2,H*.012); c.beginPath(); c.arc(x+W*.08,y+H*.06,W*.035,0,7); c.fill(); }
      const p=(t*.7)%1, sx=W*(.07+(sel%2)*.45)+W*.2, sy=H*(.14+Math.floor(sel/2)*.22)+H*.1; c.strokeStyle=`rgba(255,255,255,${1-p})`; c.lineWidth=3; c.beginPath(); c.arc(sx,sy,W*.03+p*W*.12,0,7); c.stroke();
      c.fillStyle='#d8d3c8'; c.fillRect(0,H*.9,W,H*.1); c.fillStyle='#8a867e'; for(let i=0;i<3;i++){ c.beginPath(); c.arc(W*(.25+i*.25),H*.95,W*.025,0,7); c.fill(); } },360),0,1.26,.0425));
  kb.add(at(cyl(.012,.012,.006,M.lens,12),0,1.97,.04)); blob(g,-2.7,3.0,1.4,1.1);
  // transparent display case
  const td=grp(g,-3.7,0,-.2,.5); td.add(at(rbox(1.05,.85,.72,M.white,.03),0,.425,0)); td.add(at(box(1.0,1.02,.68,M.glass),0,1.36,0));
  for(const sx of [-.5,.5]) for(const sz of [-.34,.34]) td.add(at(box(.022,1.04,.022,M.alu),sx,1.37,sz)); td.add(at(box(1.05,.03,.72,M.alu),0,1.895,0));
  const prod=mesh(new THREE.TorusKnotGeometry(.17,.055,120,16),std(0xe9e4da,.16,1,{envMapIntensity:1.4})); prod.position.set(0,1.3,0); td.add(prod); td.add(at(cyl(.2,.22,.06,M.blk,24),0,.88,0));
  const s3=screen(.96,.98,(c,W,H,t)=>{ c.clearRect(0,0,W,H); c.fillStyle='rgba(255,255,255,.95)'; c.font=`600 ${H*.085}px Geist, sans-serif`; c.fillText('New drop',W*.08,H*.15); c.font=`400 ${H*.05}px Geist Mono, monospace`; c.fillText('Edition 0'+(1+Math.floor(t*.4)%9),W*.08,H*.91);
      c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=2; const a=t*.8; c.beginPath(); c.arc(W*.5,H*.52,H*.3,a,a+4.2); c.stroke(); c.beginPath(); c.arc(W*.5,H*.52,H*.34,-a*.7,-a*.7+2.2); c.stroke(); },220);
  s3.material.transparent=true; td.add(at(s3,0,1.36,.345)); updaters.push(t=>{ prod.rotation.y=t*.7; prod.rotation.x=t*.25; }); blob(g,-3.7,-.2,1.7,1.3); lab('Transparent display',td,2.05);
  // playback station: screens on truss, players in a rack, operator podium
  const pb=grp(g,3.9,0,-2.3,-.55); for(const sx of [-1.5,1.5]){ pb.add(at(truss(3.4,'y'),sx,.02,0)); pb.add(at(box(.5,.02,.5,M.alu),sx,.01,0)); } pb.add(at(truss(3.29,'x'),-1.645,3.42+.145,0));
  for(let i=0;i<3;i++){ const m=monitor(.84,.48,(c,W,H,t)=>{ const y=((t*.12+i*.33)%1)*H*1.6; c.fillStyle='#f1eee8'; c.fillRect(0,0,W,H); c.save(); c.translate(0,-y); for(let k=0;k<4;k++){ const yy=k*H*.7; c.fillStyle='#1a1a18'; c.fillRect(W*.07,yy+H*.1,W*.5,H*.07); c.fillStyle='#c9c3b7'; c.fillRect(W*.07,yy+H*.24,W*.86,H*.36); c.fillStyle=['#3ca0b8','#1a1a18','#c85a8a','#E8892D'][(k+i)%4]; c.fillRect(W*.6,yy+H*.28,W*.28,H*.28); } c.restore(); c.fillStyle='#1a1a18'; c.fillRect(0,0,W,H*.06); },{stand:false,res:140}); m.position.set(-.92+i*.92,2.9,.19); pb.add(m); pb.add(at(box(.05,.1,.16,M.steel),-.92+i*.92,3.18,.08)); }
  const pod=grp(pb,-.55,0,1.15,.3); pod.add(at(rbox(.62,1.05,.5,M.blk,.03),0,.525,0)); const im=monitor(.56,.33,(c,W,H,t)=>{ c.fillStyle='#16171b'; c.fillRect(0,0,W,H); for(let i=0;i<6;i++){ c.fillStyle=i===Math.floor(t)%6?'#7fd4e6':'#33363d'; c.fillRect(W*.06+i*W*.15,H*.12,W*.12,H*.2); } c.fillStyle='#2a2d33'; c.fillRect(W*.06,H*.42,W*.88,H*.46); c.fillStyle='#7fd4e6'; c.fillRect(W*.06,H*.42,W*.88*((t*.1)%1),H*.05); },{res:120}); im.position.set(0,1.42,-.05); pod.add(im); pod.add(at(rbox(.36,.012,.12,M.alu,.004),0,1.058,.12));
  blob(g,3.9,-2.3,3.6,1.6,.4); lab('Playback station',pb,3.85);
}

/* 2 · Projection */
const mapMat=new THREE.ShaderMaterial({ uniforms:{t:{value:0},kick:{value:0}},
  vertexShader:`attribute vec3 bary; attribute vec2 fid; attribute vec3 cen; varying vec3 vB; varying vec2 vF; varying vec3 vN; varying vec3 vP; varying vec3 vC;
    void main(){ vB=bary; vF=fid; vN=normalize(mat3(modelMatrix)*normal); vP=(modelMatrix*vec4(position,1.)).xyz; vC=(modelMatrix*vec4(cen,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vP,1.); }`,
  fragmentShader:`uniform float t; uniform float kick; varying vec3 vB; varying vec2 vF; varying vec3 vN; varying vec3 vP; varying vec3 vC;
    float h(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
    float n(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
    float fbm(vec3 p){ return n(p)*.55+n(p*2.1)*.3+n(p*4.3)*.15; }
    vec3 pal(float x){ x=fract(x); vec3 a=vec3(.03,.05,.18), b=vec3(.1,.28,.95), c=vec3(.2,.88,1.), d=vec3(1.,.98,.94), e=vec3(1.,.4,.62);
      return x<.32?mix(a,b,x/.32): x<.56?mix(b,c,(x-.32)/.24): x<.64?mix(c,d,(x-.56)/.08): x<.8?mix(d,e,(x-.64)/.16): mix(e,a,(x-.8)/.2); }
    void main(){ float d=min(vB.x,min(vB.y,vB.z)); float edge=1.-smoothstep(0.,fwidth(d)*1.5,d); float glow=1.-smoothstep(0.,.16,d);
      float lit=dot(normalize(vN),normalize(vec3(.35,.7,.6)))*.5+.5;
      float fl=fbm(vC*.9+vec3(0.,-t*.22,t*.08)); float sm=fbm(vP*1.5+vec3(t*.1,-t*.3,0.));
      vec3 col=pal(fl*.9+sm*.35+vC.y*.16-t*.06);
      float iso=abs(fract(vP.y*3.4-t*.4+fl*2.5)-.5); col=mix(col,vec3(1.),(1.-smoothstep(0.,.03,iso))*.4);
      float sweep=smoothstep(.0,.06,fract(vC.y*.28-t*.12+vF.x*.05))*(1.-smoothstep(.1,.3,fract(vC.y*.28-t*.12+vF.x*.05))); col+=vec3(.12,.2,.3)*sweep;
      float tw=step(.9,fract(vF.x*13.7+floor(t*1.9667)*.37)); col=mix(col,vec3(1.),tw*(.35+.5*kick));
      col*=.5+.45*lit; col+=vec3(.4,.65,1.)*glow*.12; col=mix(col,vec3(1.),edge*.85); gl_FragColor=vec4(col,1.); }` });
function crystal(r,h,seed){ let s=seed; const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
  const g=new THREE.IcosahedronGeometry(1,1), p=g.attributes.position, n=p.count, f=new Map(), bary=new Float32Array(n*3), fid=new Float32Array(n*2), cen=new Float32Array(n*3);
  for(let i=0;i<n;i++){ let x=p.getX(i), y=p.getY(i), z=p.getZ(i); const k=[x,y,z].map(v=>v.toFixed(3)).join(); if(!f.has(k)) f.set(k,.72+rnd()*.5); const m=f.get(k); x*=m; z*=m; y=y*(.9+.2*m); y=Math.max(y,-.55); const tp=1-.42*Math.max(0,y); p.setXYZ(i,x*tp*r,(y+.55)/1.55*h,z*tp*r); }
  for(let i=0;i<n;i+=3){ const rr=rnd(), cy=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3; const cx=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3, cz=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3; for(let k=0;k<3;k++){ bary[(i+k)*3+k]=1; fid[(i+k)*2]=rr; fid[(i+k)*2+1]=cy; cen.set([cx,cy,cz],(i+k)*3); } }
  g.setAttribute('bary',new THREE.BufferAttribute(bary,3)); g.setAttribute('fid',new THREE.BufferAttribute(fid,2)); g.setAttribute('cen',new THREE.BufferAttribute(cen,3)); g.computeVertexNormals(); const m=new THREE.Mesh(g,mapMat); m.castShadow=true; return m; }
function projector(){ const g=new THREE.Group(); g.add(rbox(.62,.25,.74,M.white,.045)); g.add(at(rbox(.56,.19,.02,M.blk,.008),0,0,.365));
  g.add(rot(at(cyl(.105,.105,.14,M.blk,28),.1,0,.42),Q)); g.add(rot(at(cyl(.088,.088,.02,M.lens,28),.1,0,.492),Q)); const r=mesh(new THREE.TorusGeometry(.105,.012,8,28),M.alu); r.position.set(.1,0,.48); g.add(r);
  for(let i=0;i<6;i++) g.add(at(box(.008,.14,.3,M.blk),-.312,0,-.14+i*.05)); g.add(at(cyl(.008,.008,.004,ledMat(0x52d38a,1.2),8),-.2,.05,.376)); for(const sx of [-.24,.24]) for(const sz of [-.28,.28]) g.add(at(cyl(.025,.02,.03,M.rubber,10),sx,-.14,sz)); return g; }
{ const g=zones[1].g;
  const sc=grp(g,.1,0,-1.0); sc.add(at(cyl(2.3,2.36,.1,M.white,64),0,.05,.25));
  for(const [x,z,r,h,sd,ry,tz] of [[0,-.1,1.2,2.9,11,.3,.03],[-1.3,.75,.78,1.7,29,1.4,-.06],[1.2,.95,.62,1.15,47,2.2,.08],[.15,1.55,.36,.55,83,.7,-.04]]){ const c=crystal(r,h,sd); c.position.set(x,.1,z); c.rotation.set(0,ry,tz); sc.add(c); }
  blob(g,.1,-.75,5.4,5,.45); lab('Mapping surface',sc,2.9);
  // double-stacked projectors on a stand, aimed at the sculpture
  const pj=grp(g,-2.3,0,2.6); pj.add(tripod(1.15,.6)); pj.add(at(rbox(.7,.03,.8,M.blk,.01),0,1.16,0));
  const head=grp(pj,0,1.33,0); const p1=projector(); head.add(p1); const p2=projector(); p2.position.y=.31; head.add(p2);
  for(const sx of [-.34,.34]) for(const sz of [-.34,.34]) head.add(at(box(.022,.62,.022,M.alu),sx,.15,sz)); head.add(at(box(.7,.022,.7,M.alu),0,.47,0));
  g.updateMatrixWorld(true); head.lookAt(g.localToWorld(V(.1,1.35,-1.0)));
  const from=V(-2.3,1.5,2.6), to=V(.1,1.35,-1.0), dir=new THREE.Vector3().subVectors(to,from), Lb=dir.length();
  const bm=beam(Lb,1.75,beamMat(0xeef4ff,.22)); bm.position.copy(from).addScaledVector(dir,.5); bm.quaternion.setFromUnitVectors(V(0,-1,0),dir.clone().normalize()); g.add(bm);
  blob(g,-2.3,2.6,1.5,1.5); lab('Projectors',pj,2.0);
  // home cinema: console, ultra-short-throw projector, framed screen
  const ht=grp(g,2.9,0,.9,-.6); ht.add(at(rbox(1.9,.36,.44,M.wood,.02),0,.4,0)); for(const sx of [-.8,.8]) for(const sz of [-.15,.15]) ht.add(at(cyl(.02,.014,.22,M.blk,10),sx,.11,sz)); for(const sx of [-.47,.47]) ht.add(at(box(.9,.3,.01,M.woodD),sx,.4,.222));
  ht.add(at(rbox(.52,.11,.34,M.white,.03),0,.635,.02)); ht.add(at(rbox(.2,.012,.05,M.lens,.004),0,.693,-.08));
  for(const sx of [-.9,.9]) ht.add(at(box(.04,1.2,.04,M.blk),sx,.6,-.3)); ht.add(at(rbox(2.24,1.28,.03,M.blk,.008),0,1.72,-.3));
  ht.add(at(screen(2.18,1.22,(c,W,H,t)=>{ const gr=c.createLinearGradient(0,0,W,H), k=(Math.sin(t*.3)+1)/2; gr.addColorStop(0,`hsl(${205+k*20},45%,${22+k*8}%)`); gr.addColorStop(.6,`hsl(${25+k*10},60%,${45+k*8}%)`); gr.addColorStop(1,'#120c0a'); c.fillStyle=gr; c.fillRect(0,0,W,H);
      c.fillStyle='rgba(255,236,200,.85)'; c.beginPath(); c.arc(W*(.3+.4*((t*.02)%1)),H*.42,H*.09,0,7); c.fill(); c.fillStyle='#0c0a0a'; c.beginPath(); c.moveTo(0,H*.86); for(let x=0;x<=W;x+=W/12) c.lineTo(x,H*(.66+.1*Math.sin(x*.02+1.3))); c.lineTo(W,H); c.lineTo(0,H); c.fill(); c.fillStyle='#000'; c.fillRect(0,0,W,H*.1); c.fillRect(0,H*.9,W,H*.1); },200),0,1.72,-.283));
  const ub=beam(1.25,.95,beamMat(0xfff1dc,.16)); ub.position.set(0,1.2,-.16); ub.rotation.x=Math.PI+.12; ht.add(ub);
  blob(g,2.75,.9,2.4,1.4); lab('Home cinema',ht,2.45);
}

/* 3 · Audio */
const cones=[];
const grilleT=still(4,1,(g,W,H)=>{ g.fillStyle='#17171a'; g.fillRect(0,0,W,H); g.fillStyle='#0d0d0f'; g.fillRect(W*.4,0,W*.2,H); g.fillStyle='#34343a'; for(let y=5;y<H;y+=6) for(let x=((y/6)%2)*3+3;x<W;x+=6){ g.beginPath(); g.arc(x,y,1.5,0,7); g.fill(); } g.fillStyle='#55555c'; g.fillRect(W*.47,H*.84,W*.06,H*.07); },128);
const grille=std(0xffffff,.55,.4,{map:grilleT});
function arrayCab(W=1.16,H=.31,D=.6){ const g=new THREE.Group(); g.add(at(rbox(W,H,D,M.shell,.025),0,-H/2,-D/2)); g.add(at(plane(W*.95,H*.86,grille),0,-H/2,.003));
  for(const s of [-1,1]){ g.add(at(box(.016,H*.92,D*.5,M.steel),s*(W/2+.009),-H/2,-D*.3)); g.add(at(cyl(.012,.012,.02,M.alu,8),s*(W/2+.02),-H*.2,-D*.14)); }
  g.add(at(box(.035,.016,.008,ledMat()),W*.43,-H*.86,.006)); return g; }
function lineArray(n){ const root=new THREE.Group(); root.add(at(rbox(1.28,.08,.7,M.steel,.01),0,.04,-.3)); let parent=root;
  for(let i=0;i<n;i++){ const piv=new THREE.Group(); piv.rotation.x=THREE.MathUtils.degToRad(i<2?.6:1.4+i*.95); parent.add(piv); piv.add(arrayCab()); const nx=new THREE.Group(); nx.position.y=-.32; piv.add(nx); parent=nx; } return root; }
function driver(r){ const g=new THREE.Group(), prof=[]; for(let i=0;i<=12;i++){ const t=i/12; prof.push(new THREE.Vector2(r*.2+t*r*.8,-.11*Math.pow(1-t,1.4))); }
  const c=mesh(new THREE.LatheGeometry(prof,44),std(0x131314,.85)); c.rotation.x=Q; g.add(c); g.add(mesh(new THREE.TorusGeometry(r*1.02,r*.075,10,44),M.rubber)); const cap=sph(r*.24,std(0x101011,.5),20,10); cap.scale.z=.4; cap.position.z=-.085; g.add(cap); cones.push(c,cap); cap.userData.z0=-.085; return g; }
function sub(W=1.2,H=.62,D=.76){ const g=new THREE.Group(); g.add(at(rbox(W,H,D,M.shell,.03),0,H/2,-D/2)); g.add(at(rbox(W*.95,H*.9,.02,std(0x18181a,.8),.01),0,H/2,-.004));
  for(const s of [-1,1]){ g.add(at(driver(.225),s*W*.24,H/2,.012)); g.add(at(rbox(.02,.2,.12,M.rubber,.008),s*(W/2+.004),H*.62,-D/2)); } g.add(at(box(.1,.02,.006,M.alu),0,.05,.009)); g.add(at(box(.035,.016,.008,ledMat()),W*.43,.05,.009)); return g; }
{ const g=zones[2].g;
  const gp=grp(g,0,0,-1.4); for(const sx of [-1.75,1.75]){ gp.add(at(truss(5.3,'y'),sx,.02,0)); gp.add(at(box(.7,.025,.7,M.alu),sx,.012,0)); } gp.add(at(truss(3.79,'x'),-1.895,5.32+.145,0));
  for(const sx of [-.42,.42]){ gp.add(at(rbox(.16,.3,.2,std(0x2d2d30,.5,.5),.03),sx,5.05,.2)); gp.add(rod(V(sx,4.9,.2),V(sx,4.62,.25),.008,M.steel)); }
  const hang=lineArray(8); hang.position.set(0,4.6,.55); gp.add(hang); lab('Line array',hang,-1.3);
  const ss=grp(g,0,0,.05); for(let c=0;c<2;c++) for(let r=0;r<2;r++) ss.add(at(sub(),(c-.5)*1.23,r*.63,0)); blob(g,0,-.4,3.4,2.2,.55); lab('Subwoofers',ss,1.5);
  // point-source speaker on a stand
  const ps=grp(g,-3.2,0,-1.7,.4); ps.add(tripod(1.35,.55)); const cabn=grp(ps,0,1.72,0); cabn.add(rbox(.42,.7,.4,M.shell,.045)); cabn.add(at(plane(.38,.64,grille),0,0,.203)); cabn.add(at(box(.035,.016,.008,ledMat()),.14,-.3,.205)); blob(g,-3.2,-1.7,1.4,1.4,.4);
  // wireless mic on a boom stand
  const mic=grp(g,1.3,0,1.85); mic.add(tripod(1.4,.42)); mic.add(rod(V(0,1.4,0),V(.0,1.58,.34),.011,M.steel)); mic.add(at(cyl(.03,.03,.05,M.blk,12),0,1.4,0));
  const mh=grp(mic,0,1.6,.36); mh.rotation.x=1.05; mh.add(cyl(.019,.024,.2,std(0x2a2a2d,.35,.7),16)); mh.add(at(sph(.036,std(0x9c9a95,.35,.9),18,12),0,.125,0)); mh.add(at(cyl(.025,.025,.012,M.alu,16),0,.095,0)); mh.add(at(cyl(.017,.012,.05,M.blk,12),0,-.125,0)); mh.add(at(cyl(.0195,.0195,.012,ledMat(0x52d38a,1),12),0,-.06,0));
  blob(g,1.3,1.85,1.1,1.1,.35); lab('Wireless mic',mic,1.85);
  // FOH console on a road case
  const foh=grp(g,-3.0,0,.1,.5); foh.add(rcase(1.15,.72,.62)); const surf=grp(foh,0,.86,0); surf.rotation.x=.2; const ct=still(1.1,.6,(c,W,H)=>{ c.fillStyle='#1d1d20'; c.fillRect(0,0,W,H); c.fillStyle='#0b1016'; c.fillRect(W*.34,H*.06,W*.32,H*.36); c.fillStyle='#7fd4e6'; for(let i=0;i<12;i++) c.fillRect(W*.36+i*W*.024,H*.38-(8+((i*29)%40)),W*.016,8+((i*29)%40));
      for(let i=0;i<16;i++){ const x=W*.05+i*W*.058; c.fillStyle='#2e2e33'; c.fillRect(x,H*.52,W*.012,H*.4); c.fillStyle='#d9d5cc'; c.fillRect(x-W*.008,H*(.58+((i*13)%7)*.04),W*.028,H*.05); for(let k=0;k<3;k++){ c.fillStyle=k===0&&i%3===0?'#E8892D':'#55555c'; c.beginPath(); c.arc(x+W*.006,H*(.1+k*.12),W*.011,0,7); if(i<5||i>10) c.fill(); } } },256);
  surf.add(rbox(1.12,.09,.62,M.blk,.02)); const top=plane(1.08,.58,std(0xffffff,.5,.2,{map:ct})); top.rotation.x=-Q; top.position.y=.046; surf.add(top); blob(g,-3.0,.1,1.7,1.3); lab('Mixing console',foh,1.2);
  // directional speaker: hung over one spot, a tight column of sound that only the person under it hears
  const ds=grp(g,3.5,0,-.75); ds.add(tripod(2.95,.62)); ds.add(rod(V(0,2.95,0),V(-.9,2.9,1.3),.016,M.steel)); ds.add(at(cyl(.035,.035,.07,M.blk,12),0,2.95,0));
  const dpos=V(2.6,2.86,.55), dp=grp(g,dpos.x,dpos.y,dpos.z); dp.rotation.x=Q;
  const dt=still(1,1,(c,W,H)=>{ c.fillStyle='#ecebe6'; c.fillRect(0,0,W,H); c.fillStyle='#b9b6ae'; for(let y=8;y<H;y+=12) for(let x=8+((y/12)%2)*6;x<W;x+=12){ c.beginPath(); c.arc(x,y,3.2,0,7); c.fill(); } },128);
  dp.add(rbox(.62,.62,.035,M.white,.012)); dp.add(at(plane(.56,.56,std(0xffffff,.5,.1,{map:dt})),0,0,.019)); dp.add(at(rbox(.12,.12,.07,M.blk,.02),0,0,-.05));
  const colM=beamMat(0xffffff,.2), column=new THREE.Mesh(new THREE.CylinderGeometry(.3,.46,2.8,48,1,true),colM); column.position.set(dpos.x,1.43,dpos.z); column.renderOrder=3; g.add(column);
  const rings=[]; for(let i=0;i<7;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(.3,.009,6,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false})); r.rotation.x=Q; r.renderOrder=4; g.add(r); rings.push(r); }
  updaters.push(t=>rings.forEach((r,i)=>{ const p=(t*.45+i/7)%1; r.position.set(dpos.x,2.8-p*2.75,dpos.z); r.scale.setScalar(1+p*.52); r.material.opacity=Math.sin(p*Math.PI)*.9; }));
  const spot=still(1,1,(c,W,H)=>{ c.clearRect(0,0,W,H); const gr=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.36); gr.addColorStop(0,'rgba(255,255,255,.75)'); gr.addColorStop(1,'rgba(255,255,255,.25)'); c.fillStyle=gr; c.beginPath(); c.arc(W/2,H/2,W*.36,0,7); c.fill(); c.setLineDash([10,9]); c.strokeStyle='rgba(38,36,33,.6)'; c.lineWidth=3; c.beginPath(); c.arc(W/2,H/2,W*.4,0,7); c.stroke(); },256);
  const sp2=plane(1.5,1.5,new THREE.MeshBasicMaterial({map:spot,transparent:true,depthWrite:false})); sp2.rotation.x=-Q; sp2.position.set(dpos.x,.02,dpos.z); sp2.renderOrder=2; g.add(sp2);
  crew(g,{x:dpos.x,z:dpos.z,ry:.4,logo:false,outfit:{top:0x4f5a3c,inner:0xe4e0d6,bottom:0x333d4e,shoes:0xe9e5dc,cap:0,skin:0xf0d9c6,hair:0x3a2a1c}});
  blob(g,3.5,-.75,1.3,1.3,.35); lab('Directional speaker',ds,2.75);
  // haptic sofa
  const so=grp(g,-2.35,0,2.35,.5); const sf=sofa(1.95,M.fabric,0x4b4844); so.add(sf); so.add(at(rbox(.3,.09,.22,M.blk,.02),1.15,.045,-.2)); so.add(at(cyl(.006,.006,.004,ledMat(),8),1.15,.092,-.12)); updaters.push((t,env)=>{ sf.position.y=env*.018; sf.rotation.z=env*.004*Math.sin(t*40); }); blob(g,-2.35,2.35,2.6,1.6); lab('Haptic sofa',so,1.15);
}

/* 4 · Lighting & staging */
{ const g=zones[3].g;
  const dk=grp(g,0,0,-.1); for(let i=0;i<3;i++) for(let j=0;j<2;j++){ const m=grp(dk,-1.4+i*1.4,0,-.6+j*1.2); m.add(at(box(1.39,.075,1.19,M.alu),0,.585,0)); m.add(at(box(1.35,.02,1.15,M.deck),0,.632,0)); }
  for(const x of [-2.05,-.7,.7,2.05]) for(const z of [-1.15,0,1.15]){ dk.add(at(cyl(.028,.028,.55,M.alu,10),x,.275,z)); dk.add(at(cyl(.045,.045,.02,M.rubber,10),x,.01,z)); }
  const skM=std(0x151516,1); dk.add(at(plane(4.2,.55,skM),0,.275,1.201)); for(const s of [-1,1]){ const p=plane(2.4,.55,skM); p.rotation.y=s*Q; p.position.set(s*2.101,.275,0); dk.add(p); }
  for(let i=0;i<2;i++){ dk.add(at(box(.9,.04,.3,M.deck),2.56,.2+i*.21,.3-i*.0)); } dk.add(at(box(.9,.04,.3,M.deck),2.56,.2,.62)); for(const z of [.18,.74]) dk.add(at(box(.86,.38,.03,M.alu),2.56,.2,z));
  // lectern + monitor wedge on the deck
  const lec=grp(dk,-.2,.645,.15); lec.add(at(rbox(.5,1.0,.36,M.wood,.02),0,.5,0)); const lt=rbox(.6,.03,.46,M.woodD,.01); lt.rotation.x=.3; lt.position.set(0,1.04,.02); lec.add(lt); lec.add(rod(V(.12,1.05,-.08),V(.1,1.32,.06),.006,M.blk)); lec.add(at(sph(.02,M.blk,10,8),.1,1.33,.07));
  const wd=grp(dk,1.2,.645,.75,.2); const wg=mesh(new THREE.CylinderGeometry(.24,.24,.5,3,1),M.shell); wg.rotation.set(0,0,Q); wg.rotation.x=.5; wg.position.y=.13; wd.add(wg);
  blob(g,0,-.1,5.2,3.2,.5); lab('Stage deck',dk,.95);
  const arch=grp(g,0,0,-.95); for(const sx of [-2.45,2.45]){ arch.add(at(truss(5.2,'y'),sx,.02,0)); arch.add(at(box(.7,.025,.7,M.alu),sx,.012,0)); } const tb=truss(5.19,'x'); arch.add(at(tb,-2.595,5.22+.145,0)); lab('Truss',arch,5.75);
  const bd=ledWall(8,5,(c,W,H,t)=>{ const gr=c.createLinearGradient(0,0,W,H); gr.addColorStop(0,'#0b1430'); gr.addColorStop(1,'#1c2f6e'); c.fillStyle=gr; c.fillRect(0,0,W,H); c.globalCompositeOperation='lighter';
      for(let k=0;k<3;k++){ const x=W*(.5+.3*Math.sin(t*.3+k*2.1)), y=H*(.5+.25*Math.cos(t*.25+k*1.7)), r=H*(.55+.1*Math.sin(t*.6+k)), g2=c.createRadialGradient(x,y,0,x,y,r); g2.addColorStop(0,['rgba(90,200,255,.55)','rgba(140,120,255,.5)','rgba(255,255,255,.3)'][k]); g2.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g2; c.fillRect(0,0,W,H); }
      c.globalCompositeOperation='source-over'; c.strokeStyle='rgba(255,255,255,.85)'; c.lineWidth=H*.012; c.beginPath(); c.arc(W*.5,H*.5,H*.26,t*.5,t*.5+4.6); c.stroke(); c.beginPath(); c.arc(W*.5,H*.5,H*.33,-t*.35,-t*.35+2.4); c.stroke(); },{support:false});
  bd.position.set(0,.66,-1.17); g.add(bd); for(const sx of [-1.6,1.6]) g.add(rod(V(sx,3.16,-1.17),V(sx,5.2,-.98),.01,M.steel));
  // COB fixtures with reflectors, hung on the truss
  const fx=[];
  for(const [x,c] of [[-1.5,0xfff6ea],[0,0xffffff],[1.5,0xfff6ea]]){ const f=grp(arch,x,5.0,.12); f.add(at(rbox(.07,.12,.1,M.blk,.02),0,.12,0)); f.add(at(cyl(.012,.012,.14,M.steel,8),0,.02,0));
    const yoke=new THREE.Group(); f.add(yoke); yoke.add(at(box(.36,.025,.04,M.blk),0,-.05,0)); for(const s of [-1,1]) yoke.add(at(box(.025,.26,.04,M.blk),s*.18,-.18,0));
    const b=grp(yoke,0,-.28,0); b.rotation.x=-.5; b.add(cyl(.11,.11,.3,std(0x202023,.45,.4),24)); for(let i=0;i<5;i++) b.add(at(cyl(.125,.125,.012,M.blk,24),0,.02+i*.03,0)); b.add(at(rbox(.14,.1,.2,M.blk,.02),0,.2,0));
    const prof=[]; for(let i=0;i<=8;i++){ const t=i/8; prof.push(new THREE.Vector2(.07+t*.12,-.15-t*.2)); } const rf=mesh(new THREE.LatheGeometry(prof,28),std(0x1a1a1c,.4,.5,{side:THREE.DoubleSide})); b.add(rf);
    const em=new THREE.Mesh(new THREE.CircleGeometry(.075,24),glow(c)); em.rotation.x=Q; em.position.y=-.17; b.add(em);
    const sp=new THREE.SpotLight(c,34,10,.4,.7,1.5); sp.position.set(0,-.3,0); b.add(sp); const tg=new THREE.Object3D(); tg.position.set(0,-5,0); b.add(tg); sp.target=tg;
    const bm=beam(4.6,1.15,beamMat(0xffffff,.42)); bm.position.y=-2.62; b.add(bm); fx.push({b,sp,bm,ph:x}); }
  updaters.push((t,env)=>fx.forEach(o=>{ o.b.rotation.z=Math.sin(t*.5+o.ph)*.2; o.sp.intensity=28+env*20; o.bm.material.uniforms.op.value=.32+env*.16; }));
  lab('Aputure lights',fx[1].b,.55);
  // light dome on a stand
  const st=grp(g,-2.95,0,1.9,.7); st.add(tripod(2.25,.62)); const hd=grp(st,0,2.3,0); hd.rotation.x=.45; hd.add(rot(cyl(.1,.1,.26,std(0x202023,.45,.4),20),Q)); hd.add(at(rbox(.12,.1,.18,M.blk,.02),0,.13,-.02));
  const dome=mesh(new THREE.SphereGeometry(.52,36,18,0,Math.PI*2,0,Math.PI*.5),std(0x141415,.8,0,{side:THREE.DoubleSide})); dome.rotation.x=-Q; dome.scale.y=.85; dome.position.z=.54; hd.add(dome);
  const face=new THREE.Mesh(new THREE.CircleGeometry(.515,36),glow(0xfff4e2)); face.position.z=.535; hd.add(face); const dl=new THREE.PointLight(0xffe9cc,14,7,2); dl.position.z=1.0; hd.add(dl);
  blob(g,-2.95,1.9,1.6,1.6,.4); lab('Light dome',st,3.0);
  // tube lights + lighting desk
  const tubes=[]; for(const [x,z] of [[-2.3,1.0],[2.3,1.05]]){ const tb2=grp(g,x,0,z); tb2.add(at(cyl(.12,.12,.02,M.blk,18),0,.01,0)); const tm=glow(0xfff0dc); tb2.add(at(cyl(.022,.022,1.2,tm,12),0,.66,0)); tb2.add(at(cyl(.026,.026,.06,M.blk,12),0,.05,0)); tb2.add(at(cyl(.026,.026,.04,M.blk,12),0,1.28,0)); tubes.push(tm); }
  updaters.push((t)=>tubes.forEach((m,i)=>m.color.setHSL(.09+.03*Math.sin(t*.6+i*2),.6,.82+.08*Math.sin(t*2.4+i))));
  const ld=grp(g,3.15,0,2.2,-.5); ld.add(tripod(.95,.45)); const lc=grp(ld,0,1.0,0); lc.rotation.x=.25; lc.add(rbox(.62,.05,.4,M.blk,.015)); const lct=still(1.5,1,(c,W,H)=>{ c.fillStyle='#1c1c1f'; c.fillRect(0,0,W,H); c.fillStyle='#0c1118'; c.fillRect(W*.05,H*.06,W*.5,H*.36); for(let i=0;i<8;i++){ c.fillStyle=`hsl(${i*42},60%,55%)`; c.fillRect(W*.07+i*W*.058,H*.1,W*.045,H*.12); } for(let i=0;i<10;i++){ c.fillStyle='#2e2e33'; c.fillRect(W*.07+i*W*.09,H*.52,W*.014,H*.4); c.fillStyle='#d9d5cc'; c.fillRect(W*.058+i*W*.09,H*(.56+((i*17)%6)*.05),W*.038,H*.06); } },128);
  const lp=plane(.58,.37,std(0xffffff,.5,.2,{map:lct})); lp.rotation.x=-Q; lp.position.y=.026; lc.add(lp); blob(g,3.15,2.2,1.2,1.2,.35); lab('Lighting desk',ld,1.3);
}

/* 5 · Live video & visuals */
{ const g=zones[4].g;
  // cinema-style camera on a fluid-head tripod
  const cam=grp(g,-1.5,0,1.9,.55); cam.add(tripod(1.3,.62)); cam.add(at(cyl(.07,.085,.1,M.blk,18),0,1.34,0)); cam.add(rod(V(.05,1.36,-.02),V(.42,1.2,-.42),.011,M.blk)); cam.add(at(cyl(.02,.02,.12,M.rubber,10),.45,1.18,-.45));
  const ch=grp(cam,0,1.5,0); ch.add(rbox(.2,.2,.34,std(0x202023,.5,.3),.03)); ch.add(rot(at(cyl(.075,.085,.2,M.blk,24),0,0,.27),Q)); ch.add(rot(at(cyl(.07,.07,.012,M.lens,24),0,0,.372),Q)); ch.add(at(rbox(.24,.17,.1,M.blk,.012),0,.0,.42));
  ch.add(at(rbox(.04,.03,.24,M.blk,.012),0,.17,0)); for(const sz of [-.1,.1]) ch.add(at(box(.03,.07,.025,M.blk),0,.135,sz)); ch.add(at(rbox(.14,.16,.09,std(0x2c2c30,.6),.02),0,0,-.215));
  const vf=monitor(.17,.1,(c,W,H,t)=>{ c.fillStyle='#20242b'; c.fillRect(0,0,W,H); c.fillStyle='#c9a47b'; c.fillRect(W*.3,H*.3,W*.4,H*.5); c.strokeStyle='#fff'; c.strokeRect(W*.1,H*.1,W*.8,H*.8); c.fillStyle='#e23a2e'; if(Math.floor(t*2)%2) c.fillRect(W*.82,H*.08,W*.1,H*.14); },{stand:false,res:64}); vf.position.set(-.16,.14,-.02); vf.rotation.y=Math.PI-.3; ch.add(vf);
  const tally=ledMat(0xe23a2e,1.4); ch.add(at(rbox(.05,.025,.03,tally,.008),0,.115,.16)); updaters.push(t=>{ ch.rotation.y=Math.sin(t*.4)*.28; ch.rotation.x=Math.sin(t*.27)*.05; });
  blob(g,-1.5,1.9,1.6,1.6,.4); lab('Camera',cam,1.95);
  // PTZ camera on a tall stand
  const ptz=grp(g,-3.05,0,-.5,.8); ptz.add(tripod(2.1,.5)); ptz.add(at(cyl(.09,.1,.07,M.white,20),0,2.13,0)); const ph=grp(ptz,0,2.27,0); ph.add(sph(.1,M.white,24,16)); ph.add(rot(at(cyl(.045,.045,.06,M.lens,18),0,0,.085),Q)); updaters.push(t=>{ ph.rotation.y=.4+Math.sin(t*.3)*.6; }); blob(g,-3.05,-.5,1.3,1.3,.35); lab('PTZ camera',ptz,2.55);
  // production desk
  const desk=grp(g,.75,0,-.25); desk.add(at(rbox(3.1,.045,1.05,M.wood,.012),0,.76,0)); for(const sx of [-1.45,1.45]){ desk.add(at(box(.04,.74,.04,M.blk),sx,.37,-.45)); desk.add(at(box(.04,.74,.04,M.blk),sx,.37,.45)); desk.add(at(box(.04,.04,.94,M.blk),sx,.03,0)); } desk.add(at(box(2.9,.3,.02,M.blk),0,.56,-.47));
  // switcher with lit buttons and T-bar
  const swt=still(2.2,1,(c,W,H)=>{ c.fillStyle='#1d1d20'; c.fillRect(0,0,W,H); for(let r=0;r<3;r++) for(let i=0;i<12;i++){ c.fillStyle=(r===0&&i===2)?'#e23a2e':(r===1&&i===5)?'#3ccf6e':(r===2&&i%4===0)?'#d9d5cc':'#3a3a40'; c.beginPath(); c.roundRect(W*.05+i*W*.058,H*.14+r*H*.27,W*.044,H*.2,3); c.fill(); } c.fillStyle='#101012'; c.fillRect(W*.8,H*.12,W*.16,H*.76); c.fillStyle='#2c2c30'; c.fillRect(W*.87,H*.18,W*.02,H*.64); },128);
  const sw=grp(desk,-.55,.8,.22); sw.rotation.x=.14; sw.add(rbox(.95,.07,.44,M.blk,.018)); const swp=plane(.9,.4,std(0xffffff,.45,.2,{map:swt})); swp.rotation.x=-Q; swp.position.y=.036; sw.add(swp); const tbar=grp(sw,.335,.04,0); tbar.add(at(rbox(.05,.09,.03,M.alu,.01),0,.045,0)); updaters.push(t=>{ tbar.position.z=.12*Math.sin(t*.5); }); lab('Switcher',sw,.3);
  // multiview + two VJ screens
  const mv=monitor(1.1,.62,(c,W,H,t)=>{ c.fillStyle='#0c0c0e'; c.fillRect(0,0,W,H); const cells=[[0,0,.5,.5,'#3ccf6e'],[.5,0,.5,.5,'#e23a2e'],[0,.5,.25,.25],[.25,.5,.25,.25],[.5,.5,.25,.25],[.75,.5,.25,.25],[0,.75,.25,.25],[.25,.75,.25,.25],[.5,.75,.25,.25],[.75,.75,.25,.25]];
      cells.forEach(([x,y,w,h,b],i)=>{ const gr=c.createLinearGradient(x*W,y*H,(x+w)*W,(y+h)*H); gr.addColorStop(0,`hsl(${(i*47+t*8)%360},35%,${28+8*Math.sin(t+i)}%)`); gr.addColorStop(1,`hsl(${(i*47+60)%360},40%,16%)`); c.fillStyle=gr; c.fillRect(x*W+2,y*H+2,w*W-4,h*H-4); c.fillStyle='rgba(255,236,210,.8)'; c.beginPath(); c.arc((x+w*(.3+.4*((t*.05+i*.13)%1)))*W,(y+h*.5)*H,h*H*.14,0,7); c.fill(); if(b){ c.strokeStyle=b; c.lineWidth=3; c.strokeRect(x*W+3,y*H+3,w*W-6,h*H-6); } }); },{res:180}); mv.position.set(-.55,1.35,-.3); desk.add(mv); lab('Multiview',mv,.42);
  const vj=[]; for(let i=0;i<2;i++){ const m=monitor(.78,.45,(c,W,H,t)=>{ c.fillStyle='#101013'; c.fillRect(0,0,W,H);
      if(i===0){ for(let r=0;r<3;r++) for(let k=0;k<7;k++){ const on=(Math.floor(t*BPM/60)+r*3)%7===k; c.fillStyle=on?'#7fd4e6':`hsl(${(k*40+r*70)%360},35%,${24+r*4}%)`; c.fillRect(W*.03+k*W*.137,H*.05+r*H*.2,W*.125,H*.17); } const n=40; for(let k=0;k<n;k++){ const v=(Math.sin(t*3+k*.5)*.5+.5)*(.35+.65*Math.exp(-((t%BEAT))*6)); c.fillStyle=k%6===0?'#fff':'#7fd4e6'; c.fillRect(W*.03+k*W*.0235,H*.95-v*H*.28,W*.016,v*H*.28); } }
      else { c.save(); c.translate(W/2,H/2); for(let k=0;k<14;k++){ c.rotate(Math.PI/7+t*.04); c.strokeStyle=`hsla(${(k*26+t*30)%360},80%,65%,.8)`; c.lineWidth=2; const s=H*.16*(1+.35*Math.sin(t*2+k*.4))+k*H*.012; c.strokeRect(-s,-s,2*s,2*s); } c.restore(); } },{res:150}); m.position.set(.5+i*.86,1.24,-.32); m.rotation.y=-.12-i*.16; desk.add(m); vj.push(m); }
  lab('VJ / Resolume',vj[1],.38);
  const lp=laptop((c,W,H,t)=>{ c.fillStyle='#14151a'; c.fillRect(0,0,W,H); for(let i=0;i<4;i++){ c.fillStyle=`hsl(${i*80+t*20},60%,55%)`; c.fillRect(6+i*W*.24,8,W*.2,H*.3); } c.fillStyle='#2a2d33'; c.fillRect(6,H*.5,W-12,H*.4); }); lp.position.set(.55,.785,.2); lp.rotation.y=-.2; desk.add(lp);
  const pad=grp(desk,1.15,.79,.25,-.25); pad.add(rbox(.3,.03,.3,M.blk,.01)); const pads=[]; for(let r=0;r<4;r++) for(let k=0;k<4;k++){ const pm=glow(0x2a2d33); const p=plane(.055,.055,pm); p.rotation.x=-Q; p.position.set(-.105+k*.07,.017,-.105+r*.07); pad.add(p); pads.push(pm); }
  updaters.push(t=>{ const b=Math.floor(t*BPM/30); pads.forEach((m,i)=>m.color.set((i*7+b)%16<3?0x7fd4e6:(i*5+b)%16===0?0xffffff:0x2a2d33)); });
  desk.add(at(rbox(.44,.18,.4,M.blk,.02),-1.1,.2,0)); for(let i=0;i<4;i++) desk.add(at(cyl(.008,.008,.004,ledMat(i%2?0x52d38a:AMBER,1),8),-1.25+i*.05,.24,.201));
  const hp=mesh(new THREE.TorusGeometry(.085,.012,8,24,Math.PI),M.blk); hp.position.set(1.3,.87,-.1); hp.rotation.y=.4; desk.add(hp); for(const s of [-1,1]) desk.add(at(rot(cyl(.04,.04,.03,M.blk,14),0,0,Q),1.3+s*.078,.86,-.1+s*.033));
  const chr=chair(); chr.position.set(.1,0,.95); chr.rotation.y=Math.PI+.25; desk.add(chr);
  blob(g,.75,-.25,3.8,1.9,.5); blob(g,.85,.7,1,1,.4);
}

/* 6 · Networks & computers */
{ const g=zones[5].g;
  // access point on a stand, with coverage pulsing out
  const ap=grp(g,-1.7,0,.5); ap.add(tripod(2.9,.6)); const disc=mesh(new THREE.CylinderGeometry(.19,.21,.045,40),M.white); disc.position.y=2.95; ap.add(disc); const ringL=mesh(new THREE.TorusGeometry(.105,.008,8,40),glow(0x4aa3ff)); ringL.rotation.x=Q; ringL.position.y=2.974; ap.add(ringL);
  const waves=[]; for(let i=0;i<3;i++){ const w=new THREE.Mesh(new THREE.SphereGeometry(1,40,14,0,Math.PI*2,Math.PI*.5,Math.PI*.42),new THREE.MeshBasicMaterial({color:0x6fb4ff,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false})); w.position.y=2.9; w.renderOrder=3; ap.add(w); waves.push(w); }
  updaters.push(t=>waves.forEach((w,i)=>{ const p=(t*.3+i/3)%1; w.scale.setScalar(.3+p*2.0); w.material.opacity=(1-p)*.09; })); blob(g,-1.7,.5,1.5,1.5,.35); lab('UniFi access point',disc,.3);
  // touring network rack
  const rk=grp(g,.55,0,-1.2,.12); rk.add(at(rbox(.72,1.5,.8,M.shell,.015),0,.86,0)); for(const sx of [-1,1]) for(const sz of [-1,1]){ rk.add(at(box(.035,1.52,.035,M.alu),sx*.355,.86,sz*.395)); rk.add(at(caster(),sx*.28,0,sz*.3)); } for(const y of [.11,1.61]) for(const sz of [-.395,.395]) rk.add(at(box(.74,.035,.035,M.alu),0,y,sz));
  rk.add(at(box(.62,1.38,.02,std(0x0e0e10,.6)),0,.86,.385)); const blink=[];
  const swT=still(4,.4,(c,W,H)=>{ c.fillStyle='#d9d7d2'; c.fillRect(0,0,W,H); c.fillStyle='#1a1a1d'; for(let r=0;r<2;r++) for(let i=0;i<24;i++) c.fillRect(W*.05+i*W*.032+Math.floor(i/6)*W*.015,H*.16+r*H*.4,W*.024,H*.3); c.fillStyle='#4aa3ff'; c.fillRect(W*.925,H*.3,W*.04,H*.4); },64);
  const ppT=still(4,.4,(c,W,H)=>{ c.fillStyle='#1a1a1d'; c.fillRect(0,0,W,H); c.fillStyle='#3a3a40'; for(let i=0;i<24;i++) c.fillRect(W*.04+i*W*.038,H*.25,W*.028,H*.5); },64);
  const units=[['sw',1.42],['pp',1.31],['sw',1.2],['pp',1.09],['sw',.98]]; for(const [k,y] of units){ rk.add(at(rbox(.6,.085,.02,std(0xffffff,.5,.2,{map:k==='sw'?swT:ppT}),.004),0,y,.396)); if(k==='sw') for(let p=0;p<10;p++){ const d=plane(.012,.008,glow(p%4?0x52d38a:0xffc04a)); d.position.set(-.25+p*.05,y+.03,.408); rk.add(d); blink.push(d); } }
  const pc=[0x2f6fb5,0xf1efea,0xe0b93a,0x2f6fb5,0xf1efea,0x2f6fb5]; for(let i=0;i<6;i++){ const x0=-.24+i*.09, c2=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(x0,1.42-(i%2)*.22,.41),V(x0+.02,1.33-(i%2)*.22,.47),V(x0-.03,1.31-(i%3)*.11,.41)]),12,.006,5),std(pc[i],.6)); rk.add(c2); }
  rk.add(at(rbox(.6,.26,.02,std(0x202023,.5,.4),.006),0,.72,.396)); rk.add(at(plane(.12,.06,glow(0x52d38a)),-.18,.76,.408)); rk.add(at(rbox(.6,.16,.02,std(0x2a2a2e,.5,.3),.006),0,.48,.396)); for(let i=0;i<8;i++) rk.add(at(box(.5,.006,.004,M.blk),0,.26+i*.016,.399));
  updaters.push(t=>blink.forEach((d,i)=>{ d.visible=Math.sin(t*11+i*1.9)>-.3; })); blob(g,.55,-1.2,1.3,1.4,.55); lab('Network rack',rk,1.85);
  const reel=grp(g,-.6,0,-1.9,.3); for(const s of [-1,1]) reel.add(rot(at(cyl(.3,.3,.02,M.blk,28),s*.13,.3,0),0,0,Q)); reel.add(rot(at(cyl(.2,.2,.25,std(0x2f6fb5,.6),24),0,.3,0),0,0,Q)); blob(g,-.6,-1.9,.9,.9,.4);
  // workstation: glass-side tower, two monitors, desk, chair
  const ws=grp(g,2.3,0,.75,-.5); ws.add(at(rbox(2.0,.04,.85,M.wood,.012),0,.75,0)); for(const sx of [-.92,.92]){ ws.add(at(box(.04,.73,.04,M.blk),sx,.365,-.36)); ws.add(at(box(.04,.73,.04,M.blk),sx,.365,.36)); ws.add(at(box(.04,.04,.76,M.blk),sx,.03,0)); }
  const tw=grp(ws,.72,.77,-.05); tw.add(at(rbox(.23,.5,.5,M.blk,.015),0,.25,0)); tw.add(at(box(.006,.44,.44,std(0xbfd8e0,.05,.1,{transparent:true,opacity:.28,envMapIntensity:1.5})),-.118,.25,0));
  const fans=[]; for(let i=0;i<3;i++){ const f=mesh(new THREE.TorusGeometry(.055,.009,8,24),glow(COOL)); f.rotation.y=Q; f.position.set(-.1,.4-i*.14,.17); tw.add(f); fans.push(f); const hub=mesh(new THREE.CylinderGeometry(.045,.045,.01,3),M.blk); hub.rotation.z=Q; hub.position.copy(f.position); tw.add(hub); fans.push(hub); }
  tw.add(at(rbox(.04,.11,.3,std(0x2b2b2f,.4,.6),.01),-.08,.2,-.08)); tw.add(at(box(.004,.012,.26,glow(COOL)),-.103,.2,-.08)); updaters.push(t=>fans.forEach((f,i)=>{ if(i%2) f.rotation.x=t*9; }));
  const nodes=(c,W,H,t)=>{ c.fillStyle='#17181c'; c.fillRect(0,0,W,H); const N=[[.1,.25],[.32,.18],[.32,.5],[.56,.32],[.56,.68],[.8,.45]]; c.strokeStyle='#5a5f6a'; c.lineWidth=1.5; [[0,1],[0,2],[1,3],[2,3],[2,4],[3,5],[4,5]].forEach(([a,b])=>{ c.beginPath(); c.moveTo((N[a][0]+.13)*W,(N[a][1]+.07)*H); c.bezierCurveTo((N[a][0]+.2)*W,(N[a][1]+.07)*H,(N[b][0]-.07)*W,(N[b][1]+.07)*H,N[b][0]*W,(N[b][1]+.07)*H); c.stroke(); });
    N.forEach(([x,y],i)=>{ c.fillStyle='#2b2e36'; c.fillRect(x*W,y*H,W*.13,H*.14); c.fillStyle=`hsl(${(i*55+t*25)%360},55%,55%)`; c.fillRect(x*W+2,y*H+2,W*.13-4,H*.085); }); };
  const view3d=(c,W,H,t)=>{ c.fillStyle='#1b1d22'; c.fillRect(0,0,W,H); c.strokeStyle='#343844'; c.lineWidth=1; for(let i=0;i<9;i++){ c.beginPath(); c.moveTo(0,H*(.55+i*.06)); c.lineTo(W,H*(.55+i*.06)); c.moveTo(W*(i/8),H*.55); c.lineTo(W*(-.5+i/4),H); c.stroke(); } c.strokeStyle='#7fd4e6'; c.lineWidth=1.5; c.save(); c.translate(W*.5,H*.45); const a=t*.6, s=H*.2, P=[]; for(let i=0;i<8;i++){ const x=(i&1?1:-1),y=(i&2?1:-1),z=(i&4?1:-1), xr=x*Math.cos(a)-z*Math.sin(a), zr=x*Math.sin(a)+z*Math.cos(a); P.push([xr*s*(1+zr*.15),(y+zr*.2)*s*.8]); } [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]].forEach(([p,q])=>{ c.beginPath(); c.moveTo(P[p][0],P[p][1]); c.lineTo(P[q][0],P[q][1]); c.stroke(); }); c.restore(); c.fillStyle='#2b2e36'; c.fillRect(0,0,W,H*.08); };
  const m1=monitor(.72,.42,nodes,{res:150}); m1.position.set(-.38,1.2,-.22); m1.rotation.y=.16; ws.add(m1); const m2=monitor(.72,.42,view3d,{res:150}); m2.position.set(.33,1.2,-.24); m2.rotation.y=-.14; ws.add(m2);
  ws.add(at(rbox(.42,.016,.14,M.blk,.006),-.1,.778,.18)); ws.add(at(rbox(.06,.025,.1,M.blk,.012),.3,.782,.2)); const chr=chair(); chr.position.set(-.1,0,.85); chr.rotation.y=Math.PI-.3; ws.add(chr);
  blob(g,2.3,.75,2.6,1.6,.5); lab('Workstation',tw,.75);
}

/* 7 · Interactive & tracking */
{ const g=zones[6].g, J=[];
  // reactive LED floor
  const fl=ctex(256,256); const flm=plane(4.6,4.6,new THREE.MeshBasicMaterial({map:fl.t,toneMapped:false})); flm.rotation.x=-Q; flm.position.set(0,.045,.15); g.add(flm); g.add(at(box(4.72,.04,4.72,M.blk),0,.02,.15)); lab('Interactive floor',flm,.2);
  // mannequin performer
  const skin=std(0xd9d4ca,.62), jm=std(0x8f8a80,.5,.3);
  const cap=(r,l)=>mesh(new THREE.CapsuleGeometry(r,l,8,16),skin);
  const fig=grp(g,0,.05,.15); const hips=grp(fig,0,1.0,0); hips.add(at(rbox(.3,.18,.19,skin,.08),0,.04,0)); const chest=mesh(new THREE.CapsuleGeometry(.16,.26,8,18),skin); chest.scale.set(1.12,1,.8); chest.position.y=.4; hips.add(chest); hips.add(at(cyl(.045,.05,.1,skin,14),0,.69,0));
  const head=sph(.115,skin,24,18); head.scale.set(.92,1.12,1); head.position.y=.84; hips.add(head);
  const limb=(parent,x,y,len,r)=>{ const j=grp(parent,x,y,0); j.add(sph(r*1.25,jm,14,10)); j.add(at(cap(r,len),0,-len/2-r*.9,0)); const end=grp(j,0,-len-r*1.8,0); return {j,end}; };
  const lu=limb(hips,-.27,.58,.24,.05), ll=limb(lu.end,0,0,.22,.043), ru=limb(hips,.27,.58,.24,.05), rl=limb(ru.end,0,0,.22,.043);
  const lt=limb(hips,-.1,-.04,.36,.068), ls=limb(lt.end,0,0,.36,.052), rt=limb(hips,.1,-.04,.36,.068), rs=limb(rt.end,0,0,.36,.052);
  for(const e of [ll.end,rl.end]){ const h=sph(.05,skin,12,10); h.scale.set(.8,1.2,.5); h.position.y=-.03; e.add(h); } for(const e of [ls.end,rs.end]){ e.add(at(rbox(.09,.06,.22,skin,.028),0,-.01,.06)); }
  let joints=[head,lu.j,lu.end,ll.end,ru.j,ru.end,rl.end,hips,lt.end,ls.end,rt.end,rs.end], live=null;
  const mkM=glow(0xffffff), markers=joints.map(()=>{ const s=new THREE.Mesh(new THREE.SphereGeometry(.022,10,8),mkM); g.add(s); J.push(s.position); return s; });
  const bones=[[0,7],[1,4],[1,2],[2,3],[4,5],[5,6],[7,8],[8,9],[7,10],[10,11],[1,7],[4,7]], tmp=new THREE.Vector3();
  updaters.push((t,env)=>{ hips.position.y=1.0+env*.035; hips.rotation.y=Math.sin(t*.7)*.55; hips.position.x=Math.sin(t*.35)*.5; hips.position.z=Math.cos(t*.28)*.35;
    lu.j.rotation.z=-1.9+Math.sin(t*2.2)*.6; ll.j.rotation.z=-.6+Math.sin(t*2.2+1)*.5; ru.j.rotation.z=1.2+Math.sin(t*1.7)*.7; rl.j.rotation.z=.5+Math.sin(t*1.7+.6)*.4;
    lt.j.rotation.x=Math.sin(t*2)*.28; rt.j.rotation.x=-Math.sin(t*2)*.28; ls.j.rotation.x=Math.max(0,-Math.sin(t*2))*.45; rs.j.rotation.x=Math.max(0,Math.sin(t*2))*.45;
    (live||fig).updateMatrixWorld(true); joints.forEach((j,i)=>{ j.getWorldPosition(tmp); g.worldToLocal(tmp); markers[i].position.copy(tmp); });
    // floor reacts under the performer
    const c=fl.g, W=256; c.fillStyle='rgba(14,16,20,.35)'; c.fillRect(0,0,W,W); const pts=[J[9],J[11],J[3],J[6],J[7]];
    for(let y=0;y<24;y++) for(let x=0;x<24;x++){ const wx=(x+.5)/24*4.6-2.3, wz=(y+.5)/24*4.6-2.3+.15; let d=9; for(const p of pts) d=Math.min(d,Math.hypot(wx-p.x,wz-p.z)); const k=Math.max(0,1-d/1.1), r=1.2+k*k*4.6; c.fillStyle=k>.02?`rgba(${150+105*k|0},${225+30*k|0},255,${.25+k*.75})`:'rgba(90,100,116,.5)'; c.beginPath(); c.arc((x+.5)*W/24,(y+.5)*W/24,r,0,7); c.fill(); } fl.t.needsUpdate=true; });
  want('Michelle').then(a=>{ if(!a) return; const o=skClone(a.scene), mm=std(0xdad5cb,.58); o.traverse(n=>{ if(n.isMesh){ n.material=mm; n.frustumCulled=false; } }); o.position.set(0,.05,.15); g.add(o);
    const mx=new THREE.AnimationMixer(o); mx.clipAction(a.animations.find(c=>/samba/i.test(c.name))||a.animations[0]).play(); mixers.push(mx);
    const find=(k)=>{ let r=null; o.traverse(n=>{ if(!r&&n.isBone&&n.name.replace(/^mixamorig:?/,'')===k) r=n; }); return r; };
    const B=['Head','LeftArm','LeftForeArm','LeftHand','RightArm','RightForeArm','RightHand','Hips','LeftLeg','LeftFoot','RightLeg','RightFoot'].map(find);
    if(B.every(Boolean)){ joints=B; live=o; fig.visible=false; markers.forEach(m=>m.visible=false); } else g.remove(o); });
  lab('Body tracking',fig,2.05);
  // tracking cameras on stands, aimed at the performer
  let first=true; for(const [x,z] of [[-2.95,-2.3],[2.95,-2.3],[-3.3,2.3],[3.35,2.2]]){ const p=grp(g,x,0,z); p.add(tripod(2.55,.5)); const c=grp(p,0,2.62,0); c.add(rbox(.2,.13,.15,std(0x202023,.5,.4),.02)); const ir=mesh(new THREE.TorusGeometry(.05,.011,8,24),ledMat(0x8f7dff,1.4)); ir.position.z=.078; c.add(ir); c.add(rot(at(cyl(.03,.03,.02,M.lens,16),0,0,.08),Q));
    g.updateMatrixWorld(true); c.lookAt(g.localToWorld(V(0,1.1,.15))); blob(g,x,z,1.2,1.2,.3); if(first){ lab('Tracking cameras',c,.32); first=false; } }
  // live avatar on a display
  const sd=grp(g,0,0,-2.75); sd.add(at(rbox(1.5,.05,.6,M.blk,.02),0,.115,0)); for(const sx of [-.66,.66]) for(const sz of [-.24,.24]) sd.add(at(caster(),sx,0,sz)); for(const sx of [-.35,.35]) sd.add(at(rbox(.07,1.5,.05,M.blk,.015),sx,.88,-.1));
  sd.add(at(rbox(2.9,1.66,.03,M.gloss,.012),0,1.95,0)); sd.add(at(screen(2.86,1.62,(c,W,H,t)=>{ c.fillStyle='rgba(8,10,16,.28)'; c.fillRect(0,0,W,H); const px=(p)=>[W*.5+p.x*H*.36, H*.93-p.y*H*.38];
      c.strokeStyle='rgba(120,140,170,.25)'; c.lineWidth=1; for(let i=0;i<7;i++){ c.beginPath(); c.moveTo(0,H*(.93-i*.0)); c.lineTo(W,H*.93); c.stroke(); } c.beginPath(); c.moveTo(0,H*.93); c.lineTo(W,H*.93); c.stroke();
      c.lineCap='round'; c.strokeStyle='#bff0ff'; c.lineWidth=4; c.shadowColor='#58d6ff'; c.shadowBlur=14; bones.forEach(([a,b])=>{ const A=px(J[a]),B=px(J[b]); c.beginPath(); c.moveTo(A[0],A[1]); c.lineTo(B[0],B[1]); c.stroke(); });
      c.fillStyle='#fff'; J.forEach((p,i)=>{ const P=px(p); c.beginPath(); c.arc(P[0],P[1],i===0?H*.045:5,0,7); i===0?c.stroke():c.fill(); }); c.shadowBlur=0;
      for(let i=0;i<26;i++){ const s=(i*97.3+t*40)%W, y=(i*53.7+t*(20+i))%H; c.fillStyle='rgba(127,212,230,.5)'; c.fillRect(s,y,2,2); } c.fillStyle='rgba(8,10,16,1)'; c.fillRect(0,0,W*.22,H*.1); c.fillStyle='#7fd4e6'; c.font=`500 ${H*.045}px Geist Mono, monospace`; c.fillText('TRACKING · 12 PTS',W*.02,H*.065); },300),0,1.95,.0158));
  blob(g,0,-2.75,3.4,1.4,.45); lab('Live avatar',sd,2.9);
  // tap-to-trigger pedestal + operator laptop
  const rf=grp(g,-3.05,0,.4,.5); rf.add(at(rbox(.34,1.05,.34,M.white,.04),0,.525,0)); const rd=mesh(new THREE.TorusGeometry(.09,.012,8,32),glow(COOL)); rd.rotation.x=Q; rd.position.y=1.062; rf.add(rd); rf.add(at(cyl(.07,.07,.008,M.blk,24),0,1.056,0)); updaters.push(t=>{ const p=(t*.8)%1; rd.scale.setScalar(1+p*.5); rd.material.opacity=1-p; rd.material.transparent=true; }); blob(g,-3.05,.4,.9,.9,.4); lab('RFID trigger',rf,1.25);
  const op=grp(g,3.05,0,.35,-.6); op.add(tripod(.95,.42)); op.add(at(rbox(.5,.02,.36,M.blk,.008),0,.96,0)); const olp=laptop(( c,W,H,t)=>{ c.fillStyle='#17181c'; c.fillRect(0,0,W,H); for(let i=0;i<5;i++){ c.fillStyle=`hsl(${190+i*20},50%,${40+10*Math.sin(t+i)}%)`; c.fillRect(8+i*W*.18,H*(.2+.1*(i%2)),W*.14,H*.2); } c.strokeStyle='#5a5f6a'; c.beginPath(); c.moveTo(8,H*.7); for(let x=0;x<W;x+=6) c.lineTo(x,H*(.72+.1*Math.sin(x*.1+t*3))); c.stroke(); }); olp.position.y=.97; op.add(olp); blob(g,3.05,.35,1.1,1.1,.35);
}

/* 8 · Fabrication: custom builds and pop-ups, with large-format 3D printing */
{ const g=zones[7].g, fr=std(0x26272b,.5,.5);
  // large-format printer: gantry frame, heated bed, a tall piece growing layer by layer (the plinth is wider than the frame and stops below the lower rails, so no two faces share a plane)
  const gp=grp(g,-1.75,0,-1.55,.22), FW=2.4, FH=3.1, FD=2.2;
  gp.add(at(rbox(FW+.2,.4,FD+.2,fr,.03),0,.2,0)); for(const sx of [-1,1]) for(const sz of [-1,1]) gp.add(at(box(.1,FH,.1,M.alu),sx*FW/2,FH/2,sz*FD/2)); for(const y of [.47,FH]){ for(const sz of [-1,1]) gp.add(at(box(FW+.1,.1,.1,M.alu),0,y,sz*FD/2)); for(const sx of [-1,1]) gp.add(at(box(.1,.1,FD+.1,M.alu),sx*FW/2,y,0)); }
  gp.add(at(rbox(FW-.3,.05,FD-.3,std(0x34363b,.35,.6),.01),0,.5,0)); for(const sx of [-1,1]) gp.add(at(plane(FD-.2,FH-.7,std(0xdfe8ec,.05,.1,{transparent:true,opacity:.14,side:THREE.DoubleSide})),sx*(FW/2+.0),FH/2+.2,0)).rotation.y=Math.PI/2;
  const RN=90, SG=48, PH=1.9, pp=[], pi=[]; for(let r=0;r<=RN;r++){ const v=r/RN, y=v*PH, rad=.34+.2*Math.sin(v*3.3+.4)+.05*Math.sin(v*11), tw=v*1.9; for(let k=0;k<=SG;k++){ const a=k/SG*Math.PI*2, rr=rad*(1+.09*Math.cos(a*6+tw*3)); pp.push(Math.cos(a+tw)*rr,y,Math.sin(a+tw)*rr); } }
  for(let r=0;r<RN;r++) for(let k=0;k<SG;k++){ const a=r*(SG+1)+k, b=a+SG+1; pi.push(a,b,a+1,b,b+1,a+1); }
  const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.Float32BufferAttribute(pp,3)); pg.setIndex(pi); pg.computeVertexNormals();
  const lt=still(1,1,(c,W,H)=>{ c.fillStyle='#f1eee7'; c.fillRect(0,0,W,H); for(let y=0;y<H;y+=4){ c.fillStyle='rgba(120,112,100,.22)'; c.fillRect(0,y,W,1); } },64);
  const piece=new THREE.Mesh(pg,std(0xf3f0ea,.42,0,{side:THREE.DoubleSide})); piece.castShadow=true; piece.position.y=.53; gp.add(piece);
  const beamX=at(box(FW,.09,.12,fr),0,2,0); gp.add(beamX); const head=grp(gp,0,2,0); head.add(rbox(.22,.3,.24,std(0x2f6fb5,.45,.2),.04)); head.add(at(cyl(.02,.008,.1,M.steel,12),0,-.2,0)); head.add(at(sph(.018,glow(0xffe2b0),8,6),0,-.26,0));
  updaters.push(t=>{ const pr=.3+.7*((t/36)%1), rings=Math.max(2,Math.floor(pr*RN)); pg.setDrawRange(0,rings*SG*6); const y=.53+pr*PH+.28, v=pr, rad=.34+.2*Math.sin(v*3.3+.4), a=t*2.6; head.position.set(Math.cos(a)*rad,y,Math.sin(a)*rad); beamX.position.set(0,y+.2,head.position.z); });
  gp.add(at(rbox(.5,.34,.06,M.gloss,.02),FW/2-.3,1.3,FD/2+.06)); gp.add(at(screen(.44,.28,(c,W,H,t)=>{ c.fillStyle='#0d1014'; c.fillRect(0,0,W,H); c.fillStyle='#7fd4e6'; c.font=`600 ${H*.26}px Geist Mono, monospace`; c.fillText(Math.floor(30+70*((t/36)%1))+'%',W*.08,H*.38); c.fillStyle='#2a2f36'; c.fillRect(W*.08,H*.62,W*.84,H*.14); c.fillStyle='#7fd4e6'; c.fillRect(W*.08,H*.62,W*.84*(.3+.7*((t/36)%1)),H*.14); },96),FW/2-.3,1.3,FD/2+.095));
  blob(g,-1.75,-1.55,3.4,3.2,.5);
  // print farm: six desktop machines on a rack
  const farm=grp(g,2.05,0,-3.3,-.12); for(const sx of [-1.02,1.02]) for(const sz of [-.3,.3]) farm.add(at(box(.05,2.25,.05,fr),sx,1.125,sz)); for(const y of [.55,1.3,2.05]) farm.add(at(box(2.1,.04,.66,M.wood),0,y,0));
  const hd=[]; const colsP=[0xe9e4da,0x3ca0b8,0xc85a8a,0xe9e4da,0x2f6fb5,0xd8c27a];
  for(let r=0;r<2;r++) for(let k=0;k<3;k++){ const p=grp(farm,-.68+k*.68,.57+r*.75,0); p.add(at(rbox(.5,.1,.5,fr,.02),0,.05,0)); for(const sx of [-1,1]) for(const sz of [-1,1]) p.add(at(box(.03,.55,.03,fr),sx*.235,.36,sz*.235)); p.add(at(rbox(.5,.06,.5,fr,.02),0,.65,0)); p.add(at(box(.42,.015,.42,std(0x3a3c41,.4,.5)),0,.11,0));
      const ob=mesh(k%2?new THREE.IcosahedronGeometry(.1,0):new THREE.CylinderGeometry(.06,.1,.22,6+k*2),std(colsP[r*3+k],.5)); ob.position.set(0,.22,0); p.add(ob); const h2=grp(p,0,.45,0); h2.add(box(.44,.025,.03,M.steel)); h2.add(at(rbox(.07,.08,.07,std(0xe9e6df,.5),.015),0,-.03,0)); hd.push(h2);
      p.add(at(box(.05,.02,.004,ledMat(0x52d38a,1)),.18,.05,.252)); const sp=mesh(new THREE.TorusGeometry(.085,.035,10,24),std(colsP[r*3+k],.6)); sp.position.set(.3,.38,-.1); sp.rotation.y=Math.PI/2; p.add(sp); }
  updaters.push(t=>hd.forEach((h,i)=>{ h.children[1].position.x=Math.sin(t*(2+i*.3)+i)*.16; h.position.z=Math.cos(t*(1.3+i*.2)+i)*.14; })); blob(g,2.05,-3.3,2.6,1.2,.5);
  // a pop-up shop unit: our fabrication with screens, light and sound built in
  const pu=grp(g,2.35,0,.55,-.5); pu.add(at(rbox(2.9,.09,2.0,M.wood,.02),0,.045,0)); pu.add(at(rbox(2.9,2.55,.1,M.white,.02),0,1.36,-.95)); pu.add(at(rbox(.1,2.55,1.3,M.white,.02),-1.4,1.36,-.35)); pu.add(at(rbox(2.9,.1,1.3,M.white,.02),0,2.68,-.35));
  pu.add(at(rbox(2.2,.36,.06,M.blk,.02),0,2.25,-.88)); const sg=paint('YOUR BRAND HERE',2.0,.22,{font:'600 96px Geist, sans-serif',color:'rgba(255,252,246,.96)',res:1024}); sg.position.set(0,2.25,-.845); pu.add(sg); pu.add(at(box(2.7,.03,.04,glow(0xfff2dc)),0,2.6,.2));
  const pm=monitor(.95,.54,(c,W,H,t)=>{ const gr=c.createLinearGradient(0,0,W,H), k=(Math.sin(t*.5)+1)/2; gr.addColorStop(0,`hsl(${195+k*30},60%,${40+k*10}%)`); gr.addColorStop(1,'#101218'); c.fillStyle=gr; c.fillRect(0,0,W,H); c.fillStyle='#fff'; c.font=`600 ${H*.16}px Geist, sans-serif`; c.fillText('New drop',W*.08,H*.8); c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=2; c.beginPath(); c.arc(W*.72,H*.4,H*.2,t,t+4.4); c.stroke(); },{stand:false,res:140}); pm.position.set(-.75,1.5,-.88); pu.add(pm);
  for(const y of [1.05,1.6]){ pu.add(at(box(1.1,.035,.26,M.wood),.65,y,-.78)); for(let i=0;i<3;i++){ const ob=mesh(i%2?new THREE.CylinderGeometry(.05,.075,.2,8):new THREE.IcosahedronGeometry(.09,0),std([0xe9e4da,0x3ca0b8,0xc85a8a][(i+(y>1.2?1:0))%3],.5)); ob.position.set(.3+i*.34,y+.12,-.78); pu.add(ob); } }
  pu.add(at(rbox(1.3,.95,.55,M.wood,.02),.35,.57,.35)); pu.add(at(rbox(1.36,.04,.6,M.white,.01),.35,1.06,.35)); pu.add(at(rbox(.26,.02,.18,M.blk,.006),.1,1.09,.35)); pu.add(at(cyl(.07,.07,.2,M.blk,16),-1.15,2.5,.1)); blob(g,2.35,.55,3.4,2.4,.45);
  // filament cart
  const ct=grp(g,-3.75,0,-3.6,.2); for(const sx of [-.5,.5]) ct.add(at(box(.04,1.5,.4,fr),sx,.8,0)); for(const y of [.55,1.05,1.5]) ct.add(rod(V(-.5,y,0),V(.5,y,0),.015,M.steel)); for(const sx of [-.42,.42]) for(const sz of [-.15,.15]) ct.add(at(caster(),sx,0,sz));
  const sc=[0xe9e4da,0x1c1c1f,0x3ca0b8,0xc85a8a,0x2f6fb5,0xd8c27a,0x4f7a52,0xe9e4da,0x8a8d90]; for(let r=0;r<3;r++) for(let k=0;k<3;k++){ const sp=mesh(new THREE.TorusGeometry(.12,.055,10,28),std(sc[r*3+k],.55)); sp.rotation.y=Math.PI/2; sp.position.set(-.3+k*.3,.55+r*.47,0); ct.add(sp); } blob(g,-3.75,-3.6,1.4,1,.4);
}

/* 9 · Logistics: the camera steps outside to the dock and the truck being loaded */
zones.push({pos:V(-12.9,0,20.6), dir:V(.7,0,.7), key:{p:[.8,3.3,23.4], l:[-12.3,1.2,20.3], f:40, ox:-.2, oy:0}, keyN:{p:[-4.5,5.5,33], l:[-12.6,.8,20.6], f:56, ox:0, oy:.2}});

/* ---------- sound travelling across the floor from the PA ---------- */
const GX=110,GZ=92, pts=new Float32Array(GX*GZ*3), cols=new Float32Array(GX*GZ*3), base=[];
for(let j=0;j<GZ;j++) for(let i=0;i<GX;i++){ const x=RM.x0+.6+i*(RW-1.2)/(GX-1), z=RM.z0+.6+j*(RD-1.2)/(GZ-1), k=(j*GX+i)*3; pts[k]=x; pts[k+1]=.03; pts[k+2]=z; base.push(Math.hypot(x+3.2,z+10.2)); }
const dotGeo=new THREE.BufferGeometry(); dotGeo.setAttribute('position',new THREE.BufferAttribute(pts,3)); dotGeo.setAttribute('color',new THREE.BufferAttribute(cols,3));
const dotMat=new THREE.PointsMaterial({size:.05,vertexColors:true,transparent:true,opacity:.55,depthWrite:false}), dotPts=new THREE.Points(dotGeo,dotMat); scene.add(dotPts);
const DOT0=new THREE.Color(0xc4beb3), DOT1=new THREE.Color(0x57534c);

/* ---------- hero labels ---------- */
const labWrap=document.getElementById('labels');
labels.forEach(l=>{ const el=document.createElement('span'); el.className='lab'; el.innerHTML=`<i></i>${l.name}`; labWrap.appendChild(el); l.el=el; });

/* ---------- camera path: cut-away overview → seven stops inside the room → back out ---------- */
/* ---------- services page: one business at a time, each in a studio of its own ---------- */
const SVCM=document.body.dataset.mode==='services';
// per-business room dressing and camera shots live in src/rooms/<key>.js and are spliced in here by mk.py
const DRESS={}, SHOTS={};

// [third-level name, one line, where the camera goes: a labelled object, or x,y,z,distance in the bay, or a fixed shot; optional outside link]
const SVC=[
 {k:'displays',n:'Displays',short:'Displays',tags:['Rent','Buy','Install'],d:'OLED TVs, touchscreens with Android or Windows built in, transparent displays and multi-screen playback stations.',
  room:{back:0xF3F0EA,side:'brick',win:1,mood:'day'},items:[
   ['OLED TV rental','OLED TVs on floor stands or mounts, delivered and set up for booths, lounges and stages.',[3.55,1.25,1.75,3.4]],
   ['Touch screen rental','Touch displays with Android or Windows built in, on a stand or as a kiosk, running your app or one we build.',[-2.7,1.2,3.0,3.4]],
   ['Transparent displays','See-through screens that put motion graphics in front of a real product.','Transparent display'],
   ['Playback stations','Screens on truss or stands with players and a control position, looping content for the whole run.',[3.9,1.9,-2.3,5.2]],
   ['LED walls','LED video walls go up with the same crew. Sizes, specs and pricing are on our LED site.',[-.3,1.7,-2.3,6.2],['ledwall.nyc','https://ledwall.nyc']]]},
 {k:'projection',n:'Projection',short:'Projection',tags:['Rent','Buy','Install'],d:'Projectors for events, trade shows and immersive rooms, mapping on any surface, and home theater.',
  room:{back:0x26272b,side:0x2e2f34,ceil:0x1f2023,beam:0x2a2b2f,floor:0x8f8b84,ink:'rgba(236,233,227,.8)',mood:'dark'},items:[
   ['Projector rental','Projectors, lenses and screens for events, trade shows and immersive rooms, hung and aligned by us.','Projectors'],
   ['Projection mapping','Content fitted to walls, objects, sets and architecture, including irregular and sculptural surfaces.','Mapping surface'],
   ['Home theater','A projector, screen and sound at home: rented for a night or installed for good.','Home cinema']]},
 {k:'audio',n:'Audio',short:'Audio',tags:['Rent','Buy','Install'],d:'Sound systems, wireless microphones, directional speakers, spatial audio and haptic seating.',
  room:{back:'slat',side:0xEFEBE3,win:0,mood:'warm'},items:[
   ['Sound system rental','Line arrays, subs and fills sized to the room, with an engineer at the console.','Line array'],
   ['Wireless microphones','Handheld, lavalier and headset wireless for panels, presenters and performers.','Wireless mic'],
   ['Directional speakers','Sound that stays in one spot: the person underneath hears it, the person beside them does not. To rent or to buy.','Directional speaker'],
   ['Spatial audio & haptic seating','Sound placed around the audience, and seating that moves with the low end.','Haptic sofa'],
   ['Mixing & engineers','Consoles and the audio engineers who run them, with our system or yours.','Mixing console']]},
 {k:'lighting',n:'Lighting & staging',short:'Lighting',tags:['Rent','Install'],d:'Aputure lighting, stage decks, truss and rigging, and the stage work around them.',
  room:{back:0x1d1e21,side:0x242528,ceil:0x18191b,beam:0x232427,floor:0x7d7a74,ink:'rgba(236,233,227,.8)',mood:'dark'},items:[
   ['Event lighting','Aputure fixtures for stages, rooms and camera, placed, focused and run by us.','Aputure lights'],
   ['Stage decks','Modular stage decks in the size and height the room needs, built and levelled.','Stage deck'],
   ['Truss & rigging','Ground-supported and flown truss for lights, screens, speakers and projectors.','Truss'],
   ['Lighting control','A lighting desk and an operator for the show.','Lighting desk']]},
 {k:'live-video',n:'Live video & visuals',short:'Live video',tags:['Rent','Install'],d:'Live streaming, switchers and production kits, and VJ and Resolume visuals.',
  room:{back:0x4a4f57,side:0x565b63,ceil:0x3c4047,beam:0x484c54,floor:0xa9a69f,ink:'rgba(236,233,227,.85)',mood:'studio'},items:[
   ['Live streaming','Cameras, encoding and a crew to put the event online.','Camera'],
   ['Switchers & production kits','Video switchers and portable production kits, rented with or without an operator.','Switcher'],
   ['VJ & live visuals','Live and audio-reactive visuals, playback and show control. If Resolume does it, we do it.','VJ / Resolume'],
   ['Hybrid events','Remote speakers and remote audiences in the same show as the room.','PTZ camera']]},
 {k:'networks',n:'Networks & computers',short:'Networks',tags:['Rent','Buy','Install'],d:'UniFi networks for events and for buildings, and computers and workstations to rent or own.',
  room:{back:0xF4F3F0,side:0xEDEEEE,win:1,floor:0xf4f6f8,mood:'cool'},items:[
   ['Event Wi-Fi','A UniFi network brought in for the event: access points, switching and someone watching it.','UniFi access point'],
   ['Permanent network installs','UniFi networks designed, installed and handed over in your space.','Network rack'],
   ['Computer & workstation rental','Workstations and show computers for the run of the event.','Workstation'],
   ['Custom PCs & workstations','Workstations built to order, to buy.','Workstation']]},
 {k:'interactive',n:'Interactive & tracking',short:'Interactive',tags:['Rent','Install'],d:'TouchDesigner, sensors, RFID, motion tracking and the 3D content that reacts to them.',
  room:{back:0x202125,side:0x27282c,ceil:0x1a1b1e,beam:0x25262a,floor:0x7a7770,ink:'rgba(236,233,227,.8)',mood:'dark'},items:[
   ['Interactive installations','Rooms, floors and walls that respond to people, built in TouchDesigner.','Interactive floor'],
   ['Sensors & body tracking','Cameras and sensors that follow people without anything worn.','Body tracking'],
   ['Motion tracking systems','Tracking systems rented, installed and run for events and installs.','Tracking cameras'],
   ['RFID & NFC triggers','Tap an object or a badge and the room does something.','RFID trigger'],
   ['3D & real-time content','3D modeling and real-time content that follows the performer or the visitor.','Live avatar']]},
 {k:'fabrication',n:'Fabrication',short:'Fabrication',tags:['Design','Build','Install'],d:'Custom builds, branded pieces and pop-up shops, designed, 3D-printed and assembled in house, with the screens, light and sound already built in.',
  room:{back:'brick',side:'brick',win:1,mood:'day'},items:[
   ['Custom fabrication','One-off pieces made for the job: housings, plinths, props and mounts.',[2.05,1.2,-3.3,4.4]],
   ['Pop-up shops & retail units','A branded unit that arrives finished, with display, light and sound inside it.',[2.35,1.35,.55,4.8]],
   ['Large-format 3D printing','Pieces printed at furniture scale, and small-batch runs on the print farm.',[-1.75,1.6,-1.55,7.4],['ctrlp.studio','https://ctrlp.studio']]]},
 {k:'logistics',n:'Logistics & touring',short:'Logistics',tags:['Deliver','Tour','Store'],d:'We case it, truck it and load it in ourselves. For work outside New York, the same crew travels with the gear.',
  room:{mood:'day'},items:[
   ['Delivery, load-in & strike','Our truck and our crew, from the dock to the room and back.',{p:[-7.5,4.2,22.5],l:[-12.6,1.0,18.6],f:38}],
   ['Touring & multi-city','The same system and the same people in every city on the run.',{p:[-3.2,2.6,25.2],l:[-11.7,1.2,21.6],f:36}],
   ['Storage between dates','Cased, labelled and kept ready between dates.',{p:[-8.6,3.4,10.8],l:[-13.3,.9,15.4],f:42}]]},
];
let svc=null; const anchors=labAt;
if(SVCM){
  // everything that belongs to the shared studio goes in one group, so a business can be shown alone in a room of its own
  const homeG=new THREE.Group(), zg=new Set(zones.map(z=>z.g)); for(const o of [...scene.children]) if(!o.isLight&&!zg.has(o)) homeG.add(o); scene.add(homeG);
  const slatT=still(2,2,(c,W,H)=>{ c.fillStyle='#bfa783'; c.fillRect(0,0,W,H); const n=18, w=W/n; for(let i=0;i<n;i++){ c.fillStyle='#3d342a'; c.fillRect(i*w,0,w*.3,H); c.fillStyle='rgba(255,240,215,.14)'; c.fillRect(i*w+w*.3,0,2,H); c.fillStyle='rgba(60,40,20,.1)'; c.fillRect(i*w+w-2,0,2,H); } },256);
  const wallOf=(kind,w,h)=>{ if(kind==='brick') return brickOf(w/1.6,h/1.6); if(kind==='slat'){ const t=slatT.clone(); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(w/2.2,1); t.needsUpdate=true; return std(0xffffff,.8,0,{map:t,envMapIntensity:.2}); } return std(kind,.95,0,{envMapIntensity:.15}); };
  const RX=7.6, ZB=-5.8, ZF=13.4, RH=6.4, RD2=ZF-ZB, zc=(ZF+ZB)/2;
  const rooms=zones.map((z,i)=>{ if(!z.g) return null; const r=SVC[i].room, G=new THREE.Group(); z.g.add(G);
    const ft=floorT.clone(); ft.wrapS=ft.wrapT=THREE.RepeatWrapping; ft.repeat.set(2*RX/6.4,RD2/6.4); ft.needsUpdate=true; const fl=plane(2*RX,RD2,std(r.floor||0xffffff,.4,.04,{map:ft,envMapIntensity:.45})); fl.rotation.x=-Q; fl.position.set(0,-.003,zc); fl.receiveShadow=true; G.add(fl);
    const bw=plane(2*RX,RH,wallOf(r.back,2*RX,RH)); bw.position.set(0,RH/2,ZB); bw.receiveShadow=true; G.add(bw);
    for(const sx of [-1,1]){ const w=plane(RD2,RH,wallOf(r.side,RD2,RH)); w.rotation.y=-sx*Q; w.position.set(sx*RX,RH/2,zc); w.receiveShadow=true; G.add(w); }
    const cl=plane(2*RX,RD2,std(r.ceil||0xe9e5dd,1,0,{envMapIntensity:.1})); cl.rotation.x=Q; cl.position.set(0,RH,zc); G.add(cl);
    const bm=std(r.beam||0xdedad1,.9), canM=std(0x1b1b1d,.5,.3), litM=new THREE.MeshBasicMaterial({color:0xfff3dd,toneMapped:false});
    for(const zz of [-2.6,2.8,8.2]) G.add(at(new THREE.Mesh(new THREE.BoxGeometry(2*RX,.5,.36),bm),0,RH-.25,zz));
    for(const xx of [-4.8,0,4.8]) for(const zz of [.2,5.6]){ G.add(at(new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.3,18),canM),xx,RH-.8,zz)); G.add(rod(V(xx,RH-.65,zz),V(xx,RH,zz),.012,canM)); const l=new THREE.Mesh(new THREE.CircleGeometry(.125,18),litM); l.rotation.x=Q; l.position.set(xx,RH-.952,zz); G.add(l); }
    const base=std(0x3b3936,.7); G.add(at(box(2*RX,.14,.03,base),0,.07,ZB+.015)); for(const sx of [-1,1]) G.add(at(box(.03,.14,RD2,base),sx*(RX-.015),.07,zc));
    // a band of steel clerestory windows along the back wall where the room has daylight; otherwise the business name, sign-painted
    if(r.win){ const fm=std(0x1c1c1e,.6,.4), w=3.7, h=1.9, y=RH-2.75; for(const xx of [-4.6,0,4.6]){ const t=skyT.clone(); t.repeat.set(.2,.5); t.offset.set(.1+((i*23+xx*7+60)%50)/100,.34); t.needsUpdate=true;
        const p=plane(w,h,new THREE.MeshBasicMaterial({map:t,toneMapped:false})); p.position.set(xx,y+h/2,ZB+.02); G.add(p); for(let k=0;k<=4;k++) G.add(at(box(.06,h,.05,fm),xx-w/2+k*w/4,y+h/2,ZB+.05)); for(let k=0;k<=2;k++) G.add(at(box(w,.06,.05,fm),xx,y+k*h/2,ZB+.05)); G.add(at(box(w+.3,.06,.26,std(0xd8d4cb,.6)),xx,y-.03,ZB+.12)); } }
    else { const tt=paint(String(i+1).padStart(2,'0')+'  '+SVC[i].n.toUpperCase(),6.6,.62,{font:'600 96px "Geist Mono", monospace',color:r.ink||'rgba(26,26,24,.8)',res:1400,align:'left'}); tt.position.set(3.6,RH-2.3,ZB+.02); G.add(tt); }
    if(DRESS[SVC[i].k]) try{ DRESS[SVC[i].k](G,{RX,ZB,ZF,RH,room:r,index:i}); }catch(e){ console.error('room dressing failed: '+SVC[i].k,e); }
    return G; });
  const MOOD={day:[1.08,.7,1.9,.8],warm:[1.04,.62,1.7,.6],cool:[1.1,.78,1.8,1.0],studio:[1.0,.5,1.5,.6],dark:[.98,.34,1.05,.4]};
  const show=(i)=>{ const L=i===8; homeG.visible=L; zones.forEach((z,k)=>{ if(!z.g) return; z.g.visible=L||k===i; rooms[k].visible=!L&&k===i; }); const m=MOOD[SVC[i].room.mood]||MOOD.day; document.body.classList.toggle('dk',!L&&/dark|studio/.test(SVC[i].room.mood)); renderer.toneMappingExposure=m[0]; hemi.intensity=m[1]; key.intensity=m[2]; fill.intensity=m[3]; };
  const tgt=()=>{ const S=SVC[svc.tab], it=svc.item>=0?S.items[svc.item]:null, z=zones[svc.tab], O=SHOTS[S.k]||{}, pick=(k)=>O[k]!==undefined?O[k]:null;
    if(svc.tab===8){ const c=it?(pick(svc.item)||it[2]):((narrow?pick('wideN'):pick('wide'))||(narrow?z.keyN:z.key)); return {p:V(...c.p),l:V(...c.l),f:narrow?c.f+10:c.f,ox:narrow?0:(c.ox??-.18),oy:narrow?.14:(c.oy??0)}; }
    z.g.updateMatrixWorld(true); const W2=(v)=>z.g.localToWorld(v), fixed=(c,d)=>({p:W2(V(...c.p)),l:W2(V(...c.l)),f:c.f??d.f,ox:c.ox??d.ox,oy:c.oy??d.oy});
    const dw=narrow?{f:54,ox:0,oy:.13}:{f:44,ox:-.2,oy:0}, cw=(narrow?pick('wideN'):pick('wide'))||(narrow?{p:[0,5.2,12.6],l:[0,1.5,0]}:{p:[0,4.5,10.4],l:[0,1.7,0]}), wide=fixed(cw,dw); if(!it) return wide;
    const di=narrow?{f:50,ox:0,oy:.13}:{f:40,ox:-.17,oy:0}, a=pick(svc.item)||it[2]; if(a&&!Array.isArray(a)&&typeof a==='object') return fixed(a,di);
    let t,d; if(typeof a==='string'){ const A=anchors[a]; if(!A) return wide; t=z.g.worldToLocal(A.obj.getWorldPosition(new THREE.Vector3())); t.y+=A.h*.5; d=Math.min(Math.max(3.1+Math.abs(A.h)*.95,3.4),8.6); } else { t=V(a[0],a[1],a[2]); d=a[3]; }
    const p=t.clone().addScaledVector(V(-t.x*.07,.3,1).normalize(),d*(narrow?1.3:1)); p.y=Math.max(p.y,1.6); p.z=Math.min(p.z,ZF-.6);
    return {p:W2(p),l:W2(t.clone()),f:di.f,ox:di.ox,oy:di.oy}; };
  const C={p:V(0,5,10),l:V(),f:44,ox:-.2,oy:0}; let T=null, hard=true;
  svc={tab:0,item:-1,cam(){ if(!T) T=tgt(); const k=(hard||reduce||location.hash.startsWith('#snap'))?1:.07; hard=false; C.p.lerp(T.p,k); C.l.lerp(T.l,k); C.f+=(T.f-C.f)*k; C.ox+=(T.ox-C.ox)*k; C.oy+=(T.oy-C.oy)*k; return C; }};
  addEventListener('resize',()=>{ T=null; });
  // page furniture: tabs are the second level, the list in the card is the third
  const $=(id)=>document.getElementById(id), tabs=[...document.querySelectorAll('#rail a')], fade=$('svcFade'), esc=(s)=>s.replace(/&/g,'&amp;');
  const draw=()=>{ const S=SVC[svc.tab], it=svc.item>=0?S.items[svc.item]:null; $('svcEb').textContent=`Services · ${String(svc.tab+1).padStart(2,'0')} / 09`; $('svcH').textContent=S.n;
    $('svcD').innerHTML=it?esc(it[1])+(it[3]?` <a class="ext" href="${it[3][1]}">${it[3][0]} ↗</a>`:''):esc(S.d); $('svcBack').hidden=!it; $('svcSub').textContent=it?it[0]:'';
    $('svcMenu').innerHTML=S.items.map((x,k)=>`<li class="${k===svc.item?'on':''}"><a href="#" data-k="${k}">${esc(x[0])} <span>${x[3]?x[3][0]+' ↗':'→'}</span></a></li>`).join('');
    $('svcTags').innerHTML=S.tags.map(t=>`<span class="tag">${t}</span>`).join(''); tabs.forEach((a,k)=>{ a.classList.toggle('on',k===svc.tab); a.setAttribute('aria-selected',k===svc.tab); });
    const act=tabs[svc.tab], rl=$('rail'); if(act) rl.scrollTo({left:act.offsetLeft-(rl.clientWidth-act.offsetWidth)/2,behavior:'smooth'}); document.title=`${S.n} · Possible AV services (prototype)`; };
  const setTab=(i,now)=>{ if(i===svc.tab&&!now) { if(svc.item>=0){ svc.item=-1; T=null; draw(); } return; } const go=()=>{ svc.tab=i; svc.item=-1; show(i); T=null; hard=true; draw(); fade.classList.remove('on'); try{ history.replaceState(null,'','#'+SVC[i].k); }catch(e){} };
    if(now) go(); else { fade.classList.add('on'); setTimeout(go,230); } };
  tabs.forEach((a,k)=>a.addEventListener('click',e=>{ e.preventDefault(); setTab(k); }));
  $('svcMenu').addEventListener('click',e=>{ const a=e.target.closest('a[data-k]'); if(!a) return; e.preventDefault(); const k=+a.dataset.k; svc.item=svc.item===k?-1:k; T=null; draw(); });
  $('svcBack').addEventListener('click',e=>{ e.preventDefault(); svc.item=-1; T=null; draw(); });
  const fromHash=()=>{ const h=location.hash.replace(/^#(snap-?)?/,''), [tk,ik]=h.split('.'); const i=SVC.findIndex(s=>s.k===tk); return [i<0?0:i, ik!==undefined?+ik:-1]; };
  { const [i,k]=fromHash(); setTab(i,true); if(k>=0){ svc.item=k; T=null; draw(); } }
  addEventListener('hashchange',()=>{ const [i]=fromHash(); if(i!==svc.tab) setTab(i); });
}

let narrow=false, W=1, H=1;
function resize(){ W=innerWidth; H=innerHeight; renderer.setSize(W,H,false); camera.aspect=W/H; narrow=W/H<1.05; camera.updateProjectionMatrix(); }
addEventListener('resize',resize); resize();
function keys(){
  if(SVCM){ const c=svc.cam(), k={p:c.p.toArray(),l:c.l.toArray(),f:c.f,ox:c.ox,oy:c.oy}; return [k,k]; }
  const K=[], D=narrow?13.6:10.6, kk=Math.max(1,1.72/(W/H)), far=(p,l)=>p.map((q,i)=>l[i]+(q-l[i])*kk);
  K.push(narrow? {p:[4,76,78], l:[0,0,1], f:50, ox:0, oy:.13} : {p:far([40,48,62],[-1,0,1]), l:[-1,0,1], f:33, ox:-.17, oy:.02});
  zones.forEach(z=>{ if(z.key){ K.push(narrow?z.keyN:z.key); return; } const c=z.pos.clone().addScaledVector(z.dir,D);
    K.push(narrow? {p:[c.x,5.2,c.z], l:[z.pos.x,1.5,z.pos.z], f:54, ox:0, oy:.13} : {p:[c.x,4.7,c.z], l:[z.pos.x,1.75,z.pos.z], f:44, ox:-.2, oy:0}); });
  K.push(narrow? {p:[-4,80,82], l:[0,0,1], f:50, ox:0, oy:.13} : {p:far([40,54,66],[-1,0,1]), l:[-1,0,1], f:33, ox:-.17, oy:.04});
  return K;
}
const lerp=(a,b,t)=>a+(b-a)*t, ease=t=>t*t*(3-2*t);
const floorEl=document.getElementById('floor'), copyEl=document.getElementById('copy'), cards=[...document.querySelectorAll('.card')];
const pinEl=document.querySelector('.pin'), railA=[...document.querySelectorAll('#rail a')];
const focusEl=document.getElementById('focusl'), veilEl=document.getElementById('veil');
const leadEl=document.getElementById('lead'), leadP=leadEl.querySelector('path'), leadC=leadEl.querySelector('circle');
let hotList=0, hot3d=0; const ptr=new THREE.Vector2(); let ptrOn=false;
railA.forEach(a=>{ a.addEventListener('pointerenter',()=>hotList=+a.dataset.i); a.addEventListener('pointerleave',()=>hotList=0); });
canvas.addEventListener('pointermove',e=>{ ptr.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1); ptrOn=e.pointerType!=='touch'; });
canvas.addEventListener('pointerleave',()=>{ ptrOn=false; });
const goStop=(i)=>{ const span=floorEl.offsetHeight-innerHeight; scrollTo({top:floorEl.offsetTop+span*i/(zones.length+1),behavior:'smooth'}); };
canvas.addEventListener('click',()=>{ if(hot3d&&(stop===0||stop===zones.length+1)) goStop(hot3d); });
const ray=new THREE.Raycaster(), floorPl=new THREE.Plane(V(0,1,0),0), hit=new THREE.Vector3(), clock=new THREE.Clock();
if(!SVCM) railA.forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); goStop(+a.dataset.i); }));

let prog=0, stop=-1; const SNAP=location.hash.startsWith('#snap'); if(SNAP) window.__pav={THREE,scene,assets,clips,mixers,crew,skClone,posers,crewAll};
const mouse={x:0,y:0,tx:0,ty:0}; addEventListener('pointermove',e=>{ mouse.tx=e.clientX/innerWidth-.5; mouse.ty=e.clientY/innerHeight-.5; });
let visible=true; new IntersectionObserver(([e])=>visible=e.isIntersecting).observe(canvas);
const v=new THREE.Vector3(); let fc=0;

function frame(){
  if(window.__pavLite){ try{ renderer.dispose(); }catch(e){} return; } requestAnimationFrame(frame); if(!visible) return; fc++;
  { const nt=performance.now(); if(PERF.last){ const d=Math.min(nt-PERF.last,250); PERF.avg=PERF.avg?PERF.avg*.94+d*.06:d; } PERF.last=nt;
    if(!gov.from&&(PERF.baked!==undefined||fc>600)) gov.from=nt+2500;
    if(gov.from&&nt>gov.from&&fc%30===0){ const a=PERF.avg;
      if(a>26){ gov.ok=0; if(++gov.bad>=3&&tier<2){ tier++; renderer.setPixelRatio(PR[tier]); gov.bad=0; gov.from=nt+1500; } }
      else if(a<14){ gov.bad=0; if(++gov.ok>=8&&tier>0&&gov.ups<2){ tier--; gov.ups++; renderer.setPixelRatio(PR[tier]); gov.ok=0; gov.from=nt+1500; } }
      else { gov.bad=0; gov.ok=0; } PERF.tier=tier; } }
  const t=reduce?0:now(), ph=((t%BEAT)+BEAT)%BEAT, env=reduce?0:Math.exp(-ph*9);

  const span=Math.max(1,floorEl.offsetHeight-innerHeight), raw=Math.min(Math.max(-floorEl.getBoundingClientRect().top/span,0),1);
  prog+=(raw-prog)*((reduce||SNAP)?1:.085);
  const K=keys(), n=K.length-1, x=prog*n, seg=Math.min(Math.floor(x),n-1), f=x-seg;
  const hold=.28, lt=ease(Math.min(Math.max((f-hold/2)/(1-hold),0),1));
  const A=K[seg], B=K[seg+1], L=(k)=>lerp(A[k],B[k],lt), P=(k)=>V(lerp(A[k][0],B[k][0],lt),lerp(A[k][1],B[k][1],lt),lerp(A[k][2],B[k][2],lt));
  const cp=P('p'), lk=P('l');
  const co=Math.min(Math.max((11-cp.y)/4,0),1); for(const m of ceilMats){ m.opacity=co; m.visible=co>.01; } for(const o of insideOnly) o.visible=co>.35;
  mouse.x+=(mouse.tx-mouse.x)*.05; mouse.y+=(mouse.ty-mouse.y)*.05;
  const par=co>.5?1:.25; camera.position.set(cp.x+mouse.x*par,cp.y-mouse.y*.5*par,cp.z); camera.lookAt(lk);
  camera.near=Math.max(.1,Math.min(6,cp.distanceTo(lk)*.06)); camera.far=camera.near>1?400:300; dotMat.opacity=.55*co; dotPts.visible=co>.02;
  camera.fov=L('f'); camera.setViewOffset(W,H,L('ox')*W,L('oy')*H,W,H); camera.updateProjectionMatrix();
  if(SNAP&&window.__cam){ const c=window.__cam; camera.position.set(c.p[0],c.p[1],c.p[2]); camera.lookAt(c.l[0],c.l[1],c.l[2]); camera.fov=c.f||30; camera.near=.1; camera.far=300; camera.clearViewOffset(); camera.updateProjectionMatrix(); }

  const s=Math.round(x);
  if(!SVCM&&s!==stop){ stop=s; copyEl.classList.toggle('off',s!==0); labWrap.classList.toggle('off',s!==0);
    cards.forEach(c=>c.classList.toggle('on',+c.dataset.i===s)); veilEl.style.opacity=s===0?1:0; railA.forEach(a=>a.classList.toggle('on',+a.dataset.i===s)); const act=railA[s-1], rl=document.getElementById('rail'); if(act) rl.scrollTo({left:act.offsetLeft-(rl.clientWidth-act.offsetWidth)/2,behavior:'smooth'}); }

  // point at a bay (in the list or in the room) and it lights up
  const over=!SVCM&&(s===0||s===n)&&!narrow; hot3d=0;
  if(over&&ptrOn){ ray.setFromCamera(ptr,camera); if(ray.ray.intersectPlane(floorPl,hit)){ let best=4.3; zones.forEach((z,i)=>{ const d=Math.hypot(hit.x-z.pos.x,hit.z-z.pos.z); if(d<best){ best=d; hot3d=i+1; } }); } }
  const hot=over?(hotList||hot3d):0, zt=hot?zones[hot-1]:null; canvas.style.cursor=(over&&hot3d)?'pointer':'';
  if(zt){ v.copy(zt.pos).setY(1.2).project(camera); const fx=(v.x*.5+.5)*W, fy=(-v.y*.5+.5)*H; focusEl.style.background=`radial-gradient(ellipse 215px 165px at ${fx}px ${fy}px, rgba(236,233,227,0) 0, rgba(236,233,227,0) 50%, rgba(236,233,227,.7) 100%)`; focusEl.style.opacity=1; } else focusEl.style.opacity=0;
  railA.forEach(a=>a.classList.toggle('hot',+a.dataset.i===hot));
  if(zt){ v.copy(zt.pos).setY(.2).project(camera); const x1=(v.x*.5+.5)*W, y1=(-v.y*.5+.5)*H, r=railA[hot-1].getBoundingClientRect(), pr=pinEl.getBoundingClientRect(), x0=r.left+r.width/2-pr.left, y0=r.top-pr.top-3;
    leadP.setAttribute('d',`M${x0},${y0} L${x0},${y0-26} L${x1},${y1}`); leadC.setAttribute('cx',x1); leadC.setAttribute('cy',y1); leadEl.style.opacity=1; } else leadEl.style.opacity=0;

  const dt=Math.min(clock.getDelta(),.05); for(const m of mixers) m.update(reduce?0:dt); for(const p of posers) p();
  for(const c of cones) c.position.z=(c.userData.z0||0)+env*.04;
  for(const m of leds) m.emissiveIntensity=m.userData.base+env*2.2;
  mapMat.uniforms.t.value=t; mapMat.uniforms.kick.value=env;
  updaters.forEach(u=>u(t,env));
  if(fc%TEX_EVERY[tier]===0) for(const a of animTex){ a.draw(a.g,a.c.width,a.c.height,t); a.t.needsUpdate=true; }

  const p=dotGeo.attributes.position.array, cl=dotGeo.attributes.color.array;
  for(let i=0,nn=base.length;i<nn;i++){ const d=base[i]; let y=0;
    if(!reduce) for(let k=0;k<3;k++){ const a=ph+k*BEAT, w=d-a*11; y+=Math.exp(-w*w*.9)*Math.exp(-a*.7)*.12; }
    p[i*3+1]=.03+y; const kk=Math.min(y*8,1);
    cl[i*3]=lerp(DOT0.r,DOT1.r,kk); cl[i*3+1]=lerp(DOT0.g,DOT1.g,kk); cl[i*3+2]=lerp(DOT0.b,DOT1.b,kk); }
  dotGeo.attributes.position.needsUpdate=true; dotGeo.attributes.color.needsUpdate=true;

  if(fc%SHADOW_EVERY[tier]===1) renderer.shadowMap.needsUpdate=true;
  renderer.render(scene,camera); if(window.__pavTick) window.__pavTick();

  if(s===0 && !narrow){ const placed=[];
    for(const l of labels){ l.obj.getWorldPosition(v); v.y+=l.y; v.project(camera);
      const w=l.w||(l.w=l.el.offsetWidth), h=20; let sx=(v.x*.5+.5)*W, sy=(-v.y*.5+.5)*H, ok=false;
      for(let k=0;k<4&&!ok;k++){ const r={x:sx-w/2,y:sy-h,w,h}; ok=!placed.some(q=>r.x<q.x+q.w+4&&r.x+r.w+4>q.x&&r.y<q.y+q.h+2&&r.y+r.h+2>q.y); if(ok) placed.push(r); else sy-=h+3; }
      l.el.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`; l.el.style.visibility=(ok&&v.z<1)?'visible':'hidden'; } }
}
const PERF={};
frame();

/* ---------- perf: bake static scenery into a few meshes per material and area ----------
   Thousands of small parts (cases, trusses, cables, fittings) used to cost one draw call each, twice (shadow + screen).
   Once every model has loaded, anything that never moves is merged per material and per 10 m cell; the originals stay in
   the scene hidden (so labels and anchors keep working). Things that move, blink, fade or are swapped are left alone. */
function bakeStatic(){ try{
  if(SVCM||/nobake/.test(location.hash)) return;
  const all=[]; scene.updateMatrixWorld(true); scene.traverse(o=>{ if(o.isMesh) all.push(o); }); PERF.meshes=all.length;
  const vis=(o)=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  const msig=(m)=>[m.color&&m.color.getHex(),m.emissive&&m.emissive.getHex(),m.emissiveIntensity,m.opacity,m.visible].join();
  const snap=new Map(), dyn=new Set(), mats=new Map(), animMat=new Set(leds.concat(ceilMats));
  for(const m of all){ snap.set(m,[m.matrixWorld.clone(),vis(m)]); for(const mm of [].concat(m.material)) if(mm&&!mats.has(mm)) mats.set(mm,msig(mm)); }
  for(const t of [.1,.9,1.7,2.6,3.3,4.1,5.2,6.4,7.7,8.4,11,13.9,17,21,26,33,47,61]){ const ph=((t%BEAT)+BEAT)%BEAT, env=Math.exp(-ph*9);
    updaters.forEach(u=>u(t,env)); mixers.forEach(m=>m.update(.37)); posers.forEach(p=>p()); scene.updateMatrixWorld(true);
    for(const m of all){ const s=snap.get(m); if(!s[0].equals(m.matrixWorld)||s[1]!==vis(m)) dyn.add(m); }
    for(const [mm,v] of mats) if(msig(mm)!==v) animMat.add(mm); }
  const markTree=(o)=>o&&o.traverse&&o.traverse(n=>{ if(n.isMesh) dyn.add(n); }); insideOnly.forEach(markTree); crewAll.forEach(markTree); cones.forEach(markTree);
  const plainMat=(m)=>m&&!Array.isArray(m)&&(m.isMeshStandardMaterial||m.isMeshBasicMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial)&&!m.isShaderMaterial&&!m.transparent&&m.onBeforeCompile===THREE.Material.prototype.onBeforeCompile&&!m.displacementMap&&!m.lightMap;
  const tid=(x)=>x?x.uuid:'-';
  const sig=(m)=>animMat.has(m)?m.uuid:[m.type,m.color&&m.color.getHex(),m.emissive&&m.emissive.getHex(),m.emissiveIntensity,m.roughness,m.metalness,tid(m.map),tid(m.normalMap),tid(m.roughnessMap),tid(m.metalnessMap),tid(m.emissiveMap),tid(m.aoMap),tid(m.alphaMap),tid(m.envMap),m.normalScale&&m.normalScale.toArray().join('/'),m.aoMapIntensity,m.side,m.vertexColors,m.flatShading,m.envMapIntensity,m.toneMapped,m.fog,m.wireframe,m.alphaTest,m.depthTest,m.depthWrite,m.colorWrite,m.blending,m.polygonOffset,m.polygonOffsetFactor,m.polygonOffsetUnits].join('|');
  const groups=new Map(), sph=new THREE.Sphere(), CELL=10;
  for(const m of all){ const g=m.geometry;
    if(m.isSkinnedMesh||m.isInstancedMesh||dyn.has(m)||m.children.length||m.renderOrder||!vis(m)||!plainMat(m.material)||!g||!g.attributes.position||g.morphAttributes.position||m.matrixWorld.determinant()<=0) continue;
    if(Object.values(g.attributes).some(a=>a.isInterleavedBufferAttribute)) continue;
    if(!g.boundingSphere) g.computeBoundingSphere(); sph.copy(g.boundingSphere).applyMatrix4(m.matrixWorld);
    const cast=m.castShadow&&sph.radius>.06;   // tiny parts don't need to throw shadows
    const ak=Object.keys(g.attributes).sort().map(k=>k+g.attributes[k].itemSize+(g.attributes[k].normalized?'n':'')).join(',');
    const k=[sig(m.material),ak,g.index?1:0,cast?1:0,m.receiveShadow?1:0,Math.floor(sph.center.x/CELL),Math.floor(sph.center.z/CELL)].join('#');
    let e=groups.get(k); if(!e) groups.set(k,e={mat:m.material,cast,recv:m.receiveShadow,list:[]}); e.list.push(m); }
  let made=0, hidden=0;
  for(const e of groups.values()){ if(e.list.length<2) continue;
    const geos=e.list.map(m=>{ const g=m.geometry.clone(); g.clearGroups(); g.applyMatrix4(m.matrixWorld); return g; });
    const mg=mergeGeometries(geos,false); geos.forEach(g=>g.dispose()); if(!mg) continue;
    mg.computeBoundingSphere(); mg.computeBoundingBox();
    const mm=new THREE.Mesh(mg,e.mat); mm.castShadow=e.cast; mm.receiveShadow=e.recv; mm.matrixAutoUpdate=false; mm.name='baked'; scene.add(mm); made++;
    for(const m of e.list){ m.visible=false; hidden++; } }
  // whatever stays separate and is tiny stops casting shadows too
  for(const m of all) if(m.visible&&m.castShadow&&!m.isSkinnedMesh&&!dyn.has(m)){ const g=m.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); sph.copy(g.boundingSphere).applyMatrix4(m.matrixWorld); if(sph.radius<=.06) m.castShadow=false; }
  scene.matrixWorldAutoUpdate=true; renderer.shadowMap.needsUpdate=true; PERF.baked=made; PERF.hidden=hidden; window.__pavPerf=PERF;
}catch(err){ console.warn('bake skipped',err); } }
Promise.allSettled(Object.values(assets)).then(()=>clips&&clips()).then(()=>new Promise(r=>setTimeout(r,600))).then(bakeStatic);

