import { adminClient } from '@/lib/supabase/admin'
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  checkMatch,
  getPrizeTier,
  calculatePrizePool
} from '@/lib/draw-engine'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { draw_id, publish = false } = await req.json()

    if (!draw_id) {
      return NextResponse.json({ error: 'draw_id is required' }, { status: 400 })
    }

    // 1. Get draw config
    const { data: draw, error: drawError } = await adminClient
      .from('draws')
      .select('*')
      .eq('id', draw_id)
      .single()

    if (drawError || !draw) {
      return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
    }

    // 2. Get all active subscribers + their scores
    const { data: subscribers, error: subsError } = await adminClient
      .from('profiles')
      .select('id, scores(*)')
      .eq('subscription_status', 'active')

    if (subsError) {
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
    }

    // 3. Generate winning numbers
    let winningNumbers: number[]
    if (draw.draw_type === 'algorithmic') {
      const allScores = (subscribers || []).flatMap((s: any) =>
        (s.scores || []).map((sc: any) => sc.score)
      )
      winningNumbers = generateAlgorithmicDraw(allScores)
    } else {
      winningNumbers = generateRandomDraw()
    }

    // 4. Count subscribers by plan
    const { count: monthlyCount } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')
      .eq('subscription_plan', 'monthly')

    const { count: yearlyCount } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')
      .eq('subscription_plan', 'yearly')

    const pools = calculatePrizePool(monthlyCount || 0, yearlyCount || 0)

    // 5. Process each subscriber's scores
    const entries: any[] = []
    const winners: Record<string, any[]> = { '5-match': [], '4-match': [], '3-match': [] }

    for (const subscriber of subscribers || []) {
      const userNumbers = (subscriber as any).scores.map((s: any) => s.score)
      if (userNumbers.length === 0) continue

      const matchCount = checkMatch(userNumbers, winningNumbers)
      const tier = getPrizeTier(matchCount)

      entries.push({
        draw_id,
        user_id: subscriber.id,
        numbers: userNumbers,
        match_count: matchCount,
        prize_tier: tier,
        prize_amount: 0 // set below after split
      })

      if (tier) winners[tier].push(subscriber.id)
    }

    // 6. Split prize pools equally among winners in each tier
    for (const entry of entries) {
      if (!entry.prize_tier) continue
      const tierPool =
        entry.prize_tier === '5-match' ? pools.pool5 :
        entry.prize_tier === '4-match' ? pools.pool4 : pools.pool3
      const winnerCount = winners[entry.prize_tier].length
      entry.prize_amount = winnerCount > 0 ? tierPool / winnerCount : 0
    }

    // 7. Update draw record
    const jackpotRollover = winners['5-match'].length === 0

    await adminClient.from('draws').update({
      winning_numbers: winningNumbers,
      status: publish ? 'published' : 'simulated',
      prize_pool_total: pools.total,
      pool_5_match: pools.pool5,
      pool_4_match: pools.pool4,
      pool_3_match: pools.pool3,
      active_subscriber_count: subscribers?.length || 0,
      jackpot_rollover: jackpotRollover,
      ...(publish ? { published_at: new Date().toISOString() } : {})
    }).eq('id', draw_id)

    // 8. Insert draw entries
    if (entries.length > 0) {
      await adminClient.from('draw_entries').upsert(entries, {
        onConflict: 'draw_id,user_id'
      })
    }

    // 9. Create winner verification records for winners
    if (publish) {
      const winnerEntries = entries.filter(e => e.prize_tier)
      if (winnerEntries.length > 0) {
        // Fetch newly inserted draw entries to get their IDs
        const { data: dbEntries } = await adminClient
          .from('draw_entries')
          .select('id, user_id, prize_tier')
          .eq('draw_id', draw_id)
          .not('prize_tier', 'is', null)

        if (dbEntries && dbEntries.length > 0) {
           const verifications = dbEntries.map(e => ({
              draw_entry_id: e.id,
              user_id: e.user_id,
              status: 'pending',
              payout_status: 'pending'
            }))
           await adminClient.from('winner_verifications').insert(verifications)
        }
      }
    }

    return NextResponse.json({
      winning_numbers: winningNumbers,
      pools,
      jackpot_rollover: jackpotRollover,
      winners_summary: {
        '5-match': winners['5-match'].length,
        '4-match': winners['4-match'].length,
        '3-match': winners['3-match'].length,
      }
    })
  } catch (error) {
    console.error('Error running draw:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
