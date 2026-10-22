# 안심ON — 졸업전시용 모바일 PWA 프로토타입

요양병원 보호자 서비스 **안심ON**의 16개 시안을 실제로 작동하는 iPhone 홈 화면 앱(PWA)으로 옮긴 프로젝트입니다.

- React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · React Router 7 · vite-plugin-pwa
- 백엔드 없음. 모든 데이터는 `src/data/mock.ts` 의 시연용 데이터
- 화면 이동 후에도 날짜·필터·채팅이 유지되고(LocalStorage), 첫 접속 이후에는 오프라인에서도 동작

---

## 폴더 구조

```
ansim-on/
├─ index.html                 iOS 홈 화면 앱 설정(meta), Pretendard 폰트
├─ vite.config.ts             PWA(Manifest · Service Worker · 오프라인 캐싱) 설정
├─ vercel.json                하위 경로 새로고침 대응(SPA rewrite)
├─ public/
│  ├─ icons/                  앱 아이콘 (180 · 192 · 512 · maskable)
│  └─ images/                 character.png(기록 캐릭터), room.jpg · room-ceiling.jpg(함께ON 병실)
└─ src/
   ├─ data/mock.ts            ★ 화면 문구·데이터는 여기서만 고치면 됩니다
   ├─ data/mockResponder.ts   문의하기 자동 응답(시연용, 실제 의료진 연결 없음)
   ├─ styles/index.css        ★ 디자인 토큰(색·글꼴) + 화면별 스타일 (IMAGE 번호로 구역 표시)
   ├─ components/             탭바, 상단 헤더, 바텀시트, 아이콘, 칩·배지
   └─ pages/                  화면별 파일
```

| 시안 | 경로 | 파일 |
|---|---|---|
| IMAGE 01 · 02 홈 (오늘의 돌봄 / 확인할 내용) | `/` | `pages/Home.tsx` |
| IMAGE 03 · 04 기록 (카드 덱 · 좌우 날짜 넘김 · 월 선택) | `/record` | `pages/Record.tsx`, `data/careDays.ts` |
| IMAGE 05 돌봄 타임라인 (홈 오늘의 돌봄 카드 → 오늘 · 기록 카드 흐름 버튼 → 카드가 위로 펼쳐지며 그 날짜) | `/record/timeline/:date` | `pages/CareTimeline.tsx` |
| IMAGE 06 문의 메인 | `/inquiry` | `pages/Inquiry.tsx` |
| IMAGE 07 · 08 · 09 문의하기(추천 질문 · 채팅) | `/inquiry/new` | `pages/InquiryChat.tsx` |
| IMAGE 10 · 12 · 14 문의 타임라인 | `/inquiry/timeline/:id` | `pages/InquiryTimeline.tsx` |
| IMAGE 11 진행중인 문의 | `/inquiry/ongoing` | `pages/InquiryOngoing.tsx` |
| IMAGE 13 지난 문의 기록 | `/inquiry/history` | `pages/InquiryHistory.tsx` |
| IMAGE 15 · 16 함께ON (스크롤 시 병실 접힘) | `/together` | `pages/Together.tsx` |

---

## 1. 내 컴퓨터에서 실행하기

