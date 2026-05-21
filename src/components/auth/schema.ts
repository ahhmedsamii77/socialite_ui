import { z } from "zod";
export const signupSchema = z
  .strictObject({
    username: z
      .string()
      .min(3, { error: "Username must be at least 3 characters" })
      .max(20, { error: "Username must be at most 20 characters" })
      .regex(/^[a-zA-Z ]+$/, { message: "Username must contain only letters" }),
    email: z.email({ error: "Invalid email" }),
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" }),
    phone: z.string().regex(/^\+?[0-9\s\-]{7,20}$/, {
      message: "Invalid phone number",
    }),
    gender: z.enum(["male", "female"], {
      error: "Invalid gender",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const loginSchema = z.strictObject({
  email: z.email({ error: "Invalid email" }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" }),
});

export const confirmEmailSchema = z.strictObject({
  email: z.email({ error: "Invalid email" }),
  otp: z.string().length(6, { error: "OTP must be 6 digits" }),
});


export const sendResetPasswordOtpSchema = z.strictObject({
  email: z.email({ error: "Invalid email" }),
});


export const verifyResetPasswordSchema = z.strictObject({
  email: z.email({ error: "Invalid email" }),
  otp: z.string().length(6, { error: "OTP must be 6 digits" }),
});


export const resetPasswordSchema = z
  .strictObject({
    email: z.email({ error: "Invalid email" }),
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });