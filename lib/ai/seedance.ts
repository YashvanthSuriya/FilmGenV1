import { AIProvider, VideoParams } from "./types";

export const seedanceProvider: AIProvider = {
  async generateImage() {
    throw new Error("Seedance does not support image generation.");
  },
  async generateVideo(params: VideoParams) {
    // STUB: In backend phase, this calls OpenRouter
    console.log("[STUB] Seedance video generation", params);
    return { jobId: `stub-video-${Date.now()}` };
  },
};
