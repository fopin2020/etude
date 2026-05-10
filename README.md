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

### Phase 4 — 다듬기 (현재)

구현됨:

- [x] **메트로놈 Web Worker timer** — 스케줄러 tick을 dedicated worker로 이동. 탭이 백그라운드로 가도 박을 빼먹지 않음. Worker 생성이 실패하면 setInterval로 자동 폴백.
- [x] **주간 리포트** (Markdown + HTML) — 통계 페이지 우상단 "주간 리포트" 버튼
  - 기본 4섹션: 요약 / 카테고리 분배 / 곡별 시간 / 도달 BPM 변화 / 회고 노트
  - 기간 자유 설정 + 7/14/30일 빠른 선택
  - 미리보기 ↔ Markdown raw 탭 전환
  - Markdown 클립보드 복사, .md / .html 다운로드, 인쇄(브라우저로 PDF 저장 가능)
- [x] **외운 마디** — 곡 상세 페이지에서 동적 추가/삭제
  - 단일 번호(`24`), 범위(`24-32`, `24~32`), 콤마 혼용(`24, 28, 60-72`) 입력
  - 외운 마디는 자동 정렬·중복 제거 후 인접 구간으로 묶여 표시 (예: "24–32, 60–72")
  - 외운 개수 카운트, 한 번에 200마디까지 안전장치
- [x] **발표회 D-day 가중치**
  - Today 페이지에 "곧 다가오는 무대" 섹션 — 90일 이내 발표회가 있는 곡을 D-day 오름차순으로 최대 5개 표시
  - D-14 이내는 빨강, D-30 이내는 호박, 그 이상은 인디고로 시각 구분
  - 곡 상세 D-day 스탯 카드도 같은 톤으로 강조
- [x] **레퍼토리 정렬** — 최근 연습 / 누적 시간 / 발표회 임박 / 제목 가나다순 4가지
- [x] **접근성**
  - Modal: 포커스 트랩(Tab 순환), 열릴 때 첫 포커스 자동 이동, 닫힐 때 이전 포커스로 복귀, `role="dialog"`+`aria-modal`, `aria-labelledby`, Escape 닫기
  - 메트로놈 박자 비주얼라이저에 `role="img"` + 진행 상태 `aria-label`
  - 모든 인터랙티브 요소 44pt+ 터치 영역 유지
- [x] **성능 최적화**
  - 라우트 레벨 코드 스플리팅 (`React.lazy()` + Suspense). PieceDetail/Sessions/Metronome/Stats/Settings는 첫 진입 시에만 로드
  - 초기 페이지(Today + Repertoire)에서 Recharts/PieceDetail 비용 제거
  - 진입 후 필요한 chunk(통계 시 Recharts 380 KB)는 SW가 사전 캐싱 → 두 번째 진입부터는 즉시

#### 빌드 산출물 (gzip 기준)

| chunk | 사이즈 | 진입 시점 |
|-------|------:|-----------|
| index | 95 KB | 초기 (Today, Repertoire, 공통 UI) |
| dexie | 36 KB | 초기 (DB 액세스) |
| css   | 7.9 KB | 초기 |
| MetronomePage | 10 KB | /metronome 진입 시 |
| StatsPage | 8.5 KB | /stats 진입 시 |
| PieceDetailPage | 5.7 KB | /repertoire/:id 진입 시 |
| recharts | 112 KB | 차트 첫 렌더 시 |
| schedulerWorker | <1 KB | 메트로놈 시작 시 |

미구현 / 의도적 제외:

- 내장 튜너 (마이크 피치 디텍션) — 명세상 "낮은 우선순위", Phase 4에서도 보류. 별도 마이크 권한이 녹음과 충돌하기 쉬워 신중하게 결정해야 함.
- 외부 메트로놈과 동시 재생 정확도 검증은 사용자 환경에서 수행. 로지컬 정확도는 `node scripts/verify-scheduler.mjs`로 이미 검증됨 (Phase 2 참고).

### Phase 3 — 기록과 회고

구현됨:

- [x] 정성 노트 3줄 템플릿 (오늘 잘 된 것 / 안 된 것 / 내일의 시작점) — 세션 종료 화면에서 선택 입력
- [x] 노트 누적 조회 — 곡 상세 + 연습 기록 페이지에 색상별 아이콘으로 표시
- [x] 녹음 (`MediaRecorder` API, opus/webm 우선, mp4/ogg 폴백) — 곡 상세에서 직접, 활성 세션 바에서 빠르게
- [x] 녹음 보존 정책: 곡당 10개, 초과 시 가장 오래된 녹음 자동 삭제 (사용자에게 안내)
- [x] 녹음 비교 청취 — 두 트랙 동시 비교 UI (예: 한 달 전 vs 오늘)
- [x] 녹음 다운로드/삭제, 저장 공간 표시 (설정 페이지에 누적 사용량)
- [x] 365일 캘린더 히트맵 (5단계 농도)
- [x] 요일·시간대 매트릭스 (7×24, 어떤 시간에 주로 연습하는지)
- [x] 카테고리 분배 도넛 차트 (Recharts)
- [x] 곡별 누적 시간 가로 막대 랭킹 (상위 10, 클릭으로 곡 상세 진입)
- [x] 곡 상세 템포 진척도 라인 차트 (메트로놈 자동 기록값 시각화)
- [x] 방치 곡 알림 영역 (디폴트 30일, 설정에서 1–365일 조정)
- [x] 연속 기록 + 보호일 로직 — 주당 N일 보호일은 streak 끊지 않음
- [x] 오늘 페이지에 streak / 최고 streak / 보호일 사용량 표시

미구현 / 다음 페이즈:

