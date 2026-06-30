import { FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input } from 'antd';
import { MapPinIcon } from '@phosphor-icons/react';
import styles from './WorkspaceDetail.module.css';
import {
  selectSpaceById,
  selectCanvasesBySpaceId,
  createCanvas,
} from 'reducers/spaces/slice';
import {
  defaultMotionProps,
  staggerChildrenMotionProps,
  staggeredChildMotionProps,
} from 'constants/styles';
import { platformRoutePaths, AppPage } from 'models/enums/appPage';
import { CanvasCard } from './CanvasCard/CanvasCard';
import { Avatar } from 'components/shared/Avatar/Avatar';

const { TextArea } = Input;

const CANVAS_TEMPLATES = [
  'Competitive landscape',
  'Churn analysis',
  'OKR breakdown',
  'Data pipeline map',
  'Stakeholder map',
];

export const WorkspaceDetail: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();

  const space = useSelector(selectSpaceById(workspaceId));
  const canvases = useSelector(selectCanvasesBySpaceId(workspaceId));

  const [prompt, setPrompt] = useState<string>('');

  const handleCreate = (intent: string) => {
    if (!intent.trim()) return;
    const canvasId = `canvas-${Date.now()}`;
    dispatch(
      createCanvas({
        id: canvasId,
        spaceId: workspaceId,
        intent: intent.trim(),
        ownerId: 1, // Replace with actual user ID
        ownerName: 'John Doe', // Replace with actual user name
      }),
    );
    const path = platformRoutePaths[AppPage.WORKSPACE_CANVAS]
      .replace(':workspaceId', workspaceId)
      .replace(':canvasId', canvasId);
    navigate(path);
  };

  if (space === undefined) return null;

  return (
    <div className={styles.workspaceDetail}>
      <motion.div {...defaultMotionProps}>
        <div className={styles.left}>
          <motion.div {...staggerChildrenMotionProps}>
            <div className={styles.hero}>
              <div className={styles.heroIcon}>
                <MapPinIcon size={22} color="white" />
              </div>
              <div>
                <motion.div {...staggeredChildMotionProps}>
                  <h1 className={styles.heroName}>{space?.name ?? 'Space'}</h1>
                </motion.div>
                <motion.div {...staggeredChildMotionProps}>
                  {space?.description && (
                    <p className={styles.heroDescription}>
                      {space.description}
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
          <div className={styles.promptSection}>
            <TextArea
              autoSize={{ minRows: 3 }}
              placeholder="What do you want to explore?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className={styles.templates}>
              {CANVAS_TEMPLATES.map((template) => (
                <Button
                  key={template}
                  shape="round"
                  onClick={() => handleCreate(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
          {canvases.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Canvases</span>
              <div className={styles.canvasGrid}>
                {canvases.map((canvas) => (
                  <CanvasCard
                    key={canvas.id}
                    canvas={canvas}
                    workspaceId={workspaceId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <div className={styles.right}>
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Members</span>
          <div className={styles.memberList}>
            {space.memberIds.map((memberId) => (
              <Avatar
                key={memberId}
                userId={memberId}
                name="Emme Tuft"
                showName
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
