# HomeDashboard

A single HTML file that turns any browser into a multi-module home display: prices, world clocks, Bitcoin network figures, and a themed weather forecast, in 14 hardware-style themes.

There is **no server and nothing to install**. Open `home-dashboard.html` in a browser and it runs. That makes it a good fit for an inexpensive tablet or an old phone sitting on a desk or mounted on a wall: leave the page open, put the browser in fullscreen, and the display keeps rotating through the figures you care about.

HomeDashboard started from [Ticker Clock](https://github.com/IM2MikeJones/Ticker-Clock) 1.2.8 and is developed separately under this name.

Current version: **0.3.1** — see [CHANGELOG.md](CHANGELOG.md).

## Run it

1. Build with `python3 build.py`, or open the built `home-dashboard.html` at the root of this project.
2. Open the file in a browser (Chrome, Firefox, Safari, Edge, and the browser that ships with most tablets and phones). On a computer you can usually double-click the file. On a phone or tablet, copy it into Files / Downloads and open it from there.
3. Press **F** (or use the fullscreen control in the corner) for a full-screen display. Press **S** for settings.

Settings are stored in that browser only (`homedashboard.v1`). Stock prices need a free [Finnhub](https://finnhub.io/register) API key; everything else works without one.

### Desk or wall display

A cheap Android tablet, an old phone, or a spare laptop is enough:

- Open `home-dashboard.html` from the device’s storage (or from a USB stick). You do not need a web server.
- Put the browser in fullscreen, turn off sleep / lock screen for that session if you want it always on, and leave it plugged in.
- Landscape orientation works best. Ten digits is the default; you can go from 6 to 14 in settings.
- The HUD buttons fade after a few seconds of no touch, so the bezel does not stay on screen.

The page fetches public price and Bitcoin-network feeds over the internet. It must stay online.

## What it shows

The board has two modules that share the active theme:

- **Ticker** — a rotating multi-digit display of prices, world clocks, and Bitcoin vitals. Each entry stays on screen for a few seconds (default 8), then the next one flips in.
- **Weather** — a 7-day forecast plus a rolling 12-hour strip (starting at the current hour) with precip chance/amount and wind. Select a day to see its hours. Set a place name in Settings; data comes from [Open-Meteo](https://open-meteo.com) (no key). Layout can put weather under the ticker or to the right.

Ticker rotation entries:

- **Prices** — any asset in any other asset (BTC in USD, gold in euros, a stock in gold, and so on). Cross rates that are not traded directly are derived through the dollar.
- **Clocks** — any IANA time zone, 12- or 24-hour.
- **Bitcoin vitals** — block height, time since last block, difficulty, next adjustment, hashrate, subsidy, blocks to halving, issued supply, fees, mempool, and market cap (via [mempool.space](https://mempool.space)).

Fourteen themes mimic hardware: split-flap, nixie, e-ink / Blockclock style, 7-segment LED, vacuum fluorescent, dot-matrix, calculator LCD, flip-dot, CRT, odometer, scoreboard bulbs, neon, Numitron, and edge-lit acrylic. Most themes have a few accent colours. Weather chrome follows the same accent.

### Keys

| Key | Action |
| --- | --- |
| Space | Pause / resume |
| ← → | Previous / next entry |
| F | Fullscreen |
| S | Settings |
| Esc | Close settings |

## For developers

Edit files under `src/` only. Never edit `home-dashboard.html` by hand; the build overwrites it.

| Path | What it is |
| --- | --- |
| `home-dashboard.html` | The built app. This is what users open. |
| `src/data.js` | Assets, feed adapters, pricing, history, formatting, polling, Bitcoin vitals |
| `src/display.js` | Glyphs, themes, drawing engines, ticker fit |
| `src/weather.js` | Open-Meteo forecast, geocoding, weather UI |
| `src/ui.js` | Defaults, load/save, rotation, settings panel, start-up |
| `src/base.css`, `src/themes.css` | Page and panel styles; one block per theme |
| `src/body.html` | Markup for the display, buttons and settings panel |
| `build.py` | Joins `src/` into `home-dashboard.html`; holds `VERSION` |
| `test/run.js` | Headless Chrome with mocked feeds: maths, formatting, theme screenshots |
| `test/ui.js` | Settings panel, custom symbols, reload, vitals |
| `test/feed-check.html` | Open from disk to check every live feed |
| `CHANGELOG.md` | What changed in each version |

### Build

```
python3 build.py          # Python 3 only; writes home-dashboard.html
```

### Test

```
npm install
npx playwright install chromium     # or set CHROME_PATH to an installed Chrome
npm test                            # builds, then runs test/run.js all and test/ui.js
```

`CHROME_PATH=/usr/bin/google-chrome npm test` uses an existing Chrome. Screenshots land in `test/shots/` (not checked in). A good run ends with `errors []`. Console lines about deliberate 404s in the mocks are expected.

The tests never touch the network: every feed is answered by `mock()` in `test/run.js`. If a live feed changes shape, update that mock. The built page exposes `window.HD` for the tests.

### Live feed check

Double-click `test/feed-check.html` so it opens from disk (origin `null`, the same as the app). Every row except Bitstamp should say “works”; Finnhub passes with HTTP 401 when no key is given.

### Rules

1. The app stays one self-contained file: no CDNs, web fonts, libraries or images.
2. Only feeds that allow reads from origin `null`, with no keys except the user’s own optional Finnhub key.
3. Saved settings from older versions keep working: storage key `homedashboard.v1`, history `homedashboard.hist`; add one-time upgrade flags rather than changing the format.
4. No `alert`, `confirm` or `prompt` dialogs.
5. No brand names or logos in themes.
6. Bump `VERSION` in `build.py` and add to `CHANGELOG.md` with every change.
