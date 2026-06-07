export interface StorageProvider {
  upload(file: File): Promise<{ storageId: string; url: string }>;
  getFileUrl(storageId: string): Promise<string>;
}
