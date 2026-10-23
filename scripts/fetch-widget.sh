#!/usr/bin/env bash
# Builds trust-check.js from polyguard-ai/web-sdk and copies it to
# public/vendor/trust-check.js for local development, before the SDK release
# that puts it on the CDN.
#
#   pnpm fetch-widget
#   SDK_REF=main pnpm fetch-widget            # another branch or tag
#   SDK_DIR=../web-sdk pnpm fetch-widget      # an existing checkout, as is
#
# Then set NEXT_PUBLIC_TRUST_CHECK_SCRIPT_URL=/vendor/trust-check.js in .env.local.
set -euo pipefail

SDK_REPO="${SDK_REPO:-https://github.com/polyguard-ai/web-sdk.git}"
SDK_REF="${SDK_REF:-claude/trust-check-widget-1afe1d}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/public/vendor/trust-check.js"

if [[ -n "${SDK_DIR:-}" ]]; then
  src="$(cd "$SDK_DIR" && pwd)"
else
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  echo "Cloning $SDK_REPO ($SDK_REF)"
  git clone --quiet --depth 1 --branch "$SDK_REF" "$SDK_REPO" "$tmp/web-sdk"
  src="$tmp/web-sdk"
fi

echo "Building in $src/polyguard-sdk"
(
  cd "$src/polyguard-sdk"
  npm ci --no-audit --no-fund --ignore-scripts
  npm run build
)

if [[ ! -f "$src/polyguard-sdk/dist/trust-check.js" ]]; then
  echo "dist/trust-check.js was not built. Does $SDK_REF include the widget?" >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST")"
cp "$src/polyguard-sdk/dist/trust-check.js" "$DEST"
echo "Wrote ${DEST#"$ROOT"/}"
echo "Set NEXT_PUBLIC_TRUST_CHECK_SCRIPT_URL=/vendor/trust-check.js in .env.local and restart pnpm dev."
