import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-bg-soft px-5 py-10">
      <div className="mx-auto w-full max-w-[380px]">
        <h1 className="mb-6 text-center text-[26px] font-extrabold">
          PAK Cargo staff
        </h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
