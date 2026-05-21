import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ComparisonItem = {
  feature: string;
  free: string | boolean;
  vip: string | boolean;
};

const comparison: ComparisonItem[] = [
  { feature: "Thư viện có sẵn", free: "Tập thử + các tập mở", vip: "Đầy đủ" },
  { feature: "Tập premium", free: "Khóa mềm", vip: true },
  { feature: "Đồng bộ tiến trình giữa các thiết bị", free: true, vip: true },
  { feature: "Tự động phát tập tiếp theo", free: true, vip: true },
  { feature: "Bookmark + ghi chú", free: true, vip: true },
  { feature: "Hỗ trợ offline PWA", free: false, vip: true },
  { feature: "Ưu tiên cập nhật nội dung mới", free: "Cơ bản", vip: "Ưu tiên" },
  { feature: "Hỗ trợ nhanh 1-1", free: false, vip: true }
];

function renderValue(value: string | boolean) {
  if (typeof value === "string") {
    return <span className="text-sm font-semibold">{value}</span>;
  }

  return value ? <Check aria-hidden="true" className="mx-auto size-4 text-emerald-500" /> : <Minus aria-hidden="true" className="mx-auto size-4 text-muted-foreground" />;
}

export function PlanComparison() {
  return (
    <section className="glass-panel rounded-xl p-5 md:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">Bảng so sánh</Badge>
        <p className="text-sm text-muted-foreground">Mô hình v1 là hybrid: free + soft paywall cho các tập premium được đánh dấu.</p>
      </div>

      <div className="mt-5 overflow-x-auto md:hidden">
        <div className="space-y-3">
          {comparison.map((item) => (
            <article key={item.feature} className="rounded-lg border bg-card/60 p-4">
              <p className="text-sm font-bold">{item.feature}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-md bg-secondary/80 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Free</p>
                  <div className="mt-1">{renderValue(item.free)}</div>
                </div>
                <div className="rounded-md bg-secondary/80 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">VIP</p>
                  <div className="mt-1">{renderValue(item.vip)}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="py-3 pr-4 font-semibold">Tính năng</th>
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
