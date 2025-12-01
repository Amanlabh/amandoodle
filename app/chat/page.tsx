"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ChatContainer from '@/components/chat-container'

export default function ChatPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      {/* 3D Grid Background - Same as main page */}
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

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          
          <div className="mb-6 inline-block rounded border border-border bg-card/80 backdrop-blur-sm px-3 py-1 font-mono text-sm text-muted-foreground">
            ~/chat
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {user?.email === 'amanlabh4@gmail.com' ? 'Admin Chat' : 'Drop a Message'}
          </h1>
          <p className="mb-6 font-mono text-lg text-muted-foreground">
            {user?.email === 'amanlabh4@gmail.com' 
              ? 'Manage conversations with visitors'
              : 'Start a real-time conversation with Aman'
            }
          </p>
        </div>

        {/* Chat Container */}
        <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6">
          <ChatContainer />
        </div>

        {/* Info Section */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageCircle size={20} />
              Real-time Chat
            </h3>
            <p className="text-sm text-muted-foreground">
              Messages appear instantly without needing to refresh. Stay connected with real-time updates.
            </p>
          </div>
          
          <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6">
            <h3 className="font-semibold text-foreground mb-3">Secure Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Sign in with Google to start chatting. Your conversations are private and secure.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
