import { execMutation, spawnMutation } from "./index.mutate";
import { execInput, processOutput, spawnInput } from "./index.types";
import { createTool } from "@mastra/core/tools";

export const spawnTool = createTool({
  id: "process.spawn",
  description: "Spawn a new process with specified command and arguments, returning stdout, stderr, and exit code",
  inputSchema: spawnInput,
  outputSchema: processOutput,
  execute: async (input, context) => {
    return spawnMutation({ input });
  },
});

export const execTool = createTool({
  id: "process.exec",
  description: "Execute a shell command and return stdout, stderr, and exit code",
  inputSchema: execInput,
  outputSchema: processOutput,
  execute: async (input, context) => {
    return execMutation({ input });
  },
});

export { execMutation, spawnMutation } from "./index.mutate";
