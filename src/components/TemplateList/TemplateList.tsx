import { FC, useState } from 'react';

import styles from './TemplateList.module.scss';
import { Template } from 'models/interfaces/template';

interface TemplateListProps {}

export const TemplateList: FC<TemplateListProps> = ({}) => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Recommendation',
      description:
        'A template for generating recommendations based on user input.',
    },
  ]);
  return (
    <div className={styles.TemplateList}>
      {templates.map((template) => (
        <div className={styles.template}>
          <h4>{template.name}</h4>
          <p>{template.description}</p>
        </div>
      ))}
    </div>
  );
};
