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
