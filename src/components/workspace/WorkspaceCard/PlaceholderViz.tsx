import { FC } from 'react';
import { CardType } from 'config/bentoConfig';
import styles from './WorkspaceCard.module.css';

export const PlaceholderViz: FC<{ type: CardType }> = ({ type }) => {
  switch (type) {
    case 'pipeline':
      return (
        <div className={styles.pipelineViz}>
          <div className={styles.vizSummary}>
            <span className={styles.statBig}>$5.43M</span>
            <span className={styles.statTrend}>▲ 12% vs last month</span>
          </div>
          <div className={styles.pipelineRows}>
            {[
              { stage: 'Prospecting', width: '82%', value: '$2.4M', deals: 28 },
              {
                stage: 'Qualification',
                width: '61%',
                value: '$1.8M',
                deals: 14,
              },
              { stage: 'Proposal', width: '38%', value: '$890K', deals: 8 },
              { stage: 'Evaluation', width: '45%', value: '$1.2M', deals: 7 },
              { stage: 'Closing', width: '22%', value: '$340K', deals: 5 },
            ].map(({ stage, width, value, deals }) => (
              <div key={stage} className={styles.pipelineRow}>
                <span className={styles.stageName}>{stage}</span>
                <div className={styles.barTrack}>
                  <div className={styles.bar} style={{ width }} />
                </div>
                <span className={styles.stageValue}>{value}</span>
                <span className={styles.stageDeals}>{deals}d</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'accountsAtRisk':
      return (
        <div className={styles.listViz}>
          <div className={styles.vizSummary}>
            <span
              className={styles.statBig}
              style={{ color: 'var(--error-icon)' }}
            >
              3
            </span>
            <span className={styles.statLabel}>accounts need attention</span>
          </div>
          {[
            {
              name: 'Acme Corp',
              value: '$120K',
              level: 'high',
              note: 'No contact 14d',
            },
            {
              name: 'GlobalTech Inc',
              value: '$85K',
              level: 'medium',
              note: 'Renewal Apr 20',
            },
            {
              name: 'Sunrise Analytics',
              value: '$67K',
              level: 'high',
              note: 'Churn signal',
            },
          ].map(({ name, value, level, note }) => (
            <div key={name} className={styles.listRow}>
              <span className={`${styles.riskDot} ${styles[level]}`} />
              <div className={styles.listMain}>
                <span className={styles.listPrimary}>{name}</span>
                <span className={styles.listNote}>{note}</span>
              </div>
              <span className={styles.listSecondary}>{value}</span>
              <span className={`${styles.badge} ${styles[level]}`}>
                {level === 'high' ? 'High' : 'Med'}
              </span>
            </div>
          ))}
        </div>
      );

    case 'quotaAttainment': {
      const pct = 0.73;
      const r = 46;
      const cx = 60;
      const cy = 60;
      const circ = 2 * Math.PI * r;
      const offset = circ * (1 - pct);
      return (
        <div className={styles.quotaViz}>
          <div className={styles.quotaRingWrap}>
            <svg viewBox="0 0 120 120" className={styles.quotaSvg}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="var(--grey-light)"
                strokeWidth="9"
              />
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="var(--purple)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              <text
                x={cx}
                y={cy + 9}
                textAnchor="middle"
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  fill: 'var(--text)',
                  fontFamily: 'inherit',
                }}
              >
                73%
              </text>
              <text
                x={cx}
                y={cy + 23}
                textAnchor="middle"
                style={{
                  fontSize: '11px',
                  fill: 'var(--grey-text)',
                  fontFamily: 'inherit',
                }}
              >
                of quota
              </text>
            </svg>
          </div>
          <div className={styles.quotaStats}>
            <div className={styles.quotaStat}>
              <span className={styles.quotaStatValue}>$1.2M</span>
              <span className={styles.quotaStatLabel}>closed</span>
            </div>
            <div className={styles.quotaStatDivider} />
            <div className={styles.quotaStat}>
              <span className={styles.quotaStatValue}>$1.65M</span>
              <span className={styles.quotaStatLabel}>target</span>
            </div>
            <div className={styles.quotaStatDivider} />
            <div className={styles.quotaStat}>
              <span className={styles.quotaStatValue}>18d</span>
              <span className={styles.quotaStatLabel}>left in Q2</span>
            </div>
          </div>
        </div>
      );
    }

    case 'tickets':
      return (
        <div className={styles.kanban}>
          <div className={styles.kanbanSummary}>
            <span className={styles.statBig}>7</span>
            <span className={styles.statLabel}>open tickets</span>
          </div>
          <div className={styles.kanbanCols}>
            {[
              {
                label: 'To Do',
                count: 12,
                color: 'var(--grey-text)',
                tickets: [
                  'API rate limiting',
                  'Auth refactor',
                  'Mobile layout',
                  'DB migrations',
                ],
              },
              {
                label: 'In Progress',
                count: 5,
                color: 'var(--info-icon)',
                tickets: ['Search indexing', 'Dashboard v2', 'Perf audit'],
              },
              {
                label: 'Done',
                count: 28,
                color: 'var(--success-icon)',
                tickets: [
                  'Login flow',
                  'Settings page',
                  'Dark mode',
                  'API v3 docs',
                ],
              },
            ].map(({ label, count, color, tickets }) => (
              <div key={label} className={styles.kanbanCol}>
                <div className={styles.kanbanHeader}>
                  <span className={styles.kanbanLabel} style={{ color }}>
                    {label}
                  </span>
                  <span className={styles.kanbanCount} style={{ color }}>
                    {count}
                  </span>
                </div>
                {tickets.map((t) => (
                  <div key={t} className={styles.ticket}>
                    {t}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    case 'prQueue':
      return (
        <div className={styles.listViz}>
          <div className={styles.vizSummary}>
            <span className={styles.statBig}>3</span>
            <span className={styles.statLabel}>awaiting review</span>
          </div>
          {[
            {
              title: 'feat: add OAuth provider',
              author: 'AK',
              time: '2h ago',
              status: 'review',
            },
            {
              title: 'fix: memory leak in worker',
              author: 'JL',
              time: '5h ago',
              status: 'open',
            },
            {
              title: 'chore: update dependencies',
              author: 'MT',
              time: '1d ago',
              status: 'review',
            },
            {
              title: 'feat: new dashboard UI',
              author: 'MT',
              time: '1d ago',
              status: 'review',
            },
          ].map(({ title, author, time, status }) => (
            <div key={title} className={styles.prRow}>
              <span className={styles.prAvatar}>{author}</span>
              <div className={styles.listMain}>
                <span className={styles.listPrimary}>{title}</span>
                <span className={styles.listNote}>{time}</span>
              </div>
              <span className={`${styles.badge} ${styles[status]}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      );

    case 'commitHeatmap': {
      const WEEKS: number[][] = [
        [0, 2, 4, 3, 5, 2, 0],
        [1, 3, 6, 4, 3, 1, 0],
        [0, 4, 3, 7, 5, 2, 0],
        [0, 1, 2, 4, 3, 0, 0],
        [0, 5, 6, 4, 7, 3, 1],
        [0, 3, 4, 5, 2, 4, 0],
        [1, 2, 8, 6, 4, 2, 0],
        [0, 4, 5, 3, 6, 1, 0],
        [0, 3, 2, 4, 3, 2, 0],
        [0, 5, 4, 6, 7, 3, 0],
        [1, 2, 3, 5, 4, 1, 0],
        [0, 4, 6, 5, 3, 2, 0],
        [0, 2, 4, 3, 5, 1, 0],
        [0, 5, 7, 4, 6, 3, 1],
        [0, 3, 4, 6, 5, 2, 0],
        [0, 4, 5, 3, 7, 2, 0],
      ];
      const heatColor = (n: number) => {
        if (n === 0) return 'var(--grey-light)';
        if (n <= 2) return 'var(--purple-light)';
        if (n <= 4) return '#c4b5fd';
        if (n <= 6) return '#a78bfa';
        return 'var(--purple)';
      };
      const total = WEEKS.flat().reduce((a, b) => a + b, 0);
      return (
        <div className={styles.heatmap}>
          <div className={styles.vizSummary}>
            <span className={styles.statBig}>{total}</span>
            <span className={styles.statLabel}>commits · last 16 weeks</span>
          </div>
          <div className={styles.heatmapGrid}>
            {WEEKS.map((week, wi) => (
              <div key={wi} className={styles.heatmapWeek}>
                {week.map((count, di) => (
                  <div
                    key={di}
                    className={styles.heatmapCell}
                    style={{ background: heatColor(count) }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
