<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { tabs, title } from '$lib/stores/layout';
    import { user } from './store';

    const userId = $page.params.user;
    const path = `users/user/${userId}`;

    $: {
        if (browser) {
            user.load(userId);
        }
    }

    $: {
        if ($user) {
            title.set($user.name);
        }
    }

    tabs.set([
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
        }
    ]);
</script>

<svelte:head>
    <title>Appwrite - User</title>
</svelte:head>

{#if $user}
    <slot />
{/if}
