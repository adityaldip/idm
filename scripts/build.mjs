import { spawnSync } from "node:child_process";

// Next.js must own NODE_ENV during production builds.
delete process.env.NODE_ENV;

const result = spawnSync("npx", ["next", "build", "--webpack"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: "production",
  },
});

process.exit(result.status ?? 1);
