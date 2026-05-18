import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col items-center justify-center gap-5 px-4 py-10">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold text-accent">Tài khoản</p>
        <h1 className="mt-2 text-4xl font-black">Đăng nhập</h1>
      </div>
      <Suspense fallback={<div className="h-80 w-full max-w-md rounded-lg bg-card" />}>
        <LoginForm />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        Chưa có tài khoản? <Link className="text-accent" href="/dang-ky">Đăng ký</Link>
      </p>
    </section>
  );
}
