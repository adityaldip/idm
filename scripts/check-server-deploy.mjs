import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextDir = path.join(root, ".next");
const manifestPath = path.join(nextDir, "DEPLOY_MANIFEST.json");

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

if (!fs.existsSync(path.join(nextDir, "BUILD_ID"))) {
  fail("No .next/BUILD_ID — extract next-build.zip first.");
}

const buildId = fs.readFileSync(path.join(nextDir, "BUILD_ID"), "utf8").trim();
ok(`BUILD_ID on disk: ${buildId}`);

if (!fs.existsSync(manifestPath)) {
  fail("Missing .next/DEPLOY_MANIFEST.json — upload the latest next-build.zip.");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.buildId !== buildId) {
  fail(`BUILD_ID mismatch: file=${buildId}, manifest=${manifest.buildId}`);
}

for (const stale of manifest.staleChunks ?? []) {
  if (fs.existsSync(path.join(nextDir, stale))) {
    fail(`Stale chunk still present: .next/${stale}\nRun: rm -rf .next && unzip -o next-build.zip`);
  }
}

for (const marker of manifest.markerChunks ?? []) {
  const file = path.join(nextDir, marker);
  if (!fs.existsSync(file)) {
    fail(`Missing required chunk: .next/${marker}\nYour .next folder is incomplete or mixed.`);
  }
}
ok("Marker chunks exist, stale chunks absent");

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ptintandayamandiri.co.id";

const homeRes = await fetch(`${appUrl}/`);
const home = { status: homeRes.status, body: await homeRes.text() };
if (home.status !== 200) {
  fail(`Homepage returned HTTP ${home.status}`);
}

for (const stale of manifest.staleChunks ?? []) {
  const staleName = stale.split("/").pop();
  if (home.body.includes(staleName)) {
    fail(
      `Live HTML still references stale chunk ${staleName}.\n` +
        "Passenger is serving an old .next/server folder.\n" +
        "Fix: rm -rf .next && unzip -o next-build.zip && pkill -9 -u $USER node; touch tmp/restart.txt",
    );
  }
}

for (const marker of manifest.markerChunks ?? []) {
  const markerName = marker.split("/").pop();
  if (!home.body.includes(markerName)) {
    fail(
      `Live HTML does not reference expected chunk ${markerName}.\n` +
        "The running app is not using the uploaded build.",
    );
  }
}

ok(`Live site HTML matches BUILD_ID ${buildId}`);
console.log("\n✓ Server deploy looks correct — hard-refresh your browser (Cmd+Shift+R).");
