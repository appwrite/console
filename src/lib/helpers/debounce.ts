export function debounce(fn: () => void, ms: number) {
    let timeout: NodeJS.Timeout;
    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(fn, ms);
    };
}
