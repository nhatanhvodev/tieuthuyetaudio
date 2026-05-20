import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/themeContext";
import { type Theme, isTheme } from "@/lib/theme/themes";
import { safeAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { AppFrame } from "@/components/layout/app-frame";
import { featureFlags } from "@/lib/features";

export const metadata: Metadata = {
  title: {
    default: "Tieu thuyet Audio",
    template: "%s | Tieu thuyet Audio"
  },
  description: "Nghe tieu thuyet audio tieng Viet voi player PWA, thu vien truyen va tien trinh nghe.",
  applicationName: "Tieu thuyet Audio",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#08111f",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await safeAuth();
  const isSignedIn = Boolean(session?.user?.id);

  let initialTheme: Theme | undefined;
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { themePreference: true }
    });
    if (user?.themePreference && isTheme(user.themePreference)) {
      initialTheme = user.themePreference;
    }
  }

  const serverTheme = initialTheme ?? null;

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const serverTheme = ${JSON.stringify(serverTheme)};
    const savedTheme = window.localStorage.getItem("theme");
    const candidate = savedTheme ?? serverTheme ?? "dark";
    const theme = typeof candidate === "string" ? candidate : "dark";
    const lightThemes = { light: true, cupcake: true, winter: true, lofi: true };
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = lightThemes[theme] ? "light" : "dark";
  } catch {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();`
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (prefers-reduced-motion: reduce) {
                ::view-transition-old(root),
                ::view-transition-new(root) {
                  animation: none;
                }
              }
            `
          }}
        />
      </head>
      <body data-feature-flags={JSON.stringify(featureFlags)}>
        <WebVitalsReporter />
        <ThemeProvider initialTheme={initialTheme} isSignedIn={isSignedIn}>
          <AppFrame session={session}>{children}</AppFrame>
        </ThemeProvider>
      </body>
    </html>
  );
}
