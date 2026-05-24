import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role, User } from "@/types";

interface AuthState {
  user: User | null;
  isLoaded: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: Role) => Promise<User>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_KEY = "leadflow.auth.user";
const USERS_KEY = "leadflow.auth.users";

interface StoredUser extends User {
  password: string;
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed default admin
  const seed: StoredUser[] = [
    {
      id: "u1",
      name: "Aarav Mehta",
      email: "admin@leadflow.ai",
      role: "admin",
      password: "admin123",
    },
    {
      id: "u2",
      name: "Priya Sharma",
      email: "priya@leadflow.ai",
      role: "employee",
      password: "demo1234",
    },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(seed));
  return seed;
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setIsLoaded(true);
  }, []);

  const persist = (u: User | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const users = readUsers();
    const match = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!match) throw new Error("Invalid email or password");
    const { password: _pw, ...safe } = match;
    persist(safe);
    return safe;
  };

  const register = async (name: string, email: string, password: string, role: Role) => {
    await new Promise((r) => setTimeout(r, 400));
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already registered");
    }
    const newUser: StoredUser = {
      id: `u${Date.now()}`,
      name,
      email,
      role,
      password,
    };
    writeUsers([...users, newUser]);
    const { password: _pw, ...safe } = newUser;
    persist(safe);
    return safe;
  };

  const logout = () => persist(null);

  const updateProfile = (patch: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...patch };
    persist(next);
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
