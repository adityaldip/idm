import { PageHeader } from "@/components/dashboard/page-header";
import { ChatConsole } from "@/components/chat/chat-console";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";

export default async function ChatPage() {
  const actor = await getSessionActor();

  return (
    <div className="space-y-4">
      <PageHeader title="Live Chat" description="Percakapan dari widget chat di website." />
      <ChatConsole canWrite={hasPermission(actor.role, "chat:write")} />
    </div>
  );
}
