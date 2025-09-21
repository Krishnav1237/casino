'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Star, Gem, TriangleAlert } from 'lucide-react'
import { useBalanceStore } from '../store/balanceStore'
import { useWalletStore } from '@/store/walletStore'
import { playMines, usdToEth } from '@/lib/api'

interface Cell {
  isRevealed: boolean
  isMine: boolean
  isGem: boolean
}

type GameState = 'betting' | 'playing' | 'ended'

export default function StakeMinesGame() {
  const { balance, increment, decrement } = useBalanceStore()
  const { address } = useWalletStore()
  const [betAmount, setBetAmount] = useState(2.00)
  const [mineCount, setMineCount] = useState(3)
  const [gameState, setGameState] = useState<GameState>('betting')
  const [grid, setGrid] = useState<Cell[][]>([])
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0)
  const [gemsFound, setGemsFound] = useState(0)
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txError, setTxError] = useState<string | null>(null)

  const GRID_SIZE = 5
  const TOTAL_CELLS = GRID_SIZE * GRID_SIZE

  // Calculate multiplier based on gems found and mines
  const calculateMultiplier = useCallback((gems: number, mines: number) => {
    if (gems === 0) return 1.0
    const safeCells = TOTAL_CELLS - mines
    let multiplier = 1.0
    
    for (let i = 0; i < gems; i++) {
      multiplier *= (safeCells - i) / (safeCells - i - mines + gems)
    }
    
    return Math.max(1.0, multiplier * 0.97) // House edge
  }, [])

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newGrid: Cell[][] = []
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = []
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = {
          isRevealed: false,
          isMine: false,
          isGem: false
        }
      }
    }
    return newGrid
  }, [])

  // Place mines randomly
  const placeMines = useCallback((grid: Cell[][], mines: number) => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })))
    const positions: { row: number; col: number }[] = []

    // Get all positions
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        positions.push({ row, col })
      }
    }
    
    // Shuffle and place mines
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }
    
    for (let i = 0; i < mines; i++) {
      const { row, col } = positions[i]
      newGrid[row][col].isMine = true
    }
    
    // Set remaining cells as gems
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!newGrid[row][col].isMine) {
          newGrid[row][col].isGem = true
        }
      }
    }
    
    return newGrid
  }, [])

  // Start new game
  const startGame = useCallback(() => {
    if (betAmount > balance) {
      alert('Insufficient balance!')
      return
    }
    if (!address) {
      alert('Connect your wallet first.')
      return
    }

    decrement(betAmount)
    setGameState('playing')
    setCurrentMultiplier(1.0)
    setGemsFound(0)
    setGameResult(null)
    setTxHash(null)
    setTxError(null)

    const newGrid = initializeGrid()
    const gridWithMines = placeMines(newGrid, mineCount)
    setGrid(gridWithMines)

    playMines({ userAddress: address, betEth: usdToEth(betAmount), minesPicked: mineCount })
      .then((res) => setTxHash(res.txHash))
      .catch((err) => {
        setTxError(err?.message || 'Transaction failed')
        increment(betAmount)
        setGameState('betting')
      })
  }, [betAmount, balance, address, mineCount, initializeGrid, placeMines, decrement, increment])

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || grid[row][col].isRevealed) return

    const newGrid = [...grid]
    newGrid[row][col].isRevealed = true
    setGrid(newGrid)

    if (newGrid[row][col].isMine) {
      // Hit mine - game over
      setGameState('ended')
      setGameResult('lose')
      // Reveal all mines
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (newGrid[r][c].isMine) {
            newGrid[r][c].isRevealed = true
          }
        }
      }
      setGrid(newGrid)
    } else {
      // Found gem
      const newGemsFound = gemsFound + 1
      setGemsFound(newGemsFound)
      const newMultiplier = calculateMultiplier(newGemsFound, mineCount)
      setCurrentMultiplier(newMultiplier)
    }
  }, [gameState, grid, gemsFound, mineCount, calculateMultiplier])

  // Cash out
  const cashOut = useCallback(() => {
    if (gameState !== 'playing' || gemsFound === 0) return
    
    const winnings = betAmount * currentMultiplier
    increment(winnings)
    setGameState('ended')
    setGameResult('win')
  }, [gameState, gemsFound, betAmount, currentMultiplier, increment])

  // Reset game
  const resetGame = useCallback(() => {
    setGameState('betting')
    setGrid(initializeGrid())
    setCurrentMultiplier(1.0)
    setGemsFound(0)
    setGameResult(null)
    setTxHash(null)
    setTxError(null)
  }, [initializeGrid])

  useEffect(() => {
    setGrid(initializeGrid())
  }, [initializeGrid])

  const getCellContent = (cell: Cell) => {
    if (!cell.isRevealed) return null
    if (cell.isMine) return <Star className="w-12 h-12 text-danger" />
    if (cell.isGem) return <Gem className="w-12 h-12 text-success" />
    return null
  }

  const getCellClasses = (cell: Cell, row: number, col: number) => {
    let classes = 'w-12 h-12 md:w-20 md:h-20 flex items-center justify-center cursor-pointer transition-all duration-200 rounded-xl text-3xl '

    if (cell.isRevealed) {
      if (cell.isMine) {
        classes += 'bg-danger/30 border-danger/70 text-foreground'
      } else if (cell.isGem) {
        classes += 'bg-success/30 border-success/60 text-foreground'
      }
    } else {
      classes += 'bg-primary/80 hover:bg-primary/70 border-accent/30'
    }
    
    return classes
  }

  return (
    <div className="min-h-full p-6">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col-reverse md:flex-row justify-center">
          {/* Left Panel - Controls */}
          <div className="bg-primary/60 p-6 space-y-6 border-t-4 md:border-t-0 md:border-r-8 border-background md:rounded-l-2xl rounded-b-2xl md:rounded-r-none">
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">Bet Amount</label>
              <div className="flex items-center space-x-2 mb-2">
                <button
                  onClick={() => setBetAmount(Math.max(0.01, betAmount - 1))}
                  className="bg-primary/80 hover:bg-primary/70 text-foreground w-10 h-10 rounded-lg font-bold text-lg shadow"
                  disabled={gameState === 'playing'}
                >
                  -
                </button>
                <input
                  type="number"
                  value={betAmount.toFixed(2)}
                  onChange={(e) => setBetAmount(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="flex-1 bg-primary/80 text-foreground px-4 py-2 rounded-lg text-center font-bold text-lg border-2 border-accent/20"
                  disabled={gameState === 'playing'}
                  step="0.01"
                  min="0.01"
                />
                <button
                  onClick={() => setBetAmount(betAmount + 1)}
                  className="bg-primary/80 hover:bg-primary/70 text-foreground w-10 h-10 rounded-lg font-bold text-lg shadow"
                  disabled={gameState === 'playing'}
                >
                  +
                </button>
              </div>
              {/* Quick Bet Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 5, 10, 25, 50, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className="bg-primary/80 hover:bg-primary/70 text-foreground py-1 rounded font-bold text-sm border border-accent/20 shadow"
                    disabled={gameState === 'playing'}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <hr className="my-4 border-accent/20" />
            </div>

            <div>
              <label className="block text-foreground text-sm font-medium mb-2">Mines: {mineCount}</label>
              <select
                value={mineCount}
                onChange={(e) => setMineCount(parseInt(e.target.value))}
                className="w-full bg-background text-foreground px-4 py-2 rounded-lg border-accent/10"
                disabled={gameState === 'playing'}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="text-center">
              <div className="text-success text-2xl font-bold mb-2 bg-primary/80 px-3 py-1 rounded-md inline-block">
                ${(betAmount * currentMultiplier).toFixed(2)} USD
              </div>
              <div className="text-muted text-sm">
                {currentMultiplier.toFixed(2)}x multiplier
              </div>
            </div>

            <div className="space-y-3">
              {gameState === 'betting' && (
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-foreground py-3 rounded-lg font-bold text-lg"
                  disabled={betAmount > balance}
                >
                  START BET
                </button>
              )}

              {gameState === 'playing' && (
                <button
                  onClick={cashOut}
                  className="w-full bg-accent hover:bg-accent/90 text-foreground py-3 rounded-lg font-bold text-lg"
                  disabled={gemsFound === 0}
                >
                  CASHOUT
                </button>
              )}

              {gameState === 'ended' && (
                <button
                  onClick={resetGame}
                  className="w-full bg-primary/85 hover:bg-primary/80 text-foreground py-3 rounded-lg font-bold text-lg"
                >
                  New BET
                </button>
              )}
            </div>

            {/* Tx status */}
            {txHash && (
              <div className="text-xs text-muted text-center break-all">Tx submitted: <span className="text-accent font-semibold">{txHash}</span></div>
            )}
            {txError && (
              <div className="text-xs text-danger text-center flex items-center justify-center gap-1"><TriangleAlert size={14} /> {txError}</div>
            )}

            <div className="text-center">
              <div className="text-muted text-sm mb-1">Gems Found: {gemsFound}</div>
              <div className="text-muted text-sm">Safe Cells: {TOTAL_CELLS - mineCount}</div>
            </div>

            {gameResult === 'win' && (
              <div className="text-center text-success font-bold text-xl">
                🎉 Winner! +${(betAmount * currentMultiplier - betAmount).toFixed(2)}
              </div>
            )}

            {gameResult === 'lose' && (
              <div className="text-center text-danger font-bold text-xl">
                💣 Boom! -{betAmount.toFixed(2)} USD
              </div>
            )}
          </div>

          {/* Center Panel - Game Grid */}
          <div className="bg-primary/60 p-6 md:rounded-r-2xl rounded-t-2xl md:rounded-t-none">
            {/* <h2 className="text-white text-xl font-bold text-center mb-6">MINES GAME</h2> */}

            <div className="grid grid-cols-5 gap-4 md:gap-8">
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClasses(cell, rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {getCellContent(cell)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}