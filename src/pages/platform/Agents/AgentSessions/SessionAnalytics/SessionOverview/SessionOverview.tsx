import { FC, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button, Tag, Tooltip as AntTooltip, Radio } from 'antd';
import {
  ClockCounterClockwiseIcon,
  GraphIcon,
  KeyIcon,
  TreeViewIcon,
} from '@phosphor-icons/react';
import styles from './SessionOverview.module.css';
import { AgentSession } from 'models/interfaces/session';
import { GraphData, GraphNode } from 'models/interfaces/ontology';
import {
  AISessionEvent,
  AISessionEventType,
  ModelProviderUsage,
} from 'models/interfaces/sessionEvent';
import { ForceGraph } from 'pages/platform/Ontology/GraphExploration/ForceGraph';
import { GraphPlayback } from 'pages/platform/Ontology/GraphExploration/GraphControls/GraphPlayback/GraphPlayback';
import { NodeDetailModal } from 'pages/platform/Ontology/GraphExploration/NodeDetailModal/NodeDetailModal';
import AppTooltip from 'components/shared/Tooltip';
import { PriceEstimator } from './PriceEstimator';
import { TokenChart } from './TokenChart';
import {
  formatDuration,
  formatCompactNumber,
  formatMessageTimestamp,
} from 'utils/datetime';
import { buildSessionGraph } from 'utils/sessionGraph';

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
  const fallbackGraph = useMemo(
    () => buildSessionGraph(sessionEvents),
    [sessionEvents],
  );
  const graphData = graphDataProp ?? fallbackGraph;

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string> | null>(
    null,
  );
  const [graphMode, setGraphMode] = useState<'fd' | 'dag'>('fd');
  const [playbackOpen, setPlaybackOpen] = useState<boolean>(false);

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
            <span className={styles.tagLabel}>started</span>
            <span className={styles.tagValue}>
              {formatMessageTimestamp(agentSession.created)}
            </span>
          </Tag>
          <Tag>
            <span className={styles.tagLabel}>duration</span>
            <span className={styles.tagValue}>
              {formatDuration(totalDuration)}
            </span>
          </Tag>
          <Tag>
            <span className={styles.tagLabel}>tokens</span>
            <span className={styles.tagValue}>
              {formatCompactNumber(totalTokens)}
            </span>
          </Tag>
        </div>
        <PriceEstimator
          sessionEvents={serviceResponseEvents}
          loading={loading}
        />
        {serviceResponseEvents.length > 0 && (
          <TokenChart sessionEvents={serviceResponseEvents} />
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.controlsWrapper}>
          <Radio.Group
            className={styles.radioGroup}
            value={graphMode}
            onChange={(e) => setGraphMode(e.target.value)}
            defaultValue="fd"
          >
            <Radio.Button value="fd" className={styles.radioButton}>
              <GraphIcon size={18} />
            </Radio.Button>
            <Radio.Button value="dag" className={styles.radioButton}>
              <TreeViewIcon size={18} />
            </Radio.Button>
          </Radio.Group>
          <AppTooltip title="Graph playback">
            <Button
              shape="round"
              icon={<ClockCounterClockwiseIcon size={18} />}
              onClick={() => {
                setPlaybackOpen(!playbackOpen);
                setVisibleNodeIds(null);
              }}
            />
          </AppTooltip>
          <AnimatePresence>
            {playbackOpen && (
              <motion.div
                className={styles.playbackWrapper}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
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
          dagMode={graphMode === 'dag' ? 'td' : undefined}
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
