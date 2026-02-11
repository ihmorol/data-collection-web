#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SOURCE="${SCRIPT_DIR}/../skills"
DEST_DIR="${SCRIPT_DIR}/skills"

TEAM_SKILLS=(
  concise-planning
  senior-architect
  ui-ux-pro-max
  app-builder
  senior-fullstack
  database-design
  clean-code
  webapp-testing
  vercel-deployment
)

echo "⚡ Web App Team Lite Installer"
echo "=============================="
echo "Source:      $SKILLS_SOURCE"
echo "Destination: $DEST_DIR"
echo "Skills:      ${#TEAM_SKILLS[@]} total"
echo

read -r -p "Install these team skills now? [y/N]: " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

mkdir -p "$DEST_DIR"

INSTALLED=0
SKIPPED=0
FAILED=0

for skill in "${TEAM_SKILLS[@]}"; do
  source_path="${SKILLS_SOURCE}/${skill}"
  target_path="${DEST_DIR}/${skill}"

  if [[ ! -d "$source_path" ]]; then
    echo "  ❌ MISSING: $skill (not found at $source_path)"
    FAILED=$((FAILED + 1))
    continue
  fi

  if [[ -e "$target_path" ]]; then
    echo "  ⏭  SKIP:    $skill (already installed)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  cp -R "$source_path" "$target_path"
  echo "  ✅ OK:      $skill"
  INSTALLED=$((INSTALLED + 1))
done

echo
echo "=============================="
echo "Results: $INSTALLED installed, $SKIPPED skipped, $FAILED failed"
echo

if [[ "$FAILED" -gt 0 ]]; then
  echo "⚠️  Some skills were missing."
  exit 1
fi

echo "✅ Installation complete!"
echo "📖 Team doc: $SCRIPT_DIR/WEBAPP_TEAM_LITE.md"
