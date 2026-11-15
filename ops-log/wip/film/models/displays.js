/* ===== displays models: definitions only, nothing is added to the scene here ===== */
const DSP={};
function dspM(){ return DSP.m||(DSP.m={
  glass:std(0x050506,.06,.25,{envMapIntensity:1.4}),             // a screen's glass where it is not lit
  edge:std(0xc4c1b9,.26,.95,{envMapIntensity:1}),                // polished metal edge
  back:std(0x77767a,.36,.8,{envMapIntensity:1}),                 // brushed metal sheet
  body:std(0x1b1c1f,.58,.12,{bumpMap:speckT,bumpScale:.12}),      // moulded housing
  port:std(0x060607,.6,.2), cable:std(0x101012,.72,.05), frame:std(0x2c2d31,.36,.75,{envMapIntensity:1}),
  cast:std(0x3b3c41,.5,.55,{envMapIntensity:.9}), lam:std(0x17181a,.62,.08,{bumpMap:speckT,bumpScale:.16}), key:std(0x2a2b2f,.5,.2),
  gA:glow(AMBER), gW:glow(0xf2efe9), gG:glow(0x9fc08f) }); }
// small rounded box (cheaper than rbox, for parts the size of a hand or less)
const dspRb=(w,h,d,m,r=.004)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.max(.0006,Math.min(r,w/2-.0003,h/2-.0003,d/2-.0003))),m);
// merge every still mesh under g into one mesh per material; groups marked userData.live (things that move) are left alone
function dspBake(g){ g.updateMatrixWorld(true); const inv=g.matrixWorld.clone().invert(), bk=new Map(), dead=[];
  g.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh) return; for(let p=o;p&&p!==g;p=p.parent) if(p.userData.live) return;
    const k=o.material.uuid+(o.castShadow?'c':'n'); let b=bk.get(k); if(!b) bk.set(k,b={m:o.material,cast:o.castShadow,P:[],N:[],U:[]});
    const ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); ge.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));
    b.P.push(ge.attributes.position.array); b.N.push(ge.attributes.normal.array); b.U.push(ge.attributes.uv?ge.attributes.uv.array:new Float32Array(ge.attributes.position.count*2)); dead.push(o); });
  for(const o of dead) o.parent.remove(o);
  const cat=(a)=>{ let n=0; for(const x of a) n+=x.length; const r=new Float32Array(n); let i=0; for(const x of a){ r.set(x,i); i+=x.length; } return r; };
  for(const b of bk.values()){ const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.BufferAttribute(cat(b.P),3)); ge.setAttribute('normal',new THREE.BufferAttribute(cat(b.N),3)); ge.setAttribute('uv',new THREE.BufferAttribute(cat(b.U),2));
    const m=new THREE.Mesh(ge,b.m); m.castShadow=b.cast; m.receiveShadow=true; g.add(m); }
  return g; }
// a canvas that redraws itself every few frames
function dspAnim(key,w,h,draw,every=6){ if(DSP[key]) return DSP[key]; const t=ctex(w,h,()=>{}), g=t.userData.g; let f=Object.keys(DSP).length; draw(g,0,w,h);
  updaters.push(tm=>{ if(f++%every===0){ draw(g,tm,w,h); t.needsUpdate=true; } }); return DSP[key]=t; }
const dspEm={}; const dspEmis=(key,tex)=>dspEm[key]||(dspEm[key]=new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));
// an emissive picture; uv = [u0,v0,u1,v1] shows part of the texture
function dspScreen(w,h,mat,uv){ const ge=new THREE.PlaneGeometry(w,h); if(uv){ const U=ge.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i,lerp(uv[0],uv[2],U.getX(i)),lerp(uv[1],uv[3],U.getY(i))); } return new THREE.Mesh(ge,mat); }
const dspFont=(w,px,mono)=>w+' '+px+'px '+(mono?'"Geist Mono", ui-monospace, monospace':'Geist, system-ui, sans-serif');

/* ---------- what is on the screens ---------- */
// calm content for the TV: dunes at dusk, drifting slowly
function dspCalmTex(){ return dspAnim('calm',768,432,(g,tm,W,H)=>{
    const sky=g.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#141a2e'); sky.addColorStop(.42,'#3d3652'); sky.addColorStop(.68,'#c7764b'); sky.addColorStop(1,'#f2b56c'); g.fillStyle=sky; g.fillRect(0,0,W,H);
    const sx=W*.63+Math.sin(tm*.05)*18, sy=H*.55, rg=g.createRadialGradient(sx,sy,4,sx,sy,190); rg.addColorStop(0,'rgba(255,240,208,1)'); rg.addColorStop(.17,'rgba(255,222,160,.96)'); rg.addColorStop(.2,'rgba(255,196,128,.36)'); rg.addColorStop(1,'rgba(255,170,100,0)'); g.fillStyle=rg; g.fillRect(0,0,W,H);
    const cols=['#8a5049','#5c364b','#35253f','#17152a']; for(let L=0;L<4;L++){ const base=H*(.62+L*.095), amp=24-L*3, sp=(L+1)*5; g.fillStyle=cols[L]; g.beginPath(); g.moveTo(0,H);
      for(let x=0;x<=W;x+=12){ const q=x+tm*sp; g.lineTo(x,base+Math.sin(q*.008+L*1.7)*amp+Math.sin(q*.021+L)*amp*.35); } g.lineTo(W,H); g.closePath(); g.fill(); } },7); }
