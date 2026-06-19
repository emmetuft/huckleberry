import React, { CSSProperties, FC } from 'react';
import styles from './Skeleton.module.css';

interface SkeletonBlockProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
}

export const SkeletonBlock: FC<SkeletonBlockProps> = ({
  width = '100%',
  height = 16,
  borderRadius,
  style,
}) => (
  <div
    className={styles.block}
    style={{
      width,
      height,
      ...(borderRadius !== undefined ? { borderRadius } : {}),
      ...style,
    }}
  />
);

interface SkeletonGroupProps {
  children: React.ReactNode;
  style?: CSSProperties;
}

export const SkeletonGroup: FC<SkeletonGroupProps> = ({ children, style }) => (
  <div className={styles.group} style={style}>
    {children}
  </div>
);
