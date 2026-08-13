"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, File, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    document_name: string;
    num_chunks: number;
    document_id: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const extension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (extension !== "pdf" && extension !== "docx" && extension !== "doc") {
        setErrorMsg("Chỉ hỗ trợ định dạng tài liệu PDF, DOCX hoặc DOC.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setErrorMsg(null);
      setUploadResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      const extension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (extension !== "pdf" && extension !== "docx" && extension !== "doc") {
        setErrorMsg("Chỉ hỗ trợ định dạng tài liệu PDF, DOCX hoặc DOC.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setErrorMsg(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${baseUrl}/api/documents/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Không thể tải lên tài liệu.");
      }

      const data = await response.json();
      setUploadResult({
        document_name: data.document_name,
        num_chunks: data.num_chunks,
        document_id: data.document_id,
      });
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Đã xảy ra lỗi khi kết nối với Backend.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-neutral-950 border border-crimson/20 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UploadCloud className="h-5.5 w-5.5 text-crimson-bright animate-bounce" />
            Nạp Tài Liệu Giáo Trình Cho AI
          </h3>
          <p className="text-xs text-neutral-400">
            Tải lên tài liệu PDF hoặc Word để AI học kiến thức phục vụ RAG và tạo trắc nghiệm.
          </p>
        </div>

        {/* Upload Box */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-800 hover:border-crimson/40 bg-neutral-900/20 hover:bg-crimson/5 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-3"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden"
            accept=".pdf,.docx,.doc"
          />
          <UploadCloud className="h-10 w-10 text-neutral-500" />
          <div className="text-xs md:text-sm text-neutral-400">
            <span className="text-crimson-bright font-bold">Nhấn để chọn</span> hoặc kéo thả tài liệu vào đây
          </div>
          <p className="text-[10px] text-neutral-550">Hỗ trợ PDF, DOCX tối đa 50MB</p>
        </div>

        {/* Selected File Display */}
        {file && (
          <div className="flex items-center justify-between p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl animate-fade-in">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <File className="h-5 w-5 text-crimson-bright shrink-0" />
              <span className="text-xs text-white truncate">{file.name}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-neutral-500 hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        {/* Error Info */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Success Info */}
        {uploadResult && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl space-y-2 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <span className="font-bold text-emerald-400">Nạp tài liệu thành công!</span>
            </div>
            <div className="pl-7 space-y-1 text-neutral-400">
              <p>• Tên tài liệu: <strong className="text-neutral-200">{uploadResult.document_name}</strong></p>
              <p>• Phân mảnh: <strong className="text-emerald-400 font-mono">{uploadResult.num_chunks} chunks</strong> được nhúng thành công vào vector DB.</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        {file && (
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-3 bg-crimson hover:bg-crimson-light text-white text-xs md:text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-crimson/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:hover:bg-crimson"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý tài liệu & nhúng vector...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" />
                <span>Nạp tài liệu vào bộ não AI</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
