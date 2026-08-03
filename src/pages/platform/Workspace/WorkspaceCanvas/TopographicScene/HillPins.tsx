import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { ScalarField, sampleField } from 'utils/topography';
import { TERRAIN_HEIGHT_SCALE } from './Terrain';

const STEM_HEIGHT = 60;
const STEM_RADIUS = 4;
const HEAD_RADIUS = 16;

interface Props {
  field: ScalarField;
}

export function HillPins({ field }: Props) {
  const { stemGeo, headGeo, stemMat, headMat } = useMemo(() => {
    const stemGeo = new THREE.CylinderGeometry(
      STEM_RADIUS,
      STEM_RADIUS,
      STEM_HEIGHT,
      8,
    );
    const headGeo = new THREE.SphereGeometry(HEAD_RADIUS, 10, 10);
    const stemMat = new THREE.MeshBasicMaterial({ color: '#0d0620' });
    const headMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    return { stemGeo, headGeo, stemMat, headMat };
  }, []);

  useEffect(() => {
    return () => {
      stemGeo.dispose();
      headGeo.dispose();
      stemMat.dispose();
      headMat.dispose();
    };
  }, [stemGeo, headGeo, stemMat, headMat]);

  const pins = useMemo(() => {
    if (field.maxValue === 0) return [];
    const { bounds, nodeTopoPositions } = field;
    const centerX = bounds.minX + bounds.width / 2;
    const centerZ = bounds.minY + bounds.height / 2;

    return nodeTopoPositions.map(({ id, topoX, topoZ }) => {
      const u = Math.max(0, Math.min(1, (topoX - bounds.minX) / bounds.width));
      const v = Math.max(0, Math.min(1, (topoZ - bounds.minY) / bounds.height));
      const fieldValue = sampleField(field, u, v);
      const worldY = (fieldValue / field.maxValue) * TERRAIN_HEIGHT_SCALE;

      return {
        id,
        x: topoX - centerX,
        y: worldY - 20,
        z: topoZ - centerZ,
      };
    });
  }, [field]);

  return (
    <>
      {pins.map(({ id, x, y, z }) => (
        <group key={id} position={[x, y, z]}>
          <mesh
            geometry={stemGeo}
            material={stemMat}
            position={[0, STEM_HEIGHT / 2, 0]}
          />
          <mesh
            geometry={headGeo}
            material={headMat}
            position={[0, STEM_HEIGHT + HEAD_RADIUS * 0.6, 0]}
          />
        </group>
      ))}
    </>
  );
}
