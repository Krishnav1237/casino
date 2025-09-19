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
    <div className="min-h-full p-6">
      <div className="max-w-8xl mx-auto">

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