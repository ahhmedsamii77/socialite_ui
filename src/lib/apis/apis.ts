import axios from "axios";
import { useAuthStore } from "@/lib/store/auth";
import { jwtDecode } from "jwt-decode";
import { client } from "@/App";
import { socket } from "../socket";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL,
});

let refreshPromise: Promise<string> | null = null;

export function getPrefix(token?: string): string {
  if (!token) return "Bearer";
  try {
    const { role } = jwtDecode<{ role: string }>(token);
    return role === "admin" ? "System" : "Bearer";
  } catch {
    return "Bearer";
  }
}

async function refreshAccessToken() {
  const authStore = useAuthStore.getState();

  const res = await axios.get(`${baseURL}/user/refresh-token`, {
    headers: {
      Authorization: `${getPrefix(authStore.refresh_Token)} ${authStore.refresh_Token}`,
    },
  });

  const newAccessToken = res.data.data.credentials.access_token;
  const newRefreshToken = res.data.data.credentials.refresh_token;

  authStore.setAccess_Token(newAccessToken);
  authStore.setRefresh_Token(newRefreshToken);

  return newAccessToken;
}

api.interceptors.request.use((config) => {
  const { access_Token } = useAuthStore.getState();

  if (access_Token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `${getPrefix(access_Token)} ${access_Token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/refresh-token")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }

      const newToken = await refreshPromise;

      refreshPromise = null;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `${getPrefix(newToken)} ${newToken}`;
      delete originalRequest.signal;
      return api(originalRequest);
    } catch (err) {
      refreshPromise = null;
      socket.disconnect();
      const authStore = useAuthStore.getState();
      authStore.clearAuth();

      window.location.href = "/auth/login";
      client.clear();
      return Promise.reject(err);
    }
  },
);
