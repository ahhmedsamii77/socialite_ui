import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Mail, OctagonAlert, ShieldCheck, Zap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyResetPasswordSchema } from "./schema";
import type { VerifyResetPasswordType } from "@/types";
import { useVerifyResetPasswordOtp } from "@/lib/apis/queries";
import toast from "react-hot-toast";
import { useRef, useState } from "react";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

export default function VerifyResetPasswordForm() {
  const { state } = useLocation();
  const email: string = state?.email ?? "";
  const { mutateAsync: verifyResetPasswordOtp } = useVerifyResetPasswordOtp();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<VerifyResetPasswordType>({
    mode: "onChange",
    resolver: zodResolver(verifyResetPasswordSchema)
  });

  const length = 6;
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  async function onSubmit(values: VerifyResetPasswordType) {
    try {
      await verifyResetPasswordOtp(values);
      toast.success("OTP verified successfully.");
      navigate("/auth/reset-password", { replace: true, state: { email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    }
    reset();
    setOtp(Array(length).fill(""));
  }

  function handleChange(value: string, index: number) {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setValue("otp", newOtp.join(""));
    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").trim().slice(0, length);
    if (!/^\d+$/.test(pasted)) return;
    const newOtp = pasted.split("");
    setOtp([...newOtp, ...Array(length - newOtp.length).fill("")]);
    setValue("otp", pasted);
    newOtp.forEach((num, i) => {
      if (inputsRef.current[i]) inputsRef.current[i]!.value = num;
    });
    inputsRef.current[newOtp.length - 1]?.focus();
  }

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
            <div className="w-7.5 h-7.5 rounded-full text-[12px] text-white shrink-0 shadow-[0_0_0_4px] shadow-primary-glow font-bold bg-primary border-2 border-primary flex items-center justify-center">2</div>
            <span className="text-[11px] text-nowrap font-medium ml-2 text-base-muted">Verify</span>
            <Separator className="w-1/4! h-[1.5px]! mx-2 rounded-xl flex-1!" />
          </div>
          <div className="flex items-center flex-1">
            <div className="w-7.5 h-7.5 rounded-full text-[12px] shrink-0 text-base-muted font-bold bg-input-base border-2 border-border-strong flex items-center justify-center">3</div>
            <span className="text-[11px] text-nowrap font-medium ml-1 text-base-muted">Reset</span>
          </div>
        </div>
        <Separator />

        <div className="space-y-2">
          <CardTitle className="text-2xl font-extrabold font-display flex items-center gap-3">
            <div className="text-primary border border-primary/40 bg-[linear-gradient(135deg,rgba(139,92,246,0.18)_0%,rgba(236,72,153,0.12)_100%)] rounded-xl flex items-center justify-center w-14 h-14 shrink-0">
              <ShieldCheck size={28} />
            </div>
            <span>Enter reset code</span>
          </CardTitle>
          <CardDescription className="text-[13.5px]">We sent a 6-digit code to <span className="text-primary font-bold break-all">{email}.</span></CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="space-y-1.5">
              <div className="relative group">
                <Mail size={15} className={iconCls} />
                <Input
                  defaultValue={email}
                  {...register("email")}
                  readOnly
                  className={`${inputCls} opacity-70 cursor-not-allowed`}
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  aria-invalid={errors.email ? "true" : "false"}
                />
              </div>
              {errors.email && <div className={errCls}><OctagonAlert size={12} /><span>{errors.email?.message}</span></div>}
            </div>

            <div className="space-y-1.5">
              <input id="otp" type="hidden" {...register("otp")} />
              <Label className="text-[13px] font-semibold text-secondary-base" htmlFor="otp">Verification code</Label>
              <div className="flex gap-2 sm:gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Input
                    className="bg-input-base! focus:-translate-y-0.5 focus:bg-overlay! rounded-xl font-bold shadow-sm flex-1 min-w-0 h-12 sm:h-14 p-0! text-center caret-primary! text-lg border-input hover:border-primary/30"
                    key={index}
                    ref={(el) => { inputsRef.current[index] = el; }}
                    value={otp[index]}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    maxLength={1}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              {errors.otp && <div className={errCls}><OctagonAlert size={12} /><span>{errors.otp?.message}</span></div>}
            </div>

            <Field className="space-y-2">
              <Button disabled={isSubmitting} className="cursor-pointer shadow h-11 rounded-xl text-[14px]" type="submit">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isSubmitting && <><span>Verify Code</span><ArrowRight size={15} /></>}
              </Button>

              <FieldDescription className="text-center space-y-3 text-[13.5px]! mt-1">
                <div>
                  <span>Wrong email? </span>
                  <Link className="text-primary no-underline! hover:underline! transition duration-200 hover:text-primary-light! font-bold" to={"/auth/forget-password"}>
                    Change email →
                  </Link>
                </div>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}