"use client"

import { useState, useEffect } from 'react'
import { supabase, signInWithEmail, getCurrentUser } from '@/lib/supabase'
import { Trash2, Plus, Edit2, Save, X, Lock, Mail } from 'lucide-react'

interface Note {
  id: string
  content: string
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email?: string
}

export default function NotesSection() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  const authorizedEmails = ['hackaman4@gmail.com', 'amanlabh4@gmail.com']

  useEffect(() => {
    fetchNotes()
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchNotes()
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
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
      fetchNotes()
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!emailInput.trim()) return

    if (!authorizedEmails.includes(emailInput.trim())) {
      setAuthMessage('Unauthorized email address')
      return
    }

    setIsAuthenticating(true)
    setAuthMessage('')

    try {
      const { error } = await signInWithEmail(emailInput.trim())
      if (error) throw error
      setAuthMessage('Check your email for the magic link!')
    } catch (error) {
      console.error('Error signing in:', error)
      setAuthMessage('Error sending magic link')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addNote = async () => {
    if (!newNote.trim() || !user) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ content: newNote.trim() }])
        .select()

      if (error) throw error
      if (data) {
        setNotes(prev => [data[0], ...prev])
        setNewNote('')
      }
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const deleteNote = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setNotes(prev => prev.filter(note => note.id !== id))
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const updateNote = async (id: string, content: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ content: content.trim() })
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        setNotes(prev => prev.map(note => 
          note.id === id ? { ...note, content: data[0].content, updated_at: data[0].updated_at } : note
        ))
        setEditingId(null)
        setEditingContent('')
      }
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const startEditing = (note: Note) => {
    setEditingId(note.id)
    setEditingContent(note.content)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingContent('')
  }

  const saveEditing = () => {
    if (editingId && editingContent.trim()) {
      updateNote(editingId, editingContent)
    }
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
          // Notes
        </h2>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <button
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthMessage('')}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Sign in to edit
          </button>
        )}
      </div>
      
      <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6">
        {/* Add new note - only for authenticated users */}
        {user && (
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
                placeholder="Add a new note..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {user ? "No notes yet. Add your first note above!" : "No notes yet."}
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group p-3 bg-background border border-border rounded-md hover:border-foreground/20 transition-colors"
              >
                {editingId === note.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEditing()}
                      className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={saveEditing}
                      className="p-1 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString()}
                        {note.updated_at !== note.created_at && ' (edited)'}
                      </p>
                    </div>
                    {/* Edit/Delete buttons - only for authenticated users */}
                    {user && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(note)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sign-in section for non-authenticated users */}
        {!user && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sign in to add or edit notes</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                    placeholder="aman.dev"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  />
                  <button
                    onClick={handleSignIn}
                    disabled={!emailInput.trim() || isAuthenticating}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isAuthenticating ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Mail size={16} />
                    )}
                    Send Link
                  </button>
                </div>
              </div>
              
              {authMessage && (
                <div className={`text-sm p-2 rounded-md ${
                  authMessage.includes('Check your email') 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {authMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
