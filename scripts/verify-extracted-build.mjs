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
  fail("No .next/BUILD_ID — run: rm -rf .next && unzip -o next-build.zip");
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
    fail(`Stale chunk still present: .next/${stale}`);
  }
}

const chunksToVerify = manifest.requiredChunks ?? manifest.markerChunks ?? [];
for (const chunk of chunksToVerify) {
  if (!fs.existsSync(path.join(nextDir, chunk))) {
    fail(`Missing required chunk: .next/${chunk}`);
  }
}

const cssDir = path.join(nextDir, "static", "css");
if (!fs.existsSync(cssDir) || fs.readdirSync(cssDir).length === 0) {
  fail("Missing .next/static/css — build archive is incomplete.");
}
ok(`CSS files: ${fs.readdirSync(cssDir).join(", ")}`);

const healthRoute = path.join(
  nextDir,
  "server/app/api/health/route.js",
);
if (!fs.existsSync(healthRoute)) {
  fail("Missing /api/health in build — upload the latest next-build.zip.");
}
ok("/api/health route present in build");

console.log(`\n✓ Extracted build ${buildId} looks complete on disk.`);
