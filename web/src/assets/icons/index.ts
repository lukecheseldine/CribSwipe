import arrowRight from './arrow-right.svg'
import bath from './bath.svg'
import bedDouble from './bed-double.svg'
import brandMark from './brand-mark.svg'
import chevronDownSm from './chevron-down-sm.svg'
import chevronDown from './chevron-down.svg'
import heartMuted from './heart-muted.svg'
import heartWhite from './heart-white.svg'
import layers from './layers.svg'
import mapPin from './map-pin.svg'
import maximize from './maximize.svg'
import scan from './scan.svg'
import slidersHorizontal from './sliders-horizontal.svg'
import sparkles from './sparkles.svg'
import undo from './undo-2.svg'
import userRound from './user-round.svg'
import x from './x.svg'

// Each SVG is exported from Figma with its color and size baked in; `size` must match the file's root width/height.
export const icons = {
  arrowRight: { src: arrowRight, size: 20 },
  bath: { src: bath, size: 18 },
  bedDouble: { src: bedDouble, size: 18 },
  brandMark: { src: brandMark, size: 42 },
  chevronDown: { src: chevronDown, size: 16 },
  chevronDownSm: { src: chevronDownSm, size: 14 },
  heartMuted: { src: heartMuted, size: 20 },
  heartWhite: { src: heartWhite, size: 20 },
  layers: { src: layers, size: 20 },
  mapPin: { src: mapPin, size: 16 },
  maximize: { src: maximize, size: 20 },
  scan: { src: scan, size: 18 },
  slidersHorizontal: { src: slidersHorizontal, size: 20 },
  sparkles: { src: sparkles, size: 16 },
  undo: { src: undo, size: 20 },
  userRound: { src: userRound, size: 20 },
  x: { src: x, size: 20 },
} as const

export type IconName = keyof typeof icons
