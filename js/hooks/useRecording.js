import { useEffect, useRef } from '../lib/ui.js';
import { decodeBlob } from '../audio.js';
import { formatText } from '../formatter.js';
import {
    engine,
    formatMode,
    isLoading,
    isProcessing,
    isRecording,
    missingApis,
    setStatus,
    transcriber,
} from '../state.js';

export function useRecording({ appendTranscript }) {
    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioChunksRef = useRef([]);

    function cleanupMedia() {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
    }

    async function processAudio(blob) {
        if (isProcessing.value) return;
        isProcessing.value = true;

        try {
            setStatus('Decoding audio...', 100);
            const float32Array = await decodeBlob(blob);

            setStatus('Transcribing voice...', 100);
            const result = await transcriber.value(float32Array, {
                language: 'english',
                task: 'transcribe',
                chunk_length_s: 20,
                stride_length_s: 4,
            });
            const rawText = (result?.text || '').trim();

            if (!rawText) {
                setStatus('No speech detected. Try again.', 100);
                return;
            }

            setStatus(
                formatMode.value === 'web-llm' ? 'Formatting with local LLM...' : 'Formatting with built-in fallback...',
                100,
            );

            const formattedText = await formatText(rawText, formatMode.value, engine.value);
            appendTranscript(formattedText);
            setStatus('Ready. Hold to speak again.', 100);
        } catch (error) {
            console.error('Audio processing failed:', error);
            setStatus(`Processing failed: ${error?.message || String(error)}`, 100);
        } finally {
            isProcessing.value = false;
            cleanupMedia();
        }
    }

    async function startRecording() {
        if (!transcriber.value || isProcessing.value || isLoading.value || missingApis.value.length > 0) return;

        try {
            setStatus('Requesting microphone permission...', 100);

            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(mediaStream);

            mediaStreamRef.current = mediaStream;
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                await processAudio(audioBlob);
            };

            mediaRecorder.start();
            isRecording.value = true;
            setStatus('Listening. Release button to process.', 100);
        } catch (error) {
            console.error('Microphone start failed:', error);
            isRecording.value = false;
            setStatus(`Microphone error: ${error?.message || String(error)}`, 100);
            cleanupMedia();
        }
    }

    function stopRecording() {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === 'inactive') return;
        isRecording.value = false;
        recorder.stop();
        setStatus('Processing audio...', 100);
    }

    useEffect(() => cleanupMedia, []);

    return { startRecording, stopRecording };
}
