import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { sanitizePrompt } from "@/lib/ai/sanitize"
import { generationRateLimit } from "@/lib/ratelimit"
import { createServerPromptRuntimePlan, resolveServerTemplatePromptPlan } from "./template-guidance"

const MAX_REFERENCE_IMAGES = 14
const MAX_APPLIED_CARDS = 12
const MAX_REFERENCE_BYTES = 10 * 1024 * 1024
const MAX_REFERENCE_DATA_URL_LENGTH = Math.ceil(MAX_REFERENCE_BYTES * 1.4) + 128
const allowedReferenceMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"])

const imageGenerationSchema = z
  .object({
    prompt: z.string().min(1).max(2000),
    templateId: z.string().min(1).max(80).optional(),
    cardType: z.enum(["style", "storyboard", "character", "none"]).default("storyboard"),
    appliedCardIds: z.array(z.string().min(1).max(120)).max(MAX_APPLIED_CARDS).default([]),
    referenceImages: z.array(z.string().min(1).max(MAX_REFERENCE_DATA_URL_LENGTH)).max(MAX_REFERENCE_IMAGES).default([]),
    aspectRatio: z.enum(["1:1", "16:9", "9:16", "21:9"]).default("16:9"),
    model: z.enum(["nanobanana-2", "gpt-image-2"]).default("nanobanana-2")
  })
  .strict()

function getClientIdentifier(req: Request, userId: string) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwardedFor ? `${userId}:${forwardedFor}` : userId
}

function getDataUrlByteSize(base64: string) {
  const normalized = base64.replace(/\s/g, "")
  const padding = normalized.endsWith("==") ? 2 : normalized.endsWith("=") ? 1 : 0
  return Math.floor((normalized.length * 3) / 4) - padding
}

function isAllowedReferenceImage(value: string) {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i.exec(value)
  if (!match) return false

  const [, mimeType, base64] = match
  if (!allowedReferenceMimeTypes.has(mimeType.toLowerCase())) return false
  return getDataUrlByteSize(base64) <= MAX_REFERENCE_BYTES
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rateLimit = generationRateLimit.limit(getClientIdentifier(req, userId))
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = imageGenerationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 })
  }

  const invalidReference = parsed.data.referenceImages.find((reference) => !isAllowedReferenceImage(reference))
  if (invalidReference) {
    return NextResponse.json({ error: "Invalid reference image" }, { status: 400 })
  }

  if (parsed.data.templateId && !resolveServerTemplatePromptPlan(parsed.data.templateId)) {
    return NextResponse.json({ error: "Unknown template" }, { status: 400 })
  }

  const sanitizedPrompt = sanitizePrompt(parsed.data.prompt)
  const promptRuntimePlan = createServerPromptRuntimePlan({
    sanitizedPrompt,
    templateId: parsed.data.templateId
  })

  return NextResponse.json(
    {
      error: "Image generation is not implemented",
      jobId: "stub",
      status: "queued",
      creditsRequired: parsed.data.model === "gpt-image-2" ? 4 : 3,
      creditsRemaining: 0,
      estimatedSeconds: 3,
      sanitizedPrompt,
      templateResolved: promptRuntimePlan.templateResolved,
      appliedCardIds: parsed.data.appliedCardIds,
      cardRuntimeResolved: false,
      cardType: promptRuntimePlan.templatePlan?.cardType ?? parsed.data.cardType
    },
    { status: 501 }
  )
}
