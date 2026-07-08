import React, { FC, ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChatsIcon,
  DatabaseIcon,
  DotsThreeIcon,
  FlowArrowIcon,
  FolderIcon,
  GraphIcon,
  HeartbeatIcon,
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
import { Button, Popover } from 'antd';
import styles from './Nav.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectIdentity,
  selectIncognitoMode,
  selectTheme,
  setIncognitoMode,
  setTheme,
} from 'reducers/app/slice';
import { clearMessages, selectSessions } from 'reducers/chat/slice';
import {
  AppPage,
  AppPageTitle,
  NavSubPageEntry,
  navSubPages,
  platformRoutePaths,
} from 'models/enums/appPage';
import { spaceList } from 'models/interfaces/workspace';
import { Avatar } from 'components/shared/Avatar/Avatar';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { SessionItem } from 'components/shared/SessionItem/SessionItem';
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
  const [openAccordion, setOpenAccordion] = useState<AppPage | null>(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    setMobileOpen(false);
    setOpenAccordion(null);
  }, [location.pathname]);

  const onClickLogo = () => {
    dispatch(clearMessages());
    navigate(platformRoutePaths[AppPage.HOME]);
  };

  const onClickNewChat = () => {
    dispatch(clearMessages());
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

  const renderAccordionItem = (page: AppPage, subPages: NavSubPageEntry[]) => {
    const isOpen = openAccordion === page;
    return (
      <div key={page} className={styles.accordionWrapper}>
        {renderIconBtn({
          key: page,
          icon: navIconMap[page],
          label: AppPageTitle[page],
          onClick: () => setOpenAccordion(isOpen ? null : page),
        })}
        <AnimatePresence initial={false}>
          {expanded && isOpen && (
            <motion.div
              className={styles.accordion}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              {subPages.map(({ page: subPage, label }) => (
                <Link
                  key={subPage}
                  to={platformRoutePaths[subPage]}
                  className={styles.subPageBtn}
                >
                  {label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
              {sessions.slice(0, 3).map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  expanded={expanded}
                />
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
              <div>
                {renderIconBtn({
                  key: 'history',
                  icon: <ChatsIcon size={iconSize} />,
                  label: 'History',
                })}
              </div>
            </Popover>
          )}
        </div>
        <div className={styles.buttons}>
          {pages.map((page) => {
            const subPageList = navSubPages[page];
            return subPageList
              ? renderAccordionItem(page, subPageList)
              : renderIconBtn({
                  key: page,
                  icon: navIconMap[page],
                  label: AppPageTitle[page],
                  page,
                });
          })}
        </div>
        <div className={styles.buttons}>
          {expanded && <p>Spaces</p>}
          {spaceList.map((space) =>
            renderIconBtn({
              key: space.id,
              icon: <FolderIcon size={iconSize} />,
              label: space.name,
              onClick: () =>
                navigate(
                  platformRoutePaths[AppPage.WORKSPACE_DETAIL].replace(
                    ':workspaceId',
                    space.id,
                  ),
                ),
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
