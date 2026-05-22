import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Lock, Mail, Mars, OctagonAlert, Phone, User, Zap } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "./schema";
import type { SignupType } from "@/types";
import { useCreateAccount, useCreateAccountWithGmail } from "@/lib/apis/queries";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store/auth";
import { useRef, useState, useEffect } from "react";

export default function SignupForm() {
  const { mutateAsync: createAccountWithGmail } = useCreateAccountWithGmail();
  const { mutateAsync: createAccount } = useCreateAccount();
  const { setAccess_Token, setRefresh_Token } = useAuthStore();
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

  async function handleCreateAccountWithGmail(credentialResponse: any) {
    if (!credentialResponse) return;
    try {
      const res = await createAccountWithGmail(credentialResponse.credential);
      setAccess_Token(res.data.data.credentials.access_token!);
      setRefresh_Token(res.data.data.credentials.refresh_token!);
      toast.success("Account created successfully.");
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  async function onSubmit(values: SignupType) {
    try {
      await createAccount(values);
      toast.success("Account created successfully.");
      navigate("/auth/confirm-email", { replace: true, state: { email: values.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    }
    reset();
  }

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, trigger } = useForm({
    mode: "onChange",
    resolver: zodResolver(signupSchema)
  });

  const inputCls = "bg-input-base! rounded-xl text-[14px] pl-10 h-11 border-input hover:border-primary/30";
  const iconCls = "text-muted-foreground/70 group-focus-within:text-primary left-3.5 top-1/2 -translate-y-1/2 absolute pointer-events-none transition-colors duration-200";
  const errCls = "text-destructive text-xs fade-in flex items-center gap-1 font-semibold mt-1";

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
          <CardTitle className="text-2xl font-extrabold font-display">Join Socialite</CardTitle>
          <CardDescription className="text-[13.5px]">Connect with the people who matter to you</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <div ref={googleBtnRef} className="w-full">
                <GoogleLogin
                  width={googleBtnWidth}
                  onError={() => toast.error("Fail to create account.")}
                  onSuccess={handleCreateAccountWithGmail}
                />
              </div>
            </Field>

            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs -my-4">
              or create with email
            </FieldSeparator>

            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="relative group">
                <User size={15} className={iconCls} />
                <Input {...register("username")} className={inputCls} id="username" type="text" placeholder="Your full name" aria-invalid={errors.username ? "true" : "false"} />
              </div>
              {errors.username && <div className={errCls}><OctagonAlert size={12} /><span>{errors.username?.message}</span></div>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <div className="relative group">
                <Mail size={15} className={iconCls} />
                <Input {...register("email")} className={inputCls} id="email" type="email" placeholder="your@email.com" aria-invalid={errors.email ? "true" : "false"} />
              </div>
              {errors.email && <div className={errCls}><OctagonAlert size={12} /><span>{errors.email?.message}</span></div>}
            </div>

            {/* Phone & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="relative group">
                  <Phone size={15} className={iconCls} />
                  <Input {...register("phone")} className={inputCls} id="phone" type="tel" placeholder="+1 234 567 8900" aria-invalid={errors.phone ? "true" : "false"} />
                </div>
                {errors.phone && <div className={errCls}><OctagonAlert size={12} /><span>{errors.phone?.message}</span></div>}
              </div>
              <div className="space-y-1.5">
                <div className="relative group">
                  <Mars size={15} className={iconCls} />
                  <Select onValueChange={(value: any) => { setValue("gender", value); trigger("gender"); }}>
                    <SelectTrigger aria-invalid={errors.gender ? "true" : "false"} className="bg-input-base! cursor-pointer rounded-xl text-[14px] pl-10 h-11 border-input hover:border-primary/30 w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem className="cursor-pointer px-3.5 py-2.75 hover:bg-hover-base! data-[state=checked]:text-primary" value="male"><span className="text-[14px]!">Male</span></SelectItem>
                        <SelectItem className="cursor-pointer px-3.5 py-2.75 hover:bg-hover-base! data-[state=checked]:text-primary" value="female"><span className="text-[14px]!">Female</span></SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {errors.gender && <div className={errCls}><OctagonAlert size={12} /><span>{errors.gender?.message}</span></div>}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="relative group">
                <Lock size={15} className={iconCls} />
                <PasswordInput {...register("password")} className={inputCls} id="password" placeholder="Create a strong password" aria-invalid={errors.password ? "true" : "false"} />
              </div>
              {errors.password && <div className={errCls}><OctagonAlert size={12} /><span>{errors.password?.message}</span></div>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <div className="relative group">
                <Lock size={15} className={iconCls} />
                <PasswordInput {...register("confirmPassword")} className={inputCls} id="confirmPassword" placeholder="Repeat your password" aria-invalid={errors.confirmPassword ? "true" : "false"} />
              </div>
              {errors.confirmPassword && <div className={errCls}><OctagonAlert size={12} /><span>{errors.confirmPassword?.message}</span></div>}
            </div>

            <Field>
              <Button disabled={isSubmitting} className="cursor-pointer shadow h-11 rounded-xl text-[14px]" type="submit">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isSubmitting && <><span>Create Account</span><ArrowRight size={15} /></>}
              </Button>
              <FieldDescription className="text-center text-[13px] mt-1">
                Already have an account?{" "}
                <Link className="text-primary no-underline! hover:underline! hover:text-primary-light! font-bold" to={"/auth/login"}>Sign in →</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
