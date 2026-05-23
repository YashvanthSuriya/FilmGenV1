import { AuthForm } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function HomePage() {
  return (
    <AuthLayout title="Start Creating" subtitle="Sign in to your studio.">
      <AuthForm />
    </AuthLayout>
  )
}
