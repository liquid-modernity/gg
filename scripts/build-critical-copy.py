#!/usr/bin/env python3
from pathlib import Path
import json, argparse
ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser(); ap.add_argument('--locale',choices=['en','id'],default='id'); ap.add_argument('--surface',choices=['listing','landing','post','page','special','error','offline'],default='post'); ap.add_argument('--out',default=None); args=ap.parse_args()
copy=json.loads((ROOT/f'registry/copy/gg-copy-{args.locale}.json').read_text(encoding='utf-8'))
manifest=json.loads((ROOT/'registry/copy/gg-copy-manifest.json').read_text(encoding='utf-8'))
ns=manifest['delivery']['criticalNamespacesBySurface'][args.surface]
subset={k:v for k,v in copy.items() if any(k==n or k.startswith(n+'.') for n in ns)}
out=ROOT/(args.out or f'dist/critical-copy.{args.surface}.{args.locale}.json'); out.parent.mkdir(parents=True, exist_ok=True); out.write_text(json.dumps(subset,ensure_ascii=False,indent=2)+'\n', encoding='utf-8'); print(out)
