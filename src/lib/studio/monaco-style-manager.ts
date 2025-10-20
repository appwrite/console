const MONACO_STYLE_ATTRIBUTE = 'data-appwrite-studio-monaco-style';

const MONACO_STYLE_SELECTORS = [
    'link[rel="stylesheet"][data-name^="vs/"]',
    'style[data-name^="vs/"]',
    'link[rel="stylesheet"][href*="monaco-editor"]'
] as const;

let monacoStyleObserver: MutationObserver | null = null;

function collectMonacoStyleNodes(): Element[] {
    if (typeof document === 'undefined') {
        return [];
    }

    const nodes: Element[] = [];
    for (const selector of MONACO_STYLE_SELECTORS) {
        document.head?.querySelectorAll(selector).forEach((node) => {
            nodes.push(node);
        });
    }
    return nodes;
}

function getMonacoStyleKey(node: Element): string | null {
    const tag = node.tagName.toLowerCase();
    const dataName = node.getAttribute('data-name');
    if (dataName) {
        return `${tag}:${dataName}`;
    }

    const id = node.getAttribute('id');
    if (id) {
        return `${tag}#${id}`;
    }

    if (node instanceof HTMLLinkElement && node.href) {
        return `${tag}:${node.href}`;
    }

    if (node instanceof HTMLStyleElement && node.textContent) {
        let hash = 0;
        for (let index = 0; index < node.textContent.length; index += 1) {
            hash = (hash << 5) - hash + node.textContent.charCodeAt(index);
            hash |= 0;
        }
        return `${tag}:text-${hash}`;
    }

    return null;
}

function syncMonacoStyles(shadow: ShadowRoot) {
    if (typeof document === 'undefined') {
        return;
    }

    const existingKeys = new Set(
        Array.from(
            shadow.querySelectorAll<HTMLElement>(`[${MONACO_STYLE_ATTRIBUTE}]`)
        ).map((existing) => existing.getAttribute(MONACO_STYLE_ATTRIBUTE) ?? '')
    );

    for (const node of collectMonacoStyleNodes()) {
        const key = getMonacoStyleKey(node);
        if (!key || existingKeys.has(key)) {
            continue;
        }

        const clone = node.cloneNode(true) as HTMLElement;
        clone.setAttribute(MONACO_STYLE_ATTRIBUTE, key);
        shadow.appendChild(clone);
        existingKeys.add(key);
    }
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

