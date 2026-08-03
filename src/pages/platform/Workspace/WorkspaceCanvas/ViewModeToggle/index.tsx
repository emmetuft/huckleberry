import { FC } from 'react';
import { Segmented } from 'antd';
import { GraphIcon, MountainsIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import { CanvasViewMode } from 'models/enums/canvasViewMode';

interface Props {
  value: CanvasViewMode;
  onChange: (mode: CanvasViewMode) => void;
}

export const ViewModeToggle: FC<Props> = ({ value, onChange }) => (
  <Segmented
    size="small"
    value={value}
    onChange={(v) => onChange(v as CanvasViewMode)}
    options={[
      {
        value: CanvasViewMode.GRAPH,
        label: (
          <div className={styles.toggle}>
            <GraphIcon size={13} /> Graph
          </div>
        ),
      },
      {
        value: CanvasViewMode.TOPOGRAPHY,
        label: (
          <div className={styles.toggle}>
            <MountainsIcon size={13} /> Terrain
          </div>
        ),
      },
    ]}
  />
);
