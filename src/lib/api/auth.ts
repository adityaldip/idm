import type { Permission } from "@/lib/permissions";
import { hasPermission } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api/response";
import type { SessionActor } from "@/types/api";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return { error: apiError("UNAUTHORIZED", "Authentication required", 401) };
  }

  const actor: SessionActor = {
    id: session.user.id,
    role: session.user.role,
    branchId: session.user.branchId,
  };

  return { actor };
}

export async function requirePermission(permission: Permission) {
  const result = await requireSession();
  if ("error" in result) return result;

  if (!hasPermission(result.actor.role, permission)) {
    return { error: apiError("FORBIDDEN", "Insufficient permissions", 403) };
  }

  return result;
}
