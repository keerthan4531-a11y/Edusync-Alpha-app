"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, Trash2, Minus, X, Mic, Send, Volume2, VolumeX, Radio, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export function AIAssistantVoice() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hello Professor! I'm your AI Assistant. I can help you manage classrooms, check student submissions, review analytics, or coordinate weekly schedules. Try speaking to me or click the mic!",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [status, setStatus] = useState<"idle" | "listening" | "thinking">("idle")
  const [statusText, setStatusText] = useState("Ready to listen")
  const [isWalkieActive, setIsWalkieActive] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isRecordingRef = useRef(false)

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Setup voice toggle listeners
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      setIsMinimized(false)
    }
    window.addEventListener("openAIAssistant", handleOpen)
    return () => window.removeEventListener("openAIAssistant", handleOpen)
  }, [])

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = false
        rec.lang = "en-US"

        rec.onstart = () => {
          setStatus("listening")
          setStatusText("Listening...")
          isRecordingRef.current = true
        }

        rec.onend = () => {
          isRecordingRef.current = false
          // If walkie talkie is active, it will handle submission on release
          if (!isWalkieActive) {
            setStatus("idle")
            setStatusText("Ready to listen")
          }
        }

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript
          if (resultText && resultText.trim()) {
            handleSendMessage(resultText)
          }
        }

        rec.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e)
          setStatus("idle")
          setStatusText("Click mic to retry")
        }

        recognitionRef.current = rec
      }

      synthRef.current = window.speechSynthesis
    }
  }, [isWalkieActive])

  // Walkie Talkie Spacebar Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isMinimized) return
      // Trigger only if space is pressed and we are not focusing an input/textarea
      const activeEl = document.activeElement
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")

      if (e.code === "Space" && !isInputFocused) {
        e.preventDefault() // prevent page scroll
        if (!isRecordingRef.current) {
          setIsWalkieActive(true)
          speakAI("") // cancel current speaking
          recognitionRef.current?.start()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && isWalkieActive) {
        setIsWalkieActive(false)
        if (isRecordingRef.current) {
          recognitionRef.current?.stop()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isOpen, isMinimized, isWalkieActive])

  const toggleMic = () => {
    if (status === "listening") {
      recognitionRef.current?.stop()
    } else {
      speakAI("") // stop active synthesis
      recognitionRef.current?.start()
    }
  }

  // Speak response
  const speakAI = (text: string) => {
    if (isMuted || !synthRef.current) return

    // Cancel current speaking
    synthRef.current.cancel()

    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    // Select a premium sounding voice if available
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(
      (v) =>
        v.name.includes("Google US English") ||
        v.name.includes("Natural") ||
        v.lang === "en-US"
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    utterance.rate = 1.05
    utterance.pitch = 1.0

    activeUtteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = textToSend || inputValue
    if (!queryText || !queryText.trim()) return

    if (!textToSend) {
      setInputValue("")
    }

    const newMessages = [...messages, { role: "user" as const, content: queryText }]
    setMessages(newMessages)
    setStatus("thinking")
    setStatusText("AI is processing...")

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          history: newMessages.slice(-6),
          mode: "general",
          stage: "faculty-help",
        }),
      })

      if (!res.ok) throw new Error("Failed to generate response")

      const data = await res.json()
      const aiReply = data.response || "I couldn't process that command."

      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }])
      speakAI(aiReply)
    } catch (e) {
      console.error(e)
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "⚠️ Connection error. Please try again." },
      ])
    } finally {
      setStatus("idle")
      setStatusText("Ready to listen")
    }
  }

  const sendQuickCommand = (cmdText: string) => {
    handleSendMessage(cmdText)
  }

  const clearChat = () => {
    speakAI("")
    setMessages([
      {
        role: "assistant",
        content: "Cleared! What can I help you with now, Professor?",
      },
    ])
  }

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed bottom-24 right-4 md:bottom-6 md:right-6 w-96 rounded-2xl z-50 flex flex-col transition-all duration-300 relative",
        "glass-panel border border-[var(--glass-border)] shadow-2xl overflow-hidden",
        isMinimized ? "h-16" : "h-[500px]"
      )}
    >
      <div className="glass-noise animate-pulse opacity-10" />
      <div className="glass-specular" />

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--glass-border-subtle)] bg-white/5 relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
          <span className="font-semibold text-sm text-foreground tracking-wide">Faculty AI Assistant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title={isMuted ? "Unmute AI Response" : "Mute AI Response"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              speakAI("")
              setIsOpen(false)
            }}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body contents if not minimized */}
      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative z-10 no-scrollbar bg-slate-950/20">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex max-w-[85%] rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed",
                  msg.role === "user"
                    ? "self-end bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-br-none shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
                    : msg.role === "system"
                    ? "self-center bg-rose-500/10 border border-rose-500/20 text-rose-300"
                    : "self-start bg-white/5 border border-white/5 text-foreground rounded-bl-none"
                )}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            ))}
            {status === "thinking" && (
              <div className="self-start bg-white/5 border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Commands */}
          <div className="grid grid-cols-2 gap-2 p-3 border-t border-[var(--glass-border-subtle)] bg-white/5 relative z-10 shrink-0">
            {[
              { label: "My Classrooms", cmd: "Show my classrooms" },
              { label: "Pending Submissions", cmd: "Check pending submissions" },
              { label: "Weekly Schedule", cmd: "What is my schedule?" },
              { label: "Onboarding Workflow", cmd: "Show WhatsApp community onboarding workflow" },
            ].map((q) => (
              <button
                key={q.label}
                onClick={() => sendQuickCommand(q.cmd)}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 text-[10px] md:text-xs text-foreground font-medium rounded-xl border border-white/5 transition-all text-center leading-snug cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="truncate">{q.label}</span>
              </button>
            ))}
          </div>

          {/* Status Display */}
          <div className="flex flex-col items-center gap-1 px-4 py-2 border-t border-[var(--glass-border-subtle)] relative z-10 shrink-0 bg-slate-950/30">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  status === "listening"
                    ? "bg-amber-400 animate-ping"
                    : status === "thinking"
                    ? "bg-violet-400 animate-pulse"
                    : "bg-emerald-400"
                )}
              />
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium tracking-wide">
                {statusText}
              </span>
            </div>

            {/* Audio Wave Indicator */}
            {status === "listening" && (
              <div className="flex gap-0.5 items-end h-3 mt-1 select-none">
                <div className="w-0.5 bg-amber-400 rounded-sm animate-[wave_0.5s_ease-in-out_infinite_alternate] h-3"></div>
                <div className="w-0.5 bg-amber-400 rounded-sm animate-[wave_0.5s_ease-in-out_infinite_alternate_0.1s] h-1"></div>
                <div className="w-0.5 bg-amber-400 rounded-sm animate-[wave_0.5s_ease-in-out_infinite_alternate_0.2s] h-2.5"></div>
                <div className="w-0.5 bg-amber-400 rounded-sm animate-[wave_0.5s_ease-in-out_infinite_alternate_0.15s] h-2"></div>
                <div className="w-0.5 bg-amber-400 rounded-sm animate-[wave_0.5s_ease-in-out_infinite_alternate_0.05s] h-3.5"></div>
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="p-3 border-t border-[var(--glass-border-subtle)] relative z-10 flex gap-2 items-center bg-white/5 shrink-0">
            <input
              type="text"
              placeholder="Ask AI or speak..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage()
              }}
              className="flex-1 bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400 placeholder:text-muted-foreground"
            />
            <button
              onClick={toggleMic}
              className={cn(
                "p-2.5 rounded-xl text-white transition-all cursor-pointer shrink-0 shadow-lg",
                status === "listening"
                  ? "bg-gradient-to-r from-rose-600 to-amber-500 hover:scale-105 active:scale-95 animate-pulse"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 active:scale-95"
              )}
              title="Speak / Hold Spacebar"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Walkie Talkie Indicator Overlay */}
          {isWalkieActive && (
            <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center text-center p-6 gap-3 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 animate-bounce">
                <Radio className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">Walkie-Talkie Active</h3>
              <p className="text-xs text-muted-foreground max-w-[80%] leading-relaxed">
                Listening to your voice... Release the <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">SPACEBAR</span> to send!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
