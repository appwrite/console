<script>
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const path = 'storage';

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        updateLayout({
            navigate: event,
            title: 'Storage',
            tabs: [
                {
                    href: path,
                    title: 'Buckets'
                },
                {
                    href: `${path}/usage`,
                    title: 'Usage'
                }
            ]
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Storage</title>
</svelte:head>

<slot />
