"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageSquare, Send, User, Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Feedback {
  id: string
  name: string
  message: string
  created_at: string
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [newFeedback, setNewFeedback] = useState({ name: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFeedbacks()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('feedback_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feedback' },
        (payload) => {
          setFeedbacks(prev => [payload.new as Feedback, ...prev])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) // Show more feedbacks on dedicated page

      if (error) throw error
      setFeedbacks(data || [])
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newFeedback.name.trim() || !newFeedback.message.trim()) return

    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{
          name: newFeedback.name.trim(),
          message: newFeedback.message.trim()
        }])

      if (error) throw error
      
      // Clear form
      setNewFeedback({ name: '', message: '' })
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
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
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-24">
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
            ~/feedback
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Feedback</h1>
          <p className="mb-6 font-mono text-lg text-muted-foreground">
            Share your thoughts, suggestions, or just say hello!
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Feedback Form - Left */}
          <div>
            <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6 sticky top-6">
              <h2 className="mb-6 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
                // Leave Feedback
              </h2>
              
              <form onSubmit={submitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newFeedback.name}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name..."
                    maxLength={50}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={newFeedback.message}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Share your thoughts..."
                    rows={6}
                    maxLength={500}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {newFeedback.message.length}/500 characters
                  </div>
                  <button
                    type="submit"
                    disabled={!newFeedback.name.trim() || !newFeedback.message.trim() || isSubmitting}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send size={16} />
                    )}
                    Send Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Feedback List - Right */}
          <div>
            <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  // Recent Feedback
                </h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-time</span>
                </div>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading feedbacks...
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No feedback yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  <>
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="p-4 bg-background border border-border rounded-md hover:border-foreground/20 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <User size={16} className="text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground text-sm">{feedback.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(feedback.created_at).toLocaleDateString()} at {new Date(feedback.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                              {feedback.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              {feedbacks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Heart size={12} className="text-red-500" />
                    <span>{feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updates in real-time
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
