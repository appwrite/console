<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { project } from '../store';
    import { openCreateDomainWizard } from './domains/+page.svelte';
    import { openWebhooksWizard } from './webhooks/+page.svelte';

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
            label: 'Create webhook',
            icon: 'plus',
            keys: $page.url.pathname.includes('webhooks') ? ['c'] : ['c', 'w'],
            callback: () => {
                openWebhooksWizard();
            },
            group: 'webhooks'
        },
        {
            label: 'Go to Settings Overview',

            keys: ['g', 'o'],
            callback: () => {
                goto(`/console/project-${$project.$id}/settings`);
            },
            disabled: $page.url.pathname.endsWith('settings'),
            group: 'navigation',
            rank: 40
        },
        {
            label: 'Go to Custom domains',

            keys: ['g', 'd'],
            callback: () => {
                goto(`/console/project-${$project.$id}/settings/domains`);
            },
            disabled: $page.url.pathname.includes('domains'),
            group: 'navigation',
            rank: 30
        },
        {
            label: 'Go to Webhooks',
            keys: ['g', 'w'],
            callback: () => {
                goto(`/console/project-${$project.$id}/settings/webhooks`);
            },
            disabled: $page.url.pathname.includes('webhooks'),
            group: 'navigation',

            rank: 20
        },
        {
            label: 'Go to Migrations',
            keys: ['g', 'm'],
            callback: () => {
                goto(`/console/project-${$project.$id}/settings/migrations`);
            },
            disabled: $page.url.pathname.includes('migrations'),
            group: 'navigation',

            rank: 10
        }
    ]);

    $updateCommandGroupRanks({
        domains: 20,
        webhooks: 10
    });
</script>

<svelte:head>
    <title>Settings - Appwrite</title>
</svelte:head>

<slot />
