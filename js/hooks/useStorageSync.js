import { effect } from 'https://esm.sh/@preact/signals@2';
import { useEffect } from '../lib/ui.js';
import { formatterPreference, llmModelId, whisperModel } from '../state.js';
import { persistModelPrefs } from '../storage.js';

export function useStorageSync() {
    useEffect(() => {
        return effect(() => {
            persistModelPrefs(whisperModel.value, formatterPreference.value, llmModelId.value);
        });
    }, []);
}
