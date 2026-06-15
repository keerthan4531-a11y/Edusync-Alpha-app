"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { 
  Play, 
  Loader2, 
  CheckCircle2, 
  Check,
  XCircle, 
  Code, 
  Award, 
  Flame, 
  RefreshCw, 
  HelpCircle, 
  BookOpen, 
  Gamepad, 
  Sword, 
  UserCircle,
  Coins,
  Shield,
  Clock,
  Database,
  Cpu,
  Target,
  ChevronRight,
  Sparkles,
  Lock,
  Compass,
  FileCode,
  AlertTriangle,
  Mic,
  Bug,
  Ghost,
  Swords,
  LayoutDashboard,
  Save,
  X
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  languages: string[];
  rewardXP: number;
  rewardCoins: number;
  initialCode: Record<string, string>;
  harnesses: Record<string, string>;
  testCases: { input: string; output: string }[];
}

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you cannot use the same element twice.",
    difficulty: "Easy",
    languages: ["python", "javascript"],
    rewardXP: 100,
    rewardCoins: 50,
    initialCode: {
      python: "def twoSum(nums, target):\n    # Write your code here\n    pass",
      javascript: "function twoSum(nums, target) {\n    // Write your code here\n    return [];\n}"
    },
    harnesses: {
      python: "\nimport json, sys\ntry:\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        print(twoSum(json.loads(lines[0]), int(lines[1])))\nexcept Exception as e:\n    print(e)",
      javascript: "\nconst fs = require('fs');\ntry {\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\n    if (input.length >= 2) {\n        console.log(JSON.stringify(twoSum(JSON.parse(input[0]), parseInt(input[1]))));\n    }\n} catch (e) {\n    console.error(e);\n}"
    },
    testCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]" },
      { input: "[3,2,4]\n6", output: "[1,2]" }
    ]
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters.",
    difficulty: "Easy",
    languages: ["python", "javascript"],
    rewardXP: 75,
    rewardCoins: 35,
    initialCode: {
      python: "def reverseString(s):\n    # Write your code here\n    return s[::-1]",
      javascript: "function reverseString(s) {\n    // Write your code here\n    return s.split('').reverse().join('');\n}"
    },
    harnesses: {
      python: "\nimport sys\ntry:\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        print(reverseString(lines[0].strip('\"')))\nexcept:\n    pass",
      javascript: "\nconst fs = require('fs');\ntry {\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim();\n    console.log(reverseString(input.replace(/\"/g, '')));\n} catch (e) {}\n"
    },
    testCases: [
      { input: "\"hello\"", output: "olleh" },
      { input: "\"Hannah\"", output: "hannaH" }
    ]
  },
  {
    id: "factorial",
    title: "Factorial",
    description: "Write a recursive function to calculate the factorial of a positive integer n.",
    difficulty: "Medium",
    languages: ["python", "javascript"],
    rewardXP: 120,
    rewardCoins: 60,
    initialCode: {
      python: "def factorial(n):\n    # Write your code here\n    pass",
      javascript: "function factorial(n) {\n    // Write your code here\n    return 1;\n}"
    },
    harnesses: {
      python: "\nimport sys\ntry:\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        print(factorial(int(lines[0])))\nexcept:\n    pass",
      javascript: "\nconst fs = require('fs');\ntry {\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim();\n    console.log(factorial(parseInt(input)));\n} catch (e) {}\n"
    },
    testCases: [
      { input: "5", output: "120" },
      { input: "3", output: "6" }
    ]
  }
];

interface LessonModule {
  id: string;
  title: string;
  theory: string;
  initialCode: string;
  language: string;
  expectedOutput: string;
  hint: string;
  isBoss?: boolean;
}

