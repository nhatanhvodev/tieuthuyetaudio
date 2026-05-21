"use client";

import { useLayoutEffect } from "react";

export function AdminThemeLock() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const previousTheme = html.getAttribute("data-theme");
    const previousScheme = html.style.colorScheme;

    html.setAttribute("data-theme", "light");
    html.style.colorScheme = "light";

    const savedAdminTheme = localStorage.getItem("admin-theme");
    if (savedAdminTheme === "dark") {
      html.setAttribute("data-admin-theme", "dark");
      html.classList.add("admin-dark");
    }

    return () => {
      if (previousTheme) {
        html.setAttribute("data-theme", previousTheme);
      } else {
        html.removeAttribute("data-theme");
      }
      html.style.colorScheme = previousScheme;
      html.removeAttribute("data-admin-theme");
      html.classList.remove("admin-dark");
    };
  }, []);

  return null;
}
