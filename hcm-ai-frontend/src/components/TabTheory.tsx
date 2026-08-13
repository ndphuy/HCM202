"use client";

import React, { useState } from "react";
import { BookOpen, Users, Building2, Heart } from "lucide-react";

const pillars = [
  {
    icon: Users,
    key: "cuaNhanDan",
    label: "Của nhân dân",
    color: "crimson",
    summary: "Quyền lực nhà nước thuộc về nhân dân",
    points: [
      "Nhân dân là chủ thể tối cao của quyền lực nhà nước — không phải vua, không phải một giai cấp riêng biệt.",
      "Hiến pháp 1946 khẳng định: \"Tất cả quyền bính trong nước là của toàn thể nhân dân Việt Nam\".",
      "Nhà nước là công cụ thực hiện quyền làm chủ tập thể của nhân dân, thể hiện ý chí và nguyện vọng của toàn dân.",
      "HCM nhấn mạnh: Nước ta là nước dân chủ, bao nhiêu lợi ích đều vì dân, bao nhiêu quyền hạn đều của dân.",
    ],
  },
  {
    icon: Building2,
    key: "doNhanDan",
    label: "Do nhân dân",
    color: "gold",
    summary: "Nhân dân trực tiếp tham gia quản lý nhà nước",
    points: [
      "Nhân dân xây dựng, tổ chức và quản lý bộ máy nhà nước thông qua chế độ bầu cử dân chủ.",
      "Bầu ra Quốc hội — cơ quan quyền lực tối cao đại diện cho ý chí nhân dân.",
      "Nhân dân giám sát, kiểm tra và có quyền bãi miễn những đại biểu không xứng đáng.",
      "HCM chủ trương: Dân tham gia ý kiến xây dựng chính sách, không phải thụ động chờ nhà nước ban phát.",
    ],
  },
  {
    icon: Heart,
    key: "viNhanDan",
    label: "Vì nhân dân",
    color: "amber",
    summary: "Nhà nước phục vụ lợi ích của nhân dân",
    points: [
      "Mục tiêu tối thượng của nhà nước là bảo vệ và nâng cao đời sống vật chất, tinh thần của nhân dân.",
      "Cán bộ nhà nước là \"công bộc của nhân dân\" — không phải là \"quan lại\" cai trị nhân dân.",
      "HCM: \"Việc gì có lợi cho dân, ta phải hết sức làm. Việc gì hại đến dân, ta phải hết sức tránh.\"",
      "Chống tham nhũng, quan liêu, lãng phí là điều kiện để nhà nước thực sự vì nhân dân.",
    ],
  },
];

export default function TabTheory() {
  const [active, setActive] = useState(0);
  const current = pillars[active];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 text-crimson-bright border-b border-neutral-900 pb-4">
        <BookOpen className="h-6 w-6" />
        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider">
          Lý Thuyết: Ba Thành Tố Cốt Lõi
        </h3>
      </div>

      <div className="space-y-6 pt-2">
        <p className="text-neutral-300 text-sm md:text-base">
          Theo HCM, nhà nước dân chủ nhân dân được cấu thành bởi{" "}
          <span className="text-white font-semibold">3 thành tố</span> gắn kết
          chặt chẽ, tạo thành một chỉnh thể thống nhất không thể tách rời.
        </p>

        {/* Selector */}
        <div className="grid grid-cols-3 gap-3">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            const isActive = active === i;
            return (
              <button
                key={p.key}
                onClick={() => setActive(i)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 cursor-pointer text-center ${
                  isActive
                    ? p.color === "crimson"
                      ? "bg-crimson/20 border-crimson/60 text-crimson-bright"
                      : p.color === "gold"
                      ? "bg-gold/20 border-gold/60 text-gold-bright"
                      : "bg-amber-500/20 border-amber-500/60 text-amber-400"
                    : "bg-neutral-900/30 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs md:text-sm font-bold">{p.label}</span>
                <span className="text-[10px] text-current opacity-70">
                  {p.summary}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div
          className={`p-6 rounded-xl border space-y-4 transition-all duration-300 ${
            current.color === "crimson"
              ? "bg-crimson/5 border-crimson/25"
              : current.color === "gold"
              ? "bg-gold/5 border-gold/25"
              : "bg-amber-500/5 border-amber-500/25"
          }`}
        >
          <h4
            className={`text-base font-bold flex items-center gap-2 ${
              current.color === "crimson"
                ? "text-crimson-bright"
                : current.color === "gold"
                ? "text-gold-bright"
                : "text-amber-400"
            }`}
          >
            <current.icon className="h-5 w-5" />
            Nhà nước {current.label}
          </h4>
          <ul className="space-y-3">
            {current.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                    current.color === "crimson"
                      ? "bg-crimson/20 text-crimson-bright"
                      : current.color === "gold"
                      ? "bg-gold/20 text-gold-bright"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-neutral-300 leading-relaxed">{pt}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
