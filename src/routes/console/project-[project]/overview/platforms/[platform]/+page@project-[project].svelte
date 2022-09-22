<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { platform } from './store';

    const projectId = $page.params.project;
    const platformId = $page.params.platform;

    let loaded = false;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        if ($platform?.$id !== platformId) {
            await platform.load(projectId, platformId);
        }

        updateLayout({
            navigate: event,
            back: `${base}/console/project-${$page.params.project}/overview/platforms`,
            title: $platform.name,
            level: 4,
            breadcrumbs: [
                {
                    level: 3,
                    href: 'platforms',
                    title: 'Platforms'
                },
                {
                    level: 4,
                    href: platformId,
                    title: $platform.name
                }
            ]
        });
        loaded = true;
    }
</script>

<svelte:head>
    <title>Appwrite - Platform</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
