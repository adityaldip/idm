"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  Contact,
  FileText,
  Handshake,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Package,
  Settings,
  Truck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DASHBOARD_NAV_GROUPS, type DashboardNavIcon } from "@/lib/constants";
import { canAccessRoute } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const iconMap = {
  LayoutDashboard,
  Package,
  Users,
  Building2,
  Truck,
  Contact,
  Newspaper,
  MessageSquare,
  Briefcase,
  Handshake,
  FileText,
  Inbox,
  UserCog,
  Settings,
} as const satisfies Record<DashboardNavIcon, LucideIcon>;

function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const visibleGroups = DASHBOARD_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      role ? canAccessRoute(role, item.href) : true,
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Logo href="/dashboard" />
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-5">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive = isNavItemActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-muted-foreground">IDM Admin v0.1</p>
      </div>
    </aside>
  );
}
