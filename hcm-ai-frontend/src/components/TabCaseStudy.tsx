"use client";

import React from "react";
import { History, Star } from "lucide-react";

export default function TabCaseStudy() {
  const timeline = [
    {
      year: "1945",
      event: "Tuyên ngôn Độc lập",
      detail:
        'Hồ Chí Minh đọc Tuyên ngôn Độc lập ngày 2/9/1945, khai sinh nước Việt Nam Dân chủ Cộng hòa — nhà nước dân chủ nhân dân đầu tiên ở Đông Nam Á.',
      color: "crimson",
    },
    {
      year: "1946",
      event: "Hiến pháp 1946",
      detail:
        'Bản Hiến pháp đầu tiên khẳng định: "Nước Việt Nam là một nước dân chủ cộng hòa. Tất cả quyền bính trong nước là của toàn thể nhân dân Việt Nam."',
      color: "gold",
    },
    {
      year: "1948–1954",
      event: "Kháng chiến toàn quốc",
      detail:
        "Trong 9 năm kháng chiến, HCM vừa lãnh đạo chiến tranh vừa liên tục xây dựng và củng cố bộ máy nhà nước kháng chiến gắn với nhân dân.",
      color: "crimson",
    },
    {
      year: "1955–1969",
      event: "Xây dựng miền Bắc XHCN",
      detail:
        "HCM tiếp tục hoàn thiện tư tưởng về nhà nước qua thực tiễn xây dựng miền Bắc, nhấn mạnh cán bộ là công bộc của nhân dân, chống quan liêu tham nhũng.",
      color: "gold",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 text-crimson-bright border-b border-neutral-900 pb-4">
        <History className="h-6 w-6" />
        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider">
          Bối Cảnh Lịch Sử Ra Đời Tư Tưởng
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start pt-2">
        <div className="space-y-4">
          <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
            Tư tưởng HCM về nhà nước ra đời từ thực tiễn{" "}
            <strong className="text-white">đấu tranh giải phóng dân tộc</strong>{" "}
            và{" "}
            <strong className="text-white">xây dựng chế độ mới</strong>. Điểm
            xuất phát là sự kế thừa truyền thống yêu nước Việt Nam, tiếp thu có
            chọn lọc lý luận Mác - Lênin, và tổng kết thực tiễn cách mạng.
          </p>
          <div className="bg-crimson/5 border border-crimson/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-crimson-bright text-xs font-bold uppercase tracking-widest">
              <Star className="h-3.5 w-3.5" />
              Nguồn gốc hình thành
            </div>
            <ul className="text-xs text-neutral-400 space-y-1.5 pl-3 list-disc">
              <li>
                <strong className="text-neutral-200">Truyền thống:</strong> Tư
                tưởng nhân nghĩa, thân dân trong văn hóa Việt Nam
              </li>
              <li>
                <strong className="text-neutral-200">Lý luận:</strong> Học
                thuyết Mác - Lênin về nhà nước và cách mạng vô sản
              </li>
              <li>
                <strong className="text-neutral-200">Thực tiễn:</strong> Tổng
                kết kinh nghiệm Cách mạng Tháng Tám 1945 và kháng chiến
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          {timeline.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-neutral-900/40 p-4 rounded-xl border border-neutral-800"
            >
              <div
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  item.color === "crimson"
                    ? "bg-crimson/20 text-crimson-bright border border-crimson/40"
                    : "bg-gold/20 text-gold-bright border border-gold/40"
                }`}
              >
                {item.year}
              </div>
              <div>
                <p className="text-white text-xs font-semibold mb-0.5">
                  {item.event}
                </p>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
