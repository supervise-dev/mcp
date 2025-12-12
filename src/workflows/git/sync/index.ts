import {
  hasSyncConflicts,
  hasUnresolvedConflicts,
  isDirtyWorkingDir,
  isReadyForSync,
  noSyncNeeded,
  rebaseIsComplete,
  sourceDoesNotExist,
  syncNeeded,
  syncSucceeded,
  useMergeStrategy,
  useRebaseStrategy,
} from "./conditions";
import { syncInputSchema, syncOutputSchema, syncResultStateSchema, syncStateSchema } from "./schema";
import {
  alreadySyncedStep,
  analyzeConflictsStep,
  analyzeDivergenceStep,
  dirtyWorkingDirStep,
  executeSyncStep,
  fetchRemoteStep,
  processRebaseConflictStep,
  pushChangesStep,
  rebaseLoopToResultStep,
  sourceNotFoundStep,
  startRebaseStep,
  unresolvedConflictsStep,
} from "./steps";
import { createWorkflow } from "@mastra/core/workflows";

const handleSyncResultWorkflow = createWorkflow({
  id: "handle-sync-result",
  description: "Handle sync result - analyze conflicts or push changes",
  inputSchema: syncResultStateSchema,
  outputSchema: syncOutputSchema,
})
  .branch([
    [hasSyncConflicts, analyzeConflictsStep],
    [syncSucceeded, pushChangesStep],
  ])
  .commit();

const rebaseWithConflictLoopWorkflow = createWorkflow({
  id: "rebase-with-conflict-loop",
  description: "Rebase with iterative conflict resolution",
  inputSchema: syncStateSchema,
  outputSchema: syncOutputSchema,
})
  .then(startRebaseStep)
  .dountil(processRebaseConflictStep, rebaseIsComplete)
  .then(rebaseLoopToResultStep)
  .then(handleSyncResultWorkflow)
  .commit();

const mergeWorkflow = createWorkflow({
  id: "merge-sync",
  description: "Sync using merge strategy",
  inputSchema: syncStateSchema,
  outputSchema: syncOutputSchema,
})
  .then(executeSyncStep)
  .then(handleSyncResultWorkflow)
  .commit();

const executeSyncByStrategyWorkflow = createWorkflow({
  id: "execute-sync-by-strategy",
  description: "Execute sync using appropriate strategy",
  inputSchema: syncStateSchema,
  outputSchema: syncOutputSchema,
})
  .branch([
    [useRebaseStrategy, rebaseWithConflictLoopWorkflow],
    [useMergeStrategy, mergeWorkflow],
  ])
  .commit();

const checkSyncNeededWorkflow = createWorkflow({
  id: "check-sync-needed",
  description: "Check if sync is needed and execute",
  inputSchema: syncStateSchema,
  outputSchema: syncOutputSchema,
})
  .branch([
    [sourceDoesNotExist, sourceNotFoundStep],
    [noSyncNeeded, alreadySyncedStep],
    [syncNeeded, executeSyncByStrategyWorkflow],
  ])
  .commit();

const validateAndSyncWorkflow = createWorkflow({
  id: "validate-and-sync",
  description: "Validate state and perform sync",
  inputSchema: syncStateSchema,
  outputSchema: syncOutputSchema,
})
  .then(analyzeDivergenceStep)
  .then(checkSyncNeededWorkflow)
  .commit();

/**
 * Git Sync Workflow
 *
 * Keeps your working branch up-to-date with a source branch:
 *
 * 1. Fetch latest from remote
 * 2. Analyze divergence between target and source
 * 3. If behind, sync using rebase (default) or merge
 * 4. For rebase: loop through each commit's conflicts with AI assistance
 * 5. Push changes to remote (force push if rebased)
 *
 * The rebase strategy uses `dountil` to handle multiple commits:
 *
 * - Each commit that conflicts is processed individually
 * - AI agent analyzes and suggests resolutions per commit
 * - Loop continues until rebase completes or is aborted
 *
 * Use cases:
 *
 * - Keep feature branch synced with main
 * - Update PR branch before merge
 * - Stay current with upstream changes
 */
export const gitSyncWorkflow = createWorkflow({
  id: "git-sync",
  description: "Sync current branch with source branch using rebase or merge",
  inputSchema: syncInputSchema,
  outputSchema: syncOutputSchema,
})
  .then(fetchRemoteStep)
  .branch([
    [isDirtyWorkingDir, dirtyWorkingDirStep],
    [hasUnresolvedConflicts, unresolvedConflictsStep],
    [isReadyForSync, validateAndSyncWorkflow],
  ])
  .commit();

export * from "./schema";
