/**
 * DRAW ENGINE
 * Supports: random draw | algorithmic (weighted by score frequency)
 */

/** Generate 5 unique winning numbers (1–45) using random selection */
export function generateRandomDraw(): number[] {
  const numbers = new Set<number>()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  return [...numbers].sort((a, b) => a - b)
}

/** Weighted draw — numbers appearing more often in user scores are more likely */
export function generateAlgorithmicDraw(allUserScores: number[]): number[] {
  const frequency: Record<number, number> = {}
  for (const s of allUserScores) {
    frequency[s] = (frequency[s] || 0) + 1
  }

  // Weight pool: each number appears proportional to its frequency
  const pool: number[] = []
  for (let n = 1; n <= 45; n++) {
    const weight = frequency[n] || 1
    for (let i = 0; i < weight; i++) pool.push(n)
  }

  const chosen = new Set<number>()
  while (chosen.size < 5) {
    chosen.add(pool[Math.floor(Math.random() * pool.length)])
  }
  return [...chosen].sort((a, b) => a - b)
}

/** Check how many of a user's numbers match the winning draw */
export function checkMatch(userNumbers: number[], winningNumbers: number[]): number {
  return userNumbers.filter(n => winningNumbers.includes(n)).length
}

/** Determine prize tier from match count */
export function getPrizeTier(matchCount: number): '5-match' | '4-match' | '3-match' | null {
  if (matchCount >= 5) return '5-match'
  if (matchCount === 4) return '4-match'
  if (matchCount === 3) return '3-match'
  return null
}

/** Calculate prize pool breakdown from active subscriber counts */
export function calculatePrizePool(
  monthlyCount: number,
  yearlyCount: number,
  monthlyFee = 9.99,
  yearlyFee = 99.99 / 12
): { total: number; pool5: number; pool4: number; pool3: number } {
  const total = (monthlyCount * monthlyFee) + (yearlyCount * yearlyFee)
  // Exclude charity portion (avg 10%), 60% of remainder goes to prize pool
  const poolTotal = total * 0.9 * 0.6
  return {
    total: poolTotal,
    pool5: poolTotal * 0.40,
    pool4: poolTotal * 0.35,
    pool3: poolTotal * 0.25,
  }
}
