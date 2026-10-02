'use client';

import React from 'react';
import { ShieldCheck, FileSpreadsheet, RefreshCw, MessageSquareWarning } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onReset: () => void;
  onOpenRejectModal: () => void;
  hasData: boolean;
  violationCount: number;
  warningCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onReset,
  onOpenRejectModal,
  hasData,
  violationCount,
  warningCount,
}) => {
  const totalIssueCount = violationCount + warningCount;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">한결인테리어</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">v1.1</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              경비 정산 규정 검사기 <span className="hidden sm:inline font-normal text-xs text-slate-500">(Expense Auditor)</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {!hasData ? (
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>샘플 데이터 로드</span>
            </button>
          ) : (
            <>
              {totalIssueCount > 0 && (
                <button
                  onClick={onOpenRejectModal}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-sm cursor-pointer ${
                    violationCount > 0
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 animate-pulse'
                      : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                  }`}
                >
                  <MessageSquareWarning className="w-4 h-4" />
                  <span>
                    반려/보완 요청 ({totalIssueCount}건)
                  </span>
                </button>
              )}
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="데이터 초기화"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">초기화</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
