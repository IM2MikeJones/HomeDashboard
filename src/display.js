/* ================= glyph tables ================= */
/* 7-segment: a top, b upper right, c lower right, d bottom, e lower left, f upper left, g middle */
const SEG7 = { '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg',
  '-': 'g', '_': 'd', '=': 'dg', A: 'abcefg', B: 'cdefg', C: 'adef', D: 'bcdeg', E: 'adefg', F: 'aefg', G: 'acdef', H: 'bcefg', I: 'ef', J: 'bcde',
  L: 'def', M: 'abf', N: 'ceg', O: 'abcdef', P: 'abefg', R: 'eg', S: 'acdfg', T: 'defg', U: 'bcdef', Y: 'bcdfg', '$': 'acdfg' };
/* 14-segment, bit order: A B C D E F G1 G2 H J K L M N (H/K upper diagonals, L/N lower diagonals, J/M centre verticals) */
const SEG14 = { '0': 0x0C3F, '1': 0x0406, '2': 0x00DB, '3': 0x008F, '4': 0x00E6, '5': 0x00ED, '6': 0x00FD, '7': 0x0007, '8': 0x00FF, '9': 0x00EF,
  A: 0x00F7, B: 0x128F, C: 0x0039, D: 0x120F, E: 0x00F9, F: 0x0071, G: 0x00BD, H: 0x00F6, I: 0x1209, J: 0x001E, K: 0x2470, L: 0x0038, M: 0x0536,
  N: 0x2136, O: 0x003F, P: 0x00F3, Q: 0x203F, R: 0x20F3, S: 0x00ED, T: 0x1201, U: 0x003E, V: 0x0C30, W: 0x2836, X: 0x2D00, Y: 0x1500, Z: 0x0C09,
  '-': 0x00C0, '+': 0x12C0, '/': 0x0C00, '\\': 0x2100, '%': 0x0C24, '$': 0x12ED, '*': 0x3FC0, '_': 0x0008, '=': 0x00C8, '<': 0x2400, '>': 0x0900,
  '(': 0x2400, ')': 0x0900, '?': 0x1083, '~': 0x00C0, '▲': 0x2800, '▼': 0x0500, "'": 0x0200, '&': 0x2359, '#': 0x12CE, '@': 0x02BB };
/* 5x7 dot matrix, five column bytes per glyph, bit 0 = top row */
const FONT5 = (() => {
  const src = { ' ': '0000000000', '!': '00005F0000', '"': '0007000700', '#': '147F147F14', '$': '242A7F2A12', '%': '2313086462', '&': '3649552250', "'": '0005030000',
    '(': '001C224100', ')': '0041221C00', '*': '14083E0814', '+': '08083E0808', ',': '0050300000', '-': '0808080808', '.': '0060600000', '/': '2010080402',
    '0': '3E5149453E', '1': '00427F4000', '2': '4261514946', '3': '2141454B31', '4': '1814127F10', '5': '2745454539', '6': '3C4A494930', '7': '0171090503',
    '8': '3649494936', '9': '064949291E', ':': '0036360000', ';': '0056360000', '<': '0814224100', '=': '1414141414', '>': '0041221408', '?': '0201510906',
    '@': '324979413E', A: '7E1111117E', B: '7F49494936', C: '3E41414122', D: '7F4141221C', E: '7F49494941', F: '7F09090901', G: '3E4149497A', H: '7F0808087F',
    I: '00417F4100', J: '2040413F01', K: '7F08142241', L: '7F40404040', M: '7F020C027F', N: '7F0408107F', O: '3E4141413E', P: '7F09090906', Q: '3E4151215E',
    R: '7F09192946', S: '4649494931', T: '01017F0101', U: '3F4040403F', V: '1F2040201F', W: '3F4038403F', X: '6314081463', Y: '0708700807', Z: '6151494543',
    '_': '4040404040', '~': '0804080408', '▲': '10181C1810', '▼': '040C1C0C04', '\\': '0204081020' };
  const o = {}; for (const k in src) o[k] = src[k].match(/../g).map(h => parseInt(h, 16)); return o;
})();
/* single-stroke numerals in a 60x100 box, used by the Nixie, neon and edge-lit themes */
const STROKE = {
  '0': 'M30 10C14 10 10 30 10 50C10 70 14 90 30 90C46 90 50 70 50 50C50 30 46 10 30 10Z',
  '1': 'M17 27L33 10L33 90',
  '2': 'M11 30C11 17 19 10 30 10C41 10 49 18 49 30C49 45 34 55 10 90L50 90',
  '3': 'M12 22C15 14 22 10 30 10C41 10 48 18 48 29C48 40 40 47 27 48C42 49 50 57 50 69C50 81 42 90 30 90C21 90 14 85 10 76',
  '4': 'M39 90L39 10L8 66L52 66',
  '5': 'M47 10L16 10L12 46C17 41 23 39 30 39C42 39 50 49 50 64C50 79 42 90 29 90C20 90 13 85 10 77',
  '6': 'M45 14C41 11 37 10 32 10C17 10 10 28 10 55C10 78 17 90 30 90C42 90 50 80 50 66C50 52 42 43 30 43C19 43 11 52 10 62',
  '7': 'M10 10L50 10L24 90',
  '8': 'M30 47C19 47 13 39 13 29C13 18 20 10 30 10C40 10 47 18 47 29C47 39 41 47 30 47C17 47 10 56 10 68C10 81 18 90 30 90C42 90 50 81 50 68C50 56 43 47 30 47Z',
  '9': 'M15 86C19 89 23 90 28 90C43 90 50 72 50 45C50 22 43 10 30 10C18 10 10 20 10 34C10 48 18 57 30 57C41 57 49 48 50 38',
  '-': 'M14 50L46 50',
  '$': 'M30 3V97M46 24C46 12 36 8 28 8C16 8 10 16 10 26C10 38 20 44 32 50C46 56 52 64 52 76C52 88 42 94 28 94C14 94 8 84 8 74',
  A: 'M12 90L30 10L48 90M19 62L41 62',
  M: 'M10 90L10 10L30 50L50 10L50 90',
  P: 'M16 90L16 10L37 10C49 10 49 44 37 44L16 44'
};

