# Changelog

Newest first. Bump `VERSION` in `build.py` with every change.

## 0.3.5 — 23 Nov 2026
- 12-hour clock AM/PM suffix now has no space before it (`4:11:01AM`), so a full `H:MM:SSAM` fits within 8 cells even with a two-digit hour.

## 0.3.4 — 23 Nov 2026
- 12-hour clocks now show an AM/PM suffix on the time itself (e.g. `4:11:01AM`) instead of only tucking it in the corner (which could sit behind the playback controls); the corner now shows just the UTC offset. Added the needed glyphs so it renders on every theme: letters on the odometer wheel, A/M/P strokes for the nixie/neon/edge-lit themes, and a best-effort `M` for the 7-segment themes (which can't form a true M).

## 0.3.3 — 23 Nov 2026
- Odometer ticker: made the outer bezel outline and the bezel background black (were a dark-grey gradient with a light-grey edge). The inner display frame is unchanged.

## 0.3.2 — 23 Nov 2026
- Odometer weather: changed the muted grey chiclet text (day labels, low temps, precip/wind meta) to white. Icons and high/hourly temps keep the accent colour.

## 0.3.1 — 23 Nov 2026
- Added 3px to the right screen margin (now 7px; top and left stay 4px, bottom flush).

## 0.3.0 — 22 Nov 2026
Layout polish and a colourful, full-width odometer weather.

- Full-screen fill: removed the large outer window margins so the ticker and weather use the whole window, then added back a small 4px breathing room at the top and both sides (bottom stays flush).
- The ticker now fills the full width in short/landscape windows too — it gets just enough vertical budget to become width-bound (capped at 58% of the stage so the weather keeps room), instead of being pinned to ~48% and leaving large side margins.
- Weather keeps the full width in short windows: the fit no longer scales the whole widget uniformly (which narrowed and centred it when vertical space was tight); instead the card flexbox always fills the width and only the content's font-size shrinks to fit the available height. Card metrics are now em-based off a `.wx-fit` base size.
- Odometer weather now uses the accent colour like the other themes: weather icons, high temps and hourly temps take the accent colour, the selected day's ring is drawn in the accent, and the card borders are subtly accent-tinted. Labels, lows and meta stay muted grey; the default White accent looks the same as before.
- Odometer weather now spans the full window width instead of being pinned to the ticker width, so the chiclets run edge-to-edge under the (slightly narrower) ticker. Bezeled themes still match the ticker width.

## 0.2.0 — 22 Nov 2026
Adds the weather module and fully themes it to the ticker.

- Weather module: 7-day forecast plus a rolling 12-hour hourly detail (precipitation + wind) from Open-Meteo; no API key required. Robust loading — daily first, then hourly, with sensible timeouts, faster retry after errors, and a Retry button on failure.
- Settings: location search, °F/mph or °C/km/h, layout (weather under the ticker or to the right), and an auto "Return to Today" delay (3–120 s, default 20 s) after viewing another day.
- Theming: per-theme `--wx-*` tokens (panel chrome, cards, glow, inverts, overlays, plaques) so the weather follows each display theme beyond accent colour alone. The panel mirrors the ticker's device chrome (width, outer outline, corner radius, background, inset) and the header mirrors the ticker's actual bezel label per theme — its real pixel size and typography (family, weight, style, letter-spacing, casing) — while colour stays readable from each theme's token.
- Layout: the panel scales to fit like the ticker with no scrollbars; 7-day and hourly cards stretch to fill the width; the ticker and weather top-align with weather directly under the ticker.
- Selection: only the chosen day shows a selection outline; the hourly "Now" card keeps its label without rendering as selected.
- Odometer theme: a bezel-less weather layout — no header or panel chrome, chiclets float under the ticker and span its full width, the day and hour rows butt together with squared inner corners (12px outer radius), the selected day uses an even inset outline, and card content is enlarged 30%.

## 0.1.0 — 22 Nov 2026
- First HomeDashboard release, based on Ticker Clock 1.2.8.
- Renamed the product, build output (`home-dashboard.html`), settings storage (`homedashboard.v1` / `homedashboard.hist`), and test API (`window.HD`).
