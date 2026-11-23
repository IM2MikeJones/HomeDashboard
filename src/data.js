/* ================= utilities ================= */
const $ = (s, r = document) => r.querySelector(s);
const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const median = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const uniq = a => [...new Set(a)];
const missErr = msg => { const e = new Error(msg || 'not found'); e.miss = true; return e; };

async function getJSON(url, o = {}) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), o.timeout || 12000);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; if (r.status === 404 || r.status === 400) e.miss = true; throw e; }
    return await r.json();
  } finally { clearTimeout(t); }
}
async function pool(items, n, fn) {
  const q = [...items];
  await Promise.all(Array.from({ length: Math.min(n, q.length) }, async () => { while (q.length) await fn(q.shift()); }));
}
/* Try one batched request; if it fails, retry item by item so one bad symbol cannot sink the rest. */
async function batchOrEach(items, batchFn, oneFn, onMiss) {
  if (!items.length) return;
  try { await batchFn(items); return; }
  catch (e) { if (items.length === 1) { if (e.miss) { onMiss(items[0]); return; } throw e; } }
  let ok = 0, last = null; const bad = [];
  await pool(items, 3, async it => { try { await oneFn(it); ok++; } catch (e) { last = e; bad.push([it, e]); } });
  if (!ok && bad.some(([, e]) => !e.miss)) throw last;
  bad.forEach(([it]) => onMiss(it));
}
function errText(e) {
  if (!e) return '';
  if (e.name === 'AbortError') return 'timed out';
  if (e.status === 429) return 'rate limited';
  if (e.status === 401 || e.status === 403) return 'access denied (check key)';
  if (e.status) return 'HTTP ' + e.status;
  if (e instanceof TypeError) return 'unreachable';
  return String(e.message || e).slice(0, 60);
}

/* ================= saved state ================= */
const LS = 'homedashboard.v1';
const state = {
  v: 1, theme: 'flip', accent: {}, cells: 10, dwell: 8, info: true, sound: false, key: '', paused: false, items: [], custom: [],
  goldTonnes: 220700, goldUnits: 'issued',
  layout: 'below', weatherPlace: '', weatherLat: null, weatherLon: null, weatherLabel: '', weatherUnits: 'f', weatherReturn: 20
};

/* ================= assets ================= */
const A = Object.create(null);
function def(sym, name, cls, x) { return A[sym] = Object.assign({ sym, name, cls, disp: sym }, x || {}); }
def('USD', 'US dollar', 'fiat', { unit: 'US dollars' });
('BTC:Bitcoin:bitcoin ETH:Ethereum:ethereum SOL:Solana:solana XRP:XRP:ripple BNB:BNB:binancecoin DOGE:Dogecoin:dogecoin ' +
 'ADA:Cardano:cardano LTC:Litecoin:litecoin BCH:Bitcoin_Cash:bitcoin-cash LINK:Chainlink:chainlink AVAX:Avalanche:avalanche-2 ' +
 'DOT:Polkadot:polkadot XMR:Monero:monero XLM:Stellar:stellar UNI:Uniswap:uniswap AAVE:Aave:aave SUI:Sui:sui TRX:TRON:tron ' +
 'TON:Toncoin:the-open-network ZEC:Zcash:zcash').split(' ').forEach(s => { const [k, n, cg] = s.split(':'); def(k, n.replace(/_/g, ' '), 'crypto', { cg }); });
('EUR:Euro GBP:British_pound JPY:Japanese_yen CHF:Swiss_franc CAD:Canadian_dollar AUD:Australian_dollar NZD:New_Zealand_dollar ' +
 'CNY:Chinese_yuan HKD:Hong_Kong_dollar SGD:Singapore_dollar INR:Indian_rupee KRW:South_Korean_won MXN:Mexican_peso BRL:Brazilian_real ' +
 'SEK:Swedish_krona NOK:Norwegian_krone DKK:Danish_krone PLN:Polish_zloty CZK:Czech_koruna HUF:Hungarian_forint TRY:Turkish_lira ' +
 'ZAR:South_African_rand ILS:Israeli_shekel THB:Thai_baht IDR:Indonesian_rupiah PHP:Philippine_peso MYR:Malaysian_ringgit')
  .split(' ').forEach(s => { const [k, n] = s.split(':'); def(k, n.replace(/_/g, ' '), 'fiat'); });
def('XAU', 'Gold (troy oz)', 'metal', { disp: 'GOLD OZ', unit: 'troy ounces of gold' });
def('XAG', 'Silver (troy oz)', 'metal', { disp: 'SILVER OZ', unit: 'troy ounces of silver' });
def('XPT', 'Platinum (troy oz)', 'metal', { disp: 'PLATINUM OZ', unit: 'troy ounces of platinum' });
def('XPD', 'Palladium (troy oz)', 'metal', { disp: 'PALLADIUM OZ', unit: 'troy ounces of palladium' });
def('HG', 'Copper (lb)', 'metal', { disp: 'COPPER LB', unit: 'pounds of copper' });
def('SATS', 'Satoshis', 'crypto', { of: 'BTC', f: 1e-8, unit: 'satoshis' });
def('XAU-G', 'Gold (gram)', 'metal', { of: 'XAU', f: 1 / 31.1034768, disp: 'GOLD G', unit: 'grams of gold' });
def('XAG-G', 'Silver (gram)', 'metal', { of: 'XAG', f: 1 / 31.1034768, disp: 'SILVER G', unit: 'grams of silver' });
/* All the gold above ground, split into as many units as there are bitcoins: same unit count, so prices compare like market caps. */
def('XAU-BTCU', 'Gold in bitcoin-sized units', 'metal', { of: 'XAU', dyn: 1, disp: 'GOLD BTC-UNIT', unit: 'bitcoin-sized units of gold' });
('NVDA:NVIDIA AAPL:Apple MSFT:Microsoft GOOGL:Alphabet AMZN:Amazon META:Meta TSLA:Tesla MSTR:Strategy COIN:Coinbase AMD:AMD ' +
 'NFLX:Netflix SPY:S&P_500_ETF QQQ:Nasdaq-100_ETF GLD:Gold_ETF IBIT:iShares_Bitcoin_ETF')
  .split(' ').forEach(s => { const [k, n] = s.split(':'); def(k, n.replace(/_/g, ' '), 'stock', { unit: 'shares of ' + n.replace(/_/g, ' ') }); });
