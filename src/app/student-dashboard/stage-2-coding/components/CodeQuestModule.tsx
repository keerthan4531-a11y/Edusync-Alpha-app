"use client"

import { useState, useEffect } from "react"
import Editor from "@monaco-editor/react"
import { 
  Gamepad, CheckCircle2, XCircle, Loader2, Trophy, 
  ChevronRight, ChevronLeft, Play, Coins, Award
} from "lucide-react"

interface World {
  level: number
  id: string
  name: string
  color: string
  badgeColor: string
  desc: string
  icon: string
  unlocked: boolean
  missions: Mission[]
}

interface Mission {
  id: string
  title: string
  story: string
  task: string
  initialCode: string
  language: "python" | "javascript"
  testCases: { input: string; output: string }[]
  rewardXP: number
  rewardCoins: number
}

const WORLDS: World[] = [
  {
    level: 1,
    id: "syntax-village",
    name: "Syntax Village",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    desc: "Master basic variables, output printing, and arithmetic expressions.",
    icon: "🟢",
    unlocked: true,
    missions: [
      {
        id: "sv-1",
        title: "Welcome to Syntax Village",
        story: "🧙 The mayor of Syntax Village needs a welcoming program for new villagers.",
        task: "Write a program that defines variable `name = 'Adventurer'` and prints `Welcome, Adventurer!`",
        initialCode: "name = 'Adventurer'\n# Print the welcome string below\nprint(f'Welcome, {name}!')",
        language: "python",
        testCases: [{ input: "", output: "Welcome, Adventurer!" }],
        rewardXP: 50,
        rewardCoins: 20
      },
      {
        id: "sv-2",
        title: "Village Gold Calculator",
        story: "💰 Calculate total coins collected by villagers from 3 chests.",
        task: "Create variables `c1 = 15`, `c2 = 25`, `c3 = 40` and print their sum.",
        initialCode: "c1 = 15\nc2 = 25\nc3 = 40\n# Calculate and print total\ntotal = c1 + c2 + c3\nprint(total)",
        language: "python",
        testCases: [{ input: "", output: "80" }],
        rewardXP: 60,
        rewardCoins: 25
      }
    ]
  },
  {
    level: 2,
    id: "logic-city",
    name: "Logic City",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    desc: "Fix broken calculators, logic gates, and conditional branch decisions.",
    icon: "🔵",
    unlocked: true,
    missions: [
      {
        id: "lc-1",
        title: "The Broken Calculator",
        story: "🧙 The calculator in Logic City is broken! It must correctly evaluate basic operations.",
        task: "Fix the function `calculate(a, b, op)` so it returns correct result for '+', '-', '*'.",
        initialCode: "def calculate(a, b, op):\n    if op == '+':\n        return a + b\n    elif op == '-':\n        return a - b\n    elif op == '*':\n        return a * b\n    return 0\n\nprint(calculate(10, 5, '+'))\nprint(calculate(10, 5, '-'))\nprint(calculate(10, 5, '*'))",
        language: "python",
        testCases: [{ input: "", output: "15\n5\n50" }],
        rewardXP: 80,
        rewardCoins: 35
      }
    ]
  },
  {
    level: 3,
    id: "algorithm-forest",
    name: "Algorithm Forest",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    desc: "Navigate loops, array traversals, and pattern searches through the dense forest.",
    icon: "🟡",
    unlocked: true,
    missions: [
      {
        id: "af-1",
        title: "Forest Creature Counter",
        story: "🌲 Count how many magical creatures with even IDs reside in the forest grid.",
        task: "Write a function `count_evens(arr)` that returns the count of even numbers in an array.",
        initialCode: "def count_evens(arr):\n    count = 0\n    for num in arr:\n        if num % 2 == 0:\n            count += 1\n    return count\n\nprint(count_evens([2, 5, 8, 11, 14]))",
        language: "python",
        testCases: [{ input: "", output: "3" }],
        rewardXP: 100,
        rewardCoins: 40
      }
    ]
  },
  {
    level: 4,
    id: "debugging-dungeon",
    name: "Debugging Dungeon",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    desc: "Defeat hidden syntax bugs, off-by-one traps, and edge case monsters.",
    icon: "🟠",
    unlocked: true,
    missions: [
      {
        id: "dd-1",
        title: "Escape Off-By-One Trap",
        story: "🐛 The dungeon door loop has an off-by-one error trapping the team.",
        task: "Fix the loop so it computes sum of numbers from 1 to 10 inclusive.",
        initialCode: "def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n\nprint(sum_to_n(10))",
        language: "python",
        testCases: [{ input: "", output: "55" }],
        rewardXP: 120,
        rewardCoins: 50
      }
    ]
  },
  {
    level: 5,
    id: "dsa-arena",
    name: "DSA Arena",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    desc: "Master stacks, queues, binary search, and linked list traversals.",
    icon: "🔴",
    unlocked: true,
    missions: [
      {
        id: "dsa-1",
        title: "Binary Search Champion",
        story: "⚔️ Perform binary search to find the target index in a sorted array in O(log N) time.",
        task: "Implement `binary_search(arr, target)` returning the 0-indexed position of target.",
        initialCode: "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nprint(binary_search([1, 3, 5, 7, 9, 11], 7))",
        language: "python",
        testCases: [{ input: "", output: "3" }],
        rewardXP: 150,
        rewardCoins: 60
      }
    ]
  },
  {
    level: 6,
    id: "ai-ml-lab",
    name: "AI/ML Lab",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    desc: "Manipulate tensors, matrix multiplications, and artificial neural weights.",
    icon: "🟣",
    unlocked: true,
    missions: [
      {
        id: "ai-1",
        title: "Matrix Dot Product",
        story: "🤖 Compute vector dot product for neuron activation weight calculation.",
        task: "Implement `dot_product(vec1, vec2)` that returns sum of elementwise products.",
        initialCode: "def dot_product(v1, v2):\n    return sum(a * b for a, b in zip(v1, v2))\n\nprint(dot_product([1, 2, 3], [4, 5, 6]))",
        language: "python",
        testCases: [{ input: "", output: "32" }],
        rewardXP: 200,
        rewardCoins: 80
      }
    ]
  }
]

