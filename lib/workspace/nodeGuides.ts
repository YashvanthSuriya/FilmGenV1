import {
  Camera,
  Image,
  MessageSquareText,
  MonitorPlay,
  Palette,
  UserRound,
  Video,
  Zap,
  type LucideIcon
} from "lucide-react"
import type { WorkspaceNodeType } from "@/lib/types"

export interface NodeGuide {
  type: WorkspaceNodeType
  label: string
  icon: LucideIcon
  /** One-line summary shown in tooltips. */
  short: string
  /** Full description shown in the guide modal. */
  description: string
  /** What this node contributes to the compiled prompt. */
  contributes: string
  /** When to use it. */
  whenToUse: string
  /** Example use case. */
  example: string
}

export const nodeGuides: NodeGuide[] = [
  {
    type: "styleCard",
    label: "Style Card",
    icon: Palette,
    short: "Visual language: mood, palette, lighting, texture.",
    description:
      "A Style Card defines the overall look of a shot or sequence. It bundles together a mood, a color palette, lighting direction, and texture keywords so every shot that references it shares the same visual DNA.",
    contributes:
      "Adds 'Style: <name>. <description>. Mood: <mood>. Palette: <colors>.' to the compiled prompt.",
    whenToUse:
      "Use one Style Card per sequence (or per scene) to keep your shots visually consistent. Connect it to multiple Prompt nodes so they all inherit the same look.",
    example:
      "Create a 'Neon Rain Noir' style card with cyan/amber palette + 'tense' mood. Connect it to all 3 shots of your night-market sequence so they all share that wet-pavement aesthetic."
  },
  {
    type: "character",
    label: "Character",
    icon: UserRound,
    short: "A cast member: identity, role, appearance, wardrobe.",
    description:
      "A Character node locks in who is in the shot. It references a saved character card (name, role, description, emotions, portraits) so the same person renders consistently across multiple shots.",
    contributes:
      "Adds 'Character: <name>, <role>. <description>.' to the compiled prompt.",
    whenToUse:
      "Connect one Character node per shot that features a person. Share the same Character node across multiple shots in a sequence to keep the same actor appearing throughout.",
    example:
      "Connect 'Mira Vale — Courier' to Shot 01 (wide), Shot 02 (medium), and Shot 03 (close-up). All three shots will render the same silver-haired woman in a black raincoat."
  },
  {
    type: "actionCard",
    label: "Action",
    icon: Zap,
    short: "What's happening: beat, subject, action, emotion.",
    description:
      "An Action Card describes the dramatic beat of the shot — what the subject is doing, what the emotional stakes are, and what the moment is really about. Think of it as the director's note for a single beat.",
    contributes:
      "Adds 'Action: <title>. Beat: <beat>. Subject: <subject>. Action: <action>. Emotion: <emotion>.' to the compiled prompt.",
    whenToUse:
      "Use when a shot has a specific dramatic moment (a reveal, a decision, a confrontation). Skip it for pure establishing or atmosphere shots.",
    example:
      "Action card 'Market Crossing' — Beat: 'Mira crosses the flooded market while surveillance closes in.' Emotion: 'alert, hunted, controlled.' Connect it to the wide shot so the model knows she's not just walking — she's being hunted."
  },
  {
    type: "prompt",
    label: "Prompt",
    icon: MessageSquareText,
    short: "Direct shot instructions: framing, blocking, action.",
    description:
      "The Prompt node is the heart of every shot. It's the free-text description of what should be in the frame — the framing (wide, close, overhead), the blocking (who is where), the action (what's happening), and any specific visual details the model needs to know.",
    contributes:
      "Adds 'Prompt: <your text>' to the compiled prompt. This is the primary instruction the model receives.",
    whenToUse:
      "Every shot needs a Prompt node. This is where you write the actual shot description. Style/Character/Action/Camera nodes feed into it to add context, but the Prompt is the core instruction.",
    example:
      "Prompt: 'Wide establishing shot of a flooded neon night market. Mira crosses from left to right, search drones rake light over the crowd. Reflections shimmer on wet pavement.'"
  },
  {
    type: "cameraConfig",
    label: "Camera",
    icon: Camera,
    short: "Lens, focal length, movement, angle, aperture, fps.",
    description:
      "The Camera node controls the physical camera framing. Pick a body type (cinema, handheld, vintage 16mm), a lens (anamorphic, macro, tilt), a focal length (18–135mm), a movement (locked-off, dolly, tracking, push-in, handheld, crane, drone), an angle (eye-level, low, high, overhead, dutch, ground), and an aperture (f/1.4–f/8).",
    contributes:
      "Adds 'Camera: <body>, <lens> <focal>mm, <movement>, <angle>, <aperture>, <fps>fps' to the compiled prompt.",
    whenToUse:
      "Connect a Camera node to every shot where framing matters. Use a wide lens (24mm) + locked-off for establishing shots, a long lens (85mm) + slow push-in for emotional close-ups, handheld for documentary energy.",
    example:
      "Shot 01 wide: 24mm + locked-off + eye-level + f/8 (deep focus, everything sharp). Shot 03 close-up: 85mm + slow push-in + eye-level + f/2.8 (shallow depth, intimate)."
  },
  {
    type: "imageOutput",
    label: "Image Output",
    icon: Image,
    short: "Still-frame generation target. Run to create an asset.",
    description:
      "The Image Output node is a generation target — it's where the assembled prompt gets sent to produce a still image. Click 'Run Image' to generate (currently a mock). Once generated, the asset is added to the project and can be sent to the Editing timeline.",
    contributes:
      "Doesn't add to the prompt — it's the consumer. It compiles all upstream inputs into the final prompt and runs the generation.",
    whenToUse:
      "Every shot that needs a still frame ends in an Image Output. Connect Prompt + Camera (+ optional Style/Character/Action/Script) into it. Run it to generate the image.",
    example:
      "Connect Prompt (wide shot description) + Camera (24mm locked-off) + Style (Neon Rain Noir) → Image Output. Click Run Image. The generated still becomes a project asset you can send to Editing."
  },
  {
    type: "videoOutput",
    label: "Video Output",
    icon: Video,
    short: "Motion-clip generation target. Run to create a video asset.",
    description:
      "The Video Output node is the motion-generation target. It works in two modes: (1) text-to-video (just a Prompt + Camera upstream), or (2) image-to-video (an Image Output must be connected AND run first — the video is generated from that still).",
    contributes:
      "Doesn't add to the prompt — it's the consumer. If an Image Output is connected, it requires that image to be run first (the analyzer blocks the run otherwise).",
    whenToUse:
      "Use for any shot that needs motion. If you want image-to-video (more controlled), connect an Image Output upstream and run it first. If you want text-to-video (faster, less controlled), skip the Image Output and just connect Prompt + Camera.",
    example:
      "Image-to-video: Image Output (already run, has a still of Mira in the market) → Video Output + Camera (slow push-in). Run the Video Output to animate the still. Text-to-video: just Prompt (describing motion) + Camera → Video Output, no Image Output needed."
  },
  {
    type: "preview",
    label: "Preview",
    icon: MonitorPlay,
    short: "Terminal sequence review. Collects outputs, sends to Editing.",
    description:
      "The Preview node is the end of the line. It collects all Image/Video Output nodes that connect into it and shows them as a sequence grid (sorted by Y position — top to bottom = shot 1 to shot N). Use 'Run all' to generate every un-run output in sequence, and 'Send sequence' to push the ready assets to the Editing timeline as a cut.",
    contributes:
      "Doesn't add to the prompt — it's a review + batch-run + send-to-editing surface.",
    whenToUse:
      "Always end a multi-shot sequence with a Preview node. Connect every Image/Video Output to it. Use it to: (1) see the whole sequence at a glance, (2) run every shot in one click, (3) pick a transition style, (4) send the sequence to Editing as a coherent cut.",
    example:
      "3-shot scene: Shot 01 wide, Shot 02 medium, Shot 03 close — each is a Prompt + Camera + Image Output cluster. Connect all 3 Image Outputs to one Preview node (ordered top-to-bottom by Y position). Click 'Run all' → all 3 generate. Pick 'Dissolve' transition → 'Send sequence' → 3 clips land on the timeline with dissolves between them."
  }
]

export function nodeGuideForType(type: WorkspaceNodeType): NodeGuide | undefined {
  return nodeGuides.find((g) => g.type === type)
}
