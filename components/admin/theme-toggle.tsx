"use client";

import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminThemeToggle() {
  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute("data-admin-theme") ?? "light";
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-admin-theme", next);
    html.classList.toggle("admin-dark", next === "dark");
    localStorage.setItem("admin-theme", next);
  }

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    if (saved === "dark") {
      document.documentElement.setAttribute("data-admin-theme", "dark");
      document.documentElement.classList.add("admin-dark");
    }
  }, []);

  return (
    <Button type="button" variant="secondary" size="icon" onClick={toggleTheme} className="h-9 w-9" title="Đổi giao diện sáng/tối">
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 admin-dark:hidden" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 hidden admin-dark:inline-flex" />
      <span className="sr-only">Đổi giao diện</span>
    </Button>
  );
}
