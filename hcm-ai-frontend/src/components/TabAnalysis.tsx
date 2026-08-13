"use client";

import React from "react";
import { Globe, Sparkles, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";

interface TabAnalysisProps {
  onQuickPrompt: (text: string) => void;
}

export default function TabAnalysis({ onQuickPrompt }: TabAnalysisProps) {
  const practiceItems = [
    {
      label: "Quốc hội & Bầu cử",
      desc: "Cử tri trực tiếp bầu ra Quốc hội — cơ quan quyền lực nhà nước cao nhất. Đây là biểu hiện cụ thể của thành tố \"Do nhân dân\".",
      status: "success",
    },
    {
      label: "Hội đồng nhân dân các cấp",
      desc: "Người dân bầu HĐND để đại diện tại địa phương, giám sát UBND. Thể hiện quyền tham gia quản lý nhà nước của nhân dân.",
      status: "success",
    },
    {
      label: "Chính sách phúc lợi xã hội",
      desc: "BHYT, BHXH, trợ cấp người nghèo, miễn học phí — biểu hiện của thành tố \"Vì nhân dân\" trong thực tiễn.",
      status: "success",
    },
    {
      label: "Phòng chống tham nhũng",
      desc: "Chiến dịch \"đốt lò\" của BCH TW là vận dụng tư tưởng HCM: cán bộ phải là công bộc, nhà nước không thể bị tha hóa xa rời nhân dân.",
      status: "warning",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 text-crimson-bright border-b border-neutral-900 pb-4">
        <Globe className="h-6 w-6" />
        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider">
          Thực Tiễn Việt Nam Hiện Nay
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-8 pt-2">
        <div className="space-y-3">
          <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
            Tư tưởng HCM về nhà nước được{" "}
            <strong className="text-white">
              vận dụng xuyên suốt trong thực tiễn
            </strong>{" "}
            xây dựng Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam.
          </p>
          <div className="space-y-2.5">
            {practiceItems.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-neutral-900/40 p-4 rounded-xl border border-neutral-800"
              >
                {item.status === "success" ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-white text-xs font-semibold mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800 space-y-4">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-gold-bright animate-bounce" />
            Thử hỏi Trợ lý AI phân tích sâu hơn:
          </h4>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() =>
                onQuickPrompt(
                  "Ba thành tố của nhân dân, do nhân dân, vì nhân dân khác nhau và liên hệ với nhau như thế nào?"
                )
              }
              className="text-left w-full px-4 py-3 rounded-xl bg-neutral-950/60 hover:bg-crimson/10 border border-neutral-850 hover:border-crimson/30 text-xs md:text-sm text-neutral-300 hover:text-white transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              <span>1. Ba thành tố khác và liên hệ nhau thế nào?</span>
              <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-crimson-bright transition-colors" />
            </button>
            <button
              onClick={() =>
                onQuickPrompt(
                  "Tại sao HCM nói cán bộ nhà nước là công bộc của nhân dân? Điều này có ý nghĩa gì trong xây dựng nhà nước hiện nay?"
                )
              }
              className="text-left w-full px-4 py-3 rounded-xl bg-neutral-950/60 hover:bg-crimson/10 border border-neutral-850 hover:border-crimson/30 text-xs md:text-sm text-neutral-300 hover:text-white transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              <span>2. Cán bộ là công bộc — ý nghĩa là gì?</span>
              <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-crimson-bright transition-colors" />
            </button>
            <button
              onClick={() =>
                onQuickPrompt(
                  "Hãy phân tích sự khác biệt giữa nhà nước của nhân dân theo tư tưởng HCM với các mô hình nhà nước khác trên thế giới."
                )
              }
              className="text-left w-full px-4 py-3 rounded-xl bg-neutral-950/60 hover:bg-crimson/10 border border-neutral-850 hover:border-crimson/30 text-xs md:text-sm text-neutral-300 hover:text-white transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              <span>3. So sánh với mô hình nhà nước khác?</span>
              <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-crimson-bright transition-colors" />
            </button>
            <button
              onClick={() =>
                onQuickPrompt(
                  "Liên hệ tư tưởng HCM về nhà nước vì nhân dân với thực tiễn phòng chống tham nhũng ở Việt Nam hiện nay."
                )
              }
              className="text-left w-full px-4 py-3 rounded-xl bg-neutral-950/60 hover:bg-crimson/10 border border-neutral-850 hover:border-crimson/30 text-xs md:text-sm text-neutral-300 hover:text-white transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              <span>4. Liên hệ phòng chống tham nhũng hiện nay?</span>
              <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-crimson-bright transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
