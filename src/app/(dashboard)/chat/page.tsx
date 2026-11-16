import { PageHeader } from "@/components/dashboard/page-header";
import { ChatConsole } from "@/components/chat/chat-console";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listChatAgents } from "@/services/chat.service";

export default async function ChatPage() {
  const actor = await getSessionActor();
  const agents = await listChatAgents();

  return (
    <div className="space-y-4">
      <PageHeader title="Live Chat" description="Percakapan dari widget chat di website." />
      <ChatConsole
        canWrite={hasPermission(actor.role, "chat:write")}
        canSearchCustomers={hasPermission(actor.role, "customers:read")}
        agents={agents}
      />
    </div>
  );
}
