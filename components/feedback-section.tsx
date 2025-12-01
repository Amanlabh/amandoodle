"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageSquare, Send, User, Heart } from 'lucide-react'

interface Feedback {
  id: string
  name: string
  message: string
  created_at: string
}

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [newFeedback, setNewFeedback] = useState({ name: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const feedbackEndRef = useRef<HTMLDivElement>(null)

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

  // Removed auto-scroll to prevent automatic scrolling to feedback section

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50) // Limit to last 50 feedbacks

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
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
          // Feedback
        </h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time</span>
        </div>
      </div>
      
      <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6">
        {/* Feedback Form */}
        <form onSubmit={submitFeedback} className="mb-6">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={newFeedback.name}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name..."
                maxLength={50}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              />
            </div>
            <div>
              <textarea
                value={newFeedback.message}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Share your thoughts..."
                rows={3}
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
          </div>
        </form>

        {/* Feedback List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
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
              <div ref={feedbackEndRef} />
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
    </section>
  )
}
