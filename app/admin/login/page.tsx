import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import { getAdminPasswordHint, loginAdmin } from "@/lib/admin-auth"

interface AdminLoginPageProps {
  searchParams: Promise<{
    error?: string
  }>
}

async function loginAction(formData: FormData) {
  "use server"

  const password = String(formData.get("password") ?? "").trim()
  const isValid = await loginAdmin(password)

  if (!isValid) {
    redirect("/admin/login?error=invalid")
  }

  redirect("/admin/blog/new")
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams
  const showError = params.error === "invalid"

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="relative z-10 mx-auto max-w-xl px-6 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="rounded-xl border border-border bg-card/80 p-6 md:p-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Admin Login</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter admin password to write MDX blogs and set their status.
          </p>

          <form action={loginAction} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Admin password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {showError && (
              <p className="text-sm text-red-600">Invalid admin password.</p>
            )}

            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Continue
            </button>
          </form>

          <p className="mt-5 rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
            {getAdminPasswordHint()}
          </p>
        </div>
      </div>
    </main>
  )
}
