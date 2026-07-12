import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const generateRequestSchema = z.object({
  type: z.enum(["image", "video", "script", "music", "voiceover", "storyboard", "actor-sheet"]),
  projectId: z.string().min(1).optional(),
  prompt: z.string().min(1),
  model: z.string().min(1).optional(),
  params: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = generateRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 })
  }

  // TODO: Credit check, Convex job creation, provider routing, Railway enqueue.
  return NextResponse.json(
    { error: "Generation API is not implemented", jobId: "stub", status: "queued", creditsRequired: 0, creditsRemaining: 0 },
    { status: 501 }
  )
}
