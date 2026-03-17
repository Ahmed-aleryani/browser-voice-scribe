import { html } from '../lib/ui.js';
import { formatterPreference, isBusy, llmModelId, whisperModel } from '../state.js';

const whisperOptions = [
    ['Xenova/whisper-tiny.en', 'whisper-tiny.en (~39M params, fastest)'],
    ['Xenova/whisper-base.en', 'whisper-base.en (~74M params, balanced)'],
    ['Xenova/whisper-small.en', 'whisper-small.en (~244M params, higher quality)'],
];

const formatterOptions = [
    ['auto', 'Auto (try WebLLM then fallback)'],
    ['webllm', 'Force WebLLM'],
    ['fallback', 'Fallback only (no LLM)'],
];

const llmOptions = [
    ['SmolLM2-360M-Instruct-q4f32_1-MLC', 'SmolLM2 360M q4f32 (very light, broad compatibility)'],
    ['SmolLM2-360M-Instruct-q4f16_1-MLC', 'SmolLM2 360M q4f16 (lighter VRAM, needs shader-f16)'],
    ['Qwen2.5-0.5B-Instruct-q4f32_1-MLC', 'Qwen2.5 0.5B q4f32 (balanced lightweight)'],
    ['Qwen2.5-0.5B-Instruct-q4f16_1-MLC', 'Qwen2.5 0.5B q4f16 (faster, needs shader-f16)'],
    ['Qwen3-0.6B-q4f32_1-MLC', 'Qwen3 0.6B q4f32 (newer small model)'],
    ['Qwen3-0.6B-q4f16_1-MLC', 'Qwen3 0.6B q4f16 (faster, needs shader-f16)'],
    ['TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC', 'TinyLlama 1.1B q4f32 (stronger, heavier)'],
    ['TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC', 'TinyLlama 1.1B q4f16 (stronger, needs shader-f16)'],
    ['Qwen2.5-1.5B-Instruct-q4f32_1-MLC', 'Qwen2.5 1.5B q4f32 (best quality among light set)'],
    ['Qwen2.5-1.5B-Instruct-q4f16_1-MLC', 'Qwen2.5 1.5B q4f16 (best quality + faster)'],
];

function renderOptions(options) {
    return options.map(([value, label]) => html`<option value=${value}>${label}</option>`);
}

export function ModelSelector() {
    const disabled = isBusy.value;

    return html`
        <div class="model-grid">
            <div class="field">
                <label for="whisperModelSelect">Whisper Model</label>
                <select
                    id="whisperModelSelect"
                    value=${whisperModel.value}
                    disabled=${disabled}
                    onChange=${(event) => {
                        whisperModel.value = event.currentTarget.value;
                    }}
                >
                    ${renderOptions(whisperOptions)}
                </select>
            </div>
            <div class="field">
                <label for="formatterModeSelect">Formatter Mode</label>
                <select
                    id="formatterModeSelect"
                    value=${formatterPreference.value}
                    disabled=${disabled}
                    onChange=${(event) => {
                        formatterPreference.value = event.currentTarget.value;
                    }}
                >
                    ${renderOptions(formatterOptions)}
                </select>
            </div>
            <div class="field">
                <label for="llmModelSelect">Local Formatter Model (WebLLM)</label>
                <select
                    id="llmModelSelect"
                    value=${llmModelId.value}
                    disabled=${disabled}
                    onChange=${(event) => {
                        llmModelId.value = event.currentTarget.value;
                    }}
                >
                    ${renderOptions(llmOptions)}
                </select>
            </div>
        </div>
    `;
}
