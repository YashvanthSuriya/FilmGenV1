import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const enqueueRequestSchema = z.object({
  jobType: z.enum(["generate-image", "generate-video", "export-video", "sync-project"]),
  payload: z.record(z.unknown()),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = enqueueRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 })
  }

  // TODO: Call the JobQueue abstraction with Railway credentials and persist queue state in Convex.
  return NextResponse.json(
    { error: "Worker enqueue is not implemented", jobId: "stub" },
    { status: 501 }
  )
}
