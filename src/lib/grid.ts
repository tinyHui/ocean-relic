import gridInfoRaw from '@/assets/grid_info.json?raw'

export const BOARD_BASE_SIZE = 4096

export interface Point {
  x: number
  y: number
}

interface RawRect {
  lt: Point
  lb: Point
  rt: Point
  rb: Point
  w: number
  h: number
}

interface GridInfo {
  score_track_regions: RawRect[]
  hands_tiles_region: RawRect[]
  scene_grid_regions: RawRect[]
  oxygen_regions: RawRect[]
  player_token_regions: RawRect[]
  player_token_prepare_region: RawRect
  oxygen_prepare_region: RawRect
  tile_deck_prepare_regions: RawRect[]
}

export type GridRegionKey = keyof GridInfo

export interface GridCell {
  id: string
  region: GridRegionKey
  x: number
  y: number
  width: number
  height: number
}

export interface GridSummary {
  all: GridCell[]
  score_track_regions: GridCell[]
  hands_tiles_region: GridCell[]
  scene_grid_regions: GridCell[]
  oxygen_regions: GridCell[]
  player_token_regions: GridCell[]
  tile_deck_prepare_regions: GridCell[]
  // These two have special handling (subdivided array vs single cell)
  player_token_prepare_region: GridCell // Single cell
  oxygen_prepare_region: GridCell // Single cell
}

const rawGrid = JSON.parse(gridInfoRaw) as GridInfo

export const buildGridSummary = (): GridSummary => {
  const summary: GridSummary = {
    all: [],
    score_track_regions: [],
    hands_tiles_region: [],
    scene_grid_regions: [],
    oxygen_regions: [],
    player_token_regions: [],
    tile_deck_prepare_regions: [],
    player_token_prepare_region: {} as GridCell,
    oxygen_prepare_region: {} as GridCell, // Placeholder, filled below
  }

  // Handle array regions
  const arrayRegions: (keyof GridInfo)[] = [
    'score_track_regions',
    'hands_tiles_region',
    'scene_grid_regions',
    'oxygen_regions',
    'player_token_regions',
    'tile_deck_prepare_regions',
  ]

  arrayRegions.forEach(key => {
    const rawList = rawGrid[key] as RawRect[]
    // Force TS to know this key maps to an array property in GridSummary
    // Since we know arrayRegions only contains keys that map to GridCell[] in GridSummary
    const targetArray = summary[key] as GridCell[]
    
    rawList.forEach((rect, index) => {
      const cell = rectToCell(rect, key, index)
      targetArray.push(cell)
      summary.all.push(cell)
    })
  })

  // Handle player_token_prepare_region (subdivided)
  const playerPrepareRaw = rawGrid.player_token_prepare_region
  const playerPrepareCell = rectToCell(playerPrepareRaw, 'player_token_prepare_region', 0)
  summary.player_token_prepare_region = playerPrepareCell
  summary.all.push(playerPrepareCell)

  // Handle oxygen_prepare_region (single)
  const oxygenPrepareRaw = rawGrid.oxygen_prepare_region
  const oxygenCell = rectToCell(oxygenPrepareRaw, 'oxygen_prepare_region', 0)
  summary.oxygen_prepare_region = oxygenCell
  summary.all.push(oxygenCell)

  return summary
}

const rectToCell = (rect: RawRect, region: GridRegionKey, index: number): GridCell => ({
  id: `${region}-${index}`,
  region,
  x: rect.lt.x + rect.w / 2,
  y: rect.lt.y,
  width: rect.w,
  height: rect.h,
})

export const deriveCellMinDimension = (cells: GridCell[]): number => {
  if (!cells.length) {
    return 0
  }

  return Math.min(...cells.map((cell) => Math.min(cell.width, cell.height)))
}
