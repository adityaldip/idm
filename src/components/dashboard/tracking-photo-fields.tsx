"use client";

import { useId, useState } from "react";
import { ImagePlus } from "lucide-react";
import { compressTrackingPhoto } from "@/lib/compress-tracking-photo";
import {
  formatBytes,
  TRACKING_PHOTO_ACCEPT,
  TRACKING_PHOTO_MAX_COUNT,
} from "@/lib/tracking-photo";

type Preview = {
  url: string;
  name: string;
  size: number;
};

/**
 * Compresses photos in the browser, then swaps the file input's contents so
 * the existing FormData submit path sends the small files.
 */
export function TrackingPhotoFields() {
  const inputId = useId();
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widths, setWidths] = useState("");
  const [heights, setHeights] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = Array.from(input.files ?? []);
    setError(null);

    if (picked.length === 0) {
      setPreviews([]);
      setWidths("");
      setHeights("");
      return;
    }

    if (picked.length > TRACKING_PHOTO_MAX_COUNT) {
      setError(`Maksimal ${TRACKING_PHOTO_MAX_COUNT} foto per update.`);
      input.value = "";
      return;
    }

    setBusy(true);
    try {
      const compressed = await Promise.all(picked.map(compressTrackingPhoto));
      const dt = new DataTransfer();
      for (const item of compressed) dt.items.add(item.file);
      input.files = dt.files;

      setPreviews((current) => {
        current.forEach((p) => URL.revokeObjectURL(p.url));
        return compressed.map((item) => ({
          url: URL.createObjectURL(item.file),
          name: item.file.name,
          size: item.file.size,
        }));
      });
      setWidths(compressed.map((item) => item.width).join(","));
      setHeights(compressed.map((item) => item.height).join(","));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengompres foto.");
      input.value = "";
      setPreviews([]);
      setWidths("");
      setHeights("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="photoWidths" value={widths} />
      <input type="hidden" name="photoHeights" value={heights} />
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-input px-3 py-4 text-center text-sm text-muted-foreground hover:bg-muted/40"
      >
        <ImagePlus className="size-5" />
        <span>Foto (opsional, maks. {TRACKING_PHOTO_MAX_COUNT})</span>
        <span className="text-xs">
          Dikompres otomatis ke WebP ~1600px supaya tidak memenuhi storage.
        </span>
        <input
          id={inputId}
          name="photos"
          type="file"
          accept={TRACKING_PHOTO_ACCEPT}
          multiple
          className="sr-only"
          onChange={handleChange}
        />
      </label>

      {busy && <p className="text-xs text-muted-foreground">Mengompres foto…</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}

      {previews.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {previews.map((preview) => (
            <li key={preview.url} className="overflow-hidden rounded-md border border-border/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <p className="truncate px-1.5 py-1 text-[10px] text-muted-foreground">
                {formatBytes(preview.size)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
