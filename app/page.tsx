'use client';

import Link from 'next/link';
import { Dice1, Gamepad2, Sparkles, Bomb, TrendingUp } from 'lucide-react';
import ConnectWalletButton from '@/components/ConnectWalletButton';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-[var(--font-casino)]">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--accent)]/30">
        <h1 className="text-2xl font-extrabold text-[var(--accent)] tracking-wide">
          Web3<span className="text-[var(--foreground)]">Casino</span>
        </h1>
        <nav className="space-x-6 hidden md:flex">
          <Link href="#games" className="hover:text-[var(--accent)] transition">Games</Link>
          <Link href="#features" className="hover:text-[var(--accent)] transition">Features</Link>
          <Link href="#how" className="hover:text-[var(--accent)] transition">How it Works</Link>
        </nav>
        <ConnectWalletButton />
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-16">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
          The Future of <br /> <span className="text-[var(--accent)]">Casino</span> is <span className="text-[var(--accent)]">Web3</span>
        </h2>
        <p className="text-lg md:text-2xl text-[var(--muted)] max-w-2xl mb-8">
          Play Blackjack, Mines, Slots, and Crash with provably <br /> fair blockchain technology.
          Bet securely, win big, and own your game assets.
        </p>
        <div className="flex gap-4">
          <button className="bg-[var(--accent)] hover:bg-[var(--secondary)] px-6 py-3 rounded-xl text-lg font-bold transition">
            Start Playing
          </button>
          <button className="border border-[var(--accent)] px-6 py-3 rounded-xl text-lg font-bold hover:bg-[var(--primary)] transition">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-[var(--background)]/80">
        <h3 className="text-3xl font-bold text-center mb-12">
          Why Choose <span className="text-[var(--accent)]">Web3Casino</span>?
        </h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-6">
          <div className="bg-[var(--primary)] rounded-2xl p-6 text-center shadow-lg border border-[var(--accent)]/20">
            <Dice1 className="mx-auto text-[var(--accent)] mb-4" size={36}/>
            <h4 className="font-bold text-xl mb-2">Provably Fair</h4>
            <p className="text-[var(--muted)]">All games are blockchain verified, ensuring fair results every time.</p>
          </div>
          <div className="bg-[var(--primary)] rounded-2xl p-6 text-center shadow-lg border border-[var(--accent)]/20">
            <Gamepad2 className="mx-auto text-[var(--accent)] mb-4" size={36}/>
            <h4 className="font-bold text-xl mb-2">Exciting Games</h4>
            <p className="text-[var(--muted)]">Blackjack, Slots, Mines, Crash and more — built for Web3 players.</p>
          </div>
          <div className="bg-[var(--primary)] rounded-2xl p-6 text-center shadow-lg border border-[var(--accent)]/20">
            <Sparkles className="mx-auto text-[var(--accent)] mb-4" size={36}/>
            <h4 className="font-bold text-xl mb-2">Instant Payouts</h4>
            <p className="text-[var(--muted)]">Get your winnings directly in your crypto wallet without delays.</p>
          </div>
        </div>
      </section>

      {/* Games Preview Section */}
      <section id="games" className="py-16 px-6">
        <h3 className="text-3xl font-bold text-center mb-12">Our Games</h3>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Link href="/blackjack-game">
          <div className="bg-[var(--primary)] rounded-2xl p-6 text-center border border-[var(--accent)]/20 hover:border-[var(--accent)] transition h-60 w-80 flex justify-center">
            <img src="/game/card.png" alt=""/>
          </div>
          </Link>
          <Link href="/mine-game">
          <div className="bg-[var(--primary)] rounded-2xl p-6 text-center border border-[var(--accent)]/20 hover:border-[var(--accent)] transition h-60 w-80 flex justify-center">
            <img src="/game/mine.png" alt=""/>
          </div>
          </Link>
          <Link href="/slot-game">
          <div className="bg-[var(--primary)] rounded-2xl p-6 text-center border border-[var(--accent)]/20 hover:border-[var(--accent)] transition h-60 w-80 flex justify-center">
            <img src="/game/slot.png" alt="" />
          </div>
          </Link>
          <Link href="/crash-game">
          <div className="bg-[var(--primary)] rounded-2xl p-6 text-center border border-[var(--accent)]/20 hover:border-[var(--accent)] transition h-60 w-80 flex justify-center items-center">
            <img src="/game/crash.png" alt="" className='h-72'/>
          </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--accent)]/30 py-6 text-center text-[var(--muted)]">
        © 2025 Web3Casino. All rights reserved.
      </footer>
    </div>
  );
}
