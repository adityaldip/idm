import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const nextDir = path.join(root, ".next");

function fail(message) {
  console.error(`\n✗ cPanel build check failed: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

const required = [
  "BUILD_ID",
  "server/app",
  "server/src/middleware.js",
  "static/chunks",
  "routes-manifest.json",
  "required-server-files.json",
];

for (const entry of required) {
  const target = path.join(nextDir, entry);
  if (!fs.existsSync(target)) {
    fail(`Missing .next/${entry}`);
  }
}

for (const forbidden of ["cache", "dev"]) {
  if (fs.existsSync(path.join(nextDir, forbidden))) {
    ok(`Found .next/${forbidden} locally (will be excluded from zip)`);
  }
}

const buildId = fs.readFileSync(path.join(nextDir, "BUILD_ID"), "utf8").trim();
ok(`BUILD_ID: ${buildId}`);

const port = 3198;
const server = spawn("node", ["server.js"], {
  cwd: root,
  env: { ...process.env, NODE_ENV: "production", PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

function waitForReady(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("server.js did not start")), timeoutMs);
    server.stdout.on("data", (chunk) => {
      if (String(chunk).includes("Ready on port")) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });
    server.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`server.js exited early with code ${code}`));
    });
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
      })
      .on("error", reject);
  });
}

try {
  await waitForReady();
  ok("server.js started in production mode");

  const home = await get(`http://127.0.0.1:${port}/`);
  if (home.status !== 200) {
    fail(`Homepage returned ${home.status}, expected 200`);
  }
  ok("Homepage returns 200");

  const chunks = [
    ...home.body.matchAll(/_next\/static\/chunks\/[^"]+\.js/g),
  ].map((match) => match[0]);

  if (chunks.length === 0) {
    fail("No JS chunks found in homepage HTML");
  }

  const missing = [];
  for (const chunk of chunks) {
    const file = path.join(nextDir, chunk.replace("_next/", ""));
    if (!fs.existsSync(file)) {
      missing.push(chunk);
      continue;
    }

    const res = await get(`http://127.0.0.1:${port}/${chunk}`);
    if (res.status !== 200) {
      missing.push(`${chunk} (HTTP ${res.status})`);
    }
  }

  if (missing.length > 0) {
    fail(`Chunk mismatch — HTML references files that are missing or broken:\n  ${missing.join("\n  ")}`);
  }

  ok(`All ${chunks.length} homepage chunks exist on disk and return 200`);

  const requiredChunks = [
    ...new Set(
      chunks
        .map((chunk) => chunk.replace("_next/", ""))
        .filter((chunk) => !chunk.includes("webpack") && !chunk.includes("polyfills")),
    ),
  ];

  const markerChunks = requiredChunks.slice(0, 8);

  fs.writeFileSync(
    path.join(nextDir, "DEPLOY_MANIFEST.json"),
    `${JSON.stringify(
      {
        buildId,
        createdAt: new Date().toISOString(),
        markerChunks,
        requiredChunks,
        staleChunks: [
          "static/chunks/2498-2b61d0fa9b66b910.js",
          "static/chunks/app/layout-c2dcbe8ca208cb0a.js",
          "static/chunks/5530-06a54b28eb37c890.js",
        ],
      },
      null,
      2,
    )}\n`,
  );
  ok("Wrote .next/DEPLOY_MANIFEST.json");

  console.log("\n✓ Build is ready for cPanel deploy");
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
} finally {
  server.kill("SIGTERM");
}
