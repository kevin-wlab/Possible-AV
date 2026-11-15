/* ---------- services page: one business at a time, each in a studio of its own ---------- */
const SVCM=document.body.dataset.mode==='services';
// [third-level name, one line, where the camera goes: a labelled object, or x,y,z,distance in the bay, or a fixed shot; optional outside link]
const SVC=[
 {k:'displays',n:'Displays',short:'Displays',tags:['Rent','Buy','Install'],d:'OLED TVs, touchscreens with Android or Windows built in, transparent displays and multi-screen playback stations.',
  room:{back:0xF3F0EA,side:'brick',win:1,mood:'day'},items:[
   ['OLED TV rental','OLED TVs on floor stands or mounts, delivered and set up for booths, lounges and stages.',[3.55,1.25,1.75,3.4]],
   ['Touch screen rental','Touch displays with Android or Windows built in, on a stand or as a kiosk, running your app or one we build.',[-2.7,1.2,3.0,3.4]],
   ['Transparent displays','See-through screens that put motion graphics in front of a real product.','Transparent display'],
   ['Playback stations','Screens on truss or stands with players and a control position, looping content for the whole run.',[3.9,1.9,-2.3,5.2]],
   ['LED walls','LED video walls go up with the same crew. Sizes, specs and pricing are on our LED site.',[-.3,1.7,-2.3,6.2],['ledwall.nyc','https://ledwall.nyc']]]},
 {k:'projection',n:'Projection',short:'Projection',tags:['Rent','Buy','Install'],d:'Projectors for events, trade shows and immersive rooms, mapping on any surface, and home theater.',
  room:{back:0x26272b,side:0x2e2f34,ceil:0x1f2023,beam:0x2a2b2f,floor:0x8f8b84,ink:'rgba(236,233,227,.8)',mood:'dark'},items:[
   ['Projector rental','Projectors, lenses and screens for events, trade shows and immersive rooms, hung and aligned by us.','Projectors'],
   ['Projection mapping','Content fitted to walls, objects, sets and architecture, including irregular and sculptural surfaces.','Mapping surface'],
   ['Home theater','A projector, screen and sound at home: rented for a night or installed for good.','Home cinema']]},
 {k:'audio',n:'Audio',short:'Audio',tags:['Rent','Buy','Install'],d:'Sound systems, wireless microphones, directional speakers, spatial audio and haptic seating.',
  room:{back:'slat',side:0xEFEBE3,win:0,mood:'warm'},items:[
   ['Sound system rental','Line arrays, subs and fills sized to the room, with an engineer at the console.','Line array'],
   ['Wireless microphones','Handheld, lavalier and headset wireless for panels, presenters and performers.','Wireless mic'],
   ['Directional speakers','Sound that stays in one spot: the person underneath hears it, the person beside them does not. To rent or to buy.','Directional speaker'],
   ['Spatial audio & haptic seating','Sound placed around the audience, and seating that moves with the low end.','Haptic sofa'],
   ['Mixing & engineers','Consoles and the audio engineers who run them, with our system or yours.','Mixing console']]},
 {k:'lighting',n:'Lighting & staging',short:'Lighting',tags:['Rent','Install'],d:'Aputure lighting, stage decks, truss and rigging, and the stage work around them.',
  room:{back:0x1d1e21,side:0x242528,ceil:0x18191b,beam:0x232427,floor:0x7d7a74,ink:'rgba(236,233,227,.8)',mood:'dark'},items:[
   ['Event lighting','Aputure fixtures for stages, rooms and camera, placed, focused and run by us.','Aputure lights'],
   ['Stage decks','Modular stage decks in the size and height the room needs, built and levelled.','Stage deck'],
   ['Truss & rigging','Ground-supported and flown truss for lights, screens, speakers and projectors.','Truss'],
   ['Lighting control','A lighting desk and an operator for the show.','Lighting desk']]},
 {k:'live-video',n:'Live video & visuals',short:'Live video',tags:['Rent','Install'],d:'Live streaming, switchers and production kits, and VJ and Resolume visuals.',
  room:{back:0x4a4f57,side:0x565b63,ceil:0x3c4047,beam:0x484c54,floor:0xa9a69f,ink:'rgba(236,233,227,.85)',mood:'studio'},items:[
   ['Live streaming','Cameras, encoding and a crew to put the event online.','Camera'],
   ['Switchers & production kits','Video switchers and portable production kits, rented with or without an operator.','Switcher'],
   ['VJ & live visuals','Live and audio-reactive visuals, playback and show control. If Resolume does it, we do it.','VJ / Resolume'],
   ['Hybrid events','Remote speakers and remote audiences in the same show as the room.','PTZ camera']]},
 {k:'networks',n:'Networks & computers',short:'Networks',tags:['Rent','Buy','Install'],d:'UniFi networks for events and for buildings, and computers and workstations to rent or own.',
  room:{back:0xF4F3F0,side:0xEDEEEE,win:1,floor:0xf4f6f8,mood:'cool'},items:[
   ['Event Wi-Fi','A UniFi network brought in for the event: access points, switching and someone watching it.','UniFi access point'],
   ['Permanent network installs','UniFi networks designed, installed and handed over in your space.','Network rack'],
   ['Computer & workstation rental','Workstations and show computers for the run of the event.','Workstation'],
   ['Custom PCs & workstations','Workstations built to order, to buy.','Workstation']]},
 {k:'interactive',n:'Interactive & tracking',short:'Interactive',tags:['Rent','Install'],d:'TouchDesigner, sensors, RFID, motion tracking and the 3D content that reacts to them.',
  room:{back:0x202125,side:0x27282c,ceil:0x1a1b1e,beam:0x25262a,floor:0x7a7770,ink:'rgba(236,233,227,.8)',mood:'dark'},items:[
   ['Interactive installations','Rooms, floors and walls that respond to people, built in TouchDesigner.','Interactive floor'],
   ['Sensors & body tracking','Cameras and sensors that follow people without anything worn.','Body tracking'],
   ['Motion tracking systems','Tracking systems rented, installed and run for events and installs.','Tracking cameras'],
   ['RFID & NFC triggers','Tap an object or a badge and the room does something.','RFID trigger'],
   ['3D & real-time content','3D modeling and real-time content that follows the performer or the visitor.','Live avatar']]},
 {k:'fabrication',n:'Fabrication',short:'Fabrication',tags:['Design','Build','Install'],d:'Custom builds, branded pieces and pop-up shops, designed, 3D-printed and assembled in house, with the screens, light and sound already built in.',
  room:{back:'brick',side:'brick',win:1,mood:'day'},items:[
   ['Custom fabrication','One-off pieces made for the job: housings, plinths, props and mounts.',[2.05,1.2,-3.3,4.4]],
   ['Pop-up shops & retail units','A branded unit that arrives finished, with display, light and sound inside it.',[2.35,1.35,.55,4.8]],
   ['Large-format 3D printing','Pieces printed at furniture scale, and small-batch runs on the print farm.',[-1.75,1.7,-1.55,5.6],['ctrlp.studio','https://ctrlp.studio']]]},
 {k:'logistics',n:'Logistics & touring',short:'Logistics',tags:['Deliver','Tour','Store'],d:'We case it, truck it and load it in ourselves. For work outside New York, the same crew travels with the gear.',
  room:{mood:'day'},items:[
   ['Delivery, load-in & strike','Our truck and our crew, from the dock to the room and back.',{p:[-7.5,4.2,22.5],l:[-12.6,1.0,18.6],f:38}],
   ['Touring & multi-city','The same system and the same people in every city on the run.',{p:[-3.2,2.6,25.2],l:[-11.7,1.2,21.6],f:36}],
   ['Storage between dates','Cased, labelled and kept ready between dates.',{p:[-8.6,3.4,10.8],l:[-13.3,.9,15.4],f:42}]]},
];
let svc=null; const anchors={};
if(SVCM){
  // everything that belongs to the shared studio goes in one group, so a business can be shown alone in a room of its own
  const homeG=new THREE.Group(), zg=new Set(zones.map(z=>z.g)); for(const o of [...scene.children]) if(!o.isLight&&!zg.has(o)) homeG.add(o); scene.add(homeG);
  const slatT=still(2,2,(c,W,H)=>{ c.fillStyle='#bfa783'; c.fillRect(0,0,W,H); const n=18, w=W/n; for(let i=0;i<n;i++){ c.fillStyle='#3d342a'; c.fillRect(i*w,0,w*.3,H); c.fillStyle='rgba(255,240,215,.14)'; c.fillRect(i*w+w*.3,0,2,H); c.fillStyle='rgba(60,40,20,.1)'; c.fillRect(i*w+w-2,0,2,H); } },256);
  const wallOf=(kind,w,h)=>{ if(kind==='brick') return brickOf(w/1.6,h/1.6); if(kind==='slat'){ const t=slatT.clone(); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(w/2.2,1); t.needsUpdate=true; return std(0xffffff,.8,0,{map:t,envMapIntensity:.2}); } return std(kind,.95,0,{envMapIntensity:.15}); };
  const RX=7.6, ZB=-5.8, ZF=13.4, RH=6.4, RD2=ZF-ZB, zc=(ZF+ZB)/2;
  const rooms=zones.map((z,i)=>{ if(!z.g) return null; const r=SVC[i].room, G=new THREE.Group(); z.g.add(G);
    const ft=floorT.clone(); ft.wrapS=ft.wrapT=THREE.RepeatWrapping; ft.repeat.set(2*RX/6.4,RD2/6.4); ft.needsUpdate=true; const fl=plane(2*RX,RD2,std(r.floor||0xffffff,.4,.04,{map:ft,envMapIntensity:.45})); fl.rotation.x=-Q; fl.position.set(0,-.003,zc); fl.receiveShadow=true; G.add(fl);
    const bw=plane(2*RX,RH,wallOf(r.back,2*RX,RH)); bw.position.set(0,RH/2,ZB); bw.receiveShadow=true; G.add(bw);
    for(const sx of [-1,1]){ const w=plane(RD2,RH,wallOf(r.side,RD2,RH)); w.rotation.y=-sx*Q; w.position.set(sx*RX,RH/2,zc); w.receiveShadow=true; G.add(w); }
    const cl=plane(2*RX,RD2,std(r.ceil||0xe9e5dd,1,0,{envMapIntensity:.1})); cl.rotation.x=Q; cl.position.set(0,RH,zc); G.add(cl);
    const bm=std(r.beam||0xdedad1,.9), canM=std(0x1b1b1d,.5,.3), litM=new THREE.MeshBasicMaterial({color:0xfff3dd,toneMapped:false});
    for(const zz of [-2.6,2.8,8.2]) G.add(at(new THREE.Mesh(new THREE.BoxGeometry(2*RX,.5,.36),bm),0,RH-.25,zz));
    for(const xx of [-4.8,0,4.8]) for(const zz of [.2,5.6]){ G.add(at(new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.3,18),canM),xx,RH-.8,zz)); G.add(rod(V(xx,RH-.65,zz),V(xx,RH,zz),.012,canM)); const l=new THREE.Mesh(new THREE.CircleGeometry(.125,18),litM); l.rotation.x=Q; l.position.set(xx,RH-.952,zz); G.add(l); }
    const base=std(0x3b3936,.7); G.add(at(box(2*RX,.14,.03,base),0,.07,ZB+.015)); for(const sx of [-1,1]) G.add(at(box(.03,.14,RD2,base),sx*(RX-.015),.07,zc));
    // the business name, sign-painted on the back wall
    const tt=paint(String(i+1).padStart(2,'0')+'  '+SVC[i].n.toUpperCase(),6.6,.62,{font:'600 96px "Geist Mono", monospace',color:r.ink||'rgba(26,26,24,.8)',res:1400,align:'left'}); tt.position.set(3.9,RH-1.3,ZB+.02); G.add(tt);
    // steel windows on the right-hand wall, same view as the main studio
    if(r.win) for(const zz of [-1.9,3.9]){ const t=skyT.clone(); t.repeat.set(.24,1); t.offset.set(.12+((i*37+zz*11+50)%40)/100,0); t.needsUpdate=true; const w=3.6,h=3.5,y=1.3, fm=std(0x1c1c1e,.6,.4);
      const p=plane(w,h,new THREE.MeshBasicMaterial({map:t,toneMapped:false})); p.rotation.y=-Q; p.position.set(RX-.02,y+h/2,zz); G.add(p);
      for(let k=0;k<=4;k++) G.add(at(box(.07,h,.05,fm),RX-.05,y+h/2,zz-w/2+k*w/4)); for(let k=0;k<=3;k++) G.add(at(box(.07,.05,w,fm),RX-.05,y+k*h/3,zz)); G.add(at(box(.3,.06,w+.3,std(0xd8d4cb,.6)),RX-.13,y-.03,zz)); }
    return G; });
  const MOOD={day:[1.08,.7,1.9,.8],warm:[1.04,.62,1.7,.6],cool:[1.1,.78,1.8,1.0],studio:[1.0,.5,1.5,.6],dark:[.98,.34,1.05,.4]};
  const show=(i)=>{ const L=i===8; homeG.visible=L; zones.forEach((z,k)=>{ if(!z.g) return; z.g.visible=L||k===i; rooms[k].visible=!L&&k===i; }); const m=MOOD[SVC[i].room.mood]||MOOD.day; renderer.toneMappingExposure=m[0]; hemi.intensity=m[1]; key.intensity=m[2]; fill.intensity=m[3]; };
  const tgt=()=>{ const S=SVC[svc.tab], it=svc.item>=0?S.items[svc.item]:null, z=zones[svc.tab];
    if(svc.tab===8){ const c=it?it[2]:(narrow?z.keyN:z.key); return {p:V(...c.p),l:V(...c.l),f:narrow?c.f+10:c.f,ox:narrow?0:(c.ox??-.18),oy:narrow?.14:(c.oy??0)}; }
    z.g.updateMatrixWorld(true); const W2=(v)=>z.g.localToWorld(v);
    const wide=narrow?{p:W2(V(0,5.2,12.6)),l:W2(V(0,1.5,0)),f:54,ox:0,oy:.13}:{p:W2(V(0,4.5,10.4)),l:W2(V(0,1.7,0)),f:44,ox:-.2,oy:0}; if(!it) return wide;
    const a=it[2]; let t,d; if(typeof a==='string'){ const A=anchors[a]; if(!A) return wide; t=z.g.worldToLocal(A.obj.getWorldPosition(new THREE.Vector3())); t.y+=A.h*.5; d=Math.min(Math.max(3.1+Math.abs(A.h)*.95,3.4),8.6); } else { t=V(a[0],a[1],a[2]); d=a[3]; }
    const p=t.clone().addScaledVector(V(-t.x*.07,.3,1).normalize(),d*(narrow?1.3:1)); p.y=Math.max(p.y,1.6); p.z=Math.min(p.z,ZF-.6);
    return {p:W2(p),l:W2(t.clone()),f:narrow?50:40,ox:narrow?0:-.17,oy:narrow?.13:0}; };
  const C={p:V(0,5,10),l:V(),f:44,ox:-.2,oy:0}; let T=null, hard=true;
  svc={tab:0,item:-1,cam(){ if(!T) T=tgt(); const k=(hard||reduce||location.hash.startsWith('#snap'))?1:.07; hard=false; C.p.lerp(T.p,k); C.l.lerp(T.l,k); C.f+=(T.f-C.f)*k; C.ox+=(T.ox-C.ox)*k; C.oy+=(T.oy-C.oy)*k; return C; }};
  addEventListener('resize',()=>{ T=null; });
  // page furniture: tabs are the second level, the list in the card is the third
  const $=(id)=>document.getElementById(id), tabs=[...document.querySelectorAll('#rail a')], fade=$('svcFade'), esc=(s)=>s.replace(/&/g,'&amp;');
  const draw=()=>{ const S=SVC[svc.tab], it=svc.item>=0?S.items[svc.item]:null; $('svcEb').textContent=`Services · ${String(svc.tab+1).padStart(2,'0')} / 09`; $('svcH').textContent=S.n;
    $('svcD').innerHTML=it?esc(it[1])+(it[3]?` <a class="ext" href="${it[3][1]}">${it[3][0]} ↗</a>`:''):esc(S.d); $('svcBack').hidden=!it; $('svcSub').textContent=it?it[0]:'';
    $('svcMenu').innerHTML=S.items.map((x,k)=>`<li class="${k===svc.item?'on':''}"><a href="#floor" data-k="${k}">${esc(x[0])} <span>${x[3]?x[3][0]+' ↗':'→'}</span></a></li>`).join('');
    $('svcTags').innerHTML=S.tags.map(t=>`<span class="tag">${t}</span>`).join(''); tabs.forEach((a,k)=>{ a.classList.toggle('on',k===svc.tab); a.setAttribute('aria-selected',k===svc.tab); });
    const act=tabs[svc.tab], rl=$('rail'); if(act) rl.scrollTo({left:act.offsetLeft-(rl.clientWidth-act.offsetWidth)/2,behavior:'smooth'}); document.title=`${S.n} · Possible AV services (prototype)`; };
  const setTab=(i,now)=>{ if(i===svc.tab&&!now) { if(svc.item>=0){ svc.item=-1; T=null; draw(); } return; } const go=()=>{ svc.tab=i; svc.item=-1; show(i); T=null; hard=true; draw(); fade.classList.remove('on'); try{ history.replaceState(null,'','#'+SVC[i].k); }catch(e){} };
    if(now) go(); else { fade.classList.add('on'); setTimeout(go,230); } };
  tabs.forEach((a,k)=>a.addEventListener('click',e=>{ e.preventDefault(); setTab(k); }));
  $('svcMenu').addEventListener('click',e=>{ const a=e.target.closest('a[data-k]'); if(!a) return; e.preventDefault(); const k=+a.dataset.k; svc.item=svc.item===k?-1:k; T=null; draw(); });
  $('svcBack').addEventListener('click',e=>{ e.preventDefault(); svc.item=-1; T=null; draw(); });
  const fromHash=()=>{ const h=location.hash.replace(/^#(snap-?)?/,''), [tk,ik]=h.split('.'); const i=SVC.findIndex(s=>s.k===tk); return [i<0?0:i, ik!==undefined?+ik:-1]; };
  { const [i,k]=fromHash(); setTab(i,true); if(k>=0){ svc.item=k; T=null; draw(); } }
  addEventListener('hashchange',()=>{ const [i]=fromHash(); if(i!==svc.tab) setTab(i); });
}
