import AdminClient from "./AdminClient";

export const metadata = {
  title: "Admin panel",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
