import { ChatWidget } from "@/components/chat/chat-widget";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { formatWorkingHours, isWithinWorkingHours } from "@/lib/chat";
import { getChatSettings } from "@/services/chat.service";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chat = await getChatSettings();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Scroll-reveal sections start hidden — keep them readable without JS. */}
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      {chat.enabled && (
        <ChatWidget
          config={{
            online: isWithinWorkingHours(chat.hours),
            hoursText: formatWorkingHours(chat.hours),
            quickReplies: chat.quickReplies.map((q) => q.label),
          }}
        />
      )}
    </div>
  );
}
