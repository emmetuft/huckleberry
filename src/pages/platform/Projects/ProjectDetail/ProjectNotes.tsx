import { FC } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {
  ListBulletsIcon,
  ListNumbersIcon,
  TextBolderIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from '@phosphor-icons/react';
import styles from './ProjectDetail.module.css';

const ToolbarButton: FC<{
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, active, children }) => (
  <button
    className={`${styles.toolbarBtn} ${active ? styles.toolbarBtnActive : ''}`}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
  >
    {children}
  </button>
);

export const ProjectNotes: FC = () => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: '<p>Add notes about this project...</p>',
  });

  const active = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor.isActive('bold'),
      italic: ctx.editor.isActive('italic'),
      underline: ctx.editor.isActive('underline'),
      h1: ctx.editor.isActive('heading', { level: 1 }),
      h2: ctx.editor.isActive('heading', { level: 2 }),
      bulletList: ctx.editor.isActive('bulletList'),
      orderedList: ctx.editor.isActive('orderedList'),
    }),
  });

  const iconSize = 18;

  if (!editor) return null;

  return (
    <div className={styles.notesSection}>
      <div className={styles.toolbar}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={active?.bold}
        >
          <TextBolderIcon size={iconSize} weight="bold" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={active?.italic}
        >
          <TextItalicIcon size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={active?.underline}
        >
          <TextUnderlineIcon size={iconSize} />
        </ToolbarButton>
        <div className={styles.toolbarDivider} />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={active?.h1}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={active?.h2}
        >
          H2
        </ToolbarButton>
        <div className={styles.toolbarDivider} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={active?.bulletList}
        >
          <ListBulletsIcon size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={active?.orderedList}
        >
          <ListNumbersIcon size={iconSize} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
};
