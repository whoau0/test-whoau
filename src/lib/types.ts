export interface RawExpenseRow {
  [key: string]: string | undefined;
}

export interface ExpenseItem {
  id: number;
  submitter: string;
  department: string;
  usedDate: string;
  usedTime: string;
  category: string;
  merchant: string;
  amount: number;
  attendees: number;
  proofType: string;
  approvalNo?: string;
  submittedDate: string;
  memo: string;
  missingFields: string[]; // 비어있거나 누락된 필드 목록 (예: ['항목', '증빙', '가맹점'])
}

export type ArticleCode = '제5조' | '제6조' | '제7조' | '제8조' | '제9조_1항' | '제9조_2항' | '미기재_경고';

export interface PolicyViolation {
  article: ArticleCode;
  ruleTitle: string;
  reason: string;
  detail?: string;
  isWarning?: boolean; // 단순 미기재/확인 필요 경고 여부
}

export interface AuditedExpenseItem extends ExpenseItem {
  isViolation: boolean;
  hasWarning: boolean;
  violations: PolicyViolation[];
}

export interface AuditSummary {
  totalCount: number;
  validCount: number;
  violationCount: number;
  warningCount: number; // 추가 정보 필요 건수
  totalAmount: number;
  violationAmount: number;
  articleStats: Record<ArticleCode, number>;
  submitterViolations: Record<string, AuditedExpenseItem[]>;
}

export interface FilterOptions {
  onlyViolations: boolean;
  onlyWarnings: boolean;
  searchKeyword: string;
  submitter: string;
  department: string;
  category: string;
  article: string;
}
