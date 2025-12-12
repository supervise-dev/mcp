import type { RebaseLoopState, SyncOutput, SyncResultState, SyncState } from "./schema";

export const createErrorResult = (state: SyncState, error: string): SyncOutput => ({
  success: false,
  synced: false,
  strategy: "none",
  targetBranch: state.targetBranch ?? null,
  sourceBranch: state.source,
  pushed: false,
  error,
});

export const isDirtyWorkingDir = async ({ inputData }: { inputData: SyncState }) => inputData.isClean === false;

export const hasUnresolvedConflicts = async ({ inputData }: { inputData: SyncState }) =>
  (inputData.conflicted?.length ?? 0) > 0;

export const sourceDoesNotExist = async ({ inputData }: { inputData: SyncState }) => inputData.sourceExists === false;

export const noSyncNeeded = async ({ inputData }: { inputData: SyncState }) => inputData.needsSync === false;

export const syncNeeded = async ({ inputData }: { inputData: SyncState }) =>
  inputData.needsSync === true && inputData.sourceExists === true;

export const isReadyForSync = async ({ inputData }: { inputData: SyncState }) =>
  inputData.isClean === true && (inputData.conflicted?.length ?? 0) === 0 && inputData.sourceExists === true;

export const hasSyncConflicts = async ({ inputData }: { inputData: SyncResultState }) =>
  (inputData.conflicts?.length ?? 0) > 0;

export const syncSucceeded = async ({ inputData }: { inputData: SyncResultState }) =>
  inputData.success && (inputData.conflicts?.length ?? 0) === 0;

export const rebaseIsComplete = async ({ inputData }: { inputData: RebaseLoopState }) =>
  inputData.rebaseCompleted || inputData.rebaseAborted === true;

export const rebaseHasConflicts = async ({ inputData }: { inputData: RebaseLoopState }) =>
  !inputData.rebaseCompleted && inputData.rebaseAborted !== true && (inputData.conflicts?.length ?? 0) > 0;

export const useRebaseStrategy = async ({ inputData }: { inputData: SyncState }) => inputData.strategy === "rebase";

export const useMergeStrategy = async ({ inputData }: { inputData: SyncState }) => inputData.strategy === "merge";
