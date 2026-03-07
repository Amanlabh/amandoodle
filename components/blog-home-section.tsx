"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface HomeBlogPost {
  slug: string
  title: string
  fiveWordDescription: string
  date: string
}

export function BlogHomeSection() {
  const [posts, setPosts] = useState<HomeBlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadPosts() {
      try {
        const response = await fetch("/api/blogs?limit=3", { cache: "no-store" })
        if (!response.ok) {
          return
        }

        const data = (await response.json()) as { posts?: HomeBlogPost[] }
        if (isMounted) {
          setPosts(data.posts ?? [])
        }
      } catch (error) {
        console.error("Failed to load blog preview:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">// Blog</h3>
        <Link href="/blog" className="text-sm font-medium text-foreground underline underline-offset-4">
          Open /blog
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading blog previews...</p>
        )}

        {!isLoading && posts.length === 0 && (
          <p className="text-sm text-muted-foreground">No published blogs yet.</p>
        )}

        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-md border border-border bg-card/70 p-3 transition-colors hover:border-foreground/30"
          >
            <p className="text-sm font-medium text-foreground">{post.title}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{post.fiveWordDescription}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
