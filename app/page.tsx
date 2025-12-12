"use client"

import { Github, ExternalLink, Mail, Linkedin, Twitter, MessageSquare } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import GitHubStats from "@/components/github-stats"
import WorkExperience from "@/components/work-experience"
import NotesSection from "@/components/notes-section"
import FeedbackSection from "@/components/feedback-section"
import ChatContainer from "@/components/chat-container"
import { StatusSection } from "@/components/status-section"

export default function Home() {
  const [isJumping, setIsJumping] = useState(false)
  const [doodlePosition, setDoodlePosition] = useState({ y: 0 })
  const [velocity, setVelocity] = useState({ y: 0 })
  const [isGameActive, setIsGameActive] = useState(false)
  const [score, setScore] = useState(0)
  const lastScrollY = useRef(0)
  const animationRef = useRef<number | undefined>(undefined)
  const [terminalText, setTerminalText] = useState("")
  const fullText = "For work inquiries, email me at amanlabh4@gmail.com"

  // Game physics
  const jump = () => {
    if (!isJumping) {
      setIsJumping(true)
      setVelocity(prev => ({ ...prev, y: -15 }))
      setScore(prev => prev + 1)
      setTimeout(() => setIsJumping(false), 600)
    }
  }

  const gameLoop = () => {
    if (!isGameActive) return

    setVelocity(prev => {
      const newVelocity = { ...prev }
      // Apply gravity
      newVelocity.y += 0.8
      return newVelocity
    })

    setDoodlePosition(prev => {
      let newY = prev.y + velocity.y

      // Ground collision
      if (newY > 0) {
        newY = 0
        setVelocity(v => ({ ...v, y: 0 }))
        setIsJumping(false)
      }

      return { y: newY }
    })

    animationRef.current = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    if (isGameActive) {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isGameActive, velocity])

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

      {/* Interactive Doodle Game */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Score display */}
          {isGameActive && (
            <div className="absolute -top-8 right-0 font-mono text-xs text-foreground bg-card/80 px-2 py-1 rounded">
              Score: {score}
            </div>
          )}
          
          {/* Game hint */}
          {!isGameActive && (
            <div className="absolute -top-12 right-0 font-mono text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded whitespace-nowrap">
              Click to play!
            </div>
          )}
          
          {/* Doodle mascot */}
          <div
            className={`cursor-pointer transition-transform duration-100 ${isJumping ? "scale-110" : "scale-100"}`}
            style={{
              transform: `translateY(${-doodlePosition.y}px)`,
            }}
            onClick={() => {
              if (!isGameActive) {
                setIsGameActive(true)
              }
              jump()
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/doodle-mascot.png"
              alt="Interactive doodle mascot - click to jump!"
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg hover:drop-shadow-xl transition-all duration-200"
            />
          </div>
          
          {/* Ground indicator */}
          {isGameActive && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-linear-to-r from-transparent via-border to-transparent"></div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:py-24">
        <header className="mb-16">
          <div className="mb-6 inline-block rounded border border-border bg-card/80 backdrop-blur-sm px-3 py-1 font-mono text-sm text-muted-foreground">
            ~/aman-kumar
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Aman Kumar</h1>
          <p className="mb-4 font-mono text-lg text-muted-foreground">
            Flutter • React Native • Data Engineering & Automation • React • Vue.js • Next.js • Node.js • TypeScript • Python • Cloud/DevOps (AWS, GCP) • CI/CD • Docker • Kubernetes • Scripting • Gen AI • ML Ops — Fullstack Engineer
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
                <p>
                  CS student building{" "}
                  <a
                    href="https://artyug.art"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-4 hover:text-muted-foreground"
                  >
                    artyug.art
                  </a>
                  , a startup venture for artists and creators.
                </p>
                <p>
                  Ex Founding Engineer at{" "}
                  <a
                    href="https://www.motojojo.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-4 hover:text-muted-foreground"
                  >
                    Motojojo
                  </a>
                  , specializing in AI automation and generative technologies.
                </p>
                <p className="text-muted-foreground">
                  Freelancer taking on additional projects and tasks to provide startups with tech consultancy and
                  development guidance for better product outcomes.
                </p>
                <p className="text-muted-foreground">
                  Vibe coding is part of my life too - achieving 10x productivity through focused, flow-state development.
                </p>
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

        {/* GitHub Activity now comes after About */}
        <GitHubStats username="Amanlabh" />

        <section className="mb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Projects Section - Left */}
            <div>
              <h2 className="mb-6 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
                // Things I made that made my life easy
              </h2>

              <div className="grid gap-4">
                <div className="group rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-foreground/20 hover:shadow-lg">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-medium text-foreground">PortFILIA</h3>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://github.com/Amanlabh/PortFILIA"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Github size={18} />
                      </a>
                      <a
                        href="https://port-filia.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    VueJS platform to create and follow portfolios, plus schedule or request
                    Google Meet sessions.
                  </p>
                  <code className="font-mono text-xs text-muted-foreground">port-filia.vercel.app</code>
                </div>

                <div className="group rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-foreground/20 hover:shadow-lg">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-medium text-foreground">Coursera Skip & Test Chrome Extension</h3>
                    <a
                      href="https://github.com/Amanlabh/coursera"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Github size={18} />
                    </a>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Chrome extension to skip Coursera videos and automatically pass tests in one click.
                  </p>
                  <code className="font-mono text-xs text-muted-foreground">github.com/Amanlabh/coursera</code>
                </div>

                <div className="group rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-foreground/20 hover:shadow-lg">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-medium text-foreground">
                      Toutatis <span className="text-muted-foreground">(Contributor)</span>
                    </h3>
                    <a
                      href="https://github.com/Amanlabh/toutatis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Github size={18} />
                    </a>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Python script to extract Instagram info—including mobile number and Gmail—from Instagram profiles.
                  </p>
                  <code className="font-mono text-xs text-muted-foreground">github.com/Amanlabh/toutatis</code>
                </div>

                <div className="group rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-foreground/20 hover:shadow-lg">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-medium text-foreground">Twitter (Grok) Session Extractor</h3>
                    <span className="text-muted-foreground/50">
                      <ExternalLink size={18} />
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Utility to extract all the current session details from Twitter using web scraping techniques.
                  </p>
                </div>

                <div className="group rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-foreground/20 hover:shadow-lg">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-medium text-foreground">
                      Meta / Facebook <span className="text-muted-foreground">(Contributor)</span>
                    </h3>
                    <a
                      href="https://github.com/facebook/create-react-app/pull/17143#issuecomment-3315336484"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Github size={18} />
                    </a>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Contributed to Meta by helping resolve security vulnerabilities in react-scripts.
                  </p>
                  <code className="font-mono text-xs text-muted-foreground">
                    github.com/facebook/create-react-app/pull/17143
                  </code>
                </div>
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