/* ================= themes ================= */
const THEME = {};
[
  { id: 'flip', name: 'Split-flap cards', eng: 'flip', alpha: 1, attach: 0, acc: [['White', '#f3f1ea'], ['Amber', '#ffc53d'], ['Mint', '#b6f2cf']] },
  { id: 'nixie', name: 'Nixie tubes', eng: 'stroke', alpha: 0, attach: 1, wires: 1, below: 1, acc: [['Neon orange', '#ff7a1a'], ['Deep red', '#ff4a12']] },
  { id: 'eink', name: 'Blockclock style', eng: 'eink', alpha: 0, attach: 1, acc: [['Paper', '#e9e7de'], ['Night', '#17181b']] },
  { id: 'led', name: '7-segment LED', eng: 'seg7', alpha: 0, attach: 1, acc: [['Red', '#ff2b1c'], ['Green', '#3dff5f'], ['Amber', '#ffae00'], ['Blue', '#3fa4ff'], ['White', '#eef3ff']] },
  { id: 'vfd', name: 'Vacuum fluorescent', eng: 'seg14', alpha: 1, attach: 1, acc: [['Teal', '#6dffe0'], ['Ice blue', '#8fd6ff'], ['Green', '#8dff9c']] },
  { id: 'dots', name: 'Dot-matrix LED', eng: 'dot', alpha: 1, attach: 0, acc: [['Red', '#ff3a26'], ['Amber', '#ffab1f'], ['Green', '#58ff58'], ['Blue', '#55acff']] },
  { id: 'lcd', name: 'Calculator LCD', eng: 'seg7', alpha: 0, attach: 1, acc: [['Grey-green', '#a4ad94'], ['Amber backlight', '#e3b253'], ['Blue backlight', '#86b9e6']] },
  { id: 'flipdot', name: 'Flip-dot board', eng: 'dot', alpha: 1, attach: 0, flipdot: 1, acc: [['Yellow', '#f0e23a'], ['White', '#f4f3ee'], ['Lime', '#a5e24c']] },
  { id: 'crt', name: 'CRT terminal', eng: 'dot', alpha: 1, attach: 0, sq: 1, acc: [['Green phosphor', '#46ff80'], ['Amber phosphor', '#ffb23f'], ['White phosphor', '#dfe8ff']] },
  { id: 'odo', name: 'Odometer wheels', eng: 'odo', alpha: 0, attach: 1, fitW: .96, wxBare: 1, acc: [['White', '#f2f0e6'], ['Orange', '#ff8f2e'], ['Green', '#46e05a'], ['Blue', '#4c97ff'], ['Cyan', '#3ad8f0'], ['Magenta', '#f048c8'], ['Yellow', '#ffe14a']] },
  { id: 'bulbs', name: 'Scoreboard bulbs', eng: 'dot', alpha: 1, attach: 0, acc: [['Warm white', '#ffd98a'], ['Cool white', '#fff7e6'], ['Red', '#ff5a3c']] },
  { id: 'neon', name: 'Neon sign', eng: 'stroke', alpha: 0, attach: 1, acc: [['Pink', '#ff3fa7'], ['Blue', '#3cc3ff'], ['Red', '#ff4136'], ['Green', '#4dff8b']] },
  { id: 'numi', name: 'Numitron filaments', eng: 'seg7', alpha: 0, attach: 1, line: 1, below: 1, acc: [['Warm', '#ffcc85'], ['Hot white', '#fff0d6']] },
  { id: 'edge', name: 'Edge-lit acrylic', eng: 'stroke', alpha: 0, attach: 1, wires: 1, below: 1, acc: [['Cyan', '#63e9ff'], ['Orange', '#ff9b40'], ['Violet', '#b792ff'], ['Green', '#70ff9d']] }
].forEach(t => THEME[t.id] = t);

