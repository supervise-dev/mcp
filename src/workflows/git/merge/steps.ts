import { createErrorResult } from "./conditions";
import {
  conflictResolutionSchema,
  mergeInputSchema,
  mergeOutputSchema,
  mergeResultStateSchema,
  mergeStateSchema,
} from "./schema";
import { branchTool, diffTool, mergeTool, statusTool } from "@/tools/git";
import { createStep } from "@mastra/core/workflows";
import { z } from "zod";

export const checkStatusStep = createStep({
  id: "check-status",
  description: "Check repository status including working directory cleanliness",
  inputSchema: mergeInputSchema,
  outputSchema: mergeStateSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const status = await statusTool.execute({
      context: { path: inputData.path },
      runtimeContext,
    });

    return {
      path: inputData.path,
      from: inputData.from,
      noFF: inputData.noFF,
      squash: inputData.squash,
      currentBranch: status.current,
      isClean: status.isClean,
      conflicted: status.conflicted,
    };
  },
});

export const dirtyWorkingDirStep = createStep({
  id: "dirty-working-dir-error",
  description: "Return error when working directory has uncommitted changes",
  inputSchema: mergeStateSchema,
  outputSchema: mergeOutputSchema,
  execute: async ({ inputData }) =>
    createErrorResult(inputData, "Working directory is not clean. Please commit or stash your changes before merging."),
});

export const unresolvedConflictsStep = createStep({
  id: "unresolved-conflicts-error",
  description: "Return error when repository has unresolved merge conflicts",
  inputSchema: mergeStateSchema,
  outputSchema: mergeOutputSchema,
  execute: async ({ inputData }) =>
    createErrorResult(
      inputData,
      `Repository has unresolved conflicts in: ${inputData.conflicted?.join(", ") || "unknown files"}`,
    ),
});

export const validateBranchStep = createStep({
  id: "validate-branch",
  description: "Check if the source branch exists",
  inputSchema: mergeStateSchema,
  outputSchema: mergeStateSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const branches = await branchTool.execute({
      context: { path: inputData.path },
      runtimeContext,
    });

    const exists = branches.all.some((b) => b === inputData.from || b === `remotes/origin/${inputData.from}`);

    return { ...inputData, branchExists: exists, allBranches: branches.all };
  },
});

export const branchNotFoundStep = createStep({
  id: "branch-not-found-error",
  description: "Return error when the source branch does not exist",
  inputSchema: mergeStateSchema,
  outputSchema: mergeOutputSchema,
  execute: async ({ inputData }) =>
    createErrorResult(
      inputData,
      `Branch '${inputData.from}' does not exist. Available branches: ${inputData.allBranches?.join(", ") || "none"}`,
    ),
});

export const previewChangesStep = createStep({
  id: "preview-changes",
  description: "Get diff between current branch and source branch",
  inputSchema: mergeStateSchema,
  outputSchema: mergeStateSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const diff = await diffTool.execute({
      context: {
        path: inputData.path,
        options: {
          from: inputData.currentBranch || "HEAD",
          to: inputData.from,
          nameOnly: true,
        },
      },
      runtimeContext,
    });

    return { ...inputData, diffPreview: diff.diff, changedFiles: diff.files || [] };
  },
});

export const executeMergeStep = createStep({
  id: "execute-merge",
  description: "Perform the git merge operation",
  inputSchema: mergeStateSchema,
  outputSchema: mergeResultStateSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const result = await mergeTool.execute({
      context: {
        path: inputData.path,
        from: inputData.from,
        options: { noFF: inputData.noFF, squash: inputData.squash },
      },
      runtimeContext,
    });

    const hasConflicts = (result.conflicts?.length ?? 0) > 0;
    const conflictFiles = result.conflicts
      ?.map((c) => c.file)
      .filter(Boolean)
      .join(", ");

    return {
      path: inputData.path,
      success: result.success && !hasConflicts,
      merged: result.success,
      from: inputData.from,
      into: inputData.currentBranch ?? null,
      conflicts: result.conflicts || [],
      changedFiles: inputData.changedFiles,
      error: hasConflicts ? `Merge has conflicts. Resolve in: ${conflictFiles}` : undefined,
    };
  },
});

export const analyzeConflictsStep = createStep({
  id: "analyze-conflicts",
  description: "Use AI agent to analyze merge conflicts and suggest resolutions",
  inputSchema: mergeResultStateSchema,
  outputSchema: mergeOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("git-agent");
    if (!agent || inputData.conflicts.length === 0) {
      return inputData;
    }

    const conflictFiles = inputData.conflicts.map((c) => c.file).filter(Boolean);
    const prompt = `Analyze these merge conflicts and provide resolution suggestions:

Branch being merged: ${inputData.from}
Target branch: ${inputData.into}
Conflicting files: ${conflictFiles.join(", ")}
Repository path: ${inputData.path || "current directory"}

Please:
1. Briefly explain what likely caused these conflicts
2. For each file, suggest a resolution approach
3. Provide any helpful git commands`;

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

export const successStep = createStep({
  id: "success",
  description: "Return successful merge result",
  inputSchema: mergeResultStateSchema,
  outputSchema: mergeOutputSchema,
  execute: async ({ inputData }) => {
    const { path: _, ...output } = inputData;
    return output;
  },
});
