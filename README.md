# 한결인테리어 경비 정산 검사기 (Expense Policy Auditor)

> **사내 경비 처리 규정(제5조~제9조) 실시간 클라이언트 사이드 검사 및 반려 관리 Next.js 웹 애플리케이션**

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel)](https://vercel.com/)

---

## 🌟 프로젝트 개요

'한결인테리어' 경영지원팀(회계)과 최종 결재자(대표)를 위한 **설치 없는 웹 기반 경비 정산 규정 감사 시스템**입니다.  
수백 건의 경비 내역 CSV를 업로드하는 즉시 브라우저 단에서 사내 규정(제5조~제9조)을 자동 검증하여 위반 여부와 사유를 시각화하고, 메신저 및 메일용 반려 사유 텍스트를 원클릭으로 생성합니다.

---

## 🚀 주요 기능

1. **초고속 클라이언트 사이드 검증 (Zero Persistence)**
   - 서버 DB에 금융/지출 내역을 일체 저장하지 않고, 사용자 브라우저 메모리 상에서 안전하고 즉각적으로 파싱 및 검증 수행.
2. **사내 규정 룰 엔진 (`rules.ts`)**
   - **제5조 (식대 한도):** 1인당 12,000원 초과 여부 자동 판별 (인원수 기준)
   - **제6조 (교통비/택시):** 오후 10시(22:00) 이전 퇴근 택시 및 업무 이동 사유 미기재 검출
   - **제7조 (증빙 기준):** 30,000원 이상 지출 시 간이영수증 사용 여부 차단
   - **제8조 (접대비 품의):** 300,000원 초과 거래처 접대비에 대한 사전 품의번호 누락 검출
   - **제9조 1항 (제출 기한):** 사용일로부터 30일 초과 제출 건 검출
   - **제9조 2항 (중복 제출):** 동일 지출(사용일, 가맹점, 금액 일치) 2중 제출 검출
3. **직관적인 대시보드 및 통계**
   - 전체/정상/위반 건수 및 위반 의심 금액 KPI 카드
   - 제5조~제9조 조항별 위반 현황 칩 (클릭 시 해당 조항 필터링 지원)
4. **다차원 필터링 및 검색**
   - "위반 건만 보기" 토글 스위치
   - 제출자, 부서, 지출 항목, 조항별 드롭다운 필터 및 가맹점/메모 통합 검색
5. **원클릭 반려 사유 클립보드 복사 (`RejectCopyModal.tsx`)**
   - 위반 제출자별 또는 전체 위반 내역을 슬랙/잔디/카카오톡/이메일용 템플릿으로 정형화하여 클립보드 원클릭 복사

---

## 🛠️ 기술 스택

* **Framework:** Next.js 15 (App Router)
* **Library:** React 19, TypeScript
* **Styling:** Tailwind CSS, Lucide React (Icons)
* **Parser:** PapaParse (Client-side CSV Parser)
* **Deployment:** Vercel

---

## 💻 로컬 개발 및 실행 방법

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

### 3. 프로덕션 빌드 및 실행
```bash
npm run build
npm run start
```

---

## 🌐 Vercel 배포 및 URL 공유 가이드 (Phase 4)

별도의 백엔드 데이터베이스가 필요 없는 순수 클라이언트 기반 애플리케이션이므로 **Vercel에 1분 만에 무료로 배포**할 수 있습니다.

### 방법 1: Vercel CLI로 즉시 배포
```bash
# Vercel CLI 설치 (최초 1회)
npm install -g vercel

# 프로젝트 루트에서 배포 실행
vercel
```

### 방법 2: GitHub 연동 배포 (권장)
1. 본 프로젝트를 본인의 GitHub 원격 저장소에 Push합니다.
2. [Vercel 대시보드](https://vercel.com)에 로그인 후 **"Add New Project"**를 클릭합니다.
3. 해당 GitHub 저장소를 Import합니다.
4. Framework Preset이 `Next.js`로 자동 지정된 상태에서 **"Deploy"** 버튼을 클릭합니다.
5. 배포 완료 후 발급되는 공유 URL(예: `https://expense-auditor.vercel.app`)을 사내 회계 담당자 및 대표에게 공유합니다.

---

## 📁 프로젝트 구조

```text
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 전역 레이아웃 및 폰트
│   │   ├── page.tsx           # 메인 대시보드 페이지
│   │   └── globals.css        # 전역 Tailwind 스타일
│   ├── components/
│   │   ├── Header.tsx         # 상단 헤더 및 네비게이션
│   │   ├── FileUploader.tsx   # CSV 파일 업로더 및 규정 가이드
│   │   ├── SummaryCards.tsx   # KPI 카드 및 조항별 통계 칩
│   │   ├── FilterBar.tsx      # 위반 토글, 검색 및 다중 필터
│   │   ├── ExpenseTable.tsx   # 경비 내역 테이블 및 위반 상세 아코디언
│   │   └── RejectCopyModal.tsx# 제출자별 반려 사유 복사 모달
│   ├── lib/
│   │   ├── types.ts           # TypeScript 인터페이스
│   │   ├── parser.ts          # CSV 파서 및 전처리 유틸
│   │   ├── rules.ts           # 제5조~제9조 룰 엔진 모듈
│   │   ├── auditor.ts         # 종합 감사 실행기 및 통계 집계기
│   │   └── template.ts        # 반려 사유 텍스트 생성기
│   └── sample/
│       └── sampleExpenses.ts  # 내장 테스트 CSV 데이터 (25건)
├── PRD.md                     # 제품 요구사항 정의서
├── package.json
└── tsconfig.json
```

---

## 🔒 보안 및 데이터 보호 정책

* 본 애플리케이션은 **Zero Server-Side Persistence** 아키텍처로 설계되었습니다.
* 업로드된 모든 경비 내역과 금융 정보는 사용자의 브라우저 로컬 메모리(RAM)에서만 일시적으로 파싱 및 렌더링되며, 어떠한 외부 서버나 클라우드 DB에도 전송·저장되지 않습니다.
* 브라우저 새로고침 시 모든 로컬 상태는 안전하게 초기화됩니다.
