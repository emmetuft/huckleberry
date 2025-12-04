import { nodeColors } from 'constants/styles';

/**
 * Lightens a hex color by a percentage
 * @param color Hex color string (e.g., '#5a0cff')
 * @param percent Percentage to lighten (0-100)
 */
export function lightenColor(color: string, percent: number): string {
  // Convert hex to RGB
  const num = parseInt(color.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  // Lighten by moving towards white
  const newR = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));

  // Convert back to hex
  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
}

/**
 * Get color for a group index, using lighter shades when cycling through palette
 */
export function getColorForGroup(groupIndex: number): string {
  if (groupIndex === -1) return '#999'; // Default gray for undefined groups

  const baseIndex = groupIndex % nodeColors.length;
  const cycleNumber = Math.floor(groupIndex / nodeColors.length);
  const baseColor = nodeColors[baseIndex];

  if (cycleNumber === 0) {
    return baseColor;
  }

  // Each cycle makes colors 25% lighter
  return lightenColor(baseColor, cycleNumber * 25);
}
