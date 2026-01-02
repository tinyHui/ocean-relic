import { useMemo } from 'react'
import { PlayerToken } from '@/features/board/components/tokens/PlayerToken'
import { OxygenToken } from '@/features/board/components/tokens/OxygenToken'
import { TileToken } from '@/features/board/components/tokens/TileToken'
import { buildGridSummary, BOARD_BASE_SIZE } from '@/lib/grid'
import type { BoardContext, SnapTarget } from '@/features/board/types'
import { useGameStore } from '@/features/board/store'

interface GameInteractLayerProps {
  boardSize: number
}

export const GameInteractLayer = ({ boardSize }: GameInteractLayerProps) => {
  const grid = useMemo(() => buildGridSummary(), [])
  const scale = boardSize ? boardSize / BOARD_BASE_SIZE : 0
  
  const tokens = useGameStore()

  // Calculate snap targets from all grid regions using top-left coordinates
  const snapTargets = useMemo((): SnapTarget[] => {
    if (!boardSize) return []

    const allCells = grid.all

    return allCells.map((cell) => ({
      x: cell.x,
      y: cell.y,
    }))
  }, [grid, boardSize, scale])

  const boardContext: BoardContext = { boardSize, scale, snapTargets, grid }

  const orderedTokens = useMemo(
    () => Object.values(tokens).sort((a, b) => a.zIndex - b.zIndex),
    [tokens]
  )

  return (
    <>
      {orderedTokens.map((token) => {
        if (token.kind === 'player') {
          return (
            <PlayerToken
              key={token.id}
              id={token.id}
              asset={token.asset}
              label={token.label}
              widthPx={token.size * scale}
              heightPx={token.size * scale}
              position={token.position}
              zIndex={token.zIndex}
              boardContext={boardContext}
            />
          )
        }

        if (token.kind === 'oxygen') {
          return (
            <OxygenToken
              key={token.id}
              id={token.id}
              asset={token.asset}
              widthPx={token.size * scale}
              heightPx={token.size * scale}
              position={token.position}
              zIndex={token.zIndex}
              isSupply={token.isSupply}
              boardContext={boardContext}
            />
          )
        }

        return (
          <TileToken
            key={token.id}
            id={token.id}
            front={token.front}
            back={token.back}
            widthPx={token.width * scale}
            heightPx={token.height * scale}
            position={token.position}
            zIndex={token.zIndex}
            isFaceUp={token.isFaceUp}
            isOnDeck={token.isOnDeck}
            deckIndex={token.deckIndex}
            boardContext={boardContext}
          />
        )
      })}
    </>
  )
}
