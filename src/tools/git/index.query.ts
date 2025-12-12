import {
  BranchInput,
  BranchOutput,
  DiffInput,
  DiffOutput,
  LogInput,
  LogOutput,
  RemoteInput,
  RemoteOutput,
  RevParseInput,
  RevParseOutput,
  StatusInput,
  StatusOutput,
  TagInput,
  TagOutput,
} from "./index.types";
import simpleGit from "simple-git";

export const statusQuery = async ({ input }: { input: StatusInput }): Promise<StatusOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const status = await git.status();

  return {
    current: status.current,
    tracking: status.tracking,
    ahead: status.ahead,
    behind: status.behind,
    files: status.files.map((file) => ({
      path: file.path,
      index: file.index,
      working_dir: file.working_dir,
    })),
    staged: status.staged,
    modified: status.modified,
    not_added: status.not_added,
    conflicted: status.conflicted,
    created: status.created,
    deleted: status.deleted,
    renamed: status.renamed.map((r) => ({ from: r.from, to: r.to })),
    isClean: status.isClean(),
  };
};

export const logQuery = async ({ input }: { input: LogInput }): Promise<LogOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const options: any = {};

  if (input.options?.maxCount) {
    options.maxCount = input.options.maxCount;
  }

  if (input.options?.file) {
    options.file = input.options.file;
  }

  const log = await git.log(options);

  return {
    all: log.all.map((commit) => ({
      hash: commit.hash,
      date: commit.date,
      message: commit.message,
      author_name: commit.author_name,
      author_email: commit.author_email,
    })),
    latest: log.latest
      ? {
          hash: log.latest.hash,
          date: log.latest.date,
          message: log.latest.message,
          author_name: log.latest.author_name,
          author_email: log.latest.author_email,
        }
      : null,
    total: log.total,
  };
};

export const diffQuery = async ({ input }: { input: DiffInput }): Promise<DiffOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const options: string[] = [];

  if (input.options?.staged) {
    options.push("--cached");
  }

  if (input.options?.nameOnly) {
    options.push("--name-only");
  }

  const args: string[] = [...options];

  if (input.options?.from) {
    args.push(input.options.from);
  }

  if (input.options?.to) {
    args.push(input.options.to);
  }

  const diff = await git.diff(args);

  if (input.options?.nameOnly) {
    const files = diff.split("\n").filter((line) => line.trim());
    return { diff, files };
  }

  return { diff };
};

export const branchQuery = async ({ input }: { input: BranchInput }): Promise<BranchOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const branches = await git.branch();

  return {
    current: branches.current,
    all: branches.all,
    branches: branches.branches,
  };
};

export const remoteQuery = async ({ input }: { input: RemoteInput }): Promise<RemoteOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const remotes = await git.getRemotes(true);

  return {
    remotes: remotes.map((remote) => ({
      name: remote.name,
      refs: {
        fetch: remote.refs.fetch,
        push: remote.refs.push,
      },
    })),
  };
};

export const tagQuery = async ({ input }: { input: TagInput }): Promise<TagOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const tags = await git.tags();

  return {
    tags: tags.all,
  };
};

export const revParseQuery = async ({ input }: { input: RevParseInput }): Promise<RevParseOutput> => {
  const git = simpleGit(input.path || process.cwd());
  const hash = await git.revparse([input.ref]);

  return {
    hash: hash.trim(),
  };
};
