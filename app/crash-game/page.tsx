'use client'

import CrashGame from "@/components/CrashGame";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useBalanceStore } from "../../store/balanceStore";
import Navbar from "@/components/Navbar";

export default function CrashGamePage() {
  const { balance, increment, decrement } = useBalanceStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-background">
      
      <Navbar title='Crash Game' />

      {/* Game Content */}
      <CrashGame
        balance={balance}
        onBalanceChange={(amount) => {
          if (amount > 0) {
            increment(amount);
          } else {
            decrement(Math.abs(amount));
          }
        }}
        onGameResult={(result) => console.log('Crash result:', result)}
      />
    </div>
  );
}
