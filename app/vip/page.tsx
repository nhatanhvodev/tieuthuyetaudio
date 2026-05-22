import Link from "next/link";
import { Check, Crown, Download, Shield } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { PlanComparison } from "@/components/vip/plan-comparison";
import { Button } from "@/components/ui/button";

const features = [
  { title: "Tap premium theo lo", description: "Mo khoa cac tap premium duoc danh dau trong tung bo truyen ma khong can tach app rieng.", icon: Shield },
  { title: "Dong bo tien trinh", description: "Tiep tuc nghe tren web hoac PWA tu dung vi tri da dung.", icon: Check },
  { title: "Cai nhu app", description: "Mo nhanh tu man hinh chinh tren Android va giu player lien mach hon.", icon: Download }
];

const faq = [
  {
    q: "Premium episode model v1 hoat dong the nao?",
    a: "Ban free van nghe duoc cac tap mo. Cac tap duoc admin danh dau premium se hien soft paywall, cho xem metadata va upsell thay vi khoa cung bang loi 403."
  },
  {
    q: "Admin va tai khoan VIP co bi chan khong?",
    a: "Khong. Admin va VIP van phat day du de team co the test content, conversion flow va van hanh catalog."
  },
  {
    q: "Feature flag dung de lam gi?",
    a: "NEXT_PUBLIC_FEATURE_PAYWALL cho phep bat/tat toan bo premium gate ma khong can rollback code."
  }
];

export default function VipPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="glass-panel rounded-lg p-6 md:p-10">
        <div className="flex items-center gap-2 text-accent">
          <Crown aria-hidden="true" />
          <span className="text-sm font-semibold">Goi VIP</span>
        </div>
        <h1 className="mt-4 text-4xl font-black md:text-6xl">Nghe truyen thoai mai hon</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          VIP giup giam gian doan, uu tien trai nghiem nghe lien tuc va mo khoa cac tap premium duoc gan trong bo truyen.
          Tai khoan VIP co the nghe day du tat ca noi dung da duoc gan quyen.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dang-ky">Dang ky tai khoan</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/truyen">Thu vien mien phi</Link>
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
