import { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'antd';
import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  ArrowUp,
  CalendarBlank,
  ChartLine,
  Database,
  File,
  PaperPlaneTilt,
} from 'phosphor-react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './IntentInput.module.scss';
import { useAppDispatch } from 'reducers';
import { selectPage } from 'reducers/app/slice';
import { sendStreamingRequest } from 'reducers/chat/actions';
import { selectLoading, setFullScreen } from 'reducers/chat/slice';
import { COMMANDS } from 'constants/app';
import { sharedIconProps } from 'constants/styles';
import { AppPage } from 'models/enums/appPage';
import { DataSource } from 'models/interfaces/dataSource';
import { ToolPopup } from './ToolPopup';
import { AddContextButton } from './AddContextButton';
import { DataSourceModal } from 'components/DataSourceModal/DataSourceModal';
import {
  getCaretCharacterOffsetWithin,
  getTextWithHighlights,
  setCaretPosition,
} from 'utils/dom';
import { ActionType, getSuggestedActions } from 'utils/temp';
import { processFiles } from 'utils/file';

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
  const [showToolPopup, setShowToolPopup] = useState<boolean>(false);
  const [lastPopupTriggerIndex, setLastPopupTriggerIndex] = useState<
    number | null
  >(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource[]>(
    [],
  );
  const [showDataSourceModal, setShowDataSourceModal] =
    useState<boolean>(false);

  const editableRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsidePopup =
        popupRef.current && popupRef.current.contains(target);

      const dropdowns = document.querySelectorAll('.ant-select-dropdown');
      const clickedInsideDropdown = Array.from(dropdowns).some((dropdown) =>
        dropdown.contains(target),
      );

      if (!clickedInsidePopup && !clickedInsideDropdown) {
        setShowToolPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onInput = () => {
    const el = editableRef.current;
    if (!el) return;

    const preCaretOffset = getCaretCharacterOffsetWithin(el);

    const text = el.innerText;
    const isNowEmpty = text.trim() === '';
    setIsEmpty(isNowEmpty);

    if (isNowEmpty) {
      el.innerHTML = '';
    } else {
      setSuggestedActions(getSuggestedActions(text));
      const highlightedHTML = getTextWithHighlights(text, styles);
      el.innerHTML = highlightedHTML;
      controlToolPopup(text);
    }

    setCaretPosition(el, preCaretOffset);
  };

  const controlToolPopup = (text: string) => {
    // Reset popup trigger if the command was removed
    if (
      lastPopupTriggerIndex !== null &&
      (text.length < lastPopupTriggerIndex ||
        text[lastPopupTriggerIndex] !== COMMANDS.TOOL)
    ) {
      setLastPopupTriggerIndex(null);
    }

    // Check if user typed tool command and trigger popup
    const atIndex = text.lastIndexOf(COMMANDS.TOOL);
    if (atIndex === -1 || atIndex === lastPopupTriggerIndex) return;

    setShowToolPopup(true);
    setLastPopupTriggerIndex(atIndex);

    setTimeout(() => popupInputRef.current?.focus(), 0);
  };

  const onPopupKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !event.currentTarget.value) {
      event.preventDefault(); // Prevent deleting command
      setShowToolPopup(false);

      const el = editableRef.current;
      if (el) {
        el.focus();
        const text = el.innerText;
        const atIndex = text.lastIndexOf(COMMANDS.TOOL);
        if (atIndex !== -1) {
          setCaretPosition(el, atIndex + 1);
        }
      }
    }
  };

  const onSelectTool = (value: string) => {
    // Add value to selectedTools, avoiding duplicates
    if (selectedTools.includes(value)) return;
    setSelectedTools([...selectedTools, value]);
    setShowToolPopup(false);

    // Remove command from the editable content
    const el = editableRef.current;
    if (!el) return;
    const text = el.innerText;
    const atIndex = text.lastIndexOf(COMMANDS.TOOL);
    if (atIndex !== -1) {
      el.innerText = text.slice(0, atIndex) + text.slice(atIndex + 1);
    }
    // Refocus the editable element
    el.focus();
    // Set caret position after the inserted tool
    const newText = el.innerText + ' ';
    el.innerText = newText;
    setCaretPosition(el, newText.length);
  };

  const onRemoveTool = (tool: string) => {
    setSelectedTools(selectedTools.filter((t) => t !== tool));
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

  const onClickSend = async () => {
    const el = editableRef.current;
    if (!el || isEmpty) return;

    const userInput = el.innerText.trim();
    if (!userInput) return;

    // Process files before dispatching to avoid non-serializable values in Redux
    const processedFiles =
      uploadedFiles.length > 0 ? await processFiles(uploadedFiles) : undefined;

    // Process datasources to send only id and name
    const processedDataSources =
      selectedDataSources.length > 0
        ? selectedDataSources.map((ds) => ({ id: ds.id, name: ds.name }))
        : undefined;

    dispatch(
      sendStreamingRequest({
        userInput,
        files: processedFiles,
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
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onClickSend();
    }
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
      {showToolPopup && (
        <ToolPopup
          popupRef={popupRef}
          inputRef={popupInputRef}
          onPopupKeyDown={onPopupKeyDown}
          onSelectTool={onSelectTool}
        />
      )}
      <div
        className={`${styles.inputWrapper} ${animate ? styles.animate : ''}`}
      >
        {selectedTools.length > 0 && (
          <div className={styles.selectedTools}>
            {selectedTools.map((tool) => (
              <div key={tool} className={styles.tool}>
                <p>{tool}</p>
                <button onClick={() => onRemoveTool(tool)}>
                  <CloseOutlined className={styles.closeIcon} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div>
          <div
            className={`${styles.editable} ${isEmpty ? styles.empty : ''} ${requestLoading ? styles.disabled : ''}`}
            contentEditable={!requestLoading}
            ref={editableRef}
            onInput={onInput}
            onKeyDown={onKeyDown}
            data-placeholder={
              placeholder ??
              'Start something new: a workflow, an app, an agent—your call.'
            }
          />
        </div>
        <div className={styles.actions}>
          <div className={styles.buttons}>
            <AddContextButton
              onFileUpload={handleFileUpload}
              onDataSourceClick={handleDataSourceClick}
            />
            {uploadedFiles.map((file) => (
              <div key={file.name} className={styles.uploadedFile}>
                <File {...sharedIconProps} size={14} />
                <span className={styles.fileName}>{file.name}</span>
                <button onClick={() => onRemoveFile(file.name)}>
                  <CloseOutlined className={styles.closeIcon} />
                </button>
              </div>
            ))}
            {selectedDataSources.map((dataSource) => (
              <div key={dataSource.id} className={styles.uploadedFile}>
                <Database {...sharedIconProps} size={14} />
                <span className={styles.fileName}>{dataSource.name}</span>
                <button onClick={() => onRemoveDataSource(dataSource.id)}>
                  <CloseOutlined className={styles.closeIcon} />
                </button>
              </div>
            ))}
            <AnimatePresence>
              {suggestedActions.map((action) => (
                <motion.div
                  key={action.type}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button type="text" icon={actionIconMap[action.type]}>
                    {action.text}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <Button
            type="text"
            icon={
              requestLoading ? (
                <LoadingOutlined
                  style={{ fontSize: 16, color: 'white' }}
                  spin
                />
              ) : (
                <ArrowUp color={isEmpty ? '#2c2b2a' : 'white'} size={16} />
              )
            }
            style={{
              backgroundColor:
                isEmpty && !requestLoading ? 'transparent' : '#2c2b2a',
              transition: 'background-color 0.3s ease',
            }}
            onClick={onClickSend}
            disabled={requestLoading}
          />
        </div>
      </div>
    </div>
  );
};
