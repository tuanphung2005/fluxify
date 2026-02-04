"use client";

import { signOutWithBroadcast } from "@/hooks/useLogoutSync";

export function SignOutButton() {
  return (
    <button
      className="w-full text-left"
      onClick={() => signOutWithBroadcast("/?modal=login")}
    >
      sign out
    </button>
  );
}
