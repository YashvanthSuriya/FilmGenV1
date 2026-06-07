import { StorageProvider } from "./types";

export const r2StorageProvider: StorageProvider = {
  async upload(file: File) {
    // STUB: Will use R2 S3-compatible upload
    console.log("[STUB] R2 upload", file.name);
    return { storageId: `r2-stub-${Date.now()}`, url: "" };
  },
  async getFileUrl(storageId: string) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/storage/r2/${storageId}`;
  },
};
