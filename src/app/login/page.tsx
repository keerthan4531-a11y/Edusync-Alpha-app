"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { 
  Loader2, 
  ChevronRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  GraduationCap,
  Briefcase,
  Award,
  ArrowRight,
  Zap,
  CheckCircle2
} from "lucide-react";

type Role = "STUDENT" | "FACULTY" | "HOD";

interface RoleOption {
  id: Role;
  label: string;
  icon: any;
  tagline: string;
  defaultEmail: string;
}

const ROLES: RoleOption[] = [
  { 
    id: "STUDENT", 
    label: "Student", 
    icon: GraduationCap, 
    tagline: "Learn & Track Progress",
    defaultEmail: "student@test.com" 
  },
  { 
    id: "FACULTY", 
    label: "Faculty", 
    icon: Briefcase, 
    tagline: "Teach & Evaluate Roster",
    defaultEmail: "faculty@test.com" 
  },
  { 
    id: "HOD", 
    label: "HOD", 
    icon: Award, 
    tagline: "Analytics & Governance",
    defaultEmail: "hod@test.com" 
  },
];

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>("STUDENT");
  const [email, setEmail] = useState("student@test.com");
  const [password, setPassword] = useState("hash");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(
    searchParams.get("error") ? "Invalid email or password. Please check your credentials." : null
  );

  const activeRole = ROLES.find((r) => r.id === role)!;

  const handleRoleSelect = (r: RoleOption) => {
    setRole(r.id);
    setEmail(r.defaultEmail);
    setLoginError(null);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    let callbackUrl = "/student-dashboard";
    if (role === "FACULTY") callbackUrl = "/faculty-dashboard";
    if (role === "HOD") callbackUrl = "/hod-dashboard";

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setLoginError("Invalid email or password. Please verify credentials.");
      setIsLoading(false);
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 bg-background text-foreground relative overflow-hidden select-none font-sans">
      {/* Dynamic Animated Mesh & Soft Floating Blob Shapes for Depth */}
      <div className="absolute top-[-15%] left-[-15%] w-[65vw] h-[65vw] max-w-[700px] max-h-[700px] bg-gradient-to-br from-[#6366F1]/30 via-[#4F46E5]/25 to-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[7000ms]" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[65vw] h-[65vw] max-w-[700px] max-h-[700px] bg-gradient-to-tl from-[#4F46E5]/30 via-[#6366F1]/25 to-pink-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[9000ms]" />
      <div className="absolute top-[30%] right-[10%] w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 relative z-10 my-auto">
        {/* Header Section: Prominent Logo Mark & Custom Typography */}
        <div className="flex flex-col items-center text-center space-y-3.5">
          {/* Prominent Graduation Cap Icon with Subtle Glow/Shadow */}
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] bg-gradient-to-br from-[#6366F1] via-indigo-500 to-[#4F46E5] flex items-center justify-center shadow-[0_0_45px_rgba(99,102,241,0.6)] group-hover:scale-110 transition-all duration-300 ring-4 ring-indigo-500/30">
              <GraduationCap className="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-lg" strokeWidth={2.2} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border-2 border-background flex items-center gap-1.5 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Typography: Bold EduSync with Gradient Text on "Sync" */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2.5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
                Edu<span className="bg-gradient-to-r from-[#6366F1] via-purple-500 to-indigo-500 bg-clip-text text-transparent">Sync</span>
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest uppercase rounded-xl bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300 border border-indigo-500/30 neu-raised-xs">
                ALPHA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold max-w-sm">
              AI-Powered Educational Platform built for Gen-Z learners.
            </p>
          </div>
        </div>

        {/* Elevated Glassmorphic Card Container */}
        <div className="neu-flat p-6 sm:p-9 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl border border-black/5 dark:border-white/10 space-y-7 dark:bg-slate-900/85">
          
          {/* Role Selector Cards (Student / Faculty / HOD) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Select Your Portal Role</span>
              </label>
              <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                {activeRole.label} Selected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all duration-300 text-left ${
                      isSelected
                        ? "bg-gradient-to-br from-[#6366F1] via-indigo-500 to-[#4F46E5] text-white shadow-[0_12px_30px_rgba(99,102,241,0.4)] scale-[1.03] ring-2 ring-indigo-400/60"
                        : "neu-flat hover:scale-[1.01] hover:border-indigo-500/30 text-muted-foreground hover:text-foreground dark:bg-white/5"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${
                      isSelected 
                        ? "bg-white/20 text-white shadow-inner" 
                        : "neu-raised-xs text-indigo-600 dark:text-indigo-400"
                    }`}>
                      <Icon className="w-5 h-5" strokeWidth={2.2} />
                    </div>

                    <div className="text-center space-y-0.5 w-full">
                      <span className={`text-xs sm:text-sm font-black block tracking-tight ${isSelected ? "text-white" : "text-foreground"}`}>
                        {r.label}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] font-medium block leading-tight line-clamp-2 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                        {r.tagline}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-white shadow-md flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-indigo-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields with Floating Label Style */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="relative">
              <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                isEmailFocused 
                  ? "border-indigo-500 ring-4 ring-indigo-500/15 bg-background shadow-md" 
                  : "border-black/10 dark:border-white/10 neu-inset-sm bg-transparent"
              }`}>
                <Mail className={`w-5 h-5 absolute left-3.5 transition-colors ${isEmailFocused ? "text-indigo-500" : "text-muted-foreground"}`} />
                
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  className="w-full h-13 pl-11 pr-4 text-sm font-bold bg-transparent text-foreground focus:outline-none rounded-2xl pt-2 pb-1"
                  required
                />

                {/* Floating Label */}
                <label className={`absolute left-11 pointer-events-none transition-all duration-200 font-extrabold ${
                  isEmailFocused || email.length > 0
                    ? "text-[10px] top-1.5 text-indigo-600 dark:text-indigo-400 tracking-wider uppercase"
                    : "text-xs top-4 text-muted-foreground font-medium"
                }`}>
                  Email Address
                </label>
              </div>
            </div>

            {/* Password Field */}
            <div className="relative space-y-1">
              <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                isPasswordFocused 
                  ? "border-indigo-500 ring-4 ring-indigo-500/15 bg-background shadow-md" 
                  : "border-black/10 dark:border-white/10 neu-inset-sm bg-transparent"
              }`}>
                <Lock className={`w-5 h-5 absolute left-3.5 transition-colors ${isPasswordFocused ? "text-indigo-500" : "text-muted-foreground"}`} />
                
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="w-full h-13 pl-11 pr-12 text-sm font-bold bg-transparent text-foreground focus:outline-none rounded-2xl pt-2 pb-1"
                  required
                />

                {/* Floating Label */}
                <label className={`absolute left-11 pointer-events-none transition-all duration-200 font-extrabold ${
                  isPasswordFocused || password.length > 0
                    ? "text-[10px] top-1.5 text-indigo-600 dark:text-indigo-400 tracking-wider uppercase"
                    : "text-xs top-4 text-muted-foreground font-medium"
                }`}>
                  Password
                </label>

                {/* Show/Hide Password Eye Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1.5 text-muted-foreground hover:text-foreground transition-colors neu-button rounded-xl"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={() => alert("Demo Password: Use 'hash' or click any Quick Fill pill below!")}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Error Notification Banner */}
            {loginError && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* CTA Button: High-Contrast Purple-to-Indigo Gradient with Sliding Arrow Animation */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full h-13 rounded-2xl bg-gradient-to-r from-[#6366F1] via-indigo-500 to-[#4F46E5] hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-sm tracking-wide shadow-[0_10px_35px_rgba(99,102,241,0.5)] hover:shadow-[0_14px_45px_rgba(99,102,241,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none neu-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {activeRole.label}</span>
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Test Credentials Pills */}
          <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Instant Test Credentials</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold neu-button transition-all text-center truncate ${
                    role === r.id
                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-extrabold border border-indigo-500/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ⚡ {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Bottom Security Seal */}
        <div className="flex items-center justify-center gap-2 text-center p-3 rounded-2xl neu-raised-xs max-w-xs mx-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[11px] font-extrabold text-muted-foreground">
            256-Bit Encrypted Quantum Auth
          </span>
        </div>
      </div>
    </div>
  );
}
