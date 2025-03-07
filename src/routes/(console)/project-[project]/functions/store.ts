import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const functionsList = derived(page, ($page) => $page.data.functions as Models.FunctionList);

export function getIconFromRuntime(runtime: string) {
    switch (true) {
        case runtime.includes('node'):
            return 'node';
        case runtime.includes('php'):
            return 'php';
        case runtime.includes('ruby'):
            return 'ruby';
        case runtime.includes('python'):
            return 'python';
        case runtime.includes('dart'):
            return 'dart';
        case runtime.includes('bun'):
            return 'bun';
        case runtime.includes('go'):
            return 'go';
        case runtime.includes('deno'):
            return 'deno';
        default:
            return undefined;
    }
}
