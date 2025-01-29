import { writable } from 'svelte/store';

const isSmallViewport = writable(false);

function updateViewport() {
    if (typeof window !== 'undefined') {
        isSmallViewport.set(
            typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
        );
    }
}

// Initialize on import
updateViewport();
if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateViewport);
}

export { isSmallViewport };
