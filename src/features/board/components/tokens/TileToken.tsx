import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import reactable from 'reactablejs'
import interact from 'interactjs'
import type { BoardContext } from '@/features/board/types'
import { flipTransition } from '@/features/board/animations'
import { updateToken, bringToFront, spawnTile } from '@/features/board/store'

interface TileTokenProps {
  id: string
  front: string
  back: string
  widthPx: number
  heightPx: number
  position: { x: number; y: number }
  zIndex: number
  isFaceUp: boolean
  isOnDeck: boolean
  deckIndex: number
  boardContext: BoardContext
}

interface TokenSurfaceProps {
  getRef?: (node: HTMLElement | null) => void
  style?: React.CSSProperties
  className?: string
  children?: React.ReactNode
}

const TokenSurface = ({ getRef, style, className, children }: TokenSurfaceProps) => (
  <div ref={getRef} style={style} className={className}>
    {children}
  </div>
)

const ReactableToken = reactable(TokenSurface)

export const TileToken = ({
  id,
  front,
  back,
  widthPx,
  heightPx,
  position,
  zIndex,
  isFaceUp,
  isOnDeck,
  deckIndex,
  boardContext,
}: TileTokenProps) => {
  const { boardSize, scale, snapTargets } = boardContext
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const offsetRef = useRef({ x: 0, y: 0 })
  const [localIsFaceUp, setLocalIsFaceUp] = useState(isFaceUp)

  // Keep local faceUp synced if store changes (e.g. undo/redo, reset)
  useEffect(() => {
    setLocalIsFaceUp(isFaceUp)
  }, [isFaceUp])

  // Use top-left directly for left/top instead of center adjustment
  const baseLeft = position.x * scale
  const baseTop = position.y * scale

  const handleDragStart = useCallback(() => {
    bringToFront(id)
    if (isOnDeck) {
      spawnTile(deckIndex)
    }
  }, [id, isOnDeck, deckIndex])

  // On drag end, update state and set localIsFaceUp so the tile immediately flips
  const handleDragEnd = useCallback(() => {
    if (!scale) return

    const updates: Record<string, any> = {
      position: {
        x: position.x,
        y: position.y,
      }
    }

    let shouldFlip = false

    if (!isFaceUp) {
      updates.isFaceUp = true
      shouldFlip = true
    }

    if (isOnDeck) {
      updates.isOnDeck = false
    }

    updateToken(id, updates)

    if (shouldFlip) {
      setLocalIsFaceUp(true)
    }
  }, [id, position.x, position.y, isFaceUp, isOnDeck, scale])

  const draggableConfig = useMemo(() => {
    if (!boardSize) return false

    return {
      onstart: handleDragStart,
      onmove: (event: any) => setOffset(prev => {
        const next = { x: prev.x + event.dx, y: prev.y + event.dy }
        offsetRef.current = next
        return next
      }),
      onend: handleDragEnd,
      modifiers: [
        interact.modifiers.snap({
          targets: snapTargets,
          range: Infinity,
          relativePoints: [{ x: 0, y: 0 }], // Snap top-left to top-left
        }),
        interact.modifiers.restrictRect({
          restriction: { left: 0, top: 0, right: boardSize, bottom: boardSize },
          endOnly: true,
        }),
      ],
    }
  }, [boardSize, snapTargets, handleDragStart, handleDragEnd])

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${baseLeft}px`,
    top: `${baseTop}px`,
    width: `${widthPx}px`,
    height: `${heightPx}px`,
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    zIndex,
    touchAction: 'none',
    userSelect: 'none',
    pointerEvents: 'auto',
  }

  return (
    <ReactableToken
      className="token token-tile"
      style={style}
      draggable={draggableConfig}
    >
      <motion.div
        className="tile"
        animate={{ rotateY: localIsFaceUp ? 180 : 0 }}
        transition={flipTransition}
      >
        <img className="tile-face tile-face-front" src={front} alt="Tile front" draggable={false} />
        <img className="tile-face tile-face-back" src={back} alt="Tile back" draggable={false} />
      </motion.div>
    </ReactableToken>
  )
}
