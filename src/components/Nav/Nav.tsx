import React, { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { routePaths } from 'routes';
import {
  Atom,
  Cube,
  Database,
  Graph,
  Heartbeat,
  Lightbulb,
  Lightning,
  PuzzlePiece,
  SquaresFour,
  TreeStructure,
  UserCircle,
} from 'phosphor-react';
import { Button, Tooltip } from 'antd';
import styles from './Nav.module.scss';
import { useAppDispatch } from 'reducers';
import {
  selectIdentity,
  selectIncognitoMode,
  setIncognitoMode,
  setPersonaModal,
} from 'reducers/app/slice';
import { setFullScreen } from 'reducers/chat/slice';
import { appList } from 'constants/applications';
import { sharedIconProps } from 'constants/styles';
import { AppPage, AppPageLabel } from 'models/enums/appPage';
import { IconBtn } from 'components/IconBtn/IconBtn';
import { RecCard } from 'components/RecCard/RecCard';

interface NavProps {}

export const Nav: FC<NavProps> = ({}) => {
  const dispatch = useAppDispatch();
  const incognitoMode = useSelector(selectIncognitoMode);

  const [showRecs, setShowRecs] = useState<boolean>(false);

  const identity = useSelector(selectIdentity);

  const apps = useMemo(() => {
    return appList.filter((app) => app.inDock);
  }, [appList]);

  const onClickLogo = () => {
    dispatch(setFullScreen(false));
  };

  const onClickAvatar = () => {
    dispatch(setPersonaModal(true));
  };

  const navIconMap: Record<AppPage, any> = {
    [AppPage.APPS]: <SquaresFour {...sharedIconProps} />,
    [AppPage.AGENTS]: <Atom {...sharedIconProps} />,
    [AppPage.AUTOMATION]: <Lightning {...sharedIconProps} />,
    [AppPage.DATA_HUB]: <Database {...sharedIconProps} />,
    [AppPage.DATA_HEALTH]: <Heartbeat {...sharedIconProps} />,
    [AppPage.HOME]: undefined,
    [AppPage.INTEGRATIONS]: <PuzzlePiece {...sharedIconProps} />,
    [AppPage.ONTOLOGY]: <Graph {...sharedIconProps} />,
    [AppPage.WORKFLOW]: <TreeStructure {...sharedIconProps} />,
  };

  const upperPages = [AppPage.ONTOLOGY, AppPage.DATA_HUB, AppPage.DATA_HEALTH];
  const lowerPages = [
    AppPage.INTEGRATIONS,
    AppPage.WORKFLOW,
    AppPage.AUTOMATION,
    AppPage.AGENTS,
    AppPage.APPS,
  ];

  const avatar =
    identity !== undefined
      ? `https://${identity.host}/api/content/v1/avatar/USER/${identity.userId}?size=100`
      : undefined;

  const renderIconBtn = (page: AppPage) => (
    <Tooltip
      key={page}
      title={AppPageLabel[page]}
      placement="right"
      mouseEnterDelay={0.5}
    >
      <Link to={routePaths[page]}>
        <IconBtn icon={navIconMap[page]} />
      </Link>
    </Tooltip>
  );

  return (
    <React.Fragment>
      <div className={styles.Nav}>
        <Link
          to={routePaths[AppPage.HOME]}
          className={styles.logo}
          onClick={onClickLogo}
        >
          <img src="/static/logo.svg" width="100%" />
        </Link>
        <Tooltip
          title="Recommendations"
          placement="right"
          mouseEnterDelay={0.5}
        >
          <div>
            <IconBtn
              icon={<Lightbulb {...sharedIconProps} />}
              onClick={() => setShowRecs(true)}
            />
          </div>
        </Tooltip>
        <div className={styles.divider} />
        <div className={styles.buttons}>
          {upperPages.map((page) => renderIconBtn(page))}
        </div>
        <div className={styles.divider} />
        <div className={styles.buttons}>
          {lowerPages.map((page) => renderIconBtn(page))}
          {apps.map((app) => (
            <Tooltip
              key={app.id}
              title={app.name}
              placement="right"
              mouseEnterDelay={0.5}
            >
              <button className={styles.appBtn}>
                {app.iconUrl ? (
                  <img src={app.iconUrl} height="100%" width="100%" />
                ) : (
                  <div className={styles.defaultAppIcon}>
                    <Cube color="white" size={18} />
                  </div>
                )}
              </button>
            </Tooltip>
          ))}
        </div>
        <div className={`${styles.buttons} ${styles.bottom}`}>
          <Tooltip title={incognitoMode ? 'Memory off' : 'Memory on'}>
            <Button
              icon={
                <div
                  className={styles.recordIcon}
                  style={
                    incognitoMode
                      ? { backgroundColor: '#bfbfbf', boxShadow: 'none' }
                      : {}
                  }
                />
              }
              onClick={() => dispatch(setIncognitoMode(!incognitoMode))}
            />
          </Tooltip>
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
      {showRecs && <RecCard setShowRecs={setShowRecs} />}
    </React.Fragment>
  );
};
