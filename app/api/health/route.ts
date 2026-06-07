import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    convex: "not_connected",
    redis: "not_connected",
    version: "1.0.0",
  })
}
