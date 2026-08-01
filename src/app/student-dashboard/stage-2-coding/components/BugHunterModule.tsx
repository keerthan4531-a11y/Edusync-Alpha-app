"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { 
  Bug, Search, Wrench, Play, CheckCircle2, ChevronLeft, Loader2, Sparkles, HelpCircle,
  RefreshCw, Gauge, Terminal, Check, Copy, Code2, ArrowRight, XCircle, SlidersHorizontal
} from "lucide-react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { DifficultyPicker, Difficulty } from "@/app/student-dashboard/stage-1-communication/components/DifficultyPicker";

interface BugChallenge {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: "Easy" | "Medium" | "Hard";
  buggyCode: string;
  correctCode: string;
  bugLine: number;
  bugExplanation: string;
  hint: string;
  expectedOutput: string;
  testCases: { input: string; output: string }[];
}

const DEFAULT_BUGS: BugChallenge[] = [
  {
    id: "find-max",
    title: "Find Maximum Element in Array",
    description: "Find the largest number in a list of integers.",
    language: "python",
    difficulty: "Easy",
    buggyCode: "def find_max(arr):\n    max_val = 0\n    for i in arr:\n        if i < max_val:\n            max_val = i\n    return max_val\n\nprint(find_max([3, 7, 2, 9, 4]))",
    correctCode: "def find_max(arr):\n    max_val = arr[0]\n    for i in arr:\n        if i > max_val:\n            max_val = i\n    return max_val\n\nprint(find_max([3, 7, 2, 9, 4]))",
    bugLine: 4,
    bugExplanation: "The comparison operator `if i < max_val:` is inverted! It should check `if i > max_val:` to track the largest element.",
    hint: "Check the comparison operator inside the for loop: `<` vs `>`.",
    expectedOutput: "9",
    testCases: [{ input: "", output: "9" }]
  },
  {
    id: "count-vowels",
    title: "Count Vowels in Sentence",
    description: "Count total vowel characters in a string.",
    language: "python",
    difficulty: "Easy",
    buggyCode: "def count_vowels(s):\n    vowels = 'aeiou'\n    count = 0\n    for char in s:\n        if char in vowels:\n            count += 2\n    return count\n\nprint(count_vowels('hello world'))",
    correctCode: "def count_vowels(s):\n    vowels = 'aeiou'\n    count = 0\n    for char in s:\n        if char in vowels:\n            count += 1\n    return count\n\nprint(count_vowels('hello world'))",
    bugLine: 6,
    bugExplanation: "The counter increments by 2 instead of 1 (`count += 2`). Each vowel should only add 1 to the count.",
    hint: "Check how much `count` increases per vowel iteration.",
    expectedOutput: "3",
    testCases: [{ input: "", output: "3" }]
  },
  {
    id: "palindrome-check",
    title: "Palindrome String Check",
    description: "Check if a string reads the same forwards and backwards.",
    language: "python",
    difficulty: "Medium",
    buggyCode: "def is_palindrome(s):\n    cleaned = s.lower().replace(' ', '')\n    return cleaned == cleaned[::1]\n\nprint(is_palindrome('racecar'))",
    correctCode: "def is_palindrome(s):\n    cleaned = s.lower().replace(' ', '')\n    return cleaned == cleaned[::-1]\n\nprint(is_palindrome('racecar'))",
    bugLine: 3,
    bugExplanation: "The string slice step `[::1]` does not reverse the string! It should be `[::-1]` to slice backwards.",
    hint: "Check Python string slicing step argument: `[::1]` vs `[::-1]`.",
    expectedOutput: "True",
    testCases: [{ input: "", output: "True" }]
  }
];

interface EfficiencyReport {
  efficiencyScore: number;
  timeComplexity: string;
  spaceComplexity: string;
  qualityRating: string;
  summaryFeedback: string;
  optimizationTips: string[];
}

/**
 * Skeleton Loader Component matching Communication Stage design
 */
function BugHunterSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto w-full">
      {/* Top Box Skeleton */}
      <div className="neu-convex dark:bg-[#0d121f] rounded-3xl border border-blue-500/20 p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center pb-3 border-b border-blue-500/10">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-32 rounded-lg bg-blue-500/20" />
            <Skeleton className="h-5 w-24 rounded-full bg-red-500/20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-xl bg-white/5" />
            <Skeleton className="h-8 w-32 rounded-xl bg-blue-500/20" />
          </div>
        </div>

        <div className="space-y-3 p-5 bg-[#080c14] rounded-2xl border border-blue-500/10">
          <Skeleton className="h-4 w-3/4 rounded-lg bg-blue-500/10" />
          <Skeleton className="h-4 w-1/2 rounded-lg bg-blue-500/10" />
          <Skeleton className="h-4 w-5/6 rounded-lg bg-blue-500/10" />
          <Skeleton className="h-4 w-2/3 rounded-lg bg-blue-500/10" />
          <Skeleton className="h-4 w-4/5 rounded-lg bg-blue-500/10" />
        </div>

        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-36 rounded-lg bg-emerald-500/10" />
          <Skeleton className="h-6 w-32 rounded-lg bg-amber-500/10" />
        </div>
      </div>

      {/* Compiler Skeleton */}
      <div className="neu-convex dark:bg-[#0b0f19] rounded-3xl border border-indigo-500/20 p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center pb-3 border-b border-indigo-500/10">
          <Skeleton className="h-6 w-48 rounded-lg bg-indigo-500/20" />
          <Skeleton className="h-10 w-36 rounded-xl bg-indigo-600/30" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl bg-indigo-950/20" />
      </div>
    </div>
  );
}

