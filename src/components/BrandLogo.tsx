import { Link } from "react-router-dom";

export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="UMKM Bantarjati">
      <img
        src="/logo-bantarjati.png"
        alt="Logo UMKM Bantarjati"
        className={compact ? "h-14 w-14 object-contain sm:h-16 sm:w-16" : "h-16 w-16 object-contain sm:h-20 sm:w-20"}
      />
      {!compact && (
        <div>
          <div className="font-bold leading-tight text-gray-900">UMKM Bantarjati</div>
          <div className="text-xs leading-tight text-gray-500">Kota Bogor</div>
        </div>
      )}
    </Link>
  );
}
