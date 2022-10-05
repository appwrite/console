<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { user } from './store';

    const userId = $page.params.user;
    const path = `authentication/user/${userId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        const promise = user.load(userId);

        if ($user?.$id !== userId) {
            await promise;
        }

        updateLayout({
            navigate: event,
            title: $user.name,
            level: 4,
            breadcrumbs: {
                title: $user.name,
                href: `user/${userId}`
            },
            back: `${base}/console/project-${$page.params.project}/authentication`,
            copy: {
                text: 'User ID',
                value: userId
            },
            tabs: [
                {
                    href: path,
                    title: 'Overview'
                },
                {
                    href: `${path}/memberships`,
                    title: 'Memberships'
                },
                {
                    href: `${path}/sessions`,
                    title: 'Sessions'
                },
                {
                    href: `${path}/activity`,
                    title: 'Activity'
                }
            ]
        });
    }
</script>

<svelte:head>
    <title>Appwrite - User</title>
</svelte:head>

{#if $user}
    <slot />
{/if}
