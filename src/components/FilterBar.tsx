'use client';

import React from 'react';
import { FilterOptions } from '../lib/types';
import { Search, RotateCcw, AlertOctagon, HelpCircle } from 'lucide-react';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  submitters: string[];
  departments: string[];
  categories: string[];
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  submitters,
  departments,
  categories,
  totalFilteredCount,
}) => {
  const handleToggleViolations = () => {
    onFilterChange({
      ...filters,
      onlyViolations: !filters.onlyViolations,
      onlyWarnings: false,
    });
  };

  const handleToggleWarnings = () => {
    onFilterChange({
      ...filters,
      onlyWarnings: !filters.onlyWarnings,
      onlyViolations: false,
    });
  };

  const handleResetFilters = () => {
    onFilterChange({
      onlyViolations: false,
      onlyWarnings: false,
      searchKeyword: '',
      submitter: '',
      department: '',
      category: '',
      article: '',
    });
  };

  const isFiltered =
    filters.onlyViolations ||
    filters.onlyWarnings ||
    filters.searchKeyword !== '' ||
    filters.submitter !== '' ||
    filters.department !== '' ||
    filters.category !== '' ||
    filters.article !== '';

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* 검색 및 빠른 토글 */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* 위반 건만 보기 토글 */}
          <button
            type="button"
            onClick={handleToggleViolations}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              filters.onlyViolations
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-200'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>위반 건만</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filters.onlyViolations ? 'bg-rose-800 text-rose-100' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {filters.onlyViolations ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* 미기재/확인 필요만 보기 토글 */}
          <button
            type="button"
            onClick={handleToggleWarnings}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              filters.onlyWarnings
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-200'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>확인 필요(미기재)만</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filters.onlyWarnings ? 'bg-amber-800 text-amber-100' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {filters.onlyWarnings ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* 통합 검색창 */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="제출자, 가맹점, 메모 검색..."
              value={filters.searchKeyword}
              onChange={(e) =>
                onFilterChange({ ...filters, searchKeyword: e.target.value })
              }
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
          </div>
        </div>

        {/* 드롭다운 필터 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 제출자 필터 */}
          {submitters.length > 0 && (
            <select
              value={filters.submitter}
              onChange={(e) =>
                onFilterChange({ ...filters, submitter: e.target.value })
              }
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">제출자: 전체</option>
              {submitters.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* 부서 필터 */}
          {departments.length > 0 && (
            <select
              value={filters.department}
              onChange={(e) =>
                onFilterChange({ ...filters, department: e.target.value })
              }
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">부서: 전체</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}

          {/* 항목 필터 */}
          {categories.length > 0 && (
            <select
              value={filters.category}
              onChange={(e) =>
                onFilterChange({ ...filters, category: e.target.value })
              }
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">항목: 전체</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* 필터 초기화 */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="필터 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화</span>
            </button>
          )}

          <div className="text-xs text-slate-400 pl-1">
            (조회: <span className="font-semibold text-slate-700">{totalFilteredCount}건</span>)
          </div>
        </div>
      </div>
    </div>
  );
};
