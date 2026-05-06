#!/usr/bin/env bash
# Render all 5 lesson mp3s for a course using macOS `say` + Indian-English voice.
# Reads TTS scripts from docs/courses/<course-slug>/tts/gemini/[1-5]-<lesson>.md
# and writes mp3s to public/audio/<course-slug>/<lesson-slug>.mp3.
#
# Usage:
#   ./scripts/render-tts-all.sh <course-slug> [voice] [rate-wpm]
#   npm run course:audio <course-slug>
#
# Defaults: voice=Aman (en_IN male), rate=130 wpm. For production-grade audio,
# render the same TTS scripts through Google Cloud TTS (en-IN-Chirp3-HD-Charon)
# or ElevenLabs (Niraj) — see docs/courses/<slug>/tts/gemini/_README.md.

set -euo pipefail

COURSE="${1:?Usage: render-tts-all.sh <course-slug> [voice] [rate]}"
VOICE="${2:-Aman}"
RATE="${3:-130}"

TTS_DIR="docs/courses/${COURSE}/tts/gemini"
OUT_DIR="public/audio/${COURSE}"

if [[ ! -d "$TTS_DIR" ]]; then
  echo "✗ TTS scripts not found at $TTS_DIR" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

count=0
for tts in "$TTS_DIR"/[0-9]-*.md; do
  [[ -f "$tts" ]] || continue
  fname=$(basename "$tts" .md | sed -E 's/^[0-9]-//')
  out="${OUT_DIR}/${fname}.mp3"
  ./scripts/render-tts-local.sh "$tts" "$out" "$VOICE" "$RATE" 2>&1 | tail -1
  count=$((count + 1))
done

echo ""
echo "✓ Rendered $count lessons → $OUT_DIR/"
echo ""
echo "Note: macOS \`say\` is functional but robotic. For production audio, render"
echo "the same scripts through Google Cloud TTS (en-IN-Chirp3-HD-Charon) or"
echo "ElevenLabs (Niraj) and drop the mp3s in $OUT_DIR/."
