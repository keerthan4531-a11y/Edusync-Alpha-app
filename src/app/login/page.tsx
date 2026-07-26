"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { 
  Loader2, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  UserCheck, 
  ShieldCheck, 
  Sparkles,
  GraduationCap,
  Briefcase,
  Award
} from "lucide-react";

type Role = "STUDENT" | "FACULTY" | "HOD";

const ROLES: { id: Role; label: string; icon: any; desc: string }[] = [
  { id: "STUDENT", label: "Student", icon: GraduationCap, desc: "Interactive Learning & Stage Roadmap" },
  { id: "FACULTY", label: "Faculty", icon: Briefcase, desc: "Classroom & Student Verification" },
  { id: "HOD", label: "HOD", icon: Award, desc: "Department Analytics & Approvals" },
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
  const [email, setEmail] = useState("student@test.com");
  const [password, setPassword] = useState("hash");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<Role>("STUDENT");
  const [loginError, setLoginError] = useState<string | null>(
    searchParams.get("error") ? "Invalid email or password. Please try again." : null
  );

  const activeRole = ROLES.find((r) => r.id === role)!;

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setEmail(r.toLowerCase() + "@test.com");
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background text-foreground relative overflow-hidden select-none">
      {/* Soft Ambient Background Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <BrandLogo showBadge={true} href="/" className="scale-110" />
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm font-medium">
            Welcome back! Sign in to access your personalized AI-driven learning portal.
          </p>
        </div>

        {/* Main Neumorphic Card */}
        <LiquidGlassCard className="p-6 sm:p-8 shadow-2xl space-y-6" accentColor="#6366f1">
          {/* Role Switcher Pills */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block">
              Select Portal Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 neu-inset-sm rounded-2xl dark:bg-white/5">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isActive = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 gap-1 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md neu-button scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground text-center font-medium pt-1">
              {activeRole.desc}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full h-11 pl-10 pr-4 text-sm font-medium rounded-xl neu-inset-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all dark:bg-white/5 dark:border dark:border-white/10"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Demo Account: Use 'hash' as password or select a role pill above.")}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 text-sm font-medium rounded-xl neu-inset-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all dark:bg-white/5 dark:border dark:border-white/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl neu-button bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {activeRole.label} Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Pills */}
          <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block text-center">
              Quick Test Credentials
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleRoleSelect("STUDENT")}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold neu-raised-xs text-muted-foreground hover:text-foreground hover:scale-105 transition-all"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("FACULTY")}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold neu-raised-xs text-muted-foreground hover:text-foreground hover:scale-105 transition-all"
              >
                Faculty Demo
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("HOD")}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold neu-raised-xs text-muted-foreground hover:text-foreground hover:scale-105 transition-all"
              >
                HOD Demo
              </button>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Footer info */}
        <div className="text-center space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Protected by EduSync Alpha Security System
          </p>
          <p className="text-[10px] text-muted-foreground/70">
            © 2026 EduSync Alpha. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
