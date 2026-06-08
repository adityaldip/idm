"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Loader2, User, Shield } from "lucide-react";
import { toast } from "sonner";
import type { Role, User as UserModel } from "@prisma/client";
import { saveUserAction, saveSettingsAction } from "@/app/(dashboard)/admin-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/constants";
import {
  FormSheet,
  FormSection,
  FormField,
  FormSelect,
  FormCheckbox,
  Input,
  inputClass,
  textareaClass,
} from "@/components/dashboard/form-sheet";

type UserItem = Pick<
  UserModel,
  "id" | "email" | "name" | "phone" | "role" | "isActive"
> & { branch?: { id: string; name: string } | null };

type BranchOption = { id: string; name: string };

export function UserFormSheet({
  item,
  branches,
}: {
  item?: UserItem;
  branches: BranchOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveUserAction(new FormData(e.currentTarget), item?.id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "User updated" : "User created");
    setOpen(false);
    router.refresh();
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title={item ? "Edit User" : "New User"}
      description="Manage staff accounts, roles, and branch assignments."
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel={item ? "Update User" : "Create User"}
      trigger={
        item ? (
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="size-4" />
            Add User
          </Button>
        )
      }
    >
      <FormSection icon={User} title="Account">
        {!item && (
          <FormField id="email" label="Email" required>
            <Input
              id="email"
              name="email"
              type="email"
              className={inputClass}
              placeholder="staff@idm.co.id"
              required
            />
          </FormField>
        )}
        <FormField id="name" label="Full Name" required>
          <Input
            id="name"
            name="name"
            className={inputClass}
            defaultValue={item?.name}
            placeholder="e.g. Andi Wijaya"
            required
          />
        </FormField>
        <FormField id="phone" label="Phone">
          <Input
            id="phone"
            name="phone"
            type="tel"
            className={inputClass}
            defaultValue={item?.phone ?? ""}
            placeholder="+62 812 3456 7890"
          />
        </FormField>
        <FormField
          id="password"
          label={item ? "New Password" : "Password"}
          required={!item}
          hint={item ? "Leave blank to keep the current password." : "Minimum 8 characters."}
        >
          <Input
            id="password"
            name="password"
            type="password"
            className={inputClass}
            required={!item}
            minLength={8}
            placeholder={item ? "••••••••" : undefined}
          />
        </FormField>
      </FormSection>

      <FormSection icon={Shield} title="Access">
        <FormField id="role" label="Role" required>
          <FormSelect id="role" name="role" defaultValue={item?.role ?? "OPERATOR"} required>
            {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField id="branchId" label="Branch" hint="Optional — links the user to a branch office.">
          <FormSelect id="branchId" name="branchId" defaultValue={item?.branch?.id ?? ""}>
            <option value="">— None —</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </FormSelect>
        </FormField>
        {item && (
          <FormCheckbox
            id="isActive"
            name="isActive"
            label="Account active"
            description="Inactive users cannot log in to the dashboard."
            defaultChecked={item.isActive}
          />
        )}
      </FormSection>
    </FormSheet>
  );
}

type SettingItem = {
  id: string;
  key: string;
  value: string;
  group: string;
};

const SETTING_LABELS: Record<string, string> = {
  company_name: "Company Name",
  company_tagline: "Tagline",
  company_phone: "Phone",
  company_email: "Email",
  company_address: "Address",
  company_founded: "Founded Year",
  tracking_seq_2026: "Tracking Sequence (2026)",
};

const SETTING_HINTS: Record<string, string> = {
  company_tagline: "Shown below the company name on the homepage.",
  tracking_seq_2026: "Next shipment number suffix for 2026. Do not edit unless needed.",
};

export function SettingsForm({ settings }: { settings: SettingItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const grouped = settings.reduce<Record<string, SettingItem[]>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveSettingsAction(new FormData(e.currentTarget));
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Settings saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.entries(grouped).map(([group, items]) => (
        <Card key={group}>
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base capitalize">{group}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {items.map((setting) => (
              <div key={setting.key} className="space-y-1.5">
                <Label htmlFor={`setting_${setting.key}`} className="text-sm font-medium">
                  {SETTING_LABELS[setting.key] ?? setting.key}
                </Label>
                {SETTING_HINTS[setting.key] && (
                  <p className="text-xs text-muted-foreground">{SETTING_HINTS[setting.key]}</p>
                )}
                {setting.key === "company_address" ? (
                  <textarea
                    id={`setting_${setting.key}`}
                    name={`setting_${setting.key}`}
                    rows={3}
                    className={textareaClass}
                    defaultValue={setting.value}
                  />
                ) : (
                  <Input
                    id={`setting_${setting.key}`}
                    name={`setting_${setting.key}`}
                    className={inputClass}
                    defaultValue={setting.value}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  );
}
