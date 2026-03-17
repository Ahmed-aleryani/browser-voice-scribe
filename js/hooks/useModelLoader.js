import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
import {
    engine,
    formatterPreference,
    formatMode,
    isLoading,
    llmModelId,
    setProgress,
    setStatus,
    transcriber,
    whisperModel,
} from '../state.js';
import { markSuccessfulLoad } from '../storage.js';

env.allowLocalModels = false;
env.allowRemoteModels = true;

function createProgressThrottler() {
    let animationFrameId = 0;
    let nextPercent = null;
    let lastPercent = -1;

    const flush = () => {
        animationFrameId = 0;
        if (typeof nextPercent !== 'number' || nextPercent === lastPercent) {
            return;
        }

        lastPercent = nextPercent;
        setProgress(nextPercent);
    };

    return {
        update(percent) {
            if (typeof percent !== 'number') return;
            nextPercent = Math.max(0, Math.min(100, percent));
            if (animationFrameId) return;
            animationFrameId = window.requestAnimationFrame(flush);
        },
        finish(percent) {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
                animationFrameId = 0;
            }
            nextPercent = null;
            lastPercent = Math.max(0, Math.min(100, percent));
            setProgress(lastPercent);
        },
    };
}

async function tryLoadWebLLM(modelId, strictMode) {
    const progress = createProgressThrottler();
    const importCandidates = [
        'https://esm.run/@mlc-ai/web-llm@0.2.79',
        'https://esm.sh/@mlc-ai/web-llm@0.2.79?target=es2022',
    ];

    let lastError;

    for (const url of importCandidates) {
        try {
            const mod = await import(url);
            if (typeof mod?.CreateMLCEngine !== 'function') {
                throw new Error(`CreateMLCEngine missing from ${url}`);
            }

            engine.value = await mod.CreateMLCEngine(modelId, {
                initProgressCallback: (update) => {
                    const pct = typeof update?.progress === 'number'
                        ? Math.round(60 + update.progress * 40)
                        : 60;
                    progress.update(pct);
                },
            });

            formatMode.value = 'web-llm';
            progress.finish(100);
            return;
        } catch (error) {
            console.warn(`WebLLM load attempt failed from ${url}:`, error);
            lastError = error;
            engine.value = null;
        }
    }

    formatMode.value = 'rule-based';
    console.warn('Falling back to rule-based formatter:', lastError);

    if (strictMode) {
        throw new Error(`Force WebLLM mode failed. ${lastError?.message || String(lastError)}`);
    }
}

export function useModelLoader() {
    async function loadModels() {
        if (isLoading.value) return;
        isLoading.value = true;
        const whisperProgress = createProgressThrottler();
        let loadFailed = false;

        try {
            const selectedWhisperModel = whisperModel.value;
            const selectedFormatterPreference = formatterPreference.value;
            const selectedLlmModel = llmModelId.value || 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

            setStatus('Loading Whisper model...', 5);

            transcriber.value = await pipeline('automatic-speech-recognition', selectedWhisperModel, {
                progress_callback: (progress) => {
                    if (typeof progress?.progress !== 'number') return;
                    const percent = Math.round(progress.progress * 55);
                    whisperProgress.update(percent);
                },
            });

            whisperProgress.finish(55);

            if (selectedFormatterPreference === 'fallback') {
                formatMode.value = 'rule-based';
                engine.value = null;
                setStatus('Whisper loaded. Fallback formatter selected.', 100);
            } else {
                setStatus('Loading local formatter model (optional)...', 60);
                await tryLoadWebLLM(selectedLlmModel, selectedFormatterPreference === 'webllm');
            }

            markSuccessfulLoad();

            if (formatMode.value === 'web-llm') {
                setStatus(`All systems ready with WebLLM (${selectedLlmModel}). Hold button to dictate.`, 100);
            } else {
                setStatus('Whisper ready. Using built-in formatter fallback.', 100);
            }
        } catch (error) {
            loadFailed = true;
            console.error('Model loading failed:', error);
            transcriber.value = null;
            engine.value = null;
            formatMode.value = 'rule-based';
            setStatus(`Model load failed: ${error?.message || String(error)}`, 0);
        } finally {
            if (loadFailed) {
                whisperProgress.finish(0);
            }
            isLoading.value = false;
        }
    }

    return { loadModels };
}
