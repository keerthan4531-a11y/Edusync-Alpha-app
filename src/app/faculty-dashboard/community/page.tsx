"use client"

import { useState } from "react"
import {
  Users, Shield, Calendar, Award, Rocket,
  MessageSquare, BookOpen, Code, Trophy, Zap,
  AlertTriangle, Crown, GraduationCap,
  CheckCircle2, Copy, ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Tab Data ────────────────────────────────────────────────

const TABS = [
  { id: "setup", label: "Setup & Onboarding", icon: Rocket, phase: 1 },
  { id: "content", label: "Content Strategy", icon: Calendar, phase: 2 },
  { id: "moderation", label: "Moderation & Rules", icon: Shield, phase: 3 },
  { id: "leadership", label: "Leadership & Roles", icon: Crown, phase: 4 },
  { id: "engagement", label: "Engagement & Growth", icon: Award, phase: 5 },
] as const

type TabId = typeof TABS[number]["id"]

// ─── Reusable Sub-Components ─────────────────────────────────

function PhaseHeader({ phase, title, description }: { phase: number; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3.5 md:gap-4 mb-6 md:mb-7 pb-4 border-b-2 border-emerald-500/20">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-extrabold text-base md:text-lg text-white shadow-lg shadow-emerald-500/30 shrink-0">
        {phase}
      </div>
      <div>
        <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
        <p className="text-xs md:text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  )
}

function StepCard({ num, title, description, emoji }: { num: number; title: string; description: string; emoji?: string }) {
  return (
    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 flex gap-3.5 md:gap-4 transition-all hover:translate-x-1.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 overflow-hidden group">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-700 rounded-l-2xl" />
      <div className="w-9 h-9 md:w-10 md:h-10 min-w-[36px] md:min-w-[40px] rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs md:text-sm shrink-0">
        {num}
      </div>
      <div>
        <h4 className="text-xs md:text-sm font-semibold text-white mb-1">
          {emoji && <span className="mr-1.5">{emoji}</span>}
          {title}
        </h4>
        <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
      <div className="flex items-center gap-3 mb-3.5">
        <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <h4 className="text-xs md:text-sm font-semibold text-white">{title}</h4>
      </div>
      <div className="text-[11px] md:text-xs text-zinc-400 leading-relaxed space-y-1.5">
        {children}
      </div>
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
    >
      {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : label}
    </button>
  )
}

// ─── Phase Content ───────────────────────────────────────────

function PhaseSetup() {
  const welcomeTemplate = `🎓 Welcome to [Subject] Community!\n\nHello students! This is the official WhatsApp group for [Subject Code] — [Subject Name].\n\n📋 Group Rules:\n• Keep discussions academic\n• Be respectful to all members\n• No spam or irrelevant content\n• Use 📌 for important questions\n\n🎯 Let's learn together!\n— Prof. [Name]`

  return (
    <div>
      <PhaseHeader phase={1} title="Setup & Onboarding" description="Create your community structure and welcome new members" />

      <div className="space-y-3.5 md:space-y-4 mb-8">
        <StepCard num={1} emoji="📱" title="Create WhatsApp Community" description="Open WhatsApp → Communities → New Community → Add your department or subject name." />
        <StepCard num={2} emoji="🏗️" title="Set Up Group Structure" description="Create sub-groups under the community: Announcements (admin-only), Discussions, Assignments, and Resources." />
        <StepCard num={3} emoji="🔗" title="Generate Invite Links" description="Go to each group → Group Settings → Invite via Link → Share with students via classroom page." />
        <StepCard num={4} emoji="👋" title="Send Welcome Message" description="Post the welcome template below in each group to set expectations." />
        <StepCard num={5} emoji="📌" title="Pin Important Info" description="Pin the welcome message and syllabus. Set group description with class schedule." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <InfoCard icon={MessageSquare} title="Welcome Message Template">
          <pre className="whitespace-pre-wrap text-zinc-300 bg-black/30 p-3 rounded-lg border border-white/5 text-[10px] md:text-[11px] leading-relaxed overflow-x-auto">
            {welcomeTemplate}
          </pre>
          <div className="mt-3">
            <CopyButton text={welcomeTemplate} label="Copy Template" />
          </div>
        </InfoCard>

        <InfoCard icon={Users} title="Recommended Group Structure">
          <div className="space-y-2.5">
            {[
              { name: "📢 Announcements", desc: "Admin-only. Official notices." },
              { name: "💬 General Discussion", desc: "Open. Academic Q&A." },
              { name: "📝 Assignments", desc: "Submissions & deadlines." },
              { name: "📚 Resources", desc: "Study materials & links." },
              { name: "🆘 Doubt Clearing", desc: "Students help each other." },
            ].map(g => (
              <div key={g.name} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div><span className="text-zinc-200 font-medium">{g.name}</span> — {g.desc}</div>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>
    </div>
  )
}

function PhaseContent() {
  const schedule = [
    { day: "Monday", emoji: "💪", theme: "Motivational Monday", description: "Share an inspiring quote + weekly goal." },
    { day: "Tuesday", emoji: "💻", theme: "Tech Tuesday", description: "Industry news, new tools, or coding tips." },
    { day: "Wednesday", emoji: "❓", theme: "Quiz Wednesday", description: "Quick 5-question quiz on recent topics." },
    { day: "Thursday", emoji: "🚀", theme: "Project Thursday", description: "Student project showcases & code reviews." },
    { day: "Friday", emoji: "⭐", theme: "Feature Friday", description: "Highlight top student work or achievements." },
    { day: "Weekend", emoji: "🏆", theme: "Weekend Challenge", description: "Optional bonus challenge for extra XP." },
  ]

  return (
    <div>
      <PhaseHeader phase={2} title="Content Strategy" description="Plan engaging weekly content to keep students active" />

      <h3 className="text-xs md:text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-emerald-400" />
        Weekly Content Calendar
      </h3>

      <div className="overflow-x-auto rounded-2xl border border-white/10 mb-8 bg-black/20">
        <table className="w-full text-xs md:text-sm text-left min-w-[500px]">
          <thead>
            <tr className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80">
              <th className="px-4 md:px-5 py-3 text-emerald-400 font-semibold text-[10px] md:text-xs uppercase tracking-wider">Day</th>
              <th className="px-4 md:px-5 py-3 text-emerald-400 font-semibold text-[10px] md:text-xs uppercase tracking-wider">Theme</th>
              <th className="px-4 md:px-5 py-3 text-emerald-400 font-semibold text-[10px] md:text-xs uppercase tracking-wider">Content Idea</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {schedule.map(s => (
              <tr key={s.day} className="bg-white/[0.02] hover:bg-emerald-500/5 transition-colors">
                <td className="px-4 md:px-5 py-3.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold">{s.day}</span>
                </td>
                <td className="px-4 md:px-5 py-3.5 text-zinc-200 font-medium">
                  <span className="mr-1.5">{s.emoji}</span>
                  {s.theme}
                </td>
                <td className="px-4 md:px-5 py-3.5 text-zinc-400">{s.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        <InfoCard icon={Zap} title="Engagement Boosters">
          {["Use polls for quick feedback", "Share relevant memes", "Create voice note summaries", "Host live Q&A sessions"].map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </InfoCard>
        <InfoCard icon={BookOpen} title="Content Types">
          {["Text-based mini lessons", "Infographics & diagrams", "Short video explanations", "Code snippets & solutions"].map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </InfoCard>
        <InfoCard icon={Trophy} title="Gamification Ideas">
          {["Weekly leaderboard updates", "Bonus XP for participation", "Student spotlight awards", "Streak challenges"].map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </InfoCard>
      </div>
    </div>
  )
}

function PhaseModeration() {
  const rules = [
    { icon: MessageSquare, title: "Academic Content Only", desc: "Keep all messages related to coursework, studies, and academics." },
    { icon: Shield, title: "Respectful Communication", desc: "No bullying, harassment, or discriminatory language." },
    { icon: AlertTriangle, title: "No Spam / Forwarded Content", desc: "No chain messages, ads, or unrelated forwards." },
    { icon: Users, title: "Privacy Protection", desc: "Don't share personal information or others' work without permission." },
    { icon: Code, title: "Original Work", desc: "Share your own code/solutions. Cite sources when referencing others." },
    { icon: Calendar, title: "Timely Responses", desc: "Answer queries within group hours (8 AM — 9 PM)." },
  ]

  return (
    <div>
      <PhaseHeader phase={3} title="Moderation & Rules" description="Maintain a productive learning environment" />

      <h3 className="text-xs md:text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-emerald-400" />
        Community Rules
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4 mb-8">
        {rules.map(r => (
          <div key={r.title} className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5 flex gap-3.5 transition-all hover:border-emerald-500/30">
            <div className="w-9 h-9 md:w-10 md:h-10 min-w-[36px] rounded-xl bg-emerald-500/12 text-emerald-400 flex items-center justify-center shrink-0">
              <r.icon className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-white mb-1">{r.title}</h4>
              <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-xs md:text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        Enforcement Process
      </h3>

      <div className="flex items-center justify-center flex-col sm:flex-row gap-3 mb-8">
        <div className="px-5 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center w-full sm:w-auto sm:min-w-[150px]">
          <h5 className="text-xs md:text-sm font-semibold text-amber-400 mb-0.5">⚠️ 1st Warning</h5>
          <p className="text-[10px] text-zinc-400">Friendly DM reminder</p>
        </div>
        <span className="text-zinc-600 text-lg hidden sm:inline">→</span>
        <div className="px-5 py-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center w-full sm:w-auto sm:min-w-[150px]">
          <h5 className="text-xs md:text-sm font-semibold text-indigo-400 mb-0.5">🔇 2nd: Mute</h5>
          <p className="text-[10px] text-zinc-400">24-hour group mute</p>
        </div>
        <span className="text-zinc-600 text-lg hidden sm:inline">→</span>
        <div className="px-5 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-center w-full sm:w-auto sm:min-w-[150px]">
          <h5 className="text-xs md:text-sm font-semibold text-red-400 mb-0.5">🚫 3rd: Remove</h5>
          <p className="text-[10px] text-zinc-400">Removed from group</p>
        </div>
      </div>

      <InfoCard icon={Shield} title="Admin Moderation Tips">
        {[
          "Set clear rules on Day 1 and pin them",
          "Address issues privately via DM first",
          "Appoint student admins from each section",
          "Use 'Admin-only' setting for Announcements group",
          "Review group weekly for off-topic content",
        ].map(tip => (
          <div key={tip} className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <span>{tip}</span>
          </div>
        ))}
      </InfoCard>
    </div>
  )
}

function PhaseLeadership() {
  const roles = [
    { emoji: "👨‍🏫", title: "Faculty Lead", badge: "Admin", color: "from-emerald-500 to-emerald-700", responsibilities: ["Final authority on group decisions", "Content approval & scheduling", "Direct student mentorship", "Community strategy planning"] },
    { emoji: "🎓", title: "Student Admin", badge: "Moderator", color: "from-blue-500 to-blue-700", responsibilities: ["Day-to-day moderation", "Welcome new members", "Forward student queries", "Maintain group etiquette"] },
    { emoji: "💻", title: "Tech Lead", badge: "Contributor", color: "from-violet-500 to-violet-700", responsibilities: ["Share coding resources", "Help debug student code", "Organize hackathons", "Maintain resource links"] },
    { emoji: "📚", title: "Peer Tutor", badge: "Helper", color: "from-amber-500 to-amber-700", responsibilities: ["Answer academic doubts", "Share study materials", "Organize study groups", "Create revision notes"] },
  ]

  return (
    <div>
      <PhaseHeader phase={4} title="Leadership & Roles" description="Assign roles to build a self-sustaining community" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8">
        {roles.map(role => (
          <div key={role.title} className="relative bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 transition-all hover:-translate-y-1 hover:border-emerald-500/30 overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${role.color}`} />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border-2 border-emerald-500/30 flex items-center justify-center text-xl shrink-0">
                {role.emoji}
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white">{role.title}</h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">
                  {role.badge}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {role.responsibilities.map(r => (
                <div key={r} className="flex items-start gap-2 text-xs text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <InfoCard icon={GraduationCap} title="Selecting Student Leaders">
        {[
          "Choose academically active and responsible students",
          "Rotate roles each semester for fresh perspective",
          "Set clear expectations and responsibilities document",
          "Have a monthly check-in meeting with all admins",
          "Recognize and reward outstanding moderators with XP bonuses",
        ].map(tip => (
          <div key={tip} className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <span>{tip}</span>
          </div>
        ))}
      </InfoCard>
    </div>
  )
}

function PhaseEngagement() {
  const milestones = [
    { members: "25+", title: "First Milestone", description: "Celebrate reaching 25 active members. Share a group achievement badge.", tag: "Starter" },
    { members: "50+", title: "Growing Community", description: "Introduce student-led study sessions and peer tutoring.", tag: "Growing" },
    { members: "100+", title: "Thriving Hub", description: "Launch sub-groups for special interest topics and coding clubs.", tag: "Thriving" },
    { members: "200+", title: "Department-wide", description: "Cross-batch mentorship, alumni guest sessions, industry connects.", tag: "Elite" },
  ]

  const events = [
    { name: "Weekly Quiz Challenge", freq: "Every Wednesday", desc: "5 questions on recent topics, XP rewards" },
    { name: "Code Review Sessions", freq: "Bi-weekly", desc: "Students submit code for peer + faculty review" },
    { name: "Guest Lectures", freq: "Monthly", desc: "Invite industry professionals or alumni" },
    { name: "Hackathon Sprints", freq: "Each semester", desc: "24-hour collaborative coding challenges" },
    { name: "Achievement Ceremony", freq: "End of semester", desc: "Recognize top performers and contributors" },
  ]

  return (
    <div>
      <PhaseHeader phase={5} title="Engagement & Growth" description="Scale your community with gamification and events" />

      <h3 className="text-xs md:text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-emerald-400" />
        Community Milestones
      </h3>

      <div className="relative pl-8 md:pl-10 mb-8 space-y-4">
        <div className="absolute left-[14px] md:left-[18px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-500 via-teal-600 to-emerald-500/20 rounded-full" />

        {milestones.map(m => (
          <div key={m.title} className="relative bg-white/5 border border-white/10 rounded-xl p-4 md:p-5 transition-all hover:translate-x-1 hover:border-emerald-500/30">
            <div className="absolute -left-[20px] md:-left-[22px] top-5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[3px] border-[#0B0F19] shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
            <div className="flex items-center gap-3 mb-2">
              <span className="text-base md:text-lg font-bold text-emerald-400">{m.members}</span>
              <h4 className="text-xs md:text-sm font-semibold text-white">{m.title}</h4>
            </div>
            <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed">{m.description}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
              {m.tag}
            </span>
          </div>
        ))}
      </div>

      <h3 className="text-xs md:text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Rocket className="w-4 h-4 text-emerald-400" />
        Community Events Calendar
      </h3>

      <div className="overflow-x-auto rounded-2xl border border-white/10 mb-8 bg-black/20">
        <table className="w-full text-xs md:text-sm text-left min-w-[480px]">
          <thead>
            <tr className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80">
              <th className="px-4 md:px-5 py-3 text-emerald-400 font-semibold text-[10px] md:text-xs uppercase tracking-wider">Event</th>
              <th className="px-4 md:px-5 py-3 text-emerald-400 font-semibold text-[10px] md:text-xs uppercase tracking-wider">Frequency</th>
              <th className="px-4 md:px-5 py-3 text-emerald-400 font-semibold text-[10px] md:text-xs uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {events.map(e => (
              <tr key={e.name} className="bg-white/[0.02] hover:bg-emerald-500/5 transition-colors">
                <td className="px-4 md:px-5 py-3 text-zinc-200 font-medium">{e.name}</td>
                <td className="px-4 md:px-5 py-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold">{e.freq}</span>
                </td>
                <td className="px-4 md:px-5 py-3 text-zinc-400">{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <InfoCard icon={Trophy} title="Gamification Integration">
          {[
            "Award XP for community participation",
            "Weekly top contributor badge",
            "Streak bonuses for daily activity",
            "Leaderboard integration with EduSync",
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </InfoCard>
        <InfoCard icon={ExternalLink} title="Growth Strategies">
          {[
            "Cross-promote with other department communities",
            "Invite alumni for mentorship Q&A",
            "Create themed challenge weeks",
            "Student showcase spotlights monthly",
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </InfoCard>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────

export default function CommunityWorkflowPage() {
  const [activeTab, setActiveTab] = useState<TabId>("setup")

  return (
    <div className="flex flex-col gap-5 md:gap-6 max-w-5xl mx-auto p-2 md:p-4 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          WhatsApp Community Workflow
        </h1>
        <p className="text-zinc-400 mt-1.5 text-xs md:text-sm">
          Build and manage engaging student communities with a structured 5-phase approach.
        </p>
      </div>

      {/* Phase Tabs — Horizontal Scrollable on Mobile */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-black/30 border border-emerald-500/15 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 md:px-4 py-2 md:py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                : "text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
            )}
          >
            <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300" key={activeTab}>
        {activeTab === "setup" && <PhaseSetup />}
        {activeTab === "content" && <PhaseContent />}
        {activeTab === "moderation" && <PhaseModeration />}
        {activeTab === "leadership" && <PhaseLeadership />}
        {activeTab === "engagement" && <PhaseEngagement />}
      </div>
    </div>
  )
}
