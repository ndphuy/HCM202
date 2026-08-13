"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Sparkles,
  History,
  Globe,
  Award,
  Layers,
  Home,
  Lightbulb,
  Flag,
} from "lucide-react";

// --- Components ---
import TabHome from "@/components/TabHome";
import TabCaseStudy from "@/components/TabCaseStudy";
import TabTheory from "@/components/TabTheory";
import TabAnalysis from "@/components/TabAnalysis";
import TabLesson from "@/components/TabLesson";
import TabQuiz from "@/components/TabQuiz";
import ChatDrawer from "@/components/ChatDrawer";
import UploadModal from "@/components/UploadModal";

export interface SourceChunk {
  document: string;
  chunk_id: string;
  snippet: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanations: string[];
}

export default function PresentationApp() {
  // --- States ---
  const [activeTab, setActiveTab] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Health State
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showQuizResult, setShowQuizResult] = useState<Record<string, boolean>>({});
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizDocUsed, setQuizDocUsed] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check health and keep checking every 10 seconds
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/health`
        );
        setIsBackendHealthy(response.ok);
      } catch {
        setIsBackendHealthy(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Key navigation for tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        setActiveTab((prev) => (prev < 5 ? prev + 1 : prev));
      } else if (e.key === "ArrowLeft") {
        setActiveTab((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleQuickPrompt = (promptText: string) => {
    setIsChatOpen(true);
    sendChatMessage(promptText);
  };

  const sendChatMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMessages = [
      ...chatMessages,
      { role: "user" as const, content: textToSend },
    ];
    setChatMessages(newMessages);
    setUserInput("");
    setIsChatLoading(true);

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          session_id: sessionId,
          response_format: "text",
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      if (data.session_id) setSessionId(data.session_id);

      setChatMessages([
        ...newMessages,
        {
          role: "assistant" as const,
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (err: unknown) {
      console.error(err);
      setChatMessages([
        ...newMessages,
        {
          role: "assistant" as const,
          content: `❌ Lỗi kết nối: Tôi không thể liên lạc với máy chủ AI Backend. Hãy kiểm tra lại backend có đang chạy tại ${baseUrl} không.`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateAIQuestions = async (
    num: number,
    level: "easy" | "medium" | "hard"
  ) => {
    setIsGeneratingQuiz(true);
    setSelectedAnswers({});
    setShowQuizResult({});
    setQuizDocUsed(null);

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(
        `${baseUrl}/api/questions/generate?num_questions=${num}&level=${level}`
      );
      if (!response.ok) throw new Error("Không thể sinh câu hỏi từ Backend.");

      const data = await response.json();
      const formatted: QuizQuestion[] = data.questions.map((q: {
        id: string; question: string; options: string[];
        correct_index: number; explanations: string[];
      }) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correct_index,
        explanations: q.explanations,
      }));
      setQuizQuestions(formatted);
      setQuizDocUsed(data.document_used || "Tài liệu hệ thống");
    } catch (err) {
      console.error(err);
      alert(
        "❌ Lỗi: Không thể tải câu hỏi từ Backend AI. Hãy chắc chắn rằng bạn đã upload tài liệu giáo trình HCM202 vào backend trước."
      );
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuizAnswer = (qId: string, optionIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [qId]: optionIdx });
    setShowQuizResult({ ...showQuizResult, [qId]: true });
  };

  const resetQuiz = (qId: string) => {
    const nextAnswers = { ...selectedAnswers };
    delete nextAnswers[qId];
    setSelectedAnswers(nextAnswers);

    const nextShowResult = { ...showQuizResult };
    delete nextShowResult[qId];
    setShowQuizResult(nextShowResult);
  };

  // --- Tabs Metadata ---
  const tabs = [
    { label: "Trang chủ", icon: Home },
    { label: "Bối cảnh lịch sử", icon: History },
    { label: "Lý thuyết", icon: BookOpen },
    { label: "Thực tiễn", icon: Globe },
    { label: "Bài học", icon: Lightbulb },
    { label: "Luyện tập (Quiz)", icon: Award },
  ];

  return (
    <div className="flex-1 flex flex-col bg-charcoal-dark text-foreground min-h-screen relative font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(153,27,27,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(180,83,9,0.08),transparent_50%)] pointer-events-none" />

      {/* TOP HEADER WITH INTEGRATED TABS */}
      <header className="sticky top-0 border-b border-crimson/20 bg-neutral-950/80 backdrop-blur-md z-10">
        <div className="max-w-[1440px] mx-auto h-20 flex items-center justify-between px-6 gap-4">
          {/* Logo & Info */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 bg-gradient-to-br from-crimson to-gold rounded-lg flex items-center justify-center shadow-lg shadow-crimson/20">
              <Flag className="h-5 w-5 text-white" />
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-wide uppercase bg-gradient-to-r from-white via-neutral-200 to-crimson-bright bg-clip-text text-transparent">
                  Tư tưởng Hồ Chí Minh
                </h1>
                {/* Health Indicator Dot */}
                <div
                  className={`h-2.5 w-2.5 rounded-full ${isBackendHealthy === null
                    ? "bg-neutral-600 animate-pulse"
                    : isBackendHealthy
                      ? "bg-emerald-500 shadow-md shadow-emerald-500/50"
                      : "bg-red-500 shadow-md shadow-red-500/50"
                    }`}
                  title={
                    isBackendHealthy === null
                      ? "Đang kiểm tra kết nối Backend..."
                      : isBackendHealthy
                        ? "Backend hoạt động tốt"
                        : "Mất kết nối Backend!"
                  }
                />
              </div>
              <p className="text-[10px] text-neutral-400">
                HCM202 · Chương IV: Nhà nước của Dân, do Dân, vì Dân
              </p>
            </div>
          </div>

          {/* Horizontal Tabs Navigation */}
          <div className="flex-1 flex justify-center overflow-x-auto scrollbar-none px-4">
            <div className="flex space-x-1 py-1">
              {tabs.map((tab, idx) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer shrink-0 ${isActive
                      ? "bg-crimson text-white shadow-md shadow-crimson/20"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                      }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Controls */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-crimson/10 hover:bg-crimson/20 border border-crimson/30 hover:border-crimson/50 text-crimson-bright text-xs font-semibold tracking-wide transition-all duration-300 shadow-md shadow-crimson/5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="hidden xs:inline">Trợ Lý AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* FULL-PAGE DIRECT CONTENT */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 md:py-12 flex flex-col justify-center animate-fade-in">
        <div className="w-full">
          {activeTab === 0 && <TabHome onNext={() => setActiveTab(1)} />}
          {activeTab === 1 && <TabCaseStudy />}
          {activeTab === 2 && <TabTheory />}
          {activeTab === 3 && <TabAnalysis onQuickPrompt={handleQuickPrompt} />}
          {activeTab === 4 && <TabLesson />}
          {activeTab === 5 && (
            <TabQuiz
              quizQuestions={quizQuestions}
              selectedAnswers={selectedAnswers}
              showQuizResult={showQuizResult}
              onAnswer={handleQuizAnswer}
              onReset={resetQuiz}
              onGenerateAIQuestions={handleGenerateAIQuestions}
              isGenerating={isGeneratingQuiz}
              documentUsed={quizDocUsed}
            />
          )}
        </div>
      </main>

      {/* CHAT AI SLIDE-OUT PANEL (DRAWER) */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        isLoading={isChatLoading}
        userInput={userInput}
        onUserInputChange={setUserInput}
        onSubmit={(e) => {
          e.preventDefault();
          sendChatMessage(userInput);
        }}
        onClearChat={() => {
          setChatMessages([]);
          setSessionId(null);
        }}
        chatEndRef={chatEndRef}
      />

      {/* DOCUMENT UPLOAD POPUP MODAL */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
