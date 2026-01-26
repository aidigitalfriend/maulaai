#!/usr/bin/env bash

############################################################
# Maula AI - Production Deployment Script
# ------------------------------------
# Automates the local commit + push flow and the remote build
# + restart cycle for the maula.ai project.
#
# Usage:
#   ./deploy.sh                          # auto commit + deploy
#   ./deploy.sh -m "feat: awesome"       # custom commit message
#   ./deploy.sh --no-commit              # skip git add/commit
#
# Requirements:
#   • victorykit.pem key present in repo root
#   • ssh access to ubuntu@18.140.156.40
#   • pm2 configured with maula-backend + maula-frontend
############################################################

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

SERVER="ubuntu@18.140.156.40"
SSH_KEY="$REPO_ROOT/victorykit.pem"
REMOTE_DIR="~/maula-ai"
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
cd ~/maula-ai

echo "📦 Pulling latest code"
git stash || true
git fetch origin main
git reset --hard origin/main

echo "🔧 Installing backend dependencies"
cd backend
npm ci --omit=dev

echo "🗄️ Generating Prisma client"
npx prisma generate

echo "�️ Pushing schema changes to database"
npx prisma db push --accept-data-loss || echo "⚠️ Schema push failed (may already be up to date)"

echo "�🔄 Restarting backend"
pm2 restart maula-backend || true

cd ..

echo "📦 Preparing frontend build"
cd frontend

echo "📦 Installing frontend dependencies"
npm ci

echo "🏗️ Building Next.js frontend"
NEXT_TELEMETRY_DISABLED=1 npm run build

echo "🔄 Restarting frontend"
pm2 restart maula-frontend || true

echo "🌐 Updating nginx config"
if [ -f nginx/maula.ai.conf ]; then
  sudo cp nginx/maula.ai.conf /etc/nginx/sites-available/maula.ai
  sudo nginx -t && sudo systemctl reload nginx
  echo "✅ Nginx config updated and reloaded"
else
  echo "⚠️ nginx config not found, skipping"
fi

echo "📊 PM2 status"
pm2 list
REMOTE
)

ssh -tt -i "$SSH_KEY" "$SERVER" "$SSH_COMMAND"


print_status "4) Automated diagnostics and fix"
ssh -tt -i "$SSH_KEY" "$SERVER" "\
  echo '--- Checking port bindings ---'; \
  ss -tuln | grep ':3100' || true; \
  ss -tuln | grep ':3005' || true; \
  echo '\n--- PM2 process info ---'; \
  pm2 info maula-backend || true; \
  pm2 info maula-frontend || true; \
  echo '\n--- Retesting endpoints ---'; \
  curl -f http://localhost:3100/api/status | head -c 200 || echo 'Status endpoint failed'; \
"

print_status "✅ Deployment and diagnostics complete"