/* ================= cell engines ================= */
const hseg = (x1, x2, y, h) => `${x1 + h},${y - h} ${x2 - h},${y - h} ${x2},${y} ${x2 - h},${y + h} ${x1 + h},${y + h} ${x1},${y}`;
const vseg = (x, y1, y2, h) => `${x - h},${y1 + h} ${x},${y1} ${x + h},${y1 + h} ${x + h},${y2 - h} ${x},${y2} ${x - h},${y2 - h}`;
const segMarks = (x, yb) => `<circle class="s" data-k="dot" cx="${x}" cy="${yb}" r="4.4"/><polygon class="s" data-k="tail" points="${x - 3},${yb + 2} ${x + 3.8},${yb + 1.5} ${x - 2.6},${yb + 12}"/>` +
  `<circle class="s" data-k="c1" cx="${x}" cy="36" r="4.3"/><circle class="s" data-k="c2" cx="${x}" cy="70" r="4.3"/>`;
const SEG_HTML = {};
function seg7Html(line) {
  const L = 11, R = 45, T = 11, M = 53, B = 95, h = 5, g = 1.3;
  const P = { a: hseg(L + g, R - g, T, h), b: vseg(R, T + g, M - g, h), c: vseg(R, M + g, B - g, h), d: hseg(L + g, R - g, B, h), e: vseg(L, M + g, B - g, h), f: vseg(L, T + g, M - g, h), g: hseg(L + g, R - g, M, h) };
  const N = { a: [L + 5, T, R - 5, T], b: [R, T + 5, R, M - 5], c: [R, M + 5, R, B - 5], d: [L + 5, B, R - 5, B], e: [L, M + 5, L, B - 5], f: [L, T + 5, L, M - 5], g: [L + 5, M, R - 5, M] };
  let s = '';
  for (const k of 'abcdefg') s += line ? `<line class="s l" data-k="${k}" x1="${N[k][0]}" y1="${N[k][1]}" x2="${N[k][2]}" y2="${N[k][3]}"/>` : `<polygon class="s" data-k="${k}" points="${P[k]}"/>`;
  return twoLayer(s, 57, 95);
}
function seg14Html() {
  const L = 9, R = 47, C = 28, T = 11, M = 53, B = 95, h = 4, g = 1.2;
  const poly = [hseg(L + g, R - g, T, h), vseg(R, T + g, M - g, h), vseg(R, M + g, B - g, h), hseg(L + g, R - g, B, h), vseg(L, M + g, B - g, h), vseg(L, T + g, M - g, h), hseg(L + g, C - .6, M, h), hseg(C + .6, R - g, M, h)];
  const lines = { 8: [L + 6.5, T + 7.5, C - 5, M - 6.5], 10: [R - 6.5, T + 7.5, C + 5, M - 6.5], 11: [C - 5, M + 6.5, L + 6.5, B - 7.5], 13: [C + 5, M + 6.5, R - 6.5, B - 7.5] };
  let s = poly.map((p, i) => `<polygon class="s" data-k="${i}" points="${p}"/>`).join('');
  s += `<polygon class="s" data-k="9" points="${vseg(C, T + 5.5, M - 1.5, 3.4)}"/><polygon class="s" data-k="12" points="${vseg(C, M + 1.5, B - 5.5, 3.4)}"/>`;
  for (const k in lines) s += `<line class="s l" data-k="${k}" x1="${lines[k][0]}" y1="${lines[k][1]}" x2="${lines[k][2]}" y2="${lines[k][3]}"/>`;
  return twoLayer(s, 57, 95);
}
function twoLayer(segs, mx, my) {
  const vb = 'viewBox="0 0 64 108" preserveAspectRatio="none"';
  return `<svg class="ghost" ${vb}>${segs}<circle class="s" cx="${mx}" cy="${my}" r="4.4"/></svg><svg class="lit" ${vb}>${segs}${segMarks(mx, my)}</svg>`;
}
function dotHtml(sq) {
  let s = '';
  for (let c = 0; c < 5; c++) for (let r = 0; r < 7; r++) s += sq ? `<rect class="d" x="${c * 10}" y="${r * 10}" width="10.4" height="9"/>` : `<circle class="d" cx="${c * 10 + 5}" cy="${r * 10 + 5}" r="4"/>`;
  return `<svg class="lit" viewBox="0 0 50 70" preserveAspectRatio="none">${s}</svg>`;
}
const STROKE_WIRES = `<svg class="wires" viewBox="0 0 70 100">${'6935274180'.split('').map((d, i) => `<path d="${STROKE[d]}" transform="translate(${(i % 3 - 1) * .8} ${(i % 2) * .6})"/>`).join('')}</svg>`;
const STROKE_LIT = '<svg class="lit" viewBox="0 0 70 100"><path class="g"/><path class="c"/>' +
  '<path class="g mk" data-k="dot" d="M63 89h.01"/><path class="g mk" data-k="tail" d="M63 89L60 98"/><path class="g mk" data-k="c1" d="M63 36h.01"/><path class="g mk" data-k="c2" d="M63 66h.01"/></svg>';
