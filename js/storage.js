export const STORAGE_KEYS = {
    transcript: 'smart-dictation-transcript-v1',
    history: 'smart-dictation-history-v1',
    hadSuccessfulLoad: 'smart-dictation-model-load-v1',
    whisperModel: 'smart-dictation-whisper-model-v1',
    formatterMode: 'smart-dictation-formatter-mode-v1',
    llmModelId: 'smart-dictation-llm-model-id-v1',
};

export function persistTranscript(text) {
    localStorage.setItem(STORAGE_KEYS.transcript, text);
}

export function loadTranscript() {
    return localStorage.getItem(STORAGE_KEYS.transcript) || '';
}

export function clearTranscript() {
    localStorage.removeItem(STORAGE_KEYS.transcript);
    localStorage.removeItem(STORAGE_KEYS.history);
}

export function persistHistory(chunk) {
    const now = new Date().toISOString();
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
    history.push({ text: chunk, at: now });
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(-200)));
}

export function persistModelPrefs(whisper, mode, llm) {
    localStorage.setItem(STORAGE_KEYS.whisperModel, whisper);
    localStorage.setItem(STORAGE_KEYS.formatterMode, mode);
    localStorage.setItem(STORAGE_KEYS.llmModelId, llm);
}

export function loadModelPrefs() {
    return {
        whisper: localStorage.getItem(STORAGE_KEYS.whisperModel),
        mode: localStorage.getItem(STORAGE_KEYS.formatterMode),
        llm: localStorage.getItem(STORAGE_KEYS.llmModelId),
    };
}

export function markSuccessfulLoad() {
    localStorage.setItem(STORAGE_KEYS.hadSuccessfulLoad, '1');
}

export function hadPreviousLoad() {
    return localStorage.getItem(STORAGE_KEYS.hadSuccessfulLoad) === '1';
}