import { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import {
  CalendarBlank,
  ChartLine,
  Database,
  PaperPlaneTilt,
  Wrench,
} from 'phosphor-react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './IntentInput.module.scss';
import { useAppDispatch } from 'reducers';
import { selectPage } from 'reducers/app/slice';
import { sendStreamingRequest } from 'reducers/chat/actions';
import { selectLoading, setFullScreen } from 'reducers/chat/slice';
import { sharedIconProps } from 'constants/styles';
import { MCPToolDefinition, MCPToolCall } from 'models/interfaces/mcpServer';
import { AppPage } from 'models/enums/appPage';
import { InputCommand } from 'models/enums/inputCommand';
import { DataSource } from 'models/interfaces/dataSource';
import { MentionItem } from 'models/interfaces/mention';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { DataSourceModal } from 'components/modals/DataSourceModal/DataSourceModal';
import { SendModal, SendData } from 'components/modals/SendModal/SendModal';
import { AddContextButton } from './context/AddContextButton';
import { CommandPopup } from './CommandPopup/CommandPopup';
import { ContextItems } from './context/ContextItems';
import { EditableInput } from './EditableInput';
import { SendButton } from './SendBtn';
import { DictateButton } from './DictateBtn/DictateBtn';
import { ToolBrowser } from '../ToolBrowser/ToolBrowser';
import { ActionType, getSuggestedActions } from 'utils/temp';
import { processFiles } from 'utils/file';
import { useCommandPopup } from 'hooks/useCommandPopup';

interface IntentInputProps {
  placeholder?: string;
  animate?: boolean;
}

export const IntentInput: FC<IntentInputProps> = ({ placeholder, animate }) => {
  const dispatch = useAppDispatch();
  const appPage = useSelector(selectPage);
  const requestLoading = useSelector(selectLoading);

  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [suggestedActions, setSuggestedActions] = useState<
    { type: ActionType; text: string }[]
  >([]);
  const [selectedTools, setSelectedTools] = useState<MCPToolDefinition[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showToolBrowser, setShowToolBrowser] = useState<boolean>(false);
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource[]>(
    [],
  );
  const [showDataSourceModal, setShowDataSourceModal] =
    useState<boolean>(false);
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [mentionedItems, setMentionedItems] = useState<MentionItem[]>([]);

  const editableRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const toolPopup = useCommandPopup<MCPToolDefinition>(editableRef, {
    trigger: InputCommand.TOOL,
    removeOnSelect: true,
    popupRef,
    onSelect: (tool) => {
      // Avoid duplicates
      if (
        selectedTools.some(
          (t) => t.name === tool.name && t.serverId === tool.serverId,
        )
      ) {
        return;
      }
      setSelectedTools([...selectedTools, tool]);
    },
  });

  const mentionPopup = useCommandPopup<MentionItem>(editableRef, {
    trigger: InputCommand.MENTION,
    removeOnSelect: false,
    popupRef,
    replaceWith: (item) => {
      if ('username' in item) {
        const name = item.displayName || item.username;
        return `${InputCommand.MENTION}${name.replace(/\s+/g, '')}`;
      } else {
        return `${InputCommand.MENTION}${item.name.replace(/\s+/g, '')}`;
      }
    },
    onSelect: (item) => {
      // Avoid duplicates
      if (mentionedItems.some((m) => m.id === item.id)) {
        return;
      }
      setMentionedItems([...mentionedItems, item]);
    },
  });

  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    const text = el.innerText;
    setSuggestedActions(getSuggestedActions(text, selectedDataSources));
  }, [selectedDataSources]);

  const handleTextChange = (text: string, isNowEmpty: boolean) => {
    setIsEmpty(isNowEmpty);

    if (isNowEmpty) {
      toolPopup.resetPopup();
      mentionPopup.resetPopup();
    } else {
      setSuggestedActions(getSuggestedActions(text, selectedDataSources));
      toolPopup.controlPopup(text);
      mentionPopup.controlPopup(text);
    }
  };

  const onRemoveTool = (tool: MCPToolDefinition) => {
    setSelectedTools(
      selectedTools.filter(
        (t) => !(t.name === tool.name && t.serverId === tool.serverId),
      ),
    );
  };

  const handleFileUpload = (file: File) => {
    // TODO: Process the uploaded file and add to context
    setUploadedFiles([...uploadedFiles, file]);
  };

  const onRemoveFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.name !== fileName));
  };

  const handleDataSourceClick = () => {
    setShowDataSourceModal(true);
  };

  const handleDataSourceModalConfirm = (dataSources: DataSource[]) => {
    setSelectedDataSources([...selectedDataSources, ...dataSources]);
    setShowDataSourceModal(false);
  };

  const handleDataSourceModalCancel = () => {
    setShowDataSourceModal(false);
  };

  const onRemoveDataSource = (dataSourceId: string) => {
    setSelectedDataSources(
      selectedDataSources.filter((ds) => ds.id !== dataSourceId),
    );
  };

  const onClickAction = (action: { type: ActionType; text: string }) => {
    switch (action.type) {
      case ActionType.DATASET:
        handleDataSourceClick();
        break;
      case ActionType.SEND:
        setShowSendModal(true);
        break;
      default:
        break;
    }
  };

  const handleSendModalConfirm = (data: SendData) => {
    // TODO: Handle sending the message
    console.log('Send data:', data);
    setShowSendModal(false);
  };

  const handleSendModalCancel = () => {
    setShowSendModal(false);
  };

  const onClickSend = async () => {
    const el = editableRef.current;
    if (!el || isEmpty) return;

    const userInput = el.innerText.trim();
    if (!userInput) return;

    // Process files before dispatching to avoid non-serializable values in Redux
    const processedFiles =
      uploadedFiles.length > 0 ? await processFiles(uploadedFiles) : undefined;

    // Convert selected tools to MCPToolCall format
    const toolCalls: MCPToolCall[] | undefined =
      selectedTools.length > 0
        ? selectedTools.map((tool) => ({
            toolName: tool.name,
            serverId: tool.serverId,
            params: {},
          }))
        : undefined;
    // Process datasources to send only id and name
    const processedDataSources =
      selectedDataSources.length > 0
        ? selectedDataSources.map((ds) => ds.id)
        : undefined;

    dispatch(
      sendStreamingRequest({
        userInput,
        files: processedFiles,
        tools: toolCalls,
        dataSources: processedDataSources,
      }),
    );

    if (appPage === AppPage.HOME) {
      dispatch(setFullScreen(true));
    }

    // Clear the input
    el.innerText = '';
    setIsEmpty(true);
    setSelectedTools([]);
    setUploadedFiles([]);
    setSelectedDataSources([]);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (toolPopup.handleKeyDown(event)) return;
    if (mentionPopup.handleKeyDown(event)) return;

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onClickSend();
    }
  };

  const handleTranscript = (transcript: string) => {
    const el = editableRef.current;
    if (!el) return;

    // Append transcript to existing text
    const currentText = el.innerText;
    const newText = currentText ? `${currentText} ${transcript}` : transcript;
    el.innerText = newText;

    // Update state
    setIsEmpty(false);
    handleTextChange(newText, false);

    // Move cursor to end
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const actionIconMap = {
    [ActionType.SCHEDULE]: <CalendarBlank {...sharedIconProps} size={16} />,
    [ActionType.CHART]: <ChartLine {...sharedIconProps} size={16} />,
    [ActionType.DATASET]: <Database {...sharedIconProps} size={16} />,
    [ActionType.SEND]: <PaperPlaneTilt {...sharedIconProps} size={16} />,
  };

  return (
    <div className={styles.IntentInput}>
      <DataSourceModal
        open={showDataSourceModal}
        onCancel={handleDataSourceModalCancel}
        onConfirm={handleDataSourceModalConfirm}
      />
      <SendModal
        open={showSendModal}
        onCancel={handleSendModalCancel}
        onConfirm={handleSendModalConfirm}
      />
      {(toolPopup.showPopup || mentionPopup.showPopup) && (
        <CommandPopup
          popupRef={popupRef}
          popup={toolPopup.showPopup ? toolPopup : mentionPopup}
        />
      )}
      <ToolBrowser
        open={showToolBrowser}
        onClose={() => setShowToolBrowser(false)}
        selectedTools={selectedTools}
        onToolsChange={setSelectedTools}
      />
      <div
        className={`${styles.inputWrapper} ${animate ? styles.animate : ''}`}
      >
        <ContextItems
          uploadedFiles={uploadedFiles}
          selectedDataSources={selectedDataSources}
          onRemoveFile={onRemoveFile}
          onRemoveDataSource={onRemoveDataSource}
        />
        <EditableInput
          ref={editableRef}
          isEmpty={isEmpty}
          disabled={requestLoading}
          placeholder={
            placeholder ??
            'Start something new: a workflow, an app, an agent—your call.'
          }
          onTextChange={handleTextChange}
          onKeyDown={onKeyDown}
        />
        <div className={styles.actions}>
          <div className={styles.buttons}>
            <AddContextButton
              onFileUpload={handleFileUpload}
              onDataSourceClick={handleDataSourceClick}
            />
            <IconBtn
              icon={<Wrench />}
              onClick={() => setShowToolBrowser(true)}
            />
            <DictateButton
              onTranscript={handleTranscript}
              disabled={requestLoading}
            />
            {selectedTools.length > 0 && (
              <div className={styles.selectedTools}>
                {selectedTools.map((tool) => (
                  <div
                    key={`${tool.serverId}-${tool.name}`}
                    className={styles.tool}
                  >
                    <p>{tool.name}</p>
                    <button onClick={() => onRemoveTool(tool)}>
                      <CloseOutlined className={styles.closeIcon} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <AnimatePresence>
              {suggestedActions.map((action) => (
                <motion.div
                  key={action.type}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="text"
                    icon={actionIconMap[action.type]}
                    onClick={() => onClickAction(action)}
                  >
                    {action.text}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <SendButton isEmpty={isEmpty} onClickSend={onClickSend} />
        </div>
      </div>
    </div>
  );
};
