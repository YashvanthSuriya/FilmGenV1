import { SignUp } from "@clerk/nextjs"
import { ClerkPlaceholder } from "@/app/(auth)/_components/clerk-placeholder"
import { isDummyClerkPublishableKey, isLocalDemoAuthEnabled } from "@/lib/clerk-config"

export default function SignUpPage() {
  if (isDummyClerkPublishableKey()) {
    return <ClerkPlaceholder mode="sign-up" allowDemo={isLocalDemoAuthEnabled()} />
  }

  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      fallbackRedirectUrl="/studio"
      forceRedirectUrl="/studio"
    />
  )
}
