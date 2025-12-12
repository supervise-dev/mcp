# Git Workflows

Complex git workflows that an AI agent can delegate to for automated execution with intelligent decision-making.

---

## 1. Sync Workflow ✅ (Implemented)

Keep a feature branch up-to-date with a source branch (e.g., main).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GIT SYNC WORKFLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────┐
                                 │  Start  │
                                 └────┬────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │   Fetch Remote    │
                            └─────────┬─────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                   ┌─────────────┐         ┌─────────────┐
                   │   Dirty?    │────Yes──▶│   Error:    │
                   │ Working Dir │         │  Uncommitted │
                   └──────┬──────┘         └─────────────┘
                          │ No
                          ▼
                   ┌─────────────┐         ┌─────────────┐
                   │  Unresolved │────Yes──▶│   Error:    │
                   │  Conflicts? │         │  Conflicts  │
                   └──────┬──────┘         └─────────────┘
                          │ No
                          ▼
                   ┌─────────────────┐
                   │    Analyze      │
                   │   Divergence    │
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  Source  │  │   No     │  │  Needs   │
        │ Missing  │  │  Sync    │  │  Sync    │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │             │             │
             ▼             ▼             │
        ┌─────────┐   ┌─────────┐        │
        │  Error  │   │ Already │        │
        └─────────┘   │ Synced  │        │
                      └─────────┘        │
                                         ▼
                            ┌────────────────────┐
                            │  Strategy Branch   │
                            └─────────┬──────────┘
                                      │
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
                 ┌─────────────┐             ┌─────────────┐
                 │   Rebase    │             │    Merge    │
                 │  Strategy   │             │  Strategy   │
                 └──────┬──────┘             └──────┬──────┘
                        │                          │
                        ▼                          ▼
              ┌──────────────────┐       ┌──────────────────┐
              │   Start Rebase   │       │  Execute Merge   │
              └────────┬─────────┘       └────────┬─────────┘
                       │                          │
                       ▼                          │
              ┌──────────────────┐                │
              │    DO UNTIL      │◀───────┐      │
              │  rebaseComplete  │        │      │
              └────────┬─────────┘        │      │
                       │                  │      │
                       ▼                  │      │
              ┌──────────────────┐        │      │
              │    Process       │        │      │
              │ Conflict (Agent) │────────┘      │
              └────────┬─────────┘                │
                       │                          │
                       ▼                          │
              ┌──────────────────┐                │
              │  Convert to      │                │
              │  Result State    │                │
              └────────┬─────────┘                │
                       │                          │
                       └──────────┬───────────────┘
                                  ▼
                       ┌───────────────────┐
                       │  Has Conflicts?   │
                       └─────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
             ┌─────────────┐           ┌─────────────┐
             │  Analyze    │           │    Push     │
             │  Conflicts  │           │   Changes   │
             │   (Agent)   │           └──────┬──────┘
             └─────────────┘                  │
                                              ▼
                                        ┌──────────┐
                                        │  Done    │
                                        └──────────┘
