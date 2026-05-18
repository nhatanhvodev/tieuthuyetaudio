import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background pb-24 pt-10 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 text-sm text-muted-foreground md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-black text-foreground">Tiểu thuyết Audio</p>
          <p className="mt-2 leading-6">Nền tảng demo cho trải nghiệm nghe truyện audio tiếng Việt trên web và mobile PWA.</p>
        </div>
        <div className="grid gap-2">
          <Link href="/truyen">Kho truyện</Link>
          <Link href="/the-loai">Thể loại</Link>
          <Link href="/cong-dong">Cộng đồng</Link>
        </div>
        <p className="leading-6 md:text-right">Không sử dụng logo sao chép, truyện có bản quyền hoặc audio trái phép.</p>
      </div>
    </footer>
  );
}
