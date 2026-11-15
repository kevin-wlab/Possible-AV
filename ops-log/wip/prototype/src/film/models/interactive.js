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
