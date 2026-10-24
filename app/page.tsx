"use client"

import { Github, ExternalLink, Mail, Linkedin, Twitter, MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"
import GitHubStats from "@/components/github-stats"
import WorkExperience from "@/components/work-experience"
import NotesSection from "@/components/notes-section"
import FeedbackSection from "@/components/feedback-section"
import ChatContainer from "@/components/chat-container"
import { StatusSection } from "@/components/status-section"
import { BlogHomeSection } from "@/components/blog-home-section"
import { DoodleDinoGame } from "@/components/doodle-dino-game"
import { BlackHole } from "@/components/black-hole"

export default function Home() {
  const [terminalText, setTerminalText] = useState("")
  const fullText = "For work inquiries, email me at amanlabh4@gmail.com"

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTerminalText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <BlackHole />

      <DoodleDinoGame />

      {/* Content */}
      <div data-warp className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:py-24">
        <header className="mb-16">
          <div className="mb-6 inline-block rounded border border-border bg-card/80 backdrop-blur-sm px-3 py-1 font-mono text-sm text-muted-foreground">
            ~/aman-kumar
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Aman Kumar Labh</h1>
          <p className="mb-4 font-mono text-lg text-muted-foreground">
            Data Engineering & Automation, Cloud/DevOps, Scripting, Gen AI, System Design & Architecture, Scalable Systems — Fullstack Engineer
          </p>
          <StatusSection />

          <div className="flex gap-4">
            <a
              href="https://github.com/Amanlabh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/aman-labh-95a205216/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://twitter.com/AmanLabh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Twitter size={20} />
            </a>
            <a
              href="/chat"
              className="text-muted-foreground transition-colors hover:text-foreground"
              title="Drop a Message"
            >
              <MessageSquare size={20} />
            </a>
            <a
              href="mailto:contact@amankumarlabh.site"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail size={20} />
            </a>
          </div>
        </header>

        <section className="mb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* About Section - Left */}
            <div>
              <h2 className="mb-6 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
                // About
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p className="font-semibold text-foreground">B.Tech graduate, Intern at Paytm.</p>
                <p>
                  Worked with entertainment startups, EdTech startups and a law firm, and{" "}
                  <span className="font-semibold text-foreground">
                    currently working at India&apos;s Fintech giant and a unicorn.
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-foreground">2+ years of experience</span> building scalable systems and as a technical consultant. I
                  leverage AI to build systems.
                </p>
                <p>
                  Building applied AI systems (Claude API, MCP, AI Fluency foundations) and modern product delivery.
                </p>
                <p>
                  <a
                    href="https://learn.microsoft.com/en-gb/users/amankumar-3964/credentials/604498f53c720976?ref=https%3A%2F%2Fwww.linkedin.com%2F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground hover:underline underline-offset-4"
                  >
                    Microsoft Certified Azure Administrator
                  </a>
                  .
                </p>
                <p>Focused on shipping reliable, scalable applications end-to-end.</p>
              </div>
            </div>

            {/* Work Experience Section - Right */}
            <div>
              <h2 className="mb-6 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
                // Work
              </h2>
              <WorkExperience />
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Projects Section - Left */}
            <div>
              <h2 className="mb-6 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
                // Things I made that made my life easy
              </h2>

              <div className="grid gap-4">
                <div className="group rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-foreground/20 hover:shadow-lg">
                  <h3 className="font-medium text-foreground">
                    <a
                      href="http://tracefootprint.space/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline underline-offset-4"
                    >
                      Trace Footprint
                    </a>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">Open-source project.</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>250+ LinkedIn insights.</li>
                    <li>18+ GitHub stars.</li>
                  </ul>
                </div>

                <div className="group rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-foreground/20 hover:shadow-lg">
                  <h3 className="font-medium text-foreground">Proxora AI</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Managed AI rental platform and proxy-based orchestration layer.
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Proxy routing so renters never touch raw provider keys.</li>
                    <li>Token metering, usage tracking, and payout settlement.</li>
                    <li>Developer access via CLI and REST API integrations.</li>
                  </ul>
                </div>

                <div className="group rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-foreground/20 hover:shadow-lg">
                  <h3 className="font-medium text-foreground">Artyug.art</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Platform for artists and creators to showcase and collaborate.
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Creator profiles and curated portfolio discovery.</li>
                    <li>Collaboration workflows for projects and commissions.</li>
                    <li>Community features to grow creative networks.</li>
                  </ul>
                </div>

                <div className="group rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-foreground/20 hover:shadow-lg">
                  <h3 className="font-medium text-foreground">KreatorBoard</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Swipe-based matchmaking for creators and brands.
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Intent-based matching with clean swipe UX.</li>
                    <li>Compatibility ranking across category and audience fit.</li>
                    <li>Fast shortlisting for collaborations and campaigns.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Chat Section - Right */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  // Quick Chat
                </h2>
                <a
                  href="/chat"
                  className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <MessageSquare size={16} />
                  Full Chat
                </a>
              </div>
              <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4">
                <ChatContainer />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <BlogHomeSection />
        </section>

        {/* GitHub Activity now comes after Projects */}
        <GitHubStats username="Amanlabh" />

        <section className="mb-16">
          <div className="rounded-lg border border-border bg-neutral-900 overflow-hidden shadow-xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800 border-b border-neutral-700">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs text-neutral-400 font-mono">contact ~ zsh</span>
            </div>
            {/* Terminal content */}
            <div className="p-4 font-mono text-sm">
              <div className="flex items-start gap-2 text-neutral-300">
                <span className="text-green-400">aman</span>
                <span className="text-neutral-500">:</span>
                <span className="text-blue-400">~</span>
                <span className="text-neutral-500">$</span>
                <span className="ml-1">cat contact.txt</span>
              </div>
              <div className="mt-3 text-neutral-400 leading-relaxed">
                <p>
                  {terminalText}
                  <span className="animate-pulse">_</span>
                </p>
              </div>
              <div className="mt-4 flex items-start gap-2 text-neutral-300">
                <span className="text-green-400">aman</span>
                <span className="text-neutral-500">:</span>
                <span className="text-blue-400">~</span>
                <span className="text-neutral-500">$</span>
                <a
                  href="mailto:amanlabh4@gmail.com"
                  className="ml-1 text-cyan-400 hover:underline"
                >
                  mail amanlabh4@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Notes Section - Left */}
            <div>
              <NotesSection />
            </div>

            {/* Feedback Section - Right */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <a
                  href="/feedback"
                  className="font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                
                </a>
                <a
                  href="/feedback"
                  className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <MessageSquare size={16} />
                  Full Page
                </a>
              </div>
              <FeedbackSection />
            </div>
          </div>
        </section>

        <footer className="border-t border-border pt-8">
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-foreground">$</span> echo &quot;Let&apos;s build something together&quot;
          </p>
        </footer>
      </div>
    </main>
  )
}
