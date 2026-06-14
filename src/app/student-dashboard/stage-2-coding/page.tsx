"use client"
import { GlassCard } from "@/components/ui/glass-card"

import { useState } from "react"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import Editor from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Play, Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function CodingStagePage() {
  const [code, setCode] = useState("def twoSum(nums, target):\n    # Write your code here\n    pass\n\nprint(twoSum([2, 7, 11, 15], 9))")
  const [isExecuting, setIsExecuting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleRun = async () => {
    setIsExecuting(true)
    setResults(null)
    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: code,
          languageId: "71", // Python
          testCases: [
            { input: "[2,7,11,15]\n9", output: "[0,1]" },
            { input: "[3,2,4]\n6", output: "[1,2]" }
          ]
        })
      })
      const data = await res.json()
      setResults(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stage 2: Coding</h1>
          <p className="text-sm text-muted-foreground">Solve the algorithmic challenge to earn XP.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRun} disabled={isExecuting} className="gap-2">
            {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Code
          </Button>
          <Button variant="outline">Submit</Button>
        </div>
      </div>



      <GlassCard className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Problem Description Panel */}
          <ResizablePanel defaultSize={35} minSize={20} className="p-6 overflow-auto bg-muted/10">
            <h2 className="text-xl font-bold mb-4">1. Two Sum</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
              </p>
              <p>
                You may assume that each input would have exactly one solution, and you may not use the same element twice.
              </p>
              <p>You can return the answer in any order.</p>

              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-2">Example 1:</h3>
                <div className="bg-muted p-3 rounded-md font-mono text-xs text-foreground">
                  Input: nums = [2,7,11,15], target = 9<br />
                  Output: [0,1]<br />
                  Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-2 bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

          {/* Code Editor and Output Panel */}
          <ResizablePanel defaultSize={65}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70} className="relative">
                <div className="absolute inset-0 pt-2">
                  <Editor
                    height="100%"
                    language="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineHeight: 24,
                      padding: { top: 16 },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle className="h-2 bg-border hover:bg-primary/50 transition-colors cursor-row-resize" />

              <ResizablePanel defaultSize={30} className="bg-muted/10 overflow-auto">
                <div className="p-4 border-b bg-muted/20">
                  <h3 className="text-sm font-semibold flex items-center gap-2">Test Results</h3>
                </div>
                <div className="p-4 space-y-4">
                  {!results && !isExecuting && (
                    <div className="text-sm text-muted-foreground">Run your code to see results here.</div>
                  )}
                  {isExecuting && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Executing code...
                    </div>
                  )}
                  {results && results.results && (
                    <div className="space-y-4">
                      {results.results.map((r: any, i: number) => {
                        const passed = r.status?.id === 3
                        return (
                          <div key={i} className={`p-3 rounded-md border ${passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {passed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                              <span className={`text-sm font-medium ${passed ? 'text-green-500' : 'text-red-500'}`}>Test Case {i + 1}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs font-mono mt-2">
                              <div>
                                <span className="text-muted-foreground block mb-1">Expected:</span>
                                <div className="p-2 rounded bg-background border">{r.expected_output || '-'}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground block mb-1">Output:</span>
                                <div className="p-2 rounded bg-background border">{r.stdout || r.compile_output || '-'}</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </GlassCard>
    </div>
  )
}
