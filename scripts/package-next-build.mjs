import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const nextDir = path.join(root, ".next");
const outZip = path.join(root, "next-build.zip");

const includes = [
  "BUILD_ID",
  "DEPLOY_MANIFEST.json",
  "server",
  "static",
  "app-path-routes-manifest.json",
  "build-manifest.json",
  "export-marker.json",
  "images-manifest.json",
  "next-minimal-server.js.nft.json",
  "next-server.js.nft.json",
  "package.json",
  "prerender-manifest.json",
  "react-loadable-manifest.json",
  "required-server-files.js",
  "required-server-files.json",
  "routes-manifest.json",
  "trace-build",
];

if (!fs.existsSync(path.join(nextDir, "BUILD_ID"))) {
  console.error("Missing .next/BUILD_ID — run `pnpm run build` first.");
  process.exit(1);
}

console.log("Verifying cPanel compatibility...\n");
const verify = spawnSync("node", ["scripts/verify-cpanel-build.mjs"], {
  cwd: root,
  stdio: "inherit",
});
if (verify.status !== 0) process.exit(verify.status ?? 1);
console.log("");

const buildId = fs.readFileSync(path.join(nextDir, "BUILD_ID"), "utf8").trim();
const staticChunks = fs
  .readdirSync(path.join(nextDir, "static", "chunks"), { recursive: true })
  .filter((entry) => String(entry).endsWith(".js")).length;

if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

const paths = includes.map((entry) => path.join(".next", entry));
execSync(`zip -r "${outZip}" ${paths.map((p) => `"${p}"`).join(" ")}`, {
  cwd: root,
  stdio: "inherit",
});

const sizeMb = (fs.statSync(outZip).size / (1024 * 1024)).toFixed(1);
console.log(`\nCreated ${outZip}`);
console.log(`BUILD_ID: ${buildId}`);
console.log(`Static JS files: ${staticChunks}`);
console.log(`Size: ${sizeMb} MB`);
console.log("\nServer deploy:");
console.log("  rm -rf .next && unzip -o next-build.zip && touch tmp/restart.txt");
console.log("  Do NOT run npm run build on the server after extracting.");
