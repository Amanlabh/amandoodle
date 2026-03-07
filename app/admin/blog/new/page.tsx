import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, LogOut } from "lucide-react"
import { createBlogPost } from "@/lib/blog"
import { isAdminAuthenticated, logoutAdmin } from "@/lib/admin-auth"

interface AdminNewBlogPageProps {
  searchParams: Promise<{
    error?: string
    success?: string
    slug?: string
  }>
}

function buildErrorRedirect(message: string) {
  const encoded = encodeURIComponent(message)
  return `/admin/blog/new?error=${encoded}`
}

async function createBlogAction(formData: FormData) {
  "use server"

  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) {
    redirect("/admin/login")
  }

  const title = String(formData.get("title") ?? "")
  const slug = String(formData.get("slug") ?? "")
  const description = String(formData.get("description") ?? "")
  const date = String(formData.get("date") ?? "")
  const tagsRaw = String(formData.get("tags") ?? "")
  const statusRaw = String(formData.get("status") ?? "")
  const content = String(formData.get("content") ?? "")
  const status = statusRaw === "published" ? "published" : "draft"

  const tags = tagsRaw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

  try {
    const result = await createBlogPost({
      title,
      slug,
      description,
      date,
      tags,
      status,
      content,
    })

    redirect(`/admin/blog/new?success=1&slug=${result.slug}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create blog post."
    redirect(buildErrorRedirect(message))
  }
}

async function logoutAction() {
  "use server"

  await logoutAdmin()
  redirect("/admin/login")
}

export default async function AdminNewBlogPage({ searchParams }: AdminNewBlogPageProps) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) {
    redirect("/admin/login")
  }

  const params = await searchParams
  const error = params.error ?? null
  const isSuccess = params.success === "1"
  const createdSlug = params.slug
  const today = new Date().toISOString().slice(0, 10)

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut size={14} />
              Logout
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card/80 p-6 md:p-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Create Blog (MDX)</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Description must be exactly 5 words. Status can be Draft or Published.
          </p>

          {error && (
            <p className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {isSuccess && createdSlug && (
            <p className="mb-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
              Blog created successfully:{" "}
              <Link href={`/blog/${createdSlug}`} className="font-semibold underline">
                /blog/{createdSlug}
              </Link>
            </p>
          )}

          <form action={createBlogAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium text-foreground">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="My new post"
                />
              </div>

              <div>
                <label htmlFor="slug" className="mb-2 block text-sm font-medium text-foreground">
                  Slug (optional)
                </label>
                <input
                  id="slug"
                  name="slug"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="my-new-post"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
                  Description (exactly 5 words)
                </label>
                <input
                  id="description"
                  name="description"
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Build products faster with automation"
                />
              </div>

              <div>
                <label htmlFor="date" className="mb-2 block text-sm font-medium text-foreground">
                  Publish Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={today}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="tags" className="mb-2 block text-sm font-medium text-foreground">
                  Tags (comma separated)
                </label>
                <input
                  id="tags"
                  name="tags"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="nextjs, mdx, blog"
                />
              </div>

              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="draft"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="content" className="mb-2 block text-sm font-medium text-foreground">
                MDX Content
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={14}
                className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder={`# Hello world\n\nWrite your blog content in MDX format.`}
              />
            </div>

            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save MDX Blog
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
