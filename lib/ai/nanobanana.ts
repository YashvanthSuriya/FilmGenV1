import { AIProvider, ImageParams, ImageResult } from "./types";

export const nanobananaProvider: AIProvider = {
  async generateImage(params: ImageParams): Promise<ImageResult> {
    // STUB: In backend phase, this calls Google Gemini API
    console.log("[STUB] Nano Banana image generation", params);
    return {
      url: "",
      storageId: undefined,
      width: 1024,
      height: 1024,
    };
  },
  async generateVideo() {
    throw new Error("Nano Banana does not support video generation.");
  },
};
