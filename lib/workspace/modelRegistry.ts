/**
 * Model registry — single source of truth for available AI generation models.
 *
 * To add a new model:
 *   1. Add its ID to the corresponding union type in lib/types.ts
 *      (ImageGenerationModel or VideoGenerationModel)
 *   2. Add an entry to imageModels or videoModels below with its metadata
 *   3. If the model has unique features (e.g. different aspect ratios, durations,
 *      size options), add them to the `features` object — the UI will read from
 *      `features` to show/hide option controls.
 *
 * The UI components (ImageOutputNode, VideoOutputNode) read from this registry
 * to render the model dropdown + any model-specific options. The workspace
 * node stores the selected model ID in `data.modelId`.
 */

export interface ModelFeature {
  /** Key used in the node's data to store the selected value, e.g. "aspectRatio" or "videoSize". */
  key: string
  /** Display label for the option group. */
  label: string
  /** Available values for this feature. */
  options: Array<{ value: string; label: string }>
  /** Default value when the model is first selected. */
  defaultValue: string
}

export interface ModelDefinition {
  id: string
  label: string
  description: string
  /** Whether this model is currently available (false = greyed out / "reserved"). */
  available: boolean
  /** Model-specific features that the UI should render as option controls. */
  features: ModelFeature[]
}

// ============================================================================
// Image models
// ============================================================================

export const imageModels: ModelDefinition[] = [
  {
    id: "nanobanana-2",
    label: "Nano Banana 2",
    description: "Fast mock image preview",
    available: true,
    features: [
      {
        key: "aspectRatio",
        label: "Aspect ratio",
        defaultValue: "16:9",
        options: [
          { value: "1:1", label: "1:1" },
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "21:9", label: "21:9" }
        ]
      }
    ]
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    description: "Premium quality — reserved",
    available: false,
    features: [
      {
        key: "aspectRatio",
        label: "Aspect ratio",
        defaultValue: "16:9",
        options: [
          { value: "1:1", label: "1:1" },
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "21:9", label: "21:9" }
        ]
      }
    ]
  }
  // To add a new image model, copy the pattern above.
  // Example: Flux, Midjourney, Stable Diffusion, etc.
]

// ============================================================================
// Video models
// ============================================================================

export const videoModels: ModelDefinition[] = [
  {
    id: "seedance-2",
    label: "Seedance 2.0",
    description: "Storyboard-to-video mock preview",
    available: true,
    features: [
      {
        key: "videoSize",
        label: "Resolution",
        defaultValue: "1080p",
        options: [
          { value: "480p", label: "480p" },
          { value: "720p", label: "720p" },
          { value: "1080p", label: "1080p" }
        ]
      },
      {
        key: "durationSeconds",
        label: "Duration",
        defaultValue: "5",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
          { value: "15", label: "15s" }
        ]
      }
    ]
  },
  {
    id: "seedance-2-pro",
    label: "Seedance 2.0 Pro",
    description: "Longer premium clips — reserved",
    available: false,
    features: [
      {
        key: "videoSize",
        label: "Resolution",
        defaultValue: "1080p",
        options: [
          { value: "720p", label: "720p" },
          { value: "1080p", label: "1080p" }
        ]
      },
      {
        key: "durationSeconds",
        label: "Duration",
        defaultValue: "10",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
          { value: "15", label: "15s" },
          { value: "30", label: "30s" }
        ]
      }
    ]
  }
  // To add a new video model, copy the pattern above.
  // Example: Kling, Runway Gen-3, Luma Dream Machine, Pika, etc.
]

// ============================================================================
// Helpers
// ============================================================================

export function getImageModel(id: string | undefined): ModelDefinition {
  return imageModels.find((m) => m.id === id) ?? imageModels[0]
}

export function getVideoModel(id: string | undefined): ModelDefinition {
  return videoModels.find((m) => m.id === id) ?? videoModels[0]
}
