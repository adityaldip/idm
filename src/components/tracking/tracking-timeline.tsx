"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import type { ShipmentStatus } from "@prisma/client";
import { SHIPMENT_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type TimelineEvent = {
  id: string;
  status: ShipmentStatus;
  location: string;
  description?: string | null;
  timestamp: Date;
};

interface TrackingTimelineProps {
  events: TimelineEvent[];
  currentStatus: ShipmentStatus;
}

export function TrackingTimeline({ events, currentStatus }: TrackingTimelineProps) {
  return (
    <div className="relative space-y-0">
      {events.map((event, index) => {
        const isCurrent = event.status === currentStatus && index === events.length - 1;
        const isLast = index === events.length - 1;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="relative flex gap-4 pb-8"
          >
            {!isLast && (
              <div className="absolute left-[11px] top-6 h-full w-0.5 bg-border" />
            )}

            <div
              className={cn(
                "relative z-10 mt-1 size-6 shrink-0 rounded-full border-2",
                isCurrent
                  ? "border-secondary bg-secondary shadow-[0_0_0_4px] shadow-secondary/20"
                  : "border-primary bg-primary",
              )}
            />

            <div className="flex-1 rounded-lg border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {SHIPMENT_STATUS_LABELS[event.status]}
                </p>
                <time className="text-xs text-muted-foreground">
                  {format(event.timestamp, "dd MMM yyyy, HH:mm")}
                </time>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {event.location}
              </p>
              {event.description && (
                <p className="mt-1 text-sm">{event.description}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
