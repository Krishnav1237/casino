'use client'

import SlotGame from "@/components/SlotMachine";
import { useState } from "react";

export default function Home() {
  
  const [balance, setBalance] = useState(1000);
  
  const handleBalanceChange = (amount: number) => {
    setBalance(prev => prev + amount);
  };
  
  const handleSlotResult = (result: { bet: number; win: number; symbols: string[] }) => {
    console.log('Slot result:', result);
  };

  return (
    <div 
      className="w-full max-w-screen-2xl mx-auto min-h-screen"
    >
      <h1 className="max-w-screen-lg text-4xl font-bold flex items-center h-20">
        Slot Game
      </h1>
      <SlotGame 
        balance={balance} 
        onBalanceChange={handleBalanceChange}
        onGameResult={handleSlotResult}
      />
    </div>
  );
}

