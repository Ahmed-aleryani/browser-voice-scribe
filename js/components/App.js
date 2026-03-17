import { html, useEffect, useRef, useState } from '../lib/ui.js';
import { getDeviceProfile, supportsRequiredApis } from '../audio.js';
import { clearTranscript, hadPreviousLoad, persistHistory } from '../storage.js';
import {
    applyDeviceProfile,
    copyFeedback,
    editorStatsText,
    missingApis,
    progressValue,
    setStatus,
} from '../state.js';
import { Controls } from './Controls.js';
import { EditorMeta } from './EditorMeta.js';
import { ModelSelector } from './ModelSelector.js';
import { StatusCard } from './StatusCard.js';
import { TiptapEditor } from './TiptapEditor.js';
import { Toolbar } from './Toolbar.js';
import { useModelLoader } from '../hooks/useModelLoader.js';
import { useRecording } from '../hooks/useRecording.js';
import { useStorageSync } from '../hooks/useStorageSync.js';

export function App() {
    const feedbackTimeoutRef = useRef(null);
    const editorRef = useRef(null);
    const [editorVersion, setEditorVersion] = useState(0);
    const { loadModels } = useModelLoader();

    useStorageSync();

    function handleEditorReady(editor) {
        editorRef.current = editor;
        setEditorVersion((value) => value + 1);
    }

    function handleEditorStateChange() {
        setEditorVersion((value) => value + 1);
    }

    function flashCopyFeedback(text, duration) {
        copyFeedback.value = text;
        window.clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = window.setTimeout(() => {
            copyFeedback.value = '';
        }, duration);
    }

    function appendTranscript(text) {
        const editor = editorRef.current;
        const trimmedText = (text || '').trim();
        if (!editor || !trimmedText) return;

        editor.commands.insertContent({
            type: 'paragraph',
            content: [{ type: 'text', text: trimmedText }],
        });
        persistHistory(trimmedText);
    }

    const { startRecording, stopRecording } = useRecording({ appendTranscript });

    function handleClear() {
        const editor = editorRef.current;
        if (!editor) return;
        editor.commands.clearContent();
        clearTranscript();
        editorStatsText.value = '0 chars';
        setStatus('Transcript and history cleared.', progressValue.value || 100);
    }

    function handleSpeak() {
        const editor = editorRef.current;
        const text = editor?.getText() || '';
        if (!text.trim()) {
            setStatus('Nothing to read yet.', progressValue.value || 100);
            return;
        }

        if (!('speechSynthesis' in window)) {
            setStatus('Speech synthesis is not supported in this browser.', progressValue.value || 100);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onstart = () => setStatus('Reading transcript aloud...', progressValue.value || 100);
        utterance.onend = () => setStatus('Ready.', progressValue.value || 100);
        utterance.onerror = (event) => setStatus(`TTS error: ${event.error}`, progressValue.value || 100);
        window.speechSynthesis.speak(utterance);
    }

    function handleSelectAll() {
        const editor = editorRef.current;
        if (!editor) return;
        editor.commands.selectAll();
        editor.commands.focus();
        flashCopyFeedback('Selected', 1000);
    }

    async function handleCopy() {
        const editor = editorRef.current;
        const text = editor?.getText() || '';
        if (!text.trim()) {
            setStatus('Nothing to copy yet.', progressValue.value || 100);
            return;
        }

        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error('Clipboard API unavailable');
            }
            await navigator.clipboard.writeText(text);
            flashCopyFeedback('Copied', 1200);
        } catch {
            const editorElement = editor?.view?.dom;
            if (!editorElement) {
                flashCopyFeedback('Copy failed', 1200);
                return;
            }

            const range = document.createRange();
            range.selectNodeContents(editorElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            const didCopy = document.execCommand('copy');
            flashCopyFeedback(didCopy ? 'Copied' : 'Copy failed', 1200);
        }
    }

    useEffect(() => {
        const unsupportedApis = supportsRequiredApis();
        missingApis.value = unsupportedApis;
        applyDeviceProfile(getDeviceProfile());

        if (unsupportedApis.length > 0) {
            setStatus(`Browser missing required APIs: ${unsupportedApis.join(', ')}`);
            return;
        }

        if (hadPreviousLoad()) {
            setStatus('Cached models detected from previous successful run. Press "Load Models".');
        }
    }, []);

    useEffect(() => {
        return () => {
            window.clearTimeout(feedbackTimeoutRef.current);
        };
    }, []);

    return html`
        <div class="app-shell">
            <h1>Smart Voice Dictation</h1>
            <p class="hint">Runs in your browser. First load can take time, later loads are faster due to browser cache.</p>
            <${StatusCard} />
            <${ModelSelector} />
            <div class="editor-card" aria-label="Transcript editor">
                <div class="editor-toolbar">
                    <${Toolbar} editor=${editorRef.current} editorVersion=${editorVersion} />
                    <${EditorMeta} onCopy=${handleCopy} onSelectAll=${handleSelectAll} />
                </div>
                <${TiptapEditor}
                    onEditorReady=${handleEditorReady}
                    onEditorStateChange=${handleEditorStateChange}
                />
            </div>
            <${Controls}
                editor=${editorRef.current}
                onClear=${handleClear}
                onLoad=${loadModels}
                onSpeak=${handleSpeak}
                onStartRecording=${startRecording}
                onStopRecording=${stopRecording}
            />
        </div>
    `;
}
