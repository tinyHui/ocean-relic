import boardImage from '@/assets/composite-board.png'
import oxygenToken from '@/assets/oxygen.png'
import tileBackImage from '@/assets/path-tile-backside.jpeg'
import playerGreen from '@/assets/player-token-green.png'
import playerPurple from '@/assets/player-token-purple.png'
import playerRed from '@/assets/player-token-red.png'
import playerYellow from '@/assets/player-token-yellow.png'

const tileFrontModules = import.meta.glob('@/assets/path-tiles/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export const BOARD_IMAGE = boardImage
export const OXYGEN_ASSET = oxygenToken
export const TILE_BACK_ASSET = tileBackImage

export interface TileAsset {
  id: string
  src: string
}

export interface PlayerAsset {
  id: string
  label: string
  asset: string
}

export const PLAYER_ASSETS: PlayerAsset[] = [
  { id: 'green', label: 'Green Diver', asset: playerGreen },
  { id: 'purple', label: 'Purple Diver', asset: playerPurple },
  { id: 'red', label: 'Red Diver', asset: playerRed },
  { id: 'yellow', label: 'Yellow Diver', asset: playerYellow },
]

export const loadPathTileFronts = (): TileAsset[] =>
  Object.entries(tileFrontModules)
    .map(([path, src]) => ({
      id: path.split('/').pop() ?? path,
      src,
    }))
    .sort((a, b) => a.id.localeCompare(b.id))
