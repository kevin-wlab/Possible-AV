/* ===== logistics & touring models: definitions only, nothing is added to the scene here ===== */
const GM={
  paint:std(0xf3f1ec,.32,.05,{envMapIntensity:1}), cab:std(0x1d1e21,.3,.4,{envMapIntensity:1.1}), chrome:std(0xd9d6cf,.18,1,{envMapIntensity:1.3}), tire:std(0x161618,.92,0,{bumpMap:speckT,bumpScale:.3}),
  rim:std(0xb9b6af,.3,.9,{envMapIntensity:1}), frame:std(0x141416,.6,.3), glass:std(0x0d1218,.06,.3,{envMapIntensity:2.4}), lamp:std(0xf3efe6,.1,.2,{envMapIntensity:2,emissive:0x333028}),
  red:std(0xa82a1e,.3,.1,{emissive:0x3a0a06}), concrete:std(0xbdb8ae,.95,0,{bumpMap:speckT,bumpScale:.5,envMapIntensity:.3}), bumper:std(0x1a1a1b,.9,0), plate:std(0x8f8d88,.45,.85,{bumpMap:weaveF,bumpScale:.2}),
  lam:std(0x17181a,.62,.08,{bumpMap:speckT,bumpScale:.16}), foam:std(0x2a2b2e,1,0,{envMapIntensity:.1,bumpMap:weaveF,bumpScale:.3}),
};
const grb=(w,h,d,m,r=.003,cast=true)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.max(.0004,Math.min(r,w/2-.0002,h/2-.0002,d/2-.0002))),m,cast);
const gTubeG=(pts,r,seg=40,rad=6)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>p.isVector3?p:V(...p))),seg,r,rad);

/* ---------- the flight case: laminate panels, aluminium extrusions, ball corners, recessed handles and latches, casters ---------- */
function gCase(W=.6,H=.55,D=.45,label='POSSIBLE AV',num='01',wheels=true){ const g=new THREE.Group(), st=new THREE.Group(), Y0=wheels?.075:.012;
  st.add(at(rbox(W,H,D,GM.lam,.01),0,Y0+H/2,0));
  for(const sz of [-1,1]){ for(const sy of [0,1]) st.add(at(rbox(W+.012,.024,.024,M.alu,.006),0,Y0+sy*H,sz*D/2)); for(const sx of [-1,1]){ st.add(at(rbox(.024,H,.024,M.alu,.006),sx*W/2,Y0+H/2,sz*D/2)); for(const sy of [0,1]) st.add(at(sph(.026,M.steel,14,10),sx*W/2,Y0+sy*H,sz*D/2)); } }
  for(const sx of [-1,1]) for(const sy of [0,1]) st.add(at(rbox(.024,.024,D,M.alu,.006),sx*W/2,Y0+sy*H,0));
  st.add(at(rbox(W+.014,.02,D+.014,M.alu,.005),0,Y0+H*.78,0));                                     // the lid seam
  for(const sx of [-1,1]){ const hd=grp(st,sx*(W/2+.001),Y0+H*.5,0); hd.add(grb(.006,.1,.18,M.alu,.003)); hd.add(at(grb(.008,.07,.13,GM.frame,.003),sx*.001,0,0)); hd.add(at(grb(.016,.016,.11,M.steel,.007),sx*.009,-.018,0)); }
  for(const x of [-W/2+.13,W/2-.13]){ const l=grp(st,x,Y0+H*.78,D/2+.001); l.add(grb(.07,.08,.006,M.alu,.003)); l.add(at(rot(cyl(.02,.02,.005,GM.frame,20),Q),0,-.005,.004)); l.add(at(grb(.03,.01,.008,M.steel,.003),0,-.005,.007)); }
  const lab=new THREE.Mesh(new THREE.PlaneGeometry(.2,.06),new THREE.MeshBasicMaterial({toneMapped:false,map:ctex(400,120,(c,w,h)=>{ c.fillStyle='#efece6'; c.fillRect(0,0,w,h); c.fillStyle='#E8892D'; c.beginPath(); c.arc(30,40,12,0,7); c.fill(); c.fillStyle='#1a1a18'; c.font='700 34px "Geist", sans-serif'; c.fillText(label,52,52); c.font='600 26px "Geist Mono", monospace'; c.fillStyle='#55524c'; c.fillText('CASE '+num+' · THIS WAY UP ↑',18,98); })}));
  lab.position.set(-W/2+.14,Y0+H*.38,D/2+.002); st.add(lab);
  if(wheels) for(const sx of [-1,1]) for(const sz of [-1,1]){ const w=grp(st,sx*(W/2-.07),0,sz*(D/2-.07)); w.add(at(grb(.07,.012,.07,M.steel,.003),0,Y0-.006,0)); w.add(at(grb(.02,.03,.04,M.steel,.003),0,Y0-.025,0)); w.add(at(rot(cyl(.03,.03,.022,M.rubber,20),0,0,Q),0,.03,0)); w.add(at(rot(cyl(.014,.014,.024,M.alu,14),0,0,Q),0,.03,0)); }
  g.add(st); g.userData={top:Y0+H+.012,W,H,D,Y0}; return g; }
