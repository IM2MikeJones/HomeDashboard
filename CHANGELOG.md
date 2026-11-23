# Changelog

Newest first. Bump `VERSION` in `build.py` with every change.

## 0.2.4 — 22 Nov 2026
- Odometer weather now spans the full window width instead of being pinned to the ticker width, so the chiclets run edge-to-edge under the (slightly narrower) ticker. Only the bezel-less odometer layout is affected; bezeled themes still match the ticker width.

## 0.2.3 — 22 Nov 2026
- Odometer weather now uses the accent colour like the other themes: weather icons, high temps and hourly temps take the accent colour, the selected day's ring is drawn in the accent, and the card borders are subtly accent-tinted. Labels, lows and meta stay muted grey. The default White accent looks the same as before.

## 0.2.2 — 22 Nov 2026
- Edge-to-edge layout: removed the outer window margins (top/left/right of the ticker and the sides/bottom of the weather) so both widgets sit flush to the window edges. Only the small gap between the two widgets remains.
- The ticker now fills the full width in short/landscape windows too — it gets just enough vertical budget to become width-bound (capped at 58% of the stage so the weather keeps room), instead of being pinned to ~48% and leaving large side margins.

## 0.2.1 — 22 Nov 2026
- Weather now keeps the full ticker width in short/landscape windows. The fit no longer scales the whole widget uniformly (which narrowed and centred it when vertical space was tight); instead the card flexbox always fills the width and only the content's font-size shrinks to fit the available height. Card metrics are now em-based off a `.wx-fit` base size (odometer bumps that base for its 30% larger content).

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
