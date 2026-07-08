import { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
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

  const [nodes, , onNodesChange] = useNodesState(canvas?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(canvas?.edges ?? []);

  const onConnect = useCallback(
    (params: Parameters<typeof addEdge>[0]) => {
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SimpleBezier }, eds),
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
          connectionLineType={ConnectionLineType.SimpleBezier}
          connectionMode={ConnectionMode.Loose}
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
