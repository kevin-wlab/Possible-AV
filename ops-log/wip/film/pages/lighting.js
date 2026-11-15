/* ===== lighting & staging page: where things stand and where the camera stops ===== */
// opening: one soft light on a stand, alone
{ const kit=ltKit(); kit.g.rotation.y=-.5; scene.add(kit.g); }
// the range. small: the same light. medium: two decks under a goal post. large: a decked stage under a truss box
{ const I=grp(scene,S,0,0), kit=ltKit({coil:false}); kit.g.position.set(-4.7,0,1.6); kit.g.rotation.y=-.2; I.add(kit.g);
  const md=ltMediumRig(); md.position.set(-1.7,0,-.5); md.rotation.y=.16; I.add(md);
  const lg=ltLargeRig(); lg.position.set(3.1,0,-.9); lg.rotation.y=-.3; I.add(lg); }
ltEventRig(grp(scene,2*S,0,0),2);
ltDeckRig(grp(scene,3*S,0,0),3);
ltLiftRig(grp(scene,4*S,0,0),4);
ltDeskRig(grp(scene,5*S,0,0),5);
PAGE.keys=(narrow,K,R)=>[
  K([2.0,1.5,5.7],[-.15,1.18,.15],30),                       // hero: one light on a stand
  K([S-.3,2.6,19.5],[S+.2,1.9,0],30,-.15),                   // the range
  K([2*S-1.2,1.7,7.2],[2*S+.9,1.35,0],30),                   // event lighting: the softbox comes apart
  K([3*S-4.2,3.2,9.5],[3*S-.4,.4,0],30),                     // stage decks assemble
  K([4*S-3.5,2.6,12],[4*S+.2,1.9,0],30),                     // truss rises
  K([5*S-2.0,2.3,4.6],[5*S+.1,.95,-.2],30),                  // lighting desk
  K([5*S+3.2,3.9,8.4],[5*S+.1,.9,-.6],30,0,.25) ];
