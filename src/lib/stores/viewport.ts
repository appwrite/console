import { writable } from 'svelte/store';

const isSmallViewport = writable(false);

function updateViewport() {
    isSmallViewport.set(window.matchMedia('(max-width: 768px)').matches);
}

// Initialize on import
updateViewport();
window.addEventListener('resize', updateViewport);

export { isSmallViewport };
