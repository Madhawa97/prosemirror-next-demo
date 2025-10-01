'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node, Schema } from 'prosemirror-model';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { history, undo, redo } from 'prosemirror-history';
import Toolbar from './Toolbar';
import { gapCursor } from 'prosemirror-gapcursor';

const createSchema = () => {
  return new Schema({
    nodes: {
      doc: { content: 'block+' },
      paragraph: {
        group: 'block',
        content: 'text*',
        toDOM: () => ['p', 0],
        parseDOM: [{ tag: 'p' }]
      },
      text: { 
        group: 'inline',
        inline: true 
      }
    },
    marks: {
      bold: {
        toDOM: () => ['strong', 0],
        parseDOM: [
          { tag: 'strong' },
          { tag: 'b' },
          { style: 'font-weight', getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }
        ]
      },
      italic: {
        toDOM: () => ['em', 0],
        parseDOM: [
          { tag: 'em' },
          { tag: 'i' },
          { style: 'font-style=italic' }
        ]
      },
      underline: {
        toDOM: () => ['u', 0],
        parseDOM: [
          { tag: 'u' },
          { style: 'text-decoration=underline' }
        ]
      }
    }
  });
};

interface ProseMirrorEditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

const ProseMirrorEditor = ({ content = '', onChange }: ProseMirrorEditorProps) => {
  const editorRef = useRef(null);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const schema = createSchema();

  useEffect(() => {
    if (!editorRef.current) return;

    const initialContent = content.trim() ? [schema.text(content)] : [];
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, initialContent)
    ]);

    const state = EditorState.create({
      doc,
      plugins: [
        history(),
        keymap({
          ...baseKeymap,
          'Mod-b': toggleMark(schema.marks.bold),
          'Mod-i': toggleMark(schema.marks.italic),
          'Mod-u': toggleMark(schema.marks.underline),
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo
        }),
        gapCursor(),
      ]
    });

    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction: transaction => {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        
        if (onChange && transaction.docChanged) {
          const content = getDocumentContent(newState.doc);
          onChange(content);
        }
      },
      attributes: { 
        'data-placeholder': 'Start typing...' 
      }
    });

    setEditorView(view);

    return () => {
      view.destroy();
      setEditorView(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDocumentContent = (doc : Node) => {
    let content = '';
    doc.descendants((node: Node) => {
      if (node.isText) {
        content += node.text;
      } else if (node.isBlock && node.type.name !== 'doc') {
        content += '\n';
      }
    });
    return content.trim();
  };

  return (
    <div className="editor-container">
      <Toolbar editorView={editorView} schema={schema} />
      <div ref={editorRef} className="prosemirror-editor" />
    </div>
  );
};

export default ProseMirrorEditor;