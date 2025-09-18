import { motion } from "framer-motion"
import { Spade, Heart, Diamond, Club } from "lucide-react"

interface CardProps {
  rank: string
  suit: "spades" | "hearts" | "diamonds" | "clubs"
  hidden?: boolean
}

const getSuitIcon = (suit: string) => {
  switch (suit) {
    case "spades": return <Spade className="w-4 h-4" />
    case "hearts": return <Heart className="w-4 h-4 text-red-500" />
    case "diamonds": return <Diamond className="w-4 h-4 text-red-500" />
    case "clubs": return <Club className="w-4 h-4" />
    default: return null
  }
}

export default function CardComponent({ rank, suit, hidden }: CardProps) {
  return (
    <motion.div
      initial={{ y: -200, opacity: 0, rotateY: 180 }}
      animate={{ y: 0, opacity: 1, rotateY: hidden ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 12, duration: 0.8 }}
      className="relative w-24 h-36 perspective"
    >
      <div className="absolute w-full h-full preserve-3d transition-transform duration-700">
        {/* Card Front */}
        <div className="absolute w-full h-full bg-white rounded-lg border border-gray-300 flex flex-col items-center justify-between p-2 text-xs text-black backface-hidden">
          <div className="font-bold">{rank}</div>
          {getSuitIcon(suit)}
          <div className="font-bold rotate-180">{rank}</div>
        </div>

        {/* Card Back */}
        <div className="absolute w-full h-full bg-blue-900 rounded-lg border border-gray-600 flex items-center justify-center text-white text-xl backface-hidden rotate-y-180">
          ?
        </div>
      </div>
    </motion.div>
  )
}
