import { Node } from '@xyflow/react';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { NodeWithMetrics } from './knowledgeMetrics';

const BOUNDS_PADDING = 300;

const MIN_SIGMA_FRAC = 0.015;
const MAX_SIGMA_FRAC = 0.04;

// Scale canvas positions up from their centroid before enforcing spacing.
// This preserves relative clustering while giving hills more room.
const TOPO_SCALE = 2;

// Minimum distance between any two hill centers in topo space.
// Keeps nearby (related) nodes close enough to merge into ridges while
// preventing fully separate nodes from becoming one continuous blob.
const MIN_HILL_SPACING = 400;

export interface TerrainBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ScalarField {
  data: Float32Array;
  bounds: TerrainBounds;
  gridSize: number;
  maxValue: number;
  // Hill-center positions in topo space (after scale + repulsion). Used by
  // HillPins and hover detection instead of raw canvas node.position values.
  nodeTopoPositions: { id: string; topoX: number; topoZ: number }[];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function gaussian(distanceSq: number, sigma: number): number {
  return Math.exp(-distanceSq / (2 * sigma * sigma));
}

function nodeBounds(nodes: Node<CanvasNode>[]): TerrainBounds {
  if (nodes.length === 0) {
    return {
      minX: -500,
      minY: -500,
      maxX: 500,
      maxY: 500,
      width: 1000,
      height: 1000,
    };
  }
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x);
    maxY = Math.max(maxY, n.position.y);
  }
  minX -= BOUNDS_PADDING;
  minY -= BOUNDS_PADDING;
  maxX += BOUNDS_PADDING;
  maxY += BOUNDS_PADDING;
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

// Iteratively push overlapping points apart until all pairs are at least
// minDist apart. Preserves relative positions as much as possible.
function enforceMinSpacing(
  pts: { x: number; y: number }[],
  minDist: number,
): { x: number; y: number }[] {
  const result = pts.map((p) => ({ ...p }));
  for (let iter = 0; iter < 300; iter++) {
    let moved = false;
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dx = result[j].x - result[i].x;
        const dy = result[j].y - result[i].y;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.001;
          const push = (minDist - dist) * 0.5;
          const ux = dx / dist;
          const uy = dy / dist;
          result[i].x -= ux * push;
          result[i].y -= uy * push;
          result[j].x += ux * push;
          result[j].y += uy * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return result;
}

export function sampleField(field: ScalarField, u: number, v: number): number {
  const { data, gridSize } = field;
  const gxf = u * (gridSize - 1);
  const gyf = v * (gridSize - 1);
  const gx0 = Math.floor(gxf);
  const gx1 = Math.min(gx0 + 1, gridSize - 1);
  const gy0 = Math.floor(gyf);
  const gy1 = Math.min(gy0 + 1, gridSize - 1);
  const fx = gxf - gx0;
  const fy = gyf - gy0;
  const v00 = data[gy0 * gridSize + gx0];
  const v10 = data[gy0 * gridSize + gx1];
  const v01 = data[gy1 * gridSize + gx0];
  const v11 = data[gy1 * gridSize + gx1];
  return (
    v00 * (1 - fx) * (1 - fy) +
    v10 * fx * (1 - fy) +
    v01 * (1 - fx) * fy +
    v11 * fx * fy
  );
}

export function computeScalarField(
  nodesWithMetrics: NodeWithMetrics[],
  gridSize = 128,
): ScalarField {
  const emptyBounds: TerrainBounds = {
    minX: -500,
    minY: -500,
    maxX: 500,
    maxY: 500,
    width: 1000,
    height: 1000,
  };

  if (nodesWithMetrics.length === 0) {
    return {
      data: new Float32Array(gridSize * gridSize),
      bounds: emptyBounds,
      gridSize,
      maxValue: 0,
      nodeTopoPositions: [],
    };
  }

  // 1. Compute canvas centroid.
  let cx = 0,
    cy = 0;
  for (const { node } of nodesWithMetrics) {
    cx += node.position.x;
    cy += node.position.y;
  }
  cx /= nodesWithMetrics.length;
  cy /= nodesWithMetrics.length;

  // 2. Scale positions outward from centroid so hills start more spread out.
  const scaled = nodesWithMetrics.map(({ node }) => ({
    x: cx + (node.position.x - cx) * TOPO_SCALE,
    y: cy + (node.position.y - cy) * TOPO_SCALE,
  }));

  // 3. Push any hills that are too close apart, preserving relative layout.
  const topoPositions = enforceMinSpacing(scaled, MIN_HILL_SPACING);

  // 4. Build bounds from the spread positions.
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of topoPositions) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  minX -= BOUNDS_PADDING;
  minY -= BOUNDS_PADDING;
  maxX += BOUNDS_PADDING;
  maxY += BOUNDS_PADDING;
  const bounds: TerrainBounds = {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };

  const data = new Float32Array(gridSize * gridSize);
  const shortSide = Math.min(bounds.width, bounds.height);
  const minSigma = shortSide * MIN_SIGMA_FRAC;
  const maxSigma = shortSide * MAX_SIGMA_FRAC;

  for (let idx = 0; idx < nodesWithMetrics.length; idx++) {
    const { metrics } = nodesWithMetrics[idx];
    const nx = topoPositions[idx].x;
    const ny = topoPositions[idx].y;
    const sigma = lerp(minSigma, maxSigma, metrics.maturity);
    const contribution = metrics.contribution;

    const nodeGx = ((nx - bounds.minX) / bounds.width) * gridSize;
    const nodeGy = ((ny - bounds.minY) / bounds.height) * gridSize;
    const sigmaGx = (sigma / bounds.width) * gridSize;
    const sigmaGy = (sigma / bounds.height) * gridSize;
    const radiusX = Math.ceil(sigmaGx * 3);
    const radiusY = Math.ceil(sigmaGy * 3);

    const x0 = Math.max(0, Math.floor(nodeGx - radiusX));
    const x1 = Math.min(gridSize - 1, Math.ceil(nodeGx + radiusX));
    const y0 = Math.max(0, Math.floor(nodeGy - radiusY));
    const y1 = Math.min(gridSize - 1, Math.ceil(nodeGy + radiusY));

    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        const wx = bounds.minX + (gx / gridSize) * bounds.width;
        const wy = bounds.minY + (gy / gridSize) * bounds.height;
        const dx = wx - nx;
        const dy = wy - ny;
        data[gy * gridSize + gx] +=
          contribution * gaussian(dx * dx + dy * dy, sigma);
      }
    }
  }

  let maxValue = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] > maxValue) maxValue = data[i];
  }

  const nodeTopoPositions = nodesWithMetrics.map(({ node }, idx) => ({
    id: node.id,
    topoX: topoPositions[idx].x,
    topoZ: topoPositions[idx].y,
  }));

  return { data, bounds, gridSize, maxValue, nodeTopoPositions };
}
