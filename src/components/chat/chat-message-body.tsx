import Link from "next/link";
import { Fragment } from "react";

const TRACKING_LINK = /(\/tracking\/IDM\d+)/g;

/** Plain text with line breaks; bot tracking links ("/tracking/IDM…") become real links. */
export function ChatMessageBody({ body, linkClassName }: { body: string; linkClassName?: string }) {
  return (
    <span className="whitespace-pre-wrap break-words">
      {body.split(TRACKING_LINK).map((part, i) =>
        i % 2 === 1 ? (
          <Link key={i} href={part} target="_blank" className={linkClassName ?? "font-medium underline underline-offset-2"}>
            Lihat detail tracking
          </Link>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}

const timeFormat = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" });

export function formatChatTime(iso: string) {
  return timeFormat.format(new Date(iso));
}
