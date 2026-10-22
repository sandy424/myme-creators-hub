# MYME Creators Hub — React 프론트엔드

2026-10-22 내보내기. 기존 미리보기 v22의 화면과 개선사항을 React + Vite 소스로 옮겼습니다.
**프론트엔드만 수정하는 용도**로, 백엔드를 설치·실행하지 않아도 동작합니다.

## 1. 실행

Node.js 22.13 이상을 설치하고, 압축을 푼 폴더에서 터미널을 엽니다.

```sh
npm install
npm run dev
```

터미널에 표시되는 `http://localhost:5173`을 엽니다.
Windows에서도 같은 명령을 사용합니다. VS Code에서는 `파일 → 폴더 열기` 후 `터미널 → 새 터미널`을 이용하세요.

```sh
npm run build     # dist/에 배포용 프론트엔드 생성
npm run preview   # 빌드 결과 확인
npm test          # 로컬 UI 테스트 API 기능 검사
```

## 2. 어디를 수정하나요?

| 수정할 화면                               | 파일                                |
| ----------------------------------------- | ----------------------------------- |
| 화면 연결·상단 메뉴·로그인 상태·팝업 연결 | `src/App.jsx`                       |
| Tailwind 테마 색상·공통 요소 기본 스타일  | `src/index.css`                     |
| 메인 화면·최근 글·카테고리 배지           | `src/pages/Home.jsx`                |
| 게시판·글 작성·상세·댓글·대댓글           | `src/pages/Community.jsx`           |
| 동료 찾기                                 | `src/pages/Members.jsx`             |
| 팀협업·프로젝트·작업 공간 링크            | `src/pages/Projects.jsx`            |
| 로그인·회원가입                           | `src/components/AuthDialog.jsx`     |
| 검색형 활동 국가 선택                     | `src/components/CountrySelect.jsx`  |
| 프로필 편집·공개 프로필                   | `src/components/Profile.jsx`        |
| 채팅                                      | `src/components/ChatDialog.jsx`     |
| 커리어·지갑·공식 기회 팝업                | `src/components/ActivityDialog.jsx` |
| 재사용 버튼·아바타·팝업                   | `src/components/UI.jsx`             |
| API 통신과 카테고리·언어 목록             | `src/api.js`                        |
| 백엔드 없이 화면을 테스트하는 로컬 어댑터 | `src/mock/api.js`                   |

화면을 문자열로 생성하는 기존 `app.js`를 끼워 넣은 방식이 아닙니다. JSX 컴포넌트와 React state/이벤트로 구성했습니다.

스타일은 Tailwind CSS v4와 `@tailwindcss/vite`를 사용합니다. 레이아웃, 반응형, hover·선택 상태는 해당 JSX의 `className`에서 수정합니다. 공통 색상은 `src/index.css`의 `@theme`에 정의한 `brand`, `ink`, `muted`, `line`, `canvas` 토큰을 사용합니다. 예를 들어 `bg-brand`, `text-muted`로 적용할 수 있습니다. 클래스에 남아 있는 요소 이름은 문맥별 Tailwind 변형과 요소 식별에 사용되며 별도 CSS 규칙은 없습니다. 기존 화면의 여백과 폼 모양을 유지하기 위해 Preflight 대신 최소한의 공통 기본 스타일을 사용합니다.

## 3. 초기 데이터와 테스트 방식

- 처음 실행하면 회원·게시글·댓글·프로젝트·채팅·포인트가 모두 비어 있습니다.
- 실제 서비스의 DB나 회원 데이터는 압축 파일에 포함하지 않았습니다.
- **배포 중인 기존 사이트의 DB는 이 내보내기 작업에서 삭제하지 않았습니다.**
- 기본값은 `mock` 모드입니다. 화면에서 만든 테스트 데이터는 현재 브라우저의 localStorage에만 저장됩니다.
- 로컬 모드의 회원가입은 화면 확인을 위한 시뮬레이션입니다. 실제 서비스 비밀번호 대신 가짜 테스트 비밀번호를 사용하세요. 브라우저 데이터는 사용자가 읽거나 변경할 수 있으므로 실제 인증·보안을 제공하지 않습니다.
- A로 가입 → 로그아웃 → B로 가입하여 화면을 확인할 수 있습니다. 각 계정의 프로필 공개를 켜야 동료 목록에 나타납니다. 이 동작은 같은 브라우저의 테스트 데이터 안에서만 공유됩니다.
- 상단 **테스트 데이터 초기화** 버튼은 이 React 프로젝트의 브라우저 테스트 데이터만 삭제합니다. 실제 백엔드 DB에는 요청하지 않습니다.
- 기존 디자인, 로그인/가입 탭, 전문 분야 자유 입력, 국가 검색/가나다순/정확한 국가명 자동 선택, 공개 설정, 프로필 닫기 버튼, 최근 글 카테고리 배지, 대댓글 및 답변 대상 표시를 포함했습니다.

## 4. 나중에 실제 API를 연결할 경우

`.env.example`을 복사해 `.env`로 만든 뒤 다음과 같이 설정합니다.

```dotenv
VITE_API_MODE=server
VITE_API_PROXY_TARGET=http://localhost:3001
```

이 주소는 예시입니다. 실제 API 서버가 실행 중이어야 합니다.
기본 API 경로는 `/api/account/`이며 HttpOnly 세션 쿠키를 사용하는 기존 미리보기 계약을 따릅니다.
API 서버는 개발용 프론트엔드의 Origin/쿠키 설정을 허용해야 합니다. 배포 시에는 프론트엔드와 API를 같은 출처로 구성하는 것이 간단합니다.
현재 ChatGPT 미리보기 사이트의 주소를 넣는 것만으로 로그인 쿠키가 자동 연결되지는 않습니다.

| 요청              | 메서드 | 주요 입력                                          |
| ----------------- | ------ | -------------------------------------------------- |
| `me`              | GET    | 현재 계정/개인 상태                                |
| `signup`, `login` | POST   | 가입 또는 로그인 정보                              |
| `logout`          | POST   | 빈 객체                                            |
| `state`           | POST   | `{ state: { user, career, ... } }`                 |
| `community`       | GET    | 회원/공유 글/프로젝트/대화                         |
| `publish-post`    | POST   | title, body, category                              |
| `comment`         | POST   | postId, text, parentId                             |
| `like`            | POST   | postId, liked                                      |
| `save-project`    | POST   | id(수정 시), title, summary, state, members, links |
| `connection`      | POST   | peerId, operation(request/cancel/accept)           |
| `send-message`    | POST   | peerId, text, lang                                 |

이메일 인증, 비밀번호 재설정 메일, 자동 번역, 포인트 실제 지급, 공식 행사 신청·품앗이 정산은 이 프론트엔드에 서버 기능으로 포함되어 있지 않습니다. 관련 화면에는 미연결 상태가 표시됩니다.

## 5. 포함/제외

포함: React 소스, CSS, 정적 SVG 자산, 테스트용 API 어댑터, npm 잠금 파일, 설명서.
제외: 백엔드 서버 코드, 실제 DB·세션·비밀번호, 원본 참고 저장소, 실행 바이너리, node_modules, 빌드 결과.

기존 ZIP 다운로드 차단의 원인은 확인되지 않았습니다. 이번 파일도 바이러스 검사 통과를 보증하는 파일은 아닙니다. 다시 차단되면 보안 프로그램에서 표시한 탐지명을 확인해 주세요.
