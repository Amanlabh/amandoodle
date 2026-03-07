import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="mb-6 inline-block rounded border border-border bg-card/80 backdrop-blur-sm px-3 py-1 font-mono text-sm text-muted-foreground">
          ~/about
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">// About</h1>
        <div className="space-y-4 rounded-xl border border-border bg-card/80 p-6 text-foreground/90">
          <p>
            CS student building products for creators, startups, and communities.
          </p>
          <p>
            Focused on full-stack development, mobile apps, AI automations, and practical product delivery.
          </p>
          <p className="text-muted-foreground">
            Also running an MDX-based blog. Visit{" "}
            <Link href="/blog" className="underline underline-offset-4 hover:text-foreground">
              /blog
            </Link>{" "}
            to read published posts.
          </p>
        </div>
      </div>
    </main>
  )
}
