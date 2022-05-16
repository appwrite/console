<script lang="ts">
    import { page } from '$app/stores';
    import { Cover } from '$lib/layout';
    import { Tabs, TabsItem } from '$lib/components';

    const project = $page.params.project;
</script>

<svelte:head>
    <title>Appwrite - Users</title>
</svelte:head>

{#if $page.url.pathname.endsWith(`/users`) || $page.url.pathname.endsWith(`/users/teams`) || $page.url.pathname.endsWith(`/users/usage`) || $page.url.pathname.endsWith(`/users/authentication`) || $page.url.pathname.endsWith(`/users/security`)}
    <Cover>
        <svelte:fragment slot="title">Users</svelte:fragment>
        <Tabs>
            <TabsItem href={`/console/${project}/users`}>Users</TabsItem>
            <TabsItem href={`/console/${project}/users/teams`}>Teams</TabsItem>
            <TabsItem href={`/console/${project}/users/authentication`}>Authentication</TabsItem>
            <TabsItem href={`/console/${project}/users/usage`}>Usage</TabsItem>
            <TabsItem href={`/console/${project}/users/security`}>Security</TabsItem>
        </Tabs>
    </Cover>
{/if}
<slot />
