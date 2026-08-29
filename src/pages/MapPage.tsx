import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useUMKM } from "../lib/umkm";

// Fix Leaflet default icon
function fixLeafletIcons(L: typeof import("leaflet")) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const LIGHT_TILES = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};
const DARK_TILES = {
  url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
};

// Center: Bantarjati, Bogor
const CENTER: [number, number] = [-6.592, 106.799];
const BANTARJATI_BOUNDS: [[number, number], [number, number]] = [
  [-6.586, 106.797],
  [-6.568, 106.814],
];

const BANTARJATI_BOUNDARY = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Batas Wilayah Bantarjati" },
      geometry: {
        type: "LineString",
        coordinates: [
          [106.813742, -6.569347],
          [106.813295, -6.56999],
          [106.81303, -6.571396],
          [106.8131, -6.573532],
          [106.812341, -6.574829],
          [106.811457, -6.575785],
          [106.81086, -6.576603],
          [106.810733, -6.577569],
          [106.810931, -6.578287],
          [106.810928, -6.579018],
          [106.810702, -6.579584],
          [106.810607, -6.581116],
          [106.811071, -6.582663],
          [106.810727, -6.583139],
          [106.811105, -6.584478],
          [106.811188, -6.585208],
          [106.810747, -6.58562],
          [106.809869, -6.585443],
          [106.809, -6.585408],
          [106.807843, -6.585166],
          [106.80697, -6.584827],
          [106.805743, -6.584537],
          [106.804227, -6.58417],
          [106.802336, -6.58368],
          [106.80148, -6.583379],
          [106.800722, -6.584025],
          [106.799966, -6.584448],
          [106.799826, -6.584474],
          [106.799893, -6.583745],
          [106.799724, -6.583387],
          [106.799267, -6.583675],
          [106.799109, -6.583092],
          [106.798662, -6.582833],
          [106.79803, -6.582843],
          [106.798085, -6.582377],
          [106.7978, -6.581856],
          [106.797628, -6.581486],
          [106.798211, -6.580771],
          [106.798951, -6.580177],
          [106.799371, -6.579735],
          [106.800565, -6.579262],
          [106.800716, -6.579016],
          [106.800625, -6.5783],
          [106.800884, -6.577919],
          [106.801536, -6.577051],
          [106.801806, -6.576641],
          [106.801909, -6.575984],
          [106.802286, -6.575655],
          [106.803156, -6.575301],
          [106.803887, -6.575177],
          [106.804325, -6.574566],
          [106.80445, -6.574221],
          [106.804728, -6.573607],
          [106.805973, -6.57226],
          [106.806743, -6.571165],
          [106.8073, -6.570685],
          [106.807207, -6.569946],
          [106.806842, -6.569593],
          [106.806807, -6.568946],
          [106.806846, -6.568573],
          [106.807529, -6.568605],
          [106.808334, -6.568613],
          [106.808574, -6.568653],
          [106.809193, -6.568545],
          [106.809441, -6.56848],
          [106.809904, -6.56794],
          [106.810483, -6.567567],
          [106.811215, -6.567926],
          [106.811788, -6.568067],
          [106.812071, -6.568118],
          [106.812461, -6.568506],
          [106.812988, -6.56821],
          [106.813233, -6.568739],
          [106.813265, -6.569094],
          [106.813644, -6.569133],
          [106.814002, -6.569093],
          [106.813742, -6.569347],
        ],
      },
    },
  ],
} as const;

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const tileLayerRef = useRef<import("leaflet").TileLayer | null>(null);
  const boundaryLayerRef = useRef<import("leaflet").GeoJSON | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { umkmList: allUMKM, loading } = useUMKM();
  const umkmList = allUMKM.filter((u) => u.lat !== null && u.lng !== null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      fixLeafletIcons(L);

      const map = L.map(mapContainerRef.current!, {
        center: CENTER,
        zoom: 13,
        zoomControl: false,
      });

      map.fitBounds(BANTARJATI_BOUNDS, { padding: [25, 25], maxZoom: 14 });
      setTimeout(() => map.invalidateSize(), 200);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const tiles = isDark ? DARK_TILES : LIGHT_TILES;
      const layer = L.tileLayer(tiles.url, {
        attribution: tiles.attribution,
        maxZoom: 19,
      });
      layer.addTo(map);

      tileLayerRef.current = layer;
      boundaryLayerRef.current = L.geoJSON(
        BANTARJATI_BOUNDARY as unknown as Parameters<typeof L.geoJSON>[0],
        {
          style: {
            color: "#d97706",
            weight: 4,
            opacity: 0.9,
            dashArray: "8 6",
          },
        }
      ).addTo(map);
      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        tileLayerRef.current = null;
        boundaryLayerRef.current = null;
      }
    };
  }, []);

  // Add markers when data loads
  useEffect(() => {
    if (!mapRef.current || loading) return;

    import("leaflet").then((L) => {
      umkmList.forEach((u) => {
        if (u.lat === null || u.lng === null) return;
        const latitude = u.lat;
        const longitude = u.lng;
        const icon = L.divIcon({
          html: `<div style="
            width:34px;height:34px;border-radius:9999px;
            background:${u.is_unggulan ? "linear-gradient(135deg, #f59e0b, #fbbf24)" : "linear-gradient(135deg, #15803d, #d97706)"};
            border:3px solid white;
            box-shadow:0 4px 12px rgba(0,0,0,0.25);
            display:flex;align-items:center;justify-content:center;
            font-size:18px;line-height:1;
            color:white;
          "><span>🍴</span></div>`,
          className: "",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -18],
        });

        const marker = L.marker([latitude, longitude], { icon });

        const popupContent = `
          <div style="width:220px;font-family:'Plus Jakarta Sans',sans-serif;">
            ${
              u.foto_urls?.[0]
                ? `<img src="${u.foto_urls[0]}" alt="${u.nama_usaha}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;" />`
                : `<div style="width:100%;height:80px;background:#f7f1eb;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;font-size:2rem;">🏪</div>`
            }
            <div style="padding:12px;">
              ${u.is_unggulan ? '<span style="background:#fef3c7;color:#d97706;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;">⭐ Unggulan</span>' : ""}
              <div style="font-weight:700;font-size:14px;margin-top:6px;color:#111827;">${u.nama_usaha}</div>
              ${u.produk ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;">${u.produk}</div>` : ""}
              <div style="font-size:11px;color:#9ca3af;margin-top:4px;">${u.rw} · ${u.kategori}</div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 240 });
        marker.addTo(mapRef.current!);
      });
    });
  }, [umkmList, loading]);

  // Switch tiles on dark/light toggle
  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet").then((L) => {
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
      }
      const tiles = isDark ? DARK_TILES : LIGHT_TILES;
      const layer = L.tileLayer(tiles.url, {
        attribution: tiles.attribution,
        maxZoom: 19,
      });
      layer.addTo(mapRef.current!);
      tileLayerRef.current = layer;
    });
  }, [isDark]);

  // Keep the territory outline visible in both map themes.
  useEffect(() => {
    if (!boundaryLayerRef.current) return;

    boundaryLayerRef.current.setStyle({
      color: isDark ? "#fbbf24" : "#d97706",
      weight: isDark ? 5 : 4,
      opacity: 0.95,
    });
  }, [isDark]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Page header */}
      <section className="bg-green-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold mb-2">Peta UMKM</h1>
          <p className="text-green-200">
            Sebaran lokasi usaha mikro, kecil, dan menengah di Bantarjati
          </p>
        </div>
      </section>

      {/* Map wrapper */}
      <section className="flex-1 relative">
        <div
          ref={wrapperRef}
          className={`relative ${isFullscreen ? "w-screen h-screen" : "h-[600px] md:h-[700px]"}`}
          style={{ background: isDark ? "#1a1a2e" : "#f7f1eb" }}
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            {/* Dark/Light toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-all"
              style={{
                background: isDark ? "#1f2937" : "white",
                color: isDark ? "#f9fafb" : "#374151",
              }}
              title={isDark ? "Mode Terang" : "Mode Gelap"}
            >
              {isDark ? (
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
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
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-all"
              style={{
                background: isDark ? "#1f2937" : "white",
                color: isDark ? "#f9fafb" : "#374151",
              }}
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            >
              {isFullscreen ? (
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
                    d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                  />
                </svg>
              ) : (
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
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Legend */}
          <div
            className="absolute bottom-10 left-4 z-[1000] rounded-xl shadow-lg p-3 text-xs space-y-1.5"
            style={{
              background: isDark ? "#1f2937" : "white",
              color: isDark ? "#f9fafb" : "#374151",
            }}
          >
            <div className="font-semibold mb-2">Legenda</div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow" />
              <span>UMKM Unggulan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-green-700 border-2 border-white shadow" />
              <span>UMKM Reguler</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 border-t-2 border-dashed border-amber-500" />
              <span>Batas Bantarjati</span>
            </div>
            <div className="mt-2 text-gray-400 text-[10px]">
              {loading ? "Memuat..." : `${umkmList.length} titik`}
            </div>
          </div>

          {/* Map container */}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </section>

      {/* List below map */}
      {!loading && umkmList.length > 0 && (
        <section className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-semibold text-gray-900 mb-5">
              UMKM dengan Koordinat ({umkmList.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {umkmList.map((u) => (
                <div
                  key={u.id}
                  className="flex gap-3 bg-white rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-colors"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    {u.is_unggulan ? (
                      <span className="text-amber-500 text-lg">⭐</span>
                    ) : (
                      <span className="text-green-600 text-lg">📍</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">
                      {u.nama_usaha}
                    </div>
                    <div className="text-xs text-gray-500">
                      {u.rw} · {u.kategori}
                    </div>
                    {u.maps_url && (
                      <a
                        href={u.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:underline"
                      >
                        Buka Maps
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
