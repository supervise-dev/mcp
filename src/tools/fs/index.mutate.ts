import {
  DeleteOutput,
  DeleteSyncInput,
  MkdirOutput,
  MkdirSyncInput,
  WriteFileOutput,
  WriteFileSyncInput,
} from "./index.types";
import fs from "node:fs/promises";

export const mkdirMutation = async ({ input }: { input: MkdirSyncInput }): Promise<MkdirOutput> => {
  const result = await fs.mkdir(input.path, input.options);
  return { path: result };
};

export const writeFileMutation = async ({ input }: { input: WriteFileSyncInput }): Promise<WriteFileOutput> => {
  let data: string | Buffer;
  if (typeof input.data === "object" && "type" in input.data && input.data.type === "Buffer") {
    data = Buffer.from(input.data.data, "base64");
  } else {
    data = input.data as string;
  }
  await fs.writeFile(input.path, data, input.options as any);
  return { success: true };
};

export const deleteMutation = async ({ input }: { input: DeleteSyncInput }): Promise<DeleteOutput> => {
  await fs.rm(input.path, input.options as any);
  return { success: true };
};
