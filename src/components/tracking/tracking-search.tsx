"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function TrackingSearch() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = trackingNumber.trim().toUpperCase();
    if (trimmed) {
      router.push(`/tracking/${trimmed}`);
    }
  }

  return (
    <Card className="overflow-hidden border-border/60 shadow-xl shadow-primary/5">
      <div className="h-1.5 bg-gradient-to-r from-primary via-gold to-gold-dark" />
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Enter tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
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
