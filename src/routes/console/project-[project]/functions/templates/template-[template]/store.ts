import { page } from '$app/stores';
import type { MarketplaceTemplate, Runtime } from '$lib/stores/marketplace';
import { derived } from 'svelte/store';

export const template = derived(page, ($page) => $page.data.template as MarketplaceTemplate);

export const baseRuntimes = derived(template, ($template) => {
    const baseRuntimes = new Map<string, Runtime>();
    $template.runtimes.forEach((runtime) => {
        const runtimeBase = runtime.name.split('-')[0];
        baseRuntimes.set(runtimeBase, runtime);
    });
    return {
        ...template,
        runtimes: [...baseRuntimes.values()]
    };
});