const ALIAS = { GOLDBTC: 'XAU-BTCU', 'GOLD-BTC': 'XAU-BTCU', GOLDUNIT: 'XAU-BTCU', GOLD: 'XAU', SILVER: 'XAG', PLATINUM: 'XPT', PALLADIUM: 'XPD', COPPER: 'HG', SAT: 'SATS', SATOSHI: 'SATS', SATOSHIS: 'SATS', XBT: 'BTC', DOLLAR: 'USD', DOLLARS: 'USD' };
const CLS_NAME = { crypto: 'crypto', fiat: 'currency', metal: 'metal', stock: 'stock' };
function findAsset(raw) {
  const s = String(raw || '').trim().toUpperCase();
  if (!s) return null;
  if (A[s]) return A[s];
  if (ALIAS[s]) return A[ALIAS[s]];
  for (const k in A) if (A[k].name.toUpperCase() === s) return A[k];
  return null;
}
const unitOf = a => a.unit || (a.cls === 'fiat' ? a.name + 's' : a.name);

/* ================= price sources ================= */
const S = Object.create(null);
function source(id, o) {
  S[id] = Object.assign({
    id, q: {}, d: {}, miss: new Set(), list: null, only: null, need: null,
    next: 0, last: 0, fail: 0, err: '', okAt: 0, busy: false,
    every: () => 20000, off: () => false, canDirect: () => false,
    covers(a) {
      return this.cls.includes(a.cls) && !a.of && a.sym !== 'USD' && !this.miss.has(a.sym) &&
        (!this.only || this.only.includes(a.sym)) && (!this.list || this.list.has(a.sym)) && (!this.need || !!a[this.need]);
    },
    put(sym, v) { this.q[sym] = Object.assign({ t: Date.now(), chg: null, hi: null, lo: null, asof: null }, v); }
  }, o);
}
/* A "direct" quote is a real traded pair (ETH/BTC). Tries the pair, then its inverse, then gives up for good. */
async function direct(s, key, one) {
  const [bs, qs] = key.split('/'), b = A[bs], q = A[qs], cur = s.d[key];
  if (!b || !q || (cur && cur.none)) return;
  const modes = cur && cur.px ? [cur.inv ? 1 : 0] : [0, 1];
  for (const inv of modes) {
    try {
      const r = inv ? await one(q, b) : await one(b, q);
      if (!(r.px > 0)) throw missErr();
      s.d[key] = inv
        ? { px: 1 / r.px, chg: r.chg == null ? null : 1 / (1 + r.chg) - 1, hi: r.lo ? 1 / r.lo : null, lo: r.hi ? 1 / r.hi : null, inv: true, t: Date.now() }
        : { px: r.px, chg: r.chg, hi: r.hi || null, lo: r.lo || null, t: Date.now() };
      return;
    } catch (e) { if (!e.miss) throw e; }
  }
  s.d[key] = { none: true };
}
const cryptoPair = (b, q) => b.cls === 'crypto' && (q.cls === 'crypto' || q.cls === 'fiat');

source('coinbase', {
  name: 'Coinbase', short: 'COINBASE', cls: ['crypto', 'fiat'], url: 'https://www.coinbase.com', noStat: new Set(), canDirect: cryptoPair,
  stat(j) { const last = +j.last, open = +j.open; return { px: last, chg: open > 0 ? last / open - 1 : null, hi: +j.high || null, lo: +j.low || null }; },
  async loadList() { const j = await getJSON('https://api.coinbase.com/v2/exchange-rates?currency=USD'); this.rates = j.data.rates; this.list = new Set(Object.keys(this.rates)); },
  async fetch(assets, pairs) {
    await this.loadList();
    for (const a of assets) { const v = +this.rates[a.sym]; if (v > 0) { if (!this.q[a.sym] || a.cls !== 'crypto' || this.noStat.has(a.sym)) this.put(a.sym, { usd: 1 / v }); } }
    await pool(assets.filter(a => a.cls === 'crypto' && this.rates[a.sym] && !this.noStat.has(a.sym)), 4, async a => {
      try { const p = this.stat(await getJSON('https://api.exchange.coinbase.com/products/' + a.sym + '-USD/stats')); if (p.px > 0) this.put(a.sym, { usd: p.px, chg: p.chg, hi: p.hi, lo: p.lo }); }
      catch (e) { if (e.miss) this.noStat.add(a.sym); const v = +this.rates[a.sym]; if (v > 0) this.put(a.sym, { usd: 1 / v }); }
    });
    for (const key of pairs) await direct(this, key, async (b, q) => this.stat(await getJSON('https://api.exchange.coinbase.com/products/' + b.sym + '-' + q.sym + '/stats')));
  }
});

