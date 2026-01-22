"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      className="w-full text-left"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      sign out
    </button>
  );
}
