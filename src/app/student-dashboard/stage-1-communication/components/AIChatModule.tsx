"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Loader2,
  AlertCircle,
  ChevronLeft,
  Phone,
  Info
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

import Image from "next/image";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

interface AIChatModuleProps {
  onSubFeatureOpen?: (isOpen: boolean) => void;
  onBack?: () => void;
}

const WELCOME_MESSAGE = "Hey! 👋 I'm your personal English Teacher. I'm here to help you improve your vocabulary, grammar, pronunciation, and conversation skills. Feel free to chat with me in English — we can talk about anything! What would you like to work on today?";

const QUICK_STARTERS = [
  "Correct my English grammar",
  "Teach me new vocabulary",
  "Let's have a conversation",
  "Help me with pronunciation",
];

export function AIChatModule({ onSubFeatureOpen, onBack }: AIChatModuleProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: WELCOME_MESSAGE,
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onSubFeatureOpen) onSubFeatureOpen(true);
    document.body.classList.add("ai-chat-open");
    const appMain = document.getElementById("app-main");
    if (appMain) {
      appMain.style.overflow = "hidden";
    }

    return () => {
      if (onSubFeatureOpen) onSubFeatureOpen(false);
      document.body.classList.remove("ai-chat-open");
      if (appMain) {
        appMain.style.overflow = "";
      }
    };
  }, [onSubFeatureOpen]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isThinking]);

  const startSpeechRecognition = () => {
    setError(null);
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) setInputVal((prev) => (prev + " " + text).trim());
      };
      recognition.onerror = () => { setIsRecording(false); };
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setError("Failed to start voice recognition.");
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopSpeechRecognition();
    else startSpeechRecognition();
  };

  const handleSendMessage = async (text?: string) => {
    const trimmedInput = (text ?? inputVal).trim();
    if (!trimmedInput || isThinking) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsThinking(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedInput,
          mode: "teacher",
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response.");

      setMessages((prev) => [...prev, {
        id: Math.random().toString(),
        role: "model",
        content: data.response || "No response received.",
        timestamp: new Date()
      }]);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="w-full h-[calc(100dvh-100px)] md:h-[calc(100vh-120px)] flex flex-col -mt-4 md:-mt-6 rounded-3xl border border-black/10 dark:border-white/10 bg-[#080A10] dark:bg-[#070913] text-foreground overflow-hidden relative shadow-2xl">
      {/* Dark blue ambient glow circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      {/* Header — matches app glassmorphism */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-black/8 dark:border-white/8">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="relative w-10 h-10 rounded-full bg-indigo-500/15 border-2 border-indigo-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.25)] overflow-hidden">
              <Image 
                src="/images/communication/aiconvo.png" 
                alt="AI English Teacher"
                fill
                className="object-contain mix-blend-screen"
                priority
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-foreground leading-tight truncate">AI English Teacher</p>
            <p className="text-[11px] text-green-500 dark:text-green-400 leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              Active now
            </p>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2 no-scrollbar">
        {/* Date chip */}
        <div className="flex justify-center mb-3">
          <span className="text-[10px] text-zinc-400 dark:text-gray-600 px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full">
            Today
          </span>
        </div>

        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const isLastFromSender =
            index === messages.length - 1 ||
            messages[index + 1]?.role !== msg.role;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* AI mini-avatar shown only at last bubble in group */}
              {!isUser && (
                <div className={`w-6 h-6 flex-shrink-0 ${isLastFromSender ? "opacity-100" : "opacity-0"}`}>
                  <div className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-indigo-400" />
                  </div>
                </div>
              )}

              <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
                <div
                  className={`px-4 py-2.5 text-[13.5px] leading-relaxed ${
                    isUser
                      ? "bg-[#6366f1] text-white rounded-[20px] rounded-br-[5px] shadow-[0_2px_14px_rgba(99,102,241,0.3)]"
                      : "bg-black/6 dark:bg-white/7 border border-black/8 dark:border-white/10 text-zinc-700 dark:text-gray-200 rounded-[20px] rounded-bl-[5px]"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-p:leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeHighlight]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                {isLastFromSender && (
                  <span className="text-[10px] text-zinc-400 dark:text-gray-600 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isThinking && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 flex-shrink-0 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Bot className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="px-4 py-3 bg-black/6 dark:bg-white/7 border border-black/8 dark:border-white/10 rounded-[20px] rounded-bl-[5px] flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ── Quick starters ── */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {QUICK_STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => handleSendMessage(s)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-600 dark:text-indigo-300 text-[12px] font-medium hover:bg-indigo-500/15 hover:border-indigo-500/40 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="px-4 py-3 pb-4 border-t border-black/8 dark:border-white/8 bg-[#080A10] dark:bg-[#070913]">
        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full px-2 py-1.5">
          <button
            onClick={toggleRecording}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              isRecording
                ? "bg-red-500/15 text-red-500 dark:text-red-400 animate-pulse"
                : "text-zinc-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/10"
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder={isRecording ? "Listening..." : "Message..."}
            value={inputVal}
            disabled={isRecording}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
            className="flex-1 bg-transparent text-[13.5px] text-foreground placeholder:text-zinc-400 dark:placeholder:text-gray-500 focus:outline-none disabled:opacity-50 py-1 px-1"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim() || isThinking || isRecording}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_2px_10px_rgba(99,102,241,0.3)]"
          >
            {isThinking ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
