import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { platformRoutePaths } from 'models/enums/appPage';
import {
  ChatsIcon,
  DatabaseIcon,
  FlowArrowIcon,
  FolderIcon,
  GraphIcon,
  HeartbeatIcon,
  LightbulbIcon,
  LightningIcon,
  ListIcon,
  MoonIcon,
  NotebookIcon,
  PlusIcon,
  PuzzlePieceIcon,
  SidebarSimpleIcon,
  SquaresFourIcon,
  SunIcon,
} from '@phosphor-icons/react';
import { Button } from 'antd';
import styles from './Nav.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectIdentity,
  selectIncognitoMode,
  selectTheme,
  setIncognitoMode,
  setTheme,
} from 'reducers/app/slice';
import { clearMessages, setFullScreen } from 'reducers/chat/slice';
import { AppPage, AppPageTitle } from 'models/enums/appPage';
import { spaceList } from 'models/interfaces/workspace';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import AppTooltip from 'components/shared/Tooltip';
import { HistoryCard } from './HistoryCard/HistoryCard';
import { RecCard } from './RecCard/RecCard';
import { useIsMobile } from 'hooks/useIsMobile';

interface NavProps {}

export const Nav: FC<NavProps> = ({}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const identity = useSelector(selectIdentity);
  const incognitoMode = useSelector(selectIncognitoMode);
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showRecs, setShowRecs] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);

  const isMobile = useIsMobile();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const onClickLogo = () => {
    dispatch(clearMessages());
    dispatch(setFullScreen(false));
  };

  const onClickNewChat = () => {
    dispatch(clearMessages());
    dispatch(setFullScreen(true));
  };

  const onClickAvatar = () => {
    navigate(platformRoutePaths[AppPage.PROFILE]);
  };

  const iconSize = 16;

  const navIconMap: Record<string, any> = {
    [AppPage.APPS]: <SquaresFourIcon size={iconSize} />,
    [AppPage.AGENTS]: <LightningIcon size={iconSize} />,
    [AppPage.DATA_HUB]: <DatabaseIcon size={iconSize} />,
    [AppPage.DATA_HEALTH]: <HeartbeatIcon size={iconSize} />,
    [AppPage.HOME]: (
      <img
        className={styles.logo}
        src={`/static/logo${isDark ? '-light' : ''}.svg`}
      />
    ),
    [AppPage.INTEGRATIONS]: <PuzzlePieceIcon size={iconSize} />,
    [AppPage.METRICS]: <NotebookIcon size={iconSize} />,
    [AppPage.ONTOLOGY]: <GraphIcon size={iconSize} />,
    [AppPage.PROJECTS]: <FolderIcon size={iconSize} />,
    [AppPage.WORKFLOWS]: <FlowArrowIcon size={iconSize} />,
  };

  const pages = [
    AppPage.AGENTS,
    AppPage.WORKFLOWS,
    AppPage.ONTOLOGY,
    AppPage.DATA_HUB,
    AppPage.INTEGRATIONS,
    AppPage.APPS,
  ];

  const renderIconBtn = ({
    key,
    icon,
    label,
    page,
    onClick,
  }: {
    key: string;
    icon: ReactNode;
    label: string;
    page?: AppPage;
    onClick?: () => void;
  }) => {
    const btn = (
      <IconBtn
        icon={icon}
        label={label}
        labelHidden={!expanded}
        onClick={page ? undefined : onClick}
      />
    );
    const content = page ? (
      <Link to={platformRoutePaths[page]} onClick={onClick}>
        {btn}
      </Link>
    ) : (
      <div>{btn}</div>
    );
    if (expanded) return <React.Fragment key={key}>{content}</React.Fragment>;
    return (
      <AppTooltip
        key={key}
        title={label}
        placement="right"
        mouseEnterDelay={0.5}
      >
        {content}
      </AppTooltip>
    );
  };

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
      <div
        className={`${styles.nav} ${expanded ? styles.navExpanded : ''} ${mobileOpen ? styles.navOpen : ''}`}
      >
        <div className={styles.buttons}>
          {renderIconBtn({
            key: AppPage.HOME,
            icon: navIconMap[AppPage.HOME],
            label: AppPageTitle[AppPage.HOME],
            page: AppPage.HOME,
            onClick: onClickLogo,
          })}
          {!isMobile &&
            renderIconBtn({
              key: 'collapse',
              icon: <SidebarSimpleIcon size={iconSize} />,
              label: 'Collapse',
              onClick: () => setExpanded((v) => !v),
            })}
        </div>
        <div className={styles.buttons}>
          {/* {renderIconBtn({
            key: 'recs',
            icon: <LightbulbIcon size={iconSize} />,
            label: 'Recommendations',
            onClick: () => setShowRecs(true),
          })} */}
          {renderIconBtn({
            key: 'new',
            icon: <PlusIcon size={iconSize} />,
            label: 'New chat',
            onClick: () => onClickNewChat(),
          })}
          {renderIconBtn({
            key: 'history',
            icon: <ChatsIcon size={iconSize} />,
            label: 'History',
            // onClick: () => setShowHistory(true),
          })}
        </div>
        <div className={styles.buttons}>
          {pages.map((page) =>
            renderIconBtn({
              key: page,
              icon: navIconMap[page],
              label: AppPageTitle[page],
              page,
            }),
          )}
        </div>
        <div className={styles.buttons}>
          {expanded && <p>Spaces</p>}
          {spaceList.map((space) =>
            renderIconBtn({
              key: space.id,
              icon: <FolderIcon size={iconSize} />,
              label: space.name,
            }),
          )}
        </div>
        <div className={`${styles.buttons} ${styles.bottom}`}>
          {renderIconBtn({
            key: 'memory',
            icon: (
              <div className={styles.memoryIcon}>
                <div
                  className={styles.recordIcon}
                  style={
                    incognitoMode
                      ? { backgroundColor: '#bfbfbf', boxShadow: 'none' }
                      : {}
                  }
                />
              </div>
            ),
            label: incognitoMode ? 'Memory off' : 'Memory on',
            onClick: () => dispatch(setIncognitoMode(!incognitoMode)),
          })}
          {renderIconBtn({
            key: 'theme',
            icon: isDark ? (
              <MoonIcon size={iconSize} />
            ) : (
              <SunIcon size={iconSize} />
            ),
            label: isDark ? 'Dark mode' : 'Light mode',
            onClick: () => dispatch(setTheme(isDark ? 'light' : 'dark')),
          })}
          <Button
            type="text"
            className={styles.avatarBtn}
            icon={<Avatar userId={identity?.id} name={identity?.displayName} />}
            onClick={onClickAvatar}
          >
            <span className={!expanded ? styles.labelHidden : ''}>
              {identity?.displayName}
            </span>
          </Button>
        </div>
      </div>
      {showRecs && <RecCard setShowCard={setShowRecs} />}
      {showHistory && <HistoryCard setShowCard={setShowHistory} />}
    </React.Fragment>
  );
};
