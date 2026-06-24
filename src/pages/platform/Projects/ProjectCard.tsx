import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import styles from './Projects.module.css';
import { Project } from 'constants/projects';
import { platformRoutePaths, AppPage } from 'models/enums/appPage';
import { Avatar } from 'components/shared/Avatar/Avatar';

interface ProjectCardProps {
  project: Project;
}

const STATUS_CLASSES: Record<Project['status'], string> = {
  active: styles.statusActive,
  completed: styles.statusCompleted,
  'on-hold': styles.statusOnHold,
  archived: styles.statusArchived,
};

const STATUS_LABELS: Record<Project['status'], string> = {
  active: 'Active',
  completed: 'Completed',
  'on-hold': 'On Hold',
  archived: 'Archived',
};

export const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const onClick = () => {
    navigate(
      platformRoutePaths[AppPage.PROJECT_DETAIL].replace(':id', project.id),
    );
  };

  return (
    <div className={`card ${styles.projectCard}`} onClick={onClick}>
      <div
        className={styles.cardAccent}
        style={{ backgroundColor: project.color }}
      />
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h4 className={styles.projectName}>{project.name}</h4>
          <Tag className={STATUS_CLASSES[project.status]}>
            {STATUS_LABELS[project.status]}
          </Tag>
        </div>
        <p className={styles.projectDescription}>{project.description}</p>
        <div className={styles.tags}>
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className={styles.cardFooter}>
          <Avatar
            userId={project.ownerId}
            name={project.ownerName}
            showName
            height={20}
          />
        </div>
      </div>
    </div>
  );
};
