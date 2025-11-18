import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, FloatButton, Tooltip } from 'antd';
import {
  ExportOutlined,
  PlusSquareOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import styles from './Ontology.module.scss';
import { useAppDispatch } from 'reducers';
import { selectGraphData, selectLoading } from 'reducers/ontology/slice';
import { fetchGraphFromNeo4j } from 'reducers/ontology/actions';
import { Neo4jNode } from 'models/interfaces/ontology';
import { OntologyInitModal } from './OntologyInitModal/OntologyInitModal';
import { ForceGraph } from './ForceGraph3d';
import { NodeDrawer } from './NodeDrawer';
import { SearchBar } from './SearchBar/SearchBar';

interface OntologyProps {}

export const Ontology: FC<OntologyProps> = ({}) => {
  const dispatch = useAppDispatch();
  const graphData = useSelector(selectGraphData);
  const loading = useSelector(selectLoading);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [initModalOpen, setInitModalOpen] = useState<boolean>(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(
    null,
  );

  // Fetch graph from Neo4j when component mounts
  useEffect(() => {
    dispatch(fetchGraphFromNeo4j());
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
            onNodeFound={handleNodeFound}
            onSearchClear={handleSearchClear}
          />
          <ForceGraph
            data={graphData}
            onNodeClick={onNodeClick}
            highlightedNodeId={highlightedNodeId}
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
