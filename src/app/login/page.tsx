"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Loader2, ChevronDown, ChevronRight, Check, AlertCircle } from "lucide-react"

type Role = "STUDENT" | "FACULTY" | "HOD"

const ROLES: { id: Role; label: string }[] = [
  { id: "STUDENT", label: "Student" },
  { id: "FACULTY", label: "Faculty" },
  { id: "HOD",     label: "HOD"     },
]

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const searchParams                = useSearchParams()
  const [email, setEmail]           = useState("student@test.com")
  const [password, setPassword]     = useState("hash")   // matches seed data
  const [isLoading, setIsLoading]   = useState(false)
  const [role, setRole]             = useState<Role>("STUDENT")
  const [dropOpen, setDropOpen]     = useState(false)
  const [loginError, setLoginError] = useState<string | null>(
    searchParams.get("error") ? "Invalid email or password. Please try again." : null
  )
  const dropRef                     = useRef<HTMLDivElement>(null)

  const activeRole = ROLES.find((r) => r.id === role)!

  // Lock body scroll while login page is mounted
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleRoleSelect = (r: Role) => {
    setRole(r)
    setEmail(r.toLowerCase() + "@test.com")
    setDropOpen(false)
  }

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)
    setLoginError(null)

    let callbackUrl = "/student-dashboard"
    if (role === "FACULTY") callbackUrl = "/faculty-dashboard"
    if (role === "HOD")     callbackUrl = "/hod-dashboard"

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,   // handle redirect manually so we can catch errors
    })

    if (result?.error) {
      setLoginError("Invalid email or password. Please try again.")
      setIsLoading(false)
      return
    }

    // Success — navigate to dashboard
    if (result?.url) {
      window.location.href = result.url
    }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .lp-root {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          background: #111424;
          font-family: var(--font-poppins), 'Poppins', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
        }

        /* Ambient geometric background shapes */
        .lp-ambient-1 {
          position: fixed;
          top: -10%;
          left: -10%;
          width: 70%;
          height: 80%;
          background: #1b1e36;
          clip-path: polygon(0 0, 100% 0, 30% 100%, 0 100%);
          pointer-events: none;
          z-index: 0;
        }
        .lp-ambient-2 {
          position: fixed;
          bottom: 0;
          right: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, transparent 40%, rgba(30, 35, 60, 0.4) 40%, #15182e 100%);
          pointer-events: none;
          z-index: 0;
        }
        .lp-ambient-3 {
          position: fixed;
          bottom: -5%;
          right: -5%;
          width: 45%;
          height: 45%;
          background: linear-gradient(135deg, #ea580c, #c2410c);
          clip-path: polygon(100% 25%, 100% 100%, 15% 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* Content wrapper — centered, never scrolls */
        .lp-scroll {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 32px 24px 80px;
        }

        /* ── Brand ── */
        .lp-brand {
          margin-bottom: 28px;
        }
        .lp-logo-mark {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
        }
        .lp-title {
          font-size: 25px;
          font-weight: 700;
          color: #f4f4f5;
          letter-spacing: -0.3px;
          line-height: 1.2;
          margin-bottom: 5px;
        }
        .lp-subtitle {
          font-size: 13.5px;
          font-weight: 400;
          color: #52525b;
          line-height: 1.5;
        }

        /* ── Glass card (matches topbar/sidebar style) ── */
        .lp-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 26px 22px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        /* Subtle top sheen on card */
        .lp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 16%; right: 16%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          border-radius: 1px;
          pointer-events: none;
        }

        /* ── Field label ── */
        .lp-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #71717a;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        /* ── Dropdown trigger ── */
        .lp-dropdown-wrap {
          position: relative;
        }
        .lp-dropdown-trigger {
          width: 100%;
          height: 50px;
          padding: 0 14px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #e4e4e7;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          transition: border-color 0.18s, background 0.18s;
          outline: none;
        }
        .lp-dropdown-trigger:hover {
          border-color: rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.04);
        }
        .lp-dropdown-trigger.open {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
          background: rgba(99,102,241,0.06);
        }
        /* ── Dropdown menu ── */
        .lp-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          background: rgba(13, 17, 26, 0.95);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 100;
          padding: 4px;
          animation: lpDropIn 0.15s ease-out;
        }
        @keyframes lpDropIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .lp-dropdown-item {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-family: inherit;
          transition: background 0.15s, color 0.15s;
        }
        .lp-dropdown-item:hover {
          background: rgba(255,255,255,0.06);
        }
        .lp-dropdown-item.selected {
          background: rgba(99,102,241,0.08);
        }
        .lp-item-label {
          font-size: 13.5px;
          font-weight: 500;
          color: #e4e4e7;
          transition: color 0.15s;
        }
        .lp-dropdown-item:hover .lp-item-label {
          color: #ffffff;
        }
        .lp-dropdown-item.selected .lp-item-label {
          color: #6366f1;
          font-weight: 600;
        }

        /* ── Input field ── */
        .lp-input-wrap {
          position: relative;
        }
        .lp-input {
          width: 100%;
          height: 50px;
          padding: 0 14px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #f4f4f5;
          font-size: 14px;
          font-weight: 400;
          font-family: inherit;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .lp-input::placeholder { color: #3f3f46; }
        .lp-input:focus {
          border-color: #6366f1;
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }

        /* ── Field header row ── */
        .lp-field-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }
        .lp-forgot {
          font-size: 11.5px;
          font-weight: 500;
          color: #6366f1;
          background: none;
          border: none;
          font-family: inherit;
          cursor: pointer;
          transition: color 0.15s;
          padding: 0;
        }
        .lp-forgot:hover { color: #818cf8; }

        /* ── Submit button (matches app primary) ── */
        .lp-btn {
          width: 100%;
          height: 50px;
          border: none;
          border-radius: 12px;
          background: #6366f1;
          color: #fff;
          font-size: 14.5px;
          font-weight: 600;
          font-family: inherit;
          letter-spacing: 0.1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
          box-shadow: 0 4px 16px rgba(99,102,241,0.25);
          margin-top: 2px;
        }
        .lp-btn:hover:not(:disabled) {
          background: #5254cc;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(99,102,241,0.35);
        }
        .lp-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(99,102,241,0.2);
        }
        .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Footer pinned to bottom ── */
        .lp-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px 24px 20px;
          text-align: center;
          background: linear-gradient(to top, #080A10 60%, transparent);
          pointer-events: none;
        }
        .lp-footer p {
          font-size: 11px;
          color: #3f3f46;
          line-height: 1.7;
          pointer-events: auto;
        }
        .lp-footer span {
          color: #52525b;
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
          transition: color 0.15s;
        }
        .lp-footer span:hover { color: #71717a; }

        /* Spinner */
        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-spin { animation: lp-spin 0.75s linear infinite; }

        /* Fade in */
        @keyframes lp-fadein {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-scroll { animation: lp-fadein 0.45s ease both; }
      `}</style>

      <div className="lp-root">
        <div className="lp-ambient-1" />
        <div className="lp-ambient-2" />
        <div className="lp-ambient-3" />

        <div className="lp-scroll">

          {/* Brand */}
          <div className="lp-brand">
            <div className="lp-logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12.5v4.5c2 2 8 2 12 0v-4.5"/>
              </svg>
            </div>
            <h1 className="lp-title">EduSync</h1>
            <p className="lp-subtitle">Sign in to continue your learning</p>
          </div>

          {/* Form card */}
          <form onSubmit={handleLogin} style={{ margin: 0 }}>
          <div className="lp-card" style={{ position: "relative" }}>

            {/* Role dropdown */}
            <div>
              <label className="lp-label">Role</label>
              <div className="lp-dropdown-wrap" ref={dropRef}>
                <button
                  type="button"
                  className={`lp-dropdown-trigger${dropOpen ? " open" : ""}`}
                  onClick={() => setDropOpen((p) => !p)}
                >
                  <span>{activeRole.label}</span>
                  <ChevronDown
                    size={16}
                    color="#71717a"
                    style={{ transition: "transform 0.2s", transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                {dropOpen && (
                  <div className="lp-dropdown-menu">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={`lp-dropdown-item${role === r.id ? " selected" : ""}`}
                        onClick={() => handleRoleSelect(r.id)}
                      >
                        <span className="lp-item-label">{r.label}</span>
                        {role === r.id && (
                          <Check size={16} color="#6366f1" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="lp-label">Email</label>
              <div className="lp-input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="lp-input"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="lp-field-row">
                <label className="lp-label" style={{ marginBottom: 0 }}>Password</label>
                <button type="button" className="lp-forgot">Forgot password?</button>
              </div>
              <div className="lp-input-wrap">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="lp-input"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error message */}
            {loginError && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "10px", padding: "10px 13px",
              }}>
                <AlertCircle size={15} color="#f87171" strokeWidth={2} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "12.5px", color: "#f87171", fontWeight: 500 }}>{loginError}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="lp-btn" disabled={isLoading}>
              {isLoading
                ? <Loader2 size={18} className="lp-spin" />
                : <>Sign in <ChevronRight size={16} strokeWidth={2.5} /></>
              }
            </button>

          </div>
          </form>

        </div>
      </div>

      {/* Footer — pinned to bottom */}
      <div className="lp-footer">
        <p>
          By continuing, you agree to our{" "}
          <span>Terms of Service</span>
          {" "}and{" "}
          <span>Privacy Policy</span>
        </p>
      </div>
    </>
  )
}
