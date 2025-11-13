import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_AI_SERVICE_BASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/public';
import { app } from '$lib/stores/app';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import DEV_CSS_URL from '@imagine.dev/web-components/imagine-web-components.css?url';

const COMPONENT_SELECTOR = 'imagine-web-components-wrapper[data-appwrite-studio]';
const STYLE_ATTRIBUTE = 'data-appwrite-studio-style';
const BLOCK_START_BASE_OFFSET = 48;
const INLINE_START_BASE_OFFSET = 8;
export const CDN_URL = env?.PUBLIC_IMAGINE_CDN_URL + '/web-components.js';
export const CDN_CSS_URL = env?.PUBLIC_IMAGINE_CDN_URL + '/web-components.css';
const DEV_OVERRIDE_WEB_COMPONENTS = env?.PUBLIC_AI_OVERRIDE_WEB_COMPONENTS === 'true';

let component: HTMLElement | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let webComponentsModule: Record<string, any> | null = null;
let configInitialized = false;
let routingInitialized = false;
let lastRouteKey: string | null = null;
let scrollLocked = false;
let previousBodyOverflow: string | null = null;
let previousDocumentOverflow: string | null = null;

function hasDocument(): boolean {
    return typeof document !== 'undefined';
}

function disableBodyScroll() {
    if (!hasDocument() || scrollLocked) {
        return;
    }

    const { body, documentElement } = document;
    previousBodyOverflow = body.style.overflow || '';
    previousDocumentOverflow = documentElement.style.overflow || '';
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    scrollLocked = true;
}

function restoreBodyScroll() {
    if (!hasDocument() || !scrollLocked) {
        return;
    }

    const { body, documentElement } = document;
    body.style.overflow = previousBodyOverflow ?? '';
    documentElement.style.overflow = previousDocumentOverflow ?? '';
    previousBodyOverflow = null;
    previousDocumentOverflow = null;
    scrollLocked = false;
}

function ensureBaseStyles(node: HTMLElement) {
    node.style.background = 'var(--bgcolor-neutral-primary)';
    node.style.position = 'fixed';
    node.style.height = `calc(100vh - ${BLOCK_START_BASE_OFFSET}px)`;
    node.style.maxHeight = `calc(100vh - ${BLOCK_START_BASE_OFFSET}px)`;
    if (!node.style.display) {
        node.style.display = 'none';
    }
    if (!node.style.pointerEvents) {
        node.style.pointerEvents = 'none';
    }
}

