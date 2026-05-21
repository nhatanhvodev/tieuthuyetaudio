import Link from "next/link";
import { Check, Crown, Download, Shield } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { PlanComparison } from "@/components/vip/plan-comparison";
import { Button } from "@/components/ui/button";

const features = [
  { title: "Tập premium theo lộ", description: "Mở khóa các tập premium được đánh dấu trong từng bộ truyện mà không cần tách app riêng.", icon: Shield },
  { title: "Đồng bộ tiến trình", description: "Tiếp tục nghe trên web hoặc PWA từ đúng vị trí đã dừng.", icon: Check },
  { title: "Cài như app", description: "Mở nhanh từ màn hình chính trên Android và giữ player liền mạch hơn.", icon: Download }
];

const faq = [
  {
    q: "Premium episode model v1 hoạt động thế nào?",
    a: "Bạn free vẫn nghe được các tập mở. Các tập được admin đánh dấu premium sẽ hiện soft paywall, cho xem metadata và upsell thay vì khóa cứng bằng lỗi 403."
  },
  {
    q: "Admin và tài khoản VIP có bị chặn không?",
    a: "Không. Admin và VIP vẫn phát đầy đủ để team có thể test content, conversion flow và vận hành catalog."
  },
  {
    q: "Feature flag dùng để làm gì?",
    a: "NEXT_PUBLIC_FEATURE_PAYWALL cho phép bật/tắt toàn bộ premium gate mà không cần rollback code."
  }
];

export default function VipPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="glass-panel rounded-lg p-6 md:p-10">
        <div className="flex items-center gap-2 text-accent">
          <Crown aria-hidden="true" />
          <span className="text-sm font-semibold">Gói VIP demo</span>
        </div>
        <h1 className="mt-4 text-4xl font-black md:text-6xl">Nghe truyện thoải mái hơn</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          VIP giúp giảm gián đoạn, ưu tiên trải nghiệm nghe liên tục và mở khóa các tập premium được gắn trong bộ truyện.
          Ở bản hiện tại, kích hoạt VIP được mô phỏng để team test soft paywall, recommendation và conversion flow trước khi mở thanh toán thật.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dang-ky">Đăng ký tài khoản</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/truyen">Thư viện miễn phí</Link>
          </Button>
        </div>
        <div className="mt-3">
          <InstallAppButton compact />
        </div>
      </div>

      <div className="mt-8">
        <PlanComparison />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="glass-panel rounded-lg p-5">
              <Icon aria-hidden="true" className="text-accent" />
              <h2 className="mt-4 text-xl font-black">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {faq.map((item) => (
          <article key={item.q} className="glass-panel rounded-lg p-5">
            <h2 className="text-lg font-black">{item.q}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
