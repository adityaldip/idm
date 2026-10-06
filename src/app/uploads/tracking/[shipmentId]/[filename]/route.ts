import { readFile } from "node:fs/promises";
import path from "node:path";

// `next start` indexes public/ once at boot, so photos uploaded while the
// server is running 404 until the next restart. Serve them from disk instead.
// Files that existed at boot are still served by Next's static handler first.

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "tracking");

const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/;
const SAFE_FILENAME = /^[A-Za-z0-9-]+\.(jpg|png|webp)$/;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shipmentId: string; filename: string }> },
) {
  const { shipmentId, filename } = await params;
  const match = SAFE_FILENAME.exec(filename);

  if (!SAFE_SEGMENT.test(shipmentId) || !match) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(path.join(UPLOAD_DIR, shipmentId, filename));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": CONTENT_TYPES[match[1]],
        // Filenames are random UUIDs and never rewritten.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
