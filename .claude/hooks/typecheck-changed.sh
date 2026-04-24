#!/usr/bin/env bash
# Non-blocking: run typecheck after a TS/TSX edit and report errors.
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then exit 0; fi
if [[ ! -f package.json ]]; then exit 0; fi
if ! jq -e '.scripts.typecheck' package.json >/dev/null 2>&1; then exit 0; fi

output=$(npm run --silent typecheck 2>&1 || true)
if echo "$output" | grep -Eq '(error TS|Found [0-9]+ error)'; then
  echo "--- typecheck issues after edit ---" >&2
  echo "$output" | tail -n 40 >&2
fi

exit 0
