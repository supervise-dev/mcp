import { version } from "../package.json";
import {
  addTool,
  branchTool,
  checkoutTool,
  cloneTool,
  commitTool,
  createTagTool,
  deleteTool,
  diffTool,
  execTool,
  existsTool,
  fileSizeTool,
  initTool,
  logTool,
  mergeTool,
  mkdirTool,
  pullTool,
  pushTool,
  readFileTool,
  readdirTool,
  remoteTool,
  spawnTool,
  statTool,
  statusTool,
  tagTool,
  writeFileTool,
} from "./tools";
import { grepCountMatchesTool, grepFilesWithMatchesTool, grepSearchTool } from "./tools";
import { getEnvOrThrow } from "./utils/env";
import { gitSyncWorkflow } from "@/workflows/git/sync";
import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import { MCPServer } from "@mastra/mcp";
import { jwk } from "hono/jwk";

export const mastra = new Mastra({
  storage: new LibSQLStore({
    url: getEnvOrThrow("SV_MCP_STORAGE"),
  }),
  logger: new PinoLogger({
    name: "Supervise MCP",
    level: "info",
  }),
  server: {
    host: getEnvOrThrow("SV_MCP_HOST"),
    port: getEnvOrThrow("SV_MCP_PORT", Number),
    cors: {
      origin: [getEnvOrThrow("SV_MCP_CORS")],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: false,
    },
    middleware: [
      {
        // Fix duplicate Transfer-Encoding header from @mastra/mcp SSE streaming
        // Mastra sets Transfer-Encoding: chunked but Bun adds it automatically for ReadableStream
        // Solution: Delete it entirely and let Bun handle it at the HTTP layer
        path: "/api/mcp/*",
        handler: async (c, next) => {
          await next();
          if (c.res) {
            c.res.headers.delete("Transfer-Encoding");
            c.res.headers.delete("transfer-encoding");
          }
        },
      },
      {
        path: "/*",
        handler: jwk({
          jwks_uri: getEnvOrThrow("SV_MCP_JWK"),
          allow_anon: getEnvOrThrow("SV_MCP_JWT_ALLOW_ANON", JSON.parse),
          verification: {
            iss: getEnvOrThrow("SV_MCP_JWK_ISS"),
            aud: getEnvOrThrow("SV_MCP_JWK_AUD"),
          },
        }),
      },
    ],
  },
  mcpServers: {
    [getEnvOrThrow("SV_MCP_NAME")]: new MCPServer({
      name: getEnvOrThrow("SV_MCP_NAME"),
      version: version,
      tools: {
        [existsTool.id]: existsTool,
        [mkdirTool.id]: mkdirTool,
        [readdirTool.id]: readdirTool,
        [readFileTool.id]: readFileTool,
        [statTool.id]: statTool,
        [writeFileTool.id]: writeFileTool,
        [fileSizeTool.id]: fileSizeTool,
        [deleteTool.id]: deleteTool,
        [spawnTool.id]: spawnTool,
        [execTool.id]: execTool,
        [statusTool.id]: statusTool,
        [logTool.id]: logTool,
        [diffTool.id]: diffTool,
        [branchTool.id]: branchTool,
        [remoteTool.id]: remoteTool,
        [tagTool.id]: tagTool,
        [initTool.id]: initTool,
        [cloneTool.id]: cloneTool,
        [addTool.id]: addTool,
        [commitTool.id]: commitTool,
        [pushTool.id]: pushTool,
        [pullTool.id]: pullTool,
        [checkoutTool.id]: checkoutTool,
        [mergeTool.id]: mergeTool,
        [createTagTool.id]: createTagTool,
        [grepSearchTool.id]: grepSearchTool,
        [grepFilesWithMatchesTool.id]: grepFilesWithMatchesTool,
        [grepCountMatchesTool.id]: grepCountMatchesTool,
      },
      workflows: {
        gitSyncWorkflow,
      },
    }),
  },
});
