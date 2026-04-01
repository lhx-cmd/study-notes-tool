import { db } from '../../db/db'
import type { ReviewCard } from '../../lib/types'

const CACHE_ID = 'review-cards'

export async function getReviewCardsByHash(hash: string): Promise<ReviewCard[] | null> {
  const cache = await db.reviewCardsCache.get(CACHE_ID)
  if (!cache) {
    return null
  }

  if (cache.hash !== hash) {
    return null
  }

  return cache.cards
}

export async function saveReviewCards(hash: string, cards: ReviewCard[]): Promise<void> {
  await db.reviewCardsCache.put({
    id: CACHE_ID,
    hash,
    createdAt: Date.now(),
    cards,
  })
}
