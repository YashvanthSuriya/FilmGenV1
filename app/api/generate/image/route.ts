import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const imageGenerationSchema = z.object({
  projectId: z.string().min(1).optional(),
  prompt: z.string().min(1),
  referenceImages: z.array(z.string().min(1)).default([]),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "21:9"]).default("16:9"),
  model: z.enum(["nanobanana-2", "gpt-image-2"]).default("nanobanana-2"),
  stylePrompt: z.string().min(1).optional(),
  characterPrompts: z.array(z.string().min(1)).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = imageGenerationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 })
  }

  // TODO: Match ImageParams, sanitize prompt, check credits, call imageAI, persist media in Convex/R2.
  return NextResponse.json(
    { error: "Image generation is not implemented", jobId: "stub", status: "queued", creditsRequired: 0 },
    { status: 501 }
  )
}
