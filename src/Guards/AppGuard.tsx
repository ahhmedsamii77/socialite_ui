import { useGetUserData } from "@/lib/apis/queries";
import { useAuthStore } from "@/lib/store/auth"
import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AppGuard({ children }: { children: JSX.Element }) {
  const { pathname } = useLocation();
  const { data: userData } = useGetUserData();
  const { access_Token, refresh_Token } = useAuthStore();
  const isAuth = access_Token || refresh_Token;
  if (isAuth) {
    if (userData?.role === "user" && pathname === "/admin") return <Navigate to="/" />;
    return children;
  };
  return <Navigate replace to="/auth/login" />;
}
