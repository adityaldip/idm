"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { StatusOption } from "@/lib/status-option";
import { statusColorClass, statusSolidClass } from "@/lib/shipment-status";
import { cn } from "@/lib/utils";
import {
  TrackingPhotoGallery,
  type TrackingPhotoView,
} from "@/components/tracking/tracking-photo-gallery";
import { StatusIcon } from "./status-icon";

type TimelineEvent = {
  id: string;
  status: StatusOption;
  location: string;
  description?: string | null;
  timestamp: Date;
  photos?: TrackingPhotoView[];
};

/** Newest event first; the latest one is called out as the current update. */
export function TrackingTimeline({ events }: { events: TimelineEvent[] }) {
  const ordered = [...events].reverse();

  return (
    <ol className="relative">
      {ordered.map((event, index) => {
        const isLatest = index === 0;
        const isLast = index === ordered.length - 1;

        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className="relative flex gap-4 pb-6"
          >
            {!isLast && (
              <span
                className="absolute top-10 bottom-0 left-5 w-0.5 -translate-x-1/2 bg-gradient-to-b from-border to-border/40"
                aria-hidden
              />
            )}

            <span
              className={cn(
                "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-background",
                isLatest
                  ? statusSolidClass(event.status.color)
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isLatest && (
                <span
                  className={cn(
                    "absolute inset-0 animate-ping rounded-full opacity-30",
                    statusSolidClass(event.status.color),
                  )}
                />
              )}
              <StatusIcon code={event.status.code} className="relative size-4.5" />
            </span>

            <div
              className={cn(
                "flex-1 rounded-xl border bg-card p-4 transition-shadow",
                isLatest
                  ? "border-gold/30 shadow-lg shadow-black/5 md:p-5"
                  : "border-border/60",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      statusColorClass(event.status.color),
                    )}
                  >
                    {event.status.label}
                  </span>
                  {isLatest && (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold-dark dark:text-gold">
                      Terbaru
                    </span>
                  )}
                </div>
                <time className="text-xs text-muted-foreground">
                  {format(event.timestamp, "dd MMM yyyy, HH:mm", {
                    locale: localeId,
                  })}
                </time>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                {event.location}
              </p>
              {event.description && (
                <p
                  className={cn(
                    "mt-1 text-sm",
                    isLatest ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {event.description}
                </p>
              )}
              {event.photos && event.photos.length > 0 && (
                <TrackingPhotoGallery
                  photos={event.photos}
                  altPrefix={event.status.label}
                />
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
