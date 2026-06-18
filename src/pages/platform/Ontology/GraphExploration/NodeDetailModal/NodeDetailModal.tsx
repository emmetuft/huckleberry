import { FC } from 'react';
import { motion } from 'framer-motion';
import { Button } from 'antd';
import { XIcon } from '@phosphor-icons/react';
import styles from './NodeDetailModal.module.css';
import { GraphNode } from 'models/interfaces/ontology';

interface NodeDetailModalProps {
  node: GraphNode;
  onClose: () => void;
}

export const NodeDetailModal: FC<NodeDetailModalProps> = ({
  node,
  onClose,
}) => {
  return (
    <motion.div
      className={styles.panel}
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <div className={styles.header}>
        <span className={styles.title}>{node.properties.name}</span>
        <Button type="text" icon={<XIcon size={16} />} onClick={onClose} />
      </div>
      <div className={styles.body}>
        <pre className={styles.eventJson}>
          {JSON.stringify(node.properties, null, 2)}
        </pre>
      </div>
    </motion.div>
  );
};
