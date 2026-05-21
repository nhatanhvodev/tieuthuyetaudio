import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-10 md:min-h-[calc(100dvh-10rem)] md:justify-center">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold text-accent">Tài khoản</p>
        <h1 className="mt-2 text-4xl font-black">Đăng ký</h1>
      </div>
      <RegisterForm />
      <p className="text-sm text-muted-foreground">
        Đã có tài khoản? <Link className="text-accent" href="/dang-nhap">Đăng nhập</Link>
      </p>
    </section>
  );
}
