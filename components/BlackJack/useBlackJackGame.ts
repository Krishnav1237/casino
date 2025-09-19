// hooks/useBlackjackGame.ts
import { useState, useCallback, useEffect } from 'react'
import { Card, Hand, GameState, GameResult } from './types'
import { createDeck, calculateHandValue, dealCard, determineGameResult } from './gameUtils'
import { useBalanceStore } from '../../store/balanceStore'

export const useBlackjackGame = () => {
  const { balance, increment, decrement } = useBalanceStore()
  const [betAmount, setBetAmount] = useState(10.00)
  const [gameState, setGameState] = useState<GameState>('betting')
  const [deck, setDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Hand>({ 
    cards: [], 
    value: 0, 
    isBlackjack: false, 
    isBusted: false 
  })
  const [dealerHand, setDealerHand] = useState<Hand>({ 
    cards: [], 
    value: 0, 
    isBlackjack: false, 
    isBusted: false 
  })
  const [gameResult, setGameResult] = useState<GameResult>(null)
  const [canDoubleDown, setCanDoubleDown] = useState(false)
  const [hasDoubledDown, setHasDoubledDown] = useState(false)

  // End game and determine winner
  const endGame = useCallback((pCards: Card[], dCards: Card[]) => {
    const { result, winnings } = determineGameResult(pCards, dCards, betAmount)
    const dealerValue = calculateHandValue(dCards)

    increment(winnings)
    setGameResult(result)
    setGameState('ended')

    // Update dealer hand to show true value
    setDealerHand({
      cards: dCards,
      value: dealerValue,
      isBlackjack: dealerValue === 21 && dCards.length === 2,
      isBusted: dealerValue > 21
    })
  }, [betAmount, increment])

  // Start new game
  const startGame = useCallback(() => {
    if (betAmount === 0) {
      alert('Please place a bet!')
      return
    }
    if (betAmount > balance) {
      alert('Insufficient balance!')
      return
    }

    decrement(betAmount)
    setGameState('dealing')
    setGameResult(null)
    setHasDoubledDown(false)

    const newDeck = createDeck()
    let currentDeck = newDeck

    // Deal initial cards
    const playerCards: Card[] = []
    const dealerCards: Card[] = []

    for (let i = 0; i < 2; i++) {
      const { card: playerCard, remainingDeck: deck1 } = dealCard(currentDeck)
      const { card: dealerCard, remainingDeck: deck2 } = dealCard(deck1)
      playerCards.push(playerCard)
      dealerCards.push(dealerCard)
      currentDeck = deck2
    }

    const playerValue = calculateHandValue(playerCards)
    const dealerValue = calculateHandValue([dealerCards[0]]) // Only count visible card initially
    const playerBlackjack = playerValue === 21
    const dealerBlackjack = calculateHandValue(dealerCards) === 21

    setPlayerHand({
      cards: playerCards,
      value: playerValue,
      isBlackjack: playerBlackjack,
      isBusted: false
    })

    setDealerHand({
      cards: dealerCards,
      value: dealerValue,
      isBlackjack: dealerBlackjack,
      isBusted: false
    })

    setDeck(currentDeck)
    setCanDoubleDown(playerCards.length === 2 && !playerBlackjack)

    // Check for immediate blackjack
    setTimeout(() => {
      if (playerBlackjack || dealerBlackjack) {
        endGame(playerCards, dealerCards)
      } else {
        setGameState('playing')
      }
    }, 1000)
  }, [betAmount, balance, decrement, endGame])

  // Player hits
  const hit = useCallback(() => {
    const { card, remainingDeck } = dealCard(deck)
    const newPlayerCards = [...playerHand.cards, card]
    const newValue = calculateHandValue(newPlayerCards)

    setPlayerHand({
      cards: newPlayerCards,
      value: newValue,
      isBlackjack: false,
      isBusted: newValue > 21
    })

    setDeck(remainingDeck)
    setCanDoubleDown(false)

    if (newValue > 21) {
      setTimeout(() => {
        endGame(newPlayerCards, dealerHand.cards)
      }, 1000)
    }
  }, [deck, playerHand.cards, dealerHand.cards, endGame])

  // Dealer plays automatically
  const playDealer = useCallback((currentDealerCards: Card[], currentDeck: Card[]) => {
    const dealerValue = calculateHandValue(currentDealerCards)
    
    if (dealerValue < 17) {
      const { card, remainingDeck } = dealCard(currentDeck)
      const newDealerCards = [...currentDealerCards, card]
      const newDealerValue = calculateHandValue(newDealerCards)

      setDealerHand({
        cards: newDealerCards,
        value: newDealerValue,
        isBlackjack: false,
        isBusted: newDealerValue > 21
      })

      setTimeout(() => {
        playDealer(newDealerCards, remainingDeck)
      }, 1000)
    } else {
      setTimeout(() => {
        endGame(playerHand.cards, currentDealerCards)
      }, 1000)
    }
  }, [endGame, playerHand.cards])

  // Player stands
  const stand = useCallback(() => {
    setGameState('dealer-turn')
    setCanDoubleDown(false)
    
    setTimeout(() => {
      playDealer(dealerHand.cards, deck)
    }, 1000)
  }, [dealerHand.cards, deck, playDealer])

  // Double down
  const doubleDown = useCallback(() => {
    if (betAmount > balance) {
      alert('Insufficient balance for double down!')
      return
    }

    decrement(betAmount)
    setBetAmount(prev => prev * 2)
    setHasDoubledDown(true)
    
    const { card, remainingDeck } = dealCard(deck)
    const newPlayerCards = [...playerHand.cards, card]
    const newValue = calculateHandValue(newPlayerCards)

    setPlayerHand({
      cards: newPlayerCards,
      value: newValue,
      isBlackjack: false,
      isBusted: newValue > 21
    })

    setDeck(remainingDeck)

    if (newValue > 21) {
      setTimeout(() => {
        endGame(newPlayerCards, dealerHand.cards)
      }, 1000)
    } else {
      setGameState('dealer-turn')
      setTimeout(() => {
        playDealer(dealerHand.cards, remainingDeck)
      }, 1500)
    }
  }, [betAmount, balance, deck, playerHand.cards, dealerHand.cards, decrement, endGame, playDealer])

  // Reset game
  const resetGame = useCallback(() => {
    setGameState('betting')
    setPlayerHand({ cards: [], value: 0, isBlackjack: false, isBusted: false })
    setDealerHand({ cards: [], value: 0, isBlackjack: false, isBusted: false })
    setGameResult(null)
    setCanDoubleDown(false)
    if (hasDoubledDown) {
      setBetAmount(prev => prev / 2)
      setHasDoubledDown(false)
    }
  }, [hasDoubledDown])

  // Initialize deck on mount
  useEffect(() => {
    setDeck(createDeck())
  }, [])

  return {
    // State
    balance,
    betAmount,
    setBetAmount,
    gameState,
    playerHand,
    dealerHand,
    gameResult,
    canDoubleDown,
    hasDoubledDown,

    // Actions
    startGame,
    hit,
    stand,
    doubleDown,
    resetGame
  }
}