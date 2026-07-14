import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Central axios instance. Point NEXT_PUBLIC_API_URL at your backend
 * when you're ready to consume real APIs.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_PATHS = ["auth/login", "auth/send-otp", "auth/verify-otp", "auth/forgot-password", "auth/reset-password"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? "";
    const isAuthRoute = AUTH_PATHS.some((p) => url.includes(p));
    if (error.response?.status === 401 && !isAuthRoute) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
