import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const videoGenerationSchema = z.object({
  projectId: z.string().min(1).optional(),
  prompt: z.string().min(1),
  referenceImages: z.array(z.string().min(1)).default([]),
  referenceVideos: z.array(z.string().min(1)).optional(),
  referenceAudio: z.array(z.string().min(1)).optional(),
  duration: z.union([z.literal(5), z.literal(10), z.literal(15)]).default(5),
  resolution: z.enum(["480p", "720p"]).default("720p"),
  shotType: z.string().min(1).optional(),
  cameraMovement: z.string().min(1).optional(),
  stylePrompt: z.string().min(1).optional(),
  characterPrompts: z.array(z.string().min(1)).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = videoGenerationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 })
  }

  // TODO: Match VideoParams, sanitize prompt, check credits, create Convex job, enqueue Railway render worker.
  return NextResponse.json(
    { error: "Video generation is not implemented", jobId: "stub", status: "queued", creditsRequired: 0 },
    { status: 501 }
  )
}
