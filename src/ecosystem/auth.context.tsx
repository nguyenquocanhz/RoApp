"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  username: string;
  email: string;
  avatarUrl: string;
  role: "user" | "admin";
  status: "active" | "banned";
  bio?: string;
  githubUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  uploadedCount: number;
}

interface AuthContextType {
  user: User | null;
  login: (usernameOrEmail: string, password?: string) => Promise<void>;
  register: (username: string, email: string, password: string, avatarUrl?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUserContext: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount and check if banned
  useEffect(() => {
    const savedUser = localStorage.getItem("ro_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        
        // Verify user status with the DB on load to ensure they aren't banned
        fetch(`/api/u/${encodeURIComponent(parsed.username)}`)
          .then((res) => res.json())
          .then((json) => {
            if (json.success && json.data?.developer) {
              const dev = json.data.developer;
              if (dev.status === "banned") {
                logout();
              } else {
                const updated = {
                  username: dev.username,
                  email: dev.email,
                  avatarUrl: dev.avatarUrl,
                  role: dev.role,
                  status: dev.status,
                  bio: dev.bio || "",
                  githubUrl: dev.githubUrl || "",
                  telegramUrl: dev.telegramUrl || "",
                  websiteUrl: dev.websiteUrl || "",
                  uploadedCount: dev.uploadedCount || 0,
                };
                setUser(updated);
                localStorage.setItem("ro_user", JSON.stringify(updated));
              }
            }
          })
          .catch((err) => console.error("Error verifying user status on mount:", err));
      } catch (e) {
        localStorage.removeItem("ro_user");
      }
    }
  }, []);

  const login = async (usernameOrEmail: string, password?: string) => {
    // If no password is provided, mock log in for dev convenience / role switches
    if (!password) {
      const role = usernameOrEmail === "admin" ? "admin" : "user";
      const defaultUsername = role === "admin" ? "AdminRoApp" : "NguoiDungPremium";
      const defaultEmail = role === "admin" ? "admin@roapp.vn" : "premium@roapp.vn";
      const defaultAvatar = role === "admin" 
        ? "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop"
        : "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop";

      try {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: defaultUsername,
            email: defaultEmail,
            password: "defaultPassword123",
            avatarUrl: defaultAvatar,
          }),
        });
        const regJson = await regRes.json();
        
        let loginUsername = defaultUsername;
        if (!regJson.success && regJson.error?.includes("đã tồn tại")) {
          loginUsername = defaultUsername;
        }

        const logRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: loginUsername,
            password: "defaultPassword123",
          }),
        });
        const logJson = await logRes.json();
        if (logJson.success) {
          setUser(logJson.data);
          localStorage.setItem("ro_user", JSON.stringify(logJson.data));
          return;
        }
      } catch (err) {
        console.error("Mock login registration failed, falling back to local mock state", err);
      }

      // Final fallback
      const fallbackUser: User = {
        username: defaultUsername,
        email: defaultEmail,
        avatarUrl: defaultAvatar,
        role: role,
        status: "active",
        uploadedCount: role === "admin" ? 12 : 5,
      };
      setUser(fallbackUser);
      localStorage.setItem("ro_user", JSON.stringify(fallbackUser));
      return;
    }

    // Real DB authentication
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameOrEmail, password }),
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Đăng nhập thất bại");
    }

    setUser(json.data);
    localStorage.setItem("ro_user", JSON.stringify(json.data));
  };

  const register = async (username: string, email: string, password: string, avatarUrl?: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, avatarUrl }),
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Đăng ký thất bại");
    }

    setUser(json.data);
    localStorage.setItem("ro_user", JSON.stringify(json.data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ro_user");
  };

  const updateUserContext = (updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem("ro_user", JSON.stringify(merged));
      return merged;
    });
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isAdmin, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
