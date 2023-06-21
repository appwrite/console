export function debounce<F extends (...params: any[]) => void>(fn: F, delay: number) {
    let timeoutID: ReturnType<typeof setTimeout> = null;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutID);
        timeoutID = window.setTimeout(() => fn.apply(this, args), delay);
    } as F;
}
