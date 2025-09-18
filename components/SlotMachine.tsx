'use client';

import { useState } from 'react';
import { Play, Plus, Minus } from 'lucide-react';

const SYMBOLS = ['🍒', '🍋', '🍊', '⭐', '💎'];
const PAYOUTS: Record<string, number> = {
  '🍒': 2,
  '🍋': 3,
  '🍊': 5,
  '⭐': 10,
  '💎': 50,
};

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
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);

      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ];

      setReels(finalReels);

      const allSame = finalReels.every((symbol) => symbol === finalReels[0]);
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
        symbols: finalReels,
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
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto bg-primary rounded-xl shadow-xl p-6 md:flex md:gap-8 items-start">
        {/* Left - Slot Game Display */}
        <div className="flex-1 bg-secondary/10 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-foreground mb-10">Slot Machine</h2>

          <div className="flex justify-center items-center gap-4 mb-4">
            {reels.map((symbol, idx) => (
              <div
                key={idx}
                className={`w-20 h-20 sm:w-36 sm:h-36 bg-foreground rounded-lg flex items-center justify-center text-6xl border border-accent transition-transform ${
                  isSpinning ? 'animate-pulse' : ''
                }`}
              >
                {symbol}
              </div>
            ))}
          </div>

          {showWin && lastWin > 0 && (
            <div className="text-center mt-2">
              <div className="text-success text-xl font-bold">+${lastWin} Win</div>
              <div className="text-muted text-sm">({PAYOUTS[reels[0]]}x payout)</div>
            </div>
          )}
        </div>

        {/* Right - Controls */}
        <div className="w-full md:w-80 mt-6 md:mt-0 bg-secondary/10 p-6 rounded-lg space-y-6">
          {/* Bet Controls */}
          <div>
            <label className="block text-base text-muted mb-3">Bet Amount</label>
            <div className="flex items-center justify-between">
              <button
                onClick={() => adjustBet(-5)}
                className="w-8 h-8 bg-danger text-foreground rounded flex items-center justify-center disabled:opacity-50"
                disabled={bet <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="text-xl font-bold text-accent">${bet}</span>
              <button
                onClick={() => adjustBet(5)}
                className="w-8 h-8 bg-success text-foreground rounded flex items-center justify-center disabled:opacity-50"
                disabled={bet >= Math.min(100, balance)}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setBet(1)}
                className="flex-1 bg-primary text-foreground py-1 rounded text-sm"
              >
                Min ($1)
              </button>
              <button
                onClick={maxBet}
                className="flex-1 bg-success text-foreground py-1 rounded text-sm"
              >
                Max (${Math.min(100, balance)})
              </button>
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={spin}
            disabled={balance < bet || isSpinning}
            className={`w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              balance < bet || isSpinning
                ? 'bg-muted text-foreground/50 cursor-not-allowed'
                : 'bg-accent/70 text-background hover:brightness-110'
            }`}
          >
            <Play size={20} className={isSpinning ? 'animate-spin' : ''} />
            {isSpinning ? 'Spinning...' : `Spin ($${bet})`}
          </button>

          {/* Balance Info */}
          <div className="text-center text-sm text-muted">
            Balance:{' '}
            <span className="text-success font-semibold text-base">${balance.toFixed(2)}</span>
            {balance < bet && (
              <div className="text-danger text-xs mt-1 font-medium">
                Insufficient balance
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout Table */}
      <div className="max-w-7xl mx-auto mt-8">
        <h3 className="text-center text-muted text-base font-semibold mb-2">
          Payouts for 3 Matching Symbols
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.entries(PAYOUTS).map(([symbol, payout]) => (
            <div
              key={symbol}
              className="bg-primary/60 p-4 rounded-lg text-center border border-accent flex justify-center items-center gap-2"
            >
              <div className="text-3xl">{symbol}</div>
              <div className="text-accent font-bold">{payout}x</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
