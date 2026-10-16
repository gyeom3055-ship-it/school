#!/usr/bin/env python3
"""Build the DIGITAL GUARD pixel prototype.

Embeds subsetted Galmuri pixel fonts (SIL OFL 1.1) into game.html and writes:
  - ../digital-guard-pixel.html : standalone page (open directly in a browser)
  - <artifact_out> (optional)    : body-only copy for publishing as a claude.ai Artifact

Usage: python3 build.py <galmuri dist dir> [artifact_out]
  (galmuri dist dir: `npm install galmuri`, then node_modules/galmuri/dist)
Requires: pip install fonttools brotli
"""
import base64, io, os, sys
from fontTools import subset
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'game.html'), encoding='utf-8').read()
dist = sys.argv[1]

# KS X 1001 Hangul (2,350 common syllables) + ASCII + every character used in the page,
# so short text edits keep rendering in the pixel font.
ksx = ''.join(bytes([hi, lo]).decode('euc-kr') for hi in range(0xB0, 0xC9) for lo in range(0xA1, 0xFF))
chars = set(ksx) | {chr(c) for c in range(0x20, 0x7F)} | set(src) | set('·…“”‘’→←↔▶▸◀★☆●○■□※✓✕×—–')

def embed(name):
    font = TTFont(os.path.join(dist, name))
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']
    sub = subset.Subsetter(opts); sub.populate(unicodes=[ord(c) for c in chars]); sub.subset(font)
    buf = io.BytesIO(); font.flavor = 'woff2'; font.save(buf)
    return base64.b64encode(buf.getvalue()).decode('ascii')

out = (src.replace('__FONT_BODY__', embed('Galmuri11.woff2'))
          .replace('__FONT_BOLD__', embed('Galmuri11-Bold.woff2'))
          .replace('__FONT_HEAD__', embed('Galmuri14.woff2'))
          .replace('__FONT_MONO__', embed('GalmuriMono11.woff2')))

page = ('<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '</head>\n<body>\n' + out + '\n</body>\n</html>\n')
standalone = os.path.join(HERE, '..', 'digital-guard-pixel.html')
open(standalone, 'w', encoding='utf-8').write(page)
print('wrote', os.path.normpath(standalone), round(len(page) / 1024), 'KB')
if len(sys.argv) > 2:
    open(sys.argv[2], 'w', encoding='utf-8').write(out)
    print('wrote', sys.argv[2])
