export const getUserName = (token: string | null | undefined) => {
    if (!token) {
        return {
            first_name: null,
            last_name: null,
        };
    }
    try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return {
            first_name: decodedToken.first_name || null,
            last_name: decodedToken.last_name || null,
        };
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

export const encodeWAV = (audioBuffer: any) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitsPerSample = 16;
    const format = 1; // PCM
    const samples = audioBuffer.getChannelData(0);
    const blockAlign = numChannels * bitsPerSample / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * 2;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeString(view: any, offset: any, string: any) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    function floatTo16BitPCM(output: any, offset: any, input: any) {
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    floatTo16BitPCM(view, 44, samples);

    return view;
}


export const convertWebmToWav = async (webmBlob: any) => {
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBuffer = encodeWAV(audioBuffer);
    return new Blob([wavBuffer], { type: "audio/wav" });
};

export const base64ToWavAudio = (base64Data: any) => {
    const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: 'audio/wav' });
    return blob;
}