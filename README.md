# MCP Server

A high-performance Model Context Protocol (MCP) server providing remote filesystem, git, process operations, and AI-powered code analysis agents. Built with Mastra and Bun for fast execution and distributed as compiled binaries for easy deployment.

## Features

### Filesystem Operations

- `fs.exists` - Check if file/directory exists
- `fs.mkdir` - Create directories (with recursive option)
- `fs.readdir` - Read directory contents (with file type information)
- `fs.readFile` - Read files (text and binary data)
- `fs.stat` - Get detailed file/directory statistics
- `fs.writeFile` - Write files (text and binary data)
- `fs.fileSize` - Get file size
- `fs.delete` - Delete files/directories (with recursive option)
- `fs.directoryTree` - Generate hierarchical directory tree with filtering

### Git Operations

- `git.status` - Get repository status (staged, modified, untracked files)
- `git.log` - Get commit history with optional filtering
- `git.diff` - Show differences between commits, branches, or working tree
- `git.branch` - List branches and show current branch
- `git.remote` - List configured remote repositories
- `git.tag` - List all repository tags
- `git.revParse` - Resolve references to commit hashes
- `git.init` - Initialize a new git repository
- `git.clone` - Clone remote repository (with optional depth and branch)
- `git.add` - Add files to staging area
- `git.commit` - Create commit with staged changes
- `git.push` - Push local commits to remote
- `git.pull` - Pull and merge changes from remote
- `git.fetch` - Fetch changes from remote
- `git.checkout` - Switch or create branches
- `git.merge` - Merge changes from another branch
- `git.rebase` - Rebase branches
- `git.createTag` - Create new tag at current commit

### Search Operations

- `grep.search` - Text pattern search using ripgrep with regex support
- `grep.filesWithMatches` - Find files containing pattern
- `grep.countMatches` - Count matches per file
- `grep.astGrep` - AST-aware code pattern matching (TypeScript, TSX, JavaScript, JSX, HTML, CSS)

### Process Operations

- `process.spawn` - Spawn a process with arguments and capture output
- `process.exec` - Execute shell commands

### AI Agents

10 specialized AI agents powered by GPT-4o for code analysis:

- **File Finder** - Locate files by name, pattern, or directory structure
- **Code Finder** - Find specific code patterns, functions, classes, variables using AST and text search
- **Code Context** - Analyze and explain code structure, architecture, and functionality
- **Code Reviewer** - Review code for quality, best practices, bugs, and improvements
- **Code Refactor** - Analyze and refactor code for structure, readability, maintainability
- **Code Docs** - Generate documentation (JSDoc, TSDoc, docstrings, README, API docs)
- **Code Tester** - Generate and analyze test cases (Jest, Vitest, Mocha, Bun test, pytest)
- **Code Security** - Analyze code for security vulnerabilities (OWASP Top 10)
- **Code Dependency** - Analyze project dependencies, detect circular imports, find unused packages
- **Git Context** - Analyze Git repository state, resolve merge conflicts, provide Git expertise

### Key Capabilities

- Binary data support via base64 encoding
- Full TypeScript support with Zod schema validation
- Built on MCP (Model Context Protocol) for AI agent integration
- Server-Sent Events (SSE) for real-time communication
- Cross-platform binary distribution (Linux x64/ARM64, macOS x64/ARM64)
- NPM package for client library integration
- Bun runtime for high performance
- AST-aware code pattern matching with @ast-grep/napi
- Fast text search with ripgrep integration
- JWT authentication with JWK support
- LibSQL storage layer

## Installation

### Option 1: Install Binary (Recommended)

Download and execute the install script:

```bash
curl -fsSL https://raw.githubusercontent.com/supervise-dev/mcp/master/install.sh | bash
```

**Specify a custom install directory:**

```bash
INSTALL_DIR=/usr/local/bin curl -fsSL https://raw.githubusercontent.com/supervise-dev/mcp/master/install.sh | bash
```

**Install a specific version:**

```bash
curl -fsSL https://raw.githubusercontent.com/supervise-dev/mcp/master/install.sh | bash -s v1.0.0
```

**Common install directories:**

- `/usr/local/bin` - System-wide binary (requires sudo for some systems)
- `$HOME/.local/bin` - User-specific binary (add to PATH if needed)
- `.` - Current directory (default)

**Security tip:** Review the script before executing:

```bash
curl -fsSL https://raw.githubusercontent.com/supervise-dev/mcp/master/install.sh -o install.sh
cat install.sh  # Review the script
bash install.sh
```

### Option 2: Install as NPM Package

```bash
npm install @supervise-dev/mcp
# or
bun install @supervise-dev/mcp
```

### Option 3: Development Installation

For local development:

```bash
bun install
bun run build
```

## Quick Start

### Running the Server

Start the MCP server (default port: 1234):

```bash
# Using the binary
./dist/mcp

# Or with a custom port
SV_MCP_PORT=4000 ./dist/mcp

# Development mode with hot reload
bun run dev
```

The server will be available at:

- SSE endpoint: `http://localhost:1234/sse`
- Message endpoint: `http://localhost:1234/message`

### Client Usage

