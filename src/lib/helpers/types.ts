import type { Writable } from 'svelte/store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DeepKeys<T extends Record<string, any>> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T]: T[K] extends Record<string, any> ? `${K}.${DeepKeys<T[K]>}` : K;
}[keyof T];
export type WritableValue<T> = T extends Writable<infer U> ? U : never;

export function isHTMLElement(el: unknown): el is HTMLElement {
    return el instanceof HTMLElement;
}

export function isHTMLInputElement(el: unknown): el is HTMLInputElement {
    return el instanceof HTMLInputElement;
}
