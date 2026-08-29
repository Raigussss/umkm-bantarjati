import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <img
                src="/logo-bantarjati.png"
                alt="Logo UMKM Bantarjati"
                className="h-24 w-24 object-contain sm:h-28 sm:w-28"
              />
              <div>
                <div className="font-bold text-white text-lg">UMKM Bantarjati</div>
                <div className="text-xs text-gray-400">Kota Bogor</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Platform digital untuk mendukung dan mempromosikan usaha mikro,
              kecil, dan menengah di Kelurahan Bantarjati, Kota Bogor.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Navigasi</h3>
            <ul className="space-y-2">
              {[
                ["Beranda", "/"],
                ["Tentang", "/tentang"],
                ["Peta UMKM", "/peta"],
                ["Statistik", "/statistik"],
                ["Daftarkan Usaha", "/daftar"],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Kontak</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Kelurahan Bantarjati</li>
              <li>Kecamatan Bogor Utara</li>
              <li>Kota Bogor, Jawa Barat</li>
              <li className="pt-1">
                <span className="text-gray-500">Email:</span>{" "}
                bantarjatikelurahan@gmail.com
              </li>
              <li className="pt-1">
                <span className="text-gray-500">Hubungi:</span>{" "}
                <a
                  href="https://wa.me/6281385339753"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline decoration-green-500/70 underline-offset-2"
                >
                  0813-8533-9753
                </a>
              </li>
              <li>
                <span className="text-gray-500">Admin 2:</span>{" "}
                <a
                  href="https://wa.me/6282124415573"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline decoration-green-500/70 underline-offset-2"
                >
                  0821-2441-5573
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-gray-500">
            © 2026 UMKM Bantarjati. Hak cipta dilindungi.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm font-semibold text-gray-300 transition-colors hover:border-green-500 hover:text-green-400"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 21a8 8 0 00-16 0"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 13a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}