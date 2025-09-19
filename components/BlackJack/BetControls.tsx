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
    <div className="bg-slate-800 p-8 px-4 md:px-8 space-y-8 border-t-4 md:border-t-0 md:border-r-4 border-[#0A1A2F] md:rounded-l-2xl shadow-xl md:min-w-[200px]">
      {/* Bet Amount Input */}
      <div>
        <label className="block text-white text-lg font-semibold mb-4 tracking-wide">
          Bet Amount
        </label>
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

      {/* Multiplier Display */}
      <div className="text-center">
        <div className="text-gray-400 text-base font-medium tracking-wide">
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
    </div>
  )
}