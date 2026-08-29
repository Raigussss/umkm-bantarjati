import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import type { UMKM } from "./types";

interface UMKMContextValue {
  umkmList: UMKM[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const UMKMContext = createContext<UMKMContextValue | null>(null);

export function UMKMProvider({ children }: { children: ReactNode }) {
  const [umkmList, setUmkmList] = useState<UMKM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("umkm")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setUmkmList([]);
    } else {
      setError("");
      setUmkmList(
        (data || []).map((item) => ({
          ...item,
          foto_urls: Array.isArray(item.foto_urls) ? item.foto_urls.filter(Boolean) : [],
        })) as UMKM[]
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();

    const handleFocus = () => {
      void refresh();
    };

    const handleOnline = () => {
      void refresh();
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        void refresh();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <UMKMContext.Provider value={{ umkmList, loading, error, refresh }}>
      {children}
    </UMKMContext.Provider>
  );
}

export function useUMKM() {
  const context = useContext(UMKMContext);
  if (!context) throw new Error("useUMKM must be used within UMKMProvider");
  return context;
}
