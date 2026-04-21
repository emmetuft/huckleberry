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
import styles from './Ontology.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectGraphData,
  selectNodeLabels,
  clearGraphData,
  selectLoading,
} from 'reducers/ontology/slice';
import { fetchAllNodeLabels } from 'reducers/ontology/actions';
import { NODE_LABELS, PEOPLE_SKILLS_GRAPH } from 'constants/graph';
import { GraphNode } from 'models/interfaces/ontology';
import { ForceGraph } from './ForceGraph';
import { GraphLegend } from './GraphLegend/GraphLegend';
import { NodeDrawer } from './NodeDrawer';
import { OntologyInitModal } from './OntologyInitModal/OntologyInitModal';
import { GraphControls } from './GraphControls/GraphControls';
import LoadingAnimation from 'components/shared/Loader/Loader';

interface OntologyProps {}

export const Ontology: FC<OntologyProps> = ({}) => {
  const dispatch = useAppDispatch();
  // const graphData = useSelector(selectGraphData);
  const graphData = PEOPLE_SKILLS_GRAPH;
  const nodeLabels = useSelector(selectNodeLabels);
  const loading = useSelector(selectLoading).loadingNodes;

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
    <div className={styles.Ontology}>
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
      <GraphLegend labels={NODE_LABELS} />
      <FloatButton.Group shape="square">
        <FloatButton
          icon={
            <Tooltip title="Add node" placement="left">
              <PlusCircleIcon />
            </Tooltip>
          }
          onClick={onClickAddNode}
        />
        <FloatButton
          icon={
            <Tooltip title="Clear graph view" placement="left">
              <BroomIcon />
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
              {graphMode === '3d' ? <VectorTwoIcon /> : <VectorThreeIcon />}
            </Tooltip>
          }
          onClick={() => setGraphMode((m) => (m === '3d' ? '2d' : '3d'))}
        />
        <FloatButton
          icon={
            <Tooltip title="Export graph" placement="left">
              <ExportIcon />
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
