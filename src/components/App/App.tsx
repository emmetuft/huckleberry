import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ConfigProvider, FloatButton, Tooltip } from 'antd';
import { Toaster } from 'sonner';
import styles from './App.module.scss';
import { useAppDispatch } from 'reducers';
import { fetchUserPersona } from 'reducers/app/actions';
import {
  authenticate,
  fetchIdentity,
  selectIdentity,
  selectIncognitoMode,
  selectPage,
  setIncognitoMode,
} from 'reducers/app/slice';
import { AppPage } from 'models/enums/appPage';
import { Applications } from 'components/Applications/Applications';
import Automation from 'components/Automation/Automation';
import { Background } from 'components/Background/Background';
import { DataHealth } from 'components/DataHealth/DataHealth';
import { DataHub } from 'components/DataHub/DataHub';
import { FlowCanvas } from 'components/FlowCanvas/FlowCanvas';
import { Heading } from 'components/Heading/Heading';
import { Integrations } from 'components/Integrations/Integrations';
import { Nav } from 'components/Nav/Nav';
import { Ontology } from 'components/Ontology/Ontology';
import { PersonaModal } from 'components/PersonaModal/PersonaModal';
import { Workspace } from 'components/Workspace/Workspace';

export const App: FC = () => {
  const dispatch = useAppDispatch();
  const identity = useSelector(selectIdentity);
  const page = useSelector(selectPage);
  const incognitoMode = useSelector(selectIncognitoMode);

  useEffect(() => {
    dispatch(authenticate());
    dispatch(fetchIdentity());
  }, []);

  useEffect(() => {
    if (identity) {
      dispatch(fetchUserPersona());
    }
  }, [identity]);

  const renderPage = () => {
    switch (page) {
      case AppPage.APPS:
        return <Applications />;
      case AppPage.AUTOMATION:
        return <Automation />;
      case AppPage.DATA_HEALTH:
        return <DataHealth />;
      case AppPage.DATA_HUB:
        return <DataHub />;
      case AppPage.HOME:
        return (
          <div className={styles.home}>
            <Workspace />
            <Background />
          </div>
        );
      case AppPage.INTEGRATIONS:
        return <Integrations />;
      case AppPage.ONTOLOGY:
        return <Ontology />;
      case AppPage.WORKFLOW:
        return <FlowCanvas />;
      default:
        return null;
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#5a0cff',
        },
        components: {
          Menu: {
            itemActiveBg: '#e6e9ff',
            itemSelectedBg: '#e6e9ff',
          },
          Table: {
            borderColor: '#f8f8f8',
            headerBg: '#fff',
            footerBg: '#fff',
          },
        },
      }}
    >
      <div className={styles.App}>
        <Heading />
        <Nav />
        <PersonaModal />
        {renderPage()}
      </div>
      <Tooltip title={incognitoMode ? 'Memory off' : 'Memory on'}>
        <FloatButton
          shape="square"
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
      <Toaster position="top-right" theme="light" richColors />
    </ConfigProvider>
  );
};
