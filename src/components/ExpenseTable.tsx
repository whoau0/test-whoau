'use client';

import React, { useState } from 'react';
import { AuditedExpenseItem, PolicyViolation } from '../lib/types';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Info,
} from 'lucide-react';

interface ExpenseTableProps {
  items: AuditedExpenseItem[];
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ items }) => {
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
        <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h4 className="text-base font-semibold text-slate-700">해당 조건에 맞는 데이터가 없습니다.</h4>
        <p className="text-xs text-slate-400 mt-1">필터 조건을 변경하거나 초기화해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 text-center w-12">No</th>
              <th className="py-3 px-3">상태</th>
              <th className="py-3 px-3">제출자</th>
              <th className="py-3 px-3">부서</th>
              <th className="py-3 px-3">사용일시</th>
              <th className="py-3 px-3">항목</th>
              <th className="py-3 px-3">가맹점</th>
              <th className="py-3 px-3 text-right">금액</th>
              <th className="py-3 px-3 text-center">인원</th>
              <th className="py-3 px-3">증빙</th>
              <th className="py-3 px-3">품의번호</th>
              <th className="py-3 px-3">메모</th>
              <th className="py-3 px-3 text-center w-10">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isExpanded = expandedRowId === item.id;
              const hasViolation = item.isViolation;
              const hasWarning = item.hasWarning && !hasViolation;

              return (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => toggleRow(item.id)}
                    className={`transition-colors cursor-pointer ${
                      hasViolation
                        ? isExpanded
                          ? 'bg-rose-100/60 font-medium'
                          : 'bg-rose-50/50 hover:bg-rose-100/40 text-slate-900'
                        : hasWarning
                        ? isExpanded
                          ? 'bg-amber-100/60 font-medium'
                          : 'bg-amber-50/40 hover:bg-amber-100/30 text-slate-900'
                        : isExpanded
                        ? 'bg-slate-100/70'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {/* 번호 */}
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {item.id}
                    </td>

                    {/* 상태 및 위반/경고 뱃지 */}
                    <td className="py-3 px-3">
                      {hasViolation ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-600 text-white shadow-xs">
                            <AlertCircle className="w-3 h-3" />
                            위반
                          </span>
                          {item.violations
                            .filter((v) => !v.isWarning)
                            .map((v, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300"
                                title={v.reason}
                              >
                                {v.article.replace('_', ' ')}
                              </span>
                            ))}
                        </div>
                      ) : hasWarning ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                            <AlertTriangle className="w-3 h-3" />
                            확인 필요
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            미기재
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          정상
                        </span>
                      )}
                    </td>

                    {/* 제출자 */}
                    <td className="py-3 px-3 font-semibold">
                      {item.submitter ? (
                        <span className="text-slate-800">{item.submitter}</span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                          (미기재)
                        </span>
                      )}
                    </td>

                    {/* 부서 */}
                    <td className="py-3 px-3 text-slate-500">
                      {item.department ? item.department : <span className="text-slate-300">-</span>}
                    </td>

                    {/* 사용일시 */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.usedDate ? (
                        <>
                          <span className="text-slate-800">{item.usedDate}</span>{' '}
                          {item.usedTime && (
                            <span className="text-slate-400 font-mono text-[11px]">
                              {item.usedTime}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-amber-600 text-[11px] bg-amber-50 px-1 rounded">(미기재)</span>
                      )}
                    </td>

                    {/* 항목 */}
                    <td className="py-3 px-3">
                      {item.category ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-100/70 border border-amber-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          항목 미기재
                        </span>
                      )}
                    </td>

                    {/* 가맹점 */}
                    <td className="py-3 px-3 font-medium max-w-[150px] truncate" title={item.merchant}>
                      {item.merchant ? (
                        <span className="text-slate-900">{item.merchant}</span>
                      ) : (
                        <span className="text-amber-700 bg-amber-100/70 border border-amber-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          가맹점 미기재
                        </span>
                      )}
                    </td>

                    {/* 금액 */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {item.amount > 0 ? (
                        `${item.amount.toLocaleString()}원`
                      ) : (
                        <span className="text-rose-500 text-[11px]">0원 (미기재)</span>
                      )}
                    </td>

                    {/* 인원 */}
                    <td className="py-3 px-3 text-center text-slate-600">
                      {item.attendees}명
                    </td>

                    {/* 증빙 */}
                    <td className="py-3 px-3 text-slate-600">
                      {item.proofType ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            item.proofType === '간이영수증'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200 font-medium'
                              : 'text-slate-600'
                          }`}
                        >
                          {item.proofType}
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-100/70 border border-amber-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          증빙 미기재
                        </span>
                      )}
                    </td>

                    {/* 품의번호 */}
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {item.approvalNo ? (
                        <span className="text-emerald-700 font-medium bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                          {item.approvalNo}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* 메모 */}
                    <td className="py-3 px-3 text-slate-500 max-w-[150px] truncate" title={item.memo}>
                      {item.memo || <span className="text-slate-300">-</span>}
                    </td>

                    {/* 토글 화살표 */}
                    <td className="py-3 px-3 text-center text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 mx-auto" />
                      ) : (
                        <ChevronDown className="w-4 h-4 mx-auto" />
                      )}
                    </td>
                  </tr>

                  {/* 위반 및 미기재 상세 펼침 영역 */}
                  {isExpanded && (
                    <tr
                      className={
                        hasViolation
                          ? 'bg-rose-50/70 border-b border-rose-200'
                          : hasWarning
                          ? 'bg-amber-50/70 border-b border-amber-200'
                          : 'bg-slate-50/60 border-b border-slate-200'
                      }
                    >
                      <td colSpan={13} className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Info className="w-4 h-4 text-indigo-600" />
                            <span>상세 정보 및 규정 검증 결과 (No. {item.id})</span>
                          </div>

                          {/* 경고 및 위반 목록 */}
                          {item.violations.length > 0 ? (
                            <div className="space-y-2 pt-1">
                              {item.violations.map((violation: PolicyViolation, idx: number) => (
                                <div
                                  key={idx}
                                  className={`p-3 bg-white border rounded-lg shadow-xs flex items-start gap-3 ${
                                    violation.isWarning
                                      ? 'border-amber-300 bg-amber-50/30'
                                      : 'border-rose-200'
                                  }`}
                                >
                                  <span
                                    className={`px-2 py-0.5 rounded font-bold text-xs shrink-0 ${
                                      violation.isWarning
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-rose-600 text-white'
                                    }`}
                                  >
                                    {violation.isWarning
                                      ? '추가 정보 필요'
                                      : `${violation.article.replace('_', ' ')}: ${violation.ruleTitle}`}
                                  </span>
                                  <div className="space-y-0.5">
                                    <p
                                      className={`text-xs font-semibold ${
                                        violation.isWarning ? 'text-amber-900' : 'text-rose-900'
                                      }`}
                                    >
                                      {violation.reason}
                                    </p>
                                    {violation.detail && (
                                      <p className="text-[11px] text-slate-500">
                                        {violation.detail}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>사내 경비 처리 규정을 모두 충족하는 정상 지출 건입니다.</span>
                            </div>
                          )}

                          {/* 입력 데이터 현황 바 */}
                          <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                            <span>
                              제출자:{' '}
                              <b className={item.submitter ? 'text-slate-700' : 'text-amber-600'}>
                                {item.submitter || '(미기재)'}
                              </b>
                            </span>
                            <span>
                              사용일:{' '}
                              <b className={item.usedDate ? 'text-slate-700' : 'text-amber-600'}>
                                {item.usedDate || '(미기재)'}
                              </b>
                            </span>
                            <span>
                              지출금액:{' '}
                              <b className="text-slate-700">{item.amount.toLocaleString()}원</b>
                            </span>
                            <span>
                              1인당 환산:{' '}
                              <b className="text-slate-700">
                                {(Math.floor(item.amount / item.attendees)).toLocaleString()}원
                              </b>
                            </span>
                            {item.missingFields.length > 0 && (
                              <span className="text-amber-700 font-medium">
                                ⚠️ 누락된 정보: <b>{item.missingFields.join(', ')}</b>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
