# ESS Karyawan TGH

Bootstrap integrasi GitHub, Supabase, dan Vercel untuk proyek ESS Karyawan TGH.

## Status Integrasi

- Git repository sudah diinisialisasi pada branch `main`
- Template konfigurasi environment untuk Supabase sudah tersedia di `.env.example`
- Baseline konfigurasi Vercel tersedia di `vercel.json`
- Baseline konfigurasi Supabase tersedia di `supabase/config.toml`

## Langkah Hubungkan GitHub

1. Buat repository kosong di GitHub dengan nama `ess-karyawan-tgh`
2. Tambahkan remote:

```bash
git remote add origin https://github.com/triosaputra/ess-karyawan-tgh.git
```

3. Commit awal dan push:

```bash
git add .
git commit -m "chore: bootstrap ESS Karyawan TGH integrations"
git push -u origin main
```

## Langkah Hubungkan Supabase

1. Copy env:

```bash
cp .env.example .env.local
```

2. Isi nilai:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Ganti `YOUR_PROJECT_REF` di `supabase/config.toml` dengan project ref Supabase
4. Link project via CLI:

```bash
npx supabase@latest link --project-ref YOUR_PROJECT_REF
```

## Langkah Hubungkan Vercel

1. Login dan link project:

```bash
npx vercel@latest link
```

2. Tambahkan environment variables Supabase di dashboard Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy pertama:

```bash
npx vercel@latest --prod
```
