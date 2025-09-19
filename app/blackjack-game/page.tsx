'use client'

import BlackjackGame from '@/components/BlackJack'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function BlackJack() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-accent/20">
        <Link href="/" className="flex items-center gap-2 text-accent hover:text-secondary transition-colors">
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Casino</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Black Jack
        </h1>
        <Link href="/" className="flex items-center gap-2 text-accent hover:text-secondary transition-colors">
          <Home size={20} />
          <span className="font-semibold">Home</span>
        </Link>
      </nav>

      {/* Game Content */}
      <BlackjackGame/>
    </div>
  )
}

export default BlackJack