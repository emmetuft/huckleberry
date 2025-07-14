import { Quality } from 'models/enums/quality';

export enum IconType {
  SHIELD_CHECK = 'shield-check',
  SPEEDOMETER = 'speedometer',
  EYE = 'eye',
  HOURGLASS = 'hourglass',
  DATABASE = 'database',
  TIMER = 'timer',
}

export const metricList: {
  id: number;
  title: string;
  description: string;
  score: string;
  scoreDescription: string;
  quality: Quality;
  icon: IconType;
}[] = [
  {
    id: 1,
    title: 'Data completeness',
    description: 'Degree to which data contains all required information.',
    score: '86%',
    scoreDescription: 'Overall',
    quality: Quality.GOOD,
    icon: IconType.SHIELD_CHECK,
  },
  {
    id: 2,
    title: 'Throughput',
    description:
      'Number of requests processed by the system in a given time period.',
    score: '132,000',
    scoreDescription: 'Requests/hour',
    quality: Quality.GOOD,
    icon: IconType.SPEEDOMETER,
  },
  {
    id: 3,
    title: 'Data accuracy',
    description: 'Degree to which data is correct and reliable.',
    score: '79%',
    scoreDescription: 'Overall',
    quality: Quality.AVERAGE,
    icon: IconType.EYE,
  },
  {
    id: 4,
    title: 'Latency',
    description: 'Time taken to process a request.',
    score: '132 ms',
    scoreDescription: '24hr average',
    quality: Quality.GOOD,
    icon: IconType.HOURGLASS,
  },
  {
    id: 5,
    title: 'Data consistency',
    description:
      'Degree to which data is consistent across different sources and systems.',
    score: '68%',
    scoreDescription: 'Overall',
    quality: Quality.BAD,
    icon: IconType.DATABASE,
  },
  {
    id: 6,
    title: 'Data freshness',
    description:
      'Degree to which data is up-to-date and reflects the most current information.',
    score: '54%',
    scoreDescription: 'Overall',
    quality: Quality.BAD,
    icon: IconType.TIMER,
  },
];
