-- Chat system schema for Supabase

-- Chat rooms table
CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat rooms
CREATE POLICY "Users can view their own chat rooms" ON chat_rooms
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email OR auth.jwt() ->> 'email' = 'amanlabh4@gmail.com');

CREATE POLICY "Users can create their own chat rooms" ON chat_rooms
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Admin can view all chat rooms" ON chat_rooms
  FOR SELECT USING (auth.jwt() ->> 'email' = 'amanlabh4@gmail.com');

-- Policies for messages
CREATE POLICY "Users can view messages in their rooms" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = room_id 
      AND (chat_rooms.user_email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'email' = 'amanlabh4@gmail.com')
    )
  );

CREATE POLICY "Users can insert messages in their rooms" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = room_id 
      AND (chat_rooms.user_email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'email' = 'amanlabh4@gmail.com')
    )
  );

-- Indexes for performance
CREATE INDEX chat_rooms_user_email_idx ON chat_rooms(user_email);
CREATE INDEX chat_messages_room_id_idx ON chat_messages(room_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
