import { z } from "zod";

export const existsInput = z.object({
  path: z.string().describe("The file or directory path to check for existence"),
});

export const mkdirInput = z.object({
  path: z.string().describe("The directory path to create"),
  options: z
    .object({
      recursive: z.boolean().optional().describe("Create parent directories if they don't exist"),
      mode: z.number().optional().describe("Directory permissions mode (e.g., 0o755)"),
    })
    .optional()
    .describe("Optional configuration for directory creation"),
});

export const readdirInput = z.object({
  path: z.string().describe("The directory path to read"),
  options: z
    .union([
      z.object({
        encoding: z.string().optional().describe("Character encoding for file names (e.g., 'utf8')"),
        withFileTypes: z
          .boolean()
          .optional()
          .describe("Return Dirent objects instead of strings for detailed file information"),
      }),
      z.string(),
    ])
    .optional()
    .describe("Optional configuration for reading directory contents"),
});

export const readFileInput = z.object({
  path: z.string().describe("The file path to read"),
  options: z
    .union([
      z.object({
        encoding: z.string().optional().describe("Character encoding for the file (e.g., 'utf8', 'base64')"),
        flag: z.string().optional().describe("File system flag (e.g., 'r' for read)"),
      }),
      z.string(),
    ])
    .optional()
    .describe("Optional configuration for reading the file"),
});

export const statInput = z.object({
  path: z.string().describe("The file or directory path to get statistics for"),
  options: z
    .object({
      bigint: z.boolean().optional().describe("Return numeric values as BigInt for large file support"),
      throwIfNoEntry: z.boolean().optional().describe("Throw an error if the file doesn't exist (default: true)"),
    })
    .optional()
    .describe("Optional configuration for stat operation"),
});

export const writeFileInput = z.object({
  path: z.string().describe("The file path to write to"),
  data: z
    .union([
      z.string().describe("String content to write to the file"),
      z.object({
        type: z.literal("Buffer").describe("Indicates the data is a Buffer"),
        data: z.string().describe("Base64 encoded buffer data"),
      }),
    ])
    .describe("The content to write - either a string or base64 encoded Buffer"),
  options: z
    .union([
      z.object({
        encoding: z.string().optional().describe("Character encoding for the file (e.g., 'utf8')"),
        mode: z.number().optional().describe("File permissions mode (e.g., 0o644)"),
        flag: z.string().optional().describe("File system flag (e.g., 'w' for write, 'a' for append)"),
      }),
      z.string(),
    ])
    .optional()
    .describe("Optional configuration for writing the file"),
});

export const existsOutput = z.object({
  exists: z.boolean().describe("Whether the file or directory exists"),
});

export const mkdirOutput = z.object({
  path: z.string().optional().nullable().describe("The path of the created directory, or null if it already existed"),
});

export const direntOutput = z.object({
  name: z.string().describe("The name of the file or directory"),
  isSymbolicLink: z.boolean().describe("Whether this entry is a symbolic link"),
  isFile: z.boolean().describe("Whether this entry is a file"),
  isDirectory: z.boolean().describe("Whether this entry is a directory"),
});

export const readdirOutput = z.object({
  entries: z
    .union([
      z.array(z.string()).describe("Array of file/directory names"),
      z.array(direntOutput).describe("Array of detailed file/directory information"),
    ])
    .describe("The directory contents"),
});

export const readFileOutput = z.object({
  type: z.enum(["Buffer", "string"]).describe("The type of data returned"),
  data: z.string().describe("File content as string or base64 encoded buffer"),
});

export const statOutput = z.object({
  dev: z.number().describe("Device ID containing the file"),
  ino: z.number().describe("Inode number"),
  mode: z.number().describe("File permissions and type"),
  nlink: z.number().describe("Number of hard links"),
  uid: z.number().describe("User ID of owner"),
  gid: z.number().describe("Group ID of owner"),
  rdev: z.number().describe("Device ID if special file"),
  size: z.number().describe("File size in bytes"),
  blksize: z.number().describe("Block size for file system I/O"),
  blocks: z.number().describe("Number of 512-byte blocks allocated"),
  atimeMs: z.number().describe("Last access time in milliseconds since epoch"),
  mtimeMs: z.number().describe("Last modification time in milliseconds since epoch"),
  ctimeMs: z.number().describe("Last status change time in milliseconds since epoch"),
  birthtimeMs: z.number().describe("Creation time in milliseconds since epoch"),
  atime: z.string().describe("Last access time as ISO string"),
  mtime: z.string().describe("Last modification time as ISO string"),
  ctime: z.string().describe("Last status change time as ISO string"),
  birthtime: z.string().describe("Creation time as ISO string"),
  isFile: z.boolean().describe("Whether this is a file"),
  isDirectory: z.boolean().describe("Whether this is a directory"),
  isSymbolicLink: z.boolean().describe("Whether this is a symbolic link"),
});

export const writeFileOutput = z.object({
  success: z.boolean().describe("Whether the file was written successfully"),
});

export const fileSizeInput = z.object({
  path: z.string().describe("The file path to get size for"),
});

export const fileSizeOutput = z.object({
  size: z.number().describe("File size in bytes"),
});

export const deleteInput = z.object({
  path: z.string().describe("The file or directory path to delete"),
  options: z
    .object({
      recursive: z.boolean().optional().describe("Recursively delete directories and their contents"),
      force: z.boolean().optional().describe("Force deletion, ignore nonexistent files"),
    })
    .optional()
    .describe("Optional configuration for delete operation"),
});

export const deleteOutput = z.object({
  success: z.boolean().describe("Whether the deletion was successful"),
});

export type ExistsSyncInput = z.infer<typeof existsInput>;
export type MkdirSyncInput = z.infer<typeof mkdirInput>;
export type ReaddirSyncInput = z.infer<typeof readdirInput>;
export type ReadFileSyncInput = z.infer<typeof readFileInput>;
export type StatSyncInput = z.infer<typeof statInput>;
export type WriteFileSyncInput = z.infer<typeof writeFileInput>;
export type FileSizeSyncInput = z.infer<typeof fileSizeInput>;
export type DeleteSyncInput = z.infer<typeof deleteInput>;

export type ExistsOutput = z.infer<typeof existsOutput>;
export type MkdirOutput = z.infer<typeof mkdirOutput>;
export type ReaddirOutput = z.infer<typeof readdirOutput>;
export type ReadFileOutput = z.infer<typeof readFileOutput>;
export type StatOutput = z.infer<typeof statOutput>;
export type WriteFileOutput = z.infer<typeof writeFileOutput>;
export type FileSizeOutput = z.infer<typeof fileSizeOutput>;
export type DeleteOutput = z.infer<typeof deleteOutput>;
export type Dirent = z.infer<typeof direntOutput>;
