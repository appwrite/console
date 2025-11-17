const MONACO_STYLE_ATTRIBUTE = 'data-appwrite-studio-monaco-style';

let monacoStyleObserver: MutationObserver | null = null;

function findMonacoEditorCssLink(): HTMLLinkElement | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const link = document.head?.querySelector<HTMLLinkElement>(
        'link[rel="stylesheet"][href*="monaco-editor"][href*="editor.main.css"]'
    );

    return link ?? null;
}

function syncMonacoStyles(shadow: ShadowRoot) {
    if (typeof document === 'undefined') {
        return;
    }

    // Check if already synced
    if (shadow.querySelector(`[${MONACO_STYLE_ATTRIBUTE}]`)) {
        return;
    }

    const link = findMonacoEditorCssLink();
    if (!link) {
        return;
    }

    const clone = link.cloneNode(true) as HTMLLinkElement;
    clone.setAttribute(MONACO_STYLE_ATTRIBUTE, 'true');
    shadow.appendChild(clone);
}

export function ensureMonacoStyles(shadow: ShadowRoot) {
    syncMonacoStyles(shadow);

    if (
        monacoStyleObserver ||
        typeof MutationObserver === 'undefined' ||
        typeof document === 'undefined'
    ) {
        return;
    }

    monacoStyleObserver = new MutationObserver(() => {
        syncMonacoStyles(shadow);
    });

    monacoStyleObserver.observe(document.head, { childList: true });
}
