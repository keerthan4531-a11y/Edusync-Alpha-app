"use client";

import { useState } from "react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

interface Alumni {
  id: string
  name: string
  role: string
  company: string
  year: string
  avatar: string
}

const ALUMNI_LIST: Alumni[] = [
  { id: "1", name: "Rohan Sharma", role: "Software Engineer-2", company: "Microsoft", year: "Class of 2022", avatar: "RS" },
  { id: "2", name: "Priya Nair", role: "Frontend Lead", company: "Google", year: "Class of 2021", avatar: "PN" },
  { id: "3", name: "Abhishek Patil", role: "SDE-1", company: "Amazon", year: "Class of 2023", avatar: "AP" },
  { id: "4", name: "Sneha Reddy", role: "Full-Stack Developer", company: "Razorpay", year: "Class of 2023", avatar: "SR" }
]

export function AlumniNetwork() {
  const [connectedList, setConnectedList] = useState<string[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const handleConnect = (alumniId: string, name: string) => {
    if (connectedList.includes(alumniId)) return
    setConnectedList([...connectedList, alumniId])
    setToastMessage(`Connection request sent to ${name}!`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-white shadow-2xl border border-emerald-400 flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <i className="fas fa-check-circle text-lg"></i>
          <span className="font-semibold text-[15px]">{toastMessage}</span>
        </div>
      )}

      <div>
        <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-2">
          <i className="fas fa-network-wired text-stage4 w-5 h-5"></i>
          Alumni Network
        </h2>
        <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">Connect with EduSync graduates currently working in leading tech companies.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {ALUMNI_LIST.map(alumni => {
          const isConnected = connectedList.includes(alumni.id)
          return (
            <LiquidGlassCard key={alumni.id} className="p-6 flex flex-col justify-between" accentColor="#8b5cf6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-lg shadow-sm">
                    {alumni.avatar}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-foreground leading-snug">{alumni.name}</h3>
                    <div className="text-[13px] text-purple-500 font-semibold">{alumni.role}</div>
                    <div className="text-[12px] text-zinc-500 dark:text-gray-500 mt-0.5">{alumni.company} • {alumni.year}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleConnect(alumni.id, alumni.name)}
                disabled={isConnected}
                className={`w-full font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${
                  isConnected
                    ? "bg-zinc-100 dark:bg-white/10 text-zinc-400 dark:text-gray-500 border border-black/5 dark:border-white/5 cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600 text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {isConnected ? (
                  <>
                    <i className="fas fa-check text-xs"></i> Request Sent
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus text-xs"></i> Connect
                  </>
                )}
              </button>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )
}
