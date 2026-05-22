import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-10 md:min-h-[calc(100dvh-10rem)] md:justify-center">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold text-accent">Tai khoan</p>
        <h1 className="mt-2 text-4xl font-black">Dang ky</h1>
      </div>
      <SignUp path="/dang-ky" routing="path" signInUrl="/dang-nhap" />
    </section>
  );
}
