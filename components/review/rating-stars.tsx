"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  onChange,
  readonly = false
}: {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        if (readonly) {
          return <Star key={star} aria-hidden="true" className={cn(active ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />;
        }
        return (
          <button key={star} type="button" aria-label={`${star} sao`} onClick={() => onChange?.(star)} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Star aria-hidden="true" className={cn(active ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </button>
        );
      })}
    </div>
  );
}
