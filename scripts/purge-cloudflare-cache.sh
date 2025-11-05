#!/usr/bin/env bash
# Purge Cloudflare cache for the site. Requires CF_API_TOKEN and CF_ZONE_ID.
# Usage: CF_API_TOKEN=... CF_ZONE_ID=... bash scripts/purge-cloudflare-cache.sh [--everything]
# If --everything is not provided, falls back to purge_everything (safer) since CF API doesn't support wildcard file purges.

set -euo pipefail

if [[ -z "${CF_API_TOKEN:-}" || -z "${CF_ZONE_ID:-}" ]]; then
  echo "CF_API_TOKEN and CF_ZONE_ID are required" >&2
  exit 1
fi

BODY='{ "purge_everything": true }'

curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "$BODY" | jq .
