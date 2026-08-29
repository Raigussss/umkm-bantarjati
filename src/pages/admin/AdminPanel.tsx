import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { useUMKM } from "../../lib/umkm";
import ImageCropper from "../../components/ImageCropper";
import type { UMKM, PengajuanUMKM, ProfilLembaga } from "../../lib/types";

type Tab = "dashboard" | "pengajuan" | "umkm" | "profil";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

const createUploadId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const removeStorageFile = async (bucket: string, url: string | undefined) => {
  if (!url) return;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return;
  const path = decodeURIComponent(url.slice(markerIndex + marker.length));
  await supabase.storage.from(bucket).remove([path]);
};

function UMKMModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: UMKM | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nama_usaha: initial?.nama_usaha || "",
    pemilik: initial?.pemilik || "",
    kategori: initial?.kategori || "",
    rw: initial?.rw || "",
    alamat: initial?.alamat || "",
    lat: initial?.lat?.toString() || "",
    lng: initial?.lng?.toString() || "",
    foto_urls: initial?.foto_urls || [],
    deskripsi: initial?.deskripsi || "",
    produk: initial?.produk || "",
    jumlah_pegawai: initial?.jumlah_pegawai?.toString() || "1",
    is_unggulan: initial?.is_unggulan || false,
    maps_url: initial?.maps_url || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null]);

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const previousPhotos = [...(initial?.foto_urls || [])].filter(Boolean);
    const uploadedPhotos = [...(form.foto_urls || [])].slice(0, 3);

    for (let index = 0; index < photoFiles.length; index += 1) {
      const file = photoFiles[index];
      if (!file) continue;
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !["jpg", "jpeg", "png"].includes(extension)) {
        setError("Semua foto harus berformat JPG atau PNG.");
        setLoading(false);
        return;
      }
      const path = `umkm/${initial?.id || createUploadId()}-${index}-${createUploadId()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("umkm-images").upload(path, file, { contentType: file.type });
      if (uploadError) {
        setError("Foto gagal diunggah. Pastikan bucket umkm-images sudah dibuat.");
        setLoading(false);
        return;
      }
      uploadedPhotos[index] = supabase.storage.from("umkm-images").getPublicUrl(path).data.publicUrl;
    }

    const finalPhotoUrls = uploadedPhotos.filter(Boolean).slice(0, 3);

    const payload = {
      nama_usaha: form.nama_usaha,
      pemilik: form.pemilik,
      kategori: form.kategori,
      rw: form.rw,
      alamat: form.alamat,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      foto_urls: finalPhotoUrls,
      deskripsi: form.deskripsi || null,
      produk: form.produk || null,
      jumlah_pegawai: parseInt(form.jumlah_pegawai) || 1,
      is_unggulan: form.is_unggulan,
      maps_url: form.maps_url || null,
    };

    try {
      if (initial) {
        const { error: err } = await supabase.from("umkm").update(payload).eq("id", initial.id);
        if (err) throw err;

        const removedPhotos = previousPhotos.filter((url) => !finalPhotoUrls.includes(url));
        await Promise.all(removedPhotos.map((url) => removeStorageFile("umkm-images", url)));
        await onSaved();
      } else {
        const { error: err } = await supabase.from("umkm").insert([payload]);
        if (err) throw err;
        await onSaved();
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Data UMKM gagal disimpan.");
    } finally {
      setLoading(false);
    }
  };

  const KATEGORI = ["Kuliner","Fashion","Kerajinan","Jasa","Pertanian","Perdagangan","Lainnya"];
  const RW_LIST = Array.from({ length: 15 }, (_, i) => `RW ${String(i + 1).padStart(2, "0")}`);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-gray-900">
            {initial ? "Edit UMKM" : "Tambah UMKM Baru"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { label: "Nama Usaha *", key: "nama_usaha", type: "text", required: true },
            { label: "Pemilik *", key: "pemilik", type: "text", required: true },
            { label: "Alamat *", key: "alamat", type: "text", required: true },
            { label: "Produk/Jasa", key: "produk", type: "text", required: false },
            { label: "URL Google Maps", key: "maps_url", type: "url", required: false },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
              <input
                type={f.type}
                required={f.required}
                value={(form as unknown as Record<string,string | boolean>)[f.key] as string}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi usaha</label>
            <textarea
              value={form.deskripsi}
              onChange={(event) => setForm((current) => ({ ...current, deskripsi: event.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
              placeholder="Jelaskan tentang usaha, produk utama, dan keunggulan yang ditawarkan."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Foto UMKM (maksimal 3)</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  {form.foto_urls[index] && (
                    <div className="relative">
                      <img
                        src={form.foto_urls[index]}
                      alt={`Foto ${index + 1}`}
                      className="mb-2 h-24 w-full rounded-lg object-cover"
                      />
                      <button type="button" onClick={() => setForm((current) => ({ ...current, foto_urls: current.foto_urls.map((url, urlIndex) => urlIndex === index ? "" : url) }))} className="absolute right-1 top-1 rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold text-white shadow hover:bg-red-700">Hapus</button>
                    </div>
                  )}
                  <ImageCropper
                    label={`Foto ${index + 1}`}
                    onCropped={(file) => {
                      setPhotoFiles((files) => files.map((current, fileIndex) => fileIndex === index ? file : current));
                      if (!file) {
                        setForm((current) => ({
                          ...current,
                          foto_urls: current.foto_urls.map((url, urlIndex) => (urlIndex === index ? "" : url)),
                        }));
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-400">Konfirmasi tiap crop foto, lalu klik Simpan untuk meng-upload dan menyimpan semua perubahan.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori *</label>
              <select required value={form.kategori} onChange={(e) => set("kategori", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500">
                <option value="">Pilih</option>
                {KATEGORI.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">RW *</label>
              <select required value={form.rw} onChange={(e) => set("rw", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500">
                <option value="">Pilih</option>
                {RW_LIST.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
              <input type="number" step="any" value={form.lat} onChange={(e) => set("lat", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
              <input type="number" step="any" value={form.lng} onChange={(e) => set("lng", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pegawai *</label>
              <input type="number" min="1" required value={form.jumlah_pegawai} onChange={(e) => set("jumlah_pegawai", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_unggulan} onChange={(e) => set("is_unggulan", e.target.checked)} className="w-4 h-4 accent-green-700" />
            <span className="text-sm font-medium text-gray-700">Tandai sebagai UMKM Unggulan ⭐</span>
          </label>
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 disabled:opacity-60">
              {loading ? "Upload & menyimpan..." : "Simpan data & foto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProfilModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: ProfilLembaga;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    jabatan: initial?.jabatan || "",
    nama: initial?.nama || "",
    foto_url: initial?.foto_url || "",
    deskripsi: initial?.deskripsi || "",
    urutan: initial?.urutan?.toString() || "0",
  });
  const [file, setFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const previousPhoto = initial.foto_url;
    let fotoUrl = removePhoto ? null : previousPhoto || null;

    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("File foto harus berupa gambar JPG atau PNG.");
        setLoading(false);
        return;
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `profil/${initial.id}-${createUploadId()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("profil-lembaga")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: true,
        });
      if (uploadError) {
        setError(`Upload foto gagal ke bucket profil-lembaga: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      fotoUrl = supabase.storage.from("profil-lembaga").getPublicUrl(path).data.publicUrl;
      if (!fotoUrl) {
        setError("URL foto dari Storage tidak berhasil dibuat.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      jabatan: form.jabatan,
      nama: form.nama,
      foto_url: fotoUrl,
      deskripsi: form.deskripsi || null,
      urutan: parseInt(form.urutan) || 0,
    };
    const result = await supabase.from("profil_lembaga").update(payload).eq("id", initial.id);

    if (result.error) setError(`Data profil gagal disimpan: ${result.error.message}`);
    else {
      if (previousPhoto && previousPhoto !== fotoUrl) await removeStorageFile("profil-lembaga", previousPhoto);
      await onSaved(); onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-gray-900">{initial ? "Edit Profil" : "Tambah Profil"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Tutup">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Jabatan *</label>
            <input required value={form.jabatan} onChange={(event) => setForm({ ...form, jabatan: event.target.value })} placeholder="Lurah Bantarjati" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama *</label>
            <input required value={form.nama} onChange={(event) => setForm({ ...form, nama: event.target.value })} placeholder="Nama lengkap" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Upload foto</label>
            {initial.foto_url && !removePhoto && (
              <div className="relative mb-3">
                <img src={initial.foto_url} alt={`Foto ${initial.nama}`} className="h-36 w-full rounded-xl object-cover" />
                <button type="button" onClick={() => setRemovePhoto(true)} className="absolute right-2 top-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-red-700">Hapus foto</button>
              </div>
            )}
            <ImageCropper label="Pilih dan crop foto profil baru" onCropped={setFile} accept="image/jpeg,image/png" />
            <p className="mt-1 text-xs text-gray-400">Foto masuk ke bucket profil-lembaga, lalu URL-nya otomatis disimpan ke tabel profil_lembaga.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
            <textarea value={form.deskripsi} onChange={(event) => setForm({ ...form, deskripsi: event.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Urutan</label>
            <input type="number" value={form.urutan} onChange={(event) => setForm({ ...form, urutan: event.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          </div>
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">{loading ? "Mengunggah..." : "Simpan profil"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PengajuanCard({
  item,
  onDelete,
  onApprove,
  onReject,
  busy,
}: {
  item: PengajuanUMKM;
  onDelete: (id: string) => void;
  onApprove: (item: PengajuanUMKM) => void;
  onReject: (id: string) => void;
  busy: boolean;
}) {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, select")) {
      startX.current = null;
      return;
    }

    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const distance = event.clientX - startX.current;
    if (distance < -70) setOffset(-92);
    if (distance > 70) setOffset(0);
    startX.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-red-600">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDelete(item.id);
        }}
        className="absolute inset-y-0 right-0 z-20 flex w-24 cursor-pointer touch-manipulation flex-col items-center justify-center gap-1 text-xs font-bold text-white transition-transform active:scale-[0.98]"
        aria-label={`Hapus pengajuan ${item.nama_usaha}`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16m-9-3h2a1 1 0 011 1v2H8V5a1 1 0 011-1z" />
        </svg>
        Hapus
      </button>
      <div
        className="relative bg-white p-5 transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setOffset(0)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </span>
              <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <h3 className="font-bold text-gray-900">{item.nama_usaha}</h3>
            <div className="text-sm text-gray-500 mt-0.5">{item.pemilik} · {item.no_hp} · {item.rw} · {item.kategori}</div>
            <div className="text-sm text-gray-400 mt-1">{item.alamat}</div>
            {item.produk && <div className="text-xs text-gray-400 mt-1">Produk: {item.produk}</div>}
            {item.deskripsi && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{item.deskripsi}</div>}
            <div className="text-xs text-gray-400 mt-1">{item.jumlah_pegawai} pegawai</div>
          </div>
          {item.foto_urls?.[0] && <img src={item.foto_urls[0]} alt={item.nama_usaha} className="w-16 h-16 rounded-xl object-cover shrink-0" />}
        </div>
        {item.status === "pending" && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onApprove(item);
              }}
              disabled={busy}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 disabled:opacity-60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {busy ? "Memproses..." : "Setujui & Tambahkan"}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onReject(item.id);
              }}
              disabled={busy}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 disabled:opacity-60 transition-colors"
            >
              Tolak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [pengajuan, setPengajuan] = useState<PengajuanUMKM[]>([]);
  const [umkmList, setUmkmList] = useState<UMKM[]>([]);
  const [profiles, setProfiles] = useState<ProfilLembaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: UMKM | null }>({ open: false });
  const [profileModal, setProfileModal] = useState<{ open: boolean; item?: ProfilLembaga }>({ open: false });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dataError, setDataError] = useState("");
  const { logout } = useAuth();
  const { refresh: refreshPublicUMKM } = useUMKM();

  const fetchAll = async () => {
    setLoading(true);
    setDataError("");

    try {
      const [{ data: p, error: pError }, { data: u, error: uError }, { data: l, error: lError }] = await Promise.all([
        supabase.from("pengajuan_umkm").select("*").order("created_at", { ascending: false }),
        supabase.from("umkm").select("*").order("created_at", { ascending: false }),
        supabase.from("profil_lembaga").select("*").order("urutan"),
      ]);

      if (p) setPengajuan(p);
      if (u) setUmkmList(u);
      if (l) setProfiles(l as ProfilLembaga[]);

      if (pError || uError || lError) {
        setDataError(pError?.message || uError?.message || lError?.message || "Data gagal dimuat.");
      }
    } catch (error) {
      console.error("Admin panel fetch failed:", error);
      setDataError("Panel admin gagal dimuat karena masalah koneksi atau konfigurasi data.");
      setPengajuan([]);
      setUmkmList([]);
      setProfiles([]);
    } finally {
      try {
        await refreshPublicUMKM();
      } catch (refreshError) {
        console.error("Refresh public UMKM failed:", refreshError);
      }
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

  const approvePengajuan = async (p: PengajuanUMKM) => {
    setActionLoading(p.id);
    try {
      const umkmPayload = {
        nama_usaha: p.nama_usaha,
        pemilik: p.pemilik,
        kategori: p.kategori,
        rw: p.rw,
        alamat: p.alamat,
        lat: p.lat,
        lng: p.lng,
        foto_urls: p.foto_urls || [],
        deskripsi: p.deskripsi,
        produk: p.produk,
        jumlah_pegawai: p.jumlah_pegawai,
        is_unggulan: false,
        maps_url: p.lat && p.lng ? `https://maps.google.com/?q=${p.lat},${p.lng}` : null,
      };

      const { error: insertError } = await supabase.from("umkm").insert([umkmPayload]);
      if (insertError) {
        throw insertError;
      }

      const { error: updateError } = await supabase.from("pengajuan_umkm").update({ status: "approved" }).eq("id", p.id);
      if (updateError) {
        throw updateError;
      }

      setPengajuan((current) => current.filter((item) => item.id !== p.id));
      await fetchAll();
    } catch (error) {
      console.error("Approve pengajuan failed:", error);
      setDataError("Gagal menyetujui pengajuan. Cek koneksi atau data yang dikirim.");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectPengajuan = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase.from("pengajuan_umkm").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;

      setPengajuan((current) =>
        current.map((item) => (item.id === id ? { ...item, status: "rejected" } : item))
      );
      await fetchAll();
    } catch (error) {
      console.error("Reject pengajuan failed:", error);
      setDataError("Gagal menolak pengajuan. Silakan coba lagi.");
    } finally {
      setActionLoading(null);
    }
  };

  const deletePengajuan = async (id: string) => {
    if (!confirm("Hapus pengajuan ini secara permanen?")) return;
    setActionLoading(id);
    try {
      const { error } = await supabase.from("pengajuan_umkm").delete().eq("id", id);
      if (error) throw error;

      setPengajuan((current) => current.filter((item) => item.id !== id));
      await fetchAll();
    } catch (error) {
      console.error("Delete pengajuan failed:", error);
      setDataError(`Pengajuan gagal dihapus. Silakan coba lagi.`);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUMKM = async (id: string) => {
    if (!confirm("Yakin ingin menghapus UMKM ini?")) return;
    const { error } = await supabase.from("umkm").delete().eq("id", id);
    if (error) {
      setDataError(`UMKM gagal dihapus. Silakan coba lagi.`);
      return;
    }
    await fetchAll();
  };

  const toggleUnggulan = async (u: UMKM) => {
    const { error } = await supabase.from("umkm").update({ is_unggulan: !u.is_unggulan }).eq("id", u.id);
    if (error) {
      setDataError("Status unggulan gagal diubah.");
      return;
    }
    await fetchAll();
  };

  const pending = pengajuan.filter((p) => p.status === "pending").length;
  const filteredPengajuan =
    filterStatus === "all"
      ? pengajuan.filter((p) => p.status === "pending")
      : pengajuan.filter((p) => p.status === filterStatus);

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "pengajuan", label: "Pengajuan", badge: pending },
    { key: "umkm", label: "Data UMKM" },
    { key: "profil", label: "Pimpinan & Lembaga" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Admin bar */}
      <div className="bg-[#f7f1eb] border-b border-[#eaded2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#5a3825]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-semibold">Mode Admin</span>
            <span className="text-[#8b5e3c]">— Panel Pengelola UMKM Bantarjati</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg border border-[#d9c2ae] bg-white px-3 py-1.5 text-xs font-bold text-[#70452d] shadow-sm hover:bg-[#eaded2]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar akun
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t.key
                    ? "text-green-700 border-green-700"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {t.label}
                {t.badge ? (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a87552]">Kelola direktori</p>
              <h1 className="mt-1 font-display text-3xl font-bold text-gray-900">Panel Admin</h1>
              <p className="mt-1 text-sm text-gray-500">Pantau pengajuan warga dan data UMKM yang sudah tampil publik.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/" className="flex items-center gap-2 rounded-xl bg-[#5a3825] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#452a1d]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6z" /><circle cx="12" cy="12" r="2.5" /></svg>
                Lihat tampilan publik
              </Link>
              <button onClick={fetchAll} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#d9c2ae] bg-white px-3 py-2 text-sm font-semibold text-[#5a3825] shadow-sm hover:bg-[#f7f1eb] disabled:opacity-60" title="Muat ulang data">
                <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M5.5 15A7 7 0 0019 9M18.5 9A7 7 0 005 15" /></svg>
                Muat ulang
              </button>
            </div>
          </div>
          {dataError && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Data belum bisa dimuat. Pastikan tabel Supabase sudah dibuat dari <strong>schema.sql</strong>.</div>}

          {/* Dashboard */}
          {tab === "dashboard" && (
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total UMKM Publik", value: umkmList.length, icon: "🏪", color: "green" },
                  { label: "UMKM Unggulan", value: umkmList.filter(u => u.is_unggulan).length, icon: "⭐", color: "amber" },
                  { label: "Pengajuan Masuk", value: pengajuan.length, icon: "📩", color: "blue" },
                  { label: "Menunggu Review", value: pending, icon: "⏳", color: "orange" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-2xl font-bold text-gray-900">{loading ? "—" : s.value}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {pending > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <div className="font-bold text-gray-900">Ada {pending} pengajuan menunggu review</div>
                      <div className="text-sm text-gray-500">Tinjau dan setujui atau tolak pengajuan baru.</div>
                    </div>
                  </div>
                  <button onClick={() => setTab("pengajuan")} className="text-sm font-semibold text-green-700 hover:text-green-600">
                    Tinjau Sekarang →
                  </button>
                </div>
              )}

              <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3">UMKM Terbaru</h3>
                <div className="space-y-2">
                  {umkmList.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-sm">{u.is_unggulan ? "⭐" : "🏪"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{u.nama_usaha}</div>
                        <div className="text-xs text-gray-500">{u.rw} · {u.kategori}</div>
                      </div>
                      <div className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString("id-ID")}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pengajuan */}
          {tab === "pengajuan" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900">Pengajuan UMKM</h2>
                  <p className="mt-1 text-sm text-gray-500">Geser kartu ke kiri untuk menghapus pengajuan yang tidak diperlukan.</p>
                </div>
                <div className="flex gap-2">
                  {["all", "pending", "approved", "rejected"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === s ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {s === "all" ? "Semua" : STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
                </div>
              ) : filteredPengajuan.length === 0 ? (
                <div className="text-center py-16 text-gray-400">Tidak ada pengajuan.</div>
              ) : (
                <div className="space-y-3">
                  {filteredPengajuan.map((p) => (
                    <PengajuanCard
                      key={p.id}
                      item={p}
                      onDelete={deletePengajuan}
                      onApprove={approvePengajuan}
                      onReject={rejectPengajuan}
                      busy={actionLoading === p.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pimpinan dan lembaga */}
          {tab === "profil" && (
            <div>
              <div className="mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900">Pimpinan & Lembaga</h2>
                  <p className="mt-1 text-sm text-gray-500">Ubah data dan foto profil yang tampil di halaman Tentang.</p>
                </div>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[1, 2, 3].map((item) => <div key={item} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />)}
                </div>
              ) : profiles.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-10 text-center text-sm text-gray-500">Belum ada profil lembaga.</div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {profiles.map((profile) => (
                    <article key={profile.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <div className="h-48 bg-green-50">
                        {profile.foto_url ? <img src={profile.foto_url} alt={profile.nama} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl">👤</div>}
                      </div>
                      <div className="p-4 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-green-700 break-words">{profile.jabatan}</p>
                        <h3 className="mt-1 break-words text-base font-bold text-gray-900 sm:text-lg">{profile.nama}</h3>
                        {profile.deskripsi && <p className="mt-2 break-words text-sm leading-6 text-gray-500 line-clamp-3">{profile.deskripsi}</p>}
                        <button onClick={() => setProfileModal({ open: true, item: profile })} className="mt-4 w-full rounded-xl border border-green-200 py-2 text-sm font-bold text-green-700 transition-colors hover:bg-green-50">Edit profil</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* UMKM */}
          {tab === "umkm" && (
            <div>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-gray-900">Data UMKM Publik</h2>
                <p className="mt-1 text-sm text-gray-500">Data ini berasal dari pengajuan warga yang sudah disetujui.</p>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
                </div>
              ) : umkmList.length === 0 ? (
                <div className="text-center py-16 text-gray-400">Belum ada data UMKM.</div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-green-700 text-white">
                          {["Nama Usaha", "Pemilik", "Kategori", "RW", "Pegawai", "Unggulan", "Aksi"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {umkmList.map((u, i) => (
                          <tr key={u.id} className={i % 2 === 0 ? "bg-white" : "bg-green-50/20"}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {u.foto_urls?.[0] ? (
                                  <img src={u.foto_urls[0]} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm shrink-0">🏪</div>
                                )}
                                <span className="font-medium text-gray-900 text-sm whitespace-nowrap">{u.nama_usaha}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{u.pemilik}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{u.kategori}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{u.rw}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-center">{u.jumlah_pegawai}</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => toggleUnggulan(u)} className="text-xl" title="Toggle Unggulan">
                                {u.is_unggulan ? "⭐" : "☆"}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setModal({ open: true, item: u })}
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteUMKM(u.id)}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                  title="Hapus"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {modal.open && (
        <UMKMModal
          initial={modal.item}
          onClose={() => setModal({ open: false })}
          onSaved={fetchAll}
        />
      )}

      {profileModal.open && profileModal.item && (
        <ProfilModal
          initial={profileModal.item}
          onClose={() => setProfileModal({ open: false })}
          onSaved={fetchAll}
        />
      )}

      <Footer />
    </div>
  );
}
