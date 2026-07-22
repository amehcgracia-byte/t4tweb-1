#!/usr/bin/env bash
set -euo pipefail

paths=(components app scripts-backup package.json)
if [[ -d scripts ]]; then
  paths+=(scripts)
fi

if rg -n "^(<<<<<<<|=======|>>>>>>>)" "${paths[@]}" >/tmp/conflict_markers.txt; then
  echo "❌ Merge conflict markers found:" >&2
  cat /tmp/conflict_markers.txt >&2
  exit 1
fi

echo "✅ No merge conflict markers found."
