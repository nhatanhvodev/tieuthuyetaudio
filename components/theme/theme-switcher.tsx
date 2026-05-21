"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THEME_OPTIONS, useTheme, type Theme } from "@/lib/theme/themeContext";

function ThemeCard({
  themeName,
  selected,
  onSelect
}: {
  themeName: Theme;
  selected: boolean;
  onSelect: (value: Theme) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(themeName)}
      data-theme={themeName}
      className={`relative overflow-hidden rounded-lg border p-2 text-left transition ${
        selected ? "border-primary ring-1 ring-primary/45" : "border-border/70 hover:border-border"
      }`}
    >
      <div
        className="rounded-md border p-2"
        style={{
          borderColor: "color-mix(in srgb, var(--color-base-content) 18%, transparent)",
          backgroundColor: "var(--color-base-100)"
        }}
      >
        <div
          className="mb-2 h-2.5 w-full rounded"
          style={{ backgroundColor: "var(--color-base-300)" }}
        />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div
            className="h-6 rounded"
            style={{ backgroundColor: "var(--color-base-200)" }}
          />
          <div
            className="h-6 w-10 rounded"
            style={{ backgroundColor: "var(--color-primary)" }}
          />
        </div>
        <div
          className="mt-2 h-2 w-2/3 rounded"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-semibold capitalize">{themeName}</span>
        {selected ? <Check aria-hidden="true" className="size-4 text-primary" /> : null}
      </div>
    </button>
  );
}

export function ThemeSwitcher() {
  const { theme, setTheme, saveTheme, isSignedIn, isSaving } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [draft, setDraft] = React.useState<Theme>(theme);
  const [snapshot, setSnapshot] = React.useState<Theme>(theme);
  const [feedback, setFeedback] = React.useState<string>("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setDraft(theme);
  }, [open, theme]);

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const openPanel = () => {
    setSnapshot(theme);
    setDraft(theme);
    setFeedback("");
    setOpen(true);
  };

  const closePanel = () => {
    setOpen(false);
  };

  const cancelChanges = () => {
    setTheme(snapshot);
    setOpen(false);
    setFeedback("");
  };

  const previewTheme = (next: Theme) => {
    setDraft(next);
    setTheme(next);
    setFeedback("");
  };

  const saveChanges = async () => {
    const result = await saveTheme();
    setFeedback(result.message);
    if (result.ok) {
      setSnapshot(draft);
    }
  };

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={openPanel}>
        <Palette aria-hidden="true" />
        <span className="hidden sm:inline">Theme</span>
      </Button>

      {open && mounted ? createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/45 p-4 backdrop-blur-md">
          <div className="glass-panel w-full max-w-4xl rounded-xl p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">Chon giao dien</h3>
                <p className="text-sm text-muted-foreground">
                  Chon theme de xem demo. Nhan Luu de ap dung theo tai khoan.
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Dong bang chon giao dien" onClick={cancelChanges}>
                <X aria-hidden="true" />
              </Button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {THEME_OPTIONS.map((themeName) => (
                  <ThemeCard key={themeName} themeName={themeName} selected={draft === themeName} onSelect={previewTheme} />
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-muted-foreground">
                {isSignedIn ? "Theme se duoc luu theo tai khoan." : "Dang dung che do khach. Dang nhap de luu theme theo tai khoan."}
              </p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={cancelChanges}>
                  Huy
                </Button>
                <Button type="button" size="sm" disabled={isSaving} onClick={saveChanges}>
                  {isSaving ? "Dang luu..." : "Luu"}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={closePanel}>
                  Dong
                </Button>
              </div>
            </div>

            {feedback ? <p className="mt-2 text-sm text-muted-foreground">{feedback}</p> : null}
          </div>
        </div>
      , document.body) : null}
    </>
  );
}