source('kraken', {
  name: 'Kraken', short: 'KRAKEN', cls: ['crypto'], url: 'https://www.kraken.com', canDirect: cryptoPair,
  code: a => ({ BTC: 'XBT', DOGE: 'XDG' }[a.sym] || a.sym),
  async call(pairs) {
    const j = await getJSON('https://api.kraken.com/0/public/Ticker?pair=' + pairs.join(','));
    if (j.error && j.error.length) throw (/unknown asset pair/i.test(j.error[0]) ? missErr(j.error[0]) : new Error(j.error[0]));
    return j.result || {};
  },
  parse(v) { const last = +v.c[0], o = +v.o; return { px: last, chg: o > 0 ? last / o - 1 : null, hi: +v.h[1] || null, lo: +v.l[1] || null }; },
  async fetch(assets, pairs) {
    const go = async list => {
      const res = await this.call(list.map(a => this.code(a) + 'USD'));
      for (const a of list) {
        const k = this.code(a), key = [k + 'USD', 'X' + k + 'ZUSD', k + 'ZUSD', 'X' + k + 'USD'].find(x => res[x]);
        if (!key) { if (list.length === 1) throw missErr(); continue; }
        const p = this.parse(res[key]); this.put(a.sym, { usd: p.px, chg: p.chg, hi: p.hi, lo: p.lo });
      }
    };
    await batchOrEach(assets, go, a => go([a]), a => this.miss.add(a.sym));
    for (const key of pairs) await direct(this, key, async (b, q) => { const v = Object.values(await this.call([this.code(b) + this.code(q)]))[0]; if (!v) throw missErr(); return this.parse(v); });
  }
});

source('binance', {
  name: 'Binance (USDT pairs)', short: 'BINANCE', cls: ['crypto'], url: 'https://www.binance.com',
  async fetch(assets) {
    const base = 'https://data-api.binance.vision/api/v3/ticker/24hr';
    const take = (a, r) => { const last = +r.lastPrice; if (!(last > 0)) throw missErr(); this.put(a.sym, { usd: last, chg: +r.priceChangePercent / 100, hi: +r.highPrice || null, lo: +r.lowPrice || null }); };
    await batchOrEach(assets,
      async list => { const arr = await getJSON(base + '?symbols=' + encodeURIComponent(JSON.stringify(list.map(a => a.sym + 'USDT')))); const by = {}; arr.forEach(r => by[r.symbol] = r); list.forEach(a => { if (by[a.sym + 'USDT']) take(a, by[a.sym + 'USDT']); }); },
      async a => take(a, await getJSON(base + '?symbol=' + a.sym + 'USDT')),
      a => this.miss.add(a.sym));
  }
});

source('gemini', {
  name: 'Gemini', short: 'GEMINI', cls: ['crypto'], url: 'https://www.gemini.com', every: () => 30000, canDirect: cryptoPair,
  async one(sym) {
    try { const j = await getJSON('https://api.gemini.com/v2/ticker/' + sym); const c = +j.close, o = +j.open; if (c > 0) return { px: c, chg: o > 0 ? c / o - 1 : null, hi: +j.high || null, lo: +j.low || null }; } catch (e) { /* fall through to v1 */ }
    const j = await getJSON('https://api.gemini.com/v1/pubticker/' + sym);
    if (!(+j.last > 0)) throw missErr();
    return { px: +j.last, chg: null };
  },
  async fetch(assets, pairs) {
    let ok = 0, last = null;
    await pool(assets, 3, async a => {
      try { const p = await this.one((a.sym + 'usd').toLowerCase()); this.put(a.sym, { usd: p.px, chg: p.chg, hi: p.hi, lo: p.lo }); ok++; }
      catch (e) { if (e.miss) this.miss.add(a.sym); else last = e; }
    });
    if (!ok && last) throw last;
    for (const key of pairs) await direct(this, key, (b, q) => this.one((b.sym + q.sym).toLowerCase()));
  }
});

source('coingecko', {
  name: 'CoinGecko', short: 'COINGECKO', cls: ['crypto'], need: 'cg', url: 'https://www.coingecko.com', every: () => 120000,
  async fetch(assets) {
    if (!assets.length) return;
    const j = await getJSON('https://api.coingecko.com/api/v3/simple/price?ids=' + assets.map(a => encodeURIComponent(a.cg)).join(',') + '&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true');
    for (const a of assets) {
      const r = j[a.cg];
      if (r && r.usd > 0) this.put(a.sym, { usd: r.usd, chg: r.usd_24h_change != null ? r.usd_24h_change / 100 : null, asof: r.last_updated_at ? r.last_updated_at * 1000 : null });
      else this.miss.add(a.sym);
    }
  }
});

const MEMPOOL_FIAT = ['EUR', 'GBP', 'CAD', 'CHF', 'AUD', 'JPY'];
source('mempool', {
  name: 'mempool.space', short: 'MEMPOOL', cls: ['crypto'], only: ['BTC'], url: 'https://mempool.space', every: () => 60000,
  canDirect: (b, q) => b.sym === 'BTC' && MEMPOOL_FIAT.includes(q.sym),
  async fetch() {
    const j = await getJSON('https://mempool.space/api/v1/prices'), asof = j.time ? j.time * 1000 : null;
    if (j.USD > 0) this.put('BTC', { usd: j.USD, asof });
    for (const k of MEMPOOL_FIAT) if (j[k] > 0) this.d['BTC/' + k] = { px: j[k], chg: null, hi: null, lo: null, t: Date.now() };
  }
});

