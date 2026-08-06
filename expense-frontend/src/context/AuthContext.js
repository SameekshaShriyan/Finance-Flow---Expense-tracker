import { createContext, useState, useEffect, useContext } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw && raw !== "undefined" && raw !== "null") {
        setUser(JSON.parse(raw));
      }
    } catch (e) {
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    // POST /api/auth/login → returns { message, role }
    const res = await API.post("/auth/login", { email, password });
    const userData = { email, role: res.data.role || role, name: email.split("@")[0] };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role) => {
    // POST /api/auth/register → returns { message, user }
    const res = await API.post("/auth/register", { name, email, password, role });
    const userData = { name, email, role: res.data.user?.role || role };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
