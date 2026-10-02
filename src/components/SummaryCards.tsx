'use client';

import React from 'react';
import { AuditSummary, ArticleCode } from '../lib/types';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Receipt,
  Utensils,
  Car,
  Briefcase,
  CalendarX,
  CopyX,
} from 'lucide-react';

interface SummaryCardsProps {
  summary: AuditSummary;
  selectedArticle: string;
  onSelectArticle: (article: string) => void;
}

const ARTICLE_INFO: Record<
  ArticleCode,
  { name: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  제5조: { name: '제5조 (식대)', icon: Utensils, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  제6조: { name: '제6조 (택시)', icon: Car, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  제7조: { name: '제7조 (증빙)', icon: Receipt, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  제8조: { name: '제8조 (접대비)', icon: Briefcase, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  제9조_1항: { name: '제9조 1항 (30일)', icon: CalendarX, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  제9조_2항: { name: '제9조 2항 (중복)', icon: CopyX, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  미기재_경고: { name: '정보 미기재', icon: HelpCircle, color: 'text-amber-700 bg-amber-50 border-amber-300' },
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  selectedArticle,
  onSelectArticle,
}) => {
  return (
    <div className="space-y-4">
      {/* 4대 주요 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 전체 건수 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">전체 검사 건수</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalCount.toLocaleString()}건</p>
            <p className="text-xs text-slate-400">총 청구액: {summary.totalAmount.toLocaleString()}원</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* 정상 건수 */}
        <div className="bg-white rounded-xl p-5 border border-emerald-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-600">규정 통과 (정상)</p>
            <p className="text-2xl font-bold text-emerald-700">{summary.validCount.toLocaleString()}건</p>
            <p className="text-xs text-emerald-600/70">
              {summary.totalCount > 0
                ? `${((summary.validCount / summary.totalCount) * 100).toFixed(1)}% 충족`
                : '100%'}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* 위반 건수 */}
        <div className="bg-white rounded-xl p-5 border border-rose-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-rose-600">사내 규정 위반</p>
            <p className="text-2xl font-bold text-rose-700">{summary.violationCount.toLocaleString()}건</p>
            <p className="text-xs text-rose-500">
              위반액: {summary.violationAmount.toLocaleString()}원
            </p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* 확인 필요 (미기재) */}
        <div className="bg-white rounded-xl p-5 border border-amber-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-600">추가 정보 필요 (미기재)</p>
            <p className="text-2xl font-bold text-amber-700">{summary.warningCount.toLocaleString()}건</p>
            <p className="text-xs text-amber-600/70">항목/증빙/가맹점 보완</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 조항별 및 미기재 통계 칩 바 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              규정 조항 및 미기재 항목별 현황
            </span>
          </div>
          {selectedArticle && (
            <button
              onClick={() => onSelectArticle('')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              필터 해제 ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {(Object.keys(ARTICLE_INFO) as ArticleCode[]).map((articleKey) => {
            const info = ARTICLE_INFO[articleKey];
            const count = summary.articleStats[articleKey] || 0;
            const isSelected = selectedArticle === articleKey;
            const Icon = info.icon;

            return (
              <button
                key={articleKey}
                onClick={() => onSelectArticle(isSelected ? '' : articleKey)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : count > 0
                    ? `${info.color} hover:brightness-95`
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : ''}`} />
                  <span className="text-xs font-semibold truncate">
                    {info.name}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    count > 0 ? 'bg-white shadow-xs text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {count}건
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
