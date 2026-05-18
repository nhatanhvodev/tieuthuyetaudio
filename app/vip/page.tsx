import Link from "next/link";
import { Check, Crown, Download, Shield } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { PlanComparison } from "@/components/vip/plan-comparison";
import { Button } from "@/components/ui/button";

const features = [
  { title: "Không quảng cáo", description: "Tập trung nghe truyện, không bị ngắt mạch nội dung.", icon: Shield },
  { title: "Đồng bộ tiến trình", description: "Tiếp tục nghe trên web hoặc PWA từ đúng vị trí đã dừng.", icon: Check },
  { title: "Cài như app", description: "Mở nhanh từ màn hình chính trên điện thoại Android.", icon: Download }
];

export default function VipPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-lg border bg-card/90 p-6 md:p-10">
        <div className="flex items-center gap-2 text-accent">
          <Crown aria-hidden="true" />
          <span className="text-sm font-semibold">Goi VIP demo</span>
        </div>
        <h1 className="mt-4 text-4xl font-black md:text-6xl">Nghe truyen thoai mai hon</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          VIP giup giam gian doan, uu tien trai nghiem nghe lien tuc va de dang theo doi cac bo truyen dang cap nhat.
          O ban hien tai, kich hoat VIP duoc mo phong de team test conversion flow truoc khi mo thanh toan that.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dang-ky">Dang ky tai khoan</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/truyen">Thu vien mien phi</Link>
          </Button>
          <InstallAppButton />
        </div>
      </div>

      <div className="mt-8">
        <PlanComparison />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-lg border bg-card/90 p-5">
              <Icon aria-hidden="true" className="text-accent" />
              <h2 className="mt-4 text-xl font-black">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
