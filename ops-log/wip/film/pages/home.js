/* ===== homepage: one piece from every service, standing in a single line-up ===== */
const ORDER=[...document.querySelectorAll('.cap[data-key]')].map(c=>c.dataset.key), spots=[];
ORDER.forEach((k,i)=>{ const n=ORDER.length, x=(i-(n-1)/2)*2.05, z=i%2?1.3:-2.3, G=grp(scene,x,0,z); G.rotation.y=-x*.03; spots.push({x,z});
  if(HERO[k]) try{ HERO[k](G); }catch(e){ console.error('hero failed: '+k,e); } });
// the line-up is wider than one island, so the shadow has to cover all of it
Object.assign(key.shadow.camera,{left:-13,right:13,top:13,bottom:-9}); key.shadow.camera.updateProjectionMatrix(); key.shadow.mapSize.set(4096,4096);
PAGE.keys=(narrow,K,R)=>{ const wide=narrow? R([0,6.5,30],[0,1.1,-.4],34,.22) : R([0,4.2,22],[0,1.0,-.5],30,.25);
  return [ wide, ...spots.map(s=> narrow? R([s.x-.4,2.3,s.z+8.6],[s.x,1.15,s.z],34) : K([s.x-2.0,1.75,s.z+6.4],[s.x+.35,1.1,s.z],30)), wide ]; };
