import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function Footer() {
  const [installable, setInstallable] = useState(false);
  const [showInstallConfirm, setShowInstallConfirm] = useState(false);
  const [beforeInstallPrompt, setBeforeInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setBeforeInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallable(true);
    };

    const handleAppInstalled = () => {
      setInstallable(false);
      setBeforeInstallPrompt(null);
      setShowInstallConfirm(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installable) return;
    setShowInstallConfirm(true);
  };

  const handleConfirmInstall = async () => {
    if (!beforeInstallPrompt) return;

    setShowInstallConfirm(false);
    beforeInstallPrompt.prompt();
    await beforeInstallPrompt.userChoice;
    setBeforeInstallPrompt(null);
    setInstallable(false);
  };

  return (
    <>
      {showInstallConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7f1eb] text-lg">📲</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">Install app</p>
                <h3 className="text-lg font-bold text-gray-900">Tambah ke beranda perangkat?</h3>
              </div>
            </div>

            <p className="text-sm leading-6 text-gray-600">
              Aplikasi ini akan dibuat ikon shortcut di beranda perangkat Anda agar lebih cepat dibuka.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowInstallConfirm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmInstall}
                className="rounded-lg bg-[#5a3825] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a2d1d]"
              >
                Ya, install
              </button>
            </div>
          </div>
        </div>
      )}

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

            <div className="flex items-center gap-3">
              {installable && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-500/60 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-300 transition-colors hover:bg-green-500/15"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Install app
                </button>
              )}

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
        </div>
      </footer>
    </>
  );
}