import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const customBackground = EditorView.theme(
  {
    '&': {
      backgroundColor: 'transparent !important',
    },
    '.cm-scroller': {
      backgroundColor: 'transparent !important',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent !important',
    },
    '&.cm-focused': {
      outline: 'none', // removes the dotted focus outline
      boxShadow: 'none', // removes any shadow if present
    },
  },
  { dark: true },
);

interface CustomEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'html' | 'css' | 'js'; // constrain supported languages
  className?: string;
  onEditorReady?: (editor: any) => void;
}

export interface CustomEditorRef {
  getView: () => EditorView | null;
}

export const CustomEditor = forwardRef<CustomEditorRef, CustomEditorProps>(
  ({ value, onChange, language, className, onEditorReady }, ref) => {
    const editorRef = useRef<ReactCodeMirrorRef>(null);

    const getLanguageExtension = () => {
      switch (language) {
        case 'html':
          return html();
        case 'css':
          return css();
        case 'js':
          return javascript({ jsx: true, typescript: true });
        default:
          return javascript();
      }
    };

    useImperativeHandle(ref, () => ({
      getView: () => editorRef.current?.view || null,
    }));

    useEffect(() => {
      if (editorRef.current?.view && onEditorReady) {
        onEditorReady({
          view: editorRef.current.view,
          state: editorRef.current.state,
        });
      }
    }, [editorRef.current?.view, onEditorReady]);

    return (
      <div className={`h-full flex p-2 ${className}`}>
        <CodeMirror
          ref={editorRef}
          value={value}
          height="100%"
          extensions={[getLanguageExtension(), customBackground]}
          onChange={(val) => onChange(val)}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            autocompletion: true,
            foldGutter: true,
          }}
          className="flex-1 overflow-auto"
        />
      </div>
    );
  },
);
