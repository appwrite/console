<script lang="ts">
    import { updateLayout } from '$lib/stores/layout';
    import { user } from '$lib/stores/user';
    import { afterNavigate } from '$app/navigation';
    import { onMount } from 'svelte';

    const path = 'console/account';

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        updateLayout({
            navigate: event,
            title: $user?.name,
            level: 0,
            customBase: '',
            breadcrumbs: {
                title: `${$user.name}`,
                href: path
            },
            tabs: [
                {
                    href: path,
                    title: 'Overview'
                },
                {
                    href: `${path}/sessions`,
                    title: 'Sessions'
                },
                {
                    href: `${path}/activity`,
                    title: 'Activity'
                },
                {
                    href: `${path}/organizations`,
                    title: 'Organizations'
                }
            ]
        });
    }
</script>

<svelte:head>
    <title>Appwrite - User</title>
</svelte:head>

<slot />
