"use client";

import { useSession } from "next-auth/react";
import { signOutToLogin } from "@/lib/sign-out-client";
import { LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { SignOutButton } from "@/components/layout/sign-out-button";

export function DashboardHeader() {
  const { data: session } = useSession();
  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="relative z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            render={(props) => (
              <Button
                {...props}
                variant="ghost"
                size="icon"
                className="lg:hidden"
              >
                <Menu className="size-5" />
              </Button>
            )}
          />
          <SheetContent side="left" className="w-64 p-0">
            <DashboardSidebar />
          </SheetContent>
        </Sheet>
        <div>
          <h1 className="text-sm font-semibold lg:text-base">Admin Dashboard</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            PT Intan Daya Mandiri
          </p>
        </div>
      </div>

      <div className="relative z-50 flex items-center gap-2">
        <ThemeToggle />
        <SignOutButton className="hidden sm:inline-flex" />
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            aria-label="Open profile menu"
            render={(props) => (
              <Button
                {...props}
                variant="ghost"
                size="icon"
                className="size-9 rounded-full"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials ?? "ID"}
                </span>
              </Button>
            )}
          />
          <DropdownMenuContent align="end" className="z-[200] w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{session?.user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {session?.user?.email}
                </span>
                <span className="text-xs font-normal capitalize text-muted-foreground">
                  {session?.user?.role?.toLowerCase().replace("_", " ")}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => void signOutToLogin()}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