source('goldapi', {
  name: 'gold-api.com', short: 'GOLD-API', cls: ['metal'], only: ['XAU', 'XAG', 'XPT', 'XPD', 'HG'], url: 'https://gold-api.com', every: () => 60000,
  async fetch(assets) {
    let ok = 0, last = null;
    await pool(assets, 2, async a => {
      try { const j = await getJSON('https://api.gold-api.com/price/' + a.sym); if (!(j.price > 0)) throw missErr(); this.put(a.sym, { usd: j.price, asof: Date.parse(j.updatedAt) || null }); ok++; }
      catch (e) { if (e.miss) this.miss.add(a.sym); else last = e; }
    });
    if (!ok && last) throw last;
  }
});

source('frankfurter', {
  name: 'Frankfurter (ECB daily)', short: 'ECB', cls: ['fiat'], url: 'https://frankfurter.dev', every: () => 30 * 60000,
  async fetch(assets) {
    const start = new Date(Date.now() - 9 * 864e5).toISOString().slice(0, 10);
    const j = await getJSON('https://api.frankfurter.dev/v1/' + start + '..?base=USD');
    const days = Object.keys(j.rates || {}).sort(); if (!days.length) throw new Error('no data');
    const cur = j.rates[days[days.length - 1]], prev = days.length > 1 ? j.rates[days[days.length - 2]] : null;
    this.list = new Set(Object.keys(cur));
    const asof = Date.parse(days[days.length - 1] + 'T15:00:00Z');
    for (const a of assets) if (cur[a.sym] > 0) this.put(a.sym, { usd: 1 / cur[a.sym], chg: prev && prev[a.sym] > 0 ? prev[a.sym] / cur[a.sym] - 1 : null, asof });
  }
});

source('erapi', {
  name: 'ExchangeRate-API (daily)', short: 'ER-API', cls: ['fiat'], url: 'https://www.exchangerate-api.com', every: () => 60 * 60000,
  async loadList() { const j = await getJSON('https://open.er-api.com/v6/latest/USD'); if (j.result !== 'success') throw new Error('no data'); this.rates = j.rates; this.asof = j.time_last_update_unix ? j.time_last_update_unix * 1000 : null; this.list = new Set(Object.keys(j.rates)); },
  async fetch(assets) { await this.loadList(); for (const a of assets) if (this.rates[a.sym] > 0) this.put(a.sym, { usd: 1 / this.rates[a.sym], asof: this.asof }); }
});

