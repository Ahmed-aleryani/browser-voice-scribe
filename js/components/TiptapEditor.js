import { Editor } from 'https://esm.sh/@tiptap/core@2.11.5';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit@2.11.5';
import Placeholder from 'https://esm.sh/@tiptap/extension-placeholder@2.11.5';
import TextAlign from 'https://esm.sh/@tiptap/extension-text-align@2.11.5';
import Underline from 'https://esm.sh/@tiptap/extension-underline@2.11.5';
import { html, useEffect, useRef } from '../lib/ui.js';
import { loadTranscript, persistTranscript } from '../storage.js';
import { editorInstance, editorStatsText, editorStateVersion } from '../state.js';
import { setStatus } from '../state.js';
import { TextDirection } from '../extensions/TextDirection.js';

function updateEditorStats(editor) {
    const text = editor.getText() || '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    editorStatsText.value = `${chars} chars • ${words} words`;
}

export function TiptapEditor({ onEditorReady, onEditorStateChange }) {
    const containerRef = useRef(null);

    useEffect(() => {
        try {
            const editor = new Editor({
                element: containerRef.current,
                extensions: [
                    StarterKit,
                    Underline,
                    Placeholder.configure({
                        placeholder: 'Your transcribed and formatted text will appear here...',
                    }),
                    TextAlign.configure({
                        types: ['heading', 'paragraph', 'blockquote'],
                        alignments: ['left', 'center', 'right', 'justify'],
                        defaultAlignment: 'left',
                    }),
                    TextDirection,
                ],
                content: loadTranscript() || '',
                onCreate: ({ editor: currentEditor }) => {
                    updateEditorStats(currentEditor);
                    editorStateVersion.value += 1;
                    onEditorStateChange?.();
                },
                onUpdate: ({ editor: currentEditor }) => {
                    persistTranscript(currentEditor.getHTML());
                    updateEditorStats(currentEditor);
                    editorStateVersion.value += 1;
                    onEditorStateChange?.();
                },
            });

            const syncSelection = () => {
                editorStateVersion.value += 1;
                onEditorStateChange?.();
            };

            editor.on('selectionUpdate', syncSelection);
            editorInstance.value = editor;
            onEditorReady?.(editor);
            updateEditorStats(editor);
            editorStateVersion.value += 1;
            onEditorStateChange?.();

            return () => {
                editor.off('selectionUpdate', syncSelection);
                if (editorInstance.value === editor) {
                    editorInstance.value = null;
                }
                onEditorReady?.(null);
                editor.destroy();
            };
        } catch (error) {
            console.error('Editor initialisation failed:', error);
            setStatus(`Editor failed to load: ${error?.message || String(error)}`, 0);
            onEditorReady?.(null);
            return undefined;
        }
    }, []);

    return html`<div id="outputEditor" ref=${containerRef}></div>`;
}