```

**Agent Integration Points:**

- Conflict analysis and resolution suggestions
- Decision on rebase vs merge strategy
- Commit message improvements

**Files:** `src/workflows/git/sync/`

---

## 2. PR Preparation Workflow

Prepare a feature branch for pull request submission.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PR PREPARATION WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────┐
                                 │  Start  │
                                 │ (branch)│
                                 └────┬────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Validate Branch  │
                            │  (not main/master)│
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │   Sync with Base  │
                            │   (sync workflow) │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Analyze Commits  │
                            │  (count, messages)│
                            └─────────┬─────────┘
                                      │
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
                 ┌─────────────┐             ┌─────────────┐
                 │  Multiple   │             │   Single    │
                 │  Commits    │             │   Commit    │
                 └──────┬──────┘             └──────┬──────┘
                        │                          │
                        ▼                          │
              ┌──────────────────┐                 │
              │  Agent: Suggest  │                 │
              │  Squash Strategy │                 │
              └────────┬─────────┘                 │
                       │                          │
                       ▼                          │
              ┌──────────────────┐                 │
              │ Interactive      │                 │
              │ Rebase (squash)  │                 │
              └────────┬─────────┘                 │
                       │                          │
                       └──────────┬───────────────┘
                                  ▼
                       ┌───────────────────┐
                       │  Agent: Generate  │
                       │  Commit Message   │
                       └─────────┬─────────┘
                                 │
                                 ▼
                       ┌───────────────────┐
                       │   Run Linting     │
                       └─────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
             ┌─────────────┐           ┌─────────────┐
             │  Lint Errors│           │  Lint Pass  │
             └──────┬──────┘           └──────┬──────┘
                    │                         │
                    ▼                         │
             ┌─────────────┐                  │
             │ Agent: Fix  │                  │
             │ Lint Issues │                  │
             └──────┬──────┘                  │
                    │                         │
                    └──────────┬──────────────┘
                               ▼
                    ┌───────────────────┐
                    │    Run Tests      │
                    └─────────┬─────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
          ┌─────────────┐           ┌─────────────┐
          │ Tests Fail  │           │ Tests Pass  │
          └──────┬──────┘           └──────┬──────┘
                 │                         │
                 ▼                         │
          ┌─────────────┐                  │
          │ Agent: Fix  │                  │
          │   Tests     │                  │
          └──────┬──────┘                  │
                 │                         │
                 └──────────┬──────────────┘
                            ▼
                 ┌───────────────────┐
                 │   Scan Secrets    │
                 │  (git-secrets)    │
                 └─────────┬─────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │  Secrets    │           │  No Secrets │
       │   Found     │           └──────┬──────┘
       └──────┬──────┘                  │
              │                         │
              ▼                         │
       ┌─────────────┐                  │
       │   ERROR:    │                  │
       │  Block PR   │                  │
       └─────────────┘                  │
                                        ▼
                            ┌───────────────────┐
                            │  Agent: Generate  │
                            │  PR Description   │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Force Push to    │
                            │  Remote Branch    │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │   Create PR via   │
                            │   GitHub API      │
                            └─────────┬─────────┘
                                      │
                                      ▼
                                ┌──────────┐
                                │   Done   │
                                │ (PR URL) │
                                └──────────┘
```

**Agent Integration Points:**

- Analyze commits and suggest squash strategy
- Generate conventional commit message from changes
- Fix linting issues automatically
- Fix failing tests
- Generate PR title and description from diff
- Suggest reviewers based on code ownership

**Input Schema:**

```typescript
{
  path?: string;
  baseBranch: string;        // e.g., "main"
  squash?: boolean;          // auto-squash commits
  runTests?: boolean;        // run test suite
  runLint?: boolean;         // run linting
  scanSecrets?: boolean;     // scan for secrets
  createPR?: boolean;        // create PR on GitHub
  draft?: boolean;           // create as draft PR
}
```

**Output Schema:**

```typescript
{
  success: boolean;
  branch: string;
  baseBranch: string;
  commitCount: number;
  squashed: boolean;
  testsRan: boolean;
  testsPassed: boolean;
  lintRan: boolean;
  lintPassed: boolean;
  secretsFound: boolean;
  prUrl?: string;
  prDescription?: string;
  error?: string;
}
```

---

## 3. Release Workflow

