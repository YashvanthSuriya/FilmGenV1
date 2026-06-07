import { NextResponse } from "next/server"

export async function POST(req: Request) {
  await req.text()

  // TODO: Verify svix-signature, process user.created/deleted/updated.
  return NextResponse.json({ received: true }, { status: 200 })
}
