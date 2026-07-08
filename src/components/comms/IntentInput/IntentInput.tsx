import { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './IntentInput.module.css';
import { useAppDispatch } from 'reducers';
import { selectPage } from 'reducers/app/slice';
import { executeStream } from 'reducers/chat/actions';
import { selectLoading, selectSessionId } from 'reducers/chat/slice';
import { AppPage } from 'models/enums/appPage';
import { InputCommand } from 'models/enums/inputCommand';
import { DataSource } from 'models/interfaces/dataSource';
import { isUser, MentionItem } from 'models/interfaces/mention';
import { Toolkit } from 'models/interfaces/toolkit';
import { CommandPopup } from './CommandPopup/CommandPopup';
import { ContextItems } from './ContextItems/ContextItems';
import { IntentInputControls } from './Controls/Controls';
import { ModelSelect } from './Controls/ModelSelect';
import { SendButton } from './Controls/SendBtn';
import { EditableInput } from './EditableInput';
import { processFiles } from 'utils/file';
import { useCommandPopup } from 'hooks/useCommandPopup';

const DEFAULT_PLACEHOLDERS = [
  'Start something new',
  'Type / for toolkits',
  'Type @ to mention a person or group',
];

interface IntentInputProps {
  placeholder?: string;
  animate?: boolean;
}

export const IntentInput: FC<IntentInputProps> = ({ placeholder, animate }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const appPage = useSelector(selectPage);
  const sessionId = useSelector(selectSessionId);
  const requestLoading = useSelector(selectLoading);

  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [mentionedItems, setMentionedItems] = useState<MentionItem[]>([]);

  const [selectedToolkits, setSelectedToolkits] = useState<Toolkit[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource[]>(
    [],
  );
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const editableRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const pendingNavigate = useRef(false);
  const [textContent, setTextContent] = useState('');

  // TODO: Add per-tool selection via /command popup when individual tool APIs are available
  const mentionPopup = useCommandPopup<MentionItem>(editableRef, {
    trigger: InputCommand.MENTION,
    removeOnSelect: false,
    popupRef,
    replaceWith: (item) => {
      if (isUser(item)) {
        const name = item.displayName;
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

  // Navigate to session page after sending a message from the home page
  useEffect(() => {
    if (sessionId && pendingNavigate.current) {
      pendingNavigate.current = false;
      navigate(`/sessions/${sessionId}`);
    }
  }, [sessionId, navigate]);

  // Rotate placeholders if not provided with a custom one
  useEffect(() => {
    if (placeholder) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % DEFAULT_PLACEHOLDERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [placeholder]);

  const handleTextChange = (text: string, isNowEmpty: boolean) => {
    setIsEmpty(isNowEmpty);
    setTextContent(text.trim());

    if (isNowEmpty) {
      mentionPopup.resetPopup();
    } else {
      mentionPopup.controlPopup(text);
    }
  };

  const onRemoveToolkit = (toolkitId: string) => {
    setSelectedToolkits(
      selectedToolkits.filter((t) => t.toolkitId !== toolkitId),
    );
  };

  const onRemoveDataSource = (dataSourceId: string) => {
    setSelectedDataSources(
      selectedDataSources.filter((ds) => ds.id !== dataSourceId),
    );
  };

  const onRemoveFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.name !== fileName));
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

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (mentionPopup.handleKeyDown(event)) return;

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onClickSend();
    }
  };

  const onClickSend = async () => {
    const el = editableRef.current;
    if (!el || isEmpty || !textContent) return;

    // Process toolkits to send only toolkitId
    const processedToolkits =
      selectedToolkits.length > 0
        ? selectedToolkits.map((t) => t.toolkitId)
        : undefined;

    // Process datasources to send only id and name
    const processedDataSources =
      selectedDataSources.length > 0
        ? selectedDataSources.map((ds) => ds.id)
        : undefined;

    // Process files before dispatching to avoid non-serializable values in Redux
    const processedFiles =
      uploadedFiles.length > 0 ? await processFiles(uploadedFiles) : undefined;

    dispatch(
      executeStream({
        userInput: textContent,
        toolkitIds: processedToolkits,
        dataSources: processedDataSources,
        files: processedFiles,
      }),
    );

    if (appPage === AppPage.HOME) {
      pendingNavigate.current = true;
      return;
    }

    // Clear the input
    el.innerText = '';
    setIsEmpty(true);
    setTextContent('');
    setSelectedToolkits([]);
    setUploadedFiles([]);
    setSelectedDataSources([]);
  };

  return (
    <div className={styles.intentInput}>
      {mentionPopup.showPopup && (
        <CommandPopup popupRef={popupRef} popup={mentionPopup} />
      )}
      <div
        className={`${styles.inputWrapper} ${animate ? styles.animate : ''} card`}
      >
        <ContextItems
          uploadedFiles={uploadedFiles}
          selectedDataSources={selectedDataSources}
          selectedToolkits={selectedToolkits}
          onRemoveFile={onRemoveFile}
          onRemoveDataSource={onRemoveDataSource}
          onRemoveToolkit={onRemoveToolkit}
        />
        <EditableInput
          ref={editableRef}
          isEmpty={isEmpty}
          disabled={requestLoading}
          placeholder={placeholder ?? DEFAULT_PLACEHOLDERS[placeholderIndex]}
          onTextChange={handleTextChange}
          onKeyDown={onKeyDown}
        />
        <div className={styles.actions}>
          <div className={styles.buttons}>
            <IntentInputControls
              textContent={textContent}
              selectedToolkits={selectedToolkits}
              onToolkitsChange={setSelectedToolkits}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              selectedDataSources={selectedDataSources}
              setSelectedDataSources={setSelectedDataSources}
              handleTranscript={handleTranscript}
            />
          </div>
          <div className={styles.buttons}>
            <ModelSelect
              selectedModelId={selectedModelId}
              setSelectedModelId={setSelectedModelId}
            />
            <SendButton isEmpty={isEmpty} onClickSend={onClickSend} />
          </div>
        </div>
      </div>
    </div>
  );
};
