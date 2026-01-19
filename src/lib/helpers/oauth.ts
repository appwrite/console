type BuildOAuthSuccessUrlParams = {
    pageUrl: URL;
    basePath: string;
    origin: string;
    isStudio: boolean;
};

export const STUDIO_PROMPT_KEY = 'studioPrompt';
const ABSOLUTE_URL = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

function isAbsoluteUrl(value: string): boolean {
    return ABSOLUTE_URL.test(value) || value.startsWith('//');
}

function stashStudioPrompt(prompt: string, isStudio: boolean): void {
    if (!isStudio || !prompt) {
        return;
    }

    try {
        sessionStorage.setItem(STUDIO_PROMPT_KEY, prompt);
    } catch {
        // ignore
    }
}

function formatUrl(url: URL, original: string): string {
    if (isAbsoluteUrl(original)) {
        return url.toString();
    }

    return `${url.pathname}${url.search}${url.hash}`;
}

function stripPromptFromTarget(target: string, isStudio: boolean): string {
    if (!isStudio) {
        return target;
    }

    try {
        const url = new URL(target, window.location.origin);
        const prompt = url.searchParams.get('prompt');

        if (prompt) {
            stashStudioPrompt(prompt, isStudio);
            url.searchParams.delete('prompt');
        }

        return formatUrl(url, target);
    } catch {
        return target;
    }
}

function appendQuery(target: string, params: URLSearchParams): string {
    const query = params.toString();
    if (!query) {
        return target;
    }

    const hashIndex = target.indexOf('#');
    const hash = hashIndex >= 0 ? target.slice(hashIndex) : '';
    const base = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
    const separator = base.includes('?') ? '&' : '?';

    return `${base}${separator}${query}${hash}`;
}

export function buildOAuthSuccessUrl({
    pageUrl,
    basePath,
    origin,
    isStudio
}: BuildOAuthSuccessUrlParams): string {
    const params = new URLSearchParams(pageUrl.search);
    const redirect = params.get('redirect');

    if (redirect) {
        params.delete('redirect');
    }

    if (isStudio) {
        const prompt = params.get('prompt');
        if (prompt) {
            stashStudioPrompt(prompt, isStudio);
            params.delete('prompt');
        }
    }

    let target = redirect ? stripPromptFromTarget(redirect, isStudio) : basePath;
    target = appendQuery(target, params);

    if (isAbsoluteUrl(target)) {
        return target;
    }

    return origin + target;
}
