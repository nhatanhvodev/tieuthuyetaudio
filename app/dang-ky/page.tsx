import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col items-center justify-center gap-5 px-4 py-10">
      <RegisterForm />
      <p className="text-sm text-muted-foreground">
        Da co tai khoan? <Link className="text-primary" href="/dang-nhap">Dang nhap</Link>
      </p>
    </section>
  );
}
