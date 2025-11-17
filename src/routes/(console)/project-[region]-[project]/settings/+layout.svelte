<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { canWriteProjects } from '$lib/stores/roles';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { resolvedProfile } from '$lib/profiles/index.svelte';

    $: $registerCommands([
        {
            label: 'Create webhook',
            icon: IconPlus,
            keys: page.url.pathname.includes('webhooks') ? ['c'] : ['c', 'w'],
            callback: () => {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/settings/webhooks/create`
                );
            },
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
    <title>Settings - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
