'use client'

import SlotGame from "@/components/SlotMachine";
import { useBalanceStore } from "../../store/balanceStore";
import Navbar from "@/components/Navbar";

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
      <Navbar title="Slot Game" />
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
