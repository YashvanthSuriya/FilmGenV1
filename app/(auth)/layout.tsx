import { BrandLogo } from "@/components/brand-logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-8 text-text-primary">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-3 shadow-2xl">
          {children}
        </div>
      </div>
    </main>
  )
}
