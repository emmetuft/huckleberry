import { FC } from 'react';
import { UseCase } from '../Landing';
import styles from './UseCaseCard.module.css';

interface UseCaseCardProps {
  useCase: UseCase;
}

export const UseCaseCard: FC<UseCaseCardProps> = ({ useCase }) => {
  return (
    <div className={styles.useCaseCard}>
      <h2 className={styles.title}>{useCase}</h2>
      <img src="/static/useCases/hr.png" />
    </div>
  );
};
