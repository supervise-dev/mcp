import type { MergeOutput, MergeResultState, MergeState } from "./schema";

export const createErrorResult = (state: MergeState, error: string): MergeOutput => ({
  success: false,
  merged: false,
  from: state.from,
  into: state.currentBranch ?? null,
  conflicts: [],
  changedFiles: [],
  error,
});

export const isDirtyWorkingDir = async ({ inputData }: { inputData: MergeState }) => inputData.isClean === false;

export const hasUnresolvedConflicts = async ({ inputData }: { inputData: MergeState }) =>
  (inputData.conflicted?.length ?? 0) > 0;

export const isReadyForValidation = async ({ inputData }: { inputData: MergeState }) =>
  inputData.isClean === true && (inputData.conflicted?.length ?? 0) === 0;

export const branchDoesNotExist = async ({ inputData }: { inputData: MergeState }) => inputData.branchExists === false;

export const branchExists = async ({ inputData }: { inputData: MergeState }) => inputData.branchExists === true;

export const hasMergeConflicts = async ({ inputData }: { inputData: MergeResultState }) =>
  inputData.conflicts.length > 0;

export const mergeSucceeded = async ({ inputData }: { inputData: MergeResultState }) =>
  inputData.conflicts.length === 0;
