import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-black">Khong tim thay trang</h1>
      <p className="text-muted-foreground">Noi dung nay khong ton tai hoac da duoc di chuyen.</p>
      <Button asChild>
        <Link href="/">Ve trang chu</Link>
      </Button>
    </section>
  );
}
