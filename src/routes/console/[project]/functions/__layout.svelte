<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Back } from '$lib/components';
    import { Cover } from '$lib/layout';
    import Tabs from './_tabs.svelte';

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
        <Tabs />
    </Cover>
{/if}
<slot />
