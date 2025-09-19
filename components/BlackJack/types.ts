// types.ts
export interface Card {
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs'
  rank: string
  value: number
}

export interface Hand {
  cards: Card[]
  value: number
  isBlackjack: boolean
  isBusted: boolean
}

export type GameState = 'betting' | 'dealing' | 'playing' | 'dealer-turn' | 'ended'
export type GameResult = 'win' | 'lose' | 'push' | 'blackjack' | null

export interface GameStats {
  result: string
  profit: number
  bet: number
  multiplier: number
}