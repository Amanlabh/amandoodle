import { NextRequest, NextResponse } from "next/server"

const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

export async function GET(request: NextRequest) {
  const username = (request.nextUrl.searchParams.get("username") ?? "").trim()
  const color = (request.nextUrl.searchParams.get("color") ?? "22c55e").replace(/[^a-fA-F0-9]/g, "")

  if (!username || !USERNAME_REGEX.test(username)) {
    return NextResponse.json({ error: "Invalid username." }, { status: 400 })
  }

  const upstream = `https://ghchart.rshah.org/${color || "22c55e"}/${username}`
  const response = await fetch(upstream, { next: { revalidate: 3600 } })

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch contribution graph." }, { status: 502 })
  }

  const svg = await response.text()

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
