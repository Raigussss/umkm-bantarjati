import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabase";

const KATEGORI = [
  "Kuliner",
  "Fashion",
  "Kerajinan",
  "Jasa",
  "Pertanian",
  "Perdagangan",
  "Lainnya",
];

const RW_LIST = Array.from({ length: 15 }, (_, i) =>
  `RW ${String(i + 1).padStart(2, "0")}`
);

interface FormData {
  nama_usaha: string;
  pemilik: string;
  no_hp: string;
  kategori: string;
  rw: string;
  alamat: string;
  lat: string;
  lng: string;
  deskripsi: string;
  produk: string;
  jumlah_pegawai: string;
}

const INITIAL: FormData = {
  nama_usaha: "",
  pemilik: "",
  no_hp: "",
  kategori: "",
  rw: "",
  alamat: "",
  lat: "",
  lng: "",
  deskripsi: "",
  produk: "",
  jumlah_pegawai: "1",
};

const createUploadId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function Register() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null]);
  const verificationRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    setError("");

    const uploadedPhotos: string[] = [];
    for (const photoFile of photoFiles) {
      if (!photoFile) continue;
      const fileExtension = photoFile.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !["jpg", "jpeg", "png"].includes(fileExtension)) {
        setError("Format foto harus JPG atau PNG.");
        setLoading(false);
        return;
      }
      const filePath = `pengajuan/${createUploadId()}.${fileExtension}`;
      const { error: uploadError } = await supabase.storage.from("umkm-images").upload(filePath, photoFile, { contentType: photoFile.type });
      if (uploadError) {
        setError("Foto gagal diunggah. Pastikan bucket umkm-images sudah dibuat di Supabase.");
        setLoading(false);
        return;
      }
      uploadedPhotos.push(supabase.storage.from("umkm-images").getPublicUrl(filePath).data.publicUrl);
    }
    const fotoUrl = uploadedPhotos[0] || null;

    const payload = {
      nama_usaha: form.nama_usaha.trim(),
      pemilik: form.pemilik.trim(),
      no_hp: form.no_hp.trim(),
      kategori: form.kategori,
      rw: form.rw,
      alamat: form.alamat.trim(),
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      deskripsi: form.deskripsi.trim() || null,
      foto_urls: uploadedPhotos.slice(0, 3),
      produk: form.produk.trim() || null,
      jumlah_pegawai: parseInt(form.jumlah_pegawai) || 1,
      status: "pending",
    };

    const { error: err } = await supabase
      .from("pengajuan_umkm")
      .insert([payload]);

    if (err) {
      setError("Terjadi kesalahan saat mengirim pengajuan. Silakan coba lagi.");
    } else {
      setSuccess(true);
      setForm(INITIAL);
      setPhotoFiles([null, null, null]);
      setStep(1);
      setConfirmed(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 2) {
      requestAnimationFrame(() => {
        verificationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [step]);

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
              Pengajuan Terkirim!
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Pengajuan UMKM Anda telah berhasil dikirim dan akan segera ditinjau
              oleh admin Kelurahan Bantarjati. Proses verifikasi membutuhkan waktu
              1-3 hari kerja.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setStep(1);
                setConfirmed(false);
              }}
              className="bg-green-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-800 transition-colors"
            >
              Daftarkan Usaha Lain
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-green-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Daftarkan Usaha Anda
          </h1>
          <p className="text-green-200">
            Isi formulir di bawah untuk mendaftarkan UMKM Anda ke direktori
            Bantarjati
          </p>
          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            {["Isi formulir", "Verifikasi data", "Kirim pengajuan"].map((label, index) => {
              const number = index + 1;
              const active = step === number || (step === 2 && number === 1);
              return (
                <div key={label} className={`flex items-center gap-2 text-sm ${active ? "text-white" : "text-green-200/70"}`}>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-white text-green-700" : "border border-green-200/50"}`}>
                    {number}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <span className="text-green-700 text-lg">📝</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Formulir Pendaftaran UMKM</h2>
                <p className="text-sm text-gray-500">
                  Semua field bertanda * wajib diisi
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 2 && (
                <div ref={verificationRef} className="rounded-xl border border-green-100 bg-green-50 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">Verifikasi data Anda</h3>
                      <p className="text-sm text-gray-500">Pastikan informasi berikut sudah benar sebelum dikirim.</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700">Langkah 2</span>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="w-full text-left text-sm">
                      <tbody className="divide-y divide-gray-100">
                        {[
                          ["Nama usaha", form.nama_usaha],
                          ["Pemilik", form.pemilik],
                          ["No. HP", form.no_hp],
                          ["Kategori / RW", `${form.kategori} / ${form.rw}`],
                          ["Alamat", form.alamat],
                          ["Produk / jasa", form.produk || "-"],
                          ["Jumlah pegawai", form.jumlah_pegawai],
                        ].map(([label, value]) => (
                          <tr key={label}>
                            <th className="w-2/5 px-3 py-2.5 font-semibold text-gray-500">{label}</th>
                            <td className="px-3 py-2.5 text-gray-900">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-green-700"
                    />
                    <span>Saya sudah memeriksa dan menyetujui data yang saya isi.</span>
                  </label>
                </div>
              )}
              {step === 1 && (
                <>
              {/* Section 1: Identitas */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">
                  Informasi Usaha
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nama Usaha *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nama_usaha}
                      onChange={(e) => set("nama_usaha", e.target.value)}
                      placeholder="Contoh: Warung Nasi Bu Siti"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Nama Pemilik *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.pemilik}
                        onChange={(e) => set("pemilik", e.target.value)}
                        placeholder="Nama lengkap"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        No. HP *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.no_hp}
                        onChange={(e) => set("no_hp", e.target.value)}
                        placeholder="08xx-xxxx-xxxx"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Kategori *
                      </label>
                      <select
                        required
                        value={form.kategori}
                        onChange={(e) => set("kategori", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all bg-white"
                      >
                        <option value="">Pilih kategori</option>
                        {KATEGORI.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        RW *
                      </label>
                      <select
                        required
                        value={form.rw}
                        onChange={(e) => set("rw", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all bg-white"
                      >
                        <option value="">Pilih RW</option>
                        {RW_LIST.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Alamat Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.alamat}
                      onChange={(e) => set("alamat", e.target.value)}
                      placeholder="Jl. Contoh No. 1, Bantarjati"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Produk */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4 pt-2 border-t border-gray-100">
                  Detail Produk/Layanan
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Produk / Jasa
                    </label>
                    <input
                      type="text"
                      value={form.produk}
                      onChange={(e) => set("produk", e.target.value)}
                      placeholder="Contoh: Nasi Goreng, Mie Ayam, Es Teh"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Deskripsi Usaha
                    </label>
                    <textarea
                      rows={3}
                      value={form.deskripsi}
                      onChange={(e) => set("deskripsi", e.target.value)}
                      placeholder="Ceritakan tentang usaha Anda..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Jumlah Pegawai *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.jumlah_pegawai}
                      onChange={(e) => set("jumlah_pegawai", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Upload Foto (JPG/PNG, opsional)
                    </label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[0, 1, 2].map((index) => (
                        <input
                          key={index}
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={(e) => setPhotoFiles((files) => files.map((file, fileIndex) => fileIndex === index ? e.target.files?.[0] || null : file))}
                          className="w-full rounded-xl border border-gray-200 px-2 py-2 text-xs text-gray-600"
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Foto disimpan di Storage bucket umkm-images. Tidak wajib diisi.</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Lokasi */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4 pt-2 border-t border-gray-100">
                  Koordinat Lokasi (opsional)
                </h3>
                <div className="bg-blue-50 rounded-xl p-3 mb-4 text-xs text-blue-700">
                  💡 Dapatkan koordinat dari Google Maps: klik lokasi usaha Anda,
                  lalu salin angka latitude dan longitude yang muncul.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.lat}
                      onChange={(e) => set("lat", e.target.value)}
                      placeholder="-6.5921"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.lng}
                      onChange={(e) => set("lng", e.target.value)}
                      placeholder="106.7981"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    />
                  </div>
                </div>
              </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-xl p-4 border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setConfirmed(false);
                    }}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Kembali Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || (step === 2 && !confirmed)}
                  className="flex-1 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2"
                >
                  {loading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Mengirim...
                  </>
                  ) : (
                    step === 1 ? "Lanjut Verifikasi" : "Kirim Pengajuan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
