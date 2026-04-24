#!/usr/bin/env bash
# Block git commit / push / PR-create / prod-deploy unless the user's latest
# prompt authorized it. Reads the Claude Code hook JSON from stdin.
set -euo pipefail

payload=$(cat)
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')
user_prompt=$(printf '%s' "$payload" | jq -r '.context.user_prompt // ""' | tr '[:upper:]' '[:lower:]')

needs_consent=0
case "$cmd" in
  *"git commit"*|*"git push"*|*"gh pr create"*|*"gh pr merge"*|*"vercel --prod"*|*"npm publish"*)
    needs_consent=1
    ;;
esac

if [[ $needs_consent -eq 1 ]]; then
  if echo "$user_prompt" | grep -Eq "\b(commit|push|merge|deploy|publish|ship)\b"; then
    exit 0
  fi
  echo "BLOCKED: '$cmd' requires the developer to ask for it explicitly." >&2
  echo "If the intent was to prepare changes, stage them instead and stop." >&2
  exit 2
fi

exit 0
