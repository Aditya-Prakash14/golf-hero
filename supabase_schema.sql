-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES
-- ==========================================

-- CHARITIES TABLE
CREATE TABLE charities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- PROFILES TABLE (Extends Supabase Auth Auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('active', 'cancelled', 'lapsed', 'none')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly', null)),
  subscription_renewal_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- SCORES TABLE
CREATE TABLE scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, played_date) -- Prevent multiple score entries on the exact same day
);

-- DRAWS TABLE
CREATE TABLE draws (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_month DATE NOT NULL,
  draw_type TEXT DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  winning_numbers INTEGER[] DEFAULT NULL,
  prize_pool_total NUMERIC DEFAULT 0,
  pool_5_match NUMERIC DEFAULT 0,
  pool_4_match NUMERIC DEFAULT 0,
  pool_3_match NUMERIC DEFAULT 0,
  active_subscriber_count INTEGER DEFAULT 0,
  jackpot_rollover BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- DRAW ENTRIES TABLE (User's participation in a draw)
CREATE TABLE draw_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  numbers INTEGER[] NOT NULL,
  match_count INTEGER DEFAULT 0,
  prize_tier TEXT CHECK (prize_tier IN ('5-match', '4-match', '3-match', null)),
  prize_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(draw_id, user_id)
);

-- WINNER VERIFICATIONS TABLE
CREATE TABLE winner_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_entry_id UUID REFERENCES draw_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(draw_entry_id)
);

-- CHARITY CONTRIBUTIONS LOG
CREATE TABLE charity_contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  subscription_period TEXT NOT NULL, -- e.g., '2026-04'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- SUBSCRIPTION EVENTS LOG (Stripe Webhooks Log)
CREATE TABLE subscription_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Charities: Everyone can read, only admin can write (admin bypassed RLS via service role or explicit policy)
CREATE POLICY "Charities are viewable by everyone" ON charities FOR SELECT USING (true);

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Scores: Users can CRUD their own scores
CREATE POLICY "Users can insert their own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own scores" ON scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scores" ON scores FOR DELETE USING (auth.uid() = user_id);

-- Draws: Everyone can view published draws. Rest managed by admin.
CREATE POLICY "Users can view published draws" ON draws FOR SELECT USING (status = 'published');

-- Draw Entries: Users can view their own entries
CREATE POLICY "Users can view their own draw entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);

-- Winner Verifications: Users can view and update their own verifications (to upload proof_url)
CREATE POLICY "Users can view their own verifications" ON winner_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own verifications" ON winner_verifications FOR UPDATE USING (auth.uid() = user_id);

-- Charity Contributions: Users can view their own impact
CREATE POLICY "Users can view their own contributions" ON charity_contributions FOR SELECT USING (auth.uid() = user_id);

-- Note: Admin actions (inserting draws, updating statuses, reading all data) are handled exclusively via the Supabase Service Role key in Next.js Server Actions, which inherently bypasses RLS policies. It is vastly safer.

-- ==========================================
-- 3. TRIGGERS & FUNCTIONS
-- ==========================================

-- Function to handle new user profile auto-creation on Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Automatic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to profiles
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ==========================================
-- 4. STORAGE BUCKETS
-- ==========================================
-- Run this securely from Supabase Dashboard > Storage:
-- 1. Create a bucket named "winner-proofs" (Public: true)
-- 2. Add an RLS Policy on bucket "winner-proofs": 
--    INSERT: `auth.uid() = (SELECT user_id FROM winner_verifications WHERE id::text = split_part(name, '.', 1))` or simpler `auth.uid() = path[1]` depending on your structure. Our code uploads to `user.id/verification_id.ext`, so rule is: `(auth.uid()::text = (storage.foldername(name))[1])`.

-- ==========================================
-- 5. INITIAL SEED (Optional)
-- ==========================================
INSERT INTO charities (name, description, is_featured) VALUES 
('Macmillan Cancer Support', 'Providing physical, financial and emotional support to help everyone with cancer live life as fully as they can.', true),
('The Golf Foundation', 'Dedicated to giving children and young people the opportunity to experience golf and its benefits.', true),
('British Heart Foundation', 'Funding research to keep hearts beating and blood flowing.', false);
