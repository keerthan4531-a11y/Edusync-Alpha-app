"use client"

import { useState, useEffect } from "react"
import { 
  BookOpen, Code, Award, Flame, Play, CheckCircle2, 
  AlertCircle, Sparkles, ArrowLeft, RefreshCw, Lock, 
  HelpCircle, ChevronRight, Check, BookOpenCheck, ExternalLink,
  ChevronLeft, Terminal
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Editor from "@monaco-editor/react"

interface ModuleTopic {
  id: string
  title: string
  topics: string[]
  exercises: number
  credits: number
}

interface Course {
  id: string
  title: string
  icon: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  modules: number
  exercisesCount: number
  duration: string
  prerequisites: string[]
  credits: number
  modules_list: ModuleTopic[]
}

// Course Data copied from FastAPI prototype
const LANGUAGE_COURSES: Record<string, Course> = {
  c: {
    id: "c",
    title: "C Programming Mastery",
    icon: "c",
    description: "Learn the fundamentals of C programming language - the mother of all modern languages.",
    difficulty: "beginner",
    modules: 12,
    exercisesCount: 50,
    duration: "6 weeks",
    prerequisites: [],
    credits: 500,
    modules_list: [
      {
        id: "c_mod_1",
        title: "Introduction to C",
        topics: ["History of C", "Setting up environment", "Your first C program"],
        exercises: 1,
        credits: 30
      },
      {
        id: "c_mod_2",
        title: "Variables & Data Types",
        topics: ["Data types in C", "Variables declaration", "Constants", "Type casting"],
        exercises: 1,
        credits: 40
      },
      {
        id: "c_mod_3",
        title: "Operators",
        topics: ["Arithmetic operators", "Relational operators", "Logical operators", "Bitwise operators"],
        exercises: 1,
        credits: 35
      },
      {
        id: "c_mod_4",
        title: "Control Flow",
        topics: ["If-else statements", "Switch case", "Loops (for, while, do-while)", "Break and continue"],
        exercises: 1,
        credits: 50
      },
      {
        id: "c_mod_5",
        title: "Functions",
        topics: ["Function declaration & definition", "Parameters & return values", "Recursion", "Scope of variables"],
        exercises: 1,
        credits: 45
      },
      {
        id: "c_mod_6",
        title: "Arrays",
        topics: ["One-dimensional arrays", "Multi-dimensional arrays", "Arrays and functions", "Sorting arrays"],
        exercises: 1,
        credits: 55
      },
      {
        id: "c_mod_7",
        title: "Pointers",
        topics: ["Pointer basics", "Pointers and arrays", "Pointers and functions", "Dynamic memory allocation"],
        exercises: 1,
        credits: 65
      },
      {
        id: "c_mod_8",
        title: "Strings",
        topics: ["String basics", "String functions", "String manipulation", "Character functions"],
        exercises: 1,
        credits: 45
      },
      {
        id: "c_mod_9",
        title: "Structures & Unions",
        topics: ["Structure definition", "Nested structures", "Unions", "Typedef"],
        exercises: 1,
        credits: 40
      },
      {
        id: "c_mod_10",
        title: "File Handling",
        topics: ["File operations", "Reading from files", "Writing to files", "Error handling"],
        exercises: 1,
        credits: 50
      },
      {
        id: "c_mod_11",
        title: "Advanced Topics",
        topics: ["Preprocessor directives", "Command line arguments", "Function pointers", "Bit fields"],
        exercises: 1,
        credits: 45
      },
      {
        id: "c_mod_12",
        title: "Final Project",
        topics: ["Complete a mini project", "Code review", "Best practices"],
        exercises: 1,
        credits: 100
      }
    ]
  },
  cpp: {
    id: "cpp",
    title: "C++ Object-Oriented Programming",
    icon: "cpp",
    description: "Master C++ with object-oriented programming concepts, STL, and modern C++ features.",
    difficulty: "intermediate",
    modules: 10,
    exercisesCount: 45,
    duration: "5 weeks",
    prerequisites: ["c"],
    credits: 600,
    modules_list: [
      {
        id: "cpp_mod_1",
        title: "C++ Basics",
        topics: ["C vs C++", "C++ features", "Namespace", "I/O streams"],
        exercises: 1,
        credits: 35
      },
      {
        id: "cpp_mod_2",
        title: "OOP Fundamentals",
        topics: ["Classes & Objects", "Constructors & Destructors", "Encapsulation", "Abstraction"],
        exercises: 1,
        credits: 45
      },
      {
        id: "cpp_mod_3",
        title: "Inheritance",
        topics: ["Types of inheritance", "Access specifiers", "Multiple inheritance", "Virtual base class"],
        exercises: 1,
        credits: 50
      },
      {
        id: "cpp_mod_4",
        title: "Polymorphism",
        topics: ["Function overloading", "Operator overloading", "Virtual functions", "Abstract classes"],
        exercises: 1,
        credits: 60
      },
      {
        id: "cpp_mod_5",
        title: "Templates",
        topics: ["Function templates", "Class templates", "Template specialization", "STL overview"],
        exercises: 1,
        credits: 45
      },
      {
        id: "cpp_mod_6",
        title: "Exception Handling",
        topics: ["Try-catch block", "Throw statement", "Standard exceptions", "Custom exceptions"],
        exercises: 1,
        credits: 35
      },
      {
        id: "cpp_mod_7",
        title: "STL Containers",
        topics: ["Vectors", "Lists", "Maps", "Sets", "Queues & Stacks"],
        exercises: 1,
        credits: 65
      },
      {
        id: "cpp_mod_8",
        title: "STL Algorithms",
        topics: ["Sorting algorithms", "Searching algorithms", "Transform operations", "Iterators"],
        exercises: 1,
        credits: 55
      },
      {
        id: "cpp_mod_9",
        title: "Modern C++",
        topics: ["Smart pointers", "Lambda expressions", "Move semantics", "Auto keyword"],
        exercises: 1,
        credits: 50
      },
      {
        id: "cpp_mod_10",
        title: "C++ Project",
        topics: ["Design patterns", "Multi-file projects", "Build systems", "Testing"],
        exercises: 1,
        credits: 120
      }
    ]
  },
  python: {
    id: "python",
    title: "Python Programming & Data Science",
    icon: "python",
    description: "Learn Python for automation, data analysis, web development, and machine learning.",
    difficulty: "intermediate",
    modules: 15,
    exercisesCount: 60,
    duration: "8 weeks",
    prerequisites: ["c", "cpp"],
    credits: 800,
    modules_list: [
      {
        id: "py_mod_1",
        title: "Python Basics",
        topics: ["Python installation", "Variables & data types", "Basic I/O", "Comments"],
        exercises: 1,
        credits: 30
      },
      {
        id: "py_mod_2",
        title: "Control Structures",
        topics: ["Conditional statements", "Loops", "Break & continue", "Pass statement"],
        exercises: 1,
        credits: 40
      },
      {
        id: "py_mod_3",
        title: "Functions",
        topics: ["Function definition", "Parameters & arguments", "Lambda functions", "Decorators"],
        exercises: 1,
        credits: 45
      },
      {
        id: "py_mod_4",
        title: "Data Structures",
        topics: ["Lists", "Tuples", "Sets", "Dictionaries", "Comprehensions"],
        exercises: 1,
        credits: 55
      },
      {
        id: "py_mod_5",
        title: "File Handling",
        topics: ["Reading files", "Writing files", "CSV & JSON", "Exception handling"],
        exercises: 1,
        credits: 40
      },
      {
        id: "py_mod_6",
        title: "OOP in Python",
        topics: ["Classes & objects", "Inheritance", "Polymorphism", "Magic methods"],
        exercises: 1,
        credits: 50
      },
      {
        id: "py_mod_7",
        title: "Modules & Packages",
        topics: ["Importing modules", "Creating packages", "Standard library", "Virtual environments"],
        exercises: 1,
        credits: 40
      },
      {
        id: "py_mod_8",
        title: "Error Handling",
        topics: ["Try-except blocks", "Custom exceptions", "Finally clause", "Assertions"],
        exercises: 1,
        credits: 35
      },
      {
        id: "py_mod_9",
        title: "Regular Expressions",
        topics: ["Pattern matching", "Search & replace", "Special sequences", "Flags"],
        exercises: 1,
        credits: 45
      },
      {
        id: "py_mod_10",
        title: "NumPy Basics",
        topics: ["Arrays creation", "Array operations", "Indexing & slicing", "Broadcasting"],
        exercises: 1,
        credits: 55
      },
      {
        id: "py_mod_11",
        title: "Pandas Basics",
        topics: ["DataFrames", "Series", "Data cleaning", "Data aggregation"],
        exercises: 1,
        credits: 65
      },
      {
        id: "py_mod_12",
        title: "Matplotlib Visualization",
        topics: ["Line plots", "Bar charts", "Histograms", "Scatter plots"],
        exercises: 1,
        credits: 60
      },
      {
        id: "py_mod_13",
        title: "Web Scraping",
        topics: ["BeautifulSoup", "Requests library", "HTML parsing", "Data extraction"],
        exercises: 1,
        credits: 50
      },
      {
        id: "py_mod_14",
        title: "API Integration",
        topics: ["REST APIs", "HTTP methods", "Authentication", "JSON handling"],
        exercises: 1,
        credits: 55
      },
      {
        id: "py_mod_15",
        title: "Final Project",
        topics: ["Complete data analysis project", "Visualization", "Report generation", "Deployment"],
        exercises: 1,
        credits: 150
      }
    ]
  }
}

interface DBProgress {
  id: string
  userId: string
  language: string
  completedExercises: number
  totalCredits: number
  currentStreak: number
  updatedAt: string
}

interface PracticeExercise {
  title: string
  description: string
  code_template: string
  test_cases?: { input: string; output: string }[]
}

const PRACTICE_EXERCISES: Record<string, PracticeExercise[]> = {
  // C Exercises
  c_mod_1: [{
    title: "Print Hello World",
    description: "Write a program in C that prints 'Hello, World!' followed by a newline to stdout.",
    code_template: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    printf(\"Hello, World!\\n\");\n    return 0;\n}"
  }],
  c_mod_2: [{
    title: "Variables and Math",
    description: "Declare two integer variables a and b, assign values 10 and 20 respectively, and print their sum as an integer.",
    code_template: "#include <stdio.h>\n\nint main() {\n    int a = 10;\n    int b = 20;\n    // Print their sum\n    printf(\"%d\\n\", a + b);\n    return 0;\n}"
  }],
  c_mod_3: [{
    title: "Logical Operators",
    description: "Write a program that takes two integer states (0 or 1) and prints the result of the logical AND operation.",
    code_template: "#include <stdio.h>\n\nint main() {\n    int x = 1;\n    int y = 0;\n    printf(\"%d\\n\", x && y);\n    return 0;\n}"
  }],
  // CPP Exercises
  cpp_mod_1: [{
    title: "C++ Streams I/O",
    description: "Write a C++ program that prints 'Welcome to C++' using standard std::cout streams.",
    code_template: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Welcome to C++\" << endl;\n    return 0;\n}"
  }],
  cpp_mod_2: [{
    title: "Basic Class Structure",
    description: "Define a simple Class named Student that has a public function greet() which prints 'Hello Student'.",
    code_template: "#include <iostream>\nusing namespace std;\n\nclass Student {\npublic:\n    void greet() {\n        cout << \"Hello Student\" << endl;\n    }\n};\n\nint main() {\n    Student s;\n    s.greet();\n    return 0;\n}"
  }],
  // Python Exercises
  py_mod_1: [{
    title: "Print Statement",
    description: "Write a Python program that prints the phrase 'Hello Python'.",
    code_template: "# Print hello statement here\nprint(\"Hello Python\")"
  }],
  py_mod_2: [{
    title: "Iterate Range",
    description: "Use a for loop to iterate from 1 to 5 (inclusive) and print each number on a new line.",
    code_template: "# Loop and print values\nfor i in range(1, 6):\n    print(i)"
  }]
}

// Fallback/Default exercises for unmapped modules
const getExerciseForModule = (moduleId: string, lang: string): PracticeExercise => {
  if (PRACTICE_EXERCISES[moduleId]) {
    return PRACTICE_EXERCISES[moduleId][0]
  }

  // Create dynamic exercise
  const moduleName = moduleId.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  if (lang.toLowerCase() === "python") {
    return {
      title: `${moduleName} Practice`,
      description: `Write a simple program to practice the concepts of ${moduleName}. Make sure it executes correctly without syntax errors.`,
      code_template: `# Practice ${moduleName}\ndef main():\n    print("Concepts practiced successfully")\n\nif __name__ == "__main__":\n    main()`
    }
  } else {
    return {
      title: `${moduleName} Practice`,
      description: `Write a basic C/C++ program to practice the topics of ${moduleName}.`,
      code_template: `#include <stdio.h>\n\nint main() {\n    // Practice ${moduleName}\n    printf("Concepts practiced successfully\\n");\n    return 0;\n}`
    }
  }
}

export default function LanguageCoursesPage() {
  const [courseProgress, setCourseProgress] = useState<Record<string, DBProgress | null>>({
    C: null,
    CPP: null,
    PYTHON: null
  })
  
  // Navigation & focus states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentModuleIdx, setCurrentModuleIdx] = useState<number>(0)
  const [mobileTab, setMobileTab] = useState<"theory" | "coding">("theory")
  
  // Code Workspace states
  const [code, setCode] = useState("")
  const [runningCode, setRunningCode] = useState(false)
  const [submittingSolution, setSubmittingSolution] = useState(false)
  const [runOutput, setRunOutput] = useState("")
  const [runError, setRunError] = useState("")
  const [aiFeedback, setAiFeedback] = useState("")
  
  // States
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" })

  const fetchProgress = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const res = await fetch("/api/student/language-courses")
      if (res.ok) {
        const data = await res.json()
        setCourseProgress({
          C: data.C?.id ? data.C : null,
          CPP: data.CPP?.id ? data.CPP : null,
          PYTHON: data.PYTHON?.id ? data.PYTHON : null
        })
      }
    } catch (err) {
      console.error("Failed to load language courses progress", err)
      setStatusMessage({ type: "error", message: "Failed to fetch student progress roadmap." })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProgress()
  }, [])

  const canAccessCourse = (courseId: string) => {
    const course = LANGUAGE_COURSES[courseId]
    if (!course) return false

    // Check prerequisites
    return course.prerequisites.every(preReq => {
      const progress = courseProgress[preReq.toUpperCase()]
      // A course is completed if the completedExercises matches or exceeds the module list count. Let's say at least 3 completed exercises or active status
      return progress !== null && progress.completedExercises >= 3
    })
  }

  const handleStartCourse = (course: Course) => {
    if (course.prerequisites.length > 0 && !canAccessCourse(course.id)) {
      setStatusMessage({ 
        type: "error", 
        message: `Prerequisites not met. Complete ${course.prerequisites.map(p => p.toUpperCase()).join(", ")} first.` 
      })
      setTimeout(() => setStatusMessage({ type: null, message: "" }), 3000)
      return
    }

    setSelectedCourse(course)
    
    // Find first incomplete module or start from index 0
    const progress = courseProgress[course.id.toUpperCase()]
    const startIdx = progress ? Math.min(progress.completedExercises, course.modules_list.length - 1) : 0
    setCurrentModuleIdx(startIdx)
    
    // Load default exercise
    const mod = course.modules_list[startIdx]
    const ex = getExerciseForModule(mod.id, course.id)
    setCode(ex.code_template)
    setRunOutput("")
    setRunError("")
    setAiFeedback("")
    setMobileTab("theory")
  }

  const handleLoadModule = (idx: number) => {
    if (!selectedCourse) return
    setCurrentModuleIdx(idx)
    
    const mod = selectedCourse.modules_list[idx]
    const ex = getExerciseForModule(mod.id, selectedCourse.id)
    setCode(ex.code_template)
    setRunOutput("")
    setRunError("")
    setAiFeedback("")
  }

  const handleRunCode = async () => {
    if (!selectedCourse) return
    if (!code.trim()) {
      setRunError("Please write code content first.")
      return
    }

    setRunningCode(true)
    setRunOutput("")
    setRunError("")
    setAiFeedback("")

    try {
      const res = await fetch("/api/student/language-courses/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedCourse.id,
          code,
          module_id: selectedCourse.modules_list[currentModuleIdx].id
        })
      })

      const data = await res.json()
      if (res.ok) {
        if (data.success || !data.error) {
          setRunOutput(data.output || "Sandbox execution passed with empty console output.")
        } else {
          setRunError(data.error)
          if (data.ai_hint) {
            setAiFeedback(data.ai_hint)
          }
        }
      } else {
        setRunError(data.error || "Failed to run program in sandbox.")
      }
    } catch (err) {
      console.error("Run code failed", err)
      setRunError("Network communication error with Judge0 helper.")
    } finally {
      setRunningCode(false)
    }
  }

  const handleSubmitExercise = async () => {
    if (!selectedCourse) return
    if (!code.trim()) {
      setStatusMessage({ type: "error", message: "Cannot submit empty solution." })
      return
    }

    setSubmittingSolution(true)
    setRunOutput("")
    setRunError("")
    setAiFeedback("")

    try {
      const res = await fetch("/api/student/language-courses/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedCourse.id,
          code,
          module_id: selectedCourse.modules_list[currentModuleIdx].id
        })
      })

      const data = await res.json()
      if (res.ok) {
        if (data.passed) {
          setStatusMessage({ 
            type: "success", 
            message: `Congratulations! Code review score: ${data.score}%. Exercises updated!` 
          })
          if (data.ai_feedback) {
            setAiFeedback(data.ai_feedback)
          }

          // Fetch fresh progress roadmaps
          fetchProgress(true)
          
          setTimeout(() => setStatusMessage({ type: null, message: "" }), 4000)
        } else {
          setRunError(data.error || "Solution grading score too low to unlock next modules.")
          if (data.ai_feedback) {
            setAiFeedback(data.ai_feedback)
          }
        }
      } else {
        setRunError(data.error || "Grading execution error.")
      }
    } catch (err) {
      console.error("Submission failed", err)
      setRunError("Connection timeout during grading validation.")
    } finally {
      setSubmittingSolution(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full gap-6 text-white pb-6 max-w-6xl mx-auto">
      {/* Top Banner Status */}
      {statusMessage.type && (
        <div className={cn(
          "p-4 rounded-2xl border text-sm flex items-center gap-3 shrink-0 mx-4 md:mx-0 shadow-lg",
          statusMessage.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
          {statusMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-medium">{statusMessage.message}</span>
        </div>
      )}

      {!selectedCourse ? (
        // DASHBOARD ROADMAPS GRID
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto px-4 md:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Language Courses</h1>
              <p className="text-gray-400 mt-1">Upgrade your coding proficiency in sequential learning roadmaps.</p>
            </div>
            <button 
              onClick={() => fetchProgress(true)}
              disabled={refreshing}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all text-gray-300 hover:text-white"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </button>
          </div>

          {/* Leaderboard stats box */}
          <div className="grid gap-6 sm:grid-cols-3">
            <LiquidGlassCard className="p-5 flex items-center gap-4 border-indigo-500/20" accentColor="#818cf8">
              <Award className="w-8 h-8 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">C Progress</span>
                <span className="text-xl font-black text-white">
                  {courseProgress.C ? `${courseProgress.C.completedExercises}/12 Modules` : "0/12 Modules"}
                </span>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-5 flex items-center gap-4 border-indigo-500/20" accentColor="#38bdf8">
              <BookOpenCheck className="w-8 h-8 text-sky-400 shrink-0" />
              <div>
                <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">C++ Progress</span>
                <span className="text-xl font-black text-white">
                  {courseProgress.CPP ? `${courseProgress.CPP.completedExercises}/10 Modules` : "0/10 Modules"}
                </span>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-5 flex items-center gap-4 border-indigo-500/20" accentColor="#a78bfa">
              <Flame className="w-8 h-8 text-purple-400 shrink-0" />
              <div>
                <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Python Progress</span>
                <span className="text-xl font-black text-white">
                  {courseProgress.PYTHON ? `${courseProgress.PYTHON.completedExercises}/15 Modules` : "0/15 Modules"}
                </span>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Courses Roadmap List */}
          <div className="flex flex-col gap-6 mt-4">
            <h2 className="text-lg font-bold text-gray-300">Available Learning Roadmaps</h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              {Object.values(LANGUAGE_COURSES).map(course => {
                const progress = courseProgress[course.id.toUpperCase()]
                const isLocked = course.prerequisites.length > 0 && !canAccessCourse(course.id)
                const isCompleted = progress !== null && progress.completedExercises >= course.modules_list.length
                
                // Calculate percentage progress
                const completedModules = progress ? progress.completedExercises : 0
                const percent = Math.round((completedModules / course.modules_list.length) * 100)

                return (
                  <div 
                    key={course.id}
                    onClick={() => !isLocked && handleStartCourse(course)}
                    className={cn(
                      "group rounded-[2rem] overflow-hidden transition-all duration-300 relative border",
                      isLocked 
                        ? "bg-black/40 border-white/5 opacity-60 cursor-not-allowed" 
                        : "bg-white/5 border-white/10 hover:border-white/20 cursor-pointer hover:scale-[1.02] shadow-xl"
                    )}
                  >
                    {/* Locked overlay lock icon */}
                    {isLocked && (
                      <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 border border-red-500/30 p-2 rounded-xl">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}

                    <div className="p-6 flex flex-col gap-4 h-full">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md">
                          {course.difficulty.toUpperCase()}
                        </span>
                        {isCompleted && (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            Completed
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-indigo-300 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      {/* Prerequisites warnings */}
                      {isLocked && (
                        <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                          <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>Requires completion of {course.prerequisites.map(p => p.toUpperCase()).join(" & ")} first.</span>
                        </div>
                      )}

                      {/* Progress roadmap details */}
                      {!isLocked && (
                        <div className="space-y-4 mt-auto pt-4 border-t border-white/5">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-gray-400">Roadmap Progress</span>
                              <span className="text-indigo-400">{percent}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                              <div className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-400">
                            <div>
                              <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Credits</span>
                              <span className="text-white font-bold">{course.credits} Points</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Duration</span>
                              <span className="text-white font-bold">{course.duration}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        // ACTIVE WORKSPACE VIEW
        <div className="flex-1 flex flex-col overflow-hidden px-4 md:px-0">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all text-indigo-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{selectedCourse.title}</h1>
                <p className="text-xs text-indigo-300 font-semibold mt-1">Module {currentModuleIdx + 1} of {selectedCourse.modules_list.length}: {selectedCourse.modules_list[currentModuleIdx].title}</p>
              </div>
            </div>

            {/* Mobile View Toggle Tabs */}
            <div className="flex md:hidden bg-black/30 border border-white/10 rounded-xl p-1 shrink-0">
              <button 
                onClick={() => setMobileTab("theory")}
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                  mobileTab === "theory" ? "bg-white/10 text-white" : "text-gray-400"
                )}
              >
                Theory
              </button>
              <button 
                onClick={() => setMobileTab("coding")}
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                  mobileTab === "coding" ? "bg-white/10 text-white" : "text-gray-400"
                )}
              >
                Coding
              </button>
            </div>
          </div>

          {/* Dual Panel Workspace Layout */}
          <div className="flex-1 grid md:grid-cols-5 gap-6 overflow-hidden items-stretch">
            {/* Left Column: Theory and Syllabus (hidden on mobile if Coding tab active) */}
            <div className={cn(
              "md:col-span-2 flex flex-col gap-4 overflow-hidden h-full",
              mobileTab === "theory" ? "flex" : "hidden md:flex"
            )}>
              {/* Module Nav Links */}
              <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-4 flex flex-col gap-2 shrink-0 max-h-48 overflow-y-auto">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Syllabus Outline</span>
                <div className="space-y-1">
                  {selectedCourse.modules_list.map((mod, idx) => {
                    const isCompleted = idx < (courseProgress[selectedCourse.id.toUpperCase()]?.completedExercises || 0)
                    const isActive = idx === currentModuleIdx
                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleLoadModule(idx)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-between border transition-all",
                          isActive 
                            ? "bg-indigo-500/10 border-indigo-500/25 text-white" 
                            : isCompleted
                            ? "bg-emerald-500/5 border-transparent text-emerald-400 hover:bg-emerald-500/10"
                            : "bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span className="truncate max-w-[180px]">{idx + 1}. {mod.title}</span>
                        {isCompleted ? <Check className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Theory Content Card */}
              <LiquidGlassCard className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 border-white/10 shadow-lg">
                <h3 className="font-bold text-white text-lg tracking-tight">
                  {selectedCourse.modules_list[currentModuleIdx].title}
                </h3>
                
                <div className="space-y-3 text-sm text-gray-300 leading-relaxed font-sans border-t border-white/5 pt-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-indigo-400">Topics covered in this module:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs">
                    {selectedCourse.modules_list[currentModuleIdx].topics.map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                  
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl mt-4">
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-400" />
                      <span>Exercise Objective</span>
                    </h5>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      {getExerciseForModule(selectedCourse.modules_list[currentModuleIdx].id, selectedCourse.id).description}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex gap-2 shrink-0">
                  <Button 
                    onClick={() => currentModuleIdx > 0 && handleLoadModule(currentModuleIdx - 1)}
                    disabled={currentModuleIdx === 0}
                    className="flex-1 rounded-xl py-2 flex items-center justify-center gap-1 text-xs"
                    variant="outline"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </Button>
                  <Button 
                    onClick={() => currentModuleIdx < selectedCourse.modules_list.length - 1 && handleLoadModule(currentModuleIdx + 1)}
                    disabled={currentModuleIdx === selectedCourse.modules_list.length - 1}
                    className="flex-1 rounded-xl py-2 flex items-center justify-center gap-1 text-xs"
                    variant="outline"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </LiquidGlassCard>
            </div>

            {/* Right Column: Code Editor & Exec Output (hidden on mobile if Theory tab active) */}
            <div className={cn(
              "md:col-span-3 flex flex-col h-full bg-[#0b0f19] border border-white/10 rounded-3xl overflow-hidden shadow-2xl",
              mobileTab === "coding" ? "flex" : "hidden md:flex"
            )}>
              {/* Editor Header */}
              <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Editor</span>
                </span>
                
                <span className="font-mono bg-black/40 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold text-gray-400">
                  Language: {selectedCourse.id.toUpperCase()}
                </span>
              </div>

              {/* Editor Split Panel */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 relative min-h-[220px]">
                  <Editor
                    height="100%"
                    language={selectedCourse.id === "cpp" ? "cpp" : selectedCourse.id === "c" ? "c" : "python"}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineHeight: 20,
                      padding: { top: 10 },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>

                {/* Console Panel */}
                <div className="flex flex-col bg-[#070b12] border-t border-white/5 overflow-hidden min-h-[180px]">
                  {/* Console Controls */}
                  <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Console & Review</span>
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleRunCode}
                        disabled={runningCode}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                      >
                        {runningCode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-indigo-400" />}
                        <span>Run</span>
                      </button>
                      <button 
                        onClick={handleSubmitExercise}
                        disabled={submittingSolution}
                        className="flex items-center gap-1.5 px-3 py-1 bg-indigo-505 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-500/10"
                      >
                        {submittingSolution && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>Submit Code</span>
                      </button>
                    </div>
                  </div>

                  {/* Console screen logs */}
                  <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed text-gray-300 space-y-3">
                    {runningCode && (
                      <div className="flex items-center gap-2 text-indigo-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling code execution sandbox...</span>
                      </div>
                    )}

                    {!runningCode && !runOutput && !runError && !aiFeedback && (
                      <span className="text-gray-500">Run code to see stdout, or submit for evaluation.</span>
                    )}

                    {runOutput && (
                      <div className="text-emerald-400">
                        <div className="font-bold text-[10px] text-gray-500 uppercase tracking-wider mb-1">Stdout:</div>
                        <pre className="whitespace-pre-wrap font-mono bg-black/30 p-2.5 rounded-lg border border-white/5">{runOutput}</pre>
                      </div>
                    )}

                    {runError && (
                      <div className="text-rose-400">
                        <div className="font-bold text-[10px] text-gray-500 uppercase tracking-wider mb-1">Execution Error:</div>
                        <pre className="whitespace-pre-wrap font-mono bg-black/30 p-2.5 rounded-lg border border-white/5">{runError}</pre>
                      </div>
                    )}

                    {aiFeedback && (
                      <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1">
                        <div className="text-indigo-300 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span>AI Assistant Review</span>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed font-sans whitespace-pre-wrap">{aiFeedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
