import { useState, useRef, useMemo, useCallback } from 'react'
import reactable from 'reactablejs'
import interact from 'interactjs'
import type { BoardContext } from '@/features/board/types'
import { updateToken, bringToFront } from '@/features/board/store'

interface PlayerTokenProps {
  id: string
  asset: string
  label: string
  widthPx: number
  heightPx: number
  position: { x: number; y: number }
  zIndex: number
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

export const PlayerToken = ({
  id,
  asset,
  label,
  widthPx,
  heightPx,
  position,
  zIndex,
  boardContext,
}: PlayerTokenProps) => {
  const { boardSize, scale, snapTargets } = boardContext
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const offsetRef = useRef({ x: 0, y: 0 })

  // Use top-left directly for left/top instead of center adjustment
  const baseLeft = position.x * scale
  const baseTop = position.y * scale

  const handleDragStart = useCallback(() => {
    bringToFront(id)
  }, [id])

  const handleDragEnd = useCallback(() => {
    if (!scale) return

    updateToken(id, { position: { x: position.x, y: position.y } })
  }, [id, position.x, position.y])

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
      className="token token-player"
      style={style}
      draggable={draggableConfig}
    >
      <img className="token-image" src={asset} alt={label} draggable={false} />
    </ReactableToken>
  )
}
