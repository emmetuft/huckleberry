import { FC } from 'react';
import styles from './GraphModels.module.css';
import { ModelCanvas } from './ModelCanvas/ModelCanvas';
import { ModelEditor } from './ModelEditor/ModelEditor';
import { GraphDataType } from 'models/enums/graphDataType';

interface GraphModelsProps {}

export const GraphModels: FC<GraphModelsProps> = ({}) => {
  const testModels = [
    {
      id: '1',
      label: 'Person',
      properties: [
        { name: 'name', type: GraphDataType.STRING },
        { name: 'location', type: GraphDataType.STRING },
        { name: 'age', type: GraphDataType.INTEGER },
      ],
    },
  ];
  return (
    <div className={styles.GraphModels}>
      <ModelCanvas />
      <ModelEditor model={testModels[0]} />
    </div>
  );
};