function injectStyles(node: HTMLElement, attempt = 0) {
    if (typeof customElements === 'undefined') {
        return;
    }

    customElements
        .whenDefined('imagine-web-components-wrapper')
        .then(async () => {
            const shadow = node.shadowRoot;
            if (!shadow) {
                if (attempt < 5 && typeof requestAnimationFrame !== 'undefined') {
                    requestAnimationFrame(() => injectStyles(node, attempt + 1));
                }
                return;
            }

            if (shadow.querySelector<HTMLLinkElement>(`link[${STYLE_ATTRIBUTE}]`)) {
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = DEV_OVERRIDE_WEB_COMPONENTS ? DEV_CSS_URL : CDN_CSS_URL;
            link.setAttribute(STYLE_ATTRIBUTE, 'true');
            shadow.prepend(link);
        })
        .catch(() => {
            /* no-op */
        });
}

/**
 * Get the web components module, loading it from CDN if necessary
 */
export async function getWebComponents() {
    if (!webComponentsModule) {
        if (DEV_OVERRIDE_WEB_COMPONENTS) {
            webComponentsModule = await import('@imagine.dev/web-components/web-components');
        } else {
            webComponentsModule = await import(/* @vite-ignore */ CDN_URL);
        }
    }
    return webComponentsModule;
}

/**
 * Navigate to a route in the web components
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function navigateToRoute(...args: any[]) {
    try {
        const { navigateToRoute: navigate } = await getWebComponents();
        return navigate(...args);
    } catch (error) {
        console.error('Failed to navigate:', error);
    }
}

export function ensureStudioComponent(): HTMLElement | null {
    if (!hasDocument()) {
        return component;
    }

    if (component?.isConnected) {
        ensureBaseStyles(component);
        injectStyles(component);
        return component;
    }

    const existing = document.querySelector<HTMLElement>(COMPONENT_SELECTOR);
    if (existing) {
        component = existing;
        ensureBaseStyles(existing);
        injectStyles(existing);
        return existing;
    }

    if (component) {
        component.dataset.appwriteStudio = 'true';
        ensureBaseStyles(component);
        document.body.appendChild(component);
        injectStyles(component);
        return component;
    }

    const created = document.createElement('imagine-web-components-wrapper');
    created.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    created.dataset.appwriteStudio = 'true';
    ensureBaseStyles(created);
    document.body.appendChild(created);
    component = created;
    injectStyles(created);

    return created;
}

export function getComponent(): HTMLElement | null {
    return component;
}

export interface AttachOptions {
    offsetX?: number;
    offsetY?: number;
}

let anchorElement: HTMLElement | null = null;
let currentOptions: Required<AttachOptions> = {
    offsetX: 0,
    offsetY: 0
};

let scrollHandler: (() => void) | null = null;
const resizeObserver = new ResizeObserver(updatePosition);

function updatePosition() {
    if (!component || !anchorElement) {
        return;
    }

    const rect = anchorElement.getBoundingClientRect();
    const { offsetX, offsetY } = currentOptions;
    const left = rect.left + offsetX;
    const top = BLOCK_START_BASE_OFFSET + offsetY;

    component.style.width = `${rect.width}px`;
    component.style.height = `calc(100vh - ${BLOCK_START_BASE_OFFSET}px)`;
    component.style.paddingInlineStart = `${INLINE_START_BASE_OFFSET}px`;
    component.style.left = `${left}px`;
    component.style.top = `${top}px`;
}

function teardownAnchorWatchers() {
    if (anchorElement) resizeObserver.unobserve(anchorElement);
    resizeObserver.disconnect();

    if (scrollHandler && hasDocument()) {
        window.removeEventListener('scroll', scrollHandler, true);
        window.removeEventListener('resize', scrollHandler);
    }
    scrollHandler = null;
}

function setupAnchorWatchers() {
    teardownAnchorWatchers();

    if (!anchorElement || !hasDocument()) {
        return;
    }

    resizeObserver.observe(anchorElement);

    scrollHandler = () => {
        if (anchorElement && !anchorElement.isConnected) {
            hideStudio();
            return;
        }
        updatePosition();
    };

    window.addEventListener('scroll', scrollHandler, true);
    window.addEventListener('resize', scrollHandler);
}

export function attachStudioTo(target: HTMLElement, options: AttachOptions = {}) {
    const node = ensureStudioComponent();
    if (!node) {
        return;
    }

    anchorElement = target;
    currentOptions = {
        offsetX: options.offsetX ?? 0,
        offsetY: options.offsetY ?? BLOCK_START_BASE_OFFSET
    };

    Object.assign(node.style, {
        display: 'block',
        pointerEvents: 'auto'
    });

    disableBodyScroll();
    updatePosition();
    setupAnchorWatchers();
}

export function hideStudio() {
    if (!component) {
        return;
    }

    teardownAnchorWatchers();
    anchorElement = null;

    component.style.display = 'none';
    component.style.pointerEvents = 'none';
    component.style.width = '';
    restoreBodyScroll();
}

export async function initImagine(
    region: string,
    projectId: string,
    callbacks?: { onProjectNameChange?: (name: string) => void }
) {
    try {
        const { initImagineConfig, initImagineRouting } = await getWebComponents();

        if (!configInitialized) {
            initImagineConfig(
                {
                    AI_SERVICE_ENDPOINT: PUBLIC_AI_SERVICE_BASE_URL,
                    APPWRITE_ENDPOINT: PUBLIC_APPWRITE_ENDPOINT,
                    APPWRITE_SITES_BASE_URL: ''
                },
                {
                    initialTheme: get(app).themeInUse,
                    callbacks
                }
            );
            configInitialized = true;
        }

        const routeKey = region && projectId ? `project:${region}:${projectId}` : 'home';
        if (routingInitialized && routeKey === lastRouteKey) {
            return;
        }

        initImagineRouting({
            initialRoute:
                region && projectId
                    ? {
                          id: 'project',
                          props: { region, projectId }
                      }
                    : {
                          id: 'home',
                          props: {}
                      },
            onNavigate(route) {
                if (route.id === 'project') {
                    goto(
                        resolve('/(console)/project-[region]-[project]/(studio)/studio', {
                            region: route.props.region,
                            project: route.props.projectId
                        })
                    );
                }
            }
        });

        routingInitialized = true;
        lastRouteKey = routeKey;
    } catch (error) {
        console.error('Failed to load web components library:', error);
    }
}
