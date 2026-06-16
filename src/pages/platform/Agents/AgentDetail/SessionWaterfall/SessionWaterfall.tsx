import { FC, useEffect, useMemo, useState } from 'react';
import { Tabs } from 'antd';
import { AnimatePresence } from 'framer-motion';
import {
  AISessionEvent,
  AISessionEventType,
} from 'models/interfaces/sessionEvent';
import styles from './SessionWaterfall.module.css';
import { EventDetailModal } from './EventDetailModal/EventDetailModal';

export type EventCategory =
  | 'tool'
  | 'action'
  | 'aiService'
  | 'assistant'
  | 'mcp'
  | 'other'
  | 'confirmation';

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  tool: '#3a9e72',
  action: '#bfff00',
  aiService: '#705be7',
  assistant: '#e0a030',
  mcp: '#c45a4a',
  other: '#a4abc0',
  confirmation: '#30b8b0',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  tool: 'Tool',
  action: 'Action',
  aiService: 'AI Service',
  assistant: 'Assistant',
  mcp: 'MCP',
  confirmation: 'User Confirmation',
  other: 'Other',
};

export interface WaterfallRow {
  key: string;
  label: string;
  category: EventCategory;
  startPct: number;
  widthPct: number;
  durationMs: number;
}

interface TurnInfo {
  requestId: string;
  tabLabel: string;
  rows: WaterfallRow[];
}

const START_TYPES = new Set<AISessionEventType>([
  AISessionEventType.TOOL_STARTED,
  AISessionEventType.ACTION_STARTED,
  AISessionEventType.AI_SERVICE_REQUEST,
  AISessionEventType.ASSISTANT_REQUEST,
  AISessionEventType.MCP_REQUEST,
]);

const END_TYPES = new Set<AISessionEventType>([
  AISessionEventType.TOOL_COMPLETED,
  AISessionEventType.TOOL_FINISHED,
  AISessionEventType.ACTION_COMPLETED,
  AISessionEventType.AI_SERVICE_RESPONSE,
  AISessionEventType.ASSISTANT_RESPONSE,
  AISessionEventType.ASSISTANT_PAUSED,
  AISessionEventType.MCP_RESPONSE,
]);

function getCategory(type: AISessionEventType): EventCategory {
  switch (type) {
    case AISessionEventType.TOOL_STARTED:
    case AISessionEventType.TOOL_COMPLETED:
    case AISessionEventType.TOOL_FINISHED:
      return 'tool';
    case AISessionEventType.ACTION_STARTED:
    case AISessionEventType.ACTION_COMPLETED:
      return 'action';
    case AISessionEventType.AI_SERVICE_REQUEST:
    case AISessionEventType.AI_SERVICE_RESPONSE:
      return 'aiService';
    case AISessionEventType.ASSISTANT_REQUEST:
    case AISessionEventType.ASSISTANT_RESPONSE:
    case AISessionEventType.ASSISTANT_PAUSED:
      return 'assistant';
    case AISessionEventType.MCP_REQUEST:
    case AISessionEventType.MCP_RESPONSE:
      return 'mcp';
    default:
      return 'other';
  }
}

function getLabel(event: AISessionEvent): string {
  switch (event.type) {
    case AISessionEventType.TOOL_STARTED:
      return `Tool: ${event.tool}`;
    case AISessionEventType.ACTION_STARTED:
      return `${event.tool} (${event.actionType})`;
    case AISessionEventType.AI_SERVICE_REQUEST:
      return `AI Service: ${event.service}`;
    case AISessionEventType.ASSISTANT_REQUEST:
      return `User: ${event.request.input.slice(0, 40)}`;
    case AISessionEventType.MCP_REQUEST:
      return `MCP: ${event.payload.method}`;
    default:
      return event.type.replace(/_/g, ' ').toLowerCase();
  }
}

