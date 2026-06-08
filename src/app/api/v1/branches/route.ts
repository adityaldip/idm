import { createBranchSchema, branchListSchema } from "@/lib/validators/branch";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createBranch, listBranches } from "@/services/branch.service";

export async function GET(request: Request) {
  const auth = await requirePermission("branches:read");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const parsed = branchListSchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid query parameters", 400, parsed.error.flatten());
  }

  const result = await listBranches(parsed.data);
  return apiSuccess(result);
}

export async function POST(request: Request) {
  const auth = await requirePermission("branches:write");
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createBranchSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  try {
    const branch = await createBranch(parsed.data);
    return apiSuccess(branch, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create branch";
    return apiError("CREATE_FAILED", message, 400);
  }
}
