import { FC } from 'react';
import { Blob, DotGrid, LinearGradient, Liquify, Shader } from 'shaders/react';

import styles from './Background.module.scss';

interface BackgroundProps {}

export const Background: FC<BackgroundProps> = ({}) => {
  return (
    <div className={styles.Background}>
      <Shader style={{ height: '100%', width: '100%' }}>
        <LinearGradient colorA="#fff" colorB="#c3c7ffff" />
        <Blob
          colorA="rgb(240, 233, 255)"
          colorB="#c3c7ffff"
          deformation={0.9}
          softness={2}
        />
        <Liquify intensity={5} decay={1} radius={2} />
        <DotGrid density={80} dotSize={0.1} opacity={0.3} />
      </Shader>
    </div>
  );
};
