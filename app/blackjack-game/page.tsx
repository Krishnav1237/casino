'use client'

import BlackjackGame from '@/components/BlackJack'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function BlackJack() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-background">
      
      <Navbar title='Blackjack Game' />

      {/* Game Content */}
      <BlackjackGame/>
    </div>
  )
}

export default BlackJack