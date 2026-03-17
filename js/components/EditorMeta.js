import { html } from '../lib/ui.js';
import { copyFeedback, editorStatsText } from '../state.js';

export function EditorMeta({ onCopy, onSelectAll }) {
    return html`
        <div class="editor-meta-row">
            <div class="editor-meta">
                <span id="editorStats">${editorStatsText.value}</span>
                <span id="copyState">${copyFeedback.value}</span>
            </div>
            <div class="editor-actions">
                <button id="selectAllBtn" type="button" onClick=${onSelectAll}>Select All</button>
                <button id="copyBtn" type="button" onClick=${onCopy}>Copy</button>
            </div>
        </div>
    `;
}