// a touch interface: header, a lead card, a grid of tiles, and a tap that moves from tile to tile
function dspTouchTex(portrait){ return dspAnim(portrait?'uiP':'uiL',portrait?432:768,portrait?768:432,(g,tm,W,H)=>{ const P=H>W, ink='#17181a', hh=P?64:52;
    g.fillStyle='#f1ede6'; g.fillRect(0,0,W,H); g.fillStyle=ink; g.fillRect(0,0,W,hh); g.fillStyle='#E8892D'; g.beginPath(); g.arc(30,hh/2,7,0,7); g.fill();
    g.fillStyle='#f1ede6'; g.font=dspFont(600,P?22:19); g.textBaseline='middle'; g.textAlign='left'; g.fillText('Welcome',48,hh/2+1); g.strokeStyle='rgba(241,237,230,.6)'; g.lineWidth=1.5; g.beginPath(); g.roundRect(W-70,hh/2-13,48,26,13); g.stroke(); g.font=dspFont(500,12,1); g.textAlign='center'; g.fillText('EN',W-46,hh/2+1);
    const hero=P?[20,hh+20,W-40,208]:[20,hh+18,292,H-hh-36], hg=g.createLinearGradient(hero[0],hero[1],hero[0]+hero[2],hero[1]+hero[3]); hg.addColorStop(0,'#ef9a45'); hg.addColorStop(1,'#b9551f'); g.fillStyle=hg; g.beginPath(); g.roundRect(...hero,20); g.fill();
    g.save(); g.beginPath(); g.roundRect(...hero,20); g.clip(); g.fillStyle='rgba(255,255,255,.14)'; g.beginPath(); g.arc(hero[0]+hero[2]*.86,hero[1]+hero[3]*.2,hero[3]*.5,0,7); g.fill(); g.beginPath(); g.arc(hero[0]+hero[2]*.7,hero[1]+hero[3]*1.05,hero[3]*.42,0,7); g.fill(); g.restore();
    g.fillStyle='#fff'; g.textAlign='left'; g.font=dspFont(700,P?36:33); g.fillText('Find your',hero[0]+22,hero[1]+hero[3]-(P?92:104)); g.fillText('way.',hero[0]+22,hero[1]+hero[3]-(P?52:66)); g.font=dspFont(500,P?15:14); g.fillStyle='rgba(255,255,255,.86)'; g.fillText('Tap a tile to begin',hero[0]+22,hero[1]+hero[3]-(P?22:30));
    const cols=P?2:3, rows=P?3:2, gx=P?20:332, gy=P?hero[1]+hero[3]+16:hero[1], gw=(W-gx-20-(cols-1)*14)/cols, gh=P?116:(hero[3]-14)/2, names=['Schedule','Map','Speakers','Exhibits','Food','Help'];
    const k=Math.floor(tm/2.3)%6, ph=(tm/2.3)%1;
    for(let i=0;i<6;i++){ const x=gx+(i%cols)*(gw+14), y=gy+Math.floor(i/cols)*(gh+14), hot=i===k&&ph>.12&&ph<.8; g.fillStyle=hot?'#fbe3cb':'#fffdf9'; g.strokeStyle=hot?'#E8892D':'rgba(23,24,26,.12)'; g.lineWidth=hot?2.5:1.5; g.beginPath(); g.roundRect(x,y,gw,gh,16); g.fill(); g.stroke();
      g.fillStyle=ink; g.beginPath(); g.arc(x+30,y+32,15,0,7); g.fill(); g.strokeStyle='#f1ede6'; g.lineWidth=2; g.beginPath();
      if(i===0){ g.rect(x+23,y+26,14,12); g.moveTo(x+23,y+30); g.lineTo(x+37,y+30); } else if(i===1){ g.moveTo(x+30,y+40); g.lineTo(x+24,y+30); g.arc(x+30,y+29,6,Math.PI,0); g.lineTo(x+30,y+40); } else if(i===2){ g.arc(x+30,y+28,4,0,7); g.moveTo(x+22,y+40); g.quadraticCurveTo(x+30,y+30,x+38,y+40); } else if(i===3){ g.rect(x+23,y+25,6,6); g.rect(x+31,y+25,6,6); g.rect(x+23,y+33,6,6); g.rect(x+31,y+33,6,6); } else if(i===4){ g.arc(x+30,y+32,7,0,7); g.moveTo(x+30,y+25); g.lineTo(x+30,y+39); } else { g.arc(x+30,y+32,7,0,7); g.moveTo(x+30,y+29); g.lineTo(x+30,y+33); }
      g.stroke(); g.fillStyle=ink; g.font=dspFont(600,P?19:17); g.textAlign='left'; g.fillText(names[i],x+16,y+gh-24); g.fillStyle='rgba(23,24,26,.34)'; g.fillRect(x+16,y+gh-10,gw*.42,2.5);
      if(i===k){ const cx=x+gw*.62, cy=y+gh*.52; g.strokeStyle='rgba(232,137,45,'+(1-ph).toFixed(2)+')'; g.lineWidth=3; g.beginPath(); g.arc(cx,cy,8+ph*56,0,7); g.stroke(); if(ph<.5){ g.fillStyle='rgba(232,137,45,'+(.55*(1-ph*2)).toFixed(2)+')'; g.beginPath(); g.arc(cx,cy,14,0,7); g.fill(); } } }
    if(P){ g.fillStyle=ink; g.beginPath(); g.roundRect(20,H-58,W-40,42,21); g.fill(); for(let i=0;i<3;i++){ g.fillStyle=i?'rgba(241,237,230,.4)':'#E8892D'; g.beginPath(); g.roundRect(W/2-66+i*48,H-41,36,8,4); g.fill(); } } },8); }
// the long picture that runs across the three screens of a playback station
function dspSpanTex(){ return dspAnim('span',1536,288,(g,tm,W,H)=>{ const bg=g.createLinearGradient(0,0,W,H); bg.addColorStop(0,'#101319'); bg.addColorStop(1,'#231c22'); g.fillStyle=bg; g.fillRect(0,0,W,H);
    const cols=['rgba(232,137,45,.92)','rgba(242,230,208,.9)','rgba(178,84,48,.9)','rgba(92,70,110,.85)']; for(let L=3;L>=0;L--){ g.fillStyle=cols[L]; g.beginPath(); const th=26+L*9, y0=H*(.34+L*.11);
      for(let x=0;x<=W;x+=16){ const y=y0+Math.sin(x*.0052+tm*.5+L*1.3)*46+Math.sin(x*.013-tm*.3+L)*14; x?g.lineTo(x,y):g.moveTo(x,y); } for(let x=W;x>=0;x-=16){ const y=y0+th+Math.sin(x*.0052+tm*.5+L*1.3+.5)*46+Math.sin(x*.013-tm*.3+L)*14; g.lineTo(x,y); } g.closePath(); g.fill(); }
    g.fillStyle='rgba(242,239,233,.9)'; const px=((tm*90)%(W+200))-100; g.beginPath(); g.arc(px,H*.2,7,0,7); g.fill(); g.fillStyle='rgba(242,239,233,.25)'; g.fillRect(px-140,H*.2-1.5,140,3); },6); }
// the operator's preview: the three outputs and a looping timeline
function dspMultiTex(){ const span=dspSpanTex(); return dspAnim('multi',512,320,(g,tm,W,H)=>{ g.fillStyle='#0c0e11'; g.fillRect(0,0,W,H); g.font=dspFont(600,13,1); g.textAlign='left'; g.textBaseline='middle';
    for(let i=0;i<3;i++){ const x=16+i*164; g.drawImage(span.userData.c,i*512,0,512,288,x,40,152,86); g.strokeStyle=i===1?'#E8892D':'#3a3e45'; g.lineWidth=2; g.strokeRect(x,40,152,86); g.fillStyle='#dfe6ea'; g.fillText('OUT '+'ABC'[i],x,26); g.fillStyle='#9fc08f'; g.beginPath(); g.arc(x+146,26,4,0,7); g.fill(); }
    g.fillStyle='#14171b'; g.fillRect(16,150,W-32,110); for(let r=0;r<3;r++){ g.fillStyle=['#E8892D','#c9d6c2','#7fa7c9'][r]; for(let k=0;k<4;k++) g.fillRect(28+k*118+r*14,162+r*32,104-r*10,22); }
    const ph=(tm*.09)%1; g.fillStyle='#f2efe9'; g.fillRect(28+ph*(W-56),152,2,106); g.fillStyle='#dfe6ea'; g.fillText('LOOP',16,286); g.fillStyle='#1b1e22'; g.fillRect(70,280,W-86,12); g.fillStyle='#E8892D'; g.fillRect(70,280,(W-86)*ph,12); },9); }
// what an LED wall shows; one texel is one LED
function dspLedTex(){ const t=dspAnim('led',512,384,(g,tm,W,H)=>{ g.fillStyle='#0c0b10'; g.fillRect(0,0,W,H); const cx=W*.5+Math.sin(tm*.2)*40, cy=H*.52;
    for(let k=7;k>=0;k--){ const r=((k+(tm*.16)%1)/8)*W*.72; g.fillStyle=['#E8892D','#f3e3c8','#b4532c','#3a2c4c'][k%4]; g.beginPath(); g.arc(cx,cy,r,0,7); g.fill(); }
    g.fillStyle='#0c0b10'; g.beginPath(); g.arc(cx,cy,W*.72*(((tm*.16)%1)/8),0,7); g.fill(); },6); t.magFilter=THREE.NearestFilter; return t; }
function dspLedMask(){ if(DSP.mask) return DSP.mask; const t=ctex(32,32,(g,w,h)=>{ g.fillStyle='rgba(4,4,6,.66)'; g.fillRect(0,0,w,h); g.globalCompositeOperation='destination-out'; g.beginPath(); g.arc(w/2,h/2,w*.36,0,7); g.fill(); },[128,128]); t.colorSpace=THREE.NoColorSpace;
  return DSP.mask=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}); }

