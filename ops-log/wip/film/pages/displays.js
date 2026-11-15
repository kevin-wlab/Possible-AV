/* ===== displays page: where things stand and where the camera stops ===== */
const dI0=grp(scene,0,0,0), dTurn=grp(dI0,-4.2,0,0); dTurn.add(oledCart());
{ // the range beside the TV: touch screens, then a playback station
  const ts=touchStand(); ts.position.set(-1.75,0,.55); ts.rotation.y=.22; dI0.add(ts); const kk=touchKiosk(); kk.position.set(-.3,0,-.35); kk.rotation.y=.1; dI0.add(kk);
  const pb=playbackStation(); pb.position.set(3.1,0,-1.7); dI0.add(pb); }
const dI1=grp(scene,S,0,0), dStand=touchStand(); dStand.position.set(-.55,0,.3); dStand.rotation.y=.42; dI1.add(dStand);
{ const kk=touchKiosk(); kk.position.set(1.35,0,-.5); kk.rotation.y=-.18; dI1.add(kk); }
const dI2=grp(scene,2*S,0,0), dCase=transparentCase(); dCase.g.rotation.y=-.2; dI2.add(dCase.g);
const dI3=grp(scene,3*S,0,0); { const pb=playbackStation(); pb.position.set(-.5,0,0); dI3.add(pb); }
const dI4=grp(scene,4*S,0,0), dWall=ledWallSection(); dWall.g.rotation.y=-.3; dI4.add(dWall.g);
const dI5=grp(scene,5*S,0,0); { const c=oledCart(); c.position.set(-.75,0,0); c.rotation.y=.16; dI5.add(c); const kk=touchKiosk(); kk.position.set(.95,0,-.2); kk.rotation.y=-.2; dI5.add(kk); }
let dLastU=-1, dFr=0; const dL0=dWall.lift.position.clone();
updaters.push((t,x)=>{ dTurn.rotation.y=.2+sstep(1.5,1.96,x)*2.5;
  const pc=dStand.userData.pc; pc.position.x=pc.userData.x0+sstep(2.5,3.0,x)*.21;
  const u=sstep(3.45,4.0,x); if(Math.abs(u-dLastU)>.003||(u>0&&Math.abs(x-4)<.8&&dFr++%4===0)){ dLastU=u; dCase.gfx.draw(u,t); }
  const e=sstep(5.45,6.0,x)*(1-sstep(6.5,6.95,x)), L=dWall.lift; L.position.set(dL0.x+e*.16,dL0.y+e*.05,dL0.z+e*.85); L.rotation.y=-e*1.0; });
PAGE.keys=(narrow,K,R)=>[
  K([-2.55,1.25,5.5],[-4.15,1.0,0],30),                 // hero: one TV on its stand
  K([-.3,2.5,18.4],[.5,1.35,-.6],30,-.15),               // the range
  K([-2.3,1.35,4.9],[-4.1,1.02,0],30),                   // 01 the TV turns its back
  K([S-1.6,1.75,6.6],[S+.45,1.02,0],30),                // 02 touch
  K([2*S-1.3,1.55,4.5],[2*S+.1,1.22,0],30),             // 03 transparent
  K([3*S-2.2,2.1,11.6],[3*S+.5,1.4,0],30),              // 04 playback station
  K([4*S-1.9,1.5,6.4],[4*S+.25,1.0,0],30),              // 05 LED wall
  K([5*S+1.6,1.9,7.6],[5*S+.1,.95,0],30,0,.25) ];
