import { FC } from 'react';
import styles from './QuestionMarquee.module.css';

const ROW_ONE = [
  'Where are we losing margin without knowing it?',
  'Which vendors are creating the most risk?',
  'What is blocking our largest deal?',
  'Where is process debt slowing us down?',
  'Which customers are about to churn?',
  'What decisions are we making without enough context?',
  'Where is duplicated effort costing us the most?',
  'Which initiatives are quietly off-track?',
  'What compliance gaps are we exposed to?',
  'Where is institutional knowledge at risk of leaving?',
];

const ROW_TWO = [
  'Which systems are most likely to fail next quarter?',
  'Where are we underinvesting relative to our strategy?',
  'Which partnerships are underperforming?',
  'What do our best customers have in common?',
  'Where is the bottleneck in our pipeline?',
  'Which projects depend on the same three people?',
  'What is the true cost of this decision?',
  'Where are we moving fastest and why?',
  'Which signals are we collecting but never acting on?',
  'What would have to be true for this bet to pay off?',
];

const PILL_COLORS = [
  'colorOne',
  'colorTwo',
  'colorThree',
  'colorFour',
] as const;
type PillColor = (typeof PILL_COLORS)[number];

const getPillColor = (index: number): PillColor =>
  PILL_COLORS[index % PILL_COLORS.length];

interface MarqueeRowProps {
  questions: string[];
  direction: 'left' | 'right';
}

const MarqueeRow: FC<MarqueeRowProps> = ({ questions, direction }) => {
  const doubled = [...questions, ...questions];

  return (
    <div className={styles.rowWrapper}>
      <div
        className={`${styles.row} ${direction === 'right' ? styles.rowReverse : ''}`}
      >
        {doubled.map((question, i) => (
          <span
            key={i}
            className={`${styles.pill} ${styles[getPillColor(i % questions.length)]}`}
          >
            {question}
          </span>
        ))}
      </div>
    </div>
  );
};

export const QuestionMarquee: FC = () => {
  return (
    <div className={styles.marquee}>
      <MarqueeRow questions={ROW_ONE} direction="left" />
      <MarqueeRow questions={ROW_TWO} direction="right" />
    </div>
  );
};
