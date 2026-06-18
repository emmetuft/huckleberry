import { FC, useEffect, useState } from 'react';
import { Button, Spin } from 'antd';
import { XIcon } from '@phosphor-icons/react';
import { AgentSession } from 'models/interfaces/session';
import {
  AISessionEvent,
  AISessionEventType,
} from 'models/interfaces/sessionEvent';
import { AgentSessionService } from 'services/agentSession';
import { formatDuration, formatCompactNumber } from 'utils/datetime';
import styles from './SessionCompare.module.css';
import { SessionWaterfall } from '../SessionAnalytics/SessionWaterfall/SessionWaterfall';

interface SessionCompareProps {
  sessionA: AgentSession;
  sessionB: AgentSession;
  onClose: () => void;
}

interface SessionMetrics {
  duration: number;
  totalTokens: number;
  toolCalls: number;
  errors: number;
  tokensByService: Record<string, number>;
  timeBreakdown: {
    aiService: number;
    tool: number;
    action: number;
    error: number;
  };
}

function computeMetrics(events: AISessionEvent[]): SessionMetrics {
  if (!events.length)
    return {
      duration: 0,
      totalTokens: 0,
      toolCalls: 0,
      errors: 0,
      tokensByService: {},
      timeBreakdown: { aiService: 0, tool: 0, action: 0, error: 0 },
    };

  const timestamps = events.map((e) => new Date(e.timestamp).getTime());
  const duration = Math.max(...timestamps) - Math.min(...timestamps);

  const serviceEvents = events.filter(
    (e) => e.type === AISessionEventType.AI_SERVICE_RESPONSE,
  ) as any[];

  const totalTokens = serviceEvents.reduce((sum, e) => {
    return sum + (e.serviceResponse?.modelProviderUsage?.totalTokens ?? 0);
  }, 0);

  const tokensByService: Record<string, number> = {};
  for (const e of serviceEvents) {
    const service = e.service ?? 'Unknown';
    tokensByService[service] =
      (tokensByService[service] ?? 0) +
      (e.serviceResponse?.modelProviderUsage?.totalTokens ?? 0);
  }

  const toolCalls = events.filter(
    (e) => e.type === AISessionEventType.TOOL_STARTED,
  ).length;

  const errors = events.filter((e) => e.error != null).length;

  const timeBreakdown = { aiService: 0, tool: 0, action: 0, error: 0 };
  for (const e of events) {
    const ms = 'durationMs' in e ? (e as any).durationMs : undefined;
    if (typeof ms !== 'number') continue;
    if (e.error != null) {
      timeBreakdown.error += ms;
    } else if (e.type === AISessionEventType.AI_SERVICE_RESPONSE) {
      timeBreakdown.aiService += ms;
    } else if (
      e.type === AISessionEventType.TOOL_COMPLETED ||
      e.type === AISessionEventType.TOOL_FINISHED
    ) {
      timeBreakdown.tool += ms;
    } else if (e.type === AISessionEventType.ACTION_COMPLETED) {
      timeBreakdown.action += ms;
    }
  }

  return {
    duration,
    totalTokens,
    toolCalls,
    errors,
    tokensByService,
    timeBreakdown,
  };
}

function DeltaBadge({
  diff,
  kind,
  format,
}: {
  diff: number;
  kind: 'duration' | 'tokens' | 'tools' | 'errors';
  format: (n: number) => string;
}) {
  if (diff === 0) {
    return <span className={`${styles.delta} ${styles.deltaNeutral}`}>0</span>;
  }

  const up = diff > 0;
  let cls: string;
  if (kind === 'errors' && up) {
    cls = styles.deltaBad;
  } else if (up) {
    cls = styles.deltaUp;
  } else {
    cls = styles.deltaDown;
  }

  const label = (up ? '+' : '−') + format(Math.abs(diff));
  return <span className={`${styles.delta} ${cls}`}>{label}</span>;
}

