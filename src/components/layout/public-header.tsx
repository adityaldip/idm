"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Logo size="lg" />

        <nav className="hidden items-center gap-1 md:flex">
          {PUBLIC_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-[1.125rem] h-0.5 rounded-full bg-gradient-to-r from-gold to-gold-dark" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            nativeButton={false}
            render={<Link href="/tracking" />}
            size="sm"
            className="hidden bg-secondary text-secondary-foreground hover:bg-secondary/90 sm:inline-flex"
          >
            Track Shipment
          </Button>

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo size="lg" />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {PUBLIC_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  nativeButton={false}
                  render={<Link href="/tracking" />}
                  className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  Track Shipment
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/login" />}
                  variant="outline"
                  className="mt-2"
                >
                  Staff Login
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
