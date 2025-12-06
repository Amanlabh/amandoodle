'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Edit } from 'lucide-react'

// Initialize Supabase with hardcoded credentials
const supabase = createClient(
  'https://nuwkxsreqhfvvcxcopsm.supabase.co',  // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51d2t4c3JlcWhmdnZjeGNvcHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzMwNDMsImV4cCI6MjA4MDE0OTA0M30._jjVuEpzVhiMwVxnI_cZq6mrYsOC-7VjnDzfJo4IF1s'                     // Replace with your Supabase anon key
)

type Status = {
  id: string
  status_text: string
  image_url: string | null
  expires_at: string | null
  user_email: string
  created_at: string
}

// Helper function to format relative time
function formatRelativeTime(dateString: string, currentTime: Date = new Date()): string {
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}y ago`
}

export function StatusSection() {
  const [status, setStatus] = useState<Status | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [formData, setFormData] = useState({
    text: '',
    imageUrl: '',
    duration: '24'
  })

  useEffect(() => {
    fetchStatus()
    checkAdminStatus()
    
    // Update time every minute to refresh relative time display
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email && ['amanlabh4@gmail.com', 'hackaman4@gmail.com'].includes(user.email)) {
      setIsAdmin(true)
    }
  }

  const fetchStatus = async () => {
    const { data, error } = await supabase
      .from('statuses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!error && data) {
      setStatus(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to update status",
        variant: "destructive",
      })
      return
    }

    const expiresAt = formData.duration === 'infinite' 
      ? null 
      : new Date(Date.now() + parseInt(formData.duration) * 60 * 60 * 1000).toISOString()

    const { error } = await supabase
      .from('statuses')
      .insert({
        user_email: user.email,
        status_text: formData.text,
        image_url: formData.imageUrl || null,
        expires_at: expiresAt
      })

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Status updated!",
        description: "Your status has been updated successfully.",
      })
      fetchStatus()
      setIsEditing(false)
    }
    setIsLoading(false)
  }


  return (
    <div className="mb-6 p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-medium text-muted-foreground">CURRENT STATUS</h2>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            {status ? 'Edit' : 'Set Status'}
          </Button>
        )}
      </div>

      {status ? (
        <div className="space-y-3">
          {status.image_url && (
            <img
              src={status.image_url}
              alt="Status"
              className="rounded-md w-full max-w-md h-auto border border-border"
            />
          )}
          <div className="flex items-start justify-between gap-2">
            <p className="text-foreground text-sm flex-1">{status.status_text}</p>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(status.created_at, currentTime)}
            </p>
          </div>
          {status.expires_at && (
            <p className="text-xs text-muted-foreground">
              Expires: {new Date(status.expires_at).toLocaleString()}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No status set</p>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Status Text</Label>
              <Input
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
                placeholder="What's on your mind?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({...formData, duration: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="infinite">No expiration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {status ? 'Update' : 'Set Status'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
