import { seedanceProvider } from "./seedance";
import { nanobananaProvider } from "./nanobanana";
import { gptImageProvider } from "./gpt-image";

export const imageAI = {
  default: nanobananaProvider,
  premium: gptImageProvider,
};

export const videoAI = seedanceProvider;

export type { AIProvider, ImageParams, VideoParams, ImageResult } from "./types";
