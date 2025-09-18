'use client'

import CrashGame from "@/components/CrashGame";
import { useState } from "react";

export default function Home() {

  const [balance, setBalance] = useState(1000);

  return (
    <>
      <h1 className="heading text-5xl font-bold text-center py-5">
        Casino
      </h1>
      <CrashGame
        balance={balance}
        onBalanceChange={(amount) => setBalance(prev => prev + amount)}
        onGameResult={(result) => console.log('Slot result:', result)}
      />

    </>  );
}

