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
                    name: "get_mechanical_guideline",
                    description: "브랜드 컨셉 키워드(sharp, soft 등)에 맞는 가공(Fillet/Chamfer) 수치 가이드라인을 조회합니다.",
                    inputSchema: {
                      type: "object",
                      properties: {
                        keyword: {
                          type: "string",
                          description: "조회할 디자인 키워드 (sharp, soft, matte, fillet, chamfer)"
                        }
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
          const { keyword } = body.params?.arguments || {};
          const lowerKeyword = keyword ? keyword.toLowerCase().trim() : "";
          const matchedData = keywords[lowerKeyword as keyof typeof keywords];

          let responseText = "";
          if (matchedData) {
            responseText = `[${matchedData.description}]\n${matchedData.content}`;
          } else {
            responseText = `'${keyword}' 콘셉트에 맞는 디자인 수치가 아직 정의되지 않았습니다. 현재 등록된 키워드: ${Object.keys(keywords).join(", ")}`;
          }

          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: body.id,
              result: {
                content: [{ type: "text", text: responseText }],
                isError: false
              }
            }),
            { headers, status: 200 }
          );
        }

        // 기타 예외적인 JSON-RPC 요청이 들어올 때 유연한 에러 회피용 기본 응답
        return new Response(
          JSON.stringify({ jsonrpc: "2.0", id: body.id, result: {} }),
          { headers, status: 200 }
        );
      }

      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { headers, status: 405 });

    } catch (error: any) {
      return new Response(
        JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: error.message } }),
        { headers, status: 500 }
      );
    }
  }
};
