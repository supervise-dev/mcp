import { deleteMutation, mkdirMutation, writeFileMutation } from "./index.mutate";
import { existsQuery, fileSizeQuery, readFileQuery, readdirQuery, statQuery } from "./index.query";
import {
  deleteInput,
  deleteOutput,
  existsInput,
  existsOutput,
  fileSizeInput,
  fileSizeOutput,
  mkdirInput,
  mkdirOutput,
  readFileInput,
  readFileOutput,
  readdirInput,
  readdirOutput,
  statInput,
  statOutput,
  writeFileInput,
  writeFileOutput,
} from "./index.types";
import { createTool } from "@mastra/core/tools";

export const existsTool = createTool({
  id: "fs.exists",
  description: "Check if a file or directory exists at the specified path",
  inputSchema: existsInput,
  outputSchema: existsOutput,
  execute: async ({ context }) => {
    return existsQuery({ input: context });
  },
});

export const mkdirTool = createTool({
  id: "fs.mkdir",
  description: "Create a new directory at the specified path with optional recursive mode",
  inputSchema: mkdirInput,
  outputSchema: mkdirOutput,
  execute: async ({ context }) => {
    return mkdirMutation({ input: context });
  },
});

export const readdirTool = createTool({
  id: "fs.readdir",
  description: "Read the contents of a directory and return file/directory names",
  inputSchema: readdirInput,
  outputSchema: readdirOutput,
  execute: async ({ context }) => {
    return readdirQuery({ input: context });
  },
});

export const readFileTool = createTool({
  id: "fs.readFile",
  description: "Read the contents of a file and return as string or Buffer",
  inputSchema: readFileInput,
  outputSchema: readFileOutput,
  execute: async ({ context }) => {
    return readFileQuery({ input: context });
  },
});

export const statTool = createTool({
  id: "fs.stat",
  description: "Get detailed statistics about a file or directory (size, permissions, timestamps, etc.)",
  inputSchema: statInput,
  outputSchema: statOutput,
  execute: async ({ context }) => {
    return statQuery({ input: context });
  },
});

export const writeFileTool = createTool({
  id: "fs.writeFile",
  description: "Write data to a file, creating it if it doesn't exist or overwriting if it does",
  inputSchema: writeFileInput,
  outputSchema: writeFileOutput,
  execute: async ({ context }) => {
    return writeFileMutation({ input: context });
  },
});

export const fileSizeTool = createTool({
  id: "fs.fileSize",
  description: "Get the size of a file in bytes",
  inputSchema: fileSizeInput,
  outputSchema: fileSizeOutput,
  execute: async ({ context }) => {
    return fileSizeQuery({ input: context });
  },
});

export const deleteTool = createTool({
  id: "fs.delete",
  description: "Delete a file or directory with optional recursive deletion",
  inputSchema: deleteInput,
  outputSchema: deleteOutput,
  execute: async ({ context }) => {
    return deleteMutation({ input: context });
  },
});

export { deleteMutation, mkdirMutation, writeFileMutation } from "./index.mutate";
export { existsQuery, fileSizeQuery, readdirQuery, readFileQuery, statQuery } from "./index.query";
