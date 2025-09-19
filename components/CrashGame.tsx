'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, DollarSign } from 'lucide-react';
import CrashChart from './CrashChart';

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
  const [history, setHistory] = useState<number[]>([]); // For graph data
  const [crashed, setCrashed] = useState(false); // New state to show crash after stop
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start the game
  const startGame = () => {
    if (isRunning || balance < bet || bet < 1) return;

    const newCrashPoint = parseFloat((Math.random() * 10 + 1).toFixed(2)); // 1.00x to 11.00x crash
    setCrashPoint(newCrashPoint);
    setMultiplier(1.0);
    setHistory([1.0]);
    setHasCashedOut(false);
    setIsRunning(true);
    setCrashed(false);

    onBalanceChange(-bet);
  };

  // Cash out
  const cashOut = () => {
    if (!isRunning || hasCashedOut) return;

    const winAmount = parseFloat((bet * multiplier).toFixed(2));
    onBalanceChange(winAmount);
    setHasCashedOut(true);
    stopGame(winAmount);
  };

  // Stop the game and report result
  const stopGame = (winAmount = 0) => {
    clearInterval(intervalRef.current as NodeJS.Timeout);
    setIsRunning(false);
    if (!hasCashedOut) {
      setCrashed(true); // Show crash message if player did not cash out
    }

    onGameResult?.({
      bet,
      win: winAmount,
      crashedAt: crashPoint ?? multiplier,
      cashedOutAt: hasCashedOut ? multiplier : undefined,
    });
  };

  // Update multiplier and history
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setMultiplier(prev => {
        const next = parseFloat((prev + 0.05 + prev * 0.01).toFixed(2));
        setHistory(prevHist => [...prevHist, next]);

        if (crashPoint && next >= crashPoint) {
          if (!hasCashedOut) stopGame(0); // Player lost
          return crashPoint;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isRunning]);

  // Bet adjustment with input validation
  const adjustBet = (amount: number) => {
    if (isRunning) return;
    let newBet = bet + amount;
    newBet = Math.min(Math.max(newBet, 1), Math.min(100, balance));
    setBet(newBet);
  };

  const maxBet = () => {
    if (isRunning) return;
    setBet(Math.min(100, balance));
  };

  // Simple line graph using SVG
  // We'll render the CrashGraph canvas component below instead of the inline SVG

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6 min-h-full">
      <div className="max-w-screen-xl mx-auto bg-primary/60 rounded-2xl p-8 px-10 shadow-2xl backdrop-blur-md flex flex-col md:flex-row gap-8">
        {/* Graph side */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-extrabold text-foreground mb-4 md:hidden">Crash</h2>
          <div className="w-full flex items-center justify-center mb-8">
            <CrashChart history={history} crashPoint={crashPoint} height={300} width={680} revealCrash={!isRunning && crashPoint != null} />
          </div>
          {/* Multiplier Display */}
          <div className="text-center rounded-xl p-4 w-full max-w-md bg-primary/95 border border-accent/10 shadow-lg">
            <div
              className={`text-3xl md:text-4xl font-extrabold transition-all duration-300 ${
                !isRunning
                  ? 'text-foreground/70'
                  : hasCashedOut
                  ? 'text-success'
                  : crashPoint && multiplier >= crashPoint
                  ? 'text-danger'
                  : 'text-accent'
              }`}
            >
              {multiplier.toFixed(2)}x
            </div>
            {isRunning && crashPoint && multiplier >= crashPoint && !hasCashedOut && (
              <div className="text-danger text-lg mt-2 font-bold">💥 Crashed at {crashPoint}x!</div>
            )}
            {hasCashedOut && (
              <div className="text-success text-lg mt-2 font-bold">💰 Cashed out at {multiplier.toFixed(2)}x</div>
            )}
            {!isRunning && crashed && !hasCashedOut && (
              <div className="text-danger text-lg mt-2 font-bold">💥 Crashed at {crashPoint}x!</div>
            )}
          </div>
        </div>

        {/* Controls side */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-6 hidden md:block">Crash Game</h2>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            {!isRunning ? (
              <button
                onClick={startGame}
                disabled={balance < bet || bet < 1}
                className={`flex-1 py-4 rounded-2xl font-extrabold text-2xl flex items-center justify-center gap-2 transition-all shadow-xl ${
                  balance < bet || bet < 1
                    ? 'bg-muted text-foreground/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent to-secondary hover:scale-105 text-foreground'
                }`}
              >
                <Play size={28} />
                Start (${bet})
              </button>
            ) : (
              <button
                onClick={cashOut}
                disabled={hasCashedOut}
                className={`flex-1 py-4 rounded-2xl font-extrabold text-2xl flex items-center justify-center gap-2 transition-all shadow-xl border-2 ${
                  hasCashedOut
                    ? 'bg-muted text-foreground/50 cursor-not-allowed border-muted'
                    : 'bg-gradient-to-r from-success to-success/80 hover:scale-105 text-foreground border-success animate-pulse'
                }`}
              >
                <DollarSign size={28} />
                Cash Out
              </button>
            )}
          </div>

          {/* Bet Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between text-foreground font-semibold">
              <span>Bet Amount:</span>
              <span className="text-accent font-extrabold text-2xl">${bet}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => adjustBet(-5)}
                disabled={bet <= 1 || isRunning}
                className="flex-1 bg-danger/80 text-foreground py-2 px-3 rounded-lg font-semibold transition-colors shadow disabled:opacity-50"
              >
                -5
              </button>
              <button
                onClick={() => adjustBet(5)}
                disabled={bet >= Math.min(100, balance) || isRunning}
                className="flex-1 bg-success/80 text-foreground py-2 px-3 rounded-lg font-semibold transition-colors shadow disabled:opacity-50"
              >
                +5
              </button>
              <button
                onClick={maxBet}
                disabled={isRunning}
                className="flex-1 bg-primary text-foreground py-2 px-3 rounded-lg font-semibold transition-colors shadow disabled:opacity-50"
              >
                Max (${Math.min(100, balance)})
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="text-center text-base text-foreground/80 font-medium">
            Balance: <span className="text-success font-extrabold text-lg">${balance.toFixed(2)}</span>
            {balance < bet && <div className="text-danger mt-1 font-semibold">Insufficient balance!</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
