// BlackjackGame.tsx
import React from 'react'
import { useBlackjackGame } from './useBlackJackGame'
import { BetControls } from './BetControls'
import { GameTable } from './GameTable'

export default function BlackJackGame() {
  const {
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
  } = useBlackjackGame()

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">BLACKJACK</h1>
          <div className="text-2xl font-bold">
            ${balance.toFixed(2)} USD
          </div>
        </div>

        <div className="flex flex-col-reverse lg:flex-row justify-center">
          {/* Left Panel - Controls */}
          <BetControls
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            balance={balance}
            gameState={gameState}
            gameResult={gameResult}
            canDoubleDown={canDoubleDown}
            startGame={startGame}
            hit={hit}
            stand={stand}
            doubleDown={doubleDown}
            resetGame={resetGame}
          />

          {/* Center Panel - Game Table */}
          <GameTable
            playerHand={playerHand}
            dealerHand={dealerHand}
            gameState={gameState}
            gameResult={gameResult}
            hasDoubledDown={hasDoubledDown}
          />
        </div>
      </div>
    </div>
  )
}