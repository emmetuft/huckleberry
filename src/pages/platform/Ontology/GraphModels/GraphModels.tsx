import { FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './GraphModels.module.css';
import { ModelCanvas } from './ModelCanvas/ModelCanvas';
import { ModelEditor } from './ModelEditor/ModelEditor';
import {
  GraphEditorModel,
  GraphRelationshipModel,
} from 'models/interfaces/ontology';
import {
  selectGraphModelData,
  upsertModelNode,
  deleteModelNode,
  upsertModelRelationship,
  deleteModelRelationship,
  updateGraphEditorModel,
} from 'reducers/ontology/slice';

interface GraphModelsProps {}

export const GraphModels: FC<GraphModelsProps> = ({}) => {
  const dispatch = useDispatch();
  const { nodes: models, edges: relationships } =
    useSelector(selectGraphModelData);
  const [selectedId, setSelectedId] = useState<string>('1');

  const selectedItem: GraphEditorModel =
    relationships.find((r) => r.id === selectedId) ??
    models.find((m) => m.id === selectedId) ??
    models[0];

  const handleSelectModel = (id: string) => setSelectedId(id);

  const handleCreateRelationship = (
    id: string,
    fromNodeId: string,
    toNodeId: string,
  ) => {
    const newRelationship: GraphRelationshipModel = {
      id,
      name: '',
      fromNodeId,
      toNodeId,
      properties: [],
    };
    dispatch(upsertModelRelationship(newRelationship));
    setSelectedId(id);
  };

  const handleCreateNode = (
    nodeId: string,
    relId: string,
    fromNodeId: string,
  ) => {
    dispatch(
      upsertModelNode({ id: nodeId, label: 'New Node', properties: [] }),
    );
    dispatch(
      upsertModelRelationship({
        id: relId,
        name: '',
        fromNodeId,
        toNodeId: nodeId,
        properties: [],
      }),
    );
    setSelectedId(nodeId);
  };

  const handleDeleteNode = (nodeId: string) => {
    dispatch(deleteModelNode(nodeId));
    setSelectedId((prev) =>
      prev === nodeId ? (models.find((m) => m.id !== nodeId)?.id ?? '') : prev,
    );
  };

  const handleDeleteRelationship = (relId: string) => {
    dispatch(deleteModelRelationship(relId));
    setSelectedId((prev) => (prev === relId ? (models[0]?.id ?? '') : prev));
  };

  const handleModelChange = (updated: GraphEditorModel) => {
    dispatch(updateGraphEditorModel(updated));
  };

  return (
    <div className={styles.GraphModels}>
      <ModelCanvas
        models={models}
        relationships={relationships}
        selectedModelId={selectedItem?.id ?? ''}
        onSelectModel={handleSelectModel}
        onCreateRelationship={handleCreateRelationship}
        onCreateNode={handleCreateNode}
        onDeleteNode={handleDeleteNode}
        onDeleteRelationship={handleDeleteRelationship}
      />
      <ModelEditor
        key={selectedId}
        model={selectedItem}
        onModelChange={handleModelChange}
      />
    </div>
  );
};
