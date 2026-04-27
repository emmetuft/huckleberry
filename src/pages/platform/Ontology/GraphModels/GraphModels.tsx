import { FC, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { FloatButton, Tooltip } from 'antd';
import { ExportIcon, PlusCircleIcon } from '@phosphor-icons/react';
import styles from './GraphModels.module.css';
import { useAppDispatch } from 'reducers';
import { selectGraphModelData, undoGraphModel } from 'reducers/ontology/slice';
import {
  upsertModelNode,
  deleteModelNode,
  upsertModelRelationship,
  deleteModelRelationship,
} from 'reducers/ontology/actions';
import {
  GraphEditorModel,
  GraphRelationshipModel,
} from 'models/interfaces/ontology';
import { ModelCanvas } from './ModelCanvas/ModelCanvas';
import { ModelEditor } from './ModelEditor/ModelEditor';

interface GraphModelsProps {}

export const GraphModels: FC<GraphModelsProps> = ({}) => {
  const dispatch = useAppDispatch();
  const { nodes: models, edges: relationships } =
    useSelector(selectGraphModelData);

  const [selectedId, setSelectedId] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const selectedItem: GraphEditorModel | undefined =
    relationships.find((r) => r.id === selectedId) ??
    models.find((m) => m.id === selectedId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        dispatch(undoGraphModel());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  const handleSelectModel = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

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
    setDrawerOpen(true);
  };

  const handleCreateNode = (
    nodeId: string,
    relId: string,
    fromNodeId: string,
    position: { x: number; y: number },
  ) => {
    dispatch(
      upsertModelNode({
        id: nodeId,
        label: 'New Node',
        properties: [],
        position,
      }),
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
    setDrawerOpen(true);
  };

  const handleMoveNode = (
    nodeId: string,
    position: { x: number; y: number },
  ) => {
    const model = models.find((m) => m.id === nodeId);
    if (model) dispatch(upsertModelNode({ ...model, position }));
  };

  const handleDeleteNode = (nodeId: string) => {
    dispatch(deleteModelNode(nodeId));
    if (selectedId === nodeId) {
      setDrawerOpen(false);
      setSelectedId('');
    }
  };

  const handleDeleteRelationship = (relId: string) => {
    dispatch(deleteModelRelationship(relId));
    if (selectedId === relId) {
      setDrawerOpen(false);
      setSelectedId('');
    }
  };

  const onClickAddNode = () => {
    const nodeId = uuidv4();
    dispatch(
      upsertModelNode({ id: nodeId, label: 'New Node', properties: [] }),
    );
    setSelectedId(nodeId);
    setDrawerOpen(true);
  };

  return (
    <div className={styles.GraphModels}>
      <ModelCanvas
        models={models}
        relationships={relationships}
        selectedModelId={selectedId}
        onSelectModel={handleSelectModel}
        onCreateRelationship={handleCreateRelationship}
        onCreateNode={handleCreateNode}
        onMoveNode={handleMoveNode}
        onDeleteNode={handleDeleteNode}
        onDeleteRelationship={handleDeleteRelationship}
      />
      {selectedItem && (
        <ModelEditor
          key={selectedId}
          model={selectedItem}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
      <FloatButton.Group shape="square">
        <FloatButton
          icon={
            <Tooltip title="Add node" placement="left">
              <PlusCircleIcon />
            </Tooltip>
          }
          onClick={onClickAddNode}
        />
        <FloatButton
          icon={
            <Tooltip title="Export graph" placement="left">
              <ExportIcon />
            </Tooltip>
          }
        />
      </FloatButton.Group>
    </div>
  );
};
