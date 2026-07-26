"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, X, Mic, MicOff, Send, Trash2, Minimize2, Sparkles, Monitor, BookOpen, BarChart3, Lightbulb, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Declare window speech recognition interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: Date
}

const QUICK_COMMANDS = [
  { label: "Classrooms", icon: Monitor, command: "Show my classrooms" },
  { label: "Submissions", icon: BookOpen, command: "Check pending submissions" },
  { label: "Analytics", icon: BarChart3, command: "Show student performance" },
  { label: "Daily Tip", icon: Lightbulb, command: "Give me a teaching tip" },
] as const

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "ai",
  content: "👋 Hello Professor! I'm your AI Assistant. I can help you with:\n\n• Manage classrooms\n• Grade assignments\n• Track attendance\n• Analyze student performance\n• Create learning materials\n\nClick the microphone to start speaking, or type your question below!",
  timestamp: new Date(),
}

export function FacultyAiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [assistantState, setAssistantState] = useState<"idle" | "listening" | "thinking">("idle")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, isMinimized])

  const sendCommand = useCallback(async (command: string) => {
    if (!command.trim() || isLoading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: command.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue("")
    setIsLoading(true)
    setAssistantState("thinking")

    try {
      const res = await fetch("/api/faculty/ai-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: command.trim() }),
      })

      const data = await res.json()

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: res.ok
          ? data.response
          : "Sorry, I couldn't process that request. Please try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "ai",
        content: "⚠️ Connection error. Please check your network and try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      setAssistantState("idle")
    }
  }, [isLoading])

  const handleSend = () => {
    sendCommand(inputValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Speech recognition
  const toggleListening = useCallback(() => {
    const SpeechRecognition = typeof window !== "undefined"
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null

    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "ai",
        content: "⚠️ Speech recognition is not supported in your browser. Try Chrome or Edge.",
        timestamp: new Date(),
      }])
      return
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      setAssistantState("idle")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputValue(transcript)
      setIsListening(false)
      setAssistantState("idle")
      sendCommand(transcript)
    }

    recognition.onerror = () => {
      setIsListening(false)
      setAssistantState("idle")
    }

    recognition.onend = () => {
      setIsListening(false)
      setAssistantState("idle")
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setAssistantState("listening")
  }, [isListening, sendCommand])

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE])
  }

  const togglePanel = () => {
    if (isMinimized) {
      setIsMinimized(false)
    } else {
      setIsOpen(!isOpen)
    }
  }

  // Render simple markdown (bold, bullets)
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>
        }
        return <span key={j}>{part}</span>
      })

      if (line.startsWith("- ") || line.startsWith("• ")) {
        return <div key={i} className="flex gap-2 pl-2"><span className="text-emerald-400 shrink-0">•</span><span>{parts}</span></div>
      }
      if (line.startsWith("---")) {
        return <hr key={i} className="border-white/10 my-2" />
      }
      if (line.trim() === "") {
        return <div key={i} className="h-2" />
      }
      return <div key={i}>{parts}</div>
    })
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="faculty-ai-toggle"
        onClick={togglePanel}
        className={cn(
          "fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[999] flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-full font-semibold text-xs md:text-sm text-white transition-all duration-300 shadow-xl backdrop-blur-md",
          isOpen
            ? "bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-red-500/40"
            : "bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-600 hover:shadow-emerald-500/40 animate-pulse-glow"
        )}
      >
        {isOpen ? <X className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
        <span>{isOpen ? "Close" : "AI Assistant"}</span>
      </button>

      {/* AI Panel */}
      {isOpen && (
        <div
          id="faculty-ai-panel"
          className={cn(
            "fixed bottom-32 md:bottom-20 right-3 md:right-6 left-3 md:left-auto z-[998] flex flex-col rounded-3xl neu-flat bg-background/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 border border-black/10 dark:border-white/15 text-foreground",
            isMinimized
              ? "w-72 h-14 overflow-hidden"
              : "w-[calc(100vw-1.5rem)] md:w-[400px] h-[75vh] md:h-auto max-h-[580px]"
          )}
          style={{ animation: "slideUpFadeIn 0.3s ease forwards" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-black/5 dark:border-white/10 shrink-0 neu-raised-xs rounded-t-3xl">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                  assistantState === "idle" && "bg-blue-500",
                  assistantState === "listening" && "bg-amber-500 animate-pulse",
                  assistantState === "thinking" && "bg-purple-500 animate-pulse",
                )} />
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-extrabold text-foreground">Faculty AI Assistant</h3>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Powered by Gemini AI</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 neu-button rounded-xl text-muted-foreground hover:text-amber-600 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 neu-button rounded-xl text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 neu-button rounded-xl text-muted-foreground hover:text-rose-600 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-3 min-h-0">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                    style={{ animation: "slideUpFadeIn 0.25s ease forwards" }}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] md:max-w-[85%] px-3.5 md:px-4 py-2.5 md:py-3 text-xs md:text-[13px] leading-relaxed",
                        msg.role === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-br-sm shadow-md font-medium"
                          : "neu-raised-sm text-foreground rounded-2xl rounded-bl-sm border border-black/5 dark:border-white/10 dark:bg-white/5 font-medium"
                      )}
                    >
                      {renderContent(msg.content)}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start" style={{ animation: "slideUpFadeIn 0.25s ease forwards" }}>
                    <div className="neu-raised-xs text-muted-foreground rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs font-bold text-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Commands Grid */}
              <div className="grid grid-cols-2 gap-1.5 px-3 md:px-4 py-2.5 border-t border-black/5 dark:border-white/5 shrink-0">
                {QUICK_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.label}
                    onClick={() => sendCommand(cmd.command)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 p-2 rounded-xl neu-button text-foreground hover:text-primary transition-all text-xs font-bold disabled:opacity-40"
                  >
                    <cmd.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{cmd.label}</span>
                  </button>
                ))}
              </div>

              {/* Input Control Bar */}
              <div className="flex items-center gap-2 px-3 md:px-4 py-3 border-t border-black/5 dark:border-white/5 shrink-0">
                <button
                  onClick={toggleListening}
                  className={cn(
                    "shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all neu-button",
                    isListening
                      ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/40 animate-pulse"
                      : "text-primary"
                  )}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening..." : "Ask me anything..."}
                  disabled={isLoading || isListening}
                  className="flex-1 h-10 neu-inset-sm bg-transparent border-0 rounded-xl px-3 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-40 transition-colors dark:bg-white/5"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl neu-button bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 transition-all disabled:opacity-40"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Footer Status */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-black/5 dark:border-white/5 shrink-0 neu-raised-xs rounded-b-3xl">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    assistantState === "idle" && "bg-emerald-500",
                    assistantState === "listening" && "bg-amber-500 animate-pulse",
                    assistantState === "thinking" && "bg-purple-500 animate-pulse",
                  )} />
                  <span className="text-[10px] font-extrabold text-muted-foreground">
                    {assistantState === "idle" && "Ready to assist"}
                    {assistantState === "listening" && "Listening..."}
                    {assistantState === "thinking" && "Processing..."}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">EduSync Faculty AI</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        @keyframes slideUpFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
    </>
  )
}
