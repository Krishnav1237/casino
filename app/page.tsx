'use client';

import Link from 'next/link';
import { Dice1, TrendingUp, Star, Grid, Coffee, ShieldCheck, Activity, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBalanceStore } from '../store/balanceStore';

export default function Home() {
  const { balance } = useBalanceStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-background text-foreground relative overflow-hidden">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.1),transparent_40%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,0,170,0.1),transparent_40%)]"></div>

      {/* Header */}
      <header className="relative py-20 px-6 md:px-12 text-center max-w-4xl mx-auto">
        <motion.h1
          className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent animate-[shimmer_6s_infinite] drop-shadow-lg mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          🎰 CASINO WEB3
        </motion.h1>

        <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-3xl mx-auto">
          Dive into the ultimate Web3 casino experience! Play exciting games, win big, and enjoy seamless blockchain integration.
        </p>

        <div className="flex justify-center items-center gap-3 text-accent text-lg font-semibold mb-8">
          <Star className="animate-pulse" size={24} />
          Premium Gaming Experience
          <Star className="animate-pulse" size={24} />
        </div>

        {/* Balance Display */}
        <motion.div
          className="bg-gradient-to-r from-accent/20 to-secondary/20 backdrop-blur-lg rounded-xl px-8 py-4 shadow-lg border border-accent/30 inline-block"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-accent">💰 Balance:</span>
            <span className="text-2xl font-extrabold text-secondary">${balance.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        {/* <div className="mt-8">
          <Link
            href="/slot-game"
            className="bg-gradient-to-r from-accent to-secondary text-background font-bold py-4 px-10 rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            Play Now
          </Link>
        </div> */}
      </header>

      {/* Games Grid */}
      <main className="container mx-auto px-6 md:px-12 py-12 max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-12">Choose Your Game</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { href: '/slot-game', emoji: '🎰', title: 'Slot Machine', desc: 'Spin the reels for classic casino fun and big multipliers up to 50x!', icon: <Dice1 size={20} />, info: 'Up to 50x Multiplier' },
            { href: '/crash-game', emoji: '🚀', title: 'Crash Game', desc: 'Watch the multiplier climb and cash out before the crash. High-risk, high-reward!', icon: <TrendingUp size={20} />, info: 'Unlimited Multiplier' },
            { href: '/mine-game', emoji: '💣', title: 'Minesweeper', desc: 'Test your luck and strategy by clearing safe spots and avoiding mines!', icon: <Grid size={20} />, info: 'Strategic Gameplay' },
            { href: '/blackjack-game', emoji: '🃏', title: 'Blackjack', desc: 'Classic card game. Beat the dealer by getting 21 or closer without busting.', icon: <Activity size={20} />, info: 'Skill & Chance' },
          ].map((game, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Link href={game.href} className="group bg-primary/90 backdrop-blur-md rounded-2xl border-2 border-accent p-8 shadow-2xl hover:border-secondary transition-transform duration-300 block">
                <div className="text-center">
                  <div className="text-6xl mb-5 drop-shadow-[0_0_10px_var(--tw-shadow-color)] shadow-accent group-hover:animate-bounce">
                    {game.emoji}
                  </div>
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary mb-4">
                    {game.title}
                  </h3>
                  <p className="text-foreground/80 mb-6">{game.desc}</p>
                  <div className="flex justify-center items-center gap-2 text-accent font-semibold">
                    {game.icon}
                    {game.info}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Features Section */}
      <section className="mt-20 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">Why Choose Casino Web3?</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: <ShieldCheck size={40} />, title: 'Fair & Transparent', desc: 'Provably fair algorithms on blockchain to guarantee honest play.' },
            { icon: <Coffee size={40} />, title: 'Instant Payouts', desc: 'Fast, secure transactions with automatic balance updates.' },
            { icon: <Command size={40} />, title: 'Sleek Design', desc: 'Modern UI/UX crafted for an immersive gaming experience.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="bg-primary/60 backdrop-blur-sm rounded-xl border border-accent/50 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 mb-4">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-accent mb-3">{f.title}</h3>
              <p className="text-foreground/70">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-accent/20 mt-20 py-8">
        <div className="container mx-auto px-6 text-center text-foreground/60">
          © 2025 Casino Web3. Built with Next.js and Tailwind CSS.
        </div>
      </footer>
    </div>
  );
}
