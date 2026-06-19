import { FC, useEffect, useMemo, useState } from 'react';
import { Spin, Tabs } from 'antd';
import { AnimatePresence } from 'framer-motion';
import {
  AISessionEvent,
  AISessionEventType,
} from 'models/interfaces/sessionEvent';
import styles from './SessionWaterfall.module.css';
import { EventDetailModal } from './EventDetailModal/EventDetailModal';
import { formatDuration } from 'utils/datetime';

export enum EventCategory {
  ASSISTANT = 'assistant',
  AI_SERVICE = 'aiService',
  ACTION = 'action',
  CONFIRMATION = 'confirmation',
  TOOL = 'tool',
  MCP = 'mcp',
  OTHER = 'other',
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  assistant: '#e0a030',
  aiService: '#705be7',
  action: '#bfff00',
  confirmation: '#30b8b0',
  tool: '#3a9e72',
  mcp: '#c45a4a',
  other: '#a4abc0',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  assistant: 'Assistant',
  aiService: 'AI Service',
  action: 'Action',
  confirmation: 'User Confirmation',
  tool: 'Tool',
  mcp: 'MCP',
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
  AISessionEventType.AGENT_THINKING_STARTED,
]);

const END_TYPES = new Set<AISessionEventType>([
  AISessionEventType.TOOL_COMPLETED,
  AISessionEventType.TOOL_FINISHED,
  AISessionEventType.ACTION_COMPLETED,
  AISessionEventType.AI_SERVICE_RESPONSE,
  AISessionEventType.ASSISTANT_RESPONSE,
  AISessionEventType.ASSISTANT_PAUSED,
  AISessionEventType.MCP_RESPONSE,
  AISessionEventType.AGENT_THINKING_COMPLETED,
]);

function getCategory(type: AISessionEventType): EventCategory {
  switch (type) {
    case AISessionEventType.TOOL_STARTED:
    case AISessionEventType.TOOL_COMPLETED:
    case AISessionEventType.TOOL_FINISHED:
      return EventCategory.TOOL;
    case AISessionEventType.ACTION_STARTED:
    case AISessionEventType.ACTION_COMPLETED:
      return EventCategory.ACTION;
    case AISessionEventType.AI_SERVICE_REQUEST:
    case AISessionEventType.AI_SERVICE_RESPONSE:
      return EventCategory.AI_SERVICE;
    case AISessionEventType.ASSISTANT_REQUEST:
    case AISessionEventType.ASSISTANT_RESPONSE:
    case AISessionEventType.ASSISTANT_PAUSED:
    case AISessionEventType.AGENT_THINKING_STARTED:
    case AISessionEventType.AGENT_THINKING_COMPLETED:
      return EventCategory.ASSISTANT;
    case AISessionEventType.MCP_REQUEST:
    case AISessionEventType.MCP_RESPONSE:
      return EventCategory.MCP;
    default:
      return EventCategory.OTHER;
  }
}

const TOOL_LABELS: Record<string, string> = {
  ExtendedThinkingTool: 'Extended Thinking',
  EXTENDED_THINKING: 'Extended Thinking',
  SearchTool: 'Search',
  DatasetUploadTool: 'Upload Dataset',
  DatasetCreateTool: 'Create Dataset',
  DomoSqlQueryTool: 'SQL Query',
  TEXT_TO_SQL: 'Text to SQL',
  domo_create_page: 'Create Page',
};

const SERVICE_LABELS: Record<string, string> = {
  MESSAGES: 'LLM Call',
  CHAT_COMPLETION: 'Chat Completion',
  TOOL_CALLING: 'Tool Calling',
  TEXT_TO_SQL: 'Text to SQL',
  PLANNING: 'Planning',
  CUSTOM_AGENT_TOOL_CALLING: 'Agent Tool Calling',
  MEMORY_ENTITY_EXTRACTION: 'Memory Extraction',
  MEMORY_RERANKING: 'Memory Reranking',
  MEMORY_GATE: 'Memory Gate',
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  DATASET_LOOKUP_ACTION: 'Dataset Lookup',
  DATASET_TEXT_TO_SQL_ACTION: 'Text to SQL',
  DATASET_QUERY_ACTION: 'Query Dataset',
  DATASET_CREATE_ACTION: 'Create Dataset',
  DATASET_UPLOAD_ACTION: 'Upload Dataset',
  SEARCH_ACTION: 'Search',
  EXTENDED_THINKING_ACTION: 'Extended Thinking',
};

