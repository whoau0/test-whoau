'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { FileUploader } from '../components/FileUploader';
import { SummaryCards } from '../components/SummaryCards';
import { FilterBar } from '../components/FilterBar';
import { ExpenseTable } from '../components/ExpenseTable';
import { RejectCopyModal } from '../components/RejectCopyModal';
import { parseExpenseCsv } from '../lib/parser';
import { auditExpenses } from '../lib/auditor';
import { AuditedExpenseItem, AuditSummary, FilterOptions } from '../lib/types';
import { SAMPLE_CSV_DATA } from '../sample/sampleExpenses';
import { runAuditVerification } from '../lib/testVerification';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [csvRaw, setCsvRaw] = useState<string>('');
  const [auditedItems, setAuditedItems] = useState<AuditedExpenseItem[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState<FilterOptions>({
    onlyViolations: false,
    onlyWarnings: false,
    searchKeyword: '',
    submitter: '',
    department: '',
    category: '',
    article: '',
  });

  // 데이터 로드 및 분석 처리 함수
  const processCsv = (content: string, isSample: boolean = false) => {
    setCsvRaw(content);
    setIsSampleLoaded(isSample);
    const { items, errors } = parseExpenseCsv(content);
    setParseErrors(errors);

    if (items.length > 0) {
      const { auditedItems: resultItems, summary: resultSummary } = auditExpenses(items);
      setAuditedItems(resultItems);
      setSummary(resultSummary);
    } else {
      setAuditedItems([]);
      setSummary(null);
    }
  };

  // 샘플 데이터 로드
  const handleLoadSample = () => {
    processCsv(SAMPLE_CSV_DATA, true);
  };

  // 초기화
  const handleReset = () => {
    setCsvRaw('');
    setIsSampleLoaded(false);
    setAuditedItems([]);
    setSummary(null);
    setParseErrors([]);
    setFilters({
      onlyViolations: false,
      onlyWarnings: false,
      searchKeyword: '',
      submitter: '',
      department: '',
      category: '',
      article: '',
    });
  };

  // 고유 드롭다운 목록 추출
  const submitters = useMemo(() => {
    return Array.from(new Set(auditedItems.map((item) => item.submitter).filter(Boolean))).sort();
  }, [auditedItems]);

  const departments = useMemo(() => {
    return Array.from(new Set(auditedItems.map((item) => item.department).filter(Boolean))).sort();
  }, [auditedItems]);

  const categories = useMemo(() => {
    return Array.from(new Set(auditedItems.map((item) => item.category).filter(Boolean))).sort();
  }, [auditedItems]);

  // 필터링 적용된 목록
  const filteredItems = useMemo(() => {
    return auditedItems.filter((item) => {
      // 위반 여부 필터
      if (filters.onlyViolations && !item.isViolation) {
        return false;
      }

      // 미기재 경고 필터
      if (filters.onlyWarnings && !item.hasWarning) {
        return false;
      }

      // 조항별 필터
      if (filters.article) {
        const hasArticle = item.violations.some((v) => v.article === filters.article);
        if (!hasArticle) return false;
      }

      // 제출자 필터
      if (filters.submitter && item.submitter !== filters.submitter) {
        return false;
      }

      // 부서 필터
      if (filters.department && item.department !== filters.department) {
        return false;
      }

      // 항목 필터
      if (filters.category && item.category !== filters.category) {
        return false;
      }

      // 검색어 필터 (가맹점, 메모, 사유, 제출자 등)
      if (filters.searchKeyword.trim()) {
        const kw = filters.searchKeyword.toLowerCase().trim();
        const matchMerchant = item.merchant.toLowerCase().includes(kw);
        const matchMemo = item.memo.toLowerCase().includes(kw);
        const matchSubmitter = item.submitter.toLowerCase().includes(kw);
        const matchViolation = item.violations.some((v) =>
          v.reason.toLowerCase().includes(kw) || v.ruleTitle.toLowerCase().includes(kw)
        );
        if (!matchMerchant && !matchMemo && !matchSubmitter && !matchViolation) {
          return false;
        }
      }

      return true;
    });
  }, [auditedItems, filters]);

  // 샘플 데이터 자동 테스트 검증 결과
  const testVerificationResult = useMemo(() => {
    if (!isSampleLoaded) return null;
    return runAuditVerification();
  }, [isSampleLoaded]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 최상단 헤더 */}
      <Header
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        onOpenRejectModal={() => setIsModalOpen(true)}
        hasData={auditedItems.length > 0}
        violationCount={summary?.violationCount || 0}
        warningCount={summary?.warningCount || 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 파싱 오류 안내 */}
        {parseErrors.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>CSV 데이터 파싱 중 일부 경고가 발생했습니다:</span>
            </div>
            <ul className="list-disc list-inside pl-2 space-y-0.5 text-amber-700">
              {parseErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* PRD 제7장 테스트 데이터셋 검증 배너 (샘플 로드 시 노출) */}
        {testVerificationResult && testVerificationResult.passed && (
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <b>[PRD 제7장 테스트 검증 완료]</b> 내장 샘플 25건 데이터 중 <b>규정 위반 9건 (정상 16건)</b>이 정확도 100%로 검출되었습니다.
              </span>
            </div>
            <span className="hidden sm:inline-block font-mono font-semibold bg-indigo-200/70 text-indigo-800 px-2 py-0.5 rounded text-[11px]">
              Accuracy: 100%
            </span>
          </div>
        )}

        {auditedItems.length === 0 ? (
          /* 업로드 대기 화면 */
          <div className="py-6">
            <FileUploader
              onFileLoaded={(content) => processCsv(content, false)}
              onLoadSample={handleLoadSample}
            />
          </div>
        ) : (
          /* 검사 결과 대시보드 화면 */
          <div className="space-y-6 animate-fadeIn">
            {/* 요약 KPI 카드 및 조항별 통계 */}
            {summary && (
              <SummaryCards
                summary={summary}
                selectedArticle={filters.article}
                onSelectArticle={(article) =>
                  setFilters((prev) => ({ ...prev, article }))
                }
              />
            )}

            {/* 필터 및 검색 바 */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              submitters={submitters}
              departments={departments}
              categories={categories}
              totalFilteredCount={filteredItems.length}
            />

            {/* 메인 경비 데이터 테이블 */}
            <ExpenseTable items={filteredItems} />
          </div>
        )}
      </main>

      {/* 반려 사유 복사 모달 */}
      {summary && (
        <RejectCopyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          submitterViolations={summary.submitterViolations}
        />
      )}

      {/* 푸터 */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">한결인테리어 경비 처리 규정 감사 시스템</p>
          <p className="text-slate-400">규정 버전: 2026-03-01 개정안 기준 (제5조~제9조 자동 검증 엔진 탑재)</p>
        </div>
      </footer>
    </div>
  );
}
