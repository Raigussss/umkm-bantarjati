-- ============================================================
-- UMKM Bantarjati — schema bersih untuk fresh setup
-- Script ini dibuat untuk project yang sudah konsisten dengan app
-- frontend dan admin panel di repo ini.
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hapus tabel lama untuk setup yang bersih.
DROP TABLE IF EXISTS public.pengajuan_umkm CASCADE;
DROP TABLE IF EXISTS public.umkm CASCADE;
DROP TABLE IF EXISTS public.profil_lembaga CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- ============================================================
-- 1. Tabel data publik
-- ============================================================
CREATE TABLE public.umkm (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_usaha     TEXT NOT NULL,
  pemilik        TEXT NOT NULL,
  kategori       TEXT NOT NULL,
  rw             TEXT NOT NULL,
  alamat         TEXT NOT NULL,
  lat            DOUBLE PRECISION,
  lng            DOUBLE PRECISION,
  foto_urls      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  deskripsi      TEXT,
  produk         TEXT,
  jumlah_pegawai INTEGER NOT NULL DEFAULT 1,
  is_unggulan    BOOLEAN NOT NULL DEFAULT false,
  maps_url       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. Tabel pengajuan warga
-- ============================================================
CREATE TABLE public.pengajuan_umkm (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_usaha     TEXT NOT NULL,
  pemilik        TEXT NOT NULL,
  no_hp          TEXT NOT NULL,
  kategori       TEXT NOT NULL,
  rw             TEXT NOT NULL,
  alamat         TEXT NOT NULL,
  lat            DOUBLE PRECISION,
  lng            DOUBLE PRECISION,
  deskripsi      TEXT,
  foto_urls      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  produk         TEXT,
  jumlah_pegawai INTEGER NOT NULL DEFAULT 1,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  catatan_admin  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. Tabel auth admin
-- ============================================================
CREATE TABLE public.admin_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. Tabel profil lembaga
-- ============================================================
CREATE TABLE public.profil_lembaga (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jabatan    TEXT NOT NULL,
  nama       TEXT NOT NULL,
  foto_url   TEXT,
  deskripsi  TEXT,
  urutan     INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. RLS setup
-- ============================================================
ALTER TABLE public.umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengajuan_umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profil_lembaga ENABLE ROW LEVEL SECURITY;

-- umkm bisa dibaca publik, dan admin panel bisa insert/update/delete
CREATE POLICY "umkm_select_public" ON public.umkm
  FOR SELECT USING (true);

CREATE POLICY "umkm_insert_public" ON public.umkm
  FOR INSERT WITH CHECK (true);

CREATE POLICY "umkm_update_public" ON public.umkm
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "umkm_delete_public" ON public.umkm
  FOR DELETE USING (true);

-- pengajuan bisa dibuat publik, dibaca publik, diubah publik, dihapus publik
CREATE POLICY "pengajuan_select_public" ON public.pengajuan_umkm
  FOR SELECT USING (true);

CREATE POLICY "pengajuan_insert_public" ON public.pengajuan_umkm
  FOR INSERT WITH CHECK (true);

CREATE POLICY "pengajuan_update_public" ON public.pengajuan_umkm
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "pengajuan_delete_public" ON public.pengajuan_umkm
  FOR DELETE USING (true);

-- admin_users untuk login publik via anon key
CREATE POLICY "admin_select_public" ON public.admin_users
  FOR SELECT USING (true);

-- profil lembaga dibaca publik dan bisa diubah admin
CREATE POLICY "profil_lembaga_select_public" ON public.profil_lembaga
  FOR SELECT USING (true);

CREATE POLICY "profil_lembaga_update_public" ON public.profil_lembaga
  FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================
-- 6. Bucket storage untuk foto UMKM dan profil lembaga
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('umkm-images', 'umkm-images', true),
       ('profil-lembaga', 'profil-lembaga', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- policy untuk bucket umkm-images
DROP POLICY IF EXISTS "umkm_images_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "umkm_images_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "umkm_images_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "umkm_images_storage_delete" ON storage.objects;

CREATE POLICY "umkm_images_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'umkm-images');

CREATE POLICY "umkm_images_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'umkm-images');

CREATE POLICY "umkm_images_storage_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'umkm-images');

CREATE POLICY "umkm_images_storage_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'umkm-images');

-- policy untuk bucket profil-lembaga
DROP POLICY IF EXISTS "profil_lembaga_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "profil_lembaga_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "profil_lembaga_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "profil_lembaga_storage_delete" ON storage.objects;

CREATE POLICY "profil_lembaga_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'profil-lembaga');

CREATE POLICY "profil_lembaga_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profil-lembaga');

CREATE POLICY "profil_lembaga_storage_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profil-lembaga');

CREATE POLICY "profil_lembaga_storage_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'profil-lembaga');

-- ============================================================
-- 7. Seed data default
-- ============================================================
INSERT INTO public.admin_users (username, password)
VALUES ('admin', 'bantarjati2024')
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.umkm (
  nama_usaha, pemilik, kategori, rw, alamat, lat, lng, foto_urls, produk, jumlah_pegawai, is_unggulan, maps_url
) VALUES
  (
    'Warung Nasi Bu Siti',
    'Siti Rahayu',
    'Kuliner',
    'RW 01',
    'Jl. Bantarjati Dalam No. 5',
    -6.5910,
    106.7980,
    ARRAY['https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&auto=format'],
    'Nasi Uduk, Nasi Kuning, Lontong Sayur',
    3,
    true,
    'https://maps.google.com/?q=-6.5910,106.7980'
  ),
  (
    'Toko Batik Kirana',
    'Kirana Dewi',
    'Fashion',
    'RW 02',
    'Jl. Dadali No. 12',
    -6.5925,
    106.7992,
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format'],
    'Batik Tulis, Batik Cap, Kain Tenun',
    5,
    true,
    'https://maps.google.com/?q=-6.5925,106.7992'
  ),
  (
    'Bengkel Las Pak Hendra',
    'Hendra Santoso',
    'Jasa',
    'RW 03',
    'Jl. Baru No. 7',
    -6.5945,
    106.7965,
    ARRAY[]::TEXT[],
    'Las Listrik, Teralis Besi, Pintu Besi, Kanopi',
    4,
    false,
    'https://maps.google.com/?q=-6.5945,106.7965'
  ),
  (
    'UD Sembako Maju Jaya',
    'Agus Prasetyo',
    'Perdagangan',
    'RW 04',
    'Jl. Bantarjati Raya No. 88',
    -6.5905,
    106.7975,
    ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&auto=format'],
    'Beras, Minyak Goreng, Gula, Tepung Terigu',
    2,
    false,
    'https://maps.google.com/?q=-6.5905,106.7975'
  ),
  (
    'Kerajinan Bambu Lestari',
    'Lestari Wulandari',
    'Kerajinan',
    'RW 05',
    'Jl. Kebon Jahe No. 3',
    -6.5932,
    106.8005,
    ARRAY['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=300&fit=crop&auto=format'],
    'Anyaman Bambu, Keranjang, Dekorasi Dinding',
    6,
    true,
    'https://maps.google.com/?q=-6.5932,106.8005'
  ),
  (
    'Salon Kecantikan Bunga',
    'Bunga Pertiwi',
    'Jasa',
    'RW 06',
    'Jl. Melati No. 15',
    -6.5918,
    106.7998,
    ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&auto=format'],
    'Potong Rambut, Cat Rambut, Perawatan Wajah',
    3,
    false,
    'https://maps.google.com/?q=-6.5918,106.7998'
  ),
  (
    'Tahu Tempe Pak Suparman',
    'Suparman',
    'Kuliner',
    'RW 07',
    'Jl. Sejahtera No. 22',
    -6.5940,
    106.7985,
    ARRAY[]::TEXT[],
    'Tahu Goreng, Tempe Mendoan, Oncom Goreng',
    2,
    false,
    'https://maps.google.com/?q=-6.5940,106.7985'
  ),
  (
    'Konveksi Karya Mandiri',
    'Mandiri Jaya',
    'Fashion',
    'RW 08',
    'Jl. Mandiri No. 10',
    -6.5915,
    106.8010,
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format'],
    'Seragam Sekolah, Kaos Custom, Jaket Almamater',
    8,
    true,
    'https://maps.google.com/?q=-6.5915,106.8010'
  ),
  (
    'Warung Kopi Ngopi Dulu',
    'Ridwan Fauzi',
    'Kuliner',
    'RW 09',
    'Jl. Kopi No. 1',
    -6.5950,
    106.7975,
    ARRAY['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop&auto=format'],
    'Kopi Arabika, Kopi Robusta, Teh Tarik, Susu',
    4,
    true,
    'https://maps.google.com/?q=-6.5950,106.7975'
  ),
  (
    'Pertanian Organik Hijau',
    'Sri Mulyani',
    'Pertanian',
    'RW 10',
    'Jl. Sawah Baru No. 5',
    -6.5928,
    106.7960,
    ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&auto=format'],
    'Sayuran Organik, Pupuk Kompos, Bibit Tanaman',
    5,
    false,
    'https://maps.google.com/?q=-6.5928,106.7960'
  );

INSERT INTO public.profil_lembaga (jabatan, nama, deskripsi, urutan)
VALUES
  ('Lurah Bantarjati', 'Nama Pak Lurah', 'Pimpinan Kelurahan Bantarjati.', 1),
  ('Sekretaris Kelurahan', 'Nama Pak Sekretaris', 'Mendukung administrasi dan pelayanan kelurahan.', 2),
  ('Lembaga Kemasyarakatan', 'Lembaga Bantarjati', 'Mitra warga dalam mengembangkan potensi wilayah.', 3),
  ('Ketua PKK Bantarjati', 'Nama Ketua PKK', 'Menggerakkan pemberdayaan dan kesejahteraan keluarga di Bantarjati.', 4)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. Catatan deploy
-- ============================================================
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Paste semua script di sini
-- 3. Jalankan sekali untuk setup database baru
-- 4. Isi file .env project dengan:
--    VITE_SUPABASE_URL=https://your-project.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-key
-- 5. Restart dev server
--
-- Login admin default:
--   username: admin
--   password: bantarjati2024
--
-- Sebelum production, ganti password admin di database.
-- ============================================================

COMMIT;
