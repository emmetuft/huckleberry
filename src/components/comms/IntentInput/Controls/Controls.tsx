import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { WrenchIcon } from '@phosphor-icons/react';
import { selectLoading } from 'reducers/chat/slice';
import { DataSource } from 'models/interfaces/dataSource';
import { Tool } from 'models/interfaces/toolkit';
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
  selectedTools: Tool[];
  setSelectedTools: (tools: Tool[]) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  selectedDataSources: DataSource[];
  setSelectedDataSources: (dataSources: DataSource[]) => void;
  handleTranscript: (transcript: string) => void;
}

export const IntentInputControls: FC<IntentInputControlsProps> = ({
  textContent,
  selectedTools,
  setSelectedTools,
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

  const handleToolModalConfirm = (tools: Tool[]) => {
    const newTools = tools.filter(
      (tool) => !selectedTools.some((t) => t.toolId === tool.toolId),
    );
    setSelectedTools([...selectedTools, ...newTools]);
    setShowToolBrowser(false);
  };

  const handleFileUpload = (file: File) => {
    // TODO: Process the uploaded file and add to context
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
      <BrowserModal<Tool>
        open={showToolBrowser}
        title="Browse Tools"
        itemLabel="tool"
        onCancel={() => setShowToolBrowser(false)}
        onConfirm={handleToolModalConfirm}
      >
        {(selected, onChange) => (
          <ToolBrowser selectedTools={selected} onToolsChange={onChange} />
        )}
      </BrowserModal>
    </>
  );
};
