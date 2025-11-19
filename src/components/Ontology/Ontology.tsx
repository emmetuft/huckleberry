import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, FloatButton, Tooltip } from 'antd';
import {
  ExportOutlined,
  PlusSquareOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import styles from './Ontology.module.scss';
import { useAppDispatch } from 'reducers';
import {
  selectGraphData,
  selectNodeLabels,
  selectLoading,
} from 'reducers/ontology/slice';
import {
  fetchGraphFromNeo4j,
  fetchAllNodeLabels,
} from 'reducers/ontology/actions';
import { Neo4jNode } from 'models/interfaces/ontology';
import { OntologyInitModal } from './OntologyInitModal/OntologyInitModal';
import { ForceGraph } from './ForceGraph3d';
import { NodeDrawer } from './NodeDrawer';
import { SearchBar } from './SearchBar/SearchBar';

interface OntologyProps {}

export const Ontology: FC<OntologyProps> = ({}) => {
  const dispatch = useAppDispatch();
  const graphData = useSelector(selectGraphData);
  const nodeLabels = useSelector(selectNodeLabels);
  const loading = useSelector(selectLoading);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [initModalOpen, setInitModalOpen] = useState<boolean>(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(
    null,
  );
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Fetch graph and nodes from Neo4j when component mounts
  useEffect(() => {
    dispatch(fetchGraphFromNeo4j());

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

  const onNodeClick = useCallback((node: Neo4jNode) => {
    setSelectedNode(node.id);
    setDrawerOpen(true);
  }, []);

  const onClickAddNode = () => {
    setDrawerOpen(true);
  };

  const onRefreshGraph = () => {
    dispatch(fetchGraphFromNeo4j({ forceRefresh: true }));
  };

  const handleNodeFound = (node: Neo4jNode) => {
    setHighlightedNodeId(node.id);
  };

  const handleSearchClear = () => {
    setHighlightedNodeId(null);
  };

  const handleLabelFilterChange = (labels: string[]) => {
    setSelectedLabels(labels);
    // Clear highlighted node when filter changes to prevent issues with filtered-out nodes
    setHighlightedNodeId(null);
  };

  // Filter graph data based on selected labels
  const filteredGraphData = useMemo(() => {
    if (selectedLabels.length === 0) {
      return graphData;
    }

    // Filter nodes that have at least one of the selected labels
    const filteredNodes = graphData.nodes.filter((node) =>
      node.labels.some((label) => selectedLabels.includes(label)),
    );

    // Get IDs of filtered nodes
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

    // Filter relationships to only include those between filtered nodes
    const filteredRelationships = graphData.relationships.filter(
      (rel) =>
        filteredNodeIds.has(rel.source) && filteredNodeIds.has(rel.target),
    );

    return {
      nodes: filteredNodes,
      relationships: filteredRelationships,
    };
  }, [graphData, selectedLabels]);

  return (
    <div className={styles.Ontology}>
      {loading.fetchGraph ? (
        <div className={styles.emptyWrapper}>
          <h3>Loading graph from Neo4j...</h3>
        </div>
      ) : graphData.nodes.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <h3>It's empty in here!</h3>
          <Button type="primary" onClick={() => setInitModalOpen(true)}>
            Let's get cooking
          </Button>
        </div>
      ) : (
        <>
          <SearchBar
            nodes={graphData.nodes}
            highlightedNodeId={highlightedNodeId}
            onNodeFound={handleNodeFound}
            onSearchClear={handleSearchClear}
            onLabelFilterChange={handleLabelFilterChange}
          />
          <ForceGraph
            data={filteredGraphData}
            highlightedNodeId={highlightedNodeId}
            onNodeClick={onNodeClick}
          />
        </>
      )}

      <FloatButton.Group shape="square" placement="top">
        <FloatButton
          icon={
            <Tooltip title="Add node" placement="left">
              <PlusSquareOutlined />
            </Tooltip>
          }
          onClick={onClickAddNode}
        />
        <FloatButton
          icon={
            <Tooltip title="Refresh graph" placement="left">
              <ReloadOutlined />
            </Tooltip>
          }
          onClick={onRefreshGraph}
        />
        <FloatButton
          icon={
            <Tooltip title="Export graph" placement="left">
              <ExportOutlined />
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
