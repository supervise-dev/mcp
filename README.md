# MCP Server

A high-performance Model Context Protocol (MCP) server providing remote filesystem, git, and process operations. Built with Mastra and Bun for fast execution and distributed as compiled binaries for easy deployment.

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

### Git Operations
- `git.status` - Get repository status (staged, modified, untracked files)
- `git.log` - Get commit history with optional filtering
- `git.diff` - Show differences between commits, branches, or working tree
- `git.branch` - List branches and show current branch
- `git.remote` - List configured remote repositories
- `git.tag` - List all repository tags
- `git.init` - Initialize a new git repository
- `git.clone` - Clone remote repository (with optional depth and branch)
- `git.add` - Add files to staging area
- `git.commit` - Create commit with staged changes
- `git.push` - Push local commits to remote
- `git.pull` - Pull and merge changes from remote
- `git.checkout` - Switch or create branches
- `git.merge` - Merge changes from another branch
- `git.createTag` - Create new tag at current commit

### Process Operations
- `process.spawn` - Spawn a process with arguments and capture output
- `process.exec` - Execute shell commands

### Key Capabilities
- Binary data support via base64 encoding
- Full TypeScript support with Zod schema validation
- Built on MCP (Model Context Protocol) for AI agent integration
- Server-Sent Events (SSE) for real-time communication
- Cross-platform binary distribution (Linux x64/ARM64, macOS x64/ARM64)
- NPM package for client library integration
- Bun runtime for high performance

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
import { MCPClient } from '@mastra/mcp';

const client = new MCPClient({
  url: 'http://localhost:1234',
  ssePath: '/sse',
  messagePath: '/message'
});
await client.connect();

// Filesystem operations
await client.callTool('fs.writeFile', { path: '/file.txt', data: 'Hello' });
const { data } = await client.callTool('fs.readFile', { path: '/file.txt' });
await client.callTool('fs.mkdir', { path: '/dir', recursive: true });
const { files } = await client.callTool('fs.readdir', { path: '/dir' });

// Git operations
await client.callTool('git.clone', { url: 'https://github.com/user/repo.git', path: '/repo' });
const status = await client.callTool('git.status', { repoPath: '/repo' });
await client.callTool('git.add', { repoPath: '/repo', files: ['.'] });
await client.callTool('git.commit', { repoPath: '/repo', message: 'Update' });
await client.callTool('git.push', { repoPath: '/repo', remote: 'origin', branch: 'main' });

// Process operations
const output = await client.callTool('process.spawn', { command: ['ls', '-la'] });
console.log(output.stdout, output.exitCode);
```

## API Reference

All tools are invoked via `client.callTool(toolId, input)`. See the Features section above for complete tool listings.

**Common Input Patterns:**
- Filesystem: `{ path: string, ...options }`
- Git: `{ repoPath: string, ...options }`
- Process: `{ command: string[], cwd?: string, env?: Record<string, string> }`

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

Built with modular design: Server (`src/index.ts`) handles HTTP/SSE, with separate modules for filesystem (`src/tools/fs/`), git (`src/tools/git/`), and process (`src/tools/process/`) operations. Each module includes query/mutation handlers and Zod type definitions.

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
