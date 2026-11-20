/* kinGEMs explainer — interactions */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent, text) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
};
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const store = {
  get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
  set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
};

/* ---------- theme ---------- */
const saved = store.get('kg-theme');
if (saved) document.documentElement.dataset.theme = saved;
$('#themeBtn').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  const next = dark ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  store.set('kg-theme', next);
  redrawCharts();
});

/* ---------- hero network (GEM -> kinGEM) ---------- */
(function hero(){
  const svg = $('#heroNet');
  const pts = [[30,40],[66,40],[102,40],[138,40],[138,76],[138,112],[102,112],[138,148],[110,176],[106,212],[138,236],[170,212],[166,176],[138,270],[174,270]];
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[5,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,7],[10,13],[13,14]];
  const purp = ['#f1e8fd','#7a22e8','#9a5cf0','#b48af2','#d7c2f8','#8b3ef0','#c9a8f2','#a46ef0','#e2d2fa','#7a22e8','#b48af2','#9a5cf0','#d7c2f8','#c9a8f2','#8b3ef0'];
  const draw = (dx, colorFn, lab, labCol) => {
    const g = el('g', {transform:`translate(${dx} 0)`}, svg);
    edges.forEach(([a,b]) => el('line',{x1:pts[a][0],y1:pts[a][1],x2:pts[b][0],y2:pts[b][1],stroke:'var(--muted)','stroke-width':1.6,opacity:.7},g));
    pts.forEach((p,i) => el('circle',{cx:p[0],cy:p[1],r:8.5,fill:colorFn(i)},g));
    el('text',{x:105,y:296,'text-anchor':'middle','font-size':22,'font-weight':700,fill:labCol,'font-family':'Roboto'},g,lab);
  };
  const known = new Set([2,3,9,4]);
  draw(0, i => known.has(i) ? '#9a5cf0' : '#bdbdbd', 'GEM', 'var(--muted)');
  draw(210, i => purp[i], 'kinGEM', 'var(--ink)');
  el('path',{d:'M188 140 h22 v-10 l16 18 l-16 18 v-10 h-22z',fill:'var(--muted)',opacity:.75},svg);
})();

/* ---------- atlas ---------- */
const stages = [
  { tick:'~1 nm', small:'molecule', tag:'Scale · molecule',
    title:'Predict how fast each enzyme works',
    body:['Genome-scale models need a turnover number, <span class="kc">k<sub>cat</sub></span>, for every enzyme-catalysed reaction. That is how many substrate molecules one enzyme converts per unit time.',
          '<b>CPI-Pred</b> is a multi-modal deep learning model. It embeds the protein sequence with the ESM-2 language model and the substrate with molecular fingerprints, then predicts k<sub>cat</sub> (and K<sub>M</sub>, K<sub>I</sub>, k<sub>cat</sub>/K<sub>M</sub>) <b>together with an uncertainty</b>. kinGEMs uses that uncertainty later.'],
    ref:'Fig 2A' },
  { tick:'~10 nm', small:'enzyme', tag:'Scale · enzyme',
    title:'Most of the kinetics are missing',
    body:['Experimental k<sub>cat</sub> values exist for only a small fraction of enzymes. About <b>89%</b> of the values an <i>E. coli</i> MG1655 model needs are absent from BRENDA, and coverage is far worse for less-studied organisms.',
          'Prediction removes that bottleneck. Every enzyme gets a value (shaded by speed), so enzyme-constrained models are no longer limited to organisms with decades of biochemistry behind them.'],
    ref:'Fig 1' },
  { tick:'~10³ rxns', small:'network', tag:'Scale · metabolic network',
    title:'Turn speeds into constraints',
    body:['A genome-scale model (GEM) lists every metabolic reaction and requires steady-state mass balance. On its own it allows a huge range of flux patterns.',
          'kinGEMs links each reaction to the enzyme that runs it. Flux can be no more than <span class="kc">k<sub>cat</sub></span> × enzyme amount, and all enzymes share a <b>finite protein budget</b>. Gene–protein–reaction rules handle isoenzymes, multi-subunit complexes and promiscuous enzymes. The result is an <b>ecGEM</b>.'],
    ref:'Fig 2B · Methods 4.1' },
  { tick:'~2 µm', small:'cell', tag:'Scale · cell phenotype',
    title:'Tune against how the cell actually grows',
    body:['Raw predictions are imperfect and depend on conditions, so a freshly built ecGEM often grows far too slowly. Earlier tools relax <i>all</i> enzymes with one global saturation factor.',
          'kinGEMs runs <b>simulated annealing</b> instead. It perturbs the enzymes that use the most protein, keeps each one inside its CPI-Pred uncertainty range, and accepts changes that move predicted growth toward the measured rate.'],
    ref:'Fig 2D · Fig 10' },
  { tick:'93 GEMs', small:'tree of life', tag:'Scale · phylogeny',
    title:'Run it across the tree of life',
    body:['Because each step is automated (gene ID → protein sequence → k<sub>cat</sub> → constraints → tuning), the pipeline ran on the BiGG database and produced <b>93 tuned ecGEMs</b>. They span enterobacteria, Firmicutes, mycobacteria, cyanobacteria, parasitic protists, fungi and mammalian cell lines.',
          'Model quality is best close to <i>E. coli</i> and drops with phylogenetic distance. The paper reports this openly as a limitation.'],
    ref:'Fig 9 · Table E5' }
];
let cur = 0;
const ruler = $('#ruler');
stages.forEach((s,i) => {
  const b = document.createElement('button');
  b.className = 'tick'; b.setAttribute('role','tab');
  b.innerHTML = `<span class="dot"></span><span class="tl">${s.tick}<small>${s.small}</small></span>`;
  b.onclick = () => go(i);
  ruler.appendChild(b);
});
function go(i){
  if (i < 0 || i >= stages.length) return;
  const prev = cur; cur = i;
  $$('.scene').forEach(sc => {
    const k = +sc.dataset.i;
    sc.classList.toggle('on', k === i);
    sc.classList.toggle('out', k < i);
  });
  $$('.tick').forEach((t,k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i); });
  const s = stages[i];
  $('#panelBody').innerHTML = `<div class="anim"><div class="num">${String(i+1).padStart(2,'0')} / ${String(stages.length).padStart(2,'0')}</div><h3>${s.title}</h3>${s.body.map(p=>`<p>${p}</p>`).join('')}<div class="ref">IN THE PAPER → ${s.ref}</div></div>`;
  $('#scaleTag').textContent = s.tag;
  $('#atlasCount').textContent = `${i+1} / ${stages.length}`;
  $('#prevBtn').disabled = i === 0;
  $('#nextBtn').disabled = i === stages.length - 1;
  if (i === 1) fillEnzymes(); else resetEnzymes();
  if (i === 2) animatePool();
}
$('#prevBtn').onclick = () => go(cur-1);
$('#nextBtn').onclick = () => go(cur+1);
document.addEventListener('keydown', e => {
  const r = $('#atlasBox').getBoundingClientRect();
  if (r.top > innerHeight || r.bottom < 0) return;
  if (e.target.closest('input,textarea')) return;
  if (e.key === 'ArrowRight') go(cur+1);
  if (e.key === 'ArrowLeft') go(cur-1);
});

