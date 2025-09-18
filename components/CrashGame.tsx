'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, DollarSign, Zap } from 'lucide-react';

interface CrashGameProps {
  balance: number;
  onBalanceChange: (amount: number) => void;
  onGameResult?: (result: { bet: number; cashedOutAt?: number; crashedAt: number; win: number }) => void;
}

export default function CrashGame({ balance, onBalanceChange, onGameResult }: CrashGameProps) {
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    if (isRunning || balance < bet) return;

    const newCrashPoint = parseFloat((Math.random() * 10 + 1).toFixed(2)); // Random between 1.00x - 11.00x
    setCrashPoint(newCrashPoint);
    setMultiplier(1.0);
    setHasCashedOut(false);
    setIsRunning(true);

    // Deduct the bet immediately
    onBalanceChange(-bet);
  };

  const cashOut = () => {
    if (!isRunning || hasCashedOut) return;

    const winAmount = parseFloat((bet * multiplier).toFixed(2));
    onBalanceChange(winAmount);
    setHasCashedOut(true);
    stopGame(winAmount);
  };

  const stopGame = (winAmount = 0) => {
    clearInterval(intervalRef.current as NodeJS.Timeout);
    setIsRunning(false);

    onGameResult?.({
      bet,
      win: winAmount,
      crashedAt: crashPoint ?? multiplier,
      cashedOutAt: hasCashedOut ? multiplier : undefined,
    });
  };

  // Handle multiplier growth
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setMultiplier(prev => {
        const next = parseFloat((prev + 0.05 + prev * 0.01).toFixed(2)); // exponential growth
        if (crashPoint && next >= crashPoint) {
          if (!hasCashedOut) stopGame(0); // Player lost
          return crashPoint;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isRunning]);

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
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          🚀 Crash Game
        </h2>
      </div>

      {/* Multiplier Display */}
      <div className="text-center mb-6">
        <div
          className={`text-5xl font-bold ${
            !isRunning
              ? 'text-gray-400'
              : hasCashedOut
              ? 'text-green-400'
              : crashPoint && multiplier >= crashPoint
              ? 'text-red-500'
              : 'text-yellow-300 animate-pulse'
          }`}
        >
          {multiplier.toFixed(2)}x
        </div>
        {isRunning && crashPoint && multiplier >= crashPoint && !hasCashedOut && (
          <div className="text-red-500 text-lg mt-2 font-bold">💥 Crashed at {crashPoint}x!</div>
        )}
        {hasCashedOut && (
          <div className="text-green-400 text-lg mt-2 font-bold">💰 Cashed out at {multiplier.toFixed(2)}x</div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
        {!isRunning ? (
          <button
            onClick={startGame}
            disabled={balance < bet}
            className={`flex-1 py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all ${
              balance < bet
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            <Play size={24} />
            Start (${bet})
          </button>
        ) : (
          <button
            onClick={cashOut}
            disabled={hasCashedOut}
            className={`flex-1 py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all ${
              hasCashedOut
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:scale-105 text-white shadow'
            }`}
          >
            <DollarSign size={24} />
            Cash Out
          </button>
        )}
      </div>

      {/* Bet Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-white mb-2">
          <span>Bet Amount:</span>
          <span className="text-yellow-400 font-bold">${bet}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => adjustBet(-5)}
            disabled={bet <= 1 || isRunning}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded disabled:opacity-50"
          >
            -5
          </button>
          <button
            onClick={() => adjustBet(5)}
            disabled={bet >= Math.min(100, balance) || isRunning}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
          >
            +5
          </button>
          <button
            onClick={maxBet}
            disabled={isRunning}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded disabled:opacity-50"
          >
            Max (${Math.min(100, balance)})
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="text-center text-sm text-gray-400">
        Balance: <span className="text-green-400 font-bold">${balance.toFixed(2)}</span>
        {balance < bet && <div className="text-red-400 mt-1">Insufficient balance!</div>}
      </div>
    </div>
  );
}
