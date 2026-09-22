import {
  TRACKING_PHOTO_MAX_EDGE,
  TRACKING_PHOTO_MAX_ORIGINAL_BYTES,
  TRACKING_PHOTO_QUALITY,
} from "@/lib/tracking-photo";

export type CompressedPhoto = {
  file: File;
  width: number;
  height: number;
};

/**
 * Shrink a phone photo to a web-sized WebP (JPEG fallback) without cropping.
 * Runs entirely in the browser so the cPanel Node process never has to spawn
 * a native encoder.
 */
export async function compressTrackingPhoto(file: File): Promise<CompressedPhoto> {
  if (file.size > TRACKING_PHOTO_MAX_ORIGINAL_BYTES) {
    throw new Error(
      `${file.name} terlalu besar (maks. ${TRACKING_PHOTO_MAX_ORIGINAL_BYTES / (1024 * 1024)} MB).`,
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      `${file.name} tidak bisa dibaca. Pakai JPEG atau PNG (foto HEIC dari iPhone sering gagal di browser).`,
    );
  }

  const scale = Math.min(1, TRACKING_PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Browser tidak mendukung kompresi gambar.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob =
    (await canvasToBlob(canvas, "image/webp", TRACKING_PHOTO_QUALITY)) ??
    (await canvasToBlob(canvas, "image/jpeg", TRACKING_PHOTO_QUALITY));

  if (!blob) {
    throw new Error(`Gagal mengompres ${file.name}.`);
  }

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const compressed = new File([blob], replaceExt(file.name, ext), { type: blob.type });
  return { file: compressed, width, height };
}

function replaceExt(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, "") || "photo";
  return `${base}.${ext}`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
