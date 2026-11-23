/* ================= rotation entries ================= */
const P = (base, quote, on, sources) => ({ type: 'price', base, quote, sources: sources || [], on: !!on });
const C = (tz, on, label, h12) => ({ type: 'clock', tz, label: label || '', h12: !!h12, on: !!on });
const Vt = (key, on) => ({ type: 'vital', key, on: !!on });
const itemId = it => it.type === 'price' ? 'p:' + it.base + '/' + it.quote + ':' + [...it.sources].sort().join(',')
  : it.type === 'clock' ? 'c:' + it.tz + ':' + (it.h12 ? 12 : 24) + ':' + it.label : 'v:' + it.key;
function defaults() {
  return [P('BTC', 'USD', 1), P('XAU-BTCU', 'USD', 1), P('ETH', 'USD', 1), P('BTC', 'ETH', 1), P('XAU', 'USD', 1), P('BTC', 'XAU', 1), P('EUR', 'USD', 1), C(LOCAL_TZ, 1), Vt('height', 1), Vt('subsidy', 1), Vt('fees', 1),
    P('NVDA', 'USD', 0), P('NVDA', 'XAU', 0), P('USD', 'SATS', 0), P('SOL', 'USD', 0), P('XAG', 'USD', 0), P('USD', 'JPY', 0), P('BTC', 'EUR', 0),
    C('UTC', 0), C('America/New_York', 0), C('Europe/London', 0), C('Asia/Tokyo', 0),
    Vt('since', 0), Vt('difficulty', 0), Vt('nextadj', 0), Vt('retarget', 0), Vt('hashrate', 0), Vt('halving', 0), Vt('supply', 0), Vt('mempool', 0), Vt('mcap', 0)];
}
function validItem(it) {
  if (!it || typeof it !== 'object') return false;
  if (it.type === 'price') { if (!Array.isArray(it.sources)) it.sources = []; it.sources = it.sources.filter(id => S[id]); return !!(A[it.base] && A[it.quote]); }
  if (it.type === 'clock') return typeof it.tz === 'string';
  return it.type === 'vital' && !!VITALS[it.key];
}
function load() {
  try { const j = JSON.parse(localStorage.getItem(LS)); if (j && j.v === 1) Object.assign(state, j); } catch (e) { /* first run or storage blocked */ }
  if (!Array.isArray(state.custom)) state.custom = [];
  state.custom = state.custom.filter(c => c && /^[A-Z0-9.\-]{1,12}$/.test(c.sym || '') && CLS_NAME[c.cls]);
  state.custom.forEach(c => { if (!A[c.sym]) def(c.sym, String(c.name || c.sym).slice(0, 40), c.cls, Object.assign(c.cls === 'stock' ? { unit: 'shares of ' + (c.name || c.sym) } : {}, c.cg ? { cg: String(c.cg) } : {})); });
  if (!Array.isArray(state.items) || !state.items.length) state.items = defaults();
  state.items = state.items.filter(validItem);
  for (const k in VITALS) if (!state.items.some(i => i.type === 'vital' && i.key === k)) state.items.push(Vt(k, 0));
  /* entries added in later versions appear once for people who already have saved settings */
  if (!state.seenGoldUnit) { state.seenGoldUnit = true; if (!state.items.some(i => i.type === 'price' && i.base === 'XAU-BTCU')) state.items.unshift(P('XAU-BTCU', 'USD', 1)); }
  state.goldTonnes = Math.min(1e7, Math.max(1, +state.goldTonnes || 220700));
  if (state.goldUnits !== 'cap') state.goldUnits = 'issued';
  if (!THEME[state.theme]) state.theme = 'flip';
  if (!state.accent || typeof state.accent !== 'object') state.accent = {};
  state.cells = Math.min(14, Math.max(6, +state.cells || 10));
  state.dwell = Math.min(120, Math.max(2, +state.dwell || 8));
  state.key = String(state.key || '');
  if (state.layout !== 'right') state.layout = 'below';
  if (state.weatherUnits !== 'c') state.weatherUnits = 'f';
  state.weatherReturn = Math.min(120, Math.max(3, +state.weatherReturn || 20));
  state.weatherPlace = String(state.weatherPlace || '');
  state.weatherLabel = String(state.weatherLabel || '');
  if (state.weatherLat != null) state.weatherLat = +state.weatherLat;
  if (state.weatherLon != null) state.weatherLon = +state.weatherLon;
  if (!isFinite(state.weatherLat) || !isFinite(state.weatherLon)) { state.weatherLat = state.weatherLon = null; }
}
function save() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) { /* storage blocked: settings last for this visit only */ } }

