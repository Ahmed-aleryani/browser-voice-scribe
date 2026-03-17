export function getMonoChannelData(audioBuffer) {
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const mono = new Float32Array(length);

    for (let channel = 0; channel < channels; channel += 1) {
        const data = audioBuffer.getChannelData(channel);
        for (let i = 0; i < length; i += 1) {
            mono[i] += data[i] / channels;
        }
    }

    let peak = 0;
    for (let i = 0; i < length; i += 1) {
        const amp = Math.abs(mono[i]);
        if (amp > peak) peak = amp;
    }

    if (peak > 0 && peak < 0.95) {
        const gain = 0.95 / peak;
        for (let i = 0; i < length; i += 1) {
            mono[i] *= gain;
        }
    }

    return mono;
}

export async function decodeBlob(blob) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioCtx();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return getMonoChannelData(audioBuffer);
}

export function supportsRequiredApis() {
    const missing = [];
    if (!window.MediaRecorder) missing.push('MediaRecorder');
    if (!navigator.mediaDevices?.getUserMedia) missing.push('getUserMedia');
    if (!window.AudioContext && !window.webkitAudioContext) missing.push('AudioContext');
    return missing;
}

export function getDeviceProfile() {
    const memoryGB = Number(navigator.deviceMemory || 0);
    const cores = Number(navigator.hardwareConcurrency || 0);
    const mobile = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);

    let tier = 'high';
    if (mobile || memoryGB <= 4 || cores <= 4) tier = 'low';
    else if (memoryGB <= 8 || cores <= 8) tier = 'mid';

    return { tier, mobile, memoryGB, cores };
}