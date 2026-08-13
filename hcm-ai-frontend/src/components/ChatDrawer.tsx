"use client";

import React from "react";
import { Sparkles, X, MessageSquare, RotateCcw, Send, BookOpen } from "lucide-react";

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

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
  userInput: string;
  onUserInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClearChat: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}
const formatDocName = (docName: string) => {
  const match = docName.match(/^page_?(\d+)(\.txt|\.pdf|\.docx)?$/i);
  if (match) {
    return `trang ${match[1]}`;
  }
  return docName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
};

export default function ChatDrawer({
  isOpen,
  onClose,
  messages,
  isLoading,
  userInput,
  onUserInputChange,
  onSubmit,
  onClearChat,
  chatEndRef,
}: ChatDrawerProps) {
  return (
    <>
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-neutral-950 border-l border-crimson/20 shadow-2xl z-30 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Chat Header */}
        <div className="h-20 border-b border-crimson/20 flex items-center justify-between px-5 bg-charcoal/80">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-gold-bright animate-pulse" />
            <div>
              <h3 className="font-bold text-sm text-white">Trợ Lý AI Thuyết Trình</h3>
              <p className="text-[10px] text-neutral-400">Hỏi đáp theo Giáo trình Kinh tế chính trị</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Message Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="h-12 w-12 bg-crimson/10 border border-crimson/30 rounded-full flex items-center justify-center text-crimson-bright shadow-inner">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Bạn cần giải thích về nội dung nào?</h4>
              <p className="text-xs text-neutral-400 max-w-[280px]">
                Hãy nhập câu hỏi bên dưới hoặc sử dụng các nút gợi ý hỏi nhanh trên tab Phân tích của Case Study Alpha Corp để bắt đầu hội thoại với AI.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div 
                  className={`p-3 rounded-2xl text-xs md:text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-crimson text-white rounded-br-none" 
                      : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none"
                  }`}
                >
                  <span className="whitespace-pre-wrap">{msg.content}</span>

                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-neutral-850 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Nguồn:</span>
                      {Array.from(new Set(msg.sources.map(src => src.document))).map((doc, docIdx) => (
                        <span
                          key={docIdx}
                          title={doc}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-950 border border-neutral-800/80 text-[10px] text-neutral-300 rounded-md font-medium capitalize"
                        >
                          <BookOpen className="h-2.5 w-2.5 text-crimson-bright shrink-0" />
                          {formatDocName(doc)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-neutral-500 mt-1 px-1">
                  {msg.role === "user" ? "Học sinh" : "Trợ lý AI"}
                </span>
              </div>
            ))
          )}          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 mr-auto max-w-[85%] bg-neutral-900 border border-neutral-800 rounded-2xl rounded-bl-none">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-crimson rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-2 w-2 bg-crimson rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-2 w-2 bg-crimson rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <span className="text-xs text-neutral-500">AI đang suy nghĩ...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Footer */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-950/80">
          <form 
            onSubmit={onSubmit}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => onUserInputChange(e.target.value)}
              placeholder="Nhập câu hỏi học tập của bạn..."
              className="flex-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 focus:border-crimson/55 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white placeholder-neutral-500 outline-none transition-all duration-300"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="h-10 w-10 bg-crimson hover:bg-crimson-light disabled:opacity-40 disabled:hover:bg-crimson text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          
          <div className="flex items-center justify-between mt-3 text-[10px]">
            <span className="text-neutral-500">Dữ liệu tham khảo: Giáo trình chuẩn</span>
            {messages.length > 0 && (
              <button 
                onClick={onClearChat}
                className="text-neutral-400 hover:text-crimson-bright flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Xóa hội thoại</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop overlay when chat is open on mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-20 sm:hidden"
        />
      )}
    </>
  );
}
