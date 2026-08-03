import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { TerrainBounds } from 'utils/topography';
import { TERRAIN_SCALE } from './Terrain';

const GRID_CELLS = 40;
const GRID_LINE_WIDTH = 0.015;
// 3 subdivisions per grid cell → dots at 0, 1/3, 2/3, 1 in each direction.
// Grid lines coincide with positions 0 and 1, so this gives:
//   1 dot at each intersection, 2 dots along each edge between intersections,
//   and 4 free-standing interior dots per cell.
const DOT_CELLS = GRID_CELLS * 3;
const DOT_RADIUS = 0.12; // in sub-cell half-space (0 = corner, 0.5 = centre)

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uGridCells;
  uniform float uGridLineWidth;
  uniform float uDotCells;
  uniform float uDotRadius;

  void main() {
    float gx = fract(vUv.x * uGridCells);
    float gy = fract(vUv.y * uGridCells);

    // Grid lines
    float gxLine = smoothstep(uGridLineWidth, 0.0, gx)
                 + smoothstep(1.0 - uGridLineWidth, 1.0, gx);
    float gyLine = smoothstep(uGridLineWidth, 0.0, gy)
                 + smoothstep(1.0 - uGridLineWidth, 1.0, gy);
    float gridLine = clamp(gxLine + gyLine, 0.0, 1.0);

    // Dots at sub-cell corners → positions 0, 1/3, 2/3, 1 within each main cell.
    // fract gives position 0–1 inside each sub-cell; corners are at 0 and 1.
    float dx = fract(vUv.x * uDotCells);
    float dy = fract(vUv.y * uDotCells);
    float ddx = dx < 0.5 ? dx : 1.0 - dx; // 0 at corner, 0.5 at centre
    float ddy = dy < 0.5 ? dy : 1.0 - dy;
    float dotDist = length(vec2(ddx, ddy));
    float dot = smoothstep(uDotRadius, uDotRadius * 0.35, dotDist);

    // Dots and lines at equal weight; max prevents double-darkening at overlaps.
    float darken = max(gridLine * 0.05, dot * 0.08);
    vec3 color = vec3(1.0 - darken);
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface Props {
  bounds: TerrainBounds;
}

export function GridPlane({ bounds }: Props) {
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      bounds.width * TERRAIN_SCALE,
      bounds.height * TERRAIN_SCALE,
    );
    geo.rotateX(-Math.PI / 2);

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uGridCells: { value: GRID_CELLS },
        uGridLineWidth: { value: GRID_LINE_WIDTH },
        uDotCells: { value: DOT_CELLS },
        uDotRadius: { value: DOT_RADIUS },
      },
    });

    return { geometry: geo, material: mat };
  }, [bounds.width, bounds.height]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Sit 2 units below y=0 so the terrain mesh sits cleanly above it.
  return <mesh geometry={geometry} material={material} position={[0, -2, 0]} />;
}
