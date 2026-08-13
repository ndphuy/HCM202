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

  // Static Sample Questions about Case Study
  const sampleQuestions: QuizQuestion[] = [
    {
      id: "q1",
      question: "Hình thái tư bản nào của Alpha Corp đang bị 'mắc kẹt' khi thị trường đóng băng?",
      options: [
        "A. Tư bản tiền tệ (Tiền vay ngân hàng chưa giải ngân)",
        "B. Tư bản sản xuất (Máy móc thiết bị đang hoạt động)",
        "C. Tư bản hàng hóa (3 tòa tháp xây xong phần thô không bán được)",
        "D. Tư bản cho vay (Khoản tiền lãi ngân hàng thu về)"
      ],
      correctIndex: 2,
      explanations: [
        "Sai rồi. Tiền vay 10.000 tỷ đã được Alpha Corp dùng hết để mua đất, thuê nhân công và máy móc (đã chuyển hóa hoàn toàn).",
        "Chưa chính xác. Tư bản sản xuất là máy móc và nhân công đang xây dựng, nhưng hiện tại dự án đã hoàn thành phần thô và đóng băng.",
        "Chính xác! Do dự án đã hoàn thành phần thô (sản phẩm hoàn thiện một phần) nhưng không thể bán ra được, dòng vốn của doanh nghiệp bị mắc kẹt hoàn toàn dưới hình thái Hàng hóa (H').",
        "Không đúng. Tư bản cho vay thuộc về phía ngân hàng thương mại cung cấp tín dụng cho Alpha Corp."
      ]
    },
    {
      id: "q2",
      question: "Để tuần hoàn tư bản diễn ra liên tục, Alpha Corp bắt buộc phải đáp ứng điều kiện gì?",
      options: [
        "A. Chỉ cần dự trữ nhiều tiền mặt trong tài khoản ngân hàng.",
        "B. Tư bản phải đồng thời tồn tại ở cả 3 hình thái (Tiền tệ, Sản xuất, Hàng hóa) và kế tiếp nhau chuyển hóa.",
        "C. Chỉ cần tập trung toàn bộ nguồn lực để xây dựng thật nhanh.",
        "D. Chỉ cần thuê thật nhiều công nhân để tăng giá trị sử dụng."
      ],
      correctIndex: 1,
      explanations: [
        "Không đủ. Nếu chỉ giữ tiền mặt mà không đưa vào sản xuất thì tư bản không thể sinh lời.",
        "Chính xác! Theo lý luận của C. Mác, sự tuần hoàn của tư bản chỉ tiến hành một cách bình thường khi ba hình thái cùng tồn tại đồng thời trong không gian và kế tiếp nhau chuyển hóa trong thời gian.",
        "Sai rồi. Dồn hết lực xây dựng (chuyển hết vốn sang sản xuất/hàng hóa) mà không giữ lại tiền để trả lãi hay duy trì bộ máy sẽ gây đứt gãy dòng tuần hoàn như trường hợp Alpha Corp.",
        "Không đúng. Công nhân tạo ra giá trị thặng dư nhưng tuần hoàn tư bản đòi hỏi toàn bộ các giai đoạn chuyển hóa (Tiền - Sản xuất - Hàng hóa) đều phải thông suốt."
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
            <span>Câu hỏi mẫu Alpha Corp</span>
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
            Nội dung: Phân tích kiến thức thực hành dựa trên tình huống đứt gãy dòng vốn của Alpha Corp.
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
                  Nguồn tài liệu: <strong className="text-neutral-300">{documentUsed || "Tài liệu hệ thống"}</strong>
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