[Node.js](https://nodejs.org) 20 이상(LTS)을 설치한 뒤, 이 폴더에서 터미널을 열고:

```bash
npm install        # 처음 한 번
npm run dev        # 개발 서버 → 터미널에 나오는 http://localhost:5173 열기
```

- 같은 Wi-Fi의 휴대폰에서 보려면 터미널에 함께 나오는 `Network: http://192.168.x.x:5173` 주소를 Safari로 엽니다.
  (홈 화면 앱 설치·오프라인 기능은 HTTPS가 필요하므로 아래 Vercel 배포 주소에서 확인하세요.)
- 배포용 결과물 확인: `npm run build` → `npm run preview`

> 학교·회사 네트워크에서 `npm install` 이 막혀 있어도 괜찮습니다. 아래 2번처럼 GitHub에 올리면 Vercel이 클라우드에서 대신 설치·빌드합니다.

## 2. Vercel로 배포하기

**방법 A — GitHub 연동 (추천)**
1. GitHub에서 새 저장소를 만들고 이 폴더 전체를 업로드합니다. (`node_modules`, `dist` 폴더는 올리지 않아도 됩니다)
2. [vercel.com](https://vercel.com) → GitHub 계정으로 로그인 → **Add New… → Project**
3. 방금 만든 저장소를 **Import** → Framework Preset이 **Vite** 로 잡혀 있는지 확인 → **Deploy**
4. 1분 정도 뒤 `https://프로젝트명.vercel.app` 주소가 생깁니다. 이후 GitHub에 수정본을 올리면 자동으로 다시 배포됩니다.

**방법 B — 명령어**
```bash
npm i -g vercel
vercel          # 처음 배포(질문에 엔터)
vercel --prod   # 정식 주소로 배포
```

`vercel.json` 에 하위 경로 설정이 들어 있어 `/inquiry/history` 같은 주소로 바로 들어가거나 새로고침해도 오류가 나지 않습니다.

## 3. 아이폰 Safari에서 열기
배포 주소(`https://….vercel.app`)를 **Safari** 로 엽니다. (Chrome·카카오톡 내 브라우저에서는 홈 화면 앱 설치가 되지 않습니다. 카카오톡으로 링크를 받았다면 우측 하단 메뉴 → "Safari로 열기")

## 4. 홈 화면에 추가하기
1. Safari 하단의 **공유 버튼(□↑)** 을 누릅니다.
2. 목록을 내려 **홈 화면에 추가** 를 누릅니다.
3. 이름이 **안심ON** 으로 되어 있는지 확인하고 **추가**.

## 5. 앱처럼 실행하기
홈 화면의 파란 **안심ON** 아이콘을 누르면 주소창 없이 전체 화면으로 홈 화면(IMAGE 01)이 바로 열립니다.
한 번 실행한 뒤에는 전시장 Wi-Fi가 끊겨도 모든 화면이 동작합니다.

## 6. 전시용 QR코드 만들기
1. 배포 주소를 복사합니다. (예: `https://ansim-on.vercel.app`)
2. QR 생성 사이트(예: [qr-code-generator.com](https://www.qr-code-generator.com), 네이버 QR코드)에 붙여넣어 PNG/SVG로 저장합니다.
   피그마에서 바로 만들려면 "QR Code" 플러그인을 쓰면 됩니다.
3. 인쇄용은 **최소 3×3cm**, 흰 여백을 충분히 두면 잘 인식됩니다. 관람객 안내 문구 예시:
   "카메라로 QR을 찍고 → Safari 공유 버튼 → 홈 화면에 추가"

---

## 전시 운영 팁

- **데모 초기화** (다음 관람객용): 주소창에 `/reset` 을 붙여 접속하거나(예: `https://ansim-on.vercel.app/reset`), 홈 화면 왼쪽 위 **안심ON 로고를 2초간 누르면** 초기화 확인창이 나옵니다. 채팅·날짜·필터가 모두 처음 상태로 돌아갑니다.
- **넘겨볼 수 있는 범위**: 6일 전 → 오늘 → 내일(아직 기록 전 카드). 양 끝 카드에서는 화살표가 비활성화되고, 더 끌면 살짝 밀렸다 돌아옵니다.
- **기록 화면 날짜**: 기록 탭에 들어올 때마다 기기의 실제 오늘 카드부터 보여줍니다. 타임라인에 갔다 돌아오면 보던 날짜가 유지됩니다.
- **상태바 색**: 홈은 파란색, 함께ON은 병실 천장색, 기록은 파란색, 나머지는 흰색으로 자동 변경됩니다(`src/lib/statusBar.ts`).

## 기록 화면

파란 바탕 위 가운데 흰 카드(양옆에 회색 카드가 살짝 비침)가 하루 한 장씩 넘어가는 카드 덱입니다. 오브제 · 펼침 모션은 첨부 HTML(records.js)의 것을 쓰고, 넘김은 참고 사이트(Reading-Preference-Test #/records)의 스위블(커버플로) 코드를 그대로 옮겼으며, 모양은 최신 시안 수치(`src/styles/index.css` 맨 아래 '기록 카드 — 최신 시안')로 맞췄습니다.
- **좌우로 밀기 / 화살표**: 전날·다음 날 카드가 메인 카드 뒤 양옆에 회색으로 살짝 비쳐 있다가, 밀면 메인 카드가 손가락을 따라 옆으로 비켜 돌아가며 뒤로 물러나고 옆 카드가 회색 막이 걷히며 앞으로 돌아 나옵니다. 넘어가는 도중에는 두 카드가 조금 더 벌어져 겹친 순서가 뒤바뀌지 않습니다. 카드 폭의 22% 이상 끌거나 빠르게 튕기면 넘어갑니다(420ms). (각도 · 깊이: `src/styles/index.css` 의 `--rc-turn` · `--rc-depth` · `--rc-dip`)
- **상태 오브제(말풍선 캐릭터)**: 그날 기록에 따라 색조 · 표정 · 떠 있는 움직임이 달라지고, 손가락(마우스) 쪽을 바라봅니다. 변화가 있는 날(예시: 2일 전)은 평소 모습 그대로 오른쪽 위에 주황 점이 붙고, 해당 값('변화있음')만 주황색으로 표시됩니다.
- **날짜 선택**: 위쪽 '2026년 10월 ⌄'를 누르면 아래에서 달력 시트가 올라옵니다. 날짜를 고르면 그 날짜 카드로 넘어가고, 내일 이후는 고를 수 없으며, 기록이 남아 있지 않은 날은 안내 문구가 뜹니다.
- **'오늘의 돌봄 흐름 살펴보기'**: 카드가 화면 전체로 넓어지면서 위로 올라가고, 바로 아래에 이어져 있던 돌봄 타임라인이 올라와 화면을 채웁니다(기록 화면 안에서 열림). 뒤로가기를 누르거나 목록 맨 위에서 아래로 당기면 같은 모션을 거꾸로 하며 카드로 돌아갑니다.
- 날짜별 기록 · 문구는 `src/data/careDays.ts` 에서 고치면 됩니다. 홈 '오늘의 돌봄' 카드 아래 요약 줄도 같은 데이터(오늘 타임라인)에서 계산됩니다.

## 디자인 수정 방법

- 색 · 글꼴: `src/styles/index.css` 맨 위 `@theme` 토큰
- 화면별 여백·크기: 같은 파일에서 `IMAGE 0X` 주석으로 구역을 찾아 px 값을 수정
- 문구·목록: `src/data/mock.ts`
- 캐릭터·병실 이미지: 시안 PNG에서 잘라낸 이미지입니다. 원본 에셋이 있으면 `public/images/` 의 같은 파일명으로 덮어쓰면 더 선명해집니다.
  (`room.jpg` 펼친 병실, `room-ceiling.jpg` 접힌 병실 천장, `icon-inquiry.png` 문의하기 아이콘)
