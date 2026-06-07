import { NextResponse } from "next/server"

export async function POST(req: Request) {
  await req.text()

  // TODO: Verify paddle-signature, process transaction.completed/subscription events.
  return NextResponse.json({ received: true }, { status: 200 })
}
