import { page } from '$app/stores';
import type { MarketplaceTemplate } from '$lib/stores/marketplace';
import { derived } from 'svelte/store';

export const template = derived(page, ($page) => $page.data.template as MarketplaceTemplate);

export const baseRuntimes = derived(template, ($template) =>
    $template.runtimes
        .map((runtime) => {
            const runtimeBase = runtime.name.split('-')[0];
            return { ...runtime, name: runtimeBase };
        })
        .filter((runtime, index, self) => self.findIndex((n) => n.name === runtime.name) === index)
);
