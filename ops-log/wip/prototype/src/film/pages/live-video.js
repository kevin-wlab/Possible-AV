/* ===== live video & visuals page: where things stand and where the camera stops ===== */
const LG=12; // sets sit close so the next slides in as the last one leaves
const lvTallyM=()=>new THREE.MeshBasicMaterial({color:0x3a1512,toneMapped:false});
const lvOn=(meshes,on)=>{ for(const m of meshes){ if(!m.userData.own){ m.material=lvTallyM(); m.userData.own=1; } m.material.color.lerpColors(lvTallyOff,lvTallyOn,on); } };
// opening: one camera on its tripod, cabled to a small switcher, a monitor and the encoder on a case. The range stands beside it and steps aside after the range shot
const lI0=grp(scene,0,0,0), lRange=grp(lI0,0,0,0);
const lHero=lvStreamKit(lI0,[-.45,.55,.6],[.5,-.4,-.3]);
const lMid=grp(lRange,3.9,0,-1.0);
{ const a=lvCamRig(1.25,'CAM 1',.34); a.position.set(-.95,0,.35); a.rotation.y=.45; lMid.add(a); const b=lvCamRig(1.3,'CAM 2',.34); b.position.set(1.0,0,.45); b.rotation.y=-.4; lMid.add(b);
  const cs=lvCase(.6,.5,.42); cs.position.set(0,0,-.35); lMid.add(cs); const sw=lvSwitcher(8); sw.position.set(0,cs.userData.top,.02); cs.add(sw); const mo=lvFieldMon(lvPgm()); mo.position.set(0,cs.userData.top+.14,-.13); cs.add(mo); }
const lBig=grp(lRange,7.9,0,-1.3);
{ const f=lvFlypack(); f.userData.lid.rotation.x=-1.72; lBig.add(f); f.userData.mv.userData.draw(0,1,0);
  for(const [x,z,ry,n] of [[-1.5,.5,.5,'CAM 1'],[1.5,.55,-.5,'CAM 2'],[-.2,1.4,.0,'CAM 3']]){ const c=lvCamRig(1.3,n,.36); c.position.set(x,0,z); c.rotation.y=ry; lBig.add(c); }
  const p=lvPTZ('PTZ 1'); const pc=lvCase(.42,.62,.36); pc.position.set(1.15,0,-.55); pc.rotation.y=-.3; lBig.add(pc); p.position.y=pc.userData.top; pc.add(p); }
