import { FC, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Integrations.module.scss';
import { integrationCategories, integrationList } from 'constants/integrations';
import { defaultMotionProps } from 'constants/styles';
import { IntegrationCard } from './IntegrationCard';
import { Menu, MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

interface IntegrationsProps {}

export const Integrations: FC<IntegrationsProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredIntegrations = useMemo(
    () =>
      integrationList.filter((integration) => {
        if (!selectedCategory) return !integration.connected;
        return (
          integration.category === selectedCategory && !integration.connected
        );
      }),
    [selectedCategory],
  );

  const onClickCategory: MenuProps['onClick'] = (e) => {
    const category = e.key === selectedCategory ? null : e.key;
    setSelectedCategory(category);
  };

  const items: MenuItem[] = [
    {
      key: 'categories',
      label: 'Categories',
      type: 'group',
      children: integrationCategories.map((category) => ({
        key: category,
        label: category,
      })),
    },
  ];

  return (
    <div className={styles.Integrations}>
      <div className={styles.tabContent}>
        <motion.div {...defaultMotionProps}>
          <div>
            <h2>Connected</h2>
            <div className={styles.integrationGrid}>
              {integrationList
                .filter((integration) => integration.connected)
                .map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                  />
                ))}
            </div>
          </div>
        </motion.div>
        <motion.div {...defaultMotionProps}>
          <div>
            <h2>Available</h2>
            <div className={styles.layout}>
              <div className={styles.left}>
                <Menu
                  selectedKeys={selectedCategory ? [selectedCategory] : []}
                  onClick={onClickCategory}
                  mode="inline"
                  items={items}
                />
              </div>
              <div className={styles.right}>
                <div
                  className={`${styles.integrationGrid} ${styles.available}`}
                >
                  {filteredIntegrations.map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      showAddBtn
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
