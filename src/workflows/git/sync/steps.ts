import { createErrorResult } from "./conditions";
import {
  conflictResolutionSchema,
  rebaseLoopStateSchema,
  syncInputSchema,
  syncOutputSchema,
  syncResultStateSchema,
  syncStateSchema,
} from "./schema";
import { branchTool, fetchTool, mergeTool, pushTool, rebaseTool, revParseTool, statusTool } from "@/tools/git";
import { createStep } from "@mastra/core/workflows";
import { z } from "zod";

export const fetchRemoteStep = createStep({
  id: "fetch-remote",
  description: "Fetch latest state from remote repository",
  inputSchema: syncInputSchema,
  outputSchema: syncStateSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const remote = inputData.remote || "origin";

    await fetchTool.execute({
      context: { path: inputData.path, remote, options: { prune: true } },
      runtimeContext,
    });

    const status = await statusTool.execute({
      context: { path: inputData.path },
      runtimeContext,
    });

    return {
      path: inputData.path,
      source: inputData.source,
      remote,
      strategy: inputData.strategy || "rebase",
      push: inputData.push !== false,
      forcePush: inputData.forcePush ?? inputData.strategy === "rebase",
      targetBranch: status.current,
      isClean: status.isClean,
      conflicted: status.conflicted,
    };
  },
});

export const analyzeDivergenceStep = createStep({
  id: "analyze-divergence",
  description: "Check how far target has diverged from source",
  inputSchema: syncStateSchema,
  outputSchema: syncStateSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const branches = await branchTool.execute({
      context: { path: inputData.path },
      runtimeContext,
    });

    const sourceBranch = inputData.source.includes("/") ? inputData.source : `${inputData.remote}/${inputData.source}`;

    const sourceExists = branches.all.some(
      (b) => b === sourceBranch || b === inputData.source || b === `remotes/${sourceBranch}`,
    );

    if (!sourceExists) {
      return { ...inputData, sourceBranch, sourceExists: false, needsSync: false };
    }

    try {
      const targetHash = await revParseTool.execute({
        context: { path: inputData.path, ref: inputData.targetBranch || "HEAD" },
        runtimeContext,
      });

      const sourceHash = await revParseTool.execute({
        context: { path: inputData.path, ref: sourceBranch },
        runtimeContext,
      });

      const mergeBaseHash = await revParseTool
        .execute({
          context: {
            path: inputData.path,
            ref: `$(git merge-base ${inputData.targetBranch || "HEAD"} ${sourceBranch})`,
          },
          runtimeContext,
        })
        .catch(() => ({ hash: "" }));

      const needsSync = sourceHash.hash !== mergeBaseHash.hash;

      return {
        ...inputData,
        sourceBranch,
        sourceExists: true,
        needsSync,
        commitsAhead: 0,
        commitsBehind: needsSync ? 1 : 0,
      };
    } catch {
      return {
        ...inputData,
        sourceBranch,
        sourceExists: true,
        needsSync: true,
      };
    }
  },
});

export const dirtyWorkingDirStep = createStep({
  id: "dirty-working-dir-error",
  description: "Return error when working directory has uncommitted changes",
  inputSchema: syncStateSchema,
  outputSchema: syncOutputSchema,
  execute: async ({ inputData }) =>
    createErrorResult(inputData, "Working directory is not clean. Please commit or stash your changes before syncing."),
});

export const unresolvedConflictsStep = createStep({
  id: "unresolved-conflicts-error",
  description: "Return error when repository has unresolved conflicts",
  inputSchema: syncStateSchema,
  outputSchema: syncOutputSchema,
  execute: async ({ inputData }) =>
    createErrorResult(
      inputData,
      `Repository has unresolved conflicts in: ${inputData.conflicted?.join(", ") || "unknown files"}`,
    ),
});

export const sourceNotFoundStep = createStep({
  id: "source-not-found-error",
  description: "Return error when source branch does not exist",
  inputSchema: syncStateSchema,
  outputSchema: syncOutputSchema,
  execute: async ({ inputData }) =>
    createErrorResult(inputData, `Source branch '${inputData.source}' does not exist on remote '${inputData.remote}'.`),
});

export const alreadySyncedStep = createStep({
  id: "already-synced",
  description: "Return success when no sync is needed",
  inputSchema: syncStateSchema,
  outputSchema: syncOutputSchema,
  execute: async ({ inputData }) => ({
    success: true,
    synced: false,
    strategy: "none" as const,
    targetBranch: inputData.targetBranch ?? null,
    sourceBranch: inputData.sourceBranch || inputData.source,
    pushed: false,
    commitsAhead: inputData.commitsAhead,
    commitsBehind: 0,
  }),
});

