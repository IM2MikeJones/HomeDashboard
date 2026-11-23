/* ================= weather module (Open-Meteo) ================= */
const WX = {
  data: null, day: 0, busy: false, err: '', next: 0, okAt: 0, fail: 0,
  every: 20 * 60000, returnT: 0
};

/* After the user views a day other than Today, drift back to Today once the configured delay elapses. */
function scheduleWxReturn() {
  clearTimeout(WX.returnT);
  const delay = Math.max(0, +state.weatherReturn || 0);
  if (WX.day !== 0 && delay > 0) {
    WX.returnT = setTimeout(() => { WX.day = 0; renderWeather(); }, delay * 1000);
  }
}

const WX_ICON = {
  0: 'sun', 1: 'sun', 2: 'cloud-sun', 3: 'cloud',
  45: 'fog', 48: 'fog',
  51: 'rain', 53: 'rain', 55: 'rain', 56: 'rain', 57: 'rain',
  61: 'rain', 63: 'rain', 65: 'rain', 66: 'rain', 67: 'rain',
  71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow',
  80: 'rain', 81: 'rain', 82: 'rain',
  85: 'snow', 86: 'snow',
  95: 'storm', 96: 'storm', 99: 'storm'
};

function wxSvg(kind) {
  const stroke = 'currentColor', fill = 'none';
  const common = `fill="${fill}" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
  if (kind === 'sun') return `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6" ${common}/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M7 7l3 3M22 22l3 3M7 25l3-3M22 10l3-3" ${common}/></svg>`;
  if (kind === 'cloud-sun') return `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="12" r="4.5" ${common}/><path d="M11 3v2.5M3 12h2.5M6 6l1.8 1.8M6 18l1.8-1.8"/><path d="M12 22h10a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.4 2.2A4.5 4.5 0 0 0 12 22z" ${common}/></svg>`;
  if (kind === 'fog') return `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 12h16M6 16h20M9 20h14" ${common}/></svg>`;
  if (kind === 'rain') return `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 16h12a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.5 2.3A4.5 4.5 0 0 0 10 16z" ${common}/><path d="M12 20l-1.5 4M16 20l-1.5 4M20 20l-1.5 4" ${common}/></svg>`;
  if (kind === 'snow') return `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 15h12a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.5 2.3A4.5 4.5 0 0 0 10 15z" ${common}/><path d="M12 20v4M16 19v5M20 20v4M11 22h2M15 21h2M19 22h2" ${common}/></svg>`;
  if (kind === 'storm') return `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 15h12a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.5 2.3A4.5 4.5 0 0 0 10 15z" ${common}/><path d="M15 17l-3 6h4l-2 5 7-8h-4l3-3z" ${common}/></svg>`;
  return `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 20h12a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.5 2.3A4.5 4.5 0 0 0 10 20z" ${common}/></svg>`;
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
function windDir(deg) {
  if (deg == null || !isFinite(deg)) return '';
  return COMPASS[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}
function wxTemp(n) { return n == null || !isFinite(n) ? '—' : Math.round(n) + '°'; }
function wxPrecip(prob, sum, units) {
  const bits = [];
  if (prob != null && isFinite(prob)) bits.push(Math.round(prob) + '%');
  if (sum != null && isFinite(sum) && sum > 0) bits.push(units === 'c' ? sum.toFixed(1) + ' mm' : (sum / 25.4).toFixed(2) + ' in');
  return bits.length ? bits.join(' · ') : '0%';
}
function wxWind(speed, deg, units) {
  if (speed == null || !isFinite(speed)) return '—';
  const u = units === 'c' ? ' km/h' : ' mph';
  const d = windDir(deg);
  return Math.round(speed) + u + (d ? ' ' + d : '');
}
function dayLabel(iso, i) {
  if (i === 0) return 'Today';
  if (i === 1) return 'Tomorrow';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }).replace(',', '');
}
function hourLabel(iso, isNow) {
  if (isNow) return 'Now';
  const d = new Date(iso);
  const h = d.getHours();
  if (h === 0) return 'Midnight';
  const h12 = ((h + 11) % 12) + 1;
  return h12 + (h < 12 ? ' AM' : ' PM');
}

function applyLayout() {
  const st = $('#stage');
  if (!st) return;
  const layout = state.layout === 'right' ? 'right' : 'below';
  const themeCls = [...st.classList].filter(c => c.startsWith('t-') || c.startsWith('a-')).join(' ');
  st.className = (themeCls + ' layout-' + layout).trim();
}

