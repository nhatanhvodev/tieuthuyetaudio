import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/themeContext";
import { LIGHT_THEMES, type Theme, normalizeTheme } from "@/lib/theme/themes";
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
  themeColor: "#fff9ec",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { userId: clerkUserId } = await auth();
  const session = await safeAuth();
  const isSignedIn = Boolean(session?.user?.id);

  let initialTheme: Theme | undefined;
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { themePreference: true }
    });
    initialTheme = normalizeTheme(user?.themePreference) ?? initialTheme;
  }

  const serverTheme = initialTheme ?? null;
  const lightThemes = Object.fromEntries(Array.from(LIGHT_THEMES).map((theme) => [theme, true] as const));

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&family=Manrope:wght@600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const serverTheme = ${JSON.stringify(serverTheme)};
    const savedTheme = window.localStorage.getItem("theme");
    const normalizeTheme = (value) => {
      if (!value || typeof value !== "string") return undefined;
      if (value === "thu-am-sac") return "default";
      return value;
    };
    const candidate = normalizeTheme(savedTheme) ?? normalizeTheme(serverTheme) ?? "default";
    const theme = typeof candidate === "string" ? candidate : "default";
    const lightThemes = ${JSON.stringify(lightThemes)};
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = lightThemes[theme] ? "light" : "dark";
  } catch {
    document.documentElement.setAttribute("data-theme", "default");
    document.documentElement.style.colorScheme = "light";
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
      <body data-feature-flags={JSON.stringify(featureFlags)} data-clerk-user-id={clerkUserId ?? ""}>
        <ClerkProvider>
          <WebVitalsReporter />
          <ThemeProvider initialTheme={initialTheme} isSignedIn={isSignedIn}>
            <AppFrame>{children}</AppFrame>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