Automate the release process with version bumping and changelog generation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            RELEASE WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────┐
                                 │  Start  │
                                 └────┬────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │ Checkout Release  │
                            │ Branch (e.g. main)│
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │   Fetch & Pull    │
                            │   Latest Changes  │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Get Last Release │
                            │   Tag Version     │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Analyze Commits  │
                            │  Since Last Tag   │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Agent: Determine │
                            │  Version Bump     │
                            │ (major/minor/patch)│
                            └─────────┬─────────┘
                                      │
                        ┌─────────────┼─────────────┐
                        ▼             ▼             ▼
                 ┌──────────┐  ┌──────────┐  ┌──────────┐
                 │  Major   │  │  Minor   │  │  Patch   │
                 │ Breaking │  │ Feature  │  │   Fix    │
                 └────┬─────┘  └────┬─────┘  └────┬─────┘
                      │             │             │
                      └─────────────┴─────────────┘
                                    │
                                    ▼
                            ┌───────────────────┐
                            │ Calculate New     │
                            │ Version Number    │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │ Agent: Generate   │
                            │ Changelog Entry   │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │ Update Version    │
                            │ Files (package.json│
                            │ Cargo.toml, etc.) │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │ Update CHANGELOG  │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Run Tests        │
                            └─────────┬─────────┘
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  ┌─────────────┐           ┌─────────────┐
                  │ Tests Fail  │           │ Tests Pass  │
                  └──────┬──────┘           └──────┬──────┘
                         │                         │
                         ▼                         │
                  ┌─────────────┐                  │
                  │   Abort     │                  │
                  │   Release   │                  │
                  └─────────────┘                  │
                                                   ▼
                                       ┌───────────────────┐
                                       │  Commit Changes   │
                                       │ "chore: release   │
                                       │   vX.Y.Z"         │
                                       └─────────┬─────────┘
                                                 │
                                                 ▼
                                       ┌───────────────────┐
                                       │  Create Annotated │
                                       │  Tag (vX.Y.Z)     │
                                       └─────────┬─────────┘
                                                 │
                                                 ▼
                                       ┌───────────────────┐
                                       │  Push Commit +    │
                                       │  Push Tag         │
                                       └─────────┬─────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    ▼                         ▼
                             ┌─────────────┐           ┌─────────────┐
                             │  Create GH  │           │  Skip GH    │
                             │  Release    │           │  Release    │
                             └──────┬──────┘           └──────┬──────┘
                                    │                         │
                                    └──────────┬──────────────┘
                                               ▼
                                         ┌──────────┐
                                         │   Done   │
                                         │(version) │
                                         └──────────┘
