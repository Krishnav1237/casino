import React, { useState, useCallback, useEffect } from 'react'
import { Spade, Heart, Diamond, Club, Plus, Minus } from 'lucide-react'

interface Card {
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs'
  rank: string
  value: number
}

interface Hand {
  cards: Card[]
  value: number
  isBlackjack: boolean
  isBusted: boolean
}

interface Chip {
  value: number
  color: string
  textColor: string
  border: string
}

type GameState = 'betting' | 'dealing' | 'playing' | 'dealer-turn' | 'ended'
type GameResult = 'win' | 'lose' | 'push' | 'blackjack' | null

export default function BlackjackGame() {
  const [balance, setBalance] = useState(1250.00)
  const [betAmount, setBetAmount] = useState(10.00)
  const [gameState, setGameState] = useState<GameState>('betting')
  const [deck, setDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Hand>({ cards: [], value: 0, isBlackjack: false, isBusted: false })
  const [dealerHand, setDealerHand] = useState<Hand>({ cards: [], value: 0, isBlackjack: false, isBusted: false })
  const [gameResult, setGameResult] = useState<GameResult>(null)
  const [canDoubleDown, setCanDoubleDown] = useState(false)
  const [hasDoubledDown, setHasDoubledDown] = useState(false)
  const [autoGame, setAutoGame] = useState(false)
  const [bettingChips, setBettingChips] = useState<number[]>([])
  const [recentGames, setRecentGames] = useState([
    { result: 'Blackjack!', profit: 15.00, bet: 10.00, multiplier: 2.5 },
    { result: 'Win', profit: 8.50, bet: 8.50, multiplier: 2.0 },
    { result: 'Loss', profit: -12.00, bet: 12.00, multiplier: 0 },
    { result: 'Push', profit: 0.00, bet: 15.00, multiplier: 1.0 },
    { result: 'Win', profit: 6.00, bet: 6.00, multiplier: 2.0 }
  ])

  // Available chip denominations
  const chipValues: Chip[] = [
    { value: 1, color: 'bg-gray-300', textColor: 'text-gray-800', border: 'border-gray-400' },
    { value: 5, color: 'bg-red-500', textColor: 'text-white', border: 'border-red-600' },
    { value: 10, color: 'bg-blue-500', textColor: 'text-white', border: 'border-blue-600' },
    { value: 25, color: 'bg-green-500', textColor: 'text-white', border: 'border-green-600' },
    { value: 50, color: 'bg-orange-500', textColor: 'text-white', border: 'border-orange-600' },
    { value: 100, color: 'bg-purple-500', textColor: 'text-white', border: 'border-purple-600' },
    { value: 500, color: 'bg-pink-500', textColor: 'text-white', border: 'border-pink-600' },
    { value: 1000, color: 'bg-yellow-400', textColor: 'text-gray-900', border: 'border-yellow-500' }
  ]

  // Add chip to bet
  const addChip = useCallback((chipValue: number) => {
    if (gameState !== 'betting') return
    if (balance < chipValue) {
      alert('Insufficient balance!')
      return
    }
    
    setBettingChips(prev => [...prev, chipValue])
    setBetAmount(prev => prev + chipValue)
  }, [gameState, balance])

  // Remove last chip
  const removeLastChip = useCallback(() => {
    if (gameState !== 'betting' || bettingChips.length === 0) return
    
    const lastChip = bettingChips[bettingChips.length - 1]
    setBettingChips(prev => prev.slice(0, -1))
    setBetAmount(prev => Math.max(0, prev - lastChip))
  }, [gameState, bettingChips])

  // Clear all chips
  const clearChips = useCallback(() => {
    if (gameState !== 'betting') return
    setBettingChips([])
    setBetAmount(0)
  }, [gameState])

  // Get chip count by value
  const getChipCount = (value: number) => {
    return bettingChips.filter(chip => chip === value).length
  }

  // Render chip stack
  const renderChipStack = (chips: number[], maxVisible = 5) => {
    const chipCounts: { [key: number]: number } = {}
    chips.forEach(chip => {
      chipCounts[chip] = (chipCounts[chip] || 0) + 1
    })

    const uniqueChips = Object.entries(chipCounts)
      .map(([value, count]) => ({ value: parseInt(value), count }))
      .sort((a, b) => b.value - a.value)

    return (
      <div className="flex flex-wrap gap-1">
        {uniqueChips.map(({ value, count }) => {
          const chipData = chipValues.find(c => c.value === value)
          if (!chipData) return null
          
          return (
            <div key={value} className="relative">
              <div className={`w-12 h-12 rounded-full ${chipData.color} ${chipData.border} border-2 flex items-center justify-center font-bold text-xs ${chipData.textColor} shadow-lg`}>
                ${value}
              </div>
              {count > 1 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {count}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Create a shuffled deck
  const createDeck = useCallback(() => {
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

    // Shuffle deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
    }

    return newDeck
  }, [])

  // Calculate hand value considering aces
  const calculateHandValue = useCallback((cards: Card[]) => {
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
  }, [])

  // Deal a card from deck
  const dealCard = useCallback((currentDeck: Card[]) => {
    if (currentDeck.length === 0) {
      const newDeck = createDeck()
      return { card: newDeck[0], remainingDeck: newDeck.slice(1) }
    }
    return { card: currentDeck[0], remainingDeck: currentDeck.slice(1) }
  }, [createDeck])

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

    setBalance(prev => prev - betAmount)
    setGameState('dealing')
    setGameResult(null)
    setHasDoubledDown(false)

    // Create new deck and deal initial cards
    const newDeck = createDeck()
    let currentDeck = newDeck

    // Deal 2 cards to player
    const { card: playerCard1, remainingDeck: deck1 } = dealCard(currentDeck)
    const { card: playerCard2, remainingDeck: deck2 } = dealCard(deck1)
    
    // Deal 2 cards to dealer (1 face up, 1 face down)
    const { card: dealerCard1, remainingDeck: deck3 } = dealCard(deck2)
    const { card: dealerCard2, remainingDeck: finalDeck } = dealCard(deck3)

    const playerCards = [playerCard1, playerCard2]
    const dealerCards = [dealerCard1, dealerCard2]

    const playerValue = calculateHandValue(playerCards)
    const dealerValue = calculateHandValue([dealerCard1]) // Only count visible card initially

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

    setDeck(finalDeck)
    setCanDoubleDown(playerCards.length === 2 && !playerBlackjack)

    // Check for immediate blackjack
    setTimeout(() => {
      if (playerBlackjack || dealerBlackjack) {
        endGame(playerCards, dealerCards, finalDeck, true)
      } else {
        setGameState('playing')
      }
    }, 1000)
  }, [betAmount, balance, createDeck, dealCard, calculateHandValue])

  // End game and determine winner
  const endGame = useCallback((pCards: Card[], dCards: Card[], currentDeck: Card[], immediate = false) => {
    const playerValue = calculateHandValue(pCards)
    const dealerValue = calculateHandValue(dCards)
    const playerBlackjack = playerValue === 21 && pCards.length === 2
    const dealerBlackjack = dealerValue === 21 && dCards.length === 2

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

    setBalance(prev => prev + winnings)
    setGameResult(result)
    setGameState('ended')

    // Update dealer hand to show true value
    setDealerHand({
      cards: dCards,
      value: dealerValue,
      isBlackjack: dealerBlackjack,
      isBusted: dealerValue > 21
    })

    // Add to recent games
    const profit = winnings - betAmount
    const resultText = result === 'blackjack' ? 'Blackjack!' : 
                     result === 'win' ? 'Win' : 
                     result === 'lose' ? 'Loss' : 'Push'

    setRecentGames(prev => [
      { result: resultText, profit, bet: betAmount, multiplier },
      ...prev.slice(0, 4)
    ])
  }, [calculateHandValue, betAmount])

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
      // Player busts
      setTimeout(() => {
        endGame(newPlayerCards, dealerHand.cards, remainingDeck)
      }, 1000)
    }
  }, [deck, playerHand.cards, dealCard, calculateHandValue, dealerHand.cards, endGame])

  // Player stands
  const stand = useCallback(() => {
    setGameState('dealer-turn')
    setCanDoubleDown(false)

    // Dealer plays
    let currentDealerCards = [...dealerHand.cards]
    let currentDeck = [...deck]

    const playDealer = () => {
      let dealerValue = calculateHandValue(currentDealerCards)
      
      if (dealerValue < 17) {
        const { card, remainingDeck } = dealCard(currentDeck)
        currentDealerCards = [...currentDealerCards, card]
        currentDeck = remainingDeck
        dealerValue = calculateHandValue(currentDealerCards)

        setDealerHand({
          cards: currentDealerCards,
          value: dealerValue,
          isBlackjack: false,
          isBusted: dealerValue > 21
        })

        setTimeout(() => {
          if (dealerValue < 17) {
            playDealer()
          } else {
            setTimeout(() => {
              endGame(playerHand.cards, currentDealerCards, currentDeck)
            }, 1000)
          }
        }, 1000)
      } else {
        setTimeout(() => {
          endGame(playerHand.cards, currentDealerCards, currentDeck)
        }, 1000)
      }
    }

    setTimeout(playDealer, 1000)
  }, [gameState, dealerHand.cards, deck, calculateHandValue, dealCard, endGame, playerHand.cards])

  // Double down
  const doubleDown = useCallback(() => {
    if (betAmount > balance) {
      alert('Insufficient balance for double down!')
      return
    }

    setBalance(prev => prev - betAmount)
    setBetAmount(prev => prev * 2)
    setHasDoubledDown(true)
    
    // Hit once and then stand
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
      // Player busts
      setTimeout(() => {
        endGame(newPlayerCards, dealerHand.cards, remainingDeck)
      }, 1000)
    } else {
      // Auto stand after double down
      setGameState('dealer-turn')
      
      let currentDealerCards = [...dealerHand.cards]
      let currentDeck = remainingDeck

      const playDealer = () => {
        let dealerValue = calculateHandValue(currentDealerCards)
        
        if (dealerValue < 17) {
          const { card, remainingDeck: newDeck } = dealCard(currentDeck)
          currentDealerCards = [...currentDealerCards, card]
          currentDeck = newDeck
          dealerValue = calculateHandValue(currentDealerCards)

          setDealerHand({
            cards: currentDealerCards,
            value: dealerValue,
            isBlackjack: false,
            isBusted: dealerValue > 21
          })

          setTimeout(() => {
            if (dealerValue < 17) {
              playDealer()
            } else {
              setTimeout(() => {
                endGame(newPlayerCards, currentDealerCards, currentDeck)
              }, 1000)
            }
          }, 1000)
        } else {
          setTimeout(() => {
            endGame(newPlayerCards, currentDealerCards, currentDeck)
          }, 1000)
        }
      }

      setTimeout(playDealer, 1500)
    }
  }, [betAmount, balance, dealCard, deck, playerHand.cards, calculateHandValue, dealerHand.cards, endGame])

  // Reset game
  const resetGame = useCallback(() => {
    setGameState('betting')
    setPlayerHand({ cards: [], value: 0, isBlackjack: false, isBusted: false })
    setDealerHand({ cards: [], value: 0, isBlackjack: false, isBusted: false })
    setGameResult(null)
    setCanDoubleDown(false)
    setBettingChips([])
    if (hasDoubledDown) {
      setBetAmount(prev => prev / 2)
      setHasDoubledDown(false)
    } else {
      setBetAmount(0)
    }
  }, [hasDoubledDown])

  // Get card suit icon
  const getSuitIcon = (suit: string) => {
    switch (suit) {
      case 'spades': return <Spade className="w-4 h-4" />
      case 'hearts': return <Heart className="w-4 h-4 text-red-500" />
      case 'diamonds': return <Diamond className="w-4 h-4 text-red-500" />
      case 'clubs': return <Club className="w-4 h-4" />
      default: return null
    }
  }

  // Initialize deck on mount
  useEffect(() => {
    setDeck(createDeck())
  }, [createDeck])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-900 p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">BLACKJACK</h1>
          <div className="text-2xl font-bold text-yellow-400">
            ${balance.toFixed(2)} USD
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Controls */}
          <div className="bg-gray-900 rounded-xl p-6 space-y-6">
            {/* Chip Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-3">Select Chips</label>
              <div className="grid grid-cols-2 gap-2">
                {chipValues.map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => addChip(chip.value)}
                    disabled={gameState !== 'betting' || balance < chip.value}
                    className={`relative w-14 h-14 rounded-full ${chip.color} ${chip.border} border-2 flex flex-col items-center justify-center font-bold text-xs ${chip.textColor} shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="text-xs">$</span>
                    <span>{chip.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Bet */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm font-medium">Current Bet</span>
                <div className="flex gap-1">
                  <button
                    onClick={removeLastChip}
                    disabled={gameState !== 'betting' || bettingChips.length === 0}
                    className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs disabled:opacity-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={clearChips}
                    disabled={gameState !== 'betting' || bettingChips.length === 0}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="text-center mb-3">
                <div className="text-green-400 text-xl font-bold">
                  ${betAmount.toFixed(2)} USD
                </div>
              </div>
              {bettingChips.length > 0 && (
                <div className="min-h-[60px] flex items-center justify-center">
                  {renderChipStack(bettingChips)}
                </div>
              )}
            </div>

            {/* Bet Amount Input (Fallback) */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Manual Bet Amount</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setBetAmount(Math.max(0, betAmount - 5))
                    setBettingChips([])
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white w-10 h-10 rounded-lg"
                  disabled={gameState !== 'betting'}
                >
                  -
                </button>
                <input
                  type="number"
                  value={betAmount.toFixed(2)}
                  onChange={(e) => {
                    const newAmount = Math.max(0, parseFloat(e.target.value) || 0)
                    setBetAmount(newAmount)
                    setBettingChips([])
                  }}
                  className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg text-center"
                  disabled={gameState !== 'betting'}
                  step="1"
                  min="0"
                />
                <button
                  onClick={() => {
                    setBetAmount(betAmount + 5)
                    setBettingChips([])
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white w-10 h-10 rounded-lg"
                  disabled={gameState !== 'betting'}
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="text-gray-400 text-sm">
                {gameResult === 'blackjack' ? '2.5x multiplier' : 
                 gameResult === 'win' ? '2.0x multiplier' : 
                 gameResult === 'push' ? '1.0x multiplier' : '1.0x multiplier'}
              </div>
            </div>

            <div className="space-y-3">
              {gameState === 'betting' && (
                <button
                  onClick={startGame}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold text-lg"
                  disabled={betAmount === 0 || betAmount > balance}
                >
                  START GAME
                </button>
              )}

              {gameState === 'playing' && (
                <>
                  <button
                    onClick={hit}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold"
                  >
                    HIT
                  </button>
                  <button
                    onClick={stand}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold"
                  >
                    STAND
                  </button>
                  {canDoubleDown && (
                    <button
                      onClick={doubleDown}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-bold"
                      disabled={betAmount > balance}
                    >
                      DOUBLE DOWN
                    </button>
                  )}
                </>
              )}

              {gameState === 'ended' && (
                <button
                  onClick={resetGame}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold text-lg"
                >
                  NEW GAME
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setAutoGame(!autoGame)}
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  autoGame ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                Auto Game
              </button>
              <button
                className="text-gray-400 hover:text-white"
              >
                RANDOM
              </button>
            </div>
          </div>

          {/* Center Panel - Game Table */}
          <div className="lg:col-span-2 rounded-xl p-8 relative" style={{
              backgroundImage: 'url(/blackjack-board.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              boxShadow: '0 4px 32px rgba(0,0,0,0.3)'
            }}>
            {/* <h2 className="text-white text-xl font-bold text-center mb-6">BLACKJACK GAME</h2> */}
            
            {/* Dealer Hand */}
            <div className="mb-8">
              <h3 className="text-white text-lg font-bold mb-4">
                Dealer {gameState !== 'betting' && gameState !== 'dealing' && gameState !== 'playing' && `(${dealerHand.value})`}
              </h3>
              <div className="flex space-x-2">
                {dealerHand.cards.map((card, index) => (
                  <div
                    key={index}
                    className={`w-16 h-24 rounded-lg border border-gray-600 flex flex-col items-center justify-between p-2 text-xs ${
                      index === 1 && (gameState === 'dealing' || gameState === 'playing') ? 
                      'bg-gray-700 border-gray-600' : 'bg-white text-black'
                    }`}
                  >
                    {index === 1 && (gameState === 'dealing' || gameState === 'playing') ? (
                      <div className="text-white text-xs">?</div>
                    ) : (
                      <>
                        <div className="font-bold">{card.rank}</div>
                        {getSuitIcon(card.suit)}
                        <div className="font-bold rotate-180">{card.rank}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Result */}
            {gameResult && (
              <div className="text-center mb-6">
                <div className={`text-2xl font-bold ${
                  gameResult === 'win' || gameResult === 'blackjack' ? 'text-green-400' :
                  gameResult === 'lose' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {gameResult === 'win' && '🎉 YOU WIN!'}
                  {gameResult === 'lose' && '💥 YOU LOSE'}
                  {gameResult === 'push' && '🤝 PUSH'}
                  {gameResult === 'blackjack' && '🃏 BLACKJACK!'}
                </div>
              </div>
            )}

            {/* Player Hand */}
            <div>
              <h3 className="text-white text-lg font-bold mb-4">
                You {playerHand.cards.length > 0 && `(${playerHand.value})`}
                {playerHand.isBlackjack && ' - Blackjack!'}
                {playerHand.isBusted && ' - Busted!'}
              </h3>
              <div className="flex space-x-2">
                {playerHand.cards.map((card, index) => (
                  <div
                    key={index}
                    className="w-16 h-24 bg-white rounded-lg border border-gray-300 flex flex-col items-center justify-between p-2 text-xs text-black"
                  >
                    <div className="font-bold">{card.rank}</div>
                    {getSuitIcon(card.suit)}
                    <div className="font-bold rotate-180">{card.rank}</div>
                  </div>
                ))}
              </div>
            </div>

            {hasDoubledDown && (
              <div className="text-center mt-4">
                <div className="text-purple-400 font-bold">DOUBLED DOWN!</div>
              </div>
            )}
          </div>

          {/* Right Panel - Recent Games */}
          {/* <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Recent Games</h3>
            <div className="space-y-2">
              {recentGames.map((game, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-3 text-sm">
                  <div className={`font-bold ${game.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {game.profit >= 0 ? '+' : ''}{game.profit.toFixed(2)} USD
                  </div>
                  <div className="text-gray-400">
                    {game.result}, {game.multiplier.toFixed(1)}x
                  </div>
                  <div className="text-gray-500 text-xs">
                    Bet: ${game.bet.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-gray-400 text-xs">
                <div className="mb-2">
                  <div className="font-medium mb-1">Payouts:</div>
                  <div>Win: 2.0x</div>
                  <div>Blackjack: 2.5x</div>
                  <div>Push: 1.0x</div>
                </div>
                <div className="flex items-center justify-center space-x-4 mb-2">
                  <span>💎 Visa</span>
                  <span>💳 Mastercard</span>
                  <span>₿ Crypto</span>
                </div>
                <p className="text-center">Gambling can be addictive, please play responsibly.</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}