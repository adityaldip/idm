import { readFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function readBuildId() {
  try {
    return readFileSync(
      path.join(process.cwd(), ".next", "BUILD_ID"),
      "utf8",
    ).trim();
  } catch {
    return null;
  }
}

export async function GET() {
  const buildId = readBuildId();
  let database: "ok" | "error" = "error";
  let databaseError: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "ok";
  } catch (error) {
    databaseError =
      error instanceof Error ? error.message : "Database connection failed";
  }

  const ok = database === "ok";

  return Response.json(
    {
      ok,
      buildId,
      database,
      databaseError,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
