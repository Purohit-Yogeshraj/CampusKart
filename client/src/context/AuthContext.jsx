import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL, request } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request("/auth/me")
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("campuskart_token");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function signup(formData) {
    if (formData instanceof FormData) {
      // Bypass the request wrapper for FormData to ensure browser sets the multipart boundary correctly
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        body: formData,
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (err) {
        throw new Error(
          "Server crashed or returned an invalid response. Check your terminal!",
        );
      }

      if (!response.ok)
        throw new Error(responseData?.message || "Signup failed");
      return responseData;
    }

    return await request("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  }

  async function login(formData) {
    const data = await request("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    setUser(data.user);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("campuskart_token", data.token);
    }
    return data;
  }

  async function logout() {
    await request("/auth/logout", {
      method: "POST",
    });
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("campuskart_token");
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, signup, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
