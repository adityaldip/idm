"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const sheetContentClass = cn(
  "flex w-full flex-col gap-0 p-0 sm:max-w-lg",
  "[&>button]:top-4 [&>button]:right-4",
);

export const inputClass = "h-10 px-3";

export const textareaClass = cn(
  inputClass,
  "flex w-full resize-none rounded-lg border border-input bg-background py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
);

export const selectClass = cn(
  inputClass,
  "w-full appearance-none rounded-lg border border-input bg-background text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
);

export function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon?: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        {Icon && <Icon className="size-4 text-primary" />}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function FormField({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

export function FormTextarea({
  id,
  name,
  rows = 4,
  required,
  placeholder,
  defaultValue,
}: {
  id: string;
  name: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <textarea
      id={id}
      name={name}
      rows={rows}
      required={required}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className={textareaClass}
    />
  );
}

export function FormSelect({
  id,
  name,
  required,
  defaultValue,
  children,
}: {
  id: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <select
      id={id}
      name={name}
      required={required}
      defaultValue={defaultValue}
      className={selectClass}
    >
      {children}
    </select>
  );
}

export function FormCheckbox({
  id,
  name,
  label,
  description,
  defaultChecked = true,
}: {
  id: string;
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
      />
      <span className="space-y-0.5">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="block text-xs text-muted-foreground">{description}</span>
        )}
      </span>
    </label>
  );
}

export function FormSheetTrigger({
  children,
  onOpen,
}: {
  children: React.ReactNode;
  onOpen: () => void;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      className="inline-flex"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
    >
      {children}
    </span>
  );
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  children,
  onSubmit,
  loading,
  submitLabel = "Save",
  loadingLabel = "Saving...",
  formKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  submitLabel?: string;
  loadingLabel?: string;
  formKey?: number | string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <FormSheetTrigger onOpen={() => onOpenChange(true)}>{trigger}</FormSheetTrigger>
      ) : null}
      <SheetContent side="right" className={sheetContentClass}>
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-heading text-lg">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <form
          key={formKey}
          onSubmit={onSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">{children}</div>

          <SheetFooter className="flex-row gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {loadingLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { Input };
