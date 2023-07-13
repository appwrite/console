import type { Writable } from 'svelte/store';

export type DeepKeys<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends Record<string, any> ? `${K}.${DeepKeys<T[K]>}` : K;
}[keyof T];
export type WritableValue<T> = T extends Writable<infer U> ? U : never;
