import { ExecInput, ProcessOutput, SpawnInput } from "./index.types";

/** Spawn a process with the given command and arguments */
export const spawnMutation = async ({ input }: { input: SpawnInput }): Promise<ProcessOutput> => {
  const [cmd, ...args] = input.command;

  const proc = Bun.spawn([cmd, ...args], {
    cwd: input.options?.cwd,
    env: input.options?.env,
    stdin: input.options?.stdin,
    stdout: input.options?.stdout ?? "pipe",
    stderr: input.options?.stderr ?? "pipe",
  });

  const [stdout, stderr] = await Promise.all([
    proc.stdout ? new Response(proc.stdout).text() : Promise.resolve(""),
    proc.stderr ? new Response(proc.stderr).text() : Promise.resolve(""),
  ]);

  const exitCode = await proc.exited;

  return {
    stdout,
    stderr,
    exitCode,
    success: exitCode === 0,
  };
};

/** Execute a shell command using Bun.$ */
export const execMutation = async ({ input }: { input: ExecInput }): Promise<ProcessOutput> => {
  try {
    const { $ } = await import("bun");

    // Set options if provided
    if (input.options?.cwd) {
      $.cwd(input.options.cwd);
    }

    if (input.options?.env) {
      $.env(input.options.env);
    }

    // Execute the command
    const result = await $`${input.command}`;

    return {
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
      exitCode: result.exitCode,
      success: result.exitCode === 0,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout?.toString() || "",
      stderr: error.stderr?.toString() || error.message || "Unknown error",
      exitCode: error.exitCode ?? 1,
      success: false,
    };
  }
};