const ODO = '0123456789 -$AMP';

let AC = null, lastTick = 0;
function tick() {
  if (!state.sound) return;
  const now = performance.now(); if (now - lastTick < 28) return; lastTick = now;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const n = Math.floor(AC.sampleRate * .03), buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 1700 + Math.random() * 700; g.gain.value = .14;
    s.connect(f); f.connect(g); g.connect(AC.destination); s.start();
  } catch (e) { /* audio not available */ }
}

function flipStep(c, ch, D) {
  const [t, b, ft, fb] = c._h, F = ft.parentNode, G = fb.parentNode;
  ft.textContent = c._ch; fb.textContent = ch; t.textContent = ch;
  F.style.visibility = G.style.visibility = 'visible'; tick();
  const a1 = F.animate([{ transform: 'rotateX(0deg)', filter: 'brightness(1)' }, { transform: 'rotateX(-90deg)', filter: 'brightness(.45)' }], { duration: D, easing: 'ease-in', fill: 'forwards' });
  const a2 = G.animate([{ transform: 'rotateX(90deg)', filter: 'brightness(1.6)' }, { transform: 'rotateX(0deg)', filter: 'brightness(1)' }], { duration: D, delay: D, easing: 'ease-out', fill: 'both' });
  return a2.finished.then(() => { b.textContent = ch; c._ch = ch; F.style.visibility = G.style.visibility = 'hidden'; a1.cancel(); a2.cancel(); });
}
async function flipRun(c) {
  try {
    while (c._ch !== c._tg && c.isConnected) {
      let nx = c._tg;
      /* big cards pass through one or two flaps on the way, like a real drum; a clock ticking 4 to 5 flips once */
      if (!c._small && c._hops < 2) {
        const from = c._ch, to = c._tg, isD = x => x >= '0' && x <= '9', isL = x => x >= 'A' && x <= 'Z';
        let cand = null;
        if (isD(from) && isD(to)) { if (c._hops === 0 && Math.abs(from - to) > 1 && !(from === '9' && to === '0')) cand = String(Math.round((+from + +to) / 2)); }
        else if (isL(from) || isL(to)) cand = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        if (cand && cand !== from && cand !== to) nx = cand;
        c._hops++;
      }
      await flipStep(c, nx, nx === c._tg ? 105 : 60);
    }
  } catch (e) { /* cell was removed mid-flip */ }
  c._run = false;
}

