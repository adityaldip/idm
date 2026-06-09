import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schema = path.join(root, "prisma", "schema.prisma");

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
