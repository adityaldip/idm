import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const home = process.env.HOME ?? "";
const isLikelyCpanel =
  home.startsWith("/home/") && existsSync(path.join(home, "nodevenv"));

if (isLikelyCpanel && process.env.ALLOW_SERVER_BUILD !== "1") {
  console.error(
    "\nBlocked: do not run `npm run build` on cPanel.\n" +
      "It creates a different .next than your Mac zip and causes chunk 500 errors.\n" +
      "Upload next-build.zip instead, then:\n" +
      "  rm -rf .next && unzip -o next-build.zip && touch tmp/restart.txt\n",
  );
  process.exit(1);
}

const envFiles = [".env", ".env.local", ".env.production"];
const backups = [];

function stripNodeEnvFromFile(path) {
  if (!existsSync(path)) return;

  const original = readFileSync(path, "utf8");
  const cleaned = original
    .split("\n")
    .filter((line) => !/^\s*NODE_ENV\s*=/.test(line))
    .join("\n");

  if (cleaned === original) return;

  backups.push({ path, original });
  writeFileSync(path, cleaned);
  console.log(`Removed NODE_ENV from ${path} for production build`);
}

for (const file of envFiles) {
  stripNodeEnvFromFile(file);
}

const env = { ...process.env };
delete env.NODE_ENV;
env.NODE_ENV = "production";

const result = spawnSync("npx", ["next", "build", "--webpack"], {
  stdio: "inherit",
  shell: true,
  env,
  cwd: process.cwd(),
});

for (const { path, original } of backups) {
  writeFileSync(path, original);
}

process.exit(result.status ?? 1);
