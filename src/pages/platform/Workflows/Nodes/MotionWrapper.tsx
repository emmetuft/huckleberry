import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
}

export const MotionWrapper = forwardRef<HTMLDivElement, MotionWrapperProps>(
  ({ children, className }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, marginTop: -30 }}
      animate={{ opacity: 1, marginTop: 0 }}
      transition={{
        opacity: { duration: 0.2 },
        marginTop: {
          duration: 0.4,
          ease: [0.175, 0.885, 0.32, 1.275], // bounce-like cubic-bezier
        },
      }}
    >
      {children}
    </motion.div>
  ),
);

MotionWrapper.displayName = 'MotionWrapper';
