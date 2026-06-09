"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
  variant?: "ghost" | "outline" | "destructive";
  size?: "default" | "sm" | "icon";
  showLabel?: boolean;
};

export function SignOutButton({
  className,
  variant = "ghost",
  size = "sm",
  showLabel = true,
}: SignOutButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(showLabel ? "gap-2" : "size-9", className)}
      onClick={() => void signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="size-4" />
      {showLabel ? "Sign out" : <span className="sr-only">Sign out</span>}
    </Button>
  );
}
