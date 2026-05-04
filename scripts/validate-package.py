#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
errors=[]; warnings=[]
def err(m): errors.append(m)
def warn(m): warnings.append(m)
for fp in (ROOT/'registry').rglob('*.json'):
    if 'registry/original' in str(fp.relative_to(ROOT)): continue
    try: json.loads(fp.read_text(encoding='utf-8'))
    except Exception as e: err(f'Invalid JSON: {fp.relative_to(ROOT)} :: {e}')
try:
    en=json.loads((ROOT/'registry/copy/gg-copy-en.json').read_text(encoding='utf-8')); idn=json.loads((ROOT/'registry/copy/gg-copy-id.json').read_text(encoding='utf-8'))
    if en.get('nav.home')!='Home': err('English copy sanity failed')
    if idn.get('nav.home')!='Beranda': err('Indonesian copy sanity failed')
    if set(en)!=set(idn): err('Copy key parity failed')
except Exception as e: err(f'Copy sanity failed: {e}')
for args in [[], ['--production','--out','dist/index.final.production.xml']]:
    try: subprocess.run([sys.executable,str(ROOT/'scripts/build-index.py')]+args, cwd=str(ROOT), check=True, capture_output=True, text=True, timeout=20)
    except Exception as e: err(f'Build failed {args}: {e}')
try: subprocess.run([sys.executable,str(ROOT/'scripts/build-critical-copy.py'),'--locale','id','--surface','post'], cwd=str(ROOT), check=True, capture_output=True, text=True, timeout=20)
except Exception as e: err(f'Critical copy build failed: {e}')
dev=(ROOT/'dist/index.final.xml')
if dev.exists() and 'Mary&apos;s simple recipe' in dev.read_text(encoding='utf-8'): warn('Development XML still contains dummy Mary meta; acceptable only before production')
prod=(ROOT/'dist/index.final.production.xml')
if prod.exists() and 'Mary&apos;s simple recipe' in prod.read_text(encoding='utf-8'): err('Production XML still contains dummy Mary meta')
report=['# GG Extraction QA Report\n',f'- Errors: {len(errors)}\n',f'- Warnings: {len(warnings)}\n']
if errors: report+=['\n## Errors\n']+[f'- {e}\n' for e in errors]
if warnings: report+=['\n## Warnings\n']+[f'- {w}\n' for w in warnings]
if not errors: report+=['\nResult: PASS for static package checks. Live Blogger/Cloudflare tests are still required.\n']
(ROOT/'qa/qa-report.md').write_text(''.join(report), encoding='utf-8'); print(''.join(report))
if errors: sys.exit(1)
