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
      {/* 3D Grid Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
              linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 0%, transparent 0%, var(--background) 70%),
              linear-gradient(to bottom, transparent 0%, var(--background) 100%)
            `,
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[60vh]"
          style={{
            background: "linear-gradient(to top, var(--background) 0%, transparent 100%)",
            transform: "perspective(500px) rotateX(60deg)",
            transformOrigin: "bottom center",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
                linear-gradient(to bottom, var(--grid-color) 2px, transparent 2px)
              `,
              backgroundSize: "80px 40px",
            }}
          />
        </div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(var(--grid-color) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <DoodleDinoGame />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:py-24">
        <header className="mb-16">
          <div className="mb-6 inline-block rounded border border-border bg-card/80 backdrop-blur-sm px-3 py-1 font-mono text-sm text-muted-foreground">
            ~/aman-kumar
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Aman Kumar</h1>
          <p className="mb-4 font-mono text-lg text-muted-foreground">
            Flutter, React Native,  Data Engineering & Automation, React, Vue.js, Next.js, Cloud/DevOps, Scripting, Gen AI — Fullstack Engineer
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
                <p>Final-year BTech CSE student building full-stack products with AI and cloud.</p>
                <p>
                  Learning applied AI systems (Claude API, MCP, AI Fluency foundations) and modern product delivery.
                  <a
                    href="https://www.coursera.org/account/accomplishments/verify/VE6ZT33QFF3P"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 font-medium text-foreground hover:underline underline-offset-4"
                  >
                    Coursera certificate
                  </a>
                </p>
                <p>
                  <a
                    href="https://learn.microsoft.com/en-gb/users/amankumar-3964/credentials/604498f53c720976?ref=https%3A%2F%2Fwww.linkedin.com%2F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground hover:underline underline-offset-4"
                  >
                    Microsoft Certified Cloud Engineer
                  </a>{" "}
                  with hands-on infrastructure and deployment experience.
                </p>
                <p>
                  Ex AI Intern at{" "}
                  <a
                    href="https://peakagent.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:underline underline-offset-4"
                  >
                    peakagent.ai
                  </a>{" "}
                  & Ex Fullstack Developer at{" "}
                  <a
                    href="https://www.motojojo.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:underline underline-offset-4"
                  >
                    motojojo.co
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
