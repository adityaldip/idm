"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CustomersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/customers?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search name, code, phone, company..."
          className="pl-9"
          defaultValue={searchParams.get("search") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams("search", (e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const input = document.querySelector<HTMLInputElement>(
            'input[placeholder*="Search name"]',
          );
          updateParams("search", input?.value ?? "");
        }}
      >
        Search
      </Button>
    </div>
  );
}
