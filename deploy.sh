#!/usr/bin/env bash

############################################################
# Unified Production Deployment Script
# ------------------------------------
# Automates the local commit + push flow and the remote build
# + restart cycle used for the shiny-friend-disco project.
#
# Usage:
#   ./deploy.sh                          # auto commit + deploy
#   ./deploy.sh -m "feat: awesome"       # custom commit message
#   ./deploy.sh --no-commit              # skip git add/commit
#
# Requirements:
#   • one-last-ai.pem key present in repo root
#   • ssh access to ubuntu@47.129.43.231
#   • pm2 configured with shiny-backend + shiny-frontend
############################################################

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

SERVER="ubuntu@47.130.228.100"
SSH_KEY="$REPO_ROOT/one-last-ai.pem"
REMOTE_DIR="~/shiny-friend-disco"
COMMIT_MSG="chore: deploy $(date +'%Y-%m-%d %H:%M:%S')"
SKIP_COMMIT=false

print_status() {
  echo "\n============================================"
  echo "$1"
  echo "============================================\n"
}

usage() {
  cat <<EOF
Usage: $0 [options]

Options:
  -m, --message "msg"   Use custom git commit message
  --no-commit           Skip git add/commit (use when already pushed)
  -h, --help            Show this help message
EOF
}

# ----------------------------
# Parse CLI arguments
# ----------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message)
      shift || { echo "Missing commit message"; exit 1; }
      COMMIT_MSG="$1"
      ;;
    --no-commit)
      SKIP_COMMIT=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
  shift || break
done

if [[ ! -f "$SSH_KEY" ]]; then
  echo "❌ SSH key not found at $SSH_KEY"
  exit 1
fi

print_status "1) Checking git status"
git status -sb

if [[ "$SKIP_COMMIT" = false ]]; then
  if git diff --quiet && git diff --cached --quiet; then
    echo "No local changes detected. Skipping commit."
  else
    print_status "Staging and committing changes"
    git add -A
    git commit -m "$COMMIT_MSG" || echo "⚠️ Nothing to commit. Continuing."
  fi
else
  echo "Skipping git add/commit per --no-commit"
fi

print_status "2) Pushing to origin/main"
git push origin main

print_status "3) Deploying to production server"
SSH_COMMAND=$(cat <<'REMOTE'
set -euo pipefail
cd ~/shiny-friend-disco

echo "📦 Pulling latest code"
git fetch origin main
git reset --hard origin/main

echo "🔧 Installing backend dependencies"
cd backend
npm ci --omit=dev
pm2 restart shiny-backend || true

cd ..

echo "📦 Preparing frontend build"
cd frontend

echo "📦 Installing frontend dependencies"
npm ci

echo "🛟 Ensuring mongodb and mongoose are installed (safety net)"
npm install mongodb@^6.21.0 mongoose@^8.0.0 --no-save || echo "⚠️ Optional mongodb/mongoose safety install failed; continuing if already present"

echo "🏗️ Building Next.js frontend"
NEXT_TELEMETRY_DISABLED=1 npm run build

echo "🔄 Restarting frontend"
pm2 restart shiny-frontend || true

echo "📊 PM2 status"
pm2 list
REMOTE
)

ssh -tt -i "$SSH_KEY" "$SERVER" "$SSH_COMMAND"


print_status "4) Automated diagnostics and fix"
ssh -tt -i "$SSH_KEY" "$SERVER" "\
  echo '--- Checking port bindings ---'; \
  ss -tuln | grep ':3000'; \
  ss -tuln | grep ':3005'; \
  echo '\n--- PM2 process info ---'; \
  pm2 info shiny-backend; \
  pm2 info shiny-frontend; \
  echo '\n--- NGINX error log (last 50 lines) ---'; \
  sudo tail -n 50 /var/log/nginx/maula.ai-error.log; \
  echo '\n--- Updating NGINX config ---'; \
  sudo cp ~/shiny-friend-disco/nginx/maula.ai.conf /etc/nginx/sites-available/ 2>/dev/null || echo 'NGINX config copy skipped'; \
  echo '\n--- Restarting NGINX ---'; \
  sudo nginx -t && sudo systemctl restart nginx; \
  echo '\n--- Retesting endpoints ---'; \
  curl -f https://maula.ai/api/status | head -c 200 || echo 'Status endpoint failed'; \
  curl -f https://maula.ai/api/user/profile | head -c 200 || echo 'Profile endpoint failed'; \
"

print_status "✅ Deployment and diagnostics complete"
