<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { webhook } from './store';

    const webhookId = $page.params.webhook;
    const projectId = $page.params.project;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        const promise = webhook.load(projectId, webhookId);

        if ($webhook?.$id !== webhookId) {
            await promise;
        }

        updateLayout({
            navigate: event,
            title: $webhook.name,
            level: 4,
            breadcrumbs: {
                title: $webhook.name,
                href: `settings/webhook/${webhookId}`
            },
            back: `${base}/console/project-${projectId}/settings`,
            copy: {
                text: 'Webhook ID',
                value: webhookId
            }
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Webhook</title>
</svelte:head>

{#if $webhook}
    <slot />
{/if}
