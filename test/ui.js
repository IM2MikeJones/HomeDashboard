// Drives the settings panel the way a person would: add prices, a custom ticker, a stock, a clock; check views and persistence.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const file = 'file://' + path.resolve(__dirname, '..', 'home-dashboard.html');
const shots = path.resolve(__dirname, 'shots');
fs.mkdirSync(shots, { recursive: true });
const mockSrc = fs.readFileSync(path.join(__dirname, 'run.js'), 'utf8');
// reuse the mock() from run.js
const mock = new Function('now', 'kr', 'stat', mockSrc.slice(mockSrc.indexOf('function mock(url)'), mockSrc.indexOf('(async () =>')) + '; return mock;')(
  Math.floor(Date.now() / 1000),
  (last, open, hi, lo) => ({ a: [String(last)], b: [String(last)], c: [String(last), '0.1'], v: ['1', '2'], p: ['1', '2'], t: [1, 2], l: [String(lo), String(lo)], h: [String(hi), String(hi)], o: String(open) }),
  (open, high, low, last) => ({ open: String(open), high: String(high), low: String(low), last: String(last), volume: '1' }));

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !/status of 40[14]/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await ctx.route(/^https?:\/\//, route => {
    const j = mock(route.request().url()), status = j.__status || 200; delete j.__status;
    route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(j) });
  });
  await page.goto(file);
  await page.waitForTimeout(1500);
  const view = () => page.evaluate(() => { const v = window.HD.Disp.v; return JSON.stringify({ label: v.label, right: v.right, value: v.value, text: v.text, info: (v.info || []).map(s => typeof s === 'string' ? s : s.t) }); });
  const msg = id => page.$eval(id, e => e.textContent);

  await page.click('#bGear'); await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, 'panel.png') });
  console.log('summary:', await msg('#msSum'));

  // 1. stock without a key
  await page.fill('#apBase', 'PLTR'); await page.click('#apAdd'); await page.waitForTimeout(600);
  console.log('PLTR no key ->', await msg('#apMsg'));
  // 2. key, then NVDA in gold
  await page.fill('#fhKey', 'testkey'); await page.dispatchEvent('#fhKey', 'change');
  await page.fill('#apBase', 'nvda'); await page.fill('#apQuote', 'gold'); await page.waitForTimeout(100);
  console.log('hint:', await msg('#apHint'), '| chips:', await page.$$eval('#apSrc .chip', els => els.map(e => e.textContent).join(',')));
  await page.click('#apAdd'); await page.waitForTimeout(1800);
  console.log('NVDA/gold ->', await msg('#apMsg'), await view());
  // 3. custom stock and custom crypto
  await page.fill('#apBase', 'PLTR'); await page.click('#apAdd'); await page.waitForTimeout(1800);
  console.log('PLTR ->', await msg('#apMsg'), await view());
  await page.fill('#apBase', 'PEPE'); await page.fill('#apQuote', 'sats'); await page.click('#apAdd'); await page.waitForTimeout(1800);
  console.log('PEPE/sats ->', await msg('#apMsg'), await view());
  // 4. explicit multi-source
  await page.fill('#apBase', 'BTC'); await page.fill('#apQuote', 'EUR'); await page.waitForTimeout(100);
  for (const name of ['Kraken', 'mempool.space']) await page.click(`#apSrc .chip:text-is("${name}")`);
  await page.click('#apAdd'); await page.waitForTimeout(1800);
  console.log('BTC/EUR kraken+mempool ->', await msg('#apMsg'), await view());
  // 5. bad symbol
  await page.fill('#apBase', 'ZZZZZ9'); await page.fill('#apQuote', ''); await page.click('#apAdd'); await page.waitForTimeout(900);
  console.log('bad ->', await msg('#apMsg'));
  // 6. clock
  await page.fill('#acTz', 'tokyo'); await page.check('#acH12'); await page.click('#acAdd'); await page.waitForTimeout(400);
  console.log('clock ->', await msg('#acMsg'), await view());
  await page.fill('#acTz', 'Mars/Olympus'); await page.click('#acAdd'); await page.waitForTimeout(200);
  console.log('bad clock ->', await msg('#acMsg'));
  await page.screenshot({ path: path.join(shots, 'panel2.png') });

  // 7. every vital
  await page.evaluate(() => { window.HD.state.paused = true; window.HD.state.items.forEach(i => { if (i.type === 'vital') i.on = true; }); });
  await page.waitForTimeout(2500);
  const vit = await page.evaluate(() => window.HD.state.items.filter(i => i.type === 'vital').map(i => { const v = window.HD.viewOf(i); const f = v.text != null ? v.text : window.HD.fmtNum(v.value, 10, 0, v.dec); return v.label + ' = ' + (f.text || f) + (f.mult ? ' ' + f.mult : '') + ' | ' + (v.info || []).map(s => typeof s === 'string' ? s : s.t).join(' ; '); }));
  vit.forEach(l => console.log('  ', l));

  // 8. persistence
  await page.reload(); await page.waitForTimeout(1200);
  console.log('after reload:', await page.evaluate(() => JSON.stringify({ key: window.HD.state.key, custom: window.HD.state.custom.map(c => c.sym + ':' + c.cls), first: window.HD.state.items.slice(0, 5).map(i => i.type === 'price' ? i.base + '/' + i.quote : i.type) })));

  // 9. weather module + layouts
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.click('#bGear'); await page.waitForTimeout(300);
  await page.fill('#wxLoc', 'Los Angeles'); await page.selectOption('#wxUnits', 'f'); await page.click('#wxApply');
  await page.waitForTimeout(1200);
  console.log('weather apply ->', await msg('#wxMsg'), await page.$eval('#wxPlace', e => e.textContent), 'days', await page.$$eval('#wxDays .wx-day', els => els.length));
  await page.click('#wxDays .wx-day:nth-child(3)'); await page.waitForTimeout(200);
  console.log('hourly after day 3 (expect 12):', await page.$$eval('#wxHours .wx-hour', els => els.length));
  await page.click('#layoutRow [data-layout="right"]'); await page.waitForTimeout(400);
  console.log('layout right class:', await page.$eval('#stage', e => e.className));
  await page.screenshot({ path: path.join(shots, 'weather-right.png') });
  await page.click('#layoutRow [data-layout="below"]'); await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, 'weather-below.png') });
  await page.click('#pClose');

  // 10. a clock and a vital in a few themes, plus a narrow window and few digits
  const show = async (theme, pick, name, extra) => {
    await page.evaluate(([t, p, x]) => { const s = window.HD.state; s.theme = t; s.paused = true; Object.assign(s, x || {}); s.items.forEach(i => i.on = false); const it = s.items.find(new Function('i', 'return ' + p)); it.on = true; window.HD.Disp.build(); window.HD.frame(); window.HD.renderWeather(); }, [theme, pick, extra]);
    await page.waitForTimeout(1300); await page.screenshot({ path: path.join(shots, name + '.png') });
  };
  await show('flip', "i.type==='clock'&&i.tz==='Asia/Tokyo'", 'x-flip-clock');
  await show('nixie', "i.type==='clock'&&i.tz==='Asia/Tokyo'", 'x-nixie-clock');
  await show('eink', "i.type==='vital'&&i.key==='height'", 'x-eink-height');
  await show('vfd', "i.type==='price'&&i.base==='NVDA'&&i.quote==='XAU'", 'x-vfd-nvda-gold');
  await show('led', "i.type==='vital'&&i.key==='difficulty'", 'x-led-difficulty', { cells: 8 });
  await show('odo', "i.type==='vital'&&i.key==='since'", 'x-odo-since', { cells: 6 });
  await page.setViewportSize({ width: 420, height: 800 });
  await show('dots', "i.type==='price'&&i.base==='BTC'&&i.quote==='USD'", 'x-dots-narrow', { cells: 10 });
  console.log('errors', JSON.stringify(errors.slice(0, 10)));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
