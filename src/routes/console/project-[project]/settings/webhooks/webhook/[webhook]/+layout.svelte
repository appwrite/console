<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';
    import { webhook } from './store';

    const webhookId = $page.params.webhook;
    const projectId = $page.params.project;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        const promise = webhook.load(projectId, webhookId);

        if ($webhook?.$id !== webhookId) {
            await promise;
        }

        updateLayout({
            breadcrumb: Breadcrumbs,
            header: Header
        });
    }
</script>

<svelte:head>
    <title>Webhook - Appwrite</title>
</svelte:head>

{#if $webhook}
    <slot />
{/if}
