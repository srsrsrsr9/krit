#!/usr/bin/env bash
# If the user prompt describes a protocol that has a slash command, nudge.
set -euo pipefail

payload=$(cat)
prompt=$(printf '%s' "$payload" | jq -r '.user_prompt // ""' | tr '[:upper:]' '[:lower:]')

suggest=""
if echo "$prompt" | grep -Eq "deploy (to )?prod(uction)?"; then
  suggest="$suggest\n- /ship production (or /break-glass for an emergency)"
fi
if echo "$prompt" | grep -Eq "(plan|planning) (this|the) (feature|work|change)"; then
  suggest="$suggest\n- /plan to write docs/PLAN.md and wait for approval"
fi
if echo "$prompt" | grep -Eq "bug|error|not working|doesn.t work|failing"; then
  suggest="$suggest\n- /bugfix to drive the structured protocol"
fi
if echo "$prompt" | grep -Eq "prototype|mock[- ]?up|spec"; then
  suggest="$suggest\n- /spec to scaffold docs/specs/[name].md and an HTML prototype"
fi

if [[ -n "$suggest" ]]; then
  printf 'Slash commands available for this:%b\n' "$suggest"
fi

exit 0
