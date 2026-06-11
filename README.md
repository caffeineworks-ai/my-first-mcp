# 커스텀 MCP 서버 제작 및 Rhino 연동 실습 가이드

감성어 기반 MCP 서버를 직접 배포하고, Claude Desktop 및 RhinoMCP와 연동하여 사용하는 실습 가이드입니다.

---

## 🎯 실습 목표

* GitHub Fork 및 저장소 관리
* Cloudflare Workers를 이용한 MCP 서버 배포
* Claude Desktop과 원격 MCP 서버 연결
* MCP Tool 탐색 및 테스트
* RhinoMCP 설치 및 Rhino 제어
* 여러 MCP 서버를 조합한 워크플로우 구성
* 감성어-수치 데이터 수정 및 재배포

---

## 💻 실습 순서

### 1. GitHub 저장소 준비

1. [GitHub](https://github.com/)에 회원가입 후 로그인합니다.
2. 검색창에 `/` 키를 누른 뒤 `caffeineworks-ai/my-first-mcp`를 검색하여 이동합니다.
3. 상단 우측의 **Fork** 버튼을 클릭합니다.
* **Repository name**: 원하는 이름으로 설정합니다.
* **Copy the main branch only**: 설정을 **해제**합니다.


4. **Create fork** 버튼을 클릭합니다.

### 2. Cloudflare Workers를 이용한 MCP 서버 배포

1. [Cloudflare](https://www.cloudflare.com/ko-kr/)에 회원가입을 진행합니다.
* 가입 완료 후 경로: `Personal` > `Student` > `MySelf` > `Build and scale apps globally` > `Connect git repo`


2. 가입 시 사용한 이메일함에서 인증 메일을 확인하고 **Verify** 버튼을 클릭합니다.
3. Cloudflare 첫 화면에서 **Connect GitHub**를 클릭합니다.
* `Only select repositories` 선택
* 드롭다운 리스트에서 1단계에서 포크한 레포지토리를 선택합니다.
* **Install & Authorize** 클릭 ➡️ **Continue with GitHub** 클릭


4. 레포지토리명을 클릭한 후 **Next**를 클릭합니다.
5. **Deploy** 버튼을 클릭하고 배포가 완료될 때까지 대기합니다.
6. **Overview** 탭 상단에 생성된 **URL을 복사하여 메모장에 저장**해 둡니다.

### 3. Node.js 및 Claude Desktop 설치

1. [Node.js 다운로드 페이지](https://nodejs.org/ko/download)에서 최신 **LTS** 버전 `.msi` 파일을 다운로드하여 설치합니다.
* **주의**: 설치 경로 및 커스텀 셋업은 변경하지 마세요.
* **주의**: 추가 도구 설치(Tools for Native Modules) 체크박스는 모두 **해제**합니다.


2. 설치 완료 후 `Windows + R` 키를 누르고 `cmd`를 입력해 터미널을 엽니다.
3. 아래 명령어를 입력하여 정상 설치되었는지 확인합니다.
```bash
node -v
npm -v
npx -v

```



```
4. [Claude Desktop 다운로드 페이지](https://claude.com/download)에서 프로그램을 다운로드하여 설치하고 로그인합니다.

### 4. Claude Desktop 설정 파일 수정
1. Claude Desktop을 실행합니다.
2. 메뉴에서 **개발자** > **앱 설정 파일 열기**를 클릭합니다.
3. `mcpServers` 목록 맨 아래에 아래 내용을 추가하고 저장합니다. (서버 이름과 URL은 본인의 값으로 수정해야 합니다.)

```json
    "설정한_MCP_서버_이름": {
      "command": "cmd",
      "args": [
        "/C",
        "C:\\Program Files\\nodejs\\npx.cmd",
        "-y",
        "mcp-remote",
        "2단계에서_복사한_MCP_서버_URL"
      ]
    }

```

4. Claude Desktop을 **완전 종료**합니다. (윈도우 작업 표시줄 우측 하단 시스템 트레이에서 아이콘 우클릭 후 종료)
5. Claude Desktop을 재실행합니다.

### 5. MCP 서버 테스트

Claude Desktop 대화창에 아래 프롬프트를 입력하여 정상 작동하는지 확인합니다.

* `[설정한 mcp 서버 이름] MCP 서버의 도구 세트를 조사해줘`
* `[설정한 mcp 서버 이름] MCP 서버의 fillet 키워드 목록 조사해줘`
* `[설정한 mcp 서버 이름] MCP 서버의 chamfer 키워드 목록 조사해줘`

---

## 🦏 Rhino 8 및 RhinoMCP 연동

### 1. RhinoMCP 설치 및 설정

1. [RhinoMCP 시작 가이드](https://mcneel.github.io/RhinoMCP/docs/getting-started/connector/) 페이지로 이동합니다.
2. `connector.mcpb` 파일을 다운로드합니다.
3. Claude Desktop 메뉴에서 **개발자** > **확장프로그램** > **확장프로그램설치**를 클릭합니다.
4. 다운로드한 `connector.mcpb` 파일을 선택합니다.
5. **Rhino 8**을 실행합니다.
6. 메뉴에서 **도구** > **패키지관리자**를 실행한 뒤 `rhino-mcp-platform`을 검색합니다.
7. 설명 문구에서 *An MCP Server for Rhino made by McNeel*을 확인하고 **설치**합니다.
8. Rhino 명령행에 `MCPConnect`를 입력합니다.
9. `mcp.json` 탭에서 **Copy** 버튼을 클릭합니다.
10. 복사된 내용을 Claude Desktop 설정 파일(`mcpServers` 목록 내부)에 추가합니다. (이미 문구가 추가되어 있다면 생략합니다.)
11. Claude Desktop을 **완전 종료 후 재시작**합니다.
12. Rhino 명령행에 `MCPStart`를 입력합니다. 포트 번호를 요구하면 **엔터**를 누릅니다.

### 2. Claude Desktop으로 RhinoMCP 제어하기

Claude Desktop에 아래 명령어를 입력하며 Rhino의 반응을 확인합니다.

* **객체 생성**
* `라이노에 30x30x30 크기의 박스 3개를 생성해줘`
* `라이노에 30x30x10 크기 박스 10개를 36도씩 회전해서 쌓아줘`
* `라이노 프론트뷰에서 꽃병 단면도 그려줘`
* `라이노에 그린 꽃병 단면도를 회전시켜서 입체로 만들어줘`


* **객체 검사**
* `라이노에 객체가 몇개 있어?`
* `라이노 객체 ID를 알려줘`
* `라이노 스케치의 G0, G1, G2 연속성을 검사해줘`



---

## 🔗 복합 워크플로우 및 데이터 수정

### 1. 자작 MCP 서버와 RhinoMCP 연결 사용

* **작동 테스트**
* `[설정한 MCP 서버 이름] 사용해서, 객체 1에 부드러운 필렛 적용해줘`
* `[설정한 MCP 서버 이름] 사용해서, 객체 2에 신뢰감 있는 챔퍼 적용해줘.`


* **기획서 연동**
* `기획서를 고려할 때, 필렛을 넣는게 좋을까, 챔퍼를 넣는게 좋을까?`
* `기획서 내용 고려해서 객체 1에 [설정한 MCP 서버 이름]으로 필렛(챔퍼) 적용해줘`



### 2. 감성어 키워드-수치 조정 및 재배포

1. 본인의 GitHub 레포지토리에서 **Code** 탭으로 이동합니다.
2. `keywords.json` 파일을 클릭합니다.
3. 우측의 **연필 버튼**을 눌러 내용을 수정한 후 Commit changes...를 눌러 저장합니다.
4. Cloudflare 대시보드에서 배포가 자동으로 진행 및 완료되는지 확인합니다.
5. Claude Desktop을 **완전 종료 후 재시작**합니다.
6. 다시 프롬프트를 입력하여 수정된 수치 데이터가 정상적으로 반영되었는지 테스트합니다.