// a case with its lid off, foam inside with cut-outs and the gear in them
function gOpenCase(){ const g=new THREE.Group(), W=.62,H=.42,D=.48, Y0=.075; const c=gCase(W,H,D,'POSSIBLE AV','07'); g.add(c);
  const lid=grp(g,0,Y0+H*.78,0); lid.add(at(rbox(W,H*.22,D,GM.lam,.01),0,H*.11,0)); lid.add(at(box(W-.04,.02,D-.04,GM.foam),0,-.008,0));
  const fo=at(box(W-.04,.006,D-.04,GM.foam),0,Y0+H*.78-.004,0); g.add(fo);
  const cut=new THREE.MeshStandardMaterial({color:0x0f1012,roughness:1}); for(const [x,z,w,d] of [[-.15,-.06,.2,.3],[.1,-.1,.2,.18],[.1,.12,.16,.12]]){ const m=box(w,.002,d,cut); m.position.set(x,Y0+H*.78-.0005,z); g.add(m); }
  { const p=new THREE.Group(); p.add(rbox(.18,.07,.26,M.white,.02)); p.add(at(rot(cyl(.03,.034,.03,M.black,24),Q),.04,0,.13)); p.position.set(-.15,Y0+H*.78+.03,-.06); g.add(p); }   // a projector in its slot
  { const m=new THREE.Group(); m.add(rot(cyl(.018,.014,.17,M.satin,18),0,0,Q)); m.add(at(sph(.026,M.steel,18,12),-.1,0,0)); m.position.set(.1,Y0+H*.78+.02,-.1); g.add(m); }      // a microphone
  { const k=new THREE.Mesh(new THREE.TorusGeometry(.05,.008,10,40),M.black); k.rotation.x=Q; k.position.set(.1,Y0+H*.78+.01,.12); g.add(k); }                                     // a coiled lead
  g.userData={lid,case:c}; return g; }
// a stack of cases on a flat dolly
function gStack(){ const g=new THREE.Group(); const d=new THREE.Group(); d.add(at(rbox(1.25,.03,.62,std(0x6a5a46,.8,0),.006),0,.09,0)); for(const sx of [-1,1]) for(const sz of [-1,1]){ d.add(at(rot(cyl(.04,.04,.03,M.rubber,20),0,0,Q),sx*.5,.045,sz*.24)); d.add(at(grb(.06,.04,.05,M.steel,.003),sx*.5,.075,sz*.24)); } g.add(d);
  const a=gCase(.6,.5,.45,'POSSIBLE AV','12',false); a.position.set(-.3,.1,0); g.add(a); const b=gCase(.6,.5,.45,'POSSIBLE AV','13',false); b.position.set(.31,.1,0); g.add(b); const c=gCase(.6,.38,.45,'POSSIBLE AV','14',false); c.position.set(-.3,.1+.512+.012,0); g.add(c); return g; }

/* ---------- the box truck: cab, chassis, a white box with the name on it, a roll-up door and a liftgate ---------- */
function gWheel(dual=false){ const g=new THREE.Group(), R=.48, T=.28;
  const tire=lathe([[.3,-T/2],[.42,-T/2],[.46,-T/2+.02],[R,-T/2+.07],[R,T/2-.07],[.46,T/2-.02],[.42,T/2],[.3,T/2]],GM.tire,48); tire.rotation.x=Q; g.add(tire);
  const rim=lathe([[0,T/2-.02],[.12,T/2-.025],[.18,T/2-.06],[.29,T/2-.07],[.31,T/2-.02],[.31,-T/2+.02],[0,-T/2+.02]],GM.rim,40); rim.rotation.x=Q; g.add(rim);
  for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; g.add(at(rot(cyl(.012,.012,.03,GM.chrome,8),Q),Math.cos(a)*.09,Math.sin(a)*.09,T/2-.01)); }
  g.add(at(rot(cyl(.05,.06,.04,GM.chrome,24),Q),0,0,T/2)); if(dual){ const d=gWheel(false); d.position.z=-T-.02; g.add(d); } return g; }
