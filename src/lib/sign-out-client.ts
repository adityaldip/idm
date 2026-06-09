import { signOut } from "next-auth/react";

/** Sign out and force a full navigation so middleware sees the cleared session. */
export async function signOutToLogin() {
  try {
    await signOut({ redirect: false, callbackUrl: "/login" });
  } catch {
    // Continue to hard redirect even if the API call fails.
  }

  window.location.assign("/login");
}