export const executeSyncStep = createStep({
  id: "execute-sync",
  description: "Perform rebase or merge to sync with source",
  inputSchema: syncStateSchema,
  outputSchema: syncResultStateSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const sourceBranch = inputData.sourceBranch || `${inputData.remote}/${inputData.source}`;

    if (inputData.strategy === "rebase") {
      const result = await rebaseTool.execute({
        context: { path: inputData.path, onto: sourceBranch },
        runtimeContext,
      });

      if (!result.completed && result.conflicts && result.conflicts.length > 0) {
        return {
          path: inputData.path,
          remote: inputData.remote,
          forcePush: true,
          success: false,
          synced: false,
          strategy: "rebase" as const,
          targetBranch: inputData.targetBranch ?? null,
          sourceBranch,
          pushed: false,
          conflicts: result.conflicts,
          error: `Rebase stopped due to conflicts in: ${result.conflicts.map((c) => c.file).join(", ")}`,
        };
      }

      return {
        path: inputData.path,
        remote: inputData.remote,
        forcePush: true,
        success: true,
        synced: true,
        strategy: "rebase" as const,
        targetBranch: inputData.targetBranch ?? null,
        sourceBranch,
        pushed: false,
        commitsBehind: 0,
      };
    }

    const result = await mergeTool.execute({
      context: { path: inputData.path, from: sourceBranch },
      runtimeContext,
    });

    if (result.conflicts && result.conflicts.length > 0) {
      return {
        path: inputData.path,
        remote: inputData.remote,
        forcePush: false,
        success: false,
        synced: false,
        strategy: "merge" as const,
        targetBranch: inputData.targetBranch ?? null,
        sourceBranch,
        pushed: false,
        conflicts: result.conflicts,
        error: `Merge has conflicts in: ${result.conflicts.map((c) => c.file).join(", ")}`,
      };
    }

    return {
      path: inputData.path,
      remote: inputData.remote,
      forcePush: false,
      success: true,
      synced: true,
      strategy: "merge" as const,
      targetBranch: inputData.targetBranch ?? null,
      sourceBranch,
      pushed: false,
      commitsBehind: 0,
    };
  },
});

export const analyzeConflictsStep = createStep({
  id: "analyze-conflicts",
  description: "Use AI agent to analyze sync conflicts and suggest resolutions",
  inputSchema: syncResultStateSchema,
  outputSchema: syncOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("git-agent");
    if (!agent || !inputData.conflicts || inputData.conflicts.length === 0) {
      return inputData;
    }

    const conflictFiles = inputData.conflicts.map((c) => c.file).filter(Boolean);
    const prompt = `Analyze these ${inputData.strategy} conflicts and provide resolution suggestions:

Strategy used: ${inputData.strategy}
Source branch: ${inputData.sourceBranch}
Target branch: ${inputData.targetBranch}
Conflicting files: ${conflictFiles.join(", ")}
Repository path: ${inputData.path || "current directory"}

Please:
1. Explain what likely caused these conflicts during the ${inputData.strategy}
2. For each file, suggest a resolution approach
3. Provide git commands to resolve (including how to continue the ${inputData.strategy})`;

    try {
      const response = await agent.generate(prompt, {
        structuredOutput: {
          schema: z.object({
            analysis: z.string(),
            suggestions: z.array(conflictResolutionSchema),
          }),
        },
      });

      return {
        ...inputData,
        resolution: response.object,
      };
    } catch {
      return inputData;
    }
  },
});

export const pushChangesStep = createStep({
  id: "push-changes",
  description: "Push synced changes to remote",
  inputSchema: syncResultStateSchema,
  outputSchema: syncOutputSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const result = await pushTool.execute({
      context: {
        path: inputData.path,
        remote: inputData.remote,
        options: { force: inputData.forcePush },
      },
      runtimeContext,
    });

    return {
      ...inputData,
      pushed: result.success,
      error: result.success ? undefined : "Failed to push changes to remote",
    };
  },
});

export const skipPushStep = createStep({
  id: "skip-push",
  description: "Skip push and return result",
  inputSchema: syncResultStateSchema,
  outputSchema: syncOutputSchema,
  execute: async ({ inputData }) => ({
    ...inputData,
    pushed: false,
  }),
});

export const startRebaseStep = createStep({
  id: "start-rebase",
  description: "Start rebase onto source branch",
  inputSchema: syncStateSchema,
  outputSchema: rebaseLoopStateSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const sourceBranch = inputData.sourceBranch || `${inputData.remote}/${inputData.source}`;

    const result = await rebaseTool.execute({
      context: { path: inputData.path, onto: sourceBranch },
      runtimeContext,
    });

    if (result.completed) {
      return {
        path: inputData.path,
        remote: inputData.remote,
        sourceBranch,
        targetBranch: inputData.targetBranch ?? null,
        forcePush: true,
        rebaseCompleted: true,
        iterationCount: 0,
        maxIterations: 50,
        resolvedCommits: 0,
      };
    }

    return {
      path: inputData.path,
      remote: inputData.remote,
      sourceBranch,
      targetBranch: inputData.targetBranch ?? null,
      forcePush: true,
      rebaseCompleted: false,
      iterationCount: 0,
      maxIterations: 50,
      conflicts: result.conflicts,
      resolvedCommits: 0,
    };
  },
});

