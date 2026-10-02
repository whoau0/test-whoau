import {
  ExpenseItem,
  AuditedExpenseItem,
  PolicyViolation,
  AuditSummary,
  ArticleCode,
} from './types';
import {
  checkArticle5,
  checkArticle6,
  checkArticle7,
  checkArticle8,
  checkArticle9_1,
  checkMissingInfo,
  getDuplicateMap,
} from './rules';

/**
 * 전체 경비 항목에 대해 룰 엔진 검증 실행 및 요약 통계 산출
 */
export function auditExpenses(items: ExpenseItem[]): {
  auditedItems: AuditedExpenseItem[];
  summary: AuditSummary;
} {
  const duplicateMap = getDuplicateMap(items);

  const auditedItems: AuditedExpenseItem[] = items.map((item) => {
    const violations: PolicyViolation[] = [];

    // 0. 필수 정보 미기재 검사
    const vMissing = checkMissingInfo(item);
    if (vMissing) violations.push(vMissing);

    // 1. 제5조 식대 검사
    const v5 = checkArticle5(item);
    if (v5) violations.push(v5);

    // 2. 제6조 교통비/택시 검사
    const v6 = checkArticle6(item);
    if (v6) violations.push(v6);

    // 3. 제7조 증빙 검사
    const v7 = checkArticle7(item);
    if (v7) violations.push(v7);

    // 4. 제8조 접대비 사전품의 검사
    const v8 = checkArticle8(item);
    if (v8) violations.push(v8);

    // 5. 제9조 1항 제출 기한 검사
    const v9_1 = checkArticle9_1(item);
    if (v9_1) violations.push(v9_1);

    // 6. 제9조 2항 중복 제출 검사
    if (item.usedDate && item.merchant && item.amount > 0) {
      const key = `${item.usedDate}___${item.merchant}___${item.amount}`;
      const duplicateIds = duplicateMap.get(key) || [];
      if (duplicateIds.length > 1) {
        const otherIds = duplicateIds.filter((id) => id !== item.id);
        violations.push({
          article: '제9조_2항',
          ruleTitle: '중복 제출 의심',
          reason: `동일 지출 건(사용일·가맹점·금액 일치) 중복 제출 (#${otherIds.join(', #')}번 건과 동일)`,
          detail: `사용일: ${item.usedDate}, 가맹점: ${item.merchant}, 금액: ${item.amount.toLocaleString()}원`,
        });
      }
    }

    const actualViolations = violations.filter((v) => !v.isWarning);
    const warnings = violations.filter((v) => v.isWarning);

    return {
      ...item,
      isViolation: actualViolations.length > 0,
      hasWarning: warnings.length > 0,
      violations,
    };
  });

  // 요약 통계 계산
  const articleStats: Record<ArticleCode, number> = {
    제5조: 0,
    제6조: 0,
    제7조: 0,
    제8조: 0,
    제9조_1항: 0,
    제9조_2항: 0,
    미기재_경고: 0,
  };

  const submitterViolations: Record<string, AuditedExpenseItem[]> = {};
  let violationAmount = 0;
  let violationCount = 0;
  let warningCount = 0;
  let totalAmount = 0;

  auditedItems.forEach((item) => {
    totalAmount += item.amount;
    const submitterKey = item.submitter || '제출자 미기재';

    if (item.isViolation) {
      violationCount++;
      violationAmount += item.amount;
    }

    if (item.hasWarning) {
      warningCount++;
    }

    if (item.isViolation || item.hasWarning) {
      if (!submitterViolations[submitterKey]) {
        submitterViolations[submitterKey] = [];
      }
      submitterViolations[submitterKey].push(item);

      // 조항별 발생 건수 집계
      item.violations.forEach((v) => {
        if (articleStats[v.article] !== undefined) {
          articleStats[v.article]++;
        }
      });
    }
  });

  const validCount = auditedItems.filter((item) => !item.isViolation && !item.hasWarning).length;

  const summary: AuditSummary = {
    totalCount: auditedItems.length,
    validCount,
    violationCount,
    warningCount,
    totalAmount,
    violationAmount,
    articleStats,
    submitterViolations,
  };

  return { auditedItems, summary };
}
