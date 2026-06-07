import { SignIn } from "@clerk/nextjs"
import { ClerkPlaceholder } from "@/app/(auth)/_components/clerk-placeholder"
import { isDummyClerkPublishableKey, isLocalDemoAuthEnabled } from "@/lib/clerk-config"

export default function SignInPage() {
  if (isDummyClerkPublishableKey()) {
    return <ClerkPlaceholder mode="sign-in" allowDemo={isLocalDemoAuthEnabled()} />
  }

  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      fallbackRedirectUrl="/studio"
      forceRedirectUrl="/studio"
    />
  )
}
