import fs from "node:fs";
import path from "node:path";

/** Public URL prefix and on-disk folder for the tracking photo gallery. */
const GALLERY_PATH = "images/tracking";
const IMAGE_EXTENSION = /\.(jpe?g|png|webp|avif)$/i;

/**
 * Captions for known filenames. Any other image dropped into the folder still
 * shows up — its title is derived from the filename instead.
 *
 * Captions describe the service, not the photo. The shipped images are licensed
 * stock (Pexels), so the section is framed as illustrative — don't reword these
 * into claims that the photos document IDM's own operations unless they are
 * replaced with real photos from the field.
 */
const PHOTO_META: Record<string, { title: string; caption?: string }> = {
  "01-penjemputan": {
    title: "Penjemputan",
    caption: "Barang dijemput dan diperiksa di lokasi pelanggan.",
  },
  "02-gudang": {
    title: "Sortir di Gudang",
    caption: "Setiap paket dicatat dan discan sebelum berangkat.",
  },
  "03-perjalanan": {
    title: "Dalam Perjalanan",
    caption: "Armada darat, laut, dan udara menuju kota tujuan.",
  },
  "04-serah-terima": {
    title: "Serah Terima",
    caption: "Bukti penerimaan tercatat langsung di sistem.",
  },
};

export type TrackingPhoto = {
  src: string;
  title: string;
  caption?: string;
};

/** "03-perjalanan-laut" → "Perjalanan Laut" */
function titleFromFilename(name: string) {
  return name
    .replace(/^\d+[-_]?/, "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Lists the photos in `public/images/tracking`, sorted by filename. Returns an
 * empty list when the folder is missing or empty so the gallery simply doesn't
 * render — dropping images in is all that's needed to populate it.
 */
export function getTrackingPhotos(limit = 6): TrackingPhoto[] {
  try {
    const directory = path.join(process.cwd(), "public", "images", "tracking");
    return fs
      .readdirSync(directory)
      .filter((file) => IMAGE_EXTENSION.test(file))
      .sort()
      .slice(0, limit)
      .map((file) => {
        const key = file.replace(IMAGE_EXTENSION, "").toLowerCase();
        const meta = PHOTO_META[key];
        return {
          src: `/${GALLERY_PATH}/${file}`,
          title: meta?.title ?? titleFromFilename(key),
          caption: meta?.caption,
        };
      });
  } catch {
    return [];
  }
}
