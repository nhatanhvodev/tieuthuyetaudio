import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col items-center justify-center gap-5 px-4 py-10">
      <Suspense fallback={<div className="h-80 w-full max-w-md rounded-lg bg-card" />}>
        <LoginForm />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        Chua co tai khoan? <Link className="text-primary" href="/dang-ky">Dang ky</Link>
      </p>
    </section>
  );
}
