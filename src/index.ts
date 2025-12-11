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
import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import { MCPServer } from "@mastra/mcp";

export const mastra = new Mastra({
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Supervise MCP",
    level: "info",
  }),
  server: {
    host: process.env.SV_MCP_HOST,
    port: process.env.SV_MCP_PORT,
  },
  mcpServers: {
    supervise: new MCPServer({
      name: "supervise",
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
    }),
  },
});
