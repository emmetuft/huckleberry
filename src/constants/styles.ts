export const nodeColors = [
  '#705be7',
  '#6d8ae9',
  '#3a9e72',
  '#c45a4a',
  '#e0a030',
  '#c048ae',
  '#30b8b0',
  '#bfff00',
];

export const chartColors = [...nodeColors, '#2792c7'];

export const defaultMotionProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export const defaultTagStyle = {
  color: 'var(--purple)',
  backgroundColor: 'var(--purple-light)',
};

export const greenTagStyle = {
  color: 'var(--success-icon)',
  backgroundColor: 'var(--success-bg)',
};
