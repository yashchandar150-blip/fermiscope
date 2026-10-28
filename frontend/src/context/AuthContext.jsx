import { createContext, useCallback, useEffect, useState } from "react";
import { TOKEN_KEY } from "../services/api";
import { getMe, loginUser, registerUser } from "../services/authService";

export const AuthContext = createContext(null);

// AuthProvider keeps the logged-in user in one place so every page can read it
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" is true while we check a saved token when the app first opens
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // On first load: if a token is saved, ask the server who the user is
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  // The Axios interceptor fires this event when the server rejects the token
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("fermiscope:unauthorized", handler);
    return () => window.removeEventListener("fermiscope:unauthorized", handler);
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const value = { user, setUser, loading, login, register, logout, isAdmin: user?.role === "admin" };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
