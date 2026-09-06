#!/usr/bin/env python3
"""Annotate baseline prototype screenshots with pedagogical callouts."""
import subprocess
import sys
from pathlib import Path

SCREENS = Path('/Users/srinivasvedantam/Documents/Me/elemes/v2/project-docs-v6/docs/review/screenshots')
OUT = Path('/Users/srinivasvedantam/Documents/Me/elemes/v2/project-docs-v6/docs/review/learning')

MAGICK = '/opt/homebrew/bin/magick'

JOBS = [
    # 01 — embeddings calibration block (STRENGTH — green)
    {
        'src': SCREENS / '01-embeddings-top.png',
        'out': OUT / 'annotated-01-embeddings-calibration.png',
        'colour': '#16a34a',
        'fill_rgba': 'rgba(22,163,74,0.10)',
        'rect': (380, 410, 1050, 830),
        'callout_xy': (370, 410),
        'label': '1',
    },
    # 02 — finance hero (WEAKNESS — red: drag-without-prediction)
    {
        'src': SCREENS / '02-finance-top.png',
        'out': OUT / 'annotated-02-finance-no-predict.png',
        'colour': '#dc2626',
        'fill_rgba': 'rgba(220,38,38,0.10)',
        'rect': (330, 540, 580, 600),
        'callout_xy': (320, 540),
        'label': '2',
    },
    # 03 — bicycle commit moment (STRENGTH — green: forced 3-way choice)
    {
        'src': SCREENS / '04-mechanics-top.png',
        'out': OUT / 'annotated-03-bicycle-commit.png',
        'colour': '#16a34a',
        'fill_rgba': 'rgba(22,163,74,0.10)',
        'rect': (425, 455, 1020, 820),
        'callout_xy': (415, 455),
        'label': '3',
    },
    # 04 — marketing reveal (WEAKNESS — red: zero-friction reveal)
    {
        'src': SCREENS / '03-marketing-top.png',
        'out': OUT / 'annotated-04-marketing-passive.png',
        'colour': '#dc2626',
        'fill_rgba': 'rgba(220,38,38,0.10)',
        'rect': (375, 175, 1050, 640),
        'callout_xy': (365, 175),
        'label': '4',
    },
]

for j in JOBS:
    x1, y1, x2, y2 = j['rect']
    cx, cy = j['callout_xy']
    cmd = [
        MAGICK, str(j['src']),
        '-fill', j['fill_rgba'], '-stroke', j['colour'], '-strokewidth', '4',
        '-draw', f'rectangle {x1},{y1} {x2},{y2}',
        '-fill', 'white', '-stroke', j['colour'], '-strokewidth', '2',
        '-draw', f'circle {cx},{cy} {cx},{cy+20}',
        '-fill', j['colour'], '-stroke', 'none',
        '-font', 'Helvetica-Bold', '-pointsize', '24',
        '-annotate', f'+{cx-7}+{cy+9}', j['label'],
        str(j['out']),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(f"{j['out'].name}: rc={r.returncode}")
    if r.returncode != 0:
        print('  stderr:', r.stderr.strip()[:300])
        sys.exit(1)

print('done')
