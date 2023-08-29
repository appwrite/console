import type { Writable } from 'svelte/store';

export type WritableValue<T> = T extends Writable<infer U> ? U : never;

export function isHTMLElement(el: unknown): el is HTMLElement {
    return el instanceof HTMLElement;
}

export function isHTMLInputElement(el: unknown): el is HTMLInputElement {
    return el instanceof HTMLInputElement;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type Prettify<T> = T & {};
