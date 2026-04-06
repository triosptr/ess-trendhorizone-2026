import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <div className="card">
        <h1 className="title">ESS Karyawan TGH</h1>
        <p className="muted">Aplikasi modern untuk manajemen karyawan, absensi face recognition, dan dashboard berbasis role.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <Link href="/login" className="btn">
            Login
          </Link>
          <Link href="/signup" className="btn btn-secondary">
            Sign Up Karyawan Baru
          </Link>
        </div>
      </div>
    </main>
  );
}
