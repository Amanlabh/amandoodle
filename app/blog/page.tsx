import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getAllBlogPosts } from "@/lib/blog"

export default async function BlogPage() {
  const posts = await getAllBlogPosts(false)

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="mb-6 inline-block rounded border border-border bg-card/80 backdrop-blur-sm px-3 py-1 font-mono text-sm text-muted-foreground">
          ~/blog
        </div>

        <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">// Blog</h1>
        <p className="mb-8 text-muted-foreground">
          Published posts with a strict five-word description.
        </p>

        {posts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card/80 p-6">
            <p className="text-sm text-muted-foreground">No published blogs yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="rounded-lg border border-border bg-card/80 p-5 transition-all hover:border-foreground/30"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    <Link href={`/blog/${post.slug}`} className="hover:underline underline-offset-4">
                      {post.title}
                    </Link>
                  </h2>
                  <span className="font-mono text-xs text-muted-foreground">{post.date}</span>
                </div>

                <p className="font-mono text-sm text-muted-foreground">{post.fiveWordDescription}</p>
                {post.tags.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">Tags: {post.tags.join(", ")}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
