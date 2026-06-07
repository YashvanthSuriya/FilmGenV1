import { StorageProvider } from "./types";

export const convexStorageProvider: StorageProvider = {
  async upload(file: File) {
    // STUB: Will use Convex file storage API
    console.log("[STUB] Convex upload", file.name);
    return { storageId: `stub-${Date.now()}`, url: URL.createObjectURL(file) };
  },
  async getFileUrl(storageId: string) {
    void storageId;
    return URL.createObjectURL(new Blob([])); // placeholder
  },
};