function gTruckSign(){ return ctex(1024,400,(c,w,h)=>{ c.fillStyle='#f3f1ec'; c.fillRect(0,0,w,h); c.fillStyle='#E8892D'; c.beginPath(); c.arc(150,175,46,0,7); c.fill(); c.fillStyle='#1a1a18'; c.font='600 120px "Geist", sans-serif'; c.fillText('Possible AV',230,215);
  c.font='500 34px "Geist Mono", monospace'; c.fillStyle='#55524c'; c.fillText('AV · RENTAL · INSTALLATION · PRODUCTION',236,280); c.fillText('BROOKLYN, NEW YORK',236,328); c.fillStyle='#E8892D'; c.fillRect(0,h-26,w,26); }); }
function gTruck(){ const g=new THREE.Group(), st=new THREE.Group(), BL=5.2, BH=2.45, BW=2.4, BY=1.05, CL=1.9, X0=-BL/2;   // box from x=X0 to X0+BL, cab in front at -x
  // chassis rails, fuel tank, step, mud flaps
  for(const sz of [-1,1]) st.add(at(box(BL+CL+.3,.2,.12,GM.frame),-CL/2,.72,sz*.45));
  st.add(at(rot(cyl(.26,.26,.8,GM.chrome,32),0,0,Q),X0+.9,.62,.85)); for(const x of [X0+.6,X0+1.2]) st.add(at(grb(.06,.56,.58,GM.frame,.01),x,.62,.85));
  for(const sz of [-1,1]) for(const x of [X0+BL-1.15,X0+.2-CL+.7]) st.add(at(grb(.5,.4,.02,M.rubber,.005),x+.35,.42,sz*1.12));
  // the box: smooth white panels, a rub rail, marker lights, the name both sides
  st.add(at(rbox(BL,BH,BW,GM.paint,.04),X0+BL/2,BY+BH/2,0)); st.add(at(box(BL+.02,.12,BW+.02,GM.frame),X0+BL/2,BY+.06,0));
  for(const sz of [-1,1]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1.64),new THREE.MeshBasicMaterial({map:gTruckSign()})); m.position.set(X0+BL/2,BY+BH*.56,sz*(BW/2+.003)); if(sz<0) m.rotation.y=Math.PI; st.add(m);
    for(let i=0;i<4;i++) st.add(at(grb(.06,.03,.02,i%3?std(AMBER,.3,0,{emissive:0x553311}):GM.red,.008),X0+.3+i*(BL-.6)/3,BY+BH-.12,sz*(BW/2+.01))); }
  for(let i=0;i<3;i++) st.add(at(grb(.05,.025,.03,std(AMBER,.3,0,{emissive:0x553311}),.008),X0+1.7+i*.25,BY+BH+.01,BW/2-.1));
  // the rear: frame, the roll-up door (rolls up), tail lights, the liftgate stowed under
  const RX=X0+BL+.005; st.add(at(box(.06,BH,.12,GM.chrome),RX,BY+BH/2,BW/2-.06)); st.add(at(box(.06,BH,.12,GM.chrome),RX,BY+BH/2,-BW/2+.06)); st.add(at(box(.06,.14,BW,GM.chrome),RX,BY+BH-.07,0));
  for(const sz of [-1,1]) st.add(at(grb(.03,.24,.12,GM.red,.01),RX+.02,BY-.2,sz*1.0));
  // the cab: a moulded side profile, glass, grille, lamps, mirrors and steps
  const cab=lvProfile([[0,0],[1.7,0],[1.92,.12],[1.95,.85],[1.85,1.1],[1.55,2.1],[1.4,2.25],[0,2.3],[-.05,2.1],[-.05,.1]],2.3,GM.paint,.03,[.04,.05,.06,.06,.2,.15,.1,.06,.05,.04]);
  cab.position.set(X0-.05,.62,0); cab.rotation.y=-Q; st.add(cab);
  const ws=new THREE.Mesh(new THREE.PlaneGeometry(2.0,1.08),GM.glass); ws.position.set(X0-1.745,.62+1.6,0); ws.rotation.set(0,-Q,0); ws.rotateX(.29); st.add(ws);
  for(const sz of [-1,1]){ const sw=new THREE.Mesh(new THREE.PlaneGeometry(1.0,.75),GM.glass); sw.position.set(X0-.75,.62+1.75,sz*1.186); if(sz<0) sw.rotation.y=Math.PI; st.add(sw);
    st.add(at(box(1.15,.012,.01,GM.frame),X0-.85,.62+1.2,sz*1.187)); st.add(at(box(.012,1.2,.01,GM.frame),X0-.28,.62+.75,sz*1.187)); st.add(at(grb(.12,.03,.02,GM.chrome,.008),X0-.45,.62+1.1,sz*1.195));
    const mr=grp(st,X0-1.55,.62+1.85,sz*1.32); mr.add(grb(.08,.4,.2,GM.cab,.03)); mr.add(at(box(.004,.34,.16,GM.glass),-.042,0,0)); st.add(rod2(V(X0-1.55,.62+1.7,sz*1.17),V(X0-1.55,.62+1.7,sz*1.28),.012,GM.cab));
    for(const y of [.25,.5]) st.add(at(grb(.32,.04,.22,GM.chrome,.01),X0-.75,y,sz*1.12)); }
  st.add(at(grb(.04,.62,1.7,GM.cab,.02),X0-2.045,.62+.5,0)); for(let i=0;i<6;i++) st.add(at(box(.012,.03,1.5,GM.chrome),X0-2.07,.62+.25+i*.09,0));
  for(const sz of [-1,1]){ st.add(at(grb(.04,.18,.36,GM.lamp,.02),X0-2.045,.62+.62,sz*.88)); st.add(at(grb(.03,.06,.22,std(AMBER,.3,0,{emissive:0x553311}),.01),X0-2.045,.62+.45,sz*.9)); }
  st.add(at(grb(.22,.3,2.36,GM.frame,.03),X0-2.08,.45,0));                                          // the bumper
  const lab=new THREE.Mesh(new THREE.PlaneGeometry(.5,.12),new THREE.MeshBasicMaterial({map:ctex(500,120,(c,w,h)=>{ c.fillStyle='#1a1a18'; c.fillRect(0,0,w,h); c.fillStyle='#f3f1ec'; c.font='600 64px "Geist", sans-serif'; c.fillText('Possible AV',30,84); })})); lab.position.set(X0-2.075,.62+.98,0); lab.rotation.y=-Q; st.add(lab);
  g.add(st);
  // wheels: steer axle under the cab, dual rear axle under the box
  for(const sz of [-1,1]){ const f=gWheel(false); f.position.set(X0-1.05,.48,sz*1.0); if(sz<0) f.rotation.y=Math.PI; g.add(f); const r=gWheel(true); r.position.set(X0+BL-1.15,.48,sz*1.02); if(sz<0) r.rotation.y=Math.PI; g.add(r); }
  // live parts: the door and the liftgate
  const doorT=ctex(64,512,(c,w,h)=>{ c.fillStyle='#e9e6df'; c.fillRect(0,0,w,h); for(let y=0;y<h;y+=24){ c.fillStyle='#cfcbc2'; c.fillRect(0,y,w,3); c.fillStyle='#f7f5f0'; c.fillRect(0,y+3,w,2); } },[1,1]);
  const door=new THREE.Mesh(new THREE.PlaneGeometry(BW-.24,BH-.16),std(0xffffff,.4,.2,{map:doorT})); door.rotation.y=Q; const dG=grp(g,RX+.01,BY+BH-.14,0); door.position.y=-(BH-.16)/2; dG.add(door);
  const inside=new THREE.Mesh(new THREE.PlaneGeometry(BW-.24,BH-.16),new THREE.MeshBasicMaterial({color:0x151516})); inside.rotation.y=Q; inside.position.set(RX+.004,BY+BH/2-.07,0); g.add(inside);
  const lg=grp(g,RX+.06,BY-.08,0); const pl=new THREE.Group(); pl.add(at(rbox(1.3,.05,BW-.1,GM.plate,.01),.65,0,0)); pl.add(at(box(.04,.06,BW-.1,GM.frame),1.3,.02,0)); lg.add(pl);
  for(const sz of [-1,1]) g.add(at(box(.08,.9,.08,GM.frame),RX+.04,BY-.5,sz*(BW/2-.25)));
  const set=(open,lower)=>{ dG.scale.y=Math.max(.04,1-open); door.material.map.repeat.set(1,Math.max(.04,1-open)); pl.rotation.z=lerp(Q,0,clamp(lower*2)); lg.position.y=lerp(BY-.08,.05,clamp(lower*2-1)); };
  set(0,0); g.userData={set,BL,CL,X0,RX,BY,gate:lg}; return g; }

