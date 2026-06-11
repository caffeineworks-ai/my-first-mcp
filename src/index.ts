import keywords from "../keywords.json";

interface Env {}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-mcp-protocol-version"
    };

    // CORS 사전 요청 처리
    if (request.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }

    try {
      // 1. GET 요청 기본 처리 (핸드셰이크 응답)
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

      // 2. POST 요청 처리 (mcp-remote 통신부)
      if (request.method === "POST") {
        const bodyText = await request.text();
        
        // 빈 바디가 올 경우 예외 처리 방지 및 기본 성공 리턴
        if (!bodyText || bodyText.trim() === "") {
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: {} }), { headers, status: 200 });
        }

        const body = JSON.parse(bodyText);

        // [Case A] mcp-remote 초기 설정 또는 가상 initialize 패킷 처리
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

        // [Case B] 클라이언트가 도구(Tools) 목록을 보여달라고 할 때
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

        // [Case C] AI가 데이터를 실제로 요청하여 조회할 때
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
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: body.id,
              result: { content: [{ type: "text", text }], isError: value === undefined }
            }),
            { headers, status: 200 }
          );
        }
      };   
