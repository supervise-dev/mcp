import {
  addMutation,
  checkoutMutation,
  cloneMutation,
  commitMutation,
  createTagMutation,
  fetchMutation,
  initMutation,
  mergeMutation,
  pullMutation,
  pushMutation,
  rebaseMutation,
} from "./index.mutate";
import { branchQuery, diffQuery, logQuery, remoteQuery, revParseQuery, statusQuery, tagQuery } from "./index.query";
import {
  addInput,
  addOutput,
  branchInput,
  branchOutput,
  checkoutInput,
  checkoutOutput,
  cloneInput,
  cloneOutput,
  commitInput,
  commitOutput,
  createTagInput,
  createTagOutput,
  diffInput,
  diffOutput,
  fetchInput,
  fetchOutput,
  initInput,
  initOutput,
  logInput,
  logOutput,
  mergeInput,
  mergeOutput,
  pullInput,
  pullOutput,
  pushInput,
  pushOutput,
  rebaseInput,
  rebaseOutput,
  remoteInput,
  remoteOutput,
  revParseInput,
  revParseOutput,
  statusInput,
  statusOutput,
  tagInput,
  tagOutput,
} from "./index.types";
import { createTool } from "@mastra/core/tools";

export const statusTool = createTool({
  id: "git.status",
  description: "Get the current status of a git repository including staged, modified, and untracked files",
  inputSchema: statusInput,
  outputSchema: statusOutput,
  execute: async ({ context }) => {
    return statusQuery({ input: context });
  },
});

export const logTool = createTool({
  id: "git.log",
  description: "Get commit history from a git repository with optional filtering",
  inputSchema: logInput,
  outputSchema: logOutput,
  execute: async ({ context }) => {
    return logQuery({ input: context });
  },
});

export const diffTool = createTool({
  id: "git.diff",
  description: "Show differences between commits, branches, or working tree",
  inputSchema: diffInput,
  outputSchema: diffOutput,
  execute: async ({ context }) => {
    return diffQuery({ input: context });
  },
});

export const branchTool = createTool({
  id: "git.branch",
  description: "List all branches in the repository and show the current branch",
  inputSchema: branchInput,
  outputSchema: branchOutput,
  execute: async ({ context }) => {
    return branchQuery({ input: context });
  },
});

export const remoteTool = createTool({
  id: "git.remote",
  description: "List all remote repositories configured for the local repository",
  inputSchema: remoteInput,
  outputSchema: remoteOutput,
  execute: async ({ context }) => {
    return remoteQuery({ input: context });
  },
});

export const tagTool = createTool({
  id: "git.tag",
  description: "List all tags in the repository",
  inputSchema: tagInput,
  outputSchema: tagOutput,
  execute: async ({ context }) => {
    return tagQuery({ input: context });
  },
});

export const initTool = createTool({
  id: "git.init",
  description: "Initialize a new git repository at the specified path",
  inputSchema: initInput,
  outputSchema: initOutput,
  execute: async ({ context }) => {
    return initMutation({ input: context });
  },
});

export const cloneTool = createTool({
  id: "git.clone",
  description: "Clone a remote git repository to a local path with optional depth and branch settings",
  inputSchema: cloneInput,
  outputSchema: cloneOutput,
  execute: async ({ context }) => {
    return cloneMutation({ input: context });
  },
});

export const addTool = createTool({
  id: "git.add",
  description: "Add files to the staging area for the next commit",
  inputSchema: addInput,
  outputSchema: addOutput,
  execute: async ({ context }) => {
    return addMutation({ input: context });
  },
});

export const commitTool = createTool({
  id: "git.commit",
  description: "Create a new commit with staged changes and a commit message",
  inputSchema: commitInput,
  outputSchema: commitOutput,
  execute: async ({ context }) => {
    return commitMutation({ input: context });
  },
});

export const pushTool = createTool({
  id: "git.push",
  description: "Push local commits to a remote repository",
  inputSchema: pushInput,
  outputSchema: pushOutput,
  execute: async ({ context }) => {
    return pushMutation({ input: context });
  },
});

export const pullTool = createTool({
  id: "git.pull",
  description: "Pull changes from a remote repository and merge them into the current branch",
  inputSchema: pullInput,
  outputSchema: pullOutput,
  execute: async ({ context }) => {
    return pullMutation({ input: context });
  },
});

export const checkoutTool = createTool({
  id: "git.checkout",
  description: "Switch to a different branch or create a new branch",
  inputSchema: checkoutInput,
  outputSchema: checkoutOutput,
  execute: async ({ context }) => {
    return checkoutMutation({ input: context });
  },
});

export const mergeTool = createTool({
  id: "git.merge",
  description: "Merge changes from another branch into the current branch",
  inputSchema: mergeInput,
  outputSchema: mergeOutput,
  execute: async ({ context }) => {
    return mergeMutation({ input: context });
  },
});

export const createTagTool = createTool({
  id: "git.createTag",
  description: "Create a new tag at the current commit with optional message",
  inputSchema: createTagInput,
  outputSchema: createTagOutput,
  execute: async ({ context }) => {
    return createTagMutation({ input: context });
  },
});

export const fetchTool = createTool({
  id: "git.fetch",
  description: "Fetch branches and/or tags from remote repository",
  inputSchema: fetchInput,
  outputSchema: fetchOutput,
  execute: async ({ context }) => {
    return fetchMutation({ input: context });
  },
});

export const rebaseTool = createTool({
  id: "git.rebase",
  description: "Rebase current branch onto another branch or commit",
  inputSchema: rebaseInput,
  outputSchema: rebaseOutput,
  execute: async ({ context }) => {
    return rebaseMutation({ input: context });
  },
});

export const revParseTool = createTool({
  id: "git.revParse",
  description: "Get the commit hash for a git reference",
  inputSchema: revParseInput,
  outputSchema: revParseOutput,
  execute: async ({ context }) => {
    return revParseQuery({ input: context });
  },
});

export {
  addMutation,
  checkoutMutation,
  cloneMutation,
  commitMutation,
  createTagMutation,
  fetchMutation,
  initMutation,
  mergeMutation,
  pullMutation,
  pushMutation,
  rebaseMutation,
} from "./index.mutate";
export { branchQuery, diffQuery, logQuery, remoteQuery, revParseQuery, statusQuery, tagQuery } from "./index.query";
