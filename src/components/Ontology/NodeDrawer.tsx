import { FC, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Drawer, Input, List, Popover, Select } from 'antd';
import styles from './Ontology.module.scss';
import { useAppDispatch } from 'reducers';
import { selectGraphData } from 'reducers/ontology/slice';
import { getColorForGroup } from 'utils/styles';

const { TextArea } = Input;

interface NodeDrawerProps {
  selectedNode: string | null;
  drawerOpen: boolean;
  setSelectedNode: (node: string | null) => void;
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

  const [addNodeName, setAddNodeName] = useState<string>('');
  const [addNodeLabel, setAddNodeLabel] = useState<string>();
  const [addNodeSources, setAddNodeSources] = useState<string[]>([]);
  const [addRelationshipType, setAddRelationshipType] = useState<string>();
  const [addNodeTargets, setAddNodeTargets] = useState<string[]>([]);

  // Create label to group index mapping
  const labelToGroupMap = useMemo(() => {
    const map = new Map<string, number>();
    let groupCounter = 0;

    graphData.nodes.forEach((node) => {
      const primaryLabel = node.labels[0] || 'Unknown';
      if (!map.has(primaryLabel)) {
        map.set(primaryLabel, groupCounter++);
      }
    });
    return map;
  }, [graphData.nodes]);

  const node = useMemo(() => {
    const node = graphData.nodes.find((n) => n.id === selectedNode);
    return node || null;
  }, [selectedNode]);

  const relationshipTypes = useMemo(() => {
    const types = Array.from(
      new Set(graphData.relationships.map((rel) => rel.type)),
    );
    return types;
  }, [graphData]);

  const relatedLinks = useMemo(
    () =>
      graphData.relationships.filter(
        (rel) => rel.source === selectedNode || rel.target === selectedNode,
      ),
    [graphData.relationships, selectedNode],
  );

  const onChangeLabel = (value: string) => {
    setAddNodeLabel(value);
  };

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
    [graphData.nodes],
  );

  const getNodeColor = useCallback(
    (nodeId: string) => {
      const node = graphData.nodes.find((n) => n.id === nodeId);
      if (!node) return '#999';

      const primaryLabel = node.labels[0] || 'Unknown';
      const groupIndex = labelToGroupMap.get(primaryLabel) ?? 0;
      return getColorForGroup(groupIndex);
    },
    [graphData.nodes, labelToGroupMap],
  );

  const drawerContent = useMemo(() => {
    if (node) {
      return (
        <div className={styles.drawerContent}>
          <div className={styles.section}>
            <h4>Properties</h4>
            <div className={styles.properties}>
              {Object.keys(node.properties).map((key) => (
                <div key={key} className={styles.propertyItem}>
                  <strong>{key}:</strong> {String(node.properties[key])}
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
                      color: getNodeColor(link.source),
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedNode(link.source)}
                  >
                    {getNodeDisplayName(link.source)}
                  </span>
                  <span>{'-'}</span>
                  <Popover
                    content={
                      <div className={styles.properties}>
                        {Object.keys(link.properties).map((key) => (
                          <div key={key} className={styles.propertyItem}>
                            <strong>{key}:</strong>{' '}
                            {String(link.properties[key])}
                          </div>
                        ))}
                      </div>
                    }
                    title="Properties"
                    placement="bottom"
                  >
                    <div>{link.type}</div>
                  </Popover>
                  <span>{'→'}</span>
                  <span
                    style={{
                      color: getNodeColor(link.target),
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedNode(link.target)}
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
          <Input
            value={addNodeName}
            onChange={(e) => setAddNodeName(e.target.value)}
          />
        </div>
        {/* <div className={styles.section}>
          <h4>Description</h4>
          <TextArea rows={3} />
        </div> */}
        <div className={styles.section}>
          <h4>Label</h4>
          <Select
            value={addNodeLabel}
            onChange={onChangeLabel}
            options={[...labelToGroupMap.keys()].map((label) => ({
              label,
              value: label,
            }))}
          />
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
  }, [
    graphData,
    node,
    addNodeName,
    addNodeLabel,
    addNodeSources,
    addNodeTargets,
    labelToGroupMap,
  ]);

  return (
    <Drawer
      title={
        node ? (
          <div className={styles.drawerHeader}>
            {getNodeDisplayName(node.id)}
            <div
              className={styles.nodeLabel}
              style={
                {
                  '--node-color': getNodeColor(node.id),
                } as React.CSSProperties
              }
            >
              {node.labels[0] || 'Unknown'}
            </div>
          </div>
        ) : (
          'Add node'
        )
      }
      mask={false}
      width={500}
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      afterOpenChange={(open) => {
        if (!open && node) setSelectedNode(null);
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
