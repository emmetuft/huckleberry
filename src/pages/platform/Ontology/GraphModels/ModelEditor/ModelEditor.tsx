import { FC, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRightIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { Button, Checkbox, Input, Select } from 'antd';
import styles from './ModelEditor.module.css';
import {
  selectGraphModelData,
  selectNodeLabels,
} from 'reducers/ontology/slice';
import {
  GraphEditorModel,
  GraphProperty,
  isRelationshipModel,
} from 'models/interfaces/ontology';
import { GraphDataType, GraphDataTypes } from 'models/enums/graphDataType';
import { getColorForGroup } from 'utils/styles';

interface ModelEditorProps {
  model: GraphEditorModel;
  onModelChange: (model: GraphEditorModel) => void;
}

export const ModelEditor: FC<ModelEditorProps> = ({ model, onModelChange }) => {
  const { nodes } = useSelector(selectGraphModelData);
  const nodeLabels = useSelector(selectNodeLabels);

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );

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

  const getNodeColor = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return '#999';

      const labelIndex = nodeLabels.indexOf(node.label);
      return getColorForGroup(labelIndex);
    },
    [nodes, nodeLabels],
  );

  return (
    <div className={styles.ModelEditor}>
      {isRelationship ? (
        <div className={styles.section}>
          <h4>Relationship</h4>
          <Input
            value={isRelationshipModel(model) ? model.name : ''}
            placeholder="Relationship type"
            onChange={(e) => onModelChange({ ...model, name: e.target.value })}
          />
          <div className={styles.connection}>
            <div
              className={styles.nodeLabel}
              style={
                {
                  '--node-color': getNodeColor(model.fromNodeId),
                } as React.CSSProperties
              }
            >
              {nodes.find((n) => n.id === model.fromNodeId)?.label ||
                model.fromNodeId}
            </div>
            <ArrowRightIcon size={14} />
            <div
              className={styles.nodeLabel}
              style={
                {
                  '--node-color': getNodeColor(model.toNodeId),
                } as React.CSSProperties
              }
            >
              {nodes.find((n) => n.id === model.toNodeId)?.label ||
                model.toNodeId}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.section}>
          <h4>Label</h4>
          <Input
            value={isRelationshipModel(model) ? '' : model.label}
            onChange={(e) => onModelChange({ ...model, label: e.target.value })}
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
            <Button type="text" icon={<PlusIcon />} onClick={handleAddProperty}>
              Add property
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
