export function throttle(callback: () => void, delay: number): () => void {
    let lastCall = 0;
    return function () {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            callback();
        }
    };
}
