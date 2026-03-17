import { html } from '../lib/ui.js';
import {
    canRecord,
    isBusy,
    isProcessing,
    isRecording,
    missingApis,
    transcriber,
} from '../state.js';

export function Controls({ editor, onClear, onLoad, onSpeak, onStartRecording, onStopRecording }) {
    const loadDisabled = isBusy.value || missingApis.value.length > 0;
    const recordDisabled = !canRecord.value || !editor;
    const secondaryDisabled = isBusy.value || !editor;
    const loadLabel = transcriber.value ? 'Reload Models' : '1. Load Models';
    const recordLabel = isProcessing.value ? 'Processing...' : isRecording.value ? 'Listening...' : '2. Hold to Speak';

    return html`
        <div class="controls">
            <button id="loadBtn" type="button" disabled=${loadDisabled} onClick=${onLoad}>${loadLabel}</button>
            <button
                id="recordBtn"
                type="button"
                disabled=${recordDisabled}
                class=${isRecording.value ? 'recording' : ''}
                onPointerDown=${(event) => {
                    event.preventDefault();
                    onStartRecording();
                }}
                onPointerUp=${onStopRecording}
                onPointerLeave=${onStopRecording}
                onPointerCancel=${onStopRecording}
            >
                ${recordLabel}
            </button>
            <button id="clearBtn" type="button" disabled=${secondaryDisabled} onClick=${onClear}>Clear Transcript</button>
            <button id="speakBtn" type="button" disabled=${secondaryDisabled} onClick=${onSpeak}>Read Transcript</button>
        </div>
    `;
}
