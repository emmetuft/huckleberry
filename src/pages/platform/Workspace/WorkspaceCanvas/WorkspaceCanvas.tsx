import { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Edge,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { FloatButton, Input } from 'antd';
import { MinusIcon, PlusIcon } from '@phosphor-icons/react';
import styles from './WorkspaceCanvas.module.css';
import { selectTheme } from 'reducers/app/slice';
import {
  selectSpaceById,
  selectCanvasesBySpaceId,
} from 'reducers/spaces/slice';
import { CanvasNodeType } from 'models/enums/nodeType';
import { CanvasNode } from 'models/interfaces/canvasNode';
import { platformRoutePaths, AppPage } from 'models/enums/appPage';
import AppTooltip from 'components/shared/Tooltip';
import { DataSourceNode } from './Nodes/DataSourceNode';
import { GoalNode } from './Nodes/GoalNode';
import { IdeaNode } from './Nodes/IdeaNode';
import { MetricNode } from './Nodes/MetricNode';
import { PersonNode } from './Nodes/PersonNode';
import { ProjectNode } from './Nodes/ProjectNode';
import { GitHubRepoNode } from './Nodes/GitHubRepoNode';
import { DecisionNode } from './Nodes/DecisionNode';
import { AIAnalysisNode } from './Nodes/AIAnalysisNode';
import { useIsMobile } from 'hooks/useIsMobile';

const ZoomControls: FC<{ iconSize: number; isMobile: boolean }> = ({
  iconSize,
  isMobile,
}) => {
  const { zoomIn, zoomOut } = useReactFlow();
  return (
    <FloatButton.Group
      shape="square"
      style={{
        insetInlineEnd: isMobile ? 'var(--space-md)' : 'var(--space-xl)',
        insetBlockEnd: isMobile ? 'var(--space-md)' : 'var(--space-xl)',
      }}
    >
      <FloatButton
        icon={
          <AppTooltip title="Zoom in" placement="left">
            <PlusIcon size={iconSize} />
          </AppTooltip>
        }
        onClick={() => zoomIn()}
      />
      <FloatButton
        icon={
          <AppTooltip title="Zoom out" placement="left">
            <MinusIcon size={iconSize} />
          </AppTooltip>
        }
        onClick={() => zoomOut()}
      />
    </FloatButton.Group>
  );
};

const nodeTypes = {
  [CanvasNodeType.DATA_SOURCE]: DataSourceNode,
  [CanvasNodeType.PERSON]: PersonNode,
  [CanvasNodeType.PROJECT]: ProjectNode,
  [CanvasNodeType.GOAL]: GoalNode,
  [CanvasNodeType.METRIC]: MetricNode,
  [CanvasNodeType.IDEA]: IdeaNode,
  [CanvasNodeType.GITHUB_REPO]: GitHubRepoNode,
  [CanvasNodeType.DECISION]: DecisionNode,
  [CanvasNodeType.AI_ANALYSIS]: AIAnalysisNode,
};

function node(
  id: string,
  type: CanvasNodeType,
  position: { x: number; y: number },
  nodeData: unknown,
) {
  return {
    id,
    type,
    position,
    data: { id, type, data: nodeData, capabilities: {} } as CanvasNode,
  };
}

const TEMPLATE_NODES = [
  node(
    'ds-1',
    CanvasNodeType.DATA_SOURCE,
    { x: 0, y: 0 },
    {
      name: 'Salesforce CRM',
      sourceId: 'salesforce-prod',
      sourceType: 'CRM',
      rowCount: 48320,
      columnCount: 42,
      lastUpdated: 'Jun 29, 2026',
      columns: ['Account', 'Stage', 'ARR', 'Close Date'],
      sampleRows: [
        {
          Account: 'Acme Corp',
          Stage: 'Negotiation',
          ARR: '$120k',
          'Close Date': 'Jul 15',
        },
        {
          Account: 'Globex Inc',
          Stage: 'Proposal',
          ARR: '$85k',
          'Close Date': 'Jul 30',
        },
        {
          Account: 'Initech',
          Stage: 'Discovery',
          ARR: '$60k',
          'Close Date': 'Aug 10',
        },
      ],
    },
  ),
  node(
    'ds-2',
    CanvasNodeType.DATA_SOURCE,
    { x: 0, y: 360 },
    {
      name: 'Revenue Data Warehouse',
      sourceId: 'snowflake-revenue',
      sourceType: 'Data Warehouse',
      rowCount: 2100000,
      columnCount: 18,
      lastUpdated: 'Jun 29, 2026',
      columns: ['Month', 'Segment', 'Revenue', 'Churn'],
      sampleRows: [
        {
          Month: 'Apr 2026',
          Segment: 'Enterprise',
          Revenue: '$980k',
          Churn: '2.1%',
        },
        {
          Month: 'May 2026',
          Segment: 'Enterprise',
          Revenue: '$940k',
          Churn: '2.8%',
        },
        {
          Month: 'Jun 2026',
          Segment: 'Enterprise',
          Revenue: '$890k',
          Churn: '3.4%',
        },
      ],
    },
  ),
  node(
    'metric-1',
    CanvasNodeType.METRIC,
    { x: 420, y: 0 },
    {
      name: 'Q3 Committed Revenue',
      value: '$2.81M',
      unit: '',
      change: 9,
      changeDirection: 'down',
      isPositive: false,
      period: 'Q2 2026',
      lastUpdated: 'Jun 29, 2026',
      target: '$3.1M',
    },
  ),
  node(
    'metric-2',
    CanvasNodeType.METRIC,
    { x: 420, y: 260 },
    {
      name: 'Enterprise Churn Rate',
      value: '3.4%',
      unit: '',
      change: 62,
      changeDirection: 'up',
      isPositive: false,
      period: 'last quarter',
      lastUpdated: 'Jun 28, 2026',
      target: '< 2%',
    },
  ),
  node(
    'goal-1',
    CanvasNodeType.GOAL,
    { x: 760, y: 100 },
    {
      title: 'Hit Q3 Revenue Target',
      status: 'at_risk',
      description:
        'Close $3.1M in new and expansion ARR by end of September 2026.',
      targetDate: 'Sep 30, 2026',
      progress: 48,
      keyResults: [
        { label: 'Close 12 enterprise deals', complete: false },
        { label: 'Expand 8 existing accounts', complete: false },
        { label: 'Reduce churn below 2%', complete: false },
        { label: 'Ramp 3 new AEs', complete: true },
      ],
    },
  ),
  node(
    'person-1',
    CanvasNodeType.PERSON,
    { x: 1160, y: 0 },
    {
      name: 'Sarah Chen',
      role: 'VP of Sales',
      department: 'Revenue',
      email: 'sarah.chen@company.com',
      tags: ['Deal owner', 'Q3 lead'],
      initials: 'SC',
    },
  ),
  node(
    'person-2',
    CanvasNodeType.PERSON,
    { x: 1160, y: 300 },
    {
      name: 'Marcus Webb',
      role: 'Customer Success Lead',
      department: 'CS',
      email: 'marcus.webb@company.com',
      tags: ['Churn prevention'],
      initials: 'MW',
    },
  ),
  node(
    'decision-1',
    CanvasNodeType.DECISION,
    { x: 420, y: 520 },
    {
      title: 'Prioritize enterprise vs. SMB pipeline',
      status: 'reviewing',
      description:
        'With limited AE capacity in Q3, we need to decide where to focus closing efforts.',
      options: [
        {
          label: 'Double down on enterprise (higher ACV, longer cycle)',
          selected: false,
        },
        { label: 'Push SMB pipeline for faster closes', selected: false },
        { label: 'Split 70/30 enterprise-SMB', selected: true },
      ],
      decidedBy: 'Sarah Chen',
      decidedAt: 'Jun 27, 2026',
    },
  ),
  node(
    'idea-1',
    CanvasNodeType.IDEA,
    { x: 760, y: 520 },
    {
      title: 'Targeted upsell for high-intent accounts',
      status: 'exploring',
      description:
        'Use product usage signals to identify accounts ready for expansion before renewal conversations.',
      category: 'Revenue Growth',
      author: 'Marcus Webb',
      createdAt: 'Jun 25, 2026',
      tags: ['Expansion', 'CS-led', 'Q3'],
    },
  ),
  node(
    'ai-1',
    CanvasNodeType.AI_ANALYSIS,
    { x: 1160, y: 520 },
    {
      title: 'Revenue Risk Analysis',
      status: 'complete',
      summary:
        'Q3 revenue is at risk primarily due to accelerating enterprise churn and 4 large deals slipping to Q4.',
      insights: [
        'Churn has increased 62% QoQ, driven by 3 enterprise accounts citing product gaps',
        '4 deals totaling $480k have pushed close dates past Sep 30',
        'SMB pipeline is healthy but insufficient to offset enterprise shortfall',
        'Top upsell opportunity: 11 accounts with >80% feature adoption',
      ],
      model: 'claude-sonnet-4-6',
      confidence: 84,
      analyzedAt: 'Jun 29, 2026',
      sources: 6,
    },
  ),
];

export const WorkspaceCanvas: FC = () => {
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { workspaceId = '', canvasId = '' } = useParams<{
    workspaceId: string;
    canvasId: string;
  }>();

  const space = useSelector(selectSpaceById(workspaceId));
  const canvases = useSelector(selectCanvasesBySpaceId(workspaceId));
  const canvas = canvases.find((c) => c.id === canvasId);

  const [nodes, , onNodesChange] = useNodesState(TEMPLATE_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  const onConnect = useCallback(
    (params: Parameters<typeof addEdge>[0]) => {
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep }, eds),
      );
    },
    [setEdges],
  );

  const iconSize = isMobile ? 14 : 18;
  const spaceDetailPath = platformRoutePaths[AppPage.WORKSPACE_DETAIL].replace(
    ':workspaceId',
    workspaceId,
  );

  return (
    <div className={styles.workspaceCanvas}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate(spaceDetailPath)}
        >
          {space?.name ?? 'Space'}
        </button>
        {canvas && (
          <>
            <span className={styles.headerDivider}>/</span>
            <p className={styles.canvasIntent}>{canvas.intent}</p>
          </>
        )}
      </div>
      <div className={styles.infiniteCanvas}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ padding: 2 }}
        >
          <Background
            variant={BackgroundVariant.Cross}
            gap={25}
            size={2}
            color={isDark ? '#505050' : '#d3d3d3'}
            bgColor={isDark ? '#242424' : '#ffffff'}
          />
          <ZoomControls iconSize={iconSize} isMobile={isMobile} />
        </ReactFlow>
      </div>
      <div className={styles.controlPanel}>
        <Input
          placeholder="Ask the canvas to do something"
          variant="borderless"
          prefix={'>_'}
        />
      </div>
    </div>
  );
};
