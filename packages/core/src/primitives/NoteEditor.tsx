import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { renderMarkdownLite } from '../internal/markdown-lite.js';

export interface NoteEditorProps {
  /** Called with the note text (or `null` when the field was left empty). */
  onSave: (note: string | null) => void;
  onCancel: () => void;
  /** Placeholder shown when the textarea is empty (default: "your thought…"). */
  placeholder?: string;
  /** Initial value. */
  initialValue?: string;
}

/**
 * Inline markdown-lite editor (Innovation 03). Only `*italic*` and
 * `**bold**` are parsed in the live preview. Enter saves, Escape cancels,
 * Shift+Enter inserts a newline.
 */
export function NoteEditor(props: NoteEditorProps) {
  const { onSave, onCancel, placeholder = 'your thought…', initialValue = '' } = props;
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    autosize(el);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) autosize(el);
  }, [value]);

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const trimmed = value.trim();
        onSave(trimmed.length > 0 ? trimmed : null);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [onCancel, onSave, value],
  );

  return (
    <div className="mg-note-editor">
      <textarea
        ref={textareaRef}
        className="mg-note-editor__input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={3}
        aria-label="Annotation note"
      />
      {value.trim().length > 0 ? (
        <div className="mg-note-editor__preview" aria-hidden>
          {renderMarkdownLite(value)}
        </div>
      ) : null}
      <div className="mg-note-editor__hint">
        <kbd>Enter</kbd> save · <kbd>Esc</kbd> cancel
      </div>
    </div>
  );
}

function autosize(el: HTMLTextAreaElement): void {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}