const DURATION_LABELS: Record<string, string> = {
  CUSTOM_AGENT_TOOL_CALLING: 'Agent Tool Calling',
  EXTENDED_THINKING: 'Extended Thinking',
  MEMORY_ENTITY_EXTRACTION: 'Memory Extraction',
  MEMORY_FACT_EXTRACTION: 'Memory Fact Extraction',
  MEMORY_GATE: 'Memory Gate',
  MEMORY_RERANKING: 'Memory Reranking',
  MEMORY_RESOLUTION: 'Memory Resolution',
  SESSION_TITLE: 'Session Title',
  TEXT_TO_SQL: 'Text to SQL',
};

function getDurationCategory(description: string): EventCategory {
  const key = description.startsWith('runTool: ')
    ? description.slice('runTool: '.length)
    : description;
  const toolCategories: Record<string, EventCategory> = {
    ExtendedThinkingTool: EventCategory.ASSISTANT,
    EXTENDED_THINKING: EventCategory.ASSISTANT,
    SearchTool: EventCategory.TOOL,
    DatasetUploadTool: EventCategory.TOOL,
    DatasetCreateTool: EventCategory.TOOL,
    DomoSqlQueryTool: EventCategory.ACTION,
    TEXT_TO_SQL: EventCategory.ACTION,
    domo_create_page: EventCategory.TOOL,
    CUSTOM_AGENT_TOOL_CALLING: EventCategory.ACTION,
    MEMORY_ENTITY_EXTRACTION: EventCategory.AI_SERVICE,
    MEMORY_FACT_EXTRACTION: EventCategory.AI_SERVICE,
    MEMORY_GATE: EventCategory.AI_SERVICE,
    MEMORY_RERANKING: EventCategory.AI_SERVICE,
    MEMORY_RESOLUTION: EventCategory.AI_SERVICE,
  };
  return toolCategories[key] ?? EventCategory.OTHER;
}

function getDurationLabel(description: string): string {
  if (description.startsWith('runTool: ')) {
    const tool = description.slice('runTool: '.length);
    return TOOL_LABELS[tool] ?? tool;
  }
  return DURATION_LABELS[description] ?? description;
}