const TokensByService: FC<{
  metricsA: SessionMetrics;
  metricsB: SessionMetrics;
}> = ({ metricsA, metricsB }) => {
  const allServices = [
    ...new Set([
      ...Object.keys(metricsA.tokensByService),
      ...Object.keys(metricsB.tokensByService),
    ]),
  ].sort();

  if (!allServices.length) return null;

  const max = Math.max(
    ...allServices.map((s) =>
      Math.max(
        metricsA.tokensByService[s] ?? 0,
        metricsB.tokensByService[s] ?? 0,
      ),
    ),
    1,
  );

  return (
    <div className={styles.tokenSection}>
      <h3>Tokens by service</h3>
      <div className={styles.tokenLegend}>
        <span className={styles.tokenLegendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchA}`} />{' '}
          Session A
        </span>
        <span className={styles.tokenLegendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchB}`} />{' '}
          Session B
        </span>
      </div>
      <div className={styles.tokenRows}>
        {allServices.map((service) => {
          const aVal = metricsA.tokensByService[service] ?? 0;
          const bVal = metricsB.tokensByService[service] ?? 0;
          return (
            <div key={service} className={styles.tokenRow}>
              <span className={styles.tokenServiceName}>{service}</span>
              <div className={styles.tokenBars}>
                <div className={styles.tokenBarLine}>
                  <div
                    className={`${styles.tokenBarFill} ${styles.fillA}`}
                    style={{ width: `${(aVal / max) * 100}%` }}
                  />
                  <span className={styles.tokenBarValue}>
                    {formatCompactNumber(aVal)}
                  </span>
                </div>
                <div className={styles.tokenBarLine}>
                  <div
                    className={`${styles.tokenBarFill} ${styles.fillB}`}
                    style={{ width: `${(bVal / max) * 100}%` }}
                  />
                  <span className={styles.tokenBarValue}>
                    {formatCompactNumber(bVal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TIME_SEGMENTS = [
  { key: 'aiService' as const, label: 'AI Service', color: '#118ab2' },
  { key: 'tool' as const, label: 'Tool', color: '#06d6a0' },
  { key: 'action' as const, label: 'Action', color: '#ffd166' },
  { key: 'error' as const, label: 'Error', color: '#ef476f' },
];

const TimeBreakdown: FC<{
  metricsA: SessionMetrics;
  metricsB: SessionMetrics;
}> = ({ metricsA, metricsB }) => {
  const totalA =
    Object.values(metricsA.timeBreakdown).reduce((s, v) => s + v, 0) || 1;
  const totalB =
    Object.values(metricsB.timeBreakdown).reduce((s, v) => s + v, 0) || 1;

  return (
    <div className={styles.timeSection}>
      <h3>Time breakdown</h3>
      <div className={styles.timeLegend}>
        {TIME_SEGMENTS.map((seg) => (
          <span key={seg.key} className={styles.tokenLegendItem}>
            <span
              className={styles.legendSwatch}
              style={{ background: seg.color }}
            />
            {seg.label}
          </span>
        ))}
      </div>
      <div className={styles.timeRows}>
        <div className={styles.timeRow}>
          <span className={styles.timeTag}>A</span>
          <div className={styles.timeBar}>
            {TIME_SEGMENTS.map((seg) => {
              const pct = (metricsA.timeBreakdown[seg.key] / totalA) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={seg.key}
                  className={styles.timeSegment}
                  style={{ width: `${pct}%`, background: seg.color }}
                  title={`${seg.label}: ${formatDuration(metricsA.timeBreakdown[seg.key])}`}
                />
              );
            })}
          </div>
          <span className={styles.timeTotal}>{formatDuration(totalA)}</span>
        </div>
        <div className={styles.timeRow}>
          <span className={styles.timeTag}>B</span>
          <div className={styles.timeBar}>
            {TIME_SEGMENTS.map((seg) => {
              const pct = (metricsB.timeBreakdown[seg.key] / totalB) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={seg.key}
                  className={styles.timeSegment}
                  style={{ width: `${pct}%`, background: seg.color }}
                  title={`${seg.label}: ${formatDuration(metricsB.timeBreakdown[seg.key])}`}
                />
              );
            })}
          </div>
          <span className={styles.timeTotal}>{formatDuration(totalB)}</span>
        </div>
      </div>
    </div>
  );
};

export const SessionCompare: FC<SessionCompareProps> = ({
  sessionA,
  sessionB,
  onClose,
}) => {
  const [eventsA, setEventsA] = useState<AISessionEvent[]>([]);
  const [eventsB, setEventsB] = useState<AISessionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      AgentSessionService.getSessionEvents(sessionA.id),
      AgentSessionService.getSessionEvents(sessionB.id),
    ])
      .then(([a, b]) => {
        setEventsA(a);
        setEventsB(b);
      })
      .finally(() => setLoading(false));
  }, [sessionA.id, sessionB.id]);

  const metricsA = computeMetrics(eventsA);
  const metricsB = computeMetrics(eventsB);

  const kpis = [
    {
      label: 'Duration',
      a: metricsA.duration,
      b: metricsB.duration,
      kind: 'duration' as const,
      format: formatDuration,
    },
    {
      label: 'Total tokens',
      a: metricsA.totalTokens,
      b: metricsB.totalTokens,
      kind: 'tokens' as const,
      format: formatCompactNumber,
    },
    {
      label: 'Tool calls',
      a: metricsA.toolCalls,
      b: metricsB.toolCalls,
      kind: 'tools' as const,
      format: (n: number) => String(n),
    },
    {
      label: 'Errors',
      a: metricsA.errors,
      b: metricsB.errors,
      kind: 'errors' as const,
      format: (n: number) => String(n),
    },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Compare sessions</h2>
          <div className={styles.pills}>
            <span className={`${styles.pill} ${styles.pillA}`}>
              <span className={`${styles.dot} ${styles.dotA}`} />A ·{' '}
              {sessionA.name}
            </span>
            <span className={`${styles.pill} ${styles.pillB}`}>
              <span className={`${styles.dot} ${styles.dotB}`} />B ·{' '}
              {sessionB.name}
            </span>
          </div>
          <Button type="text" icon={<XIcon size={18} />} onClick={onClose} />
        </div>

        {loading ? (
          <div className={styles.loading}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className={styles.kpiGrid}>
              {kpis.map((kpi) => (
                <div key={kpi.label} className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>{kpi.label}</span>
                  <div className={styles.kpiValues}>
                    <span className={styles.kpiValue}>
                      <span className={`${styles.tag} ${styles.tagA}`}>A</span>
                      {kpi.format(kpi.a)}
                    </span>
                    <span className={styles.kpiValue}>
                      <span className={`${styles.tag} ${styles.tagB}`}>B</span>
                      {kpi.format(kpi.b)}
                    </span>
                    <DeltaBadge
                      diff={kpi.b - kpi.a}
                      kind={kpi.kind}
                      format={kpi.format}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.waterfallSection}>
              <h3>Event waterfall</h3>
              <div className={styles.waterfallGrid}>
                <div className={styles.waterfallPane}>
                  <div className={styles.paneHeader}>
                    <span className={`${styles.dot} ${styles.dotA}`} />
                    Session A · {sessionA.name}
                  </div>
                  <SessionWaterfall events={eventsA} loading={false} />
                </div>
                <div className={styles.waterfallPane}>
                  <div className={styles.paneHeader}>
                    <span className={`${styles.dot} ${styles.dotB}`} />
                    Session B · {sessionB.name}
                  </div>
                  <SessionWaterfall events={eventsB} loading={false} />
                </div>
              </div>
            </div>

            <div className={styles.chartsRow}>
              <TokensByService metricsA={metricsA} metricsB={metricsB} />
              <TimeBreakdown metricsA={metricsA} metricsB={metricsB} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
