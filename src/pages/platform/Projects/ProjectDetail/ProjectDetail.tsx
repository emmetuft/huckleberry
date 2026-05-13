import { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar as AntdAvatar, Button, Tag } from 'antd';
import { ArrowLeftIcon, FolderIcon } from '@phosphor-icons/react';
import { projectList } from 'constants/projects';
import { AppPage, platformRoutePaths } from 'models/enums/appPage';
import styles from './ProjectDetail.module.css';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { ProjectNotes } from './ProjectNotes';
import { ProjectFiles } from './ProjectFiles';

const STATUS_COLORS: Record<string, string> = {
  active: 'purple',
  completed: 'green',
  'on-hold': 'orange',
  archived: 'default',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  'on-hold': 'On Hold',
  archived: 'Archived',
};

export const ProjectDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const project = projectList.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="platformPage">
        <p>Project not found.</p>
      </div>
    );
  }

  return (
    <div className={`platformPage ${styles.projectDetail}`}>
      <div>
        <Button
          type="text"
          icon={<ArrowLeftIcon size={16} />}
          onClick={() => navigate(platformRoutePaths[AppPage.PROJECTS])}
        >
          Back to Projects
        </Button>
      </div>

      <div className={styles.hero} style={{ backgroundColor: project.color }}>
        <div className={styles.heroIcon}>
          <FolderIcon color="white" size={28} weight="fill" />
        </div>
        <div className={styles.heroText}>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <Tag color={STATUS_COLORS[project.status]}>
          {STATUS_LABELS[project.status]}
        </Tag>
      </div>

      <div className={styles.statsRow}>
        <div className="card">
          <span className={styles.sectionLabel}>Owner</span>
          <Avatar userId={project.ownerId} name={project.ownerName} showName />
        </div>
        <div className="card">
          <span className={styles.sectionLabel}>Created Date</span>
          <span>
            {new Date(project.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="card">
          <span className={styles.sectionLabel}>Members</span>
          <AntdAvatar.Group
            max={{
              count: 5,
              style: {
                color: 'var(--purple-light)',
                backgroundColor: 'var(--purple)',
              },
            }}
          >
            {project.members.map((member) => (
              <Avatar userId={member} />
            ))}
          </AntdAvatar.Group>
        </div>
        <div className="card">
          <span className={styles.sectionLabel}>Tags</span>
          <div className={styles.tagsList}>
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.contentRow}>
        <div className="card">
          <h3 className={styles.sectionLabel}>Notes</h3>
          <ProjectNotes />
        </div>
        <div className="card">
          <h3 className={styles.sectionLabel}>Files</h3>
          <ProjectFiles />
        </div>
      </div>
    </div>
  );
};
