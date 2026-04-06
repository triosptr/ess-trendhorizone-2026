import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <h1 className="title">ESS Dashboard</h1>
          <p className="muted">
            {profile.full_name} • {profile.role}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" href="/attendance">
            Absensi
          </Link>
          <Link className="btn" href="/enroll-face">
            Enroll Wajah
          </Link>
          <SignOutButton />
        </div>
      </header>
      {children}
    </main>
  );
}
