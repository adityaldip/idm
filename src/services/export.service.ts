import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Role } from "@prisma/client";
import { listShipments } from "./shipment.service";
import { logActivity } from "./activity.service";
import { SHIPMENT_STATUS_LABELS } from "@/lib/constants";

type ExportFilters = {
  status?: import("@prisma/client").ShipmentStatus;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function exportShipmentsExcel(
  filters: ExportFilters,
  actor: { id: string; role: Role; branchId?: string | null },
) {
  const { items } = await listShipments(
    { page: 1, limit: 10000, sortOrder: "desc", ...filters },
    actor,
  );

  const rows = items.map((s) => ({
    "Tracking Number": s.trackingNumber,
    Status: SHIPMENT_STATUS_LABELS[s.status] ?? s.status,
    Customer: s.customer.name,
    "Sender City": s.senderCity,
    "Recipient City": s.recipientCity,
    "Origin Branch": s.originBranch?.name ?? "",
    "Destination Branch": s.destinationBranch?.name ?? "",
    "Total Cost": s.totalCost ? Number(s.totalCost) : "",
    Created: s.createdAt.toISOString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Shipments");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  await logActivity({
    type: "EXPORT_GENERATED",
    message: `Excel export: ${items.length} shipments`,
    userId: actor.id,
    metadata: { format: "excel", count: items.length },
  });

  return buffer as Buffer;
}

export async function exportShipmentsPdf(
  filters: ExportFilters,
  actor: { id: string; role: Role; branchId?: string | null },
) {
  const { items } = await listShipments(
    { page: 1, limit: 500, sortOrder: "desc", ...filters },
    actor,
  );

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("IDM Shipment Report", 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString("id-ID")}`, 14, 26);

  autoTable(doc, {
    startY: 32,
    head: [
      [
        "Tracking #",
        "Status",
        "Customer",
        "From",
        "To",
        "Cost",
        "Created",
      ],
    ],
    body: items.map((s) => [
      s.trackingNumber,
      SHIPMENT_STATUS_LABELS[s.status] ?? s.status,
      s.customer.name,
      s.senderCity,
      s.recipientCity,
      s.totalCost ? `Rp ${Number(s.totalCost).toLocaleString("id-ID")}` : "-",
      s.createdAt.toLocaleDateString("id-ID"),
    ]),
    styles: { fontSize: 8 },
  });

  const buffer = Buffer.from(doc.output("arraybuffer"));

  await logActivity({
    type: "EXPORT_GENERATED",
    message: `PDF export: ${items.length} shipments`,
    userId: actor.id,
    metadata: { format: "pdf", count: items.length },
  });

  return buffer;
}
