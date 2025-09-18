'use client';

import { useState } from 'react';
import { Play, Plus, Minus } from 'lucide-react';

const SYMBOLS = ['🍒', '🍋', '🍊', '⭐', '💎'];
const PAYOUTS: Record<string, number> = { '🍒': 2, '🍋': 3, '🍊': 5, '⭐': 10, '💎': 50 };

interface SlotGameProps {
  balance: number;
  onBalanceChange: (amount: number) => void;
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

    onBalanceChange(-bet);

    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);

      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ];

      setReels(finalReels);

      const allSame = finalReels.every(symbol => symbol === finalReels[0]);
      let winAmount = 0;

      if (allSame) {
        winAmount = bet * PAYOUTS[finalReels[0]];
        setLastWin(winAmount);
        setShowWin(true);
        onBalanceChange(winAmount);
      }

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
    <div className="max-w-2xl mx-auto bg-primary/90 rounded-2xl border-2 border-casino-accent-purple p-8 shadow-2xl backdrop-blur-md">

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-casino-accent-purple to-casino-accent-blue drop-shadow-lg">
          🎰 Slot Machine
        </h2>
      </div>

      {/* Slot Reels */}
      <div className="bg-gradient-to-br from-primary via-gray-800 to-casino-accent-blue/30 rounded-xl p-8 mb-6 border-2 border-casino-accent-purple shadow-lg">
        <div className="flex justify-center gap-4 mb-4">
          {reels.map((symbol, index) => (
            <div
              key={index}
              className={`w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-casino-accent-purple/10 via-white/80 to-casino-accent-blue/10 rounded-xl flex items-center justify-center text-4xl sm:text-7xl border-4 border-casino-accent-purple shadow-md transition-transform ${isSpinning ? 'animate-bounce' : 'hover:scale-110'
                }`}
            >
              {symbol}
            </div>
          ))}
        </div>

        {showWin && lastWin > 0 && (
          <div className="text-center">
            <div className="text-casino-accent-green font-extrabold text-3xl animate-pulse drop-shadow">
              🎉 WIN: ${lastWin} 🎉
            </div>
            <div className="text-casino-green text-base mt-1 font-semibold">
              {PAYOUTS[reels[0]]}x Multiplier!
            </div>
          </div>
        )}
      </div>

      {/* Betting Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between text-casino-accent-blue font-semibold">
          <span>Bet Amount:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustBet(-5)}
              className="bg-casino-red hover:bg-red-700 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow"
              disabled={bet <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="text-casino-accent-purple font-extrabold text-2xl w-14 text-center">
              ${bet}
            </span>
            <button
              onClick={() => adjustBet(5)}
              className="bg-casino-green hover:bg-green-600 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow"
              disabled={bet >= Math.min(100, balance)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setBet(1)}
            className="flex-1 bg-gradient-to-r from-casino-red/50 to-casino-red/80 hover:from-casino-red/30 hover:to-casino-red text-white py-2 px-3 rounded-lg text-base font-semibold transition-colors shadow"
          >
            Min ($1)
          </button>
          <button
            onClick={maxBet}
            className="flex-1 bg-gradient-to-r from-casino-green/50 to-casino-green/80 hover:from-casino-green/20 hover:to-casino-green text-white py-2 px-3 rounded-lg text-base font-semibold transition-colors shadow"
          >
            Max (${Math.min(100, balance)})
          </button>
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={balance < bet || isSpinning}
        className={`w-full py-4 rounded-2xl font-extrabold text-2xl flex items-center justify-center gap-2 transition-all shadow-xl border-2 border-casino-accent-purple ${balance < bet || isSpinning
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-casino-accent-purple to-casino-accent-blue hover:scale-105 text-primary'
          }`}
      >
        <Play size={28} className={isSpinning ? 'animate-spin' : ''} />
        {isSpinning ? 'SPINNING...' : `SPIN ($${bet})`}
      </button>

      {/* Quick Stats */}
      <div className="mt-4 text-center text-lg text-casino-accent-blue/80 font-medium">
        Balance:{' '}
        <span className="text-casino-green font-extrabold text-lg">${balance}</span>
        {balance < bet && (
          <div className="text-casino-red mt-1 font-semibold">Insufficient balance!</div>
        )}
      </div>

      {/* Payouts */}
      <div className="mt-8 text-sm text-casino-accent-blue/70">
        <div className="text-center mb-2 font-bold tracking-wide uppercase">Payouts (3 matching):</div>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(PAYOUTS).map(([symbol, multiplier]) => (
            <div
              key={symbol}
              className="bg-gradient-to-br from-primary via-gray-900 to-casino-accent-purple/20 rounded-lg p-3 text-center border border-casino-accent-purple/40 shadow"
            >
              <div className="text-3xl">{symbol}</div>
              <div className="text-casino-accent-purple font-extrabold text-lg">{multiplier}x</div>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
}
