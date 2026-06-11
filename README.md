# My First MCP + RhinoMCP 실습 가이드

> 감성어 기반 MCP 서버를 직접 배포하고, Claude Desktop 및 RhinoMCP와 연동하여 사용하는 실습입니다.

---

# 실습 목표

본 실습을 통해 다음 내용을 경험할 수 있습니다.

- GitHub Fork 및 저장소 관리
- Cloudflare Workers를 이용한 MCP 서버 배포
- Claude Desktop과 원격 MCP 서버 연결
- MCP Tool 탐색 및 테스트
- RhinoMCP 설치 및 Rhino 제어
- 여러 MCP 서버를 조합한 워크플로우 구성
- 감성어-수치 데이터 수정 및 재배포

---

# 1. GitHub 회원 가입

GitHub에 가입합니다.

👉 https://github.com/

---

# 2. 실습 저장소 찾기

1. GitHub 화면에서 `/` 키를 누릅니다.
2. 아래 저장소를 검색합니다.

```text
caffeineworks-ai/my-first-mcp
```

3. `my-first-mcp` 저장소를 클릭합니다.

---

# 3. 저장소 Fork

우측 상단 **Fork** 버튼을 클릭합니다.

### 설정

#### ① Repository name

원하는 이름으로 변경합니다.

예시

```text
my-first-mcp
my-design-mcp
kim-first-mcp
```

#### ② Copy the main branch only

체크 해제

---

### 생성

**Create fork** 버튼 클릭

---

# 4. Fork 완료 확인

본인 계정에 저장소가 생성되었는지 확인합니다.

예시

```text
github.com/내계정/my-first-mcp
```

---

# 5. Cloudflare 회원 가입

👉 https://www.cloudflare.com/ko-kr/

---

## 가입 절차

다음 항목을 선택합니다.

```text
Personal
→ Student
→ MySelf
→ Build and scale apps globally
→ Connect git repo
```

---

## 이메일 인증

가입 시 사용한 이메일로 이동하여

**Verify Email**

버튼을 클릭합니다.

---

# 6. Cloudflare Workers 배포

## GitHub 연결

첫 화면에서

**Connect GitHub**

클릭

---

### ① Repository 접근 권한

선택

```text
Only select repositories
```

---

### ② 저장소 선택

드롭다운에서

3단계에서 Fork한 저장소 선택

---

### ③ 설치

```text
Install & Authorize
```

클릭

---

### ④ GitHub 로그인

```text
Continue with GitHub
```

클릭

---

### ⑤ 저장소 선택

Fork한 저장소 클릭

```text
Next
```

클릭

---

### ⑥ 배포

```text
Deploy
```

클릭

배포가 완료될 때까지 기다립니다.

---

### ⑦ URL 확인

```text
Overview 탭
```

으로 이동

상단에 생성된 URL 클릭

---

### ⑧ URL 저장

예시

```text
https://my-first-mcp-xxxx.workers.dev
```

URL을 메모장에 복사해 둡니다.

---

# 7. Node.js 설치

👉 https://nodejs.org/ko/download

---

## 설치

### ① LTS 버전 확인

최신 LTS 버전인지 확인

---

### ② 설치

MSI 파일 다운로드 후 설치

### 주의

- 설치 경로 변경 금지
- Custom Setup 변경 금지
- 추가 도구 설치 체크 시 모두 해제

---

### ③ 명령 프롬프트 실행

`Windows + R`

입력

```text
cmd
```

실행

---

### ④ 설치 확인

```bash
node -v
npm -v
npx -v
```

정상적으로 버전이 출력되면 성공

---

# 8. Claude Desktop 설치 및 로그인

👉 https://claude.com/download

설치 후 로그인합니다.

---

# 9. Claude Desktop 설정 파일 수정

## ① Claude Desktop 실행

---

## ② 설정 파일 열기

메뉴

```text
개발자
→ 앱 설정 파일 열기
```

---

## ③ MCP 서버 추가

`mcpServers` 항목 맨 아래에 추가

```json
"설정한 MCP 서버 이름 입력": {
  "command": "cmd",
  "args": [
    "/C",
    "C:\\Program Files\\nodejs\\npx.cmd",
    "-y",
    "mcp-remote",
    "6에서 복사한 MCP 서버 URL입력"
  ]
}
```

예시

```json
"my-first-mcp": {
  "command": "cmd",
  "args": [
    "/C",
    "C:\\Program Files\\nodejs\\npx.cmd",
    "-y",
    "mcp-remote",
    "https://my-first-mcp-xxxx.workers.dev"
  ]
}
```

저장 후 종료

---

## ④ Claude Desktop 완전 종료

창만 닫지 말고

시스템 트레이에서 종료

---

