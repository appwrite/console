<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { canWriteProjects } from '$lib/stores/roles';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    $: $registerCommands([
        {
            label: 'Create webhook',
            icon: IconPlus,
            keys: page.url.pathname.includes('webhooks') ? ['c'] : ['c', 'w'],
            callback: () => goto(getProjectRoute('/settings/webhooks/create')),
            group: 'webhooks',
            disabled: !$canWriteProjects
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
