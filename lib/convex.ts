import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Don't throw when the URL is missing — the app runs in local demo mode without Convex.
// Only create the client when a real URL is provided. Callers that use `convex` should
// guard with `if (!convex) return` or check `convexUrl` before using it.
export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
