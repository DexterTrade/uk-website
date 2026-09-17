import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "40px 20px",
        background: "var(--bg-soft)",
      }}
    >
      <div style={{ maxWidth: 380, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 24, textAlign: "center" }}>
          PAK Cargo staff
        </h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
