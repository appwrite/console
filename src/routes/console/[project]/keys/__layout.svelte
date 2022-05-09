<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Back } from '$lib/components';
    import { Cover } from '$lib/layout';
    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="breadcrumbs">
        <Back href={`${base}/console/${projectId}`}>Home</Back>
    </svelte:fragment>
    <svelte:fragment slot="title">API Keys</svelte:fragment>
</Cover>
<slot />
