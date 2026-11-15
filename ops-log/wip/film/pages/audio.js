/* ===== audio page: where things stand and where the camera stops ===== */
const I0=grp(scene,0,0,0), opens=[], lesser=grp(I0,0,0,0);
{ // small: one speaker on a tripod and a wireless handheld on a stand
  const sm=grp(lesser,-4.3,0,0); sm.rotation.y=.3; sm.add(tripod(1.22)); sm.add(at(pointSource(.33,.54,.31,'ps10'),0,1.26,.155));
  const ms=grp(lesser,-3.4,0,.75); ms.add(at(cyl(.13,.14,.022,M.black,36),0,.011,0)); ms.add(at(cyl(.011,.011,1.42,M.steel,14),0,.72,0)); ms.add(at(cyl(.016,.016,.07,M.black,14),0,.78,0));
  const clip=grp(ms,0,1.43,0); clip.rotation.set(-.5,0,0); clip.add(at(cyl(.024,.021,.06,M.rubber,18),0,.03,0)); /* the handheld is added below, once it is defined */ ms.userData.clip=clip; lesser.userData.ms=ms;
  // medium: tops on subs, a pair
  for(const [x,z,ry] of [[-1.45,-.2,.22],[-.05,-.9,.05]]){ const st=grp(lesser,x,0,z); st.rotation.y=ry; const sb=sub(); sb.g.scale.setScalar(.7); st.add(sb.g); st.add(at(cyl(.019,.019,.82,M.steel,16),0,.448+.41,-.28)); st.add(at(pointSource(.43,.7,.4,'ps15'),0,.448+.82,-.08)); }
  // large: a flown line array over a sub stack
  const la=lineArray(8); la.root.position.set(2.25,5.3,0); la.root.rotation.y=-.42; I0.add(la.root); opens.push(...la.parts);
  for(let r=0;r<2;r++) for(let c=0;c<2;c++){ const s=sub(); s.g.position.set(4.0+c*1.14,r*.655+.03,-.6-c*.5); s.g.rotation.y=-.42; I0.add(s.g); opens.push({grille:s.grille}); } }

const I1=grp(scene,S,0,0);
{ lesser.userData.ms.userData.clip.add(at(handheld(),0,-.1,0));
  const mic=handheld(); const h=grp(I1,.2,1.05,0); h.scale.setScalar(7); h.rotation.set(.18,0,-.52); h.add(mic); spinners.push([mic,.25]);
  const bp=bodypack(); bp.scale.setScalar(5.2); bp.position.set(2.75,1.7,.1); bp.rotation.set(-.12,-.5,.1); I1.add(bp);
  const hs=headset(); hs.scale.setScalar(6); hs.position.set(2.2,3.05,-.3); hs.rotation.set(.1,-.7,.15); I1.add(hs);
  const rx=receiver(); rx.scale.setScalar(3.4); rx.position.set(1.7,.45,1.5); rx.rotation.y=-.3; I1.add(rx); const pl=at(rbox(1.9,.36,1.0,M.white,.05),1.7,.18,1.5); pl.rotation.y=-.3; { const tr=at(rbox(1.94,.03,1.04,M.alu,.012),1.7,.03,1.5); tr.rotation.y=-.3; I1.add(tr); } I1.add(pl);
  updaters.push(t=>{ h.position.y=1.05+Math.sin(t*.7)*.05; bp.position.y=1.7+Math.sin(t*.8+1)*.04; hs.position.y=3.05+Math.sin(t*.6+2)*.05; }); }

directionalRig(grp(scene,2*S,0,0),4);
spatialRig(grp(scene,3*S,0,0),5);
consoleRig(grp(scene,4*S,0,0));
// the smaller systems leave, then the hang opens: grilles lift off to one side and the boxes spread
updaters.push((t,x)=>{const e=sstep(1.5,2.0,x), gone=sstep(1.3,1.62,x); lesser.scale.setScalar(Math.max(.001,1-gone)); lesser.visible=gone<.999; opens.forEach((o,i)=>{ if(o.next){ o.grille.position.x=e*1.34; o.grille.position.z=.034+Math.sin(e*Math.PI)*.22+e*.06; o.next.position.y=-CH-.014-e*.11; } else o.grille.position.z=.034+e*.5; }); });
PAGE.keys=(narrow,K,R)=>{ return [ narrow? R([-3.2,1.5,6.6],[-3.85,1.0,.2],34) : K([-2.3,1.35,5.6],[-4.0,.98,.15],30),          // hero: the small set
           narrow? R([-10.6,2.3,10.6],[-.7,2.3,-.6],46) : K([-.2,2.8,17.8],[.1,2.2,0],30,-.15),           // the whole range, small to large
           narrow? R([.9,3.2,20.5],[3.7,3.0,-.3],32) : K([-.2,3.2,13.4],[4.5,2.95,-.3],30),             // the flown array, opened up
           K([S-1.0,2.1,9.9],[S+.9,1.55,0],28),                 // wireless
           K([2*S-5.0,2.4,8.6],[2*S+.2,1.55,0],30),            // directional
           K([3*S-4.6,4.9,9.6],[3*S+.2,.75,0],32),             // spatial + haptic
           K([4*S-2.3,2.5,5.3],[4*S+.1,.78,-.05],30),       // console
           K([4*S+2.6,3.7,7.4],[4*S+.1,.8,-.05],30,0,.25) ]; };