/* ---------- 01 · an OLED TV on a rolling floor stand ---------- */
// the TV alone: origin at the centre of the picture, facing +z. A 4 mm sheet of glass on metal, and the electronics in a shallow box low on the back
function oledTv(){ const m=dspM(), g=new THREE.Group(), W=1.446, H=.83;
  g.add(at(rbox(W,H,.004,m.back,.0015),0,0,-.002)); g.add(at(rbox(W-.002,H-.002,.002,m.glass,.0008),0,0,.001));
  g.add(at(dspScreen(W-.018,H-.018,dspEmis('calm',dspCalmTex())),0,0,.0032));
  for(const s of [-1,1]){ g.add(at(dspRb(W+.005,.0035,.0085,m.edge,.0012),0,s*(H/2+.0006),-.001)); g.add(at(dspRb(.0035,H+.005,.0085,m.edge,.0012),s*(W/2+.0006),0,-.001)); }
  g.add(at(dspRb(.07,.012,.016,m.body,.004),0,-H/2-.007,-.006)); g.add(at(box(.004,.002,.001,m.gW),0,-H/2-.008,.0025));
  // electronics box: vents, mounting bosses, a port bay, speaker slots, a rating label
  const BY=-H*.2, BW=W*.8, BH=H*.52; g.add(at(rbox(BW,BH,.036,m.body,.014),0,BY,-.022));
  for(const sx of [-1,1]) for(let r=0;r<2;r++) for(let k=0;k<22;k++) g.add(at(box(.0035,.05,.002,m.port),sx*(BW*.2)+(k-10.5)*.0085,BY+BH/2-.05-r*.066,-.0405));
  g.add(at(dspRb(.36,.36,.003,m.frame,.006),0,BY-.02,-.0412)); for(const sx of [-1,1]) for(const sy of [-1,1]){ g.add(at(rot(cyl(.011,.011,.004,m.edge,16),Q),sx*.15,BY-.02+sy*.15,-.0435)); g.add(at(rot(cyl(.0045,.0045,.005,m.port,10),Q),sx*.15,BY-.02+sy*.15,-.0438)); }
  const pb=grp(g,-.3,BY+.02,-.0408); pb.add(dspRb(.11,.24,.003,m.port,.006)); for(let k=0;k<4;k++){ pb.add(at(box(.017,.007,.004,M.steel),-.02,.09-k*.03,-.002)); pb.add(at(box(.012,.004,.0045,m.port),-.02,.09-k*.03,-.0022)); }
  for(let k=0;k<2;k++) pb.add(at(box(.014,.007,.004,M.steel),.022,.09-k*.03,-.002)); pb.add(at(box(.017,.015,.004,M.steel),.022,.02,-.002)); pb.add(at(rot(cyl(.005,.005,.008,m.edge,12),Q),.022,-.02,-.003)); pb.add(at(rot(cyl(.0055,.0055,.006,M.steel,6),Q),-.02,-.05,-.003)); pb.add(at(rot(cyl(.0035,.0035,.012,M.amber,10),Q),-.02,-.05,-.004));
  for(const sx of [-1,1]) g.add(at(box(.24,.006,.02,m.port),sx*BW*.28,BY-BH/2+.0015,-.022));
  const lab=ctex(256,128,(c,w,h)=>{ c.fillStyle='#d9d6cf'; c.fillRect(0,0,w,h); c.fillStyle='#222'; c.font='700 15px monospace'; c.fillText('OLED DISPLAY',12,24); c.font='500 9px monospace'; for(let i=0;i<5;i++) c.fillText(['MODEL  PAV-TV','INPUT  AC','SERIAL 0000-0000','MADE FOR RENTAL USE','HANDLE WITH TWO PEOPLE'][i],12,44+i*13); for(let x=0;x<70;x+=3) c.fillRect(170+x,20,1+(x*7%3),50); c.strokeStyle='#222'; c.lineWidth=2; c.strokeRect(172,82,26,26); c.beginPath(); c.arc(222,95,13,0,7); c.stroke(); });
  g.add(at(rot(new THREE.Mesh(new THREE.PlaneGeometry(.12,.06),std(0xffffff,.7,0,{map:lab})),0,Math.PI,0),BW/2-.12,BY-BH/2+.07,-.0408));
  g.add(at(dspRb(.05,.04,.004,m.port,.006),.3,BY-.06,-.041));
  return g; }
function dspCaster(brake){ const g=new THREE.Group(); g.add(at(dspRb(.062,.005,.062,M.steel,.002),0,-.0025,0)); g.add(at(cyl(.021,.021,.014,M.steel,20),0,-.012,0)); g.add(at(dspRb(.054,.006,.05,M.steel,.002),0,-.022,-.012));
  for(const sx of [-1,1]){ g.add(at(dspRb(.004,.052,.04,M.steel,.0015),sx*.025,-.048,-.018)); g.add(at(rot(cyl(.007,.007,.006,M.steel,6),0,0,Q),sx*.029,-.0535,-.022)); }
  g.add(at(rot(cyl(.0325,.0325,.03,M.rubber,28),0,0,Q),0,-.0535,-.022)); g.add(at(rot(cyl(.019,.019,.036,M.alu,20),0,0,Q),0,-.0535,-.022));
  if(brake) g.add(at(rot(dspRb(.036,.006,.034,M.amber,.002),.4,0,0),0,-.03,.022)); return g; }
// the stand: splayed legs on casters, one column with the mount on a sliding carriage; behind it a media player, a power strip and the cables clipped down the column
function oledCart(){ const m=dspM(), g=new THREE.Group(), CY=1.12, CZ=-.14;
  for(const sx of [-1,1]){ const leg=grp(g,sx*.37,.108,.04); leg.rotation.y=sx*.13; leg.add(rbox(.075,.042,.78,m.frame,.014)); for(const sz of [-1,1]){ leg.add(at(dspRb(.079,.046,.03,M.rubber,.012),0,0,sz*.385)); const c=dspCaster(sz>0); c.position.set(0,-.021,sz*.33); c.rotation.y=sx*(sz>0?.5:2.5); leg.add(c); } }
  g.add(at(rbox(.76,.042,.11,m.frame,.012),0,.108,CZ)); g.add(at(dspRb(.21,.012,.14,M.steel,.004),0,.135,CZ)); for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(cyl(.007,.007,.008,M.steel,6),sx*.088,.143,CZ+sz*.052));
  g.add(at(rbox(.12,1.46,.062,m.frame,.008),0,.859,CZ)); g.add(at(box(.016,1.4,.002,m.port),0,.86,CZ+.0315)); for(const sx of [-1,1]) g.add(at(box(.004,1.4,.0016,m.edge),sx*.046,.86,CZ+.0315)); g.add(at(dspRb(.126,.014,.068,M.black,.005),0,1.594,CZ));
  // carriage and mount
  g.add(at(rbox(.18,.26,.1,M.black,.012),0,CY,CZ)); g.add(at(rot(cyl(.006,.006,.03,M.steel,10),0,0,Q),.1,CY,CZ)); g.add(at(rot(cyl(.025,.025,.018,M.black,7),0,0,Q),.122,CY,CZ)); g.add(at(rot(cyl(.012,.012,.003,M.amber,16),0,0,Q),.132,CY,CZ));
  for(const sy of [-1,1]) g.add(at(dspRb(.56,.05,.014,M.black,.004),0,CY+sy*.15,CZ+.057));
  for(const sx of [-1,1]){ g.add(at(dspRb(.04,.44,.016,M.steel,.004),sx*.15,CY,CZ+.073)); g.add(at(dspRb(.04,.02,.034,M.steel,.004),sx*.15,CY+.185,CZ+.062)); g.add(at(rot(cyl(.006,.006,.03,M.steel,8),Q),sx*.15,CY-.2,CZ+.06)); }
  const tv=oledTv(); tv.position.set(0,CY+.83*.2+.02,CZ+.081+.04); g.add(tv);
  // behind: the player on its bracket, a power strip, cables
  const bz=CZ-.031; g.add(at(dspRb(.2,.22,.004,M.black,.002),0,.84,bz-.003)); g.add(at(rbox(.13,.13,.032,M.shell2,.012),0,.85,bz-.022)); g.add(at(dspRb(.03,.15,.036,m.cable,.003),-.03,.85,bz-.022)); g.add(at(box(.006,.003,.002,m.gG),.04,.9,bz-.0385)); g.add(at(box(.006,.003,.002,m.gA),.028,.9,bz-.0385));
  g.add(at(cyl(.003,.003,.07,M.rubber,8),.052,.95,bz-.022)); for(const x of [-.02,.02]) g.add(at(box(.016,.008,.012,M.steel),x,.783,bz-.022));
  g.add(at(rbox(.058,.34,.038,M.shell2,.008),0,.44,bz-.02)); for(let k=0;k<4;k++) g.add(at(dspRb(.036,.036,.002,m.port,.005),0,.32+k*.066,bz-.0395)); g.add(at(dspRb(.02,.026,.006,m.gA,.002),0,.585,bz-.04));
  for(const k of [0,2]) g.add(at(dspRb(.032,.032,.028,m.cable,.006),0,.32+k*.066,bz-.054));
  const tx=tv.position.x, ty=tv.position.y, tz=tv.position.z, by=ty-.83*.2;
  g.add(tube([[.02,.776,bz-.022],[.03,.73,bz-.035],[-.03,.71,bz-.03],[-.075,.76,bz+.01],[-.078,.9,bz+.012],[-.085,by-.2,bz+.02],[-.2,by-.13,tz-.075],[-.3,by-.06,tz-.06],[-.3,by-.03,tz-.046]],.004,m.cable,48));     // signal: player to TV
  g.add(tube([[-.02,.776,bz-.022],[-.035,.72,bz-.04],[-.04,.6,bz-.06],[-.02,.48,bz-.075],[0,.455,bz-.068]],.0035,m.cable,24));                                   // player power
  g.add(tube([[0,.32,bz-.068],[.03,.3,bz-.09],[.07,.36,bz-.03],[.078,.6,bz+.012],[.08,.9,bz+.012],[.1,by-.2,bz+.02],[.22,by-.15,tz-.075],[.3,by-.1,tz-.06],[.3,by-.065,tz-.046]],.0045,m.cable,48));           // TV power
  g.add(tube([[0,.27,bz-.02],[0,.2,bz-.012],[0,.15,bz-.02],[.04,.12,bz-.1],[.16,.02,bz-.3],[.42,.007,bz-.46],[.74,.007,bz-.4],[.9,.007,bz-.16],[.86,.007,bz+.1]],.0055,m.cable,60));   // mains, out along the floor
  const pl=grp(g,.86,.016,bz+.13); pl.rotation.y=.2; pl.add(dspRb(.032,.03,.05,m.cable,.008)); for(const sx of [-1,1]) pl.add(at(box(.0015,.007,.018,M.steel),sx*.0065,0,.033));
  for(const y of [.66,.93]) for(const sx of [-1,1]) g.add(at(dspRb(.016,.014,.03,M.black,.003),sx*.07,y,bz+.012)); g.add(at(dspRb(.034,.014,.012,M.black,.003),0,.2,bz-.008));
  return dspBake(g); }

