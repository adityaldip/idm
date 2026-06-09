#!/bin/bash
# Run ON THE CPANEL SERVER after uploading next-build.zip to ~/repositories/idm/
set -euo pipefail

cd ~/repositories/idm
source ~/nodevenv/repositories/idm/20/bin/activate

echo "=== Stopping stale Node processes ==="
pkill -9 -u "$(whoami)" node 2>/dev/null || true
sleep 2

echo "=== Removing old .next (required — do not skip) ==="
rm -rf .next

if [ ! -f next-build.zip ]; then
  echo "ERROR: next-build.zip not found in $(pwd)"
  echo "Upload it via cPanel File Manager first."
  exit 1
fi

echo "=== Extracting build ==="
unzip -o next-build.zip

echo "=== Verifying extracted files ==="
cat .next/BUILD_ID

if [ -f .next/static/chunks/5530-06a54b28eb37c890.js ]; then
  echo "ERROR: Stale chunk from an old build is still present."
  echo "Run: rm -rf .next && unzip -o next-build.zip"
  exit 1
fi

REQUIRED_CHUNK=$(ls .next/static/chunks/5530-*.js 2>/dev/null | head -1 || true)
if [ -z "$REQUIRED_CHUNK" ]; then
  echo "ERROR: Missing 5530 chunk in extracted build."
  exit 1
fi
echo "5530 chunk on disk: $(basename "$REQUIRED_CHUNK")"

node scripts/check-server-deploy.mjs || {
  echo ""
  echo "Deploy verification failed. Do NOT run npm run build on the server."
  exit 1
}

echo "=== Restarting Passenger ==="
mkdir -p tmp
touch tmp/restart.txt

echo ""
echo "Done. Open https://ptintandayamandiri.co.id and hard-refresh (Cmd+Shift+R)."
