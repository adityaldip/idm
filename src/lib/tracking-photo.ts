/** Shared limits for client compression and server validation. */

export const TRACKING_PHOTO_MAX_COUNT = 3;
export const TRACKING_PHOTO_MAX_EDGE = 1600;
export const TRACKING_PHOTO_QUALITY = 0.82;
/** Reject originals bigger than this before we even try to compress. */
export const TRACKING_PHOTO_MAX_ORIGINAL_BYTES = 10 * 1024 * 1024;
/** After compression the file must fit this — keeps disk and the action body small. */
export const TRACKING_PHOTO_MAX_STORED_BYTES = 1024 * 1024;

export const TRACKING_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47];

export type SniffedImage = "jpeg" | "png" | "webp" | null;

export function sniffImageType(bytes: Uint8Array): SniffedImage {
  if (bytes.length < 12) return null;
  if (JPEG.every((b, i) => bytes[i] === b)) return "jpeg";
  if (PNG.every((b, i) => bytes[i] === b)) return "png";
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return "webp";
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
