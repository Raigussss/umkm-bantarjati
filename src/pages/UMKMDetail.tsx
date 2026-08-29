import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

export default function UMKMDetail() {
  const { id } = useParams<{ id: string }>();
  const { umkmList, loading } = useUMKM();
  const umkm = umkmList.find((item) => item.id === id) || null;
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    document.title = umkm ? `${umkm.nama_usaha} | UMKM Bantarjati` : "Detail UMKM | UMKM Bantarjati";
    return () => {
      document.title = "UMKM Bantarjati";
    };
  }, [umkm]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f1eb]">
      <Navbar />
      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/statistik"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-600"
          >
            <span aria-hidden="true">←</span> Kembali ke statistik
          </Link>

          {loading ? (
            <div className="mt-6 animate-pulse rounded-2xl bg-white h-[420px] border border-[#eaded2]" />
          ) : !umkm ? (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
              Data UMKM tidak ditemukan atau belum tersedia.
            </div>
          ) : (
            <article className="mt-6 overflow-hidden rounded-2xl border border-[#eaded2] bg-white shadow-sm">
              <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <div className="min-h-72 bg-green-50 md:min-h-[430px]">
                  {(umkm.foto_urls || []).length > 0 ? (
                    <div className="relative h-full min-h-72 md:min-h-[430px]">
                      <img
                        src={(umkm.foto_urls || [])[selectedPhoto % (umkm.foto_urls || []).length]}
                        alt={`${umkm.nama_usaha} foto ${selectedPhoto + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {(umkm.foto_urls || []).length > 1 && (
                        <>
                          <button type="button" onClick={() => setSelectedPhoto((photo) => Math.max(0, photo - 1))} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-xl text-white hover:bg-black/65" aria-label="Foto sebelumnya">‹</button>
                          <button type="button" onClick={() => setSelectedPhoto((photo) => (photo + 1) % (umkm.foto_urls || []).length)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-xl text-white hover:bg-black/65" aria-label="Foto berikutnya">›</button>
                          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5">
                            {(umkm.foto_urls || []).map((_, index) => <button key={index} type="button" onClick={() => setSelectedPhoto(index)} className={`h-2 w-2 rounded-full ${index === selectedPhoto ? "bg-white" : "bg-white/45"}`} aria-label={`Buka foto ${index + 1}`} />)}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-72 items-center justify-center text-8xl">
                      {KATEGORI_ICONS[umkm.kategori] || "🏪"}
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                      {umkm.kategori}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {umkm.rw}
                    </span>
                    {umkm.is_unggulan && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                        ⭐ Unggulan
                      </span>
                    )}
                  </div>
                  <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-gray-900">
                    {umkm.nama_usaha}
                  </h1>
                  <p className="mt-2 text-gray-500">Milik {umkm.pemilik}</p>

                  <dl className="mt-8 divide-y divide-gray-100 border-y border-gray-100">
                    {umkm.deskripsi && (
                      <div className="py-4">
                        <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">Deskripsi usaha</dt>
                        <dd className="mt-1 text-sm leading-relaxed text-gray-700 whitespace-pre-line">{umkm.deskripsi}</dd>
                      </div>
                    )}
                    <div className="py-4">
                      <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">Produk / layanan</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-gray-700">{umkm.produk || "Belum ada informasi produk."}</dd>
                    </div>
                    <div className="py-4">
                      <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">Alamat usaha</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-gray-700">{umkm.alamat}</dd>
                    </div>
                    <div className="py-4">
                      <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">Jumlah pegawai</dt>
                      <dd className="mt-1 text-sm text-gray-700">{umkm.jumlah_pegawai} orang</dd>
                    </div>
                  </dl>

                  {umkm.maps_url && (
                    <a
                      href={umkm.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-green-800"
                    >
                      <span aria-hidden="true">📍</span> Buka lokasi di Google Maps
                    </a>
                  )}
                </div>
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
