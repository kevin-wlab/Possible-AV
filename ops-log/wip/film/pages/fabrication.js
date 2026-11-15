/* ===== fabrication page: where things stand and where the camera stops ===== */
const fbI0=grp(scene,0,0,0), fbSmall=grp(fbI0,-4.2,0,.2); fbSmall.rotation.y=.42;
fabStation(fbSmall);                                             // small: a printed part, on the printer that makes it
const fbPl=fabPlinthRig(grp(fbI0,-1.45,0,0),2);                  // medium: a custom plinth with a screen in its face
const fbPop=fabPopupRig(grp(fbI0,2.9,0,-.2));                    // large: a pop-up unit

const fbI1=grp(scene,S,0,0);
const fbBig=fabBigPrinterRig(grp(fbI1,-1.3,0,0));
{ const c=fabChair(); c.position.set(-4.1,0,1.5); c.rotation.y=.75; fbI1.add(c); const st=fabStool(); st.position.set(-3.05,0,2.25); fbI1.add(st); }
{ const f=fabFarm(grp(fbI1,3.7,0,-.1)); f.rotation.y=-.3; }

updaters.push((t,x)=>{
  // the printer cart leaves after the range, the plinth after its own stop
  const gone=sstep(1.3,1.62,x); fbSmall.scale.setScalar(Math.max(.001,1-gone)); fbSmall.visible=gone<.999;
  const pg=sstep(2.32,2.62,x); fbPl.g.scale.setScalar(Math.max(.001,1-pg)); fbPl.g.visible=pg<.999;
  // the pop-up stands finished in the range shot, is flat-packed while the camera is on the plinth (out of frame), and goes up as you arrive
  fbPop.set(x<2?1:sstep(2.3,2.98,x));
  // the big print grows on the way in, and finishes on the way to the farm
  fbBig.set(lerp(.08,.72,sstep(3.3,4.05,x))+.28*sstep(4.25,5,x),t); });

PAGE.keys=(narrow,K,R)=>[
  narrow? R([-2.75,1.55,4.9],[-4.25,1.02,.2],34) : K([-2.5,1.5,3.9],[-4.3,.98,.2],30),                 // opening: the desktop printer on its cart
  narrow? R([-10.4,2.3,11.2],[-.2,1.5,-.4],46) : K([-.1,2.5,17.2],[.25,1.35,0],30,-.15),               // the range: a part, a plinth, a pop-up
  narrow? R([1.4,1.9,7.4],[-1.5,.98,.3],34) : K([.75,1.75,4.7],[-1.75,.92,.3],30),                     // 01 the plinth comes apart
  narrow? R([-1.2,2.2,13.2],[2.9,1.45,0],36) : K([.3,2.1,8.9],[3.35,1.3,0],30),                        // 02 the pop-up goes up and lights
  narrow? R([S-6.6,2.9,12.5],[S-1.5,1.5,0],36) : K([S-5.6,2.7,8.6],[S-.9,1.35,0],30),                  // 03 the large-format printer
  narrow? R([S+1.0,1.8,7.6],[S+3.7,1.2,0],36) : K([S+1.6,1.55,5.7],[S+4.2,1.15,0],30),                 // 03 the print farm
  K([S+.6,3.6,13.6],[S+.9,1.0,0],30,0,.25) ];                                                           // closing
