import { convexStorageProvider } from "./convex-storage";
import { r2StorageProvider } from "./r2-storage";
import type { StorageProvider } from "./types";

export function getStorage(category: "image" | "audio" | "video"): StorageProvider {
  if (category === "video") return r2StorageProvider;
  return convexStorageProvider;
}

export type { StorageProvider } from "./types";
