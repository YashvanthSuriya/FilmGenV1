import { AuthForm } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function SignUpPage() {
  return (
    <AuthLayout title="Create Account" subtitle="Begin with the free Cine Studio tier.">
      <AuthForm mode="sign-up" />
    </AuthLayout>
  )
}
