import { FC, useState } from 'react';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { Button, Checkbox, Input, Select } from 'antd';
import styles from './ModelEditor.module.css';
import { GraphNodeModel, GraphProperty } from 'models/interfaces/ontology';
import { GraphDataType, GraphDataTypes } from 'models/enums/graphDataType';

interface ModelEditorProps {
  model: GraphNodeModel;
}

export const ModelEditor: FC<ModelEditorProps> = ({ model }) => {
  const [properties, setProperties] = useState<GraphProperty[]>(
    model.properties,
  );
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );

  const handleAddProperty = () => {
    setProperties((prev) => [
      ...prev,
      { name: '', type: GraphDataType.STRING },
    ]);
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
      checked ? new Set(properties.map((_, i) => i)) : new Set(),
    );
  };

  const handlePropertyChange = (
    index: number,
    patch: Partial<GraphProperty>,
  ) => {
    setProperties((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  };

  const handleDeleteSelected = () => {
    setProperties((prev) => prev.filter((_, i) => !selectedIndices.has(i)));
    setSelectedIndices(new Set());
  };

  const allChecked =
    properties.length > 0 && selectedIndices.size === properties.length;
  const someChecked = selectedIndices.size > 0;
  const deleteLabel =
    selectedIndices.size === 1
      ? 'Delete 1 property'
      : `Delete ${selectedIndices.size} properties`;

  return (
    <div className={styles.ModelEditor}>
      <div className={styles.section}>
        <h4>Label</h4>
        <Input value={model.label} />
      </div>
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
          {properties.map((property, index) => (
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
