import { InstallAppButton } from "@/components/pwa/install-app-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VipPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">VIP demo</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Ban dau dung VIP mock do admin kich hoat. Thanh toan that se la giai doan sau.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["Khong quang cao", "Dong bo tien trinh", "Cai nhu app"].map((item) => (
          <Card key={item}><CardHeader><CardTitle>{item}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Tinh nang demo trong MVP.</p></CardContent></Card>
        ))}
      </div>
      <div className="mt-8"><InstallAppButton /></div>
    </section>
  );
}
