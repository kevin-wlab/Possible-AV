// @models: displays
/* ===== projection page: where things stand and where the camera stops ===== */
const PG=12; // groups sit closer than S so the next set slides in as the last one leaves
// a beam from a projector to a screen, built in the island's own coordinates
function pBeam(island,proj,screen){ island.updateMatrixWorld(true); const from=island.worldToLocal(proj.localToWorld(proj.userData.lens.clone())), d=screen.userData.img,
  c=island.worldToLocal(screen.localToWorld(d.c.clone())); island.add(prjBeam(from,c,d.w,d.h)); }
function pSet(island,x,z,Wi,h,big){ // a screen with its projector on a tripod in front of it
  const s=big?fastFold(Wi,.8,PRJ.calmM||(PRJ.calmM=new THREE.MeshBasicMaterial({map:dspCalmTex(),toneMapped:false,color:0xe9e6e0}))):pullUp(Wi,dspCalmTex()); s.position.set(x,0,z); island.add(s);
  const t=prjTripod(h); t.position.set(x+.35,0,z+(big?2.9:2.05)); t.rotation.y=Math.PI-.1; island.add(t); const p=big?projMid():projSmall(); p.position.y=h+.009; t.add(p); pBeam(island,p,s); return s; }

const pI0=grp(scene,0,0,0), pRange=grp(pI0,0,0,0);
pSet(pI0,-4.2,0,1.6,.95,false);
pSet(pRange,.7,-.7,2.5,1.15,true);
{ const big=fastFold(4.1,1.0,PRJ.calmM); big.position.set(6.6,0,-1.7); pRange.add(big); const c=prjCase(.84,.46,1.0); c.position.set(6.6,0,2.9); c.rotation.y=Math.PI; pRange.add(c);
  const L=laserProj(); L.g.position.y=.56; c.add(L.g); pBeam(pRange,L.g,big); }

const pI1=grp(scene,PG,0,0), pCase=prjCase(.84,.46,1.0); pCase.rotation.y=-.12; pI1.add(pCase); const pLas=laserProj(); pLas.g.position.y=.56; pCase.add(pLas.g); const pL0=pLas.lens.position.z;

const pI2=grp(scene,2*PG,0,0), pSrc=V(0,3.0,4.6), pTgt=V(0,1.45,-.3), pMap=mapPanels(pSrc,pTgt,prjMapTex(dspCalmTex())); pI2.add(pMap.g);
{ // the truss the projectors hang from: two towers and a beam across, out in front of the panels
  const ZT=3.2, YT=3.5; for(const x of [-3.2,3.2]){ const u=dspTruss(YT); u.position.set(x,.03,ZT); pI2.add(u); pI2.add(at(rbox(.6,.012,.6,M.satin,.004),x,.006,ZT)); }
  const b=dspTruss(6.64); b.rotation.z=-Q; b.position.set(-3.32,YT+.15,ZT); pI2.add(b);
  for(const [x,pi] of [[-1.7,1],[0,0],[1.7,2]]){ const h=hungProj(0,0), pan=pMap.panels[pi]; h.position.set(x,YT+.03,ZT); pI2.add(h); pI2.updateMatrixWorld(true);
    const to=pan.getWorldPosition(V(0,0,0)), from=h.getWorldPosition(V(0,0,0)); h.children[0].rotation.set(Math.atan2(from.y-.25-to.y,Math.hypot(to.x-from.x,to.z-from.z)),Math.atan2(to.x-from.x,to.z-from.z),0); pBeam(pI2,h.userData.proj,pan); } }
const pI3=grp(scene,3*PG,0,0), oTgt=V(0,1.1,0), pObj=mapForms(); pI3.add(pObj);
for(const [x,z] of [[1.75,2.3],[2.5,1.15]]){ const t=prjTripod(1.3); t.position.set(x,0,z); prjLook(t,t.position,oTgt); pI3.add(t); const p=projMid(); p.position.y=1.309; t.add(p); }

const pI4=grp(scene,4*PG,0,0), pHome=homeTheater(dspCalmTex()); pHome.g.rotation.y=-.18; pI4.add(pHome.g);

const pI5=grp(scene,5*PG,0,0); pSet(pI5,-.3,0,1.8,1.0,false);

updaters.push((t,x)=>{ const gone=sstep(1.3,1.62,x); pRange.scale.setScalar(Math.max(.001,1-gone)); pRange.visible=gone<.999;
  const e=sstep(1.6,1.95,x)*(1-sstep(2.35,2.75,x)); pLas.lens.position.z=pL0+e*.34;
  PRJ.mapT.userData.u=Math.round(sstep(2.55,2.98,x)*200)/200;
  pObj.userData.mat.uniforms.u.value=sstep(3.45,4.0,x); pObj.userData.mat.uniforms.t.value=t;
  pHome.rise(sstep(4.5,4.95,x)); });

PAGE.keys=(narrow,K,R)=>[
  K([-.35,1.6,5.2],[-3.85,.85,.85],30),                                                       // hero: one compact projector and a pull-up screen
  narrow? R([-10.8,4.4,21],[-1.2,1.2,-.4],32) : K([2.2,3.4,28],[2.5,1.2,-.3],30,-.2),     // the range
  K([PG-2.0,1.75,5.4],[PG+.1,.62,0],30),                                                      // 01 the laser projector, its lens sliding out
  narrow? R([2*PG-.8,3.3,21.5],[2*PG,1.9,0],32) : K([2*PG-1.2,3.0,16.8],[2*PG-.1,1.85,0],30),                                               // 02 one picture mapped across panels of different sizes
  narrow? R([3*PG+.9,2.8,12.8],[3*PG+.5,1.5,.3],34) : K([3*PG-1.2,2.3,11.2],[3*PG+.75,1.3,.3],30),                                                 // 03 mapping on an object: edges traced, then faces filled
  K([4*PG-1.9,1.7,7.0],[4*PG+.25,.9,-.25],30),                                                // 04 home theater, the screen rising
  K([5*PG+4.3,2.6,8.2],[5*PG-.55,1.0,.6],30,0,.25) ];
