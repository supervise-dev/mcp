import { z } from "zod";

// Status
export const statusInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
});

export const statusOutput = z.object({
  current: z.string().nullable().describe("Current branch name"),
  tracking: z.string().nullable().describe("Remote tracking branch"),
  ahead: z.number().describe("Number of commits ahead of remote"),
  behind: z.number().describe("Number of commits behind remote"),
  files: z
    .array(
      z.object({
        path: z.string().describe("File path"),
        index: z.string().optional().describe("Index status code"),
        working_dir: z.string().optional().describe("Working directory status code"),
      }),
    )
    .describe("All modified files with their status"),
  staged: z.array(z.string()).describe("Files staged for commit"),
  modified: z.array(z.string()).describe("Modified files not staged"),
  not_added: z.array(z.string()).describe("Untracked files"),
  conflicted: z.array(z.string()).describe("Files with merge conflicts"),
  created: z.array(z.string()).describe("Newly created files"),
  deleted: z.array(z.string()).describe("Deleted files"),
  renamed: z
    .array(
      z.object({
        from: z.string().describe("Original file path"),
        to: z.string().describe("New file path"),
      }),
    )
    .describe("Renamed files"),
  isClean: z.boolean().describe("Whether the working directory is clean"),
});

export type StatusInput = z.infer<typeof statusInput>;
export type StatusOutput = z.infer<typeof statusOutput>;

// Log
export const logInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  options: z
    .object({
      maxCount: z.number().optional().describe("Maximum number of commits to retrieve"),
      file: z.string().optional().describe("Show commits that affected this specific file"),
      format: z
        .object({
          hash: z.string().optional().describe("Custom format for commit hash"),
          date: z.string().optional().describe("Custom format for commit date"),
          message: z.string().optional().describe("Custom format for commit message"),
          author_name: z.string().optional().describe("Custom format for author name"),
          author_email: z.string().optional().describe("Custom format for author email"),
        })
        .optional()
        .describe("Custom output format for commit information"),
    })
    .optional()
    .describe("Optional configuration for log retrieval"),
});

export const logOutput = z.object({
  all: z
    .array(
      z.object({
        hash: z.string().describe("Commit hash"),
        date: z.string().describe("Commit date"),
        message: z.string().describe("Commit message"),
        author_name: z.string().describe("Author name"),
        author_email: z.string().describe("Author email"),
      }),
    )
    .describe("All commits matching the query"),
  latest: z
    .object({
      hash: z.string().describe("Commit hash"),
      date: z.string().describe("Commit date"),
      message: z.string().describe("Commit message"),
      author_name: z.string().describe("Author name"),
      author_email: z.string().describe("Author email"),
    })
    .nullable()
    .describe("Most recent commit, or null if no commits"),
  total: z.number().describe("Total number of commits"),
});

export type LogInput = z.infer<typeof logInput>;
export type LogOutput = z.infer<typeof logOutput>;

// Diff
export const diffInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  options: z
    .object({
      from: z.string().optional().describe("Starting commit/branch for comparison"),
      to: z.string().optional().describe("Ending commit/branch for comparison"),
      nameOnly: z.boolean().optional().describe("Show only file names without diff content"),
      staged: z.boolean().optional().describe("Show diff of staged changes"),
    })
    .optional()
    .describe("Optional configuration for diff operation"),
});

export const diffOutput = z.object({
  diff: z.string().describe("The diff output showing changes between commits/branches"),
  files: z.array(z.string()).optional().describe("List of changed files (when nameOnly is true)"),
});

export type DiffInput = z.infer<typeof diffInput>;
export type DiffOutput = z.infer<typeof diffOutput>;

// Branch
export const branchInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
});

export const branchOutput = z.object({
  current: z.string().describe("Name of the current branch"),
  all: z.array(z.string()).describe("List of all branch names"),
  branches: z
    .record(
      z.any(),
      z.object({
        current: z.boolean().describe("Whether this is the current branch"),
        name: z.string().describe("Branch name"),
        commit: z.string().describe("Latest commit hash"),
        label: z.string().describe("Branch label/description"),
      }),
    )
    .describe("Detailed information about all branches"),
});

export type BranchInput = z.infer<typeof branchInput>;
export type BranchOutput = z.infer<typeof branchOutput>;

// Remote
export const remoteInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
});

export const remoteOutput = z.object({
  remotes: z
    .array(
      z.object({
        name: z.string().describe("Remote name (e.g., 'origin')"),
        refs: z.object({
          fetch: z.string().describe("Fetch URL"),
          push: z.string().describe("Push URL"),
        }),
      }),
    )
    .describe("List of configured remotes"),
});

