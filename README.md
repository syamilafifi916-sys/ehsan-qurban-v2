# Ehsan Qurban v2

Struktur baharu dengan Vercel Serverless API + Supabase.

## Setup ringkas
1. Buat project baharu di Supabase.
2. Buka `supabase/schema.sql`, copy semua dan run di Supabase SQL Editor.
3. Copy `.env.example` kepada `.env.local`.
4. Isi `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`.
5. Install dependency:

```bash
npm install
```

6. Run local:

```bash
vercel dev
```

7. Deploy production:

```bash
vercel --prod
```

## Fail penting
- `public/index.html` - Public portal
- `public/admin.html` - Admin dashboard awal
- `api/login.js` - Login admin secure
- `api/register.js` - Pendaftaran peserta
- `api/cows.js` - Senarai lembu/kumpulan
- `api/admins.js` - Tambah admin
- `supabase/schema.sql` - Database schema
