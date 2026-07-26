"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  GraduationCap,
  Briefcase,
  Award,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

type Role = "STUDENT" | "FACULTY" | "HOD";

const ROLES: { id: Role; label: string; icon: any; email: string }[] = [
  { id: "STUDENT", label: "Student", icon: GraduationCap, email: "student@test.com" },
  { id: "FACULTY", label: "Faculty", icon: Briefcase, email: "faculty@test.com" },
  { id: "HOD", label: "HOD", icon: Award, email: "hod@test.com" },
];

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

  const [loginError, setLoginError] = useState<string | null>(
    searchParams.get("error") ? "Invalid credentials. Please try again." : null
  );

  const handleRoleSelect = (r: typeof ROLES[number]) => {
    setRole(r.id);
    setEmail(r.email);
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
      setLoginError("Invalid email or password.");
      setIsLoading(false);
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background text-foreground select-none font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Simple Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl neu-raised-sm flex items-center justify-center text-primary dark:text-indigo-400">
            <GraduationCap className="w-8 h-8" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              EduSync <span className="text-primary font-bold text-xs uppercase px-2 py-0.5 neu-raised-xs rounded-md ml-1">ALPHA</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Sign in to your learning account
            </p>
          </div>
        </div>

        {/* Simple Login Card */}
        <div className="neu-flat p-6 sm:p-7 rounded-[2rem] shadow-xl dark:bg-white/5 dark:border-white/10 space-y-6">
          {/* Simple Segmented Role Selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl neu-inset-sm">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md neu-button scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Simple Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-11 pl-10 pr-4 text-xs font-extrabold rounded-xl neu-inset-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all dark:bg-white/5"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase text-muted-foreground">Password</label>
                <button
                  type="button"
                  onClick={() => alert("Demo Password: hash")}
                  className="text-[11px] font-extrabold text-primary hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-11 pl-10 pr-10 text-xs font-extrabold rounded-xl neu-inset-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all dark:bg-white/5"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Primary CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 neu-button disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {role}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-2 text-[11px] font-extrabold text-muted-foreground">
            <span>Quick Fill:</span>
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleSelect(r)}
                className="px-2.5 py-1 rounded-lg neu-button hover:text-foreground transition-all"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Protected by EduSync Alpha Security System</span>
        </div>
      </div>
    </div>
  );
}
