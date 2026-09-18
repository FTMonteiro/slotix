import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { UserDTO } from "@slotix/types";
import { loadStoredAccessToken, setAccessToken } from "../services/api-client";
import { getMe } from "../services/users";

interface AuthContextValue {
  user: UserDTO | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// The access token was already being saved to SecureStore on login (api-client.ts), but
// nothing ever read it back on app launch — every restart silently behaved as logged out
// until the user logged in again, even with a still-valid token sitting in storage.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await loadStoredAccessToken();
      if (!token) {
        setUser(null);
        return;
      }

      const me = await getMe();
      setUser(me);
    } catch {
      // Token missing/expired/invalid — clear it so future requests don't keep sending
      // a dead token, and treat the user as logged out.
      await setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: user !== null, refresh, logout }),
    [user, isLoading, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth tem de ser usado dentro de um AuthProvider.");
  return context;
}
