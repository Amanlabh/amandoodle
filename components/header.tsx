'use client'

import Link from "next/link"
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <>
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-md border border-border bg-card/80 px-3 py-1.5 backdrop-blur-sm">
        <Link href="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">Home</Link>
        <span className="text-muted-foreground/60">/</span>
        <Link href="/about" className="text-xs font-medium text-muted-foreground hover:text-foreground">About</Link>
        <span className="text-muted-foreground/60">/</span>
        <Link href="/blog" className="text-xs font-medium text-muted-foreground hover:text-foreground">Blog</Link>
        <span className="text-muted-foreground/60">/</span>
        <Link href="/admin/blog/new" className="text-xs font-medium text-muted-foreground hover:text-foreground">Admin</Link>
      </div>

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
    </>
  )
}