function getLabel(event: AISessionEvent): string {
  switch (event.type) {
    case AISessionEventType.TOOL_STARTED:
      return TOOL_LABELS[event.tool] ?? event.tool;
    case AISessionEventType.ACTION_STARTED:
      return (
        ACTION_TYPE_LABELS[event.actionType] ??
        TOOL_LABELS[event.tool] ??
        event.tool
      );
    case AISessionEventType.AI_SERVICE_REQUEST:
      return SERVICE_LABELS[event.service] ?? event.service;
    case AISessionEventType.ASSISTANT_REQUEST:
      return `User: ${event.request.input.slice(0, 40)}`;
    case AISessionEventType.AGENT_THINKING_STARTED:
      return 'Thinking';
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
      const rawBars: Array<{
        key: string;
        label: string;
        category: EventCategory;
        startMs: number;
        durationMs: number;
      }> = [];

      for (const event of sorted) {
        if (event.type === AISessionEventType.AI_DURATION) {
          const startTime = new Date(event.timestamp).getTime();
          rawBars.push({
            key: event.eventId,
            label: getDurationLabel(event.description),
            category: getDurationCategory(event.description),
            startMs: startTime - minTime,
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

        rawBars.push({
          key: event.eventId,
          label: getLabel(event),
          category: getCategory(event.type),
          startMs: startTime - minTime,
          durationMs,
        });
      }

      // Confirmation pauses (TOOL_PAUSED → TOOL_RESUMED)
      for (const event of sorted) {
        if (event.type !== AISessionEventType.TOOL_PAUSED) continue;
        const pauseStart = new Date(event.timestamp).getTime();
        const resumeEvent = sorted.find(
          (e) =>
            e.type === AISessionEventType.TOOL_RESUMED &&
            e.pausedEventId === event.eventId,
        );
        if (!resumeEvent) continue;
        rawBars.push({
          key: `pause-tool-${event.eventId}`,
          label: `User confirmation: ${event.tool}`,
          category: EventCategory.CONFIRMATION,
          startMs: pauseStart - minTime,
          durationMs: new Date(resumeEvent.timestamp).getTime() - pauseStart,
        });
      }

      // Confirmation pauses (ASSISTANT_PAUSED → ASSISTANT_RESUMED)
      for (const event of sorted) {
        if (event.type !== AISessionEventType.ASSISTANT_PAUSED) continue;
        const pauseStart = new Date(event.timestamp).getTime();
        const resumeEvent = sorted.find(
          (e) =>
            e.type === AISessionEventType.ASSISTANT_RESUMED &&
            e.parentEventId === event.eventId,
        );
        if (!resumeEvent) continue;
        rawBars.push({
          key: `pause-assistant-${event.eventId}`,
          label: 'User confirmation',
          category: EventCategory.CONFIRMATION,
          startMs: pauseStart - minTime,
          durationMs: new Date(resumeEvent.timestamp).getTime() - pauseStart,
        });
      }

      // Use actual max end time as denominator so no bar can exceed 100%.
      const effectiveDuration = Math.max(
        rawBars.reduce(
          (max, b) => Math.max(max, b.startMs + b.durationMs),
          totalDuration,
        ),
        1,
      );

      const rows: WaterfallRow[] = rawBars
        .map((b) => ({
          key: b.key,
          label: b.label,
          category: b.category,
          startPct: (b.startMs / effectiveDuration) * 100,
          widthPct: Math.max((b.durationMs / effectiveDuration) * 100, 0.5),
          durationMs: b.durationMs,
        }))
        .sort((a, b) => a.startPct - b.startPct);

      return { requestId, tabLabel: `Turn ${index + 1}`, rows };
    },
  );
}

const Legend: FC<{ rows: WaterfallRow[] }> = ({ rows }) => (
  <div className={styles.legend}>
    {Object.values(EventCategory).map((category) => (
      <div key={category} className={styles.legendItem}>
        <span
          className={styles.legendSwatch}
          style={{ backgroundColor: CATEGORY_COLORS[category] }}
        />
        <span className={styles.legendLabel}>{CATEGORY_LABELS[category]}</span>
      </div>
    ))}
  </div>
);

const WaterfallChart: FC<{
  rows: WaterfallRow[];
  onRowClick: (key: string) => void;
}> = ({ rows, onRowClick }) => {
  if (!rows.length) {
    return <div className={styles.empty}>No events to display</div>;
  }

  return (
    <div className={styles.chart}>
      {rows.map((row) => {
        const safeStart = Math.min(Math.max(row.startPct, 0), 100);
        const safeWidth = Math.min(row.widthPct, 100 - safeStart);
        return (
          <div key={row.key} className={styles.row}>
            <div className={styles.rowLabel} title={row.label}>
              {row.label}
            </div>
            <div className={styles.rowTrack}>
              <div
                className={styles.bar}
                style={{
                  left: `${safeStart}%`,
                  width: `${safeWidth}%`,
                  backgroundColor: CATEGORY_COLORS[row.category],
                }}
                onClick={() => onRowClick(row.key)}
              >
                <span className={styles.durationLabel}>
                  {formatDuration(row.durationMs)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface SessionWaterfallProps {
  events: AISessionEvent[];
  loading: boolean;
}

export const SessionWaterfall: FC<SessionWaterfallProps> = ({
  events,
  loading,
}) => {
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

  if (loading) {
    return (
      <div className={styles.empty}>
        <Spin size="large" />
      </div>
    );
  }

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
