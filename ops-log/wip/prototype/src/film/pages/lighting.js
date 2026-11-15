/* ===== lighting & staging page: where things stand and where the camera stops ===== */
const LG=12; // groups sit closer than S so the next set slides in as the last one leaves
// opening: one soft light on a stand, alone. The range (medium and large rigs) stands beside it and steps aside after the range shot
const lI0=grp(scene,0,0,0), lRange=grp(lI0,0,0,0);
{ const kit=ltKit(); kit.g.rotation.y=-.5; lI0.add(kit.g); }
{ const md=ltMediumRig(); md.position.set(3.2,0,-2.1); md.rotation.y=.16; lRange.add(md);
  const lg=ltLargeRig(); lg.position.set(8.1,0,-2.5); lg.rotation.y=-.3; lRange.add(lg); }
const lIs=[[lI0,.5],[grp(scene,LG,0,0),2],[grp(scene,2*LG,0,0),3],[grp(scene,3*LG,0,0),4],[grp(scene,4*LG,0,0),5.5]];
ltEventRig(lIs[1][0],2); ltDeckRig(lIs[2][0],3); ltLiftRig(lIs[3][0],4); ltDeskRig(lIs[4][0],5);
// a set only shows while the camera is near it, so a neighbour never peeks in behind the text
updaters.push((t,x)=>{ for(const [g,c] of lIs) g.visible=Math.abs(x-c)<(c===.5||c===5.5?1.6:.9); });
updaters.push((t,x)=>{ const v=sstep(.25,.8,x)*(1-sstep(1.3,1.62,x)); lRange.scale.setScalar(Math.max(.001,v)); lRange.visible=v>.001; });
PAGE.keys=(narrow,K,R)=>[
  narrow? R([1.0,1.9,7.4],[-.1,1.15,.15],34) : K([2.0,1.5,5.7],[-.15,1.18,.15],30),                 // hero: one light on a stand
  narrow? R([4.4,6.2,30],[4.4,1.4,-1.6],34) : K([4.8,3.6,27.5],[5.3,1.6,-1.4],30,-.2),               // the range
  narrow? R([LG-.6,2.0,9.2],[LG+.9,1.3,0],34) : K([LG-1.2,1.7,7.2],[LG+.9,1.35,0],30),             // event lighting: the softbox comes apart
  narrow? R([2*LG-2.2,4.2,13],[2*LG-.6,.4,0],34) : K([2*LG+.8,4.7,15.6],[2*LG-.8,.45,0],30),         // stage decks assemble
  narrow? R([3*LG-1.4,3.0,16],[3*LG,1.9,0],34) : K([3*LG-3.5,2.6,12],[3*LG+.2,1.9,0],30,-.12),           // truss rises
  narrow? R([4*LG-.6,2.6,8.4],[4*LG-.1,1.1,-.9],34) : K([4*LG-1.7,2.5,7.9],[4*LG-.1,1.15,-1.0],30,-.18),   // lighting desk, the lights come on
  K([4*LG+1.6,4.4,13.2],[4*LG+.1,1.35,-1.0],30,0,.25) ];
