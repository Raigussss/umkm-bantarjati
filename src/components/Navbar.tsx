import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import BrandLogo from "./BrandLogo";

const navItems = [
  { label: "Beranda", to: "/" },
  { label: "Tentang", to: "/tentang" },
  { label: "Peta", to: "/peta" },
  { label: "Statistik", to: "/statistik" },
  { label: "Daftarkan Sekarang", to: "/daftar", highlight: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <BrandLogo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) =>
              item.highlight ? (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    pathname === item.to
                      ? "bg-green-800 text-white"
                      : "bg-green-700 text-white hover:bg-green-800"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.to
                      ? "text-green-700 bg-green-50"
                      : "text-gray-600 hover:text-green-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
            {isAdmin && (
              <Link
                to="/admin/panel"
                className="ml-2 px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
              >
                Panel Admin
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.highlight
                    ? "bg-green-700 text-white"
                    : pathname === item.to
                      ? "text-green-700 bg-green-50"
                      : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/panel"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50"
              >
                Panel Admin
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
