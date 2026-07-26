"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Map, Award, BookOpen, Code, Briefcase, GraduationCap, Flame, 
  Coins, Clock, Compass, Lock, CheckCircle2, PlayCircle, 
  RefreshCw, Sparkles, AlertCircle, ChevronLeft, Calendar, User, CheckSquare
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { BadgeIcon } from "@/components/dashboard/BadgeIcon"

interface LearningPathClientProps {
  user: {
    name: string
    email: string
    xp: number
    coins: number
    level: number
    currentStreak: number
    longestStreak: number
    department: string
  }
  stageProgresses: Array<{
    id: string
    stageNumber: number
    stageName: string
    status: string // "ACTIVE", "COMPLETED", "LOCKED"
    completedAt: string | null
  }>
  badges: Array<{
    id: string
    name: string
    description: string
    iconUrl: string | null
    earned: boolean
    earnedAt: string | null
  }>
}

interface Task {
  id: number
  title: string
  description: string
  category: "voice" | "vocabulary" | "communication" | "pronunciation" | "coding" | "project" | "career"
  difficulty: "easy" | "medium" | "hard"
  xpReward: number
  coinsReward: number
  timeEstimate: number
  completed: boolean
}

export function LearningPathClient({ user, stageProgresses, badges }: LearningPathClientProps) {
  const router = useRouter()
  
  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null)
  
  // Custom path form state
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [duration, setDuration] = useState("60")
  const [goals, setGoals] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPath, setGeneratedPath] = useState<any | null>(null)

  // Loading Overlay
  const [loadingText, setLoadingText] = useState("")
  const [showLoading, setShowLoading] = useState(false)

  // Active Stage
  const activeStage = stageProgresses.find(p => p.status === "ACTIVE")
  const activeStageNumber = activeStage ? activeStage.stageNumber : 1

  // Dynamic Tasks State
  const [tasks, setTasks] = useState<Task[]>([])

  // Load appropriate tasks based on user's active stage
  const loadTasks = () => {
    let stageTasks: Task[] = []
    
    if (activeStageNumber === 1) {
      stageTasks = [
        {
          id: 1,
          title: "Voice Challenge: Self Introduction",
          description: "Record a 30-second self introduction in English. Focus on clarity and pronunciation.",
          category: "voice",
          difficulty: "easy",
          xpReward: 50,
          coinsReward: 25,
          timeEstimate: 15,
          completed: true
        },
        {
          id: 2,
          title: "Vocabulary Builder: Daily Words",
          description: "Learn 5 new English words with Tamil translations and usage examples.",
          category: "vocabulary",
          difficulty: "easy",
          xpReward: 30,
          coinsReward: 15,
          timeEstimate: 10,
          completed: false
        },
        {
          id: 3,
          title: "Group Discussion Practice",
          description: "Join an audio chat room and participate in a 5-minute conversation on student life.",
          category: "communication",
          difficulty: "medium",
          xpReward: 75,
          coinsReward: 35,
          timeEstimate: 20,
          completed: false
        },
        {
          id: 4,
          title: "Pronunciation Practice: Vowel Sounds",
          description: "Practice English vowel sounds using the voice tone analysis module.",
          category: "pronunciation",
          difficulty: "medium",
          xpReward: 60,
          coinsReward: 30,
          timeEstimate: 15,
          completed: false
        }
      ]
    } else if (activeStageNumber === 2) {
      stageTasks = [
        {
          id: 5,
          title: "Coding Challenge: Two Sum",
          description: "Solve the classic Two Sum problem using Python or JavaScript in the editor.",
          category: "coding",
          difficulty: "easy",
          xpReward: 100,
          coinsReward: 50,
          timeEstimate: 20,
          completed: false
        },
        {
          id: 6,
          title: "Learn Data Structures: Arrays",
          description: "Complete the introductory module on Array memory layout and operations.",
          category: "coding",
          difficulty: "easy",
          xpReward: 50,
          coinsReward: 20,
          timeEstimate: 15,
          completed: true
        },
        {
          id: 7,
          title: "Code Review Assistant",
          description: "Upload code snippet and obtain AI Code Review feedback.",
          category: "coding",
          difficulty: "medium",
          xpReward: 80,
          coinsReward: 40,
          timeEstimate: 15,
          completed: false
        }
      ]
    } else {
      stageTasks = [
        {
          id: 8,
          title: "Project Repository Setup",
          description: "Initialize a new project, write a README file, and verify build status.",
          category: "project",
          difficulty: "easy",
          xpReward: 75,
          coinsReward: 30,
          timeEstimate: 20,
          completed: false
        },
        {
          id: 9,
          title: "Resume Evaluation",
          description: "Upload your resume in PDF format to obtain a smart ATS match score and analysis.",
          category: "career",
          difficulty: "medium",
          xpReward: 100,
          coinsReward: 50,
          timeEstimate: 15,
          completed: false
        }
      ]
    }
    setTasks(stageTasks)
  }

  useEffect(() => {
    loadTasks()
  }, [activeStageNumber])

  // Toast Trigger Helper
  const showToastMsg = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // Action: Refresh Tasks
  const handleRefreshTasks = () => {
    setLoadingText("Refreshing tasks...")
    setShowLoading(true)
    setTimeout(() => {
      setShowLoading(false)
      showToastMsg("Tasks refreshed successfully!", "success")
      loadTasks()
    }, 1200)
  }

  // Action: Start Task
  const handleStartTask = (task: Task) => {
    setLoadingText("Starting task...")
    setShowLoading(true)
    setTimeout(() => {
      setShowLoading(false)
      showToastMsg(`Task "${task.title}" started! Redirecting...`, "success")
      
      // Route based on category
      if (task.category === "coding") {
        router.push("/student-dashboard/stage-2-coding")
      } else if (task.category === "project") {
        router.push("/student-dashboard/stage-3-projects")
      } else if (task.category === "career") {
        router.push("/student-dashboard/stage-4-career")
      } else {
        router.push("/student-dashboard/stage-1-communication")
      }
    }, 1000)
  }

  // Action: Enter Stage
  const handleEnterStage = (stageNum: number) => {
    setLoadingText(`Entering Stage ${stageNum}...`)
    setShowLoading(true)
    setTimeout(() => {
      setShowLoading(false)
      if (stageNum === 1) router.push("/student-dashboard/stage-1-communication")
      else if (stageNum === 2) router.push("/student-dashboard/stage-2-coding")
      else if (stageNum === 3) router.push("/student-dashboard/stage-3-projects")
      else if (stageNum === 4) router.push("/student-dashboard/stage-4-career")
    }, 800)
  }

  // Action: View Details
  const handleViewDetails = (stageNum: number, stageName: string) => {
    showToastMsg(`Loading statistics for ${stageName}...`, "info")
    setTimeout(() => {
      alert(`Stage ${stageNum}: ${stageName}\n\nAnalytics and detailed feedback reports for this stage are being compiled. Check back soon for module level insights!`)
    }, 500)
  }

  // Action: Weekly Plan
  const handleWeeklyPlan = (stageNum: number) => {
    const plans: Record<number, string> = {
      1: `📅 Monday: Voice Challenge - Self Introduction\n📅 Tuesday: Vocabulary Builder (Tamil Meanings)\n📅 Wednesday: Group Discussion Practice\n📅 Thursday: Voice Tone Analysis\n📅 Friday: Read Aloud Feedback\n📅 Saturday: Review Weekly Stats\n📅 Sunday: Relax & Re-energize`,
      2: `📅 Monday: Code Editor & Compiler Basics\n📅 Tuesday: Solve 3 Daily Coding Challenges\n📅 Wednesday: Study Array & String Algorithms\n📅 Thursday: Code Review Assistant check\n📅 Friday: Mock Coding Quiz\n📅 Saturday: Complete Stage 2 projects\n📅 Sunday: Relax & Documentation`,
      3: `📅 Monday: Project Setup and Repository Sync\n📅 Tuesday: Team Assignment and Kanban Board setup\n📅 Wednesday: File editing & Code commits\n📅 Thursday: Code Reviews & Peer feedback\n📅 Friday: Complete Project Milestone 1\n📅 Saturday: Build verification\n📅 Sunday: Relax & Planning`,
      4: `📅 Monday: ATS Resume Builder customization\n📅 Tuesday: AI Mock Interview (Self Intro)\n📅 Wednesday: Aptitude practice test\n📅 Thursday: Behavioral interview questions\n📅 Friday: Review resume scorer feedback\n📅 Saturday: Final Career dashboard review\n📅 Sunday: Relax & Prep`
    }
    alert(`Weekly Plan for Stage ${stageNum}:\n\n${plans[stageNum] || "Plan coming soon!"}`)
  }

  // Action: Preview locked stage
  const handlePreviewStage = (stageNum: number) => {
    const previews: Record<number, string> = {
      2: `✨ Stage 2: Coding Fundamentals\n\nLearn programming basics, compile code online, and get AI reviews.\n\nRequired to Unlock: Complete Stage 1 (Communication).`,
      3: `✨ Stage 3: Real-world Projects\n\nBuild team projects, use code editors, branches, pull requests, and peer review systems.\n\nRequired to Unlock: Complete Stage 2 (Coding).`,
      4: `✨ Stage 4: Career Preparation\n\nAI mock interviews, ATS resume scorer, aptitude quizzes, and industry boards.\n\nRequired to Unlock: Complete Stage 3 (Projects).`
    }
    alert(previews[stageNum] || "Stage preview not available.")
  }

  // Action: Generate New Path
  const handleGeneratePath = () => {
    if (focusAreas.length === 0) {
      showToastMsg("Please select at least one focus area", "warning")
      return
    }
    if (!goals.trim()) {
      showToastMsg("Please outline your primary learning goals", "warning")
      return
    }

    setIsGenerating(true)
    setLoadingText("Generating...")
    setShowLoading(true)

    setTimeout(() => {
      setShowLoading(false)
      setIsGenerating(false)
      
      const newPath = {
        id: "custom-" + Date.now(),
        focusAreas,
        duration: parseInt(duration),
        goals: goals.trim()
      }
      setGeneratedPath(newPath)
      showToastMsg("Custom learning path generated successfully!", "success")
    }, 2500)
  }

  const toggleFocusArea = (val: string) => {
    if (focusAreas.includes(val)) {
      setFocusAreas(focusAreas.filter(x => x !== val))
    } else {
      setFocusAreas([...focusAreas, val])
    }
  }

  // Calculate Overall Progress Percentage
  const calculateOverallProgress = () => {
    let totalProgress = 0
    stageProgresses.forEach(p => {
      if (p.status === "COMPLETED") totalProgress += 100
      else if (p.status === "ACTIVE") {
        // Mock stage progress within the active stage
        totalProgress += user.level * 6 + 10 // scale based on user level
      }
    })
    return Math.min(Math.round(totalProgress / stageProgresses.length), 100)
  }

  const overallProgressPercent = calculateOverallProgress()
  const daysRemaining = Math.max(Math.round((100 - overallProgressPercent) * 0.6), 5)
  const completedTasksCount = tasks.filter(t => t.completed).length

  // Radar Chart Calculations for SVG Point rendering
  // Skill labels order: Communication, Programming, Problem Solving, Teamwork, Time Management
  const currentSkills = [75, 40 + (user.level * 2), 60, 70, 65]
  const targetSkills = [90, 85, 90, 90, 85]
  const radarLabels = ["Communication", "Programming", "Problem Solving", "Teamwork", "Time Management"]

  const getRadarPoints = (skillsArray: number[]) => {
    const centerX = 120
    const centerY = 120
    const maxVal = 100
    const maxRadius = 75
    
    return skillsArray.map((val, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
      const radius = (val / maxVal) * maxRadius
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      return `${x},${y}`
    }).join(" ")
  }

  const currentRadarPoints = getRadarPoints(currentSkills)
  const targetRadarPoints = getRadarPoints(targetSkills)

  // SVG Radar Grid Background Lines
  const radarGridCircles = [20, 40, 60, 80, 100].map((scale) => {
    return getRadarPoints([scale, scale, scale, scale, scale])
  })

  // SVG Radar Axis Lines
  const radarAxes = Array.from({ length: 5 }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
    const startX = 120
    const startY = 120
    const endX = 120 + 75 * Math.cos(angle)
    const endY = 120 + 75 * Math.sin(angle)
    return { startX, startY, endX, endY }
  })

  // Label coordinate calculation
  const labelPositions = Array.from({ length: 5 }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
    // Place labels slightly outside maximum radius (75 + 18 = 93)
    const x = 120 + 95 * Math.cos(angle)
    const y = 120 + 92 * Math.sin(angle)
    
    // Alignments helper
    let textAnchor: "middle" | "start" | "end" = "middle"
    if (Math.cos(angle) > 0.2) textAnchor = "start"
    if (Math.cos(angle) < -0.2) textAnchor = "end"
    
    return { x, y, textAnchor, label: radarLabels[i] }
  })

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24 text-foreground relative animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Map className="w-8 h-8 text-primary animate-pulse" />
            <span>Personalized Learning Path</span>
          </h1>
          <p className="text-muted-foreground mt-1">Follow your custom AI roadmap to build communication, coding, and collaborative project skills.</p>
        </div>
        
        <button 
          onClick={() => router.push('/student-dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground neu-button rounded-xl transition-all shadow-md self-start md:self-auto dark:bg-white/5 dark:border dark:border-white/10"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      {/* 3 Progress Cards Section */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Card 1: Overall Progress */}
        <LiquidGlassCard className="p-6 flex flex-col justify-between" accentColor="#6366f1">
          <div>
            <div className="flex items-center gap-2 mb-4 text-primary font-semibold uppercase tracking-wider text-xs">
              <Compass className="w-4 h-4" /> Overall Progress
            </div>
            <div className="text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-indigo-400">
              {overallProgressPercent}%
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden mb-3 neu-progress-track">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-black/5 dark:border-white/5 pt-3">
            <span>Roadmap Completion</span>
            <span className="font-semibold text-foreground dark:text-gray-200">{daysRemaining} days remaining</span>
          </div>
        </LiquidGlassCard>

        {/* Card 2: Daily Consistency */}
        <LiquidGlassCard className="p-6 flex flex-col justify-between" accentColor="#10b981">
          <div>
            <div className="flex items-center gap-2 mb-4 text-primary font-semibold uppercase tracking-wider text-xs">
              <Flame className="w-4 h-4" /> Daily Consistency
            </div>
            <div className="text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-indigo-300 dark:to-teal-400">
              {user.currentStreak} Days
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden mb-3 neu-progress-track">
              <div 
                className="h-full bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-indigo-500 dark:to-teal-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(user.currentStreak * 8, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-black/5 dark:border-white/5 pt-3">
            <span>Daily Streak Activity</span>
            <span className="font-semibold text-foreground dark:text-gray-200">{completedTasksCount}/{tasks.length} tasks today</span>
          </div>
        </LiquidGlassCard>

        {/* Card 3: Achievements & Badges */}
        <LiquidGlassCard className="p-6 flex flex-col justify-between" accentColor="#f59e0b">
          <div>
            <div className="flex items-center gap-2 mb-4 text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-wider text-xs">
              <Award className="w-4 h-4" /> Achievements
            </div>
            <div className="text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-300 dark:to-yellow-400">
              {badges.filter(b => b.earned).length} Badges
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden mb-3 neu-progress-track">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((badges.filter(b => b.earned).length / Math.max(badges.length, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-black/5 dark:border-white/5 pt-3">
            <span>Total Account XP</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> {user.xp.toLocaleString()} XP
            </span>
          </div>
        </LiquidGlassCard>
      </div>

      {/* timeline Journey Section */}
      <div className="neu-raised-lg rounded-3xl p-6 md:p-8 dark:bg-white/5 dark:border dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2 border-b border-black/10 dark:border-white/15 pb-4 text-foreground dark:text-white">
          <Compass className="w-6 h-6 text-primary dark:text-indigo-400" />
          <span>Personal Learning Journey Roadmap</span>
        </h2>

        <div className="relative pl-8 md:pl-12 border-l border-black/10 dark:border-white/15 space-y-12">
          
          {stageProgresses.map((sp, idx) => {
            const isCompleted = sp.status === "COMPLETED"
            const isActive = sp.status === "ACTIVE"
            const isLocked = sp.status === "LOCKED"
            
            const stageNum = sp.stageNumber
            
            // Icon mapping
            let StageIcon = BookOpen
            let stageColor = "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
            let progressFillColor = "bg-indigo-600 dark:bg-indigo-500"
            let stageTagText = "Stage 1 • Communication"
            
            if (stageNum === 2) {
              StageIcon = Code
              stageColor = "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
              progressFillColor = "bg-indigo-600 dark:bg-indigo-500"
              stageTagText = "Stage 2 • Coding"
            } else if (stageNum === 3) {
              StageIcon = Map
              stageColor = "text-indigo-600 dark:text-indigo-400 bg-indigo-400/10 border-indigo-400/30"
              progressFillColor = "bg-indigo-600 dark:bg-indigo-500"
              stageTagText = "Stage 3 • Collaborative Projects"
            } else if (stageNum === 4) {
              StageIcon = Briefcase
              stageColor = "text-amber-600 dark:text-amber-400 bg-amber-400/10 border-amber-400/30"
              progressFillColor = "bg-amber-500"
              stageTagText = "Stage 4 • Career Preparation"
            }

            return (
              <div key={sp.id} className="relative group">
                
                {/* Timeline Marker */}
                <span className={`absolute -left-[44px] md:-left-[60px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 z-10 ${
                  isCompleted ? "bg-indigo-600 dark:bg-indigo-500 text-white" :
                  isActive ? "bg-indigo-600 dark:bg-indigo-600 text-white scale-110 ring-4 ring-indigo-500/20" :
                  "neu-raised-sm text-muted-foreground dark:bg-[#0d111c] dark:border-white/20 dark:text-gray-500"
                }`}>
                  {isCompleted ? "✓" : stageNum}
                </span>

                <div className={`p-5 rounded-2xl neu-raised dark:bg-white/5 dark:border dark:border-white/10 transition-all duration-300 ${isLocked ? "opacity-60 grayscale-[0.4]" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${stageColor}`}>
                      <StageIcon className="w-3.5 h-3.5" />
                      {stageTagText}
                    </span>
                    
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto ${
                      isCompleted ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" :
                      isActive ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse" :
                      "neu-flat text-muted-foreground dark:bg-white/5 dark:text-gray-400"
                    }`}>
                      {isCompleted ? "Completed" : isActive ? "Active" : "Locked"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground dark:text-white mb-2 flex items-center gap-2">
                    {stageNum === 1 && "Communication & Interpersonal Skills"}
                    {stageNum === 2 && "Coding Fundamentals"}
                    {stageNum === 3 && "Collaborative Real-World Projects"}
                    {stageNum === 4 && "Career & Placement Preparation"}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {stageNum === 1 && "Master English communication, voice modulation, and vocabulary. Overcome anxiety and practice speaking using AI feedback and group discussion boards."}
                    {stageNum === 2 && "Learn basic algorithm logic, arrays, and string operations. Solve coding problems in 7+ languages, compiled instantly with automated reviews."}
                    {stageNum === 3 && "Work in structured teams. Create files, collaborate inside coding repositories, manage issues, and get review scores on pull requests."}
                    {stageNum === 4 && "Optimize your resume to score highly in ATS filters, conduct mock interviews using interactive web engines, and practice logical aptitude tests."}
                  </p>

                  {/* Stage Progress Bar */}
                  {!isLocked && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                        <span>Stage Progress</span>
                        <span>{isCompleted ? "100%" : `${user.level * 6 + 10}%`}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden neu-progress-track">
                        <div 
                          className={`h-full rounded-full ${progressFillColor}`}
                          style={{ width: isCompleted ? "100%" : `${user.level * 6 + 10}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stage Actions */}
                  <div className="flex flex-wrap gap-3">
                    {isLocked ? (
                      <>
                        <button className="px-4 py-2 neu-flat text-muted-foreground text-xs font-semibold rounded-xl cursor-not-allowed flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" /> Unlock Stage
                        </button>
                        <button 
                          onClick={() => handlePreviewStage(stageNum)}
                          className="px-4 py-2 neu-button text-foreground dark:text-gray-300 text-xs font-semibold rounded-xl transition-all dark:bg-white/5 dark:border-white/10"
                        >
                          Preview Features
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEnterStage(stageNum)}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md neu-button"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Enter Stage {stageNum}
                        </button>
                        <button 
                          onClick={() => handleViewDetails(stageNum, sp.stageName)}
                          className="px-4 py-2 neu-button text-foreground dark:text-gray-300 text-xs font-semibold rounded-xl transition-all dark:bg-white/5 dark:border-white/10"
                        >
                          View Statistics
                        </button>
                        <button 
                          onClick={() => handleWeeklyPlan(stageNum)}
                          className="px-4 py-2 neu-button text-foreground dark:text-gray-300 text-xs font-semibold rounded-xl transition-all dark:bg-white/5 dark:border-white/10"
                        >
                          Weekly Plan
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Stage 5 Alumni static */}
          <div className="relative group">
            <span className="absolute -left-[44px] md:-left-[60px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm neu-raised-sm text-primary dark:bg-[#0d111c] dark:border-indigo-500/20 dark:text-indigo-400/60 shadow-md">
              5
            </span>
            <div className="p-5 rounded-2xl neu-flat opacity-60 grayscale-[0.4] dark:bg-white/5 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Stage 5 • Alumni & Mentorship
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full neu-inset-xs text-muted-foreground dark:bg-white/5 dark:text-gray-400">
                  Locked
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">Alumni Community & Peer Mentoring</h3>
              <p className="text-sm text-muted-foreground mb-4">Give back to the community. Unlock mentoring options, evaluate speaking tests, support juniors, and connect with global alumni networks.</p>
              <button className="px-4 py-2 neu-flat text-muted-foreground text-xs font-semibold rounded-xl cursor-not-allowed">
                Final Destination
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Tasks Section */}
      <div className="neu-raised-lg rounded-3xl p-6 md:p-8 dark:bg-white/5 dark:border dark:border-white/10 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-black/10 dark:border-white/15 pb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-foreground dark:text-white tracking-tight">Today's Daily Roadmap Tasks</h2>
          </div>
          <button 
            onClick={handleRefreshTasks}
            className="flex items-center gap-2 px-3.5 py-1.5 neu-button text-muted-foreground hover:text-foreground rounded-xl text-xs font-semibold transition-all dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Daily Tasks
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tasks.map((task) => {
            const catColors: Record<string, string> = {
              voice: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
              vocabulary: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
              communication: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
              pronunciation: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
              coding: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
              project: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
              career: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }
            return (
              <div 
                key={task.id} 
                className={`p-5 rounded-2xl neu-inset transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between dark:bg-[#090b11]/50 ${
                  task.completed ? "border-indigo-500/20 hover:border-indigo-500/40" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${catColors[task.category] || "neu-raised-xs"}`}>
                      {task.category}
                    </span>
                    <span className={`text-xs font-semibold flex items-center gap-1 ${task.completed ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"}`}>
                      {task.completed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </>
                      ) : "Pending"}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground dark:text-white text-base mb-1.5 flex items-start gap-2">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-black/20 dark:border-white/20 shrink-0 mt-0.5" />
                    )}
                    <span>{task.title}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{task.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-black/5 dark:border-white/5 pt-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span><Clock className="w-3.5 h-3.5 inline mr-1 text-primary dark:text-indigo-400" />{task.timeEstimate} mins</span>
                      <span className="capitalize">{task.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-yellow-400">
                      <Coins className="w-3.5 h-3.5" /> +{task.coinsReward} credits
                      <span className="text-primary dark:text-indigo-400 ml-1">+{task.xpReward} XP</span>
                    </div>
                  </div>

                  {!task.completed && (
                    <button 
                      onClick={() => handleStartTask(task)}
                      className="w-full py-2 neu-button text-foreground dark:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm dark:bg-white/5 dark:border-white/10"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary dark:text-indigo-400" /> Start Task
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Learning Analytics premium SVG section */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Chart 1: Time Spent Doughnut */}
        <div className="neu-raised-lg rounded-3xl p-6 dark:bg-white/5 dark:border dark:border-white/10">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground dark:text-white border-b border-black/10 dark:border-white/10 pb-3">
            <Clock className="w-5 h-5 text-primary dark:text-indigo-400" />
            <span>Time Distribution Analytics</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            
            {/* SVG Donut */}
            <div className="relative w-40 h-40 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="30" fill="transparent" stroke="rgba(0,0,0,0.08)" strokeWidth="8" className="dark:stroke-white/5" />
                
                {/* Segments */}
                <circle cx="50" cy="50" r="30" fill="transparent" stroke="#6366f1" strokeWidth="8" 
                  strokeDasharray="75.4 188.5" strokeDashoffset="0" className="hover:scale-105 transition-transform duration-300"
                />
                <circle cx="50" cy="50" r="30" fill="transparent" stroke="#4f46e5" strokeWidth="8" 
                  strokeDasharray="47.1 188.5" strokeDashoffset="-75.4" className="hover:scale-105 transition-transform duration-300"
                />
                <circle cx="50" cy="50" r="30" fill="transparent" stroke="#10b981" strokeWidth="8" 
                  strokeDasharray="37.7 188.5" strokeDashoffset="-122.5" className="hover:scale-105 transition-transform duration-300"
                />
                <circle cx="50" cy="50" r="30" fill="transparent" stroke="#f59e0b" strokeWidth="8" 
                  strokeDasharray="28.3 188.5" strokeDashoffset="-160.2" className="hover:scale-105 transition-transform duration-300"
                />
              </svg>
              {/* Centered label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-foreground dark:text-white">4.8h</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Today</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 flex-1 w-full sm:w-auto">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-sm" />
                  <span>Communication</span>
                </div>
                <span className="font-bold text-foreground dark:text-gray-200">40%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm" />
                  <span>Coding Prep</span>
                </div>
                <span className="font-bold text-foreground dark:text-gray-200">25%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span>Team Projects</span>
                </div>
                <span className="font-bold text-foreground dark:text-gray-200">20%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                  <span>Career Prep</span>
                </div>
                <span className="font-bold text-foreground dark:text-gray-200">15%</span>
              </div>
            </div>

          </div>
        </div>

        {/* Chart 2: Skill Development Radar Chart */}
        <div className="neu-raised-lg rounded-3xl p-6 dark:bg-white/5 dark:border dark:border-white/10">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground dark:text-white border-b border-black/10 dark:border-white/10 pb-3">
            <Compass className="w-5 h-5 text-primary dark:text-indigo-400" />
            <span>Skill Growth Distribution</span>
          </h3>

          <div className="flex flex-col items-center justify-center py-2 relative">
            <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
              
              {/* Concentric Grid lines */}
              {radarGridCircles.map((points, idx) => (
                <polygon 
                  key={idx} 
                  points={points} 
                  fill="none" 
                  stroke="rgba(0, 0, 0, 0.08)" 
                  strokeWidth="1" 
                  className="dark:stroke-white/10"
                />
              ))}

              {/* Axis Web lines */}
              {radarAxes.map((axis, idx) => (
                <line 
                  key={idx}
                  x1={axis.startX}
                  y1={axis.startY}
                  x2={axis.endX}
                  y2={axis.endY}
                  stroke="rgba(0, 0, 0, 0.08)"
                  strokeWidth="1"
                  className="dark:stroke-white/10"
                />
              ))}

              {/* Target Area Polygon */}
              <polygon 
                points={targetRadarPoints}
                fill="rgba(16, 185, 129, 0.08)"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />

              {/* Current Area Polygon */}
              <polygon 
                points={currentRadarPoints}
                fill="rgba(79, 70, 229, 0.22)"
                stroke="#4f46e5"
                strokeWidth="2"
              />

              {/* Data points dots */}
              {currentRadarPoints.split(" ").map((pt, idx) => {
                const [cx, cy] = pt.split(",")
                return (
                  <circle 
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill="#4f46e5"
                    stroke="#ffffff"
                    strokeWidth="1"
                    className="hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                )
              })}

              {/* Labels */}
              {labelPositions.map((p, idx) => (
                <text
                  key={idx}
                  x={p.x}
                  y={p.y}
                  textAnchor={p.textAnchor}
                  fill="#5c6370"
                  fontSize="8.5"
                  fontWeight="bold"
                  className="font-sans tracking-wide dark:fill-slate-400"
                >
                  {p.label}
                </text>
              ))}
            </svg>

            {/* Small Legend */}
            <div className="flex gap-6 mt-6 justify-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-primary dark:text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Current Skills
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-dashed border-emerald-400 fill-none" /> Target Goals
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Earned Badges Section */}
      <div className="neu-raised-lg rounded-3xl p-6 md:p-8 dark:bg-white/5 dark:border dark:border-white/10 relative">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-black/10 dark:border-white/15 pb-4 text-foreground dark:text-white">
          <Award className="w-6 h-6 text-primary dark:text-indigo-400" />
          <span>Earned Badges & Achievements</span>
        </h2>

        {badges.filter(b => b.earned).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground font-medium">
            No badges unlocked yet. Complete stage challenges to earn credentials!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2.5 text-center transition-all duration-300 relative group ${
                  badge.earned 
                    ? "neu-raised hover:scale-105 dark:bg-black/20 dark:border-white/10" 
                    : "neu-inset opacity-50 grayscale dark:bg-black/40 dark:border-white/5"
                }`}
              >
                {!badge.earned && <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-muted-foreground" />}
                
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  badge.earned 
                    ? "neu-raised-sm group-hover:scale-110 dark:bg-white/10 dark:border-white/20" 
                    : "neu-inset-sm dark:bg-black/40"
                }`}>
                  <BadgeIcon iconUrl={badge.iconUrl} name={badge.name} />
                </div>
                
                <div>
                  <h4 className="font-bold text-xs text-foreground dark:text-gray-200 leading-snug">{badge.name}</h4>
                  <p className="text-[9px] text-muted-foreground mt-1 font-medium leading-relaxed">{badge.description}</p>
                  
                  {badge.earned && badge.earnedAt && (
                    <span className="inline-block text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/10 px-1.5 py-0.5 rounded-full mt-2">
                      {new Date(badge.earnedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Custom path Form Section */}
      <div className="neu-raised-lg rounded-3xl p-6 md:p-8 dark:bg-gradient-to-br dark:from-indigo-950/20 dark:to-indigo-950/20 dark:border-indigo-500/10 relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-xl mx-auto text-center md:text-left">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-indigo-400 mb-2 flex flex-col md:flex-row items-center gap-2.5 justify-center md:justify-start">
            <Sparkles className="w-7 h-7 text-primary dark:text-indigo-400 animate-bounce" />
            <span>Request custom AI Learning Path</span>
          </h2>
          <p className="text-muted-foreground text-sm mb-8">Tell our AI engine about your primary goals and focus areas. We will automatically custom-tailor a learning syllabus for your career development.</p>

          <div className="space-y-6 text-left">
            
            {/* Focus areas group */}
            <div>
              <label className="block text-sm font-semibold text-foreground dark:text-gray-300 mb-2.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-primary dark:text-indigo-400" /> Focus Development Areas
              </label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { value: "communication", label: "Communication & Soft Skills" },
                  { value: "programming", label: "Core Programming" },
                  { value: "datascience", label: "Data Science" },
                  { value: "webdev", label: "Web Development" },
                  { value: "ai-ml", label: "AI & Machine Learning" }
                ].map((item) => {
                  const isSelected = focusAreas.includes(item.value)
                  return (
                    <button
                      key={item.value}
                      onClick={() => toggleFocusArea(item.value)}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-500/20 border-indigo-400 text-indigo-700 dark:text-indigo-300 neu-raised-sm" 
                          : "neu-flat text-muted-foreground hover:text-foreground dark:bg-white/5 dark:border-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Duration Select */}
            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-foreground dark:text-gray-300 mb-2.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary dark:text-indigo-400" /> Duration of Path
              </label>
              <select 
                id="duration"
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="w-full neu-input rounded-xl px-4 py-3 text-sm font-medium text-foreground dark:bg-[#0d101b] dark:text-gray-300 dark:border-white/10 focus:outline-none focus:border-indigo-400 transition-colors"
              >
                <option value="30">30 Days (Fast Track)</option>
                <option value="60">60 Days (Recommended)</option>
                <option value="90">90 Days (Comprehensive)</option>
                <option value="180">180 Days (Deep Professional learning)</option>
              </select>
            </div>

            {/* Goal Textarea */}
            <div>
              <label htmlFor="goals" className="block text-sm font-semibold text-foreground dark:text-gray-300 mb-2.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary dark:text-indigo-400" /> Outline Your Goals
              </label>
              <textarea 
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={3}
                placeholder="Describe what you want to achieve (e.g. 'I want to build a React Next.js project and improve speech confidence in presentations')"
                className="w-full neu-input rounded-xl px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground dark:bg-[#0d101b] dark:text-gray-300 focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Generate Button */}
            <button 
              onClick={handleGeneratePath}
              disabled={isGenerating}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl text-sm font-bold transition-all neu-button flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Generating..." : "Generate AI Learning Roadmap"}
            </button>

          </div>
        </div>
      </div>

      {/* Render AI custom result path overlay modal */}
      <AnimatePresence>
        {generatedPath && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#0d111c] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <span>AI Learning Roadmap is Ready!</span>
              </h3>
              
              <div className="space-y-4 text-sm text-gray-300 border-t border-b border-white/10 py-5 my-5">
                <p><strong>Focus Development Areas:</strong> {generatedPath.focusAreas.join(", ")}</p>
                <p><strong>Timeline:</strong> {generatedPath.duration} days schedule roadmap</p>
                <p><strong>Outlined Goal:</strong> "{generatedPath.goals}"</p>
                <p className="text-xs text-gray-400 mt-4 leading-relaxed bg-white/5 border border-white/5 rounded-xl p-4">
                  🚀 <strong>Next Steps:</strong> We have generated a custom checklist aligning with your goal. Stage 1 Voice Tasks and Stage 2 programming challenges are now unlocked dynamically on your timeline to match this requirement. Go ahead and start your first challenge!
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setGeneratedPath(null)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  Enter Roadmap
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {showLoading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center">
            <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
            <div className="absolute inset-0 w-10 h-10 border border-indigo-500/20 rounded-full blur-[8px]" />
          </div>
          <div className="mt-4 text-sm font-semibold text-gray-200">{loadingText}</div>
        </div>
      )}

      {/* Dynamic Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[9999] p-4 rounded-2xl border shadow-xl flex items-center gap-3 max-w-sm backdrop-blur-xl ${
              toast.type === "success" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" :
              toast.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" :
              toast.type === "warning" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
              "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 shrink-0" />}
            {toast.type === "warning" && <AlertCircle className="w-5 h-5 shrink-0" />}
            {toast.type === "info" && <Compass className="w-5 h-5 shrink-0" />}
            
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold capitalize">{toast.type}</span>
              <span className="text-xs text-gray-300 font-medium leading-relaxed">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
