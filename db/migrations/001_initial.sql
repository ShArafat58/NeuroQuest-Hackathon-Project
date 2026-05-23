-- ============================================================================
-- NEUROQUEST DATABASE MIGRATION - 001_INITIAL
-- ============================================================================
-- How to apply this migration in Supabase:
-- 1. Go to your Supabase Dashboard (https://supabase.com).
-- 2. Select your NeuroQuest project.
-- 3. Click on the "SQL Editor" in the left sidebar menu (terminal-like icon).
-- 4. Click "New query" to open a blank editor.
-- 5. Copy the entire contents of this file and paste it into the editor.
-- 6. Click "Run" at the bottom right.
-- 7. Ensure that the queries complete successfully.
-- ============================================================================

-- Drop tables if they already exist (for clean rebuilds if needed)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS verification_codes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  birthdate DATE NOT NULL,
  version TEXT NOT NULL CHECK (version IN ('bangla', 'english')),
  current_class TEXT CHECK (current_class IN ('ssc', 'hsc_1', 'hsc_2')),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimize queries searching by email
CREATE INDEX idx_users_email ON users(email);

-- 2. Verification codes (OTP) table for email verification & password resets
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('signup', 'reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimize queries verifying codes for specific users
CREATE INDEX idx_verification_user ON verification_codes(user_id);

-- 3. Custom Sessions table for JWT validation & persistence
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimize queries validating session tokens on incoming requests
CREATE INDEX idx_sessions_token ON sessions(token);
