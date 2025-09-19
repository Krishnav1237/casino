import { useBalanceStore } from '@/store/balanceStore'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Navbar({ title }: { title: string }) {

  const { balance } = useBalanceStore();

  return (
    <nav className="flex items-center justify-between px-6 h-16 border-b border-accent/30">
      <Link
        href="/"
        className="flex items-center gap-2 text-accent hover:text-secondary transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-semibold text-base">Back to Casino</span>
      </Link>

      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      <div className="text-xl font-bold text-accent">
        ${balance.toFixed(2)} USD
      </div>
    </nav>
  )
}

export default Navbar