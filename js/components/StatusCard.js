import { html } from '../lib/ui.js';
import { deviceInfoText, progressValue, statusText } from '../state.js';

export function StatusCard() {
    return html`
        <div class="status-card">
            <div id="status">${statusText.value}</div>
            <div id="progress" class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${progressValue.value}>
                <div class="progress-fill" style=${`width: ${progressValue.value}%`}></div>
            </div>
            <div id="deviceInfo">${deviceInfoText.value}</div>
        </div>
    `;
}
