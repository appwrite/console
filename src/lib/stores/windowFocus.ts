import { readable, type Readable } from 'svelte/store';

function isCurrentWindowFocused(): boolean {
    if (!window) return false;
    if (!window.document) return false;
    if (typeof window.document.hasFocus !== 'function') return false;

    return window.document.hasFocus();
}

export function windowFocusStore(): Readable<boolean> {
    const visibility = readable(isCurrentWindowFocused(), (set) => {
        function handler() {
            set(isCurrentWindowFocused());
        }

        if (window) {
            window.addEventListener('focus', handler);
            window.addEventListener('blur', handler);

            return () => {
                window.removeEventListener('focus', handler);
                window.removeEventListener('blur', handler);
            };
        }
    });

    return visibility;
}
