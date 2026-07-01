import { FC } from 'react';
import { FlowArrowIcon } from '@phosphor-icons/react';
import { Tag } from 'antd';
import styles from './Workflows.module.css';
import { Workflow } from 'models/interfaces/workflow';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { isEmpty } from 'utils/misc';

interface WorkflowCardProps {
  workflow: Workflow;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const WorkflowCard: FC<WorkflowCardProps> = ({ workflow }) => {
  const now = Date.now();
  const isNew =
    workflow.createDate &&
    now - new Date(workflow.createDate).getTime() < ONE_WEEK_MS;
  const isUpdated =
    workflow.lastModified &&
    now - new Date(workflow.lastModified).getTime() < ONE_WEEK_MS;

  return (
    <div className="appCard">
      {workflow.iconUrl ? (
        <img src={workflow.iconUrl} height="100%" width="100%" />
      ) : (
        <div className={styles.workflowIcon}>
          <FlowArrowIcon color="var(--background)" size={18} />
        </div>
      )}
      <div className="appInfo">
        <div className={styles.workflowDetails}>
          <h4>{workflow.name}</h4>
          {isNew ? (
            <Tag className="defaultTag">New</Tag>
          ) : isUpdated ? (
            <Tag>Updated</Tag>
          ) : null}
        </div>
        <p>
          {isEmpty(workflow.description)
            ? 'No description'
            : workflow.description}
        </p>
        <div className={styles.workflowDetails}>
          <Avatar
            userId={workflow.ownedById}
            name={workflow.ownedByName}
            showName={!!workflow.ownedByName}
            height={16}
          />
          {/* <p>{workflow.trigger}</p> */}
        </div>
      </div>
    </div>
  );
};
