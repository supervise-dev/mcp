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
import { MCPServer } from "@mastra/mcp";
import * as http from "node:http";

const SV_MCP_PORT = process.env.SV_MCP_PORT || 1234;

const server = new MCPServer({
  name: "My Custom Server",
  version: "1.0.0",
  tools: {
    // File system tools
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
  },
});

const httpServer = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  await server.startSSE({
    url: new URL(req.url || "", "http://localhost:1234"),
    ssePath: "/sse",
    messagePath: "/message",
    req,
    res,
  });
});

httpServer.listen(SV_MCP_PORT, () => {
  console.log(`HTTP server listening on port ${SV_MCP_PORT}`);
});
