import { AIProvider, ImageParams, ImageResult } from "./types";

export const gptImageProvider: AIProvider = {
  async generateImage(params: ImageParams): Promise<ImageResult> {
    // STUB: In backend phase, this calls OpenAI
    console.log("[STUB] GPT Image 2 generation", params);
    return {
      url: "",
      storageId: undefined,
      width: 1024,
      height: 1536,
    };
  },
  async generateVideo() {
    throw new Error("GPT Image 2 does not support video generation.");
  },
};
