/* ===== fabrication page: where things stand and where the camera stops ===== */
const fbI0=grp(scene,0,0,0), fbSmall=grp(fbI0,-4.2,0,.2); fbSmall.rotation.y=.42;
fabStation(fbSmall);                                             // small: a printed part, on the printer that makes it
const fbPl=fabPlinthRig(grp(fbI0,-1.45,0,0),2);                  // medium: a custom plinth with a screen in its face
const fbPop=fabPopupRig(grp(fbI0,2.9,0,-.2));                    // large: a pop-up unit

const FG=13; // the second set sits close so it slides in as the first leaves
const fbI1=grp(scene,FG,0,0);
const fbBig=fabBigPrinterRig(grp(fbI1,-1.3,0,0));
{ const c=fabChair(); c.position.set(1.75,0,1.7); c.rotation.y=-.55; fbI1.add(c); const st=fabStool(); st.position.set(.95,0,2.55); fbI1.add(st); }
{ const f=fabFarm(grp(fbI1,6.6,0,-.1)); f.rotation.y=-.3; }

updaters.push((t,x)=>{
  fbI0.visible=x<4.05; fbI1.visible=x>2.95;   // each set only while the camera is near it
  // the printer cart leaves after the range, the plinth after its own stop
  const gone=sstep(1.3,1.62,x); fbSmall.scale.setScalar(Math.max(.001,1-gone)); fbSmall.visible=gone<.999;
  const pg=sstep(2.32,2.62,x); fbPl.g.scale.setScalar(Math.max(.001,1-pg)); fbPl.g.visible=pg<.999;
  // the pop-up stands finished in the range shot, is flat-packed while the camera is on the plinth (out of frame), and goes up as you arrive
  fbPop.set(x<2?1:sstep(2.3,2.98,x));
  // the big print grows on the way in, and finishes on the way to the farm
  fbBig.set(lerp(.08,.72,sstep(3.3,4.05,x))+.28*sstep(4.25,5,x),t); });

PAGE.keys=(narrow,K,R)=>[
  narrow? R([-2.4,1.7,6.6],[-4.2,.72,.2],34) : K([-2.5,1.5,3.9],[-4.3,.98,.2],30),                 // opening: the desktop printer on its cart
  narrow? R([-9.4,3.0,16.5],[-.6,1.3,-.4],46) : K([.7,2.8,18.6],[1.1,1.35,0],30,-.24),               // the range: a part, a plinth, a pop-up
  narrow? R([1.4,1.9,7.4],[-1.5,.98,.3],34) : K([.75,1.75,4.7],[-1.75,.92,.3],30),                     // 01 the plinth comes apart
  narrow? R([-.6,2.3,15.0],[2.65,1.45,0],36) : K([.3,2.1,8.9],[3.35,1.3,0],30),                        // 02 the pop-up goes up and lights
  narrow? R([FG-4.4,2.9,12.5],[FG-.3,1.5,.4],36) : K([FG-3.4,3.2,12.8],[FG+.1,1.3,.4],30),                  // 03 the large-format printer
  narrow? R([FG+3.9,1.8,7.6],[FG+6.6,1.2,0],36) : K([FG+4.3,1.6,6.3],[FG+6.4,1.15,0],30),                 // 03 the print farm
  K([FG+2.5,4.6,18.5],[FG+2.8,1.3,0],30,0,.25) ];                                                           // closing
