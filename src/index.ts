// 키워드-수치 매칭 데이터 로드
import keywords from "../keywords.json";

interface Env {}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS 및 MCP 프로토콜 지원을 위한 기본 헤더 설정
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-mcp-protocol-version"
    };

    // CORS 사전요청 대응
    if (request.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }

    try {
      // 루트 경로만 허용
      if (new URL(request.url).pathname !== "/") {
        return new Response(null, { status: 404 });
      }

      // GET 요청 서버 상태 확인 및 메타데이터 반환
      if (request.method === "GET") {
        return new Response(
          JSON.stringify({
            mcpVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "fillet-chamfer-mcp-edu", version: "1.0.0" }
          }),
          { headers, status: 200 }
        );
      }

      // POST 요청 MCP 본문 처리 (json-rpc 2.0 규격)
      if (request.method === "POST") {
        const bodyText = await request.text();

        // 빈 요청이 올 경우 기본 세션 생성 및 예외 처리
        if (!bodyText || bodyText.trim() === "") {
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: {} }), {
            headers: { ...headers, "mcp-session-id": crypto.randomUUID() },
            status: 200
          });
        }
        
        const body = JSON.parse(bodyText);

        // MCP 알림 처리 (클라이언트 연결 완료 알림)
        if (body.method === "notifications/initialized" || body.method?.startsWith("notifications/")) {
          return new Response(
            JSON.stringify({ jsonrpc: "2.0", id: body.id ?? null, result: {} }),
            { headers, status: 200 }
          );
        }

        // MCP 핸드셰이크 (서버 초기화 요청 대응)
        if (body.method === "initialize" || !body.method) {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: body.id ?? 1,
              result: {
                protocolVersion: "2024-11-05",
                capabilities: { tools: {} },
                serverInfo: { name: "fillet-chamfer-mcp-edu", version: "1.0.0" }
              }
            }),
            { headers, status: 200 }
          );
        }

         // MCP 도구 목록 조회
        if (body.method === "tools/list") {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: body.id,
              result: {
                tools: [
                  {
                    name: "get_fillet_r",
                    description: "감성 키워드를 Fillet R값(mm)으로 변환합니다.",
                    inputSchema: {
                      type: "object",
                      properties: {
                        keyword: { type: "string", description: "감성 형용사 (예: '부드러운', '단단한')" }
                      },
                      required: ["keyword"]
                    }
                  },
                  {
                    name: "get_chamfer_c",
                    description: "감성 키워드를 Chamfer C값(mm)으로 변환합니다.",
                    inputSchema: {
                      type: "object",
                      properties: {
                        keyword: { type: "string", description: "감성 형용사 (예: '예리한', '강인한')" }
                      },
                      required: ["keyword"]
                    }
                  }
                ]
              }
            }),
            { headers, status: 200 }
          );
        }

        // MCP 도구 호출
        if (body.method === "tools/call") {
          const { name, arguments: args } = body.params;
          const keyword = args?.keyword?.trim();
          const table = name === "get_fillet_r"
            ? keywords.fillet
            : name === "get_chamfer_c"
            ? keywords.chamfer
            : null;

          if (!table) {
            return new Response(
              JSON.stringify({ jsonrpc: "2.0", id: body.id, error: { code: -32601, message: `Unknown tool: ${name}` } }),
              { headers, status: 200 }
            );
          }

          const value = table[keyword as keyof typeof table];
          const text = value !== undefined
            ? `${value}`
            : `'${keyword}'를 찾을 수 없습니다. 등록된 키워드: ${Object.keys(table).join(", ")}`;

          // 호출 결과를 MCP 규격으로 응답
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: body.id,
              result: { content: [{ type: "text", text }], isError: value === undefined }
            }),
            { headers, status: 200 }
          );
        }
      }

      // 지원하지 않는 HTTP 메서드에 대한 처리
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { headers, status: 405 });

    } catch (error: any) {
      // 서버 내부 런타임 에러 발생 시 응답
      return new Response(
        JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: error.message } }),
        { headers, status: 500 }
      );
    }
  }
};