/* ---------- 02 · touch screens: a display on a tilting stand, and a floor kiosk ---------- */
// the slot-in computer: a cartridge that slides out of the side of the display
function dspSlotPc(){ const m=dspM(), g=new THREE.Group(), t=ctex(512,320,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#b9b6ae'); gr.addColorStop(1,'#a19e96'); c.fillStyle=gr; c.fillRect(0,0,w,h); for(let i=0;i<900;i++){ c.fillStyle='rgba(255,255,255,'+(Math.random()*.08).toFixed(3)+')'; c.fillRect(0,Math.random()*h,w,1); }
      c.fillStyle='#1c1d20'; for(let r=0;r<9;r++) for(let k=0;k<26;k++){ c.beginPath(); c.arc(40+k*11+(r%2)*5.5,34+r*9.5,3,0,7); c.fill(); }
      c.font='700 30px monospace'; c.fillText('SLOT-IN COMPUTER',36,176); c.font='600 22px monospace'; c.fillText('ANDROID / WINDOWS',36,214); c.font='500 14px monospace'; c.fillText('RUNS THE APP INSIDE THE SCREEN',36,246); c.fillStyle='#E8892D'; c.fillRect(36,266,120,8); c.fillStyle='#1c1d20'; c.fillRect(166,266,300,8); c.strokeStyle='#1c1d20'; c.lineWidth=2; c.strokeRect(372,28,104,84); c.font='600 13px monospace'; c.fillText('CPU',408,74); });
  g.add(rbox(.19,.118,.028,M.alu,.003)); const f=std(0xffffff,.42,.6,{map:t,envMapIntensity:.9}); g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(.18,.108),f),-.002,0,.0148));
  g.add(at(dspRb(.006,.132,.038,M.black,.002),.098,0,0)); for(const sy of [-1,1]){ g.add(at(rot(cyl(.0065,.0065,.012,M.steel,14),0,0,Q),.106,sy*.056,0)); g.add(at(rot(cyl(.0032,.0032,.012,M.amber,10),0,0,Q),.107,sy*.036,.009)); }
  for(let k=0;k<3;k++) g.add(at(box(.003,.013,.006,M.steel),.1015,-.016+k*.018,-.008)); g.add(at(box(.003,.014,.012,M.steel),.1015,-.002,.008)); g.add(at(box(.004,.005,.005,m.gA),.1015,.022,.008)); return g; }
// a commercial touch display: thick, flush glass, a hump of electronics, handles and vents behind. Origin at the centre of the glass
function touchPanel(W,H,mat,withPc){ const m=dspM(), g=new THREE.Group(), D=.058;
  g.add(at(rbox(W,H,D,m.body,.012),0,0,-D/2)); g.add(at(rbox(W-.008,H-.008,.004,m.glass,.0015),0,0,.0005)); g.add(at(dspScreen(W-.064,H-.064,mat),0,0,.0036));
  for(const s of [-1,1]){ g.add(at(dspRb(W-.01,.004,.006,m.edge,.0015),0,s*(H/2-.0035),.0008)); g.add(at(dspRb(.004,H-.01,.006,m.edge,.0015),s*(W/2-.0035),0,.0008)); }
  g.add(at(box(.006,.002,.001,m.gW),W/2-.06,-H/2+.016,.0032)); g.add(at(rot(cyl(.004,.004,.001,std(0x10131c,.1,.4),14),Q),0,H/2-.017,.0032));
  g.add(at(rbox(W*.62,H*.62,.022,m.body,.01),0,0,-D-.009)); for(const sx of [-1,1]) for(let k=0;k<26;k++) g.add(at(box(.004,.07,.002,m.port),sx*W*.17+(k-12.5)*.009,H*.18,-D-.0205));
  for(const sx of [-1,1]) for(const sy of [-1,1]) g.add(at(rot(cyl(.01,.01,.004,m.edge,14),Q),sx*.2,sy*.2,-D-.021));
  for(const sx of [-1,1]) g.add(tube([[sx*W*.36,H*.12,-D],[sx*W*.36,H*.12,-D-.04],[sx*W*.36,H*.3,-D-.04],[sx*W*.36,H*.3,-D]],.008,M.satin,24));
  const pc=dspSlotPc(); pc.position.set(W/2-.1,H*.2,-.032); pc.userData.live=true; pc.userData.x0=pc.position.x; g.add(pc); g.userData.pc=pc; g.add(at(box(.002,.122,.032,m.port),W/2+.0003,H*.2,-.032));
  for(let k=0;k<4;k++) g.add(at(dspRb(.003,.012,.008,m.key,.001),W/2+.0008,-H*.1-k*.022,-.03));
  return g; }
