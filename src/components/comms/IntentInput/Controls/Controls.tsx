import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { WrenchIcon } from '@phosphor-icons/react';
import { selectLoading } from 'reducers/chat/slice';
import { DataSource } from 'models/interfaces/dataSource';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { BrowserModal } from 'components/modals/BrowserModal/BrowserModal';
import { DataSourceBrowser } from 'components/shared/DataSourceBrowser/DataSourceBrowser';
import { ToolBrowser } from 'components/shared/ToolBrowser/ToolBrowser';
import { AddContextButton } from './AddContextButton';
import { DictateButton } from './DictateBtn/DictateBtn';
import { SuggestedActions } from './SuggestedActions/SuggestedActions';
import { ActionType, getSuggestedActions } from 'utils/temp';
import { isEmpty } from 'utils/misc';

interface IntentInputControlsProps {
  textContent?: string;
  selectedToolkitIds: string[];
  onToolkitIdsChange: (ids: string[]) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  selectedDataSources: DataSource[];
  setSelectedDataSources: (dataSources: DataSource[]) => void;
  handleTranscript: (transcript: string) => void;
}

export const IntentInputControls: FC<IntentInputControlsProps> = ({
  textContent,
  selectedToolkitIds,
  onToolkitIdsChange,
  uploadedFiles,
  setUploadedFiles,
  selectedDataSources,
  setSelectedDataSources,
  handleTranscript,
}) => {
  const requestLoading = useSelector(selectLoading);

  const [suggestedActions, setSuggestedActions] = useState<
    { type: ActionType; text: string }[]
  >([]);
  const [showToolBrowser, setShowToolBrowser] = useState<boolean>(false);
  const [showDataSourceBrowser, setShowDataSourceBrowser] =
    useState<boolean>(false);

  useEffect(() => {
    if (isEmpty(textContent)) setSuggestedActions([]);
    else
      setSuggestedActions(
        getSuggestedActions(textContent ?? '', selectedDataSources),
      );
  }, [textContent]);

  useEffect(() => {
    if (!textContent) return;
    setSuggestedActions(getSuggestedActions(textContent, selectedDataSources));
  }, [selectedDataSources]);

  const handleFileUpload = (file: File) => {
    setUploadedFiles([...uploadedFiles, file]);
  };

  const handleDataSourceClick = () => {
    setShowDataSourceBrowser(true);
  };

  const handleDataSourceModalConfirm = (dataSources: DataSource[]) => {
    setSelectedDataSources([...selectedDataSources, ...dataSources]);
    setShowDataSourceBrowser(false);
  };

  const handleDataSourceModalCancel = () => {
    setShowDataSourceBrowser(false);
  };

  return (
    <>
      <AddContextButton
        onFileUpload={handleFileUpload}
        onDataSourceClick={handleDataSourceClick}
      />
      <IconBtn
        icon={<WrenchIcon size={16} />}
        onClick={() => setShowToolBrowser(true)}
      />
      <DictateButton
        onTranscript={handleTranscript}
        disabled={requestLoading}
      />
      <SuggestedActions
        suggestedActions={suggestedActions}
        handleDataSourceClick={handleDataSourceClick}
      />
      <BrowserModal<DataSource>
        open={showDataSourceBrowser}
        title="Select Datasources"
        itemLabel="datasource"
        onCancel={handleDataSourceModalCancel}
        onConfirm={handleDataSourceModalConfirm}
      >
        {(selected, onChange) => (
          <DataSourceBrowser
            selectedDataSources={selected}
            onDataSourcesChange={onChange}
          />
        )}
      </BrowserModal>
      <BrowserModal<string>
        open={showToolBrowser}
        title="Browse Toolkits"
        itemLabel="toolkit"
        onCancel={() => setShowToolBrowser(false)}
        onConfirm={(ids) => {
          onToolkitIdsChange([...new Set([...selectedToolkitIds, ...ids])]);
          setShowToolBrowser(false);
        }}
      >
        {(selected, onChange) => (
          <ToolBrowser
            mode="toolkit"
            selectedToolkitIds={selected}
            onToolkitIdsChange={onChange}
          />
        )}
      </BrowserModal>
    </>
  );
};
