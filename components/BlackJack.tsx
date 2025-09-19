import React, { useState, useCallback, useEffect } from 'react'
import { Spade, Heart, Diamond, Club } from 'lucide-react'
import CardComponent from './CardComponent'
import { useBalanceStore } from '../store/balanceStore'

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

type GameState = 'betting' | 'dealing' | 'playing' | 'dealer-turn' | 'ended'
type GameResult = 'win' | 'lose' | 'push' | 'blackjack' | null

export default function BlackjackGame() {
  const { balance, increment, decrement } = useBalanceStore()
  const [betAmount, setBetAmount] = useState(10.00)
  const [gameState, setGameState] = useState<GameState>('betting')
  const [deck, setDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Hand>({ cards: [], value: 0, isBlackjack: false, isBusted: false })
  const [dealerHand, setDealerHand] = useState<Hand>({ cards: [], value: 0, isBlackjack: false, isBusted: false })
  const [gameResult, setGameResult] = useState<GameResult>(null)
  const [canDoubleDown, setCanDoubleDown] = useState(false)
  const [hasDoubledDown, setHasDoubledDown] = useState(false)
  // const [autoGame, setAutoGame] = useState(false)
  // const [recentGames, setRecentGames] = useState([
  //   { result: 'Blackjack!', profit: 15.00, bet: 10.00, multiplier: 2.5 },
  //   { result: 'Win', profit: 8.50, bet: 8.50, multiplier: 2.0 },
  //   { result: 'Loss', profit: -12.00, bet: 12.00, multiplier: 0 },
  //   { result: 'Push', profit: 0.00, bet: 15.00, multiplier: 1.0 },
  //   { result: 'Win', profit: 6.00, bet: 6.00, multiplier: 2.0 }
  // ])

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

    decrement(betAmount)
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

    increment(winnings)
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

    // setRecentGames(prev => [
    //   { result: resultText, profit, bet: betAmount, multiplier },
    //   ...prev.slice(0, 4)
    // ])
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

    decrement(betAmount)
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
    if (hasDoubledDown) {
      setBetAmount(prev => prev / 2)
      setHasDoubledDown(false)
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
    <div className="min-h-full p-6">
      <div className="max-w-8xl mx-auto">

        <div className="flex flex-col-reverse lg:flex-row justify-center">
          {/* Left Panel - Controls */}
          <div className="bg-slate-800 p-8 px-4 md:px-8 space-y-8 border-t-4 md:border-t-0 md:border-r-4 border-[#0A1A2F] md:rounded-l-2xl shadow-xl md:min-w-[200px]">
            {/* Bet Amount Input */}
            <div>
              <label className="block text-white text-lg font-semibold mb-4 tracking-wide">Bet Amount</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setBetAmount(Math.max(0, betAmount - 5))}
                  className="bg-slate-700 hover:bg-slate-600 text-white w-12 h-12 rounded-xl font-bold text-xl shadow-md transition-colors"
                  disabled={gameState !== 'betting'}
                >
                  -
                </button>
                <input
                  type="number"
                  value={betAmount.toFixed(2)}
                  onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="flex-1 bg-slate-700 text-white md:px-6 py-4 rounded-xl text-center text-xl font-bold border-2 border-slate-600 focus:border-slate-500"
                  disabled={gameState !== 'betting'}
                  step="1"
                  min="0"
                />
                <button
                  onClick={() => setBetAmount(betAmount + 5)}
                  className="bg-slate-700 hover:bg-slate-600 text-white w-12 h-12 rounded-xl font-bold text-xl shadow-md transition-colors"
                  disabled={gameState !== 'betting'}
                >
                  +
                </button>
              </div>
              <div className="text-center mt-4">
                <div className="text-green-400 text-2xl font-extrabold drop-shadow">
                  ${betAmount.toFixed(2)} USD
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-gray-400 text-base font-medium tracking-wide">
                {gameResult === 'blackjack' ? '2.5x multiplier' : 
                 gameResult === 'win' ? '2.0x multiplier' : 
                 gameResult === 'push' ? '1.0x multiplier' : '1.0x multiplier'}
              </div>
            </div>

            <div className="space-y-6">
              {gameState === 'betting' && (
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-4 rounded-xl font-extrabold text-2xl shadow-lg transition-colors tracking-wide"
                  disabled={betAmount === 0 || betAmount > balance}
                >
                  START BET
                </button>
              )}

              {gameState === 'playing' && (
                <>
                  <button
                    onClick={hit}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 rounded-xl font-extrabold text-xl shadow-lg transition-colors tracking-wide"
                  >
                    HIT
                  </button>
                  <button
                    onClick={stand}
                    className="w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white py-4 rounded-xl font-extrabold text-xl shadow-lg transition-colors tracking-wide"
                  >
                    STAND
                  </button>
                  {canDoubleDown && (
                    <button
                      onClick={doubleDown}
                      className="w-full bg-orange-400 text-white py-3 rounded-xl font-extrabold text-xl shadow-lg transition-colors tracking-wide"
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
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-4 rounded-xl font-extrabold text-2xl shadow-lg transition-colors tracking-wide"
                >
                  NEW GAME
                </button>
              )}
            </div>

            {/* <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setAutoGame(!autoGame)}
                className={`px-6 py-3 rounded-xl text-white font-bold shadow-md transition-colors text-lg ${
                  autoGame ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Auto Game
              </button>
              <button
                className="text-gray-400 hover:text-white font-bold text-lg transition-colors"
              >
                RANDOM
              </button>
            </div> */}
          </div>

          {/* Center Panel - Game Table */}
          <div className="bg-slate-800 p-8 md:rounded-r-2xl shadow-2xl md:min-w-[800px] relative border border-slate-700 h-[80vh]">
            <div className="absolute inset-0 bg-gradient-radial from-green-700 to-green-900 rounded-2xl opacity-60"></div>
            <div className="relative z-10">
              {/* Dealer Hand */}
              <div className="mb-12">
                <h3 className="text-white text-2xl font-extrabold mb-6 tracking-wide">
                  Dealer {gameState !== 'betting' && gameState !== 'dealing' && gameState !== 'playing' && `(${dealerHand.value})`}
                </h3>
                <div className="flex space-x-6 justify-center">
                  {dealerHand.cards.map((card, index) => (
                    <CardComponent
                      key={index}
                      rank={card.rank}
                      suit={card.suit}
                      hidden={index === 1 && (gameState === "dealing" || gameState === "playing")}
                    />
                  ))}
                </div>
              </div>

              {/* Game Result */}
              {gameResult && (
                <div className="text-center mb-10">
                  <div className={`text-4xl font-extrabold drop-shadow-lg ${
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
                <h3 className="text-white text-2xl font-extrabold mb-6 tracking-wide">
                  You {playerHand.cards.length > 0 && `(${playerHand.value})`}
                  {playerHand.isBlackjack && ' - Blackjack!'}
                  {playerHand.isBusted && ' - Busted!'}
                </h3>
                <div className="flex space-x-6 justify-center">
                  {playerHand.cards.map((card, index) => (
                    <CardComponent
                      key={index}
                      rank={card.rank}
                      suit={card.suit}
                    />
                  ))}
                </div>
              </div>

              {hasDoubledDown && (
                <div className="text-center mt-8">
                  <div className="text-orange-400 font-extrabold text-xl drop-shadow">DOUBLED DOWN!</div>
                </div>
              )}
            </div>
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