- 마디 단위 암보 체크리스트 — Phase 4로 이동 (스키마는 준비됨)
- 발표회 D-day에 따른 곡 가중치 — Phase 4
- 주간 리포트 PDF/이미지 내보내기 — Phase 4
- 메트로놈 백그라운드 탭 안정성 (Web Worker timer) — Phase 4

### Phase 2 — 메트로놈

구현됨:

- [x] Web Audio API `AudioContext.currentTime` 기반 lookahead 스케줄러 (Chris Wilson 패턴, 25 ms tick / 100 ms ahead)
- [x] 우드블록 풍 AudioBuffer 5종을 AudioContext 초기화 시 인메모리 합성 (downbeat/beat/sub/cue/polySecondary) — 디스크 wav 의존성 없음
- [x] BPM 30–500, ±1/±5 버튼 + 슬라이더, 활성 시에도 즉시 반영
- [x] 박자표 자유 설정 (2/4·3/4·4/4·5/4·5/8·6/8·7/4·7/8·9/8·12/8 프리셋 + 임의 입력)
- [x] 시각적 박자 표시: 박당 분할 수만큼 막대, 진행 중인 박과 분할이 즉시 점등
- [x] 분할: 박당 1–9 균일 / 박별 다른 분할 (마디 안 패턴) 모두 지원
- [x] 폴리리듬 (3:4, 4:5, 5:6 등) — 좌우 채널 분리 토글
- [x] 이어폰 자동 감지: `enumerateDevices()` 라벨 검사 → 감지 시 좌우 분리 자동 ON, 미감지 시 OFF, 라벨이 비어있으면 (권한 미부여) 수동 토글 (브라우저 한계 명시)
- [x] 가속 모드 A (연속): N마디마다 +X BPM, 상한 BPM
- [x] 가속 모드 B (구간 반복): X마디 N회 반복 후 +Y BPM, 상한 BPM
- [x] 시각 신호: 가속 직전 1–2마디부터 화면 가장자리 호박색 ring
- [x] 청각 신호: 가속 마디의 마지막 박 다운비트가 차임음(B6)으로 대체
- [x] 곡 카드 → 메트로놈 연동 진입 (`/metronome?piece=ID`), 곡의 마지막 BPM 자동 로드
- [x] 정지 시 도달 BPM을 그 곡의 `tempoLog`에 자동 기록 (구간 메모 선택)
- [x] 디버그 모드(`?debug=1`)에서 정확도 측정 — 콘솔 + 모달 리포트

#### 메트로놈 정확도 검증

`node scripts/verify-scheduler.mjs` 실행 결과 (4000박, BPM 60–500):

| BPM | 기대 박간격(ms) | 박간격 표준편차(ms) | 4000박 누적 오차(ms) |
|-----|---------------:|-------------------:|---------------------:|
| 60  | 1000.000000     | 0                  | 0                    |
| 120 | 500.000000      | 0                  | 0                    |
| 240 | 250.000000      | 0                  | 0                    |
| 300 | 200.000000      | 2.6 × 10⁻¹¹        | 4.5 × 10⁻⁸           |
| 500 | 120.000000      | 2.1 × 10⁻¹²        | 1.5 × 10⁻⁸           |

평균 박간격은 기대값과 부동소수점 정밀도(약 10⁻¹²초) 이내로 일치. ±40 ms tick 지터를 인위적으로 가한 lookahead 시뮬레이션에서도 모든 BPM이 100 ms ahead 윈도우 안에 들어와 박을 빼먹지 않음 (max lag 0.534 ms). Web Audio `start(when)`은 sample-accurate(1프레임 ≈ 22.7 μs 양자화)이므로 시스템 오디오 드라이버의 일정 지연을 제외하면 본 엔진 출력은 마이크로초 단위로 일관됩니다. 인간의 박 흔들림 인지 한계(약 5–10 ms)와 비교해 5–8 자릿수 아래.

미구현 / 알려진 제약:

- **백그라운드 탭**: 브라우저가 setInterval을 1Hz로 throttle하면 100 ms lookahead로는 부족합니다. 연습 중 탭을 유지해 주세요. Phase 4에서 Web Worker 기반 timer로 보완 예정.
- **iOS Safari**: AudioContext 첫 시작은 사용자 제스처 후에만 가능합니다 — 시작 버튼이 그 역할을 합니다.
- **암보 마디 체크리스트, 템포 진척도 라인 차트**: 스키마는 준비되어 있지만 시각화는 Phase 3에서 통계 페이지와 함께 추가됩니다.

### Phase 1 — 기반 + MVP 코어

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
- ~~메트로놈 — Phase 2~~ ✓ Phase 2에서 완료
- 녹음, 캘린더 히트맵, 차트 — Phase 3
- 마디 단위 암보 체크리스트 — Phase 3 (스키마는 준비됨)
- 템포 진척도 라인 차트 — Phase 3 (Phase 2에서 데이터 적재만 시작)
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
  app/                      # 부트스트랩 효과 (테마, Wake Lock)
  components/               # 재사용 UI (Modal, Button, SideNav, 다이얼로그…)
    metronome/              # 메트로놈 전용 컴포넌트 (BPMControl, BeatVisualizer, …)
  db/                       # Dexie 데이터베이스, 쿼리 헬퍼
  lib/                      # 포맷, 내보내기/가져오기
  metronome/                # 오디오 엔진 (synth, engine, scheduler, headphone detect)
  pages/                    # 라우트별 페이지
  store/                    # Zustand 스토어 (UI 테마, 타이머, 메트로놈)
  types/                    # 핵심 도메인 타입
  index.css                 # Tailwind 4 import + 디자인 토큰
public/
  icon.svg, icon-maskable.svg
scripts/
  verify-scheduler.mjs      # 스케줄러 정확도 검증 (Node)
```
