import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ChatsIcon,
  DatabaseIcon,
  DotsThreeIcon,
  DotsThreeVerticalIcon,
  FlowArrowIcon,
  FolderIcon,
  GraphIcon,
  HeartbeatIcon,
  LightningIcon,
  LinkSimpleIcon,
  ListIcon,
  MoonIcon,
  NotebookIcon,
  PlusIcon,
  PuzzlePieceIcon,
  SidebarSimpleIcon,
  SquaresFourIcon,
  SunIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { Button, Dropdown, Popover } from 'antd';
import styles from './Nav.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectIdentity,
  selectIncognitoMode,
  selectTheme,
  setIncognitoMode,
  setTheme,
} from 'reducers/app/slice';
import {
  clearMessages,
  selectSessions,
  setFullScreen,
} from 'reducers/chat/slice';
import { deleteSession } from 'reducers/chat/actions';
import {
  AppPage,
  AppPageTitle,
  platformRoutePaths,
} from 'models/enums/appPage';
import { spaceList } from 'models/interfaces/workspace';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import AppTooltip from 'components/shared/Tooltip';
import { HistoryCard } from './HistoryCard/HistoryCard';
import { useIsMobile } from 'hooks/useIsMobile';

interface NavProps {}

export const Nav: FC<NavProps> = ({}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const identity = useSelector(selectIdentity);
  const incognitoMode = useSelector(selectIncognitoMode);
  const theme = useSelector(selectTheme);
  const sessions = useSelector(selectSessions);
  const isDark = theme === 'dark';

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
          {renderIconBtn({
            key: 'new',
            icon: <PlusIcon size={iconSize} />,
            label: 'New chat',
            onClick: () => onClickNewChat(),
          })}
          {expanded ? (
            <>
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className={styles.sessionItem}>
                  <IconBtn
                    icon={null}
                    label={session.name}
                    labelHidden={!expanded}
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  />
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'copy-link',
                          icon: <LinkSimpleIcon size={iconSize} />,
                          label: 'Copy link',
                          onClick: (e) => {
                            e.domEvent.stopPropagation();
                            navigator.clipboard.writeText(
                              `${window.location.origin}/sessions/${session.id}`,
                            );
                            toast.success('Session link copied to clipboard');
                          },
                        },
                        {
                          key: 'delete',
                          icon: <TrashIcon size={iconSize} />,
                          label: 'Delete',
                          danger: true,
                          onClick: (e) => {
                            e.domEvent.stopPropagation();
                            dispatch(deleteSession(session.id));
                          },
                        },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <Button
                      type="text"
                      size="small"
                      className={styles.sessionMenu}
                      icon={<DotsThreeVerticalIcon />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                </div>
              ))}
              <Popover
                content={<HistoryCard />}
                trigger="click"
                placement="rightTop"
                arrow={false}
                styles={{ container: { padding: 0 } }}
              >
                {renderIconBtn({
                  key: 'history-more',
                  icon: <DotsThreeIcon size={iconSize} />,
                  label: 'More',
                })}
              </Popover>
            </>
          ) : (
            <Popover
              content={<HistoryCard />}
              trigger="click"
              placement="rightTop"
              arrow={false}
              styles={{ container: { padding: 0 } }}
            >
              {renderIconBtn({
                key: 'history',
                icon: <ChatsIcon size={iconSize} />,
                label: 'History',
              })}
            </Popover>
          )}
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
    </React.Fragment>
  );
};
