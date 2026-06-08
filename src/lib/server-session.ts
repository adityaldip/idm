import { auth } from "@/lib/auth";
import type { SessionActor } from "@/types/api";

export async function getSessionActor(): Promise<SessionActor> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    throw new Error("Unauthorized");
  }
  return {
    id: session.user.id,
    role: session.user.role,
    branchId: session.user.branchId,
  };
}
