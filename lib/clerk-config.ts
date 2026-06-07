export const DUMMY_CLERK_PUBLISHABLE_KEY = "pk_test_ZmlsbWdlbi1kdW1teS5jbGVyay5hY2NvdW50cy5kZXYk"
export const DUMMY_CLERK_SECRET_KEY = "sk_test_placeholder"

export function isDummyClerkPublishableKey(
  publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
) {
  return !publishableKey || publishableKey === DUMMY_CLERK_PUBLISHABLE_KEY
}

export function isPlaceholderClerkEnv() {
  return (
    isDummyClerkPublishableKey() ||
    !process.env.CLERK_SECRET_KEY ||
    process.env.CLERK_SECRET_KEY === DUMMY_CLERK_SECRET_KEY
  )
}

export function isLocalDemoAuthEnabled() {
  return process.env.NODE_ENV !== "production" && isPlaceholderClerkEnv()
}
