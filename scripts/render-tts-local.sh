#!/usr/bin/env bash
# Render lesson narration to mp3 using macOS `say` + Indian-English voice + ffmpeg.
# Strips Composer audio tags, markdown, frontmatter; keeps the narratable text.
#
# Usage:
#   ./scripts/render-tts-local.sh <input.md> <output.mp3> [voice] [rate-wpm]
# Defaults: voice=Aman, rate=165
#
# This is a placeholder pipeline. Quality is robotic; swap to Google Cloud TTS
# (en-IN-Chirp3-HD-Charon) or ElevenLabs (Niraj) for production.

set -euo pipefail

IN="${1:?need input markdown}"
OUT="${2:?need output mp3 path}"
VOICE="${3:-Aman}"
RATE="${4:-165}"

if [[ ! -f "$IN" ]]; then echo "✗ input not found: $IN" >&2; exit 1; fi

TMP="$(mktemp -d)"
TXT="$TMP/clean.txt"
AIFF="$TMP/out.aiff"

# Strip everything up to the first speech block, then clean per line.
awk '
  /^### Speech block/ { in_blocks=1 }
  in_blocks { print }
' "$IN" \
| sed -E '
    # Drop HTML comments (multi-line handled by awk pre-pass below; this also
    # catches single-line ones).
    /<!--.*-->/d
  ' \
| awk '
    # Multi-line comment stripper.
    BEGIN { skip=0 }
    /<!--/ { skip=1 }
    !skip { print }
    /-->/ { skip=0 }
  ' \
| sed -E '
    # Drop the Speech block heading lines themselves; replace with a soft pause.
    s/^### Speech block.*$/. . ./
    # Strip [bracketed audio tags] anywhere on the line.
    s/\[[^]]*\]//g
    # Strip markdown emphasis markers but keep the inner text.
    s/\*\*([^*]+)\*\*/\1/g
    s/\*([^*]+)\*/\1/g
    s/_([^_]+)_/\1/g
    # Strip leading markdown bullets and quotes.
    s/^[[:space:]]*[-*•>][[:space:]]+//
    # Strip remaining headings (## etc).
    s/^[[:space:]]*#+[[:space:]].*$//
    # Compress horizontal rules and stray ticks.
    s/^---+$//
    s/`+//g
  ' \
| awk '
    # Skip empty lines but preserve paragraph spacing as comma pauses.
    NF { print; blank=0; next }
    !blank { print ","; blank=1 }
  ' \
> "$TXT"

if [[ ! -s "$TXT" ]]; then echo "✗ stripped script is empty for $IN" >&2; exit 1; fi

WORDS=$(wc -w < "$TXT" | tr -d ' ')
echo "✓ stripped: $WORDS words → $TXT"

# Render with macOS say. Aman is en_IN; -r is words/minute.
say -v "$VOICE" -r "$RATE" -f "$TXT" -o "$AIFF"

# Convert to mp3, mono, 128 kbps.
mkdir -p "$(dirname "$OUT")"
ffmpeg -y -i "$AIFF" -c:a libmp3lame -b:a 128k -ac 1 -ar 44100 "$OUT" 2>/dev/null

DUR=$(ffprobe -i "$OUT" -show_entries format=duration -v quiet -of csv="p=0" 2>/dev/null)
DUR_INT=$(printf "%.0f" "$DUR")
MIN=$((DUR_INT / 60))
SEC=$((DUR_INT % 60))
echo "✓ rendered: $OUT ($MIN:$(printf '%02d' $SEC))"

rm -rf "$TMP"
