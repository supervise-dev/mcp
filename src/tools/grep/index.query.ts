import {
  AstGrepInput,
  AstGrepMatchOutput,
  AstGrepOutput,
  CountMatchesInput,
  CountMatchesOutput,
  FilesWithMatchesInput,
  FilesWithMatchesOutput,
  MatchOutput,
  SearchInput,
  SearchOutput,
} from "./index.types";
import { Lang, parse } from "@ast-grep/napi";
import { spawn } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import * as vscodeRipGrep from "vscode-ripgrep";

const rgPath = vscodeRipGrep.rgPath;

interface RipGrepMatch {
  type: "match";
  data: {
    path: { text: string };
    lines: { text: string };
    line_number: number;
    absolute_offset: number;
    submatches: Array<{
      match: { text: string };
      start: number;
      end: number;
    }>;
  };
}

interface RipGrepContext {
  type: "context";
  data: {
    path: { text: string };
    lines: { text: string };
    line_number: number;
  };
}

async function executeRipGrep(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const rg = spawn(rgPath, args);
    let stdout = "";
    let stderr = "";

    rg.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    rg.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    rg.on("close", (code) => {
      // Ripgrep returns 0 for matches found, 1 for no matches, 2+ for errors
      if (code === 0 || code === 1) {
        resolve(stdout);
      } else {
        reject(new Error(`Ripgrep error (exit code ${code}): ${stderr}`));
      }
    });

    rg.on("error", (err) => {
      reject(new Error(`Failed to spawn ripgrep: ${err.message}`));
    });
  });
}

function buildRipGrepArgs(input: SearchInput): string[] {
  const args: string[] = [];

  // Add JSON output format
  args.push("--json");

  // Add pattern
  if (input.options?.literal) {
    args.push("--fixed-strings");
  }
  args.push(input.pattern);

  // Add path if specified, otherwise current directory
  args.push(input.path || ".");

  // Case insensitive
  if (input.options?.caseInsensitive) {
    args.push("--ignore-case");
  }

  // Word boundary
  if (input.options?.wordBoundary) {
    args.push("--word-regexp");
  }

  // Max count
  if (input.options?.maxCount) {
    args.push("--max-count", input.options.maxCount.toString());
  }

  // Context
  if (input.options?.context !== undefined) {
    args.push("--context", input.options.context.toString());
  } else {
    if (input.options?.contextBefore !== undefined) {
      args.push("--before-context", input.options.contextBefore.toString());
    }
    if (input.options?.contextAfter !== undefined) {
      args.push("--after-context", input.options.contextAfter.toString());
    }
  }

  // File type
  if (input.options?.fileType) {
    args.push("--type", input.options.fileType);
  }

  // Glob patterns
  if (input.options?.glob) {
    args.push("--glob", input.options.glob);
  }

  if (input.options?.excludeGlob) {
    args.push("--glob", `!${input.options.excludeGlob}`);
  }

  // Follow symlinks
  if (input.options?.followSymlinks) {
    args.push("--follow");
  }

  // Hidden files
  if (input.options?.hidden) {
    args.push("--hidden");
  }

  // Max depth
  if (input.options?.maxDepth !== undefined) {
    args.push("--max-depth", input.options.maxDepth.toString());
  }

  // Files with matches only
  if (input.options?.filesWithMatches) {
    args.push("--files-with-matches");
  }

  // Count only
  if (input.options?.count) {
    args.push("--count");
  }

  // Multiline
  if (input.options?.multiline) {
    args.push("--multiline");
  }

  // Encoding
  if (input.options?.encoding) {
    args.push("--encoding", input.options.encoding);
  }

  return args;
}

export const searchQuery = async ({ input }: { input: SearchInput }): Promise<SearchOutput> => {
  const args = buildRipGrepArgs(input);
  const output = await executeRipGrep(args);

  const matches: MatchOutput[] = [];
  const lines = output.trim().split("\n").filter(Boolean);
  const filesSet = new Set<string>();

  let currentContextBefore: string[] = [];
  let currentContextAfter: string[] = [];

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);

      if (parsed.type === "match") {
        const match = parsed as RipGrepMatch;
        filesSet.add(match.data.path.text);

        for (const submatch of match.data.submatches) {
          matches.push({
            file: match.data.path.text,
            line: match.data.line_number,
            column: submatch.start,
            match: submatch.match.text,
            lineText: match.data.lines.text,
            contextBefore: currentContextBefore.length > 0 ? [...currentContextBefore] : undefined,
            contextAfter: undefined, // Will be filled by subsequent context entries
          });
        }

        currentContextBefore = [];
      } else if (parsed.type === "context") {
        const context = parsed as RipGrepContext;
        // This is a simplification - proper context handling would require more complex logic
        currentContextBefore.push(context.data.lines.text);
      }
    } catch (e) {
      // Skip lines that aren't valid JSON (like summary lines)
      continue;
    }
  }

  const truncated = input.options?.maxCount !== undefined && matches.length >= input.options.maxCount;

  return {
    matches,
    totalMatches: matches.length,
    filesSearched: filesSet.size,
    truncated,
  };
};

