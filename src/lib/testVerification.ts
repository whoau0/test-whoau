import { parseExpenseCsv } from './parser';
import { auditExpenses } from './auditor';
import { SAMPLE_CSV_DATA } from '../sample/sampleExpenses';

export interface TestResult {
  passed: boolean;
  totalTested: number;
  expectedViolationsCount: number;
  actualViolationsCount: number;
  details: {
    id: number;
    submitter: string;
    category: string;
    amount: number;
    expectedArticle: string;
    actualArticles: string[];
    isMatch: boolean;
  }[];
}

/**
 * PRD 제7장 기준 테스트 검증 데이터셋 자동 검증기
 */
export function runAuditVerification(): TestResult {
  const { items } = parseExpenseCsv(SAMPLE_CSV_DATA);
  const { auditedItems, summary } = auditExpenses(items);

  // PRD 제7장에 명시된 기대 위반 목록 매핑
  const expectedViolationsMap: Record<number, string> = {
    2: '제5조',
    4: '제6조',
    6: '제7조',
    7: '제8조',
    14: '제5조',
    15: '제9조_1항',
    17: '제6조',
    18: '제7조',
    25: '제9조_2항',
  };

  const expectedIds = Object.keys(expectedViolationsMap).map((id) => parseInt(id, 10));
  const details = auditedItems
    .filter((item) => item.isViolation || expectedIds.includes(item.id))
    .map((item) => {
      const expectedArticle = expectedViolationsMap[item.id] || '없음';
      const actualArticles = item.violations.map((v) => v.article);
      const isMatch =
        expectedArticle !== '없음'
          ? actualArticles.includes(expectedArticle as any)
          : actualArticles.length === 0;

      return {
        id: item.id,
        submitter: item.submitter,
        category: item.category,
        amount: item.amount,
        expectedArticle,
        actualArticles,
        isMatch,
      };
    });

  const allMatched =
    summary.violationCount === 9 && details.every((d) => d.isMatch);

  return {
    passed: allMatched,
    totalTested: items.length,
    expectedViolationsCount: 9,
    actualViolationsCount: summary.violationCount,
    details,
  };
}
