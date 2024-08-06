import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const templatesList = derived(
    page,
    async ($page) => (await $page.data.templatesList) as Models.TemplateFunctionList
);

export const templatesListWithoutStarter = derived(templatesList, async ($templatesList) => {
    return {
        templates: (await $templatesList).templates.filter((template) => template.id !== 'starter')
    };
});

export const starterTemplate = derived(templatesList, async ($templatesList) => {
    return (await $templatesList).templates.find((template) => template.id === 'starter');
});
