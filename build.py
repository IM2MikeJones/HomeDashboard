"""Bundle the source parts into one self-contained HTML file. Run: python3 build.py"""
import pathlib

VERSION = "0.2.2"  # bump on every change and add a line to CHANGELOG.md

root = pathlib.Path(__file__).parent
src = root / "src"
read = lambda n: (src / n).read_text(encoding="utf-8")

css = read("base.css") + "\n" + read("themes.css")
js = "\n".join(read(n) for n in ("data.js", "display.js", "weather.js", "ui.js"))
assert "</script" not in js.lower(), "script would be cut short"
body = read("body.html").replace("__VERSION__", VERSION)
js = js.replace("__VERSION__", VERSION)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<meta name="generator" content="HomeDashboard {VERSION}">
<title>HomeDashboard</title>
<style>
{css}
</style>
</head>
<body>
{body}
<script>
(() => {{
'use strict';
{js}
window.HD = {{ version: "{VERSION}", state, A, S, V, Disp, WX, quote, legUSD, fmtNum, needs, viewOf, frame, renderWeather, fetchWeather }};
}})();
</script>
</body>
</html>
"""
out = root / "home-dashboard.html"
out.write_text(html, encoding="utf-8")
print(out, "version", VERSION, len(html), "bytes")
