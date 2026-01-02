import type { Point, GridSummary } from '@/lib/grid'

export type PieceKind = 'player' | 'oxygen' | 'tile'

export interface SnapTarget {
  x: number
  y: number
}

export interface BoardContext {
  boardSize: number
  scale: number
  snapTargets: SnapTarget[]
  grid: GridSummary
}

export type BoardPosition = Point

export interface Dimensions {
  width: number
  height: number
}

interface BasePiece {
  id: string
  kind: PieceKind
  position: BoardPosition
  footprint: Dimensions
  zIndex: number
}

export interface PlayerPiece extends BasePiece {
  kind: 'player'
  asset: string
  label: string
}

export interface OxygenPiece extends BasePiece {
  kind: 'oxygen'
  asset: string
  isSupply?: boolean
}

export interface TilePiece extends BasePiece {
  kind: 'tile'
  front: string
  back: string
  isFaceUp: boolean
  hasFlipped: boolean
  deckIndex: number
  isOnDeck: boolean
}

export type GamePiece = PlayerPiece | OxygenPiece | TilePiece
