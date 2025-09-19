// gameUtils.ts
import { Card, GameResult } from './types'

export const createDeck = (): Card[] => {
  const suits: ('spades' | 'hearts' | 'diamonds' | 'clubs')[] = ['spades', 'hearts', 'diamonds', 'clubs']
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  const newDeck: Card[] = []

  for (const suit of suits) {
    for (const rank of ranks) {
      let value = parseInt(rank)
      if (rank === 'A') value = 11
      if (['J', 'Q', 'K'].includes(rank)) value = 10
      
      newDeck.push({ suit, rank, value })
    }
  }

  // Shuffle deck using Fisher-Yates algorithm
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
  }

  return newDeck
}

export const calculateHandValue = (cards: Card[]): number => {
  let value = 0
  let aces = 0

  for (const card of cards) {
    if (card.rank === 'A') {
      aces++
      value += 11
    } else {
      value += card.value
    }
  }

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }

  return value
}

export const dealCard = (currentDeck: Card[]): { card: Card; remainingDeck: Card[] } => {
  if (currentDeck.length === 0) {
    const newDeck = createDeck()
    return { card: newDeck[0], remainingDeck: newDeck.slice(1) }
  }
  return { card: currentDeck[0], remainingDeck: currentDeck.slice(1) }
}

export const determineGameResult = (
  playerCards: Card[],
  dealerCards: Card[],
  betAmount: number
): { result: GameResult; winnings: number; multiplier: number } => {
  const playerValue = calculateHandValue(playerCards)
  const dealerValue = calculateHandValue(dealerCards)
  const playerBlackjack = playerValue === 21 && playerCards.length === 2
  const dealerBlackjack = dealerValue === 21 && dealerCards.length === 2

  let result: GameResult = null
  let winnings = 0
  let multiplier = 0

  if (playerValue > 21) {
    result = 'lose'
    winnings = 0
    multiplier = 0
  } else if (dealerValue > 21) {
    result = 'win'
    winnings = betAmount * 2
    multiplier = 2.0
  } else if (playerBlackjack && !dealerBlackjack) {
    result = 'blackjack'
    winnings = betAmount * 2.5
    multiplier = 2.5
  } else if (dealerBlackjack && !playerBlackjack) {
    result = 'lose'
    winnings = 0
    multiplier = 0
  } else if (playerBlackjack && dealerBlackjack) {
    result = 'push'
    winnings = betAmount
    multiplier = 1.0
  } else if (playerValue > dealerValue) {
    result = 'win'
    winnings = betAmount * 2
    multiplier = 2.0
  } else if (dealerValue > playerValue) {
    result = 'lose'
    winnings = 0
    multiplier = 0
  } else {
    result = 'push'
    winnings = betAmount
    multiplier = 1.0
  }

  return { result, winnings, multiplier }
}