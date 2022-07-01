<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { user } from './store';

    const userId = $page.params.user;
    const path = `users/user/${userId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        if ($user?.response?.$id !== userId) {
            await user.load(userId);
            title.set($user.response.name);
        } else if ($user.response) {
            title.set($user.response.name);
        }

        backButton.set(`${base}/console/${$page.params.project}/users`);

        copyData.set({
            text: 'User ID',
            value: userId
        });

        tabs.set([
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
        ]);
    }
</script>

<svelte:head>
    <title>Appwrite - User</title>
</svelte:head>

{#if $user}
    <slot />
{/if}
