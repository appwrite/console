<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Back, Tabs, TabsItem } from '$lib/components';
    import { Cover } from '$lib/layout';

    const project = $page.params.project;
</script>

<svelte:head>
    <title>Appwrite - Database</title>
</svelte:head>

{#if !$page.url.pathname.startsWith(`${base}/console/${project}/database/collection`)}
    <Cover>
        <svelte:fragment slot="breadcrumbs">
            <Back href={`${base}/console/${project}`}>Home</Back>
        </svelte:fragment>
        <svelte:fragment slot="title">Database</svelte:fragment>
        <Tabs>
            <TabsItem href={`/console/${project}/database`}>Collections</TabsItem>
            <TabsItem href={`/console/${project}/database/usage`}>Usages</TabsItem>
        </Tabs>
    </Cover>
{/if}

<slot />
