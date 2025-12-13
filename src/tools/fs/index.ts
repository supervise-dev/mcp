import { deleteMutation, mkdirMutation, writeFileMutation } from "./index.mutate";
import { directoryTreeQuery, existsQuery, fileSizeQuery, readFileQuery, readdirQuery, statQuery } from "./index.query";
import {
  deleteInput,
  deleteOutput,
  directoryTreeInput,
  directoryTreeOutput,
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
  execute: async (input, context) => {
    return existsQuery({ input });
  },
});

export const mkdirTool = createTool({
  id: "fs.mkdir",
  description: "Create a new directory at the specified path with optional recursive mode",
  inputSchema: mkdirInput,
  outputSchema: mkdirOutput,
  execute: async (input, context) => {
    return mkdirMutation({ input });
  },
});

export const readdirTool = createTool({
  id: "fs.readdir",
  description: "Read the contents of a directory and return file/directory names",
  inputSchema: readdirInput,
  outputSchema: readdirOutput,
  execute: async (input, context) => {
    return readdirQuery({ input });
  },
});

export const readFileTool = createTool({
  id: "fs.readFile",
  description: "Read the contents of a file and return as string or Buffer",
  inputSchema: readFileInput,
  outputSchema: readFileOutput,
  execute: async (input, context) => {
    return readFileQuery({ input });
  },
});

export const statTool = createTool({
  id: "fs.stat",
  description: "Get detailed statistics about a file or directory (size, permissions, timestamps, etc.)",
  inputSchema: statInput,
  outputSchema: statOutput,
  execute: async (input, context) => {
    return statQuery({ input });
  },
});

export const writeFileTool = createTool({
  id: "fs.writeFile",
  description: "Write data to a file, creating it if it doesn't exist or overwriting if it does",
  inputSchema: writeFileInput,
  outputSchema: writeFileOutput,
  execute: async (input, context) => {
    return writeFileMutation({ input });
  },
});

export const fileSizeTool = createTool({
  id: "fs.fileSize",
  description: "Get the size of a file in bytes",
  inputSchema: fileSizeInput,
  outputSchema: fileSizeOutput,
  execute: async (input, context) => {
    return fileSizeQuery({ input });
  },
});

export const deleteTool = createTool({
  id: "fs.delete",
  description: "Delete a file or directory with optional recursive deletion",
  inputSchema: deleteInput,
  outputSchema: deleteOutput,
  execute: async (input, context) => {
    return deleteMutation({ input });
  },
});

export const directoryTreeTool = createTool({
  id: "fs.directoryTree",
  description:
    "Generate a tree view of a directory structure with optional filtering by depth, extensions, and exclusion patterns",
  inputSchema: directoryTreeInput,
  outputSchema: directoryTreeOutput,
  execute: async (input, context) => {
    return directoryTreeQuery({ input });
  },
});

export { deleteMutation, mkdirMutation, writeFileMutation } from "./index.mutate";
export { directoryTreeQuery, existsQuery, fileSizeQuery, readdirQuery, readFileQuery, statQuery } from "./index.query";
