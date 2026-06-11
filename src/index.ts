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

    if (request.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }

    try {
      if (new URL(request.url).pathname !== "/") {
        return new Response(null, { status: 404 });
      }
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

      if (request.method === "POST") {
        const bodyText = await request.text();
        
        if (!bodyText || bodyText.trim() === "") {
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: {} }), {
            headers: { ...headers, "mcp-session-id": crypto.randomUUID() },
            status: 200
          });
        }

        const body = JSON.parse(bodyText);

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
