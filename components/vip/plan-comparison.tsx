import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ComparisonItem = {
  feature: string;
  free: string | boolean;
  vip: string | boolean;
};

const comparison: ComparisonItem[] = [
  { feature: "Thu vien co san", free: "Tap thu + cac tap mo", vip: "Day du" },
  { feature: "Tap premium", free: "Khoa mem", vip: true },
  { feature: "Dong bo tien trinh giua cac thiet bi", free: true, vip: true },
  { feature: "Tu dong phat tap tiep theo", free: true, vip: true },
  { feature: "Bookmark + ghi chu", free: true, vip: true },
  { feature: "Ho tro offline PWA", free: false, vip: true },
  { feature: "Uu tien cap nhat noi dung moi", free: "Co ban", vip: "Uu tien" },
  { feature: "Ho tro nhanh 1-1", free: false, vip: true }
];

function renderValue(value: string | boolean) {
  if (typeof value === "string") {
    return <span className="text-sm font-semibold">{value}</span>;
  }

  return value ? <Check aria-hidden="true" className="mx-auto size-4 text-emerald-500" /> : <Minus aria-hidden="true" className="mx-auto size-4 text-muted-foreground" />;
}

export function PlanComparison() {
  return (
    <section className="rounded-xl border bg-card/90 p-5 md:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">Bang so sanh</Badge>
        <p className="text-sm text-muted-foreground">Mo hinh v1 la hybrid: free + soft paywall cho cac tap premium duoc danh dau.</p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="py-3 pr-4 font-semibold">Tinh nang</th>
              <th className="w-32 py-3 text-center font-semibold">Free</th>
              <th className="w-32 py-3 text-center font-semibold">VIP</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((item) => (
              <tr key={item.feature} className="border-b last:border-b-0">
                <td className="py-3 pr-4">{item.feature}</td>
                <td className="py-3 text-center">{renderValue(item.free)}</td>
                <td className="py-3 text-center">{renderValue(item.vip)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
