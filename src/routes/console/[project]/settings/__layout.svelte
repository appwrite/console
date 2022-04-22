<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Back } from '$lib/components';
    import { Cover, PageTransition } from '$lib/layout';
    import Tabs from './_tabs.svelte';

    const project = $page.params.project;
</script>

<svelte:head>
    <title>Appwrite - Settings</title>
</svelte:head>

<Cover>
    <svelte:fragment slot="breadcrumbs">
        <Back href={`${base}/console/${project}`}>Home</Back>
    </svelte:fragment>
    <svelte:fragment slot="title">Settings</svelte:fragment>
    <Tabs />
</Cover>
<PageTransition>
    <slot />
</PageTransition>