source('fawaz', {
  name: 'Currency-API (daily)', short: 'CURR-API', cls: ['fiat', 'metal'], only: null, url: 'https://github.com/fawazahmed0/exchange-api', every: () => 6 * 3600000,
  covers(a) { return (a.cls === 'fiat' || ['XAU', 'XAG', 'XPT', 'XPD'].includes(a.sym)) && !a.of && a.sym !== 'USD' && !this.miss.has(a.sym) && (!this.list || this.list.has(a.sym)); },
  async fetch(assets) {
    const j = await getJSON('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
    const r = j.usd || {}, asof = Date.parse(j.date + 'T00:00:00Z') || null;
    this.list = new Set(Object.keys(r).map(k => k.toUpperCase()));
    for (const a of assets) { const v = r[a.sym.toLowerCase()]; if (v > 0) this.put(a.sym, { usd: 1 / v, asof }); }
  }
});

source('finnhub', {
  name: 'Finnhub (stocks)', short: 'FINNHUB', cls: ['stock'], url: 'https://finnhub.io', off: () => !state.key, offMsg: 'needs a free API key',
  every: n => Math.max(30000, n * 1500),
  async quote(sym) { return getJSON('https://finnhub.io/api/v1/quote?symbol=' + encodeURIComponent(sym) + '&token=' + encodeURIComponent(state.key)); },
  async fetch(assets) {
    let ok = 0, last = null;
    await pool(assets, 2, async a => {
      try {
        const j = await this.quote(a.sym);
        if (!(j.c > 0)) { this.miss.add(a.sym); return; }
        this.put(a.sym, { usd: j.c, chg: j.dp != null ? j.dp / 100 : null, hi: j.h || null, lo: j.l || null, asof: j.t ? j.t * 1000 : null }); ok++;
      } catch (e) { last = e; }
    });
    if (!ok && last) throw last;
  }
});

/* Which sources are used when an entry is left on "Auto". */
const AUTO = { crypto: ['coinbase', 'kraken', 'binance', 'gemini', 'coingecko', 'mempool'], fiat: ['frankfurter', 'erapi', 'fawaz', 'coinbase'], metal: ['goldapi', 'fawaz'], stock: ['finnhub'] };
function chosen(a, explicit) {
  const cov = Object.values(S).filter(s => s.covers(a));
  let pick = explicit && explicit.length ? cov.filter(s => explicit.includes(s.id)) : [];
  if (!pick.length) {
    const ok = (AUTO[a.cls] || []).map(id => S[id]).filter(s => s && s.covers(a) && !s.off() && s.fail < 2);
    pick = ok.slice(0, a.cls === 'crypto' ? 2 : 1);
    if (!pick.length) pick = cov.filter(s => !s.off()).slice(0, 1);
    if (!pick.length) pick = cov.slice(0, 1);
  }
  return pick;
}
function directSources(b, q, explicit) {
  if (b.of || q.of || q.sym === 'USD' || b.sym === 'USD') return [];
  const key = b.sym + '/' + q.sym;
  return chosen(b, explicit).filter(s => s.canDirect(b, q) && !(s.d[key] && s.d[key].none));
}
const activeItems = () => state.items.filter(i => i.on);

/* What every source needs to fetch for the current rotation. */
function needs() {
  const m = new Map();
  const add = (s, kind, v) => { if (!m.has(s.id)) m.set(s.id, { assets: new Set(), pairs: new Set() }); m.get(s.id)[kind].add(v); };
  const leg = (a, explicit) => { const r = a.of ? A[a.of] : a; if (r && r.sym !== 'USD') chosen(r, explicit).forEach(s => add(s, 'assets', r.sym)); };
  for (const it of activeItems()) {
    if (it.type === 'price') {
      const b = A[it.base], q = A[it.quote]; if (!b || !q) continue;
      leg(b, it.sources); leg(q, it.sources);
      directSources(b, q, it.sources).forEach(s => add(s, 'pairs', b.sym + '/' + q.sym));
    } else if (it.type === 'vital' && it.key === 'mcap') leg(A.BTC, []);
  }
  return m;
}

/* Rolling local history, so a 24-hour change can be shown for feeds that do not publish one. */
const HLS = 'homedashboard.hist';
let HIST = {}; try { HIST = JSON.parse(localStorage.getItem(HLS)) || {}; } catch (e) { HIST = {}; }
let histAt = 0;
function sampleHist() {
  const now = Date.now(); if (now - histAt < 15 * 60000) return; histAt = now;
  const syms = new Set(); needs().forEach(n => n.assets.forEach(s => syms.add(s)));
  for (const s of syms) { const l = legUSD(A[s], []); if (!l) continue; (HIST[s] = HIST[s] || []).push([now, l.usd]); HIST[s] = HIST[s].filter(p => now - p[0] < 27 * 3600000); }
  try { localStorage.setItem(HLS, JSON.stringify(HIST)); } catch (e) { /* storage unavailable */ }
}
function histChg(sym, usd) {
  const h = HIST[sym]; if (!h) return null;
  const now = Date.now(); let best = null;
  for (const p of h) { const age = now - p[0]; if (age >= 22 * 3600000 && age <= 26.5 * 3600000 && (!best || Math.abs(age - 864e5) < Math.abs(now - best[0] - 864e5))) best = p; }
  return best ? usd / best[1] - 1 : null;
}

/* US-dollar value of one unit of an asset, as a median across the chosen sources. */
function legUSD(a, explicit) {
  if (!a) return null;
  if (a.sym === 'USD') return { usd: 1, chg: 0, hi: null, lo: null, t: Date.now(), srcs: [] };
  if (a.of) { const f = factorOf(a), l = f == null ? null : legUSD(A[a.of], explicit); return l && Object.assign({}, l, { usd: l.usd * f, hi: l.hi && l.hi * f, lo: l.lo && l.lo * f }); }
  let ss = chosen(a, explicit).filter(s => s.q[a.sym]);
  if (!ss.length) ss = Object.values(S).filter(s => s.q[a.sym] && s.cls.includes(a.cls)).slice(0, 1);
  if (!ss.length) return null;
  const qs = ss.map(s => s.q[a.sym]), usd = median(qs.map(q => q.usd));
  const chgs = qs.map(q => q.chg).filter(x => x != null);
  const withHi = qs.find(q => q.hi && q.lo);
  return {
    usd, chg: chgs.length ? median(chgs) : histChg(a.sym, usd),
    hi: withHi ? withHi.hi : null, lo: withHi ? withHi.lo : null,
    t: Math.min(...qs.map(q => q.asof || q.t)), srcs: ss.map(s => s.id)
  };
}
function whyNot(a, explicit) {
  if (!a) return 'UNKNOWN SYMBOL';
  if (a.dyn && factorOf(a) == null) return V.err ? 'MEMPOOL.SPACE ' + V.err.toUpperCase() : 'WAITING FOR BITCOIN SUPPLY';
  const r = a.of ? A[a.of] : a;
  if (r.sym === 'USD') return '';
  if (r.cls === 'stock' && !state.key) return 'STOCKS NEED A FINNHUB KEY - SEE SETTINGS';
  const ss = chosen(r, explicit);
  if (!ss.length) return 'NO SOURCE HAS ' + r.sym;
  const bad = ss.find(s => s.err);
  return bad ? bad.short + ' ' + bad.err.toUpperCase() : '';
}
/* Gold re-cut into bitcoin-sized units: ounces per unit = above-ground gold / number of bitcoins. */
const OZ_PER_TONNE = 1e6 / 31.1034768;
const goldOz = () => Math.max(0, +state.goldTonnes || 0) * OZ_PER_TONNE;
function btcUnits() { if (state.goldUnits === 'cap') return 21e6; const b = tip(); return b ? supplyAt(b.height) : null; }
function factorOf(a) { if (!a.dyn) return a.f; const n = btcUnits(), oz = goldOz(); return n && oz ? oz / n : null; }
function unitInfo(a) {
  const f = factorOf(a); if (f == null) return [];
  const n = btcUnits(), g = legUSD(A.XAU, []), btc = legUSD(A.BTC, []);
  const out = ['ONE UNIT = ' + fmtPlain(f, 2) + ' OZ OF GOLD', fmtPlain(f * 31.1034768 / 1000, 2) + ' KG', fmtPlain(+state.goldTonnes, 0) + ' T OF GOLD / ' + fmtPlain(n, 0) + ' BTC'];
  if (g) out.push('GOLD MARKET CAP $' + fmtPlain(g.usd * goldOz()));
  if (g && btc && Date.now() - btc.t < 300000) out.push('BTC IS ' + (btc.usd / (g.usd * f) * 100).toFixed(2) + '% OF THIS');
  return out;
}
/* The price of an entry: base asset expressed in units of the quote asset. */
function quote(it) {
  const b = A[it.base], q = A[it.quote];
  if (!b || !q) return { err: 'UNKNOWN SYMBOL' };
  if (b.sym === q.sym) return { px: 1, chg: 0, t: Date.now(), kind: '', srcs: [] };
  const key = b.sym + '/' + q.sym;
  const ds = directSources(b, q, it.sources).map(s => [s, s.d[key]]).filter(([, d]) => d && d.px > 0);
  if (ds.length) {
    const chgs = ds.map(([, d]) => d.chg).filter(x => x != null), hl = ds.find(([, d]) => d.hi && d.lo);
    return { px: median(ds.map(([, d]) => d.px)), chg: chgs.length ? median(chgs) : null, hi: hl ? hl[1].hi : null, lo: hl ? hl[1].lo : null,
      t: Math.min(...ds.map(([, d]) => d.t)), kind: 'DIRECT MARKET', srcs: ds.map(([s]) => s.id) };
  }
  const lb = legUSD(b, it.sources), lq = legUSD(q, it.sources);
  if (!lb || !lq) return { err: whyNot(lb ? q : b, it.sources) || 'WAITING FOR DATA' };
  const usdQ = q.sym === 'USD', usdB = b.sym === 'USD';
  return {
    px: lb.usd / lq.usd,
    chg: lb.chg != null && lq.chg != null ? (1 + lb.chg) / (1 + lq.chg) - 1 : null,
    hi: usdQ ? lb.hi : null, lo: usdQ ? lb.lo : null,
    t: Math.min(lb.t, lq.t), kind: usdQ || usdB ? '' : 'DERIVED VIA USD',
    legs: usdQ || usdB ? null : [[b, lb.usd], [q, lq.usd]],
    srcs: uniq([...lb.srcs, ...lq.srcs])
  };
}

/* ================= polling ================= */
let onData = () => {};
function pump(now) {
  for (const [id, n] of needs()) {
    const s = S[id]; if (!s || s.busy || s.off()) continue;
    const fresh = [...n.assets].some(x => !s.q[x] && !s.miss.has(x)) || [...n.pairs].some(k => !s.d[k]);
    if (now < s.next && !(fresh && !s.fail && now - s.last > 2500)) continue;
    runSource(s, n);
  }
}
async function runSource(s, n) {
  s.busy = true; s.last = Date.now();
  const assets = [...n.assets].map(x => A[x]).filter(a => a && !s.miss.has(a.sym));
  const every = s.every(assets.length);
  try { await s.fetch(assets, [...n.pairs]); s.fail = 0; s.err = ''; s.okAt = Date.now(); s.next = Date.now() + every; }
  catch (e) { s.fail++; s.err = errText(e); s.next = Date.now() + Math.min(Math.max(every, 15000) * 2 ** s.fail, 600000); }
  s.busy = false;
  try { sampleHist(); } catch (e) { /* ignore */ }
  onData();
}

/* ================= number formatting ================= */
const MULT = { K: 'THOUSANDS', M: 'MILLIONS', B: 'BILLIONS', T: 'TRILLIONS', Q: 'QUADRILLIONS' };
function decimalsFor(v) {
  if (v >= 10000) return 0;
  if (v >= 10) return 2;
  if (v >= 1) return 4;
  if (v === 0) return 2;
  return Math.min(8, Math.max(4, 3 - Math.floor(Math.log10(v))));
}
/* Fit a number into a fixed number of display cells. With attach=true, separators ride on a digit and cost nothing. */
function fmtNum(x, cells, attach, dec) {
  if (x == null || !isFinite(x)) return { text: '----', mult: '' };
  const neg = x < 0, av = Math.abs(x);
  const width = s => (attach ? s.replace(/[.,]/g, '').length : s.length);
  const build = (v, d, group) => { let [ip, fp] = v.toFixed(d).split('.'); if (group) ip = ip.replace(/\B(?=(\d{3})+$)/g, ','); return (neg ? '-' : '') + ip + (fp ? '.' + fp : ''); };
  /* prefer thousands separators and the wanted decimals; give up decimals first, then separators */
  const fit = (v, want) => { for (let d = want; d >= 0; d--) { const s = build(v, d, true); if (width(s) <= cells) return s; } const s = build(v, 0, false); return width(s) <= cells ? s : null; };
  let s = fit(av, av >= 10000 ? 0 : dec != null ? dec : decimalsFor(av));
  if (s) return { text: s, mult: '' };
  for (const [m, f] of [['Q', 1e15], ['T', 1e12], ['B', 1e9], ['M', 1e6], ['K', 1e3]]) if (av / f >= 1) { s = fit(av / f, 3); if (s) return { text: s, mult: m }; }
  return { text: build(av, 0, false).slice(0, cells), mult: '' };
}
function fmtPlain(x, dec) {
  if (x == null || !isFinite(x)) return '-';
  const v = Math.abs(x);
  if (v >= 1e15) return (x / 1e15).toFixed(2) + 'Q';
  if (v >= 1e12) return (x / 1e12).toFixed(2) + 'T';
  if (v >= 1e9) return (x / 1e9).toFixed(2) + 'B';
  let [ip, fp] = v.toFixed(dec != null ? dec : decimalsFor(v)).split('.'); ip = ip.replace(/\B(?=(\d{3})+$)/g, ',');
  return (x < 0 ? '-' : '') + ip + (fp ? '.' + fp : '');
}
function ageText(t) {
  const d = Date.now() - t;
  if (d < 150000) return 'LIVE';
  if (d < 3600000) return Math.round(d / 60000) + ' MIN AGO';
  if (d < 36 * 3600000) return Math.round(d / 3600000) + ' H AGO';
  return 'AS OF ' + new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
}
const dispOf = sym => (A[sym] ? A[sym].disp : sym);

/* ================= views: what one rotation entry shows ================= */
function priceView(it) {
  const label = dispOf(it.base) + '/' + dispOf(it.quote), r = quote(it);
  if (!(r.px > 0)) return { label, right: '', value: null, info: [r.err || 'WAITING FOR DATA'] };
  const usd = it.quote === 'USD', mark = usd ? '$' : '';
  const info = [];
  if (r.chg != null) info.push({ t: (r.chg >= 0 ? '▲ ' : '▼ ') + Math.abs(r.chg * 100).toFixed(2) + '%', c: r.chg >= 0 ? 'up' : 'dn' });
  if (r.hi && r.lo) { info.push('H ' + mark + fmtPlain(r.hi)); info.push('L ' + mark + fmtPlain(r.lo)); }
  const dynA = [A[it.base], A[it.quote]].find(a => a && a.dyn);
  if (dynA) info.unshift(...unitInfo(dynA));
  else if (r.kind) info.push(r.kind);
  if (r.legs && !dynA) r.legs.forEach(([a, usd]) => info.push(a.disp + ' $' + fmtPlain(usd)));
  info.push(ageText(r.t));
  const names = r.srcs.map(id => S[id].short);
  return { label, right: names.length > 2 ? 'MEDIAN OF ' + names.length : names.join('+'), value: r.px, prefix: mark, info, dir: r.chg == null ? '' : r.chg >= 0 ? 'up' : 'dn' };
}

const _dtf = {};
function dtf(tz, opt) { const k = tz + JSON.stringify(opt); return _dtf[k] || (_dtf[k] = new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: tz }, opt))); }
const LOCAL_TZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } })();
const tzCity = tz => tz.split('/').pop().replace(/_/g, ' ');
function clockView(it) {
  const now = new Date(), p = {};
  try {
    dtf(it.tz, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: it.h12 ? 'h12' : 'h23' }).formatToParts(now).forEach(x => p[x.type] = x.value);
    let off = 'UTC';
    try { off = (dtf(it.tz, { timeZoneName: 'shortOffset' }).formatToParts(now).find(x => x.type === 'timeZoneName') || { value: 'UTC' }).value.replace('GMT', 'UTC'); } catch (e) { /* older browsers */ }
    const hour = it.h12 ? String(+p.hour) : p.hour;
    const date = dtf(it.tz, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now).replace(/,/g, '').toUpperCase();
    return { label: (it.label || tzCity(it.tz)).toUpperCase(), right: off + (it.h12 && p.dayPeriod ? ' ' + p.dayPeriod.toUpperCase().replace(/\./g, '') : ''),
      text: hour + ':' + p.minute + ':' + p.second, alt: hour + ':' + p.minute, info: [date] };
  } catch (e) { return { label: String(it.tz).toUpperCase(), value: null, info: ['UNKNOWN TIME ZONE'] }; }
}

