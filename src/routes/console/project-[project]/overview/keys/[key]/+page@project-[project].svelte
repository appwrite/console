<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { key } from './store';

    const projectId = $page.params.project;
    const keyId = $page.params.key;

    let loaded = false;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        if ($key?.$id !== keyId) {
            await key.load(projectId, keyId);
        }

        updateLayout({
            navigate: event,
            back: `${base}/console/project-${$page.params.project}/overview/keys`,
            title: $key.name,
            level: 4,
            breadcrumbs: [
                {
                    level: 3,
                    href: 'keys',
                    title: 'API Keys'
                },
                {
                    level: 4,
                    href: keyId,
                    title: $key.name
                }
            ]
        });
        loaded = true;
    }
</script>

<svelte:head>
    <title>Appwrite - API Key</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
