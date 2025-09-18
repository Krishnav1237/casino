'use client'

import CrashGame from "@/components/CrashGame";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useState } from "react";

export default function CrashGamePage() {
  const [balance, setBalance] = useState(1000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-accent/20">
        <Link href="/" className="flex items-center gap-2 text-accent hover:text-secondary transition-colors">
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Casino</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          🚀 Crash Game
        </h1>
        <Link href="/" className="flex items-center gap-2 text-accent hover:text-secondary transition-colors">
          <Home size={20} />
          <span className="font-semibold">Home</span>
        </Link>
      </nav>

      {/* Game Content */}
      <CrashGame
        balance={balance}
        onBalanceChange={(amount) => setBalance(prev => prev + amount)}
        onGameResult={(result) => console.log('Crash result:', result)}
      />
    </div>
  );
}
