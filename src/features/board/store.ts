import { useState, useEffect } from 'react'
import { buildGridSummary, deriveCellMinDimension } from '@/lib/grid'
import type { GridSummary } from '@/lib/grid'
import { PLAYER_ASSETS, OXYGEN_ASSET, loadPathTileFronts, TILE_BACK_ASSET } from '@/features/board/assets'
import type { TileAsset } from '@/features/board/assets'
import { shuffle } from '@/lib/shuffle'

// --- Types (migrated from GameInteractLayer) ---

export interface TokenState {
  id: string
  position: { x: number; y: number }
  zIndex: number
}

export interface PlayerTokenState extends TokenState {
  kind: 'player'
  asset: string
  label: string
  size: number
}

export interface OxygenTokenState extends TokenState {
  kind: 'oxygen'
  asset: string
  size: number
  isSupply: boolean
}

export interface TileTokenState extends TokenState {
  kind: 'tile'
  front: string
  back: string
  width: number
  height: number
  isFaceUp: boolean
  isOnDeck: boolean
  deckIndex: number
}

export type GameToken = PlayerTokenState | OxygenTokenState | TileTokenState

// --- Store Logic ---

interface GameState {
  tokens: Record<string, GameToken>
  tileQueues: TileAsset[][]
  zCounter: number
}

let state: GameState = {
  tokens: {},
  tileQueues: [],
  zCounter: 1000,
}

const listeners = new Set<(state: GameState) => void>()

const notifyListeners = () => {
  listeners.forEach((listener) => listener(state))
}

// Initialize state immediately
const grid = buildGridSummary()
initializeState(grid)

function initializeState(grid: GridSummary) {
  const tokens: Record<string, GameToken> = {}

  const playerSpace = deriveCellMinDimension(grid.player_token_regions) * 0.7
  const oxygenSpace = deriveCellMinDimension(grid.oxygen_regions) * 0.85
  const tileWidth = Math.min(...grid.scene_grid_regions.map(c => c.width)) * 0.92
  const tileHeight = Math.min(...grid.scene_grid_regions.map(c => c.height)) * 0.92

  const playerPrepareSlot = grid.player_token_prepare_region
  const oxygenPrepareSlot = grid.oxygen_prepare_region

  // Create 2 of each player token, ALL in player prepare region
  PLAYER_ASSETS.forEach((asset, colorIndex) => {
    for (let i = 0; i < 2; i++) {
      const tokenId = `player-${asset.id}-${i}`

      tokens[tokenId] = {
        id: tokenId,
        kind: 'player',
        asset: asset.asset,
        label: asset.label,
        size: playerSpace,
        position: { x: playerPrepareSlot.x + 30 * (colorIndex - 3 + i + 1), y: playerPrepareSlot.y },
        zIndex: 100 + colorIndex * 2 + i,
      }
    }
  })

  // Create initial oxygen token
  tokens['oxygen-initial'] = {
    id: 'oxygen-initial',
    kind: 'oxygen',
    asset: OXYGEN_ASSET,
    size: oxygenSpace,
    position: { x: oxygenPrepareSlot.x, y: oxygenPrepareSlot.y },
    zIndex: 200,
    isSupply: true,
  }

  // Initialize tile queues first
  const tileFronts = shuffle(loadPathTileFronts())
  const numDecks = 3
  const queues: TileAsset[][] = Array.from({ length: numDecks }, () => [])
  
  // Create initial tiles from shuffled deck (3 piles)
  const deckCells = grid.tile_deck_prepare_regions

  deckCells.forEach((cell, deckIndex) => {
    const tileIndex = deckIndex
    if (tileIndex < tileFronts.length) {
      const tokenId = `tile-initial-${deckIndex}`
      tokens[tokenId] = {
        id: tokenId,
        kind: 'tile',
        front: tileFronts[tileIndex].src,
        back: TILE_BACK_ASSET,
        width: tileWidth,
        height: tileHeight,
        position: { x: cell.x, y: cell.y },
        zIndex: 400 + deckIndex * 50,
        isFaceUp: false,
        isOnDeck: true,
        deckIndex,
      }
    }
  })

  // Fill queues skipping the first 3 tiles
  tileFronts.slice(numDecks).forEach((tile, index) => {
    const deckIndex = index % numDecks
    queues[deckIndex].push(tile)
  })

  state = {
    tokens,
    tileQueues: queues,
    zCounter: 1000,
  }
}

// --- Actions ---

export const updateToken = (id: string, updates: Partial<GameToken>) => {
  const token = state.tokens[id]
  if (!token) return

  state = {
    ...state,
    tokens: {
      ...state.tokens,
      [id]: { ...token, ...updates } as GameToken,
    },
  }
  // notifyListeners()
}

export const bringToFront = (id: string) => {
  state.zCounter += 1
  updateToken(id, { zIndex: state.zCounter })
}

export const spawnOxygen = () => {
  state.zCounter += 1
  const oxygenSlot = grid.oxygen_prepare_region
  const oxygenSpace = deriveCellMinDimension(grid.oxygen_regions) * 0.85
  const newOxygenId = `oxygen-${Date.now()}`

  state = {
    ...state,
    tokens: {
      ...state.tokens,
      [newOxygenId]: {
        id: newOxygenId,
        kind: 'oxygen',
        asset: OXYGEN_ASSET,
        size: oxygenSpace,
        position: { x: oxygenSlot.x, y: oxygenSlot.y },
        zIndex: state.zCounter,
        isSupply: true,
      },
    },
  }
  notifyListeners()
}

export const spawnTile = (deckIndex: number) => {
  const queue = state.tileQueues[deckIndex]
  if (!queue || queue.length === 0) return

  const nextTile = queue[0] // Peek first
  const newQueues = [...state.tileQueues]
  newQueues[deckIndex] = queue.slice(1) // Remove first

  const deckCell = grid.tile_deck_prepare_regions[deckIndex]
  const tileWidth = Math.min(...grid.scene_grid_regions.map(c => c.width)) * 0.92
  const tileHeight = Math.min(...grid.scene_grid_regions.map(c => c.height)) * 0.92
  const newTileId = `tile-${Date.now()}`

  state = {
    ...state,
    tileQueues: newQueues,
    tokens: {
      ...state.tokens,
      [newTileId]: {
        id: newTileId,
        kind: 'tile',
        front: nextTile.src,
        back: TILE_BACK_ASSET,
        width: tileWidth,
        height: tileHeight,
        position: { x: deckCell.x, y: deckCell.y },
        zIndex: 400 + deckIndex * 50,
        isFaceUp: false,
        isOnDeck: true,
        deckIndex,
      },
    },
  }
  notifyListeners()
}

// --- Hook ---

export const useGameStore = () => {
  const [tokens, setTokens] = useState(state.tokens)

  useEffect(() => {
    const listener = (newState: GameState) => {
      setTokens(newState.tokens)
    }
    listeners.add(listener)
    // Initialize with current state
    setTokens(state.tokens)
    
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return tokens
}
