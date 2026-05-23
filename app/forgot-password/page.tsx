import { AuthForm } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Reset Password" subtitle="Send a reset link to your inbox.">
      <AuthForm mode="forgot" />
    </AuthLayout>
  )
}