function buildTurns(events: AISessionEvent[]): TurnInfo[] {
  const byRequestId = new Map<string, AISessionEvent[]>();
  for (const event of events) {
    if (!byRequestId.has(event.requestId)) {
      byRequestId.set(event.requestId, []);
    }
    byRequestId.get(event.requestId)!.push(event);
  }

  return Array.from(byRequestId.entries()).map(
    ([requestId, turnEvents], index) => {
      const sorted = [...turnEvents].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      const timestamps = sorted.map((e) => new Date(e.timestamp).getTime());
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      const totalDuration = Math.max(maxTime - minTime, 1);

      const pairedEndIds = new Set<string>();
      const rows: WaterfallRow[] = [];

      for (const event of sorted) {
        if (event.type === AISessionEventType.AI_DURATION) {
          const startTime = new Date(event.timestamp).getTime();
          rows.push({
            key: event.eventId,
            label: event.description,
            category: 'other',
            startPct: ((startTime - minTime) / totalDuration) * 100,
            widthPct: Math.max((event.duration / totalDuration) * 100, 0.5),
            durationMs: event.duration,
          });
          continue;
        }

        if (!START_TYPES.has(event.type)) continue;

        const startTime = new Date(event.timestamp).getTime();
        const endEvent = sorted.find(
          (e) =>
            END_TYPES.has(e.type) &&
            e.parentEventId === event.eventId &&
            !pairedEndIds.has(e.eventId),
        );

        if (!endEvent) continue;

        pairedEndIds.add(endEvent.eventId);
        const explicitDurationMs =
          'durationMs' in endEvent
            ? (endEvent.durationMs as number | undefined)
            : undefined;
        const durationMs =
          explicitDurationMs ??
          new Date(endEvent.timestamp).getTime() - startTime;

        rows.push({
          key: event.eventId,
          label: getLabel(event),
          category: getCategory(event.type),
          startPct: ((startTime - minTime) / totalDuration) * 100,
          widthPct: Math.max((durationMs / totalDuration) * 100, 0.5),
          durationMs,
        });
      }

      // Second pass: confirmation pauses (TOOL_PAUSED → TOOL_RESUMED)
      for (const event of sorted) {
        if (event.type !== AISessionEventType.TOOL_PAUSED) continue;
        const pauseStart = new Date(event.timestamp).getTime();
        const resumeEvent = sorted.find(
          (e) =>
            e.type === AISessionEventType.TOOL_RESUMED &&
            e.pausedEventId === event.eventId,
        );
        if (!resumeEvent) continue;
        const durationMs =
          new Date(resumeEvent.timestamp).getTime() - pauseStart;
        rows.push({
          key: `pause-tool-${event.eventId}`,
          label: `User confirmation: ${event.tool}`,
          category: 'confirmation',
          startPct: ((pauseStart - minTime) / totalDuration) * 100,
          widthPct: Math.max((durationMs / totalDuration) * 100, 0.5),
          durationMs,
        });
      }

      // Second pass: confirmation pauses (ASSISTANT_PAUSED → ASSISTANT_RESUMED)
      for (const event of sorted) {
        if (event.type !== AISessionEventType.ASSISTANT_PAUSED) continue;
        const pauseStart = new Date(event.timestamp).getTime();
        const resumeEvent = sorted.find(
          (e) =>
            e.type === AISessionEventType.ASSISTANT_RESUMED &&
            e.parentEventId === event.eventId,
        );
        if (!resumeEvent) continue;
        const durationMs =
          new Date(resumeEvent.timestamp).getTime() - pauseStart;
        rows.push({
          key: `pause-assistant-${event.eventId}`,
          label: 'User confirmation',
          category: 'confirmation',
          startPct: ((pauseStart - minTime) / totalDuration) * 100,
          widthPct: Math.max((durationMs / totalDuration) * 100, 0.5),
          durationMs,
        });
      }

      rows.sort((a, b) => a.startPct - b.startPct);

      return { requestId, tabLabel: `Turn ${index + 1}`, rows };
    },
  );
}

const Legend: FC<{ rows: WaterfallRow[] }> = ({ rows }) => {
  const present = Array.from(new Set(rows.map((r) => r.category)));
  return (
    <div className={styles.legend}>
      {present.map((category) => (
        <div key={category} className={styles.legendItem}>
          <span
            className={styles.legendSwatch}
            style={{ backgroundColor: CATEGORY_COLORS[category] }}
          />
          <span className={styles.legendLabel}>
            {CATEGORY_LABELS[category]}
          </span>
        </div>
      ))}
    </div>
  );
};

const WaterfallChart: FC<{
  rows: WaterfallRow[];
  onRowClick: (key: string) => void;
}> = ({ rows, onRowClick }) => {
  if (!rows.length) {
    return <div className={styles.empty}>No events to display</div>;
  }

  return (
    <div className={styles.chart}>
      {rows.map((row) => (
        <div key={row.key} className={styles.row}>
          <div className={styles.rowLabel} title={row.label}>
            {row.label}
          </div>
          <div className={styles.rowTrack}>
            <div
              className={styles.bar}
              style={{
                left: `${row.startPct}%`,
                width: `${row.widthPct}%`,
                backgroundColor: CATEGORY_COLORS[row.category],
              }}
              onClick={() => onRowClick(row.key)}
            />
            <span
              className={styles.durationLabel}
              style={{ left: `${row.startPct + row.widthPct}%` }}
            >
              {row.durationMs}ms
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

interface SessionWaterfallProps {
  events: AISessionEvent[];
}

export const SessionWaterfall: FC<SessionWaterfallProps> = ({ events }) => {
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);

  useEffect(() => {
    setActiveRequestId(null);
    setSelectedRowKey(null);
  }, [events]);

  const turns = useMemo(() => buildTurns(events), [events]);

  const currentId = activeRequestId ?? turns[0]?.requestId ?? null;
  const currentTurn = turns.find((t) => t.requestId === currentId) ?? null;

  const selectedRow =
    currentTurn?.rows.find((r) => r.key === selectedRowKey) ?? null;
  const selectedEvent =
    events.find((e) => e.eventId === selectedRowKey) ?? null;

  if (!turns.length) {
    return <div className={styles.empty}>No events</div>;
  }

  return (
    <div className={styles.container}>
      <Tabs
        activeKey={currentId ?? undefined}
        onChange={setActiveRequestId}
        items={turns.map((t) => ({ key: t.requestId, label: t.tabLabel }))}
      />
      {currentTurn && (
        <>
          <Legend rows={currentTurn.rows} />
          <WaterfallChart
            rows={currentTurn.rows}
            onRowClick={setSelectedRowKey}
          />
        </>
      )}
      <AnimatePresence>
        {selectedRow && (
          <EventDetailModal
            key={selectedRowKey}
            row={selectedRow}
            event={selectedEvent}
            onClose={() => setSelectedRowKey(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
