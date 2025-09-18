'use client';

import { useState } from 'react';
import { Play, Plus, Minus } from 'lucide-react';

const SYMBOLS = ['🍒', '🍋', '🍊', '⭐', '💎'];
const PAYOUTS: Record<string, number> = { '🍒': 2, '🍋': 3, '🍊': 5, '⭐': 10, '💎': 50 };

interface SlotGameProps {
  balance: number;
  onBalanceChange: (amount: number) => void; // Positive for wins, negative for bets
  onGameResult?: (result: { bet: number; win: number; symbols: string[] }) => void;
}

export default function SlotGame({ balance, onBalanceChange, onGameResult }: SlotGameProps) {
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [lastWin, setLastWin] = useState(0);
  const [showWin, setShowWin] = useState(false);

  const spin = async () => {
    if (balance < bet || isSpinning) return;
    
    setIsSpinning(true);
    setLastWin(0);
    setShowWin(false);
    
    // Deduct bet immediately
    onBalanceChange(-bet);
    
    // Animate spinning for 1.5 seconds
    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]);
    }, 100);
    
    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Generate final result
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ];
      
      setReels(finalReels);
      
      // Check for wins
      const allSame = finalReels.every(symbol => symbol === finalReels[0]);
      let winAmount = 0;
      
      if (allSame) {
        winAmount = bet * PAYOUTS[finalReels[0]];
        setLastWin(winAmount);
        setShowWin(true);
        onBalanceChange(winAmount); // Add winnings to balance
      }
      
      // Report game result for analytics/blockchain logging
      onGameResult?.({
        bet,
        win: winAmount,
        symbols: finalReels
      });
      
      setIsSpinning(false);
    }, 1500);
  };

  const adjustBet = (amount: number) => {
    const newBet = Math.max(1, Math.min(Math.min(100, balance), bet + amount));
    setBet(newBet);
  };

  const maxBet = () => {
    setBet(Math.min(100, balance));
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg mx-auto border border-gray-700">
      {/* Game Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          🎰 Slot Machine
        </h2>
      </div>

      {/* Slot Reels */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6 border-2 border-yellow-500">
        <div className="flex justify-center gap-3 mb-4">
          {reels.map((symbol, index) => (
            <div
              key={index}
              className={`w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg flex items-center justify-center text-3xl sm:text-4xl border-4 border-yellow-400 transition-transform ${
                isSpinning ? 'animate-bounce' : 'hover:scale-105'
              }`}
            >
              {symbol}
            </div>
          ))}
        </div>
        
        {showWin && lastWin > 0 && (
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-2xl animate-pulse">
              🎉 WIN: ${lastWin} 🎉
            </div>
            <div className="text-green-400 text-sm mt-1">
              {PAYOUTS[reels[0]]}x Multiplier!
            </div>
          </div>
        )}
      </div>

      {/* Betting Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Bet Amount:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustBet(-5)}
              className="bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded flex items-center justify-center transition-colors"
              disabled={bet <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="text-yellow-400 font-bold text-xl w-12 text-center">
              ${bet}
            </span>
            <button
              onClick={() => adjustBet(5)}
              className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 rounded flex items-center justify-center transition-colors"
              disabled={bet >= Math.min(100, balance)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setBet(1)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors"
          >
            Min ($1)
          </button>
          <button
            onClick={maxBet}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors"
          >
            Max (${Math.min(100, balance)})
          </button>
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={balance < bet || isSpinning}
        className={`w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all ${
          balance < bet || isSpinning
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}
      >
        <Play size={24} className={isSpinning ? 'animate-spin' : ''} />
        {isSpinning ? 'SPINNING...' : `SPIN ($${bet})`}
      </button>

      {/* Quick Stats */}
      <div className="mt-4 text-center text-sm text-gray-400">
        Balance: <span className="text-green-400 font-bold">${balance}</span>
        {balance < bet && <div className="text-red-400 mt-1">Insufficient balance!</div>}
      </div>

      {/* Payouts Reference */}
      <div className="mt-6 text-xs text-gray-400">
        <div className="text-center mb-2 font-medium">Payouts (3 matching):</div>
        <div className="grid grid-cols-5 gap-1">
          {Object.entries(PAYOUTS).map(([symbol, multiplier]) => (
            <div key={symbol} className="bg-gray-800 rounded p-2 text-center">
              <div className="text-lg">{symbol}</div>
              <div className="text-yellow-400 font-bold">{multiplier}x</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}