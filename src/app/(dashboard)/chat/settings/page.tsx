import { PageHeader } from "@/components/dashboard/page-header";
import { ChatSettingsForm } from "@/components/chat/chat-settings-form";
import { getChatSettings } from "@/services/chat.service";

export default async function ChatSettingsPage() {
  const settings = await getChatSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat Settings"
        description="Pesan sambutan bot, jam kerja CS, dan tombol pilihan cepat di widget chat."
        backHref="/chat"
      />
      <ChatSettingsForm settings={settings} />
    </div>
  );
}
