import { FC, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { AGENT_STEPS, AgentStepData } from '../mockData';
import styles from './AgentBuilderDemo.module.css';

const STEP_DURATION = 4000;

export const AgentBuilderDemo: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % AGENT_STEPS.length);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, [inView]);

  const current = AGENT_STEPS[activeStep];

  return (
    <div className={styles.panel} ref={ref}>
      <div className={styles.stepNav}>
        {AGENT_STEPS.map((s, i) => (
          <button
            key={s.label}
            className={`${styles.stepBtn} ${i === activeStep ? styles.active : ''} ${i < activeStep ? styles.done : ''}`}
            onClick={() => setActiveStep(i)}
          >
            <span className={styles.stepNum}>{i + 1}</span>
            <span className={styles.stepLabel}>{s.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.body}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className={styles.stepContent}
          >
            <p className={styles.subtitle}>{current.subtitle}</p>
            <StepContent step={current} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.progressTrack}>
        <motion.div
          key={activeStep}
          className={styles.progressFill}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: STEP_DURATION / 1000, ease: 'linear' }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
    </div>
  );
};

const StepContent: FC<{ step: AgentStepData }> = ({ step }) => {
  if (step.kind === 'persona') {
    return (
      <div className={styles.fields}>
        {step.fields.map((f) => (
          <div key={f.label} className={styles.field}>
            <span className={styles.fieldLabel}>{f.label}</span>
            <span className={styles.fieldValue}>{f.value}</span>
          </div>
        ))}
      </div>
    );
  }

  if (step.kind === 'knowledge') {
    return (
      <div className={styles.list}>
        {step.sources.map((s) => (
          <div
            key={s.name}
            className={`${styles.listItem} ${s.checked ? styles.checked : ''}`}
          >
            <span className={styles.checkbox}>{s.checked ? '✓' : ''}</span>
            <span className={styles.itemName}>{s.name}</span>
            <span className={styles.itemType}>{s.type}</span>
          </div>
        ))}
      </div>
    );
  }

  if (step.kind === 'toolkits') {
    return (
      <div className={styles.chips}>
        {step.toolkits.map((t) => (
          <span
            key={t.name}
            className={`${styles.chip} ${t.checked ? styles.chipActive : ''}`}
          >
            {t.name}
          </span>
        ))}
      </div>
    );
  }

  if (step.kind === 'visibility') {
    return (
      <div className={styles.visibility}>
        <div className={styles.visGroup}>
          <span className={styles.visLabel}>People</span>
          <div className={styles.pills}>
            {step.people.map((p) => (
              <span key={p.name} className={styles.pill}>
                <span className={styles.pillAvatar}>{p.name[0]}</span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.visGroup}>
          <span className={styles.visLabel}>Groups</span>
          <div className={styles.pills}>
            {step.groups.map((g) => (
              <span key={g.name} className={styles.pill}>
                {g.name}
                <span className={styles.pillCount}>{g.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
