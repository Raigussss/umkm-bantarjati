import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useUMKM } from "../lib/umkm";
import type { RWStats } from "../lib/types";

export default function Statistics() {
  const { umkmList, loading } = useUMKM();

  // Group by RW
  const rwStats: RWStats[] = Object.values(
    umkmList.reduce<Record<string, RWStats>>((acc, u) => {
      if (!acc[u.rw]) {
        acc[u.rw] = {
          rw: u.rw,
          total: 0,
          total_pegawai: 0,
          maps_url: u.maps_url,
        };
      }
      acc[u.rw].total += 1;
      acc[u.rw].total_pegawai += u.jumlah_pegawai;
      return acc;
    }, {})
  ).sort((a, b) => a.rw.localeCompare(b.rw, "id", { numeric: true }));

  const totalUMKM = umkmList.length;
  const totalUnggulan = umkmList.filter((u) => u.is_unggulan).length;
  const totalNonUnggulan = totalUMKM - totalUnggulan;
  const totalPegawai = umkmList.reduce((s, u) => s + u.jumlah_pegawai, 0);

  const unggulanList = umkmList.filter((u) => u.is_unggulan);
  const nonUnggulanList = umkmList.filter((u) => !u.is_unggulan);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header */}
      <section className="bg-green-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Statistik UMKM
          </h1>
          <p className="text-green-200">
            Data dan statistik usaha mikro, kecil, dan menengah Bantarjati
          </p>
        </div>
      </section>

      {/* Summary cards */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total UMKM",
                value: totalUMKM,
                color: "green",
                icon: "🏪",
              },
              {
                label: "UMKM Unggulan",
                value: totalUnggulan,
                color: "amber",
                icon: "⭐",
              },
              {
                label: "UMKM Non-Unggulan",
                value: totalNonUnggulan,
                color: "blue",
                icon: "📋",
              },
              {
                label: "Total Pegawai",
                value: totalPegawai,
                color: "purple",
                icon: "👥",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? "—" : s.value}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unggulan vs Non-Unggulan visual */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">
            UMKM Unggulan & Non-Unggulan
          </h2>

          {/* Bar chart visual */}
          {!loading && totalUMKM > 0 && (
            <div className="mb-10 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  Unggulan ({totalUnggulan})
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-3 h-3 rounded-full bg-green-600" />
                  Non-Unggulan ({totalNonUnggulan})
                </div>
              </div>
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div
                  className="bg-amber-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                  style={{
                    width: `${(totalUnggulan / totalUMKM) * 100}%`,
                  }}
                >
                  {Math.round((totalUnggulan / totalUMKM) * 100)}%
                </div>
                <div
                  className="bg-green-600 flex items-center justify-center text-white text-xs font-bold transition-all"
                  style={{
                    width: `${(totalNonUnggulan / totalUMKM) * 100}%`,
                  }}
                >
                  {Math.round((totalNonUnggulan / totalUMKM) * 100)}%
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Unggulan */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-amber-500 text-xl">⭐</span>
                <h3 className="font-bold text-gray-900 text-lg">
                  UMKM Unggulan ({totalUnggulan})
                </h3>
              </div>
              <div className="space-y-2">
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded-xl" />
                    ))}
                  </div>
                ) : unggulanList.length > 0 ? (
                  unggulanList.map((u) => (
                    <Link
                      key={u.id}
                      to={`/umkm/${u.id}`}
                      className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3"
                    >
                      {u.foto_urls?.[0] ? (
                        <img
                          src={u.foto_urls[0]}
                          alt={u.nama_usaha}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center text-lg shrink-0">
                          🏪
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {u.nama_usaha}
                        </div>
                        <div className="text-xs text-gray-500">
                          {u.rw} · {u.kategori} · {u.jumlah_pegawai} pegawai
                        </div>
                      </div>
                      <span className="ml-auto text-xs font-bold text-green-700">Detail →</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Belum ada data.</p>
                )}
              </div>
            </div>

            {/* Non-Unggulan */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-green-600 text-xl">📋</span>
                <h3 className="font-bold text-gray-900 text-lg">
                  UMKM Non-Unggulan ({totalNonUnggulan})
                </h3>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded-xl" />
                    ))}
                  </div>
                ) : nonUnggulanList.length > 0 ? (
                  nonUnggulanList.map((u) => (
                    <Link
                      key={u.id}
                      to={`/umkm/${u.id}`}
                      className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3"
                    >
                      {u.foto_urls?.[0] ? (
                        <img
                          src={u.foto_urls[0]}
                          alt={u.nama_usaha}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-lg shrink-0">
                          🏪
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {u.nama_usaha}
                        </div>
                        <div className="text-xs text-gray-500">
                          {u.rw} · {u.kategori} · {u.jumlah_pegawai} pegawai
                        </div>
                      </div>
                      <span className="ml-auto text-xs font-bold text-green-700">Detail →</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Belum ada data.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Per-RW Table */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
            Data per RW
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="px-5 py-3.5 text-left text-sm font-semibold">
                      RW
                    </th>
                    <th className="px-5 py-3.5 text-center text-sm font-semibold">
                      Total UMKM
                    </th>
                    <th className="px-5 py-3.5 text-center text-sm font-semibold">
                      Total Pegawai
                    </th>
                    <th className="px-5 py-3.5 text-center text-sm font-semibold">
                      Lokasi Maps
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(4)].map((_, j) => (
                          <td key={j} className="px-5 py-3">
                            <div className="animate-pulse h-4 bg-gray-100 rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : rwStats.length > 0 ? (
                    rwStats.map((rw, i) => (
                      <tr
                        key={rw.rw}
                        className={
                          i % 2 === 0 ? "bg-white" : "bg-green-50/30"
                        }
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-gray-900">
                            {rw.rw}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                            {rw.total}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-700 font-medium">
                          {rw.total_pegawai}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {rw.maps_url ? (
                            <a
                              href={rw.maps_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-600 hover:underline"
                            >
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
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Lihat Maps
                            </a>
                          ) : (
                            <span className="text-gray-300 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-gray-400"
                      >
                        Belum ada data UMKM.
                      </td>
                    </tr>
                  )}
                </tbody>
                {!loading && rwStats.length > 0 && (
                  <tfoot>
                    <tr className="bg-green-50 border-t-2 border-green-100">
                      <td className="px-5 py-3.5 font-bold text-gray-900">
                        Total
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-green-700">
                        {totalUMKM}
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-gray-700">
                        {totalPegawai}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Foto Statistik */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
            Foto UMKM Bantarjati
          </h2>
          {!loading && umkmList.some((u) => u.foto_urls?.length) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {umkmList
                .filter((u) => u.foto_urls?.length)
                .map((u) => (
                  <div
                    key={u.id}
                    className="group relative rounded-xl overflow-hidden aspect-square bg-gray-100"
                  >
                    <img
                      src={u.foto_urls![0]}
                      alt={u.nama_usaha}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-white text-xs font-semibold truncate">
                        {u.nama_usaha}
                      </p>
                    </div>
                    {u.is_unggulan && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs">⭐</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {!loading && !umkmList.some((u) => u.foto_urls?.length) && (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              Belum ada foto UMKM yang tersedia untuk ditampilkan.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
