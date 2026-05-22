"use client";

import * as React from "react";
import { LIGHT_THEMES, THEME_OPTIONS, type Theme, normalizeTheme } from "@/lib/theme/themes";

type SaveThemeResult = {
  ok: boolean;
  message: string;
  persisted: boolean;
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  saveTheme: () => Promise<SaveThemeResult>;
  isSignedIn: boolean;
  isSaving: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = LIGHT_THEMES.has(theme) ? "light" : "dark";
}

export function ThemeProvider({
  children,
  initialTheme,
  isSignedIn = false
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
  isSignedIn?: boolean;
}) {
  const [theme, setThemeState] = React.useState<Theme>(initialTheme ?? "default");
  const [isThemeReady, setIsThemeReady] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    if (typeof window === "undefined") return;
    applyTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = normalizeTheme(window.localStorage.getItem("theme"));
    const initial = savedTheme ?? initialTheme ?? "default";
    setThemeState(initial);
    applyTheme(initial);
    window.localStorage.setItem("theme", initial);
    setIsThemeReady(true);
  }, [initialTheme]);

  React.useEffect(() => {
    if (!isThemeReady) return;
    if (typeof window === "undefined") return;
    applyTheme(theme);
    window.localStorage.setItem("theme", theme);
  }, [theme, isThemeReady]);

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "theme" || !event.newValue) return;
      const normalized = normalizeTheme(event.newValue);
      if (!normalized) return;
      setThemeState(normalized);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = () => {
    const currentIndex = THEME_OPTIONS.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    setTheme(THEME_OPTIONS[nextIndex]);
  };

  const saveTheme = React.useCallback(async () => {
    if (!isSignedIn) {
      return {
        ok: true,
        message: "Da luu tren trinh duyet. Dang nhap de dong bo theo tai khoan.",
        persisted: false
      } satisfies SaveThemeResult;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Khong the luu giao dien." }));
        return {
          ok: false,
          message: typeof payload.error === "string" ? payload.error : "Khong the luu giao dien.",
          persisted: false
        } satisfies SaveThemeResult;
      }
      return {
        ok: true,
        message: "Da luu giao dien cho tai khoan.",
        persisted: true
      } satisfies SaveThemeResult;
    } catch {
      return {
        ok: false,
        message: "Khong the ket noi de luu giao dien.",
        persisted: false
      } satisfies SaveThemeResult;
    } finally {
      setIsSaving(false);
    }
  }, [isSignedIn, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, saveTheme, isSignedIn, isSaving }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { THEME_OPTIONS, type Theme };