/* ================= rotation loop ================= */
let cur = null, shownAt = 0, ticks = 0;
function frame() {
  const now = Date.now(), act = activeItems();
  if (!act.length) { cur = null; Disp.show({ label: 'NOTHING SELECTED', value: null, info: ['OPEN SETTINGS AND TICK SOMETHING IN THE ROTATION LIST'] }); return; }
  if (!act.includes(cur)) { cur = act[0]; shownAt = now; markCur(); }
  else if (!state.paused && act.length > 1 && now - shownAt >= state.dwell * 1000) { cur = act[(act.indexOf(cur) + 1) % act.length]; shownAt = now; markCur(); }
  Disp.show(viewOf(cur));
}
function go(d) {
  const act = activeItems(); if (!act.length) return;
  const i = act.indexOf(cur); cur = act[((i < 0 ? 0 : i + d) + act.length) % act.length]; shownAt = Date.now(); markCur(); frame();
}
function jumpTo(it) { cur = it; shownAt = Date.now(); markCur(); frame(); }

/* ================= settings panel ================= */
const TAG = { price: 'price', clock: 'clock', vital: 'bitcoin' };
function itemText(it) {
  if (it.type === 'price') {
    const b = A[it.base], q = A[it.quote];
    return { nm: dispOf(it.base) + ' in ' + dispOf(it.quote), sb: (b ? b.name : it.base) + ' priced in ' + (q ? unitOf(q) : it.quote) + ' · ' + (it.sources.length ? it.sources.map(id => S[id].name).join(', ') : 'automatic source') };
  }
  if (it.type === 'clock') return { nm: 'Clock: ' + (it.label || tzCity(it.tz)), sb: it.tz + ' · ' + (it.h12 ? '12-hour' : '24-hour') };
  return { nm: VITALS[it.key].name, sb: 'Bitcoin network · mempool.space' };
}
function renderList() {
  const list = $('#msList'), f = $('#msFilter').value.trim().toLowerCase();
  list.textContent = '';
  state.items.forEach((it, i) => {
    const t = itemText(it);
    if (f && !(t.nm + ' ' + t.sb + ' ' + TAG[it.type]).toLowerCase().includes(f)) return;
    const row = mk('div', 'it' + (it === cur ? ' cur' : '')); row.dataset.i = i;
    const lab = mk('label'), cb = mk('input'); cb.type = 'checkbox'; cb.checked = !!it.on;
    const tx = mk('span', 'tx'); tx.append(mk('span', 'nm', t.nm), mk('span', 'sb', t.sb));
    lab.append(cb, tx);
    const ops = mk('span', 'ops');
    [['up', '▲', 'Move up'], ['down', '▼', 'Move down']].concat(it.type === 'vital' ? [] : [['del', '✕', 'Remove']]).forEach(([a, ch, title]) => { const b = mk('button', '', ch); b.dataset.act = a; b.title = title; b.setAttribute('aria-label', title + ': ' + t.nm); ops.appendChild(b); });
    row.append(lab, mk('span', 'tg ' + it.type, TAG[it.type]), ops);
    list.appendChild(row);
  });
  if (!list.children.length) list.appendChild(mk('div', 'hint', 'Nothing matches that filter.')).style.padding = '10px';
  const on = activeItems().length;
  $('#msSum').textContent = on + ' of ' + state.items.length + ' showing in rotation';
}
function markCur() {
  if (!document.body.classList.contains('open')) return;
  document.querySelectorAll('#msList .it').forEach(r => r.classList.toggle('cur', state.items[+r.dataset.i] === cur));
}
function changed() { save(); renderList(); frame(); pump(Date.now()); pumpVitals(Date.now()); }

