import { z } from "zod";

export const searchInput = z.object({
  pattern: z.string().describe("The search pattern (supports regex)"),
  path: z.string().optional().describe("The directory or file path to search in (defaults to current directory)"),
  options: z
    .object({
      caseInsensitive: z.boolean().optional().describe("Perform case-insensitive search"),
      wordBoundary: z.boolean().optional().describe("Match whole words only"),
      literal: z.boolean().optional().describe("Treat pattern as literal string, not regex"),
      maxCount: z.number().optional().describe("Maximum number of matches to return"),
      context: z.number().optional().describe("Number of context lines to show before and after each match"),
      contextBefore: z.number().optional().describe("Number of context lines to show before each match"),
      contextAfter: z.number().optional().describe("Number of context lines to show after each match"),
      fileType: z.string().optional().describe("Filter by file type (e.g., 'js', 'ts', 'py', 'go', 'java', 'rust')"),
      glob: z.string().optional().describe("Glob pattern to filter files (e.g., '*.js', '**/*.tsx')"),
      excludeGlob: z.string().optional().describe("Glob pattern to exclude files"),
      followSymlinks: z.boolean().optional().describe("Follow symbolic links"),
      hidden: z.boolean().optional().describe("Search hidden files and directories"),
      maxDepth: z.number().optional().describe("Maximum depth to recurse into directories"),
      filesWithMatches: z.boolean().optional().describe("Only return file paths, not match content"),
      count: z.boolean().optional().describe("Only return count of matches per file"),
      multiline: z.boolean().optional().describe("Enable multiline search mode"),
      encoding: z.string().optional().describe("Specify encoding for search (e.g., 'utf8', 'latin1', 'utf16le')"),
    })
    .optional()
    .describe("Optional configuration for search"),
});

export const matchOutput = z.object({
  file: z.string().describe("Path to the file containing the match"),
  line: z.number().describe("Line number of the match"),
  column: z.number().optional().describe("Column number of the match start"),
  match: z.string().describe("The matched text"),
  lineText: z.string().describe("Full text of the line containing the match"),
  contextBefore: z.array(z.string()).optional().describe("Lines before the match"),
  contextAfter: z.array(z.string()).optional().describe("Lines after the match"),
});

export const searchOutput = z.object({
  matches: z.array(matchOutput).describe("Array of search matches"),
  totalMatches: z.number().describe("Total number of matches found"),
  filesSearched: z.number().optional().describe("Number of files searched"),
  truncated: z.boolean().optional().describe("Whether results were truncated due to maxCount limit"),
});

export const filesWithMatchesInput = z.object({
  pattern: z.string().describe("The search pattern (supports regex)"),
  path: z.string().optional().describe("The directory or file path to search in (defaults to current directory)"),
  options: z
    .object({
      caseInsensitive: z.boolean().optional().describe("Perform case-insensitive search"),
      fileType: z.string().optional().describe("Filter by file type (e.g., 'js', 'ts', 'py', 'go', 'java', 'rust')"),
      glob: z.string().optional().describe("Glob pattern to filter files (e.g., '*.js', '**/*.tsx')"),
      excludeGlob: z.string().optional().describe("Glob pattern to exclude files"),
      maxCount: z.number().optional().describe("Maximum number of files to return"),
    })
    .optional()
    .describe("Optional configuration for search"),
});

export const filesWithMatchesOutput = z.object({
  files: z.array(z.string()).describe("Array of file paths containing matches"),
  totalFiles: z.number().describe("Total number of files with matches"),
  truncated: z.boolean().optional().describe("Whether results were truncated due to maxCount limit"),
});

export const countMatchesInput = z.object({
  pattern: z.string().describe("The search pattern (supports regex)"),
  path: z.string().optional().describe("The directory or file path to search in (defaults to current directory)"),
  options: z
    .object({
      caseInsensitive: z.boolean().optional().describe("Perform case-insensitive search"),
      fileType: z.string().optional().describe("Filter by file type (e.g., 'js', 'ts', 'py', 'go', 'java', 'rust')"),
      glob: z.string().optional().describe("Glob pattern to filter files (e.g., '*.js', '**/*.tsx')"),
      excludeGlob: z.string().optional().describe("Glob pattern to exclude files"),
    })
    .optional()
    .describe("Optional configuration for count"),
});

export const fileCountOutput = z.object({
  file: z.string().describe("Path to the file"),
  count: z.number().describe("Number of matches in the file"),
});

export const countMatchesOutput = z.object({
  fileCounts: z.array(fileCountOutput).describe("Array of match counts per file"),
  totalMatches: z.number().describe("Total number of matches across all files"),
});

export type SearchInput = z.infer<typeof searchInput>;
export type MatchOutput = z.infer<typeof matchOutput>;
export type SearchOutput = z.infer<typeof searchOutput>;
export type FilesWithMatchesInput = z.infer<typeof filesWithMatchesInput>;
export type FilesWithMatchesOutput = z.infer<typeof filesWithMatchesOutput>;
export type CountMatchesInput = z.infer<typeof countMatchesInput>;
export type FileCountOutput = z.infer<typeof fileCountOutput>;
export type CountMatchesOutput = z.infer<typeof countMatchesOutput>;
