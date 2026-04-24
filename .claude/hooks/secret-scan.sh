#!/usr/bin/env bash
# Scan content about to be written/edited for common secret patterns.
# Blocks with exit 2 if a match is found outside of .env.example / docs.
set -euo pipefail

payload=$(cat)
path=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // ""')
content=$(printf '%s' "$payload" | jq -r '.tool_input.content // .tool_input.new_string // ""')

case "$path" in
  *.env.example|*.md|*.mdx) exit 0 ;;
esac

patterns=(
  'sk_live_[0-9a-zA-Z]{20,}'
  'sk_test_[0-9a-zA-Z]{20,}'
  'pk_live_[0-9a-zA-Z]{20,}'
  'rk_live_[0-9a-zA-Z]{20,}'
  'AKIA[0-9A-Z]{16}'
  'xox[baprs]-[0-9a-zA-Z-]{20,}'
  'ghp_[0-9a-zA-Z]{30,}'
  'github_pat_[0-9a-zA-Z_]{30,}'
  'AIza[0-9A-Za-z\-_]{30,}'
  'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}'
  '-----BEGIN (RSA|EC|OPENSSH|PRIVATE) (PRIVATE )?KEY-----'
)

for p in "${patterns[@]}"; do
  if printf '%s' "$content" | grep -Eq "$p"; then
    echo "BLOCKED: secret-like pattern detected in $path (matches /$p/)." >&2
    echo "Move the value to an env var and reference via process.env." >&2
    exit 2
  fi
done

exit 0
