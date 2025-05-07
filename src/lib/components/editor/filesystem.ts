import { writable } from 'svelte/store';

export type FileSystem = string[];

export const filesystem = writable<FileSystem>([]);
