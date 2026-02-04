import { env } from '$env/dynamic/public';

const SECRET = env.PUBLIC_CONSOLE_FINGERPRINT_KEY ?? '';

async function sha256(message: string): Promise<string> {
    const data = new TextEncoder().encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

async function hmacSha256(message: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
    return Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function getCanvasFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        canvas.width = 200;
        canvas.height = 50;

        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Appwrite Console', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Appwrite Console', 4, 17);

        return canvas.toDataURL();
    } catch {
        return '';
    }
}

function getWebGLFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const gl =
            canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
        if (!gl) return '';

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return 'webgl-no-debug';

        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';

        return `${vendor}~${renderer}`;
    } catch {
        return '';
    }
}

function getAudioFingerprint(): Promise<string> {
    return new Promise((resolve) => {
        try {
            const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
            if (!AudioContext) {
                resolve('');
                return;
            }

            const context = new AudioContext();
            const oscillator = context.createOscillator();
            const analyser = context.createAnalyser();
            const gain = context.createGain();
            const processor = context.createScriptProcessor(4096, 1, 1);

            gain.gain.value = 0;
            oscillator.type = 'triangle';
            oscillator.frequency.value = 10000;

            oscillator.connect(analyser);
            analyser.connect(processor);
            processor.connect(gain);
            gain.connect(context.destination);

            oscillator.start(0);

            const dataArray = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += Math.abs(dataArray[i]);
            }

            oscillator.stop();
            processor.disconnect();
            context.close();

            resolve(sum.toString());
        } catch {
            resolve('');
        }
    });
}

interface BrowserSignals {
    timestamp: number;
    userAgent: string;
    language: string;
    languages: string[];
    platform: string;
    hardwareConcurrency: number;
    deviceMemory: number | undefined;
    maxTouchPoints: number;
    screenWidth: number;
    screenHeight: number;
    screenColorDepth: number;
    screenPixelDepth: number;
    devicePixelRatio: number;
    timezoneOffset: number;
    timezone: string;
    canvas: string;
    webgl: string;
    audio: string;
}

async function collectBrowserSignals(): Promise<BrowserSignals> {
    const [canvasRaw, webgl, audio] = await Promise.all([
        Promise.resolve(getCanvasFingerprint()),
        Promise.resolve(getWebGLFingerprint()),
        getAudioFingerprint()
    ]);

    const canvas = canvasRaw ? await sha256(canvasRaw) : '';

    return {
        timestamp: Math.floor(Date.now() / 1000),
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: [...(navigator.languages || [])],
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenColorDepth: screen.colorDepth,
        screenPixelDepth: screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio || 1,
        timezoneOffset: new Date().getTimezoneOffset(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvas,
        webgl,
        audio
    };
}

export async function generateFingerprintToken(): Promise<string> {
    const signals = await collectBrowserSignals();
    const payload = JSON.stringify(signals);
    const encoded = btoa(payload);
    const signature = await hmacSha256(encoded, SECRET);

    return `${encoded}.${signature}`;
}
