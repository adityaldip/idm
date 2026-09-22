import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  sniffImageType,
  TRACKING_PHOTO_MAX_COUNT,
  TRACKING_PHOTO_MAX_STORED_BYTES,
} from "@/lib/tracking-photo";

export type SavedTrackingPhoto = {
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  sortOrder: number;
  absolutePath: string;
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "tracking");

export class TrackingPhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrackingPhotoError";
  }
}

function parseIntList(raw: FormDataEntryValue | null, count: number): number[] {
  if (!raw || typeof raw !== "string") return Array(count).fill(0);
  const parts = raw.split(",").map((p) => Number(p.trim()));
  return Array.from({ length: count }, (_, i) =>
    Number.isFinite(parts[i]) && parts[i] > 0 ? Math.round(parts[i]) : 0,
  );
}

export async function saveTrackingPhotos(
  shipmentId: string,
  formData: FormData,
): Promise<SavedTrackingPhoto[]> {
  const files = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) return [];
  if (files.length > TRACKING_PHOTO_MAX_COUNT) {
    throw new TrackingPhotoError(`Maksimal ${TRACKING_PHOTO_MAX_COUNT} foto per update.`);
  }

  const widths = parseIntList(formData.get("photoWidths"), files.length);
  const heights = parseIntList(formData.get("photoHeights"), files.length);

  const dir = path.join(UPLOAD_DIR, shipmentId);
  await mkdir(dir, { recursive: true });

  const saved: SavedTrackingPhoto[] = [];

  try {
    for (const [index, file] of files.entries()) {
      if (file.size > TRACKING_PHOTO_MAX_STORED_BYTES) {
        throw new TrackingPhotoError(
          `${file.name} masih terlalu besar setelah dikompres. Coba foto yang lebih kecil.`,
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const kind = sniffImageType(buffer);
      if (!kind) {
        throw new TrackingPhotoError(
          `${file.name} bukan JPEG, PNG, atau WebP yang valid.`,
        );
      }

      const ext = kind === "jpeg" ? "jpg" : kind;
      const filename = `${randomUUID()}.${ext}`;
      const absolutePath = path.join(dir, filename);
      await writeFile(absolutePath, buffer);

      saved.push({
        url: `/uploads/tracking/${shipmentId}/${filename}`,
        width: widths[index] || 0,
        height: heights[index] || 0,
        sizeBytes: buffer.length,
        sortOrder: index,
        absolutePath,
      });
    }
  } catch (error) {
    await deleteSavedTrackingPhotos(saved);
    throw error;
  }

  return saved;
}

export async function deleteSavedTrackingPhotos(photos: SavedTrackingPhoto[]) {
  await Promise.all(
    photos.map((photo) => unlink(photo.absolutePath).catch(() => undefined)),
  );
}
