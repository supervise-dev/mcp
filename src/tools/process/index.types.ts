import { z } from "zod";

/** Input schema for spawning a process */
export const spawnInput = z.object({
  command: z.array(z.string()).min(1).describe("Command and arguments to execute as an array (e.g., ['ls', '-la'])"),
  options: z
    .object({
      cwd: z.string().optional().describe("Working directory for the process"),
      env: z.record(z.string(), z.any()).optional().describe("Environment variables for the process"),
      stdin: z
        .enum(["pipe", "inherit", "ignore"])
        .optional()
        .describe("How to handle stdin: 'pipe' for piping, 'inherit' to use parent's, 'ignore' to ignore"),
      stdout: z
        .enum(["pipe", "inherit", "ignore"])
        .optional()
        .describe("How to handle stdout: 'pipe' for capturing, 'inherit' to use parent's, 'ignore' to ignore"),
      stderr: z
        .enum(["pipe", "inherit", "ignore"])
        .optional()
        .describe("How to handle stderr: 'pipe' for capturing, 'inherit' to use parent's, 'ignore' to ignore"),
    })
    .optional()
    .describe("Optional configuration for process spawning"),
});

/** Input schema for executing a shell command */
export const execInput = z.object({
  command: z.string().describe("Shell command to execute as a string (e.g., 'ls -la | grep test')"),
  options: z
    .object({
      cwd: z.string().optional().describe("Working directory for the command"),
      env: z.record(z.string(), z.any()).optional().describe("Environment variables for the command"),
      shell: z
        .boolean()
        .optional()
        .describe("Whether to run the command in a shell (enables shell features like pipes)"),
    })
    .optional()
    .describe("Optional configuration for command execution"),
});

/** Output schema for process execution */
export const processOutput = z.object({
  stdout: z.string().describe("Standard output from the process"),
  stderr: z.string().describe("Standard error output from the process"),
  exitCode: z.number().nullable().describe("Exit code of the process (0 typically means success, null if terminated)"),
  success: z.boolean().describe("Whether the process executed successfully (exitCode === 0)"),
});

export type SpawnInput = z.infer<typeof spawnInput>;
export type ExecInput = z.infer<typeof execInput>;
export type ProcessOutput = z.infer<typeof processOutput>;
