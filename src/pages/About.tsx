import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabase";
import type { ProfilLembaga } from "../lib/types";

const milestones = [
  {
    year: "2020",
    title: "Pembentukan Program",
    desc: "Program UMKM Bantarjati resmi diluncurkan untuk mendukung ekonomi warga lokal.",
  },
  {
    year: "2022",
    title: "Digitalisasi Data",
    desc: "Pendataan UMKM mulai dilakukan secara digital untuk memudahkan akses informasi.",
  },
  {
    year: "2023",
    title: "Platform Online",
    desc: "Peluncuran platform web sebagai direktori UMKM yang bisa diakses publik.",
  },
  {
    year: "2024",
    title: "Pengembangan Ekosistem",
    desc: "Perluasan program dengan pelatihan digital marketing dan penguatan branding UMKM.",
  },
];

const values = [
  {
    icon: "🤝",
    title: "Kolaborasi",
    desc: "Mendorong sinergi antara pelaku UMKM, pemerintah kelurahan, dan warga.",
  },
  {
    icon: "📈",
    title: "Pertumbuhan",
    desc: "Memfasilitasi pertumbuhan usaha melalui akses informasi dan promosi digital.",
  },
  {
    icon: "🌍",
    title: "Keberlanjutan",
    desc: "Mendukung ekonomi lokal yang berkelanjutan dan berdampak positif bagi komunitas.",
  },
  {
    icon: "💡",
    title: "Inovasi",
    desc: "Mendorong inovasi produk dan layanan yang relevan dengan kebutuhan pasar.",
  },
];

export default function About() {
  const [profiles, setProfiles] = useState<ProfilLembaga[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<ProfilLembaga | null>(null);

  useEffect(() => {
    supabase
      .from("profil_lembaga")
      .select("*")
      .order("urutan")
      .then(({ data, error }) => {
        if (data) setProfiles(data as ProfilLembaga[]);
        if (error) console.error("Gagal memuat profil lembaga:", error.message);
        setProfilesLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-green-700 text-white py-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=400&fit=crop&auto=format)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-green-300 font-medium text-sm mb-3 tracking-wide uppercase">
              Tentang Kami
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-5">
              Program UMKM Bantarjati
            </h1>
            <p className="text-green-100 text-lg leading-relaxed">
              Inisiatif Kelurahan Bantarjati untuk memperkuat ekonomi lokal
              melalui pemberdayaan usaha mikro, kecil, dan menengah.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-5">
                Tentang Bantarjati
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kelurahan Bantarjati merupakan salah satu kelurahan di Kecamatan
                Bogor Utara, Kota Bogor, Jawa Barat. Wilayah ini memiliki potensi
                ekonomi yang besar dengan beragam usaha mikro dan kecil yang
                dijalankan oleh warganya.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Platform UMKM Bantarjati hadir sebagai jembatan antara pelaku usaha
                dengan konsumen, mempermudah masyarakat menemukan produk dan jasa
                lokal berkualitas, serta membantu UMKM dalam proses digitalisasi
                usahanya.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Dengan pendataan yang terstruktur per RW, program ini memastikan
                seluruh wilayah Bantarjati terwakili dan mendapatkan perhatian yang
                setara dalam pengembangan ekonomi lokal.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=500&fit=crop&auto=format"
                alt="Warga dan UMKM Bantarjati"
                className="rounded-2xl w-full shadow-xl"
              />
              <div className="absolute -bottom-4 -left-4 bg-green-700 text-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold">10+</div>
                <div className="text-sm text-green-200">RW Aktif</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
              Nilai dan Tujuan
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Prinsip yang melandasi setiap langkah kami dalam mendukung UMKM
              Bantarjati
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership and institutions */}
      <section className="py-16 bg-[#f7f1eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-wide text-green-700">Pengelola wilayah</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 mt-1">Pimpinan dan Lembaga</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Kenali pihak yang mendukung pelayanan dan pengembangan UMKM Bantarjati.</p>
          </div>
          {profilesLoading ? (
            <div className="mx-auto max-w-2xl space-y-8">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-96 rounded-2xl bg-white animate-pulse border border-[#eaded2]" />)}
            </div>
          ) : profiles.length > 0 ? (
            <div className="relative mx-auto max-w-2xl">
              <div className="absolute bottom-12 left-6 top-12 w-0.5 bg-[#c29d80] sm:left-1/2 sm:-translate-x-1/2" />
              <div className="space-y-8">
                {profiles.map((profile, index) => (
                  <div key={profile.id} className="relative flex items-center gap-4 sm:gap-8">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[#f7f1eb] bg-green-700 text-sm font-bold text-white shadow-md sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                      {index + 1}
                    </div>
                    <article className={`w-full overflow-hidden rounded-2xl border border-[#eaded2] bg-white shadow-sm transition-shadow hover:shadow-lg sm:w-[calc(50%-2.5rem)] ${index % 2 === 0 ? "sm:mr-auto" : "sm:ml-auto"}`}>
                      <div className="h-56 bg-green-50">
                        {profile.foto_url ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(profile)}
                            className="group relative block h-full w-full cursor-zoom-in text-left"
                            aria-label={`Perbesar foto ${profile.nama}`}
                          >
                            <img src={profile.foto_url} alt={profile.nama} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-5 pb-4 pt-12 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">Klik untuk melihat foto</span>
                          </button>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-7xl">👤</div>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-green-700">{profile.jabatan}</p>
                        <h3 className="mt-1 text-lg font-bold text-gray-900">{profile.nama}</h3>
                        {profile.deskripsi && <p className="mt-2 text-sm leading-relaxed text-gray-500">{profile.deskripsi}</p>}
                      </div>
                    </article>
                    {index < profiles.length - 1 && <span className="absolute -bottom-5 left-4 z-10 text-xl font-bold text-[#a87552] sm:left-1/2 sm:-translate-x-1/2">↓</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {selectedPhoto?.foto_url && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${selectedPhoto.nama}`}
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <img src={selectedPhoto.foto_url} alt={selectedPhoto.nama} className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl" />
            <p className="mt-3 text-center text-sm font-semibold text-white">{selectedPhoto.jabatan} · {selectedPhoto.nama}</p>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-bold text-gray-700 shadow-lg hover:bg-gray-100"
              aria-label="Tutup foto"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
              Perjalanan Kami
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-100" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-xs z-10">
                    {m.year}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-5 flex-1 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-1">{m.title}</h3>
                    <p className="text-sm text-gray-500">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team/Contact */}
      <section className="py-16 bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Ada Pertanyaan?
          </h2>
          <p className="text-green-200 mb-6 max-w-xl mx-auto">
            Hubungi kantor Kelurahan Bantarjati untuk informasi lebih lanjut
            tentang program UMKM atau proses pendaftaran.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <div className="inline-flex items-center gap-3 bg-white text-green-700 font-semibold px-6 py-3 rounded-xl shadow-md">
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Kantor Kelurahan Bantarjati
            </div>
            <a
              href="https://wa.me/6281385339753"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/50 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              WhatsApp: 0813-8533-9753
            </a>
          </div>
          <p className="mt-5 text-sm text-green-100/90">
            Informasi kontak lengkap juga tersedia di bagian paling bawah halaman ini.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
