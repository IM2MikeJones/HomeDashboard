// Opens the built file from disk in headless Chrome with mocked feeds, checks the maths and screenshots every theme.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const file = 'file://' + path.resolve(__dirname, '..', 'home-dashboard.html');
const shots = path.resolve(__dirname, 'shots');
fs.mkdirSync(shots, { recursive: true });

const now = Math.floor(Date.now() / 1000);
const kr = (last, open, hi, lo) => ({ a: [String(last)], b: [String(last)], c: [String(last), '0.1'], v: ['1', '2'], p: ['1', '2'], t: [1, 2], l: [String(lo), String(lo)], h: [String(hi), String(hi)], o: String(open) });
const stat = (open, high, low, last) => ({ open: String(open), high: String(high), low: String(low), last: String(last), volume: '1' });

function mock(url) {
  const u = new URL(url), p = u.pathname, h = u.hostname;
  if (h === 'api.coinbase.com') return { data: { currency: 'USD', rates: { BTC: String(1 / 75608), ETH: String(1 / 2224.98), SOL: String(1 / 89.5), EUR: '0.8930', JPY: '157.81', GBP: '0.7480', PEPE: '250000' } } };
  if (h === 'api.exchange.coinbase.com') {
    const m = p.match(/products\/(.+)\/stats/); const t = { 'BTC-USD': stat(80429.72, 80700, 75035.1, 75608), 'ETH-USD': stat(2412.3, 2420, 2201, 2224.98), 'SOL-USD': stat(95, 96, 88, 89.5), 'ETH-BTC': stat(0.030123, 0.03016, 0.029274, 0.029439), 'BTC-EUR': stat(71800, 72000, 67000, 67520) };
    return m && t[m[1]] ? t[m[1]] : { __status: 404, message: 'NotFound' };
  }
  if (h === 'api.kraken.com') {
    const pairs = u.searchParams.get('pair').split(','); const t = { XBTUSD: ['XXBTZUSD', kr(75616, 80300, 80707, 75100)], ETHUSD: ['XETHZUSD', kr(2225.5, 2410, 2421, 2200)], SOLUSD: ['SOLUSD', kr(89.6, 95, 96, 88)], ETHXBT: ['XETHXXBT', kr(0.029451, 0.0301, 0.03015, 0.02928)], XBTEUR: ['XXBTZEUR', kr(67530, 71700, 72010, 67010)] };
    if (pairs.some(x => !t[x])) return { error: ['EQuery:Unknown asset pair'], result: {} };
    const result = {}; pairs.forEach(x => result[t[x][0]] = t[x][1]); return { error: [], result };
  }
  if (h === 'api.coingecko.com') return p.includes('search') ? { coins: [{ id: 'pepe', name: 'Pepe', symbol: 'PEPE', market_cap_rank: 45 }] } : { bitcoin: { usd: 75747, usd_24h_change: -5.81, last_updated_at: now }, pepe: { usd: 0.000004, usd_24h_change: 3.2, last_updated_at: now } };
  if (h === 'api.gold-api.com') { const s = p.split('/').pop(); const t = { XAU: 4042.1, XAG: 52.56, XPT: 1519, XPD: 1019, HG: 6.33 }; return t[s] ? { name: s, price: t[s], symbol: s, updatedAt: new Date().toISOString() } : { __status: 404, error: 'Symbol not found' }; }
  if (h === 'api.frankfurter.dev') return { amount: 1, base: 'USD', rates: { '2026-11-04': { EUR: 0.8950, JPY: 158.2, GBP: 0.75 }, '2026-11-05': { EUR: 0.8930, JPY: 157.8, GBP: 0.748 } } };
  if (h === 'open.er-api.com') return { result: 'success', time_last_update_unix: now - 7200, rates: { USD: 1, EUR: 0.893, JPY: 157.8, GBP: 0.748, NGN: 1500 } };
  if (h === 'finnhub.io') { if (u.searchParams.get('token') !== 'testkey') return { __status: 401, error: 'Please use an API key.' }; if (p.includes('search')) return { result: [{ symbol: 'PLTR', description: 'PALANTIR TECHNOLOGIES INC' }] }; const t = { NVDA: 187.32, PLTR: 160.5 }; const c = t[u.searchParams.get('symbol')] || 0; return { c, d: 1.2, dp: 0.64, h: c * 1.01, l: c * 0.98, o: c, pc: c - 1.2, t: c ? now - 3600 * 5 : 0 }; }
  if (h === 'mempool.space') {
    if (p.endsWith('/v1/prices')) return { time: now, USD: 75802, EUR: 67712, GBP: 56652, CAD: 106372, CHF: 61962, AUD: 109732, JPY: 11991762 };
    if (p.endsWith('/v1/blocks')) return [{ id: 'x', height: 974758, timestamp: now - 431, difficulty: 148364561003867.4, tx_count: 3312, extras: { reward: 314452915, pool: { name: 'F2Pool' } } }];
    if (p.endsWith('difficulty-adjustment')) return { progressPercent: 51.09, difficultyChange: -2.8257, estimatedRetargetDate: Date.now() + 609393356, remainingBlocks: 986, previousRetarget: 5.5392 };
    if (p.includes('hashrate')) return { hashrates: [], difficulty: [], currentHashrate: 1.030943803860316e21, currentDifficulty: 148364561003867.4 };
    if (p.endsWith('fees/recommended')) return { fastestFee: 3, halfHourFee: 2, hourFee: 1, economyFee: 1, minimumFee: 1 };
    if (p.endsWith('/api/mempool')) return { count: 44907, vsize: 13698424, total_fee: 1652587 };
  }
  if (h === 'geocoding-api.open-meteo.com') {
    const name = (u.searchParams.get('name') || '').toLowerCase();
    if (!name || name.includes('zzzz')) return { results: [] };
    return { results: [{ id: 1, name: 'Los Angeles', latitude: 34.05, longitude: -118.24, country_code: 'US', admin1: 'California' }] };
  }
  if (h === 'api.open-meteo.com') {
    const days = [], hours = [];
    const base = new Date(); base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base.getTime() + i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      days.push(iso);
      for (let hr = 0; hr < 24; hr++) hours.push(iso + 'T' + String(hr).padStart(2, '0') + ':00');
    }
    const daily = {
      time: days, weathercode: [0, 2, 61, 3, 71, 95, 1],
      temperature_2m_max: [72, 70, 65, 68, 55, 60, 71], temperature_2m_min: [55, 54, 50, 52, 40, 45, 53],
      precipitation_sum: [0, 0.2, 5.1, 0, 2.3, 8, 0], precipitation_probability_max: [5, 20, 80, 10, 60, 90, 0],
      windspeed_10m_max: [8, 12, 18, 10, 15, 22, 9], winddirection_10m_dominant: [270, 250, 200, 180, 90, 45, 300]
    };
    const hourly = {
      time: hours,
      weathercode: hours.map((_, i) => [0, 2, 61, 3][i % 4]),
      temperature_2m: hours.map((_, i) => 50 + (i % 24)),
      precipitation_probability: hours.map((_, i) => (i % 10) * 10),
      windspeed_10m: hours.map((_, i) => 5 + (i % 8)),
      winddirection_10m: hours.map((_, i) => (i * 15) % 360)
    };
    if (u.searchParams.has('daily') && !u.searchParams.has('hourly')) return { latitude: 34.05, longitude: -118.24, timezone: 'America/Los_Angeles', daily };
    if (u.searchParams.has('hourly') && !u.searchParams.has('daily')) return { latitude: 34.05, longitude: -118.24, timezone: 'America/Los_Angeles', hourly };
    return { latitude: 34.05, longitude: -118.24, timezone: 'America/Los_Angeles', daily, hourly };
  }
  return { __status: 404 };
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 760 } });
  const errors = [], calls = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.route(/^https?:\/\//, route => {
    const url = route.request().url(); calls.push(url.replace(/token=[^&]+/, 'token=…'));
    const j = mock(url), status = j.__status || 200; delete j.__status;
    route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(j) });
  });
  await page.goto(file);
  await page.waitForTimeout(2500);

  const only = process.argv[2];
  const q = async (base, quote, sources) => page.evaluate(([b, q, s]) => { const r = window.HD.quote({ base: b, quote: q, sources: s || [] }); return { px: r.px, chg: r.chg, kind: r.kind, srcs: r.srcs, err: r.err }; }, [base, quote, sources]);
  console.log('BTC/USD', JSON.stringify(await q('BTC', 'USD')));
  console.log('BTC/ETH', JSON.stringify(await q('BTC', 'ETH')));
  console.log('BTC/XAU', JSON.stringify(await q('BTC', 'XAU')));
  console.log('EUR/USD', JSON.stringify(await q('EUR', 'USD')));
  console.log('XAU/USD', JSON.stringify(await q('XAU', 'USD')));
  console.log('fmt', JSON.stringify(await page.evaluate(() => [[75608, 10, 0], [75608, 10, 1], [0.029439, 10, 0], [1.48364561e14, 10, 0], [1.5e12, 8, 1], [-2.8257, 10, 1, 2], [974758, 6, 0, 0], [12345678.9, 6, 0], [0.00001321, 10, 0], [999.999, 6, 0]].map(a => window.HD.fmtNum(...a).text + '|' + window.HD.fmtNum(...a).mult))));

  const themes = await page.evaluate(() => Object.keys(window.HD.Disp.th ? { flip: 1, nixie: 1, eink: 1, led: 1, vfd: 1, dots: 1, lcd: 1, flipdot: 1, crt: 1, odo: 1, bulbs: 1, neon: 1, numi: 1, edge: 1 } : {}));
  for (const t of themes) {
    if (only && only !== t && only !== 'all') continue;
    await page.evaluate(id => { window.HD.state.theme = id; window.HD.state.paused = true; window.HD.Disp.build(); window.HD.frame(); }, t);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(shots, t + '.png') });
  }
  console.log('errors', JSON.stringify(errors.slice(0, 10)));
  console.log('hosts', JSON.stringify([...new Set(calls.map(c => new URL(c).hostname))]));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
