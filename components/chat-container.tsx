"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageCircle, Send, User, LogOut, Users, MessageSquare } from 'lucide-react'

interface ChatRoom {
  id: string
  user_email: string
  user_name: string
  user_avatar_url?: string
  created_at: string
  updated_at: string
  last_message_at: string
  is_active: boolean
}

interface ChatMessage {
  id: string
  room_id: string
  sender_email: string
  sender_name: string
  message: string
  is_admin: boolean
  created_at: string
}

interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

export default function ChatContainer() {
  const [user, setUser] = useState<User | null>(null)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const adminEmail = 'amanlabh4@gmail.com'

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchChatRooms()
      setupRealtimeSubscriptions()
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsSigningIn(true)
    try {
      const redirectUri = `${window.location.origin}/chat`
      console.log('Redirect URI:', redirectUri)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
    } finally {
      setIsSigningIn(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setChatRooms([])
    setSelectedRoom(null)
    setMessages([])
  }

  const fetchChatRooms = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('last_message_at', { ascending: false })

      if (error) throw error
      setChatRooms(data || [])
      
      // Auto-select first room for users, or show all rooms for admin
      if (data && data.length > 0) {
        if (user.email === adminEmail) {
          // Admin sees all rooms but doesn't auto-select
        } else {
          // Regular user selects their own room
          const userRoom = data.find(room => room.user_email === user.email)
          if (userRoom) {
            setSelectedRoom(userRoom)
            fetchMessages(userRoom.id)
          } else {
            // Create new room for user
            createChatRoom()
          }
        }
      } else if (user.email !== adminEmail) {
        // Create new room for regular user
        createChatRoom()
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    }
  }

  const createChatRoom = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert([{
          user_email: user.email,
          user_name: user.user_metadata?.name || user.email,
          user_avatar_url: user.user_metadata?.avatar_url
        }])
        .select()

      if (error) throw error
      if (data && data[0]) {
        setSelectedRoom(data[0])
        setChatRooms(prev => [data[0], ...prev])
      }
    } catch (error) {
      console.error('Error creating chat room:', error)
    }
  }

  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const setupRealtimeSubscriptions = () => {
    // Subscribe to chat rooms
    const roomsSubscription = supabase
      .channel('chat_rooms_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_rooms' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setChatRooms(prev => [payload.new as ChatRoom, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setChatRooms(prev => prev.map(room => 
              room.id === payload.new.id ? payload.new as ChatRoom : room
            ))
          }
        }
      )
      .subscribe()

    // Subscribe to messages
    const messagesSubscription = supabase
      .channel('chat_messages_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          if (selectedRoom && newMessage.room_id === selectedRoom.id) {
            setMessages(prev => [...prev, newMessage])
          }
        }
      )
      .subscribe()

    return () => {
      roomsSubscription.unsubscribe()
      messagesSubscription.unsubscribe()
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoom || !user?.email) return

    const messageData = {
      room_id: selectedRoom.id,
      sender_email: user.email,
      sender_name: user.user_metadata?.name || user.email,
      message: newMessage.trim(),
      is_admin: user.email === adminEmail
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([messageData])

      if (error) throw error

      // Update room's last message time
      await supabase
        .from('chat_rooms')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedRoom.id)

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const selectRoom = (room: ChatRoom) => {
    setSelectedRoom(room)
    fetchMessages(room.id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center py-8 bg-card border border-border rounded-lg">
          <div className="mb-6">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Drop a message to me !</h3>
            <p className="text-muted-foreground mb-4">sign in to Drop me a message</p>
          </div>
          
          <button
            onClick={signInWithGoogle}
            disabled={isSigningIn}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            {isSigningIn ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-mono hover:bg-gray-200 transition-colors"
          >
            ~/aman-kumar
          </button>
        </div>
      </div>
    )
  }

  const isAdmin = user?.email === adminEmail

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex h-[600px] border border-border rounded-lg overflow-hidden bg-card">
      {/* Chat Rooms Sidebar - Admin Only */}
      {isAdmin && (
        <div className="w-80 border-r border-border bg-background">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Conversations</h3>
              <button
                onClick={signOut}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto h-full">
            {chatRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => selectRoom(room)}
                    className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                      selectedRoom?.id === room.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{room.user_name}</h4>
                        <p className="text-sm text-muted-foreground truncate">{room.user_email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {isAdmin ? selectedRoom.user_name : 'Chat with Aman'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isAdmin ? selectedRoom.user_email : 'Online'}
                    </p>
                  </div>
                </div>
                {!isAdmin && (
                  <button
                    onClick={signOut}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_admin === isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.is_admin === isAdmin
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.is_admin === isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
