#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID=$(yq -r '.project_id' .pmo/config.yaml)
REPO="${GITHUB_REPOSITORY}"  # owner/name of THIS repo from Actions env
OUT_DIR="export"
mkdir -p "$OUT_DIR"

api() {
  local path="$1"
  curl -sS -H "Authorization: Bearer ${GITHUB_TOKEN}" \
           -H "Accept: application/vnd.github+json" \
           "https://api.github.com/repos/${REPO}/${path}"
}

# Open issues (exclude PRs)
ISSUES=$(api "issues?state=open&per_page=100" | jq '[ .[] | select(has("pull_request")|not)
  | {id, number, title, labels: [.labels[].name], assignees: [.assignees[].login],
     created_at, updated_at, html_url} ]')

# Open PRs
PRS=$(api "pulls?state=open&per_page=100" | jq '[ .[] | {
  id, number, title, labels: (.labels // [] | [.[]?.name]),
  user: .user.login, draft, created_at, updated_at,
  html_url, base: .base.ref, head: .head.ref } ]')

# Labels
LABELS=$(api "labels?per_page=100" | jq '[ .[] | {name, color, description} ]')

jq -n --arg pid "$PROJECT_ID" --arg repo "$REPO" \
      --arg generated "$(date -u +%FT%TZ)" \
      --argjson issues "$ISSUES" --argjson prs "$PRS" --argjson labels "$LABELS" \
'{
  project: $pid, repo: $repo, generated_at: $generated,
  items: { issues: $issues, prs: $prs, labels: $labels }
}' > "$OUT_DIR/$PROJECT_ID.json"

echo "Wrote $OUT_DIR/$PROJECT_ID.json"