/* ---- Bitcoin network vitals (mempool.space) ---- */
const V = {
  d: {}, at: {}, busy: {}, err: '', okAt: 0, fail: 0,
  ep: {
    blocks: ['https://mempool.space/api/v1/blocks', 45000],
    da: ['https://mempool.space/api/v1/difficulty-adjustment', 300000],
    hash: ['https://mempool.space/api/v1/mining/hashrate/3d', 900000],
    fees: ['https://mempool.space/api/v1/fees/recommended', 60000],
    mp: ['https://mempool.space/api/mempool', 60000]
  }
};
function pumpVitals(now) {
  const need = new Set();
  for (const it of activeItems()) {
    if (it.type === 'vital' && VITALS[it.key]) VITALS[it.key].need.forEach(k => need.add(k));
    else if (it.type === 'price' && state.goldUnits !== 'cap' && [A[it.base], A[it.quote]].some(a => a && a.dyn)) need.add('blocks');
  }
  for (const k of need) {
    if (V.busy[k] || now < (V.at[k] || 0)) continue;
    const [url, every] = V.ep[k]; V.busy[k] = true;
    getJSON(url).then(j => { V.d[k] = j; V.err = ''; V.fail = 0; V.okAt = Date.now(); V.at[k] = Date.now() + every; })
      .catch(e => { V.err = errText(e); V.fail++; V.at[k] = Date.now() + Math.min(30000 * 2 ** V.fail, 600000); })
      .finally(() => { V.busy[k] = false; onData(); });
  }
}
const HALVING = 210000;
const subsidyAt = h => { const era = Math.floor(h / HALVING); return era >= 33 ? 0 : Math.floor(50e8 / 2 ** era) / 1e8; };
function supplyAt(h) { let s = 0, sub = 50e8, left = h + 1; while (left > 0 && sub > 0) { const n = Math.min(left, HALVING); s += n * sub; left -= n; sub = Math.floor(sub / 2); } return s / 1e8; }
const tip = () => (Array.isArray(V.d.blocks) && V.d.blocks[0]) || null;
const shortDate = ms => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
const sinceText = s => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60, z = n => String(n).padStart(2, '0'); return h ? h + ':' + z(m) + ':' + z(x) : z(m) + ':' + z(x); };
const SRC_MP = 'MEMPOOL.SPACE';
const VITALS = {
  height: { name: 'Block height', need: ['blocks'], view() { const b = tip(); if (!b) return null;
    const pool = b.extras && b.extras.pool && b.extras.pool.name;
    return { label: 'BLOCK HEIGHT', value: b.height, dec: 0, info: ['LAST BLOCK ' + Math.max(0, Math.round((Date.now() / 1000 - b.timestamp) / 60)) + ' MIN AGO', b.tx_count != null ? fmtPlain(b.tx_count, 0) + ' TXS' : '', pool ? 'MINED BY ' + String(pool).toUpperCase().slice(0, 18) : ''] }; } },
  since: { name: 'Time since last block', need: ['blocks'], view() { const b = tip(); if (!b) return null;
    const s = Date.now() / 1000 - b.timestamp, t = sinceText(s);
    return { label: 'SINCE LAST BLOCK', text: t, alt: t, info: ['HEIGHT ' + fmtPlain(b.height, 0), 'TARGET 10:00'] }; } },
  difficulty: { name: 'Difficulty', need: ['blocks', 'da'], view() { const b = tip(), da = V.d.da; if (!b) return null;
    return { label: 'DIFFICULTY', value: b.difficulty, info: da ? ['NEXT ' + (da.difficultyChange >= 0 ? '+' : '') + da.difficultyChange.toFixed(2) + '%', 'IN ' + fmtPlain(da.remainingBlocks, 0) + ' BLOCKS'] : [] }; } },
  nextadj: { name: 'Next difficulty adjustment (%)', need: ['da'], view() { const da = V.d.da; if (!da) return null;
    return { label: 'NEXT DIFFICULTY ADJUSTMENT %', value: da.difficultyChange, dec: 2, dir: da.difficultyChange >= 0 ? 'up' : 'dn',
      info: ['IN ' + fmtPlain(da.remainingBlocks, 0) + ' BLOCKS', '~' + shortDate(da.estimatedRetargetDate), 'PREVIOUS ' + (da.previousRetarget >= 0 ? '+' : '') + (+da.previousRetarget).toFixed(2) + '%'] }; } },
  retarget: { name: 'Blocks until difficulty retarget', need: ['da'], view() { const da = V.d.da; if (!da) return null;
    return { label: 'BLOCKS TO RETARGET', value: da.remainingBlocks, dec: 0, info: [(+da.progressPercent).toFixed(1) + '% THROUGH EPOCH', '~' + shortDate(da.estimatedRetargetDate)] }; } },
  hashrate: { name: 'Network hashrate (EH/s)', need: ['hash'], view() { const h = V.d.hash; if (!h || !h.currentHashrate) return null;
    return { label: 'HASHRATE EH/S', value: h.currentHashrate / 1e18, dec: 1, info: ['3-DAY AVERAGE', 'DIFFICULTY ' + fmtPlain(h.currentDifficulty)] }; } },
  subsidy: { name: 'Block subsidy (BTC)', need: ['blocks'], view() { const b = tip(); if (!b) return null;
    const paid = b.extras && b.extras.reward;
    return { label: 'BLOCK SUBSIDY BTC', value: subsidyAt(b.height), dec: 3, info: ['HALVING EPOCH ' + (Math.floor(b.height / HALVING) + 1), paid ? 'LAST BLOCK PAID ' + (paid / 1e8).toFixed(4) + ' BTC WITH FEES' : ''] }; } },
  halving: { name: 'Blocks until halving', need: ['blocks'], view() { const b = tip(); if (!b) return null;
    const left = HALVING - b.height % HALVING;
    return { label: 'BLOCKS TO HALVING', value: left, dec: 0, info: ['~' + new Date(Date.now() + left * 600000).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase(), 'THEN ' + subsidyAt(b.height + left) + ' BTC PER BLOCK'] }; } },
  supply: { name: 'Bitcoin supply issued', need: ['blocks'], view() { const b = tip(); if (!b) return null;
    const s = supplyAt(b.height);
    return { label: 'BTC ISSUED', value: s, dec: 0, info: [(s / 21e6 * 100).toFixed(3) + '% OF 21 MILLION', fmtPlain(21e6 - s, 0) + ' LEFT TO MINE'] }; } },
  fees: { name: 'Fee rate (sat/vB)', need: ['fees'], view() { const f = V.d.fees; if (!f) return null;
    return { label: 'NEXT-BLOCK FEE SAT/VB', value: f.fastestFee, dec: 0, info: ['30 MIN ' + f.halfHourFee, '1 HOUR ' + f.hourFee, 'ECONOMY ' + f.economyFee] }; } },
  mempool: { name: 'Mempool transactions', need: ['mp'], view() { const m = V.d.mp; if (!m) return null;
    return { label: 'MEMPOOL TRANSACTIONS', value: m.count, dec: 0, info: [(m.vsize / 1e6).toFixed(1) + ' MVB WAITING', '~' + Math.ceil(m.vsize / 1e6) + ' BLOCKS OF BACKLOG'] }; } },
  mcap: { name: 'Bitcoin market cap (USD)', need: ['blocks'], view() { const b = tip(), l = legUSD(A.BTC, []); if (!b || !l) return null;
    return { label: 'BTC MARKET CAP USD', value: supplyAt(b.height) * l.usd, prefix: '$', info: ['BTC $' + fmtPlain(l.usd), fmtPlain(supplyAt(b.height), 0) + ' BTC ISSUED'] }; } }
};
function vitalView(it) {
  const d = VITALS[it.key]; if (!d) return { label: 'UNKNOWN', value: null, info: [] };
  let v = null; try { v = d.view(); } catch (e) { v = null; }
  if (!v) return { label: d.name.toUpperCase(), right: SRC_MP, value: null, info: [V.err ? SRC_MP + ' ' + V.err.toUpperCase() : 'WAITING FOR DATA'] };
  v.right = SRC_MP; v.info = (v.info || []).filter(Boolean);
  return v;
}
const viewOf = it => it.type === 'price' ? priceView(it) : it.type === 'clock' ? clockView(it) : vitalView(it);
