"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Inline resi / nomor PO lookup so visitors can track straight from the hero. */
export function HeroTrackingForm() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = code.trim();
    if (trimmed) {
      router.push(`/tracking?q=${encodeURIComponent(trimmed)}`);
    }
  }

  // The hero gradient is dark in both themes, so this panel keeps its own dark
  // translucent surface — .glass-card would flip it to white in light mode and
  // leave the white text unreadable.
  return (
    <div className="rounded-2xl border border-white/20 bg-white/12 p-4 shadow-xl shadow-black/20 backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/85">
        <PackageSearch className="size-4 text-gold" />
        Lacak pengiriman Anda
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row">
        <Input
          aria-label="Nomor resi atau nomor PO"
          placeholder="Nomor resi atau nomor PO — IDM2026000001"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="h-11 border-white/30 bg-black/15 font-mono text-base text-white placeholder:text-white/65 focus-visible:border-gold focus-visible:ring-gold/30"
          required
        />
        <Button
          type="submit"
          size="lg"
          className="h-11 shrink-0 bg-secondary px-5 text-secondary-foreground shadow-lg shadow-gold/25 hover:bg-secondary/90"
        >
          Lacak
          <ArrowRight />
        </Button>
      </form>
    </div>
  );
}
