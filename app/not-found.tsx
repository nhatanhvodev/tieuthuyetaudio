import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-black">Không tìm thấy trang</h1>
      <p className="text-muted-foreground">Nội dung này không tồn tại hoặc đã được di chuyển.</p>
      <Button asChild>
        <Link href="/">Về trang chủ</Link>
      </Button>
    </section>
  );
}
