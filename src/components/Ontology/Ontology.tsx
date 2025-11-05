import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Drawer,
  FloatButton,
  Input,
  List,
  Select,
  Tooltip,
} from 'antd';
import { ExportOutlined, PlusSquareOutlined } from '@ant-design/icons';
import styles from './Ontology.module.scss';
import { selectGraphData } from 'reducers/ontology/slice';
import { nodeColors } from 'constants/styles';
import { NodeType } from 'models/interfaces/ontology';
import ForceGraph from './ForceGraph';
import { OntologyInitModal } from './OntologyInitModal/OntologyInitModal';
import ForceGraph3DExample from './ForceGraph3d';

const { TextArea } = Input;

// import graphData from './miserables.json';

interface OntologyProps {}

export const Ontology: FC<OntologyProps> = ({}) => {
  const graphData = useSelector(selectGraphData);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [addNode, setAddNode] = useState<boolean>(false);
  const [addNodeSources, setAddNodeSources] = useState<string[]>([]);
  const [addNodeTargets, setAddNodeTargets] = useState<string[]>([]);
  const [initModalOpen, setInitModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (graphData.nodes.length > 0 && initModalOpen) {
      setInitModalOpen(false);
    }
  }, [graphData]);

  const onNodeClick = useCallback((node: NodeType) => {
    setSelectedNode(node);
    setAddNode(false);
    setDrawerOpen(true);
  }, []);

  const relatedLinks = useMemo(
    () =>
      graphData.links.filter(
        (link) =>
          link.source === selectedNode?.id || link.target === selectedNode?.id,
      ),
    [selectedNode],
  );

  const onChangeSources = (value: string[]) => {
    setAddNodeSources(value);
  };

  const onChangeTargets = (value: string[]) => {
    setAddNodeTargets(value);
  };

  const onClickCreateNode = () => {
    // TODO: Implement node creation logic
    setDrawerOpen(false);
  };

  const drawerContent = useMemo(() => {
    if (addNode) {
      return (
        <div className={styles.drawerContent}>
          <div className={styles.section}>
            <h4>Name</h4>
            <Input />
          </div>
          <div className={styles.section}>
            <h4>Description</h4>
            <TextArea rows={3} />
          </div>
          <div className={styles.section}>
            <h4>Define relationships</h4>
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Source nodes"
              value={addNodeSources}
              onChange={onChangeSources}
              options={graphData.nodes.map((node) => ({
                label: node.id,
                value: node.id,
              }))}
            />
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Target nodes"
              value={addNodeTargets}
              onChange={onChangeTargets}
              options={graphData.nodes.map((node) => ({
                label: node.id,
                value: node.id,
              }))}
            />
          </div>
          <div className={styles.buttons}>
            <Button type="primary" onClick={onClickCreateNode}>
              Save
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.drawerContent}>
        {selectedNode?.description && (
          <div className={styles.section}>
            <h4>Description</h4>
            <div className={styles.description}>
              {selectedNode?.description}
            </div>
          </div>
        )}
        <div className={styles.section}>
          <h4>Relationships</h4>
          <List
            dataSource={relatedLinks}
            renderItem={(link) => (
              <List.Item>
                <span
                  style={{
                    color:
                      link.source === selectedNode?.id ? '#5a0cff' : '#2c2b2a',
                    marginRight: '5px',
                  }}
                >
                  {link.source === selectedNode?.id ? '→' : '←'}
                </span>
                {link.source === selectedNode?.id ? link.target : link.source}
                {link.type && (
                  <span style={{ marginLeft: 8 }}>({link.type})</span>
                )}
              </List.Item>
            )}
          />
        </div>
      </div>
    );
  }, [graphData, selectedNode, addNode, addNodeSources, addNodeTargets]);

  const onClickAddNode = () => {
    setAddNode(true);
    setDrawerOpen(true);
  };

  const onDrawerChange = (open: boolean) => {
    if (!open) {
      setSelectedNode(null);
      setAddNode(false);
    }
  };

  const selectedNodeColor = useMemo(() => {
    const groups = Array.from(new Set(graphData.nodes.map((d) => d.group)));
    const selectedNodeIndex = groups.findIndex(
      (group) => group === selectedNode?.group,
    );
    const selectedNodeColor = nodeColors[selectedNodeIndex % nodeColors.length];
    return selectedNodeColor;
  }, [graphData, selectedNode]);

  return (
    <div className={styles.Ontology}>
      {graphData.nodes.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <h3>It's empty in here!</h3>
          <Button type="primary" onClick={() => setInitModalOpen(true)}>
            Let's get cooking
          </Button>
        </div>
      ) : (
        <ForceGraph data={graphData} onNodeClick={onNodeClick} />
      )}
      <ForceGraph3DExample />

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
            <Tooltip title="Export graph" placement="left">
              <ExportOutlined />
            </Tooltip>
          }
        />
      </FloatButton.Group>

      <Drawer
        title={
          selectedNode ? (
            <div className={styles.drawerHeader}>
              {selectedNode.id}
              <div
                className={styles.nodeGroup}
                style={
                  {
                    '--node-color': selectedNodeColor,
                  } as React.CSSProperties
                }
              >
                {selectedNode.group}
              </div>
            </div>
          ) : (
            'Add node'
          )
        }
        mask={false}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        afterOpenChange={onDrawerChange}
      >
        {drawerContent}
      </Drawer>

      <OntologyInitModal
        isOpen={initModalOpen}
        onClose={() => setInitModalOpen(false)}
      />
    </div>
  );
};
