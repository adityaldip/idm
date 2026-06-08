import { ShipmentStatus } from "@prisma/client";
import { z } from "zod";
import { requirePermission } from "@/lib/api/auth";
import { apiError } from "@/lib/api/response";
import { exportShipmentsExcel } from "@/services/export.service";

const exportFiltersSchema = z.object({
  status: z.nativeEnum(ShipmentStatus).optional(),
  branchId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const auth = await requirePermission("export:generate");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  const parsed = exportFiltersSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid filters", 400, parsed.error.flatten());
  }

  const buffer = await exportShipmentsExcel(parsed.data, {
    id: auth.actor.id,
    role: auth.actor.role,
    branchId: auth.actor.branchId,
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="idm-shipments-${Date.now()}.xlsx"`,
    },
  });
}
