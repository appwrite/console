export function debounce<F extends (...params: unknown[]) => void>(fn: F, delay: number) {
    let timeoutID: ReturnType<typeof setTimeout> = null;
    const debounceFn = function (this: unknown, ...args: unknown[]) {
        clearTimeout(timeoutID);
        timeoutID = window.setTimeout(() => fn.apply(this, args), delay) as unknown as ReturnType<
            typeof setTimeout
        >;
    } as F & { immediate: F; cancel: () => void };

    debounceFn.immediate = ((...args: Parameters<F>) => {
        clearTimeout(timeoutID);
        return fn(args);
    }) as F;

    debounceFn.cancel = () => {
        clearTimeout(timeoutID);
    };

    return debounceFn;
}
