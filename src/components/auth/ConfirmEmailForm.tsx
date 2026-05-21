import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Mail, OctagonAlert, Zap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { confirmEmailSchema } from "./schema";
import type { ConfirmEmailType } from "@/types";
import { useConfirmEmail, useResendEmailOtp } from "@/lib/apis/queries";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";

export default function ConfirmEmailForm() {
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email ?? "");

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pendingConfirmEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
      localStorage.removeItem("pendingConfirmEmail");
    }
  }, []);

  const { mutateAsync: confirmEmail } = useConfirmEmail();
  const { mutateAsync: resendEmailOtp, isPending: isResendingOtp } = useResendEmailOtp();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, getValues } = useForm<ConfirmEmailType>({
    mode: "onChange",
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: {
      email: email,
    }
  });

  useEffect(() => {
    if (email) {
      setValue("email", email);
    }
  }, [email, setValue]);

  const length = 6;
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  async function handleResendEmailOtp() {
    const currentEmail = getValues("email");
    if (!currentEmail) {
      toast.error("Please enter your email first.");
      return;
    }
    try {
      await resendEmailOtp({ email: currentEmail });
      toast.success("OTP sent successfully. Check your email.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  async function onSubmit(values: ConfirmEmailType) {
    try {
      await confirmEmail(values);
      toast.success("Email confirmed successfully.");
      navigate("/auth/login", { replace: true });
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
        <div className="space-y-2">
          <CardTitle className="text-2xl font-extrabold font-display flex items-center gap-3">
            <div className="text-primary border border-primary/40 bg-[linear-gradient(135deg,rgba(139,92,246,0.18)_0%,rgba(236,72,153,0.12)_100%)] rounded-xl flex items-center justify-center w-14 h-14 shrink-0">
              <Mail size={28} />
            </div>
            <span>Confirm your email</span>
          </CardTitle>
          <CardDescription className="text-[13.5px]">Enter your email address and the 6-digit code we sent you.</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="space-y-1.5">
              <div className="relative group">
                <Mail size={15} className={iconCls} />
                <Input
                  {...register("email")}
                  className={inputCls}
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  readOnly={!!email}
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
                {!isSubmitting && <><span>Confirm Email</span><ArrowRight size={15} /></>}
              </Button>

              <FieldDescription className="text-center space-y-3 text-[13.5px]! mt-1">
                <div>
                  <span>Didn't receive the code? </span>
                  <button
                    disabled={isResendingOtp}
                    type="button"
                    onClick={handleResendEmailOtp}
                    className="text-primary no-underline! hover:underline! cursor-pointer transition duration-200 hover:text-primary-light! font-bold"
                  >
                    Resend code
                  </button>
                </div>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}