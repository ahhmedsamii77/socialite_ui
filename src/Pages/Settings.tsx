import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Palette, Shield, ChevronRight,
  Eye, EyeOff, Moon, Sun, LogOut,
  Check, AlertTriangle, Mail, AtSign, KeyRound, Sliders,
  Loader2, EyeOff as EyeOffIcon, MapPin, Phone,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import {
  useGetUserData,
  useUpdateProfile,
  useUpdatePassword,
  useLogout,
  useFreezeAccount,
} from "@/lib/apis/queries";
import { useAuthStore } from "@/lib/store/auth";
import { socket } from "@/lib/socket";
import useClearQueries from "@/hooks/useClearQueries";
import toast from "react-hot-toast";

function Section({
  icon: Icon,
  title,
  children,
  danger = false,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all ${
        danger ? "border-destructive/20" : "border-input"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-4 border-b ${
          danger ? "border-destructive/20 bg-destructive/5" : "border-input"
        }`}
      >
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-xl ${
            danger
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon size={16} />
        </span>
        <h3 className="text-[14.5px] font-bold text-foreground">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-0">{children}</div>
    </div>
  );
}

// ─── SettingsRow ─────────────────────────────────────────────────────────────

function SettingsRow({
  label,
  sublabel,
  children,
  divider = true,
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[13.5px] font-medium text-foreground">{label}</span>
          {sublabel && (
            <span className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">
              {sublabel}
            </span>
          )}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
      {divider && <div className="h-px bg-input" />}
    </>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide">
        {Icon && <Icon size={11} />}
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

function SettingsInput({
  prefix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { prefix?: string }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px]">
          {prefix}
        </span>
      )}
      <input
        {...props}
        className={`w-full h-9 rounded-lg border border-input bg-background text-[13px] text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 ${
          prefix ? "pl-7 pr-3" : "px-3"
        } ${props.className ?? ""}`}
      />
    </div>
  );
}

// ─── Nav items ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "account",       icon: User,    label: "Account" },
  { id: "appearance",   icon: Palette,  label: "Appearance" },
  { id: "security",     icon: Shield,   label: "Security", danger: true },
] as any;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Settings() {
  const { data: user, isLoading } = useGetUserData();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const clearQueries = useClearQueries();
  const { clearAuth } = useAuthStore();

  const { mutateAsync: updateProfile, isPending: isSavingProfile } = useUpdateProfile();
  const { mutateAsync: updatePassword, isPending: isSavingPassword } = useUpdatePassword();
  const { mutateAsync: doLogout, isPending: isLoggingOut } = useLogout();
  const { mutateAsync: freezeAccount, isPending: isFreezingAccount } = useFreezeAccount();

  const [profileForm, setProfileForm] = useState({
    fName: "",
    lName: "",
    username: "",
    phone: "",
    address: "",
    email: "",
  });
  const [profileInit, setProfileInit] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwSaved] = useState(false);




  // Seed form from user once loaded
  if (user && !profileInit) {
    setProfileForm({
      fName: user.fName ?? "",
      lName: user.lName ?? "",
      username: user.username ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      email: user.email ?? "",
    });
    setProfileInit(true);
  }

  // ── Handlers ── 

  const handleSaveProfile = async () => {
    try {
      const changedFields: Partial<typeof profileForm> = {};
      let hasChanges = false;
      
      if (user) {
        if (profileForm.fName !== (user.fName ?? "")) { changedFields.fName = profileForm.fName; hasChanges = true; }
        if (profileForm.lName !== (user.lName ?? "")) { changedFields.lName = profileForm.lName; hasChanges = true; }
        if (profileForm.username !== (user.username ?? "")) { changedFields.username = profileForm.username; hasChanges = true; }
        if (profileForm.phone !== (user.phone ?? "")) { changedFields.phone = profileForm.phone; hasChanges = true; }
        if (profileForm.address !== (user.address ?? "")) { changedFields.address = profileForm.address; hasChanges = true; }
        if (profileForm.email !== (user.email ?? "")) { changedFields.email = profileForm.email; hasChanges = true; }
      }

      if (!hasChanges) {
        toast("No changes to save.", { icon: "ℹ️" });
        return;
      }

      await updateProfile(changedFields);

      if (changedFields.email) {
        toast.success("Email updated! Please confirm your new email.");
        localStorage.setItem("pendingConfirmEmail", changedFields.email);
        clearAuth();
        useAuthStore.persist.clearStorage();
        clearQueries();
        socket.disconnect();
        window.location.href = "/auth/confirm-email";
        return;
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      toast.success("Profile updated!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update profile.");
    }
  };

  const handleSavePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmNewPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    try {
      await updatePassword(pwForm);
      toast.success("Password updated! Please log in again.");
      clearAuth();
      useAuthStore.persist.clearStorage();
      clearQueries();
      socket.disconnect();
      window.location.href = "/auth/login";
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Incorrect current password.");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await doLogout("all");         
      clearAuth();
      useAuthStore.persist.clearStorage();
      clearQueries();
      socket.disconnect();
      toast.success("Signed out from all devices.");
      navigate("/auth/login", { replace: true });
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to sign out.");
    }
  };

  const handleDeactivate = async () => {
    try {
      await freezeAccount();
      clearAuth();
      useAuthStore.persist.clearStorage();
      clearQueries();
      socket.disconnect();
      toast.success("Account deactivated.");
      navigate("/auth/login", { replace: true });
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to deactivate.");
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero */}
      <div className="flex items-center gap-4 px-4 sm:px-6 py-6 border-b border-input">
        <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
          <Sliders size={22} className="text-primary" />
        </span>
        <div>
          <h1 className="text-[20px] font-bold text-foreground">Settings</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Manage your account, privacy, and preferences
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">

        {/* ── Side nav ── */}
        <nav className="lg:w-52 shrink-0">
          <div className="flex flex-wrap lg:flex-col gap-1.5 lg:gap-1 lg:sticky lg:top-20">
            {NAV_ITEMS.map(({ id, icon: Icon, label, danger }: any) => (
              <a
                key={id}
                href={`#settings-${id}`}
                className={`flex items-center justify-center lg:justify-start gap-2 px-4 lg:px-3 py-2.5 lg:py-2.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all group flex-1 lg:flex-none
                  ${danger
                    ? "text-destructive/80 hover:bg-destructive/8 hover:text-destructive bg-destructive/5 lg:bg-transparent"
                    : "text-muted-foreground hover:bg-primary/8 hover:text-primary bg-muted/40 lg:bg-transparent"
                  }`}
              >
                <Icon size={15} />
                <span>{label}</span>
                <ChevronRight size={13} className="ml-auto opacity-30 group-hover:opacity-80 hidden lg:block transition-opacity" />
              </a>
            ))}
          </div>
        </nav>

        {/* ── Content ── */}
        <div className="flex-1 space-y-6">

          {/* ── Account ── */}
          <div id="settings-account">
            <Section icon={User} title="Account">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Profile fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name" icon={User}>
                      <SettingsInput
                        value={profileForm.fName}
                        onChange={e => setProfileForm(f => ({ ...f, fName: e.target.value }))}
                        placeholder="First name"
                      />
                    </Field>
                    <Field label="Last Name" icon={User}>
                      <SettingsInput
                        value={profileForm.lName}
                        onChange={e => setProfileForm(f => ({ ...f, lName: e.target.value }))}
                        placeholder="Last name"
                      />
                    </Field>
                    <Field label="Username" icon={AtSign}>
                      <SettingsInput
                        prefix="@"
                        value={profileForm.username}
                        onChange={e => setProfileForm(f => ({ ...f, username: e.target.value }))}
                        placeholder="username"
                      />
                    </Field>
                    <Field label="Phone" icon={Phone}>
                      <SettingsInput
                        value={profileForm.phone}
                        onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+1 234 567 8900"
                        type="tel"
                      />
                    </Field>
                    <Field label="Address" icon={MapPin}>
                      <SettingsInput
                        value={profileForm.address}
                        onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                        placeholder="City, Country"
                        className="sm:col-span-2"
                      />
                    </Field>
                    <Field label="Email" icon={Mail}>
                      <SettingsInput
                        value={profileForm.email}
                        onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </Field>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="inline-flex items-center gap-2 h-9 px-5 rounded-full text-[13px] font-semibold bg-linear-to-r from-primary to-accent text-white shadow-[0_2px_14px_hsl(var(--primary)/.3)] hover:shadow-[0_4px_20px_hsl(var(--primary)/.45)] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                  >
                    {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : profileSaved ? <Check size={14} /> : null}
                    {profileSaved ? "Saved!" : "Save Profile"}
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-input" />

                  {/* Password */}
                  {(!user?.provider || user.provider.toLowerCase() === "system") ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <KeyRound size={14} className="text-primary" />
                        <span className="text-[13px] font-semibold text-foreground">Change Password</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Current Password">
                          <div className="relative">
                            <SettingsInput
                              type={showPw ? "text" : "password"}
                              value={pwForm.currentPassword}
                              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                              placeholder="••••••••"
                            />
                            <button
                              onClick={() => setShowPw(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </Field>
                        <Field label="New Password">
                          <div className="relative">
                            <SettingsInput
                              type={showPw ? "text" : "password"}
                              value={pwForm.newPassword}
                              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                              placeholder="Min 8 characters"
                              className="pr-8"
                            />
                            <button
                              onClick={() => setShowPw(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </Field>
                        <Field label="Confirm Password">
                          <div className="relative">
                            <SettingsInput
                              type={showPw ? "text" : "password"}
                              value={pwForm.confirmNewPassword}
                              onChange={e => setPwForm(f => ({ ...f, confirmNewPassword: e.target.value }))}
                              placeholder="Min 8 characters"
                              className="pr-8"
                            />
                            <button
                              onClick={() => setShowPw(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </Field>
                      </div>
                      <button
                        onClick={handleSavePassword}
                        disabled={isSavingPassword}
                        className="mt-4 inline-flex items-center gap-2 h-9 px-5 rounded-full text-[13px] font-semibold border border-primary/30 text-primary bg-primary/8 hover:bg-primary/15 transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                      >
                        {isSavingPassword ? <Loader2 size={14} className="animate-spin" /> : pwSaved ? <Check size={14} /> : <KeyRound size={14} />}
                        {pwSaved ? "Password Updated!" : "Update Password"}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <KeyRound size={14} className="text-primary" />
                        <span className="text-[13px] font-semibold text-foreground">Password</span>
                      </div>
                      <div className="p-4 rounded-xl border border-input bg-muted/30 text-[12.5px] text-muted-foreground flex items-center gap-3">
                        <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                        <p>
                          Your account is linked with <span className="font-semibold text-foreground capitalize">{user.provider}</span>. 
                          You cannot change your password here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Section>
          </div>


          {/* ── Appearance ── */}
          <div id="settings-appearance">
            <Section icon={Palette} title="Appearance">
              <SettingsRow label="Theme" sublabel="Choose your preferred colour scheme" divider={false}>
                <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-input">
                  {([
                    { val: "light" as const, icon: Sun,  label: "Light" },
                    { val: "dark" as const,  icon: Moon, label: "Dark" },
                  ]).map(({ val, icon: Icon, label }) => (
                    <button
                      key={val}
                      onClick={() => setTheme(val)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all cursor-pointer ${
                        theme === val
                          ? "bg-card shadow-sm border border-input text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
              </SettingsRow>
            </Section>
          </div>

          {/* ── Security ── */}
          <div id="settings-security">
            <Section icon={Shield} title="Security & Account Actions" danger>
              <SettingsRow
                label="Sign out from all devices"
                sublabel="Revokes all active sessions including this one"
              >
                <button
                  onClick={handleLogoutAll}
                  disabled={isLoggingOut}
                  className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-[12.5px] font-semibold border border-destructive/30 text-destructive bg-destructive/8 hover:bg-destructive/15 transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                >
                  {isLoggingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                  Sign Out All
                </button>
              </SettingsRow>

              <SettingsRow
                label="Deactivate Account"
                sublabel="Temporarily hide your profile from others"
                divider={false}
              >
                <button
                  onClick={handleDeactivate}
                  disabled={isFreezingAccount}
                  className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-[12.5px] font-semibold border border-input text-muted-foreground hover:border-destructive/30 hover:text-destructive hover:bg-destructive/8 transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                >
                  {isFreezingAccount ? <Loader2 size={13} className="animate-spin" /> : <EyeOffIcon size={13} />}
                  Deactivate
                </button>
              </SettingsRow>
            </Section>
          </div>

        </div>
      </div>
    </div>
  );
}
