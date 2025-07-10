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
import { selectIdentity, setPage, setPersonaModal } from 'reducers/app/slice';
import { IconBtn } from 'components/IconBtn/IconBtn';
import { Tooltip } from 'antd';
import { useAppDispatch } from 'reducers';
import { AppPage } from 'models/enums/appPage';

enum NavIcon {
  Data = 'Data',
  Health = 'Data health',
  Workflow = 'Workflows',
  Automation = 'Automations',
  Atom = 'Agents',
}

interface NavProps {}

export const Nav: FC<NavProps> = ({}) => {
  const dispatch = useAppDispatch();

  const identity = useSelector(selectIdentity);

  const onClickIcon = (icon: NavIcon) => {
    switch (icon) {
      case NavIcon.Data:
        console.log('Data icon clicked');
        break;
      case NavIcon.Health:
        console.log('Health icon clicked');
        break;
      case NavIcon.Workflow:
        dispatch(setPage(AppPage.WORKFLOW));
        break;
      case NavIcon.Automation:
        console.log('Automation icon clicked');
        break;
      case NavIcon.Atom:
        console.log('Atom icon clicked');
        break;
      default:
        console.warn(`Unknown icon: ${icon}`);
    }
  };

  const onClickAvatar = () => {
    dispatch(setPersonaModal(true));
  };

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
        <IconBtn icon={navIconMap[icon]} onClick={() => onClickIcon(icon)} />
      </div>
    </Tooltip>
  );

  return (
    <div className={styles.Nav}>
      <div
        className={styles.logo}
        onClick={() => dispatch(setPage(AppPage.HOME))}
      >
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
          onClick={onClickAvatar}
        />
      </div>
    </div>
  );
};
