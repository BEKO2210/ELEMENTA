"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ID } from "appwrite";
import { account } from "@/lib/appwrite";

export interface AuthUser {
  $id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // Timeout, damit die UI nie hängen bleibt, falls die Anfrage nicht antwortet.
      const u = await Promise.race([
        account().get(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("auth-timeout")), 6000),
        ),
      ]);
      setUser({ $id: u.$id, name: u.name, email: u.email });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await account().createEmailPasswordSession(email, password);
      await refresh();
    },
    [refresh],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await account().create(ID.unique(), email, password, name);
      await account().createEmailPasswordSession(email, password);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await account().deleteSession("current");
    } catch {
      /* already gone */
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