export const processRebaseConflictStep = createStep({
  id: "process-rebase-conflict",
  description: "Analyze current conflict and attempt to continue rebase",
  inputSchema: rebaseLoopStateSchema,
  outputSchema: rebaseLoopStateSchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    const newIteration = inputData.iterationCount + 1;

    if (newIteration > inputData.maxIterations) {
      await rebaseTool.execute({
        context: { path: inputData.path, onto: "", options: { abort: true } },
        runtimeContext,
      });

      return {
        ...inputData,
        iterationCount: newIteration,
        rebaseCompleted: false,
        rebaseAborted: true,
        error: `Rebase aborted: exceeded maximum iterations (${inputData.maxIterations}). Too many conflicts to resolve automatically.`,
      };
    }

    if (inputData.rebaseCompleted || !inputData.conflicts?.length) {
      return { ...inputData, iterationCount: newIteration, rebaseCompleted: true };
    }

    const agent = mastra?.getAgent("git-agent");
    let resolution = inputData.resolution;

    if (agent && inputData.conflicts.length > 0) {
      const conflictFiles = inputData.conflicts.map((c) => c.file).filter(Boolean);
      const prompt = `Analyze this rebase conflict (commit ${inputData.resolvedCommits + 1}) and provide resolution:

Source branch: ${inputData.sourceBranch}
Target branch: ${inputData.targetBranch}
Conflicting files: ${conflictFiles.join(", ")}
Iteration: ${newIteration}/${inputData.maxIterations}
${inputData.currentCommitMessage ? `Current commit: ${inputData.currentCommitMessage}` : ""}

Please:
1. Explain what caused this specific conflict
2. For each file, suggest how to resolve it
3. Provide the git commands to resolve and continue rebase`;

      try {
        const response = await agent.generate(prompt, {
          structuredOutput: {
            schema: z.object({
              analysis: z.string(),
              suggestions: z.array(conflictResolutionSchema),
            }),
          },
        });
        resolution = response.object;
      } catch {
        // Continue without agent analysis
      }
    }

    // For now, return with conflicts for manual resolution
    // In a full implementation, the agent could actually resolve files
    return {
      ...inputData,
      iterationCount: newIteration,
      rebaseCompleted: false,
      resolution,
      error: `Rebase paused at commit ${inputData.resolvedCommits + 1}. Manual conflict resolution required.`,
    };
  },
});

export const continueRebaseStep = createStep({
  id: "continue-rebase",
  description: "Continue rebase after conflict resolution",
  inputSchema: rebaseLoopStateSchema,
  outputSchema: rebaseLoopStateSchema,
  execute: async ({ inputData, runtimeContext }) => {
    if (inputData.rebaseCompleted || inputData.rebaseAborted) {
      return inputData;
    }

    const status = await statusTool.execute({
      context: { path: inputData.path },
      runtimeContext,
    });

    if (status.conflicted.length > 0) {
      return {
        ...inputData,
        conflicts: status.conflicted.map((file) => ({ reason: "content conflict", file })),
      };
    }

    const result = await rebaseTool.execute({
      context: { path: inputData.path, onto: "", options: { continue: true } },
      runtimeContext,
    });

    if (result.completed) {
      return {
        ...inputData,
        rebaseCompleted: true,
        resolvedCommits: inputData.resolvedCommits + 1,
        conflicts: [],
      };
    }

    return {
      ...inputData,
      resolvedCommits: inputData.resolvedCommits + 1,
      conflicts: result.conflicts,
    };
  },
});

export const rebaseLoopToResultStep = createStep({
  id: "rebase-loop-to-result",
  description: "Convert rebase loop state to sync result",
  inputSchema: rebaseLoopStateSchema,
  outputSchema: syncResultStateSchema,
  execute: async ({ inputData }) => ({
    path: inputData.path,
    remote: inputData.remote,
    forcePush: inputData.forcePush,
    success: inputData.rebaseCompleted && !inputData.rebaseAborted,
    synced: inputData.rebaseCompleted && !inputData.rebaseAborted,
    strategy: "rebase" as const,
    targetBranch: inputData.targetBranch,
    sourceBranch: inputData.sourceBranch,
    pushed: false,
    conflicts: inputData.conflicts,
    error: inputData.error,
    resolution: inputData.resolution,
    commitsBehind: inputData.rebaseCompleted ? 0 : undefined,
  }),
});