/* neural net in scene 1 */
(function nn(){
  const g = $('#nn1');
  const cols = [[300,[176,196,216,236,256,276]],[340,[186,206,226,246,266]],[380,[176,196,216,236,256,276]]];
  for (let c=0;c<cols.length-1;c++) for (const y1 of cols[c][1]) for (const y2 of cols[c+1][1]) el('line',{x1:cols[c][0],y1,x2:cols[c+1][0],y2},g);
  cols.forEach(([x,ys],c) => ys.forEach(y => el('circle',{cx:x,cy:y,r:4.5,fill:c===2?'var(--teal)':(c===0?'#e06a8a':'var(--card)'),stroke:'var(--teal)','stroke-width':1.2},g)));
})();

/* enzyme blobs in scene 2 */
const blobs = [];
(function makeBlobs(){
  const g = $('#blobs');
  let seed = 7; const rnd = () => (seed = (seed*16807)%2147483647)/2147483647;
  for (let r=0;r<5;r++) for (let c=0;c<7;c++){
    const cx = 70 + c*58 + (r%2)*20 + rnd()*10, cy = 90 + r*52 + rnd()*8;
    const n = 9, pts = [];
    for (let k=0;k<n;k++){ const a = k/n*Math.PI*2, rr = 15 + rnd()*9; pts.push([cx+Math.cos(a)*rr*1.15, cy+Math.sin(a)*rr*.85]); }
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let k=0;k<n;k++){ const p = pts[(k+1)%n], q = pts[k]; d += ` Q${q[0]},${q[1]} ${(q[0]+p[0])/2},${(q[1]+p[1])/2}`; }
    const known = rnd() < 0.11;
    const shade = rnd();
    const p = el('path',{d:d+'Z',fill: known ? mixPurple(shade) : 'var(--grey-enz)', opacity:.92, style:`transition:fill .5s ease ${(r*7+c)*35}ms`},g);
    blobs.push({p, known, shade});
  }
})();
function mixPurple(t){ // t in 0..1: light -> deep violet
  const a=[243,236,253], b=[122,34,232];
  return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*(.2+.8*t))).join(',')})`;
}
let enzTimer;
function fillEnzymes(){
  resetEnzymes();
  enzTimer = setTimeout(() => {
    blobs.forEach(b => b.p.setAttribute('fill', mixPurple(b.shade)));
    $('#missing').style.opacity = 0; $('#filled').style.opacity = 1;
  }, 1600);
}
function resetEnzymes(){
  clearTimeout(enzTimer);
  blobs.forEach(b => b.p.setAttribute('fill', b.known ? mixPurple(b.shade) : 'var(--grey-enz)'));
  $('#missing').style.opacity = 1; $('#filled').style.opacity = 0;
}

/* glycolysis in scene 3 */
(function glyc(){
  const g = $('#glyc');
  const mets = ['Glucose','G6P','F6P','F1,6BP','DHAP'];
  const enz = [['HK','0.7'],['GPI','0.1'],['PFK1','2.3'],['ALD','1.0']];
  mets.forEach((m,i) => {
    const y = 56 + i*76, first = i===0;
    el('rect',{x:120,y,width:96,height:30,rx:4,fill:first?'var(--green-bg)':'var(--cream)',stroke:first?'var(--green)':'var(--gold)','stroke-width':1.5},g);
    el('text',{x:168,y:y+20,'text-anchor':'middle','font-size':14},g,m);
    if (i < enz.length){
      el('line',{x1:168,y1:y+32,x2:168,y2:y+74,stroke:'var(--ink)','stroke-width':1.4,'marker-end':'url(#arK)'},g);
      el('rect',{x:186,y:y+40,width:46,height:22,rx:11,fill:'var(--peri-bg)',stroke:'var(--peri)','stroke-width':1.5},g);
      el('text',{x:209,y:y+55,'text-anchor':'middle','font-size':10,'font-weight':700},g,enz[i][0]);
      const t = el('text',{x:112,y:y+56,'text-anchor':'end','font-size':11,class:'m',style:'fill:var(--red)'},g);
      t.innerHTML = `k<tspan font-size="8" dy="2">cat</tspan><tspan dy="-2">=${enz[i][1]}</tspan>`;
    }
  });
})();
function animatePool(){
  const g = $('#poolBar'); g.innerHTML = '';
  const shares = [.34,.14,.22,.12,.06,.07];
  const cols = ['#7a22e8','#9a5cf0','#b48af2','#c9a8f2','#e2d2fa','var(--grey-enz)'];
  let x = 1;
  shares.forEach((s,i) => {
    const w = s*198;
    const r = el('rect',{x, y:157, width:0, height:20, fill:cols[i]},g);
    r.animate([{width:'0px'},{width:w+'px'}],{duration:500,delay:i*140,fill:'forwards',easing:'ease-out'});
    setTimeout(()=>r.setAttribute('width',w), 500+i*140);
    x += w;
  });
}

/* tree in scene 5 */
(function tree(){
  const svg = $('#treeScene');
  const groups = [
    {n:'E. coli / Shigella', k:64, col:'#7a22e8'},
    {n:'Other Enterobacterales', k:2, col:'#8b3ef0'},
    {n:'Other Proteobacteria', k:3, col:'#a46ef0'},
    {n:'Other bacteria', k:9, col:'#b48af2', sub:'Firmicutes · Actinobacteria · Cyanobacteria'},
    {n:'Eukaryotes', k:14, col:'var(--orange)', sub:'yeasts · protists · mammalian cells'}
  ];
  el('text',{x:280,y:36,'text-anchor':'middle','font-size':18,'font-weight':500},svg,'93 tuned ecGEMs from BiGG');
  el('text',{x:280,y:56,'text-anchor':'middle','font-size':11,class:'m',style:'fill:var(--muted)'},svg,'grouped by phylogenetic distance from E. coli');
  const ys = [100,160,220,290,370], xLeaf = 250;
  const line = (d) => el('path',{d,fill:'none',stroke:'var(--muted)','stroke-width':1.6},svg);
  // topology: (((((Ecoli,Entero),Proteo),bacteria),Euk)
  line(`M60 ${(ys[4]+250)/2} V ${ys[4]} H ${xLeaf}`);
  line(`M60 ${(ys[4]+250)/2} V 250 H 100`);
  line(`M100 250 V ${ys[3]} H ${xLeaf}`); line(`M100 250 V 190 H 140`);
  line(`M140 190 V ${ys[2]} H ${xLeaf}`); line(`M140 190 V 130 H 190`);
  line(`M190 130 V ${ys[0]} H ${xLeaf}`); line(`M190 130 V ${ys[1]} H ${xLeaf}`);
  el('text',{x:60,y:(ys[4]+250)/2+18,'text-anchor':'middle','font-size':9,class:'m',style:'fill:var(--muted)'},svg,'root');
  groups.forEach((g,i) => {
    const r = 6 + Math.sqrt(g.k)*3.2;
    const c = el('circle',{cx:xLeaf+r+4,cy:ys[i],r:0,fill:g.col,opacity:.88},svg);
    c.dataset.r = r;
    el('text',{x:xLeaf+r*2+16,y:ys[i]+(g.sub?-2:5),'font-size':14,'font-weight':500},svg,g.n);
    if (g.sub) el('text',{x:xLeaf+r*2+16,y:ys[i]+15,'font-size':10.5,style:'fill:var(--muted)'},svg,g.sub);
    el('text',{x:xLeaf+r+4,y:ys[i]+4,'text-anchor':'middle','font-size':11,'font-weight':700,style:'fill:#fff'},svg,g.k);
  });
  // reveal circles when visible
  new MutationObserver(() => {
    const on = svg.closest('.scene').classList.contains('on');
    $$('circle',svg).forEach((c,i) => {
      c.style.transition = `r .6s cubic-bezier(.3,1.5,.5,1) ${i*120}ms`;
      c.setAttribute('r', on ? c.dataset.r : 0);
    });
  }).observe(svg.closest('.scene'),{attributes:true,attributeFilter:['class']});
})();

go(0);

/* ---------- annealing toy ---------- */
const ENZ = [
  {n:'HK',  mw:50, k0:12},
  {n:'GPI', mw:61, k0:40},
  {n:'PFK1',mw:35, k0:6},
  {n:'ALD', mw:39, k0:3},
  {n:'TPI', mw:27, k0:25},
  {n:'GAPD',mw:36, k0:9},
];
const C = 7.4, TARGET = 0.87, LO = -1, HI = 2; // bounds in log10 units around k0
let S, running = false, raf;
function growth(ks){ return C / ks.reduce((a,k,i)=>a + ENZ[i].mw/k, 0); }
function obj(mu){ return Math.abs(mu - TARGET)/TARGET; }
function reset(){
  running = false; cancelAnimationFrame(raf); $('#runBtn').textContent = '▶ Run annealing';
  const ks = ENZ.map(e=>e.k0);
  const mu = growth(ks);
  S = {ks, mu, f:obj(mu), T:1, it:0, hist:[{mu,T:1}], log:[], done:false, seed:12345};
  buildRows(); render();
}
function rand(){ S.seed = (S.seed*16807)%2147483647; return S.seed/2147483647; }
function gauss(){ return Math.sqrt(-2*Math.log(rand()+1e-12))*Math.cos(2*Math.PI*rand()); }
function step(){
  if (S.done) return;
  const pool = +$('#poolSize').value;
  const mass = S.ks.map((k,i)=>({i, m:ENZ[i].mw/k})).sort((a,b)=>b.m-a.m).slice(0,pool);
  const pick = mass[Math.floor(rand()*mass.length)].i;
  const l0 = Math.log10(ENZ[pick].k0);
  let l = Math.log10(S.ks[pick]) + gauss()*0.22 + 0.06;
  l = Math.max(l0+LO, Math.min(l0+HI, l));
  const trial = S.ks.slice(); trial[pick] = 10**l;
  const mu2 = growth(trial), f2 = obj(mu2);
  const d = f2 - S.f;
  let verdict;
  if (d <= 0){ verdict = 'acc'; }
  else if (rand() < Math.exp(-d*25/S.T)){ verdict = 'met'; }
  else verdict = 'rej';
  const kStr = v => v < 10 ? v.toFixed(2) : v.toFixed(1);
  const msg = `${String(S.it+1).padStart(3,' ')}  ${ENZ[pick].n.padEnd(4,' ')} ${kStr(S.ks[pick])}→${kStr(trial[pick])}  μ=${mu2.toFixed(3)}  `;
  if (verdict !== 'rej'){ S.ks = trial; S.mu = mu2; S.f = f2; }
  S.log.unshift(`<span class="${verdict}">${msg}${verdict==='acc'?'accept':verdict==='met'?'accept (uphill, T)':'reject'}</span>`);
  S.log = S.log.slice(0,4);
  S.it++; S.T *= 0.965;
  S.hist.push({mu:S.mu, T:S.T});
  if (S.f < 0.01 || S.T < 1e-3 || S.it >= 300){
    S.done = true;
    S.log.unshift(`<span class="acc">■ done: ${S.f<0.01?'growth within 1% of target':'cooled down'} after ${S.it} iterations</span>`);
  }
}
function buildRows(){
  const box = $('#enzRows'); box.innerHTML = '';
  ENZ.forEach((e,i) => {
    const row = document.createElement('div'); row.className = 'enz-row';
    row.innerHTML = `<div class="pill">${e.n}</div><div class="track"><div class="rng"></div><div class="init"></div><div class="cur"></div><div class="massbar"></div></div><div class="val"></div>`;
    box.appendChild(row);
  });
}
function render(){
  const rows = $$('.enz-row');
  const masses = S.ks.map((k,i)=>ENZ[i].mw/k), tot = masses.reduce((a,b)=>a+b,0);
  rows.forEach((row,i) => {
    const pos = v => ((Math.log10(v) - (Math.log10(ENZ[i].k0)+LO)) / (HI-LO)) * 100;
    const rng = $('.rng',row); rng.style.left = '0%'; rng.style.width = '100%';
    $('.init',row).style.left = pos(ENZ[i].k0)+'%';
    $('.cur',row).style.left = pos(S.ks[i])+'%';
    $('.massbar',row).style.width = (masses[i]/tot*100)+'%';
    const v = S.ks[i]; $('.val',row).textContent = v < 10 ? v.toFixed(2) : v < 1000 ? v.toFixed(1) : v.toExponential(1);
  });
  $('#sMu').textContent = S.mu.toFixed(3);
  $('#sMu').style.color = S.f < 0.01 ? 'var(--green)' : 'var(--ink)';
  $('#sIt').textContent = S.it;
  $('#log').innerHTML = S.log.join('<br>');
  drawAnneal();
}
function drawAnneal(){
  const svg = $('#annealChart'); svg.innerHTML = '';
  const W=460, L=44, R=16, top1=18, h1=170, top2=226, h2=52;
  const n = Math.max(60, S.hist.length);
  const x = i => L + i/(n-1)*(W-L-R);
  const ymax = 1.2;
  const y1 = v => top1 + h1 - Math.min(v,ymax)/ymax*h1;
  // axes
  el('line',{x1:L,y1:top1+h1,x2:W-R,y2:top1+h1,stroke:'var(--rule)'},svg);
  [0,0.3,0.6,0.9,1.2].forEach(v => { el('line',{x1:L,y1:y1(v),x2:W-R,y2:y1(v),stroke:'var(--rule2)'},svg); el('text',{x:L-8,y:y1(v)+4,'text-anchor':'end'},svg,v.toFixed(1)); });
  el('text',{x:L,y:top1-6},svg,'predicted growth μ (1/hr)');
  el('line',{x1:L,y1:y1(TARGET),x2:W-R,y2:y1(TARGET),stroke:'var(--green)','stroke-width':1.5,'stroke-dasharray':'5 4'},svg);
  el('text',{x:W-R,y:y1(TARGET)-6,'text-anchor':'end',style:'fill:var(--green)',class:'mlab'},svg,'measured target');
  el('polyline',{points:S.hist.map((h,i)=>`${x(i)},${y1(h.mu)}`).join(' '),fill:'none',stroke:'var(--violet)','stroke-width':2.2,'stroke-linejoin':'round'},svg);
  const last = S.hist[S.hist.length-1];
  el('circle',{cx:x(S.hist.length-1),cy:y1(last.mu),r:4.5,fill:'var(--violet)'},svg);
  // temperature
  const y2 = v => top2 + h2 - v*h2;
  el('line',{x1:L,y1:top2+h2,x2:W-R,y2:top2+h2,stroke:'var(--rule)'},svg);
  el('text',{x:L,y:top2-6},svg,'temperature T');
  el('polyline',{points:S.hist.map((h,i)=>`${x(i)},${y2(h.T)}`).join(' '),fill:'none',stroke:'var(--blue)','stroke-width':1.8},svg);
  el('text',{x:W-R,y:top2+h2+16,'text-anchor':'end'},svg,'iteration →');
}
function loop(){
  if (!running) return;
  for (let k=0;k<1;k++) step();
  render();
  if (S.done){ running=false; $('#runBtn').textContent = '▶ Run annealing'; return; }
  setTimeout(()=>{ raf = requestAnimationFrame(loop); }, 70);
}
$('#runBtn').onclick = () => {
  if (S.done) reset();
  running = !running;
  $('#runBtn').textContent = running ? '❚❚ Pause' : '▶ Run annealing';
  if (running) loop();
};
$('#stepBtn').onclick = () => { if (S.done) return; step(); render(); };
$('#resetBtn').onclick = reset;
$('#poolSize').oninput = e => { $('#poolVal').textContent = e.target.value; };
reset();

/* ---------- findings ---------- */
$$('#findTabs button').forEach(b => b.onclick = () => {
  $$('#findTabs button').forEach(x => x.classList.toggle('on', x===b));
  $$('.finding').forEach(f => f.classList.toggle('on', f.dataset.f === b.dataset.f));
});

const LV = [
  {id:'L1', name:'Baseline GEM', fv:4.7, mu:0.87, c:'#3b78b5', d:'Stoichiometry and mass balance only, with no enzymes. Many flux patterns are equally optimal.'},
  {id:'L2', name:'Single enzyme', fv:4.0, mu:0.87, c:'#f28e2b', approx:true, d:'One k<sub>cat</sub> per reaction, ignoring how enzymes are shared or assembled. Hardly changes the picture.'},
  {id:'L3a', name:'+ Isoenzymes', fv:1.2, mu:0.83, c:'#3ea24a', approx:true, d:'Reactions catalysed by several alternative enzymes are modelled properly. Variability starts to fall.'},
  {id:'L3b', name:'+ Complexes', fv:1.7, mu:0.75, c:'#d62728', approx:true, d:'Multi-subunit enzymes now need every subunit. Growth begins to slip.'},
  {id:'L3c', name:'+ Promiscuous', fv:0.05, mu:0.023, c:'#9467bd', approxMu:true, d:'One enzyme serving many reactions must split its capacity. This gives the largest single drop: shared enzymes remove most alternative routes.'},
  {id:'L4', name:'All constraints', fv:0.05, mu:0.023, c:'#8c564b', d:'Fully constrained with untuned predictions. 94× less variability than baseline, but growth falls about 97% because a few under-predicted k<sub>cat</sub>s choke the budget.'},
  {id:'L5', name:'Post-tuned', fv:2.5, mu:0.87, c:'#e377c2', approxMu:true, d:'After simulated annealing, growth returns to about baseline and variability stays about 2× below the GEM.'},
];
let lvSel = 5;
function drawAbl(){
  const svg = $('#ablChart'); svg.innerHTML = '';
  const W=480,H=320,L=54,R=54,T=20,B=44, w=(W-L-R)/LV.length;
  const ly = v => T + (H-T-B) * (1 - (Math.log10(v)+2)/ (Math.log10(10)+2));
  const my = v => T + (H-T-B) * (1 - v/1);
  [0.01,0.1,1,10].forEach(v => { el('line',{x1:L,x2:W-R,y1:ly(v),y2:ly(v),stroke:'var(--rule2)'},svg); el('text',{x:L-8,y:ly(v)+4,'text-anchor':'end'},svg, v>=1? v : v); });
  [0,0.5,1].forEach(v => el('text',{x:W-R+8,y:my(v)+4},svg,v.toFixed(1)));
  el('text',{x:14,y:T+(H-T-B)/2,transform:`rotate(-90 14 ${T+(H-T-B)/2})`,'text-anchor':'middle'},svg,'median flux variability');
  el('text',{x:W-10,y:T+(H-T-B)/2,transform:`rotate(90 ${W-10} ${T+(H-T-B)/2})`,'text-anchor':'middle'},svg,'biomass (1/hr)');
  LV.forEach((l,i) => {
    const x = L + i*w + w*.14, bw = w*.72, on = i===lvSel;
    const r = el('rect',{x,y:ly(l.fv),width:bw,height:(H-B)-ly(l.fv),fill:l.c,opacity:on?.95:.38,rx:2,style:'cursor:pointer;transition:opacity .2s'},svg);
    r.onclick = () => selLv(i);
    el('text',{x:x+bw/2,y:H-B+16,'text-anchor':'middle',class:'mlab',style:`fill:${on?'var(--ink)':'var(--muted)'};font-weight:${on?600:400}`},svg,l.id);
  });
  const pts = LV.map((l,i)=>[L+i*w+w/2, my(l.mu)]);
  el('polyline',{points:pts.map(p=>p.join(',')).join(' '),fill:'none',stroke:'var(--ink)','stroke-width':1.8},svg);
  pts.forEach((p,i)=>el('circle',{cx:p[0],cy:p[1],r:i===lvSel?5.5:3.5,fill:'var(--ink)'},svg));
  el('line',{x1:L,x2:W-R,y1:H-B,y2:H-B,stroke:'var(--muted)'},svg);
}
function selLv(i){
  lvSel = i; const l = LV[i];
  $$('#lvlBtns button').forEach((b,k)=>b.classList.toggle('on',k===i));
  $('#lvlDesc').innerHTML = `<b>${l.id} · ${l.name}</b>: median FV ${l.approx?'≈ ':''}${l.fv}, biomass ${l.approx||l.approxMu?'≈ ':''}${l.mu} 1/hr.<br>${l.d}`;
  drawAbl();
}
LV.forEach((l,i)=>{ const b=document.createElement('button'); b.textContent=l.id; b.onclick=()=>selLv(i); $('#lvlBtns').appendChild(b); });

function hbars(svg, rows, opts){
  svg.innerHTML = '';
  const {W=480, L=150, R=60, T=26, rowH=40, max, fmt=v=>v, title, log=false, min=0.1} = opts;
  if (title) el('text',{x:0,y:14,style:'fill:var(--ink);font-weight:500;font-size:13px'},svg,title);
  const sx = v => log ? (Math.log10(v)-Math.log10(min))/(Math.log10(max)-Math.log10(min))*(W-L-R) : v/max*(W-L-R);
  rows.forEach((r,i) => {
    const y = T + i*rowH;
    if (r.group) el('text',{x:0,y:y+rowH*.62,style:'fill:var(--ink);font-size:12px;font-weight:500'},svg,r.group);
    el('text',{x:L-10,y:y+rowH*.62,'text-anchor':'end',style:`fill:var(--muted);font-size:12px`},svg,r.label);
    const w = Math.max(2, sx(r.v));
    const b = el('rect',{x:L,y:y+rowH*.2,width:0,height:rowH*.6,rx:2,fill:r.c},svg);
    b.animate([{width:'0px'},{width:w+'px'}],{duration:600,delay:i*60,fill:'forwards',easing:'ease-out'});
    el('text',{x:L+w+6,y:y+rowH*.62,class:'mlab',style:'fill:var(--ink);font-size:12px'},svg,fmt(r.v));
  });
}
function drawMFA(){
  const svg = $('#mfaChart'); svg.innerHTML='';
  const g1 = el('svg',{x:0,y:0,width:480,height:150,viewBox:'0 0 480 150'},svg);
  hbars(g1,[
    {label:'Baseline GEM',v:65.2,c:'#3b78b5'},
    {label:'kinGEMs pre-tuning',v:24.0,c:'#a0663a'},
    {label:'kinGEMs post-tuning',v:53.0,c:'#e377c2'},
  ],{max:80,fmt:v=>v.toFixed(1)+'%',title:'Mean-to-mean distance from MFA (% of glucose uptake) ↓',rowH:38});
  const g2 = el('svg',{x:0,y:156,width:480,height:144,viewBox:'0 0 480 144'},svg);
  hbars(g2,[
    {label:'Baseline GEM',v:8384,c:'#3b78b5'},
    {label:'kinGEMs pre-tuning',v:9582,c:'#a0663a'},
    {label:'kinGEMs post-tuning',v:7683,c:'#e377c2'},
  ],{max:11000,fmt:v=>v.toLocaleString(),title:'Average FVA interval width, glucose-normalized ↓',rowH:38});
}
function drawOvf(){
  const svg = $('#ovfChart'); svg.innerHTML='';
  const models = [['iAF1260',0.49,0.26],['iML1515',15.19,0.40],['iJO1366',20.10,0.16]];
  const W=480,H=300,L=60,R=20,T=34,B=40;
  const ly = v => T + (H-T-B)*(1-(Math.log10(v)+1)/(Math.log10(30)+1));
  [0.1,1,10].forEach(v=>{el('line',{x1:L,x2:W-R,y1:ly(v),y2:ly(v),stroke:'var(--rule2)'},svg);el('text',{x:L-8,y:ly(v)+4,'text-anchor':'end'},svg,v);});
  el('text',{x:14,y:(H-B+T)/2,transform:`rotate(-90 14 ${(H-B+T)/2})`,'text-anchor':'middle'},svg,'|onset gap| (1/hr)');
  const gw = (W-L-R)/3;
  models.forEach(([m,fba,kg],i)=>{
    const x0 = L + i*gw + gw*.18, bw = gw*.3;
    [[fba,'#3b78b5'],[kg,'var(--red)']].forEach(([v,c],k)=>{
      const x = x0 + k*(bw+6), y = ly(v);
      el('rect',{x,y,width:bw,height:(H-B)-y,fill:c,rx:2,opacity:.9},svg);
      el('text',{x:x+bw/2,y:y-6,'text-anchor':'middle',class:'mlab',style:'fill:var(--ink);font-size:11px'},svg,v.toFixed(2));
    });
    el('text',{x:x0+bw+3,y:H-B+18,'text-anchor':'middle',class:'mlab',style:'fill:var(--ink)'},svg,m);
  });
  el('line',{x1:L,x2:W-R,y1:H-B,y2:H-B,stroke:'var(--muted)'},svg);
  el('rect',{x:L+10,y:6,width:10,height:10,fill:'#3b78b5'},svg); el('text',{x:L+26,y:15},svg,'unconstrained FBA');
  el('rect',{x:L+160,y:6,width:10,height:10,fill:'var(--red)'},svg); el('text',{x:L+176,y:15},svg,'kinGEMs ecGEM');
}
function drawNADPH(){
  const svg = $('#nadphChart'); svg.innerHTML='';
  const rows = [['kinGEMs','exponential',65,9],['kinGEMs','N-limited',3,88],['Rekena et al.','exponential',46,13],['Rekena et al.','N-limited',12,75]];
  const L=170,W=480,R=20,T=40,rh=52;
  const sx = v => v/100*(W-L-R);
  el('rect',{x:L,y:8,width:10,height:10,fill:'#3b78b5'},svg); el('text',{x:L+16,y:17},svg,'GDH1 (nitrogen assimilation)');
  el('rect',{x:L,y:24,width:10,height:10,fill:'var(--orange)'},svg); el('text',{x:L+16,y:33},svg,'FAS1–2 (lipogenesis)');
  rows.forEach(([who,ph,g,f],i)=>{
    const y = T + 8 + i*rh + (i>=2?14:0);
    if (i%2===0) el('text',{x:0,y:y+16,style:'fill:var(--ink);font-weight:500;font-size:12.5px'},svg,who);
    el('text',{x:L-10,y:y+16,'text-anchor':'end',style:'font-size:12px'},svg,ph);
    el('rect',{x:L,y:y+2,width:W-L-R,height:22,fill:'var(--card2)',stroke:'var(--rule2)'},svg);
    el('rect',{x:L,y:y+2,width:sx(g),height:22,fill:'#3b78b5'},svg);
    el('rect',{x:L+sx(g),y:y+2,width:sx(f),height:22,fill:'var(--orange)'},svg);
    el('text',{x:L+Math.max(sx(g),24)/2,y:y+17,'text-anchor':'middle',class:'mlab',style:'fill:#fff;font-size:11px'},svg,g+'%');
    el('text',{x:L+sx(g)+sx(f)/2,y:y+17,'text-anchor':'middle',class:'mlab',style:'fill:#fff;font-size:11px'},svg,f+'%');
  });
}
function drawProt(){
  const svg = $('#protChart'); svg.innerHTML='';
  hbars(svg,[
    {label:'matched condition',v:0.336,c:'var(--teal)'},
    {label:'transferred condition',v:0.335,c:'var(--lav)'},
  ],{max:0.5,fmt:v=>'r = '+v.toFixed(3),title:'Mean proteomics correlation of tuned k_cat sets',rowH:48,R:80});
  el('text',{x:0,y:150,style:'fill:var(--ink);font-weight:500;font-size:13px'},svg,'Range across 15 conditions × 4 k_cat sources');
  const L=150,W=480,R=80, sx=v=>L+v/0.5*(W-L-R);
  el('line',{x1:L,x2:W-R,y1:186,y2:186,stroke:'var(--rule)'},svg);
  el('rect',{x:sx(0.27),y:176,width:sx(0.46)-sx(0.27),height:20,rx:10,fill:'var(--teal-bg)',stroke:'var(--teal)'},svg);
  el('text',{x:L-10,y:190,'text-anchor':'end',style:'font-size:12px'},svg,'Pearson r');
  el('text',{x:sx(0.27),y:214,'text-anchor':'middle',class:'mlab'},svg,'0.27');
  el('text',{x:sx(0.46),y:214,'text-anchor':'middle',class:'mlab'},svg,'0.46');
  [0,0.25,0.5].forEach(v=>el('text',{x:sx(v),y:240,'text-anchor':'middle'},svg,v));
}
function drawTax(){
  hbars($('#taxChart'),[
    {label:'E. coli / Shigella',v:64,c:'#7a22e8'},
    {label:'Other Enterobacterales',v:2,c:'#8b3ef0'},
    {label:'Other Proteobacteria',v:3,c:'#a46ef0'},
    {label:'Other bacteria',v:9,c:'#b48af2'},
    {label:'Eukaryotes',v:14,c:'#e48a33'},
  ],{max:70,L:170,fmt:v=>v+' models',title:'Phylogenetic distance from E. coli →',rowH:46,R:80});
}
function redrawCharts(){ drawAbl(); drawMFA(); drawOvf(); drawNADPH(); drawProt(); drawTax(); drawAnneal(); }
selLv(5); drawMFA(); drawOvf(); drawNADPH(); drawProt(); drawTax();

/* ---------- figures ---------- */
const FIGS = [
  ['From genome-scale models to quantified metabolism','GEMs plus enzyme constraints give ecGEMs, but ~89% of E. coli kcat values are missing. kinGEMs fills them with predicted, refined values.'],
  ['Overview of the integrated CPI-Pred + kinGEMs framework','(A) kinetic prediction · (B) ecGEM construction · (C) benchmarking · (D) multiscale feedback loop.'],
  ['Flux variability ablation study','Each constraint level shifts the variability CDF left. Tuning (L5) restores biomass.'],
  ['Agreement with ¹³C-MFA','FVA ranges vs measured fluxes for AKGDH, EX_ac_e, CS; aggregate distances across 46 reactions.'],
  ['Proteomics agreement (RMSE)','15 conditions × 4 kcat sources, before and after annealing. No source dominates.'],
  ['Resource allocation in R. toruloides','NADPH trade-off and carbon-source-specific routing across six conditions.'],
  ['Emergent acetate overflow','Three E. coli reconstructions predict the onset of overflow metabolism.'],
  ['Global kcat shifts after annealing','Right-shifted, bimodal distribution; median 5.6 → 54.3.'],
  ['Quality of the 93 tuned ecGEMs','Deviation grows with phylogenetic distance; growth vs literature for five organisms.'],
  ['Simulated annealing framework','Rank by enzyme mass → perturb within CPI-Pred range → evaluate → Metropolis accept.'],
];
const grid = $('#figGrid');
FIGS.forEach(([t,c],i)=>{
  const b = document.createElement('button'); b.className='fig';
  const src = `assets/figs/fig${String(i+1).padStart(2,'0')}.png`;
  b.innerHTML = `<div class="im"><img loading="lazy" src="${src}" alt="Figure ${i+1}: ${t}"></div><div class="cap"><b>FIG ${i+1}</b>${t}</div>`;
  b.onclick = () => { $('#lbImg').src = src; $('#lbImg').alt = t; $('#lbCap').innerHTML = `<b>Fig ${i+1}.</b> ${t}. ${c}`; $('#lb').classList.add('on'); };
  grid.appendChild(b);
});
const closeLb = () => $('#lb').classList.remove('on');
$('#lbClose').onclick = closeLb;
$('#lb').onclick = e => { if (e.target.id === 'lb') closeLb(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

/* ---------- cite ---------- */
$('#copyBib').onclick = async () => {
  const txt = $('#bib').textContent.replace(/^Copy(ed)?/,'').trim();
  try { await navigator.clipboard.writeText(txt); $('#copyBib').textContent='Copied'; }
  catch(e){ $('#copyBib').textContent='Select & copy'; }
  setTimeout(()=>$('#copyBib').textContent='Copy',1600);
};

/* ---------- nav highlight ---------- */
const secs = ['atlas','anneal','findings','figures','cite'].map(id=>document.getElementById(id));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$('.nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#'+e.target.id));
}),{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(s=>io.observe(s));
})();
