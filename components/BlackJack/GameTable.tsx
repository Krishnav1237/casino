// components/GameTable.tsx
import React from 'react'
import { Hand, GameState, GameResult } from './types'
import CardComponent from '../CardComponent'

interface GameTableProps {
  playerHand: Hand
  dealerHand: Hand
  gameState: GameState
  gameResult: GameResult
  hasDoubledDown: boolean
}

export const GameTable: React.FC<GameTableProps> = ({
  playerHand,
  dealerHand,
  gameState,
  gameResult,
  hasDoubledDown
}) => {
  const shouldShowDealerValue = gameState !== 'betting' && gameState !== 'dealing' && gameState !== 'playing'

  const getResultDisplay = () => {
    if (!gameResult) return null

    const colorClass = 
      gameResult === 'win' || gameResult === 'blackjack' ? 'text-green-400' :
      gameResult === 'lose' ? 'text-red-400' : 'text-yellow-400'

    const resultText = 
      gameResult === 'win' ? '🎉 YOU WIN!' :
      gameResult === 'lose' ? '💥 YOU LOSE' :
      gameResult === 'push' ? '🤝 PUSH' :
      gameResult === 'blackjack' ? '🃏 BLACKJACK!' : ''

    return (
      <div className="text-center mb-2">
        <div className={`text-3xl font-extrabold drop-shadow-lg ${
          gameResult === 'win' || gameResult === 'blackjack' ? 'text-success' :
          gameResult === 'lose' ? 'text-danger' : 'text-accent'
        }`}>
          {resultText}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-primary/60 p-8 md:rounded-r-2xl shadow-2xl md:min-w-[800px] relative border border-accent/10 h-[80vh] text-foreground">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/6 to-primary/8 rounded-2xl opacity-90"></div>
      <div className="relative z-10">
        {/* Dealer Hand */}
        <div className="mb-12">
          <h3 className="text-foreground text-2xl font-extrabold mb-6 tracking-wide">
            Dealer {shouldShowDealerValue && `(${dealerHand.value})`}
          </h3>
          <div className="flex space-x-6 justify-center">
            {dealerHand.cards.map((card, index) => (
              <CardComponent
                key={index}
                rank={card.rank}
                suit={card.suit}
                hidden={index === 1 && (gameState === "dealing" || gameState === "playing")}
              />
            ))}
          </div>
        </div>

        {/* Game Result */}
        {getResultDisplay()}

        {/* Player Hand */}
        <div>
          <h3 className="text-foreground text-2xl font-extrabold mb-6 tracking-wide">
            You {playerHand.cards.length > 0 && `(${playerHand.value})`}
            {playerHand.isBlackjack && ' - Blackjack!'}
            {playerHand.isBusted && ' - Busted!'}
          </h3>
          <div className="flex space-x-6 justify-center">
            {playerHand.cards.map((card, index) => (
              <CardComponent
                key={index}
                rank={card.rank}
                suit={card.suit}
              />
            ))}
          </div>
        </div>

        {/* Double Down Indicator */}
        {hasDoubledDown && (
          <div className="text-center mt-8">
            <div className="text-accent font-extrabold text-xl drop-shadow">
              DOUBLED DOWN!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}