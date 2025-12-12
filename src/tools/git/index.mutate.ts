import {
  AddInput,
  AddOutput,
  CheckoutInput,
  CheckoutOutput,
  CloneInput,
  CloneOutput,
  CommitInput,
  CommitOutput,
  CreateTagInput,
  CreateTagOutput,
  FetchInput,
  FetchOutput,
  InitInput,
  InitOutput,
  MergeInput,
  MergeOutput,
  PullInput,
  PullOutput,
  PushInput,
  PushOutput,
  RebaseInput,
  RebaseOutput,
} from "./index.types";
import simpleGit from "simple-git";

export const initMutation = async ({ input }: { input: InitInput }): Promise<InitOutput> => {
  const git = simpleGit(input.path);
  await git.init(input.bare || false);

  return {
    success: true,
    path: input.path,
  };
};

export const cloneMutation = async ({ input }: { input: CloneInput }): Promise<CloneOutput> => {
  const git = simpleGit();
  const options: string[] = [];

  if (input.options?.depth) {
    options.push(`--depth=${input.options.depth}`);
  }

  if (input.options?.branch) {
    options.push(`--branch=${input.options.branch}`);
  }

  if (input.options?.singleBranch) {
    options.push("--single-branch");
  }

  await git.clone(input.repoUrl, input.localPath, options);

  return {
    success: true,
    path: input.localPath,
  };
};

export const addMutation = async ({ input }: { input: AddInput }): Promise<AddOutput> => {
  const git = simpleGit(input.path || process.cwd());
  await git.add(input.files);

  return {
    success: true,
  };
};

export const commitMutation = async ({ input }: { input: CommitInput }): Promise<CommitOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const options: any = {};

  if (input.options?.author) {
    options["--author"] = `${input.options.author.name} <${input.options.author.email}>`;
  }

  if (input.options?.amend) {
    options["--amend"] = null;
  }

  if (input.options?.noVerify) {
    options["--no-verify"] = null;
  }

  const result = await git.commit(input.message, options);

  return {
    success: true,
    commit: result.commit,
    summary: {
      changes: result.summary.changes,
      insertions: result.summary.insertions,
      deletions: result.summary.deletions,
    },
  };
};

export const pushMutation = async ({ input }: { input: PushInput }): Promise<PushOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const options: any = {};

  if (input.options?.force) {
    options["--force"] = null;
  }

  if (input.options?.setUpstream) {
    options["--set-upstream"] = null;
  }

  const remote = input.remote || "origin";
  const branch = input.branch;

  const result = await git.push(remote, branch, options);

  return {
    success: true,
    pushed:
      result.pushed?.map((p) => ({
        local: p.local,
        remote: p.remote,
      })) || [],
  };
};

export const pullMutation = async ({ input }: { input: PullInput }): Promise<PullOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const options: any = {};

  if (input.options?.rebase) {
    options["--rebase"] = null;
  }

  const remote = input.remote || "origin";
  const branch = input.branch;

  const result = await git.pull(remote, branch, options);

  return {
    success: true,
    summary: {
      changes: result.summary.changes,
      insertions: result.summary.insertions,
      deletions: result.summary.deletions,
    },
    files: result.files,
  };
};

export const checkoutMutation = async ({ input }: { input: CheckoutInput }): Promise<CheckoutOutput> => {
  const git = simpleGit(input.path || process.cwd());

  if (input.options?.create) {
    await git.checkoutLocalBranch(input.branch);
  } else {
    await git.checkout(input.branch);
  }

  return {
    success: true,
    branch: input.branch,
  };
};

export const mergeMutation = async ({ input }: { input: MergeInput }): Promise<MergeOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const options: string[] = [];

  if (input.options?.noFF) {
    options.push("--no-ff");
  }

  if (input.options?.squash) {
    options.push("--squash");
  }

  const result = await git.merge([input.from, ...options]);

  return {
    success: true,
    conflicts: result.conflicts || [],
  };
};

export const createTagMutation = async ({ input }: { input: CreateTagInput }): Promise<CreateTagOutput> => {
  const git = simpleGit(input.path || process.cwd());

  if (input.message) {
    await git.addAnnotatedTag(input.name, input.message);
  } else {
    await git.addTag(input.name);
  }

  return {
    success: true,
    tag: input.name,
  };
};

export const fetchMutation = async ({ input }: { input: FetchInput }): Promise<FetchOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const remote = input.remote || "origin";

  if (input.options?.all) {
    await git.fetch(["--all", ...(input.options?.prune ? ["--prune"] : [])]);
  } else {
    await git.fetch(remote, input.options?.prune ? ["--prune"] : []);
  }

  return {
    success: true,
    remote,
  };
};

export const rebaseMutation = async ({ input }: { input: RebaseInput }): Promise<RebaseOutput> => {
  const git = simpleGit(input.path || process.cwd());

  try {
    if (input.options?.abort) {
      await git.rebase(["--abort"]);
      return { success: true, completed: false, conflicts: [] };
    }

    if (input.options?.continue) {
      await git.rebase(["--continue"]);
      return { success: true, completed: true, conflicts: [] };
    }

    if (input.options?.skip) {
      await git.rebase(["--skip"]);
      return { success: true, completed: true, conflicts: [] };
    }

    await git.rebase([input.onto]);
    return { success: true, completed: true, conflicts: [] };
  } catch (error: any) {
    const status = await git.status();

    if (status.conflicted.length > 0) {
      return {
        success: false,
        completed: false,
        conflicts: status.conflicted.map((file) => ({
          reason: "content conflict",
          file,
        })),
      };
    }

    throw error;
  }
};
