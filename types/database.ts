export type Profile = {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  subscription_status: 'active' | 'cancelled' | 'lapsed' | 'none'
  subscription_plan: 'monthly' | 'yearly' | null
  subscription_renewal_date: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  charity_id: string | null
  charity_percentage: number
  created_at: string
  updated_at: string
}

export type Charity = {
  id: string
  name: string
  description: string
  image_url: string | null
  website_url: string | null
  is_featured: boolean
  created_at: string
}

export type Score = {
  id: string
  user_id: string
  score: number
  played_date: string
  created_at: string
}

export type Draw = {
  id: string
  draw_month: string
  draw_type: 'random' | 'algorithmic'
  status: 'pending' | 'simulated' | 'published'
  winning_numbers: number[] | null
  prize_pool_total: number | null
  pool_5_match: number | null
  pool_4_match: number | null
  pool_3_match: number | null
  active_subscriber_count: number
  jackpot_rollover: boolean
  published_at: string | null
  created_at: string
}

export type DrawEntry = {
  id: string
  draw_id: string
  user_id: string
  numbers: number[]
  match_count: number
  prize_tier: '5-match' | '4-match' | '3-match' | null
  prize_amount: number
  created_at: string
  draws?: Draw
}

export type WinnerVerification = {
  id: string
  draw_entry_id: string
  user_id: string
  proof_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  payout_status: 'pending' | 'paid'
  admin_notes: string | null
  reviewed_at: string | null
  created_at: string
  draw_entries?: DrawEntry & { draws?: Draw }
}

export type CharityContribution = {
  id: string
  user_id: string
  charity_id: string
  amount: number
  subscription_period: string
  created_at: string
}

export type SubscriptionEvent = {
  id: string
  stripe_event_id: string
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}

export type Donation = {
  id: string
  user_id: string
  charity_id: string
  amount: number
  created_at: string
}

// Admin analytics view type
export type AdminAnalytics = {
  active_subscribers: number
  inactive_subscribers: number
  total_scores_entered: number
  total_draws_published: number
  total_charity_contributed: number
  total_prize_pool_distributed: number
}
