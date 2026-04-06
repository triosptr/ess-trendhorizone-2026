"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ProfilePayload {
  id: string;
  full_name: string;
  email: string;
  employee_id: string;
  department: string;
  position: string;
  phone: string;
  address: string;
  join_date: string;
  role: "employee";
  status: "active";
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (cooldownLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownLeft]);

  function buildProfilePayload(userId: string): ProfilePayload {
    return {
      id: userId,
      full_name: fullName,
      email,
      employee_id: employeeId,
      department,
      position,
      phone,
      address,
      join_date: joinDate,
      role: "employee",
      status: "active"
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (cooldownLeft > 0) {
      setError(`Terlalu banyak percobaan. Coba lagi dalam ${cooldownLeft} detik.`);
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=/enroll-face`,
          data: {
            full_name: fullName,
            employee_id: employeeId,
            department,
            position,
            phone,
            address,
            join_date: joinDate,
            role: "employee",
            status: "active"
          }
        }
      });

      if (signUpError) {
        const isRateLimit = signUpError.message.toLowerCase().includes("rate limit");
        if (!isRateLimit) {
          setError(signUpError.message);
          return;
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError || !signInData.user) {
          setError("Terlalu banyak percobaan pendaftaran email. Tunggu beberapa menit lalu coba lagi, atau login jika akun sudah pernah dibuat.");
          setCooldownLeft(60);
          return;
        }

        const { error: profileError } = await supabase.from("profiles").upsert(buildProfilePayload(signInData.user.id), { onConflict: "id" });
        if (profileError) {
          setError(profileError.message);
          return;
        }

        setSuccess("Akun sudah aktif. Data profil tersimpan, lanjut ke dashboard.");
        setNeedsVerification(false);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 900);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("Akun belum berhasil dibuat.");
        return;
      }

      if (data.session) {
        setSuccess("Sign up berhasil. Lanjut enroll wajah untuk absensi.");
        setNeedsVerification(false);
        setTimeout(() => {
          router.push("/enroll-face");
          router.refresh();
        }, 900);
        return;
      }

      setSuccess("Sign up berhasil. Cek email verifikasi lalu login.");
      setNeedsVerification(true);
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setError("");
    setSuccess("");
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
      setSuccess("Email verifikasi sudah dikirim ulang. Silakan cek inbox/spam.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 className="title">Sign Up Karyawan Baru</h1>
        <p className="muted">Lengkapi data berikut untuk membuat akun ESS.</p>
        <form onSubmit={onSubmit}>
          <div className="grid grid-2">
            <div className="field">
              <label className="label">Nama Lengkap</label>
              <input className="input" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </div>
            <div className="field">
              <label className="label">NIK / Employee ID</label>
              <input className="input" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            </div>
            <div className="field">
              <label className="label">Department</label>
              <input className="input" value={department} onChange={(event) => setDepartment(event.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Jabatan</label>
              <input className="input" value={position} onChange={(event) => setPosition(event.target.value)} required />
            </div>
            <div className="field">
              <label className="label">No. HP</label>
              <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Tanggal Bergabung</label>
              <input className="input" type="date" value={joinDate} onChange={(event) => setJoinDate(event.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label className="label">Alamat</label>
            <textarea className="textarea" rows={3} value={address} onChange={(event) => setAddress(event.target.value)} required />
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          {needsVerification && (
            <div style={{ marginBottom: 12 }}>
              <button className="btn btn-secondary" type="button" onClick={resendVerification} disabled={loading || !email}>
                Kirim Ulang Email Verifikasi
              </button>
            </div>
          )}
          <button className="btn" type="submit" disabled={loading || cooldownLeft > 0}>
            {loading ? "Menyimpan..." : cooldownLeft > 0 ? `Coba Lagi (${cooldownLeft}s)` : "Buat Akun"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 14 }}>
          Sudah punya akun? <Link href="/login">Login di sini</Link>
        </p>
      </div>
    </main>
  );
}
