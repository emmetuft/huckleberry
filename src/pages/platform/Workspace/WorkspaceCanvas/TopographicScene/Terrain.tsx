import { useRef, useMemo, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { ScalarField } from 'utils/topography';

export const TERRAIN_HEIGHT_SCALE = 400;
const NUM_CONTOURS = 20;
const CONTOUR_WIDTH = 0.03;
export const TERRAIN_SCALE = 6;

const vertexShader = /* glsl */ `
  varying float vElevation;
  uniform float uMaxHeight;

  void main() {
    vElevation = uMaxHeight > 0.0 ? position.y / uMaxHeight : 0.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vElevation;
  uniform float uNumContours;
  uniform float uContourWidth;

  void main() {
    float e = clamp(vElevation, 0.0, 1.0);

    // Discard only the absolute outer edge (no terrain data at all).
    // Everything above this gets rendered so contour rings spread toward flat ground.
    if (e < 0.002) discard;

    // Palette: compressed teal zone so purple/red appear on medium-height hills too.
    // Each band now covers ~10-18% of the elevation range instead of 20-30%.
    vec3 c0 = vec3(1.00, 1.00, 1.00); // e=0.00  flat: white
    vec3 c1 = vec3(0.78, 0.94, 0.94); // e=0.06  pale teal
    vec3 c2 = vec3(0.44, 0.82, 0.82); // e=0.16  light teal
    vec3 c3 = vec3(0.20, 0.68, 0.70); // e=0.28  medium teal
    vec3 c4 = vec3(0.12, 0.52, 0.54); // e=0.38  deep teal
    vec3 c5 = vec3(0.35, 0.05, 1.00); // e=0.50  Huckleberry purple (#5a0cff)
    vec3 c6 = vec3(0.52, 0.10, 0.18); // e=0.68  dark red
    vec3 c7 = vec3(0.88, 0.48, 0.05); // e=1.00  amber orange

    vec3 color;
    if (e < 0.06) {
      color = mix(c0, c1, e / 0.06);
    } else if (e < 0.16) {
      color = mix(c1, c2, (e - 0.06) / 0.10);
    } else if (e < 0.28) {
      color = mix(c2, c3, (e - 0.16) / 0.12);
    } else if (e < 0.38) {
      color = mix(c3, c4, (e - 0.28) / 0.10);
    } else if (e < 0.50) {
      color = mix(c4, c5, (e - 0.38) / 0.12);
    } else if (e < 0.68) {
      color = mix(c5, c6, (e - 0.50) / 0.18);
    } else {
      color = mix(c6, c7, (e - 0.68) / 0.32);
    }

    // Contour lines visible from the base of each hill outward into flat ground.
    float contour = fract(e * uNumContours);
    float rawLine = smoothstep(uContourWidth, 0.0, contour)
                  + smoothstep(1.0 - uContourWidth, 1.0, contour);
    // Fade in contour lines right above the discard threshold, not at 0.05.
    float contourMask = smoothstep(0.002, 0.01, e);
    float line = rawLine * contourMask;
    vec3 contourColor = vec3(0.05, 0.02, 0.15);
    color = mix(color, contourColor, line * 0.90);

    // Background alpha: flat ground is nearly transparent so the GridPlane grid
    // shows through between the contour rings.
    // Contour lines get their own stronger alpha so they stay legible at the base.
    float bgAlpha = e < 0.05
      ? smoothstep(0.002, 0.05, e) * 0.55
      : mix(0.80, 0.92, smoothstep(0.25, 0.65, e));
    float alpha = max(bgAlpha, line * 0.82);
    gl_FragColor = vec4(color, alpha);
  }
`;

interface Props {
  field: ScalarField;
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: () => void;
}

export function Terrain({ field, onPointerMove, onPointerLeave }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, maxHeight } = useMemo(() => {
    const { data, bounds, gridSize, maxValue } = field;
    const segments = Math.min(gridSize - 1, 255);

    // Plane is TERRAIN_SCALE × wider/deeper than the node bounds so the edges
    // are never visible; the outer area samples the clamped field edge (≈ 0).
    const geo = new THREE.PlaneGeometry(
      bounds.width * TERRAIN_SCALE,
      bounds.height * TERRAIN_SCALE,
      segments,
      segments,
    );

    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position as THREE.BufferAttribute;
    const vertCount = positions.count;
    const mh = maxValue > 0 ? TERRAIN_HEIGHT_SCALE : 0;

    for (let i = 0; i < vertCount; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      // Map the centre ±bounds/2 range to scalar field UV [0, 1].
      // Clamp outer vertices (TERRAIN_SCALE extended area) to field edge (≈ 0 elevation).
      const cu = Math.max(
        0,
        Math.min(1, (x + bounds.width / 2) / bounds.width),
      );
      const cv = Math.max(
        0,
        Math.min(1, (z + bounds.height / 2) / bounds.height),
      );

      // Bilinear interpolation — smoother terrain vs. nearest-neighbour rounding.
      const gxf = cu * (gridSize - 1);
      const gyf = cv * (gridSize - 1);
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
      const sample =
        v00 * (1 - fx) * (1 - fy) +
        v10 * fx * (1 - fy) +
        v01 * (1 - fx) * fy +
        v11 * fx * fy;
      positions.setY(i, maxValue > 0 ? (sample / maxValue) * mh : 0);
    }

    positions.needsUpdate = true;
    geo.computeVertexNormals();

    return { geometry: geo, maxHeight: mh };
  }, [field]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uMaxHeight: { value: maxHeight },
          uNumContours: { value: NUM_CONTOURS },
          uContourWidth: { value: CONTOUR_WIDTH },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [maxHeight],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(() => {
    if (material.uniforms.uMaxHeight.value !== maxHeight) {
      material.uniforms.uMaxHeight.value = maxHeight;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    />
  );
}