/* ---------- the studio loading dock: a concrete platform with bumpers, a dock plate and a roller door behind ---------- */
function gDock(W=4.4,D=3.2,H=1.12){ const g=new THREE.Group(), st=new THREE.Group();   // the open edge faces -x (the truck backs up to it); the building wall is at +x
  st.add(at(rbox(W,H,D,GM.concrete,.02),0,H/2,0)); st.add(at(box(.08,.06,D+.01,M.steel),-W/2+.04,H-.03,0));
  for(const sz of [-.95,.95]) st.add(at(grb(.14,.4,.32,GM.bumper,.03),-W/2-.07,H-.3,sz));
  const dp=at(box(.5,.03,1.9,GM.plate),-W/2+.25,H+.016,0); st.add(dp); st.add(at(box(.5,.004,.06,std(AMBER,.5,0)),-W/2+.25,H+.033,.92)); st.add(at(box(.5,.004,.06,std(AMBER,.5,0)),-W/2+.25,H+.033,-.92));
  for(const sz of [-1.45,1.45]){ st.add(at(cyl(.06,.06,1.0,std(0xe9b400,.5,0),18),-W/2+.2,H+.5,sz)); st.add(at(sph(.06,std(0xe9b400,.5,0),16,10),-W/2+.2,H+1.0,sz)); }
  g.add(st); g.userData={H,W,D}; return g; }

