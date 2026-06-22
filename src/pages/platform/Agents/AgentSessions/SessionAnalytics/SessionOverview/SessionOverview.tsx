import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Button, Tag, Tooltip as AntTooltip } from 'antd';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ClockCounterClockwiseIcon, KeyIcon } from '@phosphor-icons/react';
import styles from './SessionOverview.module.css';
import { selectAgents, selectAIModels } from 'reducers/agents/slice';
import { nodeColors } from 'constants/styles';
import { AgentSession } from 'models/interfaces/session';
import { GraphData, GraphNode } from 'models/interfaces/ontology';
import {
  AISessionEvent,
  AISessionEventType,
  ModelProviderUsage,
} from 'models/interfaces/sessionEvent';
import { formatDuration, formatCompactNumber } from 'utils/datetime';
import { ForceGraph } from 'pages/platform/Ontology/GraphExploration/ForceGraph';
import { GraphPlayback } from 'pages/platform/Ontology/GraphExploration/GraphControls/GraphPlayback/GraphPlayback';
import { buildSessionGraph } from 'utils/sessionGraph';
import { AnimatePresence, motion } from 'framer-motion';
import { NodeDetailModal } from 'pages/platform/Ontology/GraphExploration/NodeDetailModal/NodeDetailModal';
import AppTooltip from 'components/shared/Tooltip';
import { PriceEstimator } from './PriceEstimator';

interface SessionOverviewProps {
  agentSession: AgentSession | null;
  sessionEvents: AISessionEvent[];
  graphData: GraphData | null;
  loading: boolean;
}

export const SessionOverview: FC<SessionOverviewProps> = ({
  agentSession,
  sessionEvents,
  graphData: graphDataProp,
  loading,
}) => {
  const agents = useSelector(selectAgents);
  const models = useSelector(selectAIModels);
  const fallbackGraph = useMemo(
    () => buildSessionGraph(sessionEvents),
    [sessionEvents],
  );
  const graphData = graphDataProp ?? fallbackGraph;

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string> | null>(
    null,
  );
  const [playbackOpen, setPlaybackOpen] = useState<boolean>(false);

  const agent =
    agents.find((a) => a.id === agentSession?.groupEntityId) ?? null;

  const totalDuration =
    sessionEvents.length >= 2
      ? new Date(sessionEvents[0].timestamp).getTime() -
        new Date(sessionEvents[sessionEvents.length - 1].timestamp).getTime()
      : 0;

  const serviceResponseEvents = sessionEvents.filter(
    (e) => e.type === AISessionEventType.AI_SERVICE_RESPONSE,
  ) as (AISessionEvent & {
    service: string;
    serviceResponse: { modelProviderUsage?: ModelProviderUsage };
  })[];

  const totalTokens = serviceResponseEvents.reduce((sum, e) => {
    return sum + (e.serviceResponse?.modelProviderUsage?.totalTokens ?? 0);
  }, 0);

  const serviceNames = [
    ...new Set(serviceResponseEvents.map((e) => e.service)),
  ].sort();
  const serviceColorMap = Object.fromEntries(
    serviceNames.map((name, i) => [name, nodeColors[i % nodeColors.length]]),
  );

  const tokenChartData = [...serviceResponseEvents].map((e) => ({
    id: e.eventId,
    name: e.service,
    inputTokens: e.serviceResponse?.modelProviderUsage?.inputTokens ?? 0,
    outputTokens: e.serviceResponse?.modelProviderUsage?.outputTokens ?? 0,
  }));

  const filteredGraphData = useMemo(() => {
    if (!visibleNodeIds) return graphData;
    const nodes = graphData.nodes.filter((n) => visibleNodeIds.has(n.id));
    const edges = graphData.edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
    );
    return { nodes, edges };
  }, [graphData, visibleNodeIds]);

  const nodeLabels = useMemo(() => {
    const labels = new Set<string>();
    graphData.nodes.forEach((n) => n.labels.forEach((l) => labels.add(l)));
    return Array.from(labels);
  }, [graphData]);

  const handleClickCopy = () => {
    navigator.clipboard.writeText(agentSession?.id ?? '');
    toast.success('Session id copied to clipboard');
  };

  if (!agentSession) return null;

  return (
    <div className={styles.sessionOverview}>
      <div className={styles.left}>
        <div className={styles.sessionHeader}>
          <h2>{agentSession.name}</h2>
          <AntTooltip title="Copy session id">
            <Button
              shape="round"
              icon={<KeyIcon />}
              onClick={handleClickCopy}
            />
          </AntTooltip>
        </div>
        <div className={styles.tagWrapper}>
          <Tag>
            <span className={styles.tagLabel}>model</span>
            <span className={styles.tagValue}>
              {models.find((model) => model.id === agent?.model)?.name ??
                'Default'}
            </span>
          </Tag>
          <Tag>
            <span className={styles.tagLabel}>tokens</span>
            <span className={styles.tagValue}>
              {formatCompactNumber(totalTokens)}
            </span>
          </Tag>
          <Tag>
            <span className={styles.tagLabel}>duration</span>
            <span className={styles.tagValue}>
              {formatDuration(totalDuration)}
            </span>
          </Tag>
        </div>
        <PriceEstimator
          sessionEvents={serviceResponseEvents}
          loading={loading}
        />
        {tokenChartData.length > 0 && (
          <div>
            <p className={styles.chartTitle}>Token usage</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={tokenChartData}
                margin={{ left: -15, bottom: -15 }}
              >
                <XAxis
                  dataKey="id"
                  tickFormatter={(id) =>
                    tokenChartData.find((d) => d.id === id)?.name ?? id
                  }
                  tick={false}
                />
                <YAxis tickFormatter={(v) => formatCompactNumber(v)} />
                <Tooltip
                  cursor={false}
                  formatter={(v) => formatCompactNumber(v as number)}
                  labelFormatter={(id) =>
                    tokenChartData.find((d) => d.id === id)?.name ?? id
                  }
                />
                <Bar dataKey="inputTokens" stackId="a" name="Input">
                  {tokenChartData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={serviceColorMap[entry.name]}
                      fillOpacity={0.4}
                    />
                  ))}
                </Bar>
                <Bar dataKey="outputTokens" stackId="a" name="Output">
                  {tokenChartData.map((entry) => (
                    <Cell key={entry.id} fill={serviceColorMap[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className={styles.chartLegend}>
              {serviceNames.map((name) => (
                <div key={name} className={styles.chartLegendItem}>
                  <span
                    className={styles.chartLegendSwatch}
                    style={{ backgroundColor: serviceColorMap[name] }}
                  />
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.playbackWrapper}>
          <AppTooltip title="Graph playback">
            <Button
              shape="round"
              icon={<ClockCounterClockwiseIcon />}
              onClick={() => {
                setPlaybackOpen(!playbackOpen);
                setVisibleNodeIds(null);
              }}
            />
          </AppTooltip>
          <AnimatePresence>
            {playbackOpen && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ flex: 1 }}
              >
                <GraphPlayback
                  nodes={graphData.nodes}
                  isOpen={playbackOpen}
                  onPlaybackChange={setVisibleNodeIds}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ForceGraph
          data={filteredGraphData}
          mode="2d"
          dagMode="td"
          nodeLabels={nodeLabels}
          onNodeClick={setSelectedNode}
        />
        <AnimatePresence>
          {selectedNode && (
            <NodeDetailModal
              key={selectedNode.id}
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
