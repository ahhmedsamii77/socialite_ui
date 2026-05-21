import type { ConfirmEmailType, LoginType, SignupType } from "@/types";
import { api } from "./apis";

export function createAccount(data: SignupType) {
  return api.post("/auth/signup", data);
}

export function createAccountWithGmail(idToken: string) {
  return api.post("/auth/signup-gmail", { idToken });
}



export function login(data: LoginType) {
  return api.post("/auth/login", data);
}

export function loginWithGmail(idToken: string) {
  return api.post("/auth/login-gmail", { idToken });
}

export function confirmEmail(data: ConfirmEmailType) {
  return api.patch("/auth/confirm-email", data);
}

export function resendEmailOtp(data: { email: string }) {
  return api.post("/auth/resend-otp", data);
}

export function sendResetPasswordOtp(data: { email: string }) {
  return api.post("/auth/send-reset-password", data);
}


export function verifyResetPasswordOtp(data: { email: string, otp: string }) {
  return api.post("/auth/verify-reset-password", data);
}

export function resetPassword(data: { email: string, password: string, confirmPassword: string }) {
  return api.patch("/auth/reset-password", data);
}
