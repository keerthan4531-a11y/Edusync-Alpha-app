"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Send, Bot, Mic, MicOff, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

interface AIChatModuleProps {
  onBack: () => void;
  onSubFeatureOpen?: (open: boolean) => void;
}

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-msg",
    role: "model",
    content:
      "Hey! 👋 I'm your personal English Teacher. I'm here to help you improve your vocabulary, grammar, pronunciation, and conversation skills. Feel free to chat with me in English — we can talk about anything! What would you like to work on today?",
    timestamp: new Date(),
  },
];

const QUICK_STARTERS = [
  "Correct my English grammar",
  "Teach me new vocabulary",
  "Roleplay a job interview",
  "Practice casual daily conversation",
];

export function AIChatModule({ onBack }: AIChatModuleProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInputVal(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInputVal("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputVal.trim();
    if (!text || isThinking) return;

    setError(null);

    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/communication/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      let aiText = "That's great! Tell me more about that, or ask me anything you'd like to practice in English.";
      if (res.ok) {
        const data = await res.json();
        if (data.response) aiText = data.response;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "model",
          content: aiText,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "model",
          content: "I'm right here to practice English with you! What would you like to discuss today?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="w-full h-[calc(100dvh-90px)] md:h-[calc(100vh-100px)] flex flex-col rounded-2xl md:rounded-3xl bg-[#dde1e7] dark:bg-[#070913] text-foreground overflow-hidden relative border border-black/8 dark:border-white/10 shadow-sm">
      {/* Light/Dark blue ambient glow circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 dark:bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header — matches app design system */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-black/8 dark:border-white/8 bg-black/2 dark:bg-white/2">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="relative w-10 h-10 rounded-full bg-blue-500/15 border-2 border-blue-500/30 flex items-center justify-center shadow-sm overflow-hidden">
              <Image
                src="/images/communication/aiconvo.png"
                alt="AI English Teacher"
                fill
                sizes="40px"
                className="object-contain dark:mix-blend-screen"
                priority
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight truncate">
              AI English Teacher
            </p>
            <p className="text-[11px] text-green-600 dark:text-green-400 leading-tight flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              Active now
            </p>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
        {/* Date chip */}
        <div className="flex justify-center mb-3">
          <span className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full">
            Today
          </span>
        </div>

        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const isLastFromSender =
            index === messages.length - 1 || messages[index + 1]?.role !== msg.role;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* AI mini-avatar shown only at last bubble in group */}
              {!isUser && (
                <div className={`w-6 h-6 flex-shrink-0 ${isLastFromSender ? "opacity-100" : "opacity-0"}`}>
                  <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
                  </div>
                </div>
              )}

              <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[82%]`}>
                <div
                  className={`px-4 py-2.5 text-[13.5px] leading-relaxed font-medium ${
                    isUser
                      ? "bg-blue-600 text-white rounded-[20px] rounded-br-[5px] shadow-sm"
                      : "bg-white dark:bg-white/8 border border-black/10 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-[20px] rounded-bl-[5px] shadow-sm"
                  }`}
                >
                  <div className={`prose prose-sm max-w-none prose-p:my-0 prose-p:leading-relaxed ${
                    isUser ? "text-white prose-p:text-white !text-white" : "dark:prose-invert text-gray-900 dark:text-gray-100"
                  }`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeHighlight]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                {isLastFromSender && (
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 px-1 font-medium">
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
            <div className="w-6 h-6 flex-shrink-0 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
            </div>
            <div className="px-4 py-3 bg-white dark:bg-white/8 border border-black/10 dark:border-white/10 rounded-[20px] rounded-bl-[5px] flex gap-1.5 items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-indigo-300 text-[12px] font-semibold hover:bg-blue-500/20 hover:border-blue-500/40 transition-all shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="px-4 py-3 pb-4 border-t border-black/8 dark:border-white/8 bg-black/2 dark:bg-white/2">
        <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full px-2 py-1.5 shadow-sm">
          <button
            onClick={toggleRecording}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              isRecording
                ? "bg-red-500/15 text-red-500 dark:text-red-400 animate-pulse"
                : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-blue-500/10"
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
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            className="flex-1 bg-transparent text-[13.5px] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none disabled:opacity-50 py-1 px-1 font-medium"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim() || isThinking || isRecording}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
