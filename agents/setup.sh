#!/usr/bin/env bash
# Bootstrap superpowers skills and pi.dev config for agent harness.
# Run this once per clone before using pi.dev on this repo.
# Both .superpowers/ and .pi/ are gitignored — they are local only.
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUPERPOWERS_DIR="$REPO_ROOT/.superpowers"
PI_DIR="$REPO_ROOT/.pi"

# Clone superpowers if not present; pull latest if already there.
if [ ! -d "$SUPERPOWERS_DIR" ]; then
  echo "Cloning superpowers..."
  git clone --depth=1 https://github.com/obra/superpowers.git "$SUPERPOWERS_DIR"
else
  echo "Updating superpowers..."
  git -C "$SUPERPOWERS_DIR" pull --ff-only
fi

# Create .pi directory.
mkdir -p "$PI_DIR"

# Write pi.dev project settings pointing to selected skills.
# Skills chosen for q2w-mapcss: CSS framework + build system, no test suite.
# Excluded: test-driven-development (no tests), writing-skills (meta),
#           using-git-worktrees (not needed), executing-plans (covered by sdd).
cat > "$PI_DIR/settings.json" << 'EOF'
{
  "skills": [
    "../.superpowers/skills/using-superpowers",
    "../.superpowers/skills/brainstorming",
    "../.superpowers/skills/writing-plans",
    "../.superpowers/skills/subagent-driven-development",
    "../.superpowers/skills/dispatching-parallel-agents",
    "../.superpowers/skills/systematic-debugging",
    "../.superpowers/skills/verification-before-completion",
    "../.superpowers/skills/requesting-code-review",
    "../.superpowers/skills/receiving-code-review",
    "../.superpowers/skills/finishing-a-development-branch"
  ]
}
EOF

echo ""
echo "Done. pi.dev is configured with superpowers skills for q2w-mapcss."
echo "Skill paths resolve from .pi/ → ../.superpowers/skills/<name>/"
echo ""
echo "Available skills:"
echo "  using-superpowers              bootstrap — loaded at every session start"
echo "  brainstorming                  explore intent before building new features"
echo "  writing-plans                  write implementation plan before touching code"
echo "  subagent-driven-development    dispatch fresh subagents per task, with review"
echo "  dispatching-parallel-agents    run 2+ independent tasks concurrently"
echo "  systematic-debugging           diagnose bugs before proposing fixes"
echo "  verification-before-completion run checks before claiming work is done"
echo "  requesting-code-review         review after implementing major changes"
echo "  receiving-code-review          handle review feedback with rigor"
echo "  finishing-a-development-branch wrap up a branch cleanly before merge/PR"
