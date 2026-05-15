#!/usr/bin/env python3
from pathlib import Path
import argparse, re, json
ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser()
ap.add_argument('--production', action='store_true')
ap.add_argument('--out', default='dist/index.final.xml')
ap.add_argument('--full-inline-css', action='store_true', help='rollback: inline the full app stylesheet in b:skin')
args=ap.parse_args()
xml=(ROOT/'template/index.original.xml').read_text(encoding='utf-8')
inline_css_path=ROOT/('src/css/gg-app.source.css' if args.full_inline_css else 'src/css/gg-critical.source.css')
css=inline_css_path.read_text(encoding='utf-8').rstrip()+'\n'
theme=(ROOT/'src/js/boot/theme-preboot.js').read_text(encoding='utf-8').strip()
startup=(ROOT/'src/js/boot/body-startup.js').read_text(encoding='utf-8').strip()
app=(ROOT/'src/js/gg-app.source.js').read_text(encoding='utf-8').strip()
xml=re.sub(r"(<b:skin><!\[CDATA\[\n).*?(\n\s*\]\]></b:skin>)", lambda m:m.group(1)+css+m.group(2), xml, flags=re.S)
xml=re.sub(r"/__gg/assets/css/gg-app\.(?:dev|min)\.css", "/__gg/assets/css/gg-app.min.css" if args.production else "/__gg/assets/css/gg-app.dev.css", xml)
xml=re.sub(r"<script>//<!\[CDATA\[\n\s*\(function \(\) \{\n\s*try \{\n\s*var theme = window\.localStorage.*?//\]\]></script>", lambda m:"<script>//<![CDATA[\n"+theme+"\n    //]]></script>", xml, count=1, flags=re.S)
xml=re.sub(r"(<body[^>]*>\n\s*)<script type='text/javascript'>\n\s*//<!\[CDATA\[.*?//\]\]>\n\s*</script>", lambda m:m.group(1)+"<script type='text/javascript'>\n      //<![CDATA[\n"+startup+"\n      //]]>\n      </script>", xml, count=1, flags=re.S)
start=xml.rfind("    <script>//<![CDATA[\n      window.GG = window.GG || {};")
if start<0:
    start=xml.rfind("    <script>//<![CDATA[\nwindow.GG = window.GG || {};")
end=xml.rfind("  </body>")
if start<0 or end<0 or start>end: raise SystemExit('Could not locate final big app script safely.')
xml=xml[:start]+"    <script>//<![CDATA[\n"+app+"//]]></script>\n"+xml[end:]
if args.production:
    xml=re.sub(r"\n\s*<meta content='Mary&apos;s simple recipe.*?name='description'/>", "", xml, count=1, flags=re.S)
    flags=json.loads((ROOT/'registry/runtime/gg-flags.production.example.json').read_text(encoding='utf-8'))
    if flags.get('mode')!='production': raise SystemExit('Production flags are not production mode.')
    rb=flags.get('robots',{})
    if rb.get('developmentLockdown') or rb.get('blockAiBots') or rb.get('blockSearchBots'):
        raise SystemExit('Production flags still block bots.')
out=ROOT/args.out; out.parent.mkdir(parents=True, exist_ok=True); out.write_text(xml, encoding='utf-8'); print(out)
