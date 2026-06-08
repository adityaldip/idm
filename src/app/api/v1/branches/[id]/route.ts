import { updateBranchSchema } from "@/lib/validators/branch";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  deleteBranch,
  getBranchById,
  updateBranch,
} from "@/services/branch.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requirePermission("branches:read");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const branch = await getBranchById(id);

  if (!branch) {
    return apiError("NOT_FOUND", "Branch not found", 404);
  }

  return apiSuccess(branch);
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requirePermission("branches:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateBranchSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  try {
    const branch = await updateBranch(id, parsed.data);
    return apiSuccess(branch);
  } catch {
    return apiError("NOT_FOUND", "Branch not found", 404);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requirePermission("branches:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    await deleteBranch(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return apiError("DELETE_FAILED", message, 400);
  }
}