const MOCK_PATH_COURSES: Record<string, {
  title: string;
  description: string;
  modules: LessonModule[];
}> = {
  python: {
    title: "Python Developer Path",
    description: "From basic variables to syntax conditionals and the Logic Gateway boss battle.",
    modules: [
      {
        id: "py_lesson_1",
        title: "Intro & Variables",
        theory: "Variables store data. In Python: `x = 5`. Create a variable `y` and assign it `100`, then print `y` to stdout.",
        initialCode: "# Create y and print it\ny = 100\nprint(y)",
        language: "python",
        expectedOutput: "100",
        hint: "Write: y = 100 on one line, and print(y) on the next."
      },
      {
        id: "py_lesson_2",
        title: "Loops (For)",
        theory: "A for loop iterates over sequences. Let's print numbers 0, 1, and 2 using `range(3)`.",
        initialCode: "# Print numbers from 0 to 2\nfor i in range(3):\n    print(i)",
        language: "python",
        expectedOutput: "0\n1\n2",
        hint: "Simply run the template code or verify range(3) values."
      },
      {
        id: "py_boss",
        title: "☠️ Boss Battle: Logic Gateway",
        theory: "DEFEAT THE SECURE GATEWAY BOT! The bot expects you to write a logic authentication script. It calls `authenticate(key)` and expects it to return True if the key is 'EduSync999' and False otherwise.",
        initialCode: "def authenticate(key):\n    # Return True if correct, False otherwise\n    return key == 'EduSync999'\n\nprint(authenticate('EduSync999'))",
        language: "python",
        expectedOutput: "True",
        hint: "Compare key parameter with 'EduSync999' using == comparison.",
        isBoss: true
      }
    ]
  },
  c: {
    title: "C Programming Master",
    description: "Pointers and memory allocations structure.",
    modules: [
      {
        id: "c_lesson_1",
        title: "Introduction & Hello",
        theory: "C is a structured programming language. In this quick session, we will compile a basic Hello C printer using main() entry point.",
        initialCode: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello C\\n\");\n    return 0;\n}",
        language: "cpp",
        expectedOutput: "Hello C",
        hint: "Run main structure containing printf(\"Hello C\\n\");"
      },
      {
        id: "c_boss",
        title: "☠️ Boss Battle: Memory Leak Monster",
        theory: "DEFUSE THE LEAK MONSTER! Allocate memory dynamically for an integer, set the pointer value to 42, print it, and then FREE the pointer to defeat the monster!",
        initialCode: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int* ptr = (int*)malloc(sizeof(int));\n    *ptr = 42;\n    printf(\"%d\\n\", *ptr);\n    free(ptr);\n    return 0;\n}",
        language: "cpp",
        expectedOutput: "42",
        hint: "Make sure you call free(ptr) before exiting main.",
        isBoss: true
      }
    ]
  },
  web: {
    title: "Web Developer Path",
    description: "HTML layouts and responsive tags.",
    modules: [
      {
        id: "web_lesson_1",
        title: "HTML Tags",
        theory: "HTML represents content structures. Let's output '<h1>Hello Web</h1>' to stdout.",
        initialCode: "console.log('<h1>Hello Web</h1>');",
        language: "javascript",
        expectedOutput: "<h1>Hello Web</h1>",
        hint: "Print '<h1>Hello Web</h1>' using console.log."
      }
    ]
  }
};

const SHOP_ITEMS = [
  { id: "theme_matrix", name: "Matrix Hacker Theme", desc: "Terminal vibe neon-green layout outlines.", cost: 200, type: "theme", color: "#00ff00" },
  { id: "theme_cyberpunk", name: "Cyberpunk Synth Theme", desc: "Vibrant neon-pink and violet glow border overlays.", cost: 400, type: "theme", color: "#ff00ff" },
  { id: "theme_dracula", name: "Dracula Midnight Theme", desc: "Classic premium dark purple border accents.", cost: 300, type: "theme", color: "#bd93f9" },
  { id: "item_duck", name: "AI Debugging Duck", desc: "Get dynamic hints on coding errors inside compiler.", cost: 150, type: "item", icon: "🦆" },
  { id: "item_shield", name: "Streak Shield Guard", desc: "Protects your coding streak if you skip a day.", cost: 100, type: "item", icon: "🛡️" }
];

export default function CodingStagePage() {
  const [activeTab, setActiveTab] = useState<"learning-paths" | "code-coach" | "playground" | "arena" | "arcade" | "shop">("learning-paths");

  // Global gamification states
  const [coins, setCoins] = useState(125);
  const [xp, setXp] = useState(1250);
  const [streak, setStreak] = useState(12);
  const [tier, setTier] = useState("Bronze 🥉");
  const [challengesCount, setChallengesCount] = useState(0);
  const [linesOfCode, setLinesOfCode] = useState(140);
  const [compilerRuns, setCompilerRuns] = useState(18);

  // Shop & active theme state
  const [ownedItems, setOwnedItems] = useState<string[]>(["theme_dracula"]);
  const [activeTheme, setActiveTheme] = useState<string>("default");

  // Interactive course lessons modal state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [activeCourseKey, setActiveCourseKey] = useState<"python" | "c" | "web">("python");
  const [courseModuleIdx, setCourseModuleIdx] = useState(0);
  const [courseCode, setCourseCode] = useState("");
  const [courseOutput, setCourseOutput] = useState("");
  const [courseError, setCourseError] = useState("");
  const [courseVerifying, setCourseVerifying] = useState(false);
  const [courseVerified, setCourseVerified] = useState(false);
  const [courseHintVisible, setCourseHintVisible] = useState(false);

  // Locked courses state
  const [unlockedPaths, setUnlockedPaths] = useState<string[]>(["python", "c"]);

  const openCourseModalMock = (courseKey: "python" | "c" | "web") => {
    setActiveCourseKey(courseKey);
    setCourseModuleIdx(0);
    const initial = MOCK_PATH_COURSES[courseKey].modules[0].initialCode;
    setCourseCode(initial);
    setCourseOutput("");
    setCourseError("");
    setCourseVerified(false);
    setCourseHintVisible(false);
    setIsCourseModalOpen(true);
  };

  const closeCourseModal = () => {
    setIsCourseModalOpen(false);
  };

  const verifyCourseModule = async () => {
    setCourseVerifying(true);
    setCourseOutput("");
    setCourseError("");
    
    const activeCourse = MOCK_PATH_COURSES[activeCourseKey];
    const activeModule = activeCourse.modules[courseModuleIdx];
    
    const langId = activeModule.language === "python" ? "71" : activeModule.language === "javascript" ? "63" : "54";
    
    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: courseCode,
          languageId: langId,
          testCases: [{ input: "", output: "" }]
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.results) {
        const out = data.results[0];
        const stdout = (out.stdout || "").trim();
        const stderr = out.stderr || out.compile_output || "";
        
        if (stdout) {
          setCourseOutput(stdout);
        }
        
        if (stderr) {
          setCourseError(stderr);
        }
        
        // Match expected output substring
        if (stdout.toLowerCase().includes(activeModule.expectedOutput.toLowerCase().trim())) {
          setCourseVerified(true);
          setXp(prev => prev + 50);
          setCoins(prev => prev + 25);
          setLinesOfCode(prev => prev + 12);
          
          if (activeModule.isBoss) {
            alert(`🎉 Boss Battle Defeated! You completed the final module of the ${activeCourse.title}!`);
            if (activeCourseKey === "python") {
              setUnlockedPaths(prev => [...prev, "web"]);
              alert("🔓 Web Developer Path has been unlocked!");
            }
          } else {
            alert("✅ Module target output matched! You can now proceed to the next module.");
          }
        } else if (!stderr) {
          setCourseError(`Expected output to contain: "${activeModule.expectedOutput}". Received: "${stdout}"`);
        }
      } else {
        setCourseError(data.message || "Sandbox compile failed.");
      }
    } catch (e) {
      setCourseError("Sandbox communication timeout.");
    } finally {
      setCourseVerifying(false);
    }
  };

  const loadNextModule = () => {
    const activeCourse = MOCK_PATH_COURSES[activeCourseKey];
    if (courseModuleIdx < activeCourse.modules.length - 1) {
      const nextIdx = courseModuleIdx + 1;
      setCourseModuleIdx(nextIdx);
      setCourseCode(activeCourse.modules[nextIdx].initialCode);
      setCourseOutput("");
      setCourseError("");
      setCourseVerified(false);
      setCourseHintVisible(false);
    } else {
      closeCourseModal();
    }
  };

  const claimDailyChest = () => {
    if (streak >= 7) {
      alert("🎁 Weekly Streak Chest Unlocked!\nYou claimed: +100 XP and +50 Coins! Keep up the daily coding habit! 🔥");
      setXp(prev => prev + 100);
      setCoins(prev => prev + 50);
    } else {
      alert("🔥 Complete a coding challenge daily! Reach 7 days or more streak count to unlock the streak chest.");
    }
  };

  // Fetch problem statements from database if available
  const [challenges, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch("/api/problem-statements");
        if (res.ok) {
          const data = await res.json();
          // Merge or set problems if database statements exist
          if (Array.isArray(data) && data.length > 0) {
            console.log("Database problem statements fetched:", data);
          }
        }
      } catch (e) {
        console.warn("Could not fetch DB problems, using fallbacks.", e);
      }
    };
    fetchProblems();

    // WebSocket connection for real-time challenge updates
    let ws: WebSocket | null = null;
    const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
    if (token) {
      try {
        ws = new WebSocket(`ws://localhost:8000/ws/challenges?token=${token}`);
        ws.onopen = () => {
          console.log("✅ WebSocket Connected: Stage 2 subscriber active");
          ws?.send(JSON.stringify({
            type: "subscribe_to_stage",
            stage: "sophomore"
          }));
        };
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "challenge_created") {
              alert(`🎉 New challenge created: "${message.data.title}"! Refreshing practice lists.`);
              fetchProblems();
            } else if (message.type === "challenge_deleted") {
              alert(`🗑️ Challenge deleted: "${message.data.title}"`);
              fetchProblems();
            }
          } catch (e) {}
        };
        ws.onerror = () => {
          console.log("WebSocket connection info: Server offline or local dev fallback.");
        };
      } catch (err) {
        console.warn("WS error setup", err);
      }
    }
    return () => {
      ws?.close();
    };
  }, []);

  // ----------------------------------------------------
  // PLAYGROUND COMPILER STATE
  // ----------------------------------------------------
  const [pgLanguage, setPgLanguage] = useState<"python" | "javascript" | "cpp">("python");
  const [pgCode, setPgCode] = useState<string>("");
  const [pgInput, setPgInput] = useState<string>("");
  const [pgOutput, setPgOutput] = useState<string>("");
  const [pgError, setPgError] = useState<string>("");
  const [pgRunning, setPgRunning] = useState(false);
  const [pgRuntime, setPgRuntime] = useState<number | null>(null);
  const [pgMemory, setPgMemory] = useState<number | null>(null);

  // Load saved playground code draft
  useEffect(() => {
    const saved = localStorage.getItem(`stage2_playground_code_${pgLanguage}`);
    if (saved) {
      setPgCode(saved);
    } else {
      // Load language templates
      if (pgLanguage === "python") setPgCode("# Write Python 3 here\nprint(\"Hello world!\")");
      else if (pgLanguage === "javascript") setPgCode("// Write Node JS here\nconsole.log(\"Hello world!\");");
      else setPgCode("#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello world!\" << endl;\n    return 0;\n}");
    }
  }, [pgLanguage]);

  // Save drafts on change
  const handleEditorChange = (value: string | undefined) => {
    const codeVal = value || "";
    setPgCode(codeVal);
    localStorage.setItem(`stage2_playground_code_${pgLanguage}`, codeVal);
  };

  const formatCode = () => {
    if (!pgCode.trim()) return;
    let formatted = pgCode;
    if (pgLanguage === "python") {
      formatted = pgCode
        .split("\n")
        .map(line => line.trimRight())
        .join("\n")
        .trim();
    } else {
      formatted = pgCode
        .split("\n")
        .map(line => line.trimRight())
        .join("\n")
        .replace(/{\s*/g, " {\n")
        .replace(/;\s*/g, ";\n")
        .trim();
    }
    setPgCode(formatted);
    localStorage.setItem(`stage2_playground_code_${pgLanguage}`, formatted);
    alert("✨ Code formatted successfully!");
  };

  const saveCode = () => {
    localStorage.setItem(`stage2_playground_code_${pgLanguage}`, pgCode);
    alert("💾 Code draft saved successfully to Local Storage!");
  };

  const runPlaygroundCode = async () => {
    setPgRunning(true);
    setPgOutput("");
    setPgError("");
    setPgRuntime(null);
    setPgMemory(null);

    // Map language IDs for Judge0: Python=71, Node.js=63, C++=54
    const langId = pgLanguage === "python" ? "71" : pgLanguage === "javascript" ? "63" : "54";

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: pgCode,
          languageId: langId,
          testCases: [{ input: pgInput, output: "" }]
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.results) {
        const out = data.results[0];
        setPgRuntime(out.time ? Math.round(parseFloat(out.time) * 1000) : 45);
        setPgMemory(out.memory ? Math.round(out.memory / 1024) : 1);
        if (out.status?.id === 3 || out.stdout) {
          setPgOutput(out.stdout || "Execution finished with empty stdout.");
        } else {
          setPgError(out.stderr || out.compile_output || "Runtime execution error.");
        }
        setCompilerRuns(prev => prev + 1);
      } else {
        setPgError(data.message || "Failed to execute playground code.");
      }
    } catch (e) {
      setPgError("Network error connecting to Judge0 API.");
    } finally {
      setPgRunning(false);
    }
  };

  // ----------------------------------------------------
  // CODE COACH CHALLENGES STATE
  // ----------------------------------------------------
  const [coachSelectedId, setCoachSelectedId] = useState<string | null>(null);
  const [coachLanguage, setCoachLanguage] = useState<"python" | "javascript">("python");
  const [coachCode, setCoachCode] = useState<string>("");
  const [coachRunning, setCoachRunning] = useState(false);
  const [coachResults, setCoachResults] = useState<any>(null);
  const [coachError, setCoachError] = useState<string | null>(null);

  const activeChallenge = challenges.find(c => c.id === coachSelectedId);

  const openChallengeWorkspace = (ch: Challenge) => {
    setCoachSelectedId(ch.id);
    const lang = ch.languages.includes("python") ? "python" : "javascript";
    setCoachLanguage(lang as any);
    setCoachCode(ch.initialCode[lang] || "");
    setCoachResults(null);
    setCoachError(null);
  };

  const runCoachChallenge = async () => {
    if (!activeChallenge) return;
    setCoachRunning(true);
    setCoachResults(null);
    setCoachError(null);

    const langId = coachLanguage === "python" ? "71" : "63";
    const harness = activeChallenge.harnesses[coachLanguage] || "";
    const fullCode = coachCode + harness;

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: fullCode,
          languageId: langId,
          testCases: activeChallenge.testCases
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoachResults(data.results);
        setCompilerRuns(prev => prev + 1);
        if (data.allPassed) {
          // Add reward dynamically
          setXp(prev => prev + activeChallenge.rewardXP);
          setCoins(prev => prev + activeChallenge.rewardCoins);
          setChallengesCount(prev => prev + 1);
          setLinesOfCode(prev => prev + 15);
        }
      } else {
        setCoachError(data.message || "Compilation failed.");
      }
    } catch (e) {
      setCoachError("Sandbox network connection timeout.");
    } finally {
      setCoachRunning(false);
    }
  };

  // ----------------------------------------------------
  // ARENA STATE SIMULATIONS
  // ----------------------------------------------------
  const [arenaMode, setArenaMode] = useState<"lobby" | "duel" | "boss" | "bug" | "interview" | "review">("lobby");
  
  // 1v1 duel states
  const [duelSearchText, setDuelSearchText] = useState("Finding matchmaking opponent...");
  const [duelOpponent, setDuelOpponent] = useState("");
  const [duelStatus, setDuelStatus] = useState<"search" | "found" | "completed">("search");
  const [duelCode, setDuelCode] = useState("");

  const start1v1Duel = () => {
    setArenaMode("duel");
    setDuelStatus("search");
    setDuelSearchText("Searching active lobbies...");
    
    setTimeout(() => {
      setDuelSearchText("Connecting to SDE room 409...");
    }, 1200);

    setTimeout(() => {
      const opponents = ["DevHacker99", "CodeNinja", "AdaCoding", "PyWizard", "ByteSlayer"];
      const randomOpp = opponents[Math.floor(Math.random() * opponents.length)];
      setDuelOpponent(randomOpp);
      setDuelStatus("found");
      setDuelCode("def reverse_array(arr):\n    # Write fast reverse solution here\n    return arr[::-1]");
    }, 2500);
  };

  const submitDuelCode = () => {
    alert("Code submitted! Validating output speed against opponent...");
    setDuelStatus("completed");
    setCoins(prev => prev + 80);
    setXp(prev => prev + 50);
  };

  // Boss fight states
  const [bossHp, setBossHp] = useState(500);
  const bossMaxHp = 500;
  const [bossDefeated, setBossDefeated] = useState(false);

  const attackBoss = (damage: number, label: string) => {
    if (bossHp <= 0) return;
    const nextHp = Math.max(0, bossHp - damage);
    setBossHp(nextHp);
    if (nextHp === 0) {
      setBossDefeated(true);
      setCoins(prev => prev + 150);
      setXp(prev => prev + 100);
      alert("Boss Defeated! The Bug Monster exploded. +150 Coins & +100 XP awarded!");
    } else {
      alert(`Attack successful using ${label}! Dealt ${damage} HP damage to the Bug Monster!`);
    }
  };

  // Bug hunter states
  const [bugCode, setBugCode] = useState("def is_even(num):\n    # Bug: Off by one check\n    if num % 2 == 1:\n        return True\n    return False");
  const [bugStatus, setBugStatus] = useState<string | null>(null);

  const checkBugFix = () => {
    const cleaned = bugCode.replace(/\s+/g, "");
    // Checks if the user changed the mod operation or reverse conditional
    if (cleaned.includes("num%2==0") || cleaned.includes("num%2!=1")) {
      setBugStatus("passed");
      setCoins(prev => prev + 40);
      setXp(prev => prev + 30);
    } else {
      setBugStatus("failed");
    }
  };

  // Tech interview states
  const [interviewCode, setInterviewCode] = useState("def reverse_string(s):\n    return s[::-1]");
  const [interviewReview, setInterviewReview] = useState("");
  const [isInterviewing, setIsInterviewing] = useState(false);

  const runInterviewAnalyze = () => {
    setIsInterviewing(true);
    setInterviewReview("");
    setTimeout(() => {
      setInterviewReview("Overall Rating: STRONG HIRE ✅\n\nCode analysis:\n- Correct string reverse indexing used.\n- Time Complexity: O(N) linear time lookup.\n- Space Complexity: O(1) in-place references.\n- Recommendation: Clean, highly optimal representation. Suggest reviewing Unicode character encoding bounds.");
      setIsInterviewing(false);
      setXp(prev => prev + 50);
    }, 1500);
  };

  // Code review states
  const [reviewSnippet, setReviewSnippet] = useState("def my_func(items):\n    for i in items:\n        for j in items:\n            print(i, j)");
  const [reviewPersona, setReviewPersona] = useState<"linus" | "ada" | "coach">("linus");
  const [reviewResult, setReviewResult] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const getReviewText = () => {
    setIsReviewing(true);
    setReviewResult("");
    setTimeout(() => {
      if (reviewPersona === "linus") {
        setReviewResult("Linus Torvalds:\n'This code is garbage. You are nested looping over the same array list creating O(N^2) complexity where O(N) is trivial. Please respect CPU cycles and refactor this immediately.'");
      } else if (reviewPersona === "ada") {
        setReviewResult("Ada Lovelace:\n'An interesting nested combination algorithm. Although it maps permutations perfectly, we must advise warning when elements items scale high. Memory limits on high loop indexes could exhaust stack frames.'");
      } else {
        setReviewResult("Friendly Coach:\n'Excellent start! You are printing out all pairs correctly. To make it more optimal and clean, consider using itertools.permutations() or dict set mapping to reduce duplicates!'");
      }
      setIsReviewing(false);
    }, 1000);
  };

  // ----------------------------------------------------
  // PROFILE & SHOP LOGIC
  // ----------------------------------------------------
  const handleBuyItem = (id: string, cost: number, type: string) => {
    if (ownedItems.includes(id)) {
      alert("You already own this item.");
      return;
    }
    if (coins < cost) {
      alert("Insufficient wallet coins! Complete more Code Coach challenges or Arena battles.");
      return;
    }
    setCoins(prev => prev - cost);
    setOwnedItems(prev => [...prev, id]);
    alert(`Success! Purchased ${SHOP_ITEMS.find(i => i.id === id)?.name}.`);
  };

  // Applied theme classes
  let themeAccentClass = "border-white/10";
  if (activeTheme === "theme_matrix") {
    themeAccentClass = "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] text-green-400";
  } else if (activeTheme === "theme_cyberpunk") {
    themeAccentClass = "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] text-pink-400";
  } else if (activeTheme === "theme_dracula") {
    themeAccentClass = "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-purple-400";
  }

  return (
    <div className={`space-y-6 transition-all duration-500 p-2 ${
      activeTheme === "theme_matrix" 
        ? "dark bg-[#020502] text-green-400 font-mono" 
        : activeTheme === "theme_cyberpunk"
          ? "dark bg-[#0f051d] text-pink-400"
          : activeTheme === "theme_dracula"
            ? "dark bg-[#1e1f29] text-[#f8f8f2]"
            : ""
    }`}>
      
      {/* Top dashboard status metrics bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LiquidGlassCard className={`p-4 flex items-center gap-3 border transition-all duration-300 ${activeTheme !== "default" ? themeAccentClass : "border-blue-500/20"}`} accentColor="#3b82f6">
          <Award className="w-7 h-7 text-blue-400 shrink-0" />
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Level Rank</span>
            <span className="text-base font-extrabold text-white">{tier}</span>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard className={`p-4 flex items-center gap-3 border transition-all duration-300 ${activeTheme !== "default" ? themeAccentClass : "border-yellow-500/20"}`} accentColor="#fbbf24">
          <Coins className="w-7 h-7 text-yellow-500 shrink-0 animate-bounce" />
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Wallet Balance</span>
            <span className="text-base font-extrabold text-white">{coins} Coins</span>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard 
          className={`p-4 flex items-center gap-3 border cursor-pointer hover:scale-[1.03] transition-all duration-300 ${activeTheme !== "default" ? themeAccentClass : "border-purple-500/20"}`} 
          accentColor="#a78bfa"
          onClick={claimDailyChest}
          title="Daily Streak: Click to claim weekly streak chest if 7+ days!"
        >
          <Flame className="w-7 h-7 text-purple-400 shrink-0 animate-pulse" />
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Streak (Claim Chest!)</span>
            <span className="text-base font-extrabold text-white">{streak} Days</span>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard className={`p-4 flex items-center gap-3 border transition-all duration-300 ${activeTheme !== "default" ? themeAccentClass : "border-cyan-500/20"}`} accentColor="#22d3ee">
          <Compass className="w-7 h-7 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Solved Practice</span>
            <span className="text-base font-extrabold text-white">{challengesCount} Solved</span>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Module sub-tab selectors */}
      <div className={`flex gap-1.5 p-1 bg-white/5 border rounded-2xl overflow-x-auto no-scrollbar flex-nowrap w-full sm:w-fit transition-all duration-300 ${activeTheme !== "default" ? themeAccentClass : "border-white/10"}`}>
        <button
          onClick={() => setActiveTab("learning-paths")}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "learning-paths"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Learning Paths
        </button>
        <button
          onClick={() => setActiveTab("code-coach")}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "code-coach"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Target className="w-4 h-4" /> Code Coach
        </button>
        <button
          onClick={() => setActiveTab("playground")}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "playground"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Code className="w-4 h-4" /> Playground
        </button>
        <button
          onClick={() => setActiveTab("arena")}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "arena"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Sword className="w-4 h-4" /> Arena Modes
        </button>
        <button
          onClick={() => setActiveTab("arcade")}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "arcade"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Gamepad className="w-4 h-4" /> Daily Quests
        </button>
        <button
          onClick={() => setActiveTab("shop")}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "shop"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <UserCircle className="w-4 h-4" /> Shop & Ranks
        </button>
      </div>

      {/* 1. LEARNING PATHS TAB */}
      {activeTab === "learning-paths" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Daily Goal UI */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-5 rounded-3xl border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-500 animate-pulse" /> Daily Goal: 5-10 Mins of Coding
              </h3>
              <p className="text-xs text-gray-400 mt-1">Complete 1 Lesson + 1 Quiz to earn daily XP and maintain your streak!</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <div className="text-lg font-black text-emerald-400">0 / 50 XP</div>
                <div className="text-[10px] text-gray-500">Earned Today</div>
              </div>
              <button 
                onClick={() => alert("Starting your 5-min daily quick lesson! Redirecting you to roadmaps...")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
              >
                Start Quick Lesson
              </button>
            </div>
          </div>

          <LiquidGlassCard className="p-6" accentColor="#3b82f6">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" /> Career Learning Paths
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Master specific coding languages with bite-sized lessons, interactive slides, and sequential roadmaps.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Python Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-blue-500/40 transition-all flex flex-col gap-4">
                <span className="text-[10px] font-bold text-blue-400 tracking-wider bg-blue-500/10 px-2 py-0.5 rounded w-fit">PYTHON DEVELOPER</span>
                <div>
                  <h3 className="font-bold text-white text-base">Python Developer Path</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Syntax, arrays, decorators, and data analysis using NumPy and Pandas.</p>
                </div>
                <div className="mt-auto border-t border-white/5 pt-4 text-xs space-y-2 text-gray-400">
                  <div className="flex justify-between">
                    <span>Lessons:</span>
                    <span className="text-white font-semibold">15 Bite-sized Modules</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </div>
                </div>
                <button
                  onClick={() => openCourseModalMock("python")}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs text-center transition-all mt-2"
                >
                  Start Python Path <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
                </button>
              </div>
 
              {/* Web Dev Card */}
              <div className={`bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 relative transition-all duration-300 ${!unlockedPaths.includes("web") ? "opacity-60" : "hover:border-blue-500/40"}`}>
                {!unlockedPaths.includes("web") && (
                  <div className="absolute top-4 right-4 bg-red-500/10 text-red-400 p-1.5 rounded-lg border border-red-500/20">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="text-[10px] font-bold text-gray-400 tracking-wider bg-white/5 px-2 py-0.5 rounded w-fit">WEB DEVELOPER</span>
                <div>
                  <h3 className="font-bold text-gray-300 text-base">Web Developer Path</h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">HTML5 semantic grids, responsive CSS flexbox, and JavaScript interfaces.</p>
                </div>
                <div className="mt-auto border-t border-white/5 pt-4 text-xs text-gray-500 space-y-1">
                  <p>{!unlockedPaths.includes("web") ? "Prerequisites: Complete Python Boss Battle" : "Status: Ready"}</p>
                </div>
                <button
                  disabled={!unlockedPaths.includes("web")}
                  onClick={() => openCourseModalMock("web")}
                  className={`w-full py-2 font-bold rounded-xl text-xs text-center mt-2 transition-all ${
                    !unlockedPaths.includes("web")
                      ? "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {!unlockedPaths.includes("web") ? "Locked" : "Start Web Path"}
                </button>
              </div>
 
              {/* C Programming Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-blue-500/40 transition-all flex flex-col gap-4">
                <span className="text-[10px] font-bold text-blue-400 tracking-wider bg-blue-500/10 px-2 py-0.5 rounded w-fit">C MASTER</span>
                <div>
                  <h3 className="font-bold text-white text-base">C Programming Master</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Pointers, memory management structures, dynamic arrays, and file handling basics.</p>
                </div>
                <div className="mt-auto border-t border-white/5 pt-4 text-xs space-y-2 text-gray-400">
                  <div className="flex justify-between">
                    <span>Lessons:</span>
                    <span className="text-white font-semibold">2 Modules</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-semibold">Ready</span>
                  </div>
                </div>
                <button
                  onClick={() => openCourseModalMock("c")}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs text-center transition-all mt-2"
                >
                  Start C Roadmap <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
                </button>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      )}

      {/* 2. CODE COACH TAB (Algorithmic practice challenges) */}
      {activeTab === "code-coach" && (
        <div className="space-y-6 animate-in fade-in">
          {!coachSelectedId ? (
            <LiquidGlassCard className="p-6" accentColor="#3b82f6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" /> Standalone Practice Challenges
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {challenges.map(ch => (
                  <div
                    key={ch.id}
                    onClick={() => openChallengeWorkspace(ch)}
                    className="p-5 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-blue-500/40 hover:scale-[1.02] transition-all flex flex-col justify-between h-48"
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        ch.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      }`}>{ch.difficulty}</span>
                      <span className="text-[10px] text-yellow-500 font-bold">💰 +{ch.rewardCoins} Coins</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base mt-3">{ch.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{ch.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-3 border-t border-white/5">
                      <span>XP: +{ch.rewardXP}</span>
                      <span className="text-blue-400 font-bold flex items-center gap-0.5">Solve Now <ChevronRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                ))}
              </div>
            </LiquidGlassCard>
          ) : (
            activeChallenge && (
              <div className="grid gap-6 md:grid-cols-3">
                {/* Left panel problem statement */}
                <div className="md:col-span-1 space-y-4">
                  <button
                    onClick={() => setCoachSelectedId(null)}
                    className="px-4 py-1.5 border border-white/10 hover:bg-white/5 text-xs font-semibold rounded-xl text-gray-300 transition-colors"
                  >
                    Back to Challenges List
                  </button>
                  <LiquidGlassCard className="p-5" accentColor="#3b82f6">
                    <h3 className="font-bold text-lg text-white mb-2">{activeChallenge.title}</h3>
                    <span className="inline-block text-[10px] bg-green-500/15 text-green-400 font-bold px-3 py-0.5 rounded-full mb-4">
                      {activeChallenge.difficulty} Difficulty
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-light whitespace-pre-wrap">{activeChallenge.description}</p>
                    
                    <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Example Test Cases:</span>
                      {activeChallenge.testCases.map((tc, idx) => (
                        <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-xl text-[10px] font-mono">
                          <span className="text-blue-400 block mb-0.5">Input:</span>
                          <span className="text-gray-300 block mb-2">{tc.input}</span>
                          <span className="text-emerald-400 block mb-0.5">Expected Output:</span>
                          <span className="text-gray-300 block">{tc.output}</span>
                        </div>
                      ))}
                    </div>
                  </LiquidGlassCard>
                </div>

                {/* Right panel compiler workspace */}
                <div className="md:col-span-2 space-y-4">
                  <LiquidGlassCard className="p-4 flex justify-between items-center bg-slate-900 border-white/10">
                    <span className="text-xs font-bold text-white">Coding Workspace</span>
                    <select
                      value={coachLanguage}
                      onChange={(e) => {
                        const newLang = e.target.value as any;
                        setCoachLanguage(newLang);
                        setCoachCode(activeChallenge.initialCode[newLang] || "");
                      }}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-xs text-white focus:outline-none"
                    >
                      {activeChallenge.languages.map(l => (
                        <option key={l} value={l} className="bg-slate-900">{l === "python" ? "Python 3" : "JavaScript (Node)"}</option>
                      ))}
                    </select>
                  </LiquidGlassCard>

                  <div className={`h-96 border rounded-2xl overflow-hidden shadow-inner transition-all duration-300 ${activeTheme !== "default" ? themeAccentClass : "border-white/10"}`}>
                    <Editor
                      height="100%"
                      language={coachLanguage}
                      theme="vs-dark"
                      value={coachCode}
                      onChange={(v) => setCoachCode(v || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineHeight: 24,
                        padding: { top: 12 },
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>

                  {coachError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                      {coachError}
                    </div>
                  )}

                  {/* Submission Test results */}
                  {coachResults && (
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-white">Execution results:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        {coachResults.map((r: any, idx: number) => {
                          const passed = r.status?.id === 3;
                          return (
                            <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                              passed ? "bg-green-500/5 border-green-500/20 text-green-300" : "bg-red-500/5 border-red-500/20 text-red-300"
                            }`}>
                              <span>Test Case {idx + 1}:</span>
                              <span className="font-bold">{passed ? "Passed" : "Failed"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={runCoachChallenge}
                    disabled={coachRunning || !coachCode.trim()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow flex items-center justify-center gap-2"
                  >
                    {coachRunning ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Compiling sandbox solution...
                      </>
                    ) : (
                      "Run & Verify Solution"
                    )}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* 3. PLAYGROUND TAB (Free editor) */}
      {activeTab === "playground" && (
        <div className="grid gap-6 md:grid-cols-3 animate-in fade-in">
          {/* Left panel options and custom input */}
          <div className="md:col-span-1 space-y-4">
            <LiquidGlassCard className="p-5" accentColor="#3b82f6">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-1.5">
                <Cpu className="w-5 h-5 text-blue-400" /> Playground Config
              </h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-2">Programming Language:</label>
                  <select
                    value={pgLanguage}
                    onChange={(e) => {
                      const l = e.target.value as any;
                      setPgLanguage(l);
                      if (l === "python") setPgCode("# Write Python 3 here\nprint(\"Hello world!\")");
                      else if (l === "javascript") setPgCode("// Write Node JS here\nconsole.log(\"Hello world!\");");
                      else setPgCode("#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello world!\" << endl;\n    return 0;\n}");
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="python" className="bg-slate-900">Python 3</option>
                    <option value="javascript" className="bg-slate-900">JavaScript (Node)</option>
                    <option value="cpp" className="bg-slate-900">C++ (GCC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-2">Custom Input (Stdin):</label>
                  <textarea
                    value={pgInput}
                    onChange={(e) => setPgInput(e.target.value)}
                    rows={4}
                    placeholder="Enter command arguments or stdin variables..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 outline-none resize-none font-mono"
                  />
                </div>
              </div>
            </LiquidGlassCard>

            {/* Performance Stats */}
            {pgRuntime !== null && (
              <LiquidGlassCard className="p-5" accentColor="#22d3ee">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Performance profiling
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-black/40 border border-white/5 rounded-xl">
                    <span className="text-white font-extrabold">{pgRuntime} ms</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5">Execution Time</span>
                  </div>
                  <div className="p-2 bg-black/40 border border-white/5 rounded-xl">
                    <span className="text-white font-extrabold">{pgMemory} MB</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5">Memory Spikes</span>
                  </div>
                </div>
              </LiquidGlassCard>
            )}
          </div>

          {/* Right panel code compiler view */}
          <div className="md:col-span-2 space-y-4">
            <div className={`h-96 border rounded-3xl overflow-hidden shadow-inner bg-slate-950 transition-all duration-300 ${activeTheme !== "default" ? themeAccentClass : "border-white/10"} flex flex-col`}>
              <div className="flex justify-between items-center p-3 bg-white/5 border-b border-white/10 shrink-0">
                <span className="text-xs font-semibold text-white tracking-wider">Playground Editor</span>
                <div className="flex items-center gap-2">
                  <button onClick={formatCode} className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-[11px] flex items-center gap-1" title="Format Code">
                    <RefreshCw className="w-3 h-3" /> Format
                  </button>
                  <button onClick={saveCode} className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-[11px] flex items-center gap-1" title="Save Code">
                    <Save className="w-3 h-3" /> Save Draft
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language={pgLanguage}
                  theme="vs-dark"
                  value={pgCode}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 24,
                    padding: { top: 12 },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={runPlaygroundCode}
                disabled={pgRunning || !pgCode.trim()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow flex items-center justify-center gap-2 text-sm"
              >
                {pgRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Code
              </button>
            </div>

            {/* Output Panel */}
            {(pgOutput || pgError) && (
              <div className="p-4 bg-slate-900 border border-white/10 rounded-3xl space-y-2 font-mono text-xs">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Console Output:</span>
                {pgOutput && <pre className="text-emerald-400 whitespace-pre-wrap">{pgOutput}</pre>}
                {pgError && <pre className="text-red-400 whitespace-pre-wrap">{pgError}</pre>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ARENA TAB (Coder games) */}
      {activeTab === "arena" && (
        <div className="space-y-6 animate-in fade-in">
          {arenaMode === "lobby" && (
            <LiquidGlassCard className="p-6 max-w-xl mx-auto" accentColor="#3b82f6">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Sword className="w-5 h-5 text-blue-400 animate-pulse" /> EduSync Coding Arena Modes
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Challenge dynamic gamified modes: live matchmaking battles, boss logic fights, and AI review critiques.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* 1v1 Battle */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between h-44">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5"><Swords className="w-4 h-4 text-red-500" /> Code Battle Arena</h3>
                    <p className="text-[11px] text-gray-400 mt-2">Connect to a live 1v1 coder duel. The fastest developer to verify output wins.</p>
                  </div>
                  <button
                    onClick={start1v1Duel}
                    className="w-full py-2 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-300 font-bold rounded-xl text-xs"
                  >
                    Matchmake Now ⚡
                  </button>
                </div>

                {/* Boss Fight */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between h-44">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5"><Ghost className="w-4 h-4 text-yellow-500" /> AI Boss Fight</h3>
                    <p className="text-[11px] text-gray-400 mt-2">Defeat the 'Bug Monster' (HP: 500) by answering algorithm syntax questions.</p>
                  </div>
                  <button
                    onClick={() => { setArenaMode("boss"); setBossHp(500); setBossDefeated(false); }}
                    className="w-full py-2 bg-yellow-600/20 border border-yellow-500/30 hover:bg-yellow-600/30 text-yellow-300 font-bold rounded-xl text-xs"
                  >
                    Engage Bug Monster 👾
                  </button>
                </div>

                {/* Bug Hunter */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between h-44">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5"><Bug className="w-4 h-4 text-green-500" /> Bug Hunter</h3>
                    <p className="text-[11px] text-gray-400 mt-2">AI generates intentional syntax or logic errors. Find and correct them.</p>
                  </div>
                  <button
                    onClick={() => { setArenaMode("bug"); setBugStatus(null); setBugCode("def is_even(num):\n    # Bug: Off by one check\n    if num % 2 == 1:\n        return True\n    return False"); }}
                    className="w-full py-2 bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 text-green-300 font-bold rounded-xl text-xs"
                  >
                    Hunt Bugs 🐛
                  </button>
                </div>

                {/* Interview Sim */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between h-44">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5"><Mic className="w-4 h-4 text-cyan-400" /> Tech Interview Sim</h3>
                    <p className="text-[11px] text-gray-400 mt-2">Simulate a technical coding interview panel evaluation on reversing strings.</p>
                  </div>
                  <button
                    onClick={() => { setArenaMode("interview"); setInterviewReview(""); }}
                    className="w-full py-2 bg-cyan-600/20 border border-cyan-500/30 hover:bg-cyan-600/30 text-cyan-300 font-bold rounded-xl text-xs"
                  >
                    Enter Panel 🎤
                  </button>
                </div>

                {/* AI Reviewer */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between h-44 sm:col-span-2">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> AI Code Reviewer</h3>
                    <p className="text-[11px] text-gray-400 mt-2">Submit snippets for O(N) complexity reviews under unique personas (Linus Torvalds, Ada Lovelace).</p>
                  </div>
                  <button
                    onClick={() => { setArenaMode("review"); setReviewResult(""); }}
                    className="w-full py-2 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 font-bold rounded-xl text-xs"
                  >
                    Ask Reviewer 🤖
                  </button>
                </div>
              </div>
            </LiquidGlassCard>
          )}

          {/* 1V1 DUEL VIEW */}
          {arenaMode === "duel" && (
            <LiquidGlassCard className="p-6 max-w-xl mx-auto" accentColor="#ef4444">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-sm">Live 1v1 Battle</h3>
                <button onClick={() => setArenaMode("lobby")} className="text-xs text-red-400 hover:underline">Exit Duel</button>
              </div>

              {duelStatus === "search" && (
                <div className="text-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-gray-300">{duelSearchText}</p>
                </div>
              )}

              {duelStatus === "found" && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl text-center">
                    Opponent matched: {duelOpponent} (1240 ELO)
                  </div>
                  <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold block">PROBLEM:</span>
                    <p className="text-xs text-white">Write a quick Python code to reverse an array using slice indexing syntax.</p>
                  </div>
                  <textarea
                    value={duelCode}
                    onChange={(e) => setDuelCode(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white font-mono outline-none"
                  />
                  <button
                    onClick={submitDuelCode}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Submit solution fast!
                  </button>
                </div>
              )}

              {duelStatus === "completed" && (
                <div className="text-center py-8 space-y-4 animate-in fade-in">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
                  <h4 className="text-base font-extrabold text-green-400">DUEL VICTORIOUS!</h4>
                  <p className="text-xs text-gray-300">You submitted in 12.4 seconds, beating {duelOpponent}'s 18.2 seconds! +80 Coins & +50 XP awarded.</p>
                  <button onClick={() => setArenaMode("lobby")} className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10">Back to Lobby</button>
                </div>
              )}
            </LiquidGlassCard>
          )}

          {/* BOSS FIGHT VIEW */}
          {arenaMode === "boss" && (
            <LiquidGlassCard className="p-6 max-w-xl mx-auto" accentColor="#fbbf24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-sm">Boss Fight: Bug Monster</h3>
                <button onClick={() => setArenaMode("lobby")} className="text-xs text-yellow-500 hover:underline">Run Away</button>
              </div>

              {!bossDefeated ? (
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <Ghost className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
                    <h4 className="text-base font-extrabold text-white">Bug Monster Level 14</h4>
                    
                    {/* HP Bar */}
                    <div className="w-full bg-slate-800 h-4 rounded-full border border-white/15 overflow-hidden max-w-md mx-auto">
                      <div className="bg-red-600 h-full rounded-full transition-all duration-300" style={{ width: `${(bossHp / bossMaxHp) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{bossHp} / {bossMaxHp} HP remaining</span>
                  </div>

                  <div className="space-y-2 pt-4">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Attack modules (Solve coding logic):</span>
                    
                    <button
                      onClick={() => attackBoss(150, "C loop logic")}
                      className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs flex justify-between items-center text-left"
                    >
                      <span>1. Array Indexing syntax (Easy)</span>
                      <span className="text-red-400 font-semibold">-150 HP Damage</span>
                    </button>
                    <button
                      onClick={() => attackBoss(200, "Recursion complexity")}
                      className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs flex justify-between items-center text-left"
                    >
                      <span>2. Fibonnaci recursion stack (Medium)</span>
                      <span className="text-red-400 font-semibold">-200 HP Damage</span>
                    </button>
                    <button
                      onClick={() => attackBoss(250, "Pointers dynamic allocation")}
                      className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs flex justify-between items-center text-left"
                    >
                      <span>3. C Pointer references allocations (Hard)</span>
                      <span className="text-red-400 font-semibold">-250 HP Damage</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto animate-pulse" />
                  <h4 className="text-base font-extrabold text-green-400">Bug Monster defeated!</h4>
                  <p className="text-xs text-gray-300">Total Coins earned: +150 Coins. You leveled up to intermediate rank.</p>
                  <button onClick={() => setArenaMode("lobby")} className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs">Back to Lobby</button>
                </div>
              )}
            </LiquidGlassCard>
          )}

          {/* BUG HUNTER VIEW */}
          {arenaMode === "bug" && (
            <LiquidGlassCard className="p-6 max-w-xl mx-auto" accentColor="#10b981">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-sm">Bug Hunter</h3>
                <button onClick={() => setArenaMode("lobby")} className="text-xs text-green-400 hover:underline">Exit Game</button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl">
                  Task: Correct the mod operator logic below to check if a number is even.
                </div>

                <textarea
                  value={bugCode}
                  onChange={(e) => setBugCode(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white font-mono outline-none"
                />

                {bugStatus === "passed" && (
                  <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Bug Fixed successfully! (+40 Coins & +30 XP)
                  </div>
                )}
                {bugStatus === "failed" && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-1.5 font-bold">
                    <XCircle className="w-4 h-4" /> Logic error! Checks are still flagging incorrect outcomes.
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={checkBugFix}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Verify Bug Fix
                  </button>
                  <button
                    onClick={() => {
                      setBugStatus(null);
                      setBugCode("def is_even(num):\n    # Bug: Off by one check\n    if num % 2 == 1:\n        return True\n    return False");
                    }}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-semibold text-gray-300"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </LiquidGlassCard>
          )}

          {/* TECH INTERVIEW VIEW */}
          {arenaMode === "interview" && (
            <LiquidGlassCard className="p-6 max-w-xl mx-auto" accentColor="#22d3ee">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-sm">Tech Interview Simulator</h3>
                <button onClick={() => setArenaMode("lobby")} className="text-xs text-cyan-400 hover:underline">Exit Panel</button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-900 border border-white/10 rounded-xl text-xs text-gray-300 leading-relaxed font-light">
                  <span className="font-bold text-cyan-400 block mb-1">Google SDE Panel:</span>
                  "Write a short function to reverse a string in Python optimally."
                </div>

                <textarea
                  value={interviewCode}
                  onChange={(e) => setInterviewCode(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white font-mono outline-none"
                />

                {interviewReview && (
                  <div className="p-4 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {interviewReview}
                  </div>
                )}

                <button
                  onClick={runInterviewAnalyze}
                  disabled={isInterviewing}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  {isInterviewing ? "Interviewers discussing..." : "Submit solution to interview panel"}
                </button>
              </div>
            </LiquidGlassCard>
          )}

          {/* AI REVIEWER VIEW */}
          {arenaMode === "review" && (
            <LiquidGlassCard className="p-6 max-w-xl mx-auto" accentColor="#8b5cf6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-sm">AI Code Reviewer</h3>
                <button onClick={() => setArenaMode("lobby")} className="text-xs text-purple-400 hover:underline">Exit Review</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Select Reviewer Persona:</label>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <button
                      onClick={() => setReviewPersona("linus")}
                      className={`p-2 rounded-xl border text-xs font-semibold ${
                        reviewPersona === "linus" ? "bg-red-500/10 border-red-500 text-red-400" : "bg-white/5 border-white/10 text-gray-400"
                      }`}
                    >
                      😠 Linus Torvalds
                    </button>
                    <button
                      onClick={() => setReviewPersona("ada")}
                      className={`p-2 rounded-xl border text-xs font-semibold ${
                        reviewPersona === "ada" ? "bg-purple-500/10 border-purple-500 text-purple-400" : "bg-white/5 border-white/10 text-gray-400"
                      }`}
                    >
                      🎓 Ada Lovelace
                    </button>
                    <button
                      onClick={() => setReviewPersona("coach")}
                      className={`p-2 rounded-xl border text-xs font-semibold ${
                        reviewPersona === "coach" ? "bg-green-500/10 border-green-500 text-green-400" : "bg-white/5 border-white/10 text-gray-400"
                      }`}
                    >
                      🤝 Friendly Coach
                    </button>
                  </div>
                </div>

                <textarea
                  value={reviewSnippet}
                  onChange={(e) => setReviewSnippet(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white font-mono outline-none"
                />

                {reviewResult && (
                  <div className="p-4 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {reviewResult}
                  </div>
                )}

                <button
                  onClick={getReviewText}
                  disabled={isReviewing || !reviewSnippet.trim()}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  {isReviewing ? "Analyzing complexity..." : "Get Review Feedback"}
                </button>
              </div>
            </LiquidGlassCard>
          )}
        </div>
      )}

      {/* 5. ARCADE / GAMIFICATION TAB */}
      {activeTab === "arcade" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Daily goals & quests */}
            <LiquidGlassCard className="p-6" accentColor="#3b82f6">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-1.5">
                <Target className="w-5 h-5 text-blue-400 animate-pulse" /> Daily Quests
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <strong className="text-white block">Solve 1 Code Coach problem</strong>
                    <span className="text-[10px] text-yellow-500">Reward: 💰 +20 Coins</span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-0.5"><Check className="w-3.5 h-3.5" /> Completed</span>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <strong className="text-white block">Attain 15-day streak goal</strong>
                    <span className="text-[10px] text-yellow-500">Reward: 💰 +50 Coins</span>
                  </div>
                  <span className="text-gray-400 font-semibold bg-white/5 px-2.5 py-0.5 rounded border border-white/5">12 / 15 Days</span>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <strong className="text-white block">Submit C/C++ memory pointers</strong>
                    <span className="text-[10px] text-yellow-500">Reward: 💰 +100 Coins</span>
                  </div>
                  <span className="text-gray-400 font-semibold bg-white/5 px-2.5 py-0.5 rounded border border-white/5">0 / 1 Done</span>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Achievements Cabinet */}
            <LiquidGlassCard className="p-6" accentColor="#bd93f9">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-1.5">
                <Award className="w-5 h-5 text-purple-400" /> Coding Achievements
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-center space-y-1.5">
                  <span className="text-2xl block">🔥</span>
                  <strong className="text-white block">Speed Demon</strong>
                  <span className="text-[10px] text-purple-300">Run code in under 50ms.</span>
                  <span className="block text-[9px] text-green-400 font-bold bg-green-500/10 py-0.5 rounded">Unlocked</span>
                </div>

                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-center space-y-1.5">
                  <span className="text-2xl block">👾</span>
                  <strong className="text-white block">Boss Slayer</strong>
                  <span className="text-[10px] text-purple-300">Defeated Bug Monster.</span>
                  <span className="block text-[9px] text-green-400 font-bold bg-green-500/10 py-0.5 rounded">Unlocked</span>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 opacity-60 rounded-xl text-center space-y-1.5">
                  <span className="text-2xl block">🏆</span>
                  <strong className="text-gray-400 block">Duels Champion</strong>
                  <span className="text-[10px] text-gray-500">Win 10 live matches.</span>
                  <span className="block text-[9px] text-gray-500 font-bold bg-white/5 py-0.5 rounded">Locked (0/10)</span>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 opacity-60 rounded-xl text-center space-y-1.5">
                  <span className="text-2xl block">🛠️</span>
                  <strong className="text-gray-400 block">Stack Master</strong>
                  <span className="text-[10px] text-gray-500">Complete 3 courses.</span>
                  <span className="block text-[9px] text-gray-500 font-bold bg-white/5 py-0.5 rounded">Locked (0/3)</span>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      )}

      {/* 6. PROFILE & SHOP TAB */}
      {activeTab === "shop" && (
        <div className="space-y-6 animate-in fade-in">
          <LiquidGlassCard className="p-6" accentColor="#fbbf24">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" /> Coding Reward Shop
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Spend your virtual coins on custom editor theme skins, shield items, and debugging utilities.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {SHOP_ITEMS.map(item => {
                const owned = ownedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between h-44 hover:border-yellow-500/30 transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl">{item.icon || "🎨"}</span>
                        {owned && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                            Owned
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-sm mt-3">{item.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-white/5 mt-auto">
                      {!owned ? (
                        <button
                          onClick={() => handleBuyItem(item.id, item.cost, item.type)}
                          className="w-full py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          💰 {item.cost} Coins
                        </button>
                      ) : (
                        item.type === "theme" && (
                          <button
                            onClick={() => {
                              setActiveTheme(item.id);
                              alert(`Active compiler theme changed to ${item.name}!`);
                            }}
                            className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                              activeTheme === item.id 
                                ? "bg-purple-600 text-white" 
                                : "bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
                            }`}
                          >
                            {activeTheme === item.id ? "Selected Theme" : "Use Theme"}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </LiquidGlassCard>
        </div>
      )}
      {/* Dynamic Interactive Course Modal Overlay */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl relative">
            {/* Modal Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  {MOCK_PATH_COURSES[activeCourseKey].title}
                </h3>
                <span className="text-[10px] text-gray-400 block mt-0.5 font-light leading-relaxed">
                  Module {courseModuleIdx + 1} of {MOCK_PATH_COURSES[activeCourseKey].modules.length}: {MOCK_PATH_COURSES[activeCourseKey].modules[courseModuleIdx].title}
                </span>
              </div>
              <button onClick={closeCourseModal} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Main Content Container */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-10 gap-4 p-5">
              {/* Left Column (Width 40%): Theory, Slides list & Navigation */}
              <div className="md:col-span-4 flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-gray-400">
                      <span>Path Progress</span>
                      <span>{Math.round(((courseModuleIdx + 1) / MOCK_PATH_COURSES[activeCourseKey].modules.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-black/40 h-2 rounded-full border border-white/10 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${((courseModuleIdx + 1) / MOCK_PATH_COURSES[activeCourseKey].modules.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Modules Navigation list */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Course Roadmap Modules:</span>
                    {MOCK_PATH_COURSES[activeCourseKey].modules.map((mod, idx) => {
                      const isActive = idx === courseModuleIdx;
                      const isCompleted = idx < courseModuleIdx;
                      return (
                        <div 
                          key={mod.id}
                          onClick={() => {
                            if (idx <= courseModuleIdx || courseVerified) {
                              setCourseModuleIdx(idx);
                              setCourseCode(mod.initialCode);
                              setCourseOutput("");
                              setCourseError("");
                              setCourseVerified(false);
                              setCourseHintVisible(false);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            isActive 
                              ? "bg-indigo-600/20 border-indigo-500 text-white font-bold" 
                              : isCompleted 
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                                : "bg-black/20 border-white/5 text-gray-400 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <span className="truncate">{idx + 1}. {mod.title}</span>
                          {mod.isBoss && <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 px-1.5 py-0.5 rounded">BOSS</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Module Details / Theory Card */}
                  <div className={`p-4 bg-slate-900 border rounded-2xl space-y-3 relative ${MOCK_PATH_COURSES[activeCourseKey].modules[courseModuleIdx].isBoss ? "border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-white/10"}`}>
                    <h4 className={`text-sm font-bold flex items-center gap-1 ${MOCK_PATH_COURSES[activeCourseKey].modules[courseModuleIdx].isBoss ? "text-rose-400" : "text-white"}`}>
                      {MOCK_PATH_COURSES[activeCourseKey].modules[courseModuleIdx].isBoss ? "☠️ " : "📖 "}
                      {MOCK_PATH_COURSES[activeCourseKey].modules[courseModuleIdx].title}
                    </h4>
                    <p className="text-xs text-gray-300 font-light leading-relaxed whitespace-pre-wrap">
                      {MOCK_PATH_COURSES[activeCourseKey].modules[courseModuleIdx].theory}
                    </p>
                    
                    {courseHintVisible && (
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-[11px] text-indigo-300 leading-relaxed font-light">
                        <strong>Hint:</strong> {MOCK_PATH_COURSES[activeCourseKey].modules[courseModuleIdx].hint}
                      </div>
                    )}
                  </div>
                </div>

                {/* Left Navigation Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => courseHintVisible ? setCourseHintVisible(false) : setCourseHintVisible(true)}
                    className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold rounded-xl text-gray-300 transition-colors"
                  >
                    {courseHintVisible ? "Hide Hint" : "Get Hint"}
                  </button>
                  {courseModuleIdx < MOCK_PATH_COURSES[activeCourseKey].modules.length - 1 && (
                    <button 
                      onClick={loadNextModule}
                      disabled={!courseVerified}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      Next Lesson <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {courseModuleIdx === MOCK_PATH_COURSES[activeCourseKey].modules.length - 1 && (
                    <button 
                      onClick={closeCourseModal}
                      disabled={!courseVerified}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Finish Path! 🎓
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column (Width 60%): Monaco Editor & Compiler logs */}
              <div className="md:col-span-6 flex flex-col gap-4 overflow-hidden">
                <div className="h-72 border border-white/10 rounded-2xl overflow-hidden shadow-inner shrink-0">
                  <Editor
                    height="100%"
                    language={MOCK_PATH_COURSES[activeCourseKey].modules[courseModuleIdx].language}
                    theme="vs-dark"
                    value={courseCode}
                    onChange={(v) => setCourseCode(v || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineHeight: 20,
                      padding: { top: 10 },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>

                {/* Console Output logs */}
                <div className="flex-1 p-3.5 bg-slate-950 border border-white/5 rounded-2xl overflow-y-auto font-mono text-[11px] min-h-[100px]">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Terminal logs:</span>
                  {courseOutput && <pre className="text-emerald-400 whitespace-pre-wrap">{courseOutput}</pre>}
                  {courseError && <pre className="text-red-400 whitespace-pre-wrap">{courseError}</pre>}
                  {!courseOutput && !courseError && <span className="text-gray-600 italic">No output logged yet. Run code to verify.</span>}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => setCourseCode(MOCK_PATH_COURSES[activeCourseKey].modules[courseModuleIdx].initialCode)}
                    className="px-4 py-2.5 border border-white/10 hover:bg-white/5 text-xs font-semibold rounded-xl text-gray-300 transition-colors"
                  >
                    Reset Code
                  </button>
                  <button
                    onClick={verifyCourseModule}
                    disabled={courseVerifying || !courseCode.trim()}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {courseVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Run & Verify Solution
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
