import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Relative to cwd (root): an absolute path breaks under shell: true when it contains spaces.
const schema = "prisma/schema.prisma";

if (process.env.SKIP_PRISMA_GENERATE === "1") {
  console.log("Skipping prisma generate (SKIP_PRISMA_GENERATE=1)");
  process.exit(0);
}

const result = spawnSync(
  "npx",
  ["prisma", "generate", `--schema=${schema}`],
  {
    stdio: "inherit",
    shell: true,
    cwd: root,
  },
);

process.exit(result.status ?? 1);
