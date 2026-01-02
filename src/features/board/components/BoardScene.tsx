import { useEffect, useState } from 'react'
import { BaseBoard } from '@/features/board/components/BaseBoard'
import { GameInteractLayer } from '@/features/board/components/GameInteractLayer'
import { BOARD_IMAGE } from '@/features/board/assets'

export const BoardScene = () => {
  const [boardSize, setBoardSize] = useState(0)

  useEffect(() => {
    const updateSize = () => {
      // Use min(windowWidth, windowHeight) to determine board size since it's a square
      // Subtract some padding if needed, but here we go for fitting the viewport
      const size = Math.min(window.innerWidth, window.innerHeight)
      setBoardSize(size)
      console.log('boardSize', size)
    }

    // Initial size
    updateSize()

    // Add resize listener
    window.addEventListener('resize', updateSize)

    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  return (
    <div 
      className="board-shell" 
      style={{ 
        width: boardSize || '100%', 
        height: boardSize || '100%',
        flexGrow: 0,
        flexShrink: 0
      }}

    >
      <BaseBoard boardImage={BOARD_IMAGE}>
        <GameInteractLayer boardSize={boardSize} />
      </BaseBoard>
    </div>
  )
}
