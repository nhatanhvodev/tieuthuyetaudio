import Link from "next/link";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ContextualUpsellProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  href?: string;
  compact?: boolean;
};

export function ContextualUpsell({
  title = "Mo khoa trai nghiem nghe khong gioi han",
  description = "Nang cap VIP de mo rong thu vien, nghe lien mach va uu tien nhan cac cap nhat moi nhat.",
  ctaLabel = "Xem quyen loi VIP",
  href = "/vip",
  compact = false
}: ContextualUpsellProps) {
  return (
    <aside className="rounded-lg border border-accent/40 bg-gradient-to-br from-accent/15 to-card p-4">
      <div className="flex items-center gap-2 text-accent">
        <Crown aria-hidden="true" className="size-4" />
        <Badge variant="accent">De xuat VIP</Badge>
      </div>
      <h3 className={`mt-3 font-black ${compact ? "text-lg" : "text-2xl"}`}>{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <Button asChild className="mt-4">
        <Link href={href}>{ctaLabel}</Link>
      </Button>
    </aside>
  );
}