function touchStand(){ const m=dspM(), g=new THREE.Group(), W=1.232, H=.712;
  g.add(at(rbox(.9,.024,.62,m.frame,.01),0,.03,0)); for(const sx of [-1,1]) for(const sz of [-1,1]){ g.add(at(cyl(.03,.034,.014,M.rubber,18),sx*.38,.007,sz*.25)); g.add(at(cyl(.008,.008,.012,M.steel,8),sx*.38,.045,sz*.25)); }
  g.add(at(dspRb(.24,.014,.2,M.steel,.004),0,.049,-.06)); g.add(at(rbox(.15,.84,.1,m.frame,.014),0,.47,-.06)); g.add(at(box(.06,.7,.002,m.port),0,.47,-.1105)); g.add(at(dspRb(.05,.03,.006,M.black,.003),0,.2,-.112));
  // tilt head: a yoke with a pivot each side, and the lever that locks the angle
  const PY=.98; g.add(at(rbox(.62,.07,.1,m.frame,.014),0,.89,-.06));
  for(const sx of [-1,1]){ g.add(at(rbox(.016,.2,.13,m.frame,.006),sx*.3,PY-.02,-.06)); g.add(at(rot(cyl(.04,.04,.012,M.alu,28),0,0,Q),sx*.312,PY,-.06)); g.add(at(rot(cyl(.012,.012,.02,M.steel,6),0,0,Q),sx*.318,PY,-.06)); }
  g.add(rod2(V(.325,PY,-.06),V(.36,PY-.11,.0),.007,M.steel)); g.add(at(sph(.017,M.amber,14,10),.362,PY-.115,.004));
  const head=grp(g,0,PY,-.06); head.rotation.x=-.62; head.add(at(rbox(.58,.3,.03,M.black,.008),0,0,.045)); head.add(rot(cyl(.03,.03,.58,m.frame,20),0,0,Q));
  const p=touchPanel(W,H,dspEmis('uiL',dspTouchTex(false))); p.position.set(0,.02,.06+.058+.022); head.add(p);
  g.add(tube([[0,PY-.1,-.13],[0,PY-.2,-.2],[0,.75,-.13],[0,.7,-.112]],.006,m.cable,24));
  const pc=p.userData.pc; dspBake(pc); dspBake(g); g.userData.pc=pc; return g; }
// the kiosk: a slim totem on a steel foot, portrait screen behind full-height glass, speaker and vents below
function touchKiosk(){ const m=dspM(), g=new THREE.Group(), W=.74, H=1.86, D=.09, Y0=.034, GH=1.27, GY=Y0+H-.03-GH/2;
  g.add(at(rbox(.94,.022,.58,m.frame,.008),0,.023,-.02)); for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(at(cyl(.03,.034,.012,M.rubber,18),sx*.4,.006,-.02+sz*.23));
  g.add(at(rbox(W,H,D,m.body,.028),0,Y0+H/2,0)); g.add(at(rbox(W-.036,GH,.004,m.glass,.0015),0,GY,D/2+.0006)); g.add(at(dspScreen(.63,1.12,dspEmis('uiP',dspTouchTex(true))),0,GY-.005,D/2+.0036));
  for(const s of [-1,1]){ g.add(at(dspRb(W-.03,.004,.006,m.edge,.0015),0,GY+s*(GH/2+.002),D/2+.0006)); g.add(at(dspRb(.004,GH+.008,.006,m.edge,.0015),s*(W/2-.016),GY,D/2+.0006)); }
  g.add(at(rot(cyl(.0055,.0055,.001,std(0x10131c,.1,.4),14),Q),0,GY+GH/2-.03,D/2+.0034)); g.add(at(box(.005,.005,.001,m.gA),.03,GY+GH/2-.03,D/2+.0034));
  // lower face: speaker behind perforated steel, a badge, a kick plate
  const SY=.44; g.add(at(dspRb(.5,.13,.006,M.shell2,.012),0,SY,D/2-.0015)); g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(.46,.09),grilleMat('dspKiosk',.46,.09,[[.25,.5,.04],[.75,.5,.04]])),0,SY,D/2+.0026));
  g.add(at(dspRb(.09,.018,.004,M.alu,.002),0,.27,D/2+.0008)); g.add(at(dspRb(W-.07,.1,.004,m.edge,.002),0,Y0+.085,D/2-.0002));
  // side: service door and its lock; back: vents, a door seam, the power inlet and its cable
  g.add(at(box(.002,.9,.002,m.port),W/2+.0002,.75,-.02)); g.add(at(rot(cyl(.012,.012,.006,M.steel,16),0,0,Q),W/2+.002,.92,.012)); g.add(at(box(.004,.012,.003,m.port),W/2+.0045,.92,.012));
  for(let r=0;r<2;r++) for(let k=0;k<30;k++) g.add(at(box(.005,.09,.002,m.port),(k-14.5)*.012,1.5-r*.9,-D/2-.0003));
  g.add(at(dspRb(.06,.05,.008,m.port,.004),-.2,.2,-D/2-.003)); g.add(tube([[-.2,.2,-D/2-.006],[-.2,.19,-D/2-.05],[-.22,.06,-D/2-.1],[-.3,.008,-.4],[-.5,.008,-.5]],.006,m.cable,28));
  return dspBake(g); }

/* ---------- 03 · a transparent display with a real object behind it ---------- */
function dspBottle(){ const g=new THREE.Group(), gl=std(0xe08a22,.1,.0,{envMapIntensity:1.5}), cl=std(0xf4efe6,.05,.0,{envMapIntensity:1.6,transparent:true,opacity:.38,depthWrite:false});
  const liq=at(rbox(.2,.2,.082,gl,.026),0,.135,0); liq.renderOrder=1; g.add(liq); const sh=at(rbox(.23,.262,.11,cl,.034),0,.133,0); sh.renderOrder=2; sh.castShadow=false; g.add(sh);
  g.add(lathe([[0,.264],[.03,.264],[.03,.27],[.026,.274],[.026,.292],[0,.292]],M.alu,28)); g.add(at(rbox(.074,.086,.074,M.black,.012),0,.337,0)); g.add(at(cyl(.0385,.0385,.004,M.alu,32),0,.296,0));
  g.add(at(dspRb(.07,.03,.002,M.white,.002),0,.1,.0562)); return g; }
// graphics for the glass, drawn in as u goes 0 to 1: a ring round the object, two callouts, a title
function dspGfx(){ const W=1024, H=576, t=ctex(W,H,()=>{}), g=t.userData.g, cx=W*.5, cy=H*.44;
  const draw=(u,tm)=>{ g.clearRect(0,0,W,H); if(u<=.001){ t.needsUpdate=true; return; } const a=clamp(u*3), b=clamp((u-.3)*3), c=clamp((u-.6)*2.5);
    g.lineCap='round'; g.strokeStyle='rgba(242,239,233,.28)'; g.lineWidth=1.5; g.beginPath(); g.arc(cx,cy,176,0,7); g.stroke();
    g.strokeStyle='#E8892D'; g.lineWidth=5; g.beginPath(); g.arc(cx,cy,176,-Q,-Q+a*Math.PI*1.72); g.stroke();
    g.strokeStyle='rgba(242,239,233,.85)'; g.lineWidth=2; for(let k=0;k<48;k++){ if(k/48>a) break; const an=-Q+k/48*Math.PI*2+tm*.12, r0=192, r1=k%4?199:208; g.beginPath(); g.moveTo(cx+Math.cos(an)*r0,cy+Math.sin(an)*r0); g.lineTo(cx+Math.cos(an)*r1,cy+Math.sin(an)*r1); g.stroke(); }
    const lead=(x0,y0,x1,y1,x2,k,txt,sub)=>{ if(k<=0) return; const p=clamp(k*2), q=clamp(k*2-1); g.strokeStyle='#f2efe9'; g.fillStyle='#f2efe9'; g.lineWidth=2.5; g.beginPath(); g.arc(x0,y0,5,0,7); g.fill(); g.beginPath(); g.moveTo(x0,y0); g.lineTo(lerp(x0,x1,p),lerp(y0,y1,p)); if(q>0) g.lineTo(lerp(x1,x2,q),y1); g.stroke();
      if(q>.5){ g.globalAlpha=(q-.5)*2; g.textAlign=x2>x1?'left':'right'; const tx=x2>x1?x1+8:x1-8; g.font=dspFont(600,25); g.fillText(txt,tx,y1-14); g.font=dspFont(500,15,1); g.fillStyle='#E8892D'; g.fillText(sub,tx,y1+24); g.globalAlpha=1; } };
    lead(cx+86,cy-112,cx+226,cy-176,cx+470,b,'Hand-finished glass','DETAIL 01'); lead(cx-104,cy+70,cx-232,cy+150,cx-470,b-.25,'Refill at the counter','DETAIL 02');
    if(c>0){ g.globalAlpha=c; g.textAlign='left'; g.fillStyle='#E8892D'; g.font=dspFont(500,17,1); g.fillText('NEW  ·  IN STORE NOW',48,84-(1-c)*10); g.fillStyle='#f2efe9'; g.font=dspFont(700,92); g.fillText('Amber',42,170-(1-c)*14);
      g.textAlign='right'; g.font=dspFont(500,16,1); g.fillText('TOUCH THE GLASS TO EXPLORE',W-48,H-44); g.fillStyle='#E8892D'; g.fillRect(W-48-292,H-30,292*(.5+.5*Math.sin(tm*.8)),4); g.globalAlpha=1; }
    g.fillStyle='rgba(242,239,233,'+(.7*a).toFixed(2)+')'; for(let k=0;k<26;k++){ const px=cx+Math.sin(k*12.9)*300, py=H-((tm*18*(1+k%3*.4)+k*47)%H); g.beginPath(); g.arc(px+Math.sin(tm*.6+k)*8,py,1.2+(k%3)*.7,0,7); g.fill(); }
    t.needsUpdate=true; }; return {t,draw}; }
function transparentCase(){ const m=dspM(), g=new THREE.Group(), PW=1.44, PH=.82, PD=.66, GW=1.21, GH=.68, T=PH+.02;
  // plinth with a shadow gap at the floor and a metal top
  g.add(at(rbox(PW-.06,.04,PD-.06,m.port,.004),0,.02,0)); g.add(at(rbox(PW,PH-.02,PD,m.body,.01),0,.04+(PH-.02)/2,0)); g.add(at(rbox(PW+.004,.006,PD+.004,m.frame,.002),0,T-.003,0));
  g.add(at(dspRb(.11,.03,.002,M.alu,.002),PW/2-.12,.16,PD/2+.0008)); g.add(at(box(.003,PH-.12,.002,m.port),0,.04+(PH-.02)/2,PD/2+.0003)); for(const sx of [-1,1]) g.add(at(dspRb(.012,.1,.006,M.alu,.002),sx*.03,PH*.62,PD/2+.003));
  // the display: electronics in the base rail, the glass above it in a hairline frame
  const z=.2, RH=.085; g.add(at(rbox(GW+.05,RH,.11,m.frame,.01),0,T+RH/2,z)); g.add(at(box(GW-.1,.002,.03,m.port),0,T+RH+.0003,z-.02)); g.add(at(box(.004,.004,.001,m.gA),GW/2-.04,T+RH/2,z+.0553)); for(let k=0;k<14;k++) g.add(at(box(.004,.03,.002,m.port),-.2+k*.01,T+RH/2,z-.0553));
  for(const sx of [-1,1]) g.add(at(dspRb(.008,GH,.012,M.black,.002),sx*(GW/2+.004),T+RH+GH/2,z)); g.add(at(dspRb(GW+.016,.008,.012,M.black,.002),0,T+RH+GH+.004,z));
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(GW,GH),std(0x14181d,.04,.1,{transparent:true,opacity:.46,depthWrite:false,envMapIntensity:1.5,side:THREE.DoubleSide})); glass.position.set(0,T+RH+GH/2,z); glass.renderOrder=3; glass.userData.live=true; g.add(glass);
  const gfx=dspGfx(), pic=new THREE.Mesh(new THREE.PlaneGeometry(GW,GH),new THREE.MeshBasicMaterial({map:gfx.t,transparent:true,depthWrite:false,toneMapped:false})); pic.position.set(0,T+RH+GH/2,z+.002); pic.renderOrder=4; pic.userData.live=true; g.add(pic);
  g.add(tube([[.3,T+.03,z-.06],[.3,T+.012,z-.12],[.34,T+.008,z-.2],[.4,T+.004,z-.24]],.005,m.cable,16)); g.add(at(cyl(.022,.022,.006,M.rubber,18),.4,T+.002,z-.25));
  // the product, on a low riser behind the glass
  g.add(at(cyl(.2,.2,.03,M.alu,48),0,T+.015,-.02)); g.add(at(cyl(.19,.19,.004,M.black,48),0,T+.032,-.02)); const bt=dspBottle(); bt.scale.setScalar(1.4); bt.position.set(0,T+.034,-.02); bt.rotation.y=.35; bt.userData.live=true; g.add(bt);
  dspBake(g); return {g,gfx}; }

/* ---------- 04 · a playback station: screens on truss, players in a rack, a control position ---------- */
// box truss standing along +y, 290 mm square
function dspTruss(len){ const g=new THREE.Group(), a=.12; for(const sx of [-1,1]) for(const sz of [-1,1]){ g.add(at(cyl(.025,.025,len-.04,M.alu,12),sx*a,len/2,sz*a)); for(const y of [.012,len-.012]) g.add(at(cyl(.03,.03,.024,M.steel,12),sx*a,y,sz*a)); }
  const n=Math.max(1,Math.round((len-.1)/.3)), st=(len-.1)/n; for(let i=0;i<n;i++){ const y0=.05+i*st, y1=y0+st, f=i%2?1:-1;
    g.add(rod2(V(-a*f,y0,a),V(a*f,y1,a),.009,M.alu)); g.add(rod2(V(a*f,y0,-a),V(-a*f,y1,-a),.009,M.alu)); g.add(rod2(V(a,y0,-a*f),V(a,y1,a*f),.009,M.alu)); g.add(rod2(V(-a,y0,a*f),V(-a,y1,-a*f),.009,M.alu)); }
  for(const y of [.05,len-.05]) for(const s of [-1,1]){ g.add(rod2(V(-a,y,s*a),V(a,y,s*a),.011,M.alu)); g.add(rod2(V(s*a,y,-a),V(s*a,y,a),.011,M.alu)); } return g; }
// a slim commercial screen, origin at the centre of the glass; uv picks its part of a shared picture
function dspLcd(W,H,mat,uv){ const m=dspM(), g=new THREE.Group(), D=.04; g.add(at(rbox(W,H,D,m.body,.008),0,0,-D/2)); g.add(at(dspRb(W-.006,H-.006,.003,m.glass,.001),0,0,.0004)); g.add(at(dspScreen(W-.024,H-.024,mat,uv),0,0,.003));
  g.add(at(rbox(W*.5,H*.55,.02,m.body,.008),0,0,-D-.008)); g.add(at(box(.006,.002,.001,m.gW),W/2-.05,-H/2+.006,.0022)); for(let k=0;k<20;k++) g.add(at(box(.004,.06,.002,m.port),(k-9.5)*.01,H*.14,-D-.0185)); return g; }
function dspStool(){ const g=new THREE.Group(); g.add(at(lathe([[0,0],[.165,0],[.18,.012],[.182,.04],[.17,.058],[.1,.066],[0,.068]],M.rubber,40),0,.66,0)); g.add(at(cyl(.1,.1,.012,M.black,28),0,.655,0)); g.add(at(cyl(.024,.024,.3,M.alu,18),0,.5,0)); g.add(at(cyl(.032,.034,.3,M.black,18),0,.24,0));
  g.add(at(rot(mesh(new THREE.TorusGeometry(.19,.01,8,40),M.alu),Q),0,.3,0)); for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; g.add(rod2(V(0,.1,0),V(Math.cos(a)*.28,.055,Math.sin(a)*.28),.014,M.alu)); if(k<3) g.add(rod2(V(0,.3,0),V(Math.cos(a*5/3)*.19,.3,Math.sin(a*5/3)*.19),.006,M.alu)); g.add(at(cyl(.022,.024,.03,M.rubber,14),Math.cos(a)*.28,.022,Math.sin(a)*.28)); } return g; }
