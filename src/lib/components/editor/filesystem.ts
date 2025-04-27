import { writable } from 'svelte/store';

export type FileSystem = Record<string, string>;

export const filesystem = writable<FileSystem>({});
