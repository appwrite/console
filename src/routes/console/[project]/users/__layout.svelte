<script lang="ts">
    import { page } from '$app/stores';
    import { Cover } from '$lib/layout';
    import Tabs from './_tabs.svelte';
</script>

<svelte:head>
    <title>Appwrite - Users</title>
</svelte:head>

{#if $page.url.pathname.endsWith(`/users`) || $page.url.pathname.endsWith(`/users/teams`) || $page.url.pathname.endsWith(`/users/usage`) || $page.url.pathname.endsWith(`/users/settings`)}
    <Cover>
        <svelte:fragment slot="title">Users</svelte:fragment>
        <Tabs />
    </Cover>
{/if}
<slot />
