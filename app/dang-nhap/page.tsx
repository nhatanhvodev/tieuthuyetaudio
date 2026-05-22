import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-10 md:min-h-[calc(100dvh-10rem)] md:justify-center">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold text-accent">Tai khoan</p>
        <h1 className="mt-2 text-4xl font-black">Dang nhap</h1>
      </div>
      <SignIn path="/dang-nhap" routing="path" signUpUrl="/dang-ky" />
    </section>
  );
}