const ENG = {
  seg7: {
    make(th) { const c = mk('span', 'cell seg'); c.innerHTML = SEG_HTML[th.line ? 'line' : 'poly'] || (SEG_HTML[th.line ? 'line' : 'poly'] = seg7Html(th.line)); c._s = [...c.querySelectorAll('.lit .s')].map(e => [e.dataset.k, e]); return c; },
    set(c, ch, mark) { const on = SEG7[ch.toUpperCase()] || ''; segSet(c, mark, k => on.includes(k)); }
  },
  seg14: {
    make() { const c = mk('span', 'cell seg'); c.innerHTML = SEG_HTML.s14 || (SEG_HTML.s14 = seg14Html()); c._s = [...c.querySelectorAll('.lit .s')].map(e => [e.dataset.k, e]); return c; },
    set(c, ch, mark) { const code = SEG14[ch.toUpperCase()] || 0; segSet(c, mark, k => (code >> +k) & 1); }
  },
  dot: {
    make(th) { const c = mk('span', 'cell dot'); const k = th.sq ? 'sq' : 'rd'; c.innerHTML = SEG_HTML[k] || (SEG_HTML[k] = dotHtml(th.sq)); c._d = [...c.querySelectorAll('.d')]; return c; },
    set(c, ch, mark, i, first, th) {
      const g = FONT5[ch] || FONT5[ch.toUpperCase()] || FONT5[' '], d = c._d;
      let changed = false;
      for (let col = 0; col < 5; col++) for (let r = 0; r < 7; r++) {
        const e = d[col * 7 + r], v = !!((g[col] >> r) & 1);
        if (!!e._on === v) continue;
        e._on = v; changed = true;
        if (th.flipdot && !first) { const dl = Math.random() * .22; e.style.animationDelay = dl + 's'; e.style.transitionDelay = (dl + .07) + 's'; if (e.classList.contains('fa')) e.classList.replace('fa', 'fb'); else { e.classList.remove('fb'); e.classList.add('fa'); } }
        e.classList.toggle('on', v);
      }
      if (changed && th.flipdot && !first) tick();
    }
  },
  stroke: {
    make(th) {
      const c = mk('span', 'cell st');
      c.innerHTML = `<span class="glass">${th.wires ? STROKE_WIRES : ''}<i class="mesh"></i>${STROKE_LIT}<i class="shine"></i></span><i class="base"></i>`;
      c._lit = c.querySelector('.lit'); c._g = c.querySelector('.lit .g'); c._c = c.querySelector('.lit .c');
      c._m = {}; c.querySelectorAll('.mk').forEach(e => c._m[e.dataset.k] = e);
      return c;
    },
    set(c, ch, mark, i, first) {
      const d = STROKE[ch] || '';
      c._g.setAttribute('d', d); c._c.setAttribute('d', d);
      c._m.dot.style.display = mark === '.' || mark === ',' ? '' : 'none';
      c._m.tail.style.display = mark === ',' ? '' : 'none';
      c._m.c1.style.display = c._m.c2.style.display = mark === ':' ? '' : 'none';
      c.classList.toggle('lit-on', !!d);
      if (!first && c._lit.animate) c._lit.animate([{ opacity: .1 }, { opacity: 1, offset: .5 }, { opacity: .6, offset: .7 }, { opacity: 1 }], { duration: 170 });
    }
  },
  flip: {
    make(th, kind) {
      const c = mk('span', 'cell flip');
      c.innerHTML = '<b class="h top"><i></i></b><b class="h bot"><i></i></b><b class="h ftop"><i></i></b><b class="h fbot"><i></i></b>';
      c._h = [...c.children].map(b => b.firstChild); c._ch = c._tg = ' '; c._small = kind === 'small'; return c;
    },
    set(c, ch, mark, i, first) {
      ch = ch.toUpperCase();
      if (first || !c.animate) { c._ch = c._tg = ch; c._h[0].textContent = c._h[1].textContent = ch; return; }
      c._tg = ch;
      if (!c._run) { c._run = true; c._hops = 0; setTimeout(() => flipRun(c), i * (c._small ? 10 : 45)); }
    }
  },
  odo: {
    make() {
      const c = mk('span', 'cell odo'), s = mk('span', 'strip');
      for (const ch of ODO) { const b = mk('b'); b.appendChild(mk('i', '', ch)); s.appendChild(b); }
      c.appendChild(s); c.appendChild(mk('u', 'mk')); c._strip = s; return c;
    },
    set(c, ch, mark, i, first) {
      let k = ODO.indexOf(ch); if (k < 0) k = 10;
      if (first) { c._strip.style.transition = 'none'; requestAnimationFrame(() => requestAnimationFrame(() => { c._strip.style.transition = ''; })); }
      else c._strip.style.transitionDelay = (i * .03) + 's';
      c._strip.style.transform = 'translateY(' + (-k) + 'em)';
      c.lastChild.textContent = mark === ':' ? ':' : mark; c.lastChild.className = 'mk' + (mark === ':' ? ' col' : '');
    }
  },
  eink: {
    make(th, kind, i) { const c = mk('span', 'cell ek' + (i === 0 ? ' tag' : '')); c.append(mk('i', 'cap'), mk('b', 'ch'), mk('u', 'mk')); return c; },
    set(c, ch, mark, i, first) {
      c.children[1].textContent = ch === ' ' ? '' : ch; c.children[2].textContent = mark;
      if (!first && c.animate) c.animate([{ filter: 'invert(1)' }, { filter: 'invert(1)', offset: .45 }, { filter: 'invert(0)' }], { duration: 300, delay: i * 25, easing: 'steps(3)' });
    }
  }
};
function segSet(c, mark, test) {
  for (const [k, e] of c._s) {
    const v = k === 'dot' ? (mark === '.' || mark === ',') : k === 'tail' ? mark === ',' : (k === 'c1' || k === 'c2') ? mark === ':' : !!test(k);
    e.classList.toggle('on', v);
  }
}

