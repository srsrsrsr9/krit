#!/bin/bash
# Usage: ./take-screenshot.sh <url> <out-path> [width=1440] [height=900] [wait-ms=5000]
URL="$1"
OUT="$2"
W="${3:-1440}"
H="${4:-900}"
WAIT="${5:-5000}"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
  --window-size="${W},${H}" \
  --virtual-time-budget="${WAIT}" \
  --screenshot="$OUT" \
  "$URL" 2>/dev/null
echo "Wrote $OUT ($(stat -f%z "$OUT" 2>/dev/null || echo '?') bytes)"
