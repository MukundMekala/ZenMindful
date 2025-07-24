/*
  # Create core application tables

  1. New Tables
    - `sessions` - Session storage for authentication
    - `users` - User profiles and onboarding data
    - `mood_entries` - Daily mood tracking
    - `memories` - Photo memories with categories
    - `chat_messages` - AI chat conversation history
    - `gratitude_entries` - Gratitude journal entries
    - `challenges` - Wellness challenges
    - `challenge_progress` - User challenge progress tracking
    - `challenge_daily_progress` - Daily challenge completion tracking

  2. Security
    - All tables have proper foreign key constraints
    - Cascade deletes for user data cleanup
    - Indexes for performance optimization

  3. Features
    - Complete user onboarding flow
    - Mood tracking with ratings and notes
    - Memory storage with categories and favorites
    - AI chat with conversation history
    - Gratitude journaling
    - Wellness challenges with progress tracking
*/

-- Session storage table (required for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Users table with comprehensive onboarding data
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  phone_number VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  name VARCHAR,
  age VARCHAR,
  wellness_goals TEXT,
  preferred_time VARCHAR,
  motivation TEXT,
  preferred_language VARCHAR DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mood tracking entries
CREATE TABLE IF NOT EXISTS mood_entries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  emoji TEXT NOT NULL,
  note TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Memory storage with categories
CREATE TABLE IF NOT EXISTS memories (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Chat message history
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_from_user BOOLEAN NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Gratitude journal entries
CREATE TABLE IF NOT EXISTS gratitude_entries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Wellness challenges
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  type VARCHAR NOT NULL,
  difficulty VARCHAR NOT NULL,
  points INTEGER NOT NULL,
  icon VARCHAR,
  start_date TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Challenge progress tracking
CREATE TABLE IF NOT EXISTS challenge_progress (
  id SERIAL PRIMARY KEY,
  challenge_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed INTEGER DEFAULT 0,
  start_date TIMESTAMP DEFAULT NOW(),
  last_activity_date TIMESTAMP,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Daily challenge completion tracking
CREATE TABLE IF NOT EXISTS challenge_daily_progress (
  id SERIAL PRIMARY KEY,
  challenge_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT NOW(),
  UNIQUE(challenge_id, user_id, date)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_timestamp ON mood_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_user_id ON gratitude_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_daily_progress_user_id ON challenge_daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_daily_progress_date ON challenge_daily_progress(date);