```typescript
import { MCPClient } from "@mastra/mcp";

const client = new MCPClient({
  url: "http://localhost:1234",
  ssePath: "/sse",
  messagePath: "/message",
});
await client.connect();

// Filesystem operations
await client.callTool("fs.writeFile", { path: "/file.txt", data: "Hello" });
const { data } = await client.callTool("fs.readFile", { path: "/file.txt" });
await client.callTool("fs.mkdir", { path: "/dir", recursive: true });
const { files } = await client.callTool("fs.readdir", { path: "/dir" });

// Git operations
await client.callTool("git.clone", { url: "https://github.com/user/repo.git", path: "/repo" });
const status = await client.callTool("git.status", { repoPath: "/repo" });
await client.callTool("git.add", { repoPath: "/repo", files: ["."] });
await client.callTool("git.commit", { repoPath: "/repo", message: "Update" });
await client.callTool("git.push", { repoPath: "/repo", remote: "origin", branch: "main" });

// Process operations
const output = await client.callTool("process.spawn", { command: ["ls", "-la"] });
console.log(output.stdout, output.exitCode);

// Search operations
const results = await client.callTool("grep.search", {
  pattern: "function.*export",
  path: "/repo/src",
  glob: "*.ts",
});

// AST-aware code search
const functions = await client.callTool("grep.astGrep", {
  pattern: "function $NAME($$$) { $$$ }",
  path: "/repo/src",
  lang: "typescript",
});

// AI Agents
const analysis = await client.runAgent("code.context", {
  query: "Explain the authentication flow in this codebase",
  path: "/repo",
});

const review = await client.runAgent("code.reviewer", {
  files: ["src/auth.ts"],
  path: "/repo",
});

const tests = await client.runAgent("code.tester", {
  file: "src/utils.ts",
  framework: "bun",
  path: "/repo",
});
```

## API Reference

All tools are invoked via `client.callTool(toolId, input)`. AI agents are invoked via `client.runAgent(agentId, input)`. See the Features section above for complete tool and agent listings.

**Common Input Patterns:**

- Filesystem: `{ path: string, ...options }`
- Git: `{ repoPath: string, ...options }`
- Process: `{ command: string[], cwd?: string, env?: Record<string, string> }`
- Search: `{ pattern: string, path?: string, glob?: string }`

**AST-Grep Patterns:**

Use `$VAR` for single nodes and `$$$` for multiple nodes:

```
function $NAME($$$) { $$$ }     # Match function definitions
console.log($$$)                # Match console.log calls
useState($INITIAL)              # Match React useState hooks
try { $$$ } catch ($ERR) { $$$ } # Match try-catch blocks
```

**Supported Languages:** TypeScript, TSX, JavaScript, JSX, HTML, CSS

**Process Output:**

```typescript
interface ProcessOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}
```

## Build & Development

### Scripts

```bash
# Development
bun run dev                  # Run server with hot reload

# Build
bun run build               # Build default binary for current platform
bun run build:darwin-arm64  # Build macOS ARM64
bun run build:darwin-x64    # Build macOS x64
bun run build:linux-arm64   # Build Linux ARM64
bun run build:linux-x64     # Build Linux x64

# Code Quality
bun run format              # Format with Prettier
bun run lint                # Run ESLint
bun run typecheck           # Run TypeScript check
```

## Architecture

Built with modular design:

```
src/
├── index.ts              # Main entry point with server configuration
├── agents/               # 10 AI agents for code analysis
│   ├── file.finder.ts    # File location agent
│   ├── code.finder.ts    # Code pattern search agent
│   ├── code.context.ts   # Code analysis agent
│   ├── code.reviewer.ts  # Code review agent
│   ├── code.refactor.ts  # Refactoring agent
│   ├── code.docs.ts      # Documentation agent
│   ├── code.tester.ts    # Test generation agent
│   ├── code.security.ts  # Security analysis agent
│   ├── code.dependency.ts # Dependency analysis agent
│   └── git.context.ts    # Git analysis agent
├── tools/
│   ├── fs/               # Filesystem operations (9 tools)
│   ├── git/              # Git operations (17 tools)
│   ├── grep/             # Search operations (4 tools)
│   └── process/          # Process operations (2 tools)
└── utils/
    └── env.ts            # Environment variable utilities
```

Each tool module includes:

- `index.ts` - Tool exports
- `index.query.ts` - Read operations
- `index.mutate.ts` - Write operations
- `index.types.ts` - Zod schema definitions

## Configuration

### Environment Variables

| Variable                | Description                 | Required         |
| ----------------------- | --------------------------- | ---------------- |
| `SV_MCP_PORT`           | Server port (default: 1234) | No               |
| `SV_MCP_HOST`           | Server host                 | No               |
| `SV_MCP_NAME`           | MCP server name             | No               |
| `SV_MCP_CORS`           | CORS origin                 | No               |
| `SV_MCP_STORAGE`        | LibSQL database URL         | Yes              |
| `SV_MCP_GATEWAY`        | OpenAI Gateway URL          | Yes (for agents) |
| `SV_MCP_GATEWAY_KEY`    | OpenAI API key              | Yes (for agents) |
| `SV_MCP_JWK`            | JWK URI for authentication  | No               |
| `SV_MCP_JWK_ISS`        | JWT issuer                  | No               |
| `SV_MCP_JWK_AUD`        | JWT audience                | No               |
| `SV_MCP_JWT_ALLOW_ANON` | Allow anonymous access      | No               |

## MCP Protocol

Implements the [Model Context Protocol](https://modelcontextprotocol.io/) for AI agent integration, using Server-Sent Events (SSE) for real-time bidirectional communication with full type safety and schema validation.

## Security Considerations

This MCP server provides **unrestricted access** to the server's filesystem, git repositories, and process operations. In production:

⚠️ **Important**

- Implement authentication and authorization
- Add path validation and sandboxing
- Use HTTPS for encrypted communication
- Implement rate limiting and request throttling
- Add comprehensive request logging and auditing
- Restrict network access to trusted clients only
- Consider running in a containerized/isolated environment
- Validate and sanitize all inputs
- Use process isolation (e.g., seccomp, AppArmor)
- Restrict git operations to specific repositories
- Limit process execution to allowed commands

## License

MIT