```

**Agent Integration Points:**

- Analyze commit messages to determine version bump (conventional commits)
- Generate human-readable changelog from commits
- Write release notes for GitHub release
- Suggest if release should be marked as pre-release

**Input Schema:**

```typescript
{
  path?: string;
  releaseBranch?: string;      // default: "main"
  versionOverride?: string;    // force specific version
  preRelease?: string;         // e.g., "alpha", "beta", "rc.1"
  createGitHubRelease?: boolean;
  dryRun?: boolean;            // simulate without changes
}
```

**Output Schema:**

```typescript
{
  success: boolean;
  previousVersion: string;
  newVersion: string;
  bumpType: "major" | "minor" | "patch";
  changelog: string;
  tag: string;
  commitSha: string;
  pushed: boolean;
  releaseUrl?: string;
  error?: string;
}
```

---

## 4. Hotfix Workflow

Create and apply emergency fixes to production.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            HOTFIX WORKFLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────┐
                                 │  Start  │
                                 │(issue desc)│
                                 └────┬────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Find Production  │
                            │  Tag/Branch       │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Create Hotfix    │
                            │  Branch from Tag  │
                            │ (hotfix/issue-123)│
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Agent: Analyze   │
                            │  Issue & Create   │
                            │  Fix              │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │    Run Tests      │
                            └─────────┬─────────┘
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  ┌─────────────┐           ┌─────────────┐
                  │ Tests Fail  │           │ Tests Pass  │
                  └──────┬──────┘           └──────┬──────┘
                         │                         │
                         ▼                         │
               ┌──────────────────┐                │
               │  DO UNTIL        │                │
               │  tests pass      │◀───────┐      │
               └────────┬─────────┘        │      │
                        │                  │      │
                        ▼                  │      │
               ┌──────────────────┐        │      │
               │  Agent: Fix      │────────┘      │
               │  Test Failures   │               │
               └──────────────────┘               │
                                                  │
                                                  ▼
                                       ┌───────────────────┐
                                       │  Commit Fix with  │
                                       │  Issue Reference  │
                                       └─────────┬─────────┘
                                                 │
                                                 ▼
                                       ┌───────────────────┐
                                       │  Create Patch     │
                                       │  Version Tag      │
                                       └─────────┬─────────┘
                                                 │
                                                 ▼
                                       ┌───────────────────┐
                                       │  FOR EACH active  │
                                       │  release branch   │
                                       └─────────┬─────────┘
                                                 │
                               ┌─────────────────┴─────────────────┐
                               ▼                                   ▼
                      ┌─────────────────┐                 ┌─────────────────┐
                      │  Cherry-pick    │                 │  Cherry-pick    │
                      │  to main        │                 │  to release/x.y │
                      └────────┬────────┘                 └────────┬────────┘
                               │                                   │
                               ▼                                   ▼
                      ┌─────────────────┐                 ┌─────────────────┐
                      │  Handle         │                 │  Handle         │
                      │  Conflicts      │                 │  Conflicts      │
                      └────────┬────────┘                 └────────┬────────┘
                               │                                   │
                               └─────────────────┬─────────────────┘
                                                 ▼
                                       ┌───────────────────┐
                                       │  Push All         │
                                       │  Branches + Tags  │
                                       └─────────┬─────────┘
                                                 │
                                                 ▼
                                       ┌───────────────────┐
                                       │  Create PRs for   │
                                       │  Each Branch      │
                                       └─────────┬─────────┘
                                                 │
                                                 ▼
                                           ┌──────────┐
                                           │   Done   │
                                           └──────────┘
```

**Agent Integration Points:**

- Analyze issue and understand the bug
- Generate the fix code
- Fix test failures iteratively
- Handle cherry-pick conflicts
- Generate hotfix documentation

**Input Schema:**

```typescript
{
  path?: string;
  productionRef: string;       // tag or branch in production
  issueId?: string;            // GitHub issue number
  issueDescription: string;    // description of the bug
  targetBranches?: string[];   // branches to cherry-pick to
  createPRs?: boolean;
}
```

**Output Schema:**

```typescript
{
  success: boolean;
  hotfixBranch: string;
  newVersion: string;
  tag: string;
  cherryPickedTo: {
    branch: string;
    success: boolean;
    prUrl?: string;
    conflicts?: string[];
  }[];
  error?: string;
}
```

---

## 5. Git Bisect Workflow

Automatically find the commit that introduced a bug.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GIT BISECT WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────┐
                                 │  Start  │
                                 │(bad,good│
                                 │  refs)  │
                                 └────┬────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Validate Refs    │
                            │  Exist            │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Stash Current    │
                            │  Changes          │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  git bisect start │
                            │  bad good         │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │    DO UNTIL       │
                            │  bisect complete  │◀───────────┐
                            └─────────┬─────────┘            │
                                      │                      │
                                      ▼                      │
                            ┌───────────────────┐            │
                            │  Run Test Command │            │
                            └─────────┬─────────┘            │
                                      │                      │
                         ┌────────────┴────────────┐         │
                         ▼                         ▼         │
                  ┌─────────────┐           ┌─────────────┐  │
                  │ Test Fails  │           │ Test Passes │  │
                  │ (bad)       │           │ (good)      │  │
                  └──────┬──────┘           └──────┬──────┘  │
                         │                         │         │
                         ▼                         ▼         │
                  ┌─────────────┐           ┌─────────────┐  │
                  │ git bisect  │           │ git bisect  │  │
                  │ bad         │           │ good        │──┘
                  └──────┬──────┘           └─────────────┘
                         │
                         ▼
                  ┌─────────────────┐
                  │  Bisect Found   │
                  │  First Bad      │
                  │  Commit         │
                  └────────┬────────┘
                           │
                           ▼
                  ┌───────────────────┐
                  │  git bisect reset │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │  Restore Stash    │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │  Agent: Analyze   │
                  │  Bad Commit       │
                  │  - Show diff      │
                  │  - Explain cause  │
                  │  - Suggest fix    │
                  └─────────┬─────────┘
                            │
                            ▼
                      ┌──────────┐
                      │   Done   │
                      │(commit,  │
                      │ analysis)│
                      └──────────┘
```

**Agent Integration Points:**

- Analyze the bad commit's changes
- Explain what the commit changed that likely caused the bug
- Suggest a fix based on the diff
- Generate a report of the investigation

**Input Schema:**

```typescript
{
  path?: string;
  badRef: string;              // known bad commit/tag
  goodRef: string;             // known good commit/tag
  testCommand: string;         // command to test (exit 0 = good)
  maxSteps?: number;           // safety limit
}
```

**Output Schema:**

```typescript
{
  success: boolean;
  badCommit: {
    sha: string;
    message: string;
    author: string;
    date: string;
  };
  stepsRun: number;
  analysis: {
    summary: string;
    changedFiles: string[];
    likelyCause: string;
    suggestedFix: string;
  };
  error?: string;
}
```

---

## 6. Branch Cleanup Workflow

Maintain repository hygiene by cleaning stale branches.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BRANCH CLEANUP WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────┐
                                 │  Start  │
                                 └────┬────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Fetch All with   │
                            │  Prune            │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  List All Local   │
                            │  & Remote Branches│
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  FOR EACH branch  │
                            └─────────┬─────────┘
                                      │
                                      ▼
                  ┌───────────────────────────────────────┐
                  │         Categorize Branch             │
                  └───────────────────┬───────────────────┘
                                      │
          ┌───────────────┬───────────┼───────────┬───────────────┐
          ▼               ▼           ▼           ▼               ▼
    ┌──────────┐   ┌──────────┐ ┌──────────┐ ┌──────────┐  ┌──────────┐
    │ Protected│   │ Merged   │ │  Stale   │ │ Orphaned │  │  Active  │
    │ (skip)   │   │ (safe    │ │ (old,    │ │ (no      │  │ (keep)   │
    │          │   │  delete) │ │  no PR)  │ │  remote) │  │          │
    └──────────┘   └────┬─────┘ └────┬─────┘ └────┬─────┘  └──────────┘
                        │            │            │
                        ▼            ▼            ▼
                  ┌───────────────────────────────────────┐
                  │    Agent: Review & Confirm            │
                  │    Deletion Candidates                │
                  └───────────────────┬───────────────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  User Approval    │
                            │  (optional)       │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Delete Local     │
                            │  Branches         │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Delete Remote    │
                            │  Branches         │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Generate Report  │
                            └─────────┬─────────┘
                                      │
                                      ▼
                                ┌──────────┐
                                │   Done   │
                                └──────────┘
```

**Agent Integration Points:**

- Analyze branch activity and determine if safe to delete
- Review orphaned branches for important work
- Generate cleanup summary report
- Suggest branches that should be archived vs deleted

**Input Schema:**

```typescript
{
  path?: string;
  protectedBranches?: string[];  // never delete these
  staleDays?: number;            // days since last commit
  includeRemote?: boolean;       // also clean remote branches
  dryRun?: boolean;              // list but don't delete
  requireApproval?: boolean;     // ask before deleting
}
```

**Output Schema:**

```typescript
{
  success: boolean;
  analyzed: number;
  deleted: {
    local: string[];
    remote: string[];
  };
  skipped: {
    branch: string;
    reason: string;
  }[];
  preserved: string[];
  report: string;
  error?: string;
}
```

---

## 7. Recovery Workflow

Help recover from common git mistakes.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RECOVERY WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────┐
                                 │  Start  │
                                 │(problem │
                                 │  desc)  │
                                 └────┬────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Analyze Current  │
                            │  State & Reflog   │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Agent: Diagnose  │
                            │  Problem Type     │
                            └─────────┬─────────┘
                                      │
          ┌───────────────┬───────────┼───────────┬───────────────┐
          ▼               ▼           ▼           ▼               ▼
    ┌──────────┐   ┌──────────┐ ┌──────────┐ ┌──────────┐  ┌──────────┐
    │  Lost    │   │   Bad    │ │ Detached │ │ Deleted  │  │  Other   │
    │ Commits  │   │  Rebase  │ │  HEAD    │ │  Branch  │  │          │
    └────┬─────┘   └────┬─────┘ └────┬─────┘ └────┬─────┘  └────┬─────┘
         │              │            │            │              │
         ▼              ▼            ▼            ▼              ▼
    ┌──────────┐   ┌──────────┐ ┌──────────┐ ┌──────────┐  ┌──────────┐
    │ Search   │   │  Find    │ │ Create   │ │ Find in  │  │  Agent:  │
    │ Reflog   │   │ Pre-     │ │ Branch   │ │ Reflog   │  │ Custom   │
    │ for SHA  │   │ Rebase   │ │ at HEAD  │ │ & Restore│  │ Recovery │
    └────┬─────┘   └────┬─────┘ └────┬─────┘ └────┬─────┘  └──────────┘
         │              │            │            │
         ▼              ▼            ▼            ▼
    ┌──────────┐   ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Cherry-  │   │  Reset   │ │ Checkout │ │ Checkout │
    │ pick or  │   │  --hard  │ │ -b name  │ │ -b name  │
    │ Reset    │   │  to ref  │ │          │ │ sha      │
    └────┬─────┘   └────┬─────┘ └────┬─────┘ └────┬─────┘
         │              │            │            │
         └──────────────┴────────────┴────────────┘
                                 │
                                 ▼
                       ┌───────────────────┐
                       │  Verify Recovery  │
                       │  Was Successful   │
                       └─────────┬─────────┘
                                 │
                                 ▼
                       ┌───────────────────┐
                       │  Agent: Explain   │
                       │  What Happened    │
                       │  & Prevention     │
                       └─────────┬─────────┘
                                 │
                                 ▼
                           ┌──────────┐
                           │   Done   │
                           └──────────┘
```

**Agent Integration Points:**

- Diagnose the type of problem from description and state
- Analyze reflog to find recovery points
- Choose appropriate recovery strategy
- Explain what went wrong and how to prevent it

**Input Schema:**

```typescript
{
  path?: string;
  problemDescription: string;   // user's description
  targetRef?: string;           // what they're trying to recover
}
```

**Output Schema:**

```typescript
{
  success: boolean;
  problemType: "lost_commits" | "bad_rebase" | "detached_head" | "deleted_branch" | "other";
  recoveredRef?: string;
  recoveredBranch?: string;
  explanation: string;
  prevention: string;
  commands: string[];           // commands that were run
  error?: string;
}
```

---

## 8. Repository Audit Workflow

Security and health check for git repositories.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REPOSITORY AUDIT WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────┐
                                 │  Start  │
                                 └────┬────┘
                                      │
                        ┌─────────────┴─────────────┐
                        │    PARALLEL EXECUTION     │
                        └─────────────┬─────────────┘
                                      │
     ┌──────────────┬─────────────────┼─────────────────┬──────────────┐
     ▼              ▼                 ▼                 ▼              ▼
┌─────────┐   ┌─────────┐       ┌─────────┐       ┌─────────┐   ┌─────────┐
│ Secrets │   │ Large   │       │ Branch  │       │ Commit  │   │ Config  │
│  Scan   │   │ Files   │       │ Health  │       │ Hygiene │   │  Audit  │
└────┬────┘   └────┬────┘       └────┬────┘       └────┬────┘   └────┬────┘
     │             │                 │                 │             │
     ▼             ▼                 ▼                 ▼             ▼
┌─────────┐   ┌─────────┐       ┌─────────┐       ┌─────────┐   ┌─────────┐
│Scan all │   │Find files│      │Check    │       │Analyze  │   │Check    │
│history  │   │>threshold│      │protected│       │commit   │   │hooks,   │
│for API  │   │in history│      │branches │       │messages │   │.gitignore│
│keys,    │   │          │      │& rules  │       │& authors│   │config   │
│passwords│   │          │      │         │       │         │   │         │
└────┬────┘   └────┬────┘       └────┬────┘       └────┬────┘   └────┬────┘
     │             │                 │                 │             │
     └─────────────┴─────────────────┴─────────────────┴─────────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Agent: Analyze   │
                            │  All Findings     │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Prioritize       │
                            │  Issues           │
                            │ (Critical/High/   │
                            │  Medium/Low)      │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Generate Audit   │
                            │  Report           │
                            └─────────┬─────────┘
                                      │
                                      ▼
                                ┌──────────┐
                                │   Done   │
                                │ (report) │
                                └──────────┘
```

**Agent Integration Points:**

- Analyze severity of found secrets
- Recommend remediation steps
- Prioritize issues by risk
- Generate comprehensive audit report

**Input Schema:**

```typescript
{
  path?: string;
  scanSecrets?: boolean;
  scanLargeFiles?: boolean;
  largeFileThreshold?: number;   // bytes
  checkBranchProtection?: boolean;
  checkCommitHygiene?: boolean;
  outputFormat?: "json" | "markdown";
}
```

**Output Schema:**

```typescript
{
  success: boolean;
  findings: {
    secrets: {
      file: string;
      line: number;
      type: string;          // "api_key", "password", etc.
      severity: "critical" | "high" | "medium" | "low";
      commit: string;
      stillPresent: boolean;
    }[];
    largeFiles: {
      path: string;
      size: number;
      commit: string;
    }[];
    branchIssues: {
      branch: string;
      issue: string;
    }[];
    commitIssues: {
      sha: string;
      issues: string[];
    }[];
  };
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  report: string;
}
```

---

## Implementation Priority

| Workflow         | Complexity | Value  | Priority |
| ---------------- | ---------- | ------ | -------- |
| Sync ✅          | Medium     | High   | Done     |
| PR Preparation   | Medium     | High   | 1        |
| Release          | Medium     | High   | 2        |
| Branch Cleanup   | Low        | Medium | 3        |
| Hotfix           | High       | High   | 4        |
| Repository Audit | Medium     | Medium | 5        |
| Git Bisect       | Medium     | Medium | 6        |
| Recovery         | High       | Medium | 7        |

---

## Common Patterns

### Workflow Composition

Workflows can call other workflows:

```typescript
const prPrepWorkflow = createWorkflow({...})
  .then(syncWorkflow)           // reuse sync
  .then(squashCommitsStep)
  .then(runTestsStep)
  .commit();
```

### Agent Integration Pattern

```typescript
const analyzeStep = createStep({
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("git-agent");
    if (!agent) return inputData;

    const response = await agent.generate(prompt, {
      structuredOutput: { schema: outputSchema },
    });

    return { ...inputData, analysis: response.object };
  },
});
```

### Error Recovery Pattern

```typescript
const workflow = createWorkflow({...})
  .then(riskyStep)
  .branch([
    [hasError, recoveryWorkflow],
    [succeeded, continueWorkflow],
  ])
  .commit();
```

### Iterative Resolution (dountil)

```typescript
const workflow = createWorkflow({...})
  .then(startStep)
  .dountil(processStep, isComplete)
  .then(finalizeStep)
  .commit();
```
