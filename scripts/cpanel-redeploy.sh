#!/bin/bash
# Run ON THE CPANEL SERVER after uploading next-build.zip to ~/repositories/idm/
set -euo pipefail

cd ~/repositories/idm
# cPanel nodevenv activate references CL_VIRTUAL_ENV; tolerate unbound under set -u
set +u
source ~/nodevenv/repositories/idm/20/bin/activate
set -u

# Check the upload BEFORE touching the running app — otherwise a missing or
# truncated zip leaves the site down with no .next to serve.
if [ ! -f next-build.zip ]; then
  echo "ERROR: next-build.zip not found in $(pwd)"
  echo "Upload it via cPanel File Manager first. The running site was not touched."
  exit 1
fi

if ! unzip -tq next-build.zip > /dev/null; then
  echo "ERROR: next-build.zip is corrupt or incomplete (upload interrupted?)."
  echo "Re-upload it. The running site was not touched."
  exit 1
fi

if ! unzip -l next-build.zip .next/BUILD_ID > /dev/null 2>&1; then
  echo "ERROR: next-build.zip has no .next/BUILD_ID — wrong file?"
  echo "The running site was not touched."
  exit 1
fi

echo "=== Stopping stale Node processes ==="
pkill -9 -u "$(whoami)" node 2>/dev/null || true
sleep 2

echo "=== Removing old .next (required — do not skip) ==="
rm -rf .next

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

node scripts/verify-extracted-build.mjs

echo "=== Restarting Passenger (must happen before live checks) ==="
mkdir -p tmp
touch tmp/restart.txt
pkill -9 -u "$(whoami)" node 2>/dev/null || true
sleep 5

echo "=== Verifying live site ==="
if node scripts/check-server-deploy.mjs; then
  echo ""
  echo "Done. Open https://ptintandayamandiri.co.id and hard-refresh (Cmd+Shift+R)."
else
  echo ""
  echo "WARNING: Live site check failed, but files on disk look correct."
  echo "Wait 30s and run: node scripts/check-server-deploy.mjs"
  echo "Expected BUILD_ID: $(cat .next/BUILD_ID)"
  echo "Expected 5530: $(basename "$REQUIRED_CHUNK")"
  exit 1
fi
