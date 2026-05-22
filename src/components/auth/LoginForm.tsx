import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Lock, Mail, OctagonAlert, Zap } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./schema";
import type { LoginType } from "@/types";
import { useLogin, useloginWithGmail } from "@/lib/apis/queries";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store/auth";
import { useRef, useState, useEffect } from "react";

export default function LoginForm() {
  const { mutateAsync: loginWithGmail } = useloginWithGmail();
  const { mutateAsync: login } = useLogin();
  const { setAccess_Token, setRefresh_Token, setRole } = useAuthStore();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleBtnWidth, setGoogleBtnWidth] = useState(400);

  useEffect(() => {
    if (!googleBtnRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setGoogleBtnWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(googleBtnRef.current);
    return () => observer.disconnect();
  }, []);

  async function handleloginWithGmail(credentialResponse: any) {
    if (!credentialResponse) return;
    try {
      const res = await loginWithGmail(credentialResponse.credential);
      setAccess_Token(res.data.data.credentials.access_token!);
      setRefresh_Token(res.data.data.credentials.refresh_token!);
      setRole(res.data.data.role);
      toast.success("Logged in successfully.");
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  async function onSubmit(values: LoginType) {
    try {
      const res = await login(values);
      setAccess_Token(res.data.data.credentials.access_token!);
      setRefresh_Token(res.data.data.credentials.refresh_token!);
      setRole(res.data.data.role);
      toast.success("Logged in successfully.");
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    }
    reset();
  }

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    mode: "onChange",
    resolver: zodResolver(loginSchema)
  });

  return (
    <Card className="bg-secondary w-full shadow-lg rounded-2xl border-border-strong py-6 px-1 sm:px-3 animate-fade-in-up">
      <CardHeader className="space-y-4">
        <Link to="/" className="flex gap-2 items-center w-fit">
          <div className="bg-linear-[135deg] text-white from-primary to-accent w-12 h-12 flex items-center justify-center rounded-lg shadow-lg">
            <Zap size={26} fill="currentColor" />
          </div>
          <span className="font-extrabold text-[22px] bg-linear-[135deg] from-primary to-accent bg-clip-text text-transparent tracking-tight font-display">Socialite</span>
        </Link>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-extrabold font-display">Welcome back</CardTitle>
          <CardDescription className="text-[13.5px]">Sign in to continue to Socialite</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <div ref={googleBtnRef} className="w-full">
                <GoogleLogin
                  width={googleBtnWidth}
                  onError={() => toast.error("Fail to login.")}
                  onSuccess={handleloginWithGmail}
                />
              </div>
            </Field>

            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs -my-4">
              or sign in with email
            </FieldSeparator>

            {/* Email */}
            <div className="space-y-1.5">
              <div className="relative group">
                <Mail size={15} className="text-muted-foreground/70 group-focus-within:text-primary left-3.5 top-1/2 -translate-y-1/2 absolute pointer-events-none transition-colors duration-200" />
                <Input
                  {...register("email")}
                  className="bg-input-base! rounded-xl text-[14px] pl-10 h-11 border-input hover:border-primary/30"
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  aria-invalid={errors.email ? "true" : "false"}
                />
              </div>
              {errors.email && (
                <div className="text-destructive text-xs fade-in flex items-center gap-1 font-semibold">
                  <OctagonAlert size={12} />
                  <span>{errors.email?.message}</span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Link className="text-[12px] block ml-auto w-fit! text-primary cursor-pointer font-bold hover:opacity-75 hover:underline transition duration-200" to="/auth/forget-password">
                Forget password?
              </Link>
              <div className="relative group">
                <Lock size={15} className="text-muted-foreground/70 group-focus-within:text-primary left-3.5 top-1/2 -translate-y-1/2 absolute pointer-events-none transition-colors duration-200" />
                <PasswordInput
                  {...register("password")}
                  className="bg-input-base! rounded-xl text-[14px] pl-10 h-11 border-input hover:border-primary/30"
                  id="password"
                  placeholder="Your password"
                  aria-invalid={errors.password ? "true" : "false"}
                />
              </div>
              {errors.password && (
                <div className="text-destructive text-xs fade-in flex items-center gap-1 font-semibold">
                  <OctagonAlert size={12} />
                  <span>{errors.password?.message}</span>
                </div>
              )}
            </div>

            <Field>
              <Button disabled={isSubmitting} className="cursor-pointer shadow h-11 rounded-xl text-[14px]" type="submit">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isSubmitting && (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </Button>
              <FieldDescription className="text-center text-[13px] mt-1">
                Don't have an account?{" "}
                <Link className="text-primary no-underline! hover:underline! hover:text-primary-light! font-bold" to={"/auth/signup"}>Sign up →</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