// the rack: a flight case on casters, lid off, three players, a switch and power; the preview monitor and a key controller on top
function dspRack(){ const m=dspM(), g=new THREE.Group(), W=.6, H=.74, D=.62, Y0=.1;
  g.add(at(rbox(W,H,D-.03,m.lam,.008),0,Y0+H/2,-.015)); g.add(at(box(W-.06,H-.06,.004,m.port),0,Y0+H/2,D/2-.03));
  for(const sy of [0,1]){ for(const sz of [-1,1]) g.add(at(dspRb(W+.012,.03,.03,M.alu,.007),0,Y0+sy*H,sz*D/2-(sz>0?.03:0))); for(const sx of [-1,1]) g.add(at(dspRb(.03,.03,D-.02,M.alu,.007),sx*W/2,Y0+sy*H,-.015)); }
  for(const sx of [-1,1]) for(const sz of [-1,1]){ g.add(at(dspRb(.03,H,.03,M.alu,.007),sx*W/2,Y0+H/2,sz*D/2-(sz>0?.03:0))); for(const sy of [0,1]) g.add(at(sph(.032,M.steel,14,10),sx*W/2,Y0+sy*H,sz*D/2-(sz>0?.03:0))); const c=dspCaster(sz>0); c.position.set(sx*(W/2-.08),Y0-.014,sz*(D/2-.11)); c.rotation.y=sx*.6; g.add(c); }
  for(const sx of [-1,1]){ g.add(at(dspRb(.016,H-.07,.004,M.steel,.001),sx*.236,Y0+H/2,D/2-.026)); const hd=grp(g,sx*(W/2+.002),Y0+H*.55,-.02); hd.add(dspRb(.008,.14,.22,M.alu,.004)); hd.add(at(dspRb(.012,.09,.16,M.black,.004),sx*.002,0,0)); hd.add(at(dspRb(.02,.02,.14,M.steel,.008),sx*.012,-.02,0)); }
  // units, top down. One rack unit is 44.5 mm
  const U=.0445, face=std(0x1b1c1f,.4,.5,{envMapIntensity:1}), fz=D/2-.022; let y=Y0+H-.05;
  const ears=(n)=>{ for(const sx of [-1,1]) for(const s of (n>1?[-1,1]:[0])) g.add(at(rot(cyl(.004,.004,.003,M.steel,8),Q),sx*.236,y-n*U/2+s*(n*U/2-.012),fz+.004)); };
  for(let k=0;k<3;k++){ g.add(at(dspRb(.483,U-.002,.005,face,.0015),0,y-U/2,fz)); g.add(at(dspRb(.074,.03,.002,m.port,.001),-.15,y-U/2,fz+.003)); g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(.068,.024),new THREE.MeshBasicMaterial({map:lcd(['PLAYER '+(k+1)+'  LOOP'],320,112)})),-.15,y-U/2,fz+.0045));
    for(let b=0;b<4;b++) g.add(at(dspRb(.012,.008,.004,m.key,.001),-.08+b*.02,y-U/2,fz+.004)); g.add(at(box(.013,.006,.003,m.port),.05,y-U/2,fz+.002)); g.add(at(rot(cyl(.009,.009,.01,M.alu,18),Q),.17,y-U/2,fz+.007)); g.add(at(box(.005,.005,.002,k===1?m.gA:m.gG),.2,y-U/2,fz+.003)); ears(1); y-=U; }
  g.add(at(dspRb(.483,U-.002,.005,face,.0015),0,y-U/2,fz)); for(let k=0;k<34;k++) g.add(at(box(.006,.026,.002,m.port),(k-16.5)*.0115,y-U/2,fz+.002)); ears(1); y-=U;
  g.add(at(dspRb(.483,U-.002,.005,M.alu,.0015),0,y-U/2,fz)); for(let k=0;k<16;k++){ const px=-.2+(k%8)*.018+(k%8>3?.01:0), py=y-U/2+(k<8?.008:-.009); g.add(at(box(.013,.011,.003,m.port),px,py,fz+.002)); g.add(at(box(.003,.002,.002,k%5===3?m.gA:m.gG),px-.004,py+.007,fz+.003)); } g.add(at(box(.05,.012,.002,m.port),.16,y-U/2,fz+.002)); ears(1); y-=U;
  g.add(at(dspRb(.483,2*U-.002,.005,face,.0015),0,y-U,fz)); g.add(at(dspRb(.022,.03,.008,m.gA,.002),-.2,y-U,fz+.004)); for(let k=0;k<6;k++){ g.add(at(dspRb(.03,.03,.003,m.port,.006),-.12+k*.05,y-U,fz+.003)); g.add(at(box(.004,.004,.002,m.gG),-.12+k*.05,y-U+.024,fz+.003)); } ears(2); y-=2*U;
  g.add(at(dspRb(.483,3*U-.002,.005,face,.0015),0,y-1.5*U,fz)); g.add(at(dspRb(.2,.014,.016,M.alu,.005),0,y-1.5*U,fz+.01)); ears(3); y-=3*U;
  g.add(at(dspRb(.483,y-(Y0+.04),.005,face,.0015),0,(y+Y0+.04)/2,fz)); for(let k=0;k<30;k++) g.add(at(box(.006,.05,.002,m.port),(k-14.5)*.012,(y+Y0+.04)/2,fz+.002));
  // on top: a mat, the preview monitor, the key controller, a cue sheet
  const T=Y0+H+.016; g.add(at(dspRb(W-.06,.004,D-.1,M.rubber,.002),0,T,-.015));
  const mon=grp(g,-.08,T,-.15); mon.rotation.y=.12; mon.add(at(dspRb(.2,.01,.13,M.black,.004),0,.007,0)); mon.add(at(dspRb(.03,.1,.02,M.black,.006),0,.06,-.02)); const scr=grp(mon,0,.2,0); scr.rotation.x=-.12; scr.add(at(rbox(.39,.25,.022,m.body,.006),0,0,-.011)); scr.add(at(dspRb(.384,.244,.002,m.glass,.001),0,0,.0006)); scr.add(at(dspScreen(.368,.228,dspEmis('multi',dspMultiTex())),0,0,.0022));
  const kp=grp(g,.12,T+.004,.14); kp.rotation.set(.0,-.1,0); const kb=grp(kp,0,.014,0); kb.rotation.x=.3; kb.add(dspRb(.2,.02,.12,M.shell2,.006)); for(let r=0;r<3;r++) for(let c=0;c<5;c++){ const hot=(r*5+c)%7===2, wh=(r*5+c)===8; kb.add(at(dspRb(.03,.008,.03,hot?m.gA:(wh?m.gW:m.key),.003),-.074+c*.037,.013,-.037+r*.037)); } kp.add(at(dspRb(.2,.012,.02,M.shell2,.004),0,.006,-.06));
  const sheet=ctex(128,180,(c,w,h)=>{ c.fillStyle='#f2efe9'; c.fillRect(0,0,w,h); c.fillStyle='#2a2a2a'; c.font='700 11px monospace'; c.fillText('RUN OF SHOW',10,18); for(let i=0;i<11;i++){ c.fillStyle=i%4===1?'#E8892D':'#8b8882'; c.fillRect(10,30+i*13,8,6); c.fillStyle='#8b8882'; c.fillRect(24,31+i*13,60+(i*37%40),4); } });
  g.add(at(rot(new THREE.Mesh(new THREE.PlaneGeometry(.15,.21),std(0xffffff,.8,0,{map:sheet})),-Q,0,.25),-.14,T+.0035,.17)); g.add(at(rot(cyl(.004,.004,.14,M.amber,10),Q,0,1.2),-.05,T+.007,.2));
  return g; }
