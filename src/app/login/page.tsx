"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const urlError = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
    const err = url.searchParams.get("error") ?? url.searchParams.get("error_code") ?? hashParams.get("error") ?? hashParams.get("error_code");
    const desc = url.searchParams.get("error_description") ?? hashParams.get("error_description");
    return { err, desc };
  }, []);

  useEffect(() => {
    if (!urlError?.err && !urlError?.desc) return;
    if (urlError.err === "otp_expired") {
      setError("Link verifikasi email sudah kedaluwarsa. Silakan kirim ulang email verifikasi.");
      return;
    }
    if (urlError.desc) {
      setError(decodeURIComponent(urlError.desc.replace(/\+/g, " ")));
      return;
    }
    if (urlError.err) {
      setError(urlError.err);
    }
  }, [urlError]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=/enroll-face`
        }
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      setInfo("Email verifikasi sudah dikirim ulang. Silakan cek inbox/spam.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
        <h1 className="title">Login ESS</h1>
        <p className="muted">Masuk sebagai karyawan atau superadmin.</p>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {error && <p className="error">{error}</p>}
          {info && <p className="success">{info}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Login"}
          </button>
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-secondary" type="button" onClick={resendVerification} disabled={loading || !email}>
              Kirim Ulang Email Verifikasi
            </button>
          </div>
        </form>
        <p className="muted" style={{ marginTop: 14 }}>
          Belum punya akun? <Link href="/signup">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}
