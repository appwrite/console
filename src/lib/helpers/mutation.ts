// Easier wrapper over mutation observer, which takes an element, a callback, and returns an unsubscribe fn
export function observeElement(el: HTMLElement, callback: MutationCallback): () => void {
    const observer = new MutationObserver(callback);
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
}