export function CodeQuestModule({ onBack, onAwardXP }: { onBack: () => void; onAwardXP: (xp: number, coins: number) => void }) {
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [code, setCode] = useState("")
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [passed, setPassed] = useState(false)

  // Suppress expected Monaco cancellation errors from the console
  useEffect(() => {
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (e.reason && (e.reason.name === 'Canceled' || (typeof e.reason === 'string' && e.reason.includes('Canceled')))) {
        e.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    const originalConsoleError = console.error;
    console.error = (...args) => {
      const isCanceled = args.some(arg => 
        (typeof arg === 'string' && (arg.includes('Canceled:') || arg.includes('ERR Canceled'))) ||
        (arg && arg.name === 'Canceled')
      );
      if (isCanceled) return;
      originalConsoleError.apply(console, args);
    };

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, []);

  const handleOpenMission = (world: World, mission: Mission) => {
    setSelectedWorld(world)
    setSelectedMission(mission)
    setCode(mission.initialCode)
    setOutput("")
    setError("")
    setPassed(false)
  }

  const handleRunCode = async () => {
    if (!selectedMission) return
    setRunning(true)
    setOutput("")
    setError("")
    setPassed(false)

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: code,
          languageId: selectedMission.language === "python" ? "71" : "63",
          testCases: selectedMission.testCases
        })
      })
      const data = await res.json()
      if (res.ok && data.success && data.results) {
        const out = data.results[0]
        const stdout = (out.stdout || "").trim()
        const stderr = out.stderr || out.compile_output || ""
        setOutput(stdout)
        if (stderr) setError(stderr)

        const expected = selectedMission.testCases[0].output.trim()
        if (stdout.includes(expected)) {
          setPassed(true)
          onAwardXP(selectedMission.rewardXP, selectedMission.rewardCoins)
        } else if (!stderr) {
          setError(`Expected output: "${expected}", but received: "${stdout}"`)
        }
      } else {
        setError(data.message || "Execution error")
      }
    } catch (e) {
      setError("Network timeout executing code.")
    } finally {
      setRunning(false)
    }
  }

  if (selectedMission && selectedWorld) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto text-foreground">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedMission(null)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex items-center gap-3 text-xs font-extrabold">
            <span className={`px-3 py-1 rounded-full border ${selectedWorld.badgeColor}`}>
              Level {selectedWorld.level} — {selectedWorld.name}
            </span>
            <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <Award className="w-3.5 h-3.5" /> +{selectedMission.rewardXP} XP
            </span>
            <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <Coins className="w-3.5 h-3.5" /> +{selectedMission.rewardCoins} Coins
            </span>
          </div>
        </div>

        {/* Mission Briefing */}
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-2xl border border-blue-500/20 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-foreground">{selectedMission.title}</h2>
          </div>
          <p className="text-sm font-semibold text-blue-400 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 leading-relaxed">
            {selectedMission.story}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            <strong className="text-foreground">Objective:</strong> {selectedMission.task}
          </p>
        </div>

        {/* Editor & Console */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="flex flex-col neu-flat dark:bg-[#0b0f19] rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl">
            <div className="p-3 bg-black/40 border-b border-blue-500/20 flex justify-between items-center text-xs font-bold">
              <span className="text-blue-400 font-mono">mission_solution.py</span>
              <button 
                onClick={handleRunCode}
                disabled={running}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Code & Test
              </button>
            </div>
            <div className="h-80">
              <Editor
                height="100%"
                language={selectedMission.language}
                theme="vs-dark"
                value={code}
                onChange={v => setCode(v || "")}
                options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false }}
              />
            </div>
          </div>

          {/* Execution Output */}
          <div className="flex flex-col neu-flat dark:bg-[#0b0f19] rounded-2xl border border-blue-500/20 p-5 shadow-2xl justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-3">Test Execution Console</h3>
              {running ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
              ) : passed ? (
                <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-center space-y-3 animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-blue-400" />
                  <h4 className="text-lg font-extrabold">MISSION ACCOMPLISHED!</h4>
                  <p className="text-xs">All test cases passed cleanly. Rewards added to your profile!</p>
                  <div className="flex justify-center gap-3 pt-2">
                    <span className="px-3 py-1 bg-blue-500/20 rounded-full font-bold text-xs">+ {selectedMission.rewardXP} XP</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full font-bold text-xs">+ {selectedMission.rewardCoins} Coins</span>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono whitespace-pre-wrap">
                  <div className="flex items-center gap-2 font-bold mb-2 text-rose-500">
                    <XCircle className="w-4 h-4" /> Test Case Failed:
                  </div>
                  {error}
                </div>
              ) : output ? (
                <div className="p-4 rounded-xl bg-black/40 border border-blue-500/10 text-xs font-mono text-blue-400 whitespace-pre-wrap">
                  {output}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground text-xs font-semibold">
                  Click <strong className="text-blue-400 font-bold">Run Code & Test</strong> above to test your Python solution.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-black/10 dark:border-white/10 text-[11px] text-muted-foreground flex justify-between items-center">
              <span>Expected Output: <code className="text-foreground bg-blue-500/10 px-2 py-0.5 rounded font-mono">{selectedMission.testCases[0].output}</code></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedWorld && !selectedMission) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto text-foreground">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedWorld(null)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <div className={`neu-flat dark:bg-white/5 dark:border-white/10 p-8 rounded-[2rem] border shadow-xl flex flex-col justify-between ${selectedWorld.color}`}>
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-5xl">{selectedWorld.icon}</span>
              <span className={`text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider border ${selectedWorld.badgeColor}`}>
                Level {selectedWorld.level}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-foreground">{selectedWorld.name}</h3>
            <p className="text-sm text-muted-foreground mt-2 font-medium">{selectedWorld.desc}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
            <div className="text-xs font-bold text-muted-foreground flex justify-between">
              <span>{selectedWorld.missions.length} Missions Available</span>
              <span className="text-blue-400 font-extrabold">Unlocked</span>
            </div>
            <div className="flex flex-col gap-3">
              {selectedWorld.missions.map(m => (
                <button 
                  key={m.id}
                  onClick={() => handleOpenMission(selectedWorld, m)}
                  className="w-full p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 flex items-center justify-between text-sm font-bold text-foreground transition-all group"
                >
                  <span>{m.title}</span>
                  <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="mb-4 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
      </div>
      <div>
        <h1 className="text-[28px] md:text-[34px] leading-tight font-semibold text-foreground tracking-tight mb-2 flex items-center gap-3">
          <Gamepad className="w-8 h-8 text-blue-500" /> Code Quest
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Unlock 6 gamified coding worlds from Syntax Village to AI/ML Lab with mission objectives.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {WORLDS.map((world) => (
          <button
            key={world.id}
            onClick={() => setSelectedWorld(world)}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 neu-convex rounded-[2rem] hover:scale-[1.02] transition-all duration-300 dark:bg-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center neu-raised-sm dark:bg-indigo-950/30 dark:border-2 dark:border-indigo-400/20 transition-all duration-300 group-hover:scale-110 shadow-inner group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <div className="text-4xl md:text-5xl filter drop-shadow-[0_4px_12px_rgba(129,140,248,0.4)]">
                {world.icon}
              </div>
            </div>
            <span className="text-[15px] font-semibold text-foreground dark:text-gray-200 group-hover:text-primary transition-colors text-center">
              {world.name}
            </span>
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${world.badgeColor}`}>
              Level {world.level}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
