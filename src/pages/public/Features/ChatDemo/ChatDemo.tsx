import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { CheckCircleIcon } from '@phosphor-icons/react';
import { CHAT_DEMO } from '../mockData';
import styles from './ChatDemo.module.css';

const renderInline = (text: string): ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
};

const STEP_DELAYS = [200, 600, 1000, 1600, 2100, 2800, 3400, 3900];

export const ChatDemo: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [visibleStep, setVisibleStep] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    const timers = STEP_DELAYS.map((delay, i) =>
      setTimeout(() => setVisibleStep(i), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const showUser = visibleStep >= 0;
  const showThinking = visibleStep >= 1 && visibleStep < 2;
  const showStep1 = visibleStep >= 2;
  const showStep2 = visibleStep >= 3;
  const showStep3 = visibleStep >= 4;
  const showResp1 = visibleStep >= 5;
  const showResp2 = visibleStep >= 6;
  const showResp3 = visibleStep >= 7;

  return (
    <div className={styles.panel} ref={ref}>
      <div className={styles.header}>Huckleberry</div>

      <div className={styles.messages}>
        <AnimatePresence>
          {showUser && (
            <motion.div
              key="user"
              className={styles.userMsg}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {CHAT_DEMO.userMessage}
            </motion.div>
          )}

          {showThinking && (
            <motion.div
              key="thinking"
              className={styles.thinking}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className={styles.dot1} />
              <span className={styles.dot2} />
              <span className={styles.dot3} />
            </motion.div>
          )}

          {showStep1 && (
            <motion.div
              key="steps"
              className={styles.steps}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {CHAT_DEMO.steps.map((s, i) => {
                const show = [showStep1, showStep2, showStep3][i];
                if (!show) return null;
                return (
                  <motion.div
                    key={s.id}
                    className={styles.step}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircleIcon
                      size={13}
                      className={styles.stepIcon}
                      weight="fill"
                    />
                    <span className={styles.stepTitle}>{s.title}</span>
                    <span className={styles.stepDuration}>
                      {s.durationMs}ms
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {showResp1 && (
            <motion.div
              key="response"
              className={styles.response}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.avatar}>H</div>
              <div className={styles.responseLines}>
                {[
                  { show: showResp1, text: CHAT_DEMO.responseLines[0] },
                  { show: showResp2, text: CHAT_DEMO.responseLines[1] },
                  { show: showResp3, text: CHAT_DEMO.responseLines[2] },
                ].map(
                  ({ show, text }, i) =>
                    show && (
                      <motion.p
                        key={i}
                        className={styles.responseLine}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {renderInline(text)}
                      </motion.p>
                    ),
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
