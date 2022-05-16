<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { Tabs, TabsItem } from '$lib/components';
    import { Cover } from '$lib/layout';
    import { user } from './store';

    const userId = $page.params.user;
    const project = $page.params.project;

    $: {
        if (browser) {
            user.load(userId);
        }
    }
</script>

<svelte:head>
    <title>Appwrite - User</title>
</svelte:head>

{#if $user}
    <Cover>
        <svelte:fragment slot="title">{$user.name}</svelte:fragment>
        <Tabs>
            <TabsItem href={`/console/${project}/users/user/${userId}`}>Overview</TabsItem>
            <TabsItem href={`/console/${project}/users/user/${userId}/sessions`}>Sessions</TabsItem>
            <TabsItem href={`/console/${project}/users/user/${userId}/activity`}>Activity</TabsItem>
        </Tabs>
    </Cover>
    <slot />
{/if}
