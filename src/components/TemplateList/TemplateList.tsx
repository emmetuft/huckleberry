import { FC, useState } from 'react';

import styles from './TemplateList.module.scss';
import { Template } from 'models/interfaces/template';

interface TemplateListProps {}

export const TemplateList: FC<TemplateListProps> = ({}) => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Automate sales export',
      description:
        "You've exported the 2024 Sales Report every week for the last 2 months. Let's automate that process.",
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