export function BugHunterModule({ 
  onBack, 
  onAwardXP 
}: { 
  onBack: () => void; 
  onAwardXP: (xp: number, coins: number) => void;
}) {
  const [challenges, setChallenges] = useState<BugChallenge[]>(DEFAULT_BUGS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [pendingDifficulty, setPendingDifficulty] = useState(false);

  const activeChallenge = challenges[selectedIdx] || DEFAULT_BUGS[0];

  // User Interactive Compiler State
  const [code, setCode] = useState(activeChallenge.buggyCode);
  const [bugFound, setBugFound] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [passed, setPassed] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Skeleton Loading State
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);

  // Efficiency Analyzer State
  const [isAnalyzingEfficiency, setIsAnalyzingEfficiency] = useState(false);
  const [efficiencyReport, setEfficiencyReport] = useState<EfficiencyReport | null>(null);

  // Auto load dynamic AI challenge with Skeleton animation on mount
  useEffect(() => {
    handleLoadNextAIBug(selectedDifficulty);
  }, []);

  // Update compiler code when switching challenge
  useEffect(() => {
    if (activeChallenge) {
      setCode(activeChallenge.buggyCode);
      setBugFound(false);
      setHintUsed(false);
      setAttempts(0);
      setOutput("");
      setError("");
      setPassed(false);
      setEfficiencyReport(null);
    }
  }, [selectedIdx, activeChallenge]);

  // Tab click handler with skeleton transition
  const handleSelectTab = (idx: number) => {
    setIsLoadingChallenge(true);
    setSelectedIdx(idx);
    setTimeout(() => {
      setIsLoadingChallenge(false);
    }, 500);
  };

  // Load / Generate next AI bug challenge with skeleton animation
  const handleLoadNextAIBug = async (diff?: "Easy" | "Medium" | "Hard") => {
    const targetDiff = diff || selectedDifficulty;
    setIsLoadingChallenge(true);
    setEfficiencyReport(null);
    setPassed(false);
    const startTime = Date.now();

    try {
      const res = await fetch("/api/code/generate-bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: targetDiff })
      });
      const data = await res.json();
      if (data && data.buggyCode) {
        setChallenges(prev => [data, ...prev]);
        setSelectedIdx(0);
      }
    } catch (e) {
      console.error("AI Bug Generation Error:", e);
    } finally {
      const elapsed = Date.now() - startTime;
      const minDelay = Math.max(0, 600 - elapsed);
      setTimeout(() => {
        setIsLoadingChallenge(false);
      }, minDelay);
    }
  };

  const handleCopyBuggyCode = () => {
    navigator.clipboard.writeText(activeChallenge.buggyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run user fixed code using sandbox API
  const handleRunCode = async () => {
    setRunning(true);
    setOutput("");
    setError("");
    setPassed(false);
    setEfficiencyReport(null);
    setAttempts(prev => prev + 1);

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: code,
          languageId: "71", // Python 3
          testCases: activeChallenge.testCases
        })
      });
      const data = await res.json();

      if (res.ok && data.success && data.results) {
        const stdout = (data.results[0].stdout || "").trim();
        const stderr = data.results[0].stderr || data.results[0].compile_output || "";
        setOutput(stdout);

        if (stderr) setError(stderr);

        const expected = activeChallenge.expectedOutput.trim();
        if (stdout === expected || stdout.includes(expected)) {
          setPassed(true);
          let totalXP = 50; // Base fix XP
          if (bugFound) totalXP += 20; // Bug located bonus
          if (attempts === 0) totalXP += 20; // First attempt bonus
          if (hintUsed) totalXP -= 10; // Hint penalty
          
          onAwardXP(Math.max(totalXP, 30), 25);

          // Trigger AI Efficiency Analysis
          analyzeCodeEfficiency(code);
        } else if (!stderr) {
          setError(`Output produced: "${stdout}", but expected: "${expected}"`);
        }
      } else {
        setError(data.message || "Compilation failed. Check syntax.");
      }
    } catch (e) {
      setError("Execution timeout or network issue.");
    } finally {
      setRunning(false);
    }
  };

  // Analyze code efficiency via AI worker
  const analyzeCodeEfficiency = async (userSubmittedCode: string) => {
    setIsAnalyzingEfficiency(true);
    try {
      const res = await fetch("/api/code/analyze-efficiency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeTitle: activeChallenge.title,
          buggyCode: activeChallenge.buggyCode,
          userCode: userSubmittedCode
        })
      });
      const data = await res.json();
      if (data && typeof data.efficiencyScore === "number") {
        setEfficiencyReport(data);
      }
    } catch (e) {
      console.error("Efficiency Analysis Error:", e);
    } finally {
      setIsAnalyzingEfficiency(false);
    }
  };

  // Render Difficulty Picker screen if user requests difficulty change
  if (pendingDifficulty) {
    return (
      <DifficultyPicker
        title="Bug Hunter"
        onSelect={(diff: Difficulty) => {
          const mappedDiff: "Easy" | "Medium" | "Hard" = diff === "EASY" ? "Easy" : diff === "HARD" ? "Hard" : "Medium";
          setSelectedDifficulty(mappedDiff);
          setPendingDifficulty(false);
          handleLoadNextAIBug(mappedDiff);
        }}
        onBack={() => setPendingDifficulty(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-foreground pb-12 animate-in fade-in">
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm mb-3"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Bug className="w-8 h-8 text-blue-500" /> Bug Hunter
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
            Inspect buggy code snippets in the box below, identify defects, and write your fixed code in the compiler!
          </p>
        </div>

        {/* Change Difficulty Button (Only shown when not loading) */}
        {!isLoadingChallenge && (
          <button
            onClick={() => setPendingDifficulty(true)}
            className="px-4 py-2.5 rounded-2xl bg-black/20 hover:bg-black/30 text-blue-400 border border-blue-500/20 font-bold text-xs flex items-center gap-2 transition-all shrink-0 self-start md:self-auto"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span>Difficulty: <strong className="text-foreground">{selectedDifficulty}</strong></span>
          </button>
        )}
      </div>

      {/* SKELETON LOADING VIEW (Matches Stage 1 Communication pattern - No pills, tabs, or legend!) */}
      {isLoadingChallenge ? (
        <BugHunterSkeleton />
      ) : (
        <>
          {/* Challenge Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {challenges.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => handleSelectTab(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                  selectedIdx === idx
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-lg shadow-blue-500/10 scale-[1.01]"
                    : "neu-flat dark:bg-white/5 text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
                <span>{ch.title}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {ch.difficulty}
                </span>
              </button>
            ))}
          </div>

          {/* XP Scoring Legend Bar */}
          <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-4 rounded-2xl border border-blue-500/20 flex flex-wrap gap-4 items-center justify-between text-xs font-bold shadow-sm">
            <div className="flex items-center gap-2 text-blue-400">
              <Search className="w-4 h-4" /> Bug Located: <span className="text-foreground">+20 XP</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-400">
              <Wrench className="w-4 h-4" /> Correct Fix: <span className="text-foreground">+50 XP</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="w-4 h-4" /> First Attempt: <span className="text-foreground">+20 XP</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <HelpCircle className="w-4 h-4" /> Hint Used: <span className="text-foreground">-10 XP</span>
            </div>
          </div>

          {/* =================================================================== */}
          {/* 1. TOP SECTION: BUGGY CODE DISPLAY BOX (BOX LAYOUT - NOT EDITABLE) */}
          {/* =================================================================== */}
          <div className="neu-convex dark:bg-[#0d121f] rounded-3xl border border-blue-500/30 overflow-hidden shadow-2xl transition-all">
            {/* Box Top Toolbar */}
            <div className="px-6 py-4 bg-black/40 border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs md:text-sm font-mono font-bold text-blue-400 flex items-center gap-1.5 ml-2">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  buggy_snippet.py
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  Buggy Code Snippet
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBuggyCode}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Code"}
                </button>
                <button
                  onClick={() => setBugFound(true)}
                  disabled={bugFound}
                  className="px-4 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-extrabold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  {bugFound ? "🔍 Bug Located (+20 XP)" : "Inspect Bug (+20 XP)"}
                </button>
              </div>
            </div>

            {/* Box Code Content Display */}
            <div className="p-6 bg-[#080c14] space-y-4">
              <div className="font-mono text-xs md:text-sm text-gray-200 leading-relaxed overflow-x-auto p-4 rounded-2xl bg-black/60 border border-blue-500/15 shadow-inner">
                {activeChallenge.buggyCode.split("\n").map((line, idx) => {
                  const lineNum = idx + 1;
                  const isBuggedLine = bugFound && lineNum === activeChallenge.bugLine;
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-start px-2 py-1 rounded transition-colors ${
                        isBuggedLine 
                          ? "bg-red-500/20 border-l-4 border-red-500 text-red-300 font-bold animate-pulse" 
                          : "hover:bg-white/5"
                      }`}
                    >
                      <span className="w-8 shrink-0 text-muted-foreground select-none text-right pr-4 text-xs">
                        {lineNum}
                      </span>
                      <span className="whitespace-pre flex-1">
                        {line}
                      </span>
                      {isBuggedLine && (
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500 text-white ml-2">
                          🐛 DEFECT LINE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Expected Output & Diagnostics Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-muted-foreground">Expected Output:</span>
                  <code className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {activeChallenge.expectedOutput}
                  </code>
                </div>

                {!hintUsed ? (
                  <button
                    onClick={() => setHintUsed(true)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 underline transition-colors"
                  >
                    Need a hint? (-10 XP penalty)
                  </button>
                ) : (
                  <div className="text-xs font-medium text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span><strong>Hint:</strong> {activeChallenge.hint}</span>
                  </div>
                )}
              </div>

              {/* Bug Diagnostic Card (Shown when Inspect Bug is clicked) */}
              {bugFound && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold leading-relaxed animate-in slide-in-from-top-3">
                  <div className="flex items-center gap-2 text-red-400 font-extrabold text-sm mb-1">
                    <Search className="w-4 h-4" /> Bug Diagnostic Analysis
                  </div>
                  <p>{activeChallenge.bugExplanation}</p>
                </div>
              )}
            </div>
          </div>

          {/* =================================================================== */}
          {/* 2. BOTTOM SECTION: INTERACTIVE FIX COMPILER & EDITOR                */}
          {/* =================================================================== */}
          <div className="neu-convex dark:bg-[#0b0f19] rounded-3xl border border-indigo-500/30 overflow-hidden shadow-2xl">
            {/* Compiler Top Toolbar */}
            <div className="px-6 py-4 bg-black/40 border-b border-indigo-500/20 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-foreground">Interactive Fix Compiler</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Python 3 Sandbox
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCode(activeChallenge.buggyCode)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground text-xs font-bold flex items-center gap-1.5 transition-all border border-white/10"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Code
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={running}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:scale-105 active:scale-95 text-white font-extrabold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {running ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Executing Sandbox...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Run & Test Fix
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Monaco Code Editor */}
            <div className="h-80 w-full relative border-b border-indigo-500/20">
              <Editor
                height="100%"
                language="python"
                theme="vs-dark"
                value={code}
                onChange={v => setCode(v || "")}
                loading={
                  <div className="h-full w-full bg-[#0b0f19] flex items-center justify-center text-xs text-muted-foreground font-mono animate-pulse">
                    Initializing Python Editor...
                  </div>
                }
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  padding: { top: 12, bottom: 12 },
                  quickSuggestions: false,
                  contextmenu: false
                }}
              />
            </div>

            {/* Compiler Console Output / Test Results */}
            <div className="p-6 bg-[#080c14] space-y-4">
              <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" /> Console Execution Output
              </h4>

              {passed ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center space-y-4 animate-in zoom-in-95">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
                  <h4 className="text-xl font-extrabold text-emerald-300">BUG SLAIN! ALL TEST CASES PASSED 🎉</h4>
                  <p className="text-xs text-emerald-200">
                    Correct logic restored! Output produced: <code className="bg-emerald-950 px-2 py-0.5 rounded font-mono font-bold text-white">{output}</code>
                  </p>

                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => handleLoadNextAIBug()}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-xs md:text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                      Next AI Bug Challenge <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono space-y-1">
                  <div className="font-extrabold flex items-center gap-2 text-red-400">
                    <XCircle className="w-4 h-4" /> Execution Error / Test Failure:
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{error}</p>
                </div>
              ) : output ? (
                <div className="p-4 rounded-2xl bg-black/60 border border-indigo-500/20 font-mono text-xs text-indigo-300 space-y-1">
                  <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-bold">Standard Output (stdout):</span>
                  <pre className="whitespace-pre-wrap">{output}</pre>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-xs font-medium">
                  Write your fixed code in the editor above and click <strong className="text-indigo-400">Run & Test Fix</strong> to execute against sandbox test cases.
                </div>
              )}
            </div>
          </div>

          {/* =================================================================== */}
          {/* 3. CODE EFFICIENCY & AI DIAGNOSTIC REPORT CARD                     */}
          {/* =================================================================== */}
          {isAnalyzingEfficiency && (
            <div className="p-6 neu-flat dark:bg-[#0b0f19] rounded-3xl border border-indigo-500/30 flex items-center justify-center gap-3 text-indigo-400 text-xs font-extrabold animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              AI Analyzing Code Efficiency & Complexity...
            </div>
          )}

          {efficiencyReport && (
            <LiquidGlassCard className="p-6 border-indigo-500 bg-indigo-500/5 animate-in slide-in-from-bottom-4" accentColor="#6366f1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                    <Gauge className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-foreground">AI Code Efficiency Analysis</h3>
                    <p className="text-xs text-muted-foreground font-medium">Performance metrics & clean code evaluation</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold text-sm">
                    Efficiency: {efficiencyReport.efficiencyScore}%
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold text-sm">
                    {efficiencyReport.qualityRating}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-black/40 border border-indigo-500/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block">Time Complexity</span>
                  <span className="text-lg font-extrabold font-mono text-indigo-400">{efficiencyReport.timeComplexity}</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-indigo-500/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block">Space Complexity</span>
                  <span className="text-lg font-extrabold font-mono text-indigo-400">{efficiencyReport.spaceComplexity}</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-indigo-500/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block">Overall Rating</span>
                  <span className="text-lg font-extrabold text-emerald-400">{efficiencyReport.qualityRating}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-indigo-500/20 text-xs md:text-sm text-gray-200 leading-relaxed">
                  <strong className="text-indigo-400 block mb-1 font-extrabold">💡 Architect Feedback:</strong>
                  {efficiencyReport.summaryFeedback}
                </div>

                {efficiencyReport.optimizationTips?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Optimization & Clean Code Tips:
                    </span>
                    <ul className="space-y-1 text-xs text-emerald-200 font-medium">
                      {efficiencyReport.optimizationTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </LiquidGlassCard>
          )}
        </>
      )}
    </div>
  );
}
