import React, { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { platformRoutePaths } from 'models/enums/appPage';
import {
  AtomIcon,
  ChatsIcon,
  CubeIcon,
  DatabaseIcon,
  GraphIcon,
  HeartbeatIcon,
  LightbulbIcon,
  LightningIcon,
  ListIcon,
  MoonIcon,
  NotebookIcon,
  PuzzlePieceIcon,
  SquaresFourIcon,
  SunIcon,
  UserCircleIcon,
} from '@phosphor-icons/react';
import { Button, Tooltip } from 'antd';
import styles from './Nav.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectIdentity,
  selectIncognitoMode,
  selectTheme,
  setIncognitoMode,
  setTheme,
} from 'reducers/app/slice';
import { setFullScreen } from 'reducers/chat/slice';
import { appList } from 'constants/applications';
import { AppPage, AppPageLabel } from 'models/enums/appPage';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { HistoryCard } from './HistoryCard/HistoryCard';
import { RecCard } from './RecCard/RecCard';
import { useIsMobile } from 'hooks/useIsMobile';
import { getAvatarUrl } from 'utils/misc';

interface NavProps {}

export const Nav: FC<NavProps> = ({}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const incognitoMode = useSelector(selectIncognitoMode);
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showRecs, setShowRecs] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const identity = useSelector(selectIdentity);

  const apps = useMemo(() => {
    return appList.filter((app) => app.inDock);
  }, [appList]);

  const onClickLogo = () => {
    dispatch(setFullScreen(false));
  };

  const onClickAvatar = () => {
    navigate(platformRoutePaths[AppPage.PROFILE]);
  };

  const isMobile = useIsMobile();
  const iconSize = isMobile ? 18 : 22;

  const navIconMap: Record<string, any> = {
    [AppPage.APPS]: <SquaresFourIcon size={iconSize} />,
    [AppPage.AGENTS]: <AtomIcon size={iconSize} />,
    [AppPage.AUTOMATION]: <LightningIcon size={iconSize} />,
    [AppPage.DATA_HUB]: <DatabaseIcon size={iconSize} />,
    [AppPage.DATA_HEALTH]: <HeartbeatIcon size={iconSize} />,
    [AppPage.HOME]: undefined,
    [AppPage.INTEGRATIONS]: <PuzzlePieceIcon size={iconSize} />,
    [AppPage.METRICS]: <NotebookIcon size={iconSize} />,
    [AppPage.ONTOLOGY]: <GraphIcon size={iconSize} />,
  };

  const upperPages = [
    AppPage.ONTOLOGY,
    AppPage.DATA_HUB,
    AppPage.DATA_HEALTH,
    AppPage.METRICS,
  ];
  const lowerPages = [
    AppPage.AGENTS,
    AppPage.INTEGRATIONS,
    // AppPage.AUTOMATION,
    AppPage.APPS,
  ];

  const avatar = identity !== undefined ? getAvatarUrl(identity.id) : undefined;

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
      <div className={styles.navBar}>
        <Button
          size="small"
          icon={<ListIcon size={18} />}
          onClick={() => setMobileOpen(true)}
        />
      </div>
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}
      <div className={`${styles.Nav} ${mobileOpen ? styles.navOpen : ''} card`}>
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
                icon={<LightbulbIcon size={iconSize} />}
                onClick={() => setShowRecs(true)}
              />
            </div>
          </Tooltip>
          <Tooltip title="History" placement="right" mouseEnterDelay={0.5}>
            <div>
              <IconBtn
                icon={<ChatsIcon size={iconSize} />}
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
                  <div className={`defaultAppIcon ${styles.appIcon}`}>
                    <CubeIcon color="white" size={18} />
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
                  isDark ? (
                    <MoonIcon size={iconSize} />
                  ) : (
                    <SunIcon size={iconSize} />
                  )
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
                <UserCircleIcon size={iconSize} />
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