/* ---------- touring: the route drawn across the ground, pins at each stop, a small truck travelling it ---------- */
function gRoute(G,pts){ const curve=new THREE.CatmullRomCurve3(pts.map(p=>V(p[0],.012,p[1]))), tube=mesh(new THREE.TubeGeometry(curve,240,.018,6),std(AMBER,.5,0,{emissive:0x3a1e08}),false); G.add(tube);
  const dash=new THREE.InstancedMesh(new THREE.BoxGeometry(.08,.004,.02),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}),60), mt=new THREE.Matrix4(), q=new THREE.Quaternion(), up=V(0,1,0);
  for(let i=0;i<60;i++){ const t=i/60, p=curve.getPointAt(t), tg=curve.getTangentAt(t); q.setFromAxisAngle(up,Math.atan2(-tg.z,tg.x)); mt.compose(V(p.x,.032,p.z),q,V(1,1,1)); dash.setMatrixAt(i,mt); } G.add(dash);
  return {curve,tube}; }
function gPin(label,home=false){ const g=new THREE.Group(); g.add(at(cyl(.16,.18,.03,home?std(AMBER,.4,0):M.black,32),0,.015,0)); g.add(at(cyl(.012,.012,.55,M.steel,10),0,.3,0)); g.add(at(sph(.06,home?std(AMBER,.4,0,{emissive:0x553311}):M.black,20,14),0,.6,0));
  if(label){ const t=new THREE.Mesh(new THREE.PlaneGeometry(.7,.16),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false,map:ctex(560,128,(c,w,h)=>{ c.fillStyle='#1a1a18'; c.beginPath(); c.roundRect(4,8,w-8,h-16,22); c.fill(); c.fillStyle='#f3f1ec'; c.font='600 52px "Geist Mono", monospace'; c.textAlign='center'; c.fillText(label,w/2,84); })})); t.position.set(0,.82,0); g.add(t); g.userData.label=t; }
  return g; }

/* what stands for Logistics on the homepage: two cases stacked on a dolly and one beside it, ready to load */
HERO.logistics=(G)=>{ const s=gStack(); s.position.set(-.2,0,0); s.rotation.y=.25; G.add(s); const c=gCase(.6,.55,.45,'POSSIBLE AV','03'); c.position.set(.95,0,.35); c.rotation.y=-.35; G.add(c); };
