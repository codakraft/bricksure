import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { User } from "../types";
import { api } from "../services/api";

// Generate unique user ID
const generateUserId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `USR-${timestamp}-${randomStr}`.toUpperCase();
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  verifyOTP: (code: string) => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const token = localStorage.getItem('bricksure-token');
    // if (token) {
    //   api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    //   fetchProfile();
    // } else {
    //   setLoading(false);
    // }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile/me");
      if (response.data.ok) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      localStorage.removeItem("bricksure-token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.ok) {
      const { token, user } = response.data.data;
      localStorage.setItem("bricksure-token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
    } else {
      throw new Error(response.data.error?.message || "Login failed");
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      phone,
      password,
    });
    if (!response.data.ok) {
      throw new Error(response.data.error?.message || "Registration failed");
    }
  };

  const verifyOTP = async (code: string) => {
    const response = await api.post("/auth/otp/verify", { code });
    if (response.data.ok) {
      const { token, user } = response.data.data;
      // Ensure user has a unique ID
      if (!user.id) {
        user.id = generateUserId();
      }
      localStorage.setItem("bricksure-token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
    } else {
      throw new Error(
        response.data.error?.message || "OTP verification failed"
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("bricksure-token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    verifyOTP,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
