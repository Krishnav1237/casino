'use client'

import SlotGame from "@/components/SlotMachine";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useBalanceStore } from "../../store/balanceStore";

export default function SlotGamePage() {
  const { balance, increment, decrement } = useBalanceStore();

  const handleBalanceChange = (amount: number) => {
    if (amount > 0) {
      increment(amount);
    } else {
      decrement(Math.abs(amount));
    }
  };

  const handleSlotResult = (result: { bet: number; win: number; symbols: string[] }) => {
    console.log('Slot result:', result);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 h-16 border-b border-accent/30 bg-primary">
        <Link
          href="/"
          className="flex items-center gap-2 text-accent hover:text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold text-base">Back to Casino</span>
        </Link>

        <h1 className="text-xl font-semibold text-foreground">Slot Game</h1>

        <Link
          href="/"
          className="flex items-center gap-2 text-accent hover:text-secondary transition-colors"
        >
          <Home size={20} />
          <span className="font-semibold text-base">Home</span>
        </Link>
      </nav>

      {/* Game Content */}
      <main className="px-4 py-6 max-w-screen-xl mx-auto">
        <SlotGame 
          balance={balance} 
          onBalanceChange={handleBalanceChange}
          onGameResult={handleSlotResult}
        />
      </main>
    </div>
  );
}
