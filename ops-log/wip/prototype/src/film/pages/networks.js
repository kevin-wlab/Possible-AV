/* ===== networks & computers page: where things stand and where the camera stops ===== */
const NG=12; // sets sit close so the next slides in as the last one leaves
// opening: one access point on its stand, wired to a switch in its case. The range stands beside it and steps aside after the range shot
const nI0=grp(scene,0,0,0), nRange=grp(nI0,0,0,0);
const nHero=netEventKit(nI0,[.62,.5,-.3],[[-.6,-.1,.25,1.7,4]],1.25);
const nMid=grp(nRange,4.4,0,-1.0), nMidKit=netEventKit(nMid,[0,.7,0],[[-1.3,-.3,.3,1.7,2],[0,-.9,0,1.7,4],[1.3,-.3,-.3,1.7,6]],1.3);
{ const r=netRack(30); r.position.set(8.4,0,-1.1); r.rotation.y=-.35; nRange.add(r); }
// 01 event Wi-Fi: the case opens out to three access points, coverage spreading over the floor
const nI1=grp(scene,NG,0,0), nEv=netEventKit(nI1,[0,1.1,0],[[-1.6,-.2,.35,1.75,2],[0,-.9,0,1.75,4],[1.6,-.2,-.35,1.75,6]],1.6);
// 02 permanent installs: the rack, its glass door swinging open and the storage drawer sliding out
const nI2=grp(scene,2*NG,0,0), nRk=netRack(30); nRk.rotation.y=-.42; nI2.add(nRk);
const nDoor=nRk.userData.door, nSlide=nRk.userData.slide, nS0=nSlide.position.clone();
// 03 computer rental: a workstation, the screen coming on
const nI3=grp(scene,3*NG,0,0), nWs=netWorkstation(); nWs.rotation.y=-.3; nI3.add(nWs);
// 04 custom PCs: a tower on a plinth, its side panel lifting away
const nI4=grp(scene,4*NG,0,0), nTw=netTower(); nTw.rotation.y=-.6; nTw.position.y=.47; nI4.add(nTw);
nI4.add(at(rbox(.62,.45,.42,M.satin,.012),0,.225,0)); const nPan=nTw.userData.panel, nP0=nPan.position.clone();
const nIs=[[nI0,.5],[nI1,2],[nI2,3],[nI3,4],[nI4,5.5]];
updaters.push((t,x)=>{ for(const [g,c] of nIs) g.visible=Math.abs(x-c)<(c===.5||c===5.5?1.6:.9);
  const v=sstep(.25,.8,x)*(1-sstep(1.3,1.62,x)); nRange.scale.setScalar(Math.max(.001,v)); nRange.visible=v>.001;
  nEv.set(sstep(1.5,2.0,x));
  const o=sstep(2.5,2.95,x); nDoor.rotation.y=-1.75*o; nSlide.position.z=nS0.z+.42*sstep(2.75,3.0,x);
  if(nI3.visible && nWs.userData.draw) nWs.userData.draw(t);
  const p=sstep(4.5,4.95,x); nPan.position.set(nP0.x,nP0.y+.18*p,nP0.z+.36*p); nPan.rotation.x=.25*p; });
PAGE.keys=(narrow,K,R)=>[
  narrow? R([1.8,1.9,8.8],[-.1,.75,.1],34) : K([1.7,1.6,5.6],[-.55,1.0,.1],30),                       // hero: one access point and its switch
  narrow? R([4.2,6.5,34],[4.2,.6,-1.0],34) : K([4.0,3.6,23.5],[4.0,1.15,-1.0],30,-.2),                  // the range
  narrow? R([NG+.2,3.6,15],[NG,.3,0],34) : K([NG-.9,3.0,11.2],[NG-.3,.9,0],30),                        // 01 event Wi-Fi
  narrow? R([2*NG+1.6,1.7,7.6],[2*NG-.2,.55,0],34) : K([2*NG+1.2,1.8,5.6],[2*NG-.25,1.0,0],30),               // 02 the rack opens
  narrow? R([3*NG+1.2,1.7,5.8],[3*NG,.45,-.1],34) : K([3*NG+1.0,1.8,4.6],[3*NG-.15,.85,-.1],30),        // 03 a workstation
  narrow? R([4*NG+1.4,1.5,4.6],[4*NG-.1,.45,0],34) : K([4*NG+1.2,1.6,4.3],[4*NG-.2,.78,0],30),                   // 04 a custom PC opens
  K([4*NG+1.4,2.2,5.6],[4*NG,.9,0],30,0,.25) ];
