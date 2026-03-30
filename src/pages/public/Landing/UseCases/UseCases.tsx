import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './UseCases.module.css';
import { UseCase } from '../Landing';
import { UseCaseCard } from './UseCaseCard';

interface UseCasesCarouselProps {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

const UseCasesCarousel: React.FC<UseCasesCarouselProps> = ({
  selectedIndex,
  setSelectedIndex,
}) => {
  const useCases = Object.values(UseCase);

  useEffect(() => {
    setSelectedIndex(selectedIndex);
  }, [selectedIndex]);

  const wrap = (index: number) => (index + useCases.length) % useCases.length;

  const getOffset = (index: number) => {
    const raw = index - selectedIndex;
    const half = useCases.length / 2;

    if (raw > half) return raw - useCases.length;
    if (raw < -half) return raw + useCases.length;
    return raw;
  };

  return (
    <div className={styles.carousel}>
      {useCases.map((useCase, index) => {
        const offset = getOffset(index);

        const isActive = offset === 0;
        const isNeighbor = Math.abs(offset) === 1;

        return (
          <motion.div
            key={useCase}
            className={styles.carouselItem}
            style={{
              width: isActive ? '70%' : '60%',
              cursor: isNeighbor ? 'pointer' : 'default',
            }}
            animate={{
              x:
                offset === 0
                  ? '-50%'
                  : offset === -1
                    ? '-160%'
                    : offset === 1
                      ? '60%'
                      : offset < -1
                        ? '-250%'
                        : '150%',
              scale: isActive ? 1 : 0.9,
              opacity: isActive ? 1 : isNeighbor ? 0.6 : 0,
              zIndex: isActive ? 2 : 1,
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }}
            onClick={() => {
              if (offset === -1) setSelectedIndex(wrap(selectedIndex - 1));
              if (offset === 1) setSelectedIndex(wrap(selectedIndex + 1));
            }}
          >
            <UseCaseCard useCase={useCase} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default UseCasesCarousel;
