import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse, type NextRequest } from "next/server"
import { isLocalDemoAuthEnabled, isPlaceholderClerkEnv } from "@/lib/clerk-config"

const isProtectedRoute = createRouteMatcher([
  "/studio(.*)",
  "/api/generate(.*)",
  "/api/export(.*)",
  "/api/worker(.*)"
])

function placeholderAuthMiddleware(req: NextRequest) {
  if (isProtectedRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("configuration_error", "clerk")
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

function localDemoAuthMiddleware() {
  return NextResponse.next()
}

const protectedClerkMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export default isPlaceholderClerkEnv()
  ? isLocalDemoAuthEnabled()
    ? localDemoAuthMiddleware
    : placeholderAuthMiddleware
  : protectedClerkMiddleware

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest|wasm)).*)",
    "/(api|trpc)(.*)"
  ]
}
