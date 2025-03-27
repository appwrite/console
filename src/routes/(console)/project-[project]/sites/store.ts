import { timeFromNow } from '$lib/helpers/date';
import { timer } from '$lib/helpers/timeConversion';
import type { Column } from '$lib/helpers/types';
import { Framework, type Models } from '@appwrite.io/console';

import { writable } from 'svelte/store';

export function getEnumFromModel(model: Models.Framework): Framework {
    return Framework[model.name];
}

export const columns = writable<Column[]>([
    { id: 'name', title: 'Name', type: 'string', width: { min: 100 } },
    // { id: 'domains', title: 'Domains', type: 'string' },
    { id: 'deployed', title: 'Deployed', type: 'datetime', width: { min: 120 } },
    { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 120 } }
]);

export function getFrameworkIcon(framework: string) {
    switch (true) {
        case framework.toLocaleLowerCase().includes('sveltekit'):
            return 'svelte';
        case framework.toLocaleLowerCase().includes('nuxt'):
            return 'nuxt';
        case framework.toLocaleLowerCase().includes('vue'):
            return 'vue';
        case framework.toLocaleLowerCase().includes('react'):
            return 'react';
        case framework.toLocaleLowerCase().includes('angular'):
            return 'angular';
        case framework.toLocaleLowerCase().includes('svelte'):
            return 'svelte';
        case framework.toLocaleLowerCase().includes('next'):
            return 'nextjs';
        case framework.toLocaleLowerCase().includes('astro'):
            return 'astro';
        case framework.toLocaleLowerCase().includes('remix'):
            return 'remix';
        case framework.toLocaleLowerCase().includes('flutter'):
            return 'flutter';
        case framework.toLocaleLowerCase().includes('analog'):
            return 'analog';
        case framework.toLocaleLowerCase().includes('vite'):
            return 'vite';
        case framework.toLocaleLowerCase().includes('lynx'):
            return 'lynx';
        case framework.toLocaleLowerCase().includes('other'):
            return 'empty';

        default:
            return 'empty';
    }
}

export function generateSiteDeploymentDesc(site: Models.Site) {
    if (site.latestDeploymentStatus === 'building') {
        return `Deployment building ${timer(site.latestDeploymentCreatedAt)}`;
    } else {
        return `Deployed ${timeFromNow(site.deploymentCreatedAt)}`;
    }
}
