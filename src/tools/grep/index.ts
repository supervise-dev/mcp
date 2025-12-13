import { astGrepQuery, countMatchesQuery, filesWithMatchesQuery, searchQuery } from "./index.query";
import {
  astGrepInput,
  astGrepOutput,
  countMatchesInput,
  countMatchesOutput,
  filesWithMatchesInput,
  filesWithMatchesOutput,
  searchInput,
  searchOutput,
} from "./index.types";
import { createTool } from "@mastra/core/tools";

export const grepSearchTool = createTool({
  id: "grep.search",
  description: "Search for text patterns in files using ripgrep with support for regex, file types, and context lines",
  inputSchema: searchInput,
  outputSchema: searchOutput,
  execute: async (input, context) => {
    return searchQuery({ input });
  },
});

export const grepFilesWithMatchesTool = createTool({
  id: "grep.filesWithMatches",
  description: "Find all files containing a pattern without returning the actual matches",
  inputSchema: filesWithMatchesInput,
  outputSchema: filesWithMatchesOutput,
  execute: async (input, context) => {
    return filesWithMatchesQuery({ input });
  },
});

export const grepCountMatchesTool = createTool({
  id: "grep.countMatches",
  description: "Count the number of matches per file for a given pattern",
  inputSchema: countMatchesInput,
  outputSchema: countMatchesOutput,
  execute: async (input, context) => {
    return countMatchesQuery({ input });
  },
});

export const astGrepTool = createTool({
  id: "grep.astGrep",
  description:
    "Search for code structure patterns using ast-grep. Supports TypeScript (.ts), TSX/React (.tsx), and other languages. Use patterns like 'console.log($$$)', 'function $NAME($$$) { $$$ }', or 'const $VAR = useState($$$)' to find structural matches in code.",
  inputSchema: astGrepInput,
  outputSchema: astGrepOutput,
  execute: async (input, context) => {
    return astGrepQuery({ input });
  },
});

export { astGrepQuery, countMatchesQuery, filesWithMatchesQuery, searchQuery } from "./index.query";
export * from "./index.types";
