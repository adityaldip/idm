import { createHash, randomBytes } from "node:crypto";

/** Random token handed to the visitor as an httpOnly cookie; it is the room key. */
export function generateChatToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Only this hash is stored, so a database leak does not expose live tokens. */
export function hashChatToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
