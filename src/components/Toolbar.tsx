import React, {useEffect, useState} from "react";
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
import { GapCursor } from 'prosemirror-gapcursor';

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

  const testGapCursor = () => {
    if (!editorView) return;
    
    const { state, dispatch } = editorView;
    const { doc } = state;

    const pos = doc.resolve(28).after();
    const $pos = doc.resolve(pos);
    
    console.log('Testing GapCursor at position:', pos);
    console.log('Node at position:', $pos.parent.type.name);
    
    const gapCursor = new GapCursor($pos);
    console.log('GapCursor created:', gapCursor);
    
    const tr = state.tr.setSelection(gapCursor);
    dispatch(tr);
    editorView.focus();
    
    console.log('GapCursor selection set!');
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

      <span style={{ width: '10px', display: 'inline-block' }} />
      
      <button 
        className="toolbar-button"
        onClick={testGapCursor}
        title="Test GapCursor"
        style={{ fontWeight: 'bold', fontSize: '14px', backgroundColor: '#e3f2fd' }}
      >
        🔵 Test
      </button>
      
      <span style={{ width: '10px', display: 'inline-block' }} />
      
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