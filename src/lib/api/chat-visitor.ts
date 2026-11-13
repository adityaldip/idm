import { cookies } from "next/headers";
import { CHAT_COOKIE, CHAT_COOKIE_MAX_AGE } from "@/lib/chat";
import { apiError } from "@/lib/api/response";
import { findConversationByToken } from "@/services/chat.service";

/** The visitor's room comes only from their cookie; the API never accepts a room id. */
export async function requireVisitorConversation() {
  const store = await cookies();
  const conversation = await findConversationByToken(store.get(CHAT_COOKIE)?.value);
  if (!conversation) {
    return { error: apiError("NO_CHAT_SESSION", "Chat session not found", 401) };
  }
  return { conversation };
}

export async function setVisitorCookie(token: string) {
  const store = await cookies();
  store.set(CHAT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/chat",
    maxAge: CHAT_COOKIE_MAX_AGE,
  });
}
