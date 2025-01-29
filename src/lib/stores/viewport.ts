import { writable } from 'svelte/store';

export const isSmallViewport = writable(false);

export function updateViewport() {
    if (typeof window !== 'undefined') {
        isSmallViewport.set(
            typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
        );
    }
}