// 01 live streaming: the camera goes live; its picture runs down the lead to the encoder and onto the screen behind
const lI1=grp(scene,LG,0,0), lSt=lvStreamKit(lI1,[-.75,.35,.6],[.35,-.2,-.25]), lScr1=lvBigScreen(lvPgm(),2.0,1.125,.6); lScr1.position.set(.25,0,-1.7); lI1.add(lScr1);
const lPulse=new THREE.Mesh(new THREE.SphereGeometry(.012,16,10),new THREE.MeshBasicMaterial({color:0xffc27a,toneMapped:false})); lI1.add(lPulse);
const lPCurve=new THREE.CatmullRomCurve3(lSt.lead.geometry.parameters.path.points);
// 02 switchers & production kits: the flypack's lid lifts to the multiview
const lI2=grp(scene,2*LG,0,0), lFp=lvFlypack(); lFp.rotation.y=-.3; lI2.add(lFp);
// 03 VJ & live visuals: a laptop and a pad controller on a case, the visuals growing on the screen as they come up
const lI3=grp(scene,3*LG,0,0), lVis=lvVisuals(), lGrid=lvClipGrid(), lVs=lvBigScreen(lVis,2.4,1.35,.55); lVs.position.set(.2,0,-1.6); lI3.add(lVs);
const lDesk=lvCase(1.1,.74,.6); lDesk.position.set(-.1,0,.25); lDesk.rotation.y=-.12; lI3.add(lDesk);
const lLap=lvLaptop(lGrid); lLap.position.set(-.18,lDesk.userData.top,0); lLap.rotation.y=.1; lDesk.add(lLap); const lPad=lvPads(); lPad.position.set(.28,lDesk.userData.top,.04); lPad.rotation.y=-.15; lDesk.add(lPad);
// 04 hybrid events: the panel on site, a PTZ on the table's edge, the remote guests arriving on the screen
const lI4=grp(scene,4*LG,0,0), lRem=lvRemote(), lHs=lvBigScreen(lRem,2.4,1.35,.6); lHs.position.set(.1,0,-1.9); lI4.add(lHs);
const lTab=lvPanelTable(1.9,.62,.74); lTab.position.set(0,0,.1); lI4.add(lTab);
for(const x of [-.5,.5]){ const c=lvChair(); c.position.set(x,0,-.45); c.rotation.y=Math.PI; lI4.add(c); }
const lGn=[]; for(const x of [-.5,.5]){ const m=lvGooseneck(); m.position.set(x,.74,.18); m.rotation.y=Math.PI; lI4.add(m); lGn.push(m.userData.led); }
const lPtz=lvPTZ('PTZ 1'); { const s=lvPole(1.35); s.position.set(1.5,0,.9); lI4.add(s); lPtz.position.set(1.5,s.userData.top,.9); lPtz.rotation.y=-2.05; lI4.add(lPtz); }
const lIs=[[lI0,.5],[lI1,2],[lI2,3],[lI3,4],[lI4,5.5]];
let lFr=0; const lCam1=lSt.rig.userData.cam.userData.tally, lCamH=lHero.rig.userData.cam.userData.tally;
updaters.push((t,x)=>{ for(const [g,c] of lIs) g.visible=Math.abs(x-c)<(c===.5||c===5.5?1.6:.9);
  const v=sstep(.25,.8,x)*(1-sstep(1.3,1.62,x)); lRange.scale.setScalar(Math.max(.001,v)); lRange.visible=v>.001;
  const live=sstep(1.55,1.95,x); lvOn(lCam1,live); lvOn([lSt.en.userData.led],live); lvOn(lCamH,1); lvOn([lHero.en.userData.led],1);
  const pf=(t*.45)%1; lPulse.position.copy(lPCurve.getPointAt(pf)); lPulse.visible=lI1.visible&&live>.5;
  const o=sstep(2.45,2.95,x); lFp.userData.lid.rotation.x=-1.72*o;
  const k=.15+.85*sstep(3.5,3.98,x), n=6*sstep(4.45,4.9,x); lvOn(lGn,sstep(4.5,4.8,x)); lPtz.userData.yoke.rotation.y=Math.sin(t*.4)*.25;
  if(lFr++%3) return;
  if(lI0.visible||lI1.visible||lRange.visible) lvPgm().userData.draw(t,lI1.visible?live:1);
  if(lI0.visible) lHero.en.userData.scr.userData.draw(t,1); if(lI1.visible) lSt.en.userData.scr.userData.draw(t,live);
  if(lI2.visible){ const pg=Math.floor(t/3)%4; lFp.userData.mv.userData.draw(t,sstep(2.7,2.95,x),pg); lFp.userData.sw.userData.set(pg,(pg+1)%4); }
  if(lI3.visible){ lVis.userData.draw(t,k); lGrid.userData.draw(t,k); lPad.userData.draw(t,k); }
  if(lI4.visible) lRem.userData.draw(t,n); });
PAGE.keys=(narrow,K,R)=>[
  narrow? R([1.6,1.7,7.6],[-.05,.75,.0],34) : K([1.45,1.4,4.5],[.0,.82,.1],30),                      // hero: a camera and a small kit
  narrow? R([4.3,7.6,36],[4.3,.4,-1.0],34) : K([4.5,3.1,19.5],[4.7,.85,-1.0],30,-.2),                   // the range
  narrow? R([LG+.9,2.5,10.2],[LG+.15,.8,-.6],34) : K([LG+1.6,1.8,6.4],[LG-.2,1.0,-.6],30),            // 01 live streaming
  narrow? R([2*LG+.9,2.0,4.4],[2*LG,.55,0],34) : K([2*LG+1.0,1.7,3.5],[2*LG-.1,.62,-.05],30),          // 02 the flypack opens
  narrow? R([3*LG+1.3,2.6,8.6],[3*LG+.3,1.0,-.6],34) : K([3*LG+1.3,2.2,5.9],[3*LG+.05,.92,-.55],30),     // 03 visuals
  narrow? R([4*LG+1.5,2.4,9.6],[4*LG+.45,.95,-.3],34) : K([4*LG+2.1,2.1,6.9],[4*LG+.2,.92,-.5],30),         // 04 hybrid
  K([4*LG+1.8,2.6,8.4],[4*LG,1.0,-.6],30,0,.25) ];