function playbackStation(){ const m=dspM(), g=new THREE.Group(), XU=2.22, TH=2.42, SW=1.232, SH=.712, SY=1.5, span=dspEmis('span',dspSpanTex());
  for(const sx of [-1,1]){ g.add(at(rbox(.72,.012,.72,M.satin,.004),sx*XU,.006,0)); const u=dspTruss(TH); u.position.set(sx*XU,.03,0); g.add(u); const c=dspTruss(.29); c.position.set(sx*XU,.03+TH,0); g.add(c); for(const a of [-1,1]) for(const b of [-1,1]) g.add(at(cyl(.03,.036,.03,M.steel,12),sx*XU+a*.12,.027,b*.12)); }
  const BY=.03+TH+.145, bm=dspTruss(2*XU-.29); bm.rotation.z=-Q; bm.position.set(-XU+.145,BY,0); g.add(bm);
  for(let k=0;k<3;k++){ const x=(k-1)*(SW+.06), s=grp(g,x,0,0);
    s.add(at(dspRb(.05,.03,.36,M.black,.008),0,BY-.158,0)); for(const sz of [-1,1]){ s.add(at(dspRb(.05,.084,.084,M.black,.02),0,BY-.12,sz*.12)); s.add(at(rot(cyl(.007,.007,.05,M.steel,8),0,0,Q),.03,BY-.12,sz*.12)); s.add(at(rot(cyl(.014,.014,.012,M.amber,6),0,0,Q),.058,BY-.12,sz*.12)); }
    s.add(at(cyl(.024,.024,BY-.17-SY,M.satin,16),0,(BY-.17+SY)/2,0)); s.add(at(dspRb(.34,.34,.006,M.black,.003),0,SY,.027)); s.add(at(dspRb(.08,.12,.05,M.black,.008),0,SY,.004));
    s.add(at(dspLcd(SW,SH,span,[k/3,0,(k+1)/3,1]),0,SY,.03+.04+.02)); s.add(at(dspRb(.11,.11,.028,M.shell2,.01),.2,SY+.05,.012)); s.add(at(box(.005,.003,.002,m.gG),.24,SY+.09,-.003));
    s.add(tube([[.2,SY+.105,.012],[.16,SY+.2,-.01],[.03,SY+.3,-.02],[.03,BY-.3,-.022],[.03,BY-.19,-.06],[.03,BY-.1,-.15]],.006,m.cable,28)); }
  // the loom: along the beam, down the right-hand upright, across the floor to the rack
  g.add(tube([[-1.3,BY+.15,-.1],[0,BY+.152,-.1],[XU-.2,BY+.15,-.1],[XU-.02,BY+.1,-.16],[XU,BY-.3,-.16],[XU,.4,-.16],[XU+.02,.06,-.2],[XU+.25,.012,-.05],[XU+.75,.012,.42],[XU+1.0,.012,.5],[XU+1.08,.12,.52]],.013,m.cable,90));
  for(const x of [-1.2,0,1.2]) g.add(at(dspRb(.02,.006,.05,M.amber,.002),x,BY+.166,-.1));
  const rk=dspRack(); rk.position.set(XU+1.15,0,.85); rk.rotation.y=-.5; g.add(rk); const st=dspStool(); st.position.set(XU+.8,0,1.75); g.add(st);
  return dspBake(g); }

/* ---------- 05 · a section of LED wall: cabinets on a ground stack; one lifts out ---------- */
function ledCabinet(uv){ const m=dspM(), g=new THREE.Group(), C=.5; g.add(at(box(C-.001,C-.001,.018,m.port),0,0,-.01)); g.add(at(dspScreen(C-.001,C-.001,dspEmis('led',dspLedTex()),uv),0,0,.0005)); const mk=new THREE.Mesh(new THREE.PlaneGeometry(C-.001,C-.001),dspLedMask()); mk.position.z=.0016; mk.renderOrder=2; g.add(mk);
  // die-cast frame: a rim, cross ribs, the hub with power and data, a handle, locks on the top and one side
  for(const s of [-1,1]){ g.add(at(dspRb(C-.002,.028,.052,m.cast,.004),0,s*(C/2-.015),-.045)); g.add(at(dspRb(.028,C-.058,.052,m.cast,.004),s*(C/2-.015),0,-.045)); g.add(at(rot(dspRb(.6,.02,.014,m.cast,.003),0,0,s*Math.PI/4),0,0,-.027)); }
  g.add(at(dspRb(.23,.19,.05,m.body,.01),0,-.01,-.047)); g.add(at(box(.004,.004,.002,m.gG),.08,.06,-.0725)); g.add(at(dspRb(.05,.02,.003,M.alu,.002),-.06,.06,-.0725));
  for(const [x,mm] of [[-.07,M.steel],[-.025,M.steel],[.035,M.alu],[.08,M.alu]]){ g.add(at(cyl(.013,.013,.02,mm,14),x,-.112,-.047)); g.add(at(cyl(.009,.009,.022,m.port,10),x,-.113,-.047)); }
  g.add(tube([[-.085,.1,-.07],[-.085,.115,-.105],[.085,.115,-.105],[.085,.1,-.07]],.007,M.black,20));
  for(const x of [-.12,.12]){ g.add(at(cyl(.011,.011,.03,M.steel,12),x,C/2-.012,-.05)); g.add(at(dspRb(.008,.006,.03,M.amber,.002),x,C/2-.032,-.066)); g.add(at(cyl(.004,.006,.012,M.steel,8),x,C/2+.005,-.03)); }
  g.add(at(rot(cyl(.011,.011,.03,M.steel,12),0,0,Q),C/2-.012,.1,-.05)); g.add(at(dspRb(.006,.008,.03,M.amber,.002),C/2-.032,.1,-.066)); return g; }
function ledWallSection(){ const m=dspM(), g=new THREE.Group(), C=.5, NX=4, NY=3, Y0=.2; let lift=null;
  for(let ix=0;ix<NX;ix++) for(let iy=0;iy<NY;iy++){ const c=ledCabinet([ix/NX,iy/NY,(ix+1)/NX,(iy+1)/NY]); c.position.set((ix-(NX-1)/2)*C,Y0+C/2+iy*C,0); g.add(c); if(ix===2&&iy===1){ c.userData.live=true; lift=c; } }
  // ground stack: a base beam on levelling feet, outriggers, and a braced ladder behind each end
  g.add(at(rbox(NX*C+.08,.09,.13,m.frame,.01),0,Y0-.047,-.03)); for(const x of [-.92,0,.92]){ g.add(at(cyl(.011,.011,.1,M.steel,10),x,.06,-.03)); g.add(at(cyl(.045,.05,.014,M.rubber,18),x,.007,-.03)); g.add(at(cyl(.02,.02,.012,M.steel,6),x,.1,-.03)); }
  for(const sx of [-1,1]){ const x=sx*.76; g.add(at(rbox(.07,.05,1.05,m.frame,.012),x,.128,-.42)); for(const z of [.06,-.9]){ g.add(at(cyl(.011,.011,.1,M.steel,10),x,.06,z)); g.add(at(cyl(.045,.05,.014,M.rubber,18),x,.007,z)); }
    g.add(at(dspRb(.05,NY*C-.06,.04,m.frame,.008),x,Y0+NY*C/2,-.092)); g.add(rod2(V(x,.15,-.9),V(x,Y0+NY*C-.12,-.11),.016,M.alu)); g.add(rod2(V(x,.15,-.5),V(x,Y0+NY*C*.5,-.11),.012,M.alu)); for(let k=0;k<NY;k++) g.add(at(dspRb(.07,.03,.03,M.steel,.006),x,Y0+C*.5+k*C,-.085)); }
  // jumpers between cabinets, and the feed coming in
  for(let ix=0;ix<NX-1;ix++) for(let iy=0;iy<NY;iy++){ if((ix===1||ix===2)&&iy===1) continue; const x=(ix-(NX-1)/2)*C, y=Y0+C/2+iy*C-.125; g.add(tube([[x+.08,y,-.047],[x+.1,y-.07,-.06],[x+C-.09,y-.07,-.06],[x+C-.07,y,-.047]],.005,m.cable,14)); }
  g.add(tube([[-.82,Y0+.13,-.047],[-.84,Y0+.02,-.08],[-.9,.012,-.25],[-1.3,.012,-.5],[-1.7,.012,-.45]],.008,m.cable,30));
  dspBake(lift); dspBake(g); return {g,lift}; }

/* what stands for Displays on the homepage: one OLED TV on its rolling stand */
HERO.displays=(G)=>{ const c=oledCart(); c.rotation.y=-.12; G.add(c); };
