import { FC } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { GitForkIcon, StarIcon } from '@phosphor-icons/react';
import styles from './index.module.css';
import sharedStyles from '../shared.module.css';
import { NodeWrapper } from '../NodeWrapper';
import { CanvasNode } from 'models/interfaces/canvasNode';

export interface GitHubRepoNodeData {
  name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  lastCommit: string;
  visibility: 'public' | 'private';
  defaultBranch?: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572a5',
  Ruby: '#701516',
  Go: '#00add8',
  Rust: '#dea584',
  Java: '#b07219',
  'C#': '#178600',
  Swift: '#f05138',
};

export const GitHubRepoNode: FC<NodeProps<Node<CanvasNode>>> = ({ data }) => {
  const {
    name,
    owner,
    description,
    language,
    stars,
    forks,
    openIssues,
    lastCommit,
    visibility,
    defaultBranch,
  } = data.data as GitHubRepoNodeData;
  const langColor = LANGUAGE_COLORS[language] ?? 'var(--grey-text)';

  return (
    <NodeWrapper node={data} style={{ width: 280 }}>
      <div className={sharedStyles.container}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h3 className={styles.title}>{name}</h3>
            <span className={styles.owner}>{owner}</span>
          </div>
          <span className={`${styles.visibilityBadge} ${styles[visibility]}`}>
            {visibility === 'public' ? 'Public' : 'Private'}
          </span>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.languageRow}>
          <span
            className={styles.langDot}
            style={{ backgroundColor: langColor }}
          />
          <span className={styles.langLabel}>{language}</span>
        </div>

        <div className={sharedStyles.divider} />

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <StarIcon size={12} weight="fill" className={styles.statIcon} />
            <span className={styles.statValue}>{stars.toLocaleString()}</span>
          </div>
          <div className={styles.stat}>
            <GitForkIcon size={12} className={styles.statIcon} />
            <span className={styles.statValue}>{forks.toLocaleString()}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.issuesDot} />
            <span className={styles.statValue}>{openIssues} issues</span>
          </div>
        </div>

        <div className={sharedStyles.divider} />

        <div className={sharedStyles.metadata}>
          <div className={sharedStyles.metaItem}>
            <span className={sharedStyles.metaLabel}>Last commit</span>
            <span className={sharedStyles.metaValue}>
              {defaultBranch ?? 'main'}
            </span>
          </div>
          <div className={sharedStyles.metaItem}>
            <span className={sharedStyles.metaLabel}>Last commit</span>
            <span className={sharedStyles.metaValue}>{lastCommit}</span>
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
};
