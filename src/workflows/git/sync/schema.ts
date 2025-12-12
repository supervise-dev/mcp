import { z } from "zod";

export const conflictSchema = z.object({
  reason: z.string(),
  file: z.string().nullable(),
  meta: z.any().optional(),
});

export type Conflict = z.infer<typeof conflictSchema>;

export const syncInputSchema = z.object({
  path: z.string().optional().describe("Repository path (defaults to current directory)"),
  source: z.string().describe("Source branch to sync with (e.g., 'main', 'origin/main')"),
  remote: z.string().optional().describe("Remote name (defaults to 'origin')"),
  strategy: z
    .enum(["rebase", "merge"])
    .optional()
    .describe("Sync strategy: 'rebase' for clean history, 'merge' for preserving history"),
  push: z.boolean().optional().describe("Push to remote after sync (defaults to true)"),
  forcePush: z.boolean().optional().describe("Use force push with lease (required after rebase)"),
});

export type SyncInput = z.infer<typeof syncInputSchema>;

export const conflictResolutionSchema = z.object({
  file: z.string().describe("File with conflict"),
  suggestion: z.string().describe("Suggested resolution approach"),
  commands: z.array(z.string()).optional().describe("Git commands to help resolve"),
});

export type ConflictResolution = z.infer<typeof conflictResolutionSchema>;

export const syncOutputSchema = z.object({
  success: z.boolean().describe("Whether the sync completed successfully"),
  synced: z.boolean().describe("Whether any sync was needed/performed"),
  strategy: z.enum(["rebase", "merge", "none"]).describe("Strategy used for sync"),
  targetBranch: z.string().nullable().describe("Current branch that was synced"),
  sourceBranch: z.string().describe("Source branch synced with"),
  pushed: z.boolean().describe("Whether changes were pushed to remote"),
  conflicts: z.array(conflictSchema).optional().describe("Conflicts if sync failed"),
  commitsAhead: z.number().optional().describe("Commits ahead of source after sync"),
  commitsBehind: z.number().optional().describe("Commits behind source (should be 0 after sync)"),
  error: z.string().optional().describe("Error message if sync failed"),
  resolution: z
    .object({
      analysis: z.string().describe("Agent analysis of the conflicts"),
      suggestions: z.array(conflictResolutionSchema).describe("Per-file resolution suggestions"),
    })
    .optional()
    .describe("AI-powered conflict resolution guidance"),
});

export type SyncOutput = z.infer<typeof syncOutputSchema>;

export const syncStateSchema = z.object({
  path: z.string().optional(),
  source: z.string(),
  remote: z.string(),
  strategy: z.enum(["rebase", "merge"]),
  push: z.boolean(),
  forcePush: z.boolean(),
  targetBranch: z.string().nullable().optional(),
  sourceBranch: z.string().optional(),
  isClean: z.boolean().optional(),
  conflicted: z.array(z.string()).optional(),
  commitsAhead: z.number().optional(),
  commitsBehind: z.number().optional(),
  needsSync: z.boolean().optional(),
  sourceExists: z.boolean().optional(),
  remoteTargetAhead: z.boolean().optional(),
});

export type SyncState = z.infer<typeof syncStateSchema>;

export const syncResultStateSchema = syncOutputSchema.extend({
  path: z.string().optional(),
  remote: z.string().optional(),
  forcePush: z.boolean().optional(),
});

export type SyncResultState = z.infer<typeof syncResultStateSchema>;

export const rebaseLoopStateSchema = z.object({
  path: z.string().optional(),
  remote: z.string(),
  sourceBranch: z.string(),
  targetBranch: z.string().nullable(),
  forcePush: z.boolean(),
  rebaseCompleted: z.boolean(),
  rebaseAborted: z.boolean().optional(),
  iterationCount: z.number(),
  maxIterations: z.number(),
  conflicts: z.array(conflictSchema).optional(),
  resolvedCommits: z.number(),
  currentCommitMessage: z.string().optional(),
  resolution: z
    .object({
      analysis: z.string(),
      suggestions: z.array(conflictResolutionSchema),
    })
    .optional(),
  error: z.string().optional(),
});

export type RebaseLoopState = z.infer<typeof rebaseLoopStateSchema>;
