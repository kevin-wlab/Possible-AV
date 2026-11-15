// @models: live-video
/* ===== interactive & tracking page: where things stand and where the camera stops ===== */
const IG=12;
const xFoot=new THREE.MeshBasicMaterial({color:0x1a1a18,transparent:true,opacity:.35,depthWrite:false});
// opening: one portrait screen with a sensor on top, footprints in front of it. The range stands beside it and steps aside after the range shot
const xI0=grp(scene,0,0,0), xRange=grp(xI0,0,0,0);
const xHT=xFieldTex(512,912), xHero=xPortrait(xHT); xHero.position.set(.3,0,-.25); xHero.rotation.y=-.18; xI0.add(xHero);
xSteps(xI0,[[.22,.32,Math.PI-.18,-1],[.42,.22,Math.PI-.18,1]],xFoot);
const xMedT=xFieldTex(768,512); { const m=grp(xRange,4.4,0,-1.1); xFloor(m,2.4,1.6).mesh.material.map=xMedT; const gp=xGoalPost(2.8,2.6); m.add(gp); }
const xBigT=xFieldTex(1024,576);
{ const b=grp(xRange,8.8,0,-1.6); for(const [x,z,ry] of [[-1.55,.45,Q*.95],[0,-.35,0],[1.55,.45,-Q*.95]]){ const s=lvBigScreen(xBigT,2.2,1.24,.15); s.position.set(x,0,z); s.rotation.y=ry; b.add(s); }
  for(const x of [-.9,.9]){ const p=xSensorStand(1.7,.4); p.position.set(x,0,1.2); p.rotation.y=Math.PI+(x<0?.3:-.3); b.add(p); } }
