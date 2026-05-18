import type { Metadata, Viewport } from "next";
import "./globals.css";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { AppFrame } from "@/components/layout/app-frame";
import { featureFlags } from "@/lib/features";

export const metadata: Metadata = {
  title: {
    default: "Tiểu thuyết Audio",
    template: "%s | Tiểu thuyết Audio"
  },
  description: "Nghe tiểu thuyết audio tiếng Việt với player PWA, thư viện truyện và tiến trình nghe.",
  applicationName: "Tiểu thuyết Audio",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#08111f",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body data-feature-flags={JSON.stringify(featureFlags)}>
        <WebVitalsReporter />
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
