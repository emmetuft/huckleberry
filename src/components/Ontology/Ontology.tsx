import { FC, useCallback, useMemo, useState } from 'react';
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
import ForceGraph, { NodeType } from './ForceGraph';

const { TextArea } = Input;

import graphData from './miserables.json';

export interface GraphData {
  nodes: NodeType[];
  links: {
    source: string;
    target: string;
    type: string;
    value: number;
  }[];
}

interface OntologyProps {}

export const Ontology: FC<OntologyProps> = ({}) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [addNode, setAddNode] = useState<boolean>(false);

  const onNodeClick = useCallback((node: NodeType) => {
    setSelectedNode(node);
    setAddNode(false);
    setDrawerOpen(true);
  }, []);

  const ontologyData = graphData as GraphData;

  const relatedLinks = useMemo(
    () =>
      ontologyData.links.filter(
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

  return (
    <div className={styles.Ontology}>
      <ForceGraph data={ontologyData} onNodeClick={onNodeClick} />
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
        title={selectedNode ? selectedNode.id : 'Add node'}
        mask={false}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        afterOpenChange={onDrawerChange}
      >
        {drawerContent}
      </Drawer>
    </div>
  );
};
