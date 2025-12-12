import { z } from "zod";

export const conflictSchema = z.object({
  reason: z.string(),
  file: z.string().nullable(),
  meta: z.any().optional(),
});

export type Conflict = z.infer<typeof conflictSchema>;

export const mergeInputSchema = z.object({
  path: z.string().optional().describe("Repository path (defaults to current directory)"),
  from: z.string().describe("Branch or commit to merge from"),
  noFF: z.boolean().optional().describe("Create a merge commit even if fast-forward is possible"),
  squash: z.boolean().optional().describe("Squash all commits into a single commit"),
});

export type MergeInput = z.infer<typeof mergeInputSchema>;

export const conflictResolutionSchema = z.object({
  file: z.string().describe("File with conflict"),
  suggestion: z.string().describe("Suggested resolution approach"),
  commands: z.array(z.string()).optional().describe("Git commands to help resolve"),
});

export type ConflictResolution = z.infer<typeof conflictResolutionSchema>;

export const mergeOutputSchema = z.object({
  success: z.boolean().describe("Whether the merge completed without errors or conflicts"),
  merged: z.boolean().describe("Whether the merge operation was executed"),
  from: z.string().describe("Source branch that was merged"),
  into: z.string().nullable().describe("Target branch that received the merge"),
  conflicts: z.array(conflictSchema).describe("List of merge conflicts, if any"),
  changedFiles: z.array(z.string()).optional().describe("Files affected by the merge"),
  error: z.string().optional().describe("Error message if the merge failed"),
  resolution: z
    .object({
      analysis: z.string().describe("Agent analysis of the conflicts"),
      suggestions: z.array(conflictResolutionSchema).describe("Per-file resolution suggestions"),
    })
    .optional()
    .describe("AI-powered conflict resolution guidance"),
});

export type MergeOutput = z.infer<typeof mergeOutputSchema>;

export const mergeStateSchema = z.object({
  path: z.string().optional(),
  from: z.string(),
  noFF: z.boolean().optional(),
  squash: z.boolean().optional(),
  currentBranch: z.string().nullable().optional(),
  isClean: z.boolean().optional(),
  conflicted: z.array(z.string()).optional(),
  branchExists: z.boolean().optional(),
  allBranches: z.array(z.string()).optional(),
  diffPreview: z.string().optional(),
  changedFiles: z.array(z.string()).optional(),
});

export type MergeState = z.infer<typeof mergeStateSchema>;

export const mergeResultStateSchema = mergeOutputSchema.extend({
  path: z.string().optional(),
});

export type MergeResultState = z.infer<typeof mergeResultStateSchema>;
