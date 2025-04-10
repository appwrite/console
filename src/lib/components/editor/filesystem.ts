import { writable } from 'svelte/store';

export type FileSystem = string[];

export const createFileSystem = (initial: FileSystem = []) => writable(initial);
