import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Blob, DotGrid, LinearGradient, Liquify, Shader } from 'shaders/react';
import styles from './Background.module.css';
import { selectTheme } from 'reducers/app/slice';

interface BackgroundProps {}

export const Background: FC<BackgroundProps> = ({}) => {
  const theme = useSelector(selectTheme);

  const colors =
    theme === 'dark'
      ? {
          gradientA: '#000000ff',
          gradientB: '#1d1629ff',
          blobA: '#1d133cff',
          blobB: '#0d0a1a',
          dotOpacity: 0.1,
        }
      : {
          gradientA: '#fff',
          gradientB: '#c3c7ff',
          blobA: 'rgb(240, 233, 255)',
          blobB: '#c3c7ff',
          dotOpacity: 0.7,
        };

  return (
    <div className={styles.Background}>
      <Shader style={{ height: '100%', width: '100%' }}>
        <LinearGradient colorA={colors.gradientA} colorB={colors.gradientB} />
        <Blob
          colorA={colors.blobA}
          colorB={colors.blobB}
          deformation={0.9}
          softness={2}
        />
        <Liquify intensity={5} decay={1} radius={2} />
        <DotGrid density={80} dotSize={0.1} opacity={colors.dotOpacity} />
      </Shader>
    </div>
  );
};