// 01 interactive installations: a floor that follows the steps across it, the projector and sensor overhead
const xI1=grp(scene,IG,0,0), xF1=xFloor(xI1,3.0,2.0), xGP=xGoalPost(3.6,3.0); xGP.position.z=.0; xI1.add(xGP);
const xPath1=xWalk([-1.35,.75],[1.25,-.55],9), xSt1=xSteps(xI1,xPath1,null); xSt1.forEach(m=>m.material.color.set(0xf2efe9));
// 02 sensors & body tracking: the sensor up close, its view opening out, the floor grid lighting where someone stands
const xI2=grp(scene,2*IG,0,0), xSS=xSensorStand(1.55,.75); xSS.position.set(-.55,0,-.35); xSS.rotation.y=.55; xI2.add(xSS);
const xFr=new THREE.Mesh(new THREE.ConeGeometry(1,1,4,1,true),new THREE.MeshBasicMaterial({color:AMBER,transparent:true,opacity:.1,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
const xFrE=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ConeGeometry(1,1,4,1,true)),new THREE.LineBasicMaterial({color:AMBER,transparent:true,opacity:.6,toneMapped:false}));
const xFrG=new THREE.Group(); xFrG.add(xFr,xFrE); xFr.rotation.y=xFrE.rotation.y=Math.PI/4; xI2.add(xFrG);
const xTiles=new THREE.InstancedMesh(new THREE.PlaneGeometry(.23,.23).rotateX(-Q),new THREE.MeshBasicMaterial({toneMapped:false,transparent:true,opacity:.9,depthWrite:false}),120);
{ const mt=new THREE.Matrix4(); let n=0; for(let i=0;i<12;i++) for(let j=0;j<10;j++){ mt.makeTranslation(.2+(i-5.5)*.25,.003,.7+(j-4.5)*.25); xTiles.setMatrixAt(n,mt); xTiles.setColorAt(n,new THREE.Color(0xe0dcd4)); n++; } xI2.add(xTiles); }
const xSt2=xSteps(xI2,[[.12,.76,-.35,-1],[.32,.7,-.35,1]],xFoot);
// 03 motion tracking systems: cameras on poles around a taped area, the wand lifting into their view
const xI3=grp(scene,3*IG,0,0); xTapeSquare(xI3,2.6,2.6); const xMc=[];
for(let k=0;k<6;k++){ const a=k/6*Math.PI*2+Math.PI/6, p=xMocapPole(2.1); p.position.set(Math.sin(a)*1.9,0,Math.cos(a)*1.9-.3); xI3.add(p); p.updateWorldMatrix(true,false); const c=p.userData.cam; c.lookAt(xI3.localToWorld(V(0,1.0,-.3))); xMc.push(p); }
const xWd=xWand(); xI3.add(xWd); const xCs=lvCase(.7,.35,.45); xCs.position.set(.6,0,.5); xCs.rotation.y=-.3; xI3.add(xCs);
const xRays=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xff5a2a,transparent:true,opacity:.0,toneMapped:false})); xI3.add(xRays); { const P=new Float32Array(6*3*2*3); xRays.geometry.setAttribute('position',new THREE.BufferAttribute(P,3)); }
// 04 RFID & NFC triggers: a reader on a plinth, the badge tapping it, the screen answering
const xI4=grp(scene,4*IG,0,0); xI4.add(xPlinth(.46,1.0,.46)); const xRd=xReader(); xRd.position.y=1.0; xI4.add(xRd); const xBd=xBadge(); xI4.add(xBd);
const xWT=xWelcomeTex(), xWs=lvBigScreen(xWT,1.9,1.07,.55); xWs.position.set(.4,0,-1.3); xI4.add(xWs);
// 05 3D & real-time content: the sculpture draws itself on its plinth; the screen behind shows it rendered
const xI5=grp(scene,5*IG,0,0); xI5.add(at(rbox(.6,.85,.6,XM.plinth,.012),-.35,.425,.0)); const xSc=xSculpture(); xSc.position.set(-.35,1.4,0); xI5.add(xSc);
const xRT=xRenderTex(), xRs=lvBigScreen(xRT,2.2,1.24,.5); xRs.position.set(.75,0,-1.4); xRs.rotation.y=-.12; xI5.add(xRs);
const xIs=[[xI0,.5],[xI1,2],[xI2,3],[xI3,4],[xI4,5],[xI5,6.5]];
let xFr2=0; const xWdA=V(), xWdB=V();
updaters.push((t,x)=>{ for(const [g,c] of xIs) g.visible=Math.abs(x-c)<(c===.5||c===6.5?1.6:.9);
  const v=sstep(.25,.8,x)*(1-sstep(1.3,1.62,x)); xRange.scale.setScalar(Math.max(.001,v)); xRange.visible=v>.001;
  // 01: steps appear one by one as the floor is reached, the content following the latest ones
  const u1=sstep(1.45,2.0,x), ns=u1*xSt1.length; xSt1.forEach((m,i)=>{ m.material.opacity=.85*clamp(ns-i); });
  // 02: the view opens out of the sensor
  const u2=sstep(2.45,2.95,x), sw=xSS.userData.sensor; sw.updateWorldMatrix(true,false); const sp=xI2.worldToLocal(sw.getWorldPosition(V())); const L=1.95*u2+.001;
  xFrG.position.copy(sp); xFrG.quaternion.copy(sw.getWorldQuaternion(new THREE.Quaternion())); xFrG.rotateX(-Q); xFr.scale.set(L*.55,L,L*.42); xFrE.scale.copy(xFr.scale); xFr.position.y=xFrE.position.y=-L/2; xFrG.visible=u2>.01; xFr.material.opacity=.07*u2; xFrE.material.opacity=.6*u2;
  // 03: the wand lifts into the middle and the cameras find its markers
  const u3=sstep(3.45,3.95,x); xWd.position.set(lerp(.55,0,u3),lerp(.405,1.15,u3),lerp(.5,-.3,u3)); xWd.rotation.set(0,lerp(-.3,.4+Math.sin(t*.6)*.3*u3,u3),lerp(Q,0,u3));
  // 04: the badge comes down onto the reader
  const u4=sstep(4.45,4.85,x), tap=sstep(4.82,4.92,x); xBd.position.set(lerp(.18,0,u4),1.0+lerp(.3,.03,u4),lerp(.15,0,u4)); xBd.rotation.set(lerp(-.6,0,u4),lerp(.5,.2,u4),0); xRd.userData.ring.material.opacity=.15+.85*tap*(.6+.4*Math.sin(t*6));
  // 05: the sculpture draws itself, then fills in
  const u5=sstep(5.45,6.0,x); xSc.userData.lines.geometry.setDrawRange(0,Math.floor(xSc.userData.n*clamp(u5*1.4))); xSc.userData.solid.material.opacity=sstep(.7,1,u5); xSc.userData.lines.material.opacity=.85*(1-.7*sstep(.75,1,u5)); xSc.rotation.y=t*.25;
  if(xFr2++%3) return;
  if(xI0.visible) xHT.userData.draw(t,[[.5+Math.sin(t*.6)*.18,.58+Math.cos(t*.45)*.1]],1);
  if(xRange.visible){ xMedT.userData.draw(t,[[.3+.4*((t*.1)%1),.5]],1); xBigT.userData.draw(t,[[.5+Math.sin(t*.4)*.3,.6]],1); }
  if(xI1.visible){ const k=Math.max(0,Math.min(xSt1.length-1,Math.floor(ns)-1)), p=xPath1[k], pts=[]; if(ns>.5){ pts.push([(p[0]+1.5)/3,(p[1]+1)/2]); if(k>0){ const q=xPath1[k-1]; pts.push([(q[0]+1.5)/3,(q[1]+1)/2]); } } xF1.tex.userData.draw(t,pts,1); }
  if(xI2.visible){ const lit=u2>.6; let n=0; for(let i=0;i<12;i++) for(let j=0;j<10;j++){ const cx=.2+(i-5.5)*.25, cz=.7+(j-4.5)*.25, d=Math.hypot(cx-.22,cz-.72); xTiles.setColorAt(n++,new THREE.Color(lit&&d<.38?AMBER:(lit&&d<.65?0xedc9a2:0xe0dcd4))); } xTiles.instanceColor.needsUpdate=true; }
  if(xI3.visible){ const P=xRays.geometry.attributes.position.array; let o=0; const balls=xWd.userData.balls; xWd.updateWorldMatrix(true,true);
    for(const p of xMc){ const c=xI3.worldToLocal(p.userData.cam.getWorldPosition(V())); for(const b of balls){ const w=xI3.worldToLocal(b.getWorldPosition(V())); P[o++]=c.x; P[o++]=c.y; P[o++]=c.z; P[o++]=w.x; P[o++]=w.y; P[o++]=w.z; } }
    xRays.geometry.attributes.position.needsUpdate=true; xRays.material.opacity=.45*sstep(.75,1,u3); xRays.visible=u3>.75; }
  if(xI4.visible) xWT.userData.draw(t,tap);
  if(xI5.visible) xRT.userData.draw(t,u5); });
