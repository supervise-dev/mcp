import {
  CountMatchesInput,
  CountMatchesOutput,
  FilesWithMatchesInput,
  FilesWithMatchesOutput,
  MatchOutput,
  SearchInput,
  SearchOutput,
} from "./index.types";
import { spawn } from "node:child_process";
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