function fillAssetList() {
  const dl = $('#dlAssets'); dl.textContent = '';
  Object.values(A).sort((x, y) => x.sym < y.sym ? -1 : 1).forEach(a => { const o = mk('option'); o.value = a.sym; o.label = a.name + ' · ' + CLS_NAME[a.cls]; dl.appendChild(o); });
}
const apSel = new Set();
const rootOf = a => (a && a.of ? A[a.of] : a);
function refreshBuilder() {
  const bv = $('#apBase').value.trim(), qv = $('#apQuote').value.trim();
  const b = findAsset(bv), q = findAsset(qv || 'USD'), hint = $('#apHint'), box = $('#apSrc');
  if (!bv) hint.textContent = 'Pick any asset and anything to price it in: BTC in ETH, NVDA in gold, gold in euros.';
  else if (b && q) hint.textContent = 'One ' + b.name + ' priced in ' + unitOf(q) + '.';
  else hint.textContent = (!b ? bv.toUpperCase() : qv.toUpperCase()) + ' is new: it will be looked up when you add it.';
  const ids = Object.values(S).filter(s => [b, q].some(a => { const r = rootOf(a); return r && r.sym !== 'USD' && s.covers(r); })).map(s => s.id);
  [...apSel].forEach(id => { if (!ids.includes(id)) apSel.delete(id); });
  box.textContent = '';
  if (!ids.length) return;
  const chip = (id, text, title) => { const c = mk('button', 'chip', text); c.dataset.id = id; c.title = title; c.setAttribute('aria-pressed', id ? apSel.has(id) : !apSel.size); box.appendChild(c); };
  chip('', 'Auto', 'Use the best available source for each side');
  ids.forEach(id => chip(id, S[id].name, 'Tick several to show their median'));
}
async function resolveSym(raw, type) {
  const s = String(raw || '').trim().toUpperCase(); if (!s) return null;
  const known = findAsset(s); if (known) return known;
  if (!/^[A-Z0-9.\-]{1,12}$/.test(s)) throw new Error('"' + s.slice(0, 20) + '" is not a valid symbol');
  const add = (name, cls, x) => {
    name = String(name || s).slice(0, 40);
    const a = def(s, name, cls, Object.assign(cls === 'stock' ? { unit: 'shares of ' + name } : {}, x || {}));
    state.custom.push({ sym: s, name, cls, cg: a.cg || undefined }); fillAssetList(); return a;
  };
  const stock = async () => {
    let j; try { j = await S.finnhub.quote(s); } catch (e) { throw new Error('Finnhub: ' + errText(e)); }
    if (!(j.c > 0)) return null;
    S.finnhub.put(s, { usd: j.c, chg: j.dp != null ? j.dp / 100 : null, hi: j.h || null, lo: j.l || null, asof: j.t ? j.t * 1000 : null });
    let name = s;
    try { const r = await getJSON('https://finnhub.io/api/v1/search?q=' + encodeURIComponent(s) + '&token=' + encodeURIComponent(state.key)); const hit = (r.result || []).find(x => x.symbol === s); if (hit && hit.description) name = hit.description; } catch (e) { /* name is optional */ }
    return add(name, 'stock');
  };
  if (type === 'stock') {
    if (!state.key) throw new Error('Stocks need a free Finnhub key. Add it under Data sources.');
    const a = await stock(); if (a) return a;
    throw new Error('Finnhub has no quote for ' + s);
  }
  if (type === 'auto') { try { if (!S.erapi.list) await S.erapi.loadList(); if (S.erapi.list.has(s)) return add(s, 'fiat'); } catch (e) { /* carry on */ } }
  let cg = null, name = null, onCb = false;
  try {
    const j = await getJSON('https://api.coingecko.com/api/v3/search?query=' + encodeURIComponent(s));
    const hit = (j.coins || []).filter(c => String(c.symbol).toUpperCase() === s).sort((x, y) => (x.market_cap_rank || 1e9) - (y.market_cap_rank || 1e9))[0];
    if (hit) { cg = String(hit.id); name = hit.name; }
  } catch (e) { /* carry on */ }
  try { if (!S.coinbase.list) await S.coinbase.loadList(); onCb = S.coinbase.list.has(s); } catch (e) { /* carry on */ }
  if (onCb || (cg && (type === 'crypto' || !state.key))) return add(name, 'crypto', cg ? { cg } : {});
  if (type === 'auto' && state.key) { const a = await stock(); if (a) return a; }
  if (cg) return add(name, 'crypto', { cg });
  throw new Error(type === 'crypto' || state.key ? 'Nothing found for ' + s : s + ' was not found as a crypto or currency. Stocks need a Finnhub key (see Data sources).');
}
function setMsg(el, text, cls) { el.textContent = text || ''; el.className = 'msg' + (cls ? ' ' + cls : ''); }
let adding = false;
async function addPrice() {
  if (adding) return; adding = true;
  const m = $('#apMsg'); setMsg(m, 'Looking up…');
  try {
    const type = $('#apType').value;
    const b = await resolveSym($('#apBase').value, type); if (!b) throw new Error('Type an asset symbol first');
    const q = await resolveSym($('#apQuote').value || 'USD', type);
    if (b.sym === q.sym) throw new Error('The asset and what it is priced in are the same');
    const it = P(b.sym, q.sym, 1, [...apSel]), dup = state.items.find(x => itemId(x) === itemId(it));
    const target = dup || it;
    if (dup) dup.on = true; else state.items.unshift(it);
    setMsg(m, dup ? 'Already in the list, now switched on.' : 'Added ' + dispOf(b.sym) + ' in ' + dispOf(q.sym) + '.', 'ok');
    $('#apBase').value = ''; $('#apQuote').value = ''; apSel.clear(); refreshBuilder();
    cur = target; shownAt = Date.now(); changed();
  } catch (e) { setMsg(m, String(e.message || e), 'err'); }
  adding = false;
}
function addClock() {
  const m = $('#acMsg'); let tz = $('#acTz').value.trim();
  if (!tz) { setMsg(m, 'Type a time zone, such as Europe/Paris', 'err'); return; }
  const all = tzList(), hit = all.find(z => z.toLowerCase() === tz.toLowerCase()) || all.find(z => tzCity(z).toLowerCase() === tz.toLowerCase());
  if (hit) tz = hit;
  try { new Intl.DateTimeFormat('en-GB', { timeZone: tz }); } catch (e) { setMsg(m, '"' + tz.slice(0, 30) + '" is not a known time zone', 'err'); return; }
  const it = C(tz, 1, $('#acLabel').value.trim().slice(0, 24), $('#acH12').checked), dup = state.items.find(x => itemId(x) === itemId(it));
  if (dup) dup.on = true; else state.items.unshift(it);
  setMsg(m, dup ? 'Already in the list, now switched on.' : 'Added a clock for ' + (it.label || tzCity(tz)) + '.', 'ok');
  $('#acTz').value = ''; $('#acLabel').value = '';
  cur = dup || it; shownAt = Date.now(); changed();
}
let _tz = null;
function tzList() {
  if (_tz) return _tz;
  try { _tz = ['UTC', ...Intl.supportedValuesOf('timeZone')]; }
  catch (e) { _tz = ['UTC', 'America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Africa/Johannesburg', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland']; }
  return _tz;
}
function renderThemes() {
  const g = $('#thGrid'); g.textContent = '';
  Object.values(THEME).forEach(t => { const b = mk('button', '', t.name); b.dataset.id = t.id; b.setAttribute('aria-pressed', t.id === state.theme); g.appendChild(b); });
  const row = $('#acRow'), th = THEME[state.theme], sel = state.accent[th.id] || 0; row.textContent = '';
  th.acc.forEach(([n, c], i) => { const b = mk('button', 'chip'); const sw = mk('i'); sw.style.background = c; b.append(sw, n); b.dataset.i = i; b.setAttribute('aria-pressed', i === sel); row.appendChild(b); });
}
function agoText(t) { const s = Math.round((Date.now() - t) / 1000); return s < 90 ? s + 's ago' : s < 5400 ? Math.round(s / 60) + ' min ago' : Math.round(s / 3600) + ' h ago'; }
function renderSources() {
  const box = $('#srcList'), need = needs(); box.textContent = '';
  const line = (name, url, cls, text) => {
    const r = mk('div', 'src'), n = mk('span', 'n'), a = mk('a', '', name); a.href = url; a.target = '_blank'; a.rel = 'noopener'; n.appendChild(a);
    r.append(mk('span', 'dot ' + cls), n, mk('span', 's', text)); box.appendChild(r);
  };
  Object.values(S).forEach(s => {
    const used = need.has(s.id);
    if (s.off()) line(s.name, s.url, used ? 'err' : '', s.offMsg);
    else if (s.err) line(s.name, s.url, 'err', s.err + (s.okAt ? ' · last good ' + agoText(s.okAt) : ''));
    else if (s.okAt) line(s.name, s.url, used ? 'ok' : '', (used ? 'updated ' : 'not in use · last ') + agoText(s.okAt));
    else line(s.name, s.url, used ? 'wait' : '', used ? 'connecting…' : 'not in use');
  });
  const vUsed = activeItems().some(i => i.type === 'vital');
  line('mempool.space (Bitcoin network)', 'https://mempool.space', V.err ? 'err' : V.okAt ? (vUsed ? 'ok' : '') : vUsed ? 'wait' : '', V.err || (V.okAt ? 'updated ' + agoText(V.okAt) : vUsed ? 'connecting…' : 'not in use'));
}
function openPanel(open) {
  document.body.classList.toggle('open', open);
  if (open) { renderList(); renderSources(); }
  setTimeout(() => Disp.fit(), 270); Disp.fit();
}
function syncControls() {
  $('#dwell').value = state.dwell; $('#dwellOut').textContent = state.dwell + ' s';
  $('#cells').value = state.cells; $('#cellsOut').textContent = state.cells;
  $('#gTonnes').value = state.goldTonnes; $('#gUnits').value = state.goldUnits;
  $('#optInfo').checked = !!state.info; $('#optSound').checked = !!state.sound; $('#fhKey').value = state.key;
  $('#bPause').innerHTML = state.paused ? '&#9654;&#xFE0E;' : '&#10073;&#10073;';
  $('#bPause').title = state.paused ? 'Resume (space)' : 'Pause (space)';
  $('#wxLoc').value = state.weatherLabel || state.weatherPlace || '';
  $('#wxUnits').value = state.weatherUnits === 'c' ? 'c' : 'f';
  $('#wxReturn').value = state.weatherReturn; $('#wxReturnOut').textContent = state.weatherReturn + ' s';
  document.querySelectorAll('#layoutRow .chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.layout === state.layout ? 'true' : 'false'));
}
function wire() {
  $('#bGear').onclick = () => openPanel(!document.body.classList.contains('open'));
  $('#pClose').onclick = () => openPanel(false);
  $('#bPrev').onclick = () => go(-1);
  $('#bNext').onclick = () => go(1);
  $('#bPause').onclick = () => { state.paused = !state.paused; shownAt = Date.now(); save(); syncControls(); };
  $('#bFull').onclick = () => { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (e) { /* not allowed */ } };
  $('#msBtn').onclick = () => { const b = $('#msBtn'), open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', open); $('#msPop').hidden = !open; };
  $('#msFilter').oninput = renderList;
  $('#msAll').onclick = () => { state.items.forEach(i => i.on = true); changed(); };
  $('#msNone').onclick = () => { state.items.forEach(i => i.on = false); changed(); };
  $('#msList').addEventListener('change', e => { const r = e.target.closest('.it'); if (!r) return; const it = state.items[+r.dataset.i]; it.on = e.target.checked; if (it.on) { cur = it; shownAt = Date.now(); } changed(); });
  $('#msList').addEventListener('click', e => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const rows = [...document.querySelectorAll('#msList .it')], r = b.closest('.it'), i = +r.dataset.i, pos = rows.indexOf(r), a = b.dataset.act;
    if (a === 'del') state.items.splice(i, 1);
    else { const other = rows[pos + (a === 'up' ? -1 : 1)]; if (!other) return; const j = +other.dataset.i; [state.items[i], state.items[j]] = [state.items[j], state.items[i]]; }
    changed();
  });
  $('#dwell').oninput = e => { state.dwell = +e.target.value; $('#dwellOut').textContent = state.dwell + ' s'; save(); };
  $('#apBase').oninput = $('#apQuote').oninput = refreshBuilder;
  $('#apSwap').onclick = () => { const b = $('#apBase'), q = $('#apQuote'), t = b.value; b.value = q.value; q.value = t; refreshBuilder(); };
  $('#apSrc').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; const id = c.dataset.id; if (!id) apSel.clear(); else if (apSel.has(id)) apSel.delete(id); else apSel.add(id); refreshBuilder(); });
  $('#apAdd').onclick = addPrice;
  [$('#apBase'), $('#apQuote')].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') addPrice(); }));
  $('#acAdd').onclick = addClock;
  [$('#acTz'), $('#acLabel')].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') addClock(); }));
  $('#thGrid').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.theme = b.dataset.id; save(); renderThemes(); Disp.build(); renderWeather(); });
  $('#acRow').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.accent[state.theme] = +b.dataset.i; save(); renderThemes(); Disp.build(); renderWeather(); });
  $('#cells').oninput = e => { state.cells = +e.target.value; $('#cellsOut').textContent = state.cells; save(); Disp.build(); };
  $('#optInfo').onchange = e => { state.info = e.target.checked; save(); Disp.build(); };
  $('#optSound').onchange = e => { state.sound = e.target.checked; save(); if (state.sound) tick(); };
  $('#fhKey').onchange = e => { state.key = e.target.value.trim(); const f = S.finnhub; f.fail = 0; f.err = ''; f.next = 0; f.miss.clear(); save(); renderSources(); frame(); };
  $('#gTonnes').onchange = e => { state.goldTonnes = Math.min(1e7, Math.max(1, +e.target.value || 220700)); e.target.value = state.goldTonnes; save(); frame(); };
  $('#gUnits').onchange = e => { state.goldUnits = e.target.value === 'cap' ? 'cap' : 'issued'; save(); frame(); pumpVitals(Date.now()); };
  $('#layoutRow').addEventListener('click', e => {
    const b = e.target.closest('[data-layout]'); if (!b) return;
    state.layout = b.dataset.layout === 'right' ? 'right' : 'below';
    save(); syncControls(); Disp.build(); renderWeather(); Disp.fit();
  });
  $('#wxApply').onclick = () => applyWeatherSettings();
  $('#wxLoc').addEventListener('keydown', e => { if (e.key === 'Enter') applyWeatherSettings(); });
  $('#wxReturn').oninput = e => { state.weatherReturn = +e.target.value; $('#wxReturnOut').textContent = state.weatherReturn + ' s'; save(); scheduleWxReturn(); };
  wireWeather();
  let armed = 0;
  $('#bReset').onclick = e => {
    if (Date.now() - armed > 4000) { armed = Date.now(); e.target.textContent = 'Click again to confirm reset'; setTimeout(() => { e.target.textContent = 'Reset everything'; }, 4000); return; }
    try { localStorage.removeItem(LS); localStorage.removeItem(HLS); } catch (err) { /* ignore */ }
    location.reload();
  };
  addEventListener('resize', () => Disp.fit());
  addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input,select,textarea')) { if (e.key === 'Escape') e.target.blur(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === ' ') { e.preventDefault(); $('#bPause').click(); }
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'f' || e.key === 'F') $('#bFull').click();
    else if (e.key === 's' || e.key === 'S') $('#bGear').click();
    else if (e.key === 'Escape') openPanel(false);
  });
  let idle = 0;
  const wake = () => { document.body.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('idle'), 3500); };
  ['mousemove', 'mousedown', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, wake, { passive: true })); wake();
}

/* ================= start ================= */
function boot() {
  load();
  fillAssetList();
  const dz = $('#dlTz'); tzList().forEach(z => { const o = mk('option'); o.value = z; dz.appendChild(o); });
  wire(); syncControls(); renderThemes(); refreshBuilder(); renderList();
  Disp.build();
  renderWeather();
  onData = () => { frame(); };
  frame(); pump(Date.now()); pumpVitals(Date.now()); pumpWeather(Date.now());
  setInterval(() => {
    const now = Date.now(); ticks++;
    if (ticks % 4 === 0) { pump(now); pumpVitals(now); }
    if (ticks % 120 === 0) pumpWeather(now);
    if (ticks % 8 === 0 && document.body.classList.contains('open')) renderSources();
    frame();
  }, 250);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => Disp.fit());
}
boot();
