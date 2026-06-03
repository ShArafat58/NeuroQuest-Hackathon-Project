"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isBangla, setIsBangla] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "হ্যালো! আমি NeuroQuest সহায়ক। পড়াশোনা বা সাইট নিয়ে যেকোনো প্রশ্ন করো।",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Fetch current user details on mount to check language preference
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          const bangla = data.user.version === "bangla";
          setIsBangla(bangla);
          setMessages([
            {
              role: "assistant",
              content: bangla
                ? "হ্যালো! আমি NeuroQuest সহায়ক। পড়াশোনা বা সাইট নিয়ে যেকোনো প্রশ্ন করো।"
                : "Hello! I am your NeuroQuest Assistant. Ask me anything about your studies or this site.",
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  // Show first-time tooltip after mount
  useEffect(() => {
    const isShown = sessionStorage.getItem("chat_tooltip_shown");
    if (!isShown && !isOpen && !hasOpenedOnce) {
      const showTimer = setTimeout(() => {
        setShowTooltip(true);
        sessionStorage.setItem("chat_tooltip_shown", "true");
      }, 1000);

      // Auto-hide after 5 seconds
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 6000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isOpen, hasOpenedOnce]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasOpenedOnce(true);
      setShowTooltip(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, language: isBangla ? "bn" : "en" }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isBangla
            ? "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। একটু পরে চেষ্টা করুন।"
            : "Sorry, I cannot answer right now. Please try again later.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const showPulse = !hasOpenedOnce && !isOpen && !reducedMotion;

  return (
    <>
      {/* Pulse animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes chat-pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.35;
          }
          70% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes chat-tooltip-enter {
          0% {
            opacity: 0;
            transform: translateX(8px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}} />

      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
        {isOpen && (
          <div className="mb-4 w-[calc(100vw-48px)] sm:w-[340px] max-h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] p-4 flex items-center justify-between text-white">
              <div>
                <h3 className="font-bold text-sm">
                  {isBangla ? "NeuroQuest সহায়ক" : "NeuroQuest Assistant"}
                </h3>
                <p className="text-xs opacity-90">
                  {isBangla ? "যেকোনো সাহায্যে আছি" : "Here to help you"}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[350px] space-y-4 bg-gray-50/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white rounded-br-sm shadow-sm"
                        : "bg-[#EEF0FF] text-[#3C3489] rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#EEF0FF] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                    <div className="w-2 h-2 bg-[#6D5EF5]/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#6D5EF5]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#6D5EF5]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isBangla ? "প্রশ্ন লিখো..." : "Type your question..."}
                disabled={isTyping}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#6D5EF5] transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white flex items-center justify-center shrink-0 hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Button Area */}
        <div className="relative flex items-center">
          {/* First-time tooltip */}
          {showTooltip && !isOpen && (
            <div
              className="absolute right-[76px] whitespace-nowrap bg-white text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 z-10"
              style={{
                animation: reducedMotion ? "none" : "chat-tooltip-enter 0.3s ease-out forwards",
              }}
            >
              <span>{isBangla ? "সাহায্য লাগবে? 👋" : "Need help? 👋"}</span>
              {/* Tooltip arrow */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-[-45deg]" />
            </div>
          )}

          {/* Pulse ring */}
          {showPulse && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "rgba(109, 94, 245, 0.3)",
                animation: "chat-pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          )}

          {/* Main button */}
          <button
            onClick={handleOpen}
            className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1 transition-all duration-200"
          >
            <MessageCircle className="w-8 h-8" />
          </button>
        </div>
      </div>
    </>
  );
}
