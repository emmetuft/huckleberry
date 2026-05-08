import { FC, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from 'antd';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { projectList } from 'constants/projects';
import { Project } from 'constants/projects';
import { defaultMotionProps } from 'constants/styles';
import { ProjectCard } from './ProjectCard';
import styles from './Projects.module.css';
import { useIsMobile } from 'hooks/useIsMobile';

type StatusFilter = 'all' | Project['status'];

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on-hold' },
  { label: 'Archived', value: 'archived' },
];

export const Projects: FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    return projectList.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="platformPage">
      <motion.div {...defaultMotionProps}>
        <div className={styles.controls}>
          <Input
            className={styles.search}
            placeholder="Search projects..."
            prefix={<MagnifyingGlassIcon size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <div className={styles.filterGroup}>
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                size={isMobile ? 'small' : 'medium'}
                className={
                  statusFilter === f.value ? styles.filterBtnActive : ''
                }
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
      <div className={styles.projectGrid}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No projects match your search.</p>
          </div>
        ) : (
          filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