export const filesWithMatchesQuery = async ({
  input,
}: {
  input: FilesWithMatchesInput;
}): Promise<FilesWithMatchesOutput> => {
  const searchInput: SearchInput = {
    pattern: input.pattern,
    path: input.path,
    options: {
      ...input.options,
      filesWithMatches: true,
    },
  };

  const args = buildRipGrepArgs(searchInput);
  const output = await executeRipGrep(args);

  const files: string[] = [];
  const lines = output.trim().split("\n").filter(Boolean);

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === "match" && parsed.data?.path?.text) {
        const filePath = parsed.data.path.text;
        if (!files.includes(filePath)) {
          files.push(filePath);
        }
      }
    } catch (e) {
      continue;
    }
  }

  const truncated = input.options?.maxCount !== undefined && files.length >= input.options.maxCount;

  return {
    files,
    totalFiles: files.length,
    truncated,
  };
};

export const countMatchesQuery = async ({ input }: { input: CountMatchesInput }): Promise<CountMatchesOutput> => {
  const searchInput: SearchInput = {
    pattern: input.pattern,
    path: input.path,
    options: {
      ...input.options,
      count: true,
    },
  };

  const args = buildRipGrepArgs(searchInput);
  const output = await executeRipGrep(args);

  const fileCounts: Array<{ file: string; count: number }> = [];
  const lines = output.trim().split("\n").filter(Boolean);
  let totalMatches = 0;

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === "match" && parsed.data?.path?.text && parsed.data?.stats) {
        const file = parsed.data.path.text;
        const count = parsed.data.stats.matches || 0;
        fileCounts.push({ file, count });
        totalMatches += count;
      }
    } catch (e) {
      continue;
    }
  }

  return {
    fileCounts,
    totalMatches,
  };
};

// AST-Grep query for structural code search using JS API
// Map language strings to Lang enum (only built-in languages supported)
const langMap: Record<string, Lang> = {
  ts: Lang.TypeScript,
  tsx: Lang.Tsx,
  js: Lang.JavaScript,
  jsx: Lang.JavaScript, // JSX uses JavaScript parser
  html: Lang.Html,
  css: Lang.Css,
};

// Map file extensions to languages (only built-in languages supported)
const extToLang: Record<string, string> = {
  ".ts": "ts",
  ".tsx": "tsx",
  ".js": "js",
  ".jsx": "jsx",
  ".mjs": "js",
  ".cjs": "js",
  ".html": "html",
  ".htm": "html",
  ".css": "css",
};

// Get file extensions for a language
function getExtensionsForLang(lang: string): string[] {
  const extensions: string[] = [];
  for (const [ext, l] of Object.entries(extToLang)) {
    if (l === lang) {
      extensions.push(ext);
    }
  }
  return extensions;
}

// Recursively find files with matching extensions
async function findFiles(dir: string, extensions: string[], maxDepth = 10, currentDepth = 0): Promise<string[]> {
  if (currentDepth >= maxDepth) return [];

  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip node_modules, .git, and other common directories
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") {
          continue;
        }
        const subFiles = await findFiles(fullPath, extensions, maxDepth, currentDepth + 1);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Ignore permission errors
  }

  return files;
}

export const astGrepQuery = async ({ input }: { input: AstGrepInput }): Promise<AstGrepOutput> => {
  const matches: AstGrepMatchOutput[] = [];
  const lang = input.lang || "ts";
  const sgLang = langMap[lang];

  if (!sgLang) {
    throw new Error(`Unsupported language: ${lang}`);
  }

  const searchPath = input.path || ".";
  const extensions = getExtensionsForLang(lang);

  // Check if path is a file or directory
  let filesToSearch: string[] = [];
  try {
    const pathStat = await stat(searchPath);
    if (pathStat.isFile()) {
      filesToSearch = [searchPath];
    } else if (pathStat.isDirectory()) {
      filesToSearch = await findFiles(searchPath, extensions);
    }
  } catch {
    throw new Error(`Path not found: ${searchPath}`);
  }

  // Search each file
  for (const filePath of filesToSearch) {
    try {
      const content = await Bun.file(filePath).text();
      const ast = parse(sgLang, content);
      const root = ast.root();
      const foundNodes = root.findAll(input.pattern);

      for (const node of foundNodes) {
        const range = node.range();
        let replacement: string | undefined;

        // Handle rewrite if specified
        if (input.options?.rewrite) {
          const edit = node.replace(input.options.rewrite);
          replacement = edit.insertedText;
        }

        matches.push({
          file: filePath,
          range: {
            start: {
              line: range.start.line,
              column: range.start.column,
            },
            end: {
              line: range.end.line,
              column: range.end.column,
            },
          },
          matchedCode: node.text(),
          replacement,
        });
      }
    } catch {
      // Skip files that can't be parsed
      continue;
    }
  }

  return {
    matches,
    totalMatches: matches.length,
    language: lang,
  };
};
