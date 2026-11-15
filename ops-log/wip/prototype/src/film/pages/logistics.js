// @models: live-video
/* ===== logistics & touring page: where things stand and where the camera stops ===== */
const GG=16; // the truck is long, so these sets sit a little further apart
// opening: one flight case, with two more stacked on a dolly behind it. The range steps aside after the range shot
const gI0=grp(scene,0,0,0), gRange=grp(gI0,0,0,0);
{ const c=gCase(.6,.55,.45,'POSSIBLE AV','01'); c.position.set(.35,0,.35); c.rotation.y=-.35; gI0.add(c); const s=gStack(); s.position.set(-.55,0,-.45); s.rotation.y=.3; gI0.add(s); }
{ const m=grp(gRange,3.9,0,-1.2); for(let i=0;i<4;i++){ const c=gCase(.6,.55,.45,'POSSIBLE AV',String(20+i)); c.position.set(-.95+i*.64,0,.25); m.add(c); } const s=gStack(); s.position.set(0,0,-.55); m.add(s); }
{ const t=gTruck(); t.position.set(9.3,0,-2.1); t.rotation.y=-.1; gRange.add(t); }
// 01 delivery: the truck backed up to our dock, the door rolling up and the cases rolling out
const gI1=grp(scene,GG,0,0); gI1.rotation.y=-.9; const gT1=gTruck(); gI1.add(gT1); gT1.userData.gate.visible=false; const gDk=gDock(); gDk.position.set(2.6+.12+2.2,0,0); gI1.add(gDk);
const gRoll=[]; for(let i=0;i<3;i++){ const c=gCase(.6,.55,.45,'POSSIBLE AV',String(30+i)); c.rotation.y=Q; gI1.add(c); gRoll.push(c); }
// 01 load-in: at your door, the liftgate lowers a case to the street; another stands open
const gI2=grp(scene,2*GG,0,0); gI2.rotation.y=-.9; const gT2=gTruck(); gT2.position.set(-2.2,0,0); gI2.add(gT2); const gLc=gCase(.6,.55,.45,'POSSIBLE AV','08'); gI2.add(gLc);
const gOp=gOpenCase(); gOp.position.set(1.7,0,1.1); gOp.rotation.y=-.5; gI2.add(gOp);
// 02 touring: the route out of New York, a pin at every stop, the truck travelling it
const gI3=grp(scene,3*GG,0,0), gR=gRoute(gI3,[[-2.6,.9],[-1.6,.2],[-.4,.5],[.6,-.4],[1.6,-.1],[2.6,-.9]]);
const gPins=[gPin('NEW YORK',true),gPin(''),gPin(''),gPin(''),gPin('')]; [[-2.6,.9],[-.4,.5],[.6,-.4],[1.6,-.1],[2.6,-.9]].forEach(([x,z],i)=>{ gPins[i].position.set(x,0,z); gI3.add(gPins[i]); });
const gMini=gTruck(); gMini.scale.setScalar(.12); gI3.add(gMini);
const gIs=[[gI0,.5],[gI1,2],[gI2,3],[gI3,4.5]];
updaters.push((t,x)=>{ for(const [g,c] of gIs) g.visible=Math.abs(x-c)<(c===.5||c===4.5?1.6:.9);
  const v=sstep(.25,.8,x)*(1-sstep(1.3,1.62,x)); gRange.scale.setScalar(Math.max(.001,v)); gRange.visible=v>.001;
  // 01: the door rolls up, then the cases roll out one after another onto the dock
  const o=sstep(1.4,1.75,x); gT1.userData.set(o,0); const r=sstep(1.7,2.0,x);
  gRoll.forEach((c,i)=>{ const u=clamp(r*1.8-i*.4); c.position.set(lerp(1.6-i*.7,3.4+i*.0,u),lerp(1.05,1.12,sstep(.35,.45,u)),lerp(0,-.75+i*.75,u)); c.visible=u>0||o>.6; });
  // load-in: the liftgate swings down and lowers the case; the open case's lid lifts
  const l=sstep(2.4,2.95,x); gT2.userData.set(1,l); const RX=gT2.position.x+gT2.userData.RX; gLc.position.set(RX+.72,lerp(.995,.075,clamp(l*2-1)),0); gLc.rotation.y=Q;
  const lid=gOp.userData.lid; lid.rotation.x=-1.25*sstep(2.6,2.95,x); lid.position.z=-.22*sstep(2.6,2.95,x);
  // touring: the truck travels the route; the pins light as it passes
  const u=(sstep(3.4,4.2,x)*.85+(t*.02)%.15); const p=gR.curve.getPointAt(Math.min(.999,u)), tg=gR.curve.getTangentAt(Math.min(.999,u)); gMini.position.set(p.x,0,p.z); gMini.rotation.y=Math.atan2(tg.z,-tg.x); });
PAGE.keys=(narrow,K,R)=>[
  narrow? R([1.6,1.9,6.4],[-.1,.5,-.05],34) : K([1.5,1.35,4.0],[.0,.55,-.05],30),                     // hero: a case
  narrow? R([5.4,9.8,45],[5.4,.8,-1.5],34) : K([5.0,4.6,29],[5.4,1.3,-1.5],30,-.2),                     // the range
  narrow? R([GG+5.6,4.6,11.5],[GG+1.8,1.0,2.4],34) : K([GG+6.8,3.8,9.2],[GG+2.0,1.0,2.4],30),               // 01 the dock
  narrow? R([2*GG+4.2,3.4,9.6],[2*GG+.5,.6,1.3],34) : K([2*GG+4.6,2.8,7.4],[2*GG+.55,.6,1.3],30),        // load-in at the door
  narrow? R([3*GG,8.2,12.5],[3*GG,.2,0],34) : K([3*GG+.2,5.0,7.6],[3*GG-.5,.3,0],30),                 // 02 touring
  K([3*GG+1.0,5.4,8.6],[3*GG,.4,0],30,0,.25) ];
