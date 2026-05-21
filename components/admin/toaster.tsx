"use client";

import { Toaster } from "sonner";

export function AdminToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: "admin-toast",
        style: {
          borderRadius: "0.75rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 32px -16px rgba(15,23,42,0.25)",
          fontSize: "0.875rem",
          fontWeight: 500
        }
      }}
    />
  );
}
