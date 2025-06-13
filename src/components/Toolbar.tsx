import React, {useEffect, useState} from "react";
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';

type MarkNames = 'bold' | 'italic' | 'underline';
type ActiveMarks = Partial<Record<MarkNames, boolean>>;

const Toolbar:React.FC<{editorView: EditorView | null, schema: Schema}> = ({ editorView, schema }) => {
  const [activeMarks, setActiveMarks] = useState<ActiveMarks>({});

  useEffect(() => {
    if (!editorView) return;
    
    const updateActiveMarks = () => {
      const state = editorView.state;
      const marks: { [key: string]: boolean } = {};
      
      Object.keys(schema.marks).forEach(markName => {
        const mark = schema.marks[markName];
        marks[markName] = !!mark.isInSet(state.storedMarks || state.selection.$from.marks());
      });
      
      setActiveMarks(marks);
    };

    editorView.dom.addEventListener('input', updateActiveMarks);
    editorView.dom.addEventListener('selectionchange', updateActiveMarks);
    
    updateActiveMarks();
    
    return () => {
      editorView.dom.removeEventListener('input', updateActiveMarks);
      editorView.dom.removeEventListener('selectionchange', updateActiveMarks);
    };
  }, [editorView, schema]);

  const toggleFormat = (markName: string) => {
    if (!editorView) return;
    
    const mark = schema.marks[markName];
    const { state, dispatch } = editorView;
    
    toggleMark(mark)(state, dispatch);
  };

  return (
    <div className="toolbar">
      <button 
        className={`toolbar-button ${activeMarks.bold ? 'active' : ''}`}
        onClick={() => toggleFormat('bold')}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      
      <button 
        className={`toolbar-button ${activeMarks.italic ? 'active' : ''}`}
        onClick={() => toggleFormat('italic')}
        title="Italic"
      >
        <em>I</em>
      </button>
      
      <button 
        className={`toolbar-button ${activeMarks.underline ? 'active' : ''}`}
        onClick={() => toggleFormat('underline')}
        title="Underline"
      >
        <u>U</u>
      </button>
      
      <button 
        className="toolbar-button"
        onClick={() => editorView && undo(editorView.state, editorView.dispatch)}
        title="Undo"
      >
        ↩️
      </button>
      
      <button 
        className="toolbar-button"
        onClick={() => editorView && redo(editorView.state, editorView.dispatch)}
        title="Redo"
      >
        ↪️
      </button>
    </div>
  );
};

export default Toolbar;