# ESS Karyawan TGH

Aplikasi ESS modern berbasis Next.js + Supabase + Vercel dengan fitur:

- Sign up karyawan baru dengan data profil lengkap
- Login berbasis Supabase Auth
- Dashboard berbeda untuk superadmin dan karyawan
- Absensi check in/check out berbasis face recognition
- Enroll wajah per karyawan

## Tech Stack

- Next.js (App Router, TypeScript)
- Supabase (Auth + Postgres + RLS)
- face-api.js (deteksi dan descriptor wajah)
- Vercel (hosting)

## Struktur Utama

- `src/app/signup` untuk registrasi karyawan baru
- `src/app/dashboard/admin` untuk dashboard superadmin
- `src/app/dashboard/employee` untuk dashboard karyawan
- `src/app/attendance` untuk absensi wajah
- `src/app/enroll-face` untuk pendaftaran wajah
- `src/app/api` untuk endpoint enroll dan absensi
- `supabase/migrations/20260406_init_ess.sql` untuk skema database

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Copy env:

```bash
cp .env.example .env.local
```

3. Isi env wajib di `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Jalankan migrasi SQL di Supabase SQL Editor:
   - `supabase/migrations/20260406_init_ess.sql`

5. Jalankan aplikasi:

```bash
npm run dev
```

## Setup Superadmin Pertama

1. Buat akun dari halaman sign up.
2. Di Supabase table `profiles`, ubah kolom `role` untuk akun tersebut menjadi `superadmin`.
3. Login ulang, otomatis masuk dashboard superadmin.

## Deploy Vercel

```bash
npx vercel@latest --prod
```
