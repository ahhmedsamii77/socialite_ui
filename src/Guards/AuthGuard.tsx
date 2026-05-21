import { useAuthStore } from "@/lib/store/auth"
import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }: { children: JSX.Element }) {
  const { access_Token, refresh_Token } = useAuthStore();
  if (!access_Token && !refresh_Token) return children;
  return <Navigate replace to="/" />
}
