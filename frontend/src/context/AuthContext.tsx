import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AuthApi, type AuthResponse } from "../api/client";

interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function storeSession(res: AuthResponse) {
  localStorage.setItem("token", res.token);
  localStorage.setItem(
    "user",
    JSON.stringify({ userId: res.userId, name: res.name, email: res.email, role: res.role })
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);

    const handleAuthLogout = () => {
      setUser(null);
    };
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, []);

  async function login(email: string, password: string): Promise<AuthUser> {
    const res = await AuthApi.login({ email, password });
    storeSession(res);
    const authUser: AuthUser = { userId: res.userId, name: res.name, email: res.email, role: res.role };
    setUser(authUser);
    return authUser;
  }

  async function register(name: string, email: string, phone: string, password: string) {
    const res = await AuthApi.register({ name, email, phone, password });
    storeSession(res);
    setUser({ userId: res.userId, name: res.name, email: res.email, role: res.role });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
