'use client';

import React, { useState } from 'react';
import { AuditedExpenseItem } from '../lib/types';
import {
  generateSubmitterRejectText,
  generateAllRejectText,
} from '../lib/template';
import {
  X,
  Copy,
  Check,
  UserX,
  AlertTriangle,
  FileText,
  Layers,
} from 'lucide-react';

interface RejectCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitterViolations: Record<string, AuditedExpenseItem[]>;
}

export const RejectCopyModal: React.FC<RejectCopyModalProps> = ({
  isOpen,
  onClose,
  submitterViolations,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all'); // 'all' or submitterName

  if (!isOpen) return null;

  const submitters = Object.keys(submitterViolations);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  const handleCopyAll = () => {
    const allText = generateAllRejectText(submitterViolations);
    copyToClipboard(allText, 'all');
  };

  const currentPreviewText =
    activeTab === 'all'
      ? generateAllRejectText(submitterViolations)
      : generateSubmitterRejectText(activeTab, submitterViolations[activeTab] || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* 모달 헤더 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                제출자별 반려 사유 텍스트 복사
              </h3>
              <p className="text-xs text-slate-500">
                총 {submitters.length}명의 제출자에게 위반 내역이 확인되었습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            전체 일괄 모음 ({submitters.length}명)
          </button>
          {submitters.map((name) => {
            const count = submitterViolations[name]?.length || 0;
            return (
              <button
                key={name}
                onClick={() => setActiveTab(name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === name
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === name ? 'bg-rose-800 text-rose-100' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 모달 본문 / 텍스트 프리뷰 */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              메신저/이메일 전송용 텍스트 미리보기
            </span>
            <button
              onClick={() =>
                copyToClipboard(
                  currentPreviewText,
                  activeTab === 'all' ? 'all' : activeTab
                )
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                copiedKey === (activeTab === 'all' ? 'all' : activeTab)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copiedKey === (activeTab === 'all' ? 'all' : activeTab) ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>
                    {activeTab === 'all'
                      ? '전체 반려 사유 일괄 복사'
                      : `${activeTab}님 사유 복사`}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[360px] border border-slate-800 shadow-inner">
              {currentPreviewText}
            </pre>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            복사된 텍스트를 슬랙, 잔디, 카카오톡 또는 사내 메일에 바로 붙여넣어 직원에게 전송할 수 있습니다.
          </p>
        </div>

        {/* 모달 푸터 */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCopyAll}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            모든 제출자 텍스트 한번에 복사
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
