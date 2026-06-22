"use client"

import { useState, useEffect } from "react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Button } from "@/components/ui/button"
import { 
  Users, UserPlus, Sun, Calendar, Shield, UserCheck, ShieldAlert,
  ArrowRight, Plus, HelpCircle, Check, X, Megaphone, CalendarRange, Clock, Lock, Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newCommName, setNewCommName] = useState("")
  const [newCommDesc, setNewCommDesc] = useState("")
  const [newCommPrivacy, setNewCommPrivacy] = useState("public")

  // Current tab under WhatsApp Community Workflow
  const [waActiveTab, setWaActiveTab] = useState<"onboarding" | "daily-ops" | "weekly-calendar" | "event-planning" | "moderation" | "team-roles">("onboarding")

  // Main Page Tabs: "my-communities" vs "whatsapp-workflow"
  const [mainTab, setMainTab] = useState<"my-communities" | "whatsapp-workflow">("my-communities")

  // Load communities from localStorage
  const loadCommunities = () => {
    const stored = localStorage.getItem("faculty_communities")
    if (stored) {
      setCommunities(JSON.parse(stored))
    } else {
      const defaultComms = [
        { id: "1", name: "NOW Community Announcements", desc: "Official community notices", privacy: "restricted", membersCount: 142 },
        { id: "2", name: "#introductions-group", desc: "Say hi and meet peers!", privacy: "public", membersCount: 96 },
        { id: "3", name: "Coding & Projects Discussion", desc: "Solve challenges together", privacy: "public", membersCount: 110 },
      ]
      setCommunities(defaultComms)
      localStorage.setItem("faculty_communities", JSON.stringify(defaultComms))
    }
  }

  useEffect(() => {
    loadCommunities()
  }, [])

  // Create community
  const handleCreateCommunity = () => {
    if (!newCommName.trim()) return
    const newComm = {
      id: Date.now().toString(),
      name: newCommName,
      desc: newCommDesc,
      privacy: newCommPrivacy,
      membersCount: 1,
    }
    const updated = [newComm, ...communities]
    setCommunities(updated)
    localStorage.setItem("faculty_communities", JSON.stringify(updated))
    setNewCommName("")
    setNewCommDesc("")
    setIsCreateModalOpen(false)
  }

  // Delete community
  const handleDeleteCommunity = (id: string) => {
    if (!confirm("Are you sure you want to delete this community?")) return
    const updated = communities.filter((c) => c.id !== id)
    setCommunities(updated)
    localStorage.setItem("faculty_communities", JSON.stringify(updated))
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[var(--glass-border-subtle)] pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Communities & Workflows
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Coordinate student channels, announcements, and follow operational WhatsApp community workflows.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex gap-1.5 bg-slate-950/20 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setMainTab("my-communities")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all",
              mainTab === "my-communities"
                ? "bg-emerald-500 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            My Communities
          </button>
          <button
            onClick={() => setMainTab("whatsapp-workflow")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all",
              mainTab === "whatsapp-workflow"
                ? "bg-emerald-500 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            WhatsApp Workflow
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          MAIN TAB 1: MY COMMUNITIES
          ──────────────────────────────────────────────────────── */}
      {mainTab === "my-communities" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Interactive Groups</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Active discussions and peer mentoring rooms.</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg cursor-pointer border border-emerald-400/20 hover:scale-[1.02] transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Create Community</span>
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((c) => (
              <LiquidGlassCard key={c.id} className="p-5 flex flex-col justify-between min-h-[160px]" accentColor="#10b981">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-extrabold text-sm md:text-base text-foreground line-clamp-1">{c.name}</h3>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide",
                      c.privacy === "public"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    )}>
                      {c.privacy}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {c.desc || "No description provided."}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-[var(--glass-border-subtle)] pt-4 mt-4 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-4 h-4 text-emerald-400" />
                    {c.membersCount} Members
                  </span>
                  <button
                    onClick={() => handleDeleteCommunity(c.id)}
                    className="p-1 rounded text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          MAIN TAB 2: WHATSAPP COMMUNITY WORKFLOW
          ──────────────────────────────────────────────────────── */}
      {mainTab === "whatsapp-workflow" && (
        <div className="flex flex-col gap-6">
          {/* Header handbook banner */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-gradient-to-r from-emerald-500/15 via-teal-500/5 to-slate-900/10 p-6 backdrop-blur-md">
            <div className="glass-noise" />
            <div className="glass-specular" />
            <div className="absolute top-0 left-0 right-0 h-full pointer-events-none glass-shimmer" />

            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] shrink-0">
                💬
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                  NOW Community — WhatsApp Operational Workflow
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-2xl">
                  Official operational handbook and guideline checklist for building, maintaining, and moderating the NOW WhatsApp community network (onboarding, daily ops, events, rules).
                </p>
              </div>
            </div>
          </div>

          {/* Sub-tab navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-none">
            {[
              { id: "onboarding", label: "01. Onboarding", icon: UserPlus },
              { id: "daily-ops", label: "02. Daily Ops", icon: Sun },
              { id: "weekly-calendar", label: "03. Content Calendar", icon: CalendarRange },
              { id: "event-planning", label: "04. Event Planning", icon: Clock },
              { id: "moderation", label: "05. Moderation", icon: Shield },
              { id: "team-roles", label: "06. Team Roles", icon: UserCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setWaActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all border whitespace-nowrap cursor-pointer",
                  waActiveTab === tab.id
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                    : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content panel */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-950/15 p-6 backdrop-blur-md min-h-[400px]">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="relative z-10">
              
              {/* ─ ONBOARDING ─ */}
              {waActiveTab === "onboarding" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">Member Onboarding Flow</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Strict multi-phase onboarding sequence from registration to active chat participant.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { step: 1, emoji: "🔗", title: "Invite Link Distribution", desc: "The Community Admin generates a unique WhatsApp Community invite link. The link is shared via official channels only — pinned in class groups or posted on the dashboard. Each link is time-limited (7 days) and tracked." },
                      { step: 2, emoji: "✅", title: "Admin Approval Process", desc: "The Community Admin reviews all join requests within 24 hours. Each request is verified against the enrolled student list. Unrecognized numbers are cross-checked via the database before approval." },
                      { step: 3, emoji: "👋", title: "Welcome Message", desc: "Within 1 hour of approval, a designated moderator sends a personalized welcome message introducing the guidelines, rules, weekly calendar, and prompting them to introduce themselves." },
                      { step: 4, emoji: "📜", title: "Rules Acknowledgment", desc: "New members must read guidelines pinned in the announcements channel and react with a ✅ emoji. Members who do not react receive a DM reminder within 48 hours." },
                      { step: 5, emoji: "🙋", title: "Self-Introduction Post", desc: "Each member posts a brief introduction in the introductions chat using format: Name | Department | One Fun Fact | Goals. Moderators welcome each introduction post." },
                      { step: 6, emoji: "🎯", title: "Transition to Active Member", desc: "Once steps 1-5 are completed, they are marked as an 'Active Member' in the tracking sheet, gaining access to all topic discussion sub-groups." },
                    ].map((step) => (
                      <div key={step.step} className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all flex gap-4 items-start relative">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0">
                          {step.step}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs md:text-sm text-foreground flex items-center gap-1.5 leading-snug">
                            <span>{step.emoji}</span> {step.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─ DAILY OPS ─ */}
              {waActiveTab === "daily-ops" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">Daily Operations Routine</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Moderator tasks and group timing schedules.</p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {[
                      { title: "🌅 Morning Kickoff (8:00 AM)", points: ["Content Lead posts a 'Good Morning' theme trigger", "Includes a dynamic question of the day or quick poll", "Pins the message for late-joiners", "Maintains welcoming tone"] },
                      { title: "📢 Announcements Channel", points: ["Only Admins and Moderators can post here", "Maximum 3 announcements per day to avoid notification spam", "All posts must use standard formatting (bold headers, key bullets)", "Urgent announcements start with 🚨"] },
                      { title: "💬 Discussion Guidelines", points: ["Stay on topic; redirect tangents to specific sub-groups", "No promo links, spam, chain forwards, or ads", "Enforce respectful communication in text and voice", "Voice notes limited to maximum 60 seconds"] },
                      { title: "🌙 Evening Wrap-up & Silent Hours", points: ["Rotating moderator posts a brief highlights summary at 9:00 PM", "Preview next day's calendar topic", "Silent Hours enforced from 10:00 PM to 7:00 AM (no non-urgent chats)"] },
                    ].map((card, idx) => (
                      <div key={idx} className="p-5 border border-white/5 bg-slate-900/30 rounded-2xl flex flex-col gap-3">
                        <h4 className="font-bold text-sm text-foreground border-b border-white/5 pb-2">
                          {card.title}
                        </h4>
                        <ul className="flex flex-col gap-2 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                          {card.points.map((p, pIdx) => (
                            <li key={pIdx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─ WEEKLY CALENDAR ─ */}
              {waActiveTab === "weekly-calendar" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">Weekly Theme Calendar</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Structured content themes for everyday engagement.</p>
                  </div>

                  <div className="overflow-x-auto no-scrollbar border border-white/5 rounded-2xl bg-slate-950/20">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                          <th className="py-3 px-4">Day</th>
                          <th className="py-3 px-4">Themed Focus</th>
                          <th className="py-3 px-4">Core Activity</th>
                          <th className="py-3 px-4 text-center">Led By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { day: "MON", theme: "🚀 Motivation Monday", act: "Share weekly goals, productivity hacks, and study tips.", leader: "Content Lead" },
                          { day: "TUE", theme: "📚 Knowledge Tuesday", act: "Curated resource files, study papers, and frameworks.", leader: "Faculty" },
                          { day: "WED", theme: "💡 Idea Wednesday", act: "Challenge statements. Brainstorming solutions via text/voice.", leader: "Moderators" },
                          { day: "THU", theme: "🎤 Throwback Thursday", act: "Showcasing past student projects, events, and metrics.", leader: "Community Admin" },
                          { day: "FRI", theme: "🎯 Skill Friday", act: "Short coding quizzes or speaking drills in groups.", leader: "Content Lead" },
                          { day: "SAT", theme: "🗣️ Open Mic Saturday", act: "Casual sharing, hobbies, and personal achievements.", leader: "Moderators" },
                          { day: "SUN", theme: "📋 Planning Sunday", act: "Upcoming events timeline, schedules, and poll reviews.", leader: "Admin Team" },
                        ].map((row, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 text-xs">
                            <td className="py-3 px-4 font-bold text-emerald-400">{row.day}</td>
                            <td className="py-3 px-4 font-semibold text-foreground">{row.theme}</td>
                            <td className="py-3 px-4 text-muted-foreground leading-relaxed">{row.act}</td>
                            <td className="py-3 px-4 text-center font-medium">{row.leader}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─ EVENT PLANNING ─ */}
              {waActiveTab === "event-planning" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">Community Event Timeline</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Checklist path for scheduling calls, webinars, or coding cohorts.</p>
                  </div>

                  <div className="relative pl-8 flex flex-col gap-6 border-l border-emerald-500/30">
                    {[
                      { title: "Idea Confirmation (14 days before)", desc: "Submit event proposals to the admin group chat. Identify targets, required speakers, and dates. Log in Calendar." },
                      { title: "Official Announcement (7 days before)", desc: "Post complete flyer details, RSVP links, and schedules to Announcements. Pin the message." },
                      { title: "Reminders & Links (1 day before & 1 hour before)", desc: "Send summary notifications. Provide Zoom/Google Meet links and preparation handouts." },
                      { title: "Execution Day (Event day)", desc: "Open the call, manage Q&A, moderate comments, records logs, and take attendance notes." },
                      { title: "Wrap-up & Feedback (Within 48 hours)", desc: "Send Google feedback forms. Post slides, files, and video recordings in resource channels." },
                    ].map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Node circle */}
                        <div className="absolute -left-11 top-1.5 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center text-[10px] text-white font-bold" />
                        
                        <h4 className="font-bold text-xs md:text-sm text-foreground leading-snug">{step.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─ MODERATION ─ */}
              {waActiveTab === "moderation" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">Moderation Rules & Strikes</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Standard guidelines for enforcing community safety.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="p-5 border border-white/5 bg-slate-900/30 rounded-2xl md:col-span-2 flex flex-col gap-4">
                      <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                        <Shield className="w-4.5 h-4.5" /> Enforced Community Rules
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        {[
                          { rule: "Respect Members", desc: "No personal insults, bullying, discrimination, or hate speech." },
                          { rule: "No Spam / Ads", desc: "Zero tolerance for ads, referrals, MLMs, or links." },
                          { rule: "Confidentiality", desc: "No screenshots or sharing chat logs outside groups without consent." },
                          { rule: "Observe Silent Hours", desc: "No non-urgent chats between 10:00 PM and 7:00 AM." },
                        ].map((r, idx) => (
                          <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                            <span className="font-bold text-foreground block">{r.rule}</span>
                            <span className="text-[11px] text-muted-foreground mt-1 block leading-relaxed">{r.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 border border-white/5 bg-slate-900/30 rounded-2xl md:col-span-1 flex flex-col gap-3">
                      <h4 className="font-bold text-sm text-rose-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-4.5 h-4.5" /> Strike Enforcement
                      </h4>
                      <div className="flex flex-col gap-3 text-xs leading-snug">
                        {[
                          { strike: "1st Strike", act: "Private warning DM referencing rule.", color: "text-amber-400" },
                          { strike: "2nd Strike", act: "Final warning DM + public warning.", color: "text-amber-400" },
                          { strike: "3rd Strike", act: "24-72 hours group mute action.", color: "text-rose-400" },
                          { strike: "4th Strike", act: "Permanent removal from channels.", color: "text-rose-600 font-extrabold" },
                        ].map((s, idx) => (
                          <div key={idx} className="flex justify-between items-start gap-2 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className={cn("font-bold shrink-0", s.color)}>{s.strike}</span>
                            <span className="text-muted-foreground text-right text-[11px]">{s.act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─ TEAM ROLES ─ */}
              {waActiveTab === "team-roles" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">Team Roles Matrix</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Operational task distribution for community admins, content creators, and student leads.</p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { role: "👑 Community Admin", duty: "Handles invite deactivations, validates students, accepts/rejects join request lists, manages sub-groups structure, coordinates HOD/Faculty updates." },
                      { role: "🛡️ Lead Moderator", duty: "Daily conversation scanning, issues strike warnings, applies mutes, reviews flags/reports, posts night wrap summaries on duty." },
                      { role: "✍️ Content Lead", duty: "Creates themed posts (Motivation Monday, Skill Friday), designs polls, schedules Guest lectures, shares syllabus files." },
                    ].map((r, idx) => (
                      <div key={idx} className="p-5 border border-white/5 bg-slate-900/30 rounded-2xl flex flex-col gap-2">
                        <h4 className="font-extrabold text-sm text-foreground">{r.role}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                          {r.duty}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          CREATE COMMUNITY MODAL
          ──────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-900/90 max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-extrabold text-base text-foreground">Create New Community</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 flex flex-col gap-4 my-2 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Community Group Name *</label>
                <input
                  type="text"
                  placeholder="e.g. #javascript-beginners"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Description</label>
                <textarea
                  rows={2}
                  placeholder="What is this community group for?"
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Privacy Setting</label>
                <select
                  value={newCommPrivacy}
                  onChange={(e) => setNewCommPrivacy(e.target.value)}
                  className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full outline-none"
                >
                  <option value="public" className="bg-slate-900 text-foreground">Public (Anyone can view)</option>
                  <option value="restricted" className="bg-slate-900 text-foreground">Restricted (Needs Admin invite)</option>
                </select>
              </div>
            </div>

            <div className="relative z-10 flex justify-end gap-2.5 mt-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-transparent text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunity}
                disabled={!newCommName.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