async function resolveWeatherPlace(query) {
  const q = String(query || '').trim();
  if (!q) throw new Error('Type a city or place name');
  const j = await getJSON('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(q) + '&count=1&language=en&format=json');
  const hit = (j.results || [])[0];
  if (!hit) throw new Error('No place found for "' + q.slice(0, 40) + '"');
  const parts = [hit.name, hit.admin1, hit.country_code].filter(Boolean);
  return { lat: hit.latitude, lon: hit.longitude, label: parts.join(', '), place: q };
}

async function fetchWeather() {
  if (!(state.weatherLat != null && state.weatherLon != null)) {
    WX.data = null; WX.err = '';
    renderWeather();
    return;
  }
  if (WX.busy) return;
  WX.busy = true;
  WX.err = '';
  renderWeather();
  const units = state.weatherUnits === 'c' ? 'c' : 'f';
  const temp = units === 'c' ? 'celsius' : 'fahrenheit';
  const wind = units === 'c' ? 'kmh' : 'mph';
  /* Daily first (small), then hourly — keeps something on screen if hourly is slow. */
  const base = 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(state.weatherLat) +
    '&longitude=' + encodeURIComponent(state.weatherLon) +
    '&timezone=auto&forecast_days=7&temperature_unit=' + temp + '&windspeed_unit=' + wind + '&precipitation_unit=mm';
  const dailyUrl = base + '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,winddirection_10m_dominant';
  const hourUrl = base + '&hourly=weathercode,temperature_2m,precipitation_probability,windspeed_10m,winddirection_10m';
  try {
    const daily = await getJSON(dailyUrl, { timeout: 20000 });
    WX.data = { daily: daily.daily, hourly: null, timezone: daily.timezone };
    WX.err = ''; WX.fail = 0; WX.okAt = Date.now();
    if (WX.day < 0 || WX.day > 6) WX.day = 0;
    renderWeather();
    try {
      const hourly = await getJSON(hourUrl, { timeout: 25000 });
      WX.data.hourly = hourly.hourly;
      WX.okAt = Date.now();
      renderWeather();
    } catch (he) {
      WX.err = 'Daily ok · hourly ' + errText(he);
      renderWeather();
    }
    WX.next = Date.now() + WX.every;
  } catch (e) {
    WX.fail++; WX.err = errText(e);
    WX.next = Date.now() + Math.min(15000 * (2 ** Math.min(WX.fail, 4)), 120000);
    renderWeather();
  } finally { WX.busy = false; }
}

function pumpWeather(now) {
  if (!(state.weatherLat != null && state.weatherLon != null)) return;
  if (WX.busy || now < (WX.next || 0)) return;
  fetchWeather();
}

function hoursForDay(dayIso) {
  const h = WX.data && WX.data.hourly; if (!h || !h.time) return [];
  const out = [];
  for (let i = 0; i < h.time.length; i++) if (h.time[i].slice(0, 10) === dayIso) out.push(i);
  return out;
}

function renderWeather() {
  const place = $('#wxPlace'), status = $('#wxStatus'), days = $('#wxDays'), hours = $('#wxHours');
  if (!place || !days || !hours) return;
  const units = state.weatherUnits === 'c' ? 'c' : 'f';
  place.textContent = state.weatherLabel || 'Weather';
  days.textContent = '';
  hours.textContent = '';
  if (!(state.weatherLat != null && state.weatherLon != null)) {
    status.textContent = '';
    days.appendChild(mk('div', 'wx-empty', 'Set a location in Settings → Weather.'));
    if (typeof Disp !== 'undefined' && Disp.fitWeather) Disp.fitWeather();
    return;
  }
  if (!WX.data || !WX.data.daily) {
    status.textContent = WX.err ? WX.err : (WX.busy ? 'Loading…' : 'Connecting…');
    const empty = mk('div', 'wx-empty', WX.err ? ('Could not load forecast (' + WX.err + ').') : 'Loading forecast…');
    if (WX.err) {
      const retry = mk('button', 'btn sm', 'Retry');
      retry.type = 'button';
      retry.style.marginLeft = '10px';
      retry.onclick = () => { WX.next = 0; fetchWeather(); };
      empty.appendChild(retry);
    }
    days.appendChild(empty);
    if (typeof Disp !== 'undefined' && Disp.fitWeather) Disp.fitWeather();
    return;
  }
  status.textContent = WX.err ? WX.err : (WX.okAt ? 'Updated ' + agoTextWx(WX.okAt) : '');
  const d = WX.data.daily;
  const n = Math.min(7, (d.time || []).length);
  for (let i = 0; i < n; i++) {
    const btn = mk('button', 'wx-day');
    btn.type = 'button';
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', i === WX.day ? 'true' : 'false');
    btn.dataset.i = i;
    const code = d.weathercode[i];
    const ico = mk('span', 'ico'); ico.innerHTML = wxSvg(WX_ICON[code] || 'cloud');
    const meta = mk('span', 'meta', wxPrecip(d.precipitation_probability_max[i], d.precipitation_sum[i], units) + '\n' + wxWind(d.windspeed_10m_max[i], d.winddirection_10m_dominant[i], units));
    meta.style.whiteSpace = 'pre-line';
    const temps = mk('span', 'temps');
    temps.append(mk('span', 'hi', wxTemp(d.temperature_2m_max[i])), mk('span', 'lo', wxTemp(d.temperature_2m_min[i])));
    btn.append(mk('span', 'lab', dayLabel(d.time[i], i)), ico, temps, meta);
    days.appendChild(btn);
  }
  renderHours();
  if (typeof Disp !== 'undefined' && Disp.fitWeather) Disp.fitWeather();
}

function renderHours() {
  const hours = $('#wxHours'); if (!hours || !WX.data || !WX.data.daily) return;
  const d = WX.data.daily, h = WX.data.hourly, units = state.weatherUnits === 'c' ? 'c' : 'f';
  hours.textContent = '';
  if (!h || !h.time) {
    hours.appendChild(mk('div', 'wx-empty', WX.busy ? 'Loading hourly…' : 'Hourly unavailable.'));
    return;
  }
  const dayIso = d.time[WX.day];
  const now = new Date();
  /* Show a rolling 12-hour window. On today it starts at the current hour (now first); on other days at that day's 00:00. */
  let start;
  if (WX.day === 0) {
    const floor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime();
    start = h.time.findIndex(t => new Date(t).getTime() >= floor);
    if (start < 0) start = h.time.findIndex(t => t.slice(0, 10) === dayIso);
  } else {
    start = h.time.findIndex(t => t.slice(0, 10) === dayIso);
  }
  if (start < 0) { hours.appendChild(mk('div', 'wx-empty', 'No hourly data for that day.')); return; }
  const end = Math.min(start + 12, h.time.length);
  for (let i = start; i < end; i++) {
    const t = new Date(h.time[i]);
    const isNow = WX.day === 0 && t.getHours() === now.getHours() && t.toDateString() === now.toDateString();
    const el = mk('div', 'wx-hour' + (isNow ? ' now' : ''));
    el.setAttribute('role', 'listitem');
    const ico = mk('span', 'ico'); ico.innerHTML = wxSvg(WX_ICON[h.weathercode[i]] || 'cloud');
    const meta = mk('span', 'meta', wxPrecip(h.precipitation_probability[i], null, units) + '\n' + wxWind(h.windspeed_10m[i], h.winddirection_10m[i], units));
    meta.style.whiteSpace = 'pre-line';
    el.append(mk('span', 'lab', hourLabel(h.time[i], isNow)), ico, mk('span', 'temp', wxTemp(h.temperature_2m[i])), meta);
    hours.appendChild(el);
  }
}

function agoTextWx(t) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 90) return s + 's ago';
  if (s < 5400) return Math.round(s / 60) + ' min ago';
  return Math.round(s / 3600) + ' h ago';
}

