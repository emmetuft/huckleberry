import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, FloatButton, Tooltip } from 'antd';
import {
  ExportOutlined,
  PlusSquareOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import styles from './Ontology.module.scss';
import { useAppDispatch } from 'reducers';
import {
  selectGraphData,
  selectNodeLabels,
  clearGraphData,
  selectLoading,
} from 'reducers/ontology/slice';
import { fetchAllNodeLabels } from 'reducers/ontology/actions';
import { Neo4jNode } from 'models/interfaces/ontology';
import { OntologyInitModal } from './OntologyInitModal/OntologyInitModal';
import { ForceGraph } from './ForceGraph3d';
import { NodeDrawer } from './NodeDrawer';
import { SearchBar } from './SearchBar/SearchBar';
import LoadingAnimation from 'components/shared/Loader/Loader';

interface OntologyProps {}

export const Ontology: FC<OntologyProps> = ({}) => {
  const dispatch = useAppDispatch();
  const graphData = useSelector(selectGraphData);
  const nodeLabels = useSelector(selectNodeLabels);
  const loading = useSelector(selectLoading).loadingNodes;

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [initModalOpen, setInitModalOpen] = useState<boolean>(false);

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

  const onNodeClick = useCallback((node: Neo4jNode) => {
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
          <ForceGraph onNodeClick={onNodeClick} />
        </>
      )}

      <SearchBar />

      <FloatButton.Group shape="square">
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
            <Tooltip title="Clear graph view" placement="left">
              <ClearOutlined />
            </Tooltip>
          }
          onClick={onClearGraph}
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
