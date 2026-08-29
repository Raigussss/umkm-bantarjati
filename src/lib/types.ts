export interface UMKM {
  id: string;
  nama_usaha: string;
  pemilik: string;
  kategori: string;
  rw: string;
  alamat: string;
  lat: number | null;
  lng: number | null;
  foto_urls: string[] | null;
  deskripsi: string | null;
  produk: string | null;
  jumlah_pegawai: number;
  is_unggulan: boolean;
  maps_url: string | null;
  created_at: string;
}

export interface PengajuanUMKM {
  id: string;
  nama_usaha: string;
  pemilik: string;
  no_hp: string;
  kategori: string;
  rw: string;
  alamat: string;
  lat: number | null;
  lng: number | null;
  deskripsi: string | null;
  foto_urls: string[] | null;
  produk: string | null;
  jumlah_pegawai: number;
  status: "pending" | "approved" | "rejected";
  catatan_admin: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  created_at: string;
}

export interface ProfilLembaga {
  id: string;
  jabatan: string;
  nama: string;
  foto_url: string | null;
  deskripsi: string | null;
  urutan: number;
  created_at: string;
}

export interface RWStats {
  rw: string;
  total: number;
  total_pegawai: number;
  maps_url: string | null;
}
