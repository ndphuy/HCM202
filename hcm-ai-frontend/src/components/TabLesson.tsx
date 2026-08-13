"use client";

import React from "react";
import { Lightbulb, Target, ShieldCheck, Landmark } from "lucide-react";

export default function TabLesson() {
  const lessons = [
    {
      icon: ShieldCheck,
      color: "crimson",
      title: "1. Đảm bảo quyền lực thực sự thuộc về nhân dân",
      content:
        "Xây dựng cơ chế để nhân dân không chỉ có quyền trên danh nghĩa mà còn thực sự kiểm soát bộ máy nhà nước thông qua bầu cử tự do, quyền giám sát và quyền bãi miễn đại biểu.",
      quote: null,
    },
    {
      icon: Landmark,
      color: "gold",
      title: "2. Xây dựng nhà nước pháp quyền XHCN",
      content:
        "Mọi hoạt động của nhà nước phải tuân theo pháp luật. Không cá nhân hay tổ chức nào đứng trên pháp luật. Đây là bảo đảm thể chế cho nhà nước vì nhân dân.",
      quote: '"Pháp luật là ý chí của giai cấp thống trị được nâng lên thành luật."',
    },
    {
      icon: Target,
      color: "crimson",
      title: "3. Cán bộ phải thực sự là công bộc của nhân dân",
      content:
        "Đào tạo đội ngũ cán bộ có đức, có tài, đặt lợi ích nhân dân lên trên lợi ích cá nhân. Kiên quyết đấu tranh chống tham nhũng, quan liêu, xa rời nhân dân.",
      quote: '"Cán bộ là gốc của mọi công việc." — Hồ Chí Minh',
    },
    {
      icon: Lightbulb,
      color: "gold",
      title: "4. Phát huy dân chủ — lắng nghe ý kiến nhân dân",
      content:
        "Nhà nước phải mở rộng các kênh để nhân dân đóng góp ý kiến xây dựng chính sách. Dân chủ không chỉ là bầu cử mà còn là sự tham gia thường xuyên vào quản lý nhà nước.",
      quote: '"Dân chủ là của báu." — Hồ Chí Minh',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 text-crimson-bright border-b border-neutral-900 pb-4">
        <Lightbulb className="h-6 w-6" />
        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider">
          Bài Học & Ý Nghĩa Hiện Thời
        </h3>
      </div>

      <p className="text-neutral-300 text-sm md:text-base leading-relaxed pt-2">
        Tư tưởng HCM về nhà nước không chỉ là di sản lịch sử mà còn có{" "}
        <strong className="text-white">giá trị định hướng thực tiễn</strong>{" "}
        trong công cuộc xây dựng và hoàn thiện Nhà nước pháp quyền XHCN Việt
        Nam hiện nay.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {lessons.map((lesson, i) => {
          const Icon = lesson.icon;
          return (
            <div
              key={i}
              className={`bg-neutral-900/35 p-5 rounded-xl border space-y-3 ${
                lesson.color === "crimson"
                  ? "border-crimson/20 hover:border-crimson/40"
                  : "border-gold/20 hover:border-gold/40"
              } transition-all duration-300`}
            >
              <div
                className={`flex items-center gap-2 ${
                  lesson.color === "crimson"
                    ? "text-crimson-bright"
                    : "text-gold-bright"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <h4 className="font-bold text-white text-sm">{lesson.title}</h4>
              </div>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                {lesson.content}
              </p>
              {lesson.quote && (
                <p
                  className={`text-xs italic font-semibold ${
                    lesson.color === "crimson"
                      ? "text-crimson-bright/80"
                      : "text-gold-bright/80"
                  }`}
                >
                  {lesson.quote}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-crimson/10 to-gold/10 rounded-xl border border-neutral-800 text-center">
        <p className="text-sm text-neutral-300 leading-relaxed">
          <strong className="text-white">Kết luận:</strong> Tư tưởng HCM về nhà
          nước <span className="text-crimson-bright">của nhân dân</span>,{" "}
          <span className="text-gold-bright">do nhân dân</span>,{" "}
          <span className="text-amber-400">vì nhân dân</span> là nền tảng lý
          luận và kim chỉ nam hành động cho sự nghiệp xây dựng nhà nước Việt
          Nam trong thời kỳ đổi mới và hội nhập quốc tế.
        </p>
      </div>
    </div>
  );
}
