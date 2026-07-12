import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const exportRequestSchema = z.object({
  projectId: z.string().min(1),
  timelineId: z.string().min(1).optional(),
  format: z.enum(["mp4", "webm", "mov"]).default("mp4"),
  resolution: z.enum(["720p", "1080p", "4k"]).default("1080p"),
  fps: z.union([z.literal(24), z.literal(30), z.literal(60)]).default(24),
  timeline: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = exportRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 })
  }

  // TODO: Validate project ownership, create Convex export job, enqueue Railway export worker.
  return NextResponse.json(
    { error: "Server-side export is not implemented", jobId: "stub", status: "queued" },
    { status: 501 }
  )
}
