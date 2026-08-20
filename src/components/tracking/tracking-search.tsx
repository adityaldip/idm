"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Lookup accepts a tracking number or a customer PO number, so the code travels
 * as a query string — PO numbers often contain slashes that a path segment
 * would mangle.
 */
export function TrackingSearch({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed) {
      router.push(`/tracking?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <Card className="overflow-hidden border-border/60 shadow-xl shadow-primary/5">
      <div className="h-1.5 bg-gradient-to-r from-primary via-gold to-gold-dark" />
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            aria-label="Nomor resi atau nomor PO"
            placeholder="Nomor resi atau nomor PO"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-12 font-mono text-base"
            required
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Search />
            Track
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
