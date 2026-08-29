import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";

interface AuthContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const ADMIN_STORAGE_KEY = "bantarjati_admin";
const ADMIN_USER_KEY = "bantarjati_admin_user";
const ADMIN_SESSION_KEY = "bantarjati_admin_session";

const getAdminState = () => {
  if (typeof window === "undefined") return false;

  try {
    const localFlag = window.localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
    const sessionFlag = window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
    return localFlag || sessionFlag;
  } catch {
    return false;
  }
};

const setAdminState = (value: boolean, username?: string) => {
  if (typeof window === "undefined") return;

  try {
    if (value) {
      window.localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      if (username) {
        window.localStorage.setItem(ADMIN_USER_KEY, username);
      }
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    } else {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
      window.localStorage.removeItem(ADMIN_USER_KEY);
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    // Ignore storage failures in restricted browsers or private mode.
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(getAdminState);

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("username")
        .eq("username", username)
        .eq("password", password)
        .maybeSingle();

      if (data && !error) {
        setIsAdmin(true);
        setAdminState(true, username);
        return true;
      }
      setAdminState(false);
      setIsAdmin(false);
      return false;
    } catch {
      setAdminState(false);
      setIsAdmin(false);
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminState(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
