import { FC, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Drawer, Input, List, Select } from 'antd';
import styles from './Ontology.module.scss';
import { useAppDispatch } from 'reducers';
import { selectGraphData } from 'reducers/ontology/slice';
import { Neo4jNode } from 'models/interfaces/ontology';
import { nodeColors } from 'constants/styles';

const { TextArea } = Input;

interface NodeDrawerProps {
  selectedNode: Neo4jNode | null;
  drawerOpen: boolean;
  setSelectedNode: (node: Neo4jNode | null) => void;
  setDrawerOpen: (open: boolean) => void;
}

export const NodeDrawer: FC<NodeDrawerProps> = ({
  selectedNode,
  drawerOpen,
  setSelectedNode,
  setDrawerOpen,
}) => {
  const dispatch = useAppDispatch();
  const graphData = useSelector(selectGraphData);

  const [addNodeSources, setAddNodeSources] = useState<string[]>([]);
  const [addRelationshipType, setAddRelationshipType] = useState<string>();
  const [addNodeTargets, setAddNodeTargets] = useState<string[]>([]);

  const relationshipTypes = useMemo(() => {
    const types = Array.from(
      new Set(graphData.relationships.map((rel) => rel.type)),
    );
    return types;
  }, [graphData]);

  const relatedLinks = useMemo(
    () =>
      graphData.relationships.filter(
        (rel) =>
          rel.source.toString() === selectedNode?.id.toString() ||
          rel.target.toString() === selectedNode?.id.toString(),
      ),
    [graphData.relationships, selectedNode],
  );

  const onChangeSources = (value: string[]) => {
    setAddNodeSources(value);
  };

  const onChangeRelationshipType = (value: string) => {
    setAddRelationshipType(value);
  };

  const onChangeTargets = (value: string[]) => {
    setAddNodeTargets(value);
  };

  const onClickCreateNode = () => {
    // TODO: Implement node creation logic
    setDrawerOpen(false);
  };

  const getNodeDisplayName = useCallback(
    (nodeId: string) => {
      const node = graphData.nodes.find((n) => n.id === nodeId);
      return node ? node.properties.name || node.id : nodeId;
    },
    [graphData],
  );

  const drawerContent = useMemo(() => {
    if (selectedNode) {
      return (
        <div className={styles.drawerContent}>
          <div className={styles.section}>
            <h4>Properties</h4>
            <div className={styles.properties}>
              {Object.keys(selectedNode.properties).map((key) => (
                <div key={key} className={styles.propertyItem}>
                  <strong>{key}:</strong> {String(selectedNode.properties[key])}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.section}>
            <h4>Relationships</h4>
            <List
              dataSource={relatedLinks}
              renderItem={(link) => (
                <List.Item>
                  <span
                    style={{
                      color: '#5a0cff',
                    }}
                  >
                    {getNodeDisplayName(link.source)}
                  </span>
                  <span>{'-'}</span>
                  {link.type && <span>{link.type}</span>}
                  <span>{'→'}</span>
                  <span
                    style={{
                      color: '#5a0cff',
                    }}
                  >
                    {getNodeDisplayName(link.target)}
                  </span>
                </List.Item>
              )}
            />
          </div>
        </div>
      );
    }

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
              label: node.properties.name || node.id,
              value: node.id,
            }))}
          />
          <Select
            allowClear
            style={{ width: '100%' }}
            placeholder="Relationship type"
            value={addRelationshipType}
            onChange={onChangeRelationshipType}
            options={relationshipTypes.map((type) => ({
              label: type,
              value: type,
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
              label: node.properties.name || node.id,
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
  }, [graphData, selectedNode, addNodeSources, addNodeTargets]);

  const selectedNodeColor = useMemo(() => {
    // Group nodes by their first label
    const labels = Array.from(
      new Set(graphData.nodes.map((node) => node.labels[0] || 'Unknown')),
    );
    const selectedNodeLabel = selectedNode?.labels[0] || 'Unknown';
    const selectedNodeIndex = labels.findIndex(
      (label) => label === selectedNodeLabel,
    );
    const selectedNodeColor = nodeColors[selectedNodeIndex % nodeColors.length];
    return selectedNodeColor;
  }, [graphData, selectedNode]);

  return (
    <Drawer
      title={
        selectedNode ? (
          <div className={styles.drawerHeader}>
            {getNodeDisplayName(selectedNode.id)}
            <div
              className={styles.nodeGroup}
              style={
                {
                  '--node-color': selectedNodeColor,
                } as React.CSSProperties
              }
            >
              {selectedNode.labels[0] || 'Unknown'}
            </div>
          </div>
        ) : (
          'Add node'
        )
      }
      mask={false}
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      afterOpenChange={(open) => {
        if (!open && selectedNode) setSelectedNode(null);
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
