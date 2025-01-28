import type { Column } from '$lib/helpers/types';
import { Framework, type Models } from '@appwrite.io/console';
import {
    IconAngular,
    IconNuxt,
    IconReact,
    IconSvelte,
    IconVue
} from '@appwrite.io/pink-icons-svelte';
import { writable } from 'svelte/store';

export function getEnumFromModel(model: Models.Framework): Framework {
    return Framework[model.name];
}

export const columns = writable<Column[]>([
    { id: 'name', title: 'Name', type: 'string', show: true, width: 100 },
    // { id: 'domains', title: 'Domains', type: 'string', show: true, width: 120 },
    { id: '$updatedAt', title: 'Updated', type: 'datetime', show: true, width: 120 },
    { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 120 }
]);

export function getFrameworkIcon(framework: string) {
    console.log(framework);
    switch (true) {
        case framework.toLocaleLowerCase().includes('sveltekit'):
            return IconSvelte;
        case framework.toLocaleLowerCase().includes('nuxt'):
            return IconNuxt;
        case framework.toLocaleLowerCase().includes('vue'):
            return IconVue;
        case framework.toLocaleLowerCase().includes('react'):
            return IconReact;
        case framework.toLocaleLowerCase().includes('angular'):
            return IconAngular;
        case framework.toLocaleLowerCase().includes('svelte'):
            return IconSvelte;
        case framework.toLocaleLowerCase().includes('next'):
            return IconReact; //TODO: add next icon

        default:
            return undefined;
    }
}
