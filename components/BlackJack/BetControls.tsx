// components/BetControls.tsx
import React from 'react'
import { GameState, GameResult } from './types'

interface BetControlsProps {
  betAmount: number
  setBetAmount: (amount: number) => void
  balance: number
  gameState: GameState
  gameResult: GameResult
  canDoubleDown: boolean
  startGame: () => void
  hit: () => void
  stand: () => void
  doubleDown: () => void
  resetGame: () => void
}

export const BetControls: React.FC<BetControlsProps> = ({
  betAmount,
  setBetAmount,
  balance,
  gameState,
  gameResult,
  canDoubleDown,
  startGame,
  hit,
  stand,
  doubleDown,
  resetGame
}) => {
  return (
  <div className="bg-primary/60 p-8 px-4 md:px-8 space-y-8 border-t-4 md:border-t-0 md:border-r-8 border-background md:rounded-l-2xl shadow-xl md:min-w-[200px] text-foreground">
      {/* Bet Amount Input */}
      <div>
        <label className="block text-foreground text-lg font-semibold mb-4 tracking-wide">
          Bet Amount
        </label>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setBetAmount(Math.max(0, betAmount - 5))}
            className="bg-primary/80 hover:bg-primary/70 text-foreground w-12 h-12 rounded-xl font-bold text-xl shadow-md transition-colors"
            disabled={gameState !== 'betting'}
          >
            -
          </button>
          <input
            type="number"
            value={betAmount.toFixed(2)}
            onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="flex-1 bg-primary/80 text-foreground md:px-6 py-4 rounded-xl text-center text-xl font-bold border-2 border-accent/10 focus:border-accent"
            disabled={gameState !== 'betting'}
            step="1"
            min="0"
          />
          <button
            onClick={() => setBetAmount(betAmount + 5)}
            className="bg-primary/80 hover:bg-primary/70 text-foreground w-12 h-12 rounded-xl font-bold text-xl shadow-md transition-colors"
            disabled={gameState !== 'betting'}
          >
            +
          </button>
        </div>
        <div className="text-center mt-4">
          <div className="text-success text-2xl font-extrabold drop-shadow">
            ${betAmount.toFixed(2)} USD
          </div>
        </div>
      </div>

      {/* Multiplier Display */}
      <div className="text-center">
        <div className="text-muted text-base font-medium tracking-wide">
          {gameResult === 'blackjack' ? '2.5x multiplier' : 
           gameResult === 'win' ? '2.0x multiplier' : 
           gameResult === 'push' ? '1.0x multiplier' : '1.0x multiplier'}
        </div>
      </div>

      {/* Game Buttons */}
      <div className="space-y-6">
        {gameState === 'betting' && (
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-foreground py-4 rounded-xl font-extrabold text-2xl shadow-lg transition-colors tracking-wide"
            disabled={betAmount === 0 || betAmount > balance}
          >
            START BET
          </button>
        )}

        {gameState === 'playing' && (
          <>
            <button
              onClick={hit}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-foreground py-4 rounded-xl font-extrabold text-xl shadow-lg transition-colors tracking-wide"
            >
              HIT
            </button>
            <button
              onClick={stand}
              className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success text-foreground py-4 rounded-xl font-extrabold text-xl shadow-lg transition-colors tracking-wide"
            >
              STAND
            </button>
            {canDoubleDown && (
              <button
                onClick={doubleDown}
                className="w-full bg-accent text-foreground py-3 rounded-xl font-extrabold text-xl shadow-lg transition-colors tracking-wide"
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
            className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-foreground py-4 rounded-xl font-extrabold text-2xl shadow-lg transition-colors tracking-wide"
          >
            NEW GAME
          </button>
        )}
      </div>
    </div>
  )
}