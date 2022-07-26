<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { func } from './store';

    const functionId = $page.params.function;
    const path = `functions/function/${functionId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        if ($func?.$id !== functionId) {
            await func.load(functionId);
        }

        updateLayout({
            navigate: event,
            title: $func.name,
            level: 4,
            breadcrumbs: {
                title: $func.name,
                href: '#'
            },
            tabs: [
                {
                    href: path,
                    title: 'Overview'
                },
                {
                    href: `${path}/monitors`,
                    title: 'Monitors'
                },
                {
                    href: `${path}/logs`,
                    title: 'Logs'
                },
                {
                    href: `${path}/settings`,
                    title: 'Settings'
                }
            ]
        });
    }
</script>

{#if $func}
    <slot />
{/if}
