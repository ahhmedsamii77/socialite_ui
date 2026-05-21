import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Lock, Mail, OctagonAlert, Zap } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "./schema";
import type { ResetPasswordType } from "@/types";
import { useResetPassword } from "@/lib/apis/queries";
import toast from "react-hot-toast";
import { Separator } from "../ui/separator";

export default function ResetPasswordForm() {
  const { mutateAsync: sendResetPasswordOtp } = useResetPassword();
  const { state } = useLocation();
  const email: string = state?.email ?? "";
  const navigate = useNavigate();

  async function onSubmit(values: ResetPasswordType) {
    try {
      await sendResetPasswordOtp(values);
      toast.success("Password reset successfully.");
      navigate("/auth/login", { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    }
    reset();
  }

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    mode: "onChange",
    resolver: zodResolver(resetPasswordSchema)
  });

  const inputCls = "bg-input-base! rounded-xl text-[14px] pl-10 h-11 border-input hover:border-primary/30";
  const iconCls = "text-muted-foreground/70 group-focus-within:text-primary left-3.5 top-1/2 -translate-y-1/2 absolute pointer-events-none transition-colors duration-200";
  const errCls = "text-destructive text-xs fade-in flex items-center gap-1 font-semibold";

  return (
    <Card className="bg-secondary w-full shadow-lg rounded-2xl border-border-strong py-6 px-1 sm:px-3 animate-fade-in-up">
      <CardHeader className="space-y-4">
        <Link to="/" className="flex gap-2 items-center w-fit">
          <div className="bg-linear-[135deg] text-white from-primary to-accent w-12 h-12 flex items-center justify-center rounded-lg shadow-lg">
            <Zap size={26} fill="currentColor" />
          </div>
          <span className="font-extrabold text-[22px] bg-linear-[135deg] from-primary to-accent bg-clip-text text-transparent tracking-tight font-display">Socialite</span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center w-full">
          <div className="flex items-center flex-1">
            <div className="w-7.5 h-7.5 rounded-full text-[12px] shrink-0 text-base-muted font-bold bg-input-base border-2 border-border-strong flex items-center justify-center">1</div>
            <span className="text-[11px] text-nowrap font-medium ml-1 text-base-muted">Email</span>
            <Separator className="w-1/4! h-[1.5px]! mx-2 rounded-xl flex-1!" />
          </div>
          <div className="flex items-center flex-1">
            <div className="w-7.5 h-7.5 rounded-full text-[12px] shrink-0 text-base-muted font-bold bg-input-base border-2 border-border-strong flex items-center justify-center">2</div>
            <span className="text-[11px] text-nowrap font-medium ml-1 text-base-muted">Verify</span>
            <Separator className="w-1/4! h-[1.5px]! mx-2 rounded-xl flex-1!" />
          </div>
          <div className="flex items-center flex-1">
            <div className="w-7.5 h-7.5 rounded-full text-[12px] text-white shrink-0 shadow-[0_0_0_4px] shadow-primary-glow font-bold bg-primary border-2 border-primary flex items-center justify-center">3</div>
            <span className="text-[11px] text-nowrap font-medium ml-2 text-base-muted">Reset</span>
          </div>
        </div>
        <Separator />

        <div className="space-y-2">
          <CardTitle className="text-2xl font-extrabold font-display flex items-center gap-3">
            <div className="text-primary border border-primary/40 bg-[linear-gradient(135deg,rgba(139,92,246,0.18)_0%,rgba(236,72,153,0.12)_100%)] rounded-xl flex items-center justify-center w-14 h-14">
              <Lock size={28} />
            </div>
            <span>Set new password</span>
          </CardTitle>
          <CardDescription className="text-[13.5px]">Create a strong new password for your account.</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Email (readonly) */}
            <div className="space-y-1.5">
              <div className="relative group">
                <Mail size={15} className={iconCls} />
                <Input {...register("email")} defaultValue={email} readOnly className={`${inputCls} opacity-70 cursor-not-allowed`} id="email" type="email" placeholder="your@email.com" aria-invalid={errors.email ? "true" : "false"} />
              </div>
              {errors.email && <div className={errCls}><OctagonAlert size={12} /><span>{errors.email?.message}</span></div>}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <div className="relative group">
                <Lock size={15} className={iconCls} />
                <PasswordInput {...register("password")} className={inputCls} id="password" placeholder="Create new password" aria-invalid={errors.password ? "true" : "false"} />
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
                {!isSubmitting && <><span>Reset password</span><ArrowRight size={15} /></>}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
