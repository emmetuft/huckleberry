import React, { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { platformRoutePaths } from 'models/enums/appPage';
import {
  Atom,
  Chats,
  Cube,
  Database,
  Graph,
  Heartbeat,
  Lightbulb,
  Lightning,
  Moon,
  Notebook,
  PuzzlePiece,
  SquaresFour,
  Sun,
  TreeStructure,
  UserCircle,
} from 'phosphor-react';
import { Button, Tooltip } from 'antd';
import styles from './Nav.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectIdentity,
  selectIncognitoMode,
  selectTheme,
  setIncognitoMode,
  setPersonaModal,
  setTheme,
} from 'reducers/app/slice';
import { setFullScreen } from 'reducers/chat/slice';
import { appList } from 'constants/applications';
import { AppPage, AppPageLabel } from 'models/enums/appPage';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { RecCard } from 'components/RecCard/RecCard';
import { HistoryCard } from 'components/HistoryCard/HistoryCard';

interface NavProps {}

export const Nav: FC<NavProps> = ({}) => {
  const dispatch = useAppDispatch();
  const incognitoMode = useSelector(selectIncognitoMode);
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const [showHistory, setShowHistory] = useState<boolean>(false);
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

  const iconSize = 22;

  const navIconMap: Record<string, any> = {
    [AppPage.APPS]: <SquaresFour size={iconSize} />,
    [AppPage.AGENTS]: <Atom size={iconSize} />,
    [AppPage.AUTOMATION]: <Lightning size={iconSize} />,
    [AppPage.DATA_HUB]: <Database size={iconSize} />,
    [AppPage.DATA_HEALTH]: <Heartbeat size={iconSize} />,
    [AppPage.HOME]: undefined,
    [AppPage.INTEGRATIONS]: <PuzzlePiece size={iconSize} />,
    [AppPage.METRICS]: <Notebook size={iconSize} />,
    [AppPage.ONTOLOGY]: <Graph size={iconSize} />,
    [AppPage.WORKFLOW]: <TreeStructure size={iconSize} />,
  };

  const upperPages = [
    AppPage.ONTOLOGY,
    AppPage.DATA_HUB,
    AppPage.DATA_HEALTH,
    AppPage.METRICS,
  ];
  const lowerPages = [
    AppPage.INTEGRATIONS,
    AppPage.WORKFLOW,
    // AppPage.AUTOMATION,
    // AppPage.AGENTS,
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
      <Link to={platformRoutePaths[page]}>
        <IconBtn icon={navIconMap[page]} />
      </Link>
    </Tooltip>
  );

  return (
    <React.Fragment>
      <div className={`${styles.Nav} card`}>
        <Link
          to={platformRoutePaths[AppPage.HOME]}
          className={styles.logo}
          onClick={onClickLogo}
        >
          <img src={`/static/logo${isDark ? '-light' : ''}.svg`} width="100%" />
        </Link>
        <div className={styles.buttons}>
          <Tooltip
            title="Recommendations"
            placement="right"
            mouseEnterDelay={0.5}
          >
            <div>
              <IconBtn
                icon={<Lightbulb size={iconSize} />}
                onClick={() => setShowRecs(true)}
              />
            </div>
          </Tooltip>
          <Tooltip title="History" placement="right" mouseEnterDelay={0.5}>
            <div>
              <IconBtn
                icon={<Chats size={iconSize} />}
                onClick={() => setShowHistory(true)}
              />
            </div>
          </Tooltip>
        </div>
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
          <Tooltip title={isDark ? 'Dark mode' : 'Light mode'}>
            <div>
              <IconBtn
                icon={
                  isDark ? <Moon size={iconSize} /> : <Sun size={iconSize} />
                }
                onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
              />
            </div>
          </Tooltip>
          <IconBtn
            icon={
              avatar ? (
                <img src={avatar} alt="User Avatar" className={styles.avatar} />
              ) : (
                <UserCircle size={iconSize} />
              )
            }
            onClick={onClickAvatar}
          />
        </div>
      </div>
      {showRecs && <RecCard setShowCard={setShowRecs} />}
      {showHistory && <HistoryCard setShowCard={setShowHistory} />}
    </React.Fragment>
  );
};
