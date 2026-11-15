// chk(page,w,h): compare the Webflow staging page (same origin) with web/ref/<page>.html at window.SHA.
// Run in a tab on possibleav.webflow.io. Returns [null, 1, [heightWF, heightRef], "counts a vs b", ...diffs].
window.chk = async function (page, w, h) {
  const base = 'https://cdn.jsdelivr.net/gh/kevin-wlab/possible-av@' + window.SHA + '/web/';
  let ref = await (await fetch(base + 'ref/' + page + '.html')).text();
  ref = ref.replace('<head>', '<head><base href="' + base + 'ref/">');
  const mk = () => { const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:-20000px;top:0;border:0;width:' + w + 'px;height:' + h + 'px'; document.body.appendChild(f); return f; };
  const load = (f, set) => new Promise(r => { f.onload = r; set(); });
  const A = mk(), B = mk();
  await Promise.all([load(A, () => A.src = '/' + (page === 'home' ? '' : page) + '?c=' + Date.now()), load(B, () => B.srcdoc = ref)]);
  const settle = async f => { const d = f.contentDocument; d.querySelectorAll('img').forEach(i => { i.loading = 'eager'; }); await d.fonts.ready; await Promise.all([...d.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); }))); };
  await Promise.all([settle(A), settle(B)]);
  await new Promise(r => setTimeout(r, 1500));
  const P = ['display', 'position', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color', 'background-color', 'border-top-color', 'border-top-width', 'border-radius', 'padding-top', 'padding-left', 'margin-top', 'opacity', 'width'];
  const els = d => [...d.querySelectorAll('header.nav, main, footer.foot')].flatMap(r => [r, ...r.querySelectorAll('*')]).filter(e => !/^(SCRIPT|STYLE|LINK|META|BR)$/.test(e.tagName));
  const cls = e => [...e.classList].filter(c => !/^w-|^w--/.test(c)).join(' ');
  const ea = els(A.contentDocument), eb = els(B.contentDocument);
  const out = [null, 1, [A.contentDocument.documentElement.scrollHeight, B.contentDocument.documentElement.scrollHeight], 'counts ' + ea.length + ' vs ' + eb.length];
  const n = Math.min(ea.length, eb.length);
  for (let i = 0; i < n && out.length < 22; i++) {
    const a = ea[i], b = eb[i], d = [];
    if ((a.tagName !== b.tagName && !(a.tagName === 'A' && b.tagName === 'BUTTON')) || cls(a) !== cls(b)) d.push('tag ' + a.tagName + '.' + cls(a) + ' ≠ ' + b.tagName + '.' + cls(b));
    const ca = A.contentWindow.getComputedStyle(a), cb = B.contentWindow.getComputedStyle(b);
    P.forEach(p => { if (ca[p] !== cb[p] && !(p === 'width' && Math.abs(parseFloat(ca[p]) - parseFloat(cb[p])) < 1)) d.push(p + ': ' + ca[p] + ' ≠ ' + cb[p]); });
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const rs = r => [r.x, r.y, r.width, r.height].map(Math.round);
    const x = rs(ra), y = rs(rb);
    if (x.some((v, k) => Math.abs(v - y[k]) > 1)) d.push('rect ' + x[0] + ',' + x[1] + ' ' + x[2] + 'x' + x[3] + ' ≠ ' + y[0] + ',' + y[1] + ' ' + y[2] + 'x' + y[3]);
    if (d.length) out.push(i + ' ' + a.tagName + '.' + cls(a) + ' «' + (a.textContent || '').trim().slice(0, 22) + '» :: ' + d.join(' | '));
  }
  A.remove(); B.remove();
  return out;
};
