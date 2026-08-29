import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useUMKM } from "../lib/umkm";

const KATEGORI_ICONS: Record<string, string> = {
  Kuliner: "🍽️",
  Fashion: "👗",
  Kerajinan: "🎨",
  Jasa: "🔧",
  Pertanian: "🌱",
  Perdagangan: "🛍️",
};

export default function Home() {
  const { umkmList, loading, error: databaseError } = useUMKM();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const unggulan = umkmList.filter((u) => u.is_unggulan).slice(0, 6);
  const stats = {
    total: umkmList.length,
    unggulan: umkmList.filter((u) => u.is_unggulan).length,
    rw: new Set(umkmList.map((u) => u.rw)).size,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-green-700 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&h=600&fit=crop&auto=format)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              Kelurahan Bantarjati, Kota Bogor
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Direktori UMKM
              <br />
              <span className="text-green-200">Bantarjati</span>
            </h1>
            <p className="text-lg text-green-100 mb-8 leading-relaxed">
              Temukan dan dukung usaha lokal dari warga Bantarjati. Dari kuliner
              lezat, kerajinan unik, hingga jasa berkualitas — semua ada di sini.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/daftar"
                className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg"
              >
                Daftarkan Usaha Anda
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                to="/peta"
                className="inline-flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-500 transition-colors"
              >
                Lihat Peta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-6 md:gap-12">
            {[
              { label: "Total UMKM", value: stats.total, suffix: "+" },
              { label: "UMKM Unggulan", value: stats.unggulan, suffix: "" },
              { label: "RW Terdaftar", value: stats.rw, suffix: " RW" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-700">
                  {loading ? "—" : s.value}
                  {s.suffix}
                </div>
                <div className="text-sm text-gray-500 mt-1 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration steps */}
      <section className="py-14 bg-[#f7f1eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-green-700">Cara mendaftar</p>
              <h2 className="font-display text-3xl font-bold text-gray-900 mt-1">Tiga langkah, usaha Anda tampil di direktori</h2>
            </div>
            <Link to="/daftar" className="text-sm font-semibold text-green-700 hover:text-green-600">Mulai pendaftaran →</Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#eaded2] bg-white">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-green-700 text-sm text-white">
                <tr>
                  <th className="w-20 px-5 py-4 font-bold">No.</th>
                  <th className="px-5 py-4 font-bold">Tahapan</th>
                  <th className="px-5 py-4 font-bold">Yang perlu dilakukan</th>
                  <th className="px-5 py-4 font-bold">Hasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaded2] text-sm">
            {["Isi formulir", "Tunggu verifikasi", "Dapat notifikasi WhatsApp"].map((title, index) => {
                const descriptions = [
                  "Lengkapi informasi usaha, pemilik, kontak, dan lokasi.",
                  "Admin akan memeriksa data Anda dalam 1-2 hari kerja.",
                  "Anda mendapat pesan WhatsApp setelah data UMKM masuk ke direktori.",
                ];
                const results = ["Formulir tersimpan", "Data sedang diperiksa", "Usaha tampil di website"];
                return (
                  <tr key={title}>
                    <td className="px-5 py-4 align-top text-xl">{["📝", "🔎", "💬"][index]}</td>
                    <td className="px-5 py-4 align-top font-bold text-gray-900">{index + 1}. {title}</td>
                    <td className="px-5 py-4 align-top text-gray-500">{descriptions[index]}</td>
                    <td className="px-5 py-4 align-top font-semibold text-green-700">{results[index]}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Kategori */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
              Kategori Usaha
            </h2>
            <p className="text-gray-500">
              Beragam jenis usaha dari warga Bantarjati
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Object.entries(KATEGORI_ICONS).map(([name, icon]) => {
              const count = umkmList.filter((u) => u.kategori === name).length;
              return (
                <button
                  type="button"
                  key={name}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === name ? null : name);
                    window.setTimeout(() => document.getElementById("kategori-hasil")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
                  }}
                  className="bg-white rounded-xl p-5 text-center border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group"
                >
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="font-semibold text-gray-800 text-sm">
                    {name}
                  </div>
                  {!loading && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {count} usaha
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {selectedCategory && (
            <div id="kategori-hasil" className="mt-10 rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-green-700">Kategori dipilih</p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-gray-900">UMKM {selectedCategory}</h3>
                </div>
                <span className="text-sm font-semibold text-gray-500">{umkmList.filter((u) => u.kategori === selectedCategory).length} usaha</span>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-green-700 text-white">
                    <tr>
                      <th className="rounded-l-lg px-4 py-3 font-semibold">Nama usaha</th>
                      <th className="px-4 py-3 font-semibold">Pemilik</th>
                      <th className="px-4 py-3 font-semibold">RW</th>
                      <th className="px-4 py-3 font-semibold">Produk</th>
                      <th className="rounded-r-lg px-4 py-3 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {umkmList.filter((u) => u.kategori === selectedCategory).map((u) => (
                      <tr key={u.id} className="hover:bg-green-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{u.nama_usaha}</td>
                        <td className="px-4 py-3 text-gray-600">{u.pemilik}</td>
                        <td className="px-4 py-3 text-gray-600">{u.rw}</td>
                        <td className="max-w-xs px-4 py-3 text-gray-500">{u.produk || "-"}</td>
                        <td className="px-4 py-3">
                          <Link to={`/umkm/${u.id}`} className="font-bold text-green-700 hover:underline">Detail →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {umkmList.filter((u) => u.kategori === selectedCategory).length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-400">Belum ada UMKM pada kategori ini.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* UMKM Unggulan */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm mb-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                UMKM Unggulan
              </div>
              <h2 className="font-display text-3xl font-bold text-gray-900">
                Usaha Terbaik Bantarjati
              </h2>
            </div>
            <Link
              to="/statistik"
              className="text-sm font-semibold text-green-700 hover:text-green-600 hidden sm:block"
            >
              Lihat semua →
            </Link>
          </div>

          {databaseError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
              Data UMKM belum bisa dimuat. Pastikan tabel <strong>umkm</strong> sudah dibuat di Supabase dan server sudah direstart setelah mengisi .env.
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl bg-gray-100 h-72"
                />
              ))}
            </div>
          ) : unggulan.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {unggulan.map((u) => (
                <div
                  key={u.id}
                  className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <div className="relative h-44 bg-green-50 overflow-hidden">
                    {u.foto_urls?.[0] ? (
                      <button type="button" onClick={() => setPreviewImage(u.foto_urls?.[0] || null)} className="block h-full w-full overflow-hidden">
                        <img
                          src={u.foto_urls[0]}
                          alt={u.nama_usaha}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </button>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {KATEGORI_ICONS[u.kategori] || "🏪"}
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        ⭐ Unggulan
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-white text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
                        {u.rw}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-medium text-green-600 mb-1">
                      {u.kategori}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">
                      {u.nama_usaha}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {u.pemilik} · {u.jumlah_pegawai} pegawai
                    </p>
                    {u.produk && (
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {u.produk}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Link
                        to={`/umkm/${u.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-600 hover:underline"
                      >
                        Lihat detail <span aria-hidden="true">→</span>
                      </Link>
                      {u.maps_url && (
                      <a
                        href={u.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Lihat Lokasi
                      </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              Belum ada data UMKM unggulan.
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Miliki usaha di Bantarjati?
          </h2>
          <p className="text-green-200 text-lg mb-8">
            Daftarkan usaha Anda sekarang dan bergabung dengan komunitas UMKM
            Bantarjati untuk menjangkau lebih banyak pelanggan.
          </p>
          <Link
            to="/daftar"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-colors shadow-xl text-lg"
          >
            Daftarkan Sekarang
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
