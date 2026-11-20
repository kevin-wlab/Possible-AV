// Run on https://possibleav.webflow.io : compares old /<slug>-nyc vs new /nyc/<slug> in same-origin iframes at given widths
const PAGES=['sound-system-rental','speaker-rental','uplighting-rental','outdoor-movie-rental','rental-packages','projector-rental','tv-rental','microphone-rental','event-lighting-rental','event-wifi-rental','computer-rental','stage-rental','experiential-production','event-production-company','av-rental'];
const WIDTHS=(window.__W||[1440,768,375]);const ONLY=window.__ONLY;
const ROLES=[['p.mono','p.nx-mono,p.nx-eb'],['h1','h1'],['.sub','.nx-sub'],['.ctas','.nx-ctas'],['.btn','.nx-btn'],['.ghost','.nx-ghost'],['h2','h2'],['h2 span','h2 .nx-h2-muted'],['.lead','.nx-lead'],['ul.incl','.nx-incl'],['ul.incl li','.nx-incl-li'],['ul.incl li b','.nx-incl-b'],['.ways','.nx-ways'],['.way','.nx-way'],['.way b','.nx-way-tag'],['.way h3','.nx-way-h3'],['.way p','.nx-way-p'],['.chips','.nx-chips'],['.chips a','.nx-chip'],['.faq','.nx-faq'],['.faq details','.nx-faq-d'],['.faq summary','.nx-faq-q'],['.faq p','.nx-faq-a'],['.faq p a','.nx-faq-a a'],['img','img']];
const P=['display','font-family','font-size','font-weight','line-height','letter-spacing','text-transform','color','background-color','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-bottom','border-top-width','border-left-width','border-bottom-width','border-top-left-radius','grid-template-columns','column-gap','row-gap','max-width','text-decoration-line','white-space'];
const vis=e=>{const w=e.ownerDocument.defaultView;let x=e;while(x&&x.nodeType===1){if(w.getComputedStyle(x).display==='none')return false;x=x.parentElement}return true};
function load(src,w){return new Promise(r=>{const f=document.createElement('iframe');f.style.cssText=`position:fixed;left:-${w+50}px;top:0;width:${w}px;height:900px;border:0`;f.onload=async()=>{try{await f.contentDocument.fonts.ready}catch(e){};f.contentDocument.querySelectorAll('img').forEach(i=>i.loading='eager');await new Promise(z=>setTimeout(z,1800));r(f)};f.src=src;document.body.appendChild(f)})}
function snap(doc,nw){const w=doc.defaultView;const main=doc.querySelector('main');const secs=[...main.children].filter(e=>vis(e));const out=[];
 secs.forEach((s,si)=>{const so={i:si,h:Math.round(s.getBoundingClientRect().height),t:s.innerText.replace(/\s+/g,' ').trim(),roles:{}};
  ROLES.forEach(([o,n],ri)=>{const els=[...s.querySelectorAll(nw?n:o)].filter(vis);if(!els.length)return;const e=els[0],c=w.getComputedStyle(e),r=e.getBoundingClientRect();const v={n:els.length,w:Math.round(r.width),h:Math.round(r.height)};P.forEach(p=>v[p]=c.getPropertyValue(p));if(o==='.faq summary')v.after=w.getComputedStyle(e,'::after').content;so.roles[o]=v});
  out.push(so)});return {H:doc.documentElement.scrollHeight,secs:out}}
const res=[];
for(const pg of PAGES){if(ONLY&&!ONLY.includes(pg))continue;for(const W of WIDTHS){const a=await load('/'+pg+'-nyc?c='+Date.now(),W),b=await load('/nyc/'+pg+'?c='+Date.now(),W);
 const A=snap(a.contentDocument,false),B=snap(b.contentDocument,true);a.remove();b.remove();const d=[];
 if(A.H!==B.H)d.push('H '+A.H+'->'+B.H);if(A.secs.length!==B.secs.length)d.push('nsecs '+A.secs.length+'->'+B.secs.length);
 A.secs.forEach((sa,i)=>{const sb=B.secs[i];if(!sb)return;if(sa.h!==sb.h)d.push(`s${i}.h ${sa.h}->${sb.h}`);if(sa.t!==sb.t){let k=0;while(sa.t[k]===sb.t[k])k++;d.push(`s${i}.text @${k}: «${sa.t.slice(k-15,k+40)}» vs «${sb.t.slice(k-15,k+40)}»`)}
  for(const r in sa.roles){const x=sa.roles[r],y=sb.roles[r];if(!y){d.push(`s${i} ${r} missing`);continue}for(const p in x){if(x[p]!==y[p])d.push(`s${i} ${r}.${p}: ${x[p]} -> ${y[p]}`)}}
  for(const r in sb.roles)if(!sa.roles[r])d.push(`s${i} ${r} extra`)});
 res.push(pg+'@'+W+': '+(d.length?d.slice(0,12).join(' | ')+(d.length>12?' …+'+(d.length-12):''):'OK'))}}
return res.join('\n')
