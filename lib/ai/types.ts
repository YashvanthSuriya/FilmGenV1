export interface ImageParams {
  prompt: string;
  referenceImages: string[];
  aspectRatio: "16:9" | "9:16" | "1:1" | "21:9";
  model: "nanobanana-2" | "gpt-image-2";
  stylePrompt?: string;
  characterPrompts?: string[];
}

export interface VideoParams {
  prompt: string;
  referenceImages: string[];
  referenceVideos?: string[];
  referenceAudio?: string[];
  duration: 5 | 10 | 15;
  resolution: "480p" | "720p";
  shotType?: string;
  cameraMovement?: string;
  stylePrompt?: string;
  characterPrompts?: string[];
}

export interface ImageResult {
  url: string;
  storageId?: string;
  width: number;
  height: number;
}

export interface AIProvider {
  generateImage(params: ImageParams): Promise<ImageResult>;
  generateVideo(params: VideoParams): Promise<{ jobId: string }>;
}
