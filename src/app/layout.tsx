import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '한결인테리어 경비 정산 검사기 | Expense Policy Auditor',
  description: 'Next.js 기반 클라이언트 사이드 사내 경비 규정(제5조~제9조) 실시간 검사 및 반려 관리 도구',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
