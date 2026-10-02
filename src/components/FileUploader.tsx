'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, AlertCircle, BookOpen } from 'lucide-react';

interface FileUploaderProps {
  onFileLoaded: (csvContent: string) => void;
  onLoadSample: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded, onLoadSample }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('CSV 형식(.csv)의 파일만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onFileLoaded(content);
      }
    };
    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 드래그 앤 드롭 업로더 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-800">
              경비 내역 CSV 파일을 드래그하거나 클릭하여 업로드
            </h3>
            <p className="text-sm text-slate-500">
              한결인테리어 표준 경비 내역 CSV 파일(UTF-8)을 지원합니다.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              .csv 파일 지원
            </span>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLoadSample();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer border border-indigo-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              샘플 25건 데이터로 바로 테스트하기
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 규정 안내 카드 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>한결인테리어 경비 처리 규정 검증 기준 (제5조 ~ 제9조)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-700 block mb-1">제5조 (식대 한도)</span>
            <p className="text-slate-500">1인당 1회 12,000원 한도 (초과 시 개인부담 대상)</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-700 block mb-1">제6조 (교통비/택시)</span>
            <p className="text-slate-500">22:00 이후 야간 퇴근 또는 업무 이동(메모 기재) 시 인정</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-700 block mb-1">제7조 (증빙 기준)</span>
            <p className="text-slate-500">30,000원 이상 지출 시 간이영수증 불인정 (적격증빙 필수)</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-700 block mb-1">제8조 (접대비 사전품의)</span>
            <p className="text-slate-500">300,000원 초과 접대비는 사전 품의번호 필수 기재</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-700 block mb-1">제9조 1항 (제출 기한)</span>
            <p className="text-slate-500">사용일로부터 30일 초과 건 처리 불가</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-700 block mb-1">제9조 2항 (중복 제출)</span>
            <p className="text-slate-500">사용일·가맹점·금액이 동일한 2중 제출 차단</p>
          </div>
        </div>
      </div>
    </div>
  );
};
