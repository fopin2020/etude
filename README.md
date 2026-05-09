# Étude — 피아노 연습 기록

피아니스트를 위한 연습 기록 + 레퍼토리 + 정밀 메트로놈 PWA. 100% 클라이언트 사이드, 오프라인 동작.

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`. 태블릿에서는 가로 모드 권장. 빌드 후 PWA로 "홈 화면에 추가" 가능.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 타입 체크 + 프로덕션 빌드
- `npm run preview` — 프로덕션 번들 미리보기
- `npm run typecheck` — 타입 체크만

## 기술 스택

- Vite 6 + React 19 + TypeScript
- Tailwind 4 (CSS-first config) + 다크 모드(class strategy)
- Dexie 4 (IndexedDB) + dexie-react-hooks (useLiveQuery)
- React Router 7
- Zustand (테마, 활성 타이머 상태)
- vite-plugin-pwa (Workbox 기반 SW, 오프라인 캐싱)
- date-fns + ko locale
- recharts, lucide-react, uuid

## 진행 상황

### Phase 1 — 기반 + MVP 코어 (현재)

구현됨:

- [x] Vite + React + TS + Tailwind 4 셋업
- [x] PWA 매니페스트, SVG 아이콘(any/maskable), Service Worker
- [x] Dexie 스키마 v1 — `pieces`, `sessions`, `recordings`, `goals`, `metronomePresets`
- [x] 라우팅 + 태블릿 가로 사이드내브 레이아웃 + 모바일 상단바
- [x] 다크 모드 (라이트/다크/시스템) — Zustand + localStorage 영속
- [x] 연습 타이머 — 카테고리(테크닉/에튀드/레퍼토리/이론), 곡 연동, 일시정지/재개, 활성 세션 바 전역 표시
- [x] 화면 꺼짐 방지 (Wake Lock API)
- [x] 레퍼토리 CRUD — 3단계 상태(1=익히는 중, 2=다듬는 중/무대 준비, 3=유지)
- [x] 곡별 누적 연습 시간 자동 집계
- [x] 발표회 D-day 카운트다운 표시
- [x] 일/주/월 목표 시간, 일일 진행 바
- [x] JSON 내보내기/가져오기 (병합 또는 전체 교체)

미구현 / 다음 페이즈:

- 정성 노트 3줄 템플릿 — Phase 3
- 메트로놈 — Phase 2
- 녹음, 캘린더 히트맵, 차트 — Phase 3
- 마디 단위 암보 체크리스트 — Phase 2/3 (스키마는 준비됨)
- 템포 진척도 라인 차트 — 메트로놈과 함께 Phase 2
- 방치 곡 알림 영역, streak/보호일 로직 — Phase 3

### 알려진 이슈 / 제약

- **녹음 가져오기/내보내기**: 녹음은 base64로 직렬화하므로 큰 파일을 가지면 JSON 백업이 비대해질 수 있습니다. Phase 3에서 녹음을 별도 zip으로 분리하는 옵션을 검토합니다.
- **PWA 아이콘**: 현재 SVG 단일 파일을 192/512에 모두 사용합니다. iOS의 일부 환경에서 PNG 대체본이 필요할 수 있어 Phase 4에서 PNG 추가 예정.
- **데이터 마이그레이션**: 스키마 v1만 존재. 다음 버전부터 Dexie `version().upgrade()` 추가.
- **lucide-react** 버전은 `book-tracker`와 동일하게 맞춤. 일부 아이콘 props 시그니처가 v0.x와 다를 수 있음.

## 데이터 주권

모든 데이터(곡, 세션, 목표, 녹음, 메트로놈 프리셋)는 브라우저 IndexedDB에 저장됩니다. 외부 서버로 전송되지 않습니다. 정기적으로 **설정 → JSON 내보내기**로 백업하세요.

## 디렉터리 구조

```
src/
  app/            # 부트스트랩 효과 (테마, Wake Lock)
  components/     # 재사용 UI (Modal, Button, SideNav, 다이얼로그…)
  db/             # Dexie 데이터베이스, 쿼리 헬퍼
  lib/            # 포맷, 내보내기/가져오기
  pages/          # 라우트별 페이지 (Today, Repertoire, …)
  store/          # Zustand 스토어 (UI 테마, 타이머)
  types/          # 핵심 도메인 타입
  index.css       # Tailwind 4 import + 디자인 토큰
public/
  icon.svg, icon-maskable.svg
```
