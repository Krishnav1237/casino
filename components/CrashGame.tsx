'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, DollarSign } from 'lucide-react';

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
  const Graph = () => {
    const width = 300;
    const height = 100;
    if (history.length < 2) return null;

    const maxVal = Math.max(...history, crashPoint || 0);
    const points = history
      .map((val, idx) => {
        const x = (idx / (history.length - 1)) * width;
        const y = height - (val / maxVal) * height;
        return `${x},${y}`;
      })
      .join(' ');

    // Crash line X position
    const crashIndex = history.findIndex(val => val >= (crashPoint || 0));
    const crashX = crashIndex >= 0 ? (crashIndex / (history.length - 1)) * width : width;

    return (
      <svg width={width} height={height} className="mx-auto mb-4" aria-label="Multiplier graph">
        <polyline
          fill="none"
          stroke="#4ade80" // green
          strokeWidth={3}
          points={points}
        />
        {/* Crash line */}
        {crashPoint && (
          <line
            x1={crashX}
            y1={0}
            x2={crashX}
            y2={height}
            stroke="#f87171" // red
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        )}
        {/* Labels */}
        <text x={0} y={height} fill="#ddd" fontSize="10">1x</text>
        <text x={width - 40} y={15} fill="#ddd" fontSize="10">{maxVal.toFixed(2)}x</text>
      </svg>
    );
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-screen-xl mx-auto bg-primary/90 rounded-2xl p-8 px-10 shadow-2xl backdrop-blur-md flex flex-col md:flex-row gap-8">
        {/* Graph side */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-6 md:hidden">Crash Game</h2>
          <Graph />
          {/* Multiplier Display */}
          <div className="text-center mb-6 bg-gradient-to-br from-background via-primary to-secondary/30 rounded-xl p-6 border-2 border-accent shadow-lg w-full max-w-sm">
            <div
              className={`text-6xl font-extrabold transition-all duration-300 ${
                !isRunning
                  ? 'text-foreground/60'
                  : hasCashedOut
                  ? 'text-success drop-shadow-lg'
                  : crashPoint && multiplier >= crashPoint
                  ? 'text-danger animate-pulse'
                  : 'text-accent animate-pulse drop-shadow-lg scale-110'
              }`}
            >
              {multiplier.toFixed(2)}x
            </div>
            {isRunning && crashPoint && multiplier >= crashPoint && !hasCashedOut && (
              <div className="text-danger text-xl mt-3 font-extrabold animate-bounce">💥 Crashed at {crashPoint}x!</div>
            )}
            {hasCashedOut && (
              <div className="text-success text-xl mt-3 font-extrabold">💰 Cashed out at {multiplier.toFixed(2)}x</div>
            )}
            {/* Show crash message if game ended and player didn't cash out */}
            {!isRunning && crashed && !hasCashedOut && (
              <div className="text-danger text-xl mt-3 font-extrabold animate-bounce">💥 Crashed at {crashPoint}x!</div>
            )}
          </div>
        </div>

        {/* Controls side */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-6 hidden md:block">🚀 Crash Game</h2>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            {!isRunning ? (
              <button
                onClick={startGame}
                disabled={balance < bet || bet < 1}
                className={`flex-1 py-4 rounded-2xl font-extrabold text-2xl flex items-center justify-center gap-2 transition-all shadow-xl ${
                  balance < bet || bet < 1
                    ? 'bg-muted text-foreground/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent to-secondary hover:scale-105 text-background'
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
                    : 'bg-gradient-to-r from-success to-success/80 hover:scale-105 text-white border-success animate-pulse'
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
                className="flex-1 bg-gradient-to-r from-primary to-danger/80 hover:from-primary/80 hover:to-danger text-white py-2 px-3 rounded-lg font-semibold transition-colors shadow disabled:opacity-50"
              >
                -5
              </button>
              <button
                onClick={() => adjustBet(5)}
                disabled={bet >= Math.min(100, balance) || isRunning}
                className="flex-1 bg-gradient-to-r from-primary to-success/80 hover:from-primary/80 hover:to-success text-white py-2 px-3 rounded-lg font-semibold transition-colors shadow disabled:opacity-50"
              >
                +5
              </button>
              <button
                onClick={maxBet}
                disabled={isRunning}
                className="flex-1 bg-gradient-to-r from-primary to-secondary/80 hover:from-primary/80 hover:to-secondary text-white py-2 px-3 rounded-lg font-semibold transition-colors shadow disabled:opacity-50"
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
