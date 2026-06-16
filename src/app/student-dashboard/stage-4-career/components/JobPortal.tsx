import { useState } from "react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

interface Job {
  id: string
  role: string
  company: string
  type: string
  location: string
  salary: string
  experience: string
  skills: string[]
}

const MOCK_JOBS: Job[] = [
  {
    id: "1",
    role: "Frontend Developer",
    company: "Inixa AI",
    type: "Remote",
    location: "Bangalore, India",
    salary: "₹12 - ₹18 LPA",
    experience: "0 - 2 Years",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"]
  },
  {
    id: "2",
    role: "Full-Stack Engineer",
    company: "CloudSync",
    type: "Hybrid",
    location: "Chennai, India",
    salary: "₹8 - ₹14 LPA",
    experience: "1 - 3 Years",
    skills: ["Node.js", "Next.js", "PostgreSQL", "React"]
  },
  {
    id: "3",
    role: "AI Integration specialist",
    company: "EduTech Corp",
    type: "Full-time",
    location: "Hyderabad, India",
    salary: "₹15 - ₹22 LPA",
    experience: "Freshers Welcome",
    skills: ["Python", "FastAPI", "OpenAI API", "JavaScript"]
  },
  {
    id: "4",
    role: "Software Development Engineer (SDE-1)",
    company: "DecentralTech",
    type: "Remote",
    location: "Mumbai, India",
    salary: "₹10 - ₹15 LPA",
    experience: "0 - 1 Years",
    skills: ["React", "TypeScript", "GraphQL", "Solidity"]
  }
]

export function JobPortal() {
  const [search, setSearch] = useState("")
  const [appliedJobs, setAppliedJobs] = useState<string[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const filteredJobs = MOCK_JOBS.filter(job => 
    job.role.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
  )

  const handleApply = (jobId: string, role: string, company: string) => {
    if (appliedJobs.includes(jobId)) return
    setAppliedJobs([...appliedJobs, jobId])
    setToastMessage(`Successfully applied for ${role} at ${company}!`)
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-foreground tracking-tight mb-1">Job Portal</h2>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400">Discover placement opportunities matching your technical skills.</p>
        </div>
        <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-semibold shadow-sm flex items-center gap-2 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {MOCK_JOBS.length} Jobs Available
        </div>
      </div>

      {/* Search Bar */}
      <LiquidGlassCard className="p-4 flex items-center gap-3">
        <i className="fas fa-search text-zinc-400 dark:text-gray-400 pl-2"></i>
        <input
          type="text"
          placeholder="Search roles, companies, or key skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none outline-none focus:ring-0 text-[15px] text-foreground placeholder-zinc-400 dark:placeholder-gray-500"
        />
      </LiquidGlassCard>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.map(job => {
          const isApplied = appliedJobs.includes(job.id)
          return (
            <LiquidGlassCard key={job.id} className="p-6 flex flex-col justify-between" accentColor="#10b981">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[13px] font-semibold text-emerald-500 uppercase tracking-wider">{job.company}</span>
                    <h3 className="text-[17px] font-semibold text-foreground mt-0.5 leading-snug">{job.role}</h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[12px] font-semibold shadow-sm">
                    {job.type}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 text-center">
                  <div>
                    <div className="text-[11px] text-zinc-500 dark:text-gray-500 uppercase tracking-wider font-semibold">Location</div>
                    <div className="text-[13px] font-medium text-foreground truncate mt-0.5" title={job.location}>{job.location.split(',')[0]}</div>
                  </div>
                  <div className="border-x border-black/10 dark:border-white/10">
                    <div className="text-[11px] text-zinc-500 dark:text-gray-500 uppercase tracking-wider font-semibold">Salary</div>
                    <div className="text-[13px] font-medium text-foreground mt-0.5">{job.salary.split(' ')[0]}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-500 dark:text-gray-500 uppercase tracking-wider font-semibold">Experience</div>
                    <div className="text-[13px] font-medium text-foreground mt-0.5">{job.experience.split(' ')[0]} Yrs</div>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white/70 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-lg text-xs text-zinc-600 dark:text-gray-400 font-medium shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleApply(job.id, job.role, job.company)}
                disabled={isApplied}
                className={`w-full font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${
                  isApplied
                    ? "bg-zinc-100 dark:bg-white/10 text-zinc-400 dark:text-gray-500 border border-black/5 dark:border-white/5 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {isApplied ? (
                  <>
                    <i className="fas fa-check text-xs"></i> Applied
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane text-xs"></i> Apply Now
                  </>
                )}
              </button>
            </LiquidGlassCard>
          )
        })}

        {filteredJobs.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <i className="fas fa-info-circle text-2xl text-zinc-400 dark:text-gray-500 mb-2"></i>
            <p className="text-[15px] text-zinc-500 dark:text-gray-400">No jobs found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
