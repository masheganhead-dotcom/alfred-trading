#!/usr/bin/env bash
# Install the global Claude Code harness into ~/.claude/.
#
# Usage:
#   bash install.sh             # interactive
#   bash install.sh --force     # overwrite without prompting (backs up first)
#
# Re-run safely on every machine you use Claude Code on. Existing files
# are moved to ~/.claude.bak.<timestamp>/ before being replaced.

set -euo pipefail

FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DST_DIR="${HOME}/.claude"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${HOME}/.claude.bak.${TS}"

FILES=(
  "CLAUDE.md"
  "settings.json"
  "hooks/session_start.py"
  "hooks/pre_tool_use.py"
  "agents/code-reviewer.md"
  "agents/python-pro.md"
)

echo "Source : ${SRC_DIR}"
echo "Target : ${DST_DIR}"
echo

NEEDS_BACKUP=0
for f in "${FILES[@]}"; do
  if [[ -e "${DST_DIR}/${f}" ]]; then
    NEEDS_BACKUP=1
    break
  fi
done

if [[ ${NEEDS_BACKUP} -eq 1 ]]; then
  if [[ ${FORCE} -eq 0 ]]; then
    echo "Existing files found in ${DST_DIR}. They will be backed up to:"
    echo "  ${BACKUP_DIR}"
    read -r -p "Continue? [y/N] " ans
    case "${ans}" in
      y|Y|yes|YES) ;;
      *) echo "Aborted."; exit 1 ;;
    esac
  fi
  mkdir -p "${BACKUP_DIR}"
  for f in "${FILES[@]}"; do
    if [[ -e "${DST_DIR}/${f}" ]]; then
      mkdir -p "${BACKUP_DIR}/$(dirname "${f}")"
      mv "${DST_DIR}/${f}" "${BACKUP_DIR}/${f}"
    fi
  done
  echo "Backed up existing files to ${BACKUP_DIR}"
fi

mkdir -p "${DST_DIR}/hooks" "${DST_DIR}/agents" "${DST_DIR}/logs"

for f in "${FILES[@]}"; do
  cp "${SRC_DIR}/${f}" "${DST_DIR}/${f}"
  echo "Installed ${DST_DIR}/${f}"
done

chmod +x "${DST_DIR}/hooks/session_start.py" "${DST_DIR}/hooks/pre_tool_use.py"

echo
echo "Done. Restart any active Claude Code sessions to pick up the new config."
echo "Test:"
echo "  echo '{\"source\":\"startup\"}' | python3 ${DST_DIR}/hooks/session_start.py --load-context"
echo "  echo '{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"git push --force\"}}' | python3 ${DST_DIR}/hooks/pre_tool_use.py"