export type RemoteInput = z.infer<typeof remoteInput>;
export type RemoteOutput = z.infer<typeof remoteOutput>;

// Init
export const initInput = z.object({
  path: z.string().describe("Path where the repository should be initialized"),
  bare: z.boolean().optional().describe("Create a bare repository without a working directory"),
});

export const initOutput = z.object({
  success: z.boolean().describe("Whether the repository was initialized successfully"),
  path: z.string().describe("Path of the initialized repository"),
});

export type InitInput = z.infer<typeof initInput>;
export type InitOutput = z.infer<typeof initOutput>;

// Clone
export const cloneInput = z.object({
  repoUrl: z.string().describe("URL of the repository to clone"),
  localPath: z.string().describe("Local path where the repository should be cloned"),
  options: z
    .object({
      depth: z.number().optional().describe("Create a shallow clone with history truncated to the specified depth"),
      branch: z.string().optional().describe("Clone a specific branch instead of the default"),
      singleBranch: z.boolean().optional().describe("Clone only the specified branch"),
    })
    .optional()
    .describe("Optional configuration for clone operation"),
});

export const cloneOutput = z.object({
  success: z.boolean().describe("Whether the clone was successful"),
  path: z.string().describe("Path of the cloned repository"),
});

export type CloneInput = z.infer<typeof cloneInput>;
export type CloneOutput = z.infer<typeof cloneOutput>;

// Add
export const addInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  files: z
    .union([z.string().describe("Single file path to add"), z.array(z.string()).describe("Multiple file paths to add")])
    .describe("Files to stage for commit"),
});

export const addOutput = z.object({
  success: z.boolean().describe("Whether the files were added successfully"),
});

export type AddInput = z.infer<typeof addInput>;
export type AddOutput = z.infer<typeof addOutput>;

// Commit
export const commitInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  message: z.string().describe("Commit message"),
  options: z
    .object({
      author: z
        .object({
          name: z.string().describe("Author name"),
          email: z.string().describe("Author email"),
        })
        .optional()
        .describe("Override the commit author"),
      amend: z.boolean().optional().describe("Amend the previous commit instead of creating a new one"),
      noVerify: z.boolean().optional().describe("Skip pre-commit and commit-msg hooks"),
    })
    .optional()
    .describe("Optional configuration for commit operation"),
});

export const commitOutput = z.object({
  success: z.boolean().describe("Whether the commit was successful"),
  commit: z.string().describe("The commit hash"),
  summary: z
    .object({
      changes: z.number().describe("Number of files changed"),
      insertions: z.number().describe("Number of lines inserted"),
      deletions: z.number().describe("Number of lines deleted"),
    })
    .describe("Summary of changes in the commit"),
});

export type CommitInput = z.infer<typeof commitInput>;
export type CommitOutput = z.infer<typeof commitOutput>;

// Push
export const pushInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  remote: z.string().optional().describe("Remote name to push to (defaults to 'origin')"),
  branch: z.string().optional().describe("Branch name to push (defaults to current branch)"),
  options: z
    .object({
      force: z.boolean().optional().describe("Force push, overwriting remote history"),
      setUpstream: z.boolean().optional().describe("Set upstream tracking for the branch"),
    })
    .optional()
    .describe("Optional configuration for push operation"),
});

export const pushOutput = z.object({
  success: z.boolean().describe("Whether the push was successful"),
  pushed: z
    .array(
      z.object({
        local: z.string().describe("Local branch name"),
        remote: z.string().describe("Remote branch name"),
      }),
    )
    .describe("List of pushed branches"),
});

export type PushInput = z.infer<typeof pushInput>;
export type PushOutput = z.infer<typeof pushOutput>;

// Pull
export const pullInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  remote: z.string().optional().describe("Remote name to pull from (defaults to 'origin')"),
  branch: z.string().optional().describe("Branch name to pull (defaults to current branch)"),
  options: z
    .object({
      rebase: z.boolean().optional().describe("Rebase instead of merge when pulling"),
    })
    .optional()
    .describe("Optional configuration for pull operation"),
});

export const pullOutput = z.object({
  success: z.boolean().describe("Whether the pull was successful"),
  summary: z
    .object({
      changes: z.number().describe("Number of files changed"),
      insertions: z.number().describe("Number of lines inserted"),
      deletions: z.number().describe("Number of lines deleted"),
    })
    .describe("Summary of changes from the pull"),
  files: z.array(z.string()).describe("List of files that were updated"),
});

export type PullInput = z.infer<typeof pullInput>;
export type PullOutput = z.infer<typeof pullOutput>;

