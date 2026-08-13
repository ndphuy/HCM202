"use client";

import React from "react";
import { Flag, ChevronRight } from "lucide-react";

interface TabHomeProps {
  onNext: () => void;
}

export default function TabHome({ onNext }: TabHomeProps) {
  return (
    <div className="text-center space-y-6 max-w-3xl mx-auto py-10 animate-fade-in">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/15 border border-crimson/30 text-crimson-bright text-xs font-semibold uppercase tracking-wider mb-2">
        <Flag className="h-3.5 w-3.5" />
        Bài Thuyết Trình Tương Tác · HCM202
      </div>
      <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
        TƯ TƯỞNG HỒ CHÍ MINH VỀ{" "}
        <br />
        <span className="bg-gradient-to-r from-crimson-bright via-gold-bright to-amber-400 bg-clip-text text-transparent">
          NHÀ NƯỚC CỦA NHÂN DÂN,
        </span>
        <br />
        <span className="bg-gradient-to-r from-amber-400 via-gold-bright to-crimson-bright bg-clip-text text-transparent">
          DO NHÂN DÂN, VÌ NHÂN DÂN
        </span>
      </h2>
      <p className="text-neutral-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
        Phân tích tư tưởng cốt lõi của Chủ tịch Hồ Chí Minh về bản chất nhà
        nước — từ bối cảnh lịch sử ra đời đến ý nghĩa vận dụng trong xây dựng
        Nhà nước pháp quyền Việt Nam hiện đại.
      </p>
      <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
        <div className="px-4 py-2 rounded-lg bg-crimson/10 border border-crimson/20 text-xs text-crimson-bright font-semibold">
          Môn: HCM202
        </div>
        <div className="px-4 py-2 rounded-lg bg-gold/10 border border-gold/20 text-xs text-gold-bright font-semibold">
          Chương IV — Tư tưởng HCM về Nhà nước
        </div>
      </div>
      <div className="pt-6">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-crimson to-crimson-light text-white text-sm font-semibold rounded-xl hover:from-crimson-light hover:to-crimson-bright transition-all duration-300 shadow-lg shadow-crimson/30 hover:scale-105 cursor-pointer"
        >
          <span>Khám phá Bối cảnh Lịch sử</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
