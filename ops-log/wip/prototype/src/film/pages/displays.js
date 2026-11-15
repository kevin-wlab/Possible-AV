/* ===== displays page: where things stand and where the camera stops ===== */
const DG=12; // groups sit closer than DG so the next screen slides in as the last one leaves
const dI0=grp(scene,0,0,0), dTurn=grp(dI0,-4.2,0,0), dRange=grp(dI0,0,0,0); dTurn.add(oledCart());
{ // the range beside the TV: touch screens, then a playback station. After the range shot they step aside so the camera never flies through them
  const ts=touchStand(); ts.position.set(-1.75,0,.55); ts.rotation.y=.22; dRange.add(ts); const kk=touchKiosk(); kk.position.set(-.3,0,-.35); kk.rotation.y=.1; dRange.add(kk);
  const pb=playbackStation(); pb.position.set(3.1,0,-1.7); dRange.add(pb); }
const dI1=grp(scene,DG,0,0), dStand=touchStand(); dStand.position.set(-.55,0,.3); dStand.rotation.y=.42; dI1.add(dStand);
{ const kk=touchKiosk(); kk.position.set(1.35,0,-.5); kk.rotation.y=-.18; dI1.add(kk); }
const dI2=grp(scene,2*DG,0,0), dCase=transparentCase(); dCase.g.rotation.y=-.2; dI2.add(dCase.g);
const dI3=grp(scene,3*DG,0,0); { const pb=playbackStation(); pb.position.set(-.5,0,0); dI3.add(pb); }
const dI4=grp(scene,4*DG,0,0), dWall=ledWallSection(); dWall.g.rotation.y=-.3; dI4.add(dWall.g);
const dI5=grp(scene,5*DG,0,0); { const c=oledCart(); c.position.set(-.75,0,0); c.rotation.y=.16; dI5.add(c); const kk=touchKiosk(); kk.position.set(.95,0,-.2); kk.rotation.y=-.2; dI5.add(kk); }
let dLastU=-1, dFr=0; const dL0=dWall.lift.position.clone();
updaters.push((t,x)=>{ const gone=sstep(1.3,1.62,x); dRange.scale.setScalar(Math.max(.001,1-gone)); dRange.visible=gone<.999; dTurn.rotation.y=.2+sstep(1.5,1.96,x)*2.5;
  const pc=dStand.userData.pc; pc.position.x=pc.userData.x0+sstep(2.5,3.0,x)*.21;
  const u=sstep(3.45,4.0,x); if(Math.abs(u-dLastU)>.003||(u>0&&Math.abs(x-4)<.8&&dFr++%4===0)){ dLastU=u; dCase.gfx.draw(u,t); }
  const e=sstep(5.45,6.0,x)*(1-sstep(6.5,6.95,x)), L=dWall.lift; L.position.set(dL0.x+e*.16,dL0.y+e*.05,dL0.z+e*.85); L.rotation.y=-e*1.0; });
PAGE.keys=(narrow,K,R)=>[
  K([-2.55,1.25,5.5],[-4.15,1.0,0],30),                 // hero: one TV on its stand
  narrow? R([-10.6,4.0,19.5],[-1.5,1.05,-.6],32) : K([.4,2.7,22.5],[.75,1.3,-.6],30,-.2),                 // the range
  K([-2.3,1.35,4.9],[-4.1,1.02,0],30),                   // 01 the TV turns its back
  narrow? R([DG-1.9,1.9,8.8],[DG+.35,1.15,0],34) : K([DG-1.6,1.75,6.6],[DG+.45,1.02,0],30),                // 02 touch
  K([2*DG-1.9,1.75,6.4],[2*DG+.15,1.05,0],30),             // 03 transparent
  narrow? R([3*DG-2.9,3.0,20.5],[3*DG+.35,1.45,0],34) : K([3*DG-3.4,2.3,13.8],[3*DG+.1,1.45,0],30),              // 04 playback station
  K([4*DG-2.2,1.55,7.4],[4*DG+.1,1.0,0],30),              // 05 LED wall
  K([5*DG+1.6,2.0,8.2],[5*DG+.1,1.2,0],30,0,.25) ];