/* ================= layout ================= */
const BLANK = { ch: ' ', mark: '' };
function tokens(str, attach) {
  const out = [];
  for (const ch of String(str)) {
    if (attach && '.,:'.includes(ch)) { const p = out[out.length - 1]; if (p && !p.mark) { p.mark = ch; continue; } out.push({ ch: ' ', mark: ch }); continue; }
    out.push({ ch, mark: '' });
  }
  return out;
}
function place(toks, n, align) {
  if (toks.length > n) toks = toks.slice(0, n);
  const pad = n - toks.length, left = align === 'left' ? 0 : align === 'right' ? pad : Math.floor(pad / 2), out = [];
  for (let i = 0; i < n; i++) out.push(toks[i - left] || BLANK);
  return out;
}
function between(l, r, n) {
  if (l.length > n) return l.slice(0, n);
  if (!r || l.length + r.length + 1 > n) return l;
  return l + ' '.repeat(n - l.length - r.length) + r;
}
const segText = s => (typeof s === 'string' ? s : s.t);
function fitSegs(segs, n) {
  let out = '';
  for (const s of segs) { const t = segText(s), next = out ? out + '  ' + t : t; if (next.length > n) { if (!out) out = t.slice(0, n); break; } out = next; }
  return out;
}

const Disp = {
  th: null, v: null,
  build() {
    const th = this.th = THEME[state.theme] || THEME.flip, st = $('#stage'), dev = $('#device'), E = ENG[th.eng], N = state.cells;
    const acc = th.acc[state.accent[th.id] || 0] || th.acc[0];
    const layout = state.layout === 'right' ? 'right' : 'below';
    st.className = 't-' + th.id + ' a-' + (state.accent[th.id] || 0) + ' layout-' + layout;
    st.style.setProperty('--on', acc[1]);
    dev.textContent = '';
    const row = (cls, n, kind) => { const el = mk('div', 'row ' + cls), cells = []; for (let i = 0; i < n; i++) { const c = E.make(th, kind, i); el.appendChild(c); cells.push(c); } return { el, cells, cur: new Array(n).fill(null) }; };
    this.main = row('main', N, 'main'); this.lab = this.inf = this.pl = null;
    if (th.alpha) {
      this.lab = row('label', Math.floor(N / .42), 'small'); this.inf = row('info', Math.floor(N / .3), 'small');
      dev.append(this.lab.el, this.main.el, this.inf.el);
      this.inf.el.style.display = state.info ? '' : 'none';
    } else {
      const top = mk('div', 'pl-top'), bot = mk('div', 'pl-bot'), lp = mk('div', 'prow plabel'), ip = mk('div', 'prow pinfo');
      const l = mk('span', 'l'), r = mk('span', 'r'); lp.append(l, r);
      (th.below ? bot : top).append(lp); bot.append(ip);
      if (th.eng === 'eink') top.style.display = 'none';
      ip.style.display = state.info && th.eng !== 'eink' ? '' : 'none';
      dev.append(top, this.main.el, bot);
      this.pl = { l, r, ip, key: '' };
    }
    this.first = true; this.fit();
    if (this.v) this.show(this.v);
  },
  fit() {
    const dev = $('#device'), st = $('#stage'), pane = $('#modTicker') || st;
    const open = document.body.classList.contains('open') && innerWidth > 760;
    st.style.right = open ? $('#panel').offsetWidth + 'px' : '0';
    dev.style.fontSize = '100px';
    const r = dev.getBoundingClientRect(), W = pane.clientWidth;
    const widthFit = (this.th && this.th.fitW) || .92;
    /* Stacked layout: ticker pane is auto-height (top-aligned), so size against stage budget, not pane.
       Give the ticker just enough vertical budget to become width-bound (so it fills the full width),
       but never more than 58% of the stage so the weather below keeps room. */
    let H = pane.clientHeight;
    if (state.layout !== 'right') {
      const widthH = r.height * (W * widthFit / r.width);   /* ticker height when exactly width-bound */
      H = Math.max(140, Math.min(st.clientHeight * .58, widthH / .82 + 1));
    } else if (!H) H = st.clientHeight;
    if (!r.width || !r.height || !W || !H) return;
    dev.style.fontSize = Math.max(8, 100 * Math.min(W * widthFit / r.width, H * .82 / r.height)) + 'px';
    this.fitWeather();
  },
  fitWeather() {
    const panel = $('#wxPanel'), fit = $('#wxFit'), device = $('#device');
    if (!panel || !fit || panel.offsetParent === null) return;
    const right = state.layout === 'right';
    const bare = !!(this.th && this.th.wxBare);
    if (device && bare) {
      /* Bezel-less weather (e.g. odometer): no panel chrome, no header — just the chiclets spanning the
         full ticker width, floating directly under the ticker. */
      panel.style.backgroundColor = 'transparent';
      panel.style.backgroundImage = 'none';
      panel.style.borderRadius = '0';
      panel.style.boxShadow = 'none';
      panel.style.border = '0';
      panel.style.paddingTop = '0';
      panel.style.paddingRight = '0';
      panel.style.paddingBottom = '0';
      panel.style.paddingLeft = '0';
      /* Span the full window width (not the ticker width): clear the inline width so .wx-panel's width:100% fills the module. */
      panel.style.width = '';
      panel.style.setProperty('--wx-base', parseFloat(getComputedStyle(device).fontSize) + 'px');
      panel.style.removeProperty('--wx-head-size');
      const head = panel.querySelector('.wx-head');
      if (head) ['fontFamily', 'fontWeight', 'fontStyle', 'letterSpacing', 'textTransform'].forEach(k => head.style[k] = '');
    }
    /* Mirror the ticker's bezel exactly: copy the device's computed chrome so outline, radius, background and inset match for every theme. */
    if (device && !bare) {
      const d = getComputedStyle(device);
      panel.style.backgroundColor = d.backgroundColor;
      panel.style.backgroundImage = d.backgroundImage;
      panel.style.borderRadius = d.borderRadius;
      panel.style.boxShadow = d.boxShadow;
      panel.style.border = d.border;
      panel.style.paddingTop = d.paddingTop;
      panel.style.paddingRight = d.paddingRight;
      panel.style.paddingBottom = d.paddingBottom;
      panel.style.paddingLeft = d.paddingLeft;
      panel.style.width = right ? '' : Math.round(device.getBoundingClientRect().width) + 'px';
      /* Base unit = the ticker's digit font size; internal rhythm scales from it so the bezel matches the ticker. */
      panel.style.setProperty('--wx-base', parseFloat(d.fontSize) + 'px');
      /* Match the header to whatever the ticker actually renders as its bezel label in this theme
         (attach themes: a small plaque label; flip: a glyph flap; dot/segment themes: a cell row),
         mirroring its real size AND text style so the font, weight, spacing and colour all line up. */
      const vis = el => el && el.offsetParent !== null && el.getBoundingClientRect().height > 0;
      const pl = device.querySelector('.prow.plabel'), labRow = device.querySelector('.row.label');
      const labGlyph = labRow && labRow.querySelector('i');
      let headPx = 0, styleEl = null;
      if (vis(pl)) { headPx = parseFloat(getComputedStyle(pl).fontSize); styleEl = pl; }
      else if (labGlyph && vis(labRow)) { headPx = parseFloat(getComputedStyle(labGlyph).fontSize); styleEl = labGlyph; }
      else if (vis(labRow)) { headPx = labRow.getBoundingClientRect().height * .72; styleEl = labRow; }
      const head = panel.querySelector('.wx-head');
      if (headPx) panel.style.setProperty('--wx-head-size', headPx + 'px');
      else panel.style.removeProperty('--wx-head-size');
      /* Mirror the label's typography (family, weight, spacing, case) so the header reads like the ticker's
         bezel label, but keep colour from the theme's own --wx-text/plaque tokens: the weather bezel surface
         can differ from the ticker label's surface (e.g. LCD's dark bezel vs its green screen), so the
         token already carries the correct, readable colour for each theme. */
      const typo = ['fontFamily', 'fontWeight', 'fontStyle', 'letterSpacing', 'textTransform'];
      if (head && styleEl) {
        const L = getComputedStyle(styleEl);
        typo.forEach(k => head.style[k] = L[k]);
      } else if (head) {
        typo.forEach(k => head.style[k] = '');
      }
    }
    fit.style.transform = 'none';
    fit.style.fontSize = '';           /* revert to the theme's base content size (CSS) */
    panel.style.height = '';
    const cs = getComputedStyle(panel);
    const padL = parseFloat(cs.paddingLeft), padR = parseFloat(cs.paddingRight), padT = parseFloat(cs.paddingTop), padB = parseFloat(cs.paddingBottom);
    const availW = panel.clientWidth - padL - padR;
    let availH;
    if (right) {
      availH = panel.clientHeight - padT - padB;
    } else {
      /* Below layout: budget is the stage minus the (auto-height) ticker, so the panel can hug its content like the ticker bezel. */
      const st = $('#stage'), ticker = $('#modTicker'), modW = $('#modWeather');
      const modPadB = parseFloat(getComputedStyle(modW).paddingBottom) || 0;
      availH = st.clientHeight - ticker.getBoundingClientRect().height - modPadB - 8 - padT - padB;
    }
    if (!availW || availH <= 0) return;
    /* The cards' flexbox always fills the full width (= ticker width); we fit the HEIGHT by shrinking
       the content's base font-size, never enlarging past it. This keeps the widget full-width even in
       short windows instead of uniformly scaling down (which would narrow and centre it). */
    const fsBase = parseFloat(getComputedStyle(fit).fontSize) || 16;
    let natH = fit.scrollHeight;
    if (natH > 0) {
      let fs = natH > availH ? Math.max(5, fsBase * availH / natH) : fsBase;
      fit.style.fontSize = fs + 'px';
      const h2 = fit.scrollHeight;     /* wrapping makes height non-linear in font-size; correct once */
      if (h2 > availH + 0.5) { fs = Math.max(5, fs * availH / h2); fit.style.fontSize = fs + 'px'; }
    }
    panel.style.height = right ? '' : (fit.scrollHeight + padT + padB) + 'px';
  },
  setRow(row, toks, off) {
    const th = this.th, E = ENG[th.eng], first = this.first; off = off || 0;
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i], k = t.ch + t.mark, j = i + off;
      if (row.cur[j] !== k) { row.cur[j] = k; E.set(row.cells[j], t.ch, t.mark, i, first, th); }
    }
  },
  show(v) {
    this.v = v; const th = this.th, N = state.cells, eink = th.eng === 'eink', cap = eink ? N - 1 : N;
    let txt, mult = '';
    if (v.text != null) { txt = v.text; if (tokens(txt, th.attach).length > cap && v.alt) txt = v.alt; }
    else if (v.value == null) txt = '----';
    else {
      const pre = v.prefix || '';
      ({ text: txt, mult } = fmtNum(v.value, Math.max(1, cap - pre.length), th.attach, v.dec));
      if (pre && txt !== '----') txt = txt.charAt(0) === '-' ? '-' + pre + txt.slice(1) : pre + txt;
    }
    const label = (v.label || '') + (mult ? ' (' + MULT[mult] + ')' : ''), right = v.right || '', info = (v.info || []).filter(Boolean);
    $('#stage').dataset.dir = v.dir || '';
    /* numbers (and clocks, via ralign) sit against the right edge so their size is comparable from one entry to the next */
    this.setRow(this.main, place(tokens(txt, th.attach), cap, (v.text != null && !v.ralign) ? 'center' : 'right'), eink ? 1 : 0);
    if (th.alpha) {
      this.setRow(this.lab, place(tokens(between(label, right, this.lab.cells.length).toUpperCase(), th.attach), this.lab.cells.length, 'left'));
      if (state.info) this.setRow(this.inf, place(tokens(fitSegs(info, th.attach ? this.inf.cells.length + 4 : this.inf.cells.length).toUpperCase(), th.attach), this.inf.cells.length, 'center'));
    } else if (eink) this.einkExtras(label, right, info);
    else {
      const p = this.pl, key = label + '|' + right + '|' + info.map(segText).join('|');
      if (p.key !== key) {
        p.key = key; p.l.textContent = label; p.r.textContent = right; p.ip.textContent = '';
        info.forEach(s => p.ip.appendChild(mk('span', typeof s === 'string' ? '' : s.c, segText(s))));
        /* keep the most important items when the plate is too narrow for all of them */
        while (p.ip.children.length > 1 && p.ip.scrollWidth > p.ip.clientWidth + 1) p.ip.lastChild.remove();
      }
    }
    this.first = false;
  },
  /* Blockclock style: the first cell carries the stacked label, small captions sit above the digits. */
  einkExtras(label, right, info) {
    const cells = this.main.cells, tag = cells[0], key = label + '|' + right + '|' + info.map(segText).join('|') + '|' + state.info;
    if (this.ekKey === key && !this.first) return; this.ekKey = key;
    const ch = tag.children[1]; ch.textContent = '';
    const parts = label.includes('/') && label.length < 26 ? label.split('/') : wrapWords(label, 9, 4);
    parts.forEach((p, i) => { if (i && label.includes('/') && label.length < 26) ch.appendChild(mk('hr')); ch.appendChild(mk('span', '', p.trim())); });
    ch.style.fontSize = Math.min(.165, 1.0 / Math.max(1, ...parts.map(x => x.trim().length))) + 'em';
    tag.children[0].textContent = '';
    const caps = state.info ? [right, ...info.map(segText)].filter(Boolean) : [right];
    for (let i = 1; i < cells.length; i++) cells[i].children[0].textContent = (caps[i - 1] || '').slice(0, 30);
  }
};
function wrapWords(s, w, max) {
  const out = []; let cur = '';
  for (const word of s.split(' ')) { if (cur && (cur + ' ' + word).length > w) { out.push(cur); cur = word; } else cur = cur ? cur + ' ' + word : word; }
  if (cur) out.push(cur);
  return out.slice(0, max);
}
