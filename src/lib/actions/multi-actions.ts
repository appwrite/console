import type { Action } from 'svelte/action';

export type MultiActionArray = Array<
    (node: HTMLElement) => ReturnType<Action<HTMLElement, unknown>>
>;

export function multiAction(node: HTMLElement, arr: MultiActionArray) {
    const destroyFns = arr.map((fn) => {
        const actionReturn = fn(node);

        return actionReturn
            ? actionReturn.destroy
            : () => {
                  /* noop */
              };
    });
    return {
        destroy() {
            destroyFns.forEach((fn) => fn());
        }
    };
}
