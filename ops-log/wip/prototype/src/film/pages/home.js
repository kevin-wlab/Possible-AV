/* ===== homepage: one piece from every service ===== */
// The whole line-up is seen only in the opening and the closing shot (two copies of it, one at each end).
// In between, each service gets its own close-up set, 12 m apart, so nothing else crowds the frame or flies past the camera.
const ORDER=[...document.querySelectorAll('.cap[data-key]')].map(c=>c.dataset.key), spots=[], HG=12, X0=14;
function hero(k,x,z,r){ const G=grp(scene,x,0,z); G.rotation.y=r; if(HERO[k]) try{ HERO[k](G); }catch(e){ console.error('hero failed: '+k,e); } return G; }
function lineup(cx){ ORDER.forEach((k,i)=>{ const n=ORDER.length, x=(i-(n-1)/2)*2.05; hero(k,cx+x,i%2?1.3:-2.3,-x*.03); }); }
const XEND=X0+ORDER.length*HG+4;
lineup(0); lineup(XEND);
ORDER.forEach((k,i)=>{ const x=X0+i*HG; hero(k,x,0,0); spots.push({x,z:0}); });
// the line-ups are wider than one island, so the shadow has to cover them
Object.assign(key.shadow.camera,{left:-13,right:13,top:13,bottom:-9}); key.shadow.camera.updateProjectionMatrix(); key.shadow.mapSize.set(4096,4096);
PAGE.keys=(narrow,K,R)=>{ const wide=(cx)=> narrow? R([cx,6.5,30],[cx,1.1,-.4],34,.22) : R([cx,4.2,22],[cx,1.0,-.5],30,.25);
  return [ wide(0), ...spots.map(s=> narrow? R([s.x-.4,2.3,s.z+8.6],[s.x,1.15,s.z],34) : K([s.x-2.0,1.75,s.z+6.4],[s.x+.35,1.1,s.z],30)), wide(XEND) ]; };
