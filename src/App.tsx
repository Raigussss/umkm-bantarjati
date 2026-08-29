import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./lib/auth";
import { UMKMProvider } from "./lib/umkm";
import Home from "./pages/Home";
import About from "./pages/About";
import MapPage from "./pages/MapPage";
import Statistics from "./pages/Statistics";
import UMKMDetail from "./pages/UMKMDetail";
import Register from "./pages/Register";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminPanel from "./pages/admin/AdminPanel";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/admin" replace />;
}

function AdminLoginRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  return isAdmin ? <Navigate to="/admin/panel" replace /> : <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    const timer = window.setTimeout(() => setTransitioning(false), 3000);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {transitioning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#fff9f4_0%,_#f4e6d8_35%,_#e9d2b8_100%)]" role="status" aria-label="Memuat halaman">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute left-[-10%] top-[18%] h-40 w-40 rounded-full bg-[#f3c38b]/40 blur-3xl" />
            <div className="absolute bottom-[12%] right-[-8%] h-52 w-52 rounded-full bg-[#b77d4f]/25 blur-3xl" />
            <div className="absolute left-[18%] top-[60%] h-28 w-28 rounded-full bg-[#d97706]/20 blur-2xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 animate-[float_2.6s_ease-in-out_infinite]">
              <div className="flex h-40 w-40 items-center justify-center rounded-[32px] border border-[#e7d4bb] bg-white/90 p-5 shadow-[0_20px_50px_rgba(90,56,37,0.18)] backdrop-blur-sm ring-4 ring-[#f7d9a8]/60 sm:h-48 sm:w-48">
                <img src="/logo-bantarjati.png" alt="Logo UMKM Bantarjati" className="h-28 w-28 object-contain drop-shadow-[0_8px_18px_rgba(90,56,37,0.18)] sm:h-36 sm:w-36" />
              </div>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[#d97706] shadow-[0_0_14px_rgba(217,119,6,0.8)] animate-pulse" />
              <p className="font-display text-2xl font-bold tracking-wide text-[#5a3825] sm:text-3xl">UMKM Bantarjati</p>
            </div>

            <div className="mt-2 h-2.5 w-56 overflow-hidden rounded-full bg-[#eaded2] shadow-inner ring-1 ring-[#d9c2ae]">
              <div className="h-full w-1/2 rounded-full bg-[linear-gradient(90deg,#d97706_0%,#f6c66b_50%,#d97706_100%)] shadow-[0_0_18px_rgba(217,119,6,0.75)] animate-[loadingBar_2.2s_ease-in-out_infinite]" />
            </div>

            <p className="mt-4 text-sm font-medium uppercase tracking-[0.25em] text-[#8b5e3c]">Menyiapkan halaman...</p>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tentang" element={<About />} />
        <Route path="/peta" element={<MapPage />} />
        <Route path="/statistik" element={<Statistics />} />
        <Route path="/umkm/:id" element={<UMKMDetail />} />
        <Route path="/daftar" element={<Register />} />
        <Route path="/admin" element={<AdminLoginRoute><AdminLogin /></AdminLoginRoute>} />
        <Route path="/admin/panel" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UMKMProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UMKMProvider>
    </AuthProvider>
  );
}
