<script lang="ts">
    import { page } from '$app/stores';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { openWebhooksWizard } from './webhooks/+page.svelte';

    $: $registerCommands([
        {
            label: 'Create webhook',
            icon: 'plus',
            keys: $page.url.pathname.includes('webhooks') ? ['c'] : ['c', 'w'],
            callback: () => {
                openWebhooksWizard();
            },
            group: 'webhooks'
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
