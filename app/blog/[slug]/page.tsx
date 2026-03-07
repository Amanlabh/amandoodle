import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/blog"
import { MdxRenderer } from "@/components/mdx-renderer"

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug, false)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedBlogPosts(post, 3)

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-24">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        <article className="rounded-xl border border-border bg-card/80 p-6 md:p-8">
          <p className="mb-3 font-mono text-xs text-muted-foreground">{post.date}</p>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{post.title}</h1>
          <p className="mb-4 font-mono text-sm text-muted-foreground">{post.fiveWordDescription}</p>

          {post.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <MdxRenderer content={post.content} />
        </article>

        <section className="mt-8 rounded-xl border border-border bg-card/80 p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Related blogs</h2>

          {relatedPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No related posts available yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-foreground/30"
                >
                  <p className="font-medium text-foreground">{relatedPost.title}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{relatedPost.fiveWordDescription}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
