import { computed, signal } from 'https://esm.sh/@preact/signals@2';
import { loadModelPrefs } from './storage.js';

const savedModelPrefs = loadModelPrefs();

export const transcriber = signal(null);
export const engine = signal(null);
export const formatMode = signal('rule-based');
export const isLoading = signal(false);
export const isProcessing = signal(false);
export const isRecording = signal(false);
export const statusText = signal('Click "Load Models" to begin (first run can be 150MB+)');
export const progressValue = signal(0);
export const deviceInfoText = signal('');
export const whisperModel = signal(savedModelPrefs.whisper || 'Xenova/whisper-base.en');
export const formatterPreference = signal(savedModelPrefs.mode || 'auto');
export const llmModelId = signal(savedModelPrefs.llm || 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC');
export const editorInstance = signal(null);
export const editorStateVersion = signal(0);
export const editorStatsText = signal('0 chars');
export const copyFeedback = signal('');
export const missingApis = signal([]);

export const isBusy = computed(() => isLoading.value || isProcessing.value);
export const canRecord = computed(() => {
    return Boolean(transcriber.value) && !isBusy.value && missingApis.value.length === 0;
});

export function setStatus(text, percent) {
    statusText.value = text;
    if (typeof percent === 'number') {
        progressValue.value = Math.max(0, Math.min(100, percent));
    }
}

export function setProgress(percent) {
    if (typeof percent !== 'number') return;
    progressValue.value = Math.max(0, Math.min(100, percent));
}

export function applyDeviceProfile(profile) {
    const mem = profile.memoryGB ? `${profile.memoryGB}GB RAM` : 'RAM unknown';
    const cores = profile.cores ? `${profile.cores} cores` : 'cores unknown';
    const kind = profile.mobile ? 'Mobile' : 'Desktop/Laptop';
    const recommendation =
        profile.tier === 'low'
            ? 'Recommended: whisper-tiny + SmolLM2/Qwen0.5B in Auto mode.'
            : profile.tier === 'mid'
              ? 'Recommended: whisper-base + Qwen2.5 0.5B/1.5B in Auto mode.'
              : 'Recommended: whisper-base/small + Qwen1.5B or TinyLlama in Auto/Force WebLLM.';

    deviceInfoText.value = `${kind} device, ${mem}, ${cores}. ${recommendation}`;

    if (!savedModelPrefs.whisper) {
        whisperModel.value = profile.tier === 'low' ? 'Xenova/whisper-tiny.en' : 'Xenova/whisper-base.en';
    }

    if (!savedModelPrefs.mode) {
        formatterPreference.value = profile.tier === 'low' ? 'fallback' : 'auto';
    }

    if (!savedModelPrefs.llm) {
        llmModelId.value = profile.tier === 'low'
            ? 'SmolLM2-360M-Instruct-q4f32_1-MLC'
            : 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
    }
}
