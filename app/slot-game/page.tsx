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
    <>
      <h1 className="heading text-5xl font-bold text-center py-5">
        Casino
      </h1>
      <SlotGame 
        balance={balance} 
        onBalanceChange={handleBalanceChange}
        onGameResult={handleSlotResult}
      />
    </>
  );
}

