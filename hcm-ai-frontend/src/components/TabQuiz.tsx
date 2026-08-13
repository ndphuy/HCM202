"use client";

import React, { useState } from "react";
import { Award, RotateCcw, Sparkles, Layers, X, Settings } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanations: string[];
}

interface TabQuizProps {
  quizQuestions: QuizQuestion[];
  selectedAnswers: Record<string, number>;
  showQuizResult: Record<string, boolean>;
  onAnswer: (qId: string, optionIdx: number) => void;
  onReset: (qId: string) => void;
  onGenerateAIQuestions: (num: number, level: "easy" | "medium" | "hard") => Promise<void>;
  isGenerating: boolean;
  documentUsed: string | null;
}

const formatDocName = (docName: string | null) => {
  if (!docName) return "Tài liệu hệ thống";
  return docName
    .split(",")
    .map((name) => {
      const trimmed = name.trim();
      const match = trimmed.match(/^page_?(\d+)(\.txt|\.pdf|\.docx)?$/i);
      if (match) {
        return `Trang ${match[1]}`;
      }
      return trimmed.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
    })
    .join(", ");
};

export default function TabQuiz({
  quizQuestions,
  selectedAnswers,
  showQuizResult,
  onAnswer,
  onReset,
  onGenerateAIQuestions,
  isGenerating,
  documentUsed,
}: TabQuizProps) {
  // Mode selection: "sample" (static Case Study questions) or "ai" (AI generated questions)
  const [quizMode, setQuizMode] = useState<"sample" | "ai">("sample");

  // Modal state
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Config states
  const [numQuestions, setNumQuestions] = useState(3);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Static Sample Questions about HCM202
  const sampleQuestions: QuizQuestion[] = [
    {
      id: "q1",
      question: "Trong Tư tưởng Hồ Chí Minh, bản chất của Nhà nước Việt Nam Dân chủ Cộng hòa mang bản chất của giai cấp nào?",
      options: [
        "A. Mang bản chất giai cấp tư sản",
        "B. Mang bản chất của toàn dân (phi giai cấp)",
        "C. Mang bản chất giai cấp công nhân",
        "D. Mang bản chất giai cấp nông dân"
      ],
      correctIndex: 2,
      explanations: [
        "Sai rồi. Nhà nước Việt Nam không mang bản chất giai cấp tư sản vì mục tiêu của cách mạng là đi lên CNXH.",
        "Chưa chính xác. Theo Hồ Chí Minh, nhà nước ở đâu và bao giờ cũng mang bản chất của một giai cấp nhất định, không có nhà nước phi giai cấp.",
        "Chính xác! Hiến pháp năm 1959 khẳng định: 'Nhà nước của ta là Nhà nước dân chủ nhân dân... do giai cấp công nhân lãnh đạo'.",
        "Không đúng. Giai cấp nông dân là nòng cốt trong khối liên minh công - nông, nhưng lực lượng lãnh đạo và quyết định bản chất nhà nước là giai cấp công nhân."
      ]
    },
    {
      id: "q2",
      question: "Theo Hồ Chí Minh, yếu tố nào xác định phân biệt 'Dân là chủ' và 'Dân làm chủ' trong Nhà nước do nhân dân?",
      options: [
        "A. 'Dân là chủ' xác định vị thế quyền lực của nhân dân, còn 'Dân làm chủ' nhấn mạnh nghĩa vụ, trách nhiệm và năng lực làm chủ.",
        "B. 'Dân là chủ' và 'Dân làm chủ' có nghĩa hoàn toàn giống nhau, chỉ là cách dùng từ khác nhau.",
        "C. 'Dân làm chủ' có nghĩa là nhân dân có toàn quyền không cần tuân theo pháp luật.",
        "D. 'Dân là chủ' chỉ áp dụng trong thời chiến, còn 'Dân làm chủ' áp dụng trong thời bình."
      ],
      correctIndex: 0,
      explanations: [
        "Chính xác! Bác Hồ phân biệt rõ: 'Dân là chủ' xác định vị thế tối cao về quyền lực, còn 'Dân làm chủ' nhấn mạnh nghĩa vụ, trách nhiệm và năng lực làm chủ của nhân dân.",
        "Sai rồi. Đây là hai khái niệm bổ sung cho nhau nhưng có sắc thái và ý nghĩa khác nhau trong lý luận về nhà nước của Bác.",
        "Không đúng. Nhân dân làm chủ phải tuân theo pháp luật của Nhà nước, giữ gìn trật tự chung và đóng góp xây dựng đất nước.",
        "Không chính xác. Cả hai nguyên tắc này đều xuyên suốt trong cả thời chiến và thời bình."
      ]
    },
    {
      id: "q3",
      question: "Quan điểm của Hồ Chí Minh về mối quan hệ giữa cán bộ nhà nước và nhân dân trong Nhà nước vì dân là gì?",
      options: [
        "A. Cán bộ nhà nước là quan lại cai trị, nhân dân là người thụ động phục tùng.",
        "B. Cán bộ vừa là đày tớ (công bộc) trung thành, vừa là người lãnh đạo minh mẫn của nhân dân.",
        "C. Cán bộ chỉ có trách nhiệm ban phát phúc lợi mà không cần lắng nghe ý kiến nhân dân.",
        "D. Cán bộ nhà nước được hưởng đặc quyền đặc lợi lớn hơn nhân dân."
      ],
      correctIndex: 1,
      explanations: [
        "Sai rồi. Hồ Chí Minh kiên quyết phê phán tư tưởng quan cách cách mạng và thói quan liêu cai trị.",
        "Chính xác! Bác dạy: Cán bộ vừa là đày tớ tận tụy phục vụ lợi ích của dân, vừa là người lãnh đạo sáng suốt chỉ đường cho nhân dân.",
        "Chưa đúng. Nhà nước vì dân đòi hỏi cán bộ phải thường xuyên lắng nghe, tôn trọng và học hỏi ý kiến từ nhân dân.",
        "Không đúng. Nhà nước vì dân tuyệt đối không có đặc quyền đặc lợi, cán bộ phải cần, kiệm, liêm, chính, chí công vô tư."
      ]
    }
  ];

  const handleConfirmGenerate = () => {
    setIsConfigOpen(false);
    onGenerateAIQuestions(numQuestions, difficulty);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">

      {/* Header and Sub-Tab Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-2.5 text-crimson-bright">
          <Award className="h-6 w-6" />
          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider">
            Luyện tập & Đánh giá
          </h3>
        </div>

        {/* Sub-mode selector */}
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-850 shrink-0">
          <button
            onClick={() => setQuizMode("sample")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer ${quizMode === "sample"
              ? "bg-neutral-900 text-white border border-neutral-800"
              : "text-neutral-500 hover:text-neutral-350"
              }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Câu hỏi mẫu HCM202</span>
          </button>

          <button
            onClick={() => setQuizMode("ai")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer ${quizMode === "ai"
              ? "bg-neutral-900 text-white border border-neutral-800"
              : "text-neutral-500 hover:text-neutral-350"
              }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Trắc nghiệm AI tự chọn</span>
          </button>
        </div>
      </div>

      {/* RENDER MODE 1: SAMPLE FIXED QUESTIONS */}
      {quizMode === "sample" && (
        <div className="space-y-6 h-[580px] overflow-y-auto pr-1.5 scrollbar-thin">
          <div className="text-xs text-neutral-500">
            Nội dung: Các câu hỏi trắc nghiệm kiến thức cốt lõi Chương IV: Nhà nước của Dân, do Dân, vì Dân.
          </div>
          <div className="space-y-6">
            {sampleQuestions.map((q, qIdx) => (
              <div key={q.id} className="p-5 bg-neutral-900/30 rounded-xl border border-neutral-800 space-y-3">
                <h4 className="text-sm md:text-base font-semibold text-white">
                  Câu {qIdx + 1}: {q.question}
                </h4>

                <div className="grid sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    const isCorrect = optIdx === q.correctIndex;
                    const showResult = showQuizResult[q.id];

                    let btnClass = "bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700";
                    if (showResult) {
                      if (isCorrect) {
                        btnClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-300";
                      } else if (isSelected) {
                        btnClass = "bg-red-950/40 border-red-500/50 text-red-300";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={showResult}
                        onClick={() => onAnswer(q.id, optIdx)}
                        className={`text-left p-4 rounded-xl border text-xs md:text-sm transition-all duration-300 cursor-pointer ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {showQuizResult[q.id] && (
                  <div className="p-4 bg-neutral-900/90 rounded border border-neutral-800 text-xs md:text-sm text-neutral-400 flex items-start justify-between gap-3 animate-fade-in">
                    <p className="leading-relaxed">
                      <strong className={selectedAnswers[q.id] === q.correctIndex ? "text-emerald-400" : "text-red-400"}>
                        {selectedAnswers[q.id] === q.correctIndex ? "✓ Đúng rồi: " : "✗ Sai rồi: "}
                      </strong>
                      {q.explanations[selectedAnswers[q.id]]}
                    </p>
                    <button
                      onClick={() => onReset(q.id)}
                      className="text-neutral-500 hover:text-white shrink-0 p-1.5 cursor-pointer"
                      title="Làm lại câu hỏi này"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER MODE 2: AI DYNAMIC MCQ GENERATION */}
      {quizMode === "ai" && (
        <div className="space-y-6 h-[580px] overflow-y-auto pr-1.5 scrollbar-thin flex flex-col">

          {/* Header Action inside Content (when already has questions) */}
          <div className="w-full flex-1 flex flex-col">
            {quizQuestions.length > 0 && !isGenerating && (
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
                <div className="text-xs text-neutral-500">
                  Nguồn tài liệu: <strong className="text-neutral-300">{formatDocName(documentUsed)}</strong>
                </div>
                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-750 text-white text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Soạn đề khác</span>
                </button>
              </div>
            )}

            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
                <div className="h-10 w-10 border-4 border-crimson border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-white">AI đang đọc giáo trình và soạn đề thi...</h4>
                  <p className="text-xs text-neutral-500 font-mono">Tự động đối chiếu thông qua RAG Backend</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {quizQuestions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center border border-neutral-850/50 rounded-xl bg-neutral-900/10 space-y-4 p-6 my-auto">
                    <div className="h-12 w-12 bg-crimson/10 border border-crimson/30 rounded-full flex items-center justify-center text-crimson-bright">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-2 max-w-[340px] text-center">
                      <h4 className="text-sm font-bold text-white">Tạo đề thi trắc nghiệm bằng AI</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        AI sẽ tự động đọc hiểu các giáo trình/tài liệu bạn đã nạp vào database để soạn ra bộ câu hỏi trắc nghiệm kiểm tra kiến thức tương ứng.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsConfigOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-crimson-light text-white text-xs md:text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-crimson/25 cursor-pointer animate-pulse hover:animate-none"
                    >
                      <Sparkles className="h-4.5 w-4.5" />
                      <span>Bắt đầu tạo đề thi AI</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {quizQuestions.map((q, qIdx) => (
                      <div key={q.id} className="p-5 bg-neutral-900/30 rounded-xl border border-neutral-800 space-y-3">
                        <h4 className="text-sm md:text-base font-semibold text-white">
                          Câu {qIdx + 1}: {q.question}
                        </h4>

                        <div className="grid sm:grid-cols-2 gap-3">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedAnswers[q.id] === optIdx;
                            const isCorrect = optIdx === q.correctIndex;
                            const showResult = showQuizResult[q.id];

                            let btnClass = "bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700";
                            if (showResult) {
                              if (isCorrect) {
                                btnClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-300";
                              } else if (isSelected) {
                                btnClass = "bg-red-950/40 border-red-500/50 text-red-300";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={showResult}
                                onClick={() => onAnswer(q.id, optIdx)}
                                className={`text-left p-4 rounded-xl border text-xs md:text-sm transition-all duration-300 cursor-pointer ${btnClass}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {showQuizResult[q.id] && (
                          <div className="p-4 bg-neutral-900/90 rounded border border-neutral-800 text-xs md:text-sm text-neutral-400 flex items-start justify-between gap-3 animate-fade-in">
                            <p className="leading-relaxed">
                              <strong className={selectedAnswers[q.id] === q.correctIndex ? "text-emerald-400" : "text-red-400"}>
                                {selectedAnswers[q.id] === q.correctIndex ? "✓ Đúng rồi: " : "✗ Sai rồi: "}
                              </strong>
                              {q.explanations[selectedAnswers[q.id]]}
                            </p>
                            <button
                              onClick={() => onReset(q.id)}
                              className="text-neutral-500 hover:text-white shrink-0 p-1.5 cursor-pointer"
                              title="Làm lại câu hỏi này"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI QUIZ CONFIG MODAL */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-neutral-950 border border-crimson/25 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl space-y-5">

            <button
              onClick={() => setIsConfigOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-gold-bright animate-spin" />
                Cấu hình sinh đề bằng AI
              </h4>
              <p className="text-[10px] text-neutral-400">Chọn cấu hình để AI quét giáo trình và tự biên soạn.</p>
            </div>

            <div className="space-y-4">

              {/* Difficulty select */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-semibold">Mức độ khó của câu hỏi:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-crimson/50 cursor-pointer"
                >
                  <option value="easy">Độ khó: Dễ</option>
                  <option value="medium">Độ khó: Trung bình</option>
                  <option value="hard">Độ khó: Khó</option>
                </select>
              </div>

              {/* Num questions select */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-semibold">Số lượng câu hỏi muốn tạo:</label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-crimson/50 cursor-pointer"
                >
                  <option value={3}>Tạo 3 Câu hỏi</option>
                  <option value={5}>Tạo 5 Câu hỏi</option>
                  <option value={10}>Tạo 10 Câu hỏi</option>
                </select>
              </div>
            </div>

            {/* Confirm / Cancel Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmGenerate}
                className="flex-1 py-2.5 bg-crimson hover:bg-crimson-light text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Xác nhận tạo đề
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
