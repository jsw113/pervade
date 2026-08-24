"use client";

import { useEffect } from "react";

export function ClientSessionSync({ user }: { user: { id: string; name: string; email: string; role: string } }) {
  useEffect(() => {
    if (user && user.id) {
      try {
        localStorage.setItem("pervade_user", JSON.stringify(user));
        // Dispatch custom event to notify Navbar immediately
        window.dispatchEvent(new Event("pervade_auth_update"));
      } catch (e) {}
    }
  }, [user]);

  return null;
}
