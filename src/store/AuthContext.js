import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken, setUnauthorizedHandler, get, post, put } from "../api";

const AuthContext = createContext(null);

const TOKEN_KEY = "@grocery_token";
const USER_KEY = "@grocery_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTok] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    setUser(null);
    setTok(null);
    setToken(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(USER_KEY);
        if (savedToken) {
          setToken(savedToken);
          setTok(savedToken);
          if (savedUser) setUser(JSON.parse(savedUser));
          try {
            const me = await get("/api/auth/me");
            setUser(me.user);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(me.user));
          } catch (e) {
            // token invalid -> handler will logout
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (t, u) => {
    setToken(t);
    setTok(t);
    setUser(u);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, t],
      [USER_KEY, JSON.stringify(u)],
    ]);
  }, []);

  const login = useCallback(
    async (phone, password) => {
      const data = await post("/api/auth/login", { phone, password });
      await persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const data = await post("/api/auth/register", payload);
      await persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const refresh = useCallback(async () => {
    const data = await get("/api/auth/me");
    setUser(data.user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await put("/api/auth/me", payload);
    setUser(data.user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        refresh,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
