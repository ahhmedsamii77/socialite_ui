import type { AuthType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export const useAuthStore = create<AuthType>()(
  persist(
    (set) => ({
      access_Token: "",
      refresh_Token: "",
      role: "",
      setRole: (role: string) => set({ role }),
      setAccess_Token: (access_Token: string) => set({ access_Token }),
      setRefresh_Token: (refresh_Token: string) => set({ refresh_Token }),
      clearAuth: () => set({ access_Token: "", refresh_Token: "", role: "" }),
    }),
    {
      name: "auth-store",
      storage: {
        getItem: (name: string) => {
          const cookie = Cookies.get(name);
          return cookie ? JSON.parse(cookie) : null;
        },
        setItem: (name: string, value: any) => {
          Cookies.set(name, JSON.stringify(value), {
            expires: 7,
          });
        },
        removeItem: (name: string) => {
          Cookies.remove(name);
        },
      },
    },
  ),
);
