"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (!installEvent) {
      setShowGuide((value) => !value);
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  }

  return (
    <div className="relative">
      <Button type="button" size={compact ? "sm" : "default"} variant={compact ? "outline" : "default"} onClick={install}>
        <Download data-icon="inline-start" />
        Tai app
      </Button>
      {showGuide ? (
        <div className="absolute right-0 top-11 z-50 w-72 rounded-md border bg-popover p-3 text-sm text-popover-foreground shadow-lg">
          <p className="font-semibold">Cai nhu app tren dien thoai</p>
          <p className="mt-1 text-muted-foreground">
            Mo bang Chrome hoac Edge tren Android, chon menu trinh duyet, roi chon Add to Home screen hoac Install app.
          </p>
        </div>
      ) : null}
    </div>
  );
}
