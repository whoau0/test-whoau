import Papa from 'papaparse';
import { ExpenseItem, RawExpenseRow } from './types';

// 다양한 CSV 헤더 동의어 매핑 테이블
const HEADER_ALIASES: Record<string, string[]> = {
  submitter: ['제출자', '이름', '성명', '사용자', '사원명', '사원', '작성자', '성함', '담당자', 'name', 'employee'],
  department: ['부서', '부서명', '소속', '팀', '소속부서', 'department', 'dept', 'team'],
  usedDate: ['사용일', '사용일자', '일자', '날짜', '결제일', '결제일자', '지출일', '지출일자', 'date', 'used_date'],
  usedTime: ['사용시각', '시각', '시간', '결제시간', '결제시각', '지출시간', 'time', 'used_time'],
  category: ['항목', '지출항목', '계정과목', '카테고리', '구분', '비용구분', '지출구분', 'category', 'item'],
  merchant: ['가맹점', '가맹점명', '상호', '상호명', '사용처', '거래처', '사용매장', '가게명', 'merchant', 'store', 'vendor'],
  amount: ['금액', '사용금액', '지출금액', '결제금액', '총액', '비용', '합계', 'amount', 'price', 'cost', 'total'],
  attendees: ['인원', '인원수', '참석인원', '참석자', '동행인원', '인원(명)', 'attendees', 'count'],
  proofType: ['증빙', '증빙구분', '증빙종류', '영수증', '결제수단', '증빙방법', 'proof', 'proof_type'],
  approvalNo: ['품의번호', '품의', '결재번호', '사전품의', '품의문서', 'approval_no', 'approval'],
  submittedDate: ['제출일', '제출일자', '청구일', '신청일', 'submitted_date'],
  memo: ['메모', '비고', '적요', '사유', '사용목적', '내용', '상세내용', 'memo', 'note', 'description'],
};

/**
 * 행 데이터에서 동의어를 검색하여 가장 적절한 값을 추출
 */
function extractField(row: RawExpenseRow, fieldKey: string): string {
  const aliases = HEADER_ALIASES[fieldKey] || [fieldKey];
  
  for (const alias of aliases) {
    // 1. 정확한 매칭
    if (row[alias] !== undefined && row[alias] !== null && row[alias].trim() !== '') {
      return row[alias].trim();
    }
    // 2. 소문자 및 공백 제거 매칭
    const normalizedAlias = alias.toLowerCase().replace(/\s+/g, '');
    for (const key of Object.keys(row)) {
      if (key.toLowerCase().replace(/\s+/g, '') === normalizedAlias) {
        const val = row[key];
        if (val !== undefined && val !== null && val.trim() !== '') {
          return val.trim();
        }
      }
    }
  }
  return '';
}

/**
 * CSV 파싱 및 원본 데이터를 ExpenseItem[]으로 정규화
 * - 다양한 헤더 동의어 지원 ('이름' -> '제출자', '사용처' -> '가맹점' 등)
 * - 실제로 비어있는 내용만 정확히 추적하여 missingFields에 기록
 */
export function parseExpenseCsv(csvContent: string): { items: ExpenseItem[]; errors: string[] } {
  // UTF-8 BOM (\uFEFF) 제거
  const cleanContent = csvContent.replace(/^\uFEFF/, '').trim();

  const parseResult = Papa.parse<RawExpenseRow>(cleanContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim().replace(/^[\uFEFF\s]+|[\uFEFF\s]+$/g, ''),
  });

  const errors: string[] = [];
  const items: ExpenseItem[] = [];

  if (parseResult.errors && parseResult.errors.length > 0) {
    parseResult.errors.forEach((err) => {
      if (err.type !== 'FieldMismatch') {
        errors.push(`CSV 행 ${err.row}: ${err.message}`);
      }
    });
  }

  parseResult.data.forEach((row, index) => {
    try {
      const rawId = extractField(row, 'id') || (row['번호'] || '').trim();
      const id = parseInt(rawId, 10) || index + 1;

      const submitter = extractField(row, 'submitter');
      const department = extractField(row, 'department');
      const usedDate = extractField(row, 'usedDate');
      const usedTime = extractField(row, 'usedTime');
      const category = extractField(row, 'category');
      const merchant = extractField(row, 'merchant');
      const rawAmount = extractField(row, 'amount');
      const rawAttendees = extractField(row, 'attendees');
      const proofType = extractField(row, 'proofType');
      const approvalNo = extractField(row, 'approvalNo');
      const submittedDate = extractField(row, 'submittedDate');
      const memo = extractField(row, 'memo');

      // 금액 정규화: 쉼표, 원, 공백 제거 후 숫자 변환
      const cleanAmountStr = rawAmount.replace(/[^0-9.-]+/g, '').trim();
      const amount = Math.abs(parseInt(cleanAmountStr, 10) || 0);

      // 인원 정규화
      const cleanAttendeesStr = rawAttendees.replace(/[^0-9]+/g, '').trim();
      const attendees = Math.max(1, parseInt(cleanAttendeesStr, 10) || 1);

      // 완전히 비어있는 행 무시
      if (!submitter && !merchant && amount === 0 && !category && !usedDate) {
        return;
      }

      // 비어있는 중요 필드 목록 추적
      const missingFields: string[] = [];
      if (!submitter) missingFields.push('제출자');
      if (!usedDate) missingFields.push('사용일');
      if (!category) missingFields.push('지출항목');
      if (!merchant) missingFields.push('가맹점');
      if (amount === 0) missingFields.push('금액');
      if (!proofType) missingFields.push('증빙');

      items.push({
        id,
        submitter: submitter || '',
        department: department || '',
        usedDate: usedDate || '',
        usedTime: usedTime || '',
        category: category || '',
        merchant: merchant || '',
        amount,
        attendees,
        proofType: proofType || '',
        approvalNo: approvalNo || undefined,
        submittedDate: submittedDate || (usedDate ? usedDate : ''),
        memo: memo || '',
        missingFields,
      });
    } catch (e: any) {
      errors.push(`행 ${index + 1} 변환 중 오류: ${e.message}`);
    }
  });

  return { items, errors };
}
