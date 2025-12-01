"use client"

import { useEffect, useState } from "react"
import { Github, GitFork, Star, Users, BookOpen, Activity } from "lucide-react"

interface GitHubUser {
  public_repos: number
  followers: number
  following: number
  avatar_url: string
}

interface GitHubEvent {
  id: string
  type: string
  repo: { name: string }
  created_at: string
  payload: {
    commits?: { message: string }[]
    action?: string
    ref?: string
    ref_type?: string
  }
}

interface GitHubRepo {
  name: string
  stargazers_count: number
  forks_count: number
  language: string | null
  html_url: string
}

export default function GitHubStats({ username }: { username: string }) {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [events, setEvents] = useState<GitHubEvent[]>([])
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        setLoading(true)
        const [userRes, eventsRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/events/public?per_page=10`),
          fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`),
        ])

        if (!userRes.ok) throw new Error("Failed to fetch user data")

        const userData = await userRes.json()
        const eventsData = await eventsRes.json()
        const reposData = await reposRes.json()

        setUser(userData)
        setEvents(eventsData.slice(0, 5))
        setRepos(reposData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load GitHub data")
      } finally {
        setLoading(false)
      }
    }

    fetchGitHubData()
  }, [username])

  const getEventDescription = (event: GitHubEvent) => {
    switch (event.type) {
      case "PushEvent":
        const commitMsg = event.payload.commits?.[0]?.message || "code changes"
        return `Pushed: "${commitMsg.slice(0, 50)}${commitMsg.length > 50 ? "..." : ""}"`
      case "CreateEvent":
        return `Created ${event.payload.ref_type}: ${event.payload.ref || "repository"}`
      case "PullRequestEvent":
        return `${event.payload.action} pull request`
      case "IssuesEvent":
        return `${event.payload.action} issue`
      case "WatchEvent":
        return "Starred repository"
      case "ForkEvent":
        return "Forked repository"
      default:
        return event.type.replace("Event", "")
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return `${Math.floor(diff / 604800)}w ago`
  }

  const languageColors: Record<string, string> = {
    JavaScript: "bg-yellow-400",
    TypeScript: "bg-blue-500",
    Python: "bg-green-500",
    Dart: "bg-cyan-400",
    HTML: "bg-orange-500",
    CSS: "bg-purple-500",
    Shell: "bg-emerald-500",
  }

  if (loading) {
    return (
      <section className="mb-16">
        <h2 className="mb-6 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
          // GitHub Activity
        </h2>
        <div className="grid gap-4 animate-pulse">
          <div className="h-24 rounded-lg bg-card/80 border border-border" />
          <div className="h-32 rounded-lg bg-card/80 border border-border" />
          <div className="h-48 rounded-lg bg-card/80 border border-border" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mb-16">
        <h2 className="mb-6 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
          // GitHub Activity
        </h2>
        <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 text-muted-foreground">
          Unable to load GitHub data: {error}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
        // GitHub Activity
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4 text-center">
          <BookOpen className="mx-auto mb-2 text-muted-foreground" size={20} />
          <div className="text-2xl font-bold text-foreground">{user?.public_repos || 0}</div>
          <div className="text-xs text-muted-foreground font-mono">repos</div>
        </div>
        <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4 text-center">
          <Users className="mx-auto mb-2 text-muted-foreground" size={20} />
          <div className="text-2xl font-bold text-foreground">{user?.followers || 0}</div>
          <div className="text-xs text-muted-foreground font-mono">followers</div>
        </div>
        <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4 text-center">
          <Users className="mx-auto mb-2 text-muted-foreground" size={20} />
          <div className="text-2xl font-bold text-foreground">{user?.following || 0}</div>
          <div className="text-xs text-muted-foreground font-mono">following</div>
        </div>
      </div>

      {/* Contribution Graph Section */}
      <div className="mb-6">
        <h3 className="mb-3 font-mono text-xs text-muted-foreground flex items-center gap-2">
          <Github size={14} /> Contribution Graph
        </h3>
        <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4 overflow-x-auto">
          {/* Using ghchart.rshah.org for real contribution data */}
          <img
            src={`https://ghchart.rshah.org/22c55e/${username}`}
            alt={`${username}'s GitHub contribution chart`}
            className="w-full min-w-[700px]"
          />
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground font-mono">
            <span>Less</span>
            <div className="w-[11px] h-[11px] rounded-sm bg-[#e0e0e0]" />
            <div className="w-[11px] h-[11px] rounded-sm bg-[#9be9a8]" />
            <div className="w-[11px] h-[11px] rounded-sm bg-[#40c463]" />
            <div className="w-[11px] h-[11px] rounded-sm bg-[#30a14e]" />
            <div className="w-[11px] h-[11px] rounded-sm bg-[#216e39]" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Recent Repositories */}
      <div className="mb-6">
        <h3 className="mb-3 font-mono text-xs text-muted-foreground flex items-center gap-2">
          <Github size={14} /> Recent Repositories
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {repos.slice(0, 4).map((repo) => (
            <a
              key={repo.name}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-3 transition-all hover:border-foreground/20 hover:shadow-lg"
            >
              <div className="font-medium text-sm text-foreground truncate mb-2">{repo.name}</div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${languageColors[repo.language] || "bg-gray-400"}`} />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star size={12} />
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork size={12} />
                  {repo.forks_count}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="mb-3 font-mono text-xs text-muted-foreground flex items-center gap-2">
          <Activity size={14} /> Recent Activity
        </h3>
        <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm divide-y divide-border">
          {events.map((event) => (
            <div key={event.id} className="p-3 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">{getEventDescription(event)}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {event.repo.name} · {getRelativeTime(event.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
