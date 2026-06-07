import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const uploadRequestSchema = z.object({
  projectId: z.string().min(1).optional(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  mediaType: z.enum(["image", "video", "audio"]).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = uploadRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 })
  }

  // TODO: Enforce size limits, validate ownership, generate Convex/R2 upload URL.
  return NextResponse.json({ error: "Upload API is not implemented", uploadUrl: "#", storageId: "stub" }, { status: 501 })
}