function wireWeather() {
  const days = $('#wxDays');
  if (days) days.addEventListener('click', e => {
    const b = e.target.closest('.wx-day'); if (!b) return;
    WX.day = +b.dataset.i || 0;
    renderWeather();
    scheduleWxReturn();
  });
}

async function applyWeatherSettings() {
  const msg = $('#wxMsg'), raw = $('#wxLoc').value;
  setMsg(msg, 'Looking up…');
  try {
    state.weatherUnits = $('#wxUnits').value === 'c' ? 'c' : 'f';
    if (!String(raw || '').trim()) {
      state.weatherPlace = state.weatherLabel = '';
      state.weatherLat = state.weatherLon = null;
      WX.data = null; WX.next = 0; save(); renderWeather();
      setMsg(msg, 'Location cleared.', 'ok');
      return;
    }
    const r = await resolveWeatherPlace(raw);
    state.weatherPlace = r.place; state.weatherLat = r.lat; state.weatherLon = r.lon; state.weatherLabel = r.label;
    $('#wxLoc').value = r.label;
    WX.next = 0; WX.day = 0; WX.data = null; WX.fail = 0; save();
    setMsg(msg, 'Using ' + r.label + '.', 'ok');
    await fetchWeather();
  } catch (e) { setMsg(msg, String(e.message || e), 'err'); }
}