## ⑤ Claude Desktop 재실행

---

# 10. MCP 서버 테스트

Claude Desktop에서 입력

---

### 도구 목록 확인

```text
(설정한 MCP 서버 이름) MCP 서버의 도구 세트를 조사해줘
```

---

### Fillet 키워드 확인

```text
(설정한 MCP 서버 이름) MCP 서버의 fillet 키워드 목록 조사해줘
```

---

### Chamfer 키워드 확인

```text
(설정한 MCP 서버 이름) MCP 서버의 chamfer 키워드 목록 조사해줘
```

---

### 오류 발생 시

- MCP 설정 확인
- URL 확인
- Claude Desktop 재시작
- Cloudflare 배포 상태 확인

---

# 11. Rhino 8에 RhinoMCP 설치

---

## ① RhinoMCP Connector 다운로드

👉 https://mcneel.github.io/RhinoMCP/docs/getting-started/connector/

`connector.mcpb` 다운로드

---

## ② Claude Desktop 확장프로그램 설치

```text
개발자
→ 확장프로그램
→ 확장프로그램 설치
```

---

## ③ connector.mcpb 선택

---

## ④ Rhino 8 실행

---

## ⑤ 패키지 설치

메뉴

```text
도구
→ 패키지 관리자
```

검색

```text
rhino-mcp-platform
```

---

## ⑥ 설치 확인

설명 문구

```text
An MCP Server for Rhino made by McNeel
```

확인 후 설치

---

## ⑦ Rhino 연결

명령행 입력

```text
MCPConnect
```

---

## ⑧ 설정 복사

```text
mcp.json
```

탭에서

```text
Copy
```

클릭

---

## ⑨ Claude 설정 추가

복사된 내용을 Claude Desktop 설정에 추가

이미 있다면 생략

---

## ⑩ Claude Desktop 재시작

완전 종료 후 다시 실행

---

## ⑪ Rhino MCP 시작

명령행 입력

```text
MCPStart
```

포트번호 요청 시 엔터

---

# 12. Claude Desktop으로 RhinoMCP 제어하기

## 객체 생성

```text
라이노에 30x30x30 크기의 박스 3개를 생성해줘
```

```text
라이노에 30x30x10 크기 박스 10개를 36도씩 회전해서 쌓아줘
```

```text
라이노 프론트뷰에서 꽃병 단면도 그려줘
```

```text
라이노에 그린 꽃병 단면도를 회전시켜서 입체로 만들어줘
```

---

## 객체 검사

```text
라이노에 객체가 몇개 있어?
```

```text
라이노 객체 ID를 알려줘
```

```text
라이노 스케치의 G0, G1, G2 연속성을 검사해줘
```

---

# 13. 자작 MCP 서버와 RhinoMCP 연결하기

## 작동 테스트

```text
[설정한 MCP 서버 이름] 사용해서 객체 1에 부드러운 필렛 적용해줘
```

```text
[설정한 MCP 서버 이름] 사용해서 객체 2에 신뢰감 있는 챔퍼 적용해줘
```

---

## 기획서 기반 활용

```text
기획서를 고려할 때 필렛을 넣는게 좋을까, 챔퍼를 넣는게 좋을까?
```

```text
기획서 내용을 고려해서 객체 1에 [설정한 MCP 서버 이름]으로 필렛 적용해줘
```

```text
기획서 내용을 고려해서 객체 1에 [설정한 MCP 서버 이름]으로 챔퍼 적용해줘
```

---

# 14. 감성어 키워드-수치 조정

## ① GitHub 저장소 이동

```text
Code 탭
```

---

## ② keywords.json 열기

---

## ③ 수정

우측 상단 연필 버튼 클릭

내용 수정 후 Commit

---

## ④ 배포 확인

Cloudflare에서 자동 배포 여부 확인

---

## ⑤ Claude Desktop 재시작

완전 종료 후 다시 실행

---

## ⑥ 다시 테스트

예시

```text
[설정한 MCP 서버 이름] MCP 서버의 fillet 키워드 목록 조사해줘
```

```text
[설정한 MCP 서버 이름] 사용해서 객체 1에 부드러운 필렛 적용해줘
```

변경 내용이 반영되는지 확인합니다.

---

# 전체 구조

```text
GitHub
   │
   ▼
Cloudflare Workers
   │
   ▼
My First MCP
   │
   ├── Fillet 추천
   └── Chamfer 추천

Claude Desktop
   │
   ├── My First MCP
   └── RhinoMCP
            │
            ▼
          Rhino 8
```

축하합니다! 🎉

이제 직접 만든 MCP 서버와 RhinoMCP를 연동하여 감성어 기반 형상 생성 워크플로우를 실습할 수 있습니다.
