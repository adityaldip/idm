"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ExportButtons() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);

  function getFilters() {
    const filters: Record<string, string> = {};
    for (const key of [
      "search",
      "status",
      "branchId",
      "customerId",
    ]) {
      const value = searchParams.get(key);
      if (value) filters[key] = value;
    }
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    if (dateFrom) filters.dateFrom = new Date(dateFrom).toISOString();
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      filters.dateTo = end.toISOString();
    }
    return filters;
  }

  async function handleExport(format: "excel" | "pdf") {
    setLoading(format);
    try {
      const res = await fetch(`/api/v1/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getFilters()),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `idm-shipments.${format === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} exported`);
    } catch {
      toast.error("Export failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={loading !== null}
        onClick={() => handleExport("excel")}
      >
        <FileSpreadsheet className="size-4" />
        {loading === "excel" ? "Exporting..." : "Excel"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={loading !== null}
        onClick={() => handleExport("pdf")}
      >
        <Download className="size-4" />
        {loading === "pdf" ? "Exporting..." : "PDF"}
      </Button>
    </div>
  );
}
