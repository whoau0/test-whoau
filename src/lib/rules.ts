import { ExpenseItem, PolicyViolation } from './types';

/**
 * 날짜 문자열(YYYY-MM-DD) 사이의 일수 차이 계산 (제출일 - 사용일)
 */
export function getDaysDifference(usedDateStr: string, submittedDateStr: string): number {
  if (!usedDateStr || !submittedDateStr) return 0;
  try {
    const used = new Date(usedDateStr);
    const submitted = new Date(submittedDateStr);
    const diffTime = submitted.getTime() - used.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * 시각 문자열(HH:mm)이 특정 기준 시각(기본 22:00) 이후인지 확인
 */
export function isAfterOrEqualTime(timeStr: string, targetTimeStr: string = '22:00'): boolean {
  if (!timeStr) return false;
  const cleanTime = timeStr.trim();
  return cleanTime >= targetTimeStr;
}

/**
 * 필수 필드 누락 검사 (추가 내용 필요 경고)
 */
export function checkMissingInfo(item: ExpenseItem): PolicyViolation | null {
  const missingItems: string[] = [];
  if (!item.category) missingItems.push('항목');
  if (!item.merchant) missingItems.push('가맹점');
  if (!item.proofType) missingItems.push('증빙');

  if (missingItems.length > 0) {
    return {
      article: '미기재_경고',
      ruleTitle: '필수 정보 미기재',
      reason: `규정 검토를 위한 필수 정보(${missingItems.join(', ')})가 미기재되어 추가 확인이 필요합니다.`,
      detail: `누락 항목: ${missingItems.join(', ')}`,
      isWarning: true,
    };
  }
  return null;
}

/**
 * 제5조 (식대 한도) 검증
 * - 1인당 1회 12,000원 한도
 */
export function checkArticle5(item: ExpenseItem): PolicyViolation | null {
  if (item.category !== '식대') return null;

  const attendees = Math.max(1, item.attendees);
  const perPersonAmount = Math.floor(item.amount / attendees);

  if (perPersonAmount > 12000) {
    return {
      article: '제5조',
      ruleTitle: '식대 한도 초과',
      reason: `1인당 식대 한도(12,000원) 초과 (1인당 ${perPersonAmount.toLocaleString()}원)`,
      detail: `총 금액: ${item.amount.toLocaleString()}원 / 인원: ${attendees}명`,
    };
  }
  return null;
}

/**
 * 제6조 (교통비/택시) 검증
 * - 22:00 이후 퇴근 또는 업무상 외부 이동(메모 기재)만 인정
 * - 22:00 이전 퇴근 택시비는 불인정
 */
export function checkArticle6(item: ExpenseItem): PolicyViolation | null {
  if (item.category !== '택시') return null;

  const isNightTime = isAfterOrEqualTime(item.usedTime, '22:00');
  const memo = item.memo.toLowerCase().trim();

  // 업무상 이동 키워드
  const isBusinessTravel =
    memo.includes('고객사') ||
    memo.includes('현장') ||
    memo.includes('미팅') ||
    memo.includes('출장') ||
    memo.includes('업무') ||
    memo.includes('방문');

  // 퇴근 키워드
  const isCommuteHome = memo.includes('퇴근');

  if (isNightTime) {
    return null;
  }

  if (isBusinessTravel) {
    return null;
  }

  if (isCommuteHome || memo === '' || !isBusinessTravel) {
    return {
      article: '제6조',
      ruleTitle: '택시비 인정 기준 위반',
      reason: `오후 10시(22:00) 이전 퇴근 택시 이용 불인정 (사용시각: ${item.usedTime || '미기재'})`,
      detail: memo ? `메모: "${item.memo}"` : '업무 이동 사유 미기재',
    };
  }

  return null;
}

/**
 * 제7조 (증빙 기준) 검증
 * - 30,000원 이상 지출은 적격증빙 필수 (간이영수증은 30,000원 미만만 가능)
 */
export function checkArticle7(item: ExpenseItem): PolicyViolation | null {
  if (item.proofType === '간이영수증' && item.amount >= 30000) {
    return {
      article: '제7조',
      ruleTitle: '증빙 기준 위반',
      reason: `30,000원 이상 지출에 대한 간이영수증 사용 불가 (적격증빙 필요)`,
      detail: `지출액: ${item.amount.toLocaleString()}원 (한도: 30,000원 미만)`,
    };
  }
  return null;
}

/**
 * 제8조 (접대비 품의) 검증
 * - 거래처 접대비 300,000원 초과 시 사전 품의번호 필수
 */
export function checkArticle8(item: ExpenseItem): PolicyViolation | null {
  if (item.category === '접대비' && item.amount > 300000) {
    if (!item.approvalNo || item.approvalNo.trim() === '') {
      return {
        article: '제8조',
        ruleTitle: '접대비 사전 품의 누락',
        reason: `300,000원 초과 접대비에 대한 사전 품의번호 누락`,
        detail: `지출액: ${item.amount.toLocaleString()}원 (사전 품의 필수)`,
      };
    }
  }
  return null;
}

/**
 * 제9조 1항 (제출 기한) 검증
 * - 사용일로부터 30일 이내 제출
 */
export function checkArticle9_1(item: ExpenseItem): PolicyViolation | null {
  if (!item.usedDate || !item.submittedDate) return null;
  const days = getDaysDifference(item.usedDate, item.submittedDate);
  if (days > 30) {
    return {
      article: '제9조_1항',
      ruleTitle: '제출 기한 초과',
      reason: `사용일로부터 30일 초과 제출 (${days}일 경과)`,
      detail: `사용일: ${item.usedDate} / 제출일: ${item.submittedDate}`,
    };
  }
  return null;
}

/**
 * 제9조 2항 (중복 제출) 검증 맵 생성 유틸
 */
export function getDuplicateMap(items: ExpenseItem[]): Map<string, number[]> {
  const map = new Map<string, number[]>();

  items.forEach((item) => {
    // 사용일과 가맹점, 금액이 모두 유효한 경우만 중복 매칭
    if (item.usedDate && item.merchant && item.amount > 0) {
      const key = `${item.usedDate}___${item.merchant}___${item.amount}`;
      const existing = map.get(key) || [];
      existing.push(item.id);
      map.set(key, existing);
    }
  });

  return map;
}
