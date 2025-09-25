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

const { TextArea } = Input;

// import graphData from './miserables.json';

interface OntologyProps {}

export const Ontology: FC<OntologyProps> = ({}) => {
  const graphData = useSelector(selectGraphData);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [addNode, setAddNode] = useState<boolean>(false);
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

  const handleChange = (value: string[]) => {
    console.log(`selected ${value}`);
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
              onChange={handleChange}
              options={[]}
            />
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Target nodes"
              onChange={handleChange}
              options={[]}
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
      <>
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
      </>
    );
  }, [selectedNode, addNode]);

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

  const selectedNodeIndex = graphData.nodes.findIndex(
    (node) => node.id === selectedNode.id,
  );
  const selectedNodeColor = nodeColors[selectedNodeIndex % nodeColors.length];

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
