"use client";

import { useRef } from "react";
import { useReportWebVitals } from "next/web-vitals";

const REPORT_ENDPOINT = "/api/analytics/vitals";

function sanitizeAttribution(value: unknown) {
  if (!value || typeof value !== "object") return undefined;

  const sanitized: Record<string, string | number | boolean | null> = {};

  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry === null || typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
      sanitized[key] = entry;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function sendVitals(body: string) {
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(REPORT_ENDPOINT, blob)) {
      return;
    }
  }

  void fetch(REPORT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  });
}

export function WebVitalsReporter() {
  const sentMetrics = useRef(new Set<string>());

  useReportWebVitals((metric) => {
    const pathname = window.location.pathname;
    const dedupeKey = `${metric.id}:${metric.name}:${pathname}`;

    if (sentMetrics.current.has(dedupeKey)) {
      return;
    }

    sentMetrics.current.add(dedupeKey);

    const payload = {
      id: metric.id,
      name: metric.name,
      value: Number(metric.value.toFixed(4)),
      delta: Number(metric.delta.toFixed(4)),
      rating: metric.rating,
      navigationType: "navigationType" in metric ? metric.navigationType : undefined,
      pathname,
      href: window.location.href,
      source: "next_web_vitals",
      timestamp: new Date().toISOString(),
      attribution: "attribution" in metric ? sanitizeAttribution(metric.attribution) : undefined
    };

    sendVitals(JSON.stringify(payload));
  });

  return null;
}
