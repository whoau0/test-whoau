import { AuditedExpenseItem } from './types';

/**
 * 특정 제출자에 대한 정형화된 반려/보완 사유 메시지 생성
 */
export function generateSubmitterRejectText(
  submitter: string,
  items: AuditedExpenseItem[]
): string {
  const targetItems = items.filter((item) => item.isViolation || item.hasWarning);
  if (targetItems.length === 0) return '';

  const displayName = submitter && submitter !== '제출자 미기재' ? `${submitter}님` : '담당자님';

  const lines: string[] = [
    `[경비 정산 반려 및 보완 요청 안내 - ${displayName}]`,
    `제출해주신 경비 정산 내역 중 규정 위반 또는 필수 정보 미기재 건이 확인되어 안내드립니다.\n`,
  ];

  targetItems.forEach((item) => {
    const merchantText = item.merchant || '(가맹점 미기재)';
    const categoryText = item.category || '(항목 미기재)';
    const usedDateText = item.usedDate || '(사용일 미기재)';

    lines.push(`• [${usedDateText}] ${merchantText} (${item.amount.toLocaleString()}원) - 항목: ${categoryText}`);
    
    item.violations.forEach((v) => {
      const tag = v.isWarning ? '[보완 필요]' : `[${v.article.replace('_', ' ')} 위반]`;
      lines.push(`  - ${tag} ${v.reason}`);
    });
  });

  lines.push(`\n내용 확인 후 수정 및 보완하여 재제출 부탁드립니다.`);
  lines.push(`(문의: 경영지원팀 회계담당)`);

  return lines.join('\n');
}

/**
 * 모든 위반/미기재 제출자의 반려 사유를 한 번에 묶어서 생성
 */
export function generateAllRejectText(
  submitterViolations: Record<string, AuditedExpenseItem[]>
): string {
  const submitters = Object.keys(submitterViolations);
  if (submitters.length === 0) {
    return '규정 위반 및 보완 필요 건이 없습니다.';
  }

  return submitters
    .map((submitter) =>
      generateSubmitterRejectText(submitter, submitterViolations[submitter])
    )
    .join('\n\n========================================\n\n');
}
