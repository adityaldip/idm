"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Lookup accepts a tracking number or a customer PO number, so the code travels
 * as a query string — PO numbers often contain slashes that a path segment
 * would mangle. Styled as a glass field for the navy tracking hero.
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl shadow-black/20 backdrop-blur-md sm:flex-row"
    >
      <label className="flex flex-1 items-center gap-3 px-3">
        <PackageSearch className="size-5 shrink-0 text-gold" />
        <input
          aria-label="Nomor resi atau nomor PO"
          placeholder="Nomor resi atau nomor PO"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="h-12 w-full bg-transparent font-mono text-base text-white placeholder:text-white/50 focus:outline-none"
          required
        />
      </label>
      <Button
        type="submit"
        size="lg"
        className="h-12 shrink-0 bg-secondary px-6 text-secondary-foreground shadow-lg shadow-gold/25 hover:bg-secondary/90"
      >
        <Search />
        Lacak
      </Button>
    </form>
  );
}