// Checkout
export const checkoutInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  branch: z.string().describe("Branch name to checkout"),
  options: z
    .object({
      create: z.boolean().optional().describe("Create the branch if it doesn't exist"),
    })
    .optional()
    .describe("Optional configuration for checkout operation"),
});

export const checkoutOutput = z.object({
  success: z.boolean().describe("Whether the checkout was successful"),
  branch: z.string().describe("Name of the checked out branch"),
});

export type CheckoutInput = z.infer<typeof checkoutInput>;
export type CheckoutOutput = z.infer<typeof checkoutOutput>;

// Merge
export const mergeInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  from: z.string().describe("Branch or commit to merge from"),
  options: z
    .object({
      noFF: z.boolean().optional().describe("Create a merge commit even if fast-forward is possible"),
      squash: z.boolean().optional().describe("Squash all commits into a single commit"),
    })
    .optional()
    .describe("Optional configuration for merge operation"),
});

export const mergeOutput = z.object({
  success: z.boolean().describe("Whether the merge was successful"),
  conflicts: z
    .array(
      z.object({
        reason: z.string().describe("Reason for the conflict"),
        file: z.string().nullable().describe("File with conflict, if applicable"),
        meta: z.any().optional().describe("Additional metadata about the conflict"),
      }),
    )
    .describe("List of merge conflicts, if any"),
});

export type MergeInput = z.infer<typeof mergeInput>;
export type MergeOutput = z.infer<typeof mergeOutput>;

// Tag
export const tagInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
});

export const tagOutput = z.object({
  tags: z.array(z.string()).describe("List of all tags in the repository"),
});

export type TagInput = z.infer<typeof tagInput>;
export type TagOutput = z.infer<typeof tagOutput>;

// Create Tag
export const createTagInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  name: z.string().describe("Tag name"),
  message: z.string().optional().describe("Annotated tag message"),
});

export const createTagOutput = z.object({
  success: z.boolean().describe("Whether the tag was created successfully"),
  tag: z.string().describe("Name of the created tag"),
});

export type CreateTagInput = z.infer<typeof createTagInput>;
export type CreateTagOutput = z.infer<typeof createTagOutput>;

// Fetch
export const fetchInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  remote: z.string().optional().describe("Remote name to fetch from (defaults to 'origin')"),
  options: z
    .object({
      all: z.boolean().optional().describe("Fetch all remotes"),
      prune: z.boolean().optional().describe("Remove remote-tracking references that no longer exist on the remote"),
    })
    .optional()
    .describe("Optional configuration for fetch operation"),
});

export const fetchOutput = z.object({
  success: z.boolean().describe("Whether the fetch was successful"),
  remote: z.string().describe("Remote that was fetched"),
});

export type FetchInput = z.infer<typeof fetchInput>;
export type FetchOutput = z.infer<typeof fetchOutput>;

// Rebase
export const rebaseInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  onto: z.string().describe("Branch or commit to rebase onto"),
  options: z
    .object({
      interactive: z.boolean().optional().describe("Start an interactive rebase (not recommended for automation)"),
      abort: z.boolean().optional().describe("Abort an in-progress rebase"),
      continue: z.boolean().optional().describe("Continue an in-progress rebase after resolving conflicts"),
      skip: z.boolean().optional().describe("Skip the current commit and continue rebase"),
    })
    .optional()
    .describe("Optional configuration for rebase operation"),
});

export const rebaseOutput = z.object({
  success: z.boolean().describe("Whether the rebase was successful"),
  conflicts: z
    .array(
      z.object({
        reason: z.string().describe("Reason for the conflict"),
        file: z.string().nullable().describe("File with conflict, if applicable"),
        meta: z.any().optional().describe("Additional metadata about the conflict"),
      }),
    )
    .optional()
    .describe("List of conflicts if rebase stopped"),
  currentCommit: z.string().optional().describe("Current commit being rebased (if stopped)"),
  completed: z.boolean().describe("Whether the rebase completed fully"),
});

export type RebaseInput = z.infer<typeof rebaseInput>;
export type RebaseOutput = z.infer<typeof rebaseOutput>;

// Rev Parse (for getting commit info)
export const revParseInput = z.object({
  path: z.string().optional().describe("The repository path (defaults to current directory)"),
  ref: z.string().describe("Git reference to parse (branch name, HEAD, etc.)"),
});

export const revParseOutput = z.object({
  hash: z.string().describe("The commit hash"),
});

export type RevParseInput = z.infer<typeof revParseInput>;
export type RevParseOutput = z.infer<typeof revParseOutput>;
