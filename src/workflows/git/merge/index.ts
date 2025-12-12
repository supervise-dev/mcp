import {
  branchDoesNotExist,
  branchExists,
  hasMergeConflicts,
  hasUnresolvedConflicts,
  isDirtyWorkingDir,
  isReadyForValidation,
  mergeSucceeded,
} from "./conditions";
import { mergeInputSchema, mergeOutputSchema, mergeResultStateSchema, mergeStateSchema } from "./schema";
import {
  analyzeConflictsStep,
  branchNotFoundStep,
  checkStatusStep,
  dirtyWorkingDirStep,
  executeMergeStep,
  previewChangesStep,
  successStep,
  unresolvedConflictsStep,
  validateBranchStep,
} from "./steps";
import { createWorkflow } from "@mastra/core/workflows";

const handleMergeResultWorkflow = createWorkflow({
  id: "handle-merge-result",
  description: "Handle merge result - analyze conflicts or return success",
  inputSchema: mergeResultStateSchema,
  outputSchema: mergeOutputSchema,
})
  .branch([
    [hasMergeConflicts, analyzeConflictsStep],
    [mergeSucceeded, successStep],
  ])
  .commit();

const previewAndMergeWorkflow = createWorkflow({
  id: "preview-and-merge",
  description: "Preview changes and execute merge",
  inputSchema: mergeStateSchema,
  outputSchema: mergeOutputSchema,
})
  .then(previewChangesStep)
  .then(executeMergeStep)
  .then(handleMergeResultWorkflow)
  .commit();

const validateAndMergeWorkflow = createWorkflow({
  id: "validate-and-merge",
  description: "Validate branch exists and perform merge",
  inputSchema: mergeStateSchema,
  outputSchema: mergeOutputSchema,
})
  .then(validateBranchStep)
  .branch([
    [branchDoesNotExist, branchNotFoundStep],
    [branchExists, previewAndMergeWorkflow],
  ])
  .commit();

/**
 * Git Merge Workflow
 *
 * Safely merges a branch into the current branch with validation:
 *
 * 1. Check repository status (clean working directory, no conflicts)
 * 2. Validate source branch exists
 * 3. Preview changes between branches
 * 4. Execute the merge operation
 * 5. If conflicts occur, use AI agent to analyze and suggest resolutions
 */
export const gitMergeWorkflow = createWorkflow({
  id: "git-merge",
  description: "Merge a branch into the current branch with validation and conflict detection",
  inputSchema: mergeInputSchema,
  outputSchema: mergeOutputSchema,
})
  .then(checkStatusStep)
  .branch([
    [isDirtyWorkingDir, dirtyWorkingDirStep],
    [hasUnresolvedConflicts, unresolvedConflictsStep],
    [isReadyForValidation, validateAndMergeWorkflow],
  ])
  .commit();

export * from "./schema";
