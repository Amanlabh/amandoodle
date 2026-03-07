import { NextRequest, NextResponse } from "next/server"
import { getAllBlogPosts } from "@/lib/blog"

export async function GET(request: NextRequest) {
  const limitValue = request.nextUrl.searchParams.get("limit")
  const parsedLimit = limitValue ? Number.parseInt(limitValue, 10) : undefined
  const limit = Number.isFinite(parsedLimit) && parsedLimit && parsedLimit > 0 ? parsedLimit : undefined

  const posts = await getAllBlogPosts(false)
  const sliced = limit ? posts.slice(0, limit) : posts

  return NextResponse.json({
    posts: sliced,
  })
}
