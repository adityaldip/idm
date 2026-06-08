import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsForm } from "@/components/dashboard/user-settings-forms";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listSettings } from "@/services/settings.service";

export default async function SettingsPage() {
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "settings:write");
  const settings = await listSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure company branding, contact info, and tracking settings."
      />

      {canWrite ? (
        <SettingsForm settings={settings} />
      ) : (
        <div className="space-y-4">
          {settings.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-border p-4 text-sm"
            >
              <p className="font-medium">{s.key}</p>
              <p className="mt-1 text-muted-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
