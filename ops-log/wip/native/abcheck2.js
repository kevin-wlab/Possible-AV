// Generic in-page A/B. Set before running: window.AB={scope:'main', prefix:'pa-audio-', newSel:'style#nx-residual' (element holding the residual CSS), oldCss:'https://cdn.jsdelivr.net/gh/kevin-wlab/possible-av@<sha>/web/<page>.css'}
await new Promise(r=>setTimeout(r,2500));
const {scope,prefix,newSel,oldCss}=window.AB;
const P=['display','gridTemplateColumns','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','backgroundImage','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginBottom','borderTopWidth','borderTopColor','borderBottomWidth','borderLeftWidth','borderTopLeftRadius','columnGap','rowGap','maxWidth','textTransform','fontFamily','position','zIndex','textDecorationLine','listStyleType','alignItems','justifyContent','flexDirection','opacity','objectFit','aspectRatio','height','width','transform'];
const snap=()=>[...document.querySelectorAll(scope)].flatMap(r=>[r,...r.querySelectorAll('*')]).map(e=>{const c=getComputedStyle(e),b=e.getBoundingClientRect();return{t:e.tagName,w:Math.round(b.width),h:Math.round(b.height),s:P.map(p=>c[p])}});
const A=snap();
const nat=[...document.querySelectorAll('[class*="'+prefix+'"]')].map(e=>[e,[...e.classList].filter(c=>c.startsWith(prefix))]);
nat.forEach(([e,cs])=>e.classList.remove(...cs));
const cur=document.querySelector(newSel);
const old=document.createElement('link');old.rel='stylesheet';old.href=oldCss;
await new Promise(r=>{old.onload=r;old.onerror=r;cur.after(old)});cur.disabled=true;if(cur.tagName==='STYLE')cur.media='not all';
await new Promise(r=>setTimeout(r,600));
const B=snap();
if(cur.tagName==='STYLE')cur.media='';cur.disabled=false;old.remove();nat.forEach(([e,cs])=>e.classList.add(...cs));
const d=[];A.forEach((a,i)=>{const b=B[i];if(!b||a.t!==b.t){d.push(['TAG',i]);return}P.forEach((p,j)=>{if(a.s[j]!==b.s[j])d.push([i,a.t,p,'old:'+b.s[j],'new:'+a.s[j]])});if(Math.abs(a.w-b.w)>2||Math.abs(a.h-b.h)>2)d.push([i,a.t,'box','old:'+b.w+'x'+b.h,'new:'+a.w+'x'+a.h])});
[innerWidth,A.length,nat.length,d.length,d.slice(0,15)]
