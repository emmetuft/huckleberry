import { FC, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRightIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { Button, Checkbox, Drawer, Input, Select } from 'antd';
import styles from './ModelEditor.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectGraphModelData,
  updateGraphEditorModel,
} from 'reducers/ontology/slice';
import {
  GraphEditorModel,
  GraphProperty,
  isRelationshipModel,
} from 'models/interfaces/ontology';
import { GraphDataType, GraphDataTypes } from 'models/enums/graphDataType';
import { getColorForGroup } from 'utils/styles';

const RelationshipConnection: FC<{
  fromNodeId: string;
  toNodeId: string;
  text?: string;
}> = ({ fromNodeId, toNodeId, text }) => {
  const { nodes } = useSelector(selectGraphModelData);
  const getNodeColor = useCallback(
    (nodeId: string) => {
      const index = nodes.findIndex((n) => n.id === nodeId);
      return getColorForGroup(index >= 0 ? index : 0);
    },
    [nodes],
  );
  const getLabel = (nodeId: string) =>
    nodes.find((n) => n.id === nodeId)?.label || nodeId;

  return (
    <div className={styles.connection}>
      <div
        className={styles.nodeLabel}
        style={
          { '--node-color': getNodeColor(fromNodeId) } as React.CSSProperties
        }
      >
        {getLabel(fromNodeId)}
      </div>
      <ArrowRightIcon size={14} color="var(--grey-text)" />
      {text && (
        <>
          <span className={styles.relationshipName}>{text}</span>
          <ArrowRightIcon size={14} color="var(--grey-text)" />
        </>
      )}
      <div
        className={styles.nodeLabel}
        style={
          { '--node-color': getNodeColor(toNodeId) } as React.CSSProperties
        }
      >
        {getLabel(toNodeId)}
      </div>
    </div>
  );
};

interface ModelEditorProps {
  model: GraphEditorModel;
  open: boolean;
  onClose: () => void;
}

export const ModelEditor: FC<ModelEditorProps> = ({ model, open, onClose }) => {
  const dispatch = useAppDispatch();
  const { edges } = useSelector(selectGraphModelData);

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );

  const onModelChange = (updatedModel: GraphEditorModel) => {
    dispatch(updateGraphEditorModel(updatedModel));
  };

  const handleAddProperty = () => {
    onModelChange({
      ...model,
      properties: [
        ...model.properties,
        { name: '', type: GraphDataType.STRING },
      ],
    });
  };

  const handleToggle = (index: number, checked: boolean) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      checked ? next.add(index) : next.delete(index);
      return next;
    });
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedIndices(
      checked ? new Set(model.properties.map((_, i) => i)) : new Set(),
    );
  };

  const handlePropertyChange = (
    index: number,
    patch: Partial<GraphProperty>,
  ) => {
    onModelChange({
      ...model,
      properties: model.properties.map((p, i) =>
        i === index ? { ...p, ...patch } : p,
      ),
    });
  };

  const handleDeleteSelected = () => {
    onModelChange({
      ...model,
      properties: model.properties.filter((_, i) => !selectedIndices.has(i)),
    });
    setSelectedIndices(new Set());
  };

  const allChecked =
    model.properties.length > 0 &&
    selectedIndices.size === model.properties.length;
  const someChecked = selectedIndices.size > 0;
  const deleteLabel =
    selectedIndices.size === 1
      ? 'Delete 1 property'
      : `Delete ${selectedIndices.size} properties`;

  const isRelationship = isRelationshipModel(model);

  const drawerTitle = isRelationship ? (
    <p>Model relationship</p>
  ) : (
    <p>Model node</p>
  );

  return (
    <Drawer
      title={drawerTitle}
      mask={false}
      width={500}
      open={open}
      onClose={onClose}
    >
      <div className={styles.ModelEditor}>
        {isRelationship ? (
          <div className={styles.section}>
            <h4>Relationship</h4>
            <Input
              value={model.name}
              placeholder="Relationship type"
              onChange={(e) =>
                onModelChange({ ...model, name: e.target.value })
              }
            />
            <RelationshipConnection
              fromNodeId={model.fromNodeId}
              toNodeId={model.toNodeId}
            />
          </div>
        ) : (
          <div className={styles.section}>
            <h4>Label</h4>
            <Input
              value={model.label}
              onChange={(e) =>
                onModelChange({ ...model, label: e.target.value })
              }
            />
          </div>
        )}
        <div className={styles.section}>
          <h4>Properties</h4>
          <div className={`${styles.properties} ${styles.propertyContainer}`}>
            <div className={styles.propertyHeader}>
              <Checkbox
                checked={allChecked}
                indeterminate={someChecked && !allChecked}
                onChange={(e) => handleToggleAll(e.target.checked)}
              />
              <span className={styles.nameCol}>Name</span>
              <span className={styles.typeCol}>Type</span>
            </div>
            {model.properties.map((property, index) => (
              <div key={index} className={styles.propertyItem}>
                <Checkbox
                  checked={selectedIndices.has(index)}
                  onChange={(e) => handleToggle(index, e.target.checked)}
                />
                <Input
                  value={property.name}
                  onChange={(e) =>
                    handlePropertyChange(index, { name: e.target.value })
                  }
                />
                <Select
                  value={property.type}
                  options={GraphDataTypes.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  onChange={(value) =>
                    handlePropertyChange(index, { type: value })
                  }
                />
              </div>
            ))}
            {someChecked ? (
              <Button
                type="text"
                danger
                icon={<TrashIcon />}
                onClick={handleDeleteSelected}
              >
                {deleteLabel}
              </Button>
            ) : (
              <Button
                type="text"
                icon={<PlusIcon />}
                onClick={handleAddProperty}
              >
                Add property
              </Button>
            )}
          </div>
        </div>
        {!isRelationship && (
          <div className={styles.section}>
            <h4>Relationships</h4>
            <div className={styles.relationships}>
              {edges
                .filter(
                  (e) => e.fromNodeId === model.id || e.toNodeId === model.id,
                )
                .map((edge) => (
                  <div key={edge.id}>
                    <RelationshipConnection
                      fromNodeId={edge.fromNodeId}
                      toNodeId={edge.toNodeId}
                      text={edge.name}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
