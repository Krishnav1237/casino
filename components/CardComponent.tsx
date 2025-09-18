"use client"
import Image from "next/image"
import { motion } from "framer-motion"

interface CardProps {
  rank: string
  suit: "spades" | "hearts" | "diamonds" | "clubs"
  hidden?: boolean
}

const suitMap: Record<string, string> = {
  spades: "S",
  hearts: "H",
  diamonds: "D",
  clubs: "C",
}

export default function CardComponent({ rank, suit, hidden }: CardProps) {
  const suitCode = suitMap[suit]
  const cardUrl = hidden
    ? "https://deckofcardsapi.com/static/img/back.png"
    : `https://deckofcardsapi.com/static/img/${rank}${suitCode}.png`

  return (
    <motion.div
      initial={{ y: -150, opacity: 0, rotateY: 180 }}
      animate={{ y: 0, opacity: 1, rotateY: hidden ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14, duration: 0.6 }}
      className="relative w-20 h-28"
    >
      <Image
        src={cardUrl}
        alt={`${rank} of ${suit}`}
        fill
        className="object-contain rounded-md shadow-lg"
      />
    </motion.div>
  )
}
