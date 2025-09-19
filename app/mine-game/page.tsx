'use client'

import MineGame from '@/components/Mine'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Mine() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-background">
      
      <Navbar title='Mine Game' />

      {/* Game Content */}
      <MineGame/>
    </div>
  )
}

export default Mine