PAGE.keys=(narrow,K,R)=>[
  narrow? R([1.6,1.6,6.6],[.2,1.0,-.2],34) : K([1.7,1.45,5.0],[.25,1.0,-.2],30),                      // hero: a screen that responds
  narrow? R([5.1,8.6,38],[5.1,.5,-1.2],34) : K([4.4,3.2,17.5],[4.6,.95,-1.2],30,-.2),                   // the range
  narrow? R([IG+1.6,7,13.5],[IG,1.2,-.1],34) : K([IG+2.1,4.8,9.8],[IG-.1,1.25,-.1],30),                  // 01 interactive floor
  narrow? R([2*IG+1.6,2.8,7.4],[2*IG+.1,.7,.1],34) : K([2*IG+2.3,2.5,5.8],[2*IG+.25,.75,.1],30),     // 02 sensors
  narrow? R([3*IG+.4,5.8,11.5],[3*IG,1.2,-.3],34) : K([3*IG+1.2,3.6,8.0],[3*IG,.95,-.3],30),             // 03 motion tracking
  narrow? R([4*IG+1.4,2.4,6.4],[4*IG+.35,1.0,-.45],34) : K([4*IG+1.6,1.95,4.6],[4*IG+.3,1.0,-.45],30),    // 04 RFID & NFC
  narrow? R([5*IG+.9,2.2,8.0],[5*IG+.25,1.15,-.5],34) : K([5*IG+1.3,1.8,5.0],[5*IG+.2,1.15,-.5],30),     // 05 real-time 3D
  K([5*IG+1.8,2.1,7.8],[5*IG+.2,.95,-.5],30,0,.25) ];
