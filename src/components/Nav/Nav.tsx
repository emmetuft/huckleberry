import { FC } from 'react';
import { useSelector } from 'react-redux';
import {
  Atom,
  Database,
  Heartbeat,
  Lightning,
  TreeStructure,
  UserCircle,
} from 'phosphor-react';
import styles from './Nav.module.scss';
import { sharedIconProps } from 'constants/styles';
import { selectIdentity } from 'reducers/app/slice';
import { IconBtn } from 'components/IconBtn/IconBtn';
import { Tooltip } from 'antd';

enum NavIcon {
  Data = 'Data',
  Health = 'Data health',
  Workflow = 'Workflows',
  Automation = 'Automations',
  Atom = 'Agents',
}

interface NavProps {}

export const Nav: FC<NavProps> = ({}) => {
  const identity = useSelector(selectIdentity);

  const navIconMap = {
    [NavIcon.Data]: <Database {...sharedIconProps} />,
    [NavIcon.Health]: <Heartbeat {...sharedIconProps} />,
    [NavIcon.Workflow]: <TreeStructure {...sharedIconProps} />,
    [NavIcon.Automation]: <Lightning {...sharedIconProps} />,
    [NavIcon.Atom]: <Atom {...sharedIconProps} />,
  };

  const upperIcons = [NavIcon.Data, NavIcon.Health];
  const lowerIcons = [NavIcon.Workflow, NavIcon.Automation, NavIcon.Atom];

  const avatar =
    identity !== undefined
      ? `https://${identity.host}/api/content/v1/avatar/USER/${identity.userId}?size=100`
      : undefined;

  const renderIconBtn = (icon: NavIcon) => (
    <Tooltip key={icon} title={icon} placement="right" mouseEnterDelay={0.5}>
      <div>
        <IconBtn
          icon={navIconMap[icon]}
          onClick={() => console.log(`Clicked ${icon}`)}
        />
      </div>
    </Tooltip>
  );

  return (
    <div className={styles.Nav}>
      <div className={styles.logo}>
        <img src="/static/logo.svg" width="100%" />
      </div>
      <div className={styles.buttons}>
        {upperIcons.map((icon) => renderIconBtn(icon))}
      </div>
      <div className={styles.divider} />
      <div className={styles.buttons}>
        {lowerIcons.map((icon) => renderIconBtn(icon))}
      </div>
      <div className={`${styles.buttons} ${styles.bottom}`}>
        <IconBtn
          icon={
            avatar ? (
              <img src={avatar} alt="User Avatar" className={styles.avatar} />
            ) : (
              <UserCircle {...sharedIconProps} />
            )
          }
        />
      </div>
    </div>
  );
};
