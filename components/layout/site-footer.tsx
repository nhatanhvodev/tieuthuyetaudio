import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="hidden md:block border-t border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-sm font-bold" style={{ fontFamily: "var(--font-headline)" }}>Tiểu thuyết Audio</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Nghe tiểu thuyết audio tiếng Việt với player PWA, thư viện truyện và tiến trình nghe.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>Liên kết</p>
            <div className="mt-3 grid gap-2">
              <Link href="/truyen" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kho truyện</Link>
              <Link href="/the-loai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Thể loại</Link>
              <Link href="/vip" className="text-sm text-muted-foreground hover:text-foreground transition-colors">VIP</Link>
              <Link href="/cong-dong" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cộng đồng</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>Tài khoản</p>
            <div className="mt-3 grid gap-2">
              <Link href="/dang-nhap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Đăng nhập</Link>
              <Link href="/dang-ky" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Đăng ký</Link>
              <Link href="/tai-khoan" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tài khoản</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Tiểu thuyết Audio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
