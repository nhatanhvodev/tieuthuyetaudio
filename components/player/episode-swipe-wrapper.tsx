"use client";

import { useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";

export function EpisodeSwipeWrapper({
  children,
  prevHref,
  nextHref
}: {
  children: ReactNode;
  prevHref?: string;
  nextHref?: string;
}) {
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      onTouchStart={(e) => {
        touchStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }}
      onTouchEnd={(e) => {
        if (!touchStart.current) return;
        const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
        const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
        touchStart.current = null;

        if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

        if (deltaX > 0 && prevHref) {
          router.push(prevHref);
        } else if (deltaX < 0 && nextHref) {
          router.push(nextHref);
        }
      }}
    >
      {children}
    </div>
  );
}
