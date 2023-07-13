<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { registerCommands } from '$lib/commandCenter';
    import { project } from '../store';
    import { openCreateDomainWizard } from './domains/+page.svelte';

    $: $registerCommands([
        {
            label: 'Create custom domain',
            icon: 'plus',
            keys: $page.url.pathname.includes('domains') ? ['c'] : ['c', 'd'],
            callback: () => {
                openCreateDomainWizard();
            },
            group: 'domains'
        },
        {
            label: 'Go to Custom domains',

            keys: ['g', 'd'],
            callback: () => {
                goto(`/console/project-${$project.$id}/settings/domains`);
            },
            disabled: $page.url.pathname.includes('domains'),
            group: 'navigation',
            rank: 20
        },
        {
            label: 'Go to Webhooks',
            keys: ['g', 'w'],
            callback: () => {
                goto(`/console/project-${$project.$id}/settings/webhooks`);
            },
            disabled: $page.url.pathname.includes('webhooks'),
            group: 'navigation',

            rank: 10
        },
        {
            label: 'Create webhook',
            icon: 'plus',
            keys: $page.url.pathname.includes('webhooks') ? ['c'] : ['c', 'w'],
            callback: () => {
                goto('./settings/webhooks?create');
            },
            group: 'webhooks'
        }
    ]);
</script>

<svelte:head>
    <title>Settings - Appwrite</title>
</svelte:head>

<slot />
