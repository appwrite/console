<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Back } from '$lib/components';
    import { Tabs, TabsItem } from '$lib/layout';
    import { Cover } from '$lib/layout';

    const project = $page.params.project;
</script>

<svelte:head>
    <title>Appwrite - Functions</title>
</svelte:head>
{#if !$page.url.pathname.startsWith(`/console/${project}/functions/function`)}
    <Cover>
        <svelte:fragment slot="breadcrumbs">
            <Back href={`${base}/console/${project}`}>Home</Back>
        </svelte:fragment>
        <svelte:fragment slot="title">Functions</svelte:fragment>
        <Tabs>
            <TabsItem href={`/console/${project}/functions`}>Functions</TabsItem>
        </Tabs>
    </Cover>
{/if}
<slot />
