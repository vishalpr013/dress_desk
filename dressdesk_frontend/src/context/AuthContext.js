import { createContext, useContext, useState } from "react";
import { login as apiLogin, logout as apiLogout } from "../services/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("dd_user");
    return saved ? JSON.parse(saved) : null;
  });

  // credentials: (email, password)
  const login = async (email, password) => {
    try {
      const resp = await apiLogin(email, password);
      if (resp && resp.token) {
        const userData = resp.user || { email };
        setUser(userData);
        localStorage.setItem("dd_user", JSON.stringify(userData));
        return { ok: true, data: resp };
      }
      return { ok: false, data: resp };
    } catch (err) {
      // Normalize axios error response
      const data = err && err.response && err.response.data ? err.response.data : { error: err.message };
      return { ok: false, data };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dd_user");
    apiLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
