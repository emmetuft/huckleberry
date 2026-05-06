import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, FloatButton, Tooltip } from 'antd';
import {
  BroomIcon,
  ExportIcon,
  PlusCircleIcon,
  VectorThreeIcon,
  VectorTwoIcon,
} from '@phosphor-icons/react';
import styles from './GraphExploration.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectGraphData,
  selectNodeLabels,
  clearGraphData,
  selectLoading,
} from 'reducers/ontology/slice';
import { fetchAllNodeLabels } from 'reducers/ontology/actions';
import { GraphNode } from 'models/interfaces/ontology';
import { ForceGraph } from './ForceGraph';
import { GraphLegend } from './GraphLegend/GraphLegend';
import { NodeDrawer } from './NodeDrawer';
import { OntologyInitModal } from './OntologyInitModal/OntologyInitModal';
import { GraphControls } from './GraphControls/GraphControls';
import LoadingAnimation from 'components/shared/Loader/Loader';
import { useIsMobile } from 'hooks/useIsMobile';

interface GraphExplorationProps {}

export const GraphExploration: FC<GraphExplorationProps> = ({}) => {
  const dispatch = useAppDispatch();
  const graphData = useSelector(selectGraphData);
  const nodeLabels = useSelector(selectNodeLabels);
  const loading = useSelector(selectLoading).loadingNodes;
  const isMobile = useIsMobile();

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [initModalOpen, setInitModalOpen] = useState<boolean>(false);
  const [graphMode, setGraphMode] = useState<'2d' | '3d'>('2d');
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string> | null>(
    null,
  );

  const filteredGraphData = useMemo(() => {
    if (!visibleNodeIds) return graphData;
    const nodes = graphData.nodes.filter((n) => visibleNodeIds.has(n.id));
    const edges = graphData.edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
    );
    return { nodes, edges };
  }, [graphData, visibleNodeIds]);

  const init = useRef<boolean>(false);

  const iconSize = isMobile ? 14 : 18;

  // Fetch node labels when component mounts
  // We no longer load the full graph - users will search/explore incrementally
  useEffect(() => {
    if (init.current) return;
    init.current = true;
    // Only fetch node labels if they don't already exist
    if (nodeLabels.length === 0) {
      dispatch(fetchAllNodeLabels());
    }
  }, []);

  useEffect(() => {
    if (graphData.nodes.length > 0 && initModalOpen) {
      setInitModalOpen(false);
    }
  }, [graphData]);

  const onNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node.id);
    setDrawerOpen(true);
  }, []);

  const onClickAddNode = () => {
    setDrawerOpen(true);
  };

  const onClearGraph = () => {
    dispatch(clearGraphData());
  };

  return (
    <div className={styles.GraphExploration}>
      {loading && <LoadingAnimation />}
      {graphData.nodes.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <h3>Search to start exploring</h3>
          <p>
            Use the search bar above to find nodes and build your graph view
          </p>
          <Button type="primary" onClick={() => setInitModalOpen(true)}>
            Or generate new ontology
          </Button>
        </div>
      ) : (
        <>
          <ForceGraph
            onNodeClick={onNodeClick}
            mode={graphMode}
            data={filteredGraphData}
          />
        </>
      )}

      <GraphControls onPlaybackChange={setVisibleNodeIds} />
      <GraphLegend labels={nodeLabels} />
      <FloatButton.Group
        shape="square"
        style={{ insetInlineEnd: 20, insetBlockEnd: 20 }}
      >
        <FloatButton
          icon={
            <Tooltip title="Add node" placement="left">
              <PlusCircleIcon size={iconSize} />
            </Tooltip>
          }
          onClick={onClickAddNode}
        />
        <FloatButton
          icon={
            <Tooltip title="Clear graph view" placement="left">
              <BroomIcon size={iconSize} />
            </Tooltip>
          }
          onClick={onClearGraph}
        />
        <FloatButton
          icon={
            <Tooltip
              title={`Switch to ${graphMode === '3d' ? '2D' : '3D'}`}
              placement="left"
            >
              {graphMode === '3d' ? (
                <VectorTwoIcon size={iconSize} />
              ) : (
                <VectorThreeIcon size={iconSize} />
              )}
            </Tooltip>
          }
          onClick={() => setGraphMode((m) => (m === '3d' ? '2d' : '3d'))}
        />
        <FloatButton
          icon={
            <Tooltip title="Export graph" placement="left">
              <ExportIcon size={iconSize} />
            </Tooltip>
          }
        />
      </FloatButton.Group>

      <NodeDrawer
        selectedNode={selectedNode}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        setSelectedNode={setSelectedNode}
      />

      <OntologyInitModal
        isOpen={initModalOpen}
        onClose={() => setInitModalOpen(false)}
      />
    </div>
  );
};
