#!/usr/bin/env bash
# Checks that every action in .github/workflows is pinned to a full commit SHA (with its version in a comment, which
# Dependabot keeps up to date) and is either GitHub's own (actions/*) or listed in .github/allowed-actions.txt.
set -euo pipefail
cd "$(dirname "$0")/.."

mapfile -t allowed < <(grep -vE '^\s*(#|$)' .github/allowed-actions.txt)
failed=0
while IFS= read -r line; do
  file=${line%%:*}
  rest=${line#*:}
  number=${rest%%:*}
  uses=$(sed -E 's/.*uses:[[:space:]]*//' <<< "${rest#*:}")
  [[ $uses == ./* ]] && continue # a workflow of this repository
  action=${uses%%@*}
  ref=${uses#*@}
  if ! [[ $ref =~ ^[0-9a-f]{40}[[:space:]]+#[[:space:]]+v[0-9] ]]; then
    echo "$file:$number: $action is not pinned to a full commit SHA with its version as a comment" >&2
    failed=1
  fi
  if [[ $action != actions/* ]] && ! printf '%s\n' "${allowed[@]}" | grep -qxF "$action"; then
    echo "$file:$number: $action is not in .github/allowed-actions.txt" >&2
    failed=1
  fi
done < <(grep -nH -E '^\s*-?\s*uses:' .github/workflows/*.yml)
exit $failed
