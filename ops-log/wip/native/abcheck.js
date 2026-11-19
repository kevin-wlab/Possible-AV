// In-page A/B: native state vs old state (hn-* classes removed + old stylesheet). Args: SCOPE selector, OLDCSS url, NEWCSS substring
await new Promise(r=>setTimeout(r,2500));
const P=['display','gridTemplateColumns','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginBottom','borderTopWidth','borderTopColor','borderBottomWidth','borderTopLeftRadius','columnGap','rowGap','maxWidth','textTransform','fontFamily','position','zIndex','textDecorationLine','listStyleType','alignItems','justifyContent','flexDirection','opacity','height','width'];
const snap=()=>[...document.querySelectorAll(SCOPE)].flatMap(r=>[r,...r.querySelectorAll('*')]).map(e=>{const c=getComputedStyle(e),b=e.getBoundingClientRect();return{t:e.tagName,w:Math.round(b.width),h:Math.round(b.height),s:P.map(p=>c[p])}});
const A=snap();
const hn=[...document.querySelectorAll('[class*="hn-"]')].map(e=>[e,[...e.classList].filter(c=>c.startsWith('hn-'))]);
hn.forEach(([e,cs])=>e.classList.remove(...cs));
const cur=[...document.querySelectorAll('link[rel=stylesheet]')].find(l=>l.href.includes(NEWCSS));
const old=document.createElement('link');old.rel='stylesheet';old.href=OLDCSS;
await new Promise(r=>{old.onload=r;old.onerror=r;cur.after(old)});cur.disabled=true;
await new Promise(r=>setTimeout(r,500));
const B=snap();
cur.disabled=false;old.remove();hn.forEach(([e,cs])=>e.classList.add(...cs));
const d=[];A.forEach((a,i)=>{const b=B[i];if(!b||a.t!==b.t){d.push(['TAG',i]);return}P.forEach((p,j)=>{if(a.s[j]!==b.s[j])d.push([i,a.t,p,'old:'+b.s[j],'new:'+a.s[j]])});if(Math.abs(a.w-b.w)>2||Math.abs(a.h-b.h)>2)d.push([i,a.t,'box','old:'+b.w+'x'+b.h,'new:'+a.w+'x'+a.h])});
[innerWidth,A.length,hn.length,d.length,d.slice(0,15)]
