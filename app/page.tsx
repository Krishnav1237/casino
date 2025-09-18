'use client';

import Link from 'next/link';
import { Dice1, TrendingUp, Star, Grid, Coffee, ShieldCheck, Activity, Command } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-background text-foreground">
      {/* Header */}
      <header className="relative py-20 px-6 md:px-12 text-center max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent drop-shadow-lg mb-6">
          🎰 CASINO WEB3
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-3xl mx-auto">
          Dive into the ultimate Web3 casino experience! Play exciting games, win big, and enjoy seamless blockchain integration.
        </p>
        <div className="inline-flex items-center gap-3 text-accent text-lg font-semibold">
          <Star className="animate-pulse" size={24} />
          Premium Gaming Experience
          <Star className="animate-pulse" size={24} />
        </div>
      </header>

      {/* Games Grid */}
      <main className="container mx-auto px-6 md:px-12 py-12 max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-12">Choose Your Game</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Slot Machine */}
          <Link href="/slot-game" className="group bg-primary/90 backdrop-blur-md rounded-2xl border-2 border-accent p-8 shadow-2xl hover:scale-105 hover:border-secondary transition-transform duration-300">
            <div className="text-center">
              <div className="text-6xl mb-5 group-hover:animate-bounce">🎰</div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary mb-4">
                Slot Machine
              </h3>
              <p className="text-foreground/80 mb-6">
                Spin the reels for classic casino fun and big multipliers up to 50x!
              </p>
              <div className="flex justify-center items-center gap-2 text-accent font-semibold">
                <Dice1 size={20} />
                Up to 50x Multiplier
              </div>
            </div>
          </Link>

          {/* Crash Game */}
          <Link href="/crash-game" className="group bg-primary/90 backdrop-blur-md rounded-2xl border-2 border-accent p-8 shadow-2xl hover:scale-105 hover:border-secondary transition-transform duration-300">
            <div className="text-center">
              <div className="text-6xl mb-5 group-hover:animate-bounce">🚀</div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary mb-4">
                Crash Game
              </h3>
              <p className="text-foreground/80 mb-6">
                Watch the multiplier climb and cash out before the crash. High-risk, high-reward!
              </p>
              <div className="flex justify-center items-center gap-2 text-accent font-semibold">
                <TrendingUp size={20} />
                Unlimited Multiplier
              </div>
            </div>
          </Link>

          {/* Mines (Mine) Game */}
          <Link href="/mine" className="group bg-primary/90 backdrop-blur-md rounded-2xl border-2 border-accent p-8 shadow-2xl hover:scale-105 hover:border-secondary transition-transform duration-300">
            <div className="text-center">
              <div className="text-6xl mb-5 group-hover:animate-bounce">💣</div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary mb-4">
                Minesweeper
              </h3>
              <p className="text-foreground/80 mb-6">
                Test your luck and strategy by clearing safe spots and avoiding mines!
              </p>
              <div className="flex justify-center items-center gap-2 text-accent font-semibold">
                <Grid size={20} />
                Strategic Gameplay
              </div>
            </div>
          </Link>

          {/* Blackjack */}
          <Link href="/blackjack" className="group bg-primary/90 backdrop-blur-md rounded-2xl border-2 border-accent p-8 shadow-2xl hover:scale-105 hover:border-secondary transition-transform duration-300">
            <div className="text-center">
              <div className="text-6xl mb-5 group-hover:animate-bounce">🃏</div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary mb-4">
                Blackjack
              </h3>
              <p className="text-foreground/80 mb-6">
                Classic card game. Beat the dealer by getting 21 or closer without busting.
              </p>
              <div className="flex justify-center items-center gap-2 text-accent font-semibold">
                <Activity size={20} />
                Skill & Chance
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <section className="mt-20 max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Why Choose Casino Web3?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-primary/60 backdrop-blur-sm rounded-xl border border-accent/50 p-6">
              <ShieldCheck size={40} className="mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-bold text-accent mb-3">Fair & Transparent</h3>
              <p className="text-foreground/70">
                Provably fair algorithms on blockchain to guarantee honest play.
              </p>
            </div>
            <div className="bg-primary/60 backdrop-blur-sm rounded-xl border border-accent/50 p-6">
              <Coffee size={40} className="mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-bold text-accent mb-3">Instant Payouts</h3>
              <p className="text-foreground/70">
                Fast, secure transactions with automatic balance updates.
              </p>
            </div>
            <div className="bg-primary/60 backdrop-blur-sm rounded-xl border border-accent/50 p-6">
              <Command size={40} className="mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-bold text-accent mb-3">Sleek Design</h3>
              <p className="text-foreground/70">
                Modern UI/UX crafted for an immersive gaming experience.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 text-center">
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl border-2 border-accent p-8">
            <h3 className="text-3xl font-bold text-accent mb-4">Ready to Play?</h3>
            <p className="text-foreground/80 mb-6 text-lg">
              Start with $1000 virtual balance and dive into our exciting casino games!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/slot-game" className="bg-gradient-to-r from-accent to-secondary text-background font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform shadow-lg">
                🎰 Slots
              </Link>
              <Link href="/crash-game" className="bg-gradient-to-r from-secondary to-accent text-background font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform shadow-lg">
                🚀 Crash
              </Link>
              <Link href="/mine-game" className="bg-gradient-to-r from-accent to-secondary text-background font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform shadow-lg">
                💣 Minesweeper
              </Link>
              <Link href="/blackjack" className="bg-gradient-to-r from-secondary to-accent text-background font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform shadow-lg">
                🃏 Blackjack
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-accent/20 mt-20 py-8">
        <div className="container mx-auto px-6 text-center text-foreground/60">
          © 2025 Casino Web3. Built with Next.js and Tailwind CSS.
        </div>
      </footer>
    </div>
  